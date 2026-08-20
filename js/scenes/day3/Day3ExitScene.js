/* DAY 3 · 성당 밖 — 계단에서 나눈 이야기 */

window.Day3ExitScene = class Day3ExitScene extends Phaser.Scene {
  constructor() { super('Day3ExitScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day3ExitScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#cfd6dd');

    this.add.image(W / 2, 0, 'sky_morning').setOrigin(0.5, 0).setDisplaySize(W, 430).setDepth(-20);
    const g = this.add.graphics().setDepth(-19);
    g.fillStyle(0xc9d6c3, 1); g.fillRect(0, 410, W, 110);
    g.fillStyle(0xe8dcc6, 1); g.fillRect(0, 500, W, H - 500);
    for (let i = 0; i < 4; i++) {
      g.fillStyle(i % 2 ? 0xe0d3ba : 0xd5c8ae, 1);
      g.fillRect(0, 560 + i * 42, W, 42);
    }
    g.fillStyle(0xf2b56b, 0.10);
    g.fillTriangle(0, 430, W, 430, W * 0.6, H);

    this.add.image(64, 500, 'church_front').setOrigin(0.5, 1).setDepth(-18).setScale(1.05);
    this.add.image(340, 520, 'tree_big').setOrigin(0.5, 1).setDepth(-18).setScale(0.8);

    this.me = this.add.image(150, 600, 'player_front').setDepth(600).setScale(1.3);
    this.carlo = this.add.image(238, 606, 'carlo_front').setDepth(606).setScale(1.3);
    this.tweens.add({ targets: [this.me, this.carlo], y: '-=3', duration: 2000, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1100, [26, 22, 32]);

    this.time.delayedCall(900, () => {
      this.dialogue.say(DAY03.exit.out, () => this.cards());
    });
  }

  /* 성당을 나서며 여행 노트에 들어온 말씀 */
  cards() {
    Collection.award(this, 'j2', () => {
      Collection.award(this, 'b15', () => this.ask());
    });
  }

  ask() {
    this.dialogue.play(DAY03.exit.ask, () => {
      this.dialogue.choose('', DAY03.exit.choices, (key) => {
        SaveSystem.set('reflections.day3Silent', key);
        this.dialogue.play(DAY03.exit.reply[key], () => this.eucharist());
      });
    });
  }

  eucharist() {
    this.tweens.add({ targets: [this.me, this.carlo], x: '+=26', duration: 1400, ease: 'Sine.easeInOut' });
    this.dialogue.play(DAY03.exit.eucharist, () => {
      this.dialogue.play(DAY03.exit.eucharist2, () => {
        Collection.award(this, 'c2', () => this.toPark());
      });
    });
  }

  toPark() {
    UI.fadeOut(this, 900, () => this.scene.start('Day3ParkScene'), [200, 214, 190]);
  }
};
