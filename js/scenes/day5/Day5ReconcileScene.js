/* DAY 5 · 화해의 공원 — 고해성사 자체는 게임으로 만들지 않습니다.
   문이 닫히고, 잠시 뒤 문이 열립니다. 그 사이의 일은 보여주지 않습니다. */

window.Day5ReconcileScene = class Day5ReconcileScene extends Phaser.Scene {
  constructor() { super('Day5ReconcileScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, R = DAY05.reconcile;
    SaveSystem.checkpoint('Day5ReconcileScene', {});
    AudioSystem.setAmbience('none');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#cfd9c8');

    this.add.image(W / 2, 0, 'sky_seoul_day').setOrigin(0.5, 0).setDisplaySize(W, 380).setDepth(-30);
    const g = this.add.graphics().setDepth(-20);
    g.fillStyle(0x9db089, 1); g.fillRect(0, 360, W, H - 360);
    g.fillStyle(0xaebd98, 1); g.fillRect(0, 360, W, 12);
    g.fillStyle(0xcbbf9f, 1);
    g.fillRoundedRect(120, 520, 150, 324, 8);          // 흙길

    this.add.image(56, 380, 'park_tree_soft').setDepth(380).setScale(0.9);
    this.add.image(336, 396, 'park_tree_soft').setDepth(396).setScale(0.8);
    this.add.image(W / 2, 330, 'park_gate').setDepth(330).setScale(0.95);
    this.box = this.add.image(W / 2, 470, 'confess_box').setDepth(470).setScale(0.98);

    this.add.text(W / 2, 176, R.sign, UI.style(17, PAL.cream)).setOrigin(0.5).setDepth(340);
    this.add.text(W / 2, 202, R.signKo, UI.style(14, '#e8f0e2')).setOrigin(0.5).setDepth(340);

    this.me = this.add.image(146, 606, 'player_back').setDepth(606).setScale(1.4);
    this.carlo = this.add.image(240, 616, 'carlo_back').setDepth(616).setScale(1.4);
    this.tweens.add({ targets: [this.me, this.carlo], y: '-=4', duration: 820, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1000, [214, 220, 208]);

    this.time.delayedCall(800, () => {
      this.dialogue.play(R.arrive, () => {
        this.dialogue.play(R.ask, () => this.askWho());
      });
    });
  }

  /* 화해하고 싶은 사람 — 캐묻지 않습니다 */
  askWho() {
    this.dialogue.choose(DAY05.reconcile.prompt, DAY05.reconcile.choices, (key, opt) => {
      SaveSystem.set('reflections.day5Reconcile', key);
      SaveSystem.set('reflections.reconciliationThought', opt.label);
      this.dialogue.play(DAY05.reconcile.reply, () => this.askEnter());
    });
  }

  askEnter() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, R = DAY05.reconcile;
    const a = UI.button(this, W / 2, H - 210, 260, 60, R.enterBtn, () => {
      a.destroy(); b.destroy(); this.enter();
    }, { size: FONT.label, fill: PAL.sun });
    const b = UI.button(this, W / 2, H - 136, 260, 56, R.skipBtn, () => {
      a.destroy(); b.destroy(); this.skip();
    }, { size: FONT.small });
    [a, b].forEach(x => x.setDepth(880).setAlpha(0));   // 사람들보다 위에 놓습니다
    this.tweens.add({ targets: [a, b], alpha: 1, duration: 700 });
  }

  /* 안에서 무슨 일이 있었는지는 보여주지 않습니다 */
  enter() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.set('reflections.day5ReconcileEntered', true);
    this.tweens.add({ targets: this.me, x: W / 2, y: 560, duration: 1400, ease: 'Sine.easeInOut' });

    this.time.delayedCall(1500, () => {
      this.me.setVisible(false);
      const veil = this.add.graphics().setDepth(900);
      veil.fillStyle(0x0d1524, 1); veil.fillRect(0, 0, W, H);
      veil.setAlpha(0);
      this.tweens.add({ targets: veil, alpha: 1, duration: 1200 });

      const t = this.add.text(W / 2, H / 2, DAY05.reconcile.inside, UI.style(FONT.body, PAL.cream))
        .setOrigin(0.5).setDepth(901).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 900, delay: 900, yoyo: true, hold: 1600 });

      this.time.delayedCall(1900, () => AudioSystem.bell());     // 아주 작은 종소리 하나
      this.time.delayedCall(4600, () => {
        this.tweens.add({
          targets: veil, alpha: 0, duration: 1400,
          onComplete: () => {
            veil.destroy(); t.destroy();
            this.me.setVisible(true).setPosition(146, 606).setDepth(606);
            this.dialogue.play(DAY05.reconcile.out, () => {
              this.dialogue.play(DAY05.reconcile.afterIn, () => this.card());
            });
          }
        });
      });
    });
  }

  skip() {
    SaveSystem.set('reflections.day5ReconcileEntered', false);
    this.dialogue.play(DAY05.reconcile.afterSkip, () => this.card());
  }

  card() {
    SaveSystem.set('reflections.day5ReconcileDone', true);
    this.dialogue.say(DAY05.reconcile.card, () => {
      Collection.award(this, 's12', () => this.leave());
    });
  }

  leave() {
    UI.fadeOut(this, 900, () => this.scene.start('Day5VocationScene'), [214, 220, 208]);
  }
};
