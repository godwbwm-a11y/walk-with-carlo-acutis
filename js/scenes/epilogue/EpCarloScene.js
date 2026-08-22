/* EPILOGUE 4 · 익숙한 사람 — 가롤로는 다시 주인공이 되지 않습니다.
   한 문장만 남기고 교회를 가리킵니다. */

window.EpCarloScene = class EpCarloScene extends Phaser.Scene {
  constructor() { super('EpCarloScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('EpCarloScene', {});
    AudioSystem.setAmbience('none');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#1a2033');

    this.add.image(W / 2, 0, 'epi_sky_night').setOrigin(0.5, 0).setDisplaySize(W, 400).setDepth(-40);
    for (let i = 0; i < 40; i++) {
      const s = this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(20, 300), 'dot')
        .setDepth(-35).setScale(Phaser.Math.FloatBetween(0.14, 0.36))
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.7));
      this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(1800, 3400),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000) });
    }

    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0x4e4438, 1); g.fillRect(0, 380, W, H - 380);
    g.fillStyle(0x5c5142, 1); g.fillRect(0, 380, W, 12);

    /* 성당 입구 */
    this.add.image(W / 2 + 30, 384, 'church_front').setOrigin(0.5, 1).setDepth(4).setScale(1.15);
    const glow = this.add.image(W / 2 + 30, 330, 'lamp_glow').setDepth(3).setScale(1.6).setAlpha(0.22);
    this.tweens.add({ targets: glow, alpha: 0.4, duration: 2400, yoyo: true, repeat: -1 });

    /* 멀리 마당의 불빛과 사람들 */
    this.add.image(64, 300, 'epi_lights').setDepth(2).setScale(0.6).setAlpha(0.6);
    this.yard = [[40, 470], [96, 486], [150, 466]].map((p, i) => {
      const img = this.add.image(p[0], p[1], i === 1 ? 'epi_ita_front' : 'epi_phi_front')
        .setDepth(p[1]).setScale(1.0).setAlpha(0.55);
      this.tweens.add({ targets: img, y: p[1] - 3, duration: 1000 + i * 150, yoyo: true, repeat: -1 });
      return img;
    });

    this.me = this.add.image(120, 620, 'player_front').setDepth(620).setScale(1.4);
    this.bob = this.tweens.add({ targets: this.me, y: 616, duration: 950, yoyo: true, repeat: -1 });
    this.carlo = this.add.image(300, 520, 'carlo_front').setDepth(520).setScale(1.1).setAlpha(0);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1200, [20, 24, 40]);

    this.time.delayedCall(1000, () => {
      this.dialogue.play(EPI.carlo.see, () => this.reveal());
    });
  }

  reveal() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.tweens.add({ targets: this.carlo, alpha: 1, duration: 1400 });

    const t = this.add.text(W / 2, H * 0.24, EPI.carlo.name, UI.style(30, PAL.sun))
      .setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 1200, delay: 700 });
    AudioSystem.bell();

    this.time.delayedCall(3400, () => {
      this.tweens.add({
        targets: t, alpha: 0, duration: 800,
        onComplete: () => { t.destroy(); this.run(); }
      });
    });
  }

  run() {
    if (this.bob) this.bob.stop();
    this.tweens.add({
      targets: this.me, x: 236, y: 556, duration: 1200, ease: 'Sine.easeInOut',
      onComplete: () => { this.me.setDepth(556); }
    });
    this.time.delayedCall(1300, () => {
      this.dialogue.play(EPI.carlo.run, () => {
        this.dialogue.play(EPI.carlo.look, () => {
          this.dialogue.play(EPI.carlo.strange, () => this.core());
        });
      });
    });
  }

  /* “그게 교회야.” */
  core() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const veil = this.add.graphics().setDepth(290).setAlpha(0);
    veil.fillStyle(0x101a2e, 0.8); veil.fillRect(0, 0, W, H);
    this.tweens.add({ targets: veil, alpha: 1, duration: 900 });

    const t = this.add.text(W / 2, H * 0.30, EPI.carlo.core, UI.style(32, PAL.sun))
      .setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 1200, delay: 500 });
    AudioSystem.bell();

    this.time.delayedCall(3200, () => {
      this.tweens.add({
        targets: t, alpha: 0, duration: 700,
        onComplete: () => {
          t.destroy();
          this.dialogue.play(EPI.carlo.coreAsk, () => this.coreLines(veil, 0, []));
        }
      });
    });
  }

  coreLines(veil, i, made) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    if (i >= EPI.carlo.coreLines.length) {
      this.time.delayedCall(2400, () => {
        this.tweens.add({
          targets: made.concat([veil]), alpha: 0, duration: 900,
          onComplete: () => {
            made.forEach(o => o.destroy()); veil.destroy();
            this.dialogue.play(EPI.carlo.building, () => this.people());
          }
        });
      });
      return;
    }
    const t = this.add.text(W / 2, 250 + i * 52, EPI.carlo.coreLines[i], UI.style(23, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 700 });
    AudioSystem.tap();
    made.push(t);
    this.time.delayedCall(1300, () => this.coreLines(veil, i + 1, made));
  }

  /* 카메라가 마당의 사람들을 비춥니다 */
  people() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.tweens.add({ targets: this.yard, alpha: 1, scale: 1.3, duration: 1400 });

    const t = this.add.text(W / 2, H * 0.26, EPI.carlo.people, UI.style(26, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5).setDepth(300).setAlpha(0);
    const plate = this.add.graphics().setDepth(299).setAlpha(0);
    plate.fillStyle(0x101a2e, 0.7);
    plate.fillRoundedRect(24, H * 0.26 - 44, W - 48, 88, 20);

    this.tweens.add({ targets: [t, plate], alpha: 1, duration: 1300, delay: 800 });
    AudioSystem.chime();

    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: [t, plate], alpha: 0, duration: 900,
        onComplete: () => {
          t.destroy(); plate.destroy();
          UI.fadeOut(this, 1200, () => this.scene.start('EpChurchScene'), [20, 26, 44]);
        }
      });
    });
  }
};
