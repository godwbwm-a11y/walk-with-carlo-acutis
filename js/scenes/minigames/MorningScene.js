/* 미니게임 · 아침이다! — 내 물건을 찾고, 우리가 머문 자리를 정리합니다. 점수는 없습니다. */

window.MorningScene = class MorningScene extends MiniGameScene {
  constructor() { super('MorningScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#c9a98a', warm: true,
      title: DAY06.morning.title, hint: DAY06.morning.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.found = 0;
    this.trashLeft = 0;
    this.sockShown = false;

    this.add.image(W / 2, 0, 'sky_dawn').setOrigin(0.5, 0).setDisplaySize(W, 300).setDepth(-40);
    this.add.tileSprite(W / 2, 570, W, 550, 'field_grass').setDepth(-30).setAlpha(0.85);

    /* 아직 자는 사람들 */
    this.add.image(W / 2, 330, 'sleep_row').setDepth(1).setScale(0.9).setAlpha(0.8);
    this.add.image(150, 690, 'mat_ground').setDepth(2).setScale(1.0);

    this.me = this.add.image(300, 640, 'player_front').setDepth(640).setScale(1.28);
    this.carlo = this.add.image(352, 660, 'carlo_front').setDepth(660).setScale(1.24);

    /* 섞여 있는 물건들 */
    this.items = [];
    const spots = [
      [70, 400], [180, 388], [292, 404], [64, 486], [176, 496],
      [300, 484], [88, 568], [206, 576], [318, 566], [140, 640]
    ];
    const pool = [];
    DAY06.morning.mine.forEach(n => pool.push({ label: n, mine: true }));
    DAY06.morning.others.forEach(n => pool.push({ label: n, mine: false }));
    Phaser.Utils.Array.Shuffle(pool);

    pool.slice(0, spots.length).forEach((it, i) => {
      const tex = this.texFor(it.label);
      const c = this.add.container(spots[i][0], spots[i][1]).setDepth(300 + i);
      const img = this.add.image(0, -6, tex).setScale(1.25);
      c.add(img);
      const t = this.add.text(0, 26, it.label, UI.style(12, PAL.ink, {
        align: 'center', wordWrap: { width: 96 }
      })).setOrigin(0.5, 0);
      c.add(t);
      c.setSize(96, 76);
      c.setInteractive();
      c.info = it;
      c.on('pointerup', () => this.tap(c));
      this.items.push(c);
    });

    this.counter = this.add.text(W - 22, 122, '', UI.style(FONT.small, PAL.cream))
      .setOrigin(1, 0.5).setDepth(70);
    this.refresh();
  }

  texFor(label) {
    if (label.indexOf('운동화') >= 0) return 'shoe_item';
    if (label.indexOf('물병') >= 0) return 'water_bottle';
    if (label.indexOf('모자') >= 0) return 'cap_item';
    if (label.indexOf('노트') >= 0) return 'note_small';
    if (label.indexOf('양말') >= 0) return 'sock_item';
    return 'big_backpack';
  }

  refresh() {
    const total = this.items ? this.items.filter(c => c.info.mine).length : 0;
    this.counter.setText('찾은 내 물건  ' + this.found + ' / ' + total);
  }

  tap(c) {
    if (c.taken) return;

    if (!c.info.mine) {
      AudioSystem.tap();
      this.tweens.add({ targets: c, angle: 6, duration: 90, yoyo: true, repeat: 1 });
      if (c.info.label.indexOf('양말') >= 0 && !this.sockShown) {
        this.sockShown = true;
        this.dialogue.play(DAY06.morning.sock);
      }
      return;
    }

    c.taken = true;
    c.disableInteractive();
    this.found++;
    this.refresh();
    AudioSystem.found();
    this.tweens.add({
      targets: c, x: this.me.x, y: this.me.y - 30, alpha: 0, scale: 0.6, duration: 500,
      onComplete: () => c.destroy()
    });

    if (this.found >= this.items.filter(o => o.info.mine).length) {
      this.time.delayedCall(700, () => this.trashStep());
    }
  }

  /* 자기 것만 치우지 않아도 됩니다 */
  trashStep() {
    const W = GAME.WIDTH;
    this.setHint(DAY06.morning.trashHint);
    this.trashLeft = 5;
    this.picked = 0;

    for (let i = 0; i < 5; i++) {
      const t = this.add.image(Phaser.Math.Between(50, W - 50), Phaser.Math.Between(380, 620), 'trash_bit')
        .setDepth(400).setScale(1.4);
      t.setSize(56, 52);
      t.setInteractive();
      t.on('pointerdown', () => {
        t.disableInteractive();
        this.picked++;
        AudioSystem.tap();
        this.tweens.add({
          targets: t, x: this.carlo.x, y: this.carlo.y - 20, alpha: 0, duration: 400,
          onComplete: () => t.destroy()
        });
        if (this.picked >= 5) this.finish();
      });
    }

    /* 다 줍지 않아도 넘어갈 수 있습니다 */
    this.doneBtn = UI.button(this, W / 2, GAME.HEIGHT - 96, 250, 56, DAY06.morning.doneBtn,
      () => this.finish(), { size: FONT.small, fill: PAL.sun });
    this.doneBtn.setDepth(500);
  }

  finish() {
    if (this.finished) return;
    if (this.doneBtn) { this.doneBtn.destroy(); this.doneBtn = null; }
    SaveSystem.set('reflections.day6Trash', this.picked || 0);
    this.setHint('');
    this.complete([DAY06.morning.trashDone]);
  }
};
