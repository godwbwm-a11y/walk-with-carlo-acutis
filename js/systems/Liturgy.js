/* 교회의 달력 — 게임 밖의 오늘과 이어 줍니다.

   이 게임의 마지막 말은 “다음 날은 게임 밖에 있습니다” 입니다.
   그래서 게임을 열 때마다, 오늘이 교회의 시간으로 어떤 날인지 조용히 알려 줍니다.
   점수나 연속 출석 보상은 없습니다. 오늘의 전례 시기와 색, 주일과 대축일,
   성 가롤로 아쿠티스 축일(10월 12일), 그리고 서울 세계청년대회까지 남은 날.

   한국 교회의 관습을 따릅니다 — 주님 공현·주님 승천·성체 성혈 대축일은 주일로 옮겨 지내고,
   7월 5일 성 김대건 안드레아 사제 순교자 대축일과 9월 20일 한국 순교자 대축일을 지냅니다. */

window.Liturgy = (function () {

  const DAY = 86400000;
  const COLORS = {
    green:  { name: '초록', hex: '#4f8a5b' },
    violet: { name: '보라', hex: '#7a5aa6' },
    white:  { name: '흰색', hex: '#f4ecd8' },
    red:    { name: '빨강', hex: '#c0443a' },
    rose:   { name: '장미', hex: '#d98aa0' }
  };
  const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

  /* 날짜만 다루도록 자정으로 맞춥니다 */
  function d0(y, m, d) { return new Date(y, m - 1, d); }
  function strip(t) { return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }
  function add(t, n) { const r = new Date(t); r.setDate(r.getDate() + n); return r; }
  function same(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function diff(a, b) { return Math.round((strip(a) - strip(b)) / DAY); }

  /* 부활 대축일 — 그레고리력 계산 */
  function easter(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return d0(y, month, day);
  }

  /* 대림 제1주일 — 성탄 전 네 번째 주일 */
  function advent1(y) {
    const xmas = d0(y, 12, 25);
    const back = xmas.getDay() === 0 ? 7 : xmas.getDay();
    return add(xmas, -back - 21);
  }

  /* 한국: 주님 공현 대축일은 1월 2~8일 사이의 주일, 주님 세례 축일은 그다음 주일
     (공현이 7·8일이면 바로 다음 월요일) */
  function epiphany(y) {
    for (let d = 2; d <= 8; d++) { const t = d0(y, 1, d); if (t.getDay() === 0) return t; }
    return d0(y, 1, 6);
  }
  function baptism(y) {
    const ep = epiphany(y);
    return ep.getDate() >= 7 ? add(ep, 1) : add(ep, 7);
  }

  /* 성가정 축일 — 성탄 팔일 축제 안의 주일, 없으면 12월 30일 */
  function holyFamily(y) {
    for (let d = 26; d <= 31; d++) { const t = d0(y, 12, d); if (t.getDay() === 0) return t; }
    return d0(y, 12, 30);
  }

  function season(t) {
    const y = t.getFullYear();
    const E = easter(y);
    const ash = add(E, -46), palm = add(E, -7), pent = add(E, 49);
    const adv = advent1(y);
    if (t >= adv && t < d0(y, 12, 25)) return 'advent';
    if (t >= d0(y, 12, 25) || t <= baptism(y)) return 'christmas';
    if (t >= ash && t < palm) return 'lent';
    if (t >= palm && t < E) return 'holyweek';
    if (t >= E && t <= pent) return 'easter';
    return 'ordinary';
  }

  const SEASON = {
    advent:    { name: '대림 시기', color: 'violet', line: '기다림의 시간 — 오실 분을 위해 마음에 자리를 비워 둡니다.' },
    christmas: { name: '성탄 시기', color: 'white',  line: '하느님이 우리 가운데 오셨습니다.' },
    lent:      { name: '사순 시기', color: 'violet', line: '돌아가는 시간 — 기도와 단식과 나눔으로.' },
    holyweek:  { name: '성주간',   color: 'violet', line: '예수님의 마지막 한 주를 함께 걷습니다.' },
    easter:    { name: '부활 시기', color: 'white',  line: '그분은 살아 계십니다. 알렐루야!' },
    ordinary:  { name: '연중 시기', color: 'green',  line: '평범한 날들 속에서 자라는 시간.' }
  };

  /* 그날만의 이름 — 대축일과 몇몇 축일, 기념일 */
  function special(t) {
    const y = t.getFullYear(), m = t.getMonth() + 1, d = t.getDate();
    const E = easter(y);
    const n = diff(t, E);
    const adv = advent1(y);
    const fixed = {
      '1-1':   ['천주의 성모 마리아 대축일', 'white'],
      '2-2':   ['주님 봉헌 축일', 'white'],
      '6-29':  ['성 베드로와 성 바오로 사도 대축일', 'red'],
      '7-5':   ['성 김대건 안드레아 사제 순교자 대축일', 'red'],
      '8-15':  ['성모 승천 대축일', 'white'],
      '9-20':  ['한국 순교자 대축일', 'red'],
      '10-12': ['성 가롤로 아쿠티스 축일', 'white'],
      '11-1':  ['모든 성인 대축일', 'white'],
      '11-2':  ['위령의 날', 'violet'],
      '12-8':  ['원죄 없이 잉태되신 복되신 동정 마리아 대축일', 'white'],
      '12-25': ['주님 성탄 대축일', 'white']
    };
    const movable = [
      [-46, '재의 수요일', 'violet'],
      [-7, '주님 수난 성지 주일', 'red'],
      [-3, '주님 만찬 성목요일', 'white'],
      [-2, '주님 수난 성금요일', 'red'],
      [-1, '성토요일', 'violet'],
      [0, '주님 부활 대축일', 'white'],
      [7, '하느님의 자비 주일', 'white'],
      [42, '주님 승천 대축일', 'white'],
      [49, '성령 강림 대축일', 'red'],
      [56, '삼위일체 대축일', 'white'],
      [63, '그리스도의 성체 성혈 대축일', 'white'],
      [68, '지극히 거룩하신 예수 성심 대축일', 'white']
    ];
    for (let i = 0; i < movable.length; i++) {
      if (n === movable[i][0]) return { name: movable[i][1], color: movable[i][2] };
    }
    if (same(t, epiphany(y))) return { name: '주님 공현 대축일', color: 'white' };
    if (same(t, baptism(y))) return { name: '주님 세례 축일', color: 'white' };
    if (same(t, holyFamily(y))) return { name: '성가정 축일', color: 'white' };
    if (same(t, add(adv, -7))) return { name: '온 누리의 임금이신 우리 주 예수 그리스도왕 대축일', color: 'white' };
    if (same(t, add(adv, 14))) return { name: '대림 제3주일 · 기뻐하여라', color: 'rose' };
    if (same(t, add(E, -21))) return { name: '사순 제4주일 · 즐거워하여라', color: 'rose' };

    /* 성 요셉(3/19)과 주님 탄생 예고(3/25)는 주일·성주간과 겹치면 옮겨 지냅니다 */
    const joseph = (function () {
      let j = d0(y, 3, 19);
      const palm = add(E, -7);
      if (j >= palm && j < E) return add(palm, -1);
      if (j.getDay() === 0) return add(j, 1);
      return j;
    })();
    if (same(t, joseph)) return { name: '동정 마리아의 배필 성 요셉 대축일', color: 'white' };
    const annun = (function () {
      let a = d0(y, 3, 25);
      const palm = add(E, -7);
      if (a >= palm && a <= add(E, 7)) return add(E, 8);
      if (a.getDay() === 0) return add(a, 1);
      return a;
    })();
    if (same(t, annun)) return { name: '주님 탄생 예고 대축일', color: 'white' };

    const f = fixed[m + '-' + d];
    if (f) return { name: f[0], color: f[1] };
    return null;
  }

  /* 서울 세계청년대회 — 2027년 8월 3일 ~ 8일 */
  const WYD_FROM = d0(2027, 8, 3), WYD_TO = d0(2027, 8, 8);
  function wyd(t) {
    if (t < WYD_FROM) return { phase: 'before', days: diff(WYD_FROM, t), text: '서울 세계청년대회까지 D-' + diff(WYD_FROM, t) };
    if (t <= WYD_TO) return { phase: 'during', days: 0, text: '지금 서울에서 세계청년대회가 열리고 있습니다' };
    return null;
  }

  /* 그날 가롤로가 건네는 한마디 — 가르치지 않고, 오늘을 가리키기만 합니다 */
  function carloLine(info) {
    const sp = info.special ? info.special.name : '';
    if (/가롤로/.test(sp)) return '오늘 날 기억해 줘서 고마워. 그런데 오늘의 주인공은 내가 아니라 예수님이야.';
    if (/부활 대축일/.test(sp)) return '알렐루야! 오늘은 일 년 중 가장 기쁜 날이야.';
    if (/성탄/.test(sp)) return '아기 예수님이 오셨어. 오늘은 누구에게 따뜻한 말을 건네 볼까?';
    if (/성금요일/.test(sp)) return '오늘은 조용히 십자가를 바라보는 날이야.';
    if (/성체 성혈/.test(sp)) return '성체는 천국으로 가는 고속도로라고 했지? 오늘이 바로 그 축제야.';
    if (/재의 수요일/.test(sp)) return '오늘부터 사순 시기야. 거창한 것 말고, 작은 것 하나만 정해 보자.';
    if (/순교자/.test(sp)) return '이 땅의 신앙은 목숨을 건 사람들 덕분에 이어졌어.';
    if (info.sunday) return '오늘은 주일이야. 미사에서.';
    if (info.wyd && info.wyd.phase === 'during') return '지금 서울에 전 세계 친구들이 와 있어!';
    const s = info.season;
    if (s === 'advent') return '기다리는 것도 기도야.';
    if (s === 'lent') return '오늘 하나만 내려놓아 볼까?';
    if (s === 'easter') return '부활 시기에는 기뻐하는 것도 신앙이야.';
    if (s === 'christmas') return '하느님이 아기로 오셨다는 거, 생각할수록 신기하지 않아?';
    return '오늘도 예수님과 함께.';
  }

  /* 몇째 주인지 — “연중 제33주간 목요일”, “대림 제2주일” 처럼 */
  function weekName(t, s) {
    const y = t.getFullYear();
    const sun = add(t, -t.getDay());          // 이번 주의 주일
    const wd = WEEK[t.getDay()] + '요일';
    const E = easter(y), adv = advent1(y);
    let label = null, n = 0;
    if (s === 'advent') { label = '대림'; n = diff(sun, adv) / 7 + 1; }
    else if (s === 'lent') {
      n = diff(sun, add(E, -42)) / 7 + 1;
      if (n < 1) return t.getDay() === 0 ? null : '재의 수요일 후 ' + wd;
      label = '사순';
    } else if (s === 'easter') { label = '부활'; n = diff(sun, E) / 7 + 1; }
    else if (s === 'holyweek') return t.getDay() === 0 ? null : '성주간 ' + wd;
    else if (s === 'ordinary') {
      label = '연중';
      if (t < E) {
        const b = baptism(y);
        const base = b.getDay() === 0 ? b : epiphany(y);
        n = diff(sun, base) / 7 + 1;
      } else {
        n = 34 - diff(add(adv, -7), sun) / 7;
      }
    }
    if (!label || n < 1) return null;
    return t.getDay() === 0 ? label + ' 제' + n + '주일' : label + ' 제' + n + '주간 ' + wd;
  }

  function today(now) {
    const t = strip(now || new Date());
    const s = season(t);
    const sp = special(t);
    const sunday = t.getDay() === 0;
    let colorKey = sp ? sp.color : SEASON[s].color;
    const wk = weekName(t, s);
    const info = {
      date: t,
      dateText: (t.getMonth() + 1) + '월 ' + t.getDate() + '일 ' + WEEK[t.getDay()] + '요일',
      season: s,
      seasonName: SEASON[s].name,
      seasonLine: SEASON[s].line,
      special: sp,
      sunday: sunday,
      color: COLORS[colorKey],
      title: sp ? sp.name : (wk || SEASON[s].name),
      wyd: wyd(t)
    };
    info.carlo = carloLine(info);
    return info;
  }

  /* 오늘의 말씀 — 날짜마다 한 장. 성경·가롤로·성인의 말 가운데서 고릅니다 */
  function word(now) {
    const t = strip(now || new Date());
    const pool = (window.COLLECTION && COLLECTION.cards || []).filter(c => c.cat !== 'journey');
    if (!pool.length) return null;
    const n = Math.floor(t.getTime() / DAY) + 3;
    /* 바로 이웃한 날에 같은 범주가 겹치지 않도록 크게 건너뜁니다 */
    return pool[(n * 7) % pool.length];
  }

  /* 날짜를 ‘YYYY-MM-DD’ 로 — 저장할 때 씁니다 */
  function key(now) {
    const t = strip(now || new Date());
    const p = (v) => (v < 10 ? '0' : '') + v;
    return t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate());
  }

  return { today, word, key, easter, advent1, season, special, COLORS };
})();
