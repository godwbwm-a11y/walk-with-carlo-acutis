/* 에필로그 미니게임 · 우리말, 너희말 — 발음을 채점하지 않습니다.
   한 단어를 배우고, 한 사람을 조금 더 알게 될 뿐입니다. */

window.TwoWordsScene = class TwoWordsScene extends MiniGameScene {
  constructor() { super('TwoWordsScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#40527a',
      title: EPI.words.title, hint: EPI.words.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.stage = [];

    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0x4a5c86, 1); g.fillRect(0, 130, W, 300);
    g.fillStyle(0x59689a, 1); g.fillRect(0, 430, W, H - 430);
    g.fillStyle(0x3a4a6e, 1); g.fillRect(0, 424, W, 10);

    this.me = this.add.image(W / 2 - 76, 470, 'player_front').setDepth(470).setScale(1.6);
    this.leo = this.add.image(W / 2 + 76, 466, 'epi_leo_front').setDepth(466).setScale(1.6);
    [this.me, this.leo].forEach((o, i) => this.tweens.add({
      targets: o, y: o.y - 4, duration: 900 + i * 110, yoyo: true, repeat: -1
    }));

    this.bubble = this.add.container(W / 2, 250).setDepth(200).setAlpha(0);
    this.bubble.add(this.add.image(0, 0, 'epi_bubble').setScale(2.4, 1.8));
    this.bubbleText = this.add.text(-4, -8, '', UI.style(22, PAL.ink, {
      align: 'center', wordWrap: { width: 200 }
    })).setOrigin(0.5);
    this.bubble.add(this.bubbleText);

    this.time.delayedCall(500, () => this.teach());
  }

  clearStage() {
    (this.stage || []).forEach(o => { if (o && o.destroy) o.destroy(); });
    this.stage = [];
  }

  say(text, who, after) {
    this.bubble.setPosition(who === 'me' ? GAME.WIDTH / 2 - 60 : GAME.WIDTH / 2 + 60, 250);
    this.bubbleText.setText(text);
    this.bubble.setAlpha(0).setScale(0.85);
    this.tweens.add({ targets: this.bubble, alpha: 1, scale: 1, duration: 320 });
    AudioSystem.talk();
    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: this.bubble, alpha: 0, duration: 300,
        onComplete: () => { if (after) after(); }
      });
    });
  }

  /* 1 · 내가 한국말을 알려줍니다 */
  teach() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.setHint(EPI.words.hint);
    const head = this.add.text(W / 2, 176, EPI.words.teachHead, UI.style(FONT.small, '#cbd8ea'))
      .setOrigin(0.5).setDepth(100);
    this.stage.push(head);

    let y = 520;
    EPI.words.teach.forEach((w) => {
      const b = UI.button(this, W / 2, y, W - 90, 56, w.ko, () => this.taught(w), { size: FONT.small });
      b.setDepth(200);
      this.stage.push(b);
      y += 64;
    });
  }

  taught(w) {
    if (this.busy) return;
    this.busy = true;
    this.clearStage();
    this.setHint('');
    SaveSystem.set('epilogue.taughtWord', w.ko);

    this.say(w.ko, 'me', () => {
      this.say(w.say, 'leo', () => {
        this.say(w.ko, 'me', () => {
          if (w.ko === '친구.') this.friendMoment();
          else this.learn();
        });
      });
    });
  }

  /* “친구?” — “응. 친구.” */
  friendMoment() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const t = this.add.text(W / 2, 190, EPI.words.friendPoint, UI.style(FONT.small, '#cbd8ea'))
      .setOrigin(0.5).setDepth(100).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 500 });

    this.say(EPI.words.friendAsk, 'leo', () => {
      this.time.delayedCall(600, () => {
        this.say(EPI.words.myAnswer, 'me', () => {
          t.destroy();
          const f = this.add.text(W / 2, 200, EPI.words.five, UI.style(19, PAL.sun))
            .setOrigin(0.5).setDepth(100).setAlpha(0);
          this.tweens.add({ targets: f, alpha: 1, duration: 500 });
          this.tweens.add({ targets: [this.me, this.leo], y: '-=14', duration: 220, yoyo: true });
          AudioSystem.chime();
          this.time.delayedCall(1800, () => { f.destroy(); this.learn(); });
        });
      });
    });
  }

  /* 2 · 내가 배웁니다 */
  learn() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.busy = false;
    this.clearStage();

    const pick = Phaser.Utils.Array.GetRandom(EPI.words.learn);
    this.myWord = pick;

    const head = this.add.text(W / 2, 176, EPI.words.learnHead, UI.style(FONT.small, '#cbd8ea'))
      .setOrigin(0.5).setDepth(100);
    this.stage.push(head);

    this.say(pick.word, 'leo', () => {
      const a = this.add.text(W / 2, 540, pick.word, UI.style(34, PAL.sun)).setOrigin(0.5).setDepth(100);
      const b = this.add.text(W / 2, 584, pick.lang + '말 · ' + pick.mean,
        UI.style(FONT.small, '#cbd8ea')).setOrigin(0.5).setDepth(100);
      this.stage.push(a); this.stage.push(b);
      this.setHint(EPI.words.sayIt);

      const btn = UI.button(this, W / 2, 664, 250, 60, EPI.words.tryBtn,
        () => this.trySay(pick), { size: FONT.label, fill: PAL.sun });
      btn.setDepth(200);
      this.stage.push(btn);
    });
  }

  /* 한 번은 빗나가고, 다시 하면 됩니다 */
  trySay(pick) {
    if (this.busy) return;
    this.busy = true;
    this.tries = (this.tries || 0) + 1;

    if (this.tries === 1) {
      this.say(pick.word.slice(0, 2) + '…', 'me', () => {
        this.say(EPI.words.almost, 'leo', () => {
          const t = this.add.text(GAME.WIDTH / 2, 200, EPI.words.again, UI.style(20, PAL.cream))
            .setOrigin(0.5).setDepth(100).setAlpha(0);
          this.tweens.add({ targets: t, alpha: 1, duration: 400 });
          this.time.delayedCall(1200, () => { t.destroy(); this.busy = false; });
        });
      });
      return;
    }

    this.say(pick.word, 'me', () => {
      SaveSystem.set('epilogue.learnedWord', pick.word + ' (' + pick.lang + ')');
      this.clearStage();
      this.setHint('');
      this.done(pick);
    });
  }

  done(pick) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const a = this.add.text(W / 2, 560, EPI.words.learned, UI.style(21, PAL.sun))
      .setOrigin(0.5).setDepth(100).setAlpha(0);
    const b = this.add.text(W / 2, 604, EPI.words.knew, UI.style(21, PAL.cream))
      .setOrigin(0.5).setDepth(100).setAlpha(0);
    const c = this.add.text(W / 2, 652, EPI.words.good, UI.style(13, '#8fa5c8'))
      .setOrigin(0.5).setDepth(100).setAlpha(0);

    this.tweens.add({ targets: a, alpha: 1, duration: 800 });
    this.tweens.add({ targets: b, alpha: 1, duration: 800, delay: 1200 });
    this.tweens.add({ targets: c, alpha: 0.9, duration: 800, delay: 2400 });
    AudioSystem.bell();

    this.time.delayedCall(4000, () => this.complete(EPI.words.done));
  }
};
