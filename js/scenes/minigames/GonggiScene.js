/* 에필로그 미니게임 · 공기놀이
   손등에 얹은 다섯 개를 튕겨 올리고, 내려올 때를 맞춰 낚아챕니다.
   놓쳐도 아무도 그만두자고 하지 않습니다. */

window.GonggiScene = class GonggiScene extends MiniGameScene {
  constructor() { super('GonggiScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#cfc4a6', warm: true,
      title: EPI.gonggi.title, hint: EPI.gonggi.hint
    });
    this.titleText.setColor(PAL.ink);
    this.hintText.setColor(PAL.inkSoft);

    const W = GAME.WIDTH, H = GAME.HEIGHT;

    this.HAND_X = W / 2;
    this.HAND_Y = 578;          // 손등 높이
    this.REST_Y = this.HAND_Y - 20;
    this.FLOOR = 606;           // 돌이 굴러 떨어지는 바닥
    this.G = 880;               // 잡을수록 조금씩 더 빨라집니다

    /* ── 돗자리와 마당 ─────────────────────────── */
    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0xd6cdb8, 1); g.fillRect(0, 130, W, H - 130);
    g.fillStyle(0xc9bfa6, 0.6); g.fillRect(0, 660, W, H - 660);
    this.add.image(W / 2, 560, 'epi_mat').setDepth(-40).setScale(1.15);

    /* 둘러앉아 보는 친구들 */
    [[62, 300, 'epi_ita_front'], [330, 304, 'epi_phi_front'], [W / 2, 268, 'epi_leo_front']]
      .forEach((p) => {
        const img = this.add.image(p[0], p[1], p[2]).setDepth(10).setScale(1.3);
        this.tweens.add({ targets: img, y: p[1] - 4, duration: 950 + Math.random() * 260, yoyo: true, repeat: -1 });
      });

    /* ── 손과 공깃돌 다섯 ──────────────────────── */
    this.handShadow = this.add.image(this.HAND_X, this.HAND_Y + 26, 'shadow')
      .setDepth(40).setScale(2).setAlpha(0.32);
    this.hand = this.add.image(this.HAND_X, this.HAND_Y, 'epi_hand_back')
      .setDepth(50).setScale(1.35);

    this.stones = [];
    for (let i = 0; i < 5; i++) {
      const st = this.add.image(this.stoneHomeX(i), this.REST_Y, 'epi_gonggi')
        .setDepth(70).setScale(1.7);
      st.vy = 0; st.vx = 0; st.spin = 0;
      this.stones.push(st);
    }

    /* ── 세는 곳 — 안내글 바로 아래에 놓습니다 ── */
    const top = this.contentTop();
    this.countText = this.add.text(W / 2, top + 18, '', UI.style(FONT.body, PAL.ink, { align: 'center' }))
      .setOrigin(0.5).setDepth(200);
    this.flashY = top + 62;

    /* ── 조작 ──────────────────────────────────── */
    this.actBtn = UI.padButton(this, W / 2, 776, 232, 80, EPI.gonggi.throwBtn,
      { size: FONT.label, fill: PAL.sun });
    this.actBtn.setDepth(210);
    this.actBtn.onPress = () => this.act();

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', () => {
        if (!this.dialogue.isOpen) this.act();
      });
    }

    /* 장면은 다시 열려도 같은 것을 씁니다 — 지난번 흔적을 모두 지웁니다 */
    this.count = 0;
    this.state = 'wait';        // wait · ready · air · caught · scatter
    this.cooling = false;
    this.rising = false;
    this.G = 880;
    this.stopped = false;
    this.helpedOnce = false;
    this.stopBtn = null;
    this._flashText = null;
    this.avgY = this.REST_Y;

    this.dialogue.play(EPI.gonggi.open, () => this.ready());
  }

  stoneHomeX(i) { return this.HAND_X - 26 + i * 13; }

  /* ── 던질 준비 ───────────────────────────────── */
  ready() {
    if (this.finished || this.stopped) return;
    this.state = 'ready';
    this.cooling = false;
    this.hand.setTexture('epi_hand_back').setAngle(0);
    this.hand.setPosition(this.HAND_X, this.HAND_Y);
    this.stones.forEach((st, i) => {
      st.vy = 0; st.vx = 0; st.spin = 0;
      this.tweens.add({
        targets: st, x: this.stoneHomeX(i), y: this.REST_Y, angle: 0, scale: 1.7,
        duration: 300, ease: 'Sine.easeOut'
      });
    });
    this.actBtn.setLabel(EPI.gonggi.throwBtn);
    this.updateCount();
  }

  act() {
    if (this.finished || this.stopped || this.dialogue.isOpen) return;
    if (this.state === 'ready') this.toss();
    else if (this.state === 'air') this.grab();
  }

  /* ── 손등을 튕겨 올린다 ──────────────────────── */
  toss() {
    this.state = 'air';
    this.actBtn.setLabel(EPI.gonggi.catchBtn);
    AudioSystem.swipe();

    this.stones.forEach((st, i) => {
      st.vy = -(596 + Phaser.Math.Between(-40, 40));
      st.vx = (i - 2) * 10 + Phaser.Math.Between(-6, 6);
      st.spin = Phaser.Math.Between(-170, 170);
    });

    this.tweens.killTweensOf(this.hand);
    this.tweens.add({
      targets: this.hand, y: this.HAND_Y - 24, angle: -12,
      duration: 130, ease: 'Sine.easeOut', yoyo: true
    });
  }

  update(time, delta) {
    if (this.finished || this.state !== 'air') return;
    const dt = Math.min(delta, 40) / 1000;
    let sum = 0;
    for (let i = 0; i < this.stones.length; i++) {
      const st = this.stones[i];
      st.vy += this.G * dt;
      st.y += st.vy * dt;
      st.x += st.vx * dt;
      st.angle += st.spin * dt;
      sum += st.y;
    }
    this.avgY = sum / this.stones.length;
    this.rising = this.stones[0].vy < 0;
    if (this.avgY >= this.FLOOR) this.scatter();
  }

  /* ── 낚아챈다 ────────────────────────────────── */
  grab() {
    if (this.cooling) return;
    const inWindow = !this.rising
      && this.avgY > this.HAND_Y - 88
      && this.avgY < this.HAND_Y + 16;

    this.swingHand();

    if (inWindow) { this.catchAll(); return; }

    /* 때가 맞지 않으면 손이 허공을 스칩니다 — 돌은 계속 내려옵니다 */
    AudioSystem.swipe();
    this.flash(EPI.gonggi.whiff);
    this.cooling = true;
    this.time.delayedCall(430, () => { this.cooling = false; });
  }

  swingHand() {
    this.tweens.killTweensOf(this.hand);
    this.hand.setAngle(0);
    this.tweens.add({
      targets: this.hand, angle: -22, y: this.HAND_Y - 14,
      duration: 90, ease: 'Sine.easeOut', yoyo: true,
      onComplete: () => { this.hand.setPosition(this.HAND_X, this.HAND_Y).setAngle(0); }
    });
  }

  catchAll() {
    this.state = 'caught';
    this.count++;
    this.G = Math.min(1050, 880 + this.count * 28);
    AudioSystem.found();
    this.hand.setTexture('epi_hand_open');
    this.stones.forEach((st, i) => {
      st.vy = 0; st.vx = 0; st.spin = 0;
      this.tweens.add({
        targets: st, x: this.stoneHomeX(i), y: this.HAND_Y - 26, angle: 0, scale: 1.5,
        duration: 190, ease: 'Sine.easeOut'
      });
    });
    this.updateCount();
    this.bounceCount();
    this.flash(EPI.gonggi.caught);
    if (!this.stopBtn) this.showStopButton();
    this.time.delayedCall(1150, () => this.ready());
  }

  /* ── 또르르 ──────────────────────────────────── */
  scatter() {
    this.state = 'scatter';
    AudioSystem.back();
    this.flash(EPI.gonggi.missed);
    this.stones.forEach((st) => {
      st.vy = 0; st.vx = 0; st.spin = 0;
      this.tweens.add({
        targets: st,
        x: Phaser.Math.Clamp(st.x + Phaser.Math.Between(-92, 92), 48, GAME.WIDTH - 48),
        y: this.FLOOR + Phaser.Math.Between(-6, 26),
        angle: Phaser.Math.Between(-90, 90),
        duration: 620, ease: 'Sine.easeOut'
      });
    });
    if (!this.stopBtn) this.showStopButton();

    /* 처음 놓쳤을 때만 친구들이 말을 겁니다 */
    if (!this.helpedOnce) {
      this.helpedOnce = true;
      this.time.delayedCall(820, () => {
        if (this.finished || this.stopped) return;
        this.dialogue.play(EPI.gonggi.helped, () => this.helpPickUp());
      });
      return;
    }
    this.time.delayedCall(820, () => this.helpPickUp());
  }

  helpPickUp() {
    if (this.finished || this.stopped) return;
    AudioSystem.found();
    this.ready();
  }

  showStopButton() {
    this.stopBtn = UI.button(this, GAME.WIDTH / 2, 700, 232, 56, EPI.gonggi.stopBtn,
      () => this.finish(), { size: FONT.small });
    this.stopBtn.setDepth(210).setAlpha(0);
    this.tweens.add({ targets: this.stopBtn, alpha: 1, duration: 500 });
  }

  updateCount() {
    this.countText.setText(EPI.gonggi.countLabel + ' ' + this.count + EPI.gonggi.unit);
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

  finish() {
    if (this.stopped) return;
    this.stopped = true;
    this.state = 'done';
    this.setHint('');
    this.countText.setText('');
    if (this.stopBtn) { this.stopBtn.destroy(); this.stopBtn = null; }
    if (this.actBtn) { this.actBtn.setVisible(false); }
    this.complete(EPI.gonggi.done);
  }
};
