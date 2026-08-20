/* DAY 7 에서 더 필요한 그림 — 컴퓨터실, 교실 게시판, 동네의 작은 필요들. */

TextureFactory.createDay7 = function (scene) {
  const make = TextureFactory.make;
  const canvasTex = TextureFactory.canvasTex;

  /* ── 하늘 ───────────────────────────────────── */
  canvasTex(scene, 'sky_ordinary', 8, 400, function (ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0.00, '#93c3e0');
    grd.addColorStop(0.48, '#c2dcec');
    grd.addColorStop(0.80, '#e6e5da');
    grd.addColorStop(1.00, '#efe1c6');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  });

  /* ── 컴퓨터실 ──────────────────────────────── */
  make(scene, 'pc_desk', 130, 96, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(0, 46, 130, 12, 4);
    g.fillStyle(0x6f5b49, 1); g.fillRect(10, 58, 9, 38); g.fillRect(111, 58, 9, 38);
    g.fillStyle(0x3a3a44, 1); g.fillRoundedRect(30, 8, 70, 40, 5);
    g.fillStyle(0x86b6d6, 1); g.fillRoundedRect(34, 12, 62, 32, 3);
    g.fillStyle(0xfff8ec, 0.7); g.fillRect(40, 18, 30, 4); g.fillRect(40, 26, 44, 4); g.fillRect(40, 34, 22, 4);
    g.fillStyle(0x5a5a66, 1); g.fillRect(58, 48, 14, 4);
    g.fillStyle(0xdfe6ec, 1); g.fillRoundedRect(38, 52, 46, 8, 2);
    g.fillStyle(0xdfe6ec, 1); g.fillRoundedRect(92, 52, 12, 8, 4);
  });
  make(scene, 'pc_screen_big', 300, 220, function (g) {
    g.fillStyle(0x2b2f3a, 1); g.fillRoundedRect(0, 0, 300, 220, 14);
    g.fillStyle(0x14202f, 1); g.fillRoundedRect(10, 10, 280, 176, 8);
    g.fillStyle(0x3a4a5e, 1); g.fillRect(10, 10, 280, 22);
    g.fillStyle(0xf2b56b, 0.9); g.fillCircle(24, 21, 4);
    g.fillStyle(0x8fc0d9, 0.9); g.fillCircle(38, 21, 4);
    g.fillStyle(0x6f9b6a, 0.9); g.fillCircle(52, 21, 4);
    g.fillStyle(0x5a5a66, 1); g.fillRect(134, 186, 32, 18);
    g.fillStyle(0x6f7480, 1); g.fillRoundedRect(104, 204, 92, 10, 4);
  });
  make(scene, 'keyboard_item', 90, 30, function (g) {
    g.fillStyle(0xdfe6ec, 1); g.fillRoundedRect(0, 4, 90, 22, 5);
    g.fillStyle(0xb9c4cf, 1);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 9; c++) g.fillRect(6 + c * 9, 8 + r * 6, 6, 4);
  });

  /* ── 교실 ──────────────────────────────────── */
  make(scene, 'board_class', 200, 92, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(0, 0, 200, 92, 6);
    g.fillStyle(0xd9c9a8, 1); g.fillRoundedRect(6, 6, 188, 80, 4);
    const cols = [0xc9553f, 0x3f6f8f, 0x6f9b6a, 0xd7a04f];
    for (let i = 0; i < 7; i++) {
      g.fillStyle(0xf6efe1, 1);
      g.fillRoundedRect(14 + (i % 4) * 46, 14 + Math.floor(i / 4) * 38, 38, 30, 3);
      g.fillStyle(cols[i % 4], 0.8);
      g.fillRect(18 + (i % 4) * 46, 20 + Math.floor(i / 4) * 38, 24, 3);
      g.fillRect(18 + (i % 4) * 46, 27 + Math.floor(i / 4) * 38, 16, 3);
    }
  });
  make(scene, 'workbook', 60, 46, function (g) {
    g.fillStyle(0xf6efe1, 1); g.fillRoundedRect(0, 4, 60, 40, 3);
    g.fillStyle(0xe4d9c4, 1); g.fillRect(29, 4, 2, 40);
    g.fillStyle(0x8fa5c8, 1);
    for (let i = 0; i < 4; i++) { g.fillRect(6, 12 + i * 8, 18, 3); g.fillRect(35, 12 + i * 8, 18, 3); }
    g.fillStyle(0xc9553f, 1); g.fillCircle(46, 34, 5);
  });

  /* ── 동네의 작은 필요들 ────────────────────── */
  make(scene, 'ball_stuck', 34, 34, function (g) {
    g.fillStyle(0xf3ece2, 1); g.fillCircle(17, 17, 15);
    g.fillStyle(0x3a3a44, 1);
    g.fillCircle(17, 17, 5);
    g.fillTriangle(6, 8, 12, 4, 13, 11);
    g.fillTriangle(28, 8, 22, 4, 21, 11);
    g.fillTriangle(10, 28, 14, 23, 8, 22);
    g.fillTriangle(24, 28, 20, 23, 26, 22);
  });
  make(scene, 'chair_item', 40, 52, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(4, 4, 32, 26, 4);
    g.fillStyle(0xb98a5e, 1); g.fillRoundedRect(2, 26, 36, 10, 3);
    g.fillStyle(0x6f5b49, 1); g.fillRect(6, 36, 6, 16); g.fillRect(28, 36, 6, 16);
  });
  make(scene, 'map_paper', 46, 36, function (g) {
    g.fillStyle(0xf6efe1, 1); g.fillRoundedRect(0, 0, 46, 36, 3);
    g.fillStyle(0x8fc0d9, 1); g.fillRect(4, 14, 38, 4);
    g.fillStyle(0x6f9b6a, 1); g.fillCircle(12, 8, 4); g.fillCircle(34, 26, 4);
    g.fillStyle(0xc9553f, 1); g.fillTriangle(23, 2, 19, 9, 27, 9);
  });
  make(scene, 'glow_small', 60, 60, function (g) {
    g.fillStyle(0xf2b56b, 0.30); g.fillCircle(30, 30, 26);
    g.fillStyle(0xf6d79a, 0.45); g.fillCircle(30, 30, 16);
    g.fillStyle(0xfff8ec, 0.9); g.fillCircle(30, 30, 7);
  });

  /* ── 카드 만들기 ───────────────────────────── */
  make(scene, 'made_card', 280, 190, function (g) {
    g.fillStyle(0x000000, 0.16); g.fillRoundedRect(3, 6, 280, 190, 16);
    g.fillStyle(0xfdf3e0, 1); g.fillRoundedRect(0, 0, 280, 190, 16);
    g.lineStyle(3, 0xe0954a, 0.7); g.strokeRoundedRect(0, 0, 280, 190, 16);
    g.lineStyle(1, 0xd9c2a3, 0.9); g.strokeRoundedRect(9, 9, 262, 172, 12);
  });
  make(scene, 'net_post', 300, 96, function (g) {
    g.fillStyle(0xf3f6fa, 1); g.fillRoundedRect(0, 0, 300, 96, 12);
    g.lineStyle(2, 0xc3ccd8, 0.9); g.strokeRoundedRect(0, 0, 300, 96, 12);
    g.fillStyle(0xdfe6ec, 1); g.fillCircle(28, 26, 13);
    g.fillStyle(0xc3ccd8, 1); g.fillRect(50, 20, 70, 6); g.fillRect(50, 32, 44, 5);
  });

  /* ── 방과 밤 ───────────────────────────────── */
  make(scene, 'wyd_band_small', 44, 20, function (g) {
    g.fillStyle(0xe0954a, 1); g.fillRoundedRect(0, 4, 44, 12, 6);
    g.fillStyle(0xfff8ec, 1); g.fillRect(8, 8, 12, 4); g.fillRect(23, 8, 6, 4); g.fillRect(32, 8, 7, 4);
  });
  make(scene, 'desk_night', 200, 70, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(0, 8, 200, 14, 4);
    g.fillStyle(0x6f5b49, 1); g.fillRect(12, 22, 10, 48); g.fillRect(178, 22, 10, 48);
    g.fillStyle(0x7a6450, 1); g.fillRect(0, 22, 200, 4);
  });
};
