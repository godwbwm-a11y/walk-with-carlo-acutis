/* 미니게임 · HELLO, SEOUL! — 언어 시험이 아닙니다.
   어떤 것을 골라도 상대는 웃습니다. 먼저 다가가는 작은 용기만 남습니다. */

window.HelloScene = class HelloScene extends MiniGameScene {
  constructor() { super('HelloScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#2f4a6b',
      title: DAY05.hello.title, hint: DAY05.hello.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.index = 0;
    this.choices = [];
    this.met = [];

    const g = this.add.graphics().setDepth(-40);
    g.fillStyle(0x486a90, 1); g.fillRect(0, 430, W, H - 430);
    g.fillStyle(0x3f5e80, 1); g.fillRect(0, 430, W, 8);

    this.me = this.add.image(96, 560, 'player_back').setDepth(560).setScale(1.5);
    this.tweens.add({ targets: this.me, y: '-=4', duration: 720, yoyo: true, repeat: -1 });

    this.friend = this.add.image(292, 540, 'pilgrim_a').setDepth(540).setScale(1.6).setAlpha(0);
    this.nameText = this.add.text(292, 452, '', UI.style(FONT.small, '#dfe9f5')).setOrigin(0.5).setDepth(60);

    this.time.delayedCall(500, () => this.show());
  }

  show() {
    if (this.index >= DAY05.hello.pilgrims.length) { this.photo(); return; }
    const p = DAY05.hello.pilgrims[this.index];

    this.friend.setTexture(p.tex).setAlpha(0).setScale(1.6);
    this.nameText.setText(p.who).setAlpha(0);
    this.tweens.add({ targets: [this.friend, this.nameText], alpha: 1, duration: 500 });

    this.dialogue.say([{ t: p.act }], () => this.ask(p));
  }

  ask(p) {
    const W = GAME.WIDTH;
    this.clearButtons();
    let y = 214;
    p.opts.forEach((label, i) => {
      const b = UI.button(this, W / 2, y, W - 76, 60, label, () => this.pick(p, i), { size: FONT.small });
      b.setDepth(60).setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 320, delay: i * 110 });
      this.buttons.push(b);
      y += 72;
    });
  }

  clearButtons() {
    (this.buttons || []).forEach(b => b.destroy());
    this.buttons = [];
  }

  pick(p, i) {
    this.clearButtons();
    this.choices.push(p.opts[i]);
    this.met.push(p.who);
    AudioSystem.select();
    this.tweens.add({ targets: this.friend, scale: 1.72, duration: 260, yoyo: true });

    /* 가롤로 사진을 보여주는 선택 */
    const isCarlo = (p.opts[i].indexOf('가롤로') !== -1);
    const after = () => {
      this.index++;
      this.tweens.add({
        targets: [this.friend, this.nameText], alpha: 0, duration: 400,
        onComplete: () => this.show()
      });
    };
    if (isCarlo) this.dialogue.play(DAY05.hello.carloPhoto, after);
    else this.dialogue.say([{ t: p.back }], after);
  }

  /* 넷이 함께 사진 한 장 */
  photo() {
    const W = GAME.WIDTH;
    SaveSystem.set('reflections.day5Greetings', this.choices.slice());
    SaveSystem.set('reflections.day5Met', this.met.slice());

    this.friend.setVisible(false);
    this.nameText.setText('');
    const row = [];
    ['pilgrim_a', 'pilgrim_b', 'pilgrim_c', 'pilgrim_d'].forEach((k, i) => {
      const img = this.add.image(76 + i * 80, 520, k).setDepth(520).setScale(1.4).setAlpha(0);
      this.tweens.add({ targets: img, alpha: 1, duration: 400, delay: i * 160 });
      row.push(img);
    });
    this.me.setTexture('player_front').setPosition(W / 2, 620).setDepth(620);

    this.time.delayedCall(1100, () => {
      this.dialogue.say(DAY05.hello.photo, () => {
        const flash = this.add.graphics().setDepth(900);
        flash.fillStyle(0xffffff, 1); flash.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
        AudioSystem.swipe();
        this.tweens.add({
          targets: flash, alpha: 0, duration: 700,
          onComplete: () => {
            flash.destroy();
            this.setHint(DAY05.hello.done);
            this.dialogue.say(DAY05.hello.card, () => {
              this.cardId = 'j5';
              this.complete([DAY05.hello.done]);
            });
          }
        });
      });
    });
  }
};
