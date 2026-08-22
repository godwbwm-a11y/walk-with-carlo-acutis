/* 미니게임 · 성체 기적 지도 — 가롤로가 열한 살에 시작해 2년 반 동안 만든
   《전 세계 성체 기적 전시》 홈페이지를 손으로 한 번 만들어 봅니다.
   여기에 담긴 네 곳은 실제로 그 전시에 실려 있는 곳들입니다. */

window.MiracleMapScene = class MiracleMapScene extends MiniGameScene {
  constructor() { super('MiracleMapScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: 'b11', bg: '#2b3b60',
      title: '성체 기적 지도',
      hint: '아래 카드를 끌어 지도 위 나라에 놓아 보세요.'
    });

    const W = GAME.WIDTH;

    this.places = [
      { id: 'it', country: '이탈리아', x: 236, y: 300 },
      { id: 'pt', country: '포르투갈', x: 128, y: 322 },
      { id: 'nl', country: '네덜란드', x: 206, y: 236 },
      { id: 'ar', country: '아르헨티나', x: 114, y: 474 }
    ];

    this.cards = [
      { id: 'it', title: '란치아노', sub: '8세기' },
      { id: 'nl', title: '암스테르담', sub: '1345년' },
      { id: 'pt', title: '산타렘', sub: '1247년' },
      { id: 'ar', title: '부에노스아이레스', sub: '1996년' }
    ];
    Phaser.Utils.Array.Shuffle(this.cards);

    this.left = this.cards.length;
    this.index = 0;

    this.buildBrowser();
    this.buildMap();
    this.buildPins();

    this.progress = this.add.text(W / 2, 608, '', UI.style(FONT.small, '#dfd2bd')).setOrigin(0.5).setDepth(60);
    this.note = this.add.text(W / 2, 634, '', UI.style(FONT.small, PAL.sun, {
      align: 'center', wordWrap: { width: W - 60 }
    })).setOrigin(0.5).setDepth(60).setAlpha(0);

    this.input.on('drag', (p, obj, dx, dy) => {
      if (!obj.isCard || obj.placed || this.reading) return;
      obj.x = dx; obj.y = dy;
    });
    this.input.on('dragstart', (p, obj) => { if (obj.isCard) obj.setDepth(200); });
    this.input.on('dragend', (p, obj) => { if (obj.isCard) this.drop(obj); });

    this.nextCard();
  }

  /* ── 2005년의 브라우저 창 ───────────────────── */
  buildBrowser() {
    const W = GAME.WIDTH;
    const g = this.add.graphics().setDepth(-2);
    g.fillStyle(0x000000, 0.18); g.fillRoundedRect(20, 132, W - 40, 466, 10);
    g.fillStyle(HEX('#d9d3c4'), 1); g.fillRoundedRect(18, 128, W - 36, 466, 10);
    g.fillStyle(HEX('#b8b1a1'), 1); g.fillRoundedRect(18, 128, W - 36, 34, { tl: 10, tr: 10, bl: 0, br: 0 });
    [0xc9553f, 0xe0954a, 0x7fa96b].forEach((c, i) => {
      g.fillStyle(c, 1); g.fillCircle(36 + i * 16, 145, 5);
    });
    g.fillStyle(HEX('#f3ece2'), 1); g.fillRoundedRect(76, 137, W - 110, 17, 8);

    this.add.text(84, 145, 'www.miracolieucaristici.org', UI.style(11, PAL.inkSoft))
      .setOrigin(0, 0.5).setDepth(-1);
    this.add.text(W / 2, 178, '전 세계 성체 기적 전시', UI.style(FONT.body, PAL.ink))
      .setOrigin(0.5).setDepth(-1);
  }

  /* ── 아주 단순하게 그린 세계 지도 ───────────── */
  buildMap() {
    const W = GAME.WIDTH;
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(HEX('#a9c8dd'), 1);
    g.fillRoundedRect(30, 198, W - 60, 372, 8);

    const land = HEX('#cbb98f'), landHi = HEX('#dbc9a0');

    /* 북아메리카 */
    g.fillStyle(land, 1);
    g.fillEllipse(92, 250, 100, 74);
    g.fillEllipse(120, 288, 56, 44);
    /* 남아메리카 */
    g.fillEllipse(116, 470, 62, 96);
    g.fillEllipse(126, 420, 68, 62);
    /* 아프리카 */
    g.fillEllipse(238, 420, 86, 116);
    /* 아시아 */
    g.fillEllipse(320, 280, 120, 96);
    /* 오세아니아 */
    g.fillEllipse(336, 494, 54, 40);

    /* 유럽 — 이 지도에서는 조금 크게 그렸습니다 */
    g.fillStyle(landHi, 1);
    g.fillEllipse(196, 274, 130, 110);
    g.fillEllipse(150, 316, 54, 48);
    g.fillEllipse(240, 306, 56, 50);

    g.lineStyle(2, HEX('#b0a07a'), 0.7);
    g.strokeEllipse(196, 274, 130, 110);

    this.add.text(150, 206, '유럽', UI.style(13, PAL.inkSoft)).setOrigin(0.5).setDepth(1).setAlpha(0.7);
  }

  buildPins() {
    this.pinObjs = {};
    this.places.forEach((pl) => {
      const c = this.add.container(pl.x, pl.y).setDepth(20);
      const ring = this.add.circle(0, 0, 21, 0xffffff, 0.35);
      const dot = this.add.circle(0, 0, 8, HEX('#7a5f8a'), 0.9);
      const label = this.add.text(0, 26, pl.country, UI.style(13, PAL.ink)).setOrigin(0.5);
      const lg = this.add.graphics();
      lg.fillStyle(0xffffff, 0.85);
      lg.fillRoundedRect(-label.width / 2 - 7, 17, label.width + 14, 19, 9);
      c.add([ring, dot, lg, label]);
      this.tweens.add({ targets: ring, scale: 1.25, alpha: 0.12, duration: 1800, yoyo: true, repeat: -1 });
      this.pinObjs[pl.id] = { c: c, ring: ring, dot: dot, label: label, lg: lg, place: pl, done: false };
    });
  }

  nextCard() {
    const W = GAME.WIDTH;
    this.progress.setText('모은 기적  ' + (this.cards.length - this.left) + ' / ' + this.cards.length);
    if (this.left === 0) { this.time.delayedCall(700, () => this.finishSite()); return; }

    const data = this.cards[this.index++];
    const c = this.add.container(W / 2, 686).setDepth(150);
    const g = this.add.graphics();
    const w = 230, h = 66;
    g.fillStyle(0x000000, 0.18); g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 14);
    g.fillStyle(HEX(PAL.paper), 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    g.lineStyle(2, HEX(PAL.sunDeep), 0.7); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    const t1 = this.add.text(4, -12, data.title, UI.style(19, PAL.ink)).setOrigin(0.5);
    const t2 = this.add.text(4, 14, data.sub, UI.style(14, PAL.inkSoft)).setOrigin(0.5);
    const icon = this.add.image(-w / 2 + 24, 0, 'map_pin').setScale(0.7);
    c.add([g, t1, t2, icon]);
    c.setSize(w + 16, h + 16);
    c.isCard = true; c.data2 = data;
    c.setInteractive({ draggable: true, useHandCursor: true });
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, y: 680, duration: 400 });
    this.card = c;
  }

  drop(card) {
    const target = this.pinObjs[card.data2.id];
    const d = Phaser.Math.Distance.Between(card.x, card.y, target.place.x, target.place.y);

    if (d < 58 && !target.done) { this.place(card, target); return; }

    /* 다른 나라에 놓았을 때 — 나무라지 않습니다 */
    let wrong = null;
    Object.keys(this.pinObjs).forEach((k) => {
      const p = this.pinObjs[k];
      if (p.done) return;
      if (Phaser.Math.Distance.Between(card.x, card.y, p.place.x, p.place.y) < 58) wrong = p;
    });

    AudioSystem.back();
    this.showNote(wrong
      ? '음… ' + card.data2.title + '은(는) ' + wrong.place.country + '이 아닌 것 같다.'
      : '지도 위 나라에 놓아 보자.');
    this.tweens.add({ targets: card, x: GAME.WIDTH / 2, y: 680, duration: 420, ease: 'Sine.easeOut' });
    card.setDepth(150);
  }

  place(card, target) {
    target.done = true;
    card.placed = true;
    card.disableInteractive();
    AudioSystem.found();

    this.tweens.killTweensOf(target.ring);
    target.dot.setFillStyle(HEX(PAL.sun), 1);
    target.ring.setFillStyle(HEX(PAL.sun), 0.35);
    this.tweens.add({ targets: target.ring, scale: 1.7, alpha: 0.1, duration: 700 });

    const pin = this.add.image(target.place.x, target.place.y - 6, 'map_pin').setDepth(30).setScale(0);
    this.tweens.add({ targets: pin, scale: 1, duration: 420, ease: 'Back.easeOut' });

    /* 나라 이름표는 도시 이름표로 바뀝니다 */
    target.label.setVisible(false);
    target.lg.setVisible(false);
    const tag = this.add.text(target.place.x, target.place.y + 26,
      card.data2.title + ' · ' + card.data2.sub, UI.style(12, PAL.ink)).setOrigin(0.5).setDepth(31);
    const tg = this.add.graphics().setDepth(30);
    tg.fillStyle(HEX(PAL.sun), 0.94);
    tg.fillRoundedRect(target.place.x - tag.width / 2 - 8, target.place.y + 16, tag.width + 16, 20, 10);

    this.tweens.add({
      targets: card, x: target.place.x, y: target.place.y, scale: 0.2, alpha: 0,
      duration: 420, ease: 'Sine.easeIn', onComplete: () => card.destroy()
    });

    for (let i = 0; i < 6; i++) {
      const s = this.add.image(target.place.x, target.place.y, 'spark').setDepth(40).setScale(0.8);
      this.tweens.add({
        targets: s, x: s.x + Phaser.Math.Between(-30, 30), y: s.y - Phaser.Math.Between(14, 40),
        alpha: 0, duration: 900, delay: i * 60, onComplete: () => s.destroy()
      });
    }

    this.left--;
    const info = card.data2;
    this.showNote('찾았다. ' + info.title + ' · ' + target.place.country);
    this.time.delayedCall(700, () => this.openArticle(info.id, () => this.nextCard()));
  }

  /* ── 맞힌 기적의 이야기를 읽는 창 ─────────────── */
  openArticle(id, onClose) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const M = CARLO_DAY.miracles[id];
    if (!M) { if (onClose) onClose(); return; }

    this.reading = true;
    if (this.closeBtn) this.closeBtn.setVisible(false);

    const top = 92, bot = 730;
    const viewTop = top + 46, viewH = bot - viewTop - 16;

    const layer = this.add.container(0, 0).setDepth(400);
    const scrim = this.add.graphics();
    scrim.fillStyle(HEX('#2b3b60'), 1); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    /* 2005년의 브라우저 창 그대로 */
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.2); g.fillRoundedRect(20, top + 5, W - 40, bot - top, 10);
    g.fillStyle(HEX('#d9d3c4'), 1); g.fillRoundedRect(18, top, W - 36, bot - top, 10);
    g.fillStyle(HEX('#b8b1a1'), 1); g.fillRoundedRect(18, top, W - 36, 34, { tl: 10, tr: 10, bl: 0, br: 0 });
    [0xc9553f, 0xe0954a, 0x7fa96b].forEach((c, i) => { g.fillStyle(c, 1); g.fillCircle(36 + i * 16, top + 17, 5); });
    g.fillStyle(HEX(PAL.paper), 1); g.fillRoundedRect(26, viewTop - 4, W - 52, viewH + 8, 8);
    layer.add(g);
    layer.add(this.add.text(W / 2, top + 17, 'miracolieucaristici.org', UI.style(11, PAL.ink))
      .setOrigin(0.5).setAlpha(0.75));

    /* 글은 잘라 보여주고, 끌어서 읽습니다 */
    const content = this.add.container(0, viewTop);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(26, viewTop, W - 52, viewH);
    content.setMask(shape.createGeometryMask());
    layer.add(content);

    let y = 14;
    const title = this.add.text(W / 2, y, M.title,
      UI.style(21, PAL.ink, { align: 'center', wordWrap: { width: W - 88 } })).setOrigin(0.5, 0);
    content.add(title); y += title.height + 6;

    const where = this.add.text(W / 2, y, M.where, UI.style(13, PAL.inkSoft)).setOrigin(0.5, 0);
    content.add(where); y += where.height + 14;

    const rule = this.add.graphics();
    rule.lineStyle(2, HEX(PAL.sun), 0.55); rule.lineBetween(56, y, W - 56, y);
    content.add(rule); y += 18;

    M.body.forEach((para) => {
      const t = this.add.text(42, y, para,
        UI.style(17, PAL.ink, { wordWrap: { width: W - 84 }, lineSpacing: 7 }));
      content.add(t);
      y += t.height + 16;
    });

    y += 8;
    const noteRule = this.add.graphics();
    noteRule.lineStyle(2, HEX(PAL.clay), 0.35); noteRule.lineBetween(56, y, W - 56, y);
    content.add(noteRule); y += 16;

    const note = this.add.text(W / 2, y, CARLO_DAY.miracleNote,
      UI.style(13, PAL.clay, { align: 'center', lineSpacing: 5 })).setOrigin(0.5, 0);
    content.add(note); y += note.height + 40;   // 아래 안내 문구와 겹치지 않도록

    /* 끌어서 넘겨보기 */
    let scrollY = 0;
    const maxScroll = Math.max(0, y - viewH);
    let dragging = false, lastY = 0, moved = 0;
    const onDown = (p) => {
      if (p.y < viewTop || p.y > viewTop + viewH) return;
      dragging = true; lastY = p.y; moved = 0;
    };
    const onMove = (p) => {
      if (!dragging) return;
      const dy = p.y - lastY; lastY = p.y; moved += Math.abs(dy);
      scrollY = Phaser.Math.Clamp(scrollY + dy, -maxScroll, 0);
      content.y = viewTop + scrollY;
    };
    const onUp = () => { dragging = false; };
    this.input.on('pointerdown', onDown);
    this.input.on('pointermove', onMove);
    this.input.on('pointerup', onUp);

    if (maxScroll > 0) {
      const hint = this.add.text(W / 2, bot + 9, CARLO_DAY.miracleScroll,
        UI.style(12, '#c9d6ea')).setOrigin(0.5, 0).setAlpha(0.85);
      layer.add(hint);
      this.tweens.add({ targets: hint, alpha: 0.3, duration: 1400, yoyo: true, repeat: -1 });
    }

    const back = UI.button(this, W / 2, H - 50, 240, 56, CARLO_DAY.miracleClose, () => {
      this.input.off('pointerdown', onDown);
      this.input.off('pointermove', onMove);
      this.input.off('pointerup', onUp);
      AudioSystem.back();
      this.tweens.add({
        targets: layer, alpha: 0, duration: 300,
        onComplete: () => {
          layer.destroy();
          this.reading = false;
          if (this.closeBtn && !this.finished) this.closeBtn.setVisible(true);
          if (onClose) onClose();
        }
      });
    }, { size: FONT.label, fill: PAL.sun });
    layer.add(back);

    layer.setAlpha(0);
    this.tweens.add({ targets: layer, alpha: 1, duration: 350 });
    AudioSystem.chime();
  }

  showNote(t) {
    this.note.setText(t).setAlpha(0);
    this.tweens.add({ targets: this.note, alpha: 1, duration: 300 });
  }

  finishSite() {
    this.note.setVisible(false);
    this.progress.setText('');
    this.setHint('');

    const W = GAME.WIDTH;
    const done = this.add.text(W / 2, 624, '기적 4곳이 지도에 올라갔다',
      UI.style(FONT.body, PAL.sun)).setOrigin(0.5).setDepth(60).setAlpha(0);
    this.tweens.add({ targets: done, alpha: 1, duration: 600 });

    /* 지도의 핀들이 하나씩 반짝입니다 */
    this.places.forEach((pl, i) => {
      this.time.delayedCall(200 + i * 220, () => {
        const g = this.add.image(pl.x, pl.y, 'lamp_glow').setDepth(25).setScale(0.5).setAlpha(0.7);
        this.tweens.add({ targets: g, scale: 1.1, alpha: 0, duration: 1200, onComplete: () => g.destroy() });
        AudioSystem.blip();
      });
    });

    this.complete([
      '지도 위에 불빛이 네 개 켜졌다.',
      '가롤로는 이걸 열한 살에 시작해서\n2년 반 동안 만들었다고 한다.',
      '혼자서, 학교를 다니면서.',
      { s: '나', t: '이걸 다 어떻게 찾았어?' },
      { s: '가롤로', t: '하나씩. 그냥 하나씩.' }
    ]);
  }
};
