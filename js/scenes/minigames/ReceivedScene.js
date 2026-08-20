/* 미니게임 · 내가 받은 것 — 받은 것과 사람을 이어봅니다.
   “아직 잘 모르겠다” 를 골라도 괜찮습니다. */

window.ReceivedScene = class ReceivedScene extends MiniGameScene {
  constructor() { super('ReceivedScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#2b3b60',
      title: DAY07.gift.title, hint: DAY07.gift.hint
    });

    const W = GAME.WIDTH;
    this.pick = { gift: null, who: null };

    this.time.delayedCall(400, () => this.askGift());
  }

  clearStage() {
    (this.stage || []).forEach(o => { if (o && o.destroy) o.destroy(); });
    this.stage = [];
  }

  /* DAY 4 에서 고른 것을 앞에 두고, 시간·관심 같은 것도 함께 놓습니다 */
  giftList() {
    const list = [];
    const main = SaveSystem.get('reflections.day4MainStrength', null);
    const mine = SaveSystem.get('reflections.day4Strengths', []) || [];
    if (main) list.push(main);
    mine.forEach(m => { if (list.indexOf(m) === -1) list.push(m); });
    if (list.length === 0) DAY07.gift.fallback.forEach(f => list.push(f));
    DAY07.gift.extras.forEach(e => { if (list.indexOf(e) === -1) list.push(e); });
    if (list.indexOf('아직 잘 모르겠다') === -1) list.push('아직 잘 모르겠다');
    return list;
  }

  askGift() {
    this.clearStage();
    this.setHint(DAY07.gift.leftHead);
    this.scrollList(this.giftList(), 200, (v) => {
      this.pick.gift = v;
      AudioSystem.select();
      this.askWho();
    });
  }

  askWho() {
    this.clearStage();
    this.setHint(DAY07.gift.rightHead);

    const chip = this.add.text(GAME.WIDTH / 2, 156, '“' + this.pick.gift + '”',
      UI.style(19, PAL.sun, { align: 'center', wordWrap: { width: GAME.WIDTH - 70 } }))
      .setOrigin(0.5).setDepth(80);
    this.stage.push(chip);

    this.scrollList(DAY07.gift.people, 218, (v) => {
      this.pick.who = v;
      AudioSystem.select();
      this.show();
    });
  }

  scrollList(items, top, cb) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const list = this.add.container(0, 0).setDepth(80);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, top, W, H - top - 90);
    list.setMask(shape.createGeometryMask());
    this.stage.push(list);

    let y = top + 34;
    items.forEach((it) => {
      list.add(UI.button(this, W / 2, y, W - 74, 54, it, () => cb(it), { size: FONT.small }));
      y += 62;
    });

    const max = Math.max(0, y - (H - 100));
    if (this.scrollFn) this.input.off('pointermove', this.scrollFn);
    this.scrollFn = (p) => {
      if (!p.isDown || p.y < top + 4 || p.y > H - 94) return;
      const dy = p.y - (this.lastY === undefined ? p.y : this.lastY);
      this.lastY = p.y;
      list.y = Phaser.Math.Clamp(list.y + dy, -max, 0);
    };
    this.input.on('pointermove', this.scrollFn);
    this.input.on('pointerup', () => { this.lastY = undefined; });
  }

  /* 두 카드를 잇습니다 */
  show() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.clearStage();
    this.setHint(DAY07.gift.howHead);

    const left = this.card(W / 2, 210, this.pick.gift, PAL.sun);
    const right = this.card(W / 2, 330, this.pick.who, PAL.sky);
    const link = this.add.graphics().setDepth(70);
    link.lineStyle(3, HEX(PAL.sun), 0.7);
    link.lineBetween(W / 2, 246, W / 2, 294);
    this.stage.push(link);

    const unknown = (this.pick.gift.indexOf('모르겠') >= 0 || this.pick.who.indexOf('모르겠') >= 0);
    const line = unknown ? DAY07.gift.unknownLine : this.sentence();

    const t = this.add.text(W / 2, 430, unknown ? '괜찮습니다.' : '', UI.style(21, PAL.cream))
      .setOrigin(0.5).setDepth(80).setAlpha(0);
    const t2 = this.add.text(W / 2, unknown ? 480 : 440, line, UI.style(21, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5, 0).setDepth(80).setAlpha(0);
    this.tweens.add({ targets: [t, t2], alpha: 1, duration: 800, delay: 400 });
    this.stage.push(t); this.stage.push(t2);
    AudioSystem.chime();

    this.time.delayedCall(1400, () => {
      const keep = UI.button(this, W / 2, H - 172, 260, 58, DAY07.gift.keepBtn, () => this.keep(line),
        { size: FONT.label, fill: PAL.sun });
      const again = UI.button(this, W / 2, H - 104, 260, 54, DAY07.gift.againBtn, () => {
        keep.destroy(); again.destroy();
        this.pick = { gift: null, who: null };
        this.askGift();
      }, { size: FONT.small });
      [keep, again].forEach(b => b.setDepth(90));
      this.stage.push(keep); this.stage.push(again);
    });
  }

  card(x, y, text, color) {
    const c = this.add.container(x, y).setDepth(80);
    const g = this.add.graphics();
    g.fillStyle(HEX(color), 0.18); g.fillRoundedRect(-150, -30, 300, 60, 12);
    g.lineStyle(2, HEX(color), 0.9); g.strokeRoundedRect(-150, -30, 300, 60, 12);
    c.add(g);
    c.add(this.add.text(0, 0, text, UI.style(FONT.small, PAL.cream, {
      align: 'center', wordWrap: { width: 272 }
    })).setOrigin(0.5));
    this.stage.push(c);
    return c;
  }

  sentence() {
    const how = DAY07.gift.pairs[this.pick.gift] || '한 번 더 바라본다.';
    return this.pick.who + '에게 ' + how;
  }

  keep(line) {
    SaveSystem.set('reflections.day7Gift', {
      gift: this.pick.gift, who: this.pick.who, how: line
    });
    this.clearStage();
    this.setHint('');
    this.dialogue.play(DAY07.gift.talk, () => {
      this.cardId = 'j10';
      this.complete(['내가 받은 것은 나만을 위한 것이 아니다.']);
    });
  }
};
