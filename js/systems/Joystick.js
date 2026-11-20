/* 화면 어디든 눌러 나타나는 가상 조이스틱.
   손가락 위치에 맞춰 생기므로 작은 화면에서도 편합니다. (PC에서는 방향키·WASD)

   - 밀면 걷고, 고리 밖까지 더 밀면 달립니다 (PC 는 Shift).
   - 톡 누르기만 하면 장면이 그 자리로 걸어가게 할 수 있습니다 (scene.onWorldTap). */

window.Joystick = class Joystick {

  constructor(scene, opt) {
    opt = opt || {};
    this.scene = scene;
    this.radius = opt.radius || 52;
    this.activeZoneTop = opt.zoneTop === undefined ? 0 : opt.zoneTop;
    this.onTap = opt.onTap || (opt.noTap ? null : (typeof scene.onWorldTap === 'function' ? scene.onWorldTap.bind(scene) : null));
    this.pointerId = null;
    this.moved = false;
    this.downAt = 0;
    this.run = false;
    this.origin = new Phaser.Math.Vector2();
    this.vector = new Phaser.Math.Vector2();
    this.force = 0;

    this.gfx = scene.add.graphics().setDepth(870).setScrollFactor(0).setVisible(false);

    /* 안내 글은 밝은 땅 위에도 놓이므로 어두운 판을 깔아 줍니다 */
    this.hintPlate = scene.add.graphics().setDepth(869).setScrollFactor(0);
    this.hint = scene.add.text(GAME.WIDTH / 2, GAME.HEIGHT - (this.onTap ? 58 : 44),
      this.onTap ? '밀어서 걷기 · 톡 누르면 그곳으로\n더 멀리 밀면 달려요' : '화면을 밀어 걸어보세요',
      UI.style(FONT.small, PAL.cream, { align: 'center', lineSpacing: 4, wordWrap: { width: GAME.WIDTH - 56 } }))
      .setOrigin(0.5).setDepth(870).setScrollFactor(0).setAlpha(0.95);

    const drawPlate = () => {
      const g = this.hintPlate;
      if (!g || !g.scene) return;
      g.clear();
      const t = this.hint;
      if (!t || !t.scene || !t.visible || t.alpha <= 0.02 || !String(t.text || '').trim()) return;
      const w = t.width + 26, h = t.height + 10;
      g.fillStyle(0x101a2e, 0.78);
      g.fillRoundedRect(t.x - w / 2, t.y - h / 2, w, h, h / 2);
      g.setAlpha(t.alpha);
    };
    this.drawHintPlate = drawPlate;

    /* 장면마다 안내 글을 바꾸거나 옮기므로, 판도 따라가게 합니다 */
    ['setText', 'setPosition', 'setVisible', 'setAlpha'].forEach((fn) => {
      const orig = this.hint[fn].bind(this.hint);
      this.hint[fn] = function () { const r = orig.apply(null, arguments); drawPlate(); return r; };
    });
    drawPlate();

    this.cursors = scene.input.keyboard ? scene.input.keyboard.createCursorKeys() : null;
    /* PC — 방향키와 WASD 둘 다 */
    this.wasd = scene.input.keyboard ? scene.input.keyboard.addKeys('W,A,S,D,SHIFT') : null;
    if (window.IS_DESKTOP && this.hint) {
      this.hint.setText(this.onTap ? '방향키로 걷기 · Shift 로 달리기\n클릭하면 그곳으로 걸어가요' : '방향키 또는 WASD 로 걸어보세요');
    }

    scene.input.on('pointerdown', this._down, this);
    scene.input.on('pointermove', this._move, this);
    scene.input.on('pointerup', this._up, this);
    scene.input.on('pointerupoutside', this._up, this);
    scene.events.once('shutdown', () => this.destroy());
  }

  hideHint() {
    if (this.hint && this.hint.alpha > 0) {
      this.scene.tweens.add({ targets: [this.hint, this.hintPlate], alpha: 0, duration: 500 });
    }
  }

  _blocked(pointer) {
    if (this.scene.inputLocked) return true;
    const hits = this.scene.input.hitTestPointer(pointer);
    return hits && hits.length > 0;          // 버튼 위라면 조이스틱을 만들지 않음
  }

  _down(pointer) {
    if (this.pointerId !== null) return;
    if (pointer.y < this.activeZoneTop) return;
    if (this._blocked(pointer)) return;
    this.pointerId = pointer.id;
    this.origin.set(pointer.x, pointer.y);
    this.moved = false;
    this.run = false;
    this.downAt = this.scene.time.now;
    /* 조이스틱은 손가락이 움직이기 시작해야 보입니다 — 톡 누르기와 구별합니다 */
    this.gfx.setVisible(false);
  }

  _move(pointer) {
    if (pointer.id !== this.pointerId) return;
    const dx = pointer.x - this.origin.x;
    const dy = pointer.y - this.origin.y;
    const raw = Math.sqrt(dx * dx + dy * dy);
    if (!this.moved) {
      if (raw < 9) return;
      this.moved = true;
      this.gfx.setVisible(true);
      this.hideHint();
    }
    /* 고리 밖으로 한참 더 밀면 달립니다. 손가락이 너무 멀어지면 고리가 따라옵니다 */
    const far = this.radius * 1.9;
    if (raw > far) {
      const k = (raw - far) / raw;
      this.origin.x += dx * k; this.origin.y += dy * k;
    }
    this.run = raw > this.radius * 1.35;
    const dist = Math.min(raw, this.radius);
    const ang = Math.atan2(dy, dx);
    this.force = dist / this.radius;
    this.vector.set(Math.cos(ang) * this.force, Math.sin(ang) * this.force);
    this._draw(this.origin.x + Math.cos(ang) * dist, this.origin.y + Math.sin(ang) * dist);
  }

  _up(pointer) {
    if (pointer.id !== this.pointerId) return;
    const tap = !this.moved && this.scene.time.now - this.downAt < 450;
    this.pointerId = null;
    this.force = 0;
    this.run = false;
    this.vector.set(0, 0);
    this.gfx.setVisible(false);
    if (tap && this.onTap && !this.scene.inputLocked) { this.hideHint(); this.onTap(pointer); }
  }

  _draw(kx, ky) {
    const g = this.gfx;
    g.clear();
    g.fillStyle(0xffffff, 0.12); g.fillCircle(this.origin.x, this.origin.y, this.radius);
    g.lineStyle(2, 0xffffff, 0.28); g.strokeCircle(this.origin.x, this.origin.y, this.radius);
    if (this.run) {
      /* 달릴 때는 고리가 따뜻한 색으로 빛납니다 */
      g.lineStyle(3, 0xffc86a, 0.75); g.strokeCircle(this.origin.x, this.origin.y, this.radius + 5);
      g.fillStyle(0xffd79a, 0.6); g.fillCircle(kx, ky, 24);
      g.lineStyle(2, 0xfff1cf, 0.9); g.strokeCircle(kx, ky, 24);
    } else {
      g.fillStyle(0xffffff, 0.42); g.fillCircle(kx, ky, 24);
      g.lineStyle(2, 0xffffff, 0.6); g.strokeCircle(kx, ky, 24);
    }
  }

  /* 다른 화면에 다녀온 뒤 손가락 상태를 지웁니다 */
  reset() {
    this.pointerId = null;
    this.moved = false;
    this.run = false;
    this.force = 0;
    this.vector.set(0, 0);
    if (this.gfx) this.gfx.setVisible(false);
  }

  /* 매 프레임 방향 벡터 (-1 ~ 1) */
  read() {
    if (this.scene.inputLocked) return { x: 0, y: 0, run: false };
    if (this.pointerId !== null) return { x: this.vector.x, y: this.vector.y, run: this.run };
    if (this.cursors || this.wasd) {
      const c = this.cursors, k = this.wasd;
      let x = 0, y = 0;
      if ((c && c.left.isDown) || (k && k.A.isDown)) x = -1;
      else if ((c && c.right.isDown) || (k && k.D.isDown)) x = 1;
      if ((c && c.up.isDown) || (k && k.W.isDown)) y = -1;
      else if ((c && c.down.isDown) || (k && k.S.isDown)) y = 1;
      if (x || y) {
        this.hideHint();
        const l = Math.sqrt(x * x + y * y);
        return { x: x / l, y: y / l, run: !!(k && k.SHIFT.isDown) };
      }
    }
    return { x: 0, y: 0, run: false };
  }

  destroy() {
    this.scene.input.off('pointerdown', this._down, this);
    this.scene.input.off('pointermove', this._move, this);
    this.scene.input.off('pointerup', this._up, this);
    this.scene.input.off('pointerupoutside', this._up, this);
    if (this.gfx) this.gfx.destroy();
    if (this.hint) this.hint.destroy();
    if (this.hintPlate) this.hintPlate.destroy();
  }
};
