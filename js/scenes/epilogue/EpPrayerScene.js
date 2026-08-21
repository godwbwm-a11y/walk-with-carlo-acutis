/* EPILOGUE 6 · 마지막 기도 — 세상의 모든 청소년과 청년들을 위하여. */

window.EpPrayerScene = class EpPrayerScene extends Phaser.Scene {
  constructor() { super('EpPrayerScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('EpPrayerScene', {});
    AudioSystem.setAmbience('none');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#151d31');

    const glow = this.add.image(W / 2, 210, 'lamp_glow').setDepth(0).setScale(2.6).setAlpha(0.16);
    this.tweens.add({ targets: glow, alpha: 0.3, duration: 3000, yoyo: true, repeat: -1 });
    this.add.image(W / 2, 176, 'cross_small').setDepth(2).setScale(1.4).setAlpha(0.7);

    this.add.text(W / 2, 250, EPI.prayer.head, UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(10).setAlpha(0.9);

    /* 기도문은 한 번에 한 덩이씩 조용히 올라옵니다 */
    this.body = this.add.text(W / 2, 470, '', UI.style(17, PAL.cream, {
      align: 'center', lineSpacing: 9, wordWrap: { width: W - 66 }
    })).setOrigin(0.5).setDepth(10).setAlpha(0);

    this.blocks = EPI.prayer.text.split('\n\n');
    this.shown = [];
    this.idx = 0;

    UI.fadeIn(this, 1100, [20, 26, 44]);
    this.time.delayedCall(1400, () => this.next());
  }

  next() {
    if (this.idx >= this.blocks.length) { this.amenButton(); return; }
    this.shown.push(this.blocks[this.idx++]);

    /* 길어지면 뒤에서부터 세 덩이만 보여줍니다 */
    const view = this.shown.slice(-3).join('\n\n');
    this.body.setText(view).setAlpha(0);

    let size = 17;
    while (this.body.height > 300 && size > 13) {
      size--;
      this.body.setStyle(UI.style(size, PAL.cream, {
        align: 'center', lineSpacing: 8, wordWrap: { width: GAME.WIDTH - 66 }
      }));
    }

    this.tweens.add({ targets: this.body, alpha: 1, duration: 900 });
    AudioSystem.talk();
    this.time.delayedCall(2600, () => this.next());
  }

  amenButton() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    AudioSystem.bell();
    const b = UI.button(this, W / 2, H - 130, 250, 62, EPI.prayer.btn,
      () => this.amens(b), { size: FONT.label, fill: PAL.sun });
    b.setDepth(60).setAlpha(0);
    this.tweens.add({ targets: b, alpha: 1, duration: 1000 });
  }

  /* 각자의 언어로 아주 작게 */
  amens(btn) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    btn.destroy();
    this.tweens.add({ targets: this.body, alpha: 0.25, duration: 900 });

    const note = this.add.text(W / 2, H - 216, EPI.prayer.after, UI.style(FONT.small, '#8fa5c8', {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(60).setAlpha(0);
    this.tweens.add({ targets: note, alpha: 0.9, duration: 900 });

    EPI.prayer.amens.forEach((a, i) => {
      this.time.delayedCall(1200 + i * 620, () => {
        const t = this.add.text(60 + (i % 3) * 110, H - 160 + Math.floor(i / 3) * 40, a,
          UI.style(17, PAL.cream)).setOrigin(0.5).setDepth(60).setAlpha(0);
        this.tweens.add({ targets: t, alpha: 0.9, duration: 600 });
        AudioSystem.tap();
      });
    });

    this.time.delayedCall(1200 + EPI.prayer.amens.length * 620 + 1800, () => {
      UI.fadeOut(this, 1400, () => this.scene.start('EpPhotoScene'), [12, 16, 28]);
    });
  }
};
