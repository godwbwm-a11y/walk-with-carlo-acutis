/* DAY 6 · 순례자들이 잠들다 — 거룩함 속에도 인간적인 웃음이 있습니다. */

window.Day6NightScene = class Day6NightScene extends Phaser.Scene {
  constructor() { super('Day6NightScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day6NightScene', {});
    AudioSystem.setAmbience('none');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#080e1f');

    this.add.image(W / 2, 0, 'sky_vigil').setOrigin(0.5, 0).setDisplaySize(W, H).setDepth(-40);
    for (let i = 0; i < 70; i++) {
      const s = this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(50, 430), 'star_bright')
        .setDepth(-30).setScale(Phaser.Math.FloatBetween(0.24, 0.66))
        .setAlpha(Phaser.Math.FloatBetween(0.16, 0.7));
      this.tweens.add({
        targets: s, alpha: s.alpha * 0.3, duration: Phaser.Math.Between(1800, 3600),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2200)
      });
    }

    this.add.image(W / 2, 300, 'wyd_cross').setDepth(6).setScale(0.5).setAlpha(0.7);
    [[54, 400], [336, 396], [120, 440], [286, 444]].forEach((c) => {
      const cd = this.add.image(c[0], c[1], 'candle_small').setDepth(20).setScale(1.0);
      this.tweens.add({ targets: cd, alpha: 0.55, duration: 1600, yoyo: true, repeat: -1 });
    });

    /* 수많은 침낭 */
    for (let r = 0; r < 5; r++) {
      this.add.image(W / 2, 470 + r * 44, 'sleep_row')
        .setDepth(30 + r).setScale(1.0 - r * 0.02).setTint(0x27314c).setAlpha(0.92);
    }

    this.mat = this.add.image(196, 700, 'mat_ground').setDepth(690).setScale(1.0);
    this.me = this.add.image(168, 692, 'player_front').setDepth(700).setScale(1.2).setAngle(-90);
    this.carlo = this.add.image(232, 704, 'carlo_front').setDepth(701).setScale(1.2).setAngle(-90);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1100, [8, 10, 18]);

    this.time.delayedCall(800, () => {
      this.dialogue.play(DAY06.sleep.open, () => this.battery());
    });
  }

  /* 야간 이벤트 1 — 배터리 2% */
  battery() {
    const W = GAME.WIDTH;
    const npc = this.add.image(320, 660, 'pilgrim_d').setDepth(660).setScale(1.2).setAlpha(0);
    this.tweens.add({ targets: npc, alpha: 1, duration: 600 });

    this.dialogue.play(DAY06.sleep.battery.ask, () => {
      const layer = this.add.container(0, 0).setDepth(300);
      let y = 300;
      DAY06.sleep.battery.opts.forEach((o, i) => {
        const b = UI.button(this, W / 2, y, W - 74, 58, o.label, () => {
          layer.destroy();
          SaveSystem.set('reflections.day6Battery', o.label);
          AudioSystem.select();
          this.dialogue.play(o.after, () => {
            this.tweens.add({
              targets: npc, alpha: 0, duration: 700,
              onComplete: () => { npc.destroy(); this.snore(); }
            });
          });
        }, { size: FONT.small });
        b.setAlpha(0);
        this.tweens.add({ targets: b, alpha: 1, duration: 300, delay: i * 110 });
        layer.add(b);
        y += 70;
      });
    });
  }

  /* 야간 이벤트 2 — 코골이 */
  snore() {
    const W = GAME.WIDTH;
    const z = this.add.text(300, 560, 'zZ', UI.style(24, '#8fa5c8')).setOrigin(0.5).setDepth(400).setAlpha(0);
    this.tweens.add({ targets: z, alpha: 0.9, y: 520, duration: 1400, yoyo: true, repeat: -1 });
    this.time.delayedCall(600, () => {
      this.dialogue.play(DAY06.sleep.snore, () => {
        this.tweens.add({ targets: z, alpha: 0, duration: 600, onComplete: () => z.destroy() });
        this.wideNight();
      });
    });
  }

  /* 서울의 밤 — 카메라가 천천히 위로 */
  wideNight() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.cameras.main.pan(W / 2, H / 2 - 120, 4000, 'Sine.easeInOut');
    this.time.delayedCall(1200, () => {
      this.dialogue.play(DAY06.sleep.night, () => {
        UI.fadeOut(this, 1600, () => this.scene.start('Day6DawnScene'), [4, 6, 12]);
      });
    });
  }
};
