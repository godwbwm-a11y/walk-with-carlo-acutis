/* 미니게임 · 누구의 말이지? — 정답이 없는 분류입니다. */

window.WordsScene = class WordsScene extends MiniGameScene {
  constructor() { super('WordsScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#4a5570',
      title: DAY04.words.title, hint: DAY04.words.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.result = { mine: [], others: [], unknown: [] };
    this.queue = DAY04.words.cards.slice();

    /* 세 개의 자리 */
    this.bins = [];
    const binH = 96;
    DAY04.words.bins.forEach((b, i) => {
      const y = 360 + i * (binH + 16);
      const g = this.add.graphics().setDepth(2);
      g.fillStyle(HEX('#3d465e'), 0.9); g.fillRoundedRect(20, y, W - 40, binH, 14);
      g.lineStyle(2, HEX(PAL.sun), 0.4); g.strokeRoundedRect(20, y, W - 40, binH, 14);
      const t = this.add.text(W / 2, y + 22, b.label, UI.style(FONT.small, PAL.cream)).setOrigin(0.5).setDepth(3);
      const count = this.add.text(W / 2, y + 62, '', UI.style(13, '#cbbfae')).setOrigin(0.5).setDepth(3);
      this.bins.push({ key: b.key, x: W / 2, y: y + binH / 2, w: W - 40, h: binH, count: count });
    });

    this.left = this.add.text(W / 2, 316, '', UI.style(FONT.small, '#dfd2bd')).setOrigin(0.5).setDepth(3);

    this.input.on('drag', (p, obj, dx, dy) => { if (obj.isWord) { obj.x = dx; obj.y = dy; } });
    this.input.on('dragend', (p, obj) => { if (obj.isWord) this.drop(obj); });

    this.nextCard();
  }

  nextCard() {
    if (this.queue.length === 0) { this.done(); return; }
    const W = GAME.WIDTH;
    const text = this.queue.shift();
    const c = this.add.container(W / 2, 232).setDepth(40);
    const t = this.add.text(0, 0, text, UI.style(18, PAL.ink, {
      align: 'center', wordWrap: { width: 250 }
    })).setOrigin(0.5);
    const g = this.add.graphics();
    const w = Math.max(220, t.width + 40), h = Math.max(62, t.height + 34);
    g.fillStyle(0xffffff, 0.97); g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    g.lineStyle(2, HEX(PAL.sunDeep), 0.6); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    c.add([g, t]);
    c.setSize(w, h);
    c.setInteractive({ draggable: true, useHandCursor: true });
    c.isWord = true; c.text_ = text; c.homeX = W / 2; c.homeY = 232;
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 300 });
    this.card = c;
    this.left.setText('남은 말  ' + (this.queue.length + 1));
  }

  drop(c) {
    const bin = this.bins.find(b => Math.abs(c.y - b.y) < b.h / 2 + 26 && Math.abs(c.x - b.x) < b.w / 2);
    if (!bin) {
      this.tweens.add({ targets: c, x: c.homeX, y: c.homeY, duration: 260 });
      return;
    }
    AudioSystem.tap();
    this.result[bin.key].push(c.text_);
    bin.count.setText(this.result[bin.key].length + '개');
    c.disableInteractive();
    this.tweens.add({
      targets: c, x: bin.x, y: bin.y, alpha: 0, scale: 0.9, duration: 380,
      onComplete: () => { c.destroy(); this.nextCard(); }
    });
  }

  done() {
    if (this.finished) return;
    this.finished = true;
    SaveSystem.set('reflections.day4Words', this.result);
    this.left.setText('');
    this.setHint('');

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.dialogue.play(DAY04.words.done, () => {
      const t = this.add.text(W / 2, 236, DAY04.words.line1, UI.style(19, PAL.cream, {
        align: 'center', lineSpacing: 8, wordWrap: { width: W - 70 }
      })).setOrigin(0.5).setDepth(50).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 900 });
      this.time.delayedCall(2600, () => {
        const t2 = this.add.text(W / 2, 300, DAY04.words.line2, UI.style(FONT.body, PAL.sun, {
          align: 'center', wordWrap: { width: W - 70 }
        })).setOrigin(0.5).setDepth(50).setAlpha(0);
        this.tweens.add({ targets: t2, alpha: 1, duration: 900 });
        this.time.delayedCall(2400, () => this.leave());
      });
    });
  }
};
