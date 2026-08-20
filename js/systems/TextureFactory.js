/* 모든 그림을 코드로 직접 그립니다 — 외부 이미지 에셋이 없어 저작권 걱정이 없습니다.
   따뜻한 색, 단순한 도형, 알아보기 쉬운 실루엣을 원칙으로 합니다. */

window.TextureFactory = (function () {

  function make(scene, key, w, h, fn) {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    fn(g, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  function canvasTex(scene, key, w, h, fn) {
    if (scene.textures.exists(key)) return;
    const tex = scene.textures.createCanvas(key, w, h);
    fn(tex.getContext(), w, h);
    tex.refresh();
  }

  /* ── 사람 그리기 ─────────────────────────────── */
  function person(g, o) {
    const cx = 16;
    g.fillStyle(o.pants, 1);
    g.fillRoundedRect(cx - 8, 30, 6, 12, 3);
    g.fillRoundedRect(cx + 2, 30, 6, 12, 3);
    g.fillStyle(o.shoes, 1);
    g.fillRoundedRect(cx - 9, 40, 8, 5, 2.5);
    g.fillRoundedRect(cx + 1, 40, 8, 5, 2.5);
    g.fillStyle(o.shirt, 1);
    g.fillRoundedRect(cx - 11, 16, 22, 17, 7);
    g.fillStyle(o.skin, 1);
    g.fillRoundedRect(cx - 14, 20, 5, 11, 2.5);
    g.fillRoundedRect(cx + 9, 20, 5, 11, 2.5);
    if (o.stripe) {
      g.fillStyle(o.stripe, 1);
      g.fillRoundedRect(cx - 11, 24, 22, 3, 1.5);
    }
    g.fillStyle(o.skin, 1);
    g.fillRoundedRect(cx - 3, 12, 6, 6, 2);
    g.fillCircle(cx, 9, 9);
    g.fillStyle(o.hair, 1);
    g.fillRoundedRect(cx - 9.4, 3, 18.8, 6, 3);
    g.slice(cx, 9, 9.4, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
    g.fillPath();
    if (o.back) {
      g.fillStyle(o.hair, 1);
      g.fillCircle(cx, 10, 9);
      if (o.bag) {
        g.fillStyle(o.bag, 1);
        g.fillRoundedRect(cx - 8, 18, 16, 14, 5);
        g.fillStyle(0x000000, 0.12);
        g.fillRoundedRect(cx - 8, 25, 16, 3, 1.5);
      }
    } else {
      g.fillStyle(0x3b2b22, 1);
      g.fillCircle(cx - 3.4, 10, 1.5);
      g.fillCircle(cx + 3.4, 10, 1.5);
      g.lineStyle(1.4, 0xc98570, 1);
      g.beginPath();
      g.arc(cx, 11.5, 3.2, Phaser.Math.DegToRad(25), Phaser.Math.DegToRad(155));
      g.strokePath();
    }
  }

  function createAll(scene) {
    const P = {
      skin: 0xf6d3b0, hair: 0x33261f,
      pshirt: 0xa8d4e6, ppants: 0x3f5a80, pshoes: 0xffffff,
      cshirt: 0xc9553f, cpants: 0x4a6fa0, cshoes: 0xf3ece2
    };

    /* 주인공 */
    make(scene, 'player_front', 32, 46, function (g) {
      person(g, { skin: P.skin, hair: P.hair, shirt: P.pshirt, pants: P.ppants, shoes: P.pshoes, stripe: 0xffffff });
    });
    make(scene, 'player_back', 32, 46, function (g) {
      person(g, { skin: P.skin, hair: P.hair, shirt: P.pshirt, pants: P.ppants, shoes: P.pshoes, stripe: 0xffffff, back: true });
    });
    /* 카를로 — 붉은 폴로와 순례 배낭 */
    make(scene, 'carlo_front', 32, 46, function (g) {
      person(g, { skin: P.skin, hair: 0x2b2119, shirt: P.cshirt, pants: P.cpants, shoes: P.cshoes });
    });
    make(scene, 'carlo_back', 32, 46, function (g) {
      person(g, { skin: P.skin, hair: 0x2b2119, shirt: P.cshirt, pants: P.cpants, shoes: P.cshoes, back: true, bag: 0x6d8f5f });
    });
    /* 엄마 */
    make(scene, 'mom_front', 32, 46, function (g) {
      person(g, { skin: 0xf3cdaa, hair: 0x4a3226, shirt: 0xe2b7c4, pants: 0x7a6a86, shoes: 0xd9cfc4 });
    });

    make(scene, 'shadow', 34, 14, function (g) {
      g.fillStyle(0x000000, 0.18); g.fillEllipse(17, 7, 30, 11);
    });

    /* ── 집 · 가구 ─────────────────────────────── */
    make(scene, 'floor_tile', 48, 48, function (g) {
      g.fillStyle(0xe8cfa9, 1); g.fillRect(0, 0, 48, 48);
      g.lineStyle(1, 0xdcbf95, 1); g.strokeRect(0.5, 0.5, 47, 47);
      g.fillStyle(0xdfc39c, 0.55); g.fillRect(0, 44, 48, 2);
    });
    make(scene, 'wall_tile', 48, 48, function (g) {
      g.fillStyle(0xf0d9b8, 1); g.fillRect(0, 0, 48, 48);
      g.fillStyle(0xe6cba4, 0.5); g.fillRect(0, 0, 48, 3);
    });
    make(scene, 'rug', 150, 90, function (g) {
      g.fillStyle(0xd9a97f, 1); g.fillEllipse(75, 45, 150, 90);
      g.fillStyle(0xe8c39d, 1); g.fillEllipse(75, 45, 118, 66);
      g.fillStyle(0xd9a97f, 1); g.fillEllipse(75, 45, 84, 42);
    });
    make(scene, 'table', 74, 52, function (g) {
      g.fillStyle(0x8a6340, 1);
      g.fillRoundedRect(6, 26, 8, 20, 3); g.fillRoundedRect(60, 26, 8, 20, 3);
      g.fillStyle(0xb98a5e, 1); g.fillRoundedRect(0, 6, 74, 26, 9);
      g.fillStyle(0xcaa079, 1); g.fillRoundedRect(4, 9, 66, 16, 7);
      g.fillStyle(0x7bb26a, 1); g.fillCircle(24, 17, 7.5);
      g.fillStyle(0xef7373, 1); g.fillCircle(24, 17, 5.6);
      g.fillStyle(0xfff6e6, 1); g.fillRoundedRect(44, 12, 16, 11, 3);
    });
    make(scene, 'tv', 62, 50, function (g) {
      g.fillStyle(0x6f5b49, 1); g.fillRoundedRect(24, 38, 14, 8, 3);
      g.fillStyle(0x3a3a44, 1); g.fillRoundedRect(0, 2, 62, 36, 6);
      g.fillStyle(0x8fb9cf, 1); g.fillRoundedRect(4, 6, 54, 28, 4);
      g.fillStyle(0xffffff, 0.35); g.fillTriangle(6, 34, 22, 6, 34, 34);
    });
    make(scene, 'fridge', 44, 62, function (g) {
      g.fillStyle(0xf3efe6, 1); g.fillRoundedRect(0, 0, 44, 62, 8);
      g.fillStyle(0xe0d9cc, 1); g.fillRect(0, 26, 44, 2);
      g.fillStyle(0xbfb6a6, 1); g.fillRoundedRect(33, 8, 4, 14, 2); g.fillRoundedRect(33, 32, 4, 14, 2);
      g.fillStyle(0xf2b56b, 1); g.fillRoundedRect(7, 6, 12, 9, 2);
      g.fillStyle(0x8fc0d9, 1); g.fillRoundedRect(7, 33, 14, 10, 2);
    });
    make(scene, 'sofa', 86, 46, function (g) {
      g.fillStyle(0x9db98f, 1); g.fillRoundedRect(0, 4, 86, 34, 10);
      g.fillStyle(0xb3cba4, 1); g.fillRoundedRect(8, 12, 30, 20, 7); g.fillRoundedRect(48, 12, 30, 20, 7);
      g.fillStyle(0x87a37a, 1); g.fillRoundedRect(0, 30, 86, 12, 6);
    });
    make(scene, 'plant', 30, 40, function (g) {
      g.fillStyle(0xc9755a, 1); g.fillRoundedRect(8, 26, 14, 13, 3);
      g.fillStyle(0x8aa96b, 1);
      g.fillEllipse(15, 18, 20, 16); g.fillEllipse(9, 12, 13, 11); g.fillEllipse(21, 11, 13, 11);
      g.fillStyle(0x9dbb7c, 1); g.fillEllipse(15, 13, 11, 9);
    });
    make(scene, 'window_warm', 66, 46, function (g) {
      g.fillStyle(0xb98a5e, 1); g.fillRoundedRect(0, 0, 66, 46, 5);
      g.fillStyle(0xf6cf9a, 1); g.fillRect(4, 4, 58, 38);
      g.fillStyle(0xf2b56b, 1); g.fillRect(4, 26, 58, 16);
      g.fillStyle(0xb98a5e, 1); g.fillRect(32, 4, 3, 38); g.fillRect(4, 22, 58, 3);
    });
    make(scene, 'door', 48, 60, function (g) {
      g.fillStyle(0x8a6340, 1); g.fillRoundedRect(0, 0, 48, 60, 6);
      g.fillStyle(0xb98a5e, 1); g.fillRoundedRect(4, 4, 40, 52, 4);
      g.fillStyle(0xf2b56b, 1); g.fillCircle(38, 32, 3);
    });
    make(scene, 'bed', 66, 92, function (g) {
      g.fillStyle(0x8a6340, 1); g.fillRoundedRect(0, 0, 66, 92, 8);
      g.fillStyle(0xfdf3e0, 1); g.fillRoundedRect(4, 6, 58, 82, 6);
      g.fillStyle(0xffffff, 1); g.fillRoundedRect(9, 10, 48, 20, 6);
      g.fillStyle(0x9db8d6, 1); g.fillRoundedRect(4, 34, 58, 54, 6);
      g.fillStyle(0xaec7e0, 1); g.fillRoundedRect(4, 34, 58, 8, 4);
    });
    make(scene, 'desk', 68, 46, function (g) {
      g.fillStyle(0x8a6340, 1); g.fillRoundedRect(4, 28, 7, 16, 3); g.fillRoundedRect(57, 28, 7, 16, 3);
      g.fillStyle(0xc09466, 1); g.fillRoundedRect(0, 8, 68, 22, 6);
      g.fillStyle(0xfdf3e0, 1); g.fillRoundedRect(10, 12, 24, 15, 2);
      g.lineStyle(1, 0xcbbfae, 1); g.lineBetween(14, 17, 30, 17); g.lineBetween(14, 21, 28, 21);
      g.fillStyle(0x8fc0d9, 1); g.fillRoundedRect(40, 12, 18, 15, 3);
    });
    make(scene, 'console_toy', 34, 24, function (g) {
      g.fillStyle(0x5c6b8a, 1); g.fillRoundedRect(0, 4, 34, 16, 6);
      g.fillStyle(0x3f4a63, 1); g.fillRoundedRect(11, 7, 12, 10, 2);
      g.fillStyle(0xf2b56b, 1); g.fillCircle(6, 12, 3); g.fillCircle(28, 12, 3);
    });
    make(scene, 'bag', 34, 38, function (g) {
      g.lineStyle(3, 0x3e6a58, 1); g.beginPath(); g.arc(17, 9, 8, Math.PI, 0); g.strokePath();
      g.fillStyle(0x4f7d6a, 1); g.fillRoundedRect(2, 6, 30, 30, 9);
      g.fillStyle(0x3e6a58, 1); g.fillRoundedRect(2, 20, 30, 10, 5);
      g.fillStyle(0xf2b56b, 1); g.fillRoundedRect(13, 22, 8, 5, 2);
    });
    make(scene, 'rosary', 28, 36, function (g) {
      g.fillStyle(0x7a5f8a, 1);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        g.fillCircle(14 + Math.cos(a) * 9, 12 + Math.sin(a) * 8, 2.1);
      }
      g.fillStyle(0xd7c07f, 1);
      g.fillRoundedRect(12.5, 22, 3, 12, 1.2);
      g.fillRoundedRect(9, 25, 10, 3, 1.2);
    });
    make(scene, 'lamp_room', 30, 44, function (g) {
      g.fillStyle(0x8a6340, 1); g.fillRoundedRect(12, 20, 6, 18, 2);
      g.fillStyle(0x6f5b49, 1); g.fillEllipse(15, 40, 20, 8);
      g.fillStyle(0xf6cf9a, 1);
      g.fillTriangle(3, 22, 27, 22, 21, 6); g.fillTriangle(3, 22, 21, 6, 9, 6);
      g.fillStyle(0xfde3b4, 1); g.fillRoundedRect(8, 5, 14, 4, 2);
    });
    make(scene, 'shelf', 46, 62, function (g) {
      g.fillStyle(0xb98a5e, 1); g.fillRoundedRect(0, 0, 46, 62, 4);
      g.fillStyle(0xd9b98c, 1); g.fillRect(3, 3, 40, 26); g.fillRect(3, 33, 40, 26);
      const cols = [0xc9553f, 0x4f7d6a, 0x5c6b8a, 0xd7a04f, 0x7a5f8a];
      for (let i = 0; i < 5; i++) { g.fillStyle(cols[i], 1); g.fillRect(6 + i * 7, 8, 5, 21); }
      for (let i = 0; i < 4; i++) { g.fillStyle(cols[(i + 2) % 5], 1); g.fillRect(7 + i * 7, 38, 5, 21); }
    });
    make(scene, 'poster', 34, 28, function (g) {
      g.fillStyle(0xfdf3e0, 1); g.fillRoundedRect(0, 0, 34, 28, 3);
      g.fillStyle(0x8fc0d9, 1); g.fillRect(3, 3, 28, 14);
      g.fillStyle(0xf2b56b, 1); g.fillCircle(25, 8, 3.5);
      g.fillStyle(0xd9c2a3, 1); g.fillRect(3, 17, 28, 8);
    });
    make(scene, 'phone_obj', 24, 40, function (g) {
      g.fillStyle(0x3a3a44, 1); g.fillRoundedRect(0, 0, 24, 40, 5);
      g.fillStyle(0x9fd0e6, 1); g.fillRoundedRect(2.5, 3, 19, 34, 3);
      g.fillStyle(0xffffff, 0.5); g.fillRoundedRect(5, 6, 8, 3, 1.5);
    });

    /* ── 꿈속 해변 ─────────────────────────────── */
    canvasTex(scene, 'sky_night', 8, 844, function (ctx, w, h) {
      const grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0.00, '#101c38');
      grd.addColorStop(0.30, '#1b2d54');
      grd.addColorStop(0.54, '#3a4f7a');
      grd.addColorStop(0.74, '#7c80a2');
      grd.addColorStop(0.88, '#d59a86');
      grd.addColorStop(1.00, '#f0b98d');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    });
    make(scene, 'bench', 68, 36, function (g) {
      g.fillStyle(0x6f5b49, 1); g.fillRoundedRect(6, 24, 6, 11, 2); g.fillRoundedRect(56, 24, 6, 11, 2);
      g.fillStyle(0xa8814f, 1); g.fillRoundedRect(0, 16, 68, 10, 4);
      g.fillStyle(0xbb9563, 1); g.fillRoundedRect(2, 4, 64, 6, 3); g.fillRoundedRect(2, 11, 64, 5, 3);
    });
    make(scene, 'streetlamp', 26, 78, function (g) {
      g.fillStyle(0x4b5570, 1); g.fillRoundedRect(10, 16, 6, 58, 3); g.fillRoundedRect(5, 71, 16, 5, 2);
      g.fillStyle(0xf6d79a, 1); g.fillCircle(13, 11, 8);
      g.fillStyle(0xfff1cf, 0.9); g.fillCircle(13, 11, 5);
    });
    make(scene, 'lamp_glow', 140, 140, function (g) {
      for (let i = 12; i > 0; i--) { g.fillStyle(0xffe0a8, 0.03); g.fillCircle(70, 70, i * 6); }
    });
    make(scene, 'shell', 20, 18, function (g) {
      g.fillStyle(0xf6e3d4, 1);
      g.slice(10, 15, 9, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false); g.fillPath();
      g.lineStyle(1, 0xdcb9a3, 1);
      g.lineBetween(10, 15, 3, 8); g.lineBetween(10, 15, 10, 5); g.lineBetween(10, 15, 17, 8);
    });
    make(scene, 'cat', 34, 24, function (g) {
      g.fillStyle(0xe6d3b8, 1);
      g.fillEllipse(15, 15, 24, 13);
      g.fillTriangle(23, 6, 27, 0, 30, 7); g.fillTriangle(26, 6, 32, 1, 33, 8);
      g.fillCircle(27, 11, 7);
      g.lineStyle(2.4, 0xe6d3b8, 1); g.beginPath(); g.arc(4, 12, 6, Math.PI * 0.4, Math.PI * 1.6); g.strokePath();
      g.fillStyle(0x4a4038, 1); g.fillCircle(25, 10, 1.4); g.fillCircle(30, 10, 1.4);
    });
    make(scene, 'boat', 66, 30, function (g) {
      g.fillStyle(0xdbe4ee, 1); g.fillTriangle(30, 2, 30, 16, 12, 16);
      g.fillStyle(0x8a6340, 1); g.fillRoundedRect(28, 2, 3, 16, 1);
      g.fillStyle(0xa8814f, 1);
      g.fillTriangle(2, 18, 64, 18, 56, 28); g.fillRoundedRect(2, 17, 62, 4, 2);
    });
    make(scene, 'rock', 42, 30, function (g) {
      g.fillStyle(0x6f7a8c, 1); g.fillEllipse(21, 20, 40, 20);
      g.fillStyle(0x8793a6, 1); g.fillEllipse(17, 15, 26, 15);
    });
    make(scene, 'footprint', 14, 20, function (g) {
      g.fillStyle(0x000000, 0.15); g.fillEllipse(7, 8, 10, 14); g.fillEllipse(7, 17, 7, 6);
    });
    make(scene, 'dot', 8, 8, function (g) { g.fillStyle(0xffffff, 1); g.fillCircle(4, 4, 4); });
    make(scene, 'spark', 12, 12, function (g) {
      g.fillStyle(0xfff3d6, 0.9); g.fillCircle(6, 6, 3);
      g.fillStyle(0xfff3d6, 0.25); g.fillCircle(6, 6, 6);
    });
    make(scene, 'seafoam', 64, 12, function (g) {
      g.fillStyle(0xffffff, 0.5); g.fillRoundedRect(0, 4, 64, 5, 2.5);
      g.fillStyle(0xffffff, 0.28); g.fillRoundedRect(6, 0, 40, 4, 2);
    });
    canvasTex(scene, 'nebula', 256, 256, function (ctx, w, h) {
      const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      grd.addColorStop(0, 'rgba(255,255,255,0.55)');
      grd.addColorStop(0.35, 'rgba(255,255,255,0.22)');
      grd.addColorStop(0.7, 'rgba(255,255,255,0.06)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    });
    make(scene, 'watering_can', 68, 52, function (g) {
      g.fillStyle(0x7fa6c4, 1);
      g.fillRoundedRect(6, 14, 38, 30, 8);
      g.fillRoundedRect(38, 18, 8, 8, 3);
      g.fillTriangle(44, 20, 66, 6, 62, 16);
      g.fillRoundedRect(58, 2, 10, 10, 3);
      g.lineStyle(5, 0x7fa6c4, 1);
      g.beginPath(); g.arc(16, 14, 10, Math.PI, Math.PI * 1.9); g.strokePath();
      g.fillStyle(0x9cc0d8, 1); g.fillRoundedRect(10, 18, 30, 8, 4);
    });
    make(scene, 'plate', 96, 96, function (g) {
      g.fillStyle(0xffffff, 1); g.fillCircle(48, 48, 46);
      g.fillStyle(0xeef1f4, 1); g.fillCircle(48, 48, 36);
      g.lineStyle(2, 0xd6dde4, 1); g.strokeCircle(48, 48, 46);
    });
    make(scene, 'bible_book', 44, 56, function (g) {
      g.fillStyle(0x6b3f36, 1); g.fillRoundedRect(0, 0, 44, 56, 4);
      g.fillStyle(0x8a5347, 1); g.fillRoundedRect(4, 3, 36, 50, 3);
      g.fillStyle(0xd7c07f, 1);
      g.fillRoundedRect(20, 12, 4, 30, 1.5); g.fillRoundedRect(13, 20, 18, 4, 1.5);
      g.fillStyle(0xf3ece2, 1); g.fillRect(40, 5, 4, 46);
    });
    make(scene, 'camera_icon', 40, 34, function (g) {
      g.fillStyle(0xfff8ec, 1); g.fillRoundedRect(0, 6, 40, 26, 6);
      g.fillRoundedRect(12, 0, 16, 8, 3);
      g.fillStyle(0x3d2c20, 1); g.fillCircle(20, 19, 9);
      g.fillStyle(0x8fc0d9, 1); g.fillCircle(20, 19, 6);
    });

    /* ── 카를로의 하루 · 2005년 밀라노 ─────────── */

    /* 아침 하늘 */
    canvasTex(scene, 'sky_day', 8, 844, function (ctx, w, h) {
      const grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0.00, '#5d92c6');
      grd.addColorStop(0.26, '#8dbadd');
      grd.addColorStop(0.54, '#bdd8e9');
      grd.addColorStop(0.78, '#e7dcc6');
      grd.addColorStop(1.00, '#f3d5a8');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    });

    /* 멀리 보이는 도시 — 사이사이 하늘이 보이도록 띄엄띄엄 */
    make(scene, 'skyline_far', 360, 150, function (g) {
      [[8, 56, 70], [80, 34, 104], [128, 46, 82], [190, 30, 118], [236, 58, 64], [308, 40, 96]]
        .forEach(function (r, i) {
          const x = r[0], w = r[1], h = r[2], top = 150 - h;
          g.fillStyle(0x9db4cc, 1); g.fillRect(x, top, w, h);
          g.fillStyle(0x8ea7c2, 1); g.fillRect(x, top, w, 5);
          g.fillStyle(0xb0c3d6, 0.7);
          for (let c = 0; c * 14 + 8 < w - 6; c++) {
            for (let rr = 0; rr * 18 + 14 < h - 8; rr++) {
              g.fillRect(x + 6 + c * 14, top + 12 + rr * 18, 7, 9);
            }
          }
          if (i === 1) { g.fillStyle(0x9db4cc, 1); g.fillTriangle(x, top, x + w / 2, top - 22, x + w, top); }
        });
    });

    /* 두오모 — 이 도시에 하나뿐입니다 */
    make(scene, 'duomo_far', 140, 160, function (g) {
      g.fillStyle(0xaec2d6, 1);
      g.fillRect(14, 96, 112, 64);
      g.fillStyle(0x9db2c8, 1); g.fillRect(14, 96, 112, 5);
      for (let i = 0; i < 10; i++) {
        const x = 16 + i * 11;
        g.fillStyle(0xaec2d6, 1);
        g.fillTriangle(x, 98, x + 5, 98 - (i % 3 === 0 ? 42 : 26), x + 10, 98);
      }
      g.fillStyle(0xbdd0e2, 1); g.fillTriangle(56, 98, 70, 26, 84, 98);
      g.fillStyle(0xd8e4ef, 1); g.fillRect(68, 12, 4, 16); g.fillRect(64, 16, 12, 4);
      g.fillStyle(0x8fa8c2, 0.6);
      g.fillRect(30, 118, 10, 42); g.fillRect(66, 118, 10, 42); g.fillRect(102, 118, 10, 42);
    });

    /* 성당 */
    make(scene, 'church_milan', 168, 208, function (g) {
      g.fillStyle(0xd8c7ad, 1); g.fillRoundedRect(30, 56, 116, 152, 4);
      g.fillStyle(0xe6d8c1, 1); g.fillTriangle(24, 60, 88, 16, 152, 60);
      g.fillStyle(0xc7b295, 1); g.fillRect(24, 56, 128, 6);
      /* 종탑 */
      g.fillStyle(0xcdbb9f, 1); g.fillRect(0, 34, 30, 174);
      g.fillStyle(0xe0d0b6, 1); g.fillTriangle(-2, 36, 15, 8, 32, 36);
      g.fillStyle(0x6f5b49, 1); g.fillRoundedRect(8, 56, 14, 20, 7);
      /* 십자가 */
      g.fillStyle(0xd7c07f, 1);
      g.fillRect(87, 0, 4, 18); g.fillRect(82, 5, 14, 4);
      /* 장미창 */
      g.fillStyle(0x6f8fb0, 1); g.fillCircle(88, 96, 20);
      g.fillStyle(0xf2b56b, 1); g.fillCircle(88, 96, 12);
      g.fillStyle(0xe08a5a, 1); g.fillCircle(88, 96, 5);
      g.lineStyle(2, 0xc7b295, 1); g.strokeCircle(88, 96, 20);
      /* 문 */
      g.fillStyle(0x8a6340, 1);
      g.fillRoundedRect(64, 148, 48, 60, 4);
      g.slice(88, 150, 24, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false); g.fillPath();
      g.fillStyle(0xb98a5e, 1);
      g.fillRoundedRect(69, 154, 18, 54, 3); g.fillRoundedRect(89, 154, 18, 54, 3);
      g.fillStyle(0xf6d79a, 0.75); g.fillRoundedRect(76, 176, 24, 32, 3);
      /* 창 */
      g.fillStyle(0x6f8fb0, 1);
      g.fillRoundedRect(42, 118, 14, 34, 7); g.fillRoundedRect(120, 118, 14, 34, 7);
    });

    /* 학교 */
    make(scene, 'school_milan', 190, 156, function (g) {
      g.fillStyle(0xc98f70, 1); g.fillRoundedRect(0, 20, 190, 136, 5);
      g.fillStyle(0xb87f61, 1); g.fillRect(0, 20, 190, 8);
      g.fillStyle(0xe0c9a8, 1); g.fillRect(0, 60, 190, 4); g.fillRect(0, 106, 190, 4);
      for (let r = 0; r < 2; r++) {
        for (let i = 0; i < 5; i++) {
          g.fillStyle(0xf6e6c8, 1);
          g.fillRoundedRect(14 + i * 34, 32 + r * 46, 22, 24, 3);
          g.fillStyle(0x8fb2c9, 1);
          g.fillRoundedRect(16 + i * 34, 34 + r * 46, 18, 20, 2);
        }
      }
      g.fillStyle(0x6f5b49, 1); g.fillRoundedRect(76, 118, 38, 38, 3);
      g.fillStyle(0xb98a5e, 1); g.fillRoundedRect(79, 121, 15, 35, 2); g.fillRoundedRect(96, 121, 15, 35, 2);
      g.fillStyle(0xf2b56b, 1); g.fillRect(92, 4, 3, 18); g.fillTriangle(95, 5, 122, 11, 95, 17);
    });

    /* 카를로의 집 (밀라노 아파트) */
    make(scene, 'apart_milan', 156, 212, function (g) {
      g.fillStyle(0xe7c79a, 1); g.fillRoundedRect(0, 16, 156, 196, 5);
      g.fillStyle(0xd8b384, 1); g.fillRect(0, 16, 156, 9);
      g.fillStyle(0xcfa878, 1); g.fillRect(0, 84, 156, 5); g.fillRect(0, 148, 156, 5);
      for (let r = 0; r < 2; r++) {
        for (let i = 0; i < 3; i++) {
          const x = 16 + i * 44, y = 34 + r * 64;
          g.fillStyle(0x7d5c40, 1); g.fillRoundedRect(x, y, 26, 34, 3);
          g.fillStyle(0xf6d79a, 1); g.fillRoundedRect(x + 3, y + 3, 20, 28, 2);
          g.fillStyle(0x8a6340, 1); g.fillRect(x - 3, y + 34, 32, 4);
          g.lineStyle(2, 0x8a6340, 1);
          for (let b = 0; b < 4; b++) g.lineBetween(x + b * 8, y + 24, x + b * 8, y + 34);
        }
      }
      g.fillStyle(0x6f5b49, 1); g.fillRoundedRect(58, 158, 40, 54, 3);
      g.fillStyle(0xa8814f, 1); g.fillRoundedRect(61, 161, 16, 51, 2); g.fillRoundedRect(79, 161, 16, 51, 2);
      g.fillStyle(0xf2b56b, 1); g.fillCircle(76, 188, 2.4);
    });

    /* 밀라노 전차 */
    make(scene, 'tram_milan', 138, 66, function (g) {
      g.fillStyle(0x3d4a5e, 1); g.fillRect(6, 4, 3, 8); g.fillRect(6, 2, 40, 3);
      g.fillStyle(0xe4a33f, 1); g.fillRoundedRect(0, 12, 138, 40, 7);
      g.fillStyle(0xcf8f2f, 1); g.fillRoundedRect(0, 42, 138, 10, 5);
      g.fillStyle(0x2f3b52, 1);
      for (let i = 0; i < 4; i++) g.fillRoundedRect(10 + i * 32, 18, 24, 18, 3);
      g.fillStyle(0x9dc4dd, 1);
      for (let i = 0; i < 4; i++) g.fillRoundedRect(12 + i * 32, 20, 20, 14, 2);
      g.fillStyle(0x2b2b33, 1); g.fillCircle(28, 56, 8); g.fillCircle(110, 56, 8);
      g.fillStyle(0x515966, 1); g.fillCircle(28, 56, 3.4); g.fillCircle(110, 56, 3.4);
      g.fillStyle(0xfff1cf, 1); g.fillCircle(133, 32, 4);
    });

    /* 가로수 */
    make(scene, 'tree_city', 60, 96, function (g) {
      g.fillStyle(0x7a5c42, 1); g.fillRoundedRect(26, 52, 9, 44, 3);
      g.fillStyle(0x6f9457, 1);
      g.fillEllipse(30, 36, 56, 46); g.fillEllipse(16, 46, 30, 26); g.fillEllipse(44, 46, 30, 26);
      g.fillStyle(0x87ab68, 1); g.fillEllipse(28, 30, 34, 26);
      g.fillStyle(0x9cbd7c, 1); g.fillEllipse(22, 24, 16, 12);
    });

    make(scene, 'pigeon', 22, 18, function (g) {
      g.fillStyle(0x8e9aab, 1); g.fillEllipse(10, 11, 16, 10);
      g.fillCircle(16, 6, 4.4);
      g.fillStyle(0x6f7c8e, 1); g.fillEllipse(8, 10, 10, 6);
      g.fillStyle(0xf2b56b, 1); g.fillTriangle(19, 5, 22, 6, 19, 8);
      g.fillStyle(0x3c4453, 1); g.fillCircle(17, 5, 1.1);
    });

    make(scene, 'dog_small', 38, 28, function (g) {
      g.fillStyle(0xd9b183, 1);
      g.fillEllipse(16, 17, 26, 14);
      g.fillCircle(29, 12, 7.5);
      g.fillTriangle(24, 8, 26, 0, 30, 7);
      g.fillRoundedRect(7, 20, 4, 8, 2); g.fillRoundedRect(21, 20, 4, 8, 2);
      g.lineStyle(3, 0xd9b183, 1); g.beginPath(); g.arc(3, 12, 6, Math.PI * 0.5, Math.PI * 1.5); g.strokePath();
      g.fillStyle(0x4a4038, 1); g.fillCircle(31, 11, 1.4); g.fillCircle(33.5, 13.5, 1.6);
    });

    make(scene, 'fountain_city', 92, 56, function (g) {
      g.fillStyle(0xb9bfc7, 1); g.fillEllipse(46, 44, 88, 22);
      g.fillStyle(0x7fa9c4, 1); g.fillEllipse(46, 42, 72, 16);
      g.fillStyle(0xc7ccd4, 1); g.fillRoundedRect(41, 12, 10, 30, 4);
      g.fillEllipse(46, 12, 34, 10);
      g.fillStyle(0xa9d0e4, 0.8);
      g.fillEllipse(46, 16, 26, 6);
    });

    make(scene, 'bike_city', 52, 34, function (g) {
      g.lineStyle(3, 0x50606f, 1);
      g.strokeCircle(12, 22, 10); g.strokeCircle(40, 22, 10);
      g.lineBetween(12, 22, 24, 22); g.lineBetween(24, 22, 40, 22);
      g.lineBetween(24, 22, 20, 10); g.lineBetween(20, 10, 34, 10); g.lineBetween(34, 10, 40, 22);
      g.fillStyle(0x3d4a5e, 1); g.fillRoundedRect(16, 6, 12, 4, 2);
      g.fillStyle(0xc9553f, 1); g.fillRoundedRect(31, 3, 14, 10, 3);
    });

    make(scene, 'soccer_ball', 24, 24, function (g) {
      g.fillStyle(0xffffff, 1); g.fillCircle(12, 12, 11);
      g.fillStyle(0x3d4a5e, 1);
      g.fillTriangle(12, 5, 7, 12, 17, 12);
      g.fillCircle(5, 16, 2.4); g.fillCircle(19, 16, 2.4); g.fillCircle(12, 21, 2.4);
      g.lineStyle(1.6, 0xc8cdd4, 1); g.strokeCircle(12, 12, 11);
    });

    /* 거리에 세워 둔 광고판 */
    make(scene, 'poster_wall', 46, 78, function (g) {
      g.fillStyle(0x6f5b49, 1);
      g.fillRoundedRect(9, 54, 5, 24, 2); g.fillRoundedRect(32, 54, 5, 24, 2);
      g.fillRoundedRect(6, 74, 34, 4, 2);
      g.fillStyle(0x8a6340, 1); g.fillRoundedRect(0, 0, 46, 58, 4);
      g.fillStyle(0xf3ece2, 1); g.fillRoundedRect(3, 3, 40, 52, 3);
      g.fillStyle(0x2f3b52, 1); g.fillRect(6, 6, 34, 28);
      g.fillStyle(0xf2b56b, 1); g.fillCircle(23, 19, 8);
      g.fillStyle(0xc9553f, 1); g.fillRect(6, 39, 34, 5); g.fillRect(6, 47, 22, 4);
    });

    /* 낡은 컴퓨터 */
    make(scene, 'pc_crt', 78, 68, function (g) {
      g.fillStyle(0xd9d3c4, 1); g.fillRoundedRect(0, 0, 56, 48, 6);
      g.fillStyle(0x2f3b52, 1); g.fillRoundedRect(5, 5, 46, 34, 4);
      g.fillStyle(0x6f9bb5, 1); g.fillRoundedRect(7, 7, 42, 30, 3);
      g.fillStyle(0xffffff, 0.35); g.fillTriangle(9, 36, 24, 8, 33, 36);
      g.fillStyle(0xc4bdac, 1); g.fillRoundedRect(18, 48, 20, 6, 2); g.fillRoundedRect(10, 53, 36, 5, 2);
      g.fillStyle(0xd9d3c4, 1); g.fillRoundedRect(58, 14, 20, 54, 4);
      g.fillStyle(0x9aa0a8, 1); g.fillRoundedRect(61, 20, 14, 3, 1.5); g.fillRoundedRect(61, 26, 14, 3, 1.5);
      g.fillStyle(0x8ad07f, 1); g.fillCircle(68, 60, 2.4);
    });

    /* 밤거리에 나눌 것들 */
    make(scene, 'soup_pot', 58, 46, function (g) {
      g.fillStyle(0x8e9aab, 1); g.fillRoundedRect(4, 12, 50, 30, 7);
      g.fillStyle(0xa9b4c2, 1); g.fillRoundedRect(0, 8, 58, 9, 4);
      g.fillStyle(0x6f7c8e, 1); g.fillRoundedRect(2, 18, 6, 8, 3); g.fillRoundedRect(50, 18, 6, 8, 3);
      g.fillStyle(0xe2a35c, 1); g.fillEllipse(29, 12, 44, 7);
    });
    make(scene, 'soup_cup', 34, 38, function (g) {
      g.fillStyle(0xf3ece2, 1); g.fillRoundedRect(5, 10, 24, 26, 4);
      g.fillStyle(0xe2a35c, 1); g.fillEllipse(17, 12, 22, 7);
      g.fillStyle(0xd9c2a3, 1); g.fillRoundedRect(4, 8, 26, 5, 2.5);
      g.fillStyle(0xffffff, 0.45);
      g.fillCircle(12, 4, 3); g.fillCircle(19, 2, 2.4);
    });
    make(scene, 'sleep_bag', 56, 30, function (g) {
      g.fillStyle(0x5f7f9c, 1); g.fillRoundedRect(0, 4, 56, 24, 12);
      g.fillStyle(0x7b9bb8, 1); g.fillRoundedRect(4, 8, 48, 8, 4);
      g.lineStyle(2, 0x44607a, 1);
      for (let i = 0; i < 5; i++) g.lineBetween(8 + i * 10, 6, 8 + i * 10, 26);
    });
    make(scene, 'bread_loaf', 44, 28, function (g) {
      g.fillStyle(0xc9915b, 1); g.fillEllipse(22, 16, 42, 22);
      g.fillStyle(0xdba872, 1); g.fillEllipse(22, 13, 34, 14);
      g.lineStyle(2, 0xa8763f, 1);
      g.lineBetween(10, 12, 15, 6); g.lineBetween(20, 12, 25, 6); g.lineBetween(30, 12, 35, 6);
    });

    /* 성체 현시대 — 성당 안 */
    make(scene, 'monstrance', 60, 92, function (g) {
      g.fillStyle(0xd7c07f, 1);
      g.fillEllipse(30, 86, 34, 10);
      g.fillRoundedRect(26, 60, 8, 26, 3);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        g.fillTriangle(
          30 + Math.cos(a) * 16, 40 + Math.sin(a) * 16,
          30 + Math.cos(a + 0.12) * 16, 40 + Math.sin(a + 0.12) * 16,
          30 + Math.cos(a + 0.06) * 27, 40 + Math.sin(a + 0.06) * 27
        );
      }
      g.fillStyle(0xe8d9a2, 1); g.fillCircle(30, 40, 17);
      g.fillStyle(0xfff8ec, 1); g.fillCircle(30, 40, 11);
      g.fillStyle(0xe0cfa0, 1); g.fillRect(28, 4, 4, 14); g.fillRect(24, 8, 12, 4);
    });

    /* 대포 게임 */
    make(scene, 'cannon_carlo', 46, 30, function (g) {
      g.fillStyle(0xc9553f, 1); g.fillRoundedRect(2, 12, 34, 14, 6);
      g.fillStyle(0xa8432f, 1); g.fillRoundedRect(2, 20, 34, 8, 4);
      g.fillStyle(0x3d4a5e, 1); g.fillCircle(10, 27, 4); g.fillCircle(20, 27, 4); g.fillCircle(30, 27, 4);
      g.fillStyle(0xe2724f, 1); g.fillRoundedRect(10, 6, 18, 9, 4);
    });
    make(scene, 'target_box', 40, 44, function (g) {
      g.fillStyle(0xb98a5e, 1); g.fillRoundedRect(0, 8, 40, 36, 4);
      g.fillStyle(0xcda173, 1); g.fillRoundedRect(3, 11, 34, 12, 2);
      g.fillStyle(0xc9553f, 1); g.fillCircle(20, 30, 9);
      g.fillStyle(0xfff8ec, 1); g.fillCircle(20, 30, 6);
      g.fillStyle(0xc9553f, 1); g.fillCircle(20, 30, 3);
      g.fillStyle(0x8a6340, 1); g.fillRect(17, 0, 6, 9);
    });
    make(scene, 'shell_ball', 14, 14, function (g) {
      g.fillStyle(0x3d4a5e, 1); g.fillCircle(7, 7, 6);
      g.fillStyle(0xf2b56b, 1); g.fillCircle(5, 5, 2.2);
    });

    /* 지도 핀 */
    make(scene, 'map_pin', 26, 34, function (g) {
      g.fillStyle(0x000000, 0.15); g.fillEllipse(13, 32, 14, 5);
      g.fillStyle(0xc9553f, 1);
      g.fillCircle(13, 11, 10);
      g.fillTriangle(5, 17, 21, 17, 13, 32);
      g.fillStyle(0xfff8ec, 1); g.fillCircle(13, 11, 4.4);
    });

    /* 사람들 */
    make(scene, 'friend_front', 32, 46, function (g) {
      person(g, { skin: 0xefc79f, hair: 0x4b3a2c, shirt: 0x7fa9c4, pants: 0x50607a, shoes: 0xe8e2d6 });
      g.fillStyle(0xb98a5e, 1); g.fillRoundedRect(24, 20, 3, 24, 1.5);
      g.fillRoundedRect(21, 20, 9, 3, 1.5);
    });
    make(scene, 'friend_back', 32, 46, function (g) {
      person(g, { skin: 0xefc79f, hair: 0x4b3a2c, shirt: 0x7fa9c4, pants: 0x50607a, shoes: 0xe8e2d6, back: true });
      g.fillStyle(0xb98a5e, 1); g.fillRoundedRect(24, 20, 3, 24, 1.5);
    });
    make(scene, 'bully_a', 32, 46, function (g) {
      person(g, { skin: 0xf2ceac, hair: 0x1f1a16, shirt: 0x5f6b7a, pants: 0x3b4351, shoes: 0xd6d0c6 });
    });
    make(scene, 'bully_b', 32, 46, function (g) {
      person(g, { skin: 0xe8c39c, hair: 0x3a2b20, shirt: 0x8a7f6d, pants: 0x4a4436, shoes: 0xcfc8bc });
    });

    /* 밤거리에 앉아 있는 사람 */
    make(scene, 'sitter', 40, 40, function (g) {
      g.fillStyle(0x6b7385, 1); g.fillRoundedRect(4, 20, 32, 18, 7);
      g.fillStyle(0x7d8699, 1); g.fillRoundedRect(8, 16, 24, 14, 7);
      g.fillStyle(0xe4c39e, 1); g.fillCircle(20, 11, 7.5);
      g.fillStyle(0x3f3a35, 1);
      g.fillRoundedRect(11.6, 4, 17, 5, 2.5);
      g.slice(20, 11, 7.9, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false); g.fillPath();
      g.fillStyle(0x3b342e, 1); g.fillCircle(17.2, 12, 1.3); g.fillCircle(22.8, 12, 1.3);
      g.fillStyle(0xe4c39e, 1); g.fillRoundedRect(2, 22, 6, 10, 3);
    });

    make(scene, 'window_night', 66, 46, function (g) {
      g.fillStyle(0x7d5c40, 1); g.fillRoundedRect(0, 0, 66, 46, 5);
      g.fillStyle(0x2b3b60, 1); g.fillRect(4, 4, 58, 38);
      g.fillStyle(0xf6d79a, 0.85); g.fillRect(4, 4, 27, 18);
      g.fillStyle(0x7d5c40, 1); g.fillRect(32, 4, 3, 38); g.fillRect(4, 22, 58, 3);
    });

    /* 밤하늘 */
    canvasTex(scene, 'sky_milan_night', 8, 844, function (ctx, w, h) {
      const grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0.00, '#0d1730');
      grd.addColorStop(0.42, '#1b2a4a');
      grd.addColorStop(0.76, '#374765');
      grd.addColorStop(1.00, '#6b6577');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    });

    make(scene, 'card', 300, 84, function (g) {
      g.fillStyle(0xffffff, 0.97); g.fillRoundedRect(0, 0, 300, 84, 16);
      g.fillStyle(0x000000, 0.05); g.fillRoundedRect(0, 76, 300, 8, 8);
    });
  }

  return { createAll: createAll, make: make, canvasTex: canvasTex };
})();
