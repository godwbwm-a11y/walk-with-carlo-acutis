/* 진짜 게임처럼 — 점수, 연속(콤보), 터지는 빛, 흔들림, 시작 카드와 결과 카드, 최고 기록.

   이야기 속 미니게임은 지는 일이 없다는 원칙을 그대로 둡니다.
   점수는 ‘얼마나 잘했나’를 재는 잣대가 아니라 손맛과 재미를 위한 것이고,
   별은 0개가 없습니다 — 끝까지 해 보면 적어도 별 하나입니다.
   최고 기록은 이야기의 저장과 따로 이 기기에만 남습니다. */

window.GameFX = (function () {

  const KEY = 'walk-with-carlo-arcade';
  let store = null;
  function load() {
    if (store) return store;
    try { store = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { store = {}; }
    store.best = store.best || {}; store.stars = store.stars || {}; store.plays = store.plays || {};
    return store;
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(load())); } catch (e) { } }
  function best(key) { return load().best[key] || 0; }
  function stars(key) { return load().stars[key] || 0; }
  function plays(key) { return load().plays[key] || 0; }
  function record(key, score, st) {
    const s = load();
    const isNew = score > (s.best[key] || 0);
    if (isNew) s.best[key] = score;
    s.stars[key] = Math.max(s.stars[key] || 0, st || 0);
    s.plays[key] = (s.plays[key] || 0) + 1;
    persist();
    return isNew;
  }

  /* ── 빛 알갱이 ─────────────────────────────── */
  function ensureSpark(scene) {
    if (scene.textures.exists('fx_spark')) return;
    const t = scene.textures.createCanvas('fx_spark', 32, 32);
    const c = t.getContext();
    const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 32, 32);
    t.refresh();
  }
  function burst(scene, x, y, opt) {
    opt = opt || {};
    ensureSpark(scene);
    const n = opt.count || 14;
    const tints = opt.tints || [0xffe08a, 0xffb36b, 0xffffff, 0xf6d27a];
    const depth = opt.depth === undefined ? 900 : opt.depth;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = (opt.speed || 90) * (0.5 + Math.random());
      const p = scene.add.image(x, y, 'fx_spark').setDepth(depth).setBlendMode(Phaser.BlendModes.ADD)
        .setTint(tints[i % tints.length]).setScale((opt.size || 0.5) * (0.6 + Math.random() * 0.8));
      if (opt.scroll === false) p.setScrollFactor(0);
      scene.tweens.add({
        targets: p, x: x + Math.cos(a) * sp, y: y + Math.sin(a) * sp + (opt.gravity || 30),
        alpha: 0, scale: 0.05, duration: 420 + Math.random() * 360, ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }
  /* 화면에 떠오르는 점수 글자 */
  function pop(scene, x, y, text, opt) {
    opt = opt || {};
    const t = scene.add.text(x, y, text, UI.style(opt.size || 22, opt.color || '#fff3c4', {
      stroke: '#5a3410', strokeThickness: 4, shadow: false
    })).setOrigin(0.5).setDepth(opt.depth === undefined ? 920 : opt.depth).setScale(0.5);
    if (opt.scroll === false) t.setScrollFactor(0);
    scene.tweens.add({ targets: t, scale: 1, duration: 140, ease: 'Back.easeOut' });
    scene.tweens.add({ targets: t, y: y - (opt.rise || 46), alpha: 0, duration: 760, delay: 220, ease: 'Sine.easeIn', onComplete: () => t.destroy() });
    return t;
  }
  function shake(scene, power) { scene.cameras.main.shake(140, (power || 0.006)); }
  function flash(scene, color) {
    const c = Phaser.Display.Color.IntegerToColor(color === undefined ? 0xffffff : color);
    scene.cameras.main.flash(160, c.red, c.green, c.blue, true);
  }

  /* ── 점수판 — 왼쪽 위 점수, 가운데 연속, 필요하면 시간 막대 ── */
  function hud(scene, opt) {
    opt = opt || {};
    const W = GAME.WIDTH;
    const depth = opt.depth === undefined ? 880 : opt.depth;
    const y = opt.y === undefined ? 112 : opt.y;
    const box = scene.add.container(0, 0).setDepth(depth).setScrollFactor(0);
    const plate = scene.add.graphics();
    plate.fillStyle(0x0b1222, 0.62); plate.fillRoundedRect(14, y - 19, 132, 38, 19);
    plate.lineStyle(1, 0xffffff, 0.16); plate.strokeRoundedRect(14.5, y - 18.5, 131, 37, 18.5);
    const label = scene.add.text(32, y, '점수', UI.style(13, '#cbd8ea')).setOrigin(0, 0.5);
    const num = scene.add.text(130, y, '0', UI.style(21, '#ffe7a8')).setOrigin(1, 0.5);
    box.add([plate, label, num]);
    /* 점수판이 맨 위 줄에 있으면 연속 글자는 점수판 오른쪽에, 아니면 가운데에 */
    const top = y < 60;
    const comboT = scene.add.text(top ? 158 : W / 2, y + 1, '', UI.style(top ? 17 : 20, '#ffd27a', { stroke: '#5a3410', strokeThickness: 4, shadow: false }))
      .setOrigin(top ? 0 : 0.5, 0.5).setDepth(depth).setScrollFactor(0).setAlpha(0);
    let bar = null;
    if (opt.time) {
      bar = scene.add.graphics().setDepth(depth).setScrollFactor(0);
      box.add(bar);
    }
    const h = {
      score: 0, combo: 0, maxCombo: 0, hits: 0, misses: 0, timeLeft: opt.time || 0, total: opt.time || 0,
      /* 맞힘 — 연속이 이어질수록 더 많이 받고, 소리도 한 음씩 올라갑니다 */
      hit: function (base, x, yy, word) {
        h.combo++; h.hits++; h.maxCombo = Math.max(h.maxCombo, h.combo);
        const mult = 1 + Math.min(4, Math.floor(h.combo / 5));
        const gain = Math.round((base || 10) * mult);
        h.add(gain);
        AudioSystem.gScore(Math.min(7, h.combo - 1));
        if (x !== undefined) {
          pop(scene, x, yy, (word ? word + ' ' : '') + '+' + gain, { scroll: opt.scroll });
          burst(scene, x, yy, { count: 8 + Math.min(10, h.combo), scroll: opt.scroll });
        }
        if (h.combo >= 3) {
          comboT.setText(h.combo + ' 연속!' + (mult > 1 ? '  ×' + mult : '')).setAlpha(1).setScale(1.25);
          scene.tweens.killTweensOf(comboT);
          scene.tweens.add({ targets: comboT, scale: 1, duration: 180, ease: 'Back.easeOut' });
          scene.tweens.add({ targets: comboT, alpha: 0, duration: 400, delay: 900 });
        }
        return gain;
      },
      miss: function (x, yy) {
        if (h.combo >= 3) pop(scene, x === undefined ? W / 2 : x, yy === undefined ? y + 40 : yy, '연속 끝', { color: '#cfd8e6', size: 17, scroll: opt.scroll });
        h.combo = 0; h.misses++;
        AudioSystem.gMiss();
        if (opt.shakeOnMiss !== false) shake(scene, 0.004);
      },
      add: function (n) {
        h.score = Math.max(0, h.score + n);
        num.setText(String(h.score));
        scene.tweens.killTweensOf(num);
        num.setScale(1.25);
        scene.tweens.add({ targets: num, scale: 1, duration: 160, ease: 'Quad.easeOut' });
      },
      /* 남은 시간 막대 (초) */
      tick: function (dt) {
        if (!bar) return false;
        h.timeLeft = Math.max(0, h.timeLeft - dt / 1000);
        const f = h.total ? h.timeLeft / h.total : 0;
        bar.clear();
        bar.fillStyle(0x0b1222, 0.5); bar.fillRoundedRect(W - 150, y - 6, 112, 12, 6);
        bar.fillStyle(f > 0.25 ? 0xf2b56b : 0xe8705a, 1); bar.fillRoundedRect(W - 150, y - 6, Math.max(6, 112 * f), 12, 6);
        return h.timeLeft <= 0;
      },
      destroy: function () { box.destroy(); comboT.destroy(); }
    };
    if (bar) h.tick(0);
    return h;
  }

  /* ── 시작 카드 — 제목, 하는 법, 최고 기록, 그리고 3·2·1 ── */
  function intro(scene, opt) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = scene.add.container(0, 0).setDepth(1500).setScrollFactor(0);
    const dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x070c18, 0.78).setInteractive();
    layer.add(dim);
    const pw = W - 48;
    const lines = (opt.how || []);
    const howT = scene.add.text(W / 2, 0, lines.map(l => '·  ' + l).join('\n'), UI.style(16, PAL.ink, {
      wordWrap: { width: pw - 56 }, lineSpacing: 9 })).setOrigin(0.5, 0);
    /* 글 높이를 먼저 재고 판을 그립니다 — 제목·소개·하는 법이 겹치지 않게 */
    const subT = opt.sub ? scene.add.text(W / 2, 0, opt.sub, UI.style(14, PAL.clay, { align: 'center', wordWrap: { width: pw - 50 }, lineSpacing: 4 })).setOrigin(0.5, 0) : null;
    const subH = subT ? subT.height + 14 : 0;
    const ph = 96 + subH + howT.height + 150;
    const top = Math.round(H / 2 - ph / 2);
    layer.add(UI.panel(scene, W / 2, top + ph / 2, pw, ph, { radius: 26 }));
    if (opt.badge) layer.add(scene.add.text(W / 2, top + 28, opt.badge, UI.style(13, PAL.sunDeep, { shadow: false })).setOrigin(0.5));
    layer.add(scene.add.text(W / 2, top + 60, opt.title, UI.style(26, PAL.ink)).setOrigin(0.5));
    if (subT) { subT.y = top + 88; layer.add(subT); }
    howT.y = top + 92 + subH; layer.add(howT);
    const b = best(opt.key);
    layer.add(scene.add.text(W / 2, top + ph - 108, b > 0 ? ('최고 기록  ' + b + '  ·  ' + '★'.repeat(stars(opt.key)) + '☆'.repeat(3 - stars(opt.key))) : '처음 해 보는 게임',
      UI.style(14, PAL.inkSoft)).setOrigin(0.5));
    const go = UI.button(scene, W / 2, top + ph - 56, 220, 60, '시작!', () => {
      go.disableInteractive();
      scene.tweens.add({ targets: layer, alpha: 0, duration: 220, onComplete: () => { layer.destroy(); countdown(scene, opt.onStart, opt.noCount); } });
    }, { size: 22, fill: PAL.sun });
    layer.add(go);
    layer.setAlpha(0);
    scene.tweens.add({ targets: layer, alpha: 1, duration: 260 });
    return layer;
  }
  function countdown(scene, cb, skip) {
    if (skip) { if (cb) cb(); return; }
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const seq = ['3', '2', '1', '시작!'];
    let i = 0;
    const step = () => {
      if (i >= seq.length) { if (cb) cb(); return; }
      const s = seq[i];
      const t = scene.add.text(W / 2, H * 0.45, s, UI.style(s.length > 1 ? 44 : 72, '#fff3c4', {
        stroke: '#5a3410', strokeThickness: 7, shadow: false })).setOrigin(0.5).setDepth(1600).setScrollFactor(0).setScale(1.6).setAlpha(0);
      AudioSystem.gCount(seq.length - 2 - i);
      scene.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 200, ease: 'Back.easeOut' });
      scene.tweens.add({ targets: t, alpha: 0, scale: 0.8, duration: 220, delay: s.length > 1 ? 420 : 480, onComplete: () => t.destroy() });
      i++;
      scene.time.delayedCall(s.length > 1 ? 420 : 560, step);
    };
    step();
  }

  /* ── 결과 카드 — 별, 점수, 최고 기록, 한 번 더 ── */
  function result(scene, opt) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const st = Math.max(1, Math.min(3, opt.stars || 1));
    const isNew = record(opt.key, opt.score || 0, st);
    const layer = scene.add.container(0, 0).setDepth(1500).setScrollFactor(0);
    layer.add(scene.add.rectangle(W / 2, H / 2, W, H, 0x070c18, 0.8).setInteractive());
    const pw = W - 48, ph = 430 + (opt.line ? 30 : 0);
    const top = Math.round(H / 2 - ph / 2);
    layer.add(UI.panel(scene, W / 2, top + ph / 2, pw, ph, { radius: 26 }));
    layer.add(scene.add.text(W / 2, top + 44, opt.title || '끝!', UI.style(24, PAL.ink)).setOrigin(0.5));
    /* 별 셋 — 하나씩 튀어나옵니다 */
    for (let i = 0; i < 3; i++) {
      const on = i < st;
      const s = scene.add.text(W / 2 + (i - 1) * 62, top + 112 - (i === 1 ? 10 : 0), '★', UI.style(i === 1 ? 58 : 48, on ? '#f2b034' : '#e6dccb', {
        stroke: on ? '#9a5a12' : '#cfc3ae', strokeThickness: 3, shadow: false })).setOrigin(0.5).setScale(0);
      layer.add(s);
      scene.tweens.add({ targets: s, scale: 1, duration: 320, delay: 300 + i * 260, ease: 'Back.easeOut',
        onStart: () => { if (on) { AudioSystem.gStar(i); burst(scene, s.x, s.y, { count: 10, scroll: false, depth: 1550 }); } } });
    }
    layer.add(scene.add.text(W / 2, top + 178, String(opt.score || 0), UI.style(40, PAL.sunDeep)).setOrigin(0.5));
    const sub = (opt.detail ? opt.detail + '   ·   ' : '') + '최고 ' + best(opt.key);
    layer.add(scene.add.text(W / 2, top + 218, sub, UI.style(14, PAL.inkSoft)).setOrigin(0.5));
    if (isNew && opt.score > 0) {
      const nb = scene.add.text(W / 2 + 96, top + 160, 'NEW!', UI.style(15, '#ffffff', { backgroundColor: '#e8705a', padding: { x: 8, y: 3 }, shadow: false }))
        .setOrigin(0.5).setAngle(12).setScale(0);
      layer.add(nb);
      scene.tweens.add({ targets: nb, scale: 1, duration: 300, delay: 1200, ease: 'Back.easeOut' });
    }
    if (opt.line) layer.add(scene.add.text(W / 2, top + 254, opt.line, UI.style(15, PAL.clay, { align: 'center', wordWrap: { width: pw - 50 } })).setOrigin(0.5));
    const by = top + ph - 112;
    layer.add(UI.button(scene, W / 2, by, 240, 58, '한 번 더', () => { layer.destroy(); if (opt.onRetry) opt.onRetry(); }, { size: FONT.label, fill: PAL.sun }));
    layer.add(UI.button(scene, W / 2, by + 66, 240, 54, opt.exitLabel || '계속하기', () => { layer.destroy(); if (opt.onExit) opt.onExit(); }, { size: FONT.small }));
    layer.setAlpha(0);
    scene.tweens.add({ targets: layer, alpha: 1, duration: 300 });
    AudioSystem.gWin();
    return layer;
  }

  return { burst, pop, shake, flash, hud, intro, countdown, result, best, stars, plays, record };
})();
