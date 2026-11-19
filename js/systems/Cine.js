/* 영상처럼 보이는 장면에 얹는 빛 — 물 위의 반짝임, 빛줄기, 떠다니는 빛 알갱이.

   바다·노을·새벽·성당 장면은 이 게임에서 말없이 오래 바라보는 화면입니다.
   그림을 바꾸지 않고 위에 얇게 얹기만 해서, 조용히 살아 움직이게 합니다.
   모두 화면 고정이 아닌 장면 좌표로 놓이고, 움직임은 느리고 작습니다. */

window.Cine = (function () {

  /* 반짝이는 물결 한 조각 — 가로로 긴 작은 빛 */
  function ensureGlint(scene) {
    if (scene.textures.exists('cine_glint')) return;
    const R = window.HiTex ? HiTex.density(scene, 'prop') : 1;
    const t = scene.textures.createCanvas('cine_glint', 24 * R, 4 * R);
    const c = t.getContext();
    const g = c.createRadialGradient(12 * R, 2 * R, 0, 12 * R, 2 * R, 12 * R);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.save(); c.scale(1, 4 / 24); c.fillStyle = g; c.fillRect(0, 0, 24 * R, 24 * R); c.restore();
    if (window.HiTex) HiTex.mark(t, R);
    t.refresh();
  }
  function ensureRay(scene) {
    if (scene.textures.exists('cine_ray')) return;
    const t = scene.textures.createCanvas('cine_ray', 64, 256);
    const c = t.getContext();
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(28, 0); c.lineTo(36, 0); c.lineTo(64, 256); c.lineTo(0, 256); c.closePath(); c.fill();
    /* 가장자리를 흐리게 */
    const s = c.createLinearGradient(0, 0, 64, 0);
    s.addColorStop(0, 'rgba(0,0,0,1)'); s.addColorStop(0.5, 'rgba(0,0,0,0)'); s.addColorStop(1, 'rgba(0,0,0,1)');
    c.globalCompositeOperation = 'destination-out'; c.fillStyle = s; c.fillRect(0, 0, 64, 256);
    t.refresh();
  }

  /* 해·달이 물에 비쳐 생기는 반짝이는 길.
     cx: 빛의 가로 위치, top~bottom: 물이 보이는 높이. 수평선에 가까울수록 좁고 촘촘합니다. */
  function glitter(scene, cx, top, bottom, opt) {
    opt = opt || {};
    ensureGlint(scene);
    const n = opt.count || 46;
    const tint = opt.tint === undefined ? 0xffe2b0 : opt.tint;
    const depth = opt.depth === undefined ? -8 : opt.depth;
    const spread = opt.spread || 70;
    const out = [];
    for (let i = 0; i < n; i++) {
      const f = Math.pow(Math.random(), 0.8);             // 0 = 수평선, 1 = 가까운 물
      const y = top + 3 + f * (bottom - top - 6);
      const half = 6 + spread * f;
      const x = cx + (Math.random() * 2 - 1) * half * (0.4 + Math.random() * 0.6);
      const s = 0.35 + f * 1.1;
      const img = scene.add.image(x, y, 'cine_glint').setDepth(depth).setTint(tint)
        .setScale(s * (0.6 + Math.random() * 0.8), s).setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0);
      const peak = (opt.alpha || 0.75) * (0.45 + Math.random() * 0.55) * (1 - f * 0.35);
      scene.tweens.add({
        targets: img, alpha: peak, duration: 500 + Math.random() * 900,
        yoyo: true, repeat: -1, delay: Math.random() * 2400, hold: Math.random() * 300,
        repeatDelay: 200 + Math.random() * 1600, ease: 'Sine.easeInOut'
      });
      scene.tweens.add({ targets: img, x: x + (Math.random() * 2 - 1) * 6, duration: 2200 + Math.random() * 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      out.push(img);
    }
    return out;
  }

  /* 빛줄기 — 창이나 하늘에서 비스듬히 내려오는 빛. 아주 천천히 숨 쉬듯 */
  function rays(scene, x, y, opt) {
    opt = opt || {};
    ensureRay(scene);
    const n = opt.count || 5;
    const len = opt.length || 420;
    const tint = opt.tint === undefined ? 0xffe6b8 : opt.tint;
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (opt.angle || 0) + (i - (n - 1) / 2) * (opt.fan || 0.16);
      const r = scene.add.image(x, y, 'cine_ray').setOrigin(0.5, 0).setDepth(opt.depth === undefined ? 5 : opt.depth)
        .setDisplaySize((opt.width || 90) * (0.7 + Math.random() * 0.6), len).setRotation(a)
        .setTint(tint).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      const peak = (opt.alpha || 0.16) * (0.6 + Math.random() * 0.4);
      scene.tweens.add({ targets: r, alpha: peak, duration: 1600, delay: i * 200 });
      scene.tweens.add({ targets: r, alpha: peak * 0.45, duration: 3000 + Math.random() * 2500, yoyo: true, repeat: -1, delay: 1800 + i * 300, ease: 'Sine.easeInOut' });
      scene.tweens.add({ targets: r, rotation: a + 0.03, duration: 7000 + Math.random() * 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      out.push(r);
    }
    return out;
  }

  /* 떠다니는 빛 알갱이 — 성당 안의 먼지, 밤바다의 물보라, 반딧불 */
  function motes(scene, x, y, w, h, opt) {
    opt = opt || {};
    const n = opt.count || 18;
    const tint = opt.tint === undefined ? 0xfff0cf : opt.tint;
    const out = [];
    for (let i = 0; i < n; i++) {
      const px = x + Math.random() * w, py = y + Math.random() * h;
      const d = scene.add.image(px, py, 'dot').setDepth(opt.depth === undefined ? 6 : opt.depth)
        .setScale(0.12 + Math.random() * 0.22).setTint(tint).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      const peak = (opt.alpha || 0.55) * (0.4 + Math.random() * 0.6);
      scene.tweens.add({ targets: d, alpha: peak, duration: 1400 + Math.random() * 1400, yoyo: true, repeat: -1, delay: Math.random() * 3000, ease: 'Sine.easeInOut' });
      scene.tweens.add({
        targets: d, x: px + (Math.random() * 2 - 1) * 26, y: py - (opt.rise === undefined ? 18 : opt.rise) - Math.random() * 20,
        duration: 5000 + Math.random() * 4000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
      out.push(d);
    }
    return out;
  }

  /* ── 몽타주의 한 컷을 영화의 한 장면처럼 ─────────────
     어두운 화면에 그림 하나만 떠 있던 컷 뒤에, 은은한 빛이 고인 액자를 깔고
     아주 천천히 다가가는 카메라(켄 번스)를 겁니다. 그림 자체는 바꾸지 않습니다. */
  const TONES = {
    church:  { inner: '#5a4a3c', mid: '#3a2f2a', edge: '#17131a', glow: 0xffd9a0, line: 'rgba(242,201,140,0.55)' },
    evening: { inner: '#5b5277', mid: '#353556', edge: '#121526', glow: 0xffc8a0, line: 'rgba(240,190,160,0.5)' },
    dawn:    { inner: '#7a6a5a', mid: '#3f4560', edge: '#121828', glow: 0xffe3b0, line: 'rgba(250,220,170,0.55)' },
    night:   { inner: '#2f3f66', mid: '#1c2745', edge: '#0a0f1e', glow: 0xbfd4ff, line: 'rgba(190,210,250,0.45)' }
  };
  function ensureFrame(scene, tone, w, h) {
    const key = 'cine_frame_' + tone + '_' + w + 'x' + h;
    if (scene.textures.exists(key)) return key;
    const T = TONES[tone] || TONES.church;
    const R = window.HiTex ? HiTex.density(scene, 'prop') : 1;
    const t = scene.textures.createCanvas(key, Math.ceil(w * R), Math.ceil(h * R));
    const c = t.getContext();
    c.scale(R, R);
    const r = 22;
    const path = function () {
      c.beginPath(); c.moveTo(r, 0); c.arcTo(w, 0, w, h, r); c.arcTo(w, h, 0, h, r); c.arcTo(0, h, 0, 0, r); c.arcTo(0, 0, w, 0, r); c.closePath();
    };
    path();
    const g = c.createRadialGradient(w / 2, h * 0.42, 10, w / 2, h * 0.5, Math.max(w, h) * 0.7);
    g.addColorStop(0, T.inner); g.addColorStop(0.55, T.mid); g.addColorStop(1, T.edge);
    c.fillStyle = g; c.fill();
    /* 필름의 결 */
    c.save(); path(); c.clip();
    let sd = 7;
    for (let i = 0; i < w * h / 30; i++) {
      sd = (sd * 1664525 + 1013904223) >>> 0; const x = (sd / 4294967296) * w;
      sd = (sd * 1664525 + 1013904223) >>> 0; const y = (sd / 4294967296) * h;
      c.fillStyle = (i % 2) ? 'rgba(255,245,225,0.05)' : 'rgba(0,0,0,0.08)';
      c.fillRect(x, y, 1, 1);
    }
    c.restore();
    /* 얇은 금빛 테두리 */
    c.lineWidth = 1.5; c.strokeStyle = T.line; path(); c.stroke();
    c.lineWidth = 0.8; c.strokeStyle = 'rgba(255,255,255,0.08)';
    c.beginPath(); c.moveTo(r, 6); c.lineTo(w - r, 6); c.stroke();
    if (window.HiTex) HiTex.mark(t, R);
    t.refresh();
    return key;
  }

  /* c: 컷을 담은 컨테이너(0,0 에 놓이고 아이들은 화면 좌표로 그려져 있음)
     opt: { cx, cy, w, h, tone, full } — full 이면 액자 없이 천천히 다가가기와 먼지만 */
  function still(scene, c, opt) {
    opt = opt || {};
    const W = GAME.WIDTH;
    const cx = opt.cx === undefined ? W / 2 : opt.cx;
    const cy = opt.cy === undefined ? GAME.HEIGHT * 0.40 : opt.cy;
    const tone = opt.tone || 'church';
    const T = TONES[tone] || TONES.church;
    if (!opt.full) {
      const fw = opt.w || W - 40, fh = opt.h || 330;
      const frame = scene.add.image(cx, cy, ensureFrame(scene, tone, fw, fh));
      const glow = scene.add.image(cx, cy - 10, 'lamp_glow').setDisplaySize(fw * 0.95, fh * 0.8)
        .setTint(T.glow).setAlpha(0.32).setBlendMode(Phaser.BlendModes.ADD);
      c.addAt(glow, 0);
      c.addAt(frame, 0);
      scene.tweens.add({ targets: glow, alpha: 0.18, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      /* 액자 밖으로 삐져나온 그림(군중 줄 등)은 액자 안쪽에서 잘라 냅니다 */
      const mg = scene.make.graphics({ add: false });
      mg.fillRoundedRect(cx - fw / 2 + 1, cy - fh / 2 + 1, fw - 2, fh - 2, 21);
      c.setMask(mg.createGeometryMask());
      c.once('destroy', function () { mg.destroy(); });
      /* 액자 안을 떠도는 빛 알갱이 */
      for (let i = 0; i < 10; i++) {
        const px = cx - fw / 2 + 20 + Math.random() * (fw - 40), py = cy - fh / 2 + 20 + Math.random() * (fh - 40);
        const d = scene.add.image(px, py, 'dot').setScale(0.1 + Math.random() * 0.16).setTint(T.glow)
          .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
        c.add(d);
        scene.tweens.add({ targets: d, alpha: 0.25 + Math.random() * 0.35, duration: 1400 + Math.random() * 1200, yoyo: true, repeat: -1, delay: Math.random() * 1500 });
        scene.tweens.add({ targets: d, y: py - 14 - Math.random() * 12, x: px + (Math.random() * 2 - 1) * 10, duration: 5000 + Math.random() * 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    } else {
      for (let i = 0; i < 14; i++) {
        const px = Math.random() * W, py = 140 + Math.random() * (GAME.HEIGHT - 280);
        const d = scene.add.image(px, py, 'dot').setScale(0.1 + Math.random() * 0.18).setTint(T.glow)
          .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
        c.add(d);
        scene.tweens.add({ targets: d, alpha: 0.2 + Math.random() * 0.3, duration: 1600 + Math.random() * 1200, yoyo: true, repeat: -1, delay: Math.random() * 1500 });
        scene.tweens.add({ targets: d, y: py - 20, duration: 6000 + Math.random() * 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    }
    /* 아주 천천히 다가가는 카메라 — 컷이 머무는 동안 3~4% 커집니다 */
    const z = { s: 1 };
    const tw = scene.tweens.add({
      targets: z, s: opt.zoom || 1.04, duration: opt.duration || 7000, ease: 'Sine.easeOut',
      onUpdate: function () {
        if (!c.scene) { tw.stop(); return; }
        c.setScale(z.s);
        c.setPosition(cx * (1 - z.s), cy * (1 - z.s));
      }
    });
    return c;
  }

  return { glitter, rays, motes, still };
})();
