/* DAY 2 · 말씀카드 앨범 — 놓친 말씀이 있어도 괜찮습니다. */

window.Day2AlbumScene = class Day2AlbumScene extends Phaser.Scene {
  constructor() { super('Day2AlbumScene'); }

  create(data) {
    data = data || {};
    this.day = data.day || 2;
    this.next = data.next || 'Day2EndScene';
    this.missedText = data.missed || DAY02.note.albumMissed;
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    AudioSystem.setAmbience('room');
    this.cameras.main.setBackgroundColor('#1b2a4a');

    const cards = COLLECTION.byDay(this.day);
    const got = Collection.countOfDay(this.day);

    this.add.text(W / 2, 62, 'DAY ' + this.day + ' 말씀카드', UI.style(23, PAL.cream)).setOrigin(0.5);
    this.add.text(W / 2, 98, got + ' / ' + cards.length + ' 발견', UI.style(FONT.body, PAL.sun)).setOrigin(0.5);

    const cols = 2, cw = 158, ch = 148, gapX = 18, gapY = 16;
    const startY = 190;

    cards.forEach((card, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = W / 2 + (col === 0 ? -(cw / 2 + gapX / 2) : (cw / 2 + gapX / 2));
      const y = startY + row * (ch + gapY);
      const have = Collection.has(card.id);
      const cat = COLLECTION.cats[card.cat];

      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.15); g.fillRoundedRect(x - cw / 2 + 2, y - ch / 2 + 4, cw, ch, 14);
      g.fillStyle(HEX(have ? PAL.paper : '#2b3b60'), have ? 0.97 : 0.55);
      g.fillRoundedRect(x - cw / 2, y - ch / 2, cw, ch, 14);
      g.lineStyle(2, HEX(cat.color), have ? 0.75 : 0.25);
      g.strokeRoundedRect(x - cw / 2, y - ch / 2, cw, ch, 14);
      if (have) {
        g.fillStyle(HEX(cat.color), 1);
        g.fillRoundedRect(x - cw / 2, y - ch / 2, cw, 26, { tl: 14, tr: 14, bl: 0, br: 0 });
        this.add.text(x, y - ch / 2 + 13, cat.icon + ' ' + cat.name, UI.style(12, PAL.cream)).setOrigin(0.5);
        this.add.text(x, y + 2, card.text, UI.style(14, PAL.ink, {
          align: 'center', lineSpacing: 4, wordWrap: { width: cw - 22 }
        })).setOrigin(0.5);
        this.add.text(x, y + ch / 2 - 16, '— ' + card.from, UI.style(11, PAL.inkSoft)).setOrigin(0.5);
      } else {
        this.add.text(x, y - 16, '?', UI.style(30, '#6f86ad')).setOrigin(0.5);
        this.add.text(x, y + 26, '어딘가에\n말씀이 숨어 있다', UI.style(12, '#6f86ad', {
          align: 'center', lineSpacing: 3
        })).setOrigin(0.5);
      }
    });

    const bottom = startY + Math.ceil(cards.length / cols) * (ch + gapY) + 6;
    const foot = (got >= cards.length)          // 다 찾았으면 놓친 말씀 안내를 하지 않습니다
      ? '오늘의 말씀을 모두 만났습니다.'
      : this.missedText;
    this.add.text(W / 2, bottom, foot, UI.style(FONT.small, '#c9d6ea', {
      align: 'center', lineSpacing: 6, wordWrap: { width: W - 60 }
    })).setOrigin(0.5).setAlpha(0.9);

    UI.button(this, W / 2, H - 96, 250, 60, '계속', () => {
      UI.fadeOut(this, 800, () => this.scene.start(this.next), [8, 10, 18]);
    }, { size: FONT.label, fill: PAL.sun });

    UI.fadeIn(this, 700);
    AudioSystem.chime();
  }
};
