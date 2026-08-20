/* 화면 아래쪽 아무 곳이나 눌러 나타나는 가상 조이스틱.
   손가락 위치에 맞춰 생기므로 작은 화면에서도 편합니다. (PC에서는 방향키) */

window.Joystick = class Joystick {

  constructor(scene, opt) {
    opt = opt || {};
    this.scene = scene;
    this.radius = opt.radius || 52;
    this.activeZoneTop = opt.zoneTop === undefined ? GAME.HEIGHT * 0.42 : opt.zoneTop;
    this.pointerId = null;
    this.origin = new Phaser.Math.Vector2();
    this.vector = new Phaser.Math.Vector2();
    this.force = 0;

    this.gfx = scene.add.graphics().setDepth(870).setScrollFactor(0).setVisible(false);
    this.hint = scene.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 44, '화면 아래를 눌러 걸어보세요',
      UI.style(FONT.small, PAL.cream)).setOrigin(0.5).setDepth(870).setScrollFactor(0).setAlpha(0.75);

    this.cursors = scene.input.keyboard ? scene.input.keyboard.createCursorKeys() : null;

    scene.input.on('pointerdown', this._down, this);
    scene.input.on('pointermove', this._move, this);
    scene.input.on('pointerup', this._up, this);
    scene.input.on('pointerupoutside', this._up, this);
    scene.events.once('shutdown', () => this.destroy());
  }

  hideHint() {
    if (this.hint && this.hint.alpha > 0) {
      this.scene.tweens.add({ targets: this.hint, alpha: 0, duration: 500 });
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
    this.gfx.setVisible(true);
    this._draw(pointer.x, pointer.y);
    this.hideHint();
  }

  _move(pointer) {
    if (pointer.id !== this.pointerId) return;
    const dx = pointer.x - this.origin.x;
    const dy = pointer.y - this.origin.y;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), this.radius);
    const ang = Math.atan2(dy, dx);
    this.force = dist / this.radius;
    this.vector.set(Math.cos(ang) * this.force, Math.sin(ang) * this.force);
    this._draw(this.origin.x + Math.cos(ang) * dist, this.origin.y + Math.sin(ang) * dist);
  }

  _up(pointer) {
    if (pointer.id !== this.pointerId) return;
    this.pointerId = null;
    this.force = 0;
    this.vector.set(0, 0);
    this.gfx.setVisible(false);
  }

  _draw(kx, ky) {
    const g = this.gfx;
    g.clear();
    g.fillStyle(0xffffff, 0.12); g.fillCircle(this.origin.x, this.origin.y, this.radius);
    g.lineStyle(2, 0xffffff, 0.28); g.strokeCircle(this.origin.x, this.origin.y, this.radius);
    g.fillStyle(0xffffff, 0.42); g.fillCircle(kx, ky, 24);
    g.lineStyle(2, 0xffffff, 0.6); g.strokeCircle(kx, ky, 24);
  }

  /* 다른 화면에 다녀온 뒤 손가락 상태를 지웁니다 */
  reset() {
    this.pointerId = null;
    this.force = 0;
    this.vector.set(0, 0);
    if (this.gfx) this.gfx.setVisible(false);
  }

  /* 매 프레임 방향 벡터 (-1 ~ 1) */
  read() {
    if (this.scene.inputLocked) return { x: 0, y: 0 };
    if (this.pointerId !== null) return { x: this.vector.x, y: this.vector.y };
    if (this.cursors) {
      let x = 0, y = 0;
      if (this.cursors.left.isDown) x = -1;
      else if (this.cursors.right.isDown) x = 1;
      if (this.cursors.up.isDown) y = -1;
      else if (this.cursors.down.isDown) y = 1;
      if (x || y) {
        const l = Math.sqrt(x * x + y * y);
        return { x: x / l, y: y / l };
      }
    }
    return { x: 0, y: 0 };
  }

  destroy() {
    this.scene.input.off('pointerdown', this._down, this);
    this.scene.input.off('pointermove', this._move, this);
    this.scene.input.off('pointerup', this._up, this);
    this.scene.input.off('pointerupoutside', this._up, this);
    if (this.gfx) this.gfx.destroy();
    if (this.hint) this.hint.destroy();
  }
};
