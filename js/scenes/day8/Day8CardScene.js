/* DAY 8 · MY CARD — 마지막 한 장은 플레이어가 완성합니다. */

window.Day8CardScene = class Day8CardScene extends Phaser.Scene {
  constructor() { super('Day8CardScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day8CardScene', {});
    AudioSystem.setAmbience('none');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#090c14');

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1200, [8, 10, 18]);

    /* 지금까지 모은 카드들이 한 장씩 나타납니다 */
    this.past = [];
    DAY08.card.past.forEach((line, i) => {
      this.time.delayedCall(700 + i * 520, () => {
        const c = this.add.container(W / 2, 300).setDepth(40).setAlpha(0).setScale(0.9);
        c.add(this.add.image(0, 0, 'small_card'));
        c.add(this.add.text(0, 0, line, UI.style(13, PAL.ink, {
          align: 'center', wordWrap: { width: 108 }
        })).setOrigin(0.5));
        this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 500 });
        AudioSystem.tap();
        this.past.push(c);
      });
    });

    /* 가장자리로 물러납니다 */
    this.time.delayedCall(700 + DAY08.card.past.length * 520 + 900, () => {
      const spots = [[62, 150], [328, 150], [62, 300], [328, 300], [62, 450], [328, 450]];
      this.past.forEach((c, i) => {
        this.tweens.add({
          targets: c, x: spots[i][0], y: spots[i][1], scale: 0.62, alpha: 0.5,
          duration: 1200, ease: 'Sine.easeInOut'
        });
      });
      this.time.delayedCall(1400, () => this.myCard());
    });
  }

  myCard() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, C = DAY08.card;
    const plan = SaveSystem.get('lifePlan', null) || '한 걸음';

    const card = this.add.container(W / 2, 300).setDepth(80).setScale(0.7).setAlpha(0);
    card.add(this.add.image(0, 0, 'my_card'));
    /* 카드 윗부분에는 십자가 무늬가 있어 글은 그 아래에서 시작합니다 */
    card.add(this.add.text(0, -28, C.title, UI.style(20, PAL.sunDeep)).setOrigin(0.5));
    card.add(this.add.text(0, -2, C.sub, UI.style(FONT.small, PAL.inkSoft)).setOrigin(0.5));
    card.add(this.add.text(0, 46, plan, UI.style(23, PAL.ink, {
      align: 'center', wordWrap: { width: 250 }, lineSpacing: 8
    })).setOrigin(0.5));
    this.tweens.add({ targets: card, scale: 1, alpha: 1, duration: 900, ease: 'Back.easeOut' });
    AudioSystem.chime();
    this.myCardObj = card;

    this.time.delayedCall(1600, () => this.ask());
  }

  /* 나는 어떤 사람이 되어가고 싶은가 — 적지 않아도 괜찮습니다 */
  ask() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, C = DAY08.card;
    const q = this.add.text(W / 2, 452, C.ask, UI.style(19, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(90).setAlpha(0);
    this.tweens.add({ targets: q, alpha: 1, duration: 900 });

    const go = UI.button(this, W / 2, H - 132, 280, 62, C.keepBtn, () => {
      go.destroy();
      TextInput.ask(this, {
        question: C.ask,
        note: C.placeholder,
        placeholder: C.placeholder,
        okLabel: C.keepBtn,
        skipLabel: C.skipBtn,
        height: 130,
        backHead: 'MY CARD 에 이렇게 적었습니다'
      }, (v) => {
        SaveSystem.set('finalCard', {
          lifePlan: SaveSystem.get('lifePlan', null),
          becoming: v || null
        });
        if (v) {
          q.setText('“' + v + '”').setColor(PAL.sun);
          this.time.delayedCall(1600, () => this.done());
        } else {
          this.done();
        }
      });
    }, { size: FONT.label, fill: PAL.sun });
    go.setDepth(95).setAlpha(0);
    this.tweens.add({ targets: go, alpha: 1, duration: 800, delay: 600 });
  }

  done() {
    UI.fadeOut(this, 1100, () => this.scene.start('Day8NoteScene'), [22, 30, 50]);
  }
};
