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
    make(scene, 'card', 300, 84, function (g) {
      g.fillStyle(0xffffff, 0.97); g.fillRoundedRect(0, 0, 300, 84, 16);
      g.fillStyle(0x000000, 0.05); g.fillRoundedRect(0, 76, 300, 8, 8);
    });
  }

  return { createAll: createAll, make: make, canvasTex: canvasTex };
})();
