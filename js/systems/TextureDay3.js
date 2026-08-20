/* DAY 3 에서 더 필요한 그림 — 버스정류장, 버스, 공원의 작은 책장 */

TextureFactory.createDay3 = function (scene) {
  const make = TextureFactory.make;

  make(scene, 'bus_stop', 150, 170, function (g) {
    g.fillStyle(0x8fa2b8, 1); g.fillRect(8, 26, 8, 144); g.fillRect(132, 26, 8, 144);
    g.fillStyle(0xa9bacd, 1); g.fillRect(0, 8, 150, 22);
    g.fillStyle(0x6f8296, 1); g.fillRect(0, 30, 150, 6);
    g.fillStyle(0xdfe8ef, 0.75); g.fillRect(20, 40, 110, 74);      // 유리
    g.fillStyle(0xf3ece2, 1); g.fillRect(26, 46, 44, 62);          // 노선 안내
    g.fillStyle(0x4f7d6a, 1); g.fillRect(30, 50, 36, 6);
    g.fillStyle(0x8fb9cf, 1); g.fillRect(30, 62, 36, 4); g.fillRect(30, 72, 26, 4);
    g.fillStyle(0xa8814f, 1); g.fillRoundedRect(16, 126, 118, 12, 4);   // 벤치
    g.fillStyle(0x6f5b49, 1); g.fillRect(26, 138, 8, 26); g.fillRect(116, 138, 8, 26);
  });

  make(scene, 'bus_sign', 40, 96, function (g) {
    g.fillStyle(0x8fa2b8, 1); g.fillRect(17, 22, 7, 74);
    g.fillStyle(0x3f6f8f, 1); g.fillRoundedRect(2, 0, 36, 30, 6);
    g.fillStyle(0xf3ece2, 1); g.fillRoundedRect(7, 7, 26, 8, 3);
    g.fillStyle(0xf2b56b, 1); g.fillCircle(20, 22, 3);
  });

  make(scene, 'bus_side', 220, 96, function (g) {
    g.fillStyle(0x6f9ec4, 1); g.fillRoundedRect(0, 6, 220, 68, 12);
    g.fillStyle(0x5b89ad, 1); g.fillRect(0, 54, 220, 20);
    g.fillStyle(0xdfeef6, 1);
    g.fillRoundedRect(12, 16, 44, 30, 5); g.fillRoundedRect(64, 16, 44, 30, 5);
    g.fillRoundedRect(116, 16, 44, 30, 5); g.fillRoundedRect(168, 16, 40, 30, 5);
    g.fillStyle(0x3f5a80, 1); g.fillRoundedRect(160, 16, 8, 58, 2);
    g.fillStyle(0x3a3a44, 1); g.fillCircle(44, 76, 15); g.fillCircle(176, 76, 15);
    g.fillStyle(0x8d939b, 1); g.fillCircle(44, 76, 7); g.fillCircle(176, 76, 7);
    g.fillStyle(0xf2b56b, 1); g.fillRoundedRect(206, 30, 10, 8, 2);
  });

  make(scene, 'park_library', 90, 96, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(0, 8, 90, 78, 6);
    g.fillStyle(0xd9b98c, 1); g.fillRect(6, 14, 78, 30); g.fillRect(6, 48, 78, 32);
    g.fillStyle(0xb5705c, 1); g.fillTriangle(-4, 10, 94, 10, 45, -6);
    const cols = [0xc9553f, 0x4f7d6a, 0x5c6b8a, 0xd7a04f, 0x7a5f8a, 0x6f9b8a];
    for (let i = 0; i < 6; i++) { g.fillStyle(cols[i], 1); g.fillRect(10 + i * 12, 18, 8, 24); }
    for (let i = 0; i < 5; i++) { g.fillStyle(cols[(i + 3) % 6], 1); g.fillRect(12 + i * 13, 52, 9, 26); }
    g.fillStyle(0x6f5b49, 1); g.fillRect(10, 86, 8, 10); g.fillRect(72, 86, 8, 10);
  });

  make(scene, 'bookmark', 30, 76, function (g) {
    g.fillStyle(0xfdf3e0, 1); g.fillRoundedRect(0, 0, 30, 66, 3);
    g.fillTriangle(0, 66, 30, 66, 15, 76);
    g.fillStyle(0xc9755a, 1); g.fillRect(6, 10, 18, 3); g.fillRect(6, 18, 12, 3);
    g.fillStyle(0xd7c07f, 1); g.fillRect(13, 30, 4, 20); g.fillRect(8, 36, 14, 4);
  });

  make(scene, 'branch_bird', 120, 70, function (g) {
    g.lineStyle(6, 0x8a6340, 1);
    g.beginPath(); g.moveTo(0, 54); g.lineTo(60, 44); g.lineTo(118, 50); g.strokePath();
    g.lineStyle(3, 0x8a6340, 1);
    g.beginPath(); g.moveTo(40, 46); g.lineTo(28, 24); g.strokePath();
    g.fillStyle(0x7ba065, 1);
    g.fillEllipse(24, 20, 20, 12); g.fillEllipse(70, 34, 22, 12); g.fillEllipse(100, 40, 18, 10);
    g.fillStyle(0x8fa2b8, 1);
    g.fillEllipse(58, 32, 20, 14); g.fillCircle(68, 26, 6);
    g.fillStyle(0xf2b56b, 1); g.fillTriangle(73, 25, 78, 27, 73, 29);
    g.fillStyle(0x3a3a44, 1); g.fillCircle(69, 24, 1.5);
  });

  make(scene, 'shoe_pair', 90, 60, function (g) {
    g.fillStyle(0x000000, 0.12); g.fillEllipse(45, 52, 80, 14);
    [18, 62].forEach(function (x) {
      g.fillStyle(0xf3f6fa, 1); g.fillRoundedRect(x - 15, 10, 30, 40, 12);
      g.fillStyle(0xe0e6ee, 1); g.fillRoundedRect(x - 15, 38, 30, 14, 7);
      g.lineStyle(2, 0xc3ccd8, 1);
      g.lineBetween(x - 8, 20, x + 8, 26); g.lineBetween(x + 8, 20, x - 8, 26);
    });
  });
};
