/* DAY 2 · 성당 밖 계단 — 늦은 오후의 대화 */

window.Day2SunsetScene = class Day2SunsetScene extends Phaser.Scene {
  constructor() { super('Day2SunsetScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day2SunsetScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();

    this.add.image(W / 2, 0, 'sky_evening').setOrigin(0.5, 0).setDisplaySize(W, 430).setDepth(-20);
    const sun = this.add.image(W * 0.74, 330, 'lamp_glow').setDepth(-19)
      .setDisplaySize(360, 240).setTint(0xffc79a).setAlpha(0.65);
    this.tweens.add({ targets: sun, alpha: 0.85, duration: 5200, yoyo: true, repeat: -1 });

    const g = this.add.graphics().setDepth(-18);
    g.fillStyle(0xc9b79a, 1); g.fillRect(0, 424, W, H - 424);
    g.fillStyle(0xd9c7a8, 1); g.fillRect(0, 424, W, 14);
    /* 계단 */
    for (let i = 0; i < 4; i++) {
      g.fillStyle(i % 2 ? 0xe0cfb2 : 0xd5c3a4, 1);
      g.fillRect(0, 560 + i * 40, W, 40);
    }
    /* 긴 그림자 */
    g.fillStyle(0x8a6f52, 0.22);
    g.fillEllipse(120, 668, 300, 40); g.fillEllipse(280, 706, 260, 36);

    this.add.image(58, 430, 'church_front').setDepth(-17).setScale(1.0).setOrigin(0.5, 1).setAlpha(0.95);

    this.me = this.add.image(150, 598, 'player_back').setDepth(598).setScale(1.35);
    this.carlo = this.add.image(232, 602, 'carlo_back').setDepth(602).setScale(1.35);
    this.tweens.add({ targets: [this.me, this.carlo], y: '-=3', duration: 2000, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1200, [246, 201, 143]);

    this.time.delayedCall(800, () => {
      this.dialogue.say(DAY02.sunset.arrive, () => {
        this.dialogue.play(DAY02.sunset.open, () => {
          this.dialogue.choose('', DAY02.sunset.choices, (key) => {
            SaveSystem.set('reflections.day2Feel', key);
            this.dialogue.play(DAY02.sunset.reply[key], () => this.core());
          });
        });
      });
    });
  }

  core() {
    this.dialogue.play(DAY02.sunset.core, () => this.motto());
  }

  /* 나 말고, 하느님 */
  motto() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.tweens.add({ targets: this.carlo, y: 572, duration: 700, ease: 'Sine.easeOut' });
    this.carlo.setTexture('carlo_back');

    const veil = this.add.graphics().setDepth(60);
    veil.fillStyle(0x2b1f16, 0.45); veil.fillRect(0, 0, W, H);
    veil.setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 1000 });

    const big = this.add.text(W / 2, H * 0.42, DAY02.sunset.motto[0],
      UI.style(31, PAL.cream, { align: 'center' })).setOrigin(0.5).setDepth(61).setAlpha(0);
    const small = this.add.text(W / 2, H * 0.42 + 46, DAY02.sunset.motto[1],
      UI.style(15, '#e8d3b6')).setOrigin(0.5).setDepth(61).setAlpha(0);

    this.tweens.add({ targets: big, alpha: 1, duration: 1200, delay: 400 });
    this.tweens.add({ targets: small, alpha: 0.85, duration: 1200, delay: 1000 });
    AudioSystem.bell();

    this.time.delayedCall(4200, () => {
      this.tweens.add({
        targets: [veil, big, small], alpha: 0, duration: 900,
        onComplete: () => { veil.destroy(); big.destroy(); small.destroy(); this.after(); }
      });
    });
  }

  after() {
    this.dialogue.play(DAY02.sunset.after, () => {
      Collection.award(this, 'c4', () => {
        this.dialogue.play(DAY02.sunset.last, () => this.bye());
      });
    });
  }

  bye() {
    this.dialogue.play(DAY02.sunset.bye, () => {
      this.tweens.add({
        targets: this.carlo, x: GAME.WIDTH + 60, y: 568, duration: 3000, ease: 'Sine.easeIn',
        onStart: () => this.carlo.setTexture('carlo_back')
      });
      this.time.delayedCall(2200, () => {
        UI.fadeOut(this, 1200, () => this.scene.start('Day2ReturnScene'), [70, 56, 44]);
      });
    });
  }
};
