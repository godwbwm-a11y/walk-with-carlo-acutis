/* 미니게임 · 밤거리에서 나누기 — 가롤로는 어머니와 끓인 수프를 담아
   밀라노의 밤거리로 나갔고, 용돈을 모아 침낭을 사서 건넸습니다. */

window.NightShareScene = class NightShareScene extends MiniGameScene {
  constructor() { super('NightShareScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: 'b9', bg: '#1b2740',
      title: '밤거리에서',
      hint: '필요한 것을 끌어다 건네 보세요.'
    });

    const W = GAME.WIDTH;

    this.buildStreet();

    /* 세 사람과 각자에게 필요한 것 */
    this.people = [
      { x: 70, y: 452, need: 'soup', want: '따뜻한 거…', thanks: '고마워요. 손이 녹네.' },
      { x: 192, y: 470, need: 'bag', want: '추워요…', thanks: '이거… 이거 진짜 필요했어요.' },
      { x: 314, y: 452, need: 'bread', want: '배고파요…', thanks: '고맙습니다. 학생.' }
    ];
    this.people.forEach((p) => this.makePerson(p));

    /* 손수레 위의 것들 */
    this.items = [
      { key: 'soup', tex: 'soup_cup', label: '수프', x: 84, y: 664, scale: 1.25 },
      { key: 'bag', tex: 'sleep_bag', label: '침낭', x: 195, y: 666, scale: 1.05 },
      { key: 'bread', tex: 'bread_loaf', label: '빵', x: 306, y: 666, scale: 1.1 }
    ];
    this.items.forEach((it) => this.makeItem(it));

    this.left = this.people.length;
    this.progress = this.add.text(W / 2, 552, '', UI.style(FONT.small, '#dfd2bd')).setOrigin(0.5).setDepth(90);
    this.note = this.add.text(W / 2, 598, '', UI.style(FONT.small, PAL.sun, {
      align: 'center', wordWrap: { width: W - 60 }
    })).setOrigin(0.5).setDepth(90).setAlpha(0);
    this.refresh();

    this.input.on('drag', (p, obj, dx, dy) => {
      if (!obj.isItem) return;
      obj.x = dx; obj.y = dy;
    });
    this.input.on('dragstart', (p, obj) => { if (obj.isItem) obj.setDepth(300); });
    this.input.on('dragend', (p, obj) => { if (obj.isItem) this.drop(obj); });
  }

  /* ── 셔터 내린 가게들과 가로등 ───────────────── */
  buildStreet() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;

    const g = this.add.graphics().setDepth(-10);
    g.fillStyle(HEX('#141d33'), 1); g.fillRect(0, 120, W, 300);
    g.fillStyle(HEX('#1d2942'), 1); g.fillRect(0, 300, W, 160);
    /* 셔터 */
    for (let i = 0; i < 3; i++) {
      const x = 18 + i * 122;
      g.fillStyle(HEX('#2b3a56'), 1); g.fillRoundedRect(x, 236, 104, 172, 5);
      g.lineStyle(2, HEX('#22304a'), 1);
      for (let y = 244; y < 404; y += 9) g.lineBetween(x + 4, y, x + 100, y);
      g.fillStyle(HEX('#3a4c6e'), 1); g.fillRoundedRect(x, 228, 104, 12, 4);
    }
    /* 인도와 도로 */
    g.fillStyle(HEX('#39405a'), 1); g.fillRect(0, 408, W, 108);
    g.fillStyle(HEX('#2b3248'), 1); g.fillRect(0, 516, W, H - 516);
    g.fillStyle(HEX('#434b68'), 1); g.fillRect(0, 408, W, 5);
    g.fillStyle(HEX('#252b3e'), 1); g.fillRect(0, 516, W, 6);
    g.lineStyle(1, HEX('#454d69'), 0.8);
    for (let x = 0; x < W; x += 46) g.lineBetween(x, 413, x, 516);
    g.fillStyle(HEX('#4d5573'), 1);
    for (let x = 24; x < W; x += 66) g.fillRoundedRect(x, 588, 30, 4, 2);

    /* 가로등 불빛 */
    [70, 256].forEach((x) => {
      this.add.image(x, 240, 'streetlamp').setOrigin(0.5, 1).setDepth(-8).setScale(1.2);
      const glow = this.add.image(x, 176, 'lamp_glow').setDepth(-7).setAlpha(0.55).setScale(1.3);
      this.tweens.add({ targets: glow, alpha: 0.75, duration: 3400, yoyo: true, repeat: -1 });
      const pool = this.add.ellipse(x, 452, 200, 66, 0xffe0a8, 0.09).setDepth(-6);
      this.tweens.add({ targets: pool, alpha: 0.14, duration: 3400, yoyo: true, repeat: -1 });
    });

    /* 입김처럼 떠오르는 밤공기 */
    for (let i = 0; i < 8; i++) {
      const d = this.add.circle(Phaser.Math.Between(20, W - 20), Phaser.Math.Between(200, 440),
        Phaser.Math.FloatBetween(1.5, 3), 0xffffff, 0.18).setDepth(-5);
      this.tweens.add({
        targets: d, y: d.y - Phaser.Math.Between(50, 120), alpha: 0,
        duration: Phaser.Math.Between(4000, 7000), repeat: -1, delay: i * 400
      });
    }

    /* 손수레 */
    const cart = this.add.graphics().setDepth(40);
    cart.fillStyle(0x000000, 0.2); cart.fillRoundedRect(24, 630, W - 48, 96, 14);
    cart.fillStyle(HEX('#5c6b8a'), 1); cart.fillRoundedRect(22, 624, W - 44, 96, 14);
    cart.fillStyle(HEX('#6e7fa1'), 1); cart.fillRoundedRect(30, 630, W - 60, 22, 10);
    this.add.image(350, 640, 'soup_pot').setDepth(41).setScale(0.9);
  }

  makePerson(p) {
    p.spr = this.add.image(p.x, p.y, 'sitter').setOrigin(0.5, 1).setDepth(p.y).setScale(1.5);
    p.glow = this.add.image(p.x, p.y - 26, 'lamp_glow').setDepth(p.y - 1).setAlpha(0).setScale(0.8);

    /* 필요한 것을 말하는 작은 말풍선 */
    const t = this.add.text(p.x, p.y - 86, p.want, UI.style(14, PAL.ink)).setOrigin(0.5).setDepth(p.y + 3);
    const g = this.add.graphics().setDepth(p.y + 2);
    const w = t.width + 24, h = 32;
    g.fillStyle(0xffffff, 0.93);
    g.fillRoundedRect(p.x - w / 2, p.y - 86 - h / 2, w, h, 16);
    g.fillTriangle(p.x - 5, p.y - 72, p.x + 5, p.y - 72, p.x, p.y - 62);
    p.bubble = [g, t];
    this.tweens.add({ targets: [g, t], y: '-=5', duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  makeItem(it) {
    const c = this.add.container(it.x, it.y).setDepth(200);
    const img = this.add.image(0, -6, it.tex).setScale(it.scale);
    const label = this.add.text(0, 22, it.label, UI.style(13, PAL.cream)).setOrigin(0.5);
    c.add([img, label]);
    c.setSize(84, 76);
    c.isItem = true; c.kind = it.key;
    c.homeX = it.x; c.homeY = it.y;
    c.setInteractive({ draggable: true, useHandCursor: true });
    it.obj = c;
  }

  drop(item) {
    let target = null;
    this.people.forEach((p) => {
      if (p.done) return;
      if (Phaser.Math.Distance.Between(item.x, item.y, p.x, p.y - 34) < 78) target = p;
    });

    if (target && target.need === item.kind) { this.give(item, target); return; }

    if (target) {
      AudioSystem.back();
      this.showNote('지금 필요한 건 이게 아닌 것 같다.');
    }
    item.setDepth(200);
    this.tweens.add({ targets: item, x: item.homeX, y: item.homeY, duration: 380, ease: 'Sine.easeOut' });
  }

  give(item, p) {
    p.done = true;
    AudioSystem.found();

    /* 건넨 것은 그 사람 곁에 놓입니다 */
    this.tweens.add({
      targets: item, x: p.x + 26, y: p.y - 22, scale: 0.8, duration: 460, ease: 'Sine.easeInOut',
      onComplete: () => {
        item.setDepth(p.y + 1);
        item.list[1].setVisible(false);
        item.disableInteractive();
      }
    });

    this.tweens.add({ targets: p.glow, alpha: 0.5, duration: 900 });
    this.tweens.add({ targets: p.bubble, alpha: 0, duration: 400 });
    this.tweens.add({ targets: p.spr, scaleY: 1.56, duration: 300, yoyo: true });

    const th = this.add.text(p.x, p.y - 96, p.thanks,
      UI.style(14, PAL.cream, { align: 'center', wordWrap: { width: 150 } }))
      .setOrigin(0.5).setDepth(p.y + 6).setAlpha(0);
    this.tweens.add({ targets: th, alpha: 1, y: p.y - 104, duration: 700 });

    for (let i = 0; i < 5; i++) {
      const s = this.add.image(p.x, p.y - 40, 'spark').setDepth(p.y + 5).setScale(0.7);
      this.tweens.add({
        targets: s, x: s.x + Phaser.Math.Between(-24, 24), y: s.y - Phaser.Math.Between(20, 48),
        alpha: 0, duration: 1100, delay: i * 80, onComplete: () => s.destroy()
      });
    }

    this.left--;
    this.refresh();
    if (this.left === 0) this.time.delayedCall(1200, () => this.done());
  }

  refresh() {
    this.progress.setText(this.left > 0 ? '아직 기다리는 사람 ' + this.left + '명' : '');
  }

  showNote(t) {
    this.note.setText(t).setAlpha(0);
    this.tweens.add({ targets: this.note, alpha: 1, duration: 300 });
  }

  done() {
    this.setHint('');
    this.note.setVisible(false);
    this.complete([
      '수프도, 침낭도, 빵도 다 나갔다.',
      '손수레가 가벼워졌다.',
      '돌아가는 길에 아무도 칭찬해 주지 않았다.',
      { s: '가롤로', t: '원래 아무도 몰라.' },
      { s: '가롤로', t: '한 분은 아시고.' }
    ]);
  }
};
