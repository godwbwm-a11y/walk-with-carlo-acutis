/* 에필로그에 더 필요한 그림 — 본당 마당, 세계에서 온 친구들, 그리고 단체사진.
   여전히 외부 이미지는 하나도 쓰지 않습니다. */

TextureFactory.createEpi = function (scene) {
  const make = TextureFactory.make;
  const canvasTex = TextureFactory.canvasTex;
  const person = TextureFactory.person;

  /* ── 하늘 ──────────────────────────────────── */
  canvasTex(scene, 'epi_sky_day', 8, 420, function (ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0.00, '#7fb4dc');
    grd.addColorStop(0.55, '#b9d8ea');
    grd.addColorStop(1.00, '#e9e2cf');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  });
  canvasTex(scene, 'epi_sky_evening', 8, 460, function (ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0.00, '#20305a');
    grd.addColorStop(0.42, '#5b4f74');
    grd.addColorStop(0.72, '#b7757a');
    grd.addColorStop(0.90, '#e79f72');
    grd.addColorStop(1.00, '#f3c894');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  });
  canvasTex(scene, 'epi_sky_night', 8, 520, function (ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0.00, '#0e182f');
    grd.addColorStop(0.55, '#1c2a49');
    grd.addColorStop(1.00, '#33405e');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  });

  /* ── 세계에서 온 친구들 ─────────────────────── */
  /* 옷 색과 머리색만 다른 단순한 실루엣입니다. 실존 인물을 그리지 않습니다. */
  const crew = [
    { id: 'leo',  skin: 0xe8be96, hair: 0x2f2119, shirt: 0xd86a4a, pants: 0x38507a, shoes: 0xf2ece0, bag: 0x5f7f9d },
    { id: 'ita',  skin: 0xf0cda8, hair: 0x40301f, shirt: 0x5f8f6a, pants: 0x8a7a5e, shoes: 0xe6dfd2, bag: 0x9d6a52 },
    { id: 'phi',  skin: 0xd9a878, hair: 0x1d1712, shirt: 0xf0c05a, pants: 0x46566e, shoes: 0xefe7d8, bag: 0x6f8f5f },
    { id: 'fra',  skin: 0xf5d8ba, hair: 0x7a5a36, shirt: 0x6d80c0, pants: 0x3f4a63, shoes: 0xe8e2d6, bag: 0xc08a5e },
    { id: 'bra',  skin: 0xb98255, hair: 0x241a14, shirt: 0x4fa39a, pants: 0x5c4a3c, shoes: 0xf0e8da, bag: 0xd0a05c },
    { id: 'spa',  skin: 0xecc59c, hair: 0x33241a, shirt: 0xb45f8e, pants: 0x4a4a5e, shoes: 0xeae2d4, bag: 0x7f9a6a }
  ];
  crew.forEach(function (c) {
    make(scene, 'epi_' + c.id + '_front', 32, 46, function (g) {
      person(g, { skin: c.skin, hair: c.hair, shirt: c.shirt, pants: c.pants, shoes: c.shoes });
    });
    make(scene, 'epi_' + c.id + '_back', 32, 46, function (g) {
      person(g, { skin: c.skin, hair: c.hair, shirt: c.shirt, pants: c.pants, shoes: c.shoes, back: true, bag: c.bag });
    });
  });

  /* ── 본당 마당 ─────────────────────────────── */
  /* 루르드 성모당 — 작은 바위 굴과 흰 상 */
  make(scene, 'epi_grotto', 96, 110, function (g) {
    g.fillStyle(0x000000, 0.14); g.fillEllipse(48, 104, 74, 12);
    g.fillStyle(0x8d8478, 1); g.fillRoundedRect(6, 22, 84, 84, 16);
    g.fillStyle(0x9d9488, 1); g.fillRoundedRect(10, 26, 76, 74, 14);
    g.fillStyle(0x3b3a38, 1);
    g.beginPath(); g.arc(48, 66, 26, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
    g.fillPath();
    g.fillRect(22, 66, 52, 34);
    g.fillStyle(0xf4f1ea, 1);
    g.fillRoundedRect(42, 54, 12, 34, 5);
    g.fillCircle(48, 52, 6);
    g.fillStyle(0x8fc0d9, 0.9); g.fillRoundedRect(41, 62, 14, 5, 2);
    g.fillStyle(0x8aa96b, 1);
    g.fillCircle(16, 96, 8); g.fillCircle(80, 98, 7);
  });

  /* 환영 플래카드 */
  /* 두 줄이 넉넉히 들어가도록 */
  make(scene, 'epi_banner', 300, 84, function (g) {
    g.fillStyle(0x000000, 0.12); g.fillRoundedRect(3, 6, 300, 76, 8);
    g.fillStyle(0xf4ede0, 1); g.fillRoundedRect(0, 0, 300, 76, 8);
    g.lineStyle(3, 0xc9553f, 0.9); g.strokeRoundedRect(0, 0, 300, 76, 8);
    g.fillStyle(0xe8dcc2, 0.7); g.fillRoundedRect(10, 10, 280, 56, 5);
    g.fillStyle(0xc9553f, 0.9); g.fillRect(0, 0, 8, 76); g.fillRect(292, 0, 8, 76);
  });

  /* 환영 팻말 */
  make(scene, 'epi_sign', 72, 74, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(32, 34, 7, 40, 3);
    g.fillStyle(0xfdf3e0, 1); g.fillRoundedRect(0, 0, 72, 40, 7);
    g.lineStyle(2, 0xe0954a, 0.9); g.strokeRoundedRect(0, 0, 72, 40, 7);
    g.fillStyle(0xc9553f, 1); g.fillRoundedRect(10, 10, 52, 5, 2.5);
    g.fillStyle(0x3f6f8f, 1); g.fillRoundedRect(16, 22, 40, 4, 2);
  });

  /* 작은 태극기 */
  make(scene, 'epi_flag_kr', 40, 52, function (g) {
    g.fillStyle(0x8a6340, 1); g.fillRoundedRect(2, 6, 3, 46, 1.5);
    g.fillStyle(0xfdfaf3, 1); g.fillRoundedRect(5, 6, 34, 22, 3);
    g.lineStyle(1, 0xd9cfc0, 1); g.strokeRoundedRect(5, 6, 34, 22, 3);
    g.fillStyle(0xc9553f, 1);
    g.slice(22, 17, 7, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false); g.fillPath();
    g.fillStyle(0x3f6f8f, 1);
    g.slice(22, 17, 7, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(180), false); g.fillPath();
    g.fillStyle(0x2b2b2b, 1);
    g.fillRect(9, 11, 4, 1.5); g.fillRect(9, 21, 4, 1.5);
    g.fillRect(31, 11, 4, 1.5); g.fillRect(31, 21, 4, 1.5);
  });

  /* 이름표 테이블 */
  make(scene, 'epi_desk_name', 120, 62, function (g) {
    g.fillStyle(0x000000, 0.14); g.fillEllipse(60, 58, 96, 10);
    g.fillStyle(0xb98a5e, 1); g.fillRoundedRect(6, 22, 108, 12, 4);
    g.fillStyle(0x8a6340, 1); g.fillRect(16, 34, 8, 22); g.fillRect(96, 34, 8, 22);
    g.fillStyle(0xfdf3e0, 1);
    g.fillRoundedRect(22, 10, 26, 16, 3); g.fillRoundedRect(54, 12, 26, 14, 3);
    g.fillRoundedRect(84, 10, 24, 16, 3);
    g.fillStyle(0xd9cfc0, 1);
    g.fillRect(27, 17, 16, 2); g.fillRect(59, 18, 16, 2); g.fillRect(89, 17, 14, 2);
  });

  /* 긴 식탁 */
  make(scene, 'epi_long_table', 220, 84, function (g) {
    g.fillStyle(0x000000, 0.14); g.fillEllipse(110, 80, 180, 12);
    g.fillStyle(0xc9a97f, 1); g.fillRoundedRect(0, 16, 220, 20, 6);
    g.fillStyle(0xdfc6a2, 1); g.fillRoundedRect(0, 16, 220, 7, 3);
    g.fillStyle(0x8a6340, 1);
    g.fillRect(18, 36, 10, 42); g.fillRect(192, 36, 10, 42);
    g.fillStyle(0xf4ede0, 1);
    g.fillEllipse(48, 26, 26, 9); g.fillEllipse(110, 26, 26, 9); g.fillEllipse(172, 26, 26, 9);
    g.fillStyle(0xc9553f, 0.8); g.fillEllipse(110, 25, 14, 5);
    g.fillStyle(0x8aa96b, 0.8); g.fillEllipse(48, 25, 12, 4);
    g.fillStyle(0xf0c05a, 0.9); g.fillEllipse(172, 25, 12, 4);
  });

  /* 전구 줄 */
  make(scene, 'epi_lights', 240, 40, function (g) {
    g.lineStyle(2, 0x6b5544, 0.9);
    g.beginPath(); g.moveTo(0, 6);
    for (let x = 0; x <= 240; x += 8) g.lineTo(x, 6 + Math.sin(x / 30) * 7 + 5);
    g.strokePath();
    for (let i = 0; i < 9; i++) {
      const x = 14 + i * 27;
      const y = 11 + Math.sin(x / 30) * 7 + 5;
      g.fillStyle(0xf2b56b, 0.35); g.fillCircle(x, y + 6, 9);
      g.fillStyle(0xffe0a8, 1); g.fillCircle(x, y + 6, 4.5);
    }
  });

  /* 간식 */
  make(scene, 'epi_tteok', 44, 34, function (g) {
    g.fillStyle(0xf4ede0, 1); g.fillEllipse(22, 22, 40, 20);
    g.fillStyle(0xd9cfc0, 1); g.fillEllipse(22, 20, 34, 15);
    g.fillStyle(0xc9553f, 1); g.fillEllipse(22, 19, 30, 12);
    g.fillStyle(0xe8dcc2, 1);
    g.fillRoundedRect(11, 15, 10, 5, 2.5); g.fillRoundedRect(23, 17, 10, 5, 2.5);
    g.fillRoundedRect(17, 21, 10, 5, 2.5);
  });
  make(scene, 'epi_gimbap', 44, 30, function (g) {
    g.fillStyle(0xf4ede0, 1); g.fillEllipse(22, 20, 40, 18);
    for (let i = 0; i < 3; i++) {
      const x = 10 + i * 12;
      g.fillStyle(0x2f3a2a, 1); g.fillCircle(x, 15, 6.5);
      g.fillStyle(0xfdfaf3, 1); g.fillCircle(x, 15, 4.6);
      g.fillStyle(0xf0c05a, 1); g.fillCircle(x - 1, 14, 1.6);
      g.fillStyle(0xc9553f, 1); g.fillCircle(x + 1.6, 16, 1.5);
      g.fillStyle(0x8aa96b, 1); g.fillCircle(x, 17, 1.4);
    }
  });
  make(scene, 'epi_snackbag', 32, 38, function (g) {
    g.fillStyle(0xe08a5e, 1); g.fillRoundedRect(2, 4, 28, 32, 5);
    g.fillStyle(0xf4ede0, 0.9); g.fillRoundedRect(6, 14, 20, 11, 3);
    g.fillStyle(0xc9553f, 1); g.fillRect(9, 18, 14, 3);
    g.fillStyle(0xd97f52, 1); g.fillRoundedRect(2, 0, 28, 7, 3);
  });
  make(scene, 'epi_fruit', 34, 30, function (g) {
    g.fillStyle(0xf4ede0, 1); g.fillEllipse(17, 21, 32, 15);
    g.fillStyle(0xf0a05a, 1); g.fillCircle(11, 15, 6);
    g.fillStyle(0xc9553f, 1); g.fillCircle(22, 16, 5.4);
    g.fillStyle(0x8aa96b, 1); g.fillCircle(17, 12, 4.6);
  });
  make(scene, 'epi_drink', 24, 38, function (g) {
    g.fillStyle(0xdce8ef, 0.95); g.fillRoundedRect(4, 8, 16, 28, 4);
    g.fillStyle(0xe0954a, 0.85); g.fillRoundedRect(5, 18, 14, 17, 3);
    g.fillStyle(0xfdfaf3, 1); g.fillRoundedRect(3, 5, 18, 5, 2.5);
    g.fillStyle(0xc9553f, 1); g.fillRoundedRect(14, 0, 3, 12, 1.5);
  });

  /* 놀이 도구 */
  make(scene, 'epi_jegi', 30, 34, function (g) {
    g.fillStyle(0xc9553f, 1); g.fillCircle(15, 25, 6.5);
    g.fillStyle(0xe0954a, 1); g.fillCircle(15, 25, 3.6);
    g.fillStyle(0xf0c05a, 0.95);
    g.fillRoundedRect(13, 4, 4, 18, 2);
    g.fillRoundedRect(7, 8, 4, 14, 2);
    g.fillRoundedRect(19, 8, 4, 14, 2);
    g.fillStyle(0x8fc0d9, 0.9);
    g.fillRoundedRect(10, 6, 3, 14, 1.5); g.fillRoundedRect(17, 6, 3, 14, 1.5);
  });
  make(scene, 'epi_gonggi', 20, 20, function (g) {
    g.fillStyle(0x000000, 0.14); g.fillEllipse(10, 17, 14, 5);
    g.fillStyle(0xe07f9a, 1); g.fillRoundedRect(3, 4, 14, 12, 5);
    g.fillStyle(0xf4b8c6, 0.9); g.fillRoundedRect(5, 6, 7, 5, 2.5);
  });
  make(scene, 'epi_mat', 180, 90, function (g) {
    g.fillStyle(0xd8c49a, 1); g.fillRoundedRect(0, 0, 180, 90, 10);
    g.lineStyle(2, 0xc0aa80, 1);
    for (let x = 10; x < 180; x += 16) g.lineBetween(x, 4, x, 86);
    g.lineStyle(3, 0xb59a6e, 1); g.strokeRoundedRect(2, 2, 176, 86, 10);
  });
  make(scene, 'epi_speaker', 34, 46, function (g) {
    g.fillStyle(0x000000, 0.14); g.fillEllipse(17, 44, 28, 7);
    g.fillStyle(0x4a4436, 1); g.fillRoundedRect(2, 2, 30, 40, 6);
    g.fillStyle(0x6b5544, 1); g.fillCircle(17, 16, 9);
    g.fillStyle(0x2b2b28, 1); g.fillCircle(17, 16, 5.5);
    g.fillStyle(0xf2b56b, 1); g.fillCircle(17, 33, 3);
  });

  /* 사진 프레임 · 폴라로이드 */
  make(scene, 'epi_frame', 320, 250, function (g) {
    g.fillStyle(0x000000, 0.2); g.fillRoundedRect(4, 8, 320, 250, 10);
    g.fillStyle(0xfdfaf3, 1); g.fillRoundedRect(0, 0, 320, 250, 10);
    g.fillStyle(0x1f2a44, 1); g.fillRoundedRect(12, 12, 296, 190, 6);
  });

  /* 여행 노트 뒷표지의 사진 자리 */
  make(scene, 'epi_photo_slot', 260, 190, function (g) {
    g.fillStyle(0xfdfaf3, 1); g.fillRoundedRect(0, 0, 260, 190, 10);
    g.lineStyle(2, 0xd9cfc0, 1); g.strokeRoundedRect(0, 0, 260, 190, 10);
    g.fillStyle(0x1f2a44, 1); g.fillRoundedRect(10, 10, 240, 138, 6);
  });

  /* 성당 마당 바닥 */
  make(scene, 'epi_yard_tile', 48, 48, function (g) {
    g.fillStyle(0xd6cdb8, 1); g.fillRect(0, 0, 48, 48);
    g.lineStyle(1, 0xc8bda6, 1); g.strokeRect(0.5, 0.5, 47, 47);
    g.fillStyle(0xcdc3ac, 0.6); g.fillRect(0, 44, 48, 2);
  });

  /* ── 놀이에 쓰는 그림 ──────────────────────── */

  /* 제기를 차 올리는 발 — 뒤꿈치를 축으로 돌립니다 */
  make(scene, 'epi_foot', 46, 24, function (g) {
    g.fillStyle(0x4a5a74, 1); g.fillRoundedRect(0, 4, 20, 15, 6);      // 바짓단
    g.fillStyle(0xf2ece0, 1); g.fillRoundedRect(10, 8, 34, 12, 6);     // 신발
    g.fillStyle(0xd6cdbc, 1); g.fillRoundedRect(10, 16, 34, 5, 2.5);   // 밑창
    g.fillStyle(0xc9553f, 0.85); g.fillRoundedRect(24, 10, 12, 3, 1.5);
  });

  /* 공깃돌이 얹히는 손등 — 손가락은 오른쪽을 봅니다.
     돗자리 위에서도 손 모양이 또렷하도록 테두리를 둘렀습니다. */
  make(scene, 'epi_hand_back', 96, 48, function (g) {
    g.fillStyle(0x000000, 0.15); g.fillEllipse(48, 44, 78, 9);
    g.fillStyle(0xc98f63, 1); g.fillRoundedRect(2, 18, 22, 18, 8);     // 손목
    g.fillStyle(0xdca878, 1); g.fillRoundedRect(12, 12, 50, 26, 11);   // 손등
    g.lineStyle(2, 0xa87a52, 1); g.strokeRoundedRect(12, 12, 50, 26, 11);
    for (let i = 0; i < 4; i++) {                                      // 손가락 넷
      const y = 13.5 + i * 6.4, w = 30 - i * 3;
      g.fillStyle(0xdca878, 1); g.fillRoundedRect(58, y, w, 5.6, 2.8);
      g.lineStyle(1.3, 0xa87a52, 0.85); g.strokeRoundedRect(58, y, w, 5.6, 2.8);
    }
    g.fillStyle(0xd39e6e, 1); g.fillRoundedRect(16, 31, 24, 10, 5);    // 엄지
    g.lineStyle(1.3, 0xa87a52, 0.85); g.strokeRoundedRect(16, 31, 24, 10, 5);
  });

  /* 공깃돌을 낚아채는 손 — 손가락을 오므렸습니다 */
  make(scene, 'epi_hand_open', 96, 58, function (g) {
    g.fillStyle(0x000000, 0.15); g.fillEllipse(48, 54, 74, 9);
    g.fillStyle(0xc98f63, 1); g.fillRoundedRect(2, 28, 22, 18, 8);     // 손목
    g.fillStyle(0xdca878, 1); g.fillRoundedRect(12, 22, 50, 26, 11);   // 손바닥
    g.lineStyle(2, 0xa87a52, 1); g.strokeRoundedRect(12, 22, 50, 26, 11);
    for (let i = 0; i < 4; i++) {                                      // 세워 오므린 손가락
      const x = 48 + i * 9, y = 6 + i * 3.5, h = 24 - i * 2;
      g.fillStyle(0xdca878, 1); g.fillRoundedRect(x, y, 9.5, h, 4.7);
      g.lineStyle(1.3, 0xa87a52, 0.85); g.strokeRoundedRect(x, y, 9.5, h, 4.7);
    }
    g.fillStyle(0xd39e6e, 1); g.fillRoundedRect(14, 40, 25, 11, 5.5);  // 엄지
    g.lineStyle(1.3, 0xa87a52, 0.85); g.strokeRoundedRect(14, 40, 25, 11, 5.5);
  });

  /* 골대 — 앞에서 본 모습, 그물까지 */
  make(scene, 'epi_goal', 150, 62, function (g) {
    g.fillStyle(0xffffff, 0.16); g.fillRoundedRect(8, 8, 134, 46, 6);
    g.lineStyle(1, 0xf4ede0, 0.5);
    for (let x = 16; x < 142; x += 12) g.lineBetween(x, 10, x, 52);
    for (let y = 14; y < 54; y += 11) g.lineBetween(10, y, 140, y);
    g.lineStyle(5, 0xfaf6ec, 1);
    g.lineBetween(6, 6, 144, 6);
    g.lineBetween(6, 6, 6, 56);
    g.lineBetween(144, 6, 144, 56);
  });

  /* 말풍선 안의 인사 — 여러 나라 말이 동시에 뜹니다 */
  make(scene, 'epi_bubble', 96, 44, function (g) {
    g.fillStyle(0x000000, 0.12); g.fillRoundedRect(3, 5, 92, 34, 14);
    g.fillStyle(0xfdfaf3, 1); g.fillRoundedRect(0, 0, 92, 34, 14);
    g.fillTriangle(30, 32, 44, 32, 32, 42);
  });
};
