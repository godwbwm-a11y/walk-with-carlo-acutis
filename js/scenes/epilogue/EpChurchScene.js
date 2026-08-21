/* EPILOGUE 5 · 하나의 성당 — 종소리 하나에 마당이 조용해집니다.
   여기서 게임 UI는 모두 사라집니다. 마지막 ‘게임’은 아무것도 하지 않는 시간입니다. */

window.EpChurchScene = class EpChurchScene extends Phaser.Scene {
  constructor() { super('EpChurchScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('EpChurchScene', {});
    AudioSystem.setAmbience('none');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#1a2033');

    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0x232a40, 1); g.fillRect(0, 0, W, 450);
    g.fillStyle(0x2b3350, 1); g.fillRect(0, 450, W, H - 450);
    g.fillStyle(0x1d2438, 1); g.fillRect(0, 444, W, 10);

    this.add.image(W / 2, 240, 'stained_glass').setDepth(-20).setScale(1.1).setAlpha(0.5);
    this.add.image(W / 2, 366, 'altar').setDepth(10).setScale(1.0).setAlpha(0.9);
    const glow = this.add.image(W / 2 + 96, 322, 'lamp_glow').setDepth(11).setScale(0.8).setAlpha(0.4);
    this.add.image(W / 2 + 96, 316, 'sanctuary_lamp').setDepth(12).setScale(1.0);
    this.tweens.add({ targets: glow, alpha: 0.75, duration: 2200, yoyo: true, repeat: -1 });

    for (let r = 0; r < 4; r++) {
      this.add.image(W / 2, 520 + r * 74, 'pew').setDepth(20 + r).setScale(1.05).setAlpha(0.9);
    }

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1200, [20, 26, 44]);

    this.time.delayedCall(900, () => this.bell());
  }

  bell() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const t = this.add.text(W / 2, H * 0.22, EPI.church.bell, UI.style(30, PAL.sun))
      .setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 700, yoyo: true, hold: 900,
      onComplete: () => t.destroy() });
    AudioSystem.bell();

    this.time.delayedCall(2400, () => {
      this.dialogue.play(EPI.church.go, () => this.seat());
    });
  }

  /* 여러 나라의 청년들이 한자리에 앉습니다 */
  seat() {
    const W = GAME.WIDTH;
    const rows = [
      { y: 494, tex: ['epi_ita_back', 'player_back', 'epi_leo_back', 'epi_phi_back'] },
      { y: 568, tex: ['friend_back', 'epi_fra_back', 'epi_bra_back', 'epi_spa_back'] },
      { y: 642, tex: ['villager_back', 'epi_phi_back', 'epi_ita_back', 'friend_back'] }
    ];
    this.people = [];
    rows.forEach((r, ri) => {
      r.tex.forEach((t, i) => {
        /* 의자 폭 안에 앉도록 */
        const img = this.add.image(96 + i * 66, r.y, t).setDepth(r.y + 1).setScale(1.2).setAlpha(0);
        this.tweens.add({ targets: img, alpha: 1, duration: 700, delay: (ri * 4 + i) * 160 });
        this.people.push(img);
      });
    });

    this.time.delayedCall(2800, () => {
      this.dialogue.play(EPI.church.inside, () => this.one(0));
    });
  }

  /* 우리의 언어는 다릅니다 · 우리의 모습도 다릅니다 · 그러나 한 분입니다 */
  one(i) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const lines = [EPI.church.one1, EPI.church.one2, EPI.church.one3];
    if (i >= lines.length) { this.silence(); return; }

    const last = (i === 2);
    const t = this.add.text(W / 2, H * 0.30, lines[i], UI.style(last ? 25 : 22,
      last ? PAL.sun : PAL.cream, { align: 'center', wordWrap: { width: W - 60 }, lineSpacing: 8 }))
      .setOrigin(0.5).setDepth(300).setAlpha(0);
    const plate = this.add.graphics().setDepth(299).setAlpha(0);
    plate.fillStyle(0x141a2b, 0.7);
    plate.fillRoundedRect(24, H * 0.30 - 44, W - 48, 88, 20);

    this.tweens.add({ targets: [t, plate], alpha: 1, duration: 1000 });
    if (last) AudioSystem.bell();

    this.time.delayedCall(last ? 3400 : 2400, () => {
      this.tweens.add({
        targets: [t, plate], alpha: 0, duration: 800,
        onComplete: () => { t.destroy(); plate.destroy(); this.one(i + 1); }
      });
    });
  }

  /* 아무것도 하지 않는 10초 */
  silence() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const hint = this.add.text(W / 2, H - 96, '', UI.style(FONT.small, '#6d8098'))
      .setOrigin(0.5).setDepth(300).setAlpha(0);

    /* 성체등만 조용히 흔들립니다 */
    this.time.delayedCall(9000, () => {
      hint.setText('…');
      this.tweens.add({ targets: hint, alpha: 0.6, duration: 900 });
    });
    this.time.delayedCall(11000, () => {
      hint.destroy();
      this.scene.start('EpPrayerScene');
    });
  }
};
