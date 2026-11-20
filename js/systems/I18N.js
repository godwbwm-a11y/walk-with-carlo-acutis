/* 언어 — 한국어와 영어.

   이야기와 장면 코드는 모두 한국어로 쓰여 있고, 그대로 둡니다.
   대신 화면에 글자가 그려지는 순간(Phaser 의 글상자, 입력칸, 사진 글씨)에
   한국어 문장을 사전(js/i18n/en.js)에서 찾아 영어로 바꿉니다.
   그래서 장면의 흐름·저장 기록·비교 같은 것은 언어와 상관없이 똑같이 움직입니다.

   - 사전에서 문장을 통째로 찾고, 없으면 줄마다, 그래도 없으면 날짜 같은 규칙으로,
     마지막으로 문장 속 아는 조각들을 바꿉니다.
   - 고른 언어는 저장 기록과 따로 둡니다 — ‘처음부터 다시 걷기’로 기록을 지워도 언어는 그대로입니다.
   - 처음 켤 때는 기기 언어를 따릅니다(한국어가 아니면 영어). */

window.I18N = (function () {
  const KEY = 'walk-with-carlo-lang';
  const HANGUL = /[가-힣]/;
  const LANGS = [{ id: 'ko', label: '한국어' }, { id: 'en', label: 'English' }];

  function detect() {
    try {
      const v = window.localStorage.getItem(KEY);
      if (v === 'ko' || v === 'en') return v;
    } catch (e) { }
    const n = String((navigator.languages && navigator.languages[0]) || navigator.language || 'ko').toLowerCase();
    return n.indexOf('ko') === 0 ? 'ko' : 'en';
  }

  let lang = detect();
  let dict = null, frag = null;
  const cache = new Map();
  const missing = new Set();

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  let flat = null;
  const lines = {};      // 여러 줄짜리 글에서 뽑은 줄 하나하나     // 줄바꿈을 빈칸으로 바꾼 문장(“한 줄로 이어 보여 주는 곳”)을 위한 사전
  const squash = function (k) { return k.replace(/\s+/g, ' ').trim(); };
  function build() {
    dict = window.I18N_EN || {};
    flat = {};
    Object.keys(dict).forEach(function (k) {
      if (!/\n/.test(k)) return;
      flat[squash(k)] = squash(dict[k]);
      /* 기도문처럼 여러 줄인 글을 장면이 몇 줄씩 나눠 보여 줄 때 — 줄 수가 같으면 줄끼리 짝을 짓습니다 */
      const kl = k.split('\n'), vl = dict[k].split('\n');
      if (kl.length === vl.length) kl.forEach(function (l, i) { if (l.trim() && lines[l] === undefined) lines[l] = vl[i]; });
    });
    const keys = Object.keys(dict).filter(function (k) { return k.length >= 2 && HANGUL.test(k); })
      .sort(function (a, b) { return b.length - a.length; });
    frag = keys.length ? new RegExp(keys.map(esc).join('|'), 'g') : null;
  }

  /* ── 규칙으로 옮기는 것들 — 날짜, 전례 주간, 숫자가 섞인 짧은 말 ── */
  const WEEKDAY = { '일': 'Sunday', '월': 'Monday', '화': 'Tuesday', '수': 'Wednesday', '목': 'Thursday', '금': 'Friday', '토': 'Saturday' };
  const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const SEASON = { '연중': 'Ordinary Time', '대림': 'Advent', '사순': 'Lent', '부활': 'Easter', '성탄': 'Christmas' };
  function ord(n) {
    n = +n;
    const s = (n % 100 >= 11 && n % 100 <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
    return n + s;
  }
  const RULES = [
    [/^(\d+)월 (\d+)일 ([일월화수목금토])요일$/, function (m) { return WEEKDAY[m[3]] + ', ' + MONTH[m[1] - 1] + ' ' + m[2]; }],
    [/^(\d+)월 (\d+)일$/, function (m) { return MONTH[m[1] - 1] + ' ' + m[2]; }],
    [/^(연중|대림|사순|부활|성탄) 제(\d+)주일$/, function (m) {
      return ord(m[2]) + ' Sunday ' + (m[1] === '연중' ? 'in Ordinary Time' : 'of ' + SEASON[m[1]]);
    }],
    [/^(연중|대림|사순|부활|성탄) 제(\d+)주간 ([일월화수목금토])요일$/, function (m) {
      return WEEKDAY[m[3]] + ' of the ' + ord(m[2]) + ' Week ' + (m[1] === '연중' ? 'in Ordinary Time' : 'of ' + SEASON[m[1]]);
    }],
    [/^(\d+)초$/, function (m) { return m[1] + 's'; }],
    [/^(\d+)번$/, function (m) { return m[1] + (m[1] === '1' ? ' time' : ' times'); }],
    [/^(\d+)개$/, function (m) { return m[1]; }],
    [/^(\d+)명$/, function (m) { return m[1] + (m[1] === '1' ? ' person' : ' people'); }],
    [/^(\d+)일$/, function (m) { return m[1] + (m[1] === '1' ? ' day' : ' days'); }]
  ];
  function byRule(s) {
    for (let i = 0; i < RULES.length; i++) {
      const m = RULES[i][0].exec(s);
      if (m) return RULES[i][1](m);
    }
    return undefined;
  }

  function one(s) {
    if (!HANGUL.test(s)) return s;
    let r = dict[s];
    if (r !== undefined) return r;
    r = flat[squash(s)];
    if (r !== undefined) return r;
    /* 앞뒤를 감싼 따옴표 */
    const q = /^([“‘"'(\[])([\s\S]+)([”’"')\]])$/.exec(s);
    if (q) { const inner = one(q[2]); if (inner !== undefined) return q[1] + inner + q[3]; }
    /* 그림 글자·숫자 같은 앞뒤 장식을 떼고 찾아봅니다 ( 🥐  빵 ) */
    const m = /^([^\uac00-\ud7a3]*)([\s\S]*?[\uac00-\ud7a3][^\n]*?)([^\uac00-\ud7a3]*)$/.exec(s);
    if (m && (m[1] || m[3])) {
      const mid = dict[m[2]] !== undefined ? dict[m[2]] : flat[squash(m[2])];
      if (mid !== undefined) return m[1] + mid + m[3];
    }
    if (lines[s] !== undefined) return lines[s];
    const t = s.trim();
    if (t !== s) {
      r = dict[t];
      if (r === undefined) r = byRule(t);
      if (r !== undefined) return s.replace(t, r);
    }
    return byRule(s);
  }

  function tr(v) {
    if (lang === 'ko' || v == null) return v;
    if (Array.isArray(v)) return v.map(tr);
    if (typeof v !== 'string') return v;
    if (!HANGUL.test(v)) return v;
    const hit = cache.get(v);
    if (hit !== undefined) return hit;
    if (!dict) build();

    let r = one(v);
    /* 여러 줄 — 줄마다 */
    if (r === undefined && v.indexOf('\n') !== -1) {
      const parts = v.split('\n').map(one);
      if (parts.every(function (p) { return p !== undefined; })) r = parts.join('\n');
    }
    /* 문장 속 아는 조각들 — 숫자를 이어 붙여 만든 글 등 */
    if (r === undefined) {
      const lines = v.split('\n').map(function (line) {
        const whole = one(line);
        if (whole !== undefined) return whole;
        let out = frag ? line.replace(frag, function (m) { return dict[m]; }) : line;
        /* 남은 한 글자짜리 낱말(켬·끔 같은) */
        out = out.replace(/[\uac00-\ud7a3]+/g, function (m) { return dict[m] !== undefined ? dict[m] : m; });
        /* 숫자에 붙은 단위 */
        out = out.replace(/(\d+)\s*초/g, '$1s').replace(/(\d+)\s*번째/g, '#$1')
          .replace(/(\d+)\s*번/g, '$1×').replace(/(\d+)\s*개/g, '$1').replace(/(\d+)\s*명/g, '$1')
          .replace(/(\d+)\s*장/g, '$1').replace(/(\d+)\s*권/g, '$1').replace(/(\d+)\s*가지/g, '$1');
        return out;
      });
      r = lines.join('\n');
      /* 그래도 한국어가 남으면 섞인 문장보다 원문 그대로가 낫습니다 */
      if (HANGUL.test(r)) { missing.add(v); r = v; }
    }
    cache.set(v, r);
    return r;
  }

  /* Phaser 의 글상자 — 만들 때도, 바꿀 때도 이 길을 지납니다 */
  function patchPhaser() {
    const T = Phaser.GameObjects.Text.prototype;
    if (T.__i18n) return;
    T.__i18n = true;
    const orig = T.setText;
    T.setText = function (value) {
      const out = tr(value);
      const r = orig.call(this, out);
      if (lang !== 'ko' && out !== value && typeof value === 'string') fitLike(this, value);
      return r;
    };
  }

  /* 한 줄짜리 글(줄바꿈 폭이 없는 글)은 한국어 자리에 맞춰 놓여 있습니다.
     영어가 그 자리보다 많이 길면 글자 크기를 조금 줄여 원래 자리 안에 담습니다. */
  function fitLike(t, ko) {
    try {
      if (t.__noFit || t.style.wordWrapWidth || t.style.wordWrapCallback) return;
      if (t.__baseSize === undefined) t.__baseSize = parseInt(t.style.fontSize, 10) || 16;
      const base = t.__baseSize;
      const ctx = t.context;
      const widest = function (str, size) {
        ctx.save();
        ctx.font = t.style.fontStyle + ' ' + size + 'px ' + t.style.fontFamily;
        let w = 0;
        String(str).split('\n').forEach(function (l) { w = Math.max(w, ctx.measureText(l).width); });
        ctx.restore();
        return w;
      };
      const koW = widest(ko, base), enW = widest(t.text, base);
      /* 판 안에 들어 있지 않은 글(화면 위 안내 글 등)은 화면 폭까지 써도 됩니다 */
      const free = !t.parentContainer && t.scrollFactorX === 0 ? (GAME.WIDTH - 70) : 0;
      const room = Math.max(koW * 1.2, 60, free);
      let size = base;
      if (enW > room) size = Math.max(11, Math.floor(base * 0.66), Math.floor(base * room / enW));
      if ((parseInt(t.style.fontSize, 10) || base) !== size) t.setFontSize(size);
    } catch (e) { }
  }

  return {
    LANGS: LANGS,
    get lang() { return lang; },
    is: function (l) { return lang === l; },
    tr: tr,
    t: tr,
    patchPhaser: patchPhaser,
    missing: missing,
    set: function (l) {
      if (l !== 'ko' && l !== 'en') return;
      lang = l;
      cache.clear();
      try { window.localStorage.setItem(KEY, l); } catch (e) { }
      try { document.documentElement.lang = l; } catch (e) { }
      if (window.I18N_HTML) window.I18N_HTML();
    }
  };
})();

/* 페이지의 글(제목, 가로 화면 안내, 불러오는 중) */
window.I18N_HTML = function () {
  try {
    document.documentElement.lang = I18N.lang;
    if (!window.__htmlKo) {
      window.__htmlKo = { title: document.title, nodes: [] };
      document.querySelectorAll('#rotate-guard p, #boot-screen p').forEach(function (el) {
        window.__htmlKo.nodes.push([el, el.innerHTML]);
      });
    }
    document.title = I18N.tr(window.__htmlKo.title);
    window.__htmlKo.nodes.forEach(function (n) {
      const ko = n[1];
      const plain = ko.replace(/<br\s*\/?>/g, '\n');
      n[0].innerHTML = I18N.tr(plain).replace(/\n/g, '<br />');
    });
  } catch (e) { }
};
