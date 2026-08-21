/* 나의 여행 노트 — 8일 전체를 한 번에 넘겨봅니다. 평가도 점수도 없습니다. */

window.Day8ReviewScene = class Day8ReviewScene extends Phaser.Scene {
  constructor() { super('Day8ReviewScene'); }

  create(data) {
    data = data || {};
    this.from = data.from || 'Day8EndScene';

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.viewTop = 128;
    this.viewH = H - this.viewTop - 26;

    AudioSystem.setAmbience('none');
    this.add.graphics().fillStyle(HEX(PAL.night), 1).fillRect(0, 0, W, H);
    const back = this.add.graphics();
    back.fillStyle(0x22314f, 1); back.fillRect(0, 0, W, this.viewTop - 10);
    this.add.text(W / 2, 46, '나의 여행 노트', UI.style(22, PAL.cream)).setOrigin(0.5);
    this.add.text(W / 2, 80, 'DAY 1 – DAY 8', UI.style(FONT.small, '#8fa5c8')).setOrigin(0.5);
    UI.circleButton(this, W - 36, 46, 22, '✕', () => this.close(), { size: 18 });

    this.content = this.add.container(0, this.viewTop);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, this.viewTop, W, this.viewH);
    this.content.setMask(shape.createGeometryMask());

    this.scrollY = 0; this.maxScroll = 0;
    this.dragging = false;
    this.input.on('pointerdown', (p) => {
      if (p.y < this.viewTop || p.y > this.viewTop + this.viewH) return;
      this.dragging = true; this.lastY = p.y;
    });
    this.input.on('pointermove', (p) => {
      if (!this.dragging) return;
      const dy = p.y - this.lastY; this.lastY = p.y;
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy, -this.maxScroll, 0);
      this.content.y = this.viewTop + this.scrollY;
    });
    this.input.on('pointerup', () => { this.dragging = false; });

    this.build();
    UI.fadeIn(this, 400);
  }

  build() {
    const W = GAME.WIDTH;
    let y = 16;

    DAY08.review.days.forEach((d) => {
      const value = d.key ? JourneyText.value(d.key, null) : null;
      const done = SaveSystem.get('dayCompleted.day' + d.n, false);

      const title = this.add.text(42, y + 14, d.title,
        UI.style(FONT.small, done ? PAL.sunDeep : PAL.inkSoft)).setAlpha(done ? 1 : 0.7);
      const line = this.add.text(42, y + 42, d.line,
        UI.style(17, done ? PAL.ink : PAL.inkSoft, { wordWrap: { width: W - 100 } }))
        .setAlpha(done ? 1 : 0.6);
      const echo = value
        ? this.add.text(42, y + 44 + line.height + 12, '· ' + String(value),
            UI.style(14, PAL.clay, { wordWrap: { width: W - 100 }, lineSpacing: 3 }))
        : null;

      /* 카드는 안에 담긴 글만큼만 자랍니다 */
      const h = (echo ? (echo.y + echo.height) : (line.y + line.height)) - y + 18;
      const card = this.add.graphics();
      card.fillStyle(HEX(PAL.paper), done ? 0.96 : 0.34);
      card.fillRoundedRect(24, y, W - 48, h, 16);
      this.content.add(card);
      this.content.add(title);
      this.content.add(line);
      if (echo) this.content.add(echo);

      const cards = Collection.countOfDay(d.n);
      this.content.add(this.add.text(W - 42, y + 14, '말씀 ' + cards,
        UI.style(12, PAL.inkSoft)).setOrigin(1, 0).setAlpha(0.8));

      y += h + 14;
    });

    /* 마지막 장 — MY CARD */
    const plan = SaveSystem.get('lifePlan', null);
    const becoming = SaveSystem.get('finalCard.becoming', null);
    if (plan || becoming) {
      const card = this.add.graphics();
      const h = becoming ? 168 : 128;
      card.fillStyle(HEX(PAL.sun), 0.2);
      card.fillRoundedRect(24, y, W - 48, h, 16);
      card.lineStyle(2, HEX(PAL.sun), 0.7);
      card.strokeRoundedRect(24, y, W - 48, h, 16);
      this.content.add(card);
      this.content.add(this.add.text(W / 2, y + 20, DAY08.card.title,
        UI.style(18, PAL.sun)).setOrigin(0.5, 0));
      this.content.add(this.add.text(W / 2, y + 52, DAY08.card.sub,
        UI.style(12, '#cbbfae')).setOrigin(0.5, 0));
      this.content.add(this.add.text(W / 2, y + 76, plan || '한 걸음',
        UI.style(19, PAL.cream, { align: 'center', wordWrap: { width: W - 96 }, lineSpacing: 6 }))
        .setOrigin(0.5, 0));
      if (becoming) {
        this.content.add(this.add.text(W / 2, y + 124, '“' + becoming + '”',
          UI.style(14, '#cbbfae', { align: 'center', wordWrap: { width: W - 96 } }))
          .setOrigin(0.5, 0));
      }
      y += h + 14;
    }

    const walk = SaveSystem.get('reflections.day8Walk', null);
    if (walk) {
      this.content.add(this.add.text(W / 2, y + 6, DAY08.note.lastQ,
        UI.style(12, '#8fa5c8')).setOrigin(0.5, 0));
      this.content.add(this.add.text(W / 2, y + 30, walk,
        UI.style(16, PAL.cream, { align: 'center', wordWrap: { width: W - 80 }, lineSpacing: 6 }))
        .setOrigin(0.5, 0));
      y += 84;
    }

    this.content.add(this.add.text(W / 2, y + 10, GAME.CORE_LINE,
      UI.style(FONT.small, PAL.clay, { align: 'center', lineSpacing: 6 })).setOrigin(0.5, 0));
    y += 80;

    this.maxScroll = Math.max(0, y - this.viewH);
  }

  close() {
    UI.fadeOut(this, 400, () => this.scene.start(this.from, { returning: true }));
  }
};
