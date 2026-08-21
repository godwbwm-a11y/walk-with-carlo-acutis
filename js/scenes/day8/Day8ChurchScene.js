/* DAY 8 · 성당 — 이번에는 혼자입니다. */

window.Day8ChurchScene = class Day8ChurchScene extends Phaser.Scene {
  constructor() { super('Day8ChurchScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day8ChurchScene', {});
    AudioSystem.setAmbience('none');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#1a2033');

    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0x232a40, 1); g.fillRect(0, 0, W, 470);
    g.fillStyle(0x2b3350, 1); g.fillRect(0, 470, W, H - 470);
    g.fillStyle(0x1d2438, 1); g.fillRect(0, 464, W, 10);

    this.add.image(W / 2, 250, 'stained_glass').setDepth(-20).setScale(1.1).setAlpha(0.5);
    this.add.image(W / 2, 380, 'altar').setDepth(10).setScale(1.0).setAlpha(0.9);
    const glow = this.add.image(W / 2 + 96, 336, 'lamp_glow').setDepth(11).setScale(0.8).setAlpha(0.4);
    this.add.image(W / 2 + 96, 330, 'sanctuary_lamp').setDepth(12).setScale(1.0);
    this.tweens.add({ targets: glow, alpha: 0.75, duration: 2200, yoyo: true, repeat: -1 });

    for (let r = 0; r < 3; r++) {
      this.add.image(W / 2, 560 + r * 74, 'pew').setDepth(20 + r).setScale(1.05).setAlpha(0.9);
    }
    this.me = this.add.image(W / 2 - 44, 700, 'player_back').setDepth(700).setScale(1.34);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1100, [20, 26, 44]);

    this.time.delayedCall(900, () => {
      this.dialogue.play(DAY08.alone.arrive, () => {
        /* 자리에 앉으면 조작이 사라집니다 */
        this.tweens.add({
          targets: this.me, y: 626, duration: 1200, ease: 'Sine.easeInOut',
          onComplete: () => {
            this.scene.launch('AloneScene', { from: this.scene.key });
            this.scene.pause();
          }
        });
      });
    });
  }

  onMiniGameDone(key) {
    if (key !== 'AloneScene') return;
    this.time.delayedCall(600, () => {
      UI.fadeOut(this, 1100, () => this.scene.start('Day8BeachScene'), [200, 170, 140]);
    });
  }
};
