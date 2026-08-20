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
        carloSchoolChoice: null, // 카를로의 하루 · 학교에서의 선택
        entrustedConcern: null,
        sundayFeeling: null,
        personalStrength: null,
        reconciliationThought: null,
        vocationThought: null,
        talent: null,
        finalReflection: null
      },
      lifePlan: null,
      collection: [],           // 모은 말씀 카드
      journal: [],
      found: [],                 // 살펴본 오브젝트 기록
      settings: { bgm: true, sfx: true },
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
      }
    } catch (e) {
      available = false;             // 시크릿 모드 등 — 게임은 그대로 진행
      data = blank();
    }
    return data;
  }

  function save() {
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

    hasSave: function () {
      return !!(data.checkpoint || data.dayCompleted.day1 || data.reflections.mainConcern);
    },

    reset: function () {
      data = blank();
      save();
    }
  };
})();
