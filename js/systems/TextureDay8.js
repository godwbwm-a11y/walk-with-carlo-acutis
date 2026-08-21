/* DAY 8 에서 더 필요한 그림 — 빈 자리, 새벽 해변, 갈림길, 그리고 마지막 카드. */

TextureFactory.createDay8 = function (scene) {
  const make = TextureFactory.make;
  const canvasTex = TextureFactory.canvasTex;

  /* 새벽과 밤 사이의 하늘 */
  canvasTex(scene, 'sky_lastdawn', 8, 560, function (ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0.00, '#0c1430');
    grd.addColorStop(0.34, '#243356');
    grd.addColorStop(0.58, '#5b5479');
    grd.addColorStop(0.78, '#b07a7e');
    grd.addColorStop(0.92, '#e8a077');
    grd.addColorStop(1.00, '#f6cf9e');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  });

  /* 카를로가 없는 자리 — 점선으로만 남은 흔적 */
  make(scene, 'empty_spot', 64, 64, function (g) {
    g.lineStyle(3, 0x8fa5c8, 0.45);
    for (let i = 0; i < 12; i++) {
      const a0 = Phaser.Math.DegToRad(i * 30), a1 = Phaser.Math.DegToRad(i * 30 + 18);
      g.beginPath(); g.arc(32, 32, 24, a0, a1); g.strokePath();
    }
  });

  /* 돌무더기 옆의 작은 돌 하나 */
  make(scene, 'stone_one', 56, 44, function (g) {
    g.fillStyle(0x000000, 0.14); g.fillEllipse(28, 40, 46, 9);
    g.fillStyle(0x8d8b86, 1); g.fillEllipse(28, 24, 46, 32);
    g.fillStyle(0xa3a19b, 1); g.fillEllipse(24, 19, 30, 18);
    g.fillStyle(0x76736e, 0.5); g.fillEllipse(34, 32, 22, 10);
  });

  /* 길 위의 낱말 표지 */
  make(scene, 'path_sign', 120, 52, function (g) {
    g.fillStyle(0xf3ece2, 0.14); g.fillRoundedRect(0, 0, 120, 52, 12);
    g.lineStyle(2, 0xfff8ec, 0.45); g.strokeRoundedRect(0, 0, 120, 52, 12);
  });

  /* 갈림길 바닥 */
  make(scene, 'path_tile', 48, 48, function (g) {
    g.fillStyle(0x2a3350, 1); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0x33405f, 0.7); g.fillCircle(12, 30, 3); g.fillCircle(34, 14, 2.4);
  });

  /* 마지막 카드 */
  make(scene, 'my_card', 300, 210, function (g) {
    g.fillStyle(0x000000, 0.20); g.fillRoundedRect(4, 8, 300, 210, 18);
    g.fillStyle(0xfdf3e0, 1); g.fillRoundedRect(0, 0, 300, 210, 18);
    g.lineStyle(3, 0xf2b56b, 0.95); g.strokeRoundedRect(0, 0, 300, 210, 18);
    g.lineStyle(1, 0xe0954a, 0.55); g.strokeRoundedRect(10, 10, 280, 190, 13);
    g.fillStyle(0xf2b56b, 0.28);
    g.fillRect(150 - 4, 26, 8, 34); g.fillRect(150 - 18, 36, 36, 8);
  });
  make(scene, 'small_card', 128, 84, function (g) {
    g.fillStyle(0x000000, 0.16); g.fillRoundedRect(2, 4, 128, 84, 10);
    g.fillStyle(0xfdf3e0, 0.96); g.fillRoundedRect(0, 0, 128, 84, 10);
    g.lineStyle(2, 0xd9c2a3, 0.85); g.strokeRoundedRect(0, 0, 128, 84, 10);
  });

  /* 현관과 식탁 */
  make(scene, 'front_door', 120, 180, function (g) {
    g.fillStyle(0x6f5b49, 1); g.fillRoundedRect(0, 0, 120, 180, 6);
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(8, 8, 104, 164, 5);
    g.fillStyle(0x7a5236, 1); g.fillRoundedRect(20, 24, 80, 60, 4);
    g.fillRoundedRect(20, 96, 80, 60, 4);
    g.fillStyle(0xd7a04f, 1); g.fillCircle(98, 96, 6);
  });
  make(scene, 'table_home', 180, 80, function (g) {
    g.fillStyle(0xb98a5e, 1); g.fillRoundedRect(0, 8, 180, 22, 8);
    g.fillStyle(0x8a6340, 1); g.fillRect(16, 30, 12, 50); g.fillRect(152, 30, 12, 50);
    g.fillStyle(0xf3ece2, 1); g.fillEllipse(56, 18, 30, 12); g.fillEllipse(124, 18, 30, 12);
    g.fillStyle(0xe7c9a0, 1); g.fillEllipse(90, 16, 22, 9);
  });
};
