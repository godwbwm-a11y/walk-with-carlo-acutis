/* 미니게임 · 책장 정리 — 정리하다 보면 잊고 있던 것을 만납니다. */

window.ShelfScene = class ShelfScene extends MiniGameScene {
  constructor() { super('ShelfScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: 'b4', bg: '#4a3f52',
      title: '책장 정리',
      hint: '바닥의 책을 끌어 책장에 꽂아주세요.'
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;

    /* 책장 */
    const sh = this.add.graphics().setDepth(0);
    sh.fillStyle(HEX(PAL.woodDark), 1); sh.fillRoundedRect(30, 150, W - 60, 250, 10);
    sh.fillStyle(HEX('#d9b98c'), 1);
    sh.fillRect(40, 160, W - 80, 108);
    sh.fillRect(40, 278, W - 80, 108);

    this.slots = [];
    const cols = 3;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < cols; col++) {
        this.slots.push({
          x: 84 + col * 106, y: 160 + row * 118 + 54, taken: false
        });
      }
    }
    this.slots.forEach((s) => {
      const g = this.add.graphics().setDepth(1);
      g.lineStyle(2, 0xffffff, 0.18);
      g.strokeRoundedRect(s.x - 22, s.y - 46, 44, 92, 4);
      s.hint = g;
    });

    /* 바닥에 흩어진 책 */
    const colors = [0xc9553f, 0x4f7d6a, 0x5c6b8a, 0xd7a04f, 0x7a5f8a, 0x6f9b8a];
    this.books = [];
    colors.forEach((color, i) => {
      const x = 60 + (i % 3) * 110 + Phaser.Math.Between(-10, 10);
      const y = 520 + Math.floor(i / 3) * 76;
      const b = this.makeBook(x, y, color, i);
      this.books.push(b);
    });

    this.left = this.books.length;
    this.progress = this.add.text(GAME.WIDTH / 2, 452, '남은 책 ' + this.left + '권',
      UI.style(FONT.small, '#dfd2bd')).setOrigin(0.5).setDepth(20);

    this.input.on('drag', (p, obj, dx, dy) => {
      if (!obj.isBook || obj.placed) return;
      obj.x = dx; obj.y = dy;
    });
    this.input.on('dragstart', (p, obj) => { if (obj.isBook) obj.setDepth(80); });
    this.input.on('dragend', (p, obj) => { if (obj.isBook) this.drop(obj); });
  }

  makeBook(x, y, color, i) {
    const c = this.add.container(x, y).setDepth(30);
    const h = Phaser.Math.Between(74, 90);
    const w = Phaser.Math.Between(26, 36);
    const g = this.add.graphics();
    g.fillStyle(color, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    g.fillStyle(0xffffff, 0.85); g.fillRect(w / 2 - 5, -h / 2 + 3, 4, h - 6);
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(-w / 2 + 6, -h / 2 + 12, w - 16, 3);
    g.fillRect(-w / 2 + 6, h / 2 - 18, w - 16, 3);
    c.add(g);
    c.setSize(w + 14, h + 14);
    c.setRotation(Phaser.Math.FloatBetween(-1.4, 1.4));
    c.isBook = true; c.bw = w; c.bh = h;
    c.setInteractive({ draggable: true, useHandCursor: true });
    return c;
  }

  drop(book) {
    let best = null, bestD = 90;
    this.slots.forEach((s) => {
      if (s.taken) return;
      const d = Phaser.Math.Distance.Between(book.x, book.y, s.x, s.y);
      if (d < bestD) { bestD = d; best = s; }
    });

    if (!best) {
      this.tweens.add({ targets: book, y: book.y + 10, duration: 200, ease: 'Sine.easeOut' });
      book.setDepth(30);
      return;
    }

    best.taken = true;
    book.placed = true;
    book.disableInteractive();
    book.setDepth(10);
    if (best.hint) best.hint.setVisible(false);
    AudioSystem.tap();
    this.tweens.add({
      targets: book, x: best.x, y: best.y, rotation: Phaser.Math.FloatBetween(-0.03, 0.03),
      duration: 320, ease: 'Back.easeOut'
    });

    this.left--;
    this.progress.setText(this.left > 0 ? '남은 책 ' + this.left + '권' : '');
    if (this.left === 0) this.time.delayedCall(600, () => this.foundBible());
  }

  foundBible() {
    const W = GAME.WIDTH;
    this.setHint('');
    AudioSystem.found();

    /* 먼지 */
    for (let i = 0; i < 10; i++) {
      const d = this.add.circle(W / 2 + Phaser.Math.Between(-90, 90), 400, Phaser.Math.Between(2, 5), 0xffffff, 0.4)
        .setDepth(60);
      this.tweens.add({ targets: d, y: d.y - Phaser.Math.Between(40, 110), alpha: 0, duration: 1600, delay: i * 60,
        onComplete: () => d.destroy() });
    }

    const book = this.add.image(W / 2, 470, 'bible_book').setScale(0).setDepth(70);
    this.add.image(W / 2, 470, 'lamp_glow').setDepth(69).setScale(1.1).setAlpha(0.45);
    this.tweens.add({ targets: book, scale: 1.9, duration: 700, ease: 'Back.easeOut' });

    this.complete([
      '책장 맨 아래에서 오래된 책이 나왔다.',
      '먼지가 조금 쌓인 성경책.',
      '할머니가 첫영성체 때 주신 것이다.',
      '표지를 손으로 쓸어 보았다.'
    ]);
  }
};
