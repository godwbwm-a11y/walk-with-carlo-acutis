/* 배경 음악 — 두 벌의 목록이 자리에 따라 서로 자리를 내어줍니다.
   길 위에서는 걷는 음악이 순서대로,
   성당·기도·성체조배·밤샘기도에서는 조용한 음악이 무작위로 흐릅니다. */

window.MusicSystem = (function () {

  /* 걸을 때 — 순서대로 */
  const WALK = [
    'assets/bgm/01.mp3', 'assets/bgm/02.mp3', 'assets/bgm/03.mp3', 'assets/bgm/04.mp3',
    'assets/bgm/05.mp3', 'assets/bgm/06.mp3', 'assets/bgm/07.mp3', 'assets/bgm/08.mp3',
    'assets/bgm/09.mp3', 'assets/bgm/10.mp3', 'assets/bgm/11.mp3'
  ];

  /* 조용한 자리에서 — 무작위로 */
  const QUIET_MUSIC = [
    'assets/bgm/quiet/q1.mp3', 'assets/bgm/quiet/q2.mp3', 'assets/bgm/quiet/q3.mp3',
    'assets/bgm/quiet/q4.mp3', 'assets/bgm/quiet/q5.mp3'
  ];

  const FADE = 1100;              // 서로 자리를 바꾸는 데 걸리는 시간(ms)

  let allowed = true;             // 설정에서 배경 소리를 켜 두었는가
  let unlocked = false;           // 브라우저가 소리를 허락했는가
  let mode = 'walk';              // 지금 이 자리에 어울리는 목록
  let applied = false;            // 한 번은 꼭 반영해야 합니다

  /* ── 목록 하나를 맡아 트는 작은 재생기 ─────── */
  function makePlayer(list, opt) {
    opt = opt || {};
    const shuffle = !!opt.shuffle;
    const volume = opt.volume === undefined ? 0.42 : opt.volume;
    const memory = opt.memory || null;      // 어디까지 들었는지 기억할 자리

    let el = null;
    let index = 0;
    let on = false;                         // 지금 이 재생기의 차례인가
    let timer = null;

    function build() {
      if (el) return el;
      el = new Audio();
      el.preload = 'auto';
      el.volume = 0;
      el.addEventListener('ended', next);
      el.addEventListener('error', next);   // 한 곡이 없어도 계속 갑니다
      if (memory) {
        const saved = SaveSystem.get(memory, 0) || 0;
        index = (saved >= 0 && saved < list.length) ? saved : 0;
      } else {
        index = Math.floor(Math.random() * list.length);
      }
      return el;
    }

    function pick(i) {
      build();
      index = ((i % list.length) + list.length) % list.length;
      if (memory) SaveSystem.set(memory, index);
      el.src = list[index];
      el.load();
    }

    function pickRandom() {
      if (list.length <= 1) { pick(0); return; }
      let n = index;
      while (n === index) n = Math.floor(Math.random() * list.length);
      pick(n);
    }

    function fade(target, ms, after) {
      build();
      if (timer) { clearInterval(timer); timer = null; }
      const from = el.volume;
      const start = Date.now();
      const dur = Math.max(1, ms);
      timer = setInterval(function () {
        const t = Math.min(1, (Date.now() - start) / dur);
        el.volume = Math.max(0, Math.min(1, from + (target - from) * t));
        if (t >= 1) { clearInterval(timer); timer = null; if (after) after(); }
      }, 40);
    }

    function play() {
      build();
      if (!el.src) { shuffle ? pickRandom() : pick(index); }
      const p = el.play();
      if (p && p.catch) p.catch(function () { /* 아직 허락 전이면 다음 터치에 다시 */ });
      fade(volume, FADE);
    }

    function next() {
      if (shuffle) pickRandom(); else pick(index + 1);
      if (on && unlocked && allowed) {
        el.volume = 0;
        const p = el.play();
        if (p && p.catch) p.catch(function () {});
        fade(volume, 700);
      }
    }

    return {
      /* 이 재생기의 차례인지 알려줍니다 */
      setOn: function (v) {
        on = !!v;
        build();
        if (on) {
          if (unlocked && allowed) {
            /* 조용한 음악은 들어올 때마다 새로 고릅니다 */
            if (shuffle && !el.paused) { /* 이미 흐르는 중이면 그대로 */ }
            else if (shuffle) pickRandom();
            play();
          }
        } else {
          fade(0, FADE, function () { try { el.pause(); } catch (e) {} });
        }
      },
      refresh: function () {
        build();
        if (on && unlocked && allowed) play();
        else if (!allowed || !on) fade(0, 400, function () { try { el.pause(); } catch (e) {} });
      },
      skip: next,
      isOn: function () { return on; },
      isPlaying: function () { return !!(el && !el.paused); },
      trackIndex: function () { return index; },
      volume: function () { return el ? el.volume : 0; },
      src: function () { return el ? el.src : null; },
      state: function () {
        return {
          on: on, src: el ? el.src : null, paused: el ? el.paused : null,
          volume: el ? +el.volume.toFixed(2) : null,
          readyState: el ? el.readyState : null,
          error: (el && el.error) ? el.error.code : null
        };
      }
    };
  }

  const walk = makePlayer(WALK, { volume: 0.42, memory: 'settings.bgmTrack' });
  const quiet = makePlayer(QUIET_MUSIC, { volume: 0.30, shuffle: true });

  /* 조용한 음악이 흐르는 자리 — 성당, 기도, 성체조배, 밤샘기도, 미사 */
  const QUIET = {
    Day2ChurchScene: 1,        // 성당 안
    Day2RelicScene: 1,         // 유해 공경과 기도
    Day3ChurchScene: 1,        // 주일 미사
    Day3ExitScene: 1,          // 미사가 끝난 빈 성당
    SilenceScene: 1,           // 아무것도 하지 않기 — 성체 앞
    PrayerScene: 1,            // 오늘의 기도
    Day5MassScene: 1,          // 개막미사
    Day5ReconcileScene: 1,     // 화해의 자리
    Day6VigilScene: 1,         // 밤샘기도와 성체조배
    StayScene: 1,              // 조금 더 머물기
    StarPrayerScene: 1,        // 별 아래 기도 지향
    Day7ChurchScene: 1,        // 성당
    Day8ChurchScene: 1,        // 성당 — 이번에는 혼자
    AloneScene: 1,             // 혼자 성체 앞에
    EpChurchScene: 1,          // 하나의 성당
    EpPrayerScene: 1           // 마지막 기도
  };

  function apply() {
    walk.setOn(mode === 'walk');
    quiet.setOn(mode === 'quiet');
  }

  return {
    tracks: WALK,
    quietTracks: QUIET_MUSIC,
    QUIET: QUIET,

    /* 첫 터치에 브라우저가 소리를 허락합니다 */
    unlock: function () {
      unlocked = true;
      walk.refresh();
      quiet.refresh();
    },

    /* 장면이 바뀔 때마다 이 자리에 어울리는 목록으로 */
    forScene: function (key) {
      MusicSystem.setMode(QUIET[key] ? 'quiet' : 'walk');
    },

    /* 'walk' 또는 'quiet' */
    setMode: function (m) {
      if (mode === m && applied) return;
      mode = m;
      applied = true;
      apply();
    },

    /* 장면 한가운데에서 기도가 시작될 때 */
    setWanted: function (on) {
      MusicSystem.setMode(on ? 'walk' : 'quiet');
    },

    /* 설정의 배경 소리 켬/끔 */
    setEnabled: function (on) {
      allowed = !!on;
      walk.refresh();
      quiet.refresh();
    },

    skip: function () { (mode === 'quiet' ? quiet : walk).skip(); },

    mode: function () { return mode; },
    isPlaying: function () { return walk.isPlaying() || quiet.isPlaying(); },
    trackIndex: function () { return (mode === 'quiet' ? quiet : walk).trackIndex(); },
    volume: function () { return (mode === 'quiet' ? quiet : walk).volume(); },
    state: function () {
      return { mode: mode, unlocked: unlocked, allowed: allowed, walk: walk.state(), quiet: quiet.state() };
    }
  };
})();
