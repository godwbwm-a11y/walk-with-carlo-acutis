/* 미니게임 · 별 하나, 기도 하나 — 최대 세 사람. 고르지 않아도 됩니다. */

window.StarPrayerScene = class StarPrayerScene extends MiniGameScene {
  constructor() { super('StarPrayerScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#131e3c',
      title: DAY06.star.title, hint: DAY06.star.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.picked = [];
    this.stars = [];

    this.add.image(W / 2, 0, 'sky_vigil').setOrigin(0.5, 0).setDisplaySize(W, H).setDepth(-40);

    /* 배경의 작은 별들 */
    for (let i = 0; i < 60; i++) {
      const s = this.add.image(Phaser.Math.Between(8, W - 8), Phaser.Math.Between(110, 520), 'star_bright')
        .setDepth(-30).setScale(Phaser.Math.FloatBetween(0.28, 0.6)).setAlpha(Phaser.Math.FloatBetween(0.2, 0.6));
      this.tweens.add({
        targets: s, alpha: s.alpha * 0.35, duration: Phaser.Math.Between(1400, 3200),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 1800)
      });
    }

    /* 아래쪽에 누워 있는 두 사람 */
    this.add.image(150, 700, 'mat_ground').setDepth(20).setScale(0.9);
    this.add.image(150, 690, 'player_front').setDepth(21).setScale(1.15).setAngle(-90);
    this.add.image(214, 700, 'carlo_front').setDepth(22).setScale(1.15).setAngle(-90);

    this.time.delayedCall(500, () => this.ask());
  }

  ask() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.setHint(DAY06.star.hint);

    const layer = this.add.container(0, 0).setDepth(200);
    this.layer = layer;
    const scrim = this.add.graphics();
    scrim.fillStyle(0x080e1f, 0.9); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    const list = this.add.container(0, 0);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, 150, W, 500);
    list.setMask(shape.createGeometryMask());
    layer.add(list);

    let y = 186;
    DAY06.star.people.forEach((p) => {
      const taken = this.picked.some(o => o.who === p);
      const b = UI.button(this, W / 2, y, W - 72, 54, p, () => { if (!taken) this.choose(p); },
        { size: FONT.small, alpha: taken ? 0.35 : 1 });
      list.add(b);
      y += 62;
    });

    const max = Math.max(0, y - 630);
    this.input.off('pointermove', this.scrollFn);
    this.scrollFn = (p) => {
      if (!p.isDown || !this.layer || p.y < 154 || p.y > 646) return;
      const dy = p.y - (this.lastY === undefined ? p.y : this.lastY);
      this.lastY = p.y;
      list.y = Phaser.Math.Clamp(list.y + dy, -max, 0);
    };
    this.input.on('pointermove', this.scrollFn);
    this.input.on('pointerup', () => { this.lastY = undefined; });

    /* 이미 하나라도 골랐으면 그만둘 수 있습니다 */
    if (this.picked.length > 0) {
      layer.add(UI.button(this, W / 2, H - 96, 250, 56, DAY06.star.doneBtn, () => this.finish(),
        { size: FONT.small, fill: PAL.sun }));
    }
  }

  choose(who) {
    if (this.layer) { this.layer.destroy(); this.layer = null; }
    AudioSystem.select();
    this.askName(who);
  }

  /* 이름을 적어도 되고, 마음에만 담아도 됩니다 */
  askName(who) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(200);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x080e1f, 0.92); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 190, who, UI.style(24, PAL.sun)).setOrigin(0.5));

    const field = TextInput.open(this, {
      x: W / 2, y: 300, width: W - 76, height: 96,
      placeholder: DAY06.star.placeholder, depth: 1200
    });

    const done = (save) => {
      let name = null;
      if (save && field) { const v = field.value(); if (v) name = v; }
      if (field) field.destroy();
      layer.destroy();
      this.place(who, name);
    };

    if (field) {
      layer.add(UI.button(this, W / 2, 420, 260, 58, DAY06.star.nameBtn, () => done(true),
        { size: FONT.small, fill: PAL.sun }));
      layer.add(UI.button(this, W / 2, 492, 260, 54, DAY06.star.keepBtn, () => done(false),
        { size: FONT.small }));
      this.time.delayedCall(250, () => field.focus());
    } else {
      layer.add(UI.button(this, W / 2, 360, 260, 58, DAY06.star.keepBtn, () => done(false),
        { size: FONT.small, fill: PAL.sun }));
    }
  }

  /* 밤하늘에 별 하나가 남습니다 */
  place(who, name) {
    const i = this.picked.length;
    this.picked.push({ who: who, name: name });

    const x = 90 + i * 105, y = 250 + (i % 2) * 60;
    const s = this.add.image(x, y, 'star_bright').setDepth(60).setScale(0.4).setAlpha(0);
    this.tweens.add({ targets: s, alpha: 1, scale: 1.5, duration: 900, ease: 'Sine.easeOut' });
    const label = this.add.text(x, y + 42, name || who, UI.style(14, PAL.cream, {
      align: 'center', wordWrap: { width: 100 }
    })).setOrigin(0.5, 0).setDepth(60).setAlpha(0);
    this.tweens.add({ targets: label, alpha: 0.95, duration: 900, delay: 300 });
    this.stars.push(s);
    AudioSystem.found();

    this.time.delayedCall(1400, () => {
      if (this.picked.length >= 3) { this.finish(); return; }
      this.setHint(DAY06.star.more);
      const W = GAME.WIDTH, H = GAME.HEIGHT;
      const a = UI.button(this, W / 2, H - 174, 250, 58, DAY06.star.moreBtn, () => {
        a.destroy(); b.destroy(); this.ask();
      }, { size: FONT.small, fill: PAL.sun });
      const b = UI.button(this, W / 2, H - 104, 250, 54, DAY06.star.doneBtn, () => {
        a.destroy(); b.destroy(); this.finish();
      }, { size: FONT.small });
      [a, b].forEach(o => o.setDepth(210));
    });
  }

  finish() {
    if (this.layer) { this.layer.destroy(); this.layer = null; }
    SaveSystem.set('reflections.day6Stars', this.picked.slice());
    this.setHint('');

    /* 카메라가 멀어집니다 */
    this.time.delayedCall(500, () => {
      this.dialogue.play(DAY06.star.talk, () => {
        for (let i = 0; i < 40; i++) {
          const s = this.add.image(Phaser.Math.Between(8, GAME.WIDTH - 8), Phaser.Math.Between(120, 460),
            'star_bright').setDepth(50).setScale(0.5).setAlpha(0);
          this.tweens.add({ targets: s, alpha: 0.8, duration: 900, delay: i * 40 });
        }
        this.add.image(GAME.WIDTH / 2, 640, 'sleep_row').setDepth(55).setScale(1.0).setAlpha(0.6);
        this.time.delayedCall(1800, () => {
          this.setHint(DAY06.star.wide);
          this.time.delayedCall(1600, () => { this.setHint(''); this.complete([DAY06.star.wide]); });
        });
      });
    });
  }
};
