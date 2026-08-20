/* 미니게임 · 우리 자리 — 하룻밤짜리 동네를 만듭니다. */

window.OurSpotScene = class OurSpotScene extends MiniGameScene {
  constructor() { super('OurSpotScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#8ea173', warm: true,
      title: DAY06.spot.title, hint: DAY06.spot.steps[0].task
    });
    this.titleText.setColor(PAL.cream);

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.step = 0;

    this.add.tileSprite(W / 2, H / 2, W, H, 'field_grass').setDepth(-40).setAlpha(0.9);

    /* 이웃들의 돗자리 */
    this.neighbours = [];
    [[76, 260, 0x7a5f8a], [300, 250, 0xc9553f], [86, 620, 0x4f7d6a], [306, 612, 0xd7a04f]].forEach((n) => {
      const m = this.add.image(n[0], n[1], 'mat_ground').setDepth(n[1]).setScale(0.86).setTint(n[2]);
      this.neighbours.push(m);
    });
    [[76, 232, 'pilgrim_c'], [300, 222, 'pilgrim_e'], [86, 592, 'pilgrim_b'], [306, 584, 'pilgrim_d']]
      .forEach((p) => this.add.image(p[0], p[1], p[2]).setDepth(p[1] + 1).setScale(1.06));

    /* 내 돗자리 — 처음에는 옆자리와 겹칩니다 */
    this.mat = this.add.image(255, 430, 'mat_ground').setDepth(430).setScale(1.0).setAlpha(0);
    this.me = this.add.image(150, 470, 'player_front').setDepth(470).setScale(1.3);
    this.carlo = this.add.image(226, 486, 'carlo_front').setDepth(486).setScale(1.3);

    this.time.delayedCall(500, () => this.dialogue.say([DAY06.spot.steps[0].task], () => this.matStep()));
  }

  /* 1 · 돗자리 펼치기 */
  matStep() {
    this.mat.setAlpha(1).setScale(0.2);
    this.tweens.add({ targets: this.mat, scale: 1, duration: 600, ease: 'Back.easeOut' });
    this.setHint('돗자리를 끌어 자리를 옮겨보세요.');

    this.mat.setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(this.mat);
    this.input.on('drag', this.matDrag = (p, obj, dx, dy) => {
      if (obj !== this.mat) return;
      obj.x = Phaser.Math.Clamp(dx, 100, 290);
      obj.y = Phaser.Math.Clamp(dy, 340, 520);
      obj.setDepth(obj.y);
    });
    this.input.on('dragend', this.matEnd = (p, obj) => {
      if (obj !== this.mat || this.step !== 0) return;
      const near = this.neighbours.some(n => Phaser.Math.Distance.Between(n.x, n.y, obj.x, obj.y) < 128);
      if (near) { AudioSystem.back(); this.setHint('조금만 더 이쪽으로.'); return; }
      this.step = 1;
      this.mat.disableInteractive();
      this.input.off('drag', this.matDrag);
      this.input.off('dragend', this.matEnd);
      AudioSystem.chime();
      this.setHint('');
      this.dialogue.play(DAY06.spot.steps[0].after, () => this.capStep());
    });
  }

  /* 2 · 날아가는 모자 잡기 */
  capStep() {
    this.setHint(DAY06.spot.steps[1].task);
    const cap = this.add.image(-30, 300, 'cap_item').setDepth(800).setScale(1.4);
    cap.setSize(70, 60);
    cap.setInteractive();
    this.tweens.add({
      targets: cap, x: GAME.WIDTH + 40, y: 260, duration: 3200, repeat: -1,
      onRepeat: () => { cap.x = -30; cap.y = 300; }
    });
    cap.on('pointerdown', () => {
      cap.disableInteractive();
      this.tweens.killTweensOf(cap);
      AudioSystem.found();
      this.tweens.add({
        targets: cap, x: this.me.x, y: this.me.y - 40, duration: 400,
        onComplete: () => {
          cap.destroy();
          this.setHint('');
          this.dialogue.play(DAY06.spot.steps[1].after, () => this.pegStep());
        }
      });
    });
  }

  /* 3 · 팩 찾기 */
  pegStep() {
    this.setHint(DAY06.spot.steps[2].task);
    const spots = [[110, 560], [280, 350], [200, 620], [96, 380]];
    const hit = Phaser.Math.Between(0, spots.length - 1);
    this.pegZones = [];
    spots.forEach((s, i) => {
      const z = this.add.zone(s[0], s[1], 90, 80).setOrigin(0.5).setInteractive().setDepth(700);
      const mark = this.add.text(s[0], s[1], '?', UI.style(22, PAL.cream)).setOrigin(0.5).setDepth(701).setAlpha(0.5);
      z.on('pointerup', () => {
        if (i !== hit) { AudioSystem.tap(); mark.setAlpha(0.15); return; }
        this.pegZones.forEach(o => { o.z.destroy(); o.mark.destroy(); });
        AudioSystem.found();
        this.setHint('');
        this.dialogue.play(DAY06.spot.steps[2].after, () => this.trashStep());
      });
      this.pegZones.push({ z: z, mark: mark });
    });
  }

  /* 4 · 날리는 쓰레기 */
  trashStep() {
    this.setHint(DAY06.spot.steps[3].task);
    let left = 3;
    for (let i = 0; i < 3; i++) {
      const t = this.add.image(Phaser.Math.Between(60, 330), Phaser.Math.Between(300, 600), 'trash_bit')
        .setDepth(800).setScale(1.5);
      t.setSize(56, 52);
      t.setInteractive();
      this.tweens.add({
        targets: t, x: t.x + Phaser.Math.Between(-70, 70), y: t.y + Phaser.Math.Between(-50, 50),
        duration: 1600 + i * 240, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
      t.on('pointerdown', () => {
        t.disableInteractive();
        this.tweens.killTweensOf(t);
        AudioSystem.tap();
        this.tweens.add({
          targets: t, alpha: 0, scale: 0.6, duration: 300,
          onComplete: () => {
            t.destroy();
            left--;
            if (left === 0) {
              this.setHint('');
              this.dialogue.play(DAY06.spot.steps[3].after, () => this.finish());
            }
          }
        });
      });
    }
  }

  finish() {
    /* 네 나라의 돗자리가 이웃이 됩니다 */
    this.neighbours.forEach((n, i) => {
      this.tweens.add({
        targets: n, x: this.mat.x + [-116, 116, -108, 108][i], y: this.mat.y + [-124, -132, 128, 122][i],
        duration: 1200, ease: 'Sine.easeInOut'
      });
    });
    this.time.delayedCall(1400, () => {
      SaveSystem.set('reflections.day6Spot', true);
      this.dialogue.play(DAY06.spot.done, () => this.complete(['하룻밤짜리 동네가 생겼다.']));
    });
  }
};
