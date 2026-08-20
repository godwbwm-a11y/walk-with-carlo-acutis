/* 미니게임 · 30분 전 — 빨리 하는 것이 목표가 아닙니다. */

window.ReadyScene = class ReadyScene extends MiniGameScene {
  constructor() { super('ReadyScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#4a6482',
      title: DAY03.ready.title,
      hint: DAY03.ready.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.picked = [];
    this.max = 3;

    const room = this.add.graphics().setDepth(-1);
    room.fillStyle(HEX('#3d5470'), 1); room.fillRect(0, 560, W, H - 560);
    room.fillStyle(HEX(PAL.wood), 1); room.fillRect(0, 548, W, 16);

    this.add.image(W / 2, 660, 'bag').setScale(2.2).setDepth(6).setAlpha(0.9);
    this.doneText = this.add.text(W / 2, 742, '', UI.style(FONT.small, '#dfd2bd')).setOrigin(0.5).setDepth(8);

    const items = DAY03.ready.items;
    this.cards = [];
    const cols = 2, bw = 152, bh = 58, gapX = 20, gapY = 12;
    items.forEach((it, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = W / 2 + (col === 0 ? -(bw / 2 + gapX / 2) : (bw / 2 + gapX / 2));
      const y = 172 + row * (bh + gapY);
      const b = UI.button(this, x, y, bw, bh, it.name, () => this.pick(it, b), { size: FONT.small });
      b.item = it;
      this.cards.push(b);
    });

    this.log = this.add.text(W / 2, 462, '', UI.style(FONT.small, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(8);

    this.goBtn = UI.button(this, W / 2, 520, 230, 58, '준비 끝', () => this.finish(),
      { size: FONT.label, fill: PAL.sun });
    this.goBtn.setVisible(false);

    this.refresh();
  }

  pick(item, btn) {
    if (this.busy || this.finished) return;
    if (this.picked.indexOf(item.id) !== -1) return;
    if (this.picked.length >= this.max) { this.setHint('세 가지면 충분해요.'); return; }

    this.picked.push(item.id);
    btn.setAlpha(0.55);
    btn.disableInteractive();
    AudioSystem.tap();

    if (item.id === 'phone') { this.phoneMoment(); return; }
    this.log.setText(item.line || '');
    this.refresh();
  }

  /* 스마트폰을 챙기는 순간 */
  phoneMoment() {
    this.busy = true;
    const R = DAY03.ready;
    const list = R.phoneAlerts.map(a => '· ' + a).join('\n');
    this.dialogue.say([R.phoneQ, list], () => {
      this.dialogue.choose('', R.phoneChoices, (key) => {
        SaveSystem.set('reflections.day3Phone', key);
        this.dialogue.say(R.phoneReply[key], () => {
          this.busy = false;
          this.log.setText('');
          this.refresh();
        });
      });
    });
  }

  refresh() {
    this.doneText.setText('준비한 것  ' + this.picked.length + ' / ' + this.max);
    const done = this.picked.length >= this.max;
    this.goBtn.setVisible(done);
    if (done) this.setHint('서두르지 않아도 괜찮아요.');
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    SaveSystem.set('reflections.day3Ready', this.picked.slice());
    AudioSystem.chime();
    this.leave();
  }
};
