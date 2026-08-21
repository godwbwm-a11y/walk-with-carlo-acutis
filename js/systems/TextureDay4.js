/* DAY 4 에 더 필요한 그림 — 담벼락에 붙은 말들과, 그 말을 떨어뜨릴 작은 빛. */

TextureFactory.createDay4 = function (scene) {
  const make = TextureFactory.make;

  /* 말이 적힌 돌덩이 — 담벼락에 박혀 있습니다 */
  make(scene, 'd4_stone', 112, 38, function (g) {
    g.fillStyle(0x000000, 0.18); g.fillRoundedRect(3, 5, 108, 33, 7);
    g.fillStyle(0x8d8579, 1); g.fillRoundedRect(0, 0, 108, 33, 7);
    g.fillStyle(0x9c9486, 1); g.fillRoundedRect(2, 2, 104, 24, 6);
    g.fillStyle(0x7b7367, 0.7); g.fillRoundedRect(2, 24, 104, 7, 3);
    g.lineStyle(1.5, 0x6d665b, 0.8); g.strokeRoundedRect(0, 0, 108, 33, 7);
    /* 오래된 자국 몇 개 */
    g.fillStyle(0x7b7367, 0.45);
    g.fillCircle(18, 12, 2.2); g.fillCircle(74, 20, 1.8); g.fillCircle(94, 9, 1.5);
  });

  /* 금이 간 돌 — 맞은 순간에 잠깐 바뀝니다 */
  make(scene, 'd4_stone_crack', 112, 38, function (g) {
    g.fillStyle(0x000000, 0.18); g.fillRoundedRect(3, 5, 108, 33, 7);
    g.fillStyle(0x9b9184, 1); g.fillRoundedRect(0, 0, 108, 33, 7);
    g.lineStyle(1.5, 0x6d665b, 0.9); g.strokeRoundedRect(0, 0, 108, 33, 7);
    g.lineStyle(2, 0x5f584e, 0.9);
    g.lineBetween(38, 0, 46, 16); g.lineBetween(46, 16, 34, 33);
    g.lineBetween(46, 16, 72, 22); g.lineBetween(72, 22, 84, 8);
  });

  /* 공 — 작은 빛 한 조각입니다 */
  make(scene, 'd4_ball', 24, 24, function (g) {
    g.fillStyle(0xf2b56b, 0.28); g.fillCircle(12, 12, 11.5);
    g.fillStyle(0xf7cf9a, 0.6); g.fillCircle(12, 12, 8.5);
    g.fillStyle(0xfff3dd, 1); g.fillCircle(12, 12, 6);
    g.fillStyle(0xffffff, 0.9); g.fillCircle(10, 10, 2.4);
  });

  /* 운동장 담벼락 — 종이가 잔뜩 붙어 있습니다 */
  make(scene, 'd4_wall', 168, 132, function (g) {
    g.fillStyle(0x000000, 0.14); g.fillRect(6, 126, 160, 6);
    g.fillStyle(0xbdb3a2, 1); g.fillRect(0, 0, 164, 128);
    g.fillStyle(0xc8bfae, 1); g.fillRect(0, 0, 164, 10);
    g.lineStyle(1, 0xa79d8d, 0.9);
    for (let y = 18; y < 128; y += 22) g.lineBetween(0, y, 164, y);
    for (let x = 0; x < 164; x += 34) g.lineBetween(x, 10, x, 128);
    /* 붙어 있는 종이들 */
    const papers = [[10, 22, 44, 20, -4], [64, 16, 52, 22, 3], [124, 26, 34, 18, -6],
                    [18, 58, 50, 20, 5], [78, 62, 44, 18, -3], [128, 56, 30, 20, 4],
                    [12, 94, 40, 18, -2], [60, 92, 56, 20, 2], [124, 96, 32, 18, -5]];
    papers.forEach(function (p) {
      g.fillStyle(0x000000, 0.10); g.fillRect(p[0] + 2, p[1] + 2, p[2], p[3]);
      g.fillStyle(0xf6f1e4, 0.96); g.fillRect(p[0], p[1], p[2], p[3]);
      g.fillStyle(0x8d8579, 0.55);
      g.fillRect(p[0] + 5, p[1] + 6, p[2] - 14, 2.4);
      g.fillRect(p[0] + 5, p[1] + 12, p[2] - 20, 2.4);
    });
  });
};
