/* 에필로그 미니게임 · 제기차기
   좌우로 움직여 제기 아래로 가고, 발에 닿는 순간 찹니다.
   떨어져도 지는 것이 아닙니다. 여럿이 주워주고 다시 시작할 뿐입니다. */

window.JegiScene = class JegiScene extends MiniGameScene {
  constructor() { super('JegiScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#d0c3a4', warm: true,
      title: EPI.jegi.title, hint: EPI.jegi.hint
    });
    this.titleText.setColor(PAL.ink);
    this.hintText.setColor(PAL.inkSoft);

    const W = GAME.WIDTH, H = GAME.HEIGHT;

    this.GROUND = 626;          // 발이 닿는 바닥
    this.FOOT_Y = 598;          // 제기를 찰 수 있는 높이
    this.G = 780;               // 중력
    this.LIFT = 545;            // 차 올리는 힘

    /* ── 본당 마당 ─────────────────────────────── */
    this.add.image(W / 2, 130, 'epi_sky_day').setOrigin(0.5, 0)
      .setDisplaySize(W, 306).setDepth(-95);
    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0xd6cdb8, 1); g.fillRect(0, 430, W, H - 430);
    g.fillStyle(0xc9bfa6, 1); g.fillRect(0, 424, W, 8);
    g.fillStyle(0xcdc3ac, 0.55); g.fillRect(0, 700, W, H - 700);
    this.add.image(46, 432, 'church_front').setOrigin(0.5, 1).setDepth(-88).setScale(0.72).setAlpha(0.92);
    this.add.image(322, 430, 'tree_big').setOrigin(0.5, 1).setDepth(-88).setScale(0.78).setAlpha(0.92);
    this.add.image(W / 2, 296, 'epi_lights').setDepth(-86).setScale(0.95).setAlpha(0.5);

    /* 멀찍이 서서 구경하는 친구들 */
    this.watchers = [[50, 470, 'epi_ita_front'], [338, 474, 'epi_phi_front']].map((p) => {
      const img = this.add.image(p[0], p[1], p[2]).setDepth(12).setScale(1.25).setAlpha(0.95);
      this.tweens.add({ targets: img, y: p[1] - 4, duration: 940 + Math.random() * 240, yoyo: true, repeat: -1 });
      return img;
    });

    /* 레오는 뒤에서 자기 차례를 기다립니다 — 놀이 자리는 비워 둡니다 */
    this.leo = this.add.image(196, 466, 'epi_leo_front')
      .setOrigin(0.5, 1).setDepth(14).setScale(1.25);
    this.leoBob = this.tweens.add({ targets: this.leo, y: 462, duration: 1000, yoyo: true, repeat: -1 });

    /* ── 나 ────────────────────────────────────── */
    this.me = this.add.image(W / 2 - 40, this.GROUND, 'player_front')
      .setOrigin(0.5, 1).setDepth(40).setScale(1.6);
    this.meShadow = this.add.image(this.me.x, this.GROUND + 2, 'shadow')
      .setDepth(30).setScale(1.5).setAlpha(0.5);

    /* 차는 발 — 뒤꿈치를 축으로 돌아갑니다 */
    this.foot = this.add.image(this.me.x, this.FOOT_Y + 18, 'epi_foot')
      .setOrigin(0.12, 0.5).setDepth(45).setScale(1.15).setVisible(false);

    /* 제기와 그 그림자 — 그림자를 보면 어디로 떨어질지 알 수 있습니다 */
    this.jShadow = this.add.image(this.me.x, this.GROUND + 4, 'shadow')
      .setDepth(22).setScale(0.9).setAlpha(0.3);
    this.jegi = this.add.image(this.me.x + 18, this.FOOT_Y, 'epi_jegi')
      .setDepth(60).setScale(1.6);

    /* ── 세는 곳 — 안내글 바로 아래에 놓습니다 ── */
    const top = this.contentTop();
    this.countText = this.add.text(W / 2, top + 16, '', UI.style(FONT.body, PAL.ink, { align: 'center' }))
      .setOrigin(0.5).setDepth(200);
    this.bestText = this.add.text(W / 2, top + 46, '', UI.style(FONT.small, PAL.inkSoft, { align: 'center' }))
      .setOrigin(0.5).setDepth(200).setAlpha(0.9);
    this.flashY = 336;

    /* ── 조작 ──────────────────────────────────── */
    const bY = 776;
    this.btnLeft = UI.padButton(this, 60, bY, 88, 80, '◀', { size: 30, quiet: true });
    this.btnRight = UI.padButton(this, 158, bY, 88, 80, '▶', { size: 30, quiet: true });
    this.btnKick = UI.padButton(this, 300, bY, 134, 80, EPI.jegi.kickBtn,
      { size: FONT.label, fill: PAL.sun });
    [this.btnLeft, this.btnRight, this.btnKick].forEach(b => b.setDepth(210));
    this.btnKick.onPress = () => this.kick();

    /* PC — 방향키(또는 A·D)로 움직이고 스페이스로 찹니다 */
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyAD = this.input.keyboard.addKeys('A,D');
      this.input.keyboard.on('keydown-SPACE', () => {
        if (!this.dialogue.isOpen) this.kick();
      });
    }

    /* 장면은 다시 열려도 같은 것을 씁니다 — 지난번 흔적을 모두 지웁니다 */
    this.playing = false;
    this.flying = false;
    this.swinging = false;
    this.handedOver = false;
    this.passBtn = null;
    this._flashText = null;
    this.count = 0;
    this.best = 0;
    this.jv = 0; this.jvx = 0;

    this.time.delayedCall(500, () => {
      this.dialogue.play(EPI.jegi.open, () => this.startRally());
    });
  }

  /* ── 한 판 시작 ──────────────────────────────── */
  startRally() {
    if (this.finished || this.handedOver) return;
    this.count = 0;
    this.flying = false;
    this.swinging = false;
    this.jv = 0; this.jvx = 0;
    this.jegi.setPosition(this.me.x + 18, this.FOOT_Y).setAngle(0).setAlpha(1);
    this.jShadow.setVisible(true);
    this.playing = true;
    this.updateCount();
  }

  update(time, delta) {
    if (this.finished || !this.me || !this.me.scene) return;
    const dt = Math.min(delta, 40) / 1000;
    const W = GAME.WIDTH;

    /* 좌우로 움직입니다 */
    let dir = 0;
    if (this.btnLeft && this.btnLeft.isDown) dir -= 1;
    if (this.btnRight && this.btnRight.isDown) dir += 1;
    const c = this.cursors, k = this.keyAD;
    if ((c && c.left.isDown) || (k && k.A.isDown)) dir -= 1;
    if ((c && c.right.isDown) || (k && k.D.isDown)) dir += 1;

    if (dir !== 0 && this.playing && !this.dialogue.isOpen) {
      this.me.x = Phaser.Math.Clamp(this.me.x + dir * 215 * dt, 44, W - 44);
      this.meShadow.x = this.me.x;
      this.me.setFlipX(dir < 0);
      if (time - (this._stepAt || 0) > 300) { this._stepAt = time; AudioSystem.step(); }
    }

    /* 제기 */
    if (this.flying) {
      this.jv += this.G * dt;
      this.jegi.y += this.jv * dt;
      this.jegi.x += this.jvx * dt;
      this.jegi.angle += this.jvx * dt * 0.8;

      if (this.jegi.x < 34) { this.jegi.x = 34; this.jvx = Math.abs(this.jvx) * 0.7; }
      if (this.jegi.x > W - 34) { this.jegi.x = W - 34; this.jvx = -Math.abs(this.jvx) * 0.7; }

      const up = Phaser.Math.Clamp((this.FOOT_Y - this.jegi.y) / 240, 0, 1);
      this.jShadow.setPosition(this.jegi.x, this.GROUND + 4)
        .setScale(0.95 - up * 0.42).setAlpha(0.3 - up * 0.17);

      if (this.jegi.y >= this.GROUND - 10) this.dropIt();
    } else if (this.playing) {
      /* 아직 차지 않았다면 발 앞에 얌전히 있습니다 */
      this.jegi.x = this.me.x + 18;
      this.jShadow.setPosition(this.jegi.x, this.GROUND + 4).setScale(0.95).setAlpha(0.3);
    }
  }

  /* ── 찬다 ────────────────────────────────────── */
  kick() {
    if (!this.playing || this.finished || this.swinging) return;
    if (this.dialogue.isOpen) return;

    this.swinging = true;
    this.swingFoot();

    if (!this.flying) {                       // 첫 발 — 제기를 띄웁니다
      this.launch(0);
      this.flash(EPI.jegi.start);
      return;
    }

    const reach = Math.abs(this.jegi.x - (this.me.x + 8)) < 52;
    const height = this.jegi.y > this.FOOT_Y - 118 && this.jegi.y < this.FOOT_Y + 26;
    if (reach && height && this.jv > 0) {
      this.count++;
      this.updateCount();
      this.bounceCount();
      this.launch(this.count);
    } else {
      AudioSystem.swipe();                    // 헛발질 — 제기는 그대로 떨어집니다
    }
  }

  launch(n) {
    this.flying = true;
    this.jv = -(this.LIFT + Math.min(n, 6) * 9);
    /* 가끔은 옆으로 흘러갑니다 — 따라가서 차야 합니다 */
    const sideways = n > 0 && Math.random() < 0.62;
    this.jvx = sideways ? (Math.random() < 0.5 ? -1 : 1) * Phaser.Math.Between(58, 112) : 0;
    if (this.jegi.y > this.FOOT_Y) this.jegi.y = this.FOOT_Y;
    AudioSystem.kick();
  }

  swingFoot() {
    const f = this.foot;
    this.tweens.killTweensOf(f);
    f.setPosition(this.me.x + 6, this.FOOT_Y + 18).setAngle(18).setVisible(true);
    this.tweens.add({
      targets: f, angle: -58, duration: 110, ease: 'Sine.easeOut', yoyo: true, hold: 40,
      onComplete: () => { f.setVisible(false); this.swinging = false; }
    });
    this.tweens.add({ targets: this.me, y: this.GROUND - 5, duration: 110, yoyo: true });
  }

  /* ── 떨어졌다 ────────────────────────────────── */
  dropIt() {
    this.flying = false;
    this.playing = false;
    this.jv = 0; this.jvx = 0;
    this.jegi.y = this.GROUND - 8;
    AudioSystem.back();
    if (this.count > this.best) this.best = this.count;
    this.updateCount();
    this.flash(EPI.jegi.dropped);

    /* 옆에 있던 친구가 주워서 건네줍니다 */
    const helper = this.watchers[this.jegi.x > GAME.WIDTH / 2 ? 1 : 0];
    const home = helper.x;
    this.tweens.add({
      targets: helper, x: this.jegi.x, duration: 520, ease: 'Sine.easeInOut',
      yoyo: true, hold: 300, onComplete: () => { helper.x = home; }
    });

    this.time.delayedCall(760, () => {
      if (this.finished || this.handedOver) return;
      AudioSystem.found();
      this.flash(EPI.jegi.picked);
      this.tweens.add({
        targets: this.jegi, x: this.me.x + 18, y: this.FOOT_Y, duration: 540, ease: 'Sine.easeOut',
        onComplete: () => this.startRally()
      });
    });

    if (!this.passBtn) this.showPassButton();
  }

  /* 언제든 레오에게 넘기고 마칠 수 있습니다 */
  showPassButton() {
    this.passBtn = UI.button(this, GAME.WIDTH / 2, 686, 252, 56, EPI.jegi.passBtn,
      () => this.friendTurn(), { size: FONT.small });
    this.passBtn.setDepth(210).setAlpha(0);
    this.tweens.add({ targets: this.passBtn, alpha: 1, duration: 500 });
  }

  updateCount() {
    const J = EPI.jegi;
    this.countText.setText(J.countLabel + ' ' + this.count + J.unit);
    this.bestText.setText(this.best > 0 ? J.bestLabel + ' ' + this.best + J.unit : '');
  }

  bounceCount() {
    this.tweens.killTweensOf(this.countText);
    this.countText.setScale(1);
    this.tweens.add({ targets: this.countText, scale: 1.22, duration: 120, yoyo: true });
  }

  flash(msg) {
    /* 앞의 말이 아직 남아 있으면 물러나게 합니다 — 겹쳐 찍히지 않도록 */
    if (this._flashText && this._flashText.scene) this._flashText.destroy();
    const t = this.add.text(GAME.WIDTH / 2, this.flashY, msg,
      UI.style(FONT.small, PAL.ink, { align: 'center', wordWrap: { width: GAME.WIDTH - 70 } }))
      .setOrigin(0.5).setDepth(205).setAlpha(0);
    this._flashText = t;
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1250, () => {
      if (!t.scene) return;
      this.tweens.add({ targets: t, alpha: 0, duration: 400, onComplete: () => t.destroy() });
    });
  }

  /* ── 레오의 차례 — “Easy!” ───────────────────── */
  friendTurn() {
    if (this.handedOver) return;
    this.handedOver = true;
    this.playing = false;
    this.flying = false;
    this.setHint('');
    this.countText.setText('');
    this.bestText.setText('');
    if (this.passBtn) { this.passBtn.destroy(); this.passBtn = null; }
    [this.btnLeft, this.btnRight, this.btnKick].forEach(b => { if (b) b.setVisible(false); });
    if (this.best > 0) this.flash(EPI.jegi.bestLabel + ' ' + this.best + EPI.jegi.unit);

    /* 레오가 뒤에서 걸어 나옵니다 */
    if (this.leoBob) this.leoBob.stop();
    this.leo.setDepth(38);
    const spot = Phaser.Math.Clamp(this.me.x + 100, 76, GAME.WIDTH - 56);
    this.tweens.add({
      targets: this.leo, x: spot, y: this.GROUND, scale: 1.5, duration: 820, ease: 'Sine.easeInOut'
    });

    this.jShadow.setVisible(false);
    this.tweens.add({
      targets: this.jegi, x: spot - 20, y: this.FOOT_Y, duration: 760, delay: 220, ease: 'Sine.easeInOut'
    });

    this.time.delayedCall(1250, () => {
      this.dialogue.play(EPI.jegi.friendTurn, () => {
        /* 툭 — 제기가 옆으로 날아갑니다 */
        AudioSystem.kick();
        this.tweens.add({ targets: this.leo, y: this.GROUND - 10, duration: 130, yoyo: true });
        this.tweens.add({
          targets: this.jegi, x: GAME.WIDTH + 50, y: 520, angle: 320,
          duration: 880, ease: 'Sine.easeOut',
          onComplete: () => this.pickUp()
        });
      });
    });
  }

  /* ── 서로 주워준다 ───────────────────────────── */
  pickUp() {
    const W = GAME.WIDTH;
    this.jegi.setPosition(W + 50, this.GROUND - 10).setAngle(0);
    this.watchers.forEach((o, i) => {
      this.tweens.add({ targets: o, x: W - 70 - i * 48, duration: 900, delay: i * 180, yoyo: true });
    });
    this.tweens.add({
      targets: this.jegi, x: W / 2, y: this.GROUND - 10,
      duration: 1000, delay: 480, ease: 'Sine.easeInOut'
    });
    AudioSystem.found();
    this.time.delayedCall(1900, () => this.complete(EPI.jegi.done));
  }
};
