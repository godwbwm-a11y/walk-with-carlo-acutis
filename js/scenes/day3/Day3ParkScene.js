/* DAY 3 · 공원 — 마음 한마디와 오늘의 기도 */

window.Day3ParkScene = class Day3ParkScene extends Phaser.Scene {
  constructor() { super('Day3ParkScene'); }

  create(data) {
    data = data || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day3ParkScene', { after: !!data.after });
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#b7d4a8');

    this.add.image(W / 2, 0, 'sky_morning').setOrigin(0.5, 0).setDisplaySize(W, 400).setDepth(-20);
    const g = this.add.graphics().setDepth(-19);
    g.fillStyle(0x8fbf7a, 1); g.fillRect(0, 380, W, H - 380);
    g.fillStyle(0x7fae6b, 1); g.fillRect(0, 380, W, 14);
    g.fillStyle(0xd7cec1, 1); g.fillRect(0, 690, W, 40);
    for (let i = 0; i < 70; i++) {
      g.fillStyle(0xffffff, 0.10);
      g.fillEllipse(Phaser.Math.Between(0, W), Phaser.Math.Between(400, H - 20), Phaser.Math.Between(10, 26), 5);
    }

    this.add.image(52, 420, 'tree_big').setOrigin(0.5, 1).setDepth(0).setScale(1.0);
    this.add.image(336, 430, 'tree_big').setOrigin(0.5, 1).setDepth(0).setScale(0.85);
    this.add.image(300, 470, 'bush').setOrigin(0.5, 1).setDepth(1).setScale(1.0);
    this.library = this.add.image(76, 560, 'park_library').setDepth(560).setScale(1.15);

    this.add.image(W / 2 + 10, 630, 'bench').setDepth(630).setScale(1.4);
    this.me = this.add.image(W / 2 - 26, 610, 'player_back').setDepth(610).setScale(1.3);
    this.carlo = this.add.image(W / 2 + 48, 614, 'carlo_back').setDepth(614).setScale(1.3);
    this.tweens.add({ targets: [this.me, this.carlo], y: '-=3', duration: 2100, yoyo: true, repeat: -1 });

    for (let i = 0; i < 2; i++) {
      const p = this.add.image(Phaser.Math.Between(60, 320), Phaser.Math.Between(500, 660), 'pigeon')
        .setDepth(500).setScale(1.05);
      this.tweens.add({ targets: p, x: p.x + Phaser.Math.Between(40, 90), duration: 6000, yoyo: true, repeat: -1 });
    }

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 900, [200, 214, 190]);

    if (data.after) { this.time.delayedCall(500, () => this.prayer()); return; }

    this.time.delayedCall(800, () => {
      this.dialogue.say(DAY03.park.arrive, () => {
        this.dialogue.play(DAY03.park.ask, () => {
          this.scene.launch('HeartWordScene', { from: this.scene.key });
          this.scene.pause();
        });
      });
    });
  }

  onMiniGameDone(key) {
    if (key === 'HeartWordScene') this.time.delayedCall(400, () => this.prayer());
  }

  /* 고른 한마디로 오늘의 기도가 만들어집니다 */
  prayer() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const word = SaveSystem.get('reflections.day3Heart', '잘 모르겠어요.');
    const lines = DAY03.prayer[word] || DAY03.prayer['잘 모르겠어요.'];

    const veil = this.add.graphics().setDepth(200);
    veil.fillStyle(0x2b3b60, 0.55); veil.fillRect(0, 0, W, H);
    veil.setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 1000 });
    AudioSystem.bell();

    const view = PrayerView.open(this, lines, {
      top: H * 0.22, bottom: H - 196, depth: 210, delay: 900,
      onDone: () => {
        this.time.delayedCall(1600, () => {
          const b = UI.button(this, W / 2, H - 120, 240, 58, '아멘', () => {
            view.fade(900);
            this.tweens.add({
              targets: [veil, b], alpha: 0, duration: 900,
              onComplete: () => { veil.destroy(); b.destroy(); this.library_(); }
            });
          }, { size: FONT.label, fill: PAL.sun });
          b.setDepth(210).setAlpha(0);
          this.tweens.add({ targets: b, alpha: 1, duration: 800 });
        });
      }
    });
  }

  /* 공원의 작은 책장 */
  library_() {
    const spark = this.add.image(76, 520, 'spark').setDepth(700).setScale(1.4);
    this.tweens.add({ targets: spark, alpha: 0.4, scale: 1.8, duration: 900, yoyo: true, repeat: -1 });

    this.library.setInteractive({ useHandCursor: true });
    const open = () => {
      if (this.libraryBtn) { this.libraryBtn.destroy(); this.libraryBtn = null; }
      this.library.disableInteractive();
      this.tweens.add({ targets: spark, alpha: 0, duration: 400 });
      const mark = this.add.image(76, 500, 'bookmark').setDepth(701).setScale(0).setAngle(-8);
      this.tweens.add({ targets: mark, scale: 1.3, duration: 600, ease: 'Back.easeOut' });
      this.dialogue.say(DAY03.park.library, () => {
        this.tweens.add({ targets: mark, alpha: 0, duration: 400 });
        Collection.award(this, 's10', () => {
          this.dialogue.play(DAY03.park.libraryAfter, () => this.toHome());
        });
      });
    };
    this.library.once('pointerdown', open);

    const b = UI.button(this, GAME.WIDTH / 2, GAME.HEIGHT - 120, 250, 58, '작은 책장을 살펴본다', open,
      { size: FONT.small, fill: PAL.paper });
    b.setDepth(210);
    this.libraryBtn = b;
  }

  toHome() {
    if (this.libraryBtn) this.libraryBtn.destroy();
    UI.fadeOut(this, 900, () => this.scene.start('Day3HomeScene'), [232, 200, 160]);
  }
};
