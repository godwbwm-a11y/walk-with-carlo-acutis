/* 동네 풍경 — 도시, 학교, 성당을 더 촘촘하고 사실적으로.

   두 가지를 합니다.
   1) 자주 보이는 건물(집, 빌라, 편의점, 성당 정면, 학교 정문, 자동차)을
      재질이 보이게 다시 그립니다 — 벽돌 한 장 한 장, 미장벽의 결, 기와 줄,
      창틀과 유리에 비친 하늘, 커튼, 실외기, 빗물받이, 처마 밑 그늘, 바닥에 닿는 그림자.
      (Props 에 같은 이름으로 넣으면 TextureFactory 가 이쪽 그림을 씁니다. 크기·발 위치는 그대로)
   2) 길 장면의 배경을 만듭니다 — 먼 산과 아파트 단지, 옥상 물탱크가 보이는 동네 지붕,
      보도블록, 화강석 연석, 아스팔트, 운동장 모래. 가로로 끝없이 이어 붙일 수 있게 그립니다.
      장면은 Townscape.street(...) 한 줄로 깔 수 있습니다.

   빛은 늘 왼쪽 위에서. 먼 것일수록 하늘빛에 묻힙니다(공기 원근). 외부 그림은 쓰지 않습니다. */

window.Townscape = (function () {
  const B = Props.brush;
  const rr = B.rr, lg = B.lg, rg = B.rg, box = B.box, ell = B.ell, line = B.line;

  /* ── 붓 ─────────────────────────────────── */
  function rgb(hex) { return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]; }
  function css(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a === undefined ? 1 : a) + ')'; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function shade(c, k) { return k < 0 ? mix(c, [30, 22, 18], -k) : mix(c, [255, 250, 240], k); }

  /* 재질의 잔결 — 밝은 점과 어두운 점을 흩뿌립니다 */
  function speckle(c, x, y, w, h, rnd, n, dark, light, size) {
    size = size || 1;
    for (let i = 0; i < n; i++) {
      c.fillStyle = rnd() < 0.5 ? dark : light;
      c.fillRect(x + rnd() * w, y + rnd() * h, size * (0.6 + rnd() * 0.8), size * (0.6 + rnd() * 0.8));
    }
  }
  /* 창 밑으로 흘러내린 빗물 자국 */
  function streaks(c, x, y, w, len, rnd, a) {
    for (let i = 0; i < 3; i++) {
      const xx = x + rnd() * w, l = len * (0.5 + rnd() * 0.5);
      c.fillStyle = lg(c, 0, y, 0, y + l, [[0, 'rgba(70,60,50,' + (a || 0.12) + ')'], [1, 'rgba(70,60,50,0)']]);
      c.fillRect(xx, y, 0.8 + rnd() * 1.4, l);
    }
  }
  /* 미장벽 — 위는 밝고 아래로 가라앉으며, 잔결이 있습니다 */
  function plaster(c, x, y, w, h, rnd, base, opt) {
    opt = opt || {};
    const b = rgb(base);
    c.fillStyle = lg(c, x, y, x + w * 0.6, y + h, [[0, css(shade(b, 0.1))], [1, css(shade(b, -0.12))]]);
    c.fillRect(x, y, w, h);
    speckle(c, x, y, w, h, rnd, Math.round(w * h / 9), css(shade(b, -0.25), 0.22), css(shade(b, 0.35), 0.25));
    if (opt.lines) for (let yy = y + opt.lines; yy < y + h; yy += opt.lines) line(c, x, yy, x + w, yy, 0.5, css(shade(b, -0.3), 0.25));
  }
  /* 벽돌벽 — 한 장씩 색이 조금 다르고, 줄눈 그늘과 윗면 빛이 있습니다 */
  function bricks(c, x, y, w, h, rnd, base, bw, bh, mortar) {
    bw = bw || 7; bh = bh || 3;
    const b = rgb(base);
    c.fillStyle = mortar || css(shade(b, 0.45));
    c.fillRect(x, y, w, h);
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    for (let r = 0, yy = y; yy < y + h; r++, yy += bh) {
      for (let xx = x - (r % 2 ? bw / 2 : 0); xx < x + w; xx += bw) {
        const v = (rnd() - 0.5) * 0.28;
        const col = shade(b, v - (rnd() < 0.08 ? 0.15 : 0));
        c.fillStyle = css(col);
        c.fillRect(xx + 0.35, yy + 0.35, bw - 0.7, bh - 0.7);
        c.fillStyle = css(shade(col, 0.25), 0.5); c.fillRect(xx + 0.35, yy + 0.35, bw - 0.7, 0.4);
        c.fillStyle = css(shade(col, -0.3), 0.45); c.fillRect(xx + 0.35, yy + bh - 0.75, bw - 0.7, 0.4);
      }
    }
    c.restore();
    /* 벽 전체에 닿는 빛 */
    c.fillStyle = lg(c, x, y, x + w, y + h, [[0, 'rgba(255,245,225,0.12)'], [1, 'rgba(30,20,15,0.14)']]);
    c.fillRect(x, y, w, h);
  }
  /* 외벽 타일 — 빌라에 흔한 작은 직사각 타일 */
  function tiles(c, x, y, w, h, rnd, base, tw, th) {
    tw = tw || 6; th = th || 2.6;
    const b = rgb(base);
    c.fillStyle = css(shade(b, -0.18)); c.fillRect(x, y, w, h);
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    for (let yy = y; yy < y + h; yy += th) for (let xx = x; xx < x + w; xx += tw) {
      c.fillStyle = css(shade(b, (rnd() - 0.5) * 0.12));
      c.fillRect(xx + 0.25, yy + 0.25, tw - 0.5, th - 0.5);
    }
    c.restore();
    c.fillStyle = lg(c, x, y, x + w, y, [[0, 'rgba(255,248,235,0.12)'], [1, 'rgba(30,20,15,0.12)']]);
    c.fillRect(x, y, w, h);
  }
  /* 창 — 틀, 하늘이 비친 유리, 방 안의 어둠이나 불빛, 커튼, 창턱과 그 아래 그늘 */
  function windowUnit(c, x, y, w, h, rnd, opt) {
    opt = opt || {};
    const frame = opt.frame || '#eef0ee';
    /* 창 둘레 그늘(벽이 들어간 깊이) */
    c.fillStyle = 'rgba(40,30,25,0.28)'; c.fillRect(x - 1, y - 1, w + 2, h + 2);
    box(c, x - 0.6, y - 0.6, w + 1.2, h + 1.2, 0.6, frame);
    const gx = x + 1, gy = y + 1, gw = w - 2, gh = h - 2;
    if (opt.lit) {
      c.fillStyle = rg(c, gx + gw / 2, gy + gh * 0.7, 1, Math.max(gw, gh), [[0, '#fff0c6'], [0.6, '#f3c27f'], [1, '#d99356']]);
    } else {
      c.fillStyle = lg(c, 0, gy, 0, gy + gh, [[0, '#b9d2df'], [0.45, '#7f9fb2'], [1, '#3f5663']]);
    }
    c.fillRect(gx, gy, gw, gh);
    /* 커튼 */
    if (opt.curtain) {
      c.fillStyle = opt.lit ? 'rgba(250,236,210,0.75)' : 'rgba(235,228,214,0.8)';
      c.fillRect(gx, gy, gw * 0.32, gh); c.fillRect(gx + gw * 0.72, gy, gw * 0.28, gh);
      c.fillStyle = 'rgba(160,140,110,0.25)';
      for (let i = 1; i < 3; i++) { c.fillRect(gx + gw * 0.32 * i / 3, gy, 0.5, gh); c.fillRect(gx + gw * 0.72 + gw * 0.28 * i / 3, gy, 0.5, gh); }
    }
    /* 유리의 빛 */
    c.save(); c.beginPath(); c.rect(gx, gy, gw, gh); c.clip();
    c.fillStyle = 'rgba(255,255,255,' + (opt.lit ? 0.14 : 0.3) + ')';
    c.beginPath(); c.moveTo(gx + gw * 0.1, gy + gh); c.lineTo(gx + gw * 0.55, gy); c.lineTo(gx + gw * 0.78, gy); c.lineTo(gx + gw * 0.33, gy + gh); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(gx, gy, gw, gh * 0.18);
    c.restore();
    /* 창살(가로·세로) */
    const mull = opt.mullion === undefined ? 1 : opt.mullion;
    for (let i = 1; i <= mull; i++) line(c, gx + gw * i / (mull + 1), gy, gx + gw * i / (mull + 1), gy + gh, 0.9, frame);
    if (opt.transom) line(c, gx, gy + gh * 0.3, gx + gw, gy + gh * 0.3, 0.9, frame);
    /* 방범창(쇠창살) */
    if (opt.grille) for (let xx = gx + 2; xx < gx + gw; xx += 2.6) line(c, xx, gy, xx, gy + gh, 0.45, 'rgba(70,72,78,0.85)');
    /* 창턱과 그 아래 그늘 */
    box(c, x - 1.5, y + h, w + 3, 1.6, 0.4, opt.sill || '#dcd6ca');
    c.fillStyle = 'rgba(40,30,25,0.2)'; c.fillRect(x - 1, y + h + 1.6, w + 2, 1.4);
    if (opt.stain) streaks(c, x, y + h + 3, w, 10, rnd, 0.1);
  }
  /* 실외기 */
  function acUnit(c, x, y, s) {
    s = s || 1;
    box(c, x, y, 13 * s, 9 * s, 1, lg(c, 0, y, 0, y + 9 * s, [[0, '#f2f1ec'], [1, '#c9c7c0']]));
    ell(c, x + 4.6 * s, y + 4.5 * s, 3.2 * s, 3.2 * s, '#8d8f90');
    for (let i = 0; i < 4; i++) line(c, x + 1.6 * s, y + (1.5 + i * 2) * s, x + 7.6 * s, y + (1.5 + i * 2) * s, 0.4, 'rgba(60,60,60,0.5)');
    c.fillStyle = 'rgba(40,30,25,0.22)'; c.fillRect(x + 1, y + 9 * s, 13 * s, 1.2);
  }
  /* 옥상 물탱크 — 초록 원통 */
  function waterTank(c, x, y, s, col) {
    s = s || 1; col = col || '#5f9a7a';
    c.fillStyle = lg(c, x, 0, x + 12 * s, 0, [[0, shadeHex(col, 0.25)], [0.4, col], [1, shadeHex(col, -0.35)]]);
    c.fillRect(x, y, 12 * s, 9 * s);
    ell(c, x + 6 * s, y, 6 * s, 1.6 * s, shadeHex(col, 0.3));
    line(c, x, y + 3 * s, x + 12 * s, y + 3 * s, 0.5, 'rgba(0,0,0,0.2)');
    line(c, x, y + 6 * s, x + 12 * s, y + 6 * s, 0.5, 'rgba(0,0,0,0.2)');
    box(c, x + 1, y + 9 * s, 10 * s, 1.4, 0.3, '#6b6e70');
  }
  function shadeHex(hex, k) { return css(shade(rgb(parseInt(String(hex).replace('#', ''), 16)), k)); }
  /* 난간 */
  function railing(c, x, y, w, h, col) {
    col = col || 'rgba(70,74,80,0.9)';
    line(c, x, y, x + w, y, 1.1, col);
    for (let xx = x + 1; xx < x + w; xx += 2.2) line(c, xx, y, xx, y + h, 0.5, col);
    line(c, x, y + h, x + w, y + h, 0.7, col);
  }
  /* 빗물받이 홈통 */
  function downpipe(c, x, y0, y1) {
    c.fillStyle = lg(c, x, 0, x + 2.4, 0, [[0, '#d7d9da'], [1, '#8e9294']]);
    c.fillRect(x, y0, 2.4, y1 - y0);
    for (let yy = y0 + 12; yy < y1; yy += 22) box(c, x - 0.6, yy, 3.6, 1.2, 0.3, '#7e8284');
  }
  /* 처마·차양 밑 그늘 */
  function eaveShadow(c, x, y, w, d) {
    c.fillStyle = lg(c, 0, y, 0, y + d, [[0, 'rgba(30,20,15,0.32)'], [1, 'rgba(30,20,15,0)']]);
    c.fillRect(x, y, w, d);
  }
  /* 땅에 닿는 곳의 어둠 */
  function groundAO(c, x, y, w, d) {
    c.fillStyle = lg(c, 0, y - d, 0, y, [[0, 'rgba(30,20,15,0)'], [1, 'rgba(30,20,15,0.3)']]);
    c.fillRect(x, y - d, w, d);
  }
  /* 간판 글자 — 캔버스 글꼴은 아직 불러오지 않았을 수 있어 기본 고딕으로 */
  function signText(c, text, x, y, size, col, weight) {
    c.save();
    c.font = (weight || '700') + ' ' + size + 'px "Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillText(text, x + 0.5, y + 0.6);
    c.fillStyle = col; c.fillText(text, x, y);
    c.restore();
  }

  /* ══ 1. 건물 ═════════════════════════════════ */

  /* 이층 단독주택 — 아래층은 붉은 벽돌, 위층은 미색 미장, 짙은 회색 기와지붕 */
  Props.add('house_a', function (c, w, h, rnd) {
    /* 위층 미장벽 */
    plaster(c, 4, 34, 112, 58, rnd, 0xe6d8bf);
    /* 아래층 벽돌 */
    bricks(c, 4, 92, 112, 52, rnd, 0xa45a43, 7, 3);
    /* 층 사이 띠 */
    box(c, 2, 90, 116, 3.4, 0.6, lg(c, 0, 90, 0, 93.4, [[0, '#efe8da'], [1, '#bfb5a2']]));
    eaveShadow(c, 4, 93.4, 112, 4);
    /* 지붕 — 기와 줄마다 그늘 */
    c.beginPath(); c.moveTo(-4, 36); c.lineTo(124, 36); c.lineTo(100, 6); c.lineTo(20, 6); c.closePath();
    c.fillStyle = lg(c, 0, 6, 0, 36, [[0, '#5c6670'], [1, '#3b434c']]); c.fill();
    c.save(); c.clip();
    for (let y = 8; y < 36; y += 3.2) {
      line(c, -4, y, 124, y, 0.9, 'rgba(20,24,30,0.55)');
      line(c, -4, y + 0.9, 124, y + 0.9, 0.5, 'rgba(200,210,220,0.22)');
      for (let x = (y % 6.4 < 3.2 ? 0 : 2.5); x < 124; x += 5) line(c, x, y, x, y + 3.2, 0.4, 'rgba(20,24,30,0.3)');
    }
    c.fillStyle = lg(c, 0, 0, 120, 0, [[0, 'rgba(255,255,255,0.12)'], [1, 'rgba(0,0,0,0.12)']]); c.fillRect(-4, 6, 128, 30);
    c.restore();
    box(c, -5, 34.5, 130, 3, 0.8, '#2f353b');                    // 처마 끝
    box(c, 18, 4.6, 84, 2.4, 0.6, '#2f353b');                    // 용마루
    eaveShadow(c, 4, 37.5, 112, 6);
    /* 위층 창 둘, 베란다 난간 */
    windowUnit(c, 14, 48, 30, 26, rnd, { lit: true, curtain: true, mullion: 1, stain: true });
    windowUnit(c, 68, 46, 38, 30, rnd, { curtain: true, mullion: 2, transom: true });
    railing(c, 64, 66, 46, 10);
    acUnit(c, 48, 76, 0.9);
    /* 아래층 — 방범창 창, 현관 */
    windowUnit(c, 12, 102, 28, 22, rnd, { grille: true, mullion: 1, frame: '#e3e1db' });
    /* 현관 차양과 문 */
    box(c, 62, 96, 50, 4, 1, lg(c, 0, 96, 0, 100, [[0, '#5c6670'], [1, '#353c44']]));
    eaveShadow(c, 64, 100, 46, 5);
    box(c, 70, 102, 34, 42, 1, '#3d2a1c');
    B.plank(c, 72, 104, 30, 40, 1, '#8a5e3b', '#a47650', '#6b4529', rnd, 1);
    B.grain(c, 72, 104, 30, 40, rnd, 'rgba(50,28,12,0.25)', 7, true);
    box(c, 75, 108, 24, 12, 0.8, 'rgba(70,46,30,0.5)');
    box(c, 75, 124, 24, 14, 0.8, 'rgba(70,46,30,0.5)');
    box(c, 96, 121, 2.2, 6, 0.8, '#d8c08a');
    /* 문패·우편함·가스계량기 */
    box(c, 106, 108, 7, 4, 0.6, '#efe7d4'); line(c, 107, 110, 112, 110, 0.5, '#7b6a52');
    box(c, 46, 104, 10, 12, 1, '#c9cbc8'); box(c, 47.5, 106, 7, 4, 0.5, '#e8eae6');
    /* 빗물받이 */
    downpipe(c, 113, 38, 144);
    /* 화분 */
    [[50, 140, '#7da36a'], [58, 141, '#e9846c']].forEach(function (p) {
      box(c, p[0] - 3.5, p[1] - 3, 7, 5, 1, '#b46b4c');
      ell(c, p[0], p[1] - 5, 4.2, 3.4, p[2]); ell(c, p[0] - 1, p[1] - 6, 2, 1.6, 'rgba(255,255,255,0.25)');
    });
    /* 기단과 바닥 */
    box(c, 0, 144, 120, 6, 0.6, lg(c, 0, 144, 0, 150, [[0, '#b9b2a6'], [1, '#8f887c']]));
    groundAO(c, 4, 144, 112, 8);
  });

  /* 다섯 층 빌라 — 붉은 벽돌과 미색 타일, 베란다, 옥상 물탱크 */
  Props.add('house_b', function (c, w, h, rnd) {
    /* 옥상 */
    waterTank(c, 64, 3, 1.4, '#4f8f74');
    box(c, 10, 6, 22, 12, 1, lg(c, 0, 6, 0, 18, [[0, '#d9d6cf'], [1, '#aaa59b']]));    // 계단실
    box(c, 0, 16, 100, 4, 0.6, '#c9c3b6');
    /* 몸통 — 가운데 계단 창 기둥은 타일, 양옆은 벽돌 */
    bricks(c, 0, 20, 100, 148, rnd, 0x9c5540, 6, 2.6);
    tiles(c, 40, 20, 20, 148, rnd, 0xe8e0d0, 5, 2.4);
    /* 층 띠 */
    for (let f = 0; f < 5; f++) {
      const y = 20 + f * 29.6;
      box(c, 0, y + 27.6, 100, 2, 0.4, lg(c, 0, y + 27.6, 0, y + 29.6, [[0, '#e6dfd0'], [1, '#b0a794']]));
      /* 양쪽 창 */
      windowUnit(c, 7, y + 6, 26, 17, rnd, { lit: (f + 1) % 3 === 0, curtain: f % 2 === 0, mullion: 1, stain: f < 4 });
      windowUnit(c, 67, y + 6, 26, 17, rnd, { lit: f === 1, curtain: f % 2 === 1, mullion: 1, stain: f < 4 });
      /* 가운데 계단 창 */
      windowUnit(c, 45, y + 4, 10, 20, rnd, { mullion: 0, frame: '#d9dbd8' });
      if (f % 2 === 0) acUnit(c, 34, y + 15, 0.62); else acUnit(c, 58.5, y + 15, 0.62);
    }
    /* 1층 필로티 — 주차 공간의 어둠 */
    c.fillStyle = lg(c, 0, 140, 0, 168, [[0, '#2c2a28'], [1, '#4a4640']]); c.fillRect(4, 142, 34, 26); c.fillRect(62, 142, 34, 26);
    eaveShadow(c, 4, 142, 34, 6); eaveShadow(c, 62, 142, 34, 6);
    box(c, 44, 146, 12, 22, 0.8, lg(c, 0, 146, 0, 168, [[0, '#b7c7cf'], [1, '#6d7f8a']]));    // 유리 현관문
    line(c, 50, 146, 50, 168, 0.6, '#d9dbd8');
    downpipe(c, 96.5, 20, 168);
    /* 바닥 */
    box(c, 0, 168, 100, 8, 0.4, lg(c, 0, 168, 0, 176, [[0, '#a7a196'], [1, '#7d776d']]));
    groundAO(c, 0, 168, 100, 6);
  });

  /* 동네 편의점 — 초록 간판, 유리창 너머 환한 냉장고와 선반 */
  Props.add('store_front', function (c, w, h, rnd) {
    /* 위층 벽 */
    tiles(c, 0, 0, 190, 22, rnd, 0xd9d3c6, 7, 3);
    /* 간판 */
    box(c, 0, 18, 190, 18, 0, lg(c, 0, 18, 0, 36, [[0, '#3fa58b'], [1, '#257562']]));
    c.fillStyle = 'rgba(255,255,255,0.28)'; c.fillRect(0, 19, 190, 1.4);
    box(c, 6, 21, 22, 12, 2, '#f6f2e8'); signText(c, '24', 17, 27.4, 9, '#2a8a72', '800');
    signText(c, '우리동네 편의점', 104, 27.4, 11, '#ffffff', '800');
    /* 어닝 그늘 */
    eaveShadow(c, 0, 36, 190, 9);
    /* 유리창 프레임 */
    box(c, 0, 36, 190, 96, 0, '#cfd3d6');
    [[6, 40, 76], [108, 40, 76]].forEach(function (p) {
      const x = p[0], y = p[1], ww = p[2], hh = 86;
      /* 가게 안 — 밝은 형광등 빛 */
      c.fillStyle = lg(c, 0, y, 0, y + hh, [[0, '#fbfbf4'], [1, '#e6e4d8']]); c.fillRect(x, y, ww, hh);
      /* 천장 등 */
      for (let k = 0; k < 2; k++) box(c, x + 8 + k * 36, y + 3, 26, 2, 1, '#ffffff');
      /* 냉장고 — 유리문과 음료 */
      const fx = x + 2, fw = ww - 4;
      box(c, fx, y + 10, fw, 30, 1, '#dfe6ea');
      for (let s = 0; s < 3; s++) {
        const sy = y + 13 + s * 9;
        for (let k = 0; k < 11; k++) {
          const cols = ['#e05a4c', '#f2b23e', '#4f9fd8', '#6bb36b', '#f6f2e8', '#9b6bb8', '#e98a5c'];
          box(c, fx + 2 + k * (fw - 4) / 11, sy, (fw - 4) / 11 - 1.2, 7, 0.8, cols[(k * 3 + s * 2 + (x > 50 ? 1 : 0)) % cols.length]);
        }
      }
      for (let k = 1; k < 3; k++) line(c, fx + fw * k / 3, y + 10, fx + fw * k / 3, y + 40, 0.8, '#aab3b8');
      /* 진열대 */
      for (let s = 0; s < 3; s++) {
        const sy = y + 50 + s * 12;
        box(c, x + 3, sy + 7, ww - 6, 1.6, 0.4, '#b8b2a4');
        for (let k = 0; k < 9; k++) {
          const cols = ['#f0c45a', '#e57a5a', '#7fb3d6', '#c96d9b', '#88b86d', '#f2e5c8'];
          box(c, x + 5 + k * (ww - 10) / 9, sy + 1 - rnd() * 2, (ww - 10) / 9 - 1.4, 6 + rnd() * 2, 0.6, cols[(k + s * 2) % cols.length]);
        }
      }
      /* 유리 반사와 붙은 포스터 */
      c.save(); c.beginPath(); c.rect(x, y, ww, hh); c.clip();
      c.fillStyle = 'rgba(200,225,235,0.22)'; c.fillRect(x, y, ww, hh);
      c.fillStyle = 'rgba(255,255,255,0.4)';
      c.beginPath(); c.moveTo(x + 6, y + hh); c.lineTo(x + 40, y); c.lineTo(x + 54, y); c.lineTo(x + 20, y + hh); c.fill();
      c.restore();
      box(c, x + 4, y + hh - 22, 16, 18, 1, x < 50 ? '#f6d65e' : '#f28c6e');
      signText(c, x < 50 ? '1+1' : '할인', x + 12, y + hh - 13, 6, '#3b2a1a', '800');
      box(c, x - 1, y - 1, ww + 2, hh + 2, 0, 'rgba(0,0,0,0)');
      c.strokeStyle = '#9aa1a6'; c.lineWidth = 1.6; c.strokeRect(x, y, ww, hh);
    });
    /* 가운데 출입문 — 밀고 당기는 손잡이 */
    box(c, 84, 40, 22, 92, 0, lg(c, 0, 40, 0, 132, [[0, '#e9f1f2'], [1, '#c7d3d6']]));
    c.strokeStyle = '#8d959a'; c.lineWidth = 1.6; c.strokeRect(84, 40, 22, 92);
    box(c, 100, 78, 2, 16, 0.6, '#b8bec2');
    signText(c, 'PUSH', 95, 72, 4.4, '#6d777c', '700');
    /* 아래 턱과 매트 */
    box(c, 0, 132, 190, 8, 0, lg(c, 0, 132, 0, 140, [[0, '#9aa3a8'], [1, '#6d767c']]));
    box(c, 82, 134, 26, 4, 1, '#3f4a52');
    groundAO(c, 0, 132, 190, 5);
  });

  /* 본당 성당 — 붉은 벽돌 정면, 돌 테두리, 장미창, 종탑 십자가 */
  Props.add('church_front', function (c, w, h, rnd) {
    /* 벽 */
    bricks(c, 20, 80, 180, 166, rnd, 0x9e523c, 7, 3.1);
    /* 모서리 돌기둥 */
    [[14, 80], [192, 80]].forEach(function (p) {
      plaster(c, p[0], p[1], 14, 166, rnd, 0xe5dccb);
      for (let y = p[1] + 4; y < 246; y += 12) { line(c, p[0], y, p[0] + 14, y, 0.6, 'rgba(120,100,80,0.35)'); }
      c.fillStyle = lg(c, p[0], 0, p[0] + 14, 0, [[0, 'rgba(255,255,255,0.12)'], [1, 'rgba(0,0,0,0.15)']]); c.fillRect(p[0], p[1], 14, 166);
    });
    /* 박공 — 벽돌과 돌 테두리 */
    c.save();
    c.beginPath(); c.moveTo(12, 86); c.lineTo(208, 86); c.lineTo(110, 26); c.closePath(); c.clip();
    bricks(c, 10, 24, 200, 64, rnd, 0x9a4f3a, 7, 3.1);
    c.restore();
    c.beginPath(); c.moveTo(6, 88); c.lineTo(110, 22); c.lineTo(214, 88);
    c.lineWidth = 5; c.strokeStyle = '#e2d8c6'; c.stroke();
    c.lineWidth = 1; c.strokeStyle = 'rgba(90,70,50,0.45)'; c.stroke();
    box(c, 14, 84, 192, 5, 0.6, lg(c, 0, 84, 0, 89, [[0, '#efe7d8'], [1, '#b9ad97']]));
    eaveShadow(c, 20, 89, 180, 6);
    /* 장미창 */
    ell(c, 110, 60, 15, 15, '#e2d8c6');
    ell(c, 110, 60, 12.5, 12.5, '#3e3328');
    const rose = ['#3f74b8', '#d94a3c', '#e8b23a', '#4f9b6b', '#7a5aa8', '#e8e0c8'];
    for (let i = 0; i < 12; i++) {
      c.beginPath(); c.moveTo(110, 60); c.arc(110, 60, 11, i * Math.PI / 6 + 0.04, (i + 1) * Math.PI / 6 - 0.04); c.closePath();
      c.fillStyle = rose[i % rose.length]; c.fill();
    }
    ell(c, 110, 60, 4.2, 4.2, '#e2d8c6'); ell(c, 110, 60, 2.4, 2.4, '#f6e4a8');
    c.fillStyle = 'rgba(255,255,255,0.22)'; c.beginPath(); c.arc(110, 60, 11, Math.PI * 1.05, Math.PI * 1.6); c.lineTo(110, 60); c.fill();
    /* 꼭대기 십자가 — 금속 */
    box(c, 107.5, 0, 5, 26, 1, lg(c, 107.5, 0, 112.5, 0, [[0, '#f4efe2'], [1, '#a9a294']]));
    box(c, 99, 7, 22, 4.6, 1, lg(c, 0, 7, 0, 11.6, [[0, '#f4efe2'], [1, '#a9a294']]));
    /* 옆 창 — 돌 아치 테두리와 스테인드글라스 */
    function lancet(x, y, ww, hh) {
      c.beginPath(); c.moveTo(x - 2.4, y + hh + 1); c.lineTo(x - 2.4, y + ww / 2); c.arc(x + ww / 2, y + ww / 2, ww / 2 + 2.4, Math.PI, 0); c.lineTo(x + ww + 2.4, y + hh + 1); c.closePath();
      c.fillStyle = '#e2d8c6'; c.fill();
      c.beginPath(); c.moveTo(x, y + hh); c.lineTo(x, y + ww / 2); c.arc(x + ww / 2, y + ww / 2, ww / 2, Math.PI, 0); c.lineTo(x + ww, y + hh); c.closePath();
      c.fillStyle = '#2f2820'; c.fill();
      c.save(); c.clip();
      const cols = ['#3f74b8', '#d94a3c', '#e8b23a', '#4f9b6b', '#7a5aa8'];
      for (let r = 0; r < Math.ceil(hh / 5); r++) for (let k = 0; k < Math.ceil(ww / 4.4); k++) {
        c.fillStyle = cols[(r * 3 + k * 2) % cols.length];
        c.globalAlpha = 0.78 + rnd() * 0.22;
        c.fillRect(x + k * 4.4 + 0.4, y + r * 5 + 0.4, 3.6, 4.2);
      }
      c.globalAlpha = 1;
      c.fillStyle = lg(c, x, y, x + ww, y + hh, [[0, 'rgba(255,255,255,0.25)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0.25)']]);
      c.fillRect(x, y, ww, hh);
      c.restore();
      box(c, x - 4, y + hh + 1, ww + 8, 2.6, 0.5, '#d9cfbc');
      eaveShadow(c, x - 3, y + hh + 3.6, ww + 6, 3);
    }
    lancet(40, 112, 22, 54);
    lancet(158, 112, 22, 54);
    lancet(92, 102, 36, 60);
    /* 정문 — 돌 아치, 나무문, 위쪽 반원 유리 */
    c.beginPath(); c.moveTo(68, 246); c.lineTo(68, 202); c.arc(110, 202, 42, Math.PI, 0); c.lineTo(152, 246); c.closePath();
    c.fillStyle = '#e2d8c6'; c.fill();
    for (let i = 0; i <= 10; i++) {               // 아치 돌
      const a = Math.PI + i * Math.PI / 10;
      line(c, 110 + Math.cos(a) * 36, 202 + Math.sin(a) * 36, 110 + Math.cos(a) * 42, 202 + Math.sin(a) * 42, 0.6, 'rgba(110,90,70,0.45)');
    }
    c.beginPath(); c.moveTo(74, 246); c.lineTo(74, 202); c.arc(110, 202, 36, Math.PI, 0); c.lineTo(146, 246); c.closePath();
    c.fillStyle = '#2a1c12'; c.fill();
    c.beginPath(); c.arc(110, 202, 33, Math.PI, 0); c.closePath();
    c.fillStyle = rg(c, 110, 202, 2, 34, [[0, '#ffe2a8'], [1, '#c98a4a']]); c.fill();
    for (let i = 1; i < 6; i++) { const a = Math.PI + i * Math.PI / 6; line(c, 110, 202, 110 + Math.cos(a) * 33, 202 + Math.sin(a) * 33, 0.8, '#4a3624'); }
    B.plank(c, 77, 204, 31, 42, 1, '#7a4e2e', '#94643f', '#5c3a20', rnd, 1);
    B.plank(c, 112, 204, 31, 42, 1, '#7a4e2e', '#94643f', '#5c3a20', rnd, 1);
    B.grain(c, 77, 204, 31, 42, rnd, 'rgba(40,22,10,0.28)', 6, true);
    B.grain(c, 112, 204, 31, 42, rnd, 'rgba(40,22,10,0.28)', 6, true);
    [[80, 208], [115, 208], [80, 226], [115, 226]].forEach(function (p) { box(c, p[0], p[1], 25, 14, 0.8, 'rgba(50,30,15,0.35)'); });
    for (let k = 0; k < 6; k++) { ell(c, 80 + k * 5, 218, 0.8, 0.8, '#2e2a26'); ell(c, 115 + k * 5, 218, 0.8, 0.8, '#2e2a26'); }
    box(c, 105, 222, 2, 8, 0.6, '#d8c08a'); box(c, 113, 222, 2, 8, 0.6, '#d8c08a');
    /* 문 위 성모상 자리 (작은 감실) */
    c.beginPath(); c.moveTo(103, 176); c.lineTo(103, 168); c.arc(110, 168, 7, Math.PI, 0); c.lineTo(117, 176); c.closePath();
    c.fillStyle = '#4a3a2e'; c.fill();
    ell(c, 110, 166, 2.2, 2.4, '#f2ede2'); box(c, 107.6, 168, 4.8, 7, 1.6, '#e7eef6');
    /* 계단 */
    box(c, 54, 242, 112, 4, 0.5, '#d9d2c4'); box(c, 46, 246, 128, 4, 0.5, '#c9c1b2');
    groundAO(c, 20, 246, 180, 5);
  });

  /* 학교 정문 — 화강석 기둥, 학교 이름 판, 미닫이 쇠문 */
  Props.add('school_gate', function (c, w, h, rnd) {
    /* 기둥 */
    [[0, 18], [130, 18]].forEach(function (p) {
      const x = p[0];
      c.fillStyle = lg(c, x, 0, x + 20, 0, [[0, '#d9d4ca'], [0.5, '#c6c0b4'], [1, '#9e978a']]); c.fillRect(x, p[1], 20, 112);
      speckle(c, x, p[1], 20, 112, rnd, 260, 'rgba(70,65,60,0.35)', 'rgba(255,255,255,0.4)');
      for (let y = p[1] + 22; y < 130; y += 22) line(c, x, y, x + 20, y, 0.6, 'rgba(80,70,60,0.4)');
      box(c, x - 2, p[1] - 4, 24, 6, 1, lg(c, 0, p[1] - 4, 0, p[1] + 2, [[0, '#ebe7de'], [1, '#aaa396']]));
    });
    /* 이름 판 */
    box(c, 26, 4, 98, 20, 2, lg(c, 0, 4, 0, 24, [[0, '#3c4a56'], [1, '#263039']]));
    box(c, 28, 6, 94, 16, 1.4, 'rgba(255,255,255,0.05)');
    signText(c, '한빛중학교', 75, 14.4, 10, '#f3e6c4', '800');
    /* 미닫이 쇠문 — 뒤로 운동장이 비쳐 보입니다 */
    c.fillStyle = lg(c, 0, 30, 0, 128, [[0, 'rgba(200,210,190,0.0)'], [1, 'rgba(140,130,110,0.18)']]); c.fillRect(20, 30, 110, 98);
    line(c, 22, 36, 128, 36, 2.4, '#5d6a75'); line(c, 22, 120, 128, 120, 2.4, '#5d6a75'); line(c, 22, 78, 128, 78, 1.2, '#6d7a85');
    for (let x = 26; x < 128; x += 7) {
      line(c, x, 34, x, 122, 1.6, '#55626d');
      line(c, x - 0.6, 34, x - 0.6, 122, 0.5, 'rgba(255,255,255,0.35)');
      c.beginPath(); c.moveTo(x - 1.6, 34); c.lineTo(x, 30); c.lineTo(x + 1.6, 34); c.fillStyle = '#55626d'; c.fill();
    }
    /* 바퀴와 레일 */
    [[34, 124], [116, 124]].forEach(function (p) { ell(c, p[0], p[1], 3, 3, '#3a4148'); ell(c, p[0], p[1], 1.2, 1.2, '#8a939a'); });
    box(c, 18, 127, 114, 3, 0.4, '#6f737a');
    groundAO(c, 0, 130, 150, 6);
  });

  /* 승용차 — 옆모습, 차체의 곡면 빛, 유리, 휠 */
  Props.add('car_side', function (c, w, h, rnd) {
    const body = [214, 220, 226];
    /* 차체 실루엣 */
    c.beginPath();
    c.moveTo(4, 44); c.quadraticCurveTo(2, 30, 14, 27);
    c.lineTo(30, 24); c.quadraticCurveTo(40, 8, 56, 6); c.lineTo(84, 6); c.quadraticCurveTo(98, 8, 106, 22);
    c.lineTo(120, 25); c.quadraticCurveTo(128, 28, 127, 40); c.lineTo(126, 48); c.lineTo(6, 48); c.closePath();
    c.fillStyle = lg(c, 0, 6, 0, 48, [[0, css(shade(body, 0.3))], [0.45, css(body)], [0.55, css(shade(body, -0.12))], [1, css(shade(body, -0.4))]]); c.fill();
    c.save(); c.clip();
    /* 옆면 반사선 */
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(0, 30, 130, 1.2);
    c.fillStyle = 'rgba(70,80,90,0.25)'; c.fillRect(0, 38, 130, 1);
    c.restore();
    /* 유리 */
    c.beginPath(); c.moveTo(36, 25); c.quadraticCurveTo(44, 11, 57, 10); c.lineTo(66, 10); c.lineTo(66, 25); c.closePath();
    c.fillStyle = lg(c, 0, 10, 0, 25, [[0, '#cfe3ee'], [1, '#55707f']]); c.fill();
    c.beginPath(); c.moveTo(70, 10); c.lineTo(84, 10); c.quadraticCurveTo(95, 12, 101, 24); c.lineTo(70, 25); c.closePath();
    c.fillStyle = lg(c, 0, 10, 0, 25, [[0, '#cfe3ee'], [1, '#55707f']]); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)';
    c.beginPath(); c.moveTo(46, 25); c.lineTo(56, 10); c.lineTo(60, 10); c.lineTo(50, 25); c.fill();
    c.beginPath(); c.moveTo(80, 25); c.lineTo(88, 10); c.lineTo(91, 11); c.lineTo(83, 25); c.fill();
    line(c, 68, 9, 68, 46, 1.2, 'rgba(60,66,72,0.6)');           // 문틈
    line(c, 100, 26, 102, 46, 0.8, 'rgba(60,66,72,0.45)');
    box(c, 56, 30, 7, 1.6, 0.6, '#8d959b'); box(c, 86, 30, 7, 1.6, 0.6, '#8d959b');   // 손잡이
    box(c, 122, 32, 5, 4, 1, '#f2c27a'); box(c, 3, 33, 4, 4, 1, '#d9534a');           // 앞·뒤 등
    /* 바퀴 */
    [[30, 49], [100, 49]].forEach(function (p) {
      ell(c, p[0], p[1] - 2, 13, 11, 'rgba(20,20,22,0.85)');                         // 바퀴집 어둠
      ell(c, p[0], p[1], 11, 11, '#22252a');
      ell(c, p[0], p[1], 7, 7, rg(c, p[0] - 2, p[1] - 2, 0.5, 8, [[0, '#e9edf0'], [1, '#7c848b']]));
      for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; line(c, p[0], p[1], p[0] + Math.cos(a) * 6, p[1] + Math.sin(a) * 6, 1.4, '#5d656c'); }
      ell(c, p[0], p[1], 1.8, 1.8, '#9aa2a8');
    });
    /* 바닥 그림자 */
    c.fillStyle = rg(c, 65, 60, 4, 64, [[0, 'rgba(20,15,10,0.35)'], [1, 'rgba(20,15,10,0)']]);
    c.fillRect(0, 56, 130, 6);
  });

  /* ── 밀라노 (가롤로의 하루) ─────────────────── */

  /* 밀라노 공동주택 — 아래층 돌쌓기, 황토빛 미장, 돌 창틀, 초록 덧창, 쇠 난간과 제라늄 */
  Props.add('apart_milan', function (c, w, h, rnd) {
    const W = 156, H = 212;
    plaster(c, 0, 12, W, 140, rnd, 0xd8a46a);
    /* 처마 장식 */
    box(c, -2, 8, W + 4, 8, 1, lg(c, 0, 8, 0, 16, [[0, '#f0e2c8'], [1, '#b89d76']]));
    for (let x = 2; x < W; x += 6) box(c, x, 15.5, 3, 3, 0.4, '#d9c6a4');
    eaveShadow(c, 0, 18.5, W, 6);
    box(c, -4, 2, W + 8, 7, 1, lg(c, 0, 2, 0, 9, [[0, '#b9654a'], [1, '#7d3f2e']]));          // 기와 끝
    /* 위층 두 줄의 창 */
    for (let f = 0; f < 2; f++) {
      const y = 30 + f * 58;
      box(c, 0, y + 46, W, 3, 0.4, lg(c, 0, y + 46, 0, y + 49, [[0, '#efe3cb'], [1, '#b49d7a']]));   // 층 띠
      for (let k = 0; k < 3; k++) {
        const x = 16 + k * 48;
        /* 돌 창틀과 위 장식 */
        box(c, x - 4, y - 7, 30, 4, 0.6, '#ecdcc0'); c.beginPath(); c.moveTo(x - 4, y - 7); c.lineTo(x + 11, y - 13); c.lineTo(x + 26, y - 7); c.closePath(); c.fillStyle = '#e6d3b2'; c.fill();
        box(c, x - 3, y - 3, 28, 40, 0.6, '#ecdcc0');
        windowUnit(c, x, y, 22, 34, rnd, { lit: (f + k) % 3 === 1, curtain: true, mullion: 1, frame: '#f4efe4' });
        /* 덧창 — 가는 살 */
        [x - 13, x + 24].forEach(function (sx) {
          box(c, sx, y - 1, 11, 36, 0.6, lg(c, sx, 0, sx + 11, 0, [[0, '#4f7d5a'], [1, '#335a3f']]));
          for (let yy = y + 1; yy < y + 34; yy += 2.2) line(c, sx + 1, yy, sx + 10, yy, 0.5, 'rgba(20,40,25,0.55)');
        });
        /* 발코니 */
        box(c, x - 6, y + 34, 34, 2.6, 0.5, '#d8c7a8');
        railing(c, x - 5, y + 26, 32, 9, 'rgba(40,36,34,0.95)');
        for (let p = 0; p < 4; p++) { ell(c, x - 2 + p * 9, y + 25, 3, 2.4, '#4f8a4a'); ell(c, x - 2 + p * 9, y + 23.6, 1.4, 1.2, p % 2 ? '#e0473c' : '#f07a8a'); }
        streaks(c, x, y + 37, 22, 10, rnd, 0.1);
      }
    }
    /* 아래층 — 돌쌓기(굵은 줄눈) */
    const gy = 146;
    c.fillStyle = lg(c, 0, gy, 0, H, [[0, '#cfc2ac'], [1, '#a99a82']]); c.fillRect(0, gy, W, H - gy);
    for (let r = 0, y = gy; y < H; r++, y += 11) {
      line(c, 0, y, W, y, 1.2, 'rgba(90,75,60,0.5)');
      for (let x = (r % 2 ? 0 : 13); x < W; x += 26) line(c, x, y, x, y + 11, 1, 'rgba(90,75,60,0.45)');
      c.fillStyle = 'rgba(255,250,235,0.25)'; c.fillRect(0, y + 1.2, W, 1);
    }
    speckle(c, 0, gy, W, H - gy, rnd, 700, 'rgba(70,60,50,0.3)', 'rgba(255,255,250,0.3)');
    box(c, 0, gy - 3, W, 4, 0.5, '#e8dcc4');
    /* 아치 대문 */
    c.beginPath(); c.moveTo(52, H); c.lineTo(52, 174); c.arc(78, 174, 26, Math.PI, 0); c.lineTo(104, H); c.closePath(); c.fillStyle = '#e6d8be'; c.fill();
    c.beginPath(); c.moveTo(57, H); c.lineTo(57, 174); c.arc(78, 174, 21, Math.PI, 0); c.lineTo(99, H); c.closePath(); c.fillStyle = '#2a1a10'; c.fill();
    B.plank(c, 59, 172, 18, 40, 1, '#5e3b22', '#7a5032', '#45291a', rnd, 1);
    B.plank(c, 79, 172, 18, 40, 1, '#5e3b22', '#7a5032', '#45291a', rnd, 1);
    for (let k = 0; k < 2; k++) for (let r = 0; r < 3; r++) box(c, 62 + k * 20, 176 + r * 11, 12, 8, 0.8, 'rgba(30,18,10,0.35)');
    ell(c, 76, 194, 1.5, 1.5, '#d8b56a'); ell(c, 80, 194, 1.5, 1.5, '#d8b56a');
    c.beginPath(); c.arc(78, 174, 19, Math.PI, 0); c.closePath(); c.fillStyle = 'rgba(80,60,40,0.6)'; c.fill();
    for (let i = 1; i < 5; i++) { const a = Math.PI + i * Math.PI / 5; line(c, 78, 174, 78 + Math.cos(a) * 19, 174 + Math.sin(a) * 19, 0.8, '#2a1a10'); }
    /* 가게 창과 번지 판 */
    windowUnit(c, 12, 160, 30, 36, rnd, { grille: true, mullion: 1, frame: '#3b3330' });
    windowUnit(c, 114, 160, 30, 36, rnd, { grille: true, mullion: 1, frame: '#3b3330' });
    box(c, 106, 150, 12, 7, 1, '#2f5a8a'); signText(c, '24', 112, 153.6, 5, '#ffffff', '700');
    downpipe(c, 152, 18, H);
    groundAO(c, 0, H, W, 6);
  });

  /* 산타 마리아 세그레타 성당 — 롬바르디아 붉은 벽돌, 장식 아치 띠, 종탑 */
  Props.add('church_milan', function (c, w, h, rnd) {
    const H = 208;
    /* 종탑 */
    bricks(c, 0, 40, 30, 168, rnd, 0xa8573c, 6, 2.6);
    c.beginPath(); c.moveTo(-2, 42); c.lineTo(15, 12); c.lineTo(32, 42); c.closePath();
    c.fillStyle = lg(c, 0, 12, 0, 42, [[0, '#b9654a'], [1, '#7d3f2e']]); c.fill();
    for (let y = 18; y < 42; y += 3) line(c, 15 - (y - 12) * 0.56, y, 15 + (y - 12) * 0.56, y, 0.5, 'rgba(60,25,15,0.4)');
    /* 종 창(쌍 아치) */
    [6, 17].forEach(function (x) {
      c.beginPath(); c.moveTo(x, 70); c.lineTo(x, 56); c.arc(x + 3.5, 56, 3.5, Math.PI, 0); c.lineTo(x + 7, 70); c.closePath(); c.fillStyle = '#2a1e16'; c.fill();
    });
    ell(c, 15, 63, 2.6, 2.6, 'rgba(210,170,80,0.85)');
    for (let y = 80; y < 200; y += 40) box(c, 0, y, 30, 2.4, 0.4, '#e6d8be');
    /* 정면 */
    bricks(c, 30, 66, 138, 142, rnd, 0xb05d40, 6, 2.6);
    c.save(); c.beginPath(); c.moveTo(28, 70); c.lineTo(99, 24); c.lineTo(170, 70); c.closePath(); c.clip();
    bricks(c, 28, 22, 144, 50, rnd, 0xa9573c, 6, 2.6); c.restore();
    c.beginPath(); c.moveTo(26, 72); c.lineTo(99, 22); c.lineTo(172, 72); c.lineWidth = 3; c.strokeStyle = '#e6d8be'; c.stroke();
    /* 장식 아치 띠(아케토 펜실레) — 박공을 따라 */
    for (let i = 0; i < 12; i++) {
      const t = (i + 0.5) / 12, xl = 30 + t * 69, yl = 70 - t * 46;
      [[xl, yl], [168 - t * 69, yl]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1] + 4, 2.6, Math.PI, 0); c.strokeStyle = 'rgba(240,226,200,0.85)'; c.lineWidth = 0.9; c.stroke(); });
    }
    /* 장미창 */
    ell(c, 99, 58, 14, 14, '#e6d8be'); ell(c, 99, 58, 11.5, 11.5, '#2e241c');
    const rose = ['#3f74b8', '#d94a3c', '#e8b23a', '#4f9b6b', '#7a5aa8', '#e8e0c8'];
    for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(99, 58); c.arc(99, 58, 10, i * Math.PI / 6 + 0.05, (i + 1) * Math.PI / 6 - 0.05); c.closePath(); c.fillStyle = rose[i % 6]; c.fill(); }
    ell(c, 99, 58, 3.6, 3.6, '#e6d8be');
    /* 좁은 창 둘 */
    [[52, 104], [136, 104]].forEach(function (p) {
      c.beginPath(); c.moveTo(p[0] - 2, p[1] + 42); c.lineTo(p[0] - 2, p[1] + 6); c.arc(p[0] + 5, p[1] + 6, 7, Math.PI, 0); c.lineTo(p[0] + 12, p[1] + 42); c.closePath(); c.fillStyle = '#e6d8be'; c.fill();
      c.beginPath(); c.moveTo(p[0], p[1] + 40); c.lineTo(p[0], p[1] + 6); c.arc(p[0] + 5, p[1] + 6, 5, Math.PI, 0); c.lineTo(p[0] + 10, p[1] + 40); c.closePath();
      c.fillStyle = lg(c, 0, p[1], 0, p[1] + 40, [[0, '#7fa2c8'], [1, '#3a5578']]); c.fill();
      line(c, p[0] + 5, p[1] + 2, p[0] + 5, p[1] + 40, 0.6, '#2e241c');
    });
    /* 대리석 테두리의 정문 */
    c.beginPath(); c.moveTo(70, H); c.lineTo(70, 150); c.arc(99, 150, 29, Math.PI, 0); c.lineTo(128, H); c.closePath(); c.fillStyle = '#efe6d6'; c.fill();
    c.beginPath(); c.moveTo(75, H); c.lineTo(75, 150); c.arc(99, 150, 24, Math.PI, 0); c.lineTo(123, H); c.closePath(); c.fillStyle = '#e0d2bb'; c.fill();
    c.beginPath(); c.moveTo(79, H); c.lineTo(79, 150); c.arc(99, 150, 20, Math.PI, 0); c.lineTo(119, H); c.closePath(); c.fillStyle = '#2a1a10'; c.fill();
    c.beginPath(); c.arc(99, 150, 18, Math.PI, 0); c.closePath(); c.fillStyle = rg(c, 99, 150, 2, 18, [[0, '#f6e4b4'], [1, '#c8995a']]); c.fill();
    ell(c, 99, 142, 3, 3.4, '#f2ede2'); box(c, 96, 144, 6, 7, 2, '#e7eef6');      // 반원 안의 성모
    B.plank(c, 81, 152, 17, 56, 1, '#5e3b22', '#7a5032', '#45291a', rnd, 1);
    B.plank(c, 100, 152, 17, 56, 1, '#5e3b22', '#7a5032', '#45291a', rnd, 1);
    for (let r = 0; r < 4; r++) { box(c, 84, 156 + r * 13, 11, 10, 0.8, 'rgba(30,18,10,0.35)'); box(c, 103, 156 + r * 13, 11, 10, 0.8, 'rgba(30,18,10,0.35)'); }
    /* 꼭대기 금빛 십자가 */
    box(c, 97.5, 2, 3, 22, 1, lg(c, 97.5, 0, 100.5, 0, [[0, '#f6dc8a'], [1, '#b8862e']]));
    box(c, 92, 8, 14, 3, 1, lg(c, 0, 8, 0, 11, [[0, '#f6dc8a'], [1, '#b8862e']]));
    box(c, 64, H - 4, 70, 4, 0.5, '#d9cfbd');
    groundAO(c, 30, H, 138, 6);
  });

  /* 밀라노 학교 — 붉은 벽돌과 흰 돌띠, 큰 창 */
  Props.add('school_milan', function (c, w, h, rnd) {
    const W = 190, H = 156;
    bricks(c, 0, 26, W, 130, rnd, 0xb8664a, 6, 2.6);
    box(c, -2, 22, W + 4, 6, 0.6, lg(c, 0, 22, 0, 28, [[0, '#f1e6d2'], [1, '#bba98b']]));
    eaveShadow(c, 0, 28, W, 4);
    for (let f = 0; f < 2; f++) {
      const y = 38 + f * 48;
      box(c, 0, y + 40, W, 3, 0.4, '#e9dcc4');
      for (let k = 0; k < 5; k++) {
        const x = 12 + k * 36;
        box(c, x - 3, y - 4, 26, 4, 0.5, '#e9dcc4');
        windowUnit(c, x, y, 20, 30, rnd, { mullion: 1, transom: true, frame: '#f2ede2', curtain: (k + f) % 3 === 0, stain: true });
      }
    }
    /* 깃대 */
    line(c, 95, 0, 95, 22, 1.2, '#8d8f90');
    c.beginPath(); c.moveTo(96, 2); c.quadraticCurveTo(108, 0, 118, 5); c.quadraticCurveTo(108, 8, 96, 10); c.closePath(); c.fillStyle = '#4f9b6b'; c.fill();
    c.fillStyle = '#f4f1ea'; c.fillRect(103, 2.4, 6, 6.6); c.fillStyle = '#d94a3c'; c.fillRect(109, 3.2, 5, 5.4);
    /* 현관 */
    box(c, 76, 112, 38, 4, 0.6, '#e9dcc4'); eaveShadow(c, 78, 116, 34, 4);
    box(c, 80, 116, 30, 40, 1, '#2f241c');
    windowUnit(c, 82, 118, 12, 36, rnd, { mullion: 0, frame: '#6a4a32' }); windowUnit(c, 96, 118, 12, 36, rnd, { mullion: 0, frame: '#6a4a32' });
    signText(c, 'SCUOLA', 95, 108.5, 5.5, '#5a3a28', '800');
    groundAO(c, 0, H, W, 6);
  });

  /* 먼 밀라노 지붕선 — 붉은 기와, 종탑, 벨라스카 탑 */
  Props.add('skyline_far', function (c, w, h, rnd) {
    const W = w, H = h, haze = [196, 208, 220];
    let x = 0;
    while (x < W) {
      const bw = 26 + rnd() * 30, bh = 34 + rnd() * 50, col = mix([[214, 176, 132], [206, 188, 160], [196, 150, 118], [222, 206, 178]][Math.floor(rnd() * 4)], haze, 0.5);
      c.fillStyle = css(col); c.fillRect(x, H - bh, bw, bh);
      c.fillStyle = css(mix([170, 90, 64], haze, 0.5)); c.beginPath(); c.moveTo(x - 2, H - bh); c.lineTo(x + bw / 2, H - bh - 7); c.lineTo(x + bw + 2, H - bh); c.closePath(); c.fill();
      for (let yy = H - bh + 6; yy < H - 4; yy += 8) for (let xx = x + 4; xx < x + bw - 4; xx += 7) { c.fillStyle = css(mix([110, 110, 120], haze, 0.5)); c.fillRect(xx, yy, 3, 4.5); }
      x += bw + rnd() * 4;
    }
    /* 종탑 */
    const tx = W * 0.62; c.fillStyle = css(mix([180, 110, 80], haze, 0.45)); c.fillRect(tx, H - 110, 10, 110);
    c.beginPath(); c.moveTo(tx - 1, H - 110); c.lineTo(tx + 5, H - 124); c.lineTo(tx + 11, H - 110); c.closePath(); c.fill();
    /* 벨라스카 탑 — 위가 넓은 버섯 모양 */
    const vx = W * 0.22, vc = mix([170, 140, 120], haze, 0.45);
    c.fillStyle = css(vc); c.fillRect(vx, H - 120, 18, 120); c.fillRect(vx - 5, H - 146, 28, 28);
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(vx - 5 + k * 9.3, H - 118); c.lineTo(vx + k * 6, H - 104); c.strokeStyle = css(vc); c.lineWidth = 1.4; c.stroke(); }
    for (let yy = H - 142; yy < H - 120; yy += 4) { c.fillStyle = css(mix([110, 100, 100], haze, 0.4)); c.fillRect(vx - 3, yy, 24, 1.6); }
    c.save(); c.globalCompositeOperation = 'source-atop';           // 그린 건물 위에만 안개를
    c.fillStyle = lg(c, 0, 0, 0, H, [[0, css(haze, 0)], [1, css(haze, 0.35)]]); c.fillRect(0, 0, W, H);
    c.restore();
  });

  /* 먼 두오모 — 흰 대리석 첨탑들과 꼭대기의 금빛 성모(마돈니나) */
  Props.add('duomo_far', function (c, w, h, rnd) {
    const W = w, H = h, haze = [200, 212, 224];
    const m = mix([236, 226, 220], haze, 0.35), d = mix([196, 186, 182], haze, 0.35);
    c.fillStyle = lg(c, 0, H - 64, 0, H, [[0, css(m)], [1, css(d)]]); c.fillRect(6, H - 64, W - 12, 64);
    /* 정면의 창과 문 */
    for (let k = 0; k < 5; k++) { const x = 16 + k * (W - 32) / 5; c.fillStyle = css(mix([150, 150, 165], haze, 0.35)); c.fillRect(x + 4, H - 50, 8, 26); c.beginPath(); c.arc(x + 8, H - 50, 4, Math.PI, 0); c.fill(); }
    /* 첨탑들 */
    for (let i = 0; i < 13; i++) {
      const x = 10 + i * (W - 20) / 12, th = 22 + (i % 3) * 10 + rnd() * 8;
      c.fillStyle = css(m); c.beginPath(); c.moveTo(x - 2.4, H - 62); c.lineTo(x, H - 62 - th); c.lineTo(x + 2.4, H - 62); c.closePath(); c.fill();
      ell(c, x, H - 62 - th, 1, 1, css(mix([230, 210, 160], haze, 0.3)));
    }
    /* 가운데 큰 첨탑 */
    c.fillStyle = css(m); c.beginPath(); c.moveTo(W / 2 - 10, H - 62); c.lineTo(W / 2 - 4, H - 128); c.lineTo(W / 2 + 4, H - 128); c.lineTo(W / 2 + 10, H - 62); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(W / 2 - 4, H - 128); c.lineTo(W / 2, H - 146); c.lineTo(W / 2 + 4, H - 128); c.closePath(); c.fill();
    for (let yy = H - 120; yy < H - 66; yy += 7) line(c, W / 2 - 7, yy, W / 2 + 7, yy, 0.5, css(d));
    /* 마돈니나 */
    c.fillStyle = lg(c, 0, H - 158, 0, H - 146, [[0, '#ffe9a0'], [1, '#d8a640']]);
    c.beginPath(); c.moveTo(W / 2 - 2.4, H - 146); c.lineTo(W / 2 - 1.2, H - 155); c.lineTo(W / 2 + 1.2, H - 155); c.lineTo(W / 2 + 2.4, H - 146); c.closePath(); c.fill();
    ell(c, W / 2, H - 156.5, 1.6, 1.6, '#ffe18a');
    line(c, W / 2 + 1, H - 155, W / 2 + 4, H - 159, 0.8, '#ffe18a');
    c.fillStyle = 'rgba(255,240,190,0.4)'; c.beginPath(); c.arc(W / 2, H - 154, 5, 0, Math.PI * 2); c.fill();
  });

  /* ══ 2. 길 장면의 배경 ═══════════════════════ */

  const SKY_HAZE = [206, 219, 228];

  /* 가로로 이어 붙일 수 있게 — 오른쪽 끝을 넘는 것은 왼쪽에도 그립니다 */
  function wrap(W, x, w, fn) { fn(x); if (x + w > W) fn(x - W); if (x < 0) fn(x + W); }
  /* 주기 W 로 반복되는 능선 */
  function ridge(W, rnd, n) {
    const terms = [];
    for (let i = 0; i < n; i++) terms.push([1 + Math.floor(rnd() * 6), rnd() * Math.PI * 2, 0.4 + rnd()]);
    return function (x) {
      let v = 0;
      terms.forEach(function (t) { v += Math.sin(x / W * Math.PI * 2 * t[0] + t[1]) * t[2]; });
      return v / n;
    };
  }

  const BG = {};

  /* 먼 산과 아파트 단지 (720 × 200, 아래가 땅) */
  BG.scn_town_far = { w: 720, h: 200, paint: function (c, W, H, rnd) {
    /* 먼 산 두 겹 */
    const r1 = ridge(W, rnd, 4), r2 = ridge(W, rnd, 5);
    [[r1, 70, 30, [150, 168, 182], 0.55], [r2, 100, 26, [128, 150, 150], 0.4]].forEach(function (L) {
      const f = L[0], base = L[1], amp = L[2], col = mix(L[3], SKY_HAZE, L[4]);
      c.beginPath(); c.moveTo(0, H);
      for (let x = 0; x <= W; x += 3) c.lineTo(x, base - f(x) * amp - Math.abs(Math.sin(x * 0.07)) * 3);
      c.lineTo(W, H); c.closePath();
      c.fillStyle = lg(c, 0, base - amp, 0, H, [[0, css(shade(col, 0.06))], [1, css(shade(col, -0.05))]]); c.fill();
      /* 숲의 결 */
      c.save(); c.clip();
      speckle(c, 0, base - amp * 1.4, W, H - base + amp * 1.4, rnd, 1800, css(shade(col, -0.12), 0.5), css(shade(col, 0.1), 0.4), 2.2);
      c.restore();
    });
    /* 아파트 단지 — 길쭉한 판상형, 옆면이 살짝 보이고, 동 번호가 있습니다 */
    const blocks = [];
    for (let x = 6; x < W; x += 58 + rnd() * 70) { blocks.push([x, 34 + rnd() * 16, 56 + rnd() * 80]); if (rnd() < 0.45) x += 60 + rnd() * 60; }
    blocks.forEach(function (b, idx) {
      wrap(W, b[0], b[1] + 8, function (x) {
        const w = b[1], hh = b[2], top = H - hh;
        const face = mix([214, 214, 210], SKY_HAZE, 0.55), side = mix([170, 172, 172], SKY_HAZE, 0.55);
        c.fillStyle = css(side); c.fillRect(x + w, top + 3, 7, hh - 3);
        c.fillStyle = lg(c, 0, top, 0, H, [[0, css(shade(face, 0.05))], [1, css(shade(face, -0.06))]]); c.fillRect(x, top, w, hh);
        /* 옥상 구조물 */
        c.fillStyle = css(shade(face, -0.08)); c.fillRect(x + w * 0.3, top - 6, w * 0.22, 6);
        /* 층마다 베란다 줄 */
        for (let y = top + 6; y < H - 4; y += 4.4) {
          c.fillStyle = css(mix([150, 165, 175], SKY_HAZE, 0.45), 0.85); c.fillRect(x + 2, y, w - 4, 1.6);
          if (rnd() < 0.04) { c.fillStyle = 'rgba(255,240,215,0.35)'; c.fillRect(x + 2 + rnd() * (w - 8), y, 4, 1.6); }
        }
        /* 동 번호 */
        c.save(); c.font = '600 6px sans-serif'; c.fillStyle = css(mix([120, 120, 125], SKY_HAZE, 0.3), 0.8);
        c.textAlign = 'center'; c.fillText(String(101 + idx), x + w + 3.5, top + 12); c.restore();
      });
    });
    /* 땅 쪽은 하늘빛 안개에 잠깁니다 */
    c.fillStyle = lg(c, 0, H - 60, 0, H, [[0, css(SKY_HAZE, 0)], [1, css(SKY_HAZE, 0.45)]]); c.fillRect(0, H - 60, W, 60);
  } };

  /* 동네 지붕들 — 빌라와 단독주택, 옥상 물탱크, 전봇대와 전깃줄 (720 × 170) */
  BG.scn_town_mid = { w: 720, h: 170, paint: function (c, W, H, rnd) {
    const haze = 0.22;
    const pal = [[160, 92, 72], [214, 200, 172], [188, 190, 192], [228, 222, 210], [150, 112, 92], [204, 184, 156]];
    let x = 0;
    while (x < W) {
      const kind = rnd();
      const w = kind < 0.25 ? 56 + rnd() * 20 : 46 + rnd() * 34;
      const hh = kind < 0.25 ? 50 + rnd() * 16 : 70 + rnd() * 70;
      const col = mix(pal[Math.floor(rnd() * pal.length)], SKY_HAZE, haze);
      const top = H - hh;
      const lit = rnd();
      wrap(W, x, w + 4, function (bx) {
        if (kind < 0.25) {
          /* 기와지붕 단독주택 */
          c.fillStyle = css(col); c.fillRect(bx, top + 14, w, hh - 14);
          c.beginPath(); c.moveTo(bx - 4, top + 16); c.lineTo(bx + w * 0.2, top); c.lineTo(bx + w * 0.8, top); c.lineTo(bx + w + 4, top + 16); c.closePath();
          c.fillStyle = css(mix([70, 80, 92], SKY_HAZE, haze)); c.fill();
          for (let y = top + 3; y < top + 16; y += 2.6) { c.fillStyle = 'rgba(20,25,30,0.25)'; c.fillRect(bx - 2, y, w + 4, 0.7); }
          c.fillStyle = 'rgba(30,20,15,0.22)'; c.fillRect(bx, top + 16, w, 3);
          for (let k = 0; k < 2; k++) {
            const wx = bx + 6 + k * (w / 2), wy = top + 24;
            c.fillStyle = css(mix([90, 110, 125], SKY_HAZE, haze)); c.fillRect(wx, wy, w / 2 - 12, 12);
            c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(wx, wy, w / 2 - 12, 2);
          }
        } else {
          /* 빌라 */
          c.fillStyle = lg(c, bx, 0, bx + w, 0, [[0, css(shade(col, 0.06))], [1, css(shade(col, -0.08))]]); c.fillRect(bx, top, w, hh);
          speckle(c, bx, top, w, hh, rnd, Math.round(w * hh / 14), css(shade(col, -0.2), 0.3), css(shade(col, 0.2), 0.3));
          c.fillStyle = css(shade(col, -0.15)); c.fillRect(bx - 1, top, w + 2, 3);          // 옥상 난간
          const floors = Math.floor((hh - 8) / 15);
          for (let f = 0; f < floors; f++) {
            const wy = top + 7 + f * 15;
            c.fillStyle = css(shade(col, -0.12), 0.6); c.fillRect(bx, wy + 12, w, 1);
            for (let k = 0; k < Math.floor(w / 16); k++) {
              const wx = bx + 4 + k * 16;
              const on = lit < 0.4 && rnd() < 0.08;
              c.fillStyle = on ? css(mix([250, 228, 190], SKY_HAZE, 0.3)) : css(mix([80, 100, 116], SKY_HAZE, haze));
              c.fillRect(wx, wy, 10, 8);
              c.fillStyle = 'rgba(255,255,255,0.28)'; c.fillRect(wx, wy, 10, 1.6);
              c.fillStyle = css(mix([238, 236, 230], SKY_HAZE, haze)); c.fillRect(wx + 4.6, wy, 0.8, 8);
              if (rnd() < 0.2) { c.fillStyle = css(mix([235, 234, 228], SKY_HAZE, haze)); c.fillRect(wx + 10.5, wy + 4, 4, 3); }   // 실외기
            }
          }
          /* 옥상 물탱크·화분 */
          if (rnd() < 0.7) {
            const tx = bx + 4 + rnd() * (w - 16);
            c.fillStyle = css(mix([80, 150, 115], SKY_HAZE, haze)); c.fillRect(tx, top - 8, 10, 8);
            c.fillStyle = css(mix([110, 180, 140], SKY_HAZE, haze)); c.beginPath(); c.ellipse(tx + 5, top - 8, 5, 1.4, 0, 0, Math.PI * 2); c.fill();
          }
          if (rnd() < 0.3) { c.fillStyle = css(mix([90, 130, 80], SKY_HAZE, haze)); c.fillRect(bx + w - 14, top - 4, 9, 4); }
        }
      });
      x += w + (rnd() < 0.3 ? 4 + rnd() * 10 : 0);
    }
    /* 전봇대와 전깃줄 */
    const poles = [];
    for (let px = 40; px < W; px += 180) poles.push(px);
    poles.forEach(function (px) {
      c.fillStyle = css(mix([110, 104, 96], SKY_HAZE, 0.15)); c.fillRect(px, H - 150, 3, 150);
      c.fillRect(px - 8, H - 144, 19, 2); c.fillRect(px - 6, H - 132, 15, 1.6);
      c.fillStyle = 'rgba(90,96,100,0.9)'; c.fillRect(px + 4, H - 120, 5, 8);              // 변압기
    });
    c.strokeStyle = 'rgba(60,60,64,0.5)'; c.lineWidth = 0.7;
    [-143, -131, -125].forEach(function (dy, i) {
      for (let k = 0; k < poles.length; k++) {
        const a = poles[k], b = (poles[k + 1] !== undefined ? poles[k + 1] : poles[0] + W);
        c.beginPath(); c.moveTo(a + 1.5, H + dy); c.quadraticCurveTo((a + b) / 2, H + dy + 10 + i * 2, b + 1.5, H + dy); c.stroke();
        if (b > W) { c.beginPath(); c.moveTo(a + 1.5 - W, H + dy); c.quadraticCurveTo((a + b) / 2 - W, H + dy + 10 + i * 2, b + 1.5 - W, H + dy); c.stroke(); }
      }
    });
    /* 담장과 가로수 줄 */
    c.fillStyle = css(mix([180, 172, 160], SKY_HAZE, 0.1)); c.fillRect(0, H - 14, W, 14);
    for (let k = 0; k < W; k += 9) { c.fillStyle = 'rgba(90,80,70,0.25)'; c.fillRect(k, H - 14, 0.7, 14); }
    c.fillStyle = 'rgba(40,30,25,0.25)'; c.fillRect(0, H - 14, W, 1.4);
  } };

  /* 보도블록 (96 × 48) — 엇갈려 깐 직사각 블록 */
  BG.scn_pavers = { w: 96, h: 48, paint: function (c, W, H, rnd) {
    const bw = 24, bh = 12;
    c.fillStyle = '#9d9487'; c.fillRect(0, 0, W, H);
    const pal = [[208, 201, 190], [199, 192, 180], [214, 208, 198], [194, 186, 174], [203, 192, 180]];
    for (let r = 0; r < H / bh; r++) {
      for (let k = -1; k < W / bw + 1; k++) {
        const x = k * bw + (r % 2 ? bw / 2 : 0), y = r * bh;
        const col = pal[Math.floor(rnd() * pal.length)];
        const v = shade(col, (rnd() - 0.5) * 0.08);
        c.fillStyle = css(v); c.fillRect(x + 0.8, y + 0.8, bw - 1.6, bh - 1.6);
        c.fillStyle = css(shade(v, 0.22), 0.8); c.fillRect(x + 0.8, y + 0.8, bw - 1.6, 0.8); c.fillRect(x + 0.8, y + 0.8, 0.8, bh - 1.6);
        c.fillStyle = css(shade(v, -0.25), 0.8); c.fillRect(x + 0.8, y + bh - 1.6, bw - 1.6, 0.8); c.fillRect(x + bw - 1.6, y + 0.8, 0.8, bh - 1.6);
        speckle(c, x + 1, y + 1, bw - 2, bh - 2, rnd, 26, css(shade(v, -0.25), 0.5), css(shade(v, 0.25), 0.5));
        if (rnd() < 0.12) { c.fillStyle = 'rgba(60,50,40,0.1)'; c.beginPath(); c.ellipse(x + bw / 2, y + bh / 2, bw * 0.3, bh * 0.25, 0, 0, Math.PI * 2); c.fill(); }
      }
    }
  } };

  /* 화강석 연석 (64 × 16) */
  BG.scn_curb = { w: 64, h: 16, paint: function (c, W, H, rnd) {
    c.fillStyle = lg(c, 0, 0, 0, 6, [[0, '#e3dfd7'], [1, '#c9c4ba']]); c.fillRect(0, 0, W, 6);
    c.fillStyle = lg(c, 0, 6, 0, H, [[0, '#a9a49b'], [1, '#7f7a72']]); c.fillRect(0, 6, W, H - 6);
    speckle(c, 0, 0, W, H, rnd, 300, 'rgba(60,55,50,0.4)', 'rgba(255,255,255,0.45)');
    c.fillStyle = 'rgba(40,35,30,0.5)'; c.fillRect(W - 1, 0, 1, H);
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(0, 0, W, 0.8);
  } };

  /* 아스팔트 (256 × 128) */
  BG.scn_asphalt = { w: 256, h: 128, paint: function (c, W, H, rnd) {
    c.fillStyle = '#7a7b7c'; c.fillRect(0, 0, W, H);
    /* 덧씌운 자리 */
    for (let i = 0; i < 3; i++) {
      c.fillStyle = rnd() < 0.5 ? 'rgba(40,40,42,0.12)' : 'rgba(255,255,255,0.05)';
      c.fillRect(20 + rnd() * (W - 90), 10 + rnd() * (H - 50), 30 + rnd() * 50, 16 + rnd() * 24);
    }
    speckle(c, 0, 0, W, H, rnd, 5200, 'rgba(40,40,44,0.45)', 'rgba(200,198,192,0.4)');
    speckle(c, 0, 0, W, H, rnd, 600, 'rgba(30,30,32,0.5)', 'rgba(235,232,225,0.45)', 1.8);
    /* 가는 금 */
    c.strokeStyle = 'rgba(35,35,38,0.45)'; c.lineWidth = 0.6;
    for (let i = 0; i < 2; i++) {
      let x = 30 + rnd() * (W - 60), y = 20 + rnd() * (H - 40);
      c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += (rnd() - 0.3) * 10; y += (rnd() - 0.5) * 6; c.lineTo(x, y); }
      c.stroke();
    }
  } };

  /* 운동장 모래 (256 × 256) */
  BG.scn_sand = { w: 256, h: 256, paint: function (c, W, H, rnd) {
    c.fillStyle = '#d3c19c'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 14; i++) {
      c.fillStyle = rnd() < 0.5 ? 'rgba(150,120,80,0.08)' : 'rgba(255,245,220,0.1)';
      const x = rnd() * W, y = rnd() * H, r = 20 + rnd() * 40;
      wrap(W, x - r, r * 2, function (xx) { c.beginPath(); c.ellipse(xx + r, y, r, r * 0.6, 0, 0, Math.PI * 2); c.fill(); });
    }
    speckle(c, 0, 0, W, H, rnd, 5000, 'rgba(130,100,65,0.35)', 'rgba(255,248,230,0.45)');
    /* 자갈 */
    for (let i = 0; i < 70; i++) {
      const x = rnd() * W, y = rnd() * H, r = 0.8 + rnd() * 1.6;
      ell(c, x + 0.4, y + 0.5, r, r * 0.75, 'rgba(90,70,50,0.35)');
      ell(c, x, y, r, r * 0.75, ['#b9a888', '#cfc4ae', '#a8987c'][i % 3]);
    }
    /* 발자국 */
    for (let i = 0; i < 6; i++) {
      const x = 10 + rnd() * (W - 20), y = 10 + rnd() * (H - 20);
      ell(c, x, y, 2.2, 4, 'rgba(120,95,60,0.12)'); ell(c, x + 5, y + 8, 2.2, 4, 'rgba(120,95,60,0.12)');
    }
  } };

  /* 학교 건물 한 칸 (200 × 300) — 이어 붙이면 긴 교사동이 됩니다 */
  BG.scn_school_bay = { w: 200, h: 300, paint: function (c, W, H, rnd) {
    plaster(c, 0, 0, W, H, rnd, 0xece6da);
    /* 층 띠와 창 */
    for (let f = 0; f < 4; f++) {
      const y = 22 + f * 68;
      box(c, 0, y + 54, W, 6, 0, lg(c, 0, y + 54, 0, y + 60, [[0, '#d7cdb8'], [1, '#a99d86']]));
      eaveShadow(c, 0, y + 60, W, 3);
      for (let k = 0; k < 2; k++) {
        windowUnit(c, 14 + k * 96, y + 8, 76, 42, rnd, { mullion: 3, transom: true, frame: '#f4f2ec', curtain: (f + k) % 3 === 0, lit: f === 2 && k === 1, stain: true });
      }
    }
    /* 지붕 난간 */
    box(c, 0, 0, W, 10, 0, lg(c, 0, 0, 0, 10, [[0, '#d9d1c1'], [1, '#b2a892']]));
    eaveShadow(c, 0, 10, W, 5);
    /* 기둥 띠 */
    c.fillStyle = lg(c, 0, 0, 8, 0, [[0, 'rgba(255,255,255,0.18)'], [1, 'rgba(0,0,0,0.12)']]); c.fillRect(0, 0, 8, H);
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(W - 2, 0, 2, H);
    groundAO(c, 0, H, W, 10);
  } };

  /* 잔디 (128 × 64) — 잎끝이 위로 선 풀 */
  BG.scn_grass = { w: 128, h: 64, paint: function (c, W, H, rnd) {
    c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#8fae6c'], [1, '#6f9152']]); c.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) {
      const x = rnd() * W, y = rnd() * H, l = 2 + rnd() * 4;
      const col = rnd() < 0.5 ? 'rgba(60,95,40,0.55)' : (rnd() < 0.5 ? 'rgba(170,200,120,0.55)' : 'rgba(120,160,80,0.6)');
      wrap(W, x - 1, 2, function (xx) { line(c, xx, y, xx + (rnd() - 0.5) * 1.6, y - l, 0.6, col); });
    }
    for (let i = 0; i < 6; i++) ell(c, rnd() * W, rnd() * H, 1.2, 1.2, ['#f3efe2', '#f2d35e'][i % 2]);
  } };

  /* 서울 도심 원경 (720 × 260) — 산 위의 탑, 유리 고층 건물, 낮은 상가 */
  BG.scn_seoul_far = { w: 720, h: 260, paint: function (c, W, H, rnd) {
    const r1 = ridge(W, rnd, 4);
    const mcol = mix([126, 150, 150], SKY_HAZE, 0.45);
    c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W; x += 3) c.lineTo(x, 96 - r1(x) * 34);
    c.lineTo(W, H); c.closePath();
    c.fillStyle = css(mcol); c.fill();
    c.save(); c.clip(); speckle(c, 0, 40, W, H, rnd, 1600, css(shade(mcol, -0.12), 0.5), css(shade(mcol, 0.1), 0.4), 2.2); c.restore();
    /* 산 위의 전망탑 */
    let peak = 0, py = 999; for (let x = 0; x < W; x += 3) { const y = 96 - r1(x) * 34; if (y < py) { py = y; peak = x; } }
    const tc = mix([200, 204, 208], SKY_HAZE, 0.35);
    c.fillStyle = css(tc); c.fillRect(peak - 1.6, py - 46, 3.2, 46);
    box(c, peak - 5, py - 38, 10, 7, 2, css(tc)); box(c, peak - 3.4, py - 30, 6.8, 4, 1, css(shade(tc, -0.15)));
    line(c, peak, py - 58, peak, py - 46, 0.8, css(tc));
    /* 유리 고층 건물 */
    for (let x = 4; x < W; x += 34 + rnd() * 44) {
      const w = 26 + rnd() * 30, hh = 90 + rnd() * 120, top = H - hh;
      const glassTop = mix([150, 180, 205], SKY_HAZE, 0.45), glassBot = mix([90, 115, 140], SKY_HAZE, 0.45);
      wrap(W, x, w + 6, function (bx) {
        c.fillStyle = lg(c, 0, top, 0, H, [[0, css(glassTop)], [1, css(glassBot)]]); c.fillRect(bx, top, w, hh);
        c.fillStyle = css(shade(glassBot, -0.15)); c.fillRect(bx + w, top + 4, 5, hh - 4);
        for (let xx = bx + 3; xx < bx + w; xx += 3.4) { c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(xx, top, 0.6, hh); }
        for (let yy = top + 3; yy < H; yy += 4.2) { c.fillStyle = 'rgba(40,60,80,0.18)'; c.fillRect(bx, yy, w, 0.6); }
        c.fillStyle = lg(c, bx, top, bx + w, top + hh, [[0, 'rgba(255,255,255,0.28)'], [0.4, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0.1)']]); c.fillRect(bx, top, w, hh);
        c.fillStyle = css(shade(glassBot, -0.2)); c.fillRect(bx + w * 0.3, top - 5, w * 0.3, 5);
      });
    }
    /* 낮은 상가 줄 */
    for (let x = 0; x < W; x += 30 + rnd() * 20) {
      const w = 28 + rnd() * 22, hh = 30 + rnd() * 26, col = mix([[214, 204, 186], [196, 200, 204], [222, 214, 200]][Math.floor(rnd() * 3)], SKY_HAZE, 0.25);
      wrap(W, x, w, function (bx) {
        c.fillStyle = css(col); c.fillRect(bx, H - hh, w, hh);
        for (let yy = H - hh + 5; yy < H - 8; yy += 9) { c.fillStyle = css(mix([90, 110, 125], SKY_HAZE, 0.3)); c.fillRect(bx + 3, yy, w - 6, 4); }
        c.fillStyle = ['rgba(220,80,70,0.8)', 'rgba(60,120,200,0.8)', 'rgba(240,180,60,0.8)'][Math.floor(rnd() * 3)]; c.fillRect(bx + 4, H - hh - 0.5, w - 8, 3);
      });
    }
    c.fillStyle = lg(c, 0, H - 80, 0, H, [[0, css(SKY_HAZE, 0)], [1, css(SKY_HAZE, 0.35)]]); c.fillRect(0, H - 80, W, 80);
  } };

  /* 광장 판석 (128 × 128) — 넓은 화강석, 줄눈 */
  BG.scn_plaza = { w: 128, h: 128, paint: function (c, W, H, rnd) {
    c.fillStyle = '#a49b8e'; c.fillRect(0, 0, W, H);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) {
      const x = k * 64, y = r * 64, v = shade([214, 206, 192], (rnd() - 0.5) * 0.1);
      c.fillStyle = lg(c, x, y, x + 64, y + 64, [[0, css(shade(v, 0.06))], [1, css(shade(v, -0.06))]]); c.fillRect(x + 1, y + 1, 62, 62);
      speckle(c, x + 1, y + 1, 62, 62, rnd, 380, css(shade(v, -0.28), 0.45), css(shade(v, 0.3), 0.5));
      c.fillStyle = css(shade(v, 0.2), 0.7); c.fillRect(x + 1, y + 1, 62, 0.8);
    }
  } };

  /* 숲 띠 (720 × 180) — 먼 산 앞에 겹겹의 나무 */
  BG.scn_treeline = { w: 720, h: 180, paint: function (c, W, H, rnd) {
    const r1 = ridge(W, rnd, 4);
    const m = mix([120, 146, 150], SKY_HAZE, 0.5);
    c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 3) c.lineTo(x, 60 - r1(x) * 30); c.lineTo(W, H); c.closePath();
    c.fillStyle = css(m); c.fill();
    [[110, 0.35, 16], [140, 0.15, 20]].forEach(function (L) {
      const base = mix([82, 122, 76], SKY_HAZE, L[1]);
      for (let x = -10; x < W + 10; x += L[2] * 0.9) {
        const r = L[2] * (0.8 + rnd() * 0.5), y = L[0] + (rnd() - 0.5) * 14;
        wrap(W, x - r, r * 2, function (xx) {
          ell(c, xx + r, y + 2, r, r * 1.05, css(shade(base, -0.2)));
          ell(c, xx + r, y, r, r, css(base));
          ell(c, xx + r - r * 0.3, y - r * 0.3, r * 0.5, r * 0.45, css(shade(base, 0.15)));
        });
      }
      c.fillStyle = css(shade(base, -0.1)); c.fillRect(0, L[0] + 10, W, H - L[0]);
    });
    speckle(c, 0, 90, W, H - 90, rnd, 2400, 'rgba(40,70,40,0.3)', 'rgba(200,230,170,0.25)', 1.6);
  } };

  /* 마사토 길 (256 × 128) */
  BG.scn_gravel = { w: 256, h: 128, paint: function (c, W, H, rnd) {
    c.fillStyle = '#c9b796'; c.fillRect(0, 0, W, H);
    speckle(c, 0, 0, W, H, rnd, 5200, 'rgba(110,90,60,0.4)', 'rgba(250,240,220,0.45)');
    for (let i = 0; i < 120; i++) {
      const x = rnd() * W, y = rnd() * H, r = 0.7 + rnd() * 1.4;
      ell(c, x + 0.3, y + 0.4, r, r * 0.7, 'rgba(80,60,40,0.35)'); ell(c, x, y, r, r * 0.7, ['#b5a382', '#d8ccb4', '#a1916f'][i % 3]);
    }
    for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(120,95,60,0.08)'; c.fillRect(0, 20 + rnd() * (H - 40), W, 6 + rnd() * 6); }
  } };

  /* 밀라노 인도 — 큼직한 화강석 판 (128 × 64) */
  BG.scn_milan_walk = { w: 128, h: 64, paint: function (c, W, H, rnd) {
    c.fillStyle = '#8f877a'; c.fillRect(0, 0, W, H);
    for (let r = 0; r < 2; r++) for (let k = -1; k < 3; k++) {
      const x = k * 64 + (r % 2 ? 32 : 0), y = r * 32, v = shade([200, 194, 182], (rnd() - 0.5) * 0.12);
      c.fillStyle = css(v); c.fillRect(x + 0.8, y + 0.8, 62.4, 30.4);
      speckle(c, x + 1, y + 1, 62, 30, rnd, 200, css(shade(v, -0.3), 0.5), css(shade(v, 0.3), 0.5));
      c.fillStyle = css(shade(v, 0.2), 0.7); c.fillRect(x + 0.8, y + 0.8, 62.4, 0.7);
    }
  } };

  /* 밀라노 찻길 — 반원으로 깐 반암 돌 (128 × 64) */
  BG.scn_setts = { w: 128, h: 64, paint: function (c, W, H, rnd) {
    c.fillStyle = '#4e4a48'; c.fillRect(0, 0, W, H);
    const pal = [[124, 104, 98], [108, 98, 96], [132, 118, 108], [96, 90, 92]];
    for (let r = 0; r < 8; r++) for (let k = 0; k < 16; k++) {
      const v = shade(pal[Math.floor(rnd() * pal.length)], (rnd() - 0.5) * 0.15);
      const x = k * 8 + (r % 2 ? 4 : 0), y = r * 8;
      wrap(W, x, 8, function (xx) {
        box(c, xx + 0.6, y + 0.6, 6.8, 6.8, 2, css(v));
        c.fillStyle = css(shade(v, 0.25), 0.6); c.fillRect(xx + 1.4, y + 1, 5, 1);
      });
    }
  } };

  /* 교실 마룻바닥 (128 × 64) — 니스 칠한 긴 널, 이음매가 엇갈립니다 */
  BG.scn_wood_floor = { w: 128, h: 64, paint: function (c, W, H, rnd) {
    const ph = 8;
    for (let r = 0; r < H / ph; r++) {
      const off = (r * 37) % 64;
      for (let x = -off; x < W; x += 64) {
        const base = shade([176, 128, 84], (rnd() - 0.5) * 0.14);
        c.fillStyle = lg(c, 0, r * ph, 0, r * ph + ph, [[0, css(shade(base, 0.12))], [1, css(shade(base, -0.1))]]);
        wrap(W, x, 64, function (xx) { c.fillRect(xx, r * ph, 64, ph); });
        wrap(W, x, 64, function (xx) { B.grain(c, xx + 1, r * ph + 1, 62, ph - 2, rnd, 'rgba(90,50,20,0.22)', 2); });
        c.fillStyle = 'rgba(50,28,12,0.55)';
        wrap(W, x, 1, function (xx) { c.fillRect(xx, r * ph, 0.8, ph); });
      }
      c.fillStyle = 'rgba(50,28,12,0.5)'; c.fillRect(0, r * ph + ph - 0.8, W, 0.8);
      c.fillStyle = 'rgba(255,235,200,0.18)'; c.fillRect(0, r * ph, W, 0.8);
    }
  } };

  /* 교실 벽 (160 × 130) — 미색 벽, 나무 징두리와 걸레받이 */
  BG.scn_class_wall = { w: 160, h: 130, paint: function (c, W, H, rnd) {
    plaster(c, 0, 0, W, H, rnd, 0xeee6d2);
    c.fillStyle = 'rgba(0,0,0,0.06)'; c.fillRect(0, 0, W, 10);
    /* 징두리 판 */
    const y0 = H - 46;
    c.fillStyle = lg(c, 0, y0, 0, H, [[0, '#b98f63'], [1, '#8f6a45']]); c.fillRect(0, y0, W, 46);
    for (let x = 0; x < W; x += 40) {
      c.fillStyle = 'rgba(60,35,15,0.35)'; c.fillRect(x, y0 + 4, 0.8, 38);
      box(c, x + 5, y0 + 8, 30, 28, 1, 'rgba(255,230,190,0.08)');
      c.strokeStyle = 'rgba(60,35,15,0.3)'; c.lineWidth = 0.6; c.strokeRect(x + 5, y0 + 8, 30, 28);
    }
    box(c, 0, y0 - 3, W, 4, 0.6, lg(c, 0, y0 - 3, 0, y0 + 1, [[0, '#d2ad80'], [1, '#8a6440']]));
    c.fillStyle = 'rgba(30,20,10,0.25)'; c.fillRect(0, y0 + 1, W, 2);
    box(c, 0, H - 6, W, 6, 0, '#6b4c30');
  } };

  /* 복도 벽 (160 × 130) — 사물함 줄과 그 위 복도 창 */
  BG.scn_hall_wall = { w: 160, h: 130, paint: function (c, W, H, rnd) {
    plaster(c, 0, 0, W, H, rnd, 0xe9ecea);
    windowUnit(c, 18, 10, 124, 30, rnd, { mullion: 3, frame: '#f6f6f2' });
    /* 사물함 */
    const y0 = H - 72;
    for (let k = 0; k < 8; k++) {
      const x = k * 20;
      box(c, x + 0.5, y0, 19, 66, 0.6, lg(c, x, 0, x + 19, 0, [[0, '#9fb6c4'], [1, '#7d95a4']]));
      for (let v = 0; v < 3; v++) line(c, x + 5, y0 + 6 + v * 2, x + 14, y0 + 6 + v * 2, 0.6, 'rgba(40,55,65,0.5)');
      box(c, x + 14, y0 + 30, 2.4, 8, 0.6, '#d9dee0');
      box(c, x + 5, y0 + 14, 8, 4, 0.5, '#f4efe2');
      line(c, x + 0.5, y0 + 33, x + 19.5, y0 + 33, 0.6, 'rgba(40,55,65,0.4)');
    }
    box(c, 0, y0 - 3, W, 3, 0.4, '#c7ced0');
    box(c, 0, H - 6, W, 6, 0, '#5d6a72');
  } };

  /* 복도 바닥 테라초 (128 × 128) */
  BG.scn_terrazzo = { w: 128, h: 128, paint: function (c, W, H, rnd) {
    c.fillStyle = '#c9c6bd'; c.fillRect(0, 0, W, H);
    speckle(c, 0, 0, W, H, rnd, 2600, 'rgba(70,68,64,0.5)', 'rgba(255,255,250,0.6)', 1.4);
    for (let i = 0; i < 160; i++) {
      c.fillStyle = ['rgba(150,110,90,0.5)', 'rgba(90,110,120,0.45)', 'rgba(240,236,226,0.7)'][i % 3];
      const x = rnd() * W, y = rnd() * H, r = 0.8 + rnd() * 1.6;
      c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r * 0.8); c.lineTo(x - r * 0.9, y); c.fill();
    }
    c.fillStyle = 'rgba(80,76,70,0.5)'; c.fillRect(0, 0, W, 1); c.fillRect(0, 0, 1, H);
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(0, H * 0.2, W, H * 0.06);
  } };

  /* ── 만들기 ──────────────────────────────── */
  function ensure(scene, key) {
    if (scene.textures.exists(key)) return key;
    const d = BG[key];
    if (!d) return null;
    const R = window.HiTex ? Math.min(2, HiTex.density(scene, 'prop')) : 1;
    const tex = scene.textures.createCanvas(key, Math.ceil(d.w * R), Math.ceil(d.h * R));
    const ctx = tex.getContext();
    ctx.save(); ctx.scale(R, R); ctx.lineJoin = 'round';
    d.paint(ctx, d.w, d.h, B.seed(key));
    ctx.restore();
    if (window.HiTex) HiTex.mark(tex, R);
    tex.refresh();
    d.R = R;
    return key;
  }

  /* 밀라노 거리를 메우는 낮은 건물 — 색과 높이마다 한 장씩 굽습니다 */
  function milanFiller(scene, x, base, color, h, depth) {
    const key = 'scn_milan_fill_' + color.toString(16) + '_' + h;
    if (!scene.textures.exists(key)) {
      const W = 112, R = window.HiTex ? Math.min(2, HiTex.density(scene, 'prop')) : 1;
      const tex = scene.textures.createCanvas(key, Math.ceil(W * R), Math.ceil(h * R));
      const c = tex.getContext(); const rnd = B.seed(key);
      c.save(); c.scale(R, R);
      plaster(c, 0, 8, W, h - 8, rnd, color);
      box(c, -1, 4, W + 2, 6, 0.8, lg(c, 0, 4, 0, 10, [[0, '#f0e4cc'], [1, '#b8a07c']]));
      eaveShadow(c, 0, 10, W, 4);
      box(c, -2, 0, W + 4, 5, 0.8, lg(c, 0, 0, 0, 5, [[0, '#b9654a'], [1, '#7d3f2e']]));
      const shutter = rnd() < 0.5 ? ['#7a5a3c', '#5a3f28'] : ['#4f7d5a', '#335a3f'];
      const floors = Math.max(1, Math.floor((h - 58) / 40));
      for (let f = 0; f < floors; f++) for (let k = 0; k < 3; k++) {
        const wx = 14 + k * 32, wy = 20 + f * 40;
        box(c, wx - 3, wy - 4, 22, 3, 0.4, '#ecdcc0');
        windowUnit(c, wx, wy, 16, 24, rnd, { curtain: (f + k) % 2 === 0, lit: (f * 3 + k) % 5 === 2, mullion: 1, frame: '#f4efe4' });
        if ((k + f) % 2 === 0) [wx - 8, wx + 17].forEach(function (sx) {
          box(c, sx, wy - 1, 7, 26, 0.5, lg(c, sx, 0, sx + 7, 0, [[0, shutter[0]], [1, shutter[1]]]));
          for (let yy = wy + 1; yy < wy + 24; yy += 2) line(c, sx + 0.8, yy, sx + 6.2, yy, 0.4, 'rgba(20,15,10,0.5)');
        });
      }
      /* 1층 — 차양 달린 가게 */
      const gy = h - 40;
      box(c, 0, gy - 2, W, 3, 0.4, '#e6d6ba');
      c.fillStyle = lg(c, 0, gy, 0, h, [[0, '#cbbca4'], [1, '#a8987e']]); c.fillRect(0, gy + 1, W, 39);
      const aw = ['#b8423a', '#2f6b5a', '#2f4f7d', '#c48a3a'][Math.floor(rnd() * 4)];
      for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? aw : '#f2ece0'; c.beginPath(); c.moveTo(14 + i * 10.5, gy + 3); c.lineTo(24.5 + i * 10.5, gy + 3); c.lineTo(26 + i * 10.5, gy + 12); c.lineTo(12.5 + i * 10.5, gy + 12); c.closePath(); c.fill(); }
      eaveShadow(c, 14, gy + 12, 84, 5);
      windowUnit(c, 16, gy + 15, 50, 22, rnd, { lit: true, mullion: 2, frame: '#3b3330' });
      box(c, 74, gy + 13, 20, 27, 0.8, '#3a2618'); box(c, 76, gy + 15, 16, 12, 0.6, 'rgba(255,220,160,0.55)');
      groundAO(c, 0, h, W, 5);
      c.restore();
      if (window.HiTex) HiTex.mark(tex, R);
      tex.refresh();
    }
    return scene.add.image(x, base, key).setOrigin(0.5, 1).setDepth(depth === undefined ? 280 : depth);
  }

  /* 이어 붙인 그림 하나 — 고해상도로 구운 그림도 화면 단위로 맞춥니다 */
  function strip(scene, key, x, y, width, height, opt) {
    opt = opt || {};
    ensure(scene, key);
    const d = BG[key];
    const ts = scene.add.tileSprite(x, y, width, height || d.h, key).setOrigin(0, 0);
    /* 화면 단위로 맞춥니다 — 구운 배율(R)만큼 줄여 그립니다 */
    const k = (opt.scale || 1) / (scene.textures.exists(key) && d.R ? d.R : 1);
    ts.setTileScale(k, k);
    if (opt.depth !== undefined) ts.setDepth(opt.depth);
    if (opt.scroll !== undefined) ts.setScrollFactor(opt.scroll, 1);
    if (opt.alpha !== undefined) ts.setAlpha(opt.alpha);
    if (opt.tint !== undefined) ts.setTint(opt.tint);
    return ts;
  }

  /* 길 장면 한 벌 — 먼 산과 단지, 동네 지붕, 인도, 연석, 찻길
     opt: world(가로), horizon(먼 배경이 땅에 닿는 높이), ground(인도 시작), road(찻길 시작, 없으면 인도만),
          bottom(화면 아래), depth(맨 뒤 깊이), tint(시간대 빛 — 저녁이면 따뜻하게), lanes(차선) */
  function street(scene, opt) {
    const world = opt.world, ground = opt.ground, bottom = opt.bottom || GAME.HEIGHT;
    const d = opt.depth === undefined ? -28 : opt.depth;
    const tint = opt.tint;
    /* 바닥은 시간대 빛을 아주 조금만 받습니다 */
    const gt = tint === undefined ? undefined : Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0xffffff), Phaser.Display.Color.ValueToColor(tint), 100, 30);
    const groundTint = gt ? Phaser.Display.Color.GetColor(gt.r, gt.g, gt.b) : undefined;
    const horizon = opt.horizon || ground;
    const out = {};
    opt.farScale = opt.farScale || 1.5;
    opt.midScale = opt.midScale || 1.3;
    /* 먼 배경은 천천히 따라옵니다(시차) — 그만큼 넓게 깝니다 */
    const farW = Math.max(world, GAME.WIDTH) * 0.5 + GAME.WIDTH * 2;
    const farKey = opt.far || 'scn_town_far';
    out.far = strip(scene, farKey, -GAME.WIDTH, horizon - BG[farKey].h * (opt.farScale || 1), farW, BG[farKey].h,
      { depth: d, scroll: 0.35, scale: opt.farScale || 1, tint: tint });
    if (opt.mid !== false) {
      const midW = Math.max(world, GAME.WIDTH) * 0.75 + GAME.WIDTH * 2;
      out.mid = strip(scene, 'scn_town_mid', -GAME.WIDTH, horizon - BG.scn_town_mid.h * (opt.midScale || 1), midW, BG.scn_town_mid.h,
        { depth: d + 0.5, scroll: 0.65, scale: opt.midScale || 1, tint: tint });
      out.mid.height = BG.scn_town_mid.h * opt.midScale;
    }
    out.far.height = BG[farKey].h * opt.farScale;
    /* 인도 */
    const sideEnd = opt.road || bottom;
    out.walk = strip(scene, opt.walk || 'scn_pavers', 0, ground, world, sideEnd - ground, { depth: d + 1, tint: groundTint });
    out.curbTop = strip(scene, 'scn_curb', 0, ground - 4, world, 16, { depth: d + 1.2, tint: groundTint });
    out.curbTop.setTileScale(out.curbTop.tileScaleX, out.curbTop.tileScaleX * 0.6); out.curbTop.height = 10;
    /* 찻길 */
    if (opt.road) {
      out.curb = strip(scene, 'scn_curb', 0, opt.road - 6, world, 16, { depth: d + 1.3, tint: groundTint });
      out.road = strip(scene, 'scn_asphalt', 0, opt.road + 10, world, bottom - opt.road - 10, { depth: d + 1, tint: groundTint });
      if (opt.lanes !== false) {
        const g = scene.add.graphics().setDepth(d + 1.4);
        const ly = opt.road + 10 + (bottom - opt.road - 10) * 0.5;
        for (let x = 10; x < world; x += 96) { g.fillStyle(0xf3ede0, 0.85); g.fillRect(x, ly - 2, 50, 4); }
        g.fillStyle(0xe8c24a, 0.8); g.fillRect(0, opt.road + 16, world, 2.4);         // 가장자리 노란 선
        out.lanes = g;
      }
    }
    return out;
  }

  /* ── 성당 안 — 한 점 원근의 회중석 ──────────────
     floorY 에서 바닥이 시작하고, 가운데 안쪽(앱스)에 제단이 놓일 자리를 비워 둡니다.
     mood: 'warm' 낮의 따뜻한 성당 / 'night' 밤의 푸른 성당 */
  function nave(scene, opt) {
    opt = opt || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const floorY = opt.floorY || 470, mood = opt.mood || 'warm';
    const key = 'scn_nave_' + mood + '_' + floorY;
    if (!scene.textures.exists(key)) {
      const R = window.HiTex ? Math.min(2, HiTex.density(scene, 'prop')) : 1;
      const tex = scene.textures.createCanvas(key, Math.ceil(W * R), Math.ceil(H * R));
      const c = tex.getContext();
      c.save(); c.scale(R, R); c.lineJoin = 'round';
      paintNave(c, W, H, floorY, mood, B.seed(key));
      c.restore();
      if (window.HiTex) HiTex.mark(tex, R);
      tex.refresh();
    }
    return scene.add.image(0, 0, key).setOrigin(0, 0).setDepth(opt.depth === undefined ? -60 : opt.depth);
  }

  function paintNave(c, W, H, floorY, mood, rnd) {
    const night = mood === 'night';
    const stone = night ? [66, 74, 104] : [206, 188, 160];
    const deep = night ? [26, 30, 48] : [96, 78, 62];
    const glow = night ? [255, 196, 120] : [255, 226, 170];
    const bx0 = W * 0.27, bx1 = W * 0.73, by0 = 118, by1 = floorY - 6;      // 안쪽 벽(앱스 입구)
    const L = function (a, b, t) { return a + (b - a) * t; };

    /* 바탕 */
    c.fillStyle = css(deep); c.fillRect(0, 0, W, H);
    /* 천장 — 위로 갈수록 어둡고, 늑골이 안쪽으로 모입니다 */
    c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(bx1, by0); c.lineTo(bx0, by0); c.closePath();
    c.fillStyle = lg(c, 0, 0, 0, by0, [[0, css(shade(deep, -0.2))], [1, css(shade(stone, -0.35))]]); c.fill();
    /* 양쪽 벽 */
    [[0, bx0, 1], [W, bx1, -1]].forEach(function (sd) {
      c.beginPath(); c.moveTo(sd[0], 0); c.lineTo(sd[1], by0); c.lineTo(sd[1], by1); c.lineTo(sd[0], H); c.closePath();
      c.fillStyle = lg(c, sd[0], 0, sd[1], 0, [[0, css(shade(stone, night ? -0.15 : -0.05))], [1, css(shade(stone, -0.32))]]); c.fill();
      c.save(); c.clip(); speckle(c, Math.min(sd[0], sd[1]), 0, Math.abs(sd[1] - sd[0]), H, rnd, 2600, css(shade(stone, -0.3), 0.25), css(shade(stone, 0.25), 0.2)); c.restore();
    });
    /* 바닥 — 대리석 바둑판, 소실점으로 모이는 줄 */
    c.save();
    c.beginPath(); c.moveTo(bx0, by1); c.lineTo(bx1, by1); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.clip();
    const fl = night ? [58, 62, 86] : [214, 202, 182], fd = night ? [40, 44, 66] : [168, 150, 128];
    c.fillStyle = css(fl); c.fillRect(0, by1, W, H - by1);
    const rows = 14, cols = 12;
    const ys = []; for (let r = 0; r <= rows; r++) ys.push(by1 + (H - by1) * Math.pow(r / rows, 1.8));
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      if ((r + k) % 2) continue;
      const t0 = (ys[r] - by1) / (H - by1), t1 = (ys[r + 1] - by1) / (H - by1);
      const xa0 = L(bx0, 0, t0) + (L(bx1, W, t0) - L(bx0, 0, t0)) * k / cols, xa1 = L(bx0, 0, t0) + (L(bx1, W, t0) - L(bx0, 0, t0)) * (k + 1) / cols;
      const xb0 = L(bx0, 0, t1) + (L(bx1, W, t1) - L(bx0, 0, t1)) * k / cols, xb1 = L(bx0, 0, t1) + (L(bx1, W, t1) - L(bx0, 0, t1)) * (k + 1) / cols;
      c.beginPath(); c.moveTo(xa0, ys[r]); c.lineTo(xa1, ys[r]); c.lineTo(xb1, ys[r + 1]); c.lineTo(xb0, ys[r + 1]); c.closePath();
      c.fillStyle = css(fd, 0.55); c.fill();
    }
    speckle(c, 0, by1, W, H - by1, rnd, 2400, css(shade(fl, -0.3), 0.25), css(shade(fl, 0.3), 0.25));
    /* 가운데 붉은 융단 */
    c.beginPath(); c.moveTo(W / 2 - 13, by1); c.lineTo(W / 2 + 13, by1); c.lineTo(W / 2 + 62, H); c.lineTo(W / 2 - 62, H); c.closePath();
    c.fillStyle = lg(c, 0, by1, 0, H, [[0, night ? '#5a2430' : '#8f3a36'], [1, night ? '#3e1820' : '#6e2a28']]); c.fill();
    c.beginPath(); c.moveTo(W / 2 - 11, by1); c.lineTo(W / 2 - 52, H); c.moveTo(W / 2 + 11, by1); c.lineTo(W / 2 + 52, H);
    c.strokeStyle = night ? 'rgba(220,180,110,0.35)' : 'rgba(230,190,110,0.55)'; c.lineWidth = 1.2; c.stroke();
    /* 반들반들한 바닥에 비친 안쪽 빛 */
    c.fillStyle = rg(c, W / 2, by1 + 30, 4, 180, [[0, css(glow, night ? 0.22 : 0.28)], [1, css(glow, 0)]]);
    c.fillRect(0, by1, W, 260);
    c.restore();
    /* 제단 계단 */
    for (let i = 0; i < 3; i++) {
      const y = by1 - 2 + i * 5, inset = 6 - i * 6;
      box(c, bx0 + inset - 8, y, bx1 - bx0 - inset * 2 + 16, 5, 0.5, css(shade(stone, 0.08 - i * 0.06)));
      c.fillStyle = 'rgba(20,15,10,0.25)'; c.fillRect(bx0 + inset - 8, y + 4, bx1 - bx0 - inset * 2 + 16, 1);
    }

    /* 기둥과 창 — 바깥(가까운 쪽)에서 안쪽으로 */
    const bays = [0.08, 0.36, 0.58, 0.75, 0.87];
    [-1, 1].forEach(function (side) {
      const edge = side < 0 ? 0 : W, inner = side < 0 ? bx0 : bx1;
      for (let i = bays.length - 1; i >= 0; i--) {
        const t = bays[i];
        const x = L(edge, inner, t);
        const top = L(0, by0, t), bot = L(H, by1, t);
        const cw = L(30, 7, t);
        /* 창 — 이 기둥과 다음 기둥 사이 */
        if (i < bays.length - 1) {
          const t2 = bays[i + 1];
          const x2 = L(edge, inner, t2);
          const mx = (x + x2) / 2, ww = Math.abs(x2 - x) * 0.42;
          const wtop = L(L(0, by0, t), L(0, by0, t2), 0.5) + L(40, 14, t), wbot = L(L(H, by1, t), L(H, by1, t2), 0.5) - L(250, 70, t);
          if (wbot > wtop + 20) {
            c.beginPath();
            c.moveTo(mx - ww / 2, wbot); c.lineTo(mx - ww / 2, wtop + ww / 2);
            c.quadraticCurveTo(mx - ww / 2, wtop, mx, wtop - ww * 0.25);
            c.quadraticCurveTo(mx + ww / 2, wtop, mx + ww / 2, wtop + ww / 2);
            c.lineTo(mx + ww / 2, wbot); c.closePath();
            c.fillStyle = css(shade(stone, -0.45)); c.fill();
            c.save(); c.clip();
            const gc = ['#3f74b8', '#d94a3c', '#e8b23a', '#4f9b6b', '#7a5aa8', '#e9dfc4'];
            const cell = Math.max(2.4, ww / 4);
            for (let yy = wtop - ww; yy < wbot; yy += cell) for (let xx = mx - ww / 2; xx < mx + ww / 2; xx += cell) {
              c.fillStyle = gc[Math.floor(rnd() * gc.length)];
              c.globalAlpha = night ? 0.45 + rnd() * 0.2 : 0.75 + rnd() * 0.25;
              c.fillRect(xx + 0.3, yy + 0.3, cell - 0.6, cell - 0.6);
            }
            c.globalAlpha = 1;
            c.fillStyle = lg(c, 0, wtop, 0, wbot, [[0, 'rgba(255,255,255,' + (night ? 0.05 : 0.25) + ')'], [1, 'rgba(0,0,0,0.15)']]);
            c.fillRect(mx - ww, wtop - ww, ww * 2, wbot - wtop + ww);
            c.restore();
            /* 바닥으로 떨어지는 색 빛 */
            if (!night) {
              c.save(); c.globalCompositeOperation = 'lighter';
              c.beginPath(); c.moveTo(mx - ww / 2, wbot); c.lineTo(mx + ww / 2, wbot);
              c.lineTo(W / 2 + (mx - W / 2) * 0.2 + ww * 2, H * 0.98); c.lineTo(W / 2 + (mx - W / 2) * 0.2 - ww * 1.2, H * 0.98); c.closePath();
              c.fillStyle = lg(c, 0, wbot, 0, H, [[0, 'rgba(255,230,180,0.10)'], [1, 'rgba(255,230,180,0)']]); c.fill();
              c.restore();
            }
          }
        }
        /* 기둥 — 둥근 면의 빛과 그늘, 주두 */
        c.fillStyle = lg(c, x - cw / 2, 0, x + cw / 2, 0, [[0, css(shade(stone, 0.12))], [0.45, css(shade(stone, -0.05))], [1, css(shade(stone, -0.4))]]);
        c.fillRect(x - cw / 2, top + L(70, 22, t), cw, bot - top - L(70, 22, t));
        box(c, x - cw * 0.75, top + L(64, 20, t), cw * 1.5, L(10, 3, t), 1, css(shade(stone, 0.05)));
        box(c, x - cw * 0.7, bot - L(14, 4, t), cw * 1.4, L(14, 4, t), 1, css(shade(stone, -0.12)));
        /* 늑골 — 기둥 머리에서 천장 가운데로 */
        c.beginPath(); c.moveTo(x, top + L(66, 20, t));
        c.quadraticCurveTo(x, L(0, by0, t) - 10, W / 2, L(0, by0, t) * 0.6 + 4);
        c.strokeStyle = css(shade(stone, -0.15), 0.9); c.lineWidth = L(5, 1.4, t); c.stroke();
        c.strokeStyle = css(shade(stone, 0.2), 0.35); c.lineWidth = L(1.6, 0.5, t); c.stroke();
      }
    });
    /* 천장 가운데 마룻대 */
    c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, by0); c.strokeStyle = css(shade(stone, -0.2), 0.6); c.lineWidth = 2; c.stroke();

    /* 안쪽 앱스 — 뾰족 아치, 반원 둥근 천장, 빛 */
    const ax = W / 2, aw = (bx1 - bx0) * 0.86, atop = by0 + 6;
    c.fillStyle = css(shade(stone, -0.08)); c.fillRect(bx0, by0, bx1 - bx0, by1 - by0);
    c.beginPath();
    c.moveTo(ax - aw / 2, by1); c.lineTo(ax - aw / 2, atop + aw * 0.55);
    c.quadraticCurveTo(ax - aw / 2, atop, ax, atop - aw * 0.12);
    c.quadraticCurveTo(ax + aw / 2, atop, ax + aw / 2, atop + aw * 0.55);
    c.lineTo(ax + aw / 2, by1); c.closePath();
    c.fillStyle = rg(c, ax, by1 - 90, 6, aw, [[0, css(glow, night ? 0.85 : 0.95)], [0.55, css(shade(stone, night ? -0.05 : 0.1))], [1, css(shade(stone, -0.3))]]); c.fill();
    c.strokeStyle = css(shade(stone, 0.18)); c.lineWidth = 4; c.stroke();
    c.strokeStyle = css(shade(stone, -0.35), 0.6); c.lineWidth = 1; c.stroke();
    /* 앱스 높은 곳의 둥근 창 세 개 */
    [-0.28, 0, 0.28].forEach(function (k) {
      const wx = ax + aw * k, wy = atop + aw * 0.42;
      ell(c, wx, wy, 7, 11, css(shade(stone, -0.4)));
      ell(c, wx, wy, 5.6, 9.4, night ? 'rgba(120,150,210,0.6)' : 'rgba(250,240,210,0.95)');
      line(c, wx, wy - 9, wx, wy + 9, 0.8, css(shade(stone, -0.3)));
    });
    /* 공기 — 위쪽은 어둡게, 빛 쪽은 따뜻하게 */
    c.fillStyle = lg(c, 0, 0, 0, H * 0.4, [[0, 'rgba(10,8,12,0.35)'], [1, 'rgba(10,8,12,0)']]); c.fillRect(0, 0, W, H * 0.4);
    c.fillStyle = rg(c, W / 2, by1 - 80, 10, W * 0.9, [[0, css(glow, night ? 0.12 : 0.16)], [1, css(glow, 0)]]); c.fillRect(0, 0, W, H);
    c.fillStyle = lg(c, 0, 0, W, 0, [[0, 'rgba(0,0,0,0.25)'], [0.18, 'rgba(0,0,0,0)'], [0.82, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.25)']]); c.fillRect(0, 0, W, H);
  }

  return { ensure: ensure, strip: strip, street: street, nave: nave, milanFiller: milanFiller, BG: BG,
    paint: { plaster: plaster, bricks: bricks, tiles: tiles, windowUnit: windowUnit, speckle: speckle, acUnit: acUnit, railing: railing } };
})();
