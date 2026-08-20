/* Web Audio API 로 직접 만드는 소리 — 외부 음원 파일이 필요 없습니다.
   파도, 방의 공기, 부드러운 화음, 작은 효과음을 실시간으로 합성합니다. */

window.AudioSystem = (function () {

  let ctx = null;
  let master = null, bgmBus = null, sfxBus = null;
  let noiseBuf = null;
  let ambience = null;        // { nodes:[], gain }
  let padTimer = null;
  let started = false;
  let currentAmb = 'none';

  const PROGRESSION = [
    [196.00, 246.94, 293.66],   // G  B  D
    [174.61, 220.00, 261.63],   // F  A  C
    [130.81, 196.00, 246.94],   // C  G  B
    [164.81, 196.00, 246.94]    // E  G  B
  ];
  let padStep = 0;

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    bgmBus = ctx.createGain(); bgmBus.gain.value = SaveSystem.get('settings.bgm', true) ? 1 : 0; bgmBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = SaveSystem.get('settings.sfx', true) ? 1 : 0; sfxBus.connect(master);

    const len = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {           // 부드러운 브라운 노이즈
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.2;
    }
    return ctx;
  }

  function unlock() {
    ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    started = true;
  }

  function noiseSource() {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    return src;
  }

  function stopAmbience(fade) {
    if (!ambience) return;
    const a = ambience; ambience = null;
    const t = ctx.currentTime;
    a.gain.gain.cancelScheduledValues(t);
    a.gain.gain.setValueAtTime(a.gain.gain.value, t);
    a.gain.gain.linearRampToValueAtTime(0.0001, t + (fade || 1.2));
    setTimeout(function () {
      a.nodes.forEach(function (n) { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} });
    }, (fade || 1.2) * 1000 + 120);
  }

  /* 장소별 공기 소리 */
  function setAmbience(kind) {
    ensure();
    if (!ctx || currentAmb === kind) return;
    currentAmb = kind;
    stopAmbience(1.0);
    if (kind === 'none') return;

    const out = ctx.createGain();
    out.gain.value = 0.0001;
    out.connect(bgmBus);
    const nodes = [out];

    if (kind === 'room') {
      const src = noiseSource();
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = 0.4;
      src.connect(lp); lp.connect(out); src.start();
      nodes.push(src, lp);
      out.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2.0);
    } else if (kind === 'city') {
      const src = noiseSource();
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 80;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 430; lp.Q.value = 0.5;
      src.connect(hp); hp.connect(lp); lp.connect(out); src.start();
      nodes.push(src, hp, lp);
      out.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 2.0);
    } else if (kind === 'beach') {
      for (let i = 0; i < 2; i++) {
        const src = noiseSource();
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
        bp.frequency.value = 480 + i * 260; bp.Q.value = 0.7;
        const swell = ctx.createGain(); swell.gain.value = 0.5;
        const lfo = ctx.createOscillator(); lfo.type = 'sine';
        lfo.frequency.value = 0.085 + i * 0.031;               // 6~12초 주기의 파도
        const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.45;
        lfo.connect(lfoGain); lfoGain.connect(swell.gain);
        src.connect(bp); bp.connect(swell); swell.connect(out);
        src.start(); lfo.start();
        nodes.push(src, bp, swell, lfo, lfoGain);
      }
      out.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 2.5);
    }
    ambience = { nodes: nodes, gain: out };
  }

  function chord(freqs, dur) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.055, t + 2.2);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    g.connect(bgmBus);
    freqs.forEach(function (f, i) {
      const o = ctx.createOscillator();
      o.type = i === 0 ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = (i - 1) * 3;
      o.connect(g); o.start(t); o.stop(t + dur + 0.2);
    });
  }

  function startPad() {
    ensure();
    if (!ctx || padTimer) return;
    chord(PROGRESSION[padStep++ % PROGRESSION.length], 8);
    padTimer = setInterval(function () {
      chord(PROGRESSION[padStep++ % PROGRESSION.length], 8);
    }, 7600);
  }

  function stopPad() {
    if (padTimer) { clearInterval(padTimer); padTimer = null; }
  }

  function tone(freq, dur, type, vol, sweepTo) {
    ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (sweepTo) o.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noiseHit(dur, freq, q, vol) {
    ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol || 0.1, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start(t); src.stop(t + dur + 0.05);
  }

  return {
    unlock: unlock,
    isStarted: function () { return started; },
    setAmbience: setAmbience,
    startPad: startPad,
    stopPad: stopPad,
    stopAll: function () { stopPad(); stopAmbience(0.8); currentAmb = 'none'; },

    setBgm: function (on) { ensure(); if (bgmBus) bgmBus.gain.value = on ? 1 : 0; },
    setSfx: function (on) { ensure(); if (sfxBus) sfxBus.gain.value = on ? 1 : 0; },

    /* 효과음 — 작고 부드럽게 */
    tap:    function () { tone(520, 0.09, 'sine', 0.09); },
    select: function () { tone(660, 0.12, 'sine', 0.10); tone(990, 0.10, 'sine', 0.04); },
    back:   function () { tone(420, 0.12, 'sine', 0.07, 300); },
    talk:   function () { tone(700 + Math.random() * 60, 0.045, 'sine', 0.035); },
    step:   function () { noiseHit(0.07, 180 + Math.random() * 60, 1.2, 0.05); },
    swipe:  function () { noiseHit(0.22, 900, 0.8, 0.10); },
    chime:  function () { tone(880, 0.9, 'sine', 0.09); tone(1320, 0.7, 'sine', 0.035); },
    bell:   function () { tone(392, 2.6, 'sine', 0.10); tone(587, 2.2, 'sine', 0.045); tone(784, 1.8, 'sine', 0.025); },
    wave:   function () { noiseHit(0.9, 420, 0.6, 0.07); },
    found:  function () { tone(587, 0.16, 'triangle', 0.07); setTimeout(function () { tone(880, 0.28, 'triangle', 0.06); }, 110); },

    /* 카를로의 하루 */
    tram:   function () { tone(1046, 0.5, 'sine', 0.05); setTimeout(function () { tone(1318, 0.4, 'sine', 0.035); }, 130); },
    blip:   function () { tone(760, 0.06, 'square', 0.035); },
    charge: function () { tone(300, 0.08, 'square', 0.03); },
    boom:   function () { noiseHit(0.5, 140, 0.7, 0.14); tone(90, 0.4, 'sine', 0.08, 55); },
    kick:   function () { noiseHit(0.12, 220, 1.6, 0.12); tone(150, 0.1, 'sine', 0.07, 90); },
    bikeTick: function () { noiseHit(0.05, 1600, 3.5, 0.035); },
    alarm:  function () {
      tone(880, 0.16, 'square', 0.05);
      setTimeout(function () { tone(880, 0.16, 'square', 0.05); }, 240);
      setTimeout(function () { tone(880, 0.16, 'square', 0.05); }, 480);
    }
  };
})();
