/* DAY 3 · 집으로 가는 길 — 말이 없어도 어색하지 않은 걸음 */

window.Day3HomeScene = class Day3HomeScene extends Phaser.Scene {
  constructor() { super('Day3HomeScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day3HomeScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#e6c8a0');

    this.add.image(W / 2, 0, 'sky_evening').setOrigin(0.5, 0).setDisplaySize(W, 400).setDepth(-20);
    const g = this.add.graphics().setDepth(-19);
    g.fillStyle(0xc4b294, 1); g.fillRect(0, 380, W, H - 380);
    g.fillStyle(0xd3c1a2, 1); g.fillRect(0, 380, W, 12);
    g.fillStyle(0x9a9a96, 1); g.fillRect(0, 700, W, H - 700);
    g.fillStyle(0xf3ece2, 0.7);
    for (let x = 10; x < W; x += 90) g.fillRect(x, 742, 46, 6);
    for (let x = -20; x < W + 40; x += 96) {
      const h = 90 + ((x * 7) % 60);
      g.fillStyle(((x / 96) | 0) % 2 === 0 ? 0xb0a08c : 0xa79684, 1);
      g.fillRect(x, 380 - h, 84, h);
      g.fillStyle(0xf2c08a, 0.5);
      for (let r = 0; r < Math.floor(h / 30); r++)
        for (let c = 0; c < 2; c++) g.fillRect(x + 14 + c * 34, 380 - h + 16 + r * 30, 20, 14);
    }
    g.fillStyle(0x8a6f52, 0.20);
    g.fillEllipse(150, 668, 260, 34); g.fillEllipse(250, 686, 240, 32);

    this.me = this.add.image(150, 596, 'player_back').setDepth(596).setScale(1.35);
    this.carlo = this.add.image(236, 600, 'carlo_back').setDepth(600).setScale(1.35);
    this.bob = this.tweens.add({ targets: [this.me, this.carlo], y: '-=4', duration: 620, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1000, [232, 200, 160]);

    /* 5초쯤 아무 말 없이 걷습니다 */
    this.time.delayedCall(700, () => {
      const t = this.add.text(GAME.WIDTH / 2, 150, DAY03.home.quiet.join('\n'),
        UI.style(FONT.body, PAL.cream, { align: 'center', lineSpacing: 8 }))
        .setOrigin(0.5).setDepth(60).setAlpha(0);
      const back = this.add.graphics().setDepth(59);
      back.fillStyle(0x2b1f16, 0.35); back.fillRect(0, 96, GAME.WIDTH, 110);
      back.setAlpha(0);
      this.tweens.add({ targets: [t, back], alpha: 1, duration: 1100 });
      this.time.delayedCall(4600, () => {
        this.tweens.add({
          targets: [t, back], alpha: 0, duration: 900,
          onComplete: () => { t.destroy(); back.destroy(); this.talk(); }
        });
      });
    });
  }

  talk() {
    this.dialogue.play(DAY03.home.talk, () => {
      this.dialogue.play(DAY03.home.core, () => {
        this.dialogue.play(DAY03.home.plan, () => {
          Collection.award(this, 'c1', () => this.bye());
        });
      });
    });
  }

  bye() {
    this.dialogue.play(DAY03.home.bye, () => {
      this.tweens.add({
        targets: this.carlo, x: GAME.WIDTH + 70, duration: 2600, ease: 'Sine.easeIn'
      });
      this.time.delayedCall(1800, () => {
        UI.fadeOut(this, 1200, () => this.scene.start('Day3NoteScene'), [22, 30, 50]);
      });
    });
  }
};
