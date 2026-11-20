/* localStorage 자동 저장 — 로그인·서버 없이 기기 안에만 저장됩니다. */

window.SaveSystem = (function () {

  function blank() {
    return {
      version: 1,
      currentDay: 1,
      dayCompleted: {
        day1: false, day2: false, day3: false, day4: false,
        day5: false, day6: false, day7: false, day8: false, epilogue: false
      },
      checkpoint: null,          // 이어서 걷기 지점
      reflections: {
        mainConcern: null,       // DAY1 미니게임
        dislikeReason: null,     // DAY1 벤치 대화
        familyChoice: null,      // DAY1 첫 선택
        carloSchoolChoice: null, // 가롤로의 하루 · 학교에서의 선택
        entrustedConcern: null,
        sundayFeeling: null,
        personalStrength: null,
        reconciliationThought: null,
        vocationThought: null,
        talent: null,
        finalReflection: null
      },
      lifePlan: null,
      epilogue: {                // 에필로그는 본편 진행에 영향을 주지 않습니다
        played: false, greeting: null, newFriendName: null,
        favoriteGame: null, learnedWord: null, taughtWord: null,
        photoPose: null, photoKept: false, games: [], completed: false,
        creditsSeen: false
      },
      store: {                   // 동네 편의점 — 올 때마다 조금씩 친해집니다
        visits: 0, friend: 0, tastes: [], lastSnack: null, gotGift: false
      },
      collection: [],           // 모은 말씀 카드
      journal: [],
      found: [],                 // 살펴본 오브젝트 기록
      interlude: {},             // 그날 후반부에 끼어드는 게임을 했는지
      practiceLog: [],           // 노트에서 고른 작은 실천 — 다음 날 조용히 다시 물어봅니다
      lastCheckin: null,         // 실천을 물어본 날 (하루에 한 번만)
      settings: { bgm: true, sfx: true, textSpeed: 'normal' },
      updatedAt: null
    };
  }

  let data = blank();
  let available = true;

  function load() {
    try {
      const raw = window.localStorage.getItem(GAME.SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        data = Object.assign(blank(), parsed);
        data.dayCompleted = Object.assign(blank().dayCompleted, parsed.dayCompleted || {});
        data.reflections = Object.assign(blank().reflections, parsed.reflections || {});
        data.settings = Object.assign(blank().settings, parsed.settings || {});
        data.practiceLog = Array.isArray(parsed.practiceLog) ? parsed.practiceLog : [];
        data.epilogue = Object.assign(blank().epilogue, parsed.epilogue || {});
        data.store = Object.assign(blank().store, parsed.store || {});
      }
    } catch (e) {
      available = false;             // 시크릿 모드 등 — 게임은 그대로 진행
      data = blank();
    }
    return data;
  }

  function save() {
    if (window.SaveSystem && SaveSystem._sandbox) return;       // 연습 모드에서는 저장하지 않습니다
    data.updatedAt = new Date().toISOString();
    if (!available) return;
    try {
      window.localStorage.setItem(GAME.SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      available = false;
    }
  }

  return {
    load: load,
    save: save,
    get data() { return data; },
    isAvailable: function () { return available; },

    set: function (path, value) {                  // set('reflections.mainConcern', '친구')
      const keys = path.split('.');
      let node = data;
      for (let i = 0; i < keys.length - 1; i++) node = node[keys[i]];
      node[keys[keys.length - 1]] = value;
      /* 작은 실천을 고르면 날짜와 함께 따로 적어 둡니다 */
      const m = /^reflections\.day(\d+)Practice$/.exec(path);
      if (m && typeof value === 'string' && window.Liturgy) {
        data.practiceLog = (data.practiceLog || []).filter(function (p) { return p.day !== +m[1]; });
        data.practiceLog.push({ day: +m[1], text: value, date: Liturgy.key(), answer: null });
      }
      save();
    },

    /* 오늘 물어볼 실천 — 오늘보다 앞선 날에 고른 것 가운데 아직 대답하지 않은 가장 최근 것 */
    pendingPractice: function () {
      if (!window.Liturgy) return null;
      const today = Liturgy.key();
      if (data.lastCheckin === today) return null;
      const list = (data.practiceLog || []).filter(function (p) {
        return p.date < today && (p.answer === null || p.answer === 'today');
      });
      return list.length ? list[list.length - 1] : null;
    },

    answerPractice: function (entry, answer) {
      const today = window.Liturgy ? Liturgy.key() : null;
      data.lastCheckin = today;
      (data.practiceLog || []).forEach(function (p) {
        if (p.day === entry.day) {
          p.answer = answer;
          if (answer === 'today') p.date = today;    // 내일 한 번 더 물어봅니다
          if (answer === 'done') p.doneAt = today;
        }
      });
      save();
    },

    get: function (path, fallback) {
      const keys = path.split('.');
      let node = data;
      for (let i = 0; i < keys.length; i++) {
        if (node == null) return fallback;
        node = node[keys[i]];
      }
      return node === undefined || node === null ? fallback : node;
    },

    checkpoint: function (sceneKey, extra) {
      data.checkpoint = Object.assign({ scene: sceneKey, at: Date.now() }, extra || {});
      save();
    },

    markFound: function (id) {
      if (data.found.indexOf(id) === -1) { data.found.push(id); save(); }
      return data.found.length;
    },

    addJournal: function (entry) {
      data.journal = data.journal.filter(function (j) { return j.day !== entry.day; });
      data.journal.push(entry);
      save();
    },

    completeDay: function (n) {
      data.dayCompleted['day' + n] = true;
      data.currentDay = Math.max(data.currentDay, n + 1);
      data.checkpoint = null;
      save();
    },

    /* 연습 모드 — 미니게임 모음에서 놀 때는 이야기의 기록을 건드리지 않습니다.
       놀이 중에는 평소처럼 읽고 쓰되, 끝나면 시작 전 상태로 되돌리고 저장하지 않습니다. */
    beginSandbox: function () {
      if (this._snap) return;
      this._snap = JSON.stringify(data);
      this._sandbox = true;
    },
    endSandbox: function () {
      if (!this._snap) return;
      try { data = JSON.parse(this._snap); } catch (e) { }
      this._snap = null;
      this._sandbox = false;
    },
    inSandbox: function () { return !!this._sandbox; },

    hasSave: function () {
      return !!(data.checkpoint || data.dayCompleted.day1 || data.reflections.mainConcern);
    },

    reset: function () {
      data = blank();
      save();
    }
  };
})();
