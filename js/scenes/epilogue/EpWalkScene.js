/* EPILOGUE 8 · 함께 걷는 길 — 한때는 평범했던 본당 앞길입니다. */

window.EpWalkScene = class EpWalkScene extends Phaser.Scene {
  constructor() { super('EpWalkScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('EpWalkScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#151d31');

    this.add.image(W / 2, 0, 'epi_sky_night').setOrigin(0.5, 0).setDisplaySize(W, 460).setDepth(-40);
    for (let i = 0; i < 34; i++) {
      const s = this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(20, 320), 'dot')
        .setDepth(-35).setScale(Phaser.Math.FloatBetween(0.14, 0.34))
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.65));
      this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(1800, 3400),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000) });
    }

    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0x3e4457, 1); g.fillRect(0, 440, W, H - 440);
    g.fillStyle(0x4a5064, 1); g.fillRect(0, 440, W, 12);
    g.fillStyle(0x555c72, 0.5);
    for (let x = -40; x < W + 40; x += 90) g.fillRect(x, 600, 46, 5);

    this.add.image(46, 440, 'streetlamp').setOrigin(0.5, 1).setDepth(4).setScale(1.1);
    this.add.image(340, 438, 'streetlamp').setOrigin(0.5, 1).setDepth(4).setScale(1.1);
    this.add.image(30, 436, 'church_front').setOrigin(0.5, 1).setDepth(2).setScale(0.55).setAlpha(0.55);

    /* 뒷모습으로 함께 걸어갑니다 */
    const tex = ['epi_ita_back', 'player_back', 'epi_leo_back', 'epi_phi_back', 'epi_fra_back', 'friend_back'];
    this.walkers = tex.map((t, i) => {
      const x = 46 + i * 62;
      const y = 600 + (i % 2) * 22;
      const img = this.add.image(x, y, t).setDepth(y).setScale(1.34);
      this.tweens.add({ targets: img, y: y - 5, duration: 620 + i * 50, yoyo: true, repeat: -1 });
      return img;
    });
    /* 손에 든 것들 */
    /* 사람 몸을 가리지 않도록 손 높이에 둡니다 */
    this.add.image(24, 620, 'soccer_ball').setDepth(700).setScale(0.85);
    this.add.image(332, 606, 'epi_jegi').setDepth(700).setScale(0.85);
    this.add.image(140, 644, 'epi_snackbag').setDepth(700).setScale(0.6);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1100, [12, 16, 28]);

    this.time.delayedCall(1000, () => {
      this.dialogue.play(EPI.walk.open, () => this.chat());
    });
  }

  chat() {
    this.dialogue.play(EPI.walk.chat, () => this.no());
  }

  /* “Spicy?” — 모두: “NO!” */
  no() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const t = this.add.text(W / 2, H * 0.30, EPI.walk.no, UI.style(44, PAL.sun))
      .setOrigin(0.5).setDepth(300).setAlpha(0).setScale(0.7);
    this.tweens.add({ targets: t, alpha: 1, scale: 1.1, duration: 340, ease: 'Back.easeOut' });
    this.walkers.forEach((o, i) => this.tweens.add({
      targets: o, y: o.y - 12, duration: 200, yoyo: true, delay: i * 40
    }));
    AudioSystem.boom();

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: t, alpha: 0, duration: 700,
        onComplete: () => { t.destroy(); this.dialogue.play(EPI.walk.laugh, () => this.pullBack()); }
      });
    });
  }

  /* 카메라가 천천히 위로 올라갑니다 */
  pullBack() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.tweens.add({ targets: this.cameras.main, zoom: 0.82, duration: 3000, ease: 'Sine.easeInOut' });
    this.walkers.forEach((o, i) => this.tweens.add({
      targets: o, x: o.x + (i - 2.5) * 8, y: o.y - 26, duration: 3000, ease: 'Sine.easeInOut'
    }));

    this.time.delayedCall(3200, () => {
      UI.fadeOut(this, 1200, () => this.montage(), [10, 12, 22]);
    });
  }

  /* 여덟 날이 짧게 돌아옵니다 */
  montage() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.children.list.slice().forEach(o => o.destroy());
    this.cameras.main.setZoom(1);
    this.cameras.main.setBackgroundColor('#0a0e18');
    this.cameras.main.fadeIn(900, 10, 14, 24);
    AudioSystem.setAmbience('none');

    this.step(0);
  }

  step(i) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const list = EPI.walk.montage;
    if (i >= list.length) {
      this.time.delayedCall(1200, () => {
        UI.fadeOut(this, 1400, () => this.scene.start('EpFinalScene'), [8, 10, 18]);
      });
      return;
    }

    const m = list[i];
    const last = (i === list.length - 1);
    const d = this.add.text(W / 2, H * 0.40, m.d, UI.style(FONT.small, last ? PAL.sunDeep : '#8fa5c8'))
      .setOrigin(0.5).setDepth(60).setAlpha(0);
    const t = this.add.text(W / 2, H * 0.47, m.t, UI.style(last ? 24 : 21,
      last ? PAL.sun : PAL.cream, { align: 'center', wordWrap: { width: W - 60 }, lineSpacing: 8 }))
      .setOrigin(0.5).setDepth(60).setAlpha(0);

    this.tweens.add({ targets: [d, t], alpha: 1, duration: 500 });
    if (last) AudioSystem.bell(); else AudioSystem.tap();

    this.time.delayedCall(last ? 3200 : 1300, () => {
      this.tweens.add({
        targets: [d, t], alpha: 0, duration: 500,
        onComplete: () => { d.destroy(); t.destroy(); this.step(i + 1); }
      });
    });
  }
};
