/* DAY 6 · 밤샘기도와 성체조배 — 조작도 점수도 없습니다. 그리고 별 아래의 대화. */

window.Day6VigilScene = class Day6VigilScene extends Phaser.Scene {
  constructor() { super('Day6VigilScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day6VigilScene', {});
    AudioSystem.setAmbience('none');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#080e1f');

    this.add.image(W / 2, 0, 'sky_vigil').setOrigin(0.5, 0).setDisplaySize(W, H).setDepth(-40);
    this.stars = [];
    for (let i = 0; i < 60; i++) {
      const s = this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(70, 460), 'star_bright')
        .setDepth(-30).setScale(Phaser.Math.FloatBetween(0.26, 0.62))
        .setAlpha(Phaser.Math.FloatBetween(0.18, 0.65));
      this.tweens.add({
        targets: s, alpha: s.alpha * 0.32, duration: Phaser.Math.Between(1600, 3400),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000)
      });
      this.stars.push(s);
    }

    this.add.image(W / 2, 250, 'vigil_stage').setDepth(4).setScale(0.78).setAlpha(0.9);
    this.add.image(W / 2, 340, 'wyd_cross').setDepth(10).setScale(0.66).setAlpha(0.92);
    [[70, 430], [318, 430]].forEach((c) => {
      const cd = this.add.image(c[0], c[1], 'candle_small').setDepth(20).setScale(1.2);
      this.tweens.add({ targets: cd, alpha: 0.6, duration: 1500, yoyo: true, repeat: -1 });
    });
    for (let r = 0; r < 4; r++) {
      this.add.image(W / 2, 470 + r * 46, 'sleep_row')
        .setDepth(30 + r).setScale(1.0 - r * 0.03).setTint(0x2b3550).setAlpha(0.92);
    }

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1200, [8, 10, 18]);
    AudioSystem.bell();

    this.time.delayedCall(900, () => {
      this.dialogue.play(DAY06.vigil.open, () => {
        this.scene.launch('StayScene', { from: this.scene.key });
        this.scene.pause();
      });
    });
  }

  onMiniGameDone(key) {
    if (key !== 'StayScene') return;
    this.time.delayedCall(600, () => this.starsTalk());
  }

  /* 별 아래의 대화 — “너처럼 하면 되지.” */
  starsTalk() {
    const W = GAME.WIDTH;
    this.add.image(196, 690, 'mat_ground').setDepth(680).setScale(1.0);
    this.me = this.add.image(168, 682, 'player_front').setDepth(690).setScale(1.2).setAngle(-90);
    this.carlo = this.add.image(232, 694, 'carlo_front').setDepth(691).setScale(1.2).setAngle(-90);

    this.dialogue.play(DAY06.stars, () => {
      const t = this.add.text(W / 2, GAME.HEIGHT * 0.34, DAY06.starsCore, UI.style(27, PAL.sun, {
        align: 'center', wordWrap: { width: W - 70 }
      })).setOrigin(0.5).setDepth(200).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 1200 });
      AudioSystem.chime();
      this.time.delayedCall(3000, () => {
        this.tweens.add({
          targets: t, alpha: 0, duration: 900,
          onComplete: () => {
            t.destroy();
            this.dialogue.play(DAY06.stars2, () => this.carloCard());
          }
        });
      });
    });
  }

  /* 팝업 효과 없이 조용히 들어오는 카를로 카드 */
  carloCard() {
    Collection.award(this, 'c13', () => this.prayer());
  }

  /* 밤샘기도 */
  prayer() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const veil = this.add.graphics().setDepth(800);
    veil.fillStyle(0x080e1f, 0.94); veil.fillRect(0, 0, W, H);
    veil.setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 1200 });
    AudioSystem.bell();

    const head = this.add.text(W / 2, 130, DAY06.prayer.head, UI.style(19, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(810).setAlpha(0);
    this.tweens.add({ targets: head, alpha: 1, duration: 900 });

    /* DAY 5 에서 마음이 멈추었던 장면들이 아주 희미하게 */
    const picks = SaveSystem.get('reflections.day5Vocation', []) || [];
    const shown = picks.length ? picks.slice(0, 3) : ['아직 잘 모르겠다'];
    shown.forEach((p, i) => {
      const t = this.add.text(W / 2, 178 + i * 26, p, UI.style(14, '#8fa5c8'))
        .setOrigin(0.5).setDepth(810).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 0.55, duration: 900, delay: 400 + i * 300 });
    });

    const body = this.add.text(W / 2, 268, '', UI.style(18, PAL.cream, {
      align: 'center', lineSpacing: 7, wordWrap: { width: W - 76 }
    })).setOrigin(0.5, 0).setDepth(810);

    const lines = DAY06.prayer.lines;
    let shownLines = [], i = 0;
    const step = () => {
      if (i >= lines.length) { this.time.delayedCall(1200, () => this.prayerEnd(veil, body, head)); return; }
      shownLines.push(lines[i++]);
      if (shownLines.length > 12) shownLines.shift();
      body.setText(shownLines.join('\n'));
      body.setAlpha(0.45);
      this.tweens.add({ targets: body, alpha: 1, duration: 320 });
      this.time.delayedCall(lines[i - 1] === '' ? 200 : 660, step);
    };
    this.time.delayedCall(1600, step);
  }

  prayerEnd(veil, body, head) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const b = UI.button(this, W / 2, H - 130, 240, 58, DAY06.prayer.endBtn, () => {
      b.destroy();
      this.tweens.add({
        targets: [veil, body, head], alpha: 0, duration: 1000,
        onComplete: () => {
          [veil, body, head].forEach(o => o.destroy());
          this.saintCard();
        }
      });
    }, { size: FONT.label, fill: PAL.sun });
    b.setDepth(830).setAlpha(0);
    this.tweens.add({ targets: b, alpha: 1, duration: 800 });
  }

  /* 소화 데레사 카드는 기도 뒤 조용히 */
  saintCard() {
    Collection.award(this, 's13', () => {
      UI.fadeOut(this, 1100, () => this.scene.start('Day6NightScene'), [8, 10, 18]);
    });
  }
};
