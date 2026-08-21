/* DAY 3 · 성당 — 마당에서 미사, 그리고 미사 후 */

window.Day3ChurchScene = class Day3ChurchScene extends Phaser.Scene {
  constructor() { super('Day3ChurchScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day3ChurchScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#cfd6dd');

    /* 성당 마당 */
    this.yard = this.add.container(0, 0);
    this.yard.add(this.add.image(W / 2, 0, 'sky_morning').setOrigin(0.5, 0).setDisplaySize(W, 420));
    const g = this.add.graphics();
    g.fillStyle(0xc9d6c3, 1); g.fillRect(0, 400, W, 130);
    g.fillStyle(0xe8dcc6, 1); g.fillRect(0, 520, W, H - 520);
    g.fillStyle(0xdccfb6, 1); g.fillRect(0, 520, W, 10);
    this.yard.add(g);
    this.yard.add(this.add.image(W / 2 + 20, 530, 'church_front').setOrigin(0.5, 1).setScale(1.3));
    this.yard.add(this.add.image(56, 528, 'tree_big').setOrigin(0.5, 1).setScale(0.9));

    /* 들어가는 사람들 */
    [[70, 'villager_front'], [120, 'grandma_front'], [286, 'child_front'], [330, 'villager_back']]
      .forEach((p, i) => {
        const s = this.add.image(p[0], 570 + (i % 2) * 12, p[1]).setScale(1.05);
        this.yard.add(s);
        this.tweens.add({ targets: s, y: s.y - 4, duration: 1500 + i * 220, yoyo: true, repeat: -1 });
      });

    this.me = this.add.image(146, 604, 'player_back').setScale(1.25);
    this.carlo = this.add.image(212, 608, 'carlo_back').setScale(1.25);
    this.yard.add([this.me, this.carlo]);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1000, [230, 220, 205]);

    this.time.delayedCall(800, () => {
      this.dialogue.say(DAY03.yard.arrive, () => {
        this.dialogue.play(DAY03.yard.talk, () => {
          this.dialogue.play(DAY03.yard.part, () => {
            this.tweens.add({
              targets: this.carlo, x: 320, alpha: 0, duration: 1600,
              onComplete: () => this.dialogue.say(DAY03.yard.gone, () => this.beforeMass())
            });
          });
        });
      });
    });
  }

  /* 미사 전 — 휴대폰 */
  beforeMass() {
    const B = DAY03.beforeMass;
    this.dialogue.say(B.buzz, () => {
      this.dialogue.choose('', B.choices, (key) => {
        SaveSystem.set('reflections.day3Phone2', key);
        this.dialogue.say(B.reply[key], () => {
          this.dialogue.say(B.enter, () => this.startMass());
        });
      });
    });
  }

  /* ── 미사 — 조작도, 카드도, 점수도 없습니다 ── */
  startMass() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    AudioSystem.setAmbience('none');
    AudioSystem.stopPad();
    AudioSystem.bell();

    this.tweens.add({ targets: this.yard, alpha: 0, duration: 1200 });

    const black = this.add.graphics().setDepth(400);
    black.fillStyle(0x0d1018, 1); black.fillRect(0, 0, W, H);
    black.setAlpha(0);
    this.tweens.add({ targets: black, alpha: 1, duration: 1200 });

    this.time.delayedCall(1600, () => {
      this.yard.setVisible(false);
      this.shotLayer = this.add.container(0, 0).setDepth(420);
      this.playShots(0);
    });
  }

  /* 미사는 누를 때마다 한 장씩 넘어갑니다 — 저절로 휘 지나가지 않습니다 */
  playShots(i) {
    const shots = DAY03.mass.shots;
    if (i >= shots.length) { this.afterMass(); return; }

    const c = this.buildShot(shots[i].key);
    c.setAlpha(0);
    this.shotLayer.add(c);
    this.tweens.add({ targets: c, alpha: 1, duration: 700 });
    if (i === 6) AudioSystem.chime();

    UI.tapNext(this, () => {
      this.tweens.add({
        targets: c, alpha: 0, duration: 600,
        onComplete: () => { c.destroy(); this.playShots(i + 1); }
      });
    }, { depth: 940, delay: 700 });
  }

  buildShot(key) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const c = this.add.container(0, 0);
    const bg = this.add.graphics();
    bg.fillStyle(0x2b2534, 1); bg.fillRect(0, 0, W, H);
    c.add(bg);

    /* 창에서 비스듬히 내려오는 빛 */
    const beam = (x1, x2, alpha) => {
      const b = this.add.graphics();
      for (let i = 0; i < 4; i++) {
        b.fillStyle(0xffeccf, alpha || 0.10);
        b.fillPoints([
          { x: x1 - i * 4, y: 150 },
          { x: x2 + i * 8, y: 150 },
          { x: x2 + 70 + i * 14, y: H },
          { x: x1 + 40 + i * 8, y: H }
        ], true);
      }
      c.add(b);
    };

    if (key === 'window') {
      c.add(this.add.image(W / 2, H * 0.42, 'stained_glass').setScale(2.1));
      beam(120, 240, 0.08);
    } else if (key === 'people') {
      beam(70, 168, 0.08);
      [560, 640, 720].forEach((y, i) => c.add(this.add.image(W / 2, y, 'pew').setScale(1.35).setAlpha(0.95 - i * 0.06)));
      [[110, 520], [250, 520], [80, 600], [200, 600], [300, 600], [150, 680], [270, 680]]
        .forEach((p, i) => c.add(this.add.image(p[0], p[1], i % 3 === 0 ? 'villager_back' : 'player_back')
          .setScale(1.1).setAlpha(0.9).setTint(0x9a93aa)));
    } else if (key === 'book') {
      c.add(this.add.image(W / 2, H * 0.52, 'lamp_glow').setScale(1.6).setAlpha(0.4));
      c.add(this.add.image(W / 2, H * 0.5, 'bible_book').setScale(3.2));
      beam(140, 260, 0.07);
    } else if (key === 'me') {
      c.add(this.add.image(W / 2, 620, 'pew').setScale(1.5));
      c.add(this.add.image(W / 2, 560, 'player_back').setScale(1.7));
      beam(88, 184, 0.08);
    } else if (key === 'altar') {
      c.add(this.add.image(W / 2, H * 0.40, 'lamp_glow').setScale(2.2).setAlpha(0.35));
      c.add(this.add.image(W / 2, H * 0.44, 'altar').setScale(1.6));
      c.add(this.add.image(76, H * 0.52, 'candle_stand').setScale(1.0));
      c.add(this.add.image(W - 76, H * 0.52, 'candle_stand').setScale(1.0));
    } else if (key === 'glass') {
      c.add(this.add.image(W / 2, H * 0.38, 'stained_glass').setScale(2.4));
      beam(120, 246, 0.13);
    } else if (key === 'song') {
      beam(128, 248, 0.10);
      [520, 600, 680].forEach((y, i) => c.add(this.add.image(W / 2, y, 'pew').setScale(1.35).setAlpha(0.9)));
      for (let i = 0; i < 8; i++) {
        const s = this.add.image(Phaser.Math.Between(40, W - 40), Phaser.Math.Between(220, 460), 'spark')
          .setScale(Phaser.Math.FloatBetween(0.6, 1.1)).setAlpha(0.7);
        c.add(s);
        this.tweens.add({ targets: s, y: s.y - 40, alpha: 0.1, duration: 2200, delay: i * 120 });
      }
    } else if (key === 'communion') {
      c.add(this.add.image(W / 2, H * 0.42, 'lamp_glow').setScale(2.6).setAlpha(0.45));
      c.add(this.add.image(W / 2, H * 0.46, 'altar').setScale(1.35).setAlpha(0.95));
      [[120, 640], [200, 660], [280, 640]].forEach(p =>
        c.add(this.add.image(p[0], p[1], 'villager_back').setScale(1.05).setAlpha(0.75).setTint(0x9a93aa)));
    } else if (key === 'face') {
      c.add(this.add.image(W / 2, H * 0.46, 'lamp_glow').setScale(1.8).setAlpha(0.3));
      c.add(this.add.image(W / 2, H * 0.5, 'player_front').setScale(3.4));
    } else {
      const door = this.add.graphics();
      door.fillStyle(0x1a1622, 1); door.fillRect(0, 0, W, H);
      door.fillStyle(0xffeccf, 0.9);
      door.fillRoundedRect(W / 2 - 70, H * 0.36, 140, 300, { tl: 70, tr: 70, bl: 0, br: 0 });
      door.fillStyle(0xfff6e6, 0.5);
      door.fillRoundedRect(W / 2 - 50, H * 0.40, 100, 260, { tl: 50, tr: 50, bl: 0, br: 0 });
      c.add(door);
    }
    return c;
  }

  /* ── 미사 후 — 빈 성당 ─────────────────────── */
  afterMass() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    AudioSystem.setAmbience('none');

    this.inside = this.add.container(0, 0).setDepth(430);
    const g = this.add.graphics();
    g.fillStyle(0x3a3040, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0x4a3f4e, 1); g.fillRect(0, 470, W, H - 470);
    g.fillStyle(0x554857, 1); g.fillRect(28, 150, 40, 330); g.fillRect(W - 68, 150, 40, 330);
    this.inside.add(g);

    for (let i = 0; i < 4; i++) {
      const b = this.add.graphics();
      b.fillStyle(0xffe9c4, 0.05);
      b.fillTriangle(50 - i * 6, 300, 96 + i * 10, 300, 200 + i * 22, 700);
      this.inside.add(b);
    }

    this.inside.add(this.add.image(W / 2, 300, 'altar').setScale(1.15));
    this.inside.add(this.add.image(W / 2, 236, 'lamp_glow').setScale(1.6).setAlpha(0.35));
    this.inside.add(this.add.image(64, 250, 'stained_glass').setScale(0.95));
    this.inside.add(this.add.image(96, 210, 'sanctuary_lamp').setScale(1.05));
    [452, 528, 604].forEach((y, i) =>
      this.inside.add(this.add.image(W / 2, y, 'pew').setScale(1.25).setAlpha(0.95 - i * 0.05)));

    /* 떠나는 사람들 */
    this.leavers = [[86, 496], [284, 500], [140, 568]].map((p, i) => {
      const s = this.add.image(p[0], p[1], 'villager_back').setScale(1.05).setAlpha(0.8).setTint(0x9a93aa);
      this.inside.add(s);
      this.tweens.add({ targets: s, y: s.y + 160, alpha: 0, duration: 4200, delay: 600 + i * 500 });
      return s;
    });

    this.meIn = this.add.image(W / 2 - 40, 546, 'player_back').setScale(1.25);
    this.carloIn = this.add.image(W / 2 + 46, 622, 'carlo_back').setScale(1.2).setAlpha(0);
    this.inside.add([this.meIn, this.carloIn]);

    this.inside.setAlpha(0);
    this.tweens.add({ targets: this.inside, alpha: 1, duration: 1200 });

    this.time.delayedCall(1500, () => {
      this.dialogue.say(DAY03.afterMass.leave, () => {
        this.tweens.add({ targets: this.carloIn, alpha: 1, duration: 900 });
        this.dialogue.say(DAY03.afterMass.find, () => {
          this.tweens.add({ targets: this.meIn, x: W / 2 - 6, y: 596, duration: 900, ease: 'Sine.easeInOut' });
          this.dialogue.play(DAY03.afterMass.talk, () => {
            this.dialogue.play(DAY03.afterMass.talk2, () => {
              this.dialogue.play(DAY03.afterMass.invite, () => this.toSilence());
            });
          });
        });
      });
    });
  }

  toSilence() {
    UI.fadeOut(this, 1100, () => this.scene.start('SilenceScene'), [26, 22, 32]);
  }
};
