/* DAY 6 · 새벽과 파견미사 — 미사는 게임이 되지 않습니다. */

window.Day6DawnScene = class Day6DawnScene extends Phaser.Scene {
  constructor() { super('Day6DawnScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day6DawnScene', {});
    AudioSystem.setAmbience('none');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#1f2b4d');

    this.add.image(W / 2, 0, 'sky_dawn').setOrigin(0.5, 0).setDisplaySize(W, 460).setDepth(-40);
    this.add.tileSprite(W / 2, 650, W, 400, 'field_grass').setDepth(-30).setAlpha(0.85);

    this.sun = this.add.graphics().setDepth(-35);
    this.sun.fillStyle(0xf8dda6, 0.9); this.sun.fillCircle(W / 2 + 90, 430, 34);
    this.sun.setAlpha(0.5);

    for (let r = 0; r < 4; r++) {
      this.add.image(W / 2, 470 + r * 44, 'sleep_row')
        .setDepth(10 + r).setScale(0.98 - r * 0.02).setTint(0x6a6f80).setAlpha(0.9);
    }
    this.add.image(W / 2, 330, 'wyd_cross').setDepth(6).setScale(0.55).setAlpha(0.8);

    this.mat = this.add.image(196, 690, 'mat_ground').setDepth(680).setScale(1.0);
    this.me = this.add.image(168, 682, 'player_front').setDepth(690).setScale(1.2).setAngle(-90);
    this.carlo = this.add.image(232, 694, 'carlo_front').setDepth(691).setScale(1.2).setAngle(-90);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1400, [4, 6, 12]);

    this.tweens.add({ targets: this.sun, alpha: 1, duration: 6000 });

    this.time.delayedCall(1000, () => {
      this.dialogue.play(DAY06.dawn.open, () => {
        this.me.setAngle(0).setY(660);
        this.scene.launch('MorningScene', { from: this.scene.key });
        this.scene.pause();
      });
    });
  }

  onMiniGameDone(key) {
    if (key !== 'MorningScene') return;
    this.time.delayedCall(400, () => this.wait());
  }

  wait() {
    this.carlo.setAngle(0).setY(672);
    this.dialogue.play(DAY06.mass.wait, () => {
      UI.fadeOut(this, 1200, () => this.montage(), [8, 10, 18]);
    });
  }

  /* 파견미사 몽타주 — 열다섯 컷 */
  montage() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.children.list.slice().forEach(o => o.destroy());
    this.cameras.main.setBackgroundColor('#0d1524');
    this.cameras.main.fadeIn(900, 8, 10, 18);
    this.dialogue = new DialogueBox(this);
    AudioSystem.bell();

    const label = this.add.text(W / 2, H * 0.68, '', UI.style(19, '#dfd2bd', {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(30).setAlpha(0);

    const cuts = DAY06.mass.montage;
    let i = 0;
    const next = () => {
      if (i >= cuts.length) {
        this.time.delayedCall(700, () => {
          this.dialogue.say(DAY06.mass.end, () => {
            UI.fadeOut(this, 1100, () => this.scene.start('Day6MissionScene'), [8, 10, 18]);
          });
        });
        return;
      }
      const art = this.drawCut(i);
      label.setText(cuts[i]).setAlpha(0);
      art.setAlpha(0);
      this.tweens.add({ targets: [art, label], alpha: 1, duration: 600 });
      i++;
      this.time.delayedCall(1300, () => {
        this.tweens.add({
          targets: [art, label], alpha: 0, duration: 500,
          onComplete: () => { art.destroy(); next(); }
        });
      });
    };
    this.time.delayedCall(700, next);
  }

  drawCut(i) {
    const W = GAME.WIDTH, cy = GAME.HEIGHT * 0.40;
    const c = this.add.container(0, 0).setDepth(20);

    if (i === 0) {                                   /* 아침 해 */
      const g = this.add.graphics();
      g.fillStyle(0xf8dda6, 0.9); g.fillCircle(W / 2, cy, 56);
      g.fillStyle(0xf3b073, 0.4); g.fillCircle(W / 2, cy, 88);
      c.add(g);
    } else if (i === 1) {                            /* 순례자들의 얼굴 */
      ['pilgrim_a', 'pilgrim_c', 'pilgrim_e'].forEach((k, n) =>
        c.add(this.add.image(90 + n * 105, cy, k).setScale(2.0)));
    } else if (i === 2) {
      c.add(this.add.image(W / 2, cy, 'wyd_cross').setScale(0.9));
    } else if (i === 3) {
      c.add(this.add.image(W / 2, cy, 'bible_book').setScale(2.2));
    } else if (i === 4) {
      c.add(this.add.image(W / 2, cy, 'altar_far').setScale(1.3));
    } else if (i === 5) {
      for (let r = 0; r < 3; r++)
        c.add(this.add.image(W / 2, cy - 30 + r * 46, 'sleep_row').setScale(0.9 - r * 0.05).setAlpha(0.9));
    } else if (i >= 6 && i <= 11) {                  /* 지우·루카·마리아·레아·나·가롤로 */
      const kinds = ['child_front', 'pilgrim_e', 'pilgrim_a', 'pilgrim_c', 'player_front', 'carlo_front'];
      c.add(this.add.image(W / 2, cy, kinds[i - 6]).setScale(3.2));
    } else if (i === 12) {
      for (let r = 0; r < 4; r++)
        c.add(this.add.image(W / 2, cy - 40 + r * 44, 'crowd_row').setScale(0.95 - r * 0.05).setAlpha(0.9));
    } else if (i === 13) {                           /* 성가 */
      ['♪', '♫', '♩', '♪'].forEach((n, k) =>
        c.add(this.add.text(80 + k * 78, cy - 40 + (k % 2) * 60, n, UI.style(30, PAL.sun))
          .setOrigin(0.5).setAlpha(0.9)));
    } else {                                         /* 하늘 */
      c.add(this.add.image(W / 2, cy, 'sky_dawn').setDisplaySize(W - 50, 240));
    }
    return c;
  }
};
