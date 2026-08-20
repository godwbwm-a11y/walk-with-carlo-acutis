/* DAY 7 · 컴퓨터실 — 좋은 도구라면 좋은 데 쓰면 되잖아. */

window.Day7ComputerScene = class Day7ComputerScene extends Phaser.Scene {
  constructor() { super('Day7ComputerScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day7ComputerScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#e6e0d2');

    this.add.tileSprite(W / 2, 150, W, 300, 'wall_tile').setDepth(0).setTint(0xe9e3d4);
    this.add.tileSprite(W / 2, 600, W, 490, 'floor_tile').setDepth(0).setTint(0xcfc7b4);
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0xb9b0a0, 1); g.fillRect(0, 294, W, 10);

    /* 줄지어 선 컴퓨터들 */
    [[76, 380], [196, 380], [316, 380], [76, 500], [316, 500]].forEach((p) => {
      this.add.image(p[0], p[1], 'pc_desk').setDepth(p[1]).setScale(0.95).setAlpha(0.95);
    });
    this.myPc = this.add.image(196, 500, 'pc_desk').setDepth(500).setScale(1.1);

    this.me = this.add.image(146, 584, 'player_front').setDepth(584).setScale(1.34);
    this.carlo = this.add.image(246, 596, 'carlo_front').setDepth(596).setScale(1.34).setAlpha(0);
    this.tweens.add({ targets: this.me, y: 580, duration: 880, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 900, [30, 40, 60]);

    this.time.delayedCall(800, () => {
      this.tweens.add({ targets: this.carlo, alpha: 1, duration: 600, delay: 1400 });
      this.dialogue.play(DAY07.computer.arrive, () => {
        this.dialogue.play(DAY07.computer.talk, () => {
          this.scene.launch('MakeCardScene', { from: this.scene.key });
          this.scene.pause();
        });
      });
    });
  }

  onMiniGameDone(key) {
    if (key === 'MakeCardScene') {
      this.time.delayedCall(400, () => {
        this.scene.launch('NetChoiceScene', { from: this.scene.key });
        this.scene.pause();
      });
    } else if (key === 'NetChoiceScene') {
      this.time.delayedCall(500, () => this.shutdown());
    }
  }

  /* 컴퓨터를 끄면 꺼진 화면 대신 카드가 떠오릅니다 */
  shutdown() {
    this.dialogue.say(DAY07.computer.shutdown, () => {
      Collection.award(this, 'c14', () => {
        this.dialogue.play(DAY07.exit, () => {
          UI.fadeOut(this, 900, () => this.scene.start('Day7TownScene'), [200, 196, 180]);
        });
      });
    });
  }
};
