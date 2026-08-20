/* DAY 2 에서 쓰는 그림 — 동네, 편의점, 공원, 학교, 성당, 그리고 돌.
   DAY 1 과 마찬가지로 모두 코드로 직접 그립니다. */

TextureFactory.createDay2 = function (scene) {
  const make = TextureFactory.make;
  const person = TextureFactory.person;

  const canvasTex = TextureFactory.canvasTex;

  /* 토요일 아침 하늘과 늦은 오후 하늘 */
  canvasTex(scene, 'sky_morning', 8, 400, function (ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0.00, '#8ec3e6');
    grd.addColorStop(0.45, '#bcdcef');
    grd.addColorStop(0.78, '#e8eef0');
    grd.addColorStop(1.00, '#f6e6cf');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  });
  canvasTex(scene, 'sky_evening', 8, 400, function (ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0.00, '#4b6ea6');
    grd.addColorStop(0.38, '#8f9fc4');
    grd.addColorStop(0.66, '#e6b08a');
    grd.addColorStop(0.86, '#f2a86f');
    grd.addColorStop(1.00, '#f6c98f');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  });
  canvasTex(scene, 'cloud_soft', 160, 80, function (ctx, w, h) {
    const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grd.addColorStop(0, 'rgba(255,255,255,0.85)');
    grd.addColorStop(0.6, 'rgba(255,255,255,0.35)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  });

  /* ── 사람들 ─────────────────────────────────── */
  make(scene, 'child_front', 32, 46, function (g) {
    person(g, { skin: 0xf8dcbe, hair: 0x6b4a2f, shirt: 0xf2c94c, pants: 0x4a7fb5, shoes: 0xffffff, stripe: 0xffffff });
  });
  make(scene, 'grandma_front', 32, 46, function (g) {
    person(g, { skin: 0xf0d6bb, hair: 0xd9d3ca, shirt: 0xb9a7c4, pants: 0x6f6478, shoes: 0xcfc6bb });
  });
  make(scene, 'clerk_front', 32, 46, function (g) {
    person(g, { skin: 0xf6d3b0, hair: 0x2f2820, shirt: 0x3f5a80, pants: 0x30425e, shoes: 0xe8e2d8, stripe: 0xf3ece2 });
  });
  make(scene, 'resident_front', 32, 46, function (g) {
    person(g, { skin: 0xf3cdaa, hair: 0x4a3226, shirt: 0x6f9b6a, pants: 0x7b6b58, shoes: 0xd9cfc4 });
  });
  make(scene, 'villager_front', 32, 46, function (g) {
    person(g, { skin: 0xf6d3b0, hair: 0x3b3128, shirt: 0xd9a06a, pants: 0x4c4f63, shoes: 0xe4ddd2 });
  });
  make(scene, 'villager_back', 32, 46, function (g) {
    person(g, { skin: 0xf6d3b0, hair: 0x3b3128, shirt: 0xa8b6cf, pants: 0x53586e, shoes: 0xe4ddd2, back: true });
  });

  /* ── 동네 ───────────────────────────────────── */
  make(scene, 'house_a', 120, 150, function (g) {
    g.fillStyle(0xd9c3a5, 1); g.fillRect(0, 30, 120, 120);
    g.fillStyle(0xb5705c, 1); g.fillTriangle(-6, 32, 126, 32, 60, 0);
    g.fillStyle(0xf6cf9a, 1);
    g.fillRect(16, 54, 26, 26); g.fillRect(74, 54, 26, 26); g.fillRect(16, 100, 26, 26);
    g.fillStyle(0x8a6340, 1); g.fillRect(70, 96, 34, 54);
    g.fillStyle(0xc8b295, 1); g.fillRect(0, 142, 120, 8);
  });
  make(scene, 'house_b', 100, 176, function (g) {
    g.fillStyle(0xcfd6dd, 1); g.fillRect(0, 0, 100, 176);
    g.fillStyle(0xb9c2cc, 1); g.fillRect(0, 0, 100, 12);
    g.fillStyle(0x8fb9cf, 1);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) g.fillRect(10 + c * 28, 26 + r * 36, 20, 24);
    g.fillStyle(0x7b8794, 1); g.fillRect(0, 168, 100, 8);
  });
  make(scene, 'store_front', 190, 140, function (g) {
    g.fillStyle(0xf3efe6, 1); g.fillRect(0, 22, 190, 118);
    g.fillStyle(0x4f9d8a, 1); g.fillRect(0, 0, 190, 26);
    g.fillStyle(0xf2b56b, 1); g.fillRect(0, 26, 190, 6);
    g.fillStyle(0xbfe0ea, 1); g.fillRect(10, 44, 76, 74); g.fillRect(102, 44, 76, 74);
    g.fillStyle(0xffffff, 0.55); g.fillTriangle(14, 116, 52, 46, 74, 46);
    g.fillStyle(0xd9d3c8, 1); g.fillRect(86, 44, 16, 96);
    g.fillStyle(0x8fa2b8, 1); g.fillRect(0, 132, 190, 8);
  });
  make(scene, 'road_tile', 64, 64, function (g) {
    g.fillStyle(0x9a9a96, 1); g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x8e8e8a, 1); g.fillRect(0, 30, 64, 2);
  });
  make(scene, 'walk_tile', 64, 64, function (g) {
    g.fillStyle(0xd7cec1, 1); g.fillRect(0, 0, 64, 64);
    g.lineStyle(1, 0xc7bdae, 1);
    g.strokeRect(0.5, 0.5, 31, 31); g.strokeRect(32.5, 0.5, 31, 31);
    g.strokeRect(0.5, 32.5, 31, 31); g.strokeRect(32.5, 32.5, 31, 31);
  });
  make(scene, 'tree_big', 96, 130, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRect(40, 74, 16, 56);
    g.fillStyle(0x7ba065, 1);
    g.fillCircle(48, 52, 40); g.fillCircle(22, 66, 26); g.fillCircle(74, 66, 26);
    g.fillStyle(0x92b878, 1); g.fillCircle(40, 42, 24); g.fillCircle(62, 54, 18);
  });
  make(scene, 'bush', 60, 40, function (g) {
    g.fillStyle(0x6f9b6a, 1); g.fillEllipse(30, 26, 58, 30);
    g.fillStyle(0x84ac78, 1); g.fillEllipse(22, 20, 30, 20);
  });
  make(scene, 'car_side', 130, 62, function (g) {
    g.fillStyle(0xd8dde3, 1); g.fillRoundedRect(0, 20, 130, 30, 8);
    g.fillRoundedRect(24, 2, 78, 26, 8);
    g.fillStyle(0x9fc2d6, 1); g.fillRoundedRect(30, 8, 30, 16, 4); g.fillRoundedRect(66, 8, 30, 16, 4);
    g.fillStyle(0x3a3a44, 1); g.fillCircle(30, 50, 11); g.fillCircle(100, 50, 11);
    g.fillStyle(0x8d939b, 1); g.fillCircle(30, 50, 5); g.fillCircle(100, 50, 5);
  });
  make(scene, 'pigeon', 26, 20, function (g) {
    g.fillStyle(0x9aa4b0, 1); g.fillEllipse(12, 12, 20, 13);
    g.fillCircle(20, 7, 5);
    g.fillStyle(0xf2b56b, 1); g.fillTriangle(24, 6, 26, 8, 24, 9);
    g.fillStyle(0x7b8794, 1); g.fillEllipse(9, 12, 12, 8);
    g.fillStyle(0x4a4038, 1); g.fillCircle(21, 6, 1.2);
  });
  make(scene, 'dog_walk', 40, 26, function (g) {
    g.fillStyle(0xd9b98c, 1); g.fillEllipse(18, 14, 26, 14);
    g.fillCircle(31, 9, 7);
    g.fillTriangle(27, 4, 30, 0, 33, 6);
    g.fillRect(8, 18, 4, 8); g.fillRect(16, 18, 4, 8); g.fillRect(24, 18, 4, 8);
    g.lineStyle(2.4, 0xd9b98c, 1); g.beginPath(); g.arc(5, 10, 5, Math.PI * 0.4, Math.PI * 1.5); g.strokePath();
    g.fillStyle(0x4a4038, 1); g.fillCircle(33, 8, 1.4);
  });

  /* ── 학교 · 성당 ────────────────────────────── */
  make(scene, 'school_gate', 150, 130, function (g) {
    g.fillStyle(0xb9b1a4, 1); g.fillRect(0, 24, 18, 106); g.fillRect(132, 24, 18, 106);
    g.fillStyle(0x9aa4b0, 1); g.fillRect(0, 10, 150, 18);
    g.fillStyle(0xf3ece2, 1); g.fillRect(46, 12, 58, 14);
    g.lineStyle(3, 0x8fa2b8, 1);
    for (let i = 0; i < 7; i++) g.lineBetween(24 + i * 17, 34, 24 + i * 17, 126);
    g.lineBetween(20, 40, 130, 40); g.lineBetween(20, 118, 130, 118);
  });
  make(scene, 'board_notice', 96, 74, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(0, 0, 96, 62, 4);
    g.fillStyle(0xe8dcc6, 1); g.fillRect(5, 5, 86, 52);
    g.fillStyle(0xf2b56b, 1); g.fillRect(12, 12, 34, 18);
    g.fillStyle(0x8fc0d9, 1); g.fillRect(52, 12, 30, 14);
    g.fillStyle(0xc9755a, 1); g.fillRect(12, 36, 60, 6);
    g.fillStyle(0x6f5b49, 1); g.fillRect(12, 62, 6, 12); g.fillRect(78, 62, 6, 12);
  });
  make(scene, 'goal_post', 110, 70, function (g) {
    g.lineStyle(5, 0xf3ece2, 1);
    g.lineBetween(6, 68, 6, 8); g.lineBetween(104, 68, 104, 8); g.lineBetween(6, 8, 104, 8);
    g.lineStyle(1, 0xf3ece2, 0.5);
    for (let i = 1; i < 8; i++) g.lineBetween(6 + i * 12, 10, 6 + i * 12, 66);
    for (let i = 1; i < 5; i++) g.lineBetween(8, 10 + i * 12, 102, 10 + i * 12);
  });
  make(scene, 'church_front', 220, 250, function (g) {
    g.fillStyle(0xe6dccb, 1); g.fillRect(20, 80, 180, 170);
    g.fillStyle(0xd5c9b4, 1); g.fillTriangle(10, 82, 210, 82, 110, 24);
    g.fillStyle(0xb5705c, 1); g.fillRect(96, 0, 10, 30); g.fillRect(84, 8, 34, 10);
    g.fillStyle(0x8a6340, 1);
    g.slice(110, 200, 34, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false); g.fillPath();
    g.fillRect(76, 198, 68, 52);
    g.fillStyle(0xa8814f, 1); g.fillRect(80, 202, 28, 48); g.fillRect(112, 202, 28, 48);
    g.fillStyle(0x8fc0d9, 1);
    g.slice(110, 128, 22, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false); g.fillPath();
    g.fillRect(88, 126, 44, 34);
    g.fillStyle(0xf2b56b, 1); g.fillCircle(110, 132, 9);
    g.fillStyle(0xc9755a, 1); g.fillRect(46, 120, 20, 46); g.fillRect(154, 120, 20, 46);
  });
  make(scene, 'pew', 130, 40, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(0, 14, 130, 12, 4);
    g.fillStyle(0xa8814f, 1); g.fillRoundedRect(0, 0, 130, 12, 4);
    g.fillStyle(0x6f5b49, 1); g.fillRect(8, 26, 8, 14); g.fillRect(114, 26, 8, 14);
  });
  make(scene, 'candle_stand', 70, 90, function (g) {
    g.fillStyle(0x8d7b5e, 1); g.fillRoundedRect(6, 62, 58, 12, 4); g.fillRect(30, 44, 10, 20);
    g.fillStyle(0xd7c07f, 1); g.fillRoundedRect(2, 36, 66, 10, 4);
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0xfdf3e0, 1); g.fillRect(8 + i * 13, 16, 8, 22);
      g.fillStyle(0xf2b56b, 1); g.fillEllipse(12 + i * 13, 12, 7, 12);
      g.fillStyle(0xfff3d6, 1); g.fillEllipse(12 + i * 13, 12, 3, 7);
    }
  });
  make(scene, 'stained_glass', 90, 150, function (g) {
    g.fillStyle(0x6f5b49, 1);
    g.slice(45, 52, 45, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false); g.fillPath();
    g.fillRect(0, 50, 90, 100);
    const cols = [0x8fc0d9, 0xf2b56b, 0xc9755a, 0x7ba065, 0x9d8ac4];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
      g.fillStyle(cols[(r + c) % cols.length], 0.92);
      g.fillRect(8 + c * 26, 16 + r * 26, 22, 22);
    }
    g.fillStyle(0xfdf3e0, 0.9); g.fillRect(34, 42, 22, 22);
  });
  make(scene, 'sanctuary_lamp', 44, 90, function (g) {
    g.lineStyle(2, 0x8d7b5e, 1); g.lineBetween(22, 0, 22, 34);
    g.fillStyle(0xd7c07f, 1); g.fillRoundedRect(8, 34, 28, 30, 8);
    g.fillStyle(0xc9553f, 0.9); g.fillRoundedRect(12, 38, 20, 24, 6);
    g.fillStyle(0xfff1cf, 1); g.fillCircle(22, 50, 6);
    g.fillStyle(0xd7c07f, 1); g.fillRoundedRect(16, 64, 12, 8, 3);
  });
  make(scene, 'relic_case', 130, 110, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(0, 74, 130, 36, 6);
    g.fillStyle(0xd7c07f, 1); g.fillRoundedRect(10, 24, 110, 54, 8);
    g.fillStyle(0xfdf3e0, 0.94); g.fillRoundedRect(18, 30, 94, 42, 6);
    g.fillStyle(0xd7c07f, 1); g.fillRect(62, 0, 6, 26); g.fillRect(50, 8, 30, 6);
    g.fillStyle(0xf2b56b, 0.5); g.fillEllipse(65, 52, 76, 28);
  });
  make(scene, 'altar', 160, 70, function (g) {
    g.fillStyle(0xe6dccb, 1); g.fillRoundedRect(0, 18, 160, 52, 6);
    g.fillStyle(0xfdf3e0, 1); g.fillRoundedRect(6, 8, 148, 16, 4);
    g.fillStyle(0xd7c07f, 1); g.fillRect(74, 26, 12, 34); g.fillRect(62, 34, 36, 10);
  });

  /* ── 돌과 물건 ──────────────────────────────── */
  make(scene, 'stone', 60, 46, function (g) {
    g.fillStyle(0x7c8290, 1); g.fillEllipse(30, 26, 56, 38);
    g.fillStyle(0x8f96a5, 1); g.fillEllipse(24, 20, 36, 22);
    g.fillStyle(0x6a707c, 1); g.fillEllipse(38, 34, 26, 12);
  });
  make(scene, 'stone_pile', 120, 80, function (g) {
    g.fillStyle(0x6a707c, 1); g.fillEllipse(60, 66, 112, 26);
    g.fillStyle(0x7c8290, 1);
    g.fillEllipse(34, 54, 44, 26); g.fillEllipse(84, 56, 40, 24); g.fillEllipse(60, 38, 46, 26);
    g.fillStyle(0x8f96a5, 1); g.fillEllipse(56, 30, 30, 18);
  });
  make(scene, 'cross_small', 40, 62, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(16, 0, 9, 62, 3); g.fillRoundedRect(4, 16, 33, 9, 3);
    g.fillStyle(0xa8814f, 1); g.fillRoundedRect(18, 2, 5, 58, 2);
  });
  make(scene, 'orange', 34, 34, function (g) {
    g.fillStyle(0xf0913f, 1); g.fillCircle(17, 17, 15);
    g.fillStyle(0xf6a95e, 1); g.fillCircle(13, 13, 9);
    g.fillStyle(0x6f9b6a, 1); g.fillEllipse(20, 4, 10, 5);
  });
  make(scene, 'paper_bag', 60, 66, function (g) {
    g.fillStyle(0xd9b98c, 1); g.fillRect(4, 14, 52, 52);
    g.fillStyle(0xc4a479, 1); g.fillRect(4, 14, 52, 8);
    g.fillStyle(0xb5966d, 1); g.fillRect(0, 8, 60, 8);
  });
  make(scene, 'bag_open', 200, 170, function (g) {
    g.fillStyle(0x3e6a58, 1); g.fillRoundedRect(0, 26, 200, 144, 26);
    g.fillStyle(0x2f5544, 1); g.fillRoundedRect(14, 46, 172, 112, 20);
    g.fillStyle(0x1f3b30, 1); g.fillRoundedRect(22, 54, 156, 100, 16);
    g.fillStyle(0x4f7d6a, 1); g.fillRoundedRect(0, 12, 200, 26, 12);
    g.fillStyle(0xf2b56b, 1); g.fillRoundedRect(84, 18, 32, 10, 5);
  });
  make(scene, 'zipper', 210, 34, function (g) {
    g.fillStyle(0xd7c07f, 1); g.fillRoundedRect(0, 12, 210, 10, 5);
    g.fillStyle(0xb59a5c, 1);
    for (let i = 0; i < 21; i++) g.fillRect(4 + i * 10, 12, 4, 10);
  });
  make(scene, 'zip_pull', 34, 34, function (g) {
    g.fillStyle(0xf3ece2, 1); g.fillRoundedRect(4, 4, 26, 26, 8);
    g.fillStyle(0xb59a5c, 1); g.fillRoundedRect(9, 9, 16, 16, 5);
    g.fillStyle(0xf3ece2, 1); g.fillCircle(17, 17, 4);
  });
  make(scene, 'note_book', 220, 280, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(0, 0, 220, 280, 10);
    g.fillStyle(0xfdf3e0, 1); g.fillRoundedRect(8, 8, 204, 264, 8);
    g.lineStyle(1.5, 0xe0d3ba, 1);
    for (let i = 0; i < 9; i++) g.lineBetween(24, 48 + i * 26, 196, 48 + i * 26);
    g.lineStyle(2, 0xc9755a, 0.5); g.lineBetween(38, 12, 38, 268);
  });
};
