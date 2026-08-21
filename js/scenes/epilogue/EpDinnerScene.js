/* EPILOGUE 3 · 저녁 식사 — 나라별로 앉아 있던 자리가 조금씩 섞입니다. */

window.EpDinnerScene = class EpDinnerScene extends Phaser.Scene {
  constructor() { super('EpDinnerScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('EpDinnerScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#2b2340');

    this.add.image(W / 2, 0, 'epi_sky_evening').setOrigin(0.5, 0).setDisplaySize(W, 380).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0x6a5c50, 1); g.fillRect(0, 360, W, H - 360);
    g.fillStyle(0x7a6a5c, 1); g.fillRect(0, 360, W, 12);

    this.add.image(70, 360, 'church_front').setOrigin(0.5, 1).setDepth(2).setScale(0.75).setAlpha(0.9);
    this.add.image(120, 250, 'epi_lights').setDepth(5).setScale(1.0).setAlpha(0.85);
    this.add.image(300, 292, 'epi_lights').setDepth(5).setScale(1.0).setAlpha(0.85);

    /* 긴 테이블 셋 */
    this.tables = [430, 560, 690].map((y, i) =>
      this.add.image(W / 2, y, 'epi_long_table').setDepth(y).setScale(0.92));

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1100, [232, 190, 150]);

    this.time.delayedCall(900, () => {
      UI.caption(this, EPI.dinner.caption, {
        y: H * 0.22, hold: 1200,
        onDone: () => this.dialogue.play(EPI.dinner.open, () => this.seatByCountry())
      });
    });
  }

  /* 처음에는 나라끼리 모여 앉습니다 */
  seatByCountry() {
    const W = GAME.WIDTH;
    const rows = [
      { y: 392, tex: ['player_front', 'friend_front', 'child_front', 'resident_front'] },
      { y: 522, tex: ['epi_ita_front', 'epi_ita_front', 'epi_phi_front', 'epi_phi_front'] },
      { y: 652, tex: ['epi_fra_front', 'epi_leo_front', 'epi_bra_front', 'epi_spa_front'] }
    ];
    this.seats = [];
    rows.forEach((r, ri) => {
      r.tex.forEach((t, i) => {
        const x = 62 + i * 90;
        const img = this.add.image(x, r.y, t).setDepth(r.y - 2).setScale(1.3).setAlpha(0);
        this.tweens.add({ targets: img, alpha: 1, duration: 500, delay: (ri * 4 + i) * 120 });
        this.tweens.add({ targets: img, y: r.y - 3, duration: 900 + i * 90, yoyo: true, repeat: -1, delay: 600 });
        this.seats.push({ img: img, row: ri, col: i, x: x, y: r.y });
      });
    });

    this.time.delayedCall(2600, () => this.mixing(0));
  }

  /* 한 줄씩, 누군가 자리를 옮깁니다 */
  mixing(i) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    if (i >= EPI.dinner.mixing.length) { this.mixed(); return; }

    const t = this.add.text(W / 2, 200, EPI.dinner.mixing[i], UI.style(17, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 500 });
    AudioSystem.step();

    /* 실제로 두 사람이 자리를 바꿉니다 */
    const a = this.seats[Phaser.Math.Between(0, 3)];
    const b = this.seats[Phaser.Math.Between(4, 11)];
    if (a && b) {
      const ax = a.img.x, ay = a.img.y, bx = b.img.x, by = b.img.y;
      this.tweens.add({ targets: a.img, x: bx, y: by, duration: 900, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: b.img, x: ax, y: ay, duration: 900, ease: 'Sine.easeInOut' });
      a.img.setDepth(by - 2); b.img.setDepth(ay - 2);
    }

    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: t, alpha: 0, duration: 500,
        onComplete: () => { t.destroy(); this.mixing(i + 1); }
      });
    });
  }

  mixed() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const t = this.add.text(W / 2, 210, EPI.dinner.mixed, UI.style(21, PAL.sun))
      .setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 800 });
    AudioSystem.chime();

    /* 카메라가 테이블을 따라 천천히 흐릅니다 */
    this.time.delayedCall(1600, () => {
      this.tweens.add({ targets: t, alpha: 0, duration: 700, onComplete: () => t.destroy() });
      this.around(0);
    });
  }

  /* 한 번에 한 인상씩 — 겹치면 아무것도 읽히지 않습니다 */
  around(i) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    if (i === 0) {
      this.aroundPlate = this.add.graphics().setDepth(299).setAlpha(0);
      this.aroundPlate.fillStyle(0x101a2e, 0.5);
      this.aroundPlate.fillRoundedRect(70, 214, W - 140, 56, 18);
      this.tweens.add({ targets: this.aroundPlate, alpha: 1, duration: 500 });
    }
    if (i >= EPI.dinner.around.length) {
      this.tweens.add({
        targets: this.aroundPlate, alpha: 0, duration: 600,
        onComplete: () => this.aroundPlate.destroy()
      });
      this.monolog();
      return;
    }

    const t = this.add.text(W / 2, 242, EPI.dinner.around[i], UI.style(18, PAL.cream))
      .setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 350 });
    this.time.delayedCall(900, () => {
      this.tweens.add({
        targets: t, alpha: 0, duration: 350,
        onComplete: () => { t.destroy(); this.around(i + 1); }
      });
    });
  }

  monolog() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.time.delayedCall(1400, () => {
      this.dialogue.play([
        { t: '조용히 주변을 바라본다.' },
        { s: '나', t: EPI.dinner.monolog1 },
        { t: '잠시.' },
        { s: '나', t: EPI.dinner.monolog2 }
      ], () => this.family());
    });
  }

  family() {
    this.dialogue.play(EPI.dinner.family, () => {
      this.dialogue.say([EPI.dinner.goWater], () => {
        UI.fadeOut(this, 1000, () => this.scene.start('EpCarloScene'), [20, 24, 40]);
      });
    });
  }
};
