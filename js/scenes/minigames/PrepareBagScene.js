/* 미니게임 · 나갈 준비 — 정답도 실패도 없습니다. */

window.PrepareBagScene = class PrepareBagScene extends MiniGameScene {
  constructor() { super('PrepareBagScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#4a6482',
      title: DAY02.prepare.title,
      hint: DAY02.prepare.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.picked = [];
    this.max = 3;

    const floor = this.add.graphics().setDepth(-1);
    floor.fillStyle(HEX('#3d5470'), 1); floor.fillRect(0, 520, W, H - 520);
    floor.fillStyle(HEX(PAL.wood), 1); floor.fillRect(0, 508, W, 16);

    /* 가방 */
    this.add.image(W / 2, 640, 'bag').setScale(2.6).setDepth(10);
    this.slotG = this.add.graphics().setDepth(12);
    this.countText = this.add.text(W / 2, 726, '', UI.style(FONT.small, '#dfd2bd')).setOrigin(0.5).setDepth(12);

    /* 물건들 */
    const items = DAY02.prepare.items;
    this.cards = [];
    const cols = 2, bw = 150, bh = 62, gapX = 22, gapY = 14;
    items.forEach((it, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = W / 2 + (col === 0 ? -(bw / 2 + gapX / 2) : (bw / 2 + gapX / 2));
      const y = 168 + row * (bh + gapY);
      const b = UI.button(this, x, y, bw, bh, it.name, () => this.toggle(it, b), { size: FONT.small });
      b.itemId = it.id;
      this.cards.push(b);
    });

    this.goBtn = UI.button(this, W / 2, 470, 220, 58, '가방 들기', () => this.finish(),
      { size: FONT.label, fill: PAL.sun });
    this.goBtn.setVisible(false);

    this.refresh();
  }

  toggle(item, btn) {
    const i = this.picked.indexOf(item.id);
    if (i >= 0) this.picked.splice(i, 1);
    else {
      if (this.picked.length >= this.max) {
        this.setHint('세 가지만 넣을 수 있어요. 하나를 빼고 골라보세요.');
        return;
      }
      this.picked.push(item.id);
    }
    AudioSystem.tap();
    this.refresh();
  }

  refresh() {
    const W = GAME.WIDTH;
    this.cards.forEach((b) => {
      const on = this.picked.indexOf(b.itemId) !== -1;
      b.setAlpha(on ? 1 : 0.72);
      b.setScale(on ? 1.04 : 1);
    });

    this.slotG.clear();
    this.picked.forEach((id, i) => {
      const item = DAY02.prepare.items.find(x => x.id === id);
      this.slotG.fillStyle(HEX(PAL.paper), 0.95);
      this.slotG.fillRoundedRect(W / 2 - 108 + i * 74, 604, 66, 34, 8);
    });
    if (this.labels) this.labels.forEach(t => t.destroy());
    this.labels = this.picked.map((id, i) => {
      const item = DAY02.prepare.items.find(x => x.id === id);
      return this.add.text(GAME.WIDTH / 2 - 75 + i * 74, 621, item.name,
        UI.style(13, PAL.ink)).setOrigin(0.5).setDepth(13);
    });

    this.countText.setText('가방에 ' + this.picked.length + ' / ' + this.max);
    this.goBtn.setVisible(this.picked.length === this.max);
    if (this.picked.length === this.max) this.setHint('준비가 됐다면 가방을 들어보세요.');
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    SaveSystem.set('reflections.day2Packed', this.picked.slice());
    AudioSystem.chime();
    this.leave();
  }
};
