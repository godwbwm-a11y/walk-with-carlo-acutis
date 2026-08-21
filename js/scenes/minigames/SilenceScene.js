/* 미니게임 · 아무것도 하지 않기
   성공도 실패도 없습니다. 시간도 재지 않고, 점수도 없습니다. */

window.SilenceScene = class SilenceScene extends Phaser.Scene {
  constructor() { super('SilenceScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('SilenceScene', {});
    AudioSystem.setAmbience('none');
    AudioSystem.stopPad();
    this.cameras.main.setBackgroundColor('#2b2534');

    this.elapsed = 0;
    this.stage = 0;
    this.standing = false;

    /* 성당과 성체등만 남습니다 */
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x322b3c, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0x3d3547, 1); g.fillRect(0, 470, W, H - 470);
    g.fillStyle(0x483f52, 1); g.fillRect(26, 150, 40, 330); g.fillRect(W - 66, 150, 40, 330);

    /* 제대 위의 십자가 — 머무는 동안 바라볼 수 있습니다 */
    this.crossGlow = this.add.image(W / 2, 190, 'lamp_glow').setDepth(2)
      .setScale(1.9).setAlpha(0.18).setTint(0xffd9a8);
    this.cross = this.add.image(W / 2, 190, 'cross_wall').setDepth(5).setScale(1.05);
    this.tweens.add({ targets: this.crossGlow, alpha: 0.34, scale: 2.2, duration: 5200, yoyo: true, repeat: -1 });

    this.add.image(W / 2, 320, 'altar').setDepth(4).setScale(1.1).setAlpha(0.9);
    this.glow = this.add.image(96, 244, 'lamp_glow').setDepth(3).setScale(1.5).setAlpha(0.4).setTint(0xffd9a8);
    this.add.image(96, 240, 'sanctuary_lamp').setDepth(6).setScale(1.1);
    this.add.image(58, 292, 'stained_glass').setDepth(4).setScale(0.8).setAlpha(0.8);

    /* 십자가를 누르면 잠시 그 앞에 머뭅니다 */
    this.crossZone = this.add.zone(W / 2, 190, 150, 210).setOrigin(0.5)
      .setInteractive().setDepth(55);
    this.crossZone.on('pointerup', () => this.lookAtCross());
    [486, 566].forEach((y, i) => this.add.image(W / 2, y, 'pew').setDepth(y).setScale(1.25).setAlpha(0.9 - i * 0.05));
    this.add.image(W / 2 - 6, 534, 'player_back').setDepth(535).setScale(1.25);
    this.add.image(W / 2 + 50, 606, 'carlo_back').setDepth(607).setScale(1.2).setAlpha(0.85);

    /* 성체등이 아주 천천히 숨을 쉽니다 */
    this.tweens.add({ targets: this.glow, alpha: 0.62, scale: 1.7, duration: 4200, yoyo: true, repeat: -1 });

    this.title = this.add.text(W / 2, 120, DAY03.silence.title,
      UI.style(20, PAL.cream, { align: 'center', wordWrap: { width: W - 70 } }))
      .setOrigin(0.5).setDepth(60).setAlpha(0);
    this.tweens.add({ targets: this.title, alpha: 0.95, duration: 1000 });
    this.time.delayedCall(3200, () => this.tweens.add({ targets: this.title, alpha: 0, duration: 1200 }));

    this.line = this.add.text(W / 2, H * 0.80, '',
      UI.style(FONT.body, '#e0d3bd', { align: 'center', lineSpacing: 8, wordWrap: { width: W - 80 } }))
      .setOrigin(0.5).setDepth(60).setAlpha(0);

    /* 십자가 안내 — 처음 한 번만 조용히 */
    this.crossHint = this.add.text(W / 2, 320, DAY03.silence.crossHint,
      UI.style(FONT.small, PAL.dim, { align: 'center', wordWrap: { width: W - 90 } }))
      .setOrigin(0.5).setDepth(60).setAlpha(0);
    this.tweens.add({ targets: this.crossHint, alpha: 0.9, duration: 1200, delay: 4200 });
    this.time.delayedCall(11000, () => this.tweens.add({
      targets: this.crossHint, alpha: 0, duration: 1200
    }));

    /* 화면을 눌러도 실패가 아닙니다 */
    this.zone = this.add.zone(W / 2, H / 2, W, H).setOrigin(0.5).setInteractive().setDepth(50);
    this.zone.on('pointerdown', () => this.touched());

    UI.fadeIn(this, 1400, [26, 22, 32]);
    AudioSystem.bell();
  }

  /* 십자가를 바라봅니다 — 아무것도 요구하지 않습니다 */
  lookAtCross() {
    if (this.standing || this.lookingAtCross) return;
    this.lookingAtCross = true;
    AudioSystem.bell();

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const veil = this.add.graphics().setDepth(70).setAlpha(0);
    veil.fillStyle(0x1a1522, 0.82); veil.fillRect(0, 0, W, H);

    const big = this.add.image(W / 2, H * 0.40, 'cross_wall').setDepth(72)
      .setScale(1.05).setAlpha(0);
    const halo = this.add.image(W / 2, H * 0.40, 'lamp_glow').setDepth(71)
      .setScale(2.2).setAlpha(0).setTint(0xffd9a8);

    const line = this.add.text(W / 2, H * 0.68, DAY03.silence.crossLine,
      UI.style(FONT.body, PAL.cream, { align: 'center', lineSpacing: 9, wordWrap: { width: W - 80 } }))
      .setOrigin(0.5).setDepth(73).setAlpha(0);

    this.tweens.add({ targets: [veil, big], alpha: 1, duration: 1100 });
    this.tweens.add({ targets: big, scale: 1.9, duration: 2600, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: halo, alpha: 0.4, duration: 1600, delay: 600 });
    this.tweens.add({ targets: line, alpha: 1, duration: 1200, delay: 2000 });

    const back = UI.button(this, W / 2, H - 120, 250, 60, DAY03.silence.crossBack, () => {
      this.tweens.add({
        targets: [veil, big, halo, line, back], alpha: 0, duration: 800,
        onComplete: () => {
          [veil, big, halo, line, back].forEach(o => o.destroy());
          this.lookingAtCross = false;
        }
      });
    }, { size: FONT.small });
    back.setDepth(74).setAlpha(0);
    this.tweens.add({ targets: back, alpha: 1, duration: 900, delay: 3600 });
  }

  say(text, hold) {
    this.line.setText(text);
    this.line.setAlpha(0);
    this.tweens.add({ targets: this.line, alpha: 1, duration: 1100 });
    this.time.delayedCall(hold || 3200, () => {
      this.tweens.add({ targets: this.line, alpha: 0, duration: 1000 });
    });
  }

  touched() {
    if (this.standing || this._softAt && this.time.now - this._softAt < 3000) return;
    this._softAt = this.time.now;
    if (this.stage < 3) {
      /* 시간을 되돌리지도, 혼내지도 않습니다 */
      this.line.setText(DAY03.silence.touched);
      this.line.setAlpha(0);
      this.tweens.add({ targets: this.line, alpha: 0.9, duration: 700 });
      this.time.delayedCall(2400, () => this.tweens.add({ targets: this.line, alpha: 0, duration: 800 }));
    } else if (this.staying && !this.standBtn) {
      this.showStand(DAY03.silence.standLater);
    }
  }

  update(time, delta) {
    if (this.standing) return;
    this.elapsed += delta;

    if (this.stage === 0 && this.elapsed > 5000) { this.stage = 1; this.say(DAY03.silence.at5); }
    else if (this.stage === 1 && this.elapsed > 10000) { this.stage = 2; this.say(DAY03.silence.at10); }
    else if (this.stage === 2 && this.elapsed > 20000) { this.stage = 3; this.offerChoice(); }
  }

  offerChoice() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.say(DAY03.silence.at20, 4200);

    this.stayBtn = UI.button(this, W / 2, H - 176, 230, 56, DAY03.silence.stay, () => {
      this.staying = true;
      this.stayBtn.destroy(); this.standBtn.destroy();
      this.stayBtn = null; this.standBtn = null;
      this.say('언제든 화면을 한 번 누르면 일어날 수 있어요.', 3600);
    }, { size: FONT.label, fill: PAL.paper });
    this.standBtn = UI.button(this, W / 2, H - 108, 230, 56, DAY03.silence.stand, () => this.stand(),
      { size: FONT.label, fill: PAL.sun });
    [this.stayBtn, this.standBtn].forEach(b => { b.setDepth(60).setAlpha(0); });
    this.tweens.add({ targets: [this.stayBtn, this.standBtn], alpha: 1, duration: 1200, delay: 900 });
  }

  showStand(label) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.standBtn = UI.button(this, W / 2, H - 120, 230, 58, label, () => this.stand(),
      { size: FONT.label, fill: PAL.sun });
    this.standBtn.setDepth(60).setAlpha(0);
    this.tweens.add({ targets: this.standBtn, alpha: 1, duration: 800 });
  }

  stand() {
    if (this.standing) return;
    this.standing = true;
    SaveSystem.set('reflections.day3Silence', Math.round(this.elapsed / 1000));
    AudioSystem.chime();
    UI.fadeOut(this, 1200, () => this.scene.start('Day3ExitScene'), [26, 22, 32]);
  }
};
