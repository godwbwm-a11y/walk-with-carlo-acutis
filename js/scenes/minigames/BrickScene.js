/* DAY 4 미니게임 · 그 말들, 떨어뜨리기

   담벼락에 박힌 말들을 공으로 떨어뜨립니다.
   공을 받아 치는 것은 주인공입니다. 좌우로 움직이며 받습니다.
   놓쳐도 지지 않습니다 — 카를로가 주워서 다시 건네주고,
   자꾸 놓치면 옆에 와서 같이 받아줍니다. 다 떨어뜨리면 끝납니다. */

window.BrickScene = class BrickScene extends MiniGameScene {
  constructor() { super('BrickScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#4a5570',
      title: DAY04.bricks.title, hint: DAY04.bricks.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const B = DAY04.bricks;

    this.TOP = Math.round(this.contentTop()) + 8;   // 놀이판 위쪽
    this.LEFT = 16;
    this.RIGHT = W - 16;
    this.PAD_Y = 664;                                // 주인공이 서는 줄
    this.FLOOR = 726;                                // 이 아래로 가면 놓친 것입니다

    /* 지난번 흔적을 지웁니다 — 장면은 다시 열려도 같은 것을 씁니다 */
    this.playing = false;
    this.misses = 0;
    this.helped = false;
    this.padW = 78;
    this.speed = 280;
    this.bvx = 0; this.bvy = 0;
    this.aimX = W / 2;
    this._flashText = null;

    /* ── 담벼락 ────────────────────────────────── */
    const g = this.add.graphics().setDepth(-60);
    g.fillStyle(0x3f4962, 1); g.fillRect(0, this.TOP - 6, W, this.FLOOR - this.TOP + 12);
    g.lineStyle(2, 0xf4ede0, 0.16);
    g.strokeRect(this.LEFT, this.TOP, this.RIGHT - this.LEFT, this.FLOOR - this.TOP);
    g.fillStyle(0x354057, 1); g.fillRect(0, this.TOP - 6, W, 148);

    /* ── 말이 적힌 돌덩이들 ────────────────────── */
    const cols = 3, bw = 112, bh = 38, gapX = 10, gapY = 12;
    const totalW = cols * bw + (cols - 1) * gapX;
    const x0 = (W - totalW) / 2 + bw / 2;
    const y0 = this.TOP + 46;

    this.bricks = [];
    B.words.forEach((word, i) => {
      const r = Math.floor(i / cols), c = i % cols;
      const cx = x0 + c * (bw + gapX);
      const cy = y0 + r * (bh + gapY);

      const box = this.add.container(cx, cy).setDepth(20);
      const img = this.add.image(0, 0, 'd4_stone');
      const t = this.add.text(0, -1, word, UI.style(13, '#f2ece1', {
        align: 'center', wordWrap: { width: bw - 18 }
      })).setOrigin(0.5);
      box.add([img, t]);
      box.setAlpha(0);
      this.tweens.add({ targets: box, alpha: 1, duration: 400, delay: 200 + i * 45 });

      this.bricks.push({ box: box, img: img, x: cx, y: cy, w: bw - 6, h: bh - 5, dead: false });
    });
    this.left = this.bricks.length;

    /* ── 주인공 ────────────────────────────────── */
    /* 어디까지 받을 수 있는지 눈에 보이도록 발밑에 빛을 깔아 둡니다 */
    this.padBar = this.add.graphics().setDepth(48);

    this.me = this.add.image(W / 2, this.PAD_Y, 'player_front').setDepth(50).setScale(1.5);
    this.meShadow = this.add.image(W / 2, this.PAD_Y + 34, 'shadow')
      .setDepth(46).setScale(1.5).setAlpha(0.4);

    /* 카를로는 아직 옆에 서 있지 않습니다 */
    this.carlo = this.add.image(W / 2, this.PAD_Y, 'carlo_front')
      .setDepth(50).setScale(1.5).setVisible(false);

    /* ── 공 ────────────────────────────────────── */
    this.ball = this.add.image(W / 2, this.PAD_Y - 34, 'd4_ball').setDepth(60);
    this.ballR = 9;

    /* ── 남은 말 ───────────────────────────────── */
    this.leftText = this.add.text(W / 2, this.FLOOR + 15, '',
      UI.style(FONT.tiny, PAL.dimWarm)).setOrigin(0.5).setDepth(100).setAlpha(0.9);
    this.updateLeft();

    /* ── 조작 ──────────────────────────────────── */
    /* 놀이판 아무 곳이나 좌우로 밀면 따라옵니다 */
    this.dragZone = this.add.zone(W / 2, (this.TOP + this.FLOOR) / 2, W, this.FLOOR - this.TOP)
      .setOrigin(0.5).setInteractive().setDepth(40);
    this.dragZone.on('pointerdown', (p) => { this.dragging = true; this.aimX = p.x; });
    this.dragZone.on('pointermove', (p) => { if (this.dragging) this.aimX = p.x; });
    this.dragZone.on('pointerup', () => { this.dragging = false; });
    this.dragZone.on('pointerupoutside', () => { this.dragging = false; });
    this.dragZone.on('pointerout', () => { this.dragging = false; });

    const bY = 798;
    this.btnLeft = UI.padButton(this, 88, bY, 120, 76, '◀', { size: 30, quiet: true });
    this.btnRight = UI.padButton(this, 302, bY, 120, 76, '▶', { size: 30, quiet: true });
    [this.btnLeft, this.btnRight].forEach(b => b.setDepth(210));

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyAD = this.input.keyboard.addKeys('A,D');
    }

    this.time.delayedCall(400, () => {
      this.dialogue.play(B.open, () => this.serve(900));
    });
  }

  /* ── 공을 다시 띄웁니다 ──────────────────────── */
  serve(delay) {
    if (this.finished) return;
    this.playing = false;
    this.ball.setVisible(true).setPosition(this.me.x, this.PAD_Y - 34);
    this.time.delayedCall(delay === undefined ? 700 : delay, () => {
      if (this.finished) return;
      const ang = -Math.PI / 2 + Phaser.Math.FloatBetween(-0.42, 0.42);
      this.bvx = Math.cos(ang) * this.speed;
      this.bvy = Math.sin(ang) * this.speed;
      this.playing = true;
      AudioSystem.blip();
    });
  }

  update(time, delta) {
    if (this.finished || !this.me || !this.me.scene) return;
    const dt = Math.min(delta, 40) / 1000;

    /* ── 좌우로 움직입니다 ─────────────────────── */
    let dir = 0;
    if (this.btnLeft && this.btnLeft.isDown) dir -= 1;
    if (this.btnRight && this.btnRight.isDown) dir += 1;
    const c = this.cursors, k = this.keyAD;
    if ((c && c.left.isDown) || (k && k.A.isDown)) dir -= 1;
    if ((c && c.right.isDown) || (k && k.D.isDown)) dir += 1;
    if (dir !== 0) this.aimX += dir * 330 * dt;

    const half = this.padW / 2;
    this.aimX = Phaser.Math.Clamp(this.aimX, this.LEFT + half, this.RIGHT - half);
    this.me.x = Phaser.Math.Linear(this.me.x, this.aimX + (this.helped ? -28 : 0), 0.35);
    this.meShadow.x = this.me.x;
    if (this.helped) this.carlo.x = this.me.x + 56;

    /* 어디까지 받을 수 있는지 — 공이 튕기는 바로 그 줄에 그립니다 */
    const bx = this.me.x + (this.helped ? 28 : 0);
    this.padBar.clear();
    this.padBar.fillStyle(HEX(PAL.sun), 0.22);
    this.padBar.fillRoundedRect(bx - half, this.PAD_Y - 25, this.padW, 14, 7);
    this.padBar.fillStyle(HEX(PAL.sun), 0.8);
    this.padBar.fillRoundedRect(bx - half, this.PAD_Y - 23, this.padW, 7, 3.5);

    /* 공을 아직 안 띄웠으면 손 위에 얹어 둡니다 */
    if (!this.playing) {
      this.ball.x = this.me.x + (this.helped ? 28 : 0);
      return;
    }

    /* ── 공 ────────────────────────────────────── */
    this.ball.x += this.bvx * dt;
    this.ball.y += this.bvy * dt;
    this.ball.angle += this.bvx * dt * 0.4;

    const r = this.ballR;
    if (this.ball.x < this.LEFT + r) { this.ball.x = this.LEFT + r; this.bvx = Math.abs(this.bvx); AudioSystem.tap(); }
    if (this.ball.x > this.RIGHT - r) { this.ball.x = this.RIGHT - r; this.bvx = -Math.abs(this.bvx); AudioSystem.tap(); }
    if (this.ball.y < this.TOP + r) { this.ball.y = this.TOP + r; this.bvy = Math.abs(this.bvy); AudioSystem.tap(); }

    this.hitBricks();
    this.hitPaddle();

    if (this.ball.y > this.FLOOR) this.dropped();
  }

  /* ── 돌덩이에 닿았을 때 ──────────────────────── */
  hitBricks() {
    const r = this.ballR;
    for (let i = 0; i < this.bricks.length; i++) {
      const b = this.bricks[i];
      if (b.dead) continue;
      const dx = this.ball.x - b.x, dy = this.ball.y - b.y;
      const ox = b.w / 2 + r - Math.abs(dx);
      const oy = b.h / 2 + r - Math.abs(dy);
      if (ox <= 0 || oy <= 0) continue;

      /* 덜 파고든 쪽으로 튕겨 나갑니다 */
      if (ox < oy) {
        this.bvx = dx < 0 ? -Math.abs(this.bvx) : Math.abs(this.bvx);
        this.ball.x += dx < 0 ? -ox : ox;
      } else {
        this.bvy = dy < 0 ? -Math.abs(this.bvy) : Math.abs(this.bvy);
        this.ball.y += dy < 0 ? -oy : oy;
      }
      this.breakBrick(b);
      return;                       // 한 프레임에 하나씩만
    }
  }

  breakBrick(b) {
    b.dead = true;
    this.left--;
    this.updateLeft();
    AudioSystem.kick();

    b.img.setTexture('d4_stone_crack');
    this.tweens.add({
      targets: b.box,
      y: b.box.y + 260,
      x: b.box.x + Phaser.Math.Between(-40, 40),
      angle: Phaser.Math.Between(-70, 70),
      alpha: 0, duration: 900, ease: 'Quad.easeIn',
      onComplete: () => b.box.destroy()
    });

    if (this.left <= 0) this.cleared();
  }

  /* ── 주인공이 받아 칠 때 ────────────────────── */
  hitPaddle() {
    if (this.bvy <= 0) return;
    const r = this.ballR;
    if (this.ball.y + r < this.PAD_Y - 20 || this.ball.y - r > this.PAD_Y + 16) return;

    const px = this.me.x + (this.helped ? 28 : 0);
    const half = this.padW / 2;
    if (Math.abs(this.ball.x - px) > half + r) return;

    this.ball.y = this.PAD_Y - 20 - r;
    let off = Phaser.Math.Clamp((this.ball.x - px) / half, -1, 1);
    /* 한가운데로만 받으면 공이 한 줄에서만 오르내려 끝나지 않습니다.
       그럴 때는 아주 조금 비껴 보냅니다. */
    if (Math.abs(off) < 0.09) {
      off = (Math.random() < 0.5 ? -1 : 1) * Phaser.Math.FloatBetween(0.12, 0.26);
    }
    const ang = -Math.PI / 2 + off * (Math.PI / 3);
    this.bvx = Math.cos(ang) * this.speed;
    this.bvy = Math.sin(ang) * this.speed;

    /* 너무 옆으로만 굴러가지 않게 */
    if (Math.abs(this.bvy) < this.speed * 0.38) {
      this.bvy = -this.speed * 0.38;
      this.bvx = (this.bvx < 0 ? -1 : 1) * Math.sqrt(Math.max(1, this.speed * this.speed - this.bvy * this.bvy));
    }

    AudioSystem.select();
    this.tweens.add({ targets: this.me, y: this.PAD_Y - 6, duration: 90, yoyo: true });
    if (this.helped) this.tweens.add({ targets: this.carlo, y: this.PAD_Y - 6, duration: 90, yoyo: true });
  }

  /* ── 놓쳤습니다 — 지는 것이 아닙니다 ─────────── */
  dropped() {
    if (!this.playing) return;
    this.playing = false;
    this.misses++;
    AudioSystem.back();
    this.ball.setVisible(false);
    this.flash(DAY04.bricks.miss);

    if (this.misses >= 3 && !this.helped) { this.callCarlo(); return; }
    this.time.delayedCall(1300, () => this.serve(600));
  }

  /* 자꾸 놓치면 카를로가 옆에 와서 같이 받아줍니다 */
  callCarlo() {
    this.helped = true;
    this.padW = 136;
    this.speed = 250;
    this.carlo.setVisible(true).setPosition(GAME.WIDTH + 60, this.PAD_Y);
    this.tweens.add({
      targets: this.carlo, x: this.me.x + 56, duration: 900, ease: 'Sine.easeOut'
    });
    AudioSystem.found();
    this.time.delayedCall(900, () => {
      this.flash(DAY04.bricks.help);
      this.time.delayedCall(1200, () => this.serve(600));
    });
  }

  updateLeft() {
    this.leftText.setText(DAY04.bricks.left + '  ' + this.left);
  }

  flash(msg) {
    if (this._flashText && this._flashText.scene) this._flashText.destroy();
    const t = this.add.text(GAME.WIDTH / 2, this.FLOOR - 74, msg,
      UI.style(FONT.small, PAL.cream, { align: 'center', wordWrap: { width: GAME.WIDTH - 70 } }))
      .setOrigin(0.5).setDepth(120).setAlpha(0);
    this._flashText = t;
    this.tweens.add({ targets: t, alpha: 1, duration: 220 });
    this.time.delayedCall(1400, () => {
      if (!t.scene) return;
      this.tweens.add({ targets: t, alpha: 0, duration: 420, onComplete: () => t.destroy() });
    });
  }

  /* ── 다 떨어뜨렸습니다 ───────────────────────── */
  cleared() {
    this.playing = false;
    this.ball.setVisible(false);
    this.leftText.setText('');
    if (this.btnLeft) this.btnLeft.setVisible(false);
    if (this.btnRight) this.btnRight.setVisible(false);
    if (this.dragZone) this.dragZone.disableInteractive();
    AudioSystem.chime();

    const t = this.add.text(GAME.WIDTH / 2, this.TOP + 130, DAY04.bricks.cleared,
      UI.style(24, PAL.sun, { align: 'center' })).setOrigin(0.5).setDepth(120).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 900 });
    this.tweens.add({ targets: this.me, y: this.PAD_Y - 12, duration: 300, yoyo: true, repeat: 1 });
    if (this.helped) {
      this.tweens.add({ targets: this.carlo, y: this.PAD_Y - 12, duration: 300, delay: 140, yoyo: true, repeat: 1 });
    }

    this.time.delayedCall(2000, () => this.complete(DAY04.bricks.done));
  }
};
