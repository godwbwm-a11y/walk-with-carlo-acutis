/* 미니게임 · 인터넷에 무엇을 남길까? — 점수는 없습니다.
   선택한 뒤 짧은 질문 하나가 따라올 뿐입니다. */

window.NetChoiceScene = class NetChoiceScene extends MiniGameScene {
  constructor() { super('NetChoiceScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#22314a',
      title: DAY07.net.title, hint: DAY07.net.hint
    });

    const W = GAME.WIDTH;
    this.index = 0;
    this.choices = [];

    this.add.image(W / 2, 300, 'pc_screen_big').setDepth(-20).setScale(1.0).setAlpha(0.3);

    this.time.delayedCall(400, () => this.next());
  }

  clearStage() {
    (this.stage || []).forEach(o => { if (o && o.destroy) o.destroy(); });
    this.stage = [];
  }

  next() {
    if (this.index >= DAY07.net.posts.length) { this.finish(); return; }
    const p = DAY07.net.posts[this.index];
    const W = GAME.WIDTH;
    this.clearStage();
    this.setHint(DAY07.net.hint);

    /* 게시물 하나 */
    const c = this.add.container(W / 2, 230).setDepth(70);
    c.add(this.add.image(0, 0, 'net_post'));
    c.add(this.add.text(-100, -26, p.who, UI.style(FONT.small, PAL.ink)).setOrigin(0, 0.5));
    c.add(this.add.text(-100, 12, p.body, UI.style(FONT.small, PAL.inkSoft, {
      wordWrap: { width: 240 }
    })).setOrigin(0, 0.5));
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 500 });
    this.stage.push(c);

    let y = 360;
    p.opts.forEach((o, i) => {
      const b = UI.button(this, W / 2, y, W - 76, 56, o.label, () => this.pick(o), { size: FONT.small });
      b.setDepth(70).setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 320, delay: 200 + i * 110 });
      this.stage.push(b);
      y += 68;
    });
  }

  /* 고른 뒤에는 짧은 질문 하나 */
  pick(o) {
    const W = GAME.WIDTH;
    this.choices.push(o.label);
    AudioSystem.select();
    this.clearStage();

    const q = this.add.text(W / 2, 250, o.ask, UI.style(20, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5).setDepth(70);
    this.stage.push(q);

    let y = 380;
    DAY07.net.feelings.forEach((f, i) => {
      const b = UI.button(this, W / 2, y, W - 76, 54, f, () => {
        AudioSystem.tap();
        this.index++;
        this.next();
      }, { size: FONT.small });
      b.setDepth(70).setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 300, delay: i * 100 });
      this.stage.push(b);
      y += 64;
    });
  }

  finish() {
    this.clearStage();
    SaveSystem.set('reflections.day7Net', this.choices.slice());
    this.setHint(DAY07.net.done);
    this.dialogue.play(DAY07.net.talk, () => {
      this.setHint('');
      this.complete([DAY07.net.done]);
    });
  }
};
