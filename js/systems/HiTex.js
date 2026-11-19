/* 촘촘한 그림 — 텍스처를 화면 화소 밀도만큼 굽고, 장면에서는 예전 크기 그대로 다룹니다.

   왜 필요한가:
   Render.js 가 화면을 2 배로 그리게 했지만, 코드로 구운 그림(텍스처)은 여전히
   32×46 같은 작은 비트맵이라 확대되며 뭉개집니다. 그림을 2~3 배로 촘촘하게 구우면
   또렷해지지만, 그러면 장면 코드가 보는 너비·높이와 그려지는 크기도 함께 커집니다.

   Phaser 의 캔버스 렌더러는 텍스처의 resolution 을 이해하는데 WebGL 렌더러는 무시합니다.
   그래서 세 곳만 맞춰 줍니다.
     1) 크기   — 그림의 너비·높이를 resolution 으로 나눠, 장면 코드는 예전 크기를 봅니다.
     2) 그리기 — WebGL 이 그리는 그 순간에만 비율을 맞춥니다.
     3) 반복 무늬 — tileSprite 의 한 칸 크기도 예전 그대로 둡니다.
   장면 코드는 한 줄도 바뀌지 않습니다. */

window.HiTex = (function () {

  const SCREEN = (window.Render && Render.RES) || 1;

  /* 소품·배경은 화면과 같은 밀도로, 사람은 한 단계 더 촘촘하게 굽습니다.
     사람은 화면에서 1.1~1.6 배로 확대되어 보이는 데다 얼굴이 작아서입니다. */
  const PROP = SCREEN;
  const FIGURE = Math.min(3, SCREEN + 1);

  function resOf(frame) {
    return (frame && frame.source && frame.source.resolution) || 1;
  }

  /* ── 1) 크기 ─────────────────────────────── */
  function patchSize(proto) {
    const orig = proto.setSizeToFrame;
    proto.setSizeToFrame = function (frame) {
      orig.call(this, frame);
      const f = frame || this.frame;
      const r = resOf(f);
      if (r !== 1) {
        this.width = f.realWidth / r;
        this.height = f.realHeight / r;
        const input = this.input;
        if (input && !input.customHitArea) {
          input.hitArea.width = this.width;
          input.hitArea.height = this.height;
        }
      }
      return this;
    };
  }

  /* displayWidth·displayHeight 도 논리 크기로.
     Phaser 는 이 둘을 width 가 아니라 텍스처의 화소 크기(frame.realWidth)로 계산하므로,
     그대로 두면 setDisplaySize() 로 크기를 정한 그림이 r 배 작아집니다. */
  function patchDisplay(proto) {
    Object.defineProperty(proto, 'displayWidth', {
      configurable: true,
      get: function () { return Math.abs(this.scaleX * this.frame.realWidth / resOf(this.frame)); },
      set: function (v) { this.scaleX = v / (this.frame.realWidth / resOf(this.frame)); }
    });
    Object.defineProperty(proto, 'displayHeight', {
      configurable: true,
      get: function () { return Math.abs(this.scaleY * this.frame.realHeight / resOf(this.frame)); },
      set: function (v) { this.scaleY = v / (this.frame.realHeight / resOf(this.frame)); }
    });
  }

  /* ── 2) 그리기 ───────────────────────────── */
  /* 꼭짓점은 (화소 단위의 원점·크기) × 배율로 계산됩니다.
     원점을 화소 단위로 늘리고 배율을 같은 만큼 줄이면, 모양은 같고 화소만 촘촘해집니다.
     그리는 동안만 바꿨다가 곧바로 되돌려, 물리·입력·트윈은 아무것도 모릅니다. */
  function patchBatch() {
    const P = Phaser.Renderer && Phaser.Renderer.WebGL && Phaser.Renderer.WebGL.Pipelines;
    if (!P || !P.MultiPipeline) return;
    const MP = P.MultiPipeline.prototype;
    const orig = MP.batchSprite;
    MP.batchSprite = function (go, camera, parentMatrix) {
      const r = resOf(go.frame);
      if (r === 1) return orig.call(this, go, camera, parentMatrix);
      const sx = go._scaleX, sy = go._scaleY;
      const ox = go._displayOriginX, oy = go._displayOriginY;
      go._scaleX = sx / r; go._scaleY = sy / r;
      go._displayOriginX = ox * r; go._displayOriginY = oy * r;
      try {
        return orig.call(this, go, camera, parentMatrix);
      } finally {
        go._scaleX = sx; go._scaleY = sy;
        go._displayOriginX = ox; go._displayOriginY = oy;
      }
    };
  }

  /* ── 3) 반복 무늬 ─────────────────────────── */
  function patchTile() {
    const F = Phaser.GameObjects.GameObjectFactory.prototype;
    const orig = F.tileSprite;
    if (!orig) return;
    F.tileSprite = function () {
      const ts = orig.apply(this, arguments);
      const r = resOf(ts.frame);
      if (r !== 1) {
        ts.setTileScale(1 / r, 1 / r);
        /* 무늬를 흘려보내는 값(tilePosition)도 장면은 예전 단위로 씁니다.
           화면에서의 이동 = tilePosition × tileScale 이므로, 받은 값에 r 을 곱해 둡니다. */
        ['x', 'y'].forEach(function (a) {
          Object.defineProperty(ts, 'tilePosition' + a.toUpperCase(), {
            configurable: true,
            get: function () { return this._tilePosition[a] / r; },
            set: function (v) { this._tilePosition[a] = v * r; this.dirty = true; }
          });
        });
      }
      return ts;
    };
  }

  /* 물리 몸통의 기본 크기도 논리 크기로 (Arcade 는 frame.realWidth 를 그대로 씁니다). */
  function patchBody() {
    const A = Phaser.Physics && Phaser.Physics.Arcade;
    if (!A || !A.World) return;
    const W = A.World.prototype;
    const orig = W.enableBody;
    W.enableBody = function (go, type) {
      const had = go && go.body;
      const out = orig.apply(this, arguments);
      const b = go && go.body;
      const r = resOf(go && go.frame);
      if (!had && b && r !== 1 && b.physicsType === A.DYNAMIC_BODY && go.frame) {
        b.setSize(go.frame.realWidth / r, go.frame.realHeight / r);
      }
      return out;
    };
  }

  patchSize(Phaser.GameObjects.Image.prototype);
  patchSize(Phaser.GameObjects.Sprite.prototype);
  patchDisplay(Phaser.GameObjects.Image.prototype);
  patchDisplay(Phaser.GameObjects.Sprite.prototype);
  patchBatch();
  patchTile();
  patchBody();

  /* 이 게임이 실제로 WebGL 로 그려질 때만 촘촘하게 굽습니다.
     (캔버스 렌더러로 내려가면 뒤집힌 그림 계산이 어긋나므로 1 배로 둡니다) */
  function density(scene, kind) {
    const r = scene && scene.sys && scene.sys.renderer;
    if (!r || r.type !== Phaser.WEBGL) return 1;
    return kind === 'figure' ? FIGURE : PROP;
  }

  function mark(texture, res) {
    if (texture && texture.source && texture.source[0]) texture.source[0].resolution = res;
  }

  return { SCREEN, PROP, FIGURE, density, mark, resOf };
})();
