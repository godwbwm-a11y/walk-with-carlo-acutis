/* DAY 8 · 마지막 꿈 — 카를로가 뒤로 물러납니다. “나 말고, 하느님.” */

window.Day8GoodbyeScene = class Day8GoodbyeScene extends Phaser.Scene {
  constructor() { super('Day8GoodbyeScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day8GoodbyeScene', {});
    AudioSystem.setAmbience('beach');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#0c1430');

    this.add.image(W / 2, 0, 'sky_lastdawn').setOrigin(0.5, 0).setDisplaySize(W, 520).setDepth(-40);
    for (let i = 0; i < 50; i++) {
      const s = this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(20, 320), 'dot')
        .setDepth(-35).setScale(Phaser.Math.FloatBetween(0.16, 0.4))
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.7));
      this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(1600, 3400),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000) });
    }

    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0x1d4a68, 1); g.fillRect(0, 430, W, 92);
    g.fillStyle(0x35688a, 0.7); g.fillRect(0, 430, W, 14);
    g.fillStyle(0xb8a68c, 1); g.fillRect(0, 522, W, H - 522);
    g.fillStyle(0xc4b299, 0.6); g.fillRect(0, 522, W, 12);

    for (let i = 0; i < 5; i++) {
      const f = this.add.image(Phaser.Math.Between(0, W), 522 - Phaser.Math.Between(2, 18), 'seafoam')
        .setDepth(-20).setAlpha(0.45).setScale(Phaser.Math.FloatBetween(0.8, 1.3));
      this.tweens.add({ targets: f, x: f.x + Phaser.Math.Between(-30, 30), alpha: 0.12,
        duration: Phaser.Math.Between(2600, 4200), yoyo: true, repeat: -1 });
    }

    /* 말풍선에 가리지 않도록 두 사람은 모래 위쪽에 섭니다 */
    this.me = this.add.image(118, 612, 'player_front').setDepth(612).setScale(1.4);
    this.carlo = this.add.image(300, 588, 'carlo_front').setDepth(588).setScale(1.24).setAlpha(0);
    this.bob = this.tweens.add({ targets: this.me, y: 608, duration: 900, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1600, [4, 6, 12]);

    this.time.delayedCall(1200, () => {
      this.tweens.add({ targets: this.carlo, alpha: 1, duration: 1400, delay: 3000 });
      this.dialogue.play(DAY08.goodbye.arrive, () => {
        this.dialogue.play(DAY08.goodbye.talk, () => this.counted(0));
      });
    });
  }

  /* 카를로가 오늘 한 일을 하나씩 세어 줍니다 */
  counted(i) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    if (i >= DAY08.goodbye.counted.length) {
      this.dialogue.play(DAY08.goodbye.counted2, () => {
        this.dialogue.play(DAY08.goodbye.last, () => this.atMass());
      });
      return;
    }
    const t = this.add.text(W / 2, 240 + i * 44, '“' + DAY08.goodbye.counted[i] + '”',
      UI.style(19, PAL.cream, { align: 'center', wordWrap: { width: W - 70 } }))
      .setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 0.95, duration: 600 });
    AudioSystem.tap();
    this.time.delayedCall(1100, () => this.counted(i + 1));
  }

  /* “또 만날 수 있어?” → “미사에서.” */
  atMass() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.children.list.slice().forEach(o => { if (o.depth === 300) o.destroy(); });

    const t = this.add.text(W / 2, H * 0.32, DAY08.goodbye.atMass, UI.style(30, PAL.sun))
      .setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 1200 });
    AudioSystem.bell();

    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: t, alpha: 0, duration: 800,
        onComplete: () => {
          t.destroy();
          this.dialogue.play(DAY08.goodbye.atMass2, () => this.notMe());
        }
      });
    });
  }

  /* DAY 2 의 문장이 마지막에 다시 돌아옵니다 */
  notMe() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const t = this.add.text(W / 2, H * 0.34, DAY08.goodbye.notMe, UI.style(30, PAL.cream))
      .setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 1200 });

    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: t, alpha: 0, duration: 800,
        onComplete: () => {
          t.destroy();
          this.dialogue.play(DAY08.goodbye.notMe2, () => this.core());
        }
      });
    });
  }

  /* 카를로의 인생 계획, 그리고 나의 인생 계획 */
  core() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, G = DAY08.goodbye;
    const a = this.add.text(W / 2, H * 0.30, G.core1, UI.style(24, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(300).setAlpha(0);
    const b = this.add.text(W / 2, H * 0.38, G.core2, UI.style(24, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(300).setAlpha(0);
    const c = this.add.text(W / 2, H * 0.45, G.coreFrom, UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(300).setAlpha(0);

    this.tweens.add({ targets: a, alpha: 1, duration: 1400 });
    this.tweens.add({ targets: b, alpha: 1, duration: 1400, delay: 2200 });
    this.tweens.add({ targets: c, alpha: 1, duration: 1000, delay: 4000 });
    AudioSystem.bell();

    /* 이미 DAY 1 에서 받은 말씀입니다 — 오늘 다시 만납니다 */
    if (!Collection.has('c1')) Collection.unlock('c1');

    this.time.delayedCall(6600, () => {
      this.tweens.add({
        targets: [a, b, c], alpha: 0, duration: 900,
        onComplete: () => {
          [a, b, c].forEach(o => o.destroy());
          this.myPlan();
        }
      });
    });
  }

  myPlan() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.dialogue.play(DAY08.goodbye.myPlan, () => {
      const plan = SaveSystem.get('lifePlan', null) || '한 걸음';
      const t = this.add.text(W / 2, H * 0.34, '“' + plan + '”', UI.style(26, PAL.sun, {
        align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
      })).setOrigin(0.5).setDepth(300).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 1100 });

      this.time.delayedCall(2800, () => {
        this.tweens.add({
          targets: t, alpha: 0, duration: 800,
          onComplete: () => {
            t.destroy();
            this.dialogue.play(DAY08.goodbye.myPlanAfter, () => this.bye());
          }
        });
      });
    });
  }

  /* 이번에는 따라가지 않습니다 */
  bye() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, G = DAY08.goodbye;
    this.dialogue.play(G.bye, () => {
      const a = this.add.text(W / 2, H * 0.30, G.thanks, UI.style(30, PAL.cream))
        .setOrigin(0.5).setDepth(300).setAlpha(0);
      this.tweens.add({ targets: a, alpha: 1, duration: 900 });

      this.time.delayedCall(1800, () => {
        const b = this.add.text(W / 2, H * 0.38, G.farewell, UI.style(30, PAL.sun))
          .setOrigin(0.5).setDepth(300).setAlpha(0);
        this.tweens.add({ targets: b, alpha: 1, duration: 900 });

        this.time.delayedCall(2400, () => {
          this.tweens.add({ targets: [a, b], alpha: 0, duration: 900,
            onComplete: () => { a.destroy(); b.destroy(); } });
          this.dialogue.play(G.byeAfter, () => this.walkAway());
        });
      });
    });
  }

  /* 카를로는 한쪽으로, 나는 반대쪽으로 */
  walkAway() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    if (this.bob) this.bob.stop();
    this.carlo.setTexture('carlo_back');
    this.tweens.add({
      targets: this.carlo, x: W + 80, y: 566, scale: 0.9, alpha: 0.5, duration: 5000, ease: 'Sine.easeIn'
    });

    this.me.setTexture('player_back');
    this.tweens.add({ targets: this.me, x: -70, y: 592, scale: 1.1, duration: 6000, ease: 'Sine.easeIn' });

    /* 발자국은 하나뿐입니다. 예수님을 그림으로 보이게 하지 않습니다. */
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(700 + i * 700, () => {
        const f = this.add.image(108 - i * 18, 632 + (i % 2) * 8, 'footprint')
          .setDepth(600).setScale(0.9).setAlpha(0);
        this.tweens.add({ targets: f, alpha: 0.5, duration: 500 });
      });
    }

    this.time.delayedCall(4200, () => this.finalWord());
  }

  finalWord() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, G = DAY08.goodbye;
    const veil = this.add.graphics().setDepth(800);
    veil.fillStyle(0x0c1430, 0.85); veil.fillRect(0, 0, W, H);
    veil.setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 1600 });
    AudioSystem.bell();

    const t = this.add.text(W / 2, H * 0.38, G.finalBible, UI.style(23, PAL.cream, {
      align: 'center', lineSpacing: 9, wordWrap: { width: W - 60 }
    })).setOrigin(0.5).setDepth(810).setAlpha(0);
    const r = this.add.text(W / 2, H * 0.50, G.finalRef, UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(810).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 1600, delay: 900 });
    this.tweens.add({ targets: r, alpha: 1, duration: 1200, delay: 2600 });

    Collection.unlock('b23');

    this.time.delayedCall(6400, () => {
      UI.fadeOut(this, 1600, () => this.scene.start('Day8CardScene'), [8, 10, 18]);
    });
  }
};
