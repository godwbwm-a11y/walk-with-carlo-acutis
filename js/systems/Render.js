/* 화면 해상도와 빛 — 그림을 바꾸지 않고 또렷함과 공기를 더합니다.

   왜 필요한가:
   Phaser.Scale.FIT 은 캔버스를 언제나 390×844 로 만들고 CSS 로만 늘립니다.
   화소 밀도가 2~3인 손전화에서는 두세 배로 늘어나 전부 흐려집니다.
   캔버스를 RES 배로 키우고 카메라를 RES 배 당겨서, 좌표는 그대로 둔 채
   실제로 그려지는 화소만 늘립니다. 장면 코드는 한 줄도 바뀌지 않습니다. */

window.Render = (function () {

  /* 2 배까지만 올립니다. 3 배는 화소가 세 배로 늘어 저사양 기기가 버겁습니다. */
  const RES = Phaser.Math.Clamp(Math.round(window.devicePixelRatio || 1), 1, 2);

  /* 카메라 원점을 0 으로 두면 화면 고정 UI 가 제자리에 옵니다.
     대신 Phaser 의 경계·추적 계산은 원점 0.5 를 가정하므로 이 상수만큼 밀어 줍니다. */
  const OX = (GAME.WIDTH / 2) * (RES - 1);
  const OY = (GAME.HEIGHT / 2) * (RES - 1);

  function applyCamera(cam) {
    if (!cam || RES === 1) return cam;
    cam.setZoom(RES);
    cam.setOrigin(0, 0);
    cam.setScroll(0, 0);
    return cam;
  }

  /* 장면이 쓰는 setBounds 를 대신합니다 — 보정을 잊지 않도록 */
  function setBounds(cam, x, y, w, h) {
    cam.setBounds(x + OX, y + OY, w, h);
    return cam;
  }

  /* 모든 장면에 자동으로 걸리도록 — 장면이 시작되는 지점을 한 번만 가로챕니다.
     게임 부팅은 비동기라서 장면 목록을 나중에 도는 방법은 놓치는 장면이 생깁니다. */
  function patchSceneStart() {
    if (RES === 1) return;
    const SS = Phaser.Scenes.Systems.prototype;
    const orig = SS.start;
    SS.start = function (data) {
      const r = orig.call(this, data);
      if (this.cameras && this.cameras.main) applyCamera(this.cameras.main);
      return r;
    };
  }

  /* 추적 보정.
     Phaser 는 스크롤 목표를 focus - (카메라폭 × 원점) 으로 잡습니다.
     원점을 0 으로 두었으므로 빼 주는 값이 사라져, 보이는 폭의 절반만큼 직접 되돌립니다. */
  function patchFollow() {
    if (RES === 1) return;
    const C = Phaser.Cameras.Scene2D.Camera.prototype;
    const orig = C.startFollow;
    C.startFollow = function (target, roundPx, lerpX, lerpY, offsetX, offsetY) {
      return orig.call(this, target, roundPx, lerpX, lerpY,
        (offsetX || 0) + OX, (offsetY || 0) + OY);
    };
  }

  /* ── 빛과 공기 ───────────────────────────────
     그림 자체는 그대로 두고 위에 얇게 얹기만 합니다. */

  function ensureVignette(scene) {
    if (scene.textures.exists('vignette')) return;
    const tex = scene.textures.createCanvas('vignette', 256, 256);
    const ctx = tex.getContext();
    const grd = ctx.createRadialGradient(128, 128, 40, 128, 128, 150);
    grd.addColorStop(0.00, 'rgba(0,0,0,0)');
    grd.addColorStop(0.62, 'rgba(0,0,0,0)');
    grd.addColorStop(1.00, 'rgba(0,0,0,1)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, 256, 256);
    tex.refresh();
  }

  /* 장면 전체의 색조 — 시간대를 한 줄로 정합니다 */
  function grade(scene, opt) {
    opt = opt || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const depth = opt.depth === undefined ? 860 : opt.depth;
    const out = {};

    if (opt.tint) {
      out.tint = scene.add.rectangle(W / 2, H / 2, W, H, opt.tint)
        .setAlpha(opt.tintAlpha === undefined ? 1 : opt.tintAlpha)
        .setBlendMode(Phaser.BlendModes.MULTIPLY)
        .setScrollFactor(0).setDepth(depth);
    }
    if (opt.vignette !== false) {
      ensureVignette(scene);
      out.vignette = scene.add.image(W / 2, H / 2, 'vignette')
        .setDisplaySize(W * 1.06, H * 1.06)
        .setAlpha(opt.vignetteAlpha === undefined ? 0.32 : opt.vignetteAlpha)
        .setScrollFactor(0).setDepth(depth + 1);
    }
    return out;
  }

  /* 등불과 창문 아래 깔리는 따뜻한 빛 웅덩이 */
  function lightPool(scene, x, y, radius, opt) {
    opt = opt || {};
    const img = scene.add.image(x, y, 'lamp_glow')
      .setDisplaySize(radius * 2, radius * 2 * (opt.squash === undefined ? 0.62 : opt.squash))
      .setAlpha(opt.alpha === undefined ? 0.5 : opt.alpha)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(opt.depth === undefined ? 2 : opt.depth);
    if (opt.tint) img.setTint(opt.tint);
    return img;
  }

  return { RES, OX, OY, applyCamera, setBounds, patchFollow, patchSceneStart, grade, lightPool, ensureVignette };
})();
