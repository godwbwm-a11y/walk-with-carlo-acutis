/* DAY 6 에서 더 필요한 그림 — 순례길, 철야 들판, 돗자리와 침낭, 새벽 하늘. */

TextureFactory.createDay6 = function (scene) {
  const make = TextureFactory.make;
  const canvasTex = TextureFactory.canvasTex;

  /* ── 하늘 ───────────────────────────────────── */
  canvasTex(scene, 'sky_dawn', 8, 500, function (ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0.00, '#1f2b4d');
    grd.addColorStop(0.26, '#4a3f6b');
    grd.addColorStop(0.50, '#9a5f7a');
    grd.addColorStop(0.72, '#e08a6a');
    grd.addColorStop(0.88, '#f3b073');
    grd.addColorStop(1.00, '#f8dda6');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  });
  canvasTex(scene, 'sky_vigil', 8, 620, function (ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0.00, '#080e1f');
    grd.addColorStop(0.38, '#131e3c');
    grd.addColorStop(0.72, '#22304f');
    grd.addColorStop(1.00, '#3a4160');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  });
  canvasTex(scene, 'sky_afternoon', 8, 400, function (ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0.00, '#7cb8dd');
    grd.addColorStop(0.44, '#b6d7ea');
    grd.addColorStop(0.78, '#e8e4d8');
    grd.addColorStop(1.00, '#f2dfba');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  });

  /* ── 길과 들판 ─────────────────────────────── */
  make(scene, 'road_pilgrim', 48, 48, function (g) {
    g.fillStyle(0xb9ae99, 1); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0xc2b7a2, 0.7); g.fillRect(0, 0, 48, 4);
    g.fillStyle(0xaea393, 0.6); g.fillCircle(12, 30, 3); g.fillCircle(36, 14, 2.4);
  });
  make(scene, 'field_grass', 48, 48, function (g) {
    g.fillStyle(0x8ea173, 1); g.fillRect(0, 0, 48, 48);
    g.lineStyle(2, 0x7d9165, 0.7);
    g.lineBetween(8, 40, 11, 30); g.lineBetween(26, 44, 29, 34); g.lineBetween(40, 22, 43, 12);
  });
  make(scene, 'shade_tent', 170, 110, function (g) {
    g.fillStyle(0x6f9b6a, 0.95); g.fillTriangle(0, 44, 170, 44, 85, 2);
    g.fillStyle(0x5d8659, 0.95); g.fillRect(0, 44, 170, 12);
    g.fillStyle(0x8a6340, 1); g.fillRect(10, 54, 9, 56); g.fillRect(151, 54, 9, 56);
    g.fillStyle(0x000000, 0.10); g.fillEllipse(85, 106, 150, 14);
  });

  /* ── 짐 ────────────────────────────────────── */
  make(scene, 'mat_ground', 132, 76, function (g) {
    g.fillStyle(0x4f7d9b, 0.95); g.fillRoundedRect(0, 0, 132, 76, 8);
    g.fillStyle(0x5f8fad, 1); g.fillRoundedRect(5, 5, 122, 66, 6);
    g.lineStyle(2, 0x44708c, 0.8);
    g.lineBetween(5, 27, 127, 27); g.lineBetween(5, 49, 127, 49);
  });
  make(scene, 'big_backpack', 60, 78, function (g) {
    g.fillStyle(0x6b7f5c, 1); g.fillRoundedRect(4, 10, 52, 62, 12);
    g.fillStyle(0x7d9169, 1); g.fillRoundedRect(9, 16, 42, 26, 8);
    g.fillStyle(0x5a6a4e, 1); g.fillRoundedRect(12, 48, 36, 16, 5);
    g.fillStyle(0xd7a04f, 1); g.fillRect(14, 54, 32, 4);
    g.fillStyle(0x4d5a43, 1); g.fillRoundedRect(18, 0, 10, 14, 4); g.fillRoundedRect(32, 0, 10, 14, 4);
  });
  make(scene, 'water_bottle', 26, 58, function (g) {
    g.fillStyle(0x9fd0e6, 0.9); g.fillRoundedRect(3, 12, 20, 44, 6);
    g.fillStyle(0xdff0f8, 0.8); g.fillRoundedRect(6, 16, 6, 34, 3);
    g.fillStyle(0x3f6f8f, 1); g.fillRoundedRect(7, 2, 12, 12, 3);
  });
  make(scene, 'cap_item', 44, 26, function (g) {
    g.fillStyle(0xc9553f, 1); g.fillRoundedRect(6, 4, 30, 16, 8);
    g.fillStyle(0xb14a37, 1); g.fillRoundedRect(0, 16, 44, 7, 3);
  });
  make(scene, 'shoe_item', 46, 26, function (g) {
    g.fillStyle(0xf3f6fa, 1); g.fillRoundedRect(2, 6, 34, 15, 6);
    g.fillStyle(0xe0e6ee, 1); g.fillRoundedRect(2, 16, 42, 8, 4);
    g.lineStyle(2, 0xc3ccd8, 1); g.lineBetween(10, 10, 22, 14); g.lineBetween(22, 10, 10, 14);
  });
  make(scene, 'sock_item', 34, 32, function (g) {
    g.fillStyle(0xf0ece2, 1); g.fillRoundedRect(6, 2, 13, 20, 5);
    g.fillRoundedRect(6, 18, 26, 12, 6);
    g.fillStyle(0xc9755a, 1); g.fillRect(6, 4, 13, 4);
  });
  make(scene, 'powerbank', 30, 46, function (g) {
    g.fillStyle(0x3a3a44, 1); g.fillRoundedRect(2, 4, 26, 38, 5);
    g.fillStyle(0x6fbf8a, 1); g.fillRect(7, 12, 16, 5);
    g.fillStyle(0x5a5a66, 1); g.fillRect(7, 22, 16, 3); g.fillRect(7, 28, 10, 3);
  });
  make(scene, 'trash_bit', 22, 18, function (g) {
    g.fillStyle(0xe7e0d2, 1); g.fillRoundedRect(1, 3, 20, 12, 4);
    g.fillStyle(0xcfc6b5, 1); g.fillRect(5, 7, 12, 3);
  });
  make(scene, 'note_small', 34, 42, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(0, 0, 34, 42, 4);
    g.fillStyle(0xf6efe1, 1); g.fillRoundedRect(4, 3, 27, 36, 3);
    g.fillStyle(0xc9755a, 1); g.fillRect(8, 10, 18, 3); g.fillRect(8, 18, 12, 3);
    g.fillStyle(0xd7a04f, 1); g.fillRect(0, 14, 4, 12);
  });

  /* ── 철야 장소 ─────────────────────────────── */
  make(scene, 'wyd_cross', 90, 200, function (g) {
    g.fillStyle(0x8a6340, 1);
    g.fillRoundedRect(37, 0, 16, 200, 4);
    g.fillRoundedRect(6, 46, 78, 15, 4);
    g.fillStyle(0xa87a50, 0.8);
    g.fillRect(40, 4, 5, 192);
  });
  make(scene, 'vigil_stage', 260, 100, function (g) {
    g.fillStyle(0x2f3550, 1); g.fillRoundedRect(0, 26, 260, 62, 8);
    g.fillStyle(0x3d4568, 1); g.fillRoundedRect(8, 32, 244, 42, 6);
    g.fillStyle(0xf2b56b, 0.75); g.fillCircle(46, 20, 6); g.fillCircle(214, 20, 6);
    g.fillStyle(0xf3ece2, 0.20);
    g.fillTriangle(46, 22, 16, 88, 76, 88);
    g.fillTriangle(214, 22, 184, 88, 244, 88);
  });
  make(scene, 'sleep_row', 390, 46, function (g) {
    const cols = [0x5d7c9a, 0x7a6f8a, 0x6f8f5f, 0x8a6340, 0x4f7d9b, 0x8f6f6f];
    for (let i = 0; i < 8; i++) {
      const x = 4 + i * 50;
      g.fillStyle(cols[i % cols.length], 0.95);
      g.fillRoundedRect(x, 14, 44, 26, 12);
      g.fillStyle(0xdcb894, 1); g.fillCircle(x + 8, 16, 7);
      g.fillStyle(0x2b2119, 1);
      g.slice(x + 8, 16, 7.2, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
      g.fillPath();
    }
  });
  make(scene, 'candle_small', 20, 34, function (g) {
    g.fillStyle(0xf6efe1, 1); g.fillRoundedRect(5, 12, 10, 22, 3);
    g.fillStyle(0xf2b56b, 0.9); g.fillEllipse(10, 7, 8, 13);
    g.fillStyle(0xfff2cf, 1); g.fillEllipse(10, 8, 4, 7);
  });
  make(scene, 'star_bright', 24, 24, function (g) {
    g.fillStyle(0xfff8ec, 0.95); g.fillCircle(12, 12, 3.2);
    g.fillStyle(0xfff8ec, 0.35); g.fillCircle(12, 12, 7);
    g.fillStyle(0xfff8ec, 0.14); g.fillCircle(12, 12, 11);
  });

  /* ── 파견 ──────────────────────────────────── */
  make(scene, 'send_card', 300, 200, function (g) {
    g.fillStyle(0x000000, 0.16); g.fillRoundedRect(3, 6, 300, 200, 18);
    g.fillStyle(0xfdf3e0, 1); g.fillRoundedRect(0, 0, 300, 200, 18);
    g.lineStyle(3, 0xe0954a, 0.8); g.strokeRoundedRect(0, 0, 300, 200, 18);
    g.fillStyle(0xe0954a, 1); g.fillRoundedRect(0, 0, 300, 40, { tl: 18, tr: 18, bl: 0, br: 0 });
  });
  make(scene, 'subway_car', 300, 160, function (g) {
    g.fillStyle(0xc6ced7, 1); g.fillRoundedRect(0, 0, 300, 160, 14);
    g.fillStyle(0xdfe6ec, 1); g.fillRoundedRect(8, 8, 284, 144, 10);
    g.fillStyle(0x86b6d6, 1);
    g.fillRoundedRect(24, 26, 72, 52, 7); g.fillRoundedRect(114, 26, 72, 52, 7);
    g.fillRoundedRect(204, 26, 72, 52, 7);
    g.fillStyle(0x5d7c9a, 1); g.fillRoundedRect(20, 96, 260, 20, 8);
    g.fillStyle(0xf2b56b, 1); g.fillRect(146, 8, 8, 144);
  });
};
