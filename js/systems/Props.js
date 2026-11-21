/* 자주 보이는 물건을 손으로 다시 그립니다 — 캔버스 2D 의 그라데이션과 결로.

   왜 따로 그리나:
   도형을 겹쳐 그린 그림은 어디서 보아도 납작합니다. 매일 보는 가구, 나무, 집, 성당은
   빛이 닿는 면과 그늘진 면, 나뭇결, 유리의 비침, 천의 주름이 있어야 손에 잡힐 듯 보입니다.

   원칙:
   · 장면이 아는 크기(w × h)와 놓인 자리(바닥에 닿는 높이)는 예전 그대로 둡니다.
   · 빛은 언제나 왼쪽 위에서 옵니다. 그늘은 오른쪽 아래로.
   · 색은 게임의 따뜻한 팔레트 안에서만 고릅니다. 외부 이미지는 쓰지 않습니다. */

window.Props = (function () {

  /* ── 붓 ──────────────────────────────────── */
  function seed(key) {
    let s = 11;
    for (let i = 0; i < key.length; i++) s = (s * 31 + key.charCodeAt(i)) >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function lg(c, x0, y0, x1, y1, stops) {
    const g = c.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    return g;
  }
  function rg(c, x, y, r0, r1, stops) {
    const g = c.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    return g;
  }
  function box(c, x, y, w, h, r, fill) { rr(c, x, y, w, h, r); c.fillStyle = fill; c.fill(); }
  function ell(c, x, y, rx, ry, fill) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); }
  function line(c, x0, y0, x1, y1, w, col) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineWidth = w; c.strokeStyle = col; c.stroke(); }
  function clipRR(c, x, y, w, h, r, fn) { c.save(); rr(c, x, y, w, h, r); c.clip(); fn(); c.restore(); }

  /* 나뭇결 — 가는 물결선 몇 가닥 */
  function grain(c, x, y, w, h, rnd, col, n, vertical) {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.strokeStyle = col; c.lineWidth = 0.6;
    for (let i = 0; i < n; i++) {
      c.beginPath();
      if (!vertical) {
        const yy = y + (i + 0.5) * h / n + (rnd() - 0.5) * 2;
        const a = rnd() * 1.2, f = 0.05 + rnd() * 0.08, ph = rnd() * 6;
        for (let xx = x; xx <= x + w; xx += 2) c.lineTo(xx, yy + Math.sin(xx * f + ph) * a);
      } else {
        const xx = x + (i + 0.5) * w / n + (rnd() - 0.5) * 2;
        const a = rnd() * 1.2, f = 0.05 + rnd() * 0.08, ph = rnd() * 6;
        for (let yy = y; yy <= y + h; yy += 2) c.lineTo(xx + Math.sin(yy * f + ph) * a, yy);
      }
      c.stroke();
    }
    c.restore();
  }
  /* 나무판 — 빛 받는 윗면, 결, 아래 그늘 */
  function plank(c, x, y, w, h, r, base, light, dark, rnd, n) {
    box(c, x, y, w, h, r, lg(c, 0, y, 0, y + h, [[0, light], [0.45, base], [1, dark]]));
    grain(c, x + 1, y + 1, w - 2, h - 2, rnd, 'rgba(70,40,20,0.18)', n || Math.max(2, Math.round(h / 4)));
    c.save(); rr(c, x, y, w, h, r); c.clip();
    c.fillStyle = 'rgba(255,240,215,0.35)'; c.fillRect(x, y, w, Math.max(1, h * 0.12));
    c.restore();
  }
  /* 유리 — 하늘이 비치고 비스듬한 빛줄기 */
  function glass(c, x, y, w, h, top, bottom) {
    c.fillStyle = lg(c, 0, y, 0, y + h, [[0, top || '#d7ecf4'], [1, bottom || '#8fbcd2']]);
    c.fillRect(x, y, w, h);
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.fillStyle = 'rgba(255,255,255,0.32)';
    c.beginPath(); c.moveTo(x + w * 0.15, y + h); c.lineTo(x + w * 0.55, y); c.lineTo(x + w * 0.72, y); c.lineTo(x + w * 0.32, y + h); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.16)';
    c.beginPath(); c.moveTo(x + w * 0.42, y + h); c.lineTo(x + w * 0.8, y); c.lineTo(x + w * 0.86, y); c.lineTo(x + w * 0.48, y + h); c.fill();
    c.restore();
  }
  /* 따뜻한 불이 켜진 창 */
  function litWindow(c, x, y, w, h) {
    c.fillStyle = rg(c, x + w * 0.5, y + h * 0.65, 1, Math.max(w, h), [[0, '#fff1c8'], [0.6, '#f7c987'], [1, '#e9a25e']]);
    c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(160,90,40,0.18)'; c.fillRect(x, y, w, h * 0.18);   // 커튼 그늘
  }
  /* 잎 덩어리 — 작은 잎 무리를 겹쳐 빛과 그늘을 만듭니다 */
  function foliage(c, blobs, rnd, pal) {
    /* 그늘진 바탕 */
    blobs.forEach(function (b) { ell(c, b[0] + 1.5, b[1] + 2, b[2], b[2] * 0.92, pal.dark); });
    blobs.forEach(function (b) { ell(c, b[0], b[1], b[2], b[2] * 0.9, pal.mid); });
    /* 잎 무리 — 위·왼쪽일수록 밝게 */
    blobs.forEach(function (b) {
      const n = Math.round(b[2] * 1.6);
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * b[2] * 0.85;
        const x = b[0] + Math.cos(a) * d, y = b[1] + Math.sin(a) * d * 0.9;
        const lit = (-(x - b[0]) - (y - b[1])) / (b[2] * 1.4) + 0.5;
        const col = lit > 0.75 ? pal.hi : lit > 0.45 ? pal.light : lit > 0.2 ? pal.mid : pal.dark;
        const r = 2 + rnd() * (b[2] * 0.16);
        c.save(); c.translate(x, y); c.rotate(rnd() * Math.PI);
        ell(c, 0, 0, r, r * 0.62, col);
        c.restore();
      }
    });
  }
  /* 바닥에 닿는 곳의 짙은 그늘 */
  function contact(c, x, y, rx, ry, a) {
    c.fillStyle = rg(c, x, y, 0, rx, [[0, 'rgba(40,24,14,' + (a || 0.3) + ')'], [1, 'rgba(40,24,14,0)']]);
    c.save(); c.translate(x, y); c.scale(1, ry / rx); c.beginPath(); c.arc(0, 0, rx, 0, Math.PI * 2); c.restore(); c.fill();
  }

  /* ── 집 안 ────────────────────────────────── */
  const P = {};

  P.rug = function (c, w, h, rnd) {
    ell(c, 75, 46, 74, 43, '#c98f66');
    ell(c, 75, 45, 72, 42, lg(c, 0, 0, 0, 90, [[0, '#e2b48a'], [1, '#cf9a70']]));
    ell(c, 75, 45, 62, 35, '#b97a55');
    ell(c, 75, 45, 59, 32.5, lg(c, 0, 10, 0, 80, [[0, '#f2d3ac'], [1, '#e3bb90']]));
    ell(c, 75, 45, 42, 21, '#c98f66');
    ell(c, 75, 45, 39, 18.5, '#dba77c');
    /* 무늬 — 작은 마름모 고리 */
    c.fillStyle = 'rgba(160,90,55,0.55)';
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2;
      const x = 75 + Math.cos(a) * 51, y = 45 + Math.sin(a) * 28;
      c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillRect(-1.6, -1.6, 3.2, 3.2); c.restore();
    }
    /* 털결 */
    for (let i = 0; i < 900; i++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd());
      c.fillStyle = rnd() < 0.5 ? 'rgba(255,240,220,0.12)' : 'rgba(110,60,30,0.1)';
      c.fillRect(75 + Math.cos(a) * d * 71, 45 + Math.sin(a) * d * 41, 0.8, 0.8);
    }
    /* 술 */
    c.strokeStyle = 'rgba(205,160,120,0.9)'; c.lineWidth = 0.8;
    for (let i = -3; i <= 3; i++) { line(c, 2, 45 + i * 3, -1, 45 + i * 3.2, 0.8, '#d7ad85'); line(c, 148, 45 + i * 3, 151, 45 + i * 3.2, 0.8, '#d7ad85'); }
  };

  P.table = function (c, w, h, rnd) {
    contact(c, 37, 46, 34, 6, 0.28);
    /* 다리 */
    [[7, 26], [59, 26]].forEach(function (p) {
      box(c, p[0], p[1], 8, 20, 2.5, lg(c, p[0], 0, p[0] + 8, 0, [[0, '#9a7048'], [1, '#6e4c2f']]));
    });
    /* 상판 두께와 윗면 */
    box(c, 0, 12, 74, 20, 8, '#7f5a38');
    plank(c, 0, 6, 74, 22, 9, '#b98a5e', '#d6aa7c', '#a77a4f', rnd, 4);
    /* 접시와 과일 */
    ell(c, 24, 18.5, 9, 4.6, 'rgba(60,35,20,0.18)');
    ell(c, 24, 17, 9, 4.8, '#f7efe2'); ell(c, 24, 17, 7, 3.6, '#e9ddc9');
    ell(c, 21.5, 14.5, 3.6, 3.4, rg(c, 20.5, 13.5, 0.5, 4, [[0, '#ff9b8b'], [1, '#d94f4f']]));
    ell(c, 26.5, 15, 3.4, 3.2, rg(c, 25.5, 14, 0.5, 4, [[0, '#ffc77e'], [1, '#e08a32']]));
    line(c, 21.5, 11.5, 22.3, 10.2, 0.7, '#5d7a3b');
    /* 컵 */
    box(c, 47, 10, 11, 12, 2.5, lg(c, 47, 0, 58, 0, [[0, '#fffaf0'], [1, '#e2d6c2']]));
    ell(c, 52.5, 10.5, 5.5, 1.6, '#c49a6c');
    c.beginPath(); c.arc(59, 16, 3, -Math.PI / 2, Math.PI / 2); c.lineWidth = 1.4; c.strokeStyle = '#e8ddc9'; c.stroke();
  };

  P.tv = function (c, w, h, rnd) {
    contact(c, 31, 47, 20, 3.5, 0.3);
    box(c, 20, 40, 22, 6, 2, lg(c, 0, 40, 0, 46, [[0, '#7d6855'], [1, '#4f3f31']]));
    box(c, 28, 34, 6, 8, 1.5, '#4a4a52');
    box(c, 0, 2, 62, 36, 5, lg(c, 0, 2, 0, 38, [[0, '#4a4b56'], [1, '#22232a']]));
    box(c, 3.5, 5.5, 55, 29, 3, '#0f1622');
    /* 화면 — 꺼진 화면에 방 안이 비칩니다 */
    clipRR(c, 4, 6, 54, 28, 2.5, function () {
      c.fillStyle = lg(c, 0, 6, 62, 34, [[0, '#4d6c80'], [0.5, '#2c4256'], [1, '#1b2836']]); c.fillRect(4, 6, 54, 28);
      c.fillStyle = 'rgba(255,214,160,0.18)'; c.fillRect(8, 20, 14, 8);
      c.fillStyle = 'rgba(255,255,255,0.18)';
      c.beginPath(); c.moveTo(6, 34); c.lineTo(24, 6); c.lineTo(34, 6); c.lineTo(16, 34); c.fill();
    });
    line(c, 1, 3, 61, 3, 0.8, 'rgba(255,255,255,0.25)');
    ell(c, 55, 35.5, 0.9, 0.9, '#7fe0a0');
  };

  P.fridge = function (c, w, h, rnd) {
    box(c, 0, 0, 44, 62, 7, lg(c, 0, 0, 44, 0, [[0, '#fbf8f1'], [0.7, '#ece6da'], [1, '#d8d0c1']]));
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(3, 3, 3, 56);
    line(c, 1, 26.5, 43, 26.5, 1.4, '#c9bfae');
    line(c, 1, 27.6, 43, 27.6, 0.8, 'rgba(255,255,255,0.7)');
    /* 손잡이 */
    [[33, 7, 15], [33, 32, 16]].forEach(function (p) {
      box(c, p[0], p[1], 4, p[2], 2, lg(c, p[0], 0, p[0] + 4, 0, [[0, '#d9d2c6'], [1, '#9e9585']]));
    });
    /* 자석과 메모 */
    c.save(); c.translate(13, 11); c.rotate(-0.08);
    box(c, -6, -5, 13, 11, 1, '#fff4d8'); line(c, -4, -2, 5, -2, 0.6, '#c9b48e'); line(c, -4, 1, 3, 1, 0.6, '#c9b48e');
    c.restore();
    ell(c, 13, 6.5, 1.8, 1.8, '#d9553f');
    c.save(); c.translate(14, 38); c.rotate(0.06);
    box(c, -7, -5.5, 15, 11, 1, '#9cc8de'); ell(c, -2, -1, 2.5, 2.5, '#f7d36b'); line(c, -6, 4, 6, 2, 0.8, '#5d8a4c');
    c.restore();
    ell(c, 14, 33, 1.6, 1.6, '#4f7d6a');
    contact(c, 22, 61.5, 22, 2, 0.35);
  };

  P.sofa = function (c, w, h, rnd) {
    contact(c, 43, 44, 42, 3.5, 0.35);
    /* 등받이 */
    box(c, 0, 4, 86, 30, 10, lg(c, 0, 4, 0, 34, [[0, '#b2cba4'], [1, '#86a378']]));
    /* 방석 두 개 — 가운데가 살짝 꺼져 있습니다 */
    [[7, 12], [45, 12]].forEach(function (p) {
      box(c, p[0], p[1], 34, 21, 7, lg(c, 0, p[1], 0, p[1] + 21, [[0, '#c7dbb8'], [0.6, '#a9c49a'], [1, '#93b083']]));
      c.fillStyle = 'rgba(255,255,255,0.18)'; ell(c, p[0] + 12, p[1] + 5, 10, 3, 'rgba(255,255,255,0.18)');
      line(c, p[0] + 4, p[1] + 17, p[0] + 30, p[1] + 17, 0.8, 'rgba(70,100,60,0.35)');
    });
    /* 팔걸이 */
    box(c, -0.5, 10, 9, 28, 4.5, lg(c, 0, 0, 9, 0, [[0, '#a7c298'], [1, '#86a378']]));
    box(c, 77.5, 10, 9, 28, 4.5, lg(c, 77, 0, 86, 0, [[0, '#95b287'], [1, '#6f8d63']]));
    /* 앉는 자리 앞면 */
    box(c, 0, 30, 86, 12, 6, lg(c, 0, 30, 0, 42, [[0, '#8eab80'], [1, '#6c8860']]));
    line(c, 6, 31, 80, 31, 0.8, 'rgba(255,255,255,0.25)');
    /* 쿠션 하나 */
    c.save(); c.translate(64, 17); c.rotate(0.18);
    box(c, -7, -6, 14, 12, 4, lg(c, 0, -6, 0, 6, [[0, '#f6d9a5'], [1, '#e2b46e']]));
    c.restore();
    /* 다리 */
    box(c, 6, 41, 4, 4, 1, '#6e4c2f'); box(c, 76, 41, 4, 4, 1, '#6e4c2f');
  };

  P.plant = function (c, w, h, rnd) {
    contact(c, 15, 39, 10, 2, 0.35);
    /* 화분 */
    c.beginPath(); c.moveTo(7.5, 26); c.lineTo(22.5, 26); c.lineTo(20.5, 39); c.lineTo(9.5, 39); c.closePath();
    c.fillStyle = lg(c, 7, 0, 23, 0, [[0, '#dc8a6c'], [0.6, '#c9755a'], [1, '#9e5540']]); c.fill();
    box(c, 6.5, 24.5, 17, 4, 1.5, lg(c, 0, 24, 0, 28, [[0, '#e69b7e'], [1, '#b8644a']]));
    ell(c, 15, 25.5, 7, 1.4, '#5a3b28');
    /* 잎 — 잎맥이 있는 긴 잎들 */
    const leaves = [[15, 25, -1.9, 15], [15, 25, -1.2, 14], [15, 25, -2.6, 13], [15, 25, -0.6, 11], [15, 25, -3.2, 10], [15, 25, -1.55, 17]];
    leaves.forEach(function (l, i) {
      c.save(); c.translate(l[0], l[1]); c.rotate(l[2] + Math.PI / 2);
      c.beginPath(); c.moveTo(0, 0);
      c.quadraticCurveTo(4.5, -l[3] * 0.5, 0, -l[3]);
      c.quadraticCurveTo(-4.5, -l[3] * 0.5, 0, 0);
      c.fillStyle = lg(c, -4, 0, 4, 0, [[0, i % 2 ? '#a6c487' : '#8fb070'], [1, '#5f8648']]); c.fill();
      line(c, 0, -1, 0, -l[3] + 1.5, 0.5, 'rgba(230,245,210,0.5)');
      c.restore();
    });
  };

  P.window_warm = function (c, w, h, rnd) {
    box(c, 0, 0, 66, 46, 5, lg(c, 0, 0, 0, 46, [[0, '#cfa173'], [1, '#9c7149']]));
    litWindow(c, 4, 4, 58, 38);
    /* 노을 빛 아래쪽 */
    c.fillStyle = lg(c, 0, 24, 0, 42, [[0, 'rgba(242,170,90,0)'], [1, 'rgba(232,140,70,0.45)']]); c.fillRect(4, 24, 58, 18);
    /* 커튼 */
    c.fillStyle = lg(c, 4, 0, 13, 0, [[0, '#e8d7bd'], [1, 'rgba(232,215,189,0.2)']]); c.fillRect(4, 4, 9, 38);
    c.fillStyle = lg(c, 62, 0, 53, 0, [[0, '#e8d7bd'], [1, 'rgba(232,215,189,0.2)']]); c.fillRect(53, 4, 9, 38);
    /* 창살 */
    box(c, 31.5, 4, 3, 38, 1, '#a77a4f'); box(c, 4, 21.5, 58, 3, 1, '#a77a4f');
    line(c, 4, 4.5, 62, 4.5, 1, 'rgba(90,50,25,0.35)');
    /* 창틀 */
    box(c, -1, 41, 68, 5, 2, lg(c, 0, 41, 0, 46, [[0, '#d9ad7f'], [1, '#93683f']]));
  };

  P.door = function (c, w, h, rnd) {
    box(c, 0, 0, 48, 60, 5, lg(c, 0, 0, 48, 0, [[0, '#9a7048'], [1, '#6e4c2f']]));
    plank(c, 4, 4, 40, 52, 3, '#b98a5e', '#cfa173', '#a07247', rnd, 1);
    grain(c, 5, 5, 38, 50, rnd, 'rgba(80,45,20,0.16)', 7, true);
    /* 판넬 두 개 */
    [[9, 9, 30, 20], [9, 33, 30, 19]].forEach(function (p) {
      box(c, p[0], p[1], p[2], p[3], 2, 'rgba(110,70,40,0.28)');
      box(c, p[0] + 1.2, p[1] + 1.2, p[2] - 2.4, p[3] - 2.4, 1.6, lg(c, 0, p[1], 0, p[1] + p[3], [[0, '#c69a6c'], [1, '#ad8055']]));
    });
    /* 손잡이 */
    ell(c, 38.5, 32.5, 3.6, 3.6, 'rgba(60,35,15,0.3)');
    ell(c, 38, 32, 3.2, 3.2, rg(c, 37, 31, 0.3, 3.4, [[0, '#fff0c2'], [0.5, '#f2b56b'], [1, '#b47a32']]));
  };

  P.bed = function (c, w, h, rnd) {
    box(c, 0, 0, 66, 92, 8, lg(c, 0, 0, 66, 0, [[0, '#9a7048'], [1, '#6e4c2f']]));
    plank(c, 1, 0, 64, 8, 4, '#a77a4f', '#c69a6c', '#8a6340', rnd, 2);
    /* 매트리스 */
    box(c, 4, 6, 58, 82, 6, '#f6eedf');
    /* 베개 */
    box(c, 9, 10, 48, 20, 7, lg(c, 0, 10, 0, 30, [[0, '#ffffff'], [1, '#e7e1d6']]));
    c.beginPath(); c.moveTo(14, 20); c.quadraticCurveTo(33, 15, 52, 20); c.lineWidth = 0.8; c.strokeStyle = 'rgba(160,150,135,0.45)'; c.stroke();
    /* 이불 — 접힌 끝과 주름 */
    box(c, 3.5, 33, 59, 56, 6, lg(c, 0, 33, 66, 89, [[0, '#b1c9e3'], [0.6, '#93b0d2'], [1, '#7a98bf']]));
    box(c, 3.5, 33, 59, 9, 4, lg(c, 0, 33, 0, 42, [[0, '#d8e5f2'], [1, '#b6cae0']]));
    line(c, 5, 42, 61, 42, 0.8, 'rgba(70,90,130,0.35)');
    c.strokeStyle = 'rgba(70,95,140,0.28)'; c.lineWidth = 0.9;
    [[14, 50, 22, 74], [33, 46, 30, 80], [50, 52, 56, 70]].forEach(function (f) {
      c.beginPath(); c.moveTo(f[0], f[1]); c.quadraticCurveTo((f[0] + f[2]) / 2 + 3, (f[1] + f[3]) / 2, f[2], f[3]); c.stroke();
    });
    /* 이불 무늬 — 작은 별 */
    c.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 16; i++) { const x = 8 + rnd() * 50, y = 46 + rnd() * 38; c.fillRect(x, y, 1.2, 1.2); }
  };

  P.desk = function (c, w, h, rnd) {
    contact(c, 34, 45, 32, 3, 0.25);
    box(c, 5, 28, 7, 16, 2.5, lg(c, 5, 0, 12, 0, [[0, '#9a7048'], [1, '#6e4c2f']]));
    box(c, 56, 28, 7, 16, 2.5, lg(c, 56, 0, 63, 0, [[0, '#9a7048'], [1, '#6e4c2f']]));
    box(c, 0, 14, 68, 18, 6, '#8e6640');
    plank(c, 0, 8, 68, 20, 6, '#c09466', '#dab088', '#a97c50', rnd, 4);
    /* 펼친 공책 */
    c.save(); c.translate(22, 19.5); c.rotate(-0.06);
    box(c, -12.5, -7.5, 25, 15, 1.2, 'rgba(60,40,20,0.18)');
    box(c, -12, -8, 12, 15, 1, '#fffaf0'); box(c, 0, -8, 12, 15, 1, '#f6efe1');
    line(c, 0, -8, 0, 7, 0.7, '#cbbfae');
    for (let i = 0; i < 4; i++) { line(c, -10, -5 + i * 3, -2, -5 + i * 3, 0.5, '#bcd0dd'); line(c, 2, -5 + i * 3, 10, -5 + i * 3, 0.5, '#bcd0dd'); }
    line(c, -9, -5, -4, -5, 0.7, '#5a6f86');
    c.restore();
    /* 연필 */
    c.save(); c.translate(39, 22); c.rotate(-0.4); box(c, 0, -0.9, 10, 1.8, 0.6, '#f2b56b'); box(c, 10, -0.9, 2, 1.8, 0.4, '#f0d7b6'); c.restore();
    /* 노트북 */
    box(c, 41, 11, 19, 13, 2, '#5c6b8a');
    box(c, 42.3, 12.3, 16.4, 10.4, 1.4, lg(c, 0, 12, 0, 23, [[0, '#a9d6ea'], [1, '#78acc8']]));
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(43.5, 13.5, 5, 1.2);
    box(c, 39.5, 23.5, 22, 3, 1.2, '#7d8aa6');
  };

  P.bag = function (c, w, h, rnd) {
    contact(c, 17, 36.5, 15, 2, 0.35);
    c.beginPath(); c.arc(17, 9, 8, Math.PI, 0); c.lineWidth = 3; c.strokeStyle = '#33594a'; c.stroke();
    c.beginPath(); c.arc(17, 9, 8, Math.PI * 1.1, Math.PI * 1.5); c.lineWidth = 1; c.strokeStyle = 'rgba(255,255,255,0.3)'; c.stroke();
    box(c, 2, 6, 30, 30, 9, lg(c, 2, 0, 32, 0, [[0, '#62927d'], [0.6, '#4f7d6a'], [1, '#3a6152']]));
    /* 바느질 */
    c.setLineDash([1.6, 1.4]); rr(c, 4.5, 8.5, 25, 25, 7); c.lineWidth = 0.6; c.strokeStyle = 'rgba(220,240,225,0.45)'; c.stroke(); c.setLineDash([]);
    /* 앞주머니 */
    box(c, 4, 19, 26, 14, 6, lg(c, 0, 19, 0, 33, [[0, '#4a7564'], [1, '#33594a']]));
    line(c, 6, 20.5, 28, 20.5, 0.8, 'rgba(255,255,255,0.25)');
    box(c, 13, 21.5, 8, 5, 2, lg(c, 0, 21, 0, 27, [[0, '#ffd08a'], [1, '#d8913f']]));
    ell(c, 10, 11, 4, 2.4, 'rgba(255,255,255,0.18)');
  };

  P.lamp_room = function (c, w, h, rnd) {
    ell(c, 15, 40, 10, 4, lg(c, 0, 36, 0, 44, [[0, '#8a735f'], [1, '#4f3f31']]));
    box(c, 13, 20, 4, 19, 1.5, lg(c, 13, 0, 17, 0, [[0, '#b58b5f'], [1, '#6e4c2f']]));
    /* 갓 — 안쪽에서 빛이 비칩니다 */
    c.beginPath(); c.moveTo(8.5, 5.5); c.lineTo(21.5, 5.5); c.lineTo(27.5, 22); c.lineTo(2.5, 22); c.closePath();
    c.fillStyle = lg(c, 2, 0, 28, 0, [[0, '#fde7c0'], [0.5, '#f8d39a'], [1, '#e9b673']]); c.fill();
    c.fillStyle = 'rgba(255,250,230,0.5)';
    c.beginPath(); c.moveTo(9.5, 6); c.lineTo(12.5, 6); c.lineTo(8, 21.5); c.lineTo(4.5, 21.5); c.fill();
    ell(c, 15, 22, 12.5, 1.6, '#fff4d2');
    ell(c, 15, 5.6, 6.5, 1.2, '#f0c88e');
  };

  P.shelf = function (c, w, h, rnd) {
    box(c, 0, 0, 46, 62, 4, lg(c, 0, 0, 46, 0, [[0, '#c69a6c'], [1, '#956a42']]));
    [[3, 3, 26], [3, 33, 26]].forEach(function (s) {
      c.fillStyle = lg(c, 0, s[1], 0, s[1] + s[2], [[0, '#8f6a45'], [1, '#c9a47a']]); c.fillRect(s[0], s[1], 40, s[2]);
    });
    const cols = ['#c9553f', '#4f7d6a', '#5c6b8a', '#d7a04f', '#7a5f8a', '#b98a5e', '#3f6f8f'];
    function books(y0, hgt, n, off) {
      let x = 5;
      for (let i = 0; i < n; i++) {
        const bw = 4 + rnd() * 2.5, bh = hgt - rnd() * 6;
        const col = cols[(i + off) % cols.length];
        if (i === n - 1 && off === 2) {    // 마지막 한 권은 비스듬히
          c.save(); c.translate(x + 2, y0 + hgt); c.rotate(-0.28);
          box(c, 0, -bh, bw, bh, 0.8, col); c.restore();
          break;
        }
        box(c, x, y0 + hgt - bh, bw, bh, 0.8, lg(c, x, 0, x + bw, 0, [[0, col], [1, 'rgba(0,0,0,0.25)']]));
        c.fillStyle = col; c.globalAlpha = 0.85; c.fillRect(x, y0 + hgt - bh, bw * 0.7, bh); c.globalAlpha = 1;
        line(c, x + 0.6, y0 + hgt - bh + 3, x + bw - 0.6, y0 + hgt - bh + 3, 0.6, 'rgba(255,240,200,0.6)');
        line(c, x + 0.6, y0 + hgt - 3, x + bw - 0.6, y0 + hgt - 3, 0.6, 'rgba(255,240,200,0.45)');
        x += bw + 0.6;
        if (x > 38) break;
      }
    }
    books(5, 24, 7, 0);
    books(35, 24, 6, 2);
    /* 선반 판 */
    box(c, 0, 28.5, 46, 4.5, 1, lg(c, 0, 28, 0, 33, [[0, '#d9ad7f'], [1, '#93683f']]));
    box(c, 0, 58, 46, 4, 1, lg(c, 0, 58, 0, 62, [[0, '#d9ad7f'], [1, '#93683f']]));
  };

  P.poster = function (c, w, h, rnd) {
    box(c, 0.5, 1, 34, 28, 2, 'rgba(60,40,25,0.2)');
    box(c, 0, 0, 34, 28, 2, '#fdf6e6');
    /* 바다 풍경 */
    c.fillStyle = lg(c, 0, 3, 0, 17, [[0, '#a9d4ea'], [1, '#f4cfa6']]); c.fillRect(3, 3, 28, 14);
    ell(c, 24, 9, 3.5, 3.5, rg(c, 24, 9, 0.5, 3.5, [[0, '#fff3c8'], [1, '#f2a65a']]));
    c.fillStyle = '#5b8fb0'; c.fillRect(3, 13, 28, 4);
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(6, 14, 6, 0.8); c.fillRect(17, 15.5, 8, 0.8);
    c.fillStyle = '#e1cba9'; c.fillRect(3, 17, 28, 2.5);
    line(c, 5, 22, 22, 22, 1, '#8a7a66'); line(c, 5, 25, 16, 25, 0.8, '#b9aa94');
    ell(c, 17, 1.2, 1.4, 1.4, '#c9553f');
  };

  P.phone_obj = function (c, w, h, rnd) {
    box(c, 0, 0, 24, 40, 5, lg(c, 0, 0, 24, 0, [[0, '#4a4b56'], [1, '#22232a']]));
    box(c, 2.2, 3, 19.6, 34, 3, lg(c, 0, 3, 0, 37, [[0, '#bfe4f3'], [1, '#79b3cf']]));
    /* 알림 몇 줄 */
    for (let i = 0; i < 3; i++) {
      box(c, 4, 8 + i * 6, 16, 4.5, 1.5, 'rgba(255,255,255,0.75)');
      ell(c, 6, 10.2 + i * 6, 1.2, 1.2, ['#f2b56b', '#c9553f', '#4f7d6a'][i]);
    }
    c.fillStyle = 'rgba(255,255,255,0.22)';
    c.beginPath(); c.moveTo(3, 37); c.lineTo(14, 3); c.lineTo(19, 3); c.lineTo(8, 37); c.fill();
    box(c, 9, 1.2, 6, 1, 0.5, '#111');
  };

  /* ── 바깥 ─────────────────────────────────── */
  P.bench = function (c, w, h, rnd) {
    contact(c, 34, 35, 32, 2.5, 0.35);
    [[6, 24], [56, 24]].forEach(function (p) { box(c, p[0], p[1], 6, 11, 1.5, lg(c, p[0], 0, p[0] + 6, 0, [[0, '#4d4f58'], [1, '#2f3138']])); });
    plank(c, 2, 4, 64, 5.5, 2.5, '#bb9563', '#d3ad7b', '#a17a4b', rnd, 2);
    plank(c, 2, 10.5, 64, 5, 2.5, '#b58f5d', '#cda775', '#9a7446', rnd, 2);
    plank(c, 0, 16, 68, 9, 3.5, '#a8814f', '#c29a68', '#8a6638', rnd, 2);
    /* 쇠 팔걸이 */
    c.beginPath(); c.moveTo(4, 25); c.quadraticCurveTo(2, 14, 6, 6); c.lineWidth = 2; c.strokeStyle = '#3d3f48'; c.stroke();
    c.beginPath(); c.moveTo(64, 25); c.quadraticCurveTo(66, 14, 62, 6); c.stroke();
  };

  P.streetlamp = function (c, w, h, rnd) {
    contact(c, 13, 76, 9, 2, 0.4);
    box(c, 5, 71, 16, 5, 2, lg(c, 0, 71, 0, 76, [[0, '#6a7590'], [1, '#2f3650']]));
    box(c, 10, 18, 6, 55, 2.5, lg(c, 10, 0, 16, 0, [[0, '#6c789a'], [0.4, '#4b5570'], [1, '#2c3348']]));
    box(c, 8.5, 64, 9, 4, 1.5, '#3d4560');
    box(c, 8.5, 18, 9, 3, 1, '#3d4560');
    /* 등 — 유리 안의 불빛 */
    ell(c, 13, 11, 10, 10, 'rgba(255,224,160,0.25)');
    ell(c, 13, 11, 7.5, 8, rg(c, 13, 11, 0.5, 8, [[0, '#ffffff'], [0.35, '#fff1cf'], [1, '#f2c27a']]));
    c.beginPath(); c.moveTo(5, 4.5); c.lineTo(21, 4.5); c.lineTo(17, 1); c.lineTo(9, 1); c.closePath(); c.fillStyle = '#3d4560'; c.fill();
  };

  P.rock = function (c, w, h, rnd) {
    contact(c, 21, 27, 20, 3, 0.35);
    c.beginPath(); c.moveTo(2, 24); c.quadraticCurveTo(3, 12, 14, 10); c.quadraticCurveTo(26, 6, 34, 12); c.quadraticCurveTo(42, 18, 40, 26);
    c.quadraticCurveTo(22, 30, 2, 24); c.closePath();
    c.fillStyle = lg(c, 0, 8, 30, 30, [[0, '#a3adbf'], [0.5, '#7b879a'], [1, '#556073']]); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.22)'; ell(c, 15, 14, 7, 2.8, 'rgba(255,255,255,0.22)');
    line(c, 20, 13, 24, 21, 0.6, 'rgba(50,58,72,0.4)');
    for (let i = 0; i < 40; i++) { c.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(30,35,45,0.12)'; c.fillRect(5 + rnd() * 32, 12 + rnd() * 13, 0.8, 0.8); }
  };

  P.tree_big = function (c, w, h, rnd) {
    contact(c, 48, 128, 24, 3.5, 0.35);
    /* 줄기 — 껍질 결 */
    c.beginPath(); c.moveTo(39, 130); c.quadraticCurveTo(42, 100, 41, 72); c.lineTo(55, 72); c.quadraticCurveTo(54, 100, 58, 130); c.closePath();
    c.fillStyle = lg(c, 39, 0, 58, 0, [[0, '#9a7048'], [0.45, '#7d5838'], [1, '#553a24']]); c.fill();
    grain(c, 41, 74, 15, 54, rnd, 'rgba(45,28,15,0.35)', 5, true);
    /* 가지 */
    line(c, 46, 84, 34, 70, 3, '#6e4c2f'); line(c, 51, 80, 63, 66, 2.6, '#6e4c2f');
    foliage(c, [[22, 66, 24], [74, 66, 24], [48, 52, 36], [38, 36, 22], [62, 44, 20]], rnd,
      { dark: '#4f7a48', mid: '#6d9a5c', light: '#86b06c', hi: '#a6c985' });
  };

  P.bush = function (c, w, h, rnd) {
    contact(c, 30, 38, 27, 3, 0.3);
    foliage(c, [[14, 27, 12], [46, 27, 12], [30, 22, 15], [22, 17, 10]], rnd,
      { dark: '#4c7550', mid: '#66925f', light: '#7fa970', hi: '#9cc286' });
    /* 작은 꽃 몇 송이 */
    for (let i = 0; i < 5; i++) ell(c, 10 + rnd() * 40, 16 + rnd() * 16, 1.3, 1.3, rnd() < 0.5 ? '#f4e3ee' : '#f6d27a');
  };

  P.house_a = function (c, w, h, rnd) {
    /* 벽 — 회반죽 결 */
    c.fillStyle = lg(c, 0, 30, 120, 150, [[0, '#e5d2b6'], [1, '#c8b092']]); c.fillRect(0, 30, 120, 120);
    for (let i = 0; i < 260; i++) { c.fillStyle = rnd() < 0.5 ? 'rgba(255,250,240,0.18)' : 'rgba(110,80,50,0.1)'; c.fillRect(rnd() * 120, 30 + rnd() * 118, 1, 1); }
    /* 지붕 — 기와 줄 */
    c.beginPath(); c.moveTo(-6, 34); c.lineTo(126, 34); c.lineTo(60, 0); c.closePath();
    c.fillStyle = lg(c, 0, 0, 0, 34, [[0, '#c9806b'], [1, '#9d5845']]); c.fill();
    c.save(); c.clip();
    for (let y = 6; y < 34; y += 5) line(c, -6, y, 126, y, 0.8, 'rgba(90,40,30,0.35)');
    c.restore();
    line(c, -6, 34, 126, 34, 2.2, '#7d4434');
    c.fillStyle = 'rgba(40,24,14,0.18)'; c.fillRect(0, 35, 120, 4);
    /* 창 — 위층 둘, 아래층 하나 */
    [[16, 54], [74, 54], [16, 100]].forEach(function (p) {
      box(c, p[0] - 2, p[1] - 2, 30, 30, 1.5, '#8a6340');
      litWindow(c, p[0], p[1], 26, 26);
      line(c, p[0] + 13, p[1], p[0] + 13, p[1] + 26, 1.6, '#8a6340');
      line(c, p[0], p[1] + 13, p[0] + 26, p[1] + 13, 1.6, '#8a6340');
      box(c, p[0] - 3, p[1] + 26, 32, 3, 1, '#a77a4f');
    });
    /* 화분 */
    for (let i = 0; i < 4; i++) ell(c, 77 + i * 6.5, 81, 3, 2.4, i % 2 ? '#86b06c' : '#e9846c');
    /* 문 */
    box(c, 68, 94, 38, 56, 2, '#6e4c2f');
    plank(c, 70, 96, 34, 54, 1.5, '#9a7048', '#b58b5f', '#7d5838', rnd, 1);
    grain(c, 71, 97, 32, 52, rnd, 'rgba(60,35,15,0.2)', 6, true);
    box(c, 74, 100, 26, 16, 1, 'rgba(255,220,160,0.55)');
    line(c, 87, 100, 87, 116, 1, '#7d5838');
    ell(c, 98, 125, 1.8, 1.8, '#f2c27a');
    /* 바닥 띠 */
    c.fillStyle = lg(c, 0, 142, 0, 150, [[0, '#bda585'], [1, '#9c876a']]); c.fillRect(0, 142, 120, 8);
  };

  P.house_b = function (c, w, h, rnd) {
    c.fillStyle = lg(c, 0, 0, 100, 0, [[0, '#dbe1e7'], [1, '#b7c0ca']]); c.fillRect(0, 0, 100, 176);
    /* 타일 줄 */
    for (let y = 16; y < 168; y += 9) line(c, 0, y, 100, y, 0.5, 'rgba(120,130,145,0.25)');
    c.fillStyle = lg(c, 0, 0, 0, 12, [[0, '#c7cfd8'], [1, '#a3adb9']]); c.fillRect(0, 0, 100, 12);
    c.fillStyle = 'rgba(40,50,65,0.2)'; c.fillRect(0, 12, 100, 3);
    for (let r = 0; r < 4; r++) for (let col = 0; col < 3; col++) {
      const x = 10 + col * 28, y = 26 + r * 36;
      box(c, x - 1.5, y - 1.5, 23, 27, 1, '#7b8794');
      if ((r + col) % 3 === 1) litWindow(c, x, y, 20, 24);
      else glass(c, x, y, 20, 24, '#cfe5ef', '#7fa8c0');
      line(c, x, y + 12, x + 20, y + 12, 1, '#7b8794');
      box(c, x - 2.5, y + 24, 25, 2.5, 1, '#9aa5b1');
    }
    c.fillStyle = lg(c, 0, 168, 0, 176, [[0, '#8b97a4'], [1, '#606b78']]); c.fillRect(0, 168, 100, 8);
  };

  P.store_front = function (c, w, h, rnd) {
    c.fillStyle = lg(c, 0, 22, 0, 140, [[0, '#f8f5ee'], [1, '#e2dccf']]); c.fillRect(0, 22, 190, 118);
    /* 간판 */
    c.fillStyle = lg(c, 0, 0, 0, 26, [[0, '#5fb19c'], [1, '#3f8a77']]); c.fillRect(0, 0, 190, 26);
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(0, 1, 190, 2);
    /* 차양 줄무늬 */
    for (let i = 0; i < 19; i++) {
      c.fillStyle = i % 2 ? '#f6c27c' : '#fbe7c6';
      c.beginPath(); c.moveTo(i * 10, 26); c.lineTo(i * 10 + 10, 26); c.lineTo(i * 10 + 10, 32); c.quadraticCurveTo(i * 10 + 5, 36, i * 10, 32); c.fill();
    }
    c.fillStyle = 'rgba(40,30,20,0.15)'; c.fillRect(0, 34, 190, 5);
    /* 유리창 — 안쪽 선반이 비쳐 보입니다 */
    [[10, 44], [102, 44]].forEach(function (p) {
      box(c, p[0] - 2, p[1] - 2, 80, 78, 1.5, '#b9c3cf');
      c.fillStyle = lg(c, 0, p[1], 0, p[1] + 74, [[0, '#fff6dd'], [1, '#e9dcc0']]); c.fillRect(p[0], p[1], 76, 74);
      for (let s = 0; s < 3; s++) {
        const y = p[1] + 18 + s * 20;
        line(c, p[0] + 4, y, p[0] + 72, y, 1.6, '#c8b598');
        for (let k = 0; k < 9; k++) {
          const cols = ['#e97a5f', '#f2b56b', '#7fb08f', '#8fb4d9', '#e4cf6b'];
          box(c, p[0] + 6 + k * 7.4, y - 7 - rnd() * 3, 5.4, 7 + rnd() * 2, 1, cols[(k + s) % cols.length]);
        }
      }
      c.fillStyle = 'rgba(190,225,235,0.35)'; c.fillRect(p[0], p[1], 76, 74);
      c.save(); c.beginPath(); c.rect(p[0], p[1], 76, 74); c.clip();
      c.fillStyle = 'rgba(255,255,255,0.45)';
      c.beginPath(); c.moveTo(p[0] + 4, p[1] + 74); c.lineTo(p[0] + 42, p[1]); c.lineTo(p[0] + 60, p[1]); c.lineTo(p[0] + 22, p[1] + 74); c.fill();
      c.restore();
    });
    /* 문 기둥 */
    c.fillStyle = lg(c, 86, 0, 102, 0, [[0, '#e4ddd1'], [1, '#c3bbae']]); c.fillRect(86, 44, 16, 96);
    c.fillStyle = lg(c, 0, 132, 0, 140, [[0, '#9fb0c4'], [1, '#6f8299']]); c.fillRect(0, 132, 190, 8);
  };

  P.church_front = function (c, w, h, rnd) {
    /* 돌벽 — 줄눈 */
    c.fillStyle = lg(c, 20, 80, 200, 250, [[0, '#f0e7d8'], [1, '#d3c6b0']]); c.fillRect(20, 80, 180, 170);
    c.strokeStyle = 'rgba(150,130,105,0.28)'; c.lineWidth = 0.6;
    for (let r = 0; r < 17; r++) {
      const y = 84 + r * 10;
      line(c, 20, y, 200, y, 0.6, 'rgba(150,130,105,0.28)');
      for (let x = 20 + (r % 2 ? 9 : 0); x < 200; x += 18) line(c, x, y, x, y + 10, 0.6, 'rgba(150,130,105,0.22)');
    }
    /* 박공 */
    c.beginPath(); c.moveTo(10, 84); c.lineTo(210, 84); c.lineTo(110, 24); c.closePath();
    c.fillStyle = lg(c, 0, 24, 0, 84, [[0, '#e6dbc7'], [1, '#c9bba2']]); c.fill();
    c.beginPath(); c.moveTo(10, 84); c.lineTo(110, 24); c.lineTo(210, 84); c.lineWidth = 3; c.strokeStyle = '#b9a98e'; c.stroke();
    c.fillStyle = 'rgba(60,40,20,0.15)'; c.fillRect(20, 84, 180, 5);
    /* 둥근 창 (장미창) */
    ell(c, 110, 60, 11, 11, '#8a7556');
    for (let i = 0; i < 8; i++) {
      c.beginPath(); c.moveTo(110, 60); c.arc(110, 60, 9, i * Math.PI / 4, (i + 1) * Math.PI / 4); c.closePath();
      c.fillStyle = ['#8fc0d9', '#f2b56b', '#c9755a', '#9d8ac4'][i % 4]; c.fill();
    }
    ell(c, 110, 60, 3, 3, '#fff1cf');
    /* 십자가 */
    box(c, 106, 0, 8, 30, 1.5, lg(c, 106, 0, 114, 0, [[0, '#cf8a74'], [1, '#9d5845']]));
    box(c, 96, 8, 28, 7, 1.5, lg(c, 0, 8, 0, 15, [[0, '#cf8a74'], [1, '#9d5845']]));
    /* 옆 창 — 길쭉한 아치 */
    [[46, 120], [154, 120]].forEach(function (p) {
      c.beginPath(); c.moveTo(p[0], p[1] + 46); c.lineTo(p[0], p[1] + 8); c.arc(p[0] + 10, p[1] + 8, 10, Math.PI, 0); c.lineTo(p[0] + 20, p[1] + 46); c.closePath();
      c.fillStyle = '#7d6a52'; c.fill();
      c.save(); c.clip();
      c.fillStyle = lg(c, 0, p[1], 0, p[1] + 46, [[0, '#d98c74'], [0.5, '#c9755a'], [1, '#a65a44']]); c.fillRect(p[0] + 2, p[1] + 2, 16, 44);
      line(c, p[0] + 10, p[1], p[0] + 10, p[1] + 46, 1, '#6d5a44'); line(c, p[0], p[1] + 24, p[0] + 20, p[1] + 24, 1, '#6d5a44');
      c.restore();
    });
    /* 가운데 스테인드글라스 */
    c.beginPath(); c.moveTo(87, 161); c.lineTo(87, 128); c.arc(110, 128, 23, Math.PI, 0); c.lineTo(133, 161); c.closePath();
    c.fillStyle = '#5c4b3d'; c.fill();
    c.save(); c.clip();
    const cols = ['#8fc0d9', '#f2b56b', '#c9755a', '#7ba065', '#9d8ac4'];
    for (let r = 0; r < 6; r++) for (let k = 0; k < 4; k++) {
      c.fillStyle = cols[(r * 2 + k) % cols.length];
      c.fillRect(89 + k * 11, 104 + r * 10, 10, 9);
    }
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(89, 104, 44, 14);
    box(c, 107.5, 112, 5, 42, 1, '#fff1cf'); box(c, 99, 122, 22, 5, 1, '#fff1cf');
    c.restore();
    /* 정문 — 아치와 두 짝 문 */
    c.beginPath(); c.moveTo(72, 250); c.lineTo(72, 200); c.arc(110, 200, 38, Math.PI, 0); c.lineTo(148, 250); c.closePath();
    c.fillStyle = lg(c, 0, 160, 0, 250, [[0, '#b7a78c'], [1, '#9a8a70']]); c.fill();
    c.beginPath(); c.moveTo(76, 250); c.lineTo(76, 200); c.arc(110, 200, 34, Math.PI, 0); c.lineTo(144, 250); c.closePath();
    c.fillStyle = '#6e4c2f'; c.fill();
    plank(c, 80, 202, 28, 48, 1, '#a8814f', '#c09466', '#8a6340', rnd, 1);
    plank(c, 112, 202, 28, 48, 1, '#a8814f', '#c09466', '#8a6340', rnd, 1);
    grain(c, 80, 202, 28, 48, rnd, 'rgba(60,35,15,0.22)', 5, true);
    grain(c, 112, 202, 28, 48, rnd, 'rgba(60,35,15,0.22)', 5, true);
    c.beginPath(); c.arc(110, 200, 30, Math.PI, 0); c.closePath(); c.fillStyle = 'rgba(255,214,150,0.5)'; c.fill();
    ell(c, 105, 228, 1.8, 1.8, '#f2c27a'); ell(c, 115, 228, 1.8, 1.8, '#f2c27a');
    /* 계단 */
    c.fillStyle = 'rgba(80,60,40,0.18)'; c.fillRect(20, 244, 180, 6);
  };

  P.pew = function (c, w, h, rnd) {
    contact(c, 65, 39, 60, 2.5, 0.3);
    box(c, 8, 26, 8, 14, 1.5, lg(c, 8, 0, 16, 0, [[0, '#7d5838'], [1, '#553a24']]));
    box(c, 114, 26, 8, 14, 1.5, lg(c, 114, 0, 122, 0, [[0, '#7d5838'], [1, '#553a24']]));
    plank(c, 0, 0, 130, 13, 4, '#a8814f', '#c49b69', '#8a6638', rnd, 3);
    plank(c, 0, 14, 130, 13, 4, '#8f6a45', '#a8814f', '#6e4c2f', rnd, 3);
    line(c, 3, 13.5, 127, 13.5, 0.8, 'rgba(40,20,10,0.45)');
  };

  P.altar = function (c, w, h, rnd) {
    contact(c, 80, 69, 76, 3, 0.3);
    box(c, 0, 18, 160, 52, 5, lg(c, 0, 18, 0, 70, [[0, '#f0e7d8'], [1, '#cfc2ab']]));
    /* 대리석 결 */
    c.save(); rr(c, 0, 18, 160, 52, 5); c.clip();
    for (let i = 0; i < 7; i++) {
      c.beginPath(); let x = rnd() * 160, y = 18;
      c.moveTo(x, y);
      while (y < 70) { x += (rnd() - 0.5) * 10; y += 4 + rnd() * 4; c.lineTo(x, y); }
      c.lineWidth = 0.5; c.strokeStyle = 'rgba(150,135,110,0.3)'; c.stroke();
    }
    c.restore();
    /* 제대포 */
    box(c, 4, 8, 152, 16, 3, lg(c, 0, 8, 0, 24, [[0, '#ffffff'], [1, '#ece4d4']]));
    c.beginPath(); c.moveTo(4, 22); for (let x = 4; x <= 156; x += 8) c.quadraticCurveTo(x + 4, 27, x + 8, 22); c.lineTo(156, 18); c.lineTo(4, 18); c.closePath();
    c.fillStyle = '#f6f0e4'; c.fill();
    line(c, 6, 21, 154, 21, 0.8, '#d7c07f');
    /* 금빛 십자가 */
    box(c, 74, 30, 12, 32, 1.5, lg(c, 74, 0, 86, 0, [[0, '#f3dc96'], [0.5, '#d7b45f'], [1, '#a9853a']]));
    box(c, 62, 37, 36, 10, 1.5, lg(c, 0, 37, 0, 47, [[0, '#f3dc96'], [0.5, '#d7b45f'], [1, '#a9853a']]));
    ell(c, 80, 42, 3, 3, '#fff3cf');
  };

  P.stained_glass = function (c, w, h, rnd) {
    c.beginPath(); c.moveTo(0, 150); c.lineTo(0, 50); c.arc(45, 50, 45, Math.PI, 0); c.lineTo(90, 150); c.closePath();
    c.fillStyle = '#5c4b3d'; c.fill();
    c.save();
    c.beginPath(); c.moveTo(6, 146); c.lineTo(6, 50); c.arc(45, 50, 39, Math.PI, 0); c.lineTo(84, 146); c.closePath(); c.clip();
    /* 빛이 들어오는 유리 — 가운데가 가장 밝습니다 */
    const cols = ['#8fc0d9', '#f2b56b', '#c9755a', '#7ba065', '#9d8ac4', '#5f8fbf'];
    for (let r = 0; r < 14; r++) for (let k = 0; k < 8; k++) {
      const x = 4 + k * 10.5 + (r % 2 ? 5 : 0), y = 8 + r * 10.5;
      c.fillStyle = cols[Math.floor(rnd() * cols.length)];
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + 10, y + rnd() * 2); c.lineTo(x + 10 - rnd() * 2, y + 10); c.lineTo(x, y + 10); c.closePath(); c.fill();
    }
    c.fillStyle = rg(c, 45, 70, 4, 60, [[0, 'rgba(255,250,225,0.6)'], [1, 'rgba(255,250,225,0)']]); c.fillRect(0, 0, 90, 150);
    /* 납선 */
    c.strokeStyle = 'rgba(55,42,32,0.85)'; c.lineWidth = 1.2;
    for (let r = 0; r < 15; r++) line(c, 0, 8 + r * 10.5, 90, 8 + r * 10.5, 1.1, 'rgba(55,42,32,0.8)');
    for (let k = 0; k < 9; k++) line(c, 4 + k * 10.5, 0, 4 + k * 10.5, 150, 0.8, 'rgba(55,42,32,0.55)');
    /* 가운데 성작과 빛 */
    box(c, 33, 52, 24, 24, 3, 'rgba(255,248,226,0.95)');
    c.beginPath(); c.moveTo(39, 56); c.lineTo(51, 56); c.quadraticCurveTo(51, 64, 45, 65); c.quadraticCurveTo(39, 64, 39, 56); c.fillStyle = '#d7b45f'; c.fill();
    box(c, 44, 65, 2, 5, 0.5, '#d7b45f'); box(c, 40.5, 70, 9, 2, 0.8, '#d7b45f');
    ell(c, 45, 53, 3.4, 3.4, '#ffffff');
    c.restore();
    c.beginPath(); c.moveTo(6, 146); c.lineTo(6, 50); c.arc(45, 50, 39, Math.PI, 0); c.lineTo(84, 146); c.lineWidth = 2; c.strokeStyle = '#3f3228'; c.stroke();
  };

  P.sanctuary_lamp = function (c, w, h, rnd) {
    line(c, 22, 0, 22, 34, 1.4, '#8d7b5e');
    line(c, 22, 26, 12, 36, 1, '#8d7b5e'); line(c, 22, 26, 32, 36, 1, '#8d7b5e');
    ell(c, 22, 50, 20, 22, 'rgba(255,90,60,0.12)');
    box(c, 8, 34, 28, 30, 8, lg(c, 8, 0, 36, 0, [[0, '#f3dc96'], [0.5, '#d7b45f'], [1, '#9d7a33']]));
    box(c, 12, 38, 20, 24, 6, lg(c, 0, 38, 0, 62, [[0, '#e8705a'], [1, '#a5302a']]));
    ell(c, 22, 50, 7, 8, rg(c, 22, 49, 0.5, 8, [[0, '#ffffff'], [0.3, '#fff1cf'], [1, 'rgba(255,190,120,0)']]));
    line(c, 14, 40, 14, 58, 1.2, 'rgba(255,255,255,0.35)');
    box(c, 16, 64, 12, 8, 3, lg(c, 16, 0, 28, 0, [[0, '#f3dc96'], [1, '#9d7a33']]));
    ell(c, 22, 74, 3, 3, '#c9a24e');
  };

  P.candle_stand = function (c, w, h, rnd) {
    contact(c, 35, 74, 30, 3, 0.35);
    box(c, 6, 62, 58, 12, 4, lg(c, 0, 62, 0, 74, [[0, '#a8957a'], [1, '#6f5f48']]));
    box(c, 30, 44, 10, 20, 2, lg(c, 30, 0, 40, 0, [[0, '#a8957a'], [1, '#6f5f48']]));
    box(c, 2, 36, 66, 10, 4, lg(c, 0, 36, 0, 46, [[0, '#f3dc96'], [0.5, '#d7b45f'], [1, '#9d7a33']]));
    for (let i = 0; i < 5; i++) {
      const x = 8 + i * 13, hh = 22 - (i % 2) * 4;
      box(c, x, 38 - hh, 8, hh, 1.5, lg(c, x, 0, x + 8, 0, [[0, '#fffaf0'], [1, '#e2d6c2']]));
      line(c, x + 4, 38 - hh, x + 4, 36 - hh, 0.8, '#3d2c20');
      const fy = 32 - hh;
      ell(c, x + 4, fy, 7, 8, 'rgba(255,200,120,0.25)');
      c.beginPath(); c.moveTo(x + 4, fy - 6.5); c.quadraticCurveTo(x + 7.5, fy + 1, x + 4, fy + 3.5); c.quadraticCurveTo(x + 0.5, fy + 1, x + 4, fy - 6.5);
      c.fillStyle = lg(c, 0, fy - 6, 0, fy + 4, [[0, '#ffd27a'], [0.7, '#f2953b'], [1, '#f2b56b']]); c.fill();
      ell(c, x + 4, fy + 0.5, 1.4, 2.4, '#fffbe6');
      /* 녹아내린 촛농 */
      line(c, x + 1.5, 38 - hh, x + 1.5, 41 - hh + (i % 3), 1, '#f6efe0');
    }
  };

  P.soccer_ball = function (c, w, h, rnd) {
    ell(c, 12, 12, 11, 11, rg(c, 9, 8, 1, 13, [[0, '#ffffff'], [0.7, '#eef0f3'], [1, '#b9c0ca']]));
    /* 오각형 무늬 */
    function pent(x, y, r, rot) {
      c.beginPath();
      for (let i = 0; i < 5; i++) { const a = rot + i * Math.PI * 2 / 5; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      c.closePath(); c.fillStyle = '#2e3a4e'; c.fill();
    }
    c.save(); c.beginPath(); c.arc(12, 12, 11, 0, Math.PI * 2); c.clip();
    pent(12, 11.5, 3.6, -Math.PI / 2);
    [[-Math.PI / 2, 0], [-Math.PI / 2 + 1.257, 1], [-Math.PI / 2 + 2.513, 2], [-Math.PI / 2 + 3.77, 3], [-Math.PI / 2 + 5.027, 4]].forEach(function (p) {
      pent(12 + Math.cos(p[0]) * 9.6, 11.5 + Math.sin(p[0]) * 9.6, 3, p[0] + Math.PI / 5);
      line(c, 12 + Math.cos(p[0]) * 3.6, 11.5 + Math.sin(p[0]) * 3.6, 12 + Math.cos(p[0]) * 6.8, 11.5 + Math.sin(p[0]) * 6.8, 0.6, '#8e97a5');
    });
    c.restore();
    ell(c, 8.5, 7.5, 3, 2, 'rgba(255,255,255,0.7)');
    c.beginPath(); c.arc(12, 12, 10.6, 0, Math.PI * 2); c.lineWidth = 0.8; c.strokeStyle = 'rgba(60,70,85,0.5)'; c.stroke();
  };

  P.goal_post = function (c, w, h, rnd) {
    /* 그물 — 비스듬히 늘어진 줄 */
    c.strokeStyle = 'rgba(243,236,226,0.55)'; c.lineWidth = 0.7;
    for (let i = 1; i < 9; i++) { c.beginPath(); c.moveTo(6 + i * 10.9, 10); c.quadraticCurveTo(6 + i * 10.9 + 2, 40, 6 + i * 10.9, 66); c.stroke(); }
    for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(8, 8 + i * 10.5); c.quadraticCurveTo(55, 12 + i * 10.5, 102, 8 + i * 10.5); c.stroke(); }
    /* 기둥 — 둥근 쇠 */
    function post(x0, y0, x1, y1) {
      line(c, x0 + 1, y0 + 1, x1 + 1, y1 + 1, 5, 'rgba(40,30,20,0.25)');
      line(c, x0, y0, x1, y1, 5, '#e9e3d8');
      line(c, x0 - 1, y0 - (x0 === x1 ? 0 : 1), x1 - 1, y1 - (x0 === x1 ? 0 : 1), 1.4, '#ffffff');
    }
    post(6, 68, 6, 8); post(104, 68, 104, 8); post(6, 8, 104, 8);
  };

  P.bike_city = function (c, w, h, rnd) {
    function wheel(x, y) {
      c.beginPath(); c.arc(x, y, 10, 0, Math.PI * 2); c.lineWidth = 2.6; c.strokeStyle = '#2b2f37'; c.stroke();
      c.beginPath(); c.arc(x, y, 8.6, 0, Math.PI * 2); c.lineWidth = 0.8; c.strokeStyle = '#a7b0bc'; c.stroke();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(c, x, y, x + Math.cos(a) * 8.4, y + Math.sin(a) * 8.4, 0.4, '#c3cad3'); }
      ell(c, x, y, 1.6, 1.6, '#8a939f');
    }
    wheel(12, 22); wheel(40, 22);
    c.lineCap = 'round';
    line(c, 12, 22, 24, 22, 2.4, '#3d5a78'); line(c, 24, 22, 40, 22, 2.4, '#3d5a78');
    line(c, 24, 22, 20, 10, 2.4, '#4a6c8f'); line(c, 20, 10, 34, 10, 2.4, '#4a6c8f'); line(c, 34, 10, 40, 22, 2.4, '#3d5a78');
    line(c, 12, 22, 20, 10, 1.6, '#3d5a78');
    line(c, 34, 10, 35, 4, 1.8, '#50606f'); line(c, 32, 4, 38, 4, 2, '#2b2f37');
    box(c, 16, 6, 12, 4, 2, lg(c, 0, 6, 0, 10, [[0, '#5a5f6b'], [1, '#2b2f37']]));
    ell(c, 24, 22, 2.4, 2.4, '#8a939f');
    box(c, 31, 3, 14, 10, 3, lg(c, 0, 3, 0, 13, [[0, '#dc6b55'], [1, '#a8402f']]));
    line(c, 32, 5, 44, 5, 0.6, 'rgba(255,255,255,0.4)');
    c.lineCap = 'butt';
  };

  P.tree_city = function (c, w, h, rnd) {
    contact(c, 30, 95, 14, 2.5, 0.35);
    c.beginPath(); c.moveTo(26, 96); c.quadraticCurveTo(28, 72, 27, 52); c.lineTo(34, 52); c.quadraticCurveTo(33, 72, 35, 96); c.closePath();
    c.fillStyle = lg(c, 26, 0, 35, 0, [[0, '#8f6c4c'], [1, '#5a4130']]); c.fill();
    foliage(c, [[16, 46, 14], [44, 46, 14], [30, 34, 22], [24, 22, 12]], rnd,
      { dark: '#4f7442', mid: '#6a9154', light: '#84ab68', hi: '#a3c584' });
  };

  P.fountain_city = function (c, w, h, rnd) {
    contact(c, 46, 52, 44, 4, 0.3);
    ell(c, 46, 44, 44, 11, lg(c, 0, 33, 0, 55, [[0, '#d5dae1'], [1, '#98a0aa']]));
    ell(c, 46, 42, 36, 8, lg(c, 0, 34, 0, 50, [[0, '#6e9dbb'], [1, '#9cc6dd']]));
    c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, 34, 41, 8, 1.4, 'rgba(255,255,255,0.45)'); ell(c, 58, 43, 6, 1.1, 'rgba(255,255,255,0.35)');
    box(c, 41, 12, 10, 30, 4, lg(c, 41, 0, 51, 0, [[0, '#dfe3e8'], [1, '#9aa2ac']]));
    ell(c, 46, 13, 17, 5, lg(c, 0, 8, 0, 18, [[0, '#e3e7ec'], [1, '#a6aeb8']]));
    ell(c, 46, 12, 13, 3, '#8fbbd4');
    /* 물줄기 */
    c.strokeStyle = 'rgba(210,235,248,0.85)'; c.lineWidth = 1.2;
    [[-1, 1], [1, 1]].forEach(function (d) {
      c.beginPath(); c.moveTo(46, 8); c.quadraticCurveTo(46 + d[0] * 16, -2, 46 + d[0] * 26, 40); c.stroke();
    });
    line(c, 46, 9, 46, 1, 1.4, 'rgba(230,245,255,0.9)');
  };

  /* ── 2005년 밀라노 ─────────────────────────── */
  /* 덧창(persiane) 달린 창 — 밀라노 아파트의 얼굴 */
  function shutterWindow(c, x, y, w, h, rnd) {
    box(c, x - 1, y - 1, w + 2, h + 2, 2, '#7d5c40');
    litWindow(c, x + 2, y + 2, w - 4, h - 4);
    line(c, x + w / 2, y + 2, x + w / 2, y + h - 2, 1, '#7d5c40');
    /* 양옆 녹색 덧창 — 반쯤 열림 */
    [[x - 7, -1], [x + w + 1, 1]].forEach(function (p) {
      box(c, p[0], y, 6, h, 1, lg(c, p[0], 0, p[0] + 6, 0, [[0, '#5f8a6a'], [1, '#456c51']]));
      for (let k = 3; k < h - 2; k += 3) line(c, p[0] + 0.8, y + k, p[0] + 5.2, y + k, 0.6, 'rgba(25,45,30,0.45)');
    });
  }
  function stucco(c, x, y, w, h, rnd, n) {
    for (let i = 0; i < (n || w * h / 40); i++) {
      c.fillStyle = rnd() < 0.5 ? 'rgba(255,250,240,0.16)' : 'rgba(110,70,40,0.09)';
      c.fillRect(x + rnd() * w, y + rnd() * h, 1, 1);
    }
  }

  P.apart_milan = function (c, w, h, rnd) {
    box(c, 0, 16, 156, 196, 5, lg(c, 0, 16, 156, 212, [[0, '#f0d3a7'], [0.6, '#e3bf8f'], [1, '#cfa676']]));
    stucco(c, 0, 16, 156, 196, rnd);
    /* 처마 돌림띠 */
    box(c, -1, 14, 158, 11, 2, lg(c, 0, 14, 0, 25, [[0, '#f3dcb8'], [1, '#c99f6f']]));
    c.fillStyle = 'rgba(60,35,15,0.2)'; c.fillRect(0, 25, 156, 3);
    [84, 148].forEach(function (y) {
      box(c, 0, y, 156, 5, 1, lg(c, 0, y, 0, y + 5, [[0, '#f1d6ae'], [1, '#bf956a']]));
      c.fillStyle = 'rgba(60,35,15,0.14)'; c.fillRect(0, y + 5, 156, 2);
    });
    for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) {
      const x = 16 + i * 44, y = 34 + r * 64;
      shutterWindow(c, x, y, 26, 34, rnd);
      /* 쇠 난간 발코니 */
      box(c, x - 4, y + 34, 34, 4, 1, lg(c, 0, y + 34, 0, y + 38, [[0, '#a8814f'], [1, '#6e4c2f']]));
      c.strokeStyle = '#3d3a3a'; c.lineWidth = 1;
      line(c, x - 3, y + 24, x + 29, y + 24, 1.2, '#3d3a3a');
      for (let b = 0; b <= 8; b++) line(c, x - 3 + b * 4, y + 24, x - 3 + b * 4, y + 34, 0.8, '#3d3a3a');
      if ((r + i) % 2 === 0) { ell(c, x + 4, y + 22, 3.4, 2.6, '#7fa86a'); ell(c, x + 4, y + 21, 1.4, 1.4, '#e9846c'); }
    }
    /* 현관 — 아치와 큰 나무문 */
    c.beginPath(); c.moveTo(54, 212); c.lineTo(54, 166); c.arc(78, 166, 24, Math.PI, 0); c.lineTo(102, 212); c.closePath();
    c.fillStyle = lg(c, 0, 142, 0, 212, [[0, '#d9bf98'], [1, '#b89a72']]); c.fill();
    box(c, 58, 158, 40, 54, 3, '#5a4030');
    plank(c, 61, 161, 16, 51, 2, '#a8814f', '#c09466', '#8a6340', rnd, 1);
    plank(c, 79, 161, 16, 51, 2, '#a8814f', '#c09466', '#8a6340', rnd, 1);
    grain(c, 61, 161, 34, 51, rnd, 'rgba(60,35,15,0.25)', 6, true);
    ell(c, 76, 188, 2.4, 2.4, rg(c, 75.5, 187.5, 0.2, 2.4, [[0, '#fff0c2'], [1, '#c48a3a']]));
    ell(c, 80, 188, 2.4, 2.4, rg(c, 79.5, 187.5, 0.2, 2.4, [[0, '#fff0c2'], [1, '#c48a3a']]));
    /* 번지 판 */
    box(c, 106, 170, 12, 8, 1, '#3f5f8a'); line(c, 109, 174, 115, 174, 1, '#f3ece2');
  };

  P.church_milan = function (c, w, h, rnd) {
    /* 본당 */
    box(c, 30, 56, 116, 152, 4, lg(c, 30, 56, 146, 208, [[0, '#e6d7bf'], [1, '#c6b293']]));
    stucco(c, 30, 56, 116, 152, rnd);
    for (let y = 64; y < 208; y += 9) line(c, 30, y, 146, y, 0.5, 'rgba(140,115,85,0.22)');
    c.beginPath(); c.moveTo(24, 60); c.lineTo(88, 16); c.lineTo(152, 60); c.closePath();
    c.fillStyle = lg(c, 0, 16, 0, 60, [[0, '#efe3cf'], [1, '#d3c1a3']]); c.fill();
    c.beginPath(); c.moveTo(24, 60); c.lineTo(88, 16); c.lineTo(152, 60); c.lineWidth = 2.4; c.strokeStyle = '#bba57f'; c.stroke();
    box(c, 24, 56, 128, 6, 1, lg(c, 0, 56, 0, 62, [[0, '#d9c7a8'], [1, '#a8936f']]));
    /* 종탑 — 벽돌 */
    c.fillStyle = lg(c, 0, 0, 30, 0, [[0, '#d6c3a5'], [1, '#b39d7d']]); c.fillRect(0, 34, 30, 174);
    for (let y = 40; y < 208; y += 6) {
      line(c, 0, y, 30, y, 0.5, 'rgba(120,95,65,0.3)');
      for (let x = (y / 6) % 2 ? 0 : 5; x < 30; x += 10) line(c, x, y, x, y + 6, 0.5, 'rgba(120,95,65,0.22)');
    }
    c.beginPath(); c.moveTo(-2, 36); c.lineTo(15, 8); c.lineTo(32, 36); c.closePath();
    c.fillStyle = lg(c, 0, 8, 0, 36, [[0, '#9d6a52'], [1, '#7b4d3a']]); c.fill();
    box(c, 7, 54, 16, 22, 8, '#3f3128');
    c.beginPath(); c.arc(15, 66, 4.4, 0, Math.PI * 2); c.fillStyle = lg(c, 0, 61, 0, 71, [[0, '#f0d07a'], [1, '#a77b2a']]); c.fill();
    /* 십자가 */
    box(c, 86.5, 0, 4, 18, 1, lg(c, 86, 0, 91, 0, [[0, '#f3dc96'], [1, '#a9853a']]));
    box(c, 82, 5, 14, 4, 1, lg(c, 0, 5, 0, 9, [[0, '#f3dc96'], [1, '#a9853a']]));
    /* 장미창 */
    ell(c, 88, 96, 21, 21, '#b7a07c');
    for (let i = 0; i < 12; i++) {
      c.beginPath(); c.moveTo(88, 96); c.arc(88, 96, 18, i * Math.PI / 6, (i + 1) * Math.PI / 6); c.closePath();
      c.fillStyle = ['#6f8fb0', '#f2b56b', '#c9755a', '#8fb4d9', '#9d8ac4', '#7ba065'][i % 6]; c.fill();
      line(c, 88, 96, 88 + Math.cos(i * Math.PI / 6) * 18, 96 + Math.sin(i * Math.PI / 6) * 18, 0.8, '#5c4b3d');
    }
    c.beginPath(); c.arc(88, 96, 18, 0, Math.PI * 2); c.lineWidth = 1; c.strokeStyle = '#5c4b3d'; c.stroke();
    ell(c, 88, 96, 6, 6, rg(c, 88, 96, 0.5, 6, [[0, '#fff6d8'], [1, '#e8a060']]));
    /* 문 */
    c.beginPath(); c.moveTo(60, 208); c.lineTo(60, 150); c.arc(88, 150, 28, Math.PI, 0); c.lineTo(116, 208); c.closePath();
    c.fillStyle = lg(c, 0, 122, 0, 208, [[0, '#cdb894'], [1, '#a89272']]); c.fill();
    c.beginPath(); c.moveTo(64, 208); c.lineTo(64, 150); c.arc(88, 150, 24, Math.PI, 0); c.lineTo(112, 208); c.closePath();
    c.fillStyle = '#5a4030'; c.fill();
    plank(c, 69, 154, 18, 54, 2, '#a8814f', '#c09466', '#8a6340', rnd, 1);
    plank(c, 89, 154, 18, 54, 2, '#a8814f', '#c09466', '#8a6340', rnd, 1);
    c.beginPath(); c.arc(88, 150, 20, Math.PI, 0); c.closePath(); c.fillStyle = 'rgba(255,214,150,0.55)'; c.fill();
    /* 옆 창 */
    [[42, 118], [120, 118]].forEach(function (p) {
      box(c, p[0] - 1.5, p[1] - 1.5, 17, 37, 8, '#a8936f');
      box(c, p[0], p[1], 14, 34, 7, lg(c, 0, p[1], 0, p[1] + 34, [[0, '#9cb6cf'], [1, '#5f7f9f']]));
      line(c, p[0] + 7, p[1] + 2, p[0] + 7, p[1] + 34, 0.8, '#5c4b3d');
    });
  };

  P.school_milan = function (c, w, h, rnd) {
    box(c, 0, 20, 190, 136, 5, lg(c, 0, 20, 190, 156, [[0, '#d69c7c'], [1, '#b67d5e']]));
    /* 벽돌 */
    for (let y = 30; y < 156; y += 5) {
      line(c, 0, y, 190, y, 0.5, 'rgba(110,55,35,0.25)');
      for (let x = (y / 5) % 2 ? 0 : 6; x < 190; x += 12) line(c, x, y, x, y + 5, 0.5, 'rgba(110,55,35,0.18)');
    }
    box(c, -1, 18, 192, 10, 2, lg(c, 0, 18, 0, 28, [[0, '#ead5b3'], [1, '#b8946c']]));
    [60, 106].forEach(function (y) { box(c, 0, y, 190, 4, 1, lg(c, 0, y, 0, y + 4, [[0, '#f0dcbc'], [1, '#c4a47c']])); });
    for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) {
      const x = 14 + i * 34, y = 32 + r * 46;
      box(c, x, y, 22, 24, 2, '#f1e1c2');
      glass(c, x + 2, y + 2, 18, 20, '#cfe5ef', '#7fa8c0');
      line(c, x + 2, y + 11, x + 20, y + 11, 1, '#f1e1c2');
      box(c, x - 1, y + 24, 24, 2.4, 1, '#d9c39f');
    }
    /* 현관 */
    box(c, 72, 114, 46, 6, 1, lg(c, 0, 114, 0, 120, [[0, '#ecd9b8'], [1, '#b8946c']]));
    box(c, 76, 118, 38, 38, 3, '#5a4030');
    plank(c, 79, 121, 15, 35, 2, '#a8814f', '#c09466', '#8a6340', rnd, 1);
    plank(c, 96, 121, 15, 35, 2, '#a8814f', '#c09466', '#8a6340', rnd, 1);
    box(c, 81, 124, 11, 9, 1, 'rgba(200,230,240,0.7)'); box(c, 98, 124, 11, 9, 1, 'rgba(200,230,240,0.7)');
    /* 깃발 */
    line(c, 93.5, 2, 93.5, 22, 1.6, '#8a8f99');
    c.beginPath(); c.moveTo(95, 4); c.quadraticCurveTo(108, 2, 122, 10); c.quadraticCurveTo(108, 12, 95, 17); c.closePath();
    c.fillStyle = lg(c, 95, 0, 122, 0, [[0, '#f6c27c'], [1, '#e0953f']]); c.fill();
  };

  /* 밀라노의 주황색 전차 */
  P.tram_milan = function (c, w, h, rnd) {
    /* 집전봉 */
    line(c, 7.5, 12, 7.5, 4, 2.4, '#3d4a5e'); line(c, 6, 3.5, 46, 2.5, 2, '#3d4a5e');
    box(c, 0, 12, 138, 40, 7, lg(c, 0, 12, 0, 52, [[0, '#f2b759'], [0.55, '#e4a33f'], [1, '#c98a2c']]));
    c.fillStyle = 'rgba(255,245,215,0.35)'; c.fillRect(4, 14, 130, 2);
    box(c, 0, 40, 138, 12, 5, lg(c, 0, 40, 0, 52, [[0, '#d9962f'], [1, '#a8701f']]));
    line(c, 2, 41, 136, 41, 1, '#f6e3b8');
    for (let i = 0; i < 4; i++) {
      box(c, 10 + i * 32, 18, 24, 18, 3, '#2f3b52');
      glass(c, 12 + i * 32, 20, 20, 14, '#cfe6f2', '#7fa9c4');
    }
    /* 바퀴 */
    [28, 110].forEach(function (x) {
      ell(c, x, 56, 8, 8, '#25262c'); ell(c, x, 56, 5, 5, '#5f6672'); ell(c, x, 56, 2, 2, '#9aa2ae');
    });
    /* 앞등 */
    ell(c, 133, 32, 6, 6, 'rgba(255,230,170,0.35)');
    ell(c, 133, 32, 3.6, 3.6, rg(c, 132.5, 31.5, 0.3, 3.6, [[0, '#ffffff'], [1, '#f6d58f']]));
    /* 번호판 */
    box(c, 112, 15, 18, 6, 1, '#2f3b52'); line(c, 115, 18, 127, 18, 1, '#f6e3b8');
  };

  /* ── 미사와 기도 ─────────────────────────── */
  const GOLD = function (c, x0, y0, x1, y1) { return lg(c, x0, y0, x1, y1, [[0, '#fbe7a8'], [0.45, '#dcb75f'], [1, '#9c7731']]); };

  /* 사람들의 뒷머리와 어깨 — 머리색·피부색·옷이 저마다 다릅니다 */
  function crowdHead(c, x, y, rnd, opt) {
    const shirts = ['#4a5f7f', '#6f5b49', '#50607a', '#7a5f8a', '#4f7d6a', '#8a6340', '#5d7c9a', '#b0574a', '#c9a55a', '#e8e1d4'];
    const hairs = ['#2b2119', '#3b2a1e', '#1f1a17', '#5a3b26', '#8a6a42', '#c9a46a', '#2b2119'];
    const skins = ['#f1cfae', '#dcb894', '#c69a74', '#a87652', '#7d5539'];
    const sh = shirts[Math.floor(rnd() * shirts.length)];
    const w = opt.w, top = y;
    box(c, x - w / 2, top + opt.neck, w, opt.h, w * 0.38, lg(c, x - w / 2, 0, x + w / 2, 0, [[0, sh], [1, 'rgba(0,0,0,0.35)']]));
    c.fillStyle = sh; c.globalAlpha = 0.85; rr(c, x - w / 2, top + opt.neck, w * 0.75, opt.h, w * 0.38); c.fill(); c.globalAlpha = 1;
    const r = opt.r * (0.9 + rnd() * 0.2);
    ell(c, x, top + r * 0.2, r * 0.92, r, skins[Math.floor(rnd() * skins.length)]);
    const hair = hairs[Math.floor(rnd() * hairs.length)];
    c.beginPath(); c.ellipse(x, top, r * 1.02, r * 1.05, 0, Math.PI * 0.95, Math.PI * 2.05); c.lineTo(x + r, top + r * 0.5); c.quadraticCurveTo(x, top + r * 1.1, x - r, top + r * 0.5); c.closePath();
    c.fillStyle = hair; c.fill();
    ell(c, x - r * 0.35, top - r * 0.45, r * 0.35, r * 0.18, 'rgba(255,255,255,0.18)');
    const roll = rnd();
    if (roll < 0.12) { box(c, x - r, top - r * 1.05, r * 2, r * 0.8, r * 0.4, '#c9553f'); box(c, x - r * 0.2, top - r * 0.4, r * 1.6, r * 0.25, 1, '#a8402f'); }
    else if (roll < 0.2) { c.beginPath(); c.ellipse(x, top + r * 0.3, r * 1.15, r * 1.35, 0, Math.PI, 0); c.fillStyle = '#f3ece2'; c.fill(); }
  }
  P.crowd_row = function (c, w, h, rnd) {
    for (let i = 0; i < 16; i++) crowdHead(c, 8 + i * 25 + (rnd() - 0.5) * 3, 10 + (rnd() - 0.5) * 2, rnd, { w: 18, h: 30, neck: 5, r: 7 });
    /* 사이사이 깃발 */
    [[70, '#3f6f8f'], [230, '#c9553f'], [330, '#4f7d6a']].forEach(function (f) {
      line(c, f[0], 0, f[0], 22, 1, '#8a8f99');
      c.beginPath(); c.moveTo(f[0] + 1, 1); c.quadraticCurveTo(f[0] + 8, -1, f[0] + 14, 4); c.quadraticCurveTo(f[0] + 8, 8, f[0] + 1, 8); c.closePath(); c.fillStyle = f[1]; c.fill();
    });
  };
  P.sleep_row = function (c, w, h, rnd) {
    const cols = [['#6f8fae', '#45627f'], ['#8c7fa0', '#5f5476'], ['#7f9f6f', '#56744a'], ['#a8814f', '#7a5a34'], ['#5f8fae', '#3f6a88'], ['#a07f7f', '#765656']];
    for (let i = 0; i < 8; i++) {
      const x = 4 + i * 50, col = cols[i % cols.length];
      contact(c, x + 22, 40, 24, 3, 0.3);
      box(c, x, 14, 44, 26, 12, lg(c, 0, 14, 0, 40, [[0, col[0]], [1, col[1]]]));
      /* 침낭의 누빈 줄 */
      for (let k = 1; k < 4; k++) line(c, x + 12 + k * 7, 16, x + 12 + k * 7, 38, 0.8, 'rgba(255,255,255,0.18)');
      line(c, x + 4, 17, x + 40, 17, 0.8, 'rgba(255,255,255,0.3)');
      /* 얼굴과 머리 — 잠든 사람 */
      ell(c, x + 8, 17, 6.4, 6.8, ['#f1cfae', '#dcb894', '#c69a74', '#a87652'][i % 4]);
      c.beginPath(); c.ellipse(x + 8, 16, 7.2, 7.2, 0, Math.PI, Math.PI * 2); c.fillStyle = ['#2b2119', '#5a3b26', '#1f1a17', '#8a6a42'][(i + 1) % 4]; c.fill();
      line(c, x + 5.5, 19, x + 7.5, 19.4, 0.7, '#5a3b26'); line(c, x + 9, 19.4, x + 11, 19, 0.7, '#5a3b26');
      box(c, x + 1, 22, 15, 6, 3, '#f3ece2');
    }
  };
  P.altar_far = function (c, w, h, rnd) {
    ell(c, 100, 44, 70, 40, 'rgba(255,224,170,0.18)');
    box(c, 40, 40, 120, 40, 5, lg(c, 0, 40, 0, 80, [[0, '#fbf6ee'], [1, '#dcd0bc']]));
    box(c, 36, 38, 128, 7, 3, lg(c, 0, 38, 0, 45, [[0, '#ffffff'], [1, '#e8dfcf']]));
    box(c, 40, 76, 120, 8, 2, lg(c, 0, 76, 0, 84, [[0, '#d9c2a3'], [1, '#a8936f']]));
    line(c, 44, 46, 156, 46, 0.8, '#d7c07f');
    /* 십자가 */
    box(c, 96, 0, 8, 42, 1.5, lg(c, 96, 0, 104, 0, [[0, '#b58b5f'], [1, '#6e4c2f']]));
    box(c, 82, 12, 36, 8, 1.5, lg(c, 0, 12, 0, 20, [[0, '#b58b5f'], [1, '#6e4c2f']]));
    /* 촛불 둘 */
    [62, 138].forEach(function (x) {
      ell(c, x, 30, 9, 11, 'rgba(255,205,130,0.35)');
      box(c, x - 2.5, 30, 5, 10, 1, '#fffaf0');
      c.beginPath(); c.moveTo(x, 22); c.quadraticCurveTo(x + 3.2, 28, x, 31); c.quadraticCurveTo(x - 3.2, 28, x, 22);
      c.fillStyle = lg(c, 0, 22, 0, 31, [[0, '#ffe08a'], [1, '#f2953b']]); c.fill();
    });
  };
  P.wyd_cross = function (c, w, h, rnd) {
    /* 오래 들고 다닌 나무 십자가 — 결과 손때 */
    box(c, 37, 0, 16, 200, 3, lg(c, 37, 0, 53, 0, [[0, '#a87a50'], [0.5, '#8a6340'], [1, '#5f4128']]));
    grain(c, 38, 1, 14, 198, rnd, 'rgba(50,28,12,0.3)', 4, true);
    box(c, 6, 46, 78, 15, 3, lg(c, 0, 46, 0, 61, [[0, '#b58b5f'], [0.5, '#8a6340'], [1, '#5f4128']]));
    grain(c, 7, 47, 76, 13, rnd, 'rgba(50,28,12,0.3)', 3);
    c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(37, 61, 16, 4);
    line(c, 39, 2, 39, 198, 1, 'rgba(255,230,190,0.3)');
    ell(c, 45, 53.5, 3, 3, GOLD(c, 42, 50, 48, 57));
  };
  P.monstrance = function (c, w, h, rnd) {
    ell(c, 30, 40, 30, 30, 'rgba(255,236,180,0.25)');
    /* 빛살 */
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2, L = i % 2 ? 24 : 28.5;
      c.beginPath();
      c.moveTo(30 + Math.cos(a - 0.07) * 15, 40 + Math.sin(a - 0.07) * 15);
      c.lineTo(30 + Math.cos(a) * L, 40 + Math.sin(a) * L);
      c.lineTo(30 + Math.cos(a + 0.07) * 15, 40 + Math.sin(a + 0.07) * 15);
      c.closePath(); c.fillStyle = GOLD(c, 0, 12, 60, 70); c.fill();
    }
    ell(c, 30, 40, 16.5, 16.5, GOLD(c, 14, 24, 46, 56));
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ell(c, 30 + Math.cos(a) * 14.2, 40 + Math.sin(a) * 14.2, 1.3, 1.3, i % 3 ? '#fff3cf' : '#c9553f'); }
    /* 유리와 성체 */
    ell(c, 30, 40, 11.5, 11.5, '#fffaf0');
    ell(c, 30, 40, 10, 10, rg(c, 28, 38, 1, 10, [[0, '#ffffff'], [1, '#f2e7cf']]));
    line(c, 30, 34, 30, 46, 0.8, 'rgba(200,170,110,0.6)'); line(c, 24, 40, 36, 40, 0.8, 'rgba(200,170,110,0.6)');
    /* 위 십자가와 받침 */
    box(c, 28, 4, 4, 13, 1, GOLD(c, 28, 0, 32, 0)); box(c, 24, 8, 12, 3.6, 1, GOLD(c, 0, 8, 0, 12));
    box(c, 27, 57, 6, 26, 2, GOLD(c, 27, 0, 33, 0));
    ell(c, 30, 64, 5, 3, GOLD(c, 25, 61, 35, 67));
    ell(c, 30, 86, 17, 5, GOLD(c, 13, 81, 47, 91));
    ell(c, 30, 84.5, 14, 3, 'rgba(255,245,210,0.5)');
  };
  P.bible_book = function (c, w, h, rnd) {
    box(c, 1, 2, 44, 56, 4, 'rgba(40,20,15,0.25)');
    /* 책장 단면 */
    box(c, 38, 3, 6, 50, 1.5, lg(c, 38, 0, 44, 0, [[0, '#f6efe1'], [1, '#d8cdb8']]));
    for (let y = 6; y < 52; y += 2) line(c, 39, y, 43.5, y, 0.4, 'rgba(150,130,100,0.4)');
    box(c, 0, 0, 40, 56, 4, lg(c, 0, 0, 40, 56, [[0, '#7d4a3e'], [1, '#55302a']]));
    box(c, 3.5, 3, 33, 50, 3, lg(c, 0, 0, 40, 56, [[0, '#94594b'], [1, '#6b3f36']]));
    c.setLineDash([1.4, 1.2]); rr(c, 5.5, 5, 29, 46, 2); c.lineWidth = 0.6; c.strokeStyle = 'rgba(230,200,140,0.5)'; c.stroke(); c.setLineDash([]);
    box(c, 18, 12, 4, 30, 1, GOLD(c, 18, 0, 22, 0)); box(c, 11, 20, 18, 4, 1, GOLD(c, 0, 20, 0, 24));
    /* 리본 책갈피 */
    c.beginPath(); c.moveTo(30, 53); c.lineTo(30, 59); c.lineTo(32, 57); c.lineTo(34, 59); c.lineTo(34, 53); c.fillStyle = '#c9553f'; c.fill();
    line(c, 1.5, 4, 1.5, 52, 1, 'rgba(255,230,210,0.25)');
  };
  P.candle_small = function (c, w, h, rnd) {
    ell(c, 10, 9, 9, 10, 'rgba(255,200,120,0.3)');
    box(c, 5, 12, 10, 22, 3, lg(c, 5, 0, 15, 0, [[0, '#fffaf0'], [0.6, '#f3e9d6'], [1, '#d8cbb3']]));
    ell(c, 10, 12.5, 5, 1.6, '#fff6e2');
    line(c, 10, 12, 10, 9.5, 0.8, '#3d2c20');
    c.beginPath(); c.moveTo(10, 1); c.quadraticCurveTo(14, 8, 10, 11); c.quadraticCurveTo(6, 8, 10, 1);
    c.fillStyle = lg(c, 0, 1, 0, 11, [[0, '#ffe08a'], [0.6, '#f6a446'], [1, '#f2b56b']]); c.fill();
    ell(c, 10, 8, 1.6, 2.6, '#fffbe6');
    line(c, 6.5, 13, 6.5, 17, 1, '#fffaf0');
  };
  P.rosary = function (c, w, h, rnd) {
    /* 끈 */
    c.beginPath(); c.ellipse(14, 12, 9, 8, 0, 0, Math.PI * 2); c.lineWidth = 0.6; c.strokeStyle = 'rgba(80,60,90,0.6)'; c.stroke();
    line(c, 14, 20, 14, 23, 0.6, 'rgba(80,60,90,0.6)');
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      const x = 14 + Math.cos(a) * 9, y = 12 + Math.sin(a) * 8;
      ell(c, x, y, 2.2, 2.2, rg(c, x - 0.7, y - 0.7, 0.2, 2.4, [[0, '#c6a9d6'], [1, '#5f456f']]));
    }
    box(c, 12.5, 22, 3, 12, 1, GOLD(c, 12, 0, 16, 0)); box(c, 9, 25, 10, 3, 1, GOLD(c, 0, 25, 0, 28));
  };
  P.cross_small = function (c, w, h, rnd) {
    box(c, 16, 0, 9, 62, 2.5, lg(c, 16, 0, 25, 0, [[0, '#b58b5f'], [0.5, '#8a6340'], [1, '#5f4128']]));
    box(c, 4, 16, 33, 9, 2.5, lg(c, 0, 16, 0, 25, [[0, '#b58b5f'], [0.5, '#8a6340'], [1, '#5f4128']]));
    grain(c, 17, 1, 7, 60, rnd, 'rgba(50,28,12,0.3)', 2, true);
    line(c, 18, 2, 18, 60, 0.8, 'rgba(255,230,190,0.35)');
  };
  P.relic_case = function (c, w, h, rnd) {
    ell(c, 65, 52, 70, 46, 'rgba(255,224,160,0.22)');
    box(c, 0, 74, 130, 36, 6, '#6e4c2f');
    plank(c, 0, 74, 130, 34, 6, '#9a7048', '#b58b5f', '#7d5838', rnd, 4);
    box(c, 6, 78, 118, 6, 2, 'rgba(255,230,190,0.15)');
    box(c, 10, 24, 110, 54, 8, GOLD(c, 10, 24, 120, 78));
    for (let i = 0; i < 9; i++) ell(c, 18 + i * 11.8, 27, 1.4, 1.4, '#fff3cf');
    box(c, 18, 30, 94, 42, 6, 'rgba(255,250,236,0.85)');
    ell(c, 65, 52, 34, 13, 'rgba(242,181,107,0.35)');
    ell(c, 65, 52, 9, 6, rg(c, 65, 52, 0.5, 9, [[0, '#ffffff'], [1, '#f2d6a0']]));
    c.fillStyle = 'rgba(255,255,255,0.5)';
    c.beginPath(); c.moveTo(24, 70); c.lineTo(46, 32); c.lineTo(56, 32); c.lineTo(34, 70); c.fill();
    box(c, 62, 0, 6, 26, 1.5, GOLD(c, 62, 0, 68, 0)); box(c, 50, 8, 30, 6, 1.5, GOLD(c, 0, 8, 0, 14));
  };
  P.pc_crt = function (c, w, h, rnd) {
    contact(c, 30, 60, 26, 2, 0.25);
    box(c, 0, 0, 56, 48, 6, lg(c, 0, 0, 56, 48, [[0, '#ebe5d6'], [1, '#c4bca9']]));
    box(c, 5, 5, 46, 34, 4, '#2f3b52');
    box(c, 7, 7, 42, 30, 3, rg(c, 28, 22, 2, 30, [[0, '#9cc6dc'], [1, '#4f7d98']]));
    /* 화면 — 2005년의 웹페이지 */
    box(c, 9, 9, 38, 4, 1, '#d6e7f1'); box(c, 9, 15, 12, 18, 1, 'rgba(255,255,255,0.55)');
    for (let i = 0; i < 4; i++) line(c, 24, 17 + i * 4, 45, 17 + i * 4, 1, 'rgba(255,255,255,0.6)');
    c.fillStyle = 'rgba(255,255,255,0.22)'; c.beginPath(); c.moveTo(9, 36); c.lineTo(24, 8); c.lineTo(31, 8); c.lineTo(16, 36); c.fill();
    for (let y = 8; y < 37; y += 2) line(c, 7, y, 49, y, 0.3, 'rgba(0,0,0,0.08)');
    box(c, 18, 48, 20, 6, 2, '#c4bdac'); box(c, 10, 53, 36, 5, 2, lg(c, 0, 53, 0, 58, [[0, '#d6cfbf'], [1, '#a8a090']]));
    box(c, 58, 14, 20, 54, 4, lg(c, 58, 0, 78, 0, [[0, '#ebe5d6'], [1, '#bdb5a3']]));
    box(c, 61, 20, 14, 3, 1.5, '#9aa0a8'); box(c, 61, 26, 14, 3, 1.5, '#9aa0a8');
    ell(c, 68, 60, 2.4, 2.4, '#8ad07f'); ell(c, 68, 60, 4, 4, 'rgba(138,208,127,0.3)');
  };
  P.big_backpack = function (c, w, h, rnd) {
    contact(c, 30, 74, 26, 3, 0.35);
    box(c, 18, 0, 10, 14, 4, '#4d5a43'); box(c, 32, 0, 10, 14, 4, '#4d5a43');
    box(c, 4, 10, 52, 62, 12, lg(c, 4, 0, 56, 0, [[0, '#7f9470'], [0.6, '#6b7f5c'], [1, '#4f5f43']]));
    c.setLineDash([1.6, 1.4]); rr(c, 7, 13, 46, 56, 10); c.lineWidth = 0.6; c.strokeStyle = 'rgba(230,240,215,0.4)'; c.stroke(); c.setLineDash([]);
    box(c, 9, 16, 42, 26, 8, lg(c, 0, 16, 0, 42, [[0, '#8fa47c'], [1, '#6b7f5c']]));
    line(c, 12, 28, 48, 28, 1, '#4d5a43'); box(c, 27, 25, 6, 6, 1.5, '#d7a04f');
    box(c, 12, 48, 36, 16, 5, lg(c, 0, 48, 0, 64, [[0, '#647553'], [1, '#4a573f']]));
    box(c, 14, 54, 32, 4, 1, '#d7a04f');
    /* 매단 침낭 */
    box(c, 6, 66, 48, 10, 5, lg(c, 0, 66, 0, 76, [[0, '#6f8fae'], [1, '#45627f']]));
    line(c, 18, 66, 18, 76, 1.2, '#3d3a3a'); line(c, 42, 66, 42, 76, 1.2, '#3d3a3a');
    /* 순례 배지 */
    ell(c, 44, 22, 3.6, 3.6, '#f3ece2'); line(c, 44, 19.2, 44, 25, 1, '#8a6340'); line(c, 41.8, 21, 46.2, 21, 1, '#8a6340');
  };
  P.stone = function (c, w, h, rnd) {
    contact(c, 30, 42, 28, 4, 0.35);
    c.beginPath(); c.moveTo(4, 30); c.quadraticCurveTo(2, 12, 18, 8); c.quadraticCurveTo(34, 3, 46, 9); c.quadraticCurveTo(59, 18, 56, 32);
    c.quadraticCurveTo(48, 44, 28, 44); c.quadraticCurveTo(8, 43, 4, 30); c.closePath();
    c.fillStyle = lg(c, 0, 6, 40, 46, [[0, '#a3aab8'], [0.5, '#7c8290'], [1, '#575d6a']]); c.fill();
    ell(c, 22, 15, 10, 4, 'rgba(255,255,255,0.2)');
    line(c, 30, 12, 35, 26, 0.6, 'rgba(45,50,60,0.45)'); line(c, 35, 26, 42, 30, 0.6, 'rgba(45,50,60,0.45)');
    for (let i = 0; i < 60; i++) { c.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(30,35,45,0.14)'; c.fillRect(8 + rnd() * 44, 10 + rnd() * 30, 0.8, 0.8); }
  };

  /* ── 밤의 서울 ─────────────────────────── */
  P.seoul_night_block = function (c, w, h, rnd) {
    /* 먼 빌딩 — 옅게 */
    let x = -6;
    while (x < 390) {
      const bw = 26 + rnd() * 30, bh = 120 + rnd() * 110;
      c.fillStyle = 'rgba(52,66,100,0.55)'; c.fillRect(x, 260 - bh - 20, bw, bh + 20);
      x += bw + 2;
    }
    /* 가까운 빌딩 */
    const hs = [120, 180, 96, 210, 140, 170, 110];
    x = -10;
    for (let i = 0; i < hs.length; i++) {
      const bw = 46 + (i % 3) * 18, bh = hs[i], top = 260 - bh;
      c.fillStyle = lg(c, x, 0, x + bw, 0, [[0, i % 2 ? '#2f3b5c' : '#2a3452'], [1, '#1b2238']]);
      c.fillRect(x, top, bw, bh);
      line(c, x, top + 0.5, x + bw, top + 0.5, 1, 'rgba(160,180,220,0.35)');
      /* 옥상 — 물탱크나 안테나 */
      if (i % 3 === 0) { box(c, x + bw * 0.6, top - 8, 12, 8, 1, '#232b44'); }
      else { line(c, x + bw * 0.3, top, x + bw * 0.3, top - 14, 1, '#4a5578'); ell(c, x + bw * 0.3, top - 14, 1.6, 1.6, '#ff6a5a'); }
      /* 창 — 몇 개만 켜져 있고 색이 조금씩 다릅니다 */
      const cols = Math.max(2, Math.floor((bw - 8) / 11));
      for (let r = 0; top + 10 + r * 13 < 254; r++) {
        for (let k = 0; k < cols; k++) {
          const wx = x + 6 + k * 11, wy = top + 10 + r * 13;
          const on = rnd();
          let col = 'rgba(20,26,44,0.6)';
          if (on < 0.32) col = rnd() < 0.7 ? '#f6d79a' : '#cfe3ff';
          else if (on < 0.4) col = 'rgba(246,215,154,0.45)';
          c.fillStyle = col; c.fillRect(wx, wy, 6, 7);
        }
      }
      x += bw + 12;
    }
    /* 간판 몇 개 */
    [[30, 212, '#ef7f6a'], [176, 206, '#6fc2b0'], [300, 218, '#f2c46b']].forEach(function (p) {
      box(c, p[0] - 1, p[1] - 1, 34, 12, 2, 'rgba(255,255,255,0.12)');
      box(c, p[0], p[1], 32, 10, 2, p[2]);
      line(c, p[0] + 5, p[1] + 5, p[0] + 26, p[1] + 5, 1.6, 'rgba(255,255,255,0.75)');
    });
    /* 거리의 불빛 */
    c.fillStyle = lg(c, 0, 220, 0, 260, [[0, 'rgba(255,200,130,0)'], [1, 'rgba(255,200,130,0.35)']]); c.fillRect(0, 220, 390, 40);
  };
  P.vigil_stage = function (c, w, h, rnd) {
    /* 지붕 트러스 */
    line(c, 10, 22, 250, 22, 2, '#5a6488');
    for (let x = 10; x < 250; x += 12) { line(c, x, 22, x + 6, 16, 0.8, '#5a6488'); line(c, x + 6, 16, x + 12, 22, 0.8, '#5a6488'); }
    line(c, 10, 16, 250, 16, 1.2, '#5a6488');
    /* 조명 — 위에서 아래로 */
    [46, 98, 162, 214].forEach(function (x, i) {
      c.beginPath(); c.moveTo(x - 3, 24); c.lineTo(x + 3, 24); c.lineTo(x + 28, 90); c.lineTo(x - 28, 90); c.closePath();
      c.fillStyle = lg(c, 0, 24, 0, 90, [[0, 'rgba(255,240,205,0.45)'], [1, 'rgba(255,240,205,0)']]); c.fill();
      box(c, x - 4, 20, 8, 6, 2, '#2a3048'); ell(c, x, 26, 2.6, 1.6, '#fff4d6');
    });
    /* 무대 */
    box(c, 0, 62, 260, 26, 6, lg(c, 0, 62, 0, 88, [[0, '#3f4870'], [1, '#22283f']]));
    box(c, 0, 58, 260, 7, 3, lg(c, 0, 58, 0, 65, [[0, '#f3ece2'], [1, '#c9bfae']]));
    /* 무대 뒤 천과 십자가 */
    box(c, 70, 26, 120, 34, 4, lg(c, 0, 26, 0, 60, [[0, '#f6efe1'], [1, '#d9cdb6']]));
    box(c, 127, 30, 6, 28, 1, '#8a6340'); box(c, 117, 36, 26, 5, 1, '#8a6340');
    /* 제대와 촛불 */
    box(c, 104, 50, 52, 10, 2, '#fbf6ee');
    [110, 150].forEach(function (x) { box(c, x - 1.5, 44, 3, 6, 1, '#fffaf0'); ell(c, x, 42.5, 1.6, 2.6, '#ffd27a'); ell(c, x, 42.5, 5, 5, 'rgba(255,210,130,0.3)'); });
    /* 양쪽 스크린 */
    [[14, 30], [206, 30]].forEach(function (p) {
      box(c, p[0], p[1], 40, 26, 2, '#1b2238');
      box(c, p[0] + 2, p[1] + 2, 36, 22, 1, rg(c, p[0] + 20, p[1] + 13, 1, 22, [[0, '#ffe7b8'], [1, '#c98a4a']]));
    });
  };

  /* ── 하늘 (영상 장면의 배경) ─────────────────── */
  const SKY = {};
  SKY.sky_night = function (c, w, h) {
    c.fillStyle = lg(c, 0, 0, 0, h, [[0, '#0b1530'], [0.25, '#16264b'], [0.5, '#2f4372'], [0.68, '#59628c'], [0.8, '#a2849a'], [0.9, '#dc9c86'], [1, '#f3bd8f']]);
    c.fillRect(0, 0, w, h);
  };

  /* 다른 파일(Townscape 등)이 그림을 더하거나 더 정밀한 그림으로 바꿀 때 */
  function add(key, fn) { P[key] = fn; }
  function has(key) { return !!P[key]; }
  function paint(key, ctx, w, h) {
    const rnd = seed(key);
    ctx.save();
    ctx.lineJoin = 'round';
    P[key](ctx, w, h, rnd);
    ctx.restore();
  }

  return { has: has, paint: paint, add: add, SKY: SKY,
    brush: { seed: seed, rr: rr, lg: lg, rg: rg, box: box, ell: ell, line: line, clipRR: clipRR,
      grain: grain, plank: plank, glass: glass, litWindow: litWindow, foliage: foliage, contact: contact } };
})();
