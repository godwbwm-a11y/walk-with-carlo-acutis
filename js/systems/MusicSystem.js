/* 배경 음악 — 준비된 곡을 순서대로 이어 틀어줍니다.
   성당·기도·성체조배·밤샘기도처럼 조용해야 하는 자리에서는 스스로 물러납니다. */

window.MusicSystem = (function () {

  const TRACKS = [
    'assets/bgm/01.mp3', 'assets/bgm/02.mp3', 'assets/bgm/03.mp3', 'assets/bgm/04.mp3',
    'assets/bgm/05.mp3', 'assets/bgm/06.mp3', 'assets/bgm/07.mp3', 'assets/bgm/08.mp3',
    'assets/bgm/09.mp3', 'assets/bgm/10.mp3', 'assets/bgm/11.mp3'
  ];

  const FULL = 0.42;              // 다른 소리를 덮지 않을 만큼만
  const FADE = 900;               // 켜지고 꺼지는 데 걸리는 시간(ms)

  let el = null;                  // <audio>
  let index = 0;
  let wanted = false;             // 지금 자리에서 음악이 흘러도 되는가
  let allowed = true;             // 설정에서 배경 소리를 켜 두었는가
  let unlocked = false;           // 브라우저가 소리를 허락했는가
  let fadeTimer = null;

  function build() {
    if (el) return el;
    el = new Audio();
    el.preload = 'auto';
    el.volume = 0;
    el.addEventListener('ended', function () { next(); });
    el.addEventListener('error', function () { next(); });   // 한 곡이 없어도 계속 갑니다
    /* 이어서 걷다 돌아온 사람에게는 듣던 자리부터 */
    index = SaveSystem.get('settings.bgmTrack', 0) || 0;
    if (index < 0 || index >= TRACKS.length) index = 0;
    return el;
  }

  function load(i) {
    build();
    index = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    SaveSystem.set('settings.bgmTrack', index);
    el.src = TRACKS[index];
    el.load();
  }

  function fadeTo(target, ms, after) {
    build();
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
    const from = el.volume;
    const start = Date.now();
    const dur = Math.max(1, ms);
    fadeTimer = setInterval(function () {
      const t = Math.min(1, (Date.now() - start) / dur);
      el.volume = Math.max(0, Math.min(1, from + (target - from) * t));
      if (t >= 1) {
        clearInterval(fadeTimer); fadeTimer = null;
        if (after) after();
      }
    }, 40);
  }

  function tryPlay() {
    build();
    if (!unlocked || !allowed || !wanted) return;
    if (!el.src) load(index);
    const p = el.play();
    if (p && p.catch) p.catch(function () { /* 아직 허락 전이면 다음 터치에 다시 */ });
    fadeTo(FULL, FADE);
  }

  function pauseSoft() {
    if (!el) return;
    fadeTo(0, FADE, function () { try { el.pause(); } catch (e) {} });
  }

  function next() {
    load(index + 1);
    if (unlocked && allowed && wanted) {
      el.volume = 0;
      const p = el.play();
      if (p && p.catch) p.catch(function () {});
      fadeTo(FULL, 600);
    }
  }

  /* 음악이 흐르면 안 되는 자리 — 성당, 기도, 성체조배, 밤샘기도, 미사 */
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

  return {
    tracks: TRACKS,
    QUIET: QUIET,

    /* 장면이 바뀔 때마다 이 자리에서 음악이 흘러도 되는지 정합니다 */
    forScene: function (key) {
      MusicSystem.setWanted(!QUIET[key]);
    },

    /* 첫 터치에 브라우저가 소리를 허락합니다 */
    unlock: function () {
      unlocked = true;
      build();
      tryPlay();
    },

    /* 이 자리에서 음악이 흘러도 되는지 */
    setWanted: function (on) {
      if (wanted === on) return;
      wanted = on;
      if (on) tryPlay(); else pauseSoft();
    },

    /* 설정의 배경 소리 켬/끔 */
    setEnabled: function (on) {
      allowed = !!on;
      if (allowed) tryPlay(); else pauseSoft();
    },

    /* 다음 곡으로 */
    skip: function () { next(); },

    /* 소리가 왜 안 나는지 살펴볼 때 */
    state: function () {
      return {
        unlocked: unlocked, allowed: allowed, wanted: wanted,
        src: el ? el.src : null, paused: el ? el.paused : null,
        volume: el ? el.volume : null, readyState: el ? el.readyState : null,
        error: (el && el.error) ? el.error.code : null
      };
    },

    isPlaying: function () { return !!(el && !el.paused); },
    trackIndex: function () { return index; },
    volume: function () { return el ? el.volume : 0; }
  };
})();
