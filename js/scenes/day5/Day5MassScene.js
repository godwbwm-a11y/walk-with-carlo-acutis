/* DAY 5 · 개막미사 — 조작도, 카드 획득도, 점수도 없습니다.
   DAY 3 과 같은 원칙입니다. 열두 컷의 몽타주와 침묵뿐입니다. */

window.Day5MassScene = class Day5MassScene extends Phaser.Scene {
  constructor() { super('Day5MassScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day5MassScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#1d2c4e');

    this.add.image(W / 2, 0, 'sky_evening').setOrigin(0.5, 0).setDisplaySize(W, 420).setDepth(-30);
    const g = this.add.graphics().setDepth(-20);
    g.fillStyle(0x9a8a76, 1); g.fillRect(0, 400, W, H - 400);
    g.fillStyle(0xa8977f, 1); g.fillRect(0, 400, W, 12);

    /* 한 방향으로 걷는 사람들 */
    this.walkers = [];
    for (let i = 0; i < 14; i++) {
      const x = Phaser.Math.Between(20, W - 20);
      const y = Phaser.Math.Between(450, 700);
      const k = ['pilgrim_a', 'pilgrim_b', 'pilgrim_c', 'pilgrim_d', 'pilgrim_e', 'pilgrim_f'][i % 6];
      const img = this.add.image(x, y, k + '_back').setDepth(y).setScale(0.9 + (y - 450) / 700);
      this.tweens.add({ targets: img, y: y - 26, duration: 4200 + i * 200, repeat: -1, yoyo: false });
      this.walkers.push(img);
    }
    this.me = this.add.image(150, 730, 'player_back').setDepth(730).setScale(1.4);
    this.carlo = this.add.image(232, 740, 'carlo_back').setDepth(740).setScale(1.4);
    this.bob = this.tweens.add({ targets: [this.me, this.carlo], y: '-=4', duration: 800, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1100, [40, 44, 70]);

    this.time.delayedCall(900, () => {
      this.dialogue.play(DAY05.mass.walk, () => this.pullBack());
    });
  }

  /* 카메라가 멀어졌다가 미사로 */
  pullBack() {
    if (this.bob) { this.bob.stop(); this.bob = null; }
    this.tweens.add({
      targets: [this.me, this.carlo], scale: 0.9, y: '-=40', alpha: 0.85, duration: 2000, ease: 'Sine.easeInOut'
    });
    this.time.delayedCall(2200, () => {
      UI.fadeOut(this, 1200, () => this.montage(), [8, 10, 18]);
    });
  }

  /* 열두 컷 — 누르지 않아도 지나갑니다 */
  montage() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.children.list.slice().forEach(o => o.destroy());
    this.cameras.main.setBackgroundColor('#0d1524');
    this.cameras.main.fadeIn(900, 8, 10, 18);
    AudioSystem.setAmbience('none');
    AudioSystem.bell();

    this.dialogue = new DialogueBox(this);

    const stageBox = this.add.container(W / 2, H * 0.42).setDepth(20);
    this.stageBox = stageBox;
    const label = this.add.text(W / 2, H * 0.68, '', UI.style(19, '#dfd2bd', {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(30).setAlpha(0);

    const cuts = DAY05.mass.montage;
    let i = 0;
    const next = () => {
      if (i >= cuts.length) { this.time.delayedCall(900, () => this.smallOne()); return; }
      const art = this.drawCut(i);
      label.setText(cuts[i]);
      label.setAlpha(0);
      art.setAlpha(0);
      this.tweens.add({ targets: [art, label], alpha: 1, duration: 700 });
      i++;
      this.time.delayedCall(1500, () => {
        this.tweens.add({
          targets: [art, label], alpha: 0, duration: 600,
          onComplete: () => { art.destroy(); next(); }
        });
      });
    };
    this.time.delayedCall(700, next);
  }

  /* 컷마다 간단한 그림 하나 */
  drawCut(i) {
    const W = GAME.WIDTH, cy = GAME.HEIGHT * 0.40;
    const c = this.add.container(0, 0).setDepth(20);

    if (i === 0) {
      const s = this.add.image(W / 2, cy - 60, 'sky_evening').setDisplaySize(W - 60, 200);
      c.add(s);
    } else if (i === 1 || i === 7) {
      for (let r = 0; r < 3; r++) {
        c.add(this.add.image(W / 2, cy - 40 + r * 46, 'crowd_row').setScale(0.9 - r * 0.06).setAlpha(0.9 - r * 0.15));
      }
    } else if (i >= 2 && i <= 6) {
      const kinds = ['child_front', 'pilgrim_b', 'pilgrim_c', 'pilgrim_d', 'pilgrim_a'];
      const img = this.add.image(W / 2, cy, kinds[i - 2]).setScale(3.2);
      c.add(img);
    } else if (i === 8) {
      c.add(this.add.image(W / 2, cy, 'bible_book').setScale(2.2));
    } else if (i === 9) {
      const g = this.add.graphics();
      g.fillStyle(HEX(PAL.sun), 0.9);
      g.fillRect(W / 2 - 9, cy - 80, 18, 160);
      g.fillRect(W / 2 - 46, cy - 34, 92, 18);
      c.add(g);
    } else if (i === 10) {
      c.add(this.add.image(W / 2, cy, 'altar_far').setScale(1.3));
    } else {
      const langs = ['Amen', '아멘', 'Amén', 'Amen', 'アーメン', 'Amin'];
      langs.forEach((t, k) => {
        c.add(this.add.text(W / 2 + (k % 2 === 0 ? -80 : 80), cy - 70 + k * 30, t,
          UI.style(17, '#cbd8ea')).setOrigin(0.5).setAlpha(0.9));
      });
    }
    return c;
  }

  /* 거대한 교회 안의 한 사람 */
  smallOne() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const rows = [];
    for (let r = 0; r < 5; r++) {
      const img = this.add.image(W / 2, 300 + r * 62, 'crowd_row')
        .setDepth(10 + r).setScale(1.05 - r * 0.04).setAlpha(0);
      this.tweens.add({ targets: img, alpha: 0.9, duration: 700, delay: r * 160 });
      rows.push(img);
    }
    this.add.image(W / 2, 220, 'altar_far').setDepth(5).setScale(0.9).setAlpha(0.85);

    const me = this.add.image(W / 2 - 40, 560, 'player_back').setDepth(40).setScale(0.9).setAlpha(0);
    this.tweens.add({ targets: me, alpha: 1, duration: 800, delay: 900 });

    this.time.delayedCall(1600, () => {
      this.dialogue.play(DAY05.mass.small, () => {
        UI.fadeOut(this, 1100, () => this.scene.start('Day5ThemeScene'), [8, 10, 18]);
      });
    });
  }
};
