/* DAY 5 에서 더 필요한 그림 — 지하철, WYD 안내구역, 축제 부스, 화해의 공원, 성소 박람회.
   DAY 1~4 와 마찬가지로 모두 코드로 직접 그립니다. */

TextureFactory.createDay5 = function (scene) {
  const make = TextureFactory.make;
  const person = TextureFactory.person;
  const canvasTex = TextureFactory.canvasTex;

  /* ── 하늘 ───────────────────────────────────── */
  canvasTex(scene, 'sky_seoul_day', 8, 400, function (ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0.00, '#6fb3dd');
    grd.addColorStop(0.42, '#a9d3ea');
    grd.addColorStop(0.76, '#dfeaf0');
    grd.addColorStop(1.00, '#f4e7d2');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  });
  canvasTex(scene, 'sky_seoul_night', 8, 844, function (ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0.00, '#0e1830');
    grd.addColorStop(0.40, '#1d2c4e');
    grd.addColorStop(0.72, '#33405f');
    grd.addColorStop(1.00, '#55536a');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  });

  /* ── 세계에서 온 청년들 ─────────────────────── */
  const pilgrims = [
    { key: 'pilgrim_a', skin: 0xe8b98c, hair: 0x2a1c14, shirt: 0xe0a04a, pants: 0x4a5f7f, shoes: 0xf3ece2 },
    { key: 'pilgrim_b', skin: 0x9a6b4a, hair: 0x1b1310, shirt: 0x4f8f7a, pants: 0x3b4a5e, shoes: 0xe8e2d6 },
    { key: 'pilgrim_c', skin: 0xf7dcc0, hair: 0xc9a25e, shirt: 0xc06a86, pants: 0x5a5f78, shoes: 0xffffff },
    { key: 'pilgrim_d', skin: 0xf3d6b4, hair: 0x201812, shirt: 0x6d84c0, pants: 0x3a4152, shoes: 0xe6ded2 },
    { key: 'pilgrim_e', skin: 0xd9a274, hair: 0x2e2016, shirt: 0x8e6fae, pants: 0x4c4a5c, shoes: 0xf0e9dd },
    { key: 'pilgrim_f', skin: 0xf6d3b0, hair: 0x4a3020, shirt: 0x6faa5c, pants: 0x59605e, shoes: 0xefe7da }
  ];
  pilgrims.forEach(function (p) {
    make(scene, p.key, 32, 46, function (g) {
      person(g, { skin: p.skin, hair: p.hair, shirt: p.shirt, pants: p.pants, shoes: p.shoes });
    });
    make(scene, p.key + '_back', 32, 46, function (g) {
      person(g, {
        skin: p.skin, hair: p.hair, shirt: p.shirt, pants: p.pants, shoes: p.shoes,
        back: true, bag: 0x8a6340
      });
    });
  });

  /* 수도자와 사제 */
  make(scene, 'sister_front', 32, 46, function (g) {
    person(g, { skin: 0xf3cdaa, hair: 0x3a4a5e, shirt: 0x50607a, pants: 0x50607a, shoes: 0x3a3a44 });
    g.fillStyle(0x50607a, 1); g.fillRoundedRect(5, 1, 22, 12, 5);   // 베일
    g.fillStyle(0xf3cdaa, 1); g.fillCircle(16, 9, 6.4);
    g.fillStyle(0x3b2b22, 1); g.fillCircle(13.4, 9, 1.3); g.fillCircle(18.6, 9, 1.3);
    g.fillStyle(0xf3ece2, 1); g.fillRect(14, 18, 4, 8); g.fillRect(12, 20, 8, 3);
  });
  make(scene, 'priest_front', 32, 46, function (g) {
    person(g, { skin: 0xf6d3b0, hair: 0x4a4038, shirt: 0x2f333c, pants: 0x2f333c, shoes: 0x2a2a30 });
    g.fillStyle(0xf3ece2, 1); g.fillRect(12, 17, 8, 3);             // 로만칼라
  });

  /* ── 지하철 ─────────────────────────────────── */
  make(scene, 'train_wall', 48, 48, function (g) {
    g.fillStyle(0xdfe6ec, 1); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0xd2dae2, 0.7); g.fillRect(0, 44, 48, 4);
  });
  make(scene, 'train_floor', 48, 48, function (g) {
    g.fillStyle(0x9aa6b2, 1); g.fillRect(0, 0, 48, 48);
    g.lineStyle(1, 0x8e9aa6, 1); g.strokeRect(0.5, 0.5, 47, 47);
    g.fillStyle(0xa7b3bf, 0.6); g.fillRect(6, 6, 14, 14); g.fillRect(28, 28, 14, 14);
  });
  make(scene, 'train_seat', 150, 54, function (g) {
    g.fillStyle(0x5d7c9a, 1); g.fillRoundedRect(0, 8, 150, 34, 8);
    g.fillStyle(0x6f90b0, 1); g.fillRoundedRect(4, 4, 142, 24, 8);
    g.lineStyle(2, 0x4a6379, 0.6);
    g.lineBetween(50, 6, 50, 40); g.lineBetween(100, 6, 100, 40);
    g.fillStyle(0x8fa2b8, 1); g.fillRect(6, 42, 138, 6);
  });
  make(scene, 'train_window', 120, 74, function (g) {
    g.fillStyle(0xb9c4cf, 1); g.fillRoundedRect(0, 0, 120, 74, 10);
    g.fillStyle(0x86b6d6, 1); g.fillRoundedRect(6, 6, 108, 62, 7);
    g.fillStyle(0xdfeef6, 0.55); g.fillTriangle(10, 66, 66, 8, 92, 8);
    g.fillStyle(0x9aa6b2, 1); g.fillRect(0, 70, 120, 4);
  });
  make(scene, 'train_door', 110, 150, function (g) {
    g.fillStyle(0xc6ced7, 1); g.fillRoundedRect(0, 0, 110, 150, 6);
    g.fillStyle(0xdfe6ec, 1); g.fillRect(4, 4, 48, 142); g.fillRect(58, 4, 48, 142);
    g.fillStyle(0x86b6d6, 1); g.fillRoundedRect(10, 14, 36, 56, 5); g.fillRoundedRect(64, 14, 36, 56, 5);
    g.fillStyle(0xf2b56b, 1); g.fillRect(52, 0, 6, 150);
  });
  make(scene, 'hand_strap', 26, 70, function (g) {
    g.lineStyle(3, 0x8a939c, 1); g.lineBetween(13, 0, 13, 44);
    g.lineStyle(4, 0xe0e6ec, 1);
    g.beginPath(); g.arc(13, 54, 10, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360)); g.strokePath();
  });
  make(scene, 'subway_sign', 130, 46, function (g) {
    g.fillStyle(0x2f6b8f, 0.96); g.fillRoundedRect(0, 0, 130, 46, 8);
    g.fillStyle(0xf3ece2, 1); g.fillRoundedRect(8, 12, 20, 20, 4);
    g.fillStyle(0x2f6b8f, 1); g.fillRoundedRect(12, 16, 12, 8, 2);
    g.fillStyle(0xfff8ec, 1); g.fillRect(40, 16, 54, 5); g.fillRect(40, 26, 34, 5);
    g.fillTriangle(104, 14, 120, 23, 104, 32);
  });

  /* ── WYD 안내구역 ──────────────────────────── */
  make(scene, 'wyd_arch', 320, 150, function (g) {
    g.fillStyle(0xe0954a, 1); g.fillRoundedRect(0, 0, 320, 44, 10);
    g.fillStyle(0xfff8ec, 1); g.fillRect(28, 14, 62, 8); g.fillRect(100, 14, 26, 8);
    g.fillRect(136, 14, 44, 8); g.fillRect(190, 14, 74, 8);
    g.fillStyle(0xf2b56b, 1); g.fillRect(18, 44, 16, 106); g.fillRect(286, 44, 16, 106);
    g.fillStyle(0x8fc0d9, 0.5); g.fillRoundedRect(40, 54, 240, 40, 8);
  });
  make(scene, 'flag_row', 200, 70, function (g) {
    const cols = [0xc9553f, 0x3f6f8f, 0x7a5f8a, 0x4f7d6a, 0xd7a04f, 0x6d84c0];
    for (let i = 0; i < 6; i++) {
      const x = 6 + i * 32;
      g.lineStyle(3, 0x8a939c, 1); g.lineBetween(x, 10, x, 70);
      g.fillStyle(cols[i], 0.95);
      g.fillTriangle(x, 12, x + 24, 20, x, 34);
    }
  });
  make(scene, 'guide_desk', 130, 74, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(0, 22, 130, 44, 6);
    g.fillStyle(0xb98a5e, 1); g.fillRoundedRect(0, 16, 130, 14, 6);
    g.fillStyle(0xf3ece2, 1); g.fillRoundedRect(14, 30, 40, 26, 3);
    g.fillStyle(0x3f6f8f, 1); g.fillRect(18, 34, 32, 4); g.fillRect(18, 42, 20, 4);
    g.fillStyle(0xf2b56b, 1); g.fillRoundedRect(76, 28, 40, 30, 4);
  });

  /* ── 청년축제 ──────────────────────────────── */
  make(scene, 'booth_tent', 150, 120, function (g) {
    g.fillStyle(0xf3ece2, 1); g.fillRect(10, 46, 130, 74);
    g.fillStyle(0xc9553f, 1); g.fillTriangle(0, 48, 150, 48, 75, 4);
    g.fillStyle(0xe0954a, 1); g.fillTriangle(0, 48, 34, 48, 17, 26);
    g.fillTriangle(58, 48, 92, 48, 75, 26);
    g.fillTriangle(116, 48, 150, 48, 133, 26);
    g.fillStyle(0x8a6340, 1); g.fillRect(12, 46, 8, 74); g.fillRect(130, 46, 8, 74);
    g.fillStyle(0xdfe6ec, 1); g.fillRoundedRect(38, 62, 74, 34, 4);
  });
  make(scene, 'stage_festival', 300, 130, function (g) {
    g.fillStyle(0x3a3350, 1); g.fillRoundedRect(0, 30, 300, 86, 8);
    g.fillStyle(0x4a4268, 1); g.fillRoundedRect(8, 36, 284, 60, 6);
    g.fillStyle(0x8a6340, 1); g.fillRect(0, 110, 300, 20);
    g.fillStyle(0xf2b56b, 0.8);
    for (let i = 0; i < 5; i++) g.fillCircle(34 + i * 58, 24, 7);
    g.fillStyle(0xfff8ec, 0.18);
    for (let i = 0; i < 5; i++) g.fillTriangle(34 + i * 58, 26, 14 + i * 58, 110, 54 + i * 58, 110);
  });
  make(scene, 'drum_small', 54, 46, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(4, 10, 46, 32, 6);
    g.fillStyle(0xf3ece2, 1); g.fillEllipse(27, 12, 46, 14);
    g.fillStyle(0xc9755a, 1); g.fillRect(4, 24, 46, 4);
  });
  make(scene, 'cloth_big', 300, 180, function (g) {
    g.fillStyle(0xf3ece2, 1); g.fillRoundedRect(0, 0, 300, 180, 8);
    g.lineStyle(3, 0xd9c2a3, 1); g.strokeRoundedRect(2, 2, 296, 176, 8);
    g.fillStyle(0xe6d7bd, 0.5);
    for (let i = 0; i < 6; i++) g.fillRect(0, 28 + i * 28, 300, 1);
  });

  /* ── 화해의 공원 ───────────────────────────── */
  make(scene, 'park_gate', 220, 130, function (g) {
    g.fillStyle(0x6f9b6a, 1); g.fillRoundedRect(0, 24, 220, 16, 8);
    g.fillStyle(0x8a6340, 1); g.fillRect(10, 36, 14, 94); g.fillRect(196, 36, 14, 94);
    g.fillStyle(0xf3ece2, 0.95); g.fillRoundedRect(52, 48, 116, 34, 6);
    g.fillStyle(0x4f7d6a, 1); g.fillRect(62, 58, 96, 5); g.fillRect(62, 68, 62, 5);
    g.fillStyle(0xd7a04f, 1); g.fillRect(106, 4, 8, 24); g.fillRect(96, 10, 28, 8);
  });
  make(scene, 'confess_box', 110, 150, function (g) {
    g.fillStyle(0x6f5b49, 1); g.fillRoundedRect(0, 0, 110, 150, 8);
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(6, 8, 98, 136, 6);
    g.fillStyle(0x5c4a3a, 1); g.fillRoundedRect(18, 24, 74, 106, 5);
    g.fillStyle(0x3f3229, 1);
    for (let i = 0; i < 5; i++) g.fillRect(26, 40 + i * 12, 58, 4);
    g.fillStyle(0xd7a04f, 1); g.fillRect(52, 8, 6, 16); g.fillRect(44, 12, 22, 6);
  });
  make(scene, 'park_tree_soft', 120, 140, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(52, 78, 16, 62, 4);
    g.fillStyle(0x6f9b6a, 1);
    g.fillCircle(60, 60, 40); g.fillCircle(30, 74, 26); g.fillCircle(92, 74, 26);
    g.fillStyle(0x86b07d, 0.8); g.fillCircle(50, 50, 22);
  });

  /* ── 성소 박람회 ───────────────────────────── */
  make(scene, 'fair_booth', 120, 110, function (g) {
    g.fillStyle(0xf3ece2, 1); g.fillRoundedRect(0, 26, 120, 84, 6);
    g.fillStyle(0x3f6f8f, 1); g.fillRoundedRect(0, 8, 120, 26, 6);
    g.fillStyle(0xfff8ec, 1); g.fillRect(14, 18, 60, 6);
    g.fillStyle(0xdfe6ec, 1); g.fillRoundedRect(10, 44, 100, 46, 4);
    g.fillStyle(0xd9c2a3, 1); g.fillRect(10, 96, 100, 8);
  });
  make(scene, 'screen_stand', 96, 110, function (g) {
    g.fillStyle(0x3a3a44, 1); g.fillRoundedRect(0, 0, 96, 66, 6);
    g.fillStyle(0x86b6d6, 1); g.fillRoundedRect(5, 5, 86, 56, 4);
    g.fillStyle(0xfff8ec, 0.7); g.fillRect(14, 16, 44, 5); g.fillRect(14, 28, 62, 5); g.fillRect(14, 40, 34, 5);
    g.fillStyle(0x6f5b49, 1); g.fillRect(42, 66, 12, 34); g.fillRect(26, 100, 44, 10);
  });

  /* ── 개막미사 · 밤 ─────────────────────────── */
  make(scene, 'altar_far', 200, 90, function (g) {
    g.fillStyle(0xf3ece2, 1); g.fillRoundedRect(40, 40, 120, 40, 5);
    g.fillStyle(0xd9c2a3, 1); g.fillRect(40, 76, 120, 8);
    g.fillStyle(0x8a6340, 1); g.fillRect(96, 0, 8, 42); g.fillRect(82, 12, 36, 8);
    g.fillStyle(0xf2b56b, 0.9); g.fillCircle(62, 36, 4); g.fillCircle(138, 36, 4);
  });
  make(scene, 'crowd_row', 390, 40, function (g) {
    const cols = [0x4a5f7f, 0x6f5b49, 0x50607a, 0x7a5f8a, 0x4f7d6a, 0x8a6340, 0x5d7c9a];
    for (let i = 0; i < 16; i++) {
      const x = 8 + i * 25, c = cols[i % cols.length];
      g.fillStyle(c, 1); g.fillRoundedRect(x - 8, 14, 17, 26, 6);
      g.fillStyle(0xdcb894, 1); g.fillCircle(x, 10, 7);
      g.fillStyle(0x2b2119, 1);
      g.slice(x, 10, 7.2, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
      g.fillPath();
    }
  });
  make(scene, 'seoul_night_block', 390, 260, function (g) {
    const hs = [120, 180, 96, 210, 140, 170, 110];
    let x = -10;
    for (let i = 0; i < hs.length; i++) {
      const w = 46 + (i % 3) * 18, h = hs[i];
      g.fillStyle(i % 2 === 0 ? 0x25304a : 0x2c3856, 1);
      g.fillRect(x, 260 - h, w, h);
      g.fillStyle(0xf6d79a, 0.55);
      for (let r = 0; r < Math.floor(h / 34); r++)
        for (let c = 0; c < 2; c++) g.fillRect(x + 10 + c * 20, 260 - h + 16 + r * 34, 11, 9);
      x += w + 12;
    }
  });
  make(scene, 'step_plate', 96, 32, function (g) {
    g.fillStyle(0xf2b56b, 0.28); g.fillEllipse(48, 16, 92, 28);
    g.lineStyle(2, 0xf2b56b, 0.8); g.strokeEllipse(48, 16, 92, 28);
  });
  make(scene, 'wyd_band', 60, 26, function (g) {
    g.fillStyle(0xe0954a, 1); g.fillRoundedRect(0, 6, 60, 14, 7);
    g.fillStyle(0xfff8ec, 1); g.fillRect(10, 11, 16, 4); g.fillRect(30, 11, 8, 4); g.fillRect(42, 11, 10, 4);
  });
};
