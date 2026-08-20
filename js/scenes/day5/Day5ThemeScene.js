/* DAY 5 · 오늘의 말씀 — 2027 서울 WYD 주제 말씀.
   화려한 획득 효과 없이 아주 천천히 나타납니다. */

window.Day5ThemeScene = class Day5ThemeScene extends Phaser.Scene {
  constructor() { super('Day5ThemeScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, T = DAY05.theme;
    SaveSystem.checkpoint('Day5ThemeScene', {});
    AudioSystem.setAmbience('none');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#0b1120');

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1200, [8, 10, 18]);

    const l1 = this.add.text(W / 2, H * 0.34, T.line1, UI.style(30, PAL.cream))
      .setOrigin(0.5).setDepth(20).setAlpha(0);
    const l2 = this.add.text(W / 2, H * 0.44, T.line2, UI.style(30, PAL.sun))
      .setOrigin(0.5).setDepth(20).setAlpha(0);
    const ref = this.add.text(W / 2, H * 0.52, T.ref, UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(20).setAlpha(0);

    this.time.delayedCall(1000, () => {
      AudioSystem.bell();
      this.tweens.add({ targets: l1, alpha: 1, duration: 1600 });
    });
    this.time.delayedCall(3200, () => this.tweens.add({ targets: l2, alpha: 1, duration: 1600 }));
    this.time.delayedCall(5200, () => this.tweens.add({ targets: ref, alpha: 1, duration: 1200 }));

    const note = this.add.text(W / 2, H * 0.62, T.note, UI.style(FONT.small, '#cbbfae', {
      align: 'center', lineSpacing: 7, wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(20).setAlpha(0);
    const note2 = this.add.text(W / 2, H * 0.735, T.note2, UI.style(FONT.small, '#cbbfae', {
      align: 'center', lineSpacing: 7, wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(20).setAlpha(0);

    this.time.delayedCall(6600, () => this.tweens.add({ targets: note, alpha: 1, duration: 1200 }));
    this.time.delayedCall(8600, () => this.tweens.add({ targets: note2, alpha: 1, duration: 1200 }));

    this.time.delayedCall(11200, () => {
      this.dialogue.say(T.card, () => {
        Collection.award(this, 'b18', () => {
          UI.fadeOut(this, 1100, () => this.scene.start('Day5NightScene'), [8, 10, 18]);
        });
      });
    });
  }
};
