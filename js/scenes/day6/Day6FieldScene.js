/* DAY 6 · 철야 장소 — 자리를 만들고, 해가 지고, 별 아래 기도 지향을 놓습니다. */

window.Day6FieldScene = class Day6FieldScene extends Phaser.Scene {
  constructor() { super('Day6FieldScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day6FieldScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#8ea173');

    this.sky = this.add.image(W / 2, 0, 'sky_afternoon').setOrigin(0.5, 0)
      .setDisplaySize(W, 400).setDepth(-40);
    this.evening = this.add.image(W / 2, 0, 'sky_evening').setOrigin(0.5, 0)
      .setDisplaySize(W, 400).setDepth(-39).setAlpha(0);
    this.add.tileSprite(W / 2, 620, W, 460, 'field_grass').setDepth(-30).setAlpha(0.9);

    /* 끝이 보이지 않는 순례자들 */
    for (let r = 0; r < 4; r++) {
      this.add.image(W / 2, 400 + r * 34, 'sleep_row')
        .setDepth(r).setScale(0.8 + r * 0.06).setAlpha(0.55 + r * 0.08);
    }
    this.cross = this.add.image(W / 2, 300, 'wyd_cross').setDepth(10).setScale(0.62).setAlpha(0.9);
    this.add.image(W / 2, 250, 'vigil_stage').setDepth(5).setScale(0.7).setAlpha(0.85);
    this.add.image(60, 372, 'flag_row').setDepth(6).setScale(0.8).setAlpha(0.9);
    this.add.image(330, 372, 'flag_row').setDepth(6).setScale(0.8).setAlpha(0.9);

    this.me = this.add.image(146, 604, 'player_back').setDepth(604).setScale(1.4);
    this.carlo = this.add.image(238, 616, 'carlo_back').setDepth(616).setScale(1.4);
    this.bob = this.tweens.add({ targets: [this.me, this.carlo], y: '-=4', duration: 840, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 900, [200, 190, 172]);

    this.time.delayedCall(800, () => {
      this.dialogue.play(DAY06.field.arrive, () => {
        this.scene.launch('OurSpotScene', { from: this.scene.key });
        this.scene.pause();
      });
    });
  }

  onMiniGameDone(key) {
    if (key === 'OurSpotScene') this.time.delayedCall(400, () => this.sunset());
    else if (key === 'StarPrayerScene') {
      this.time.delayedCall(400, () => {
        UI.fadeOut(this, 1200, () => this.scene.start('Day6VigilScene'), [8, 10, 18]);
      });
    }
  }

  /* 해질녘 — 하늘이 천천히 바뀝니다 */
  sunset() {
    this.tweens.add({ targets: this.evening, alpha: 1, duration: 4000 });
    this.tweens.add({ targets: this.sky, alpha: 0.2, duration: 4000 });

    /* 둘이 돗자리에 눕습니다 */
    if (this.bob) { this.bob.stop(); this.bob = null; }
    this.add.image(196, 660, 'mat_ground').setDepth(650).setScale(1.0);
    this.tweens.add({
      targets: this.me, x: 168, y: 652, angle: -90, duration: 1400, ease: 'Sine.easeInOut'
    });
    this.tweens.add({
      targets: this.carlo, x: 232, y: 664, angle: -90, duration: 1400, ease: 'Sine.easeInOut'
    });
    this.me.setTexture('player_front').setDepth(660);
    this.carlo.setTexture('carlo_front').setDepth(661);

    this.time.delayedCall(1800, () => {
      this.dialogue.play(DAY06.sunset, () => {
        this.scene.launch('StarPrayerScene', { from: this.scene.key });
        this.scene.pause();
      });
    });
  }
};
