/* 미니게임 · 천천히 바라보기 — 시간 제한은 없습니다.
   바로 누르면 이름만, 조금 오래 보면 그 사람의 작은 필요가 보입니다. */

window.NoticeScene = class NoticeScene extends MiniGameScene {
  constructor() { super('NoticeScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#cfc7b0', warm: true,
      title: DAY07.notice.title, hint: DAY07.notice.hint
    });
    this.titleText.setColor(PAL.ink);
    this.hintText.setColor(PAL.inkSoft);

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.seen = 0;

    /* 동네의 오후 */
    this.add.image(W / 2, 0, 'sky_ordinary').setOrigin(0.5, 0).setDisplaySize(W, 260).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0x9fae86, 1); g.fillRect(0, 240, W, 180);
    g.fillStyle(0xc7bda6, 1); g.fillRect(0, 420, W, H - 420);
    g.fillStyle(0xd3caB4 & 0xffffff, 1);
    this.add.image(56, 300, 'tree_big').setDepth(300).setScale(0.9).setAlpha(0.95);
    this.add.image(336, 306, 'tree_big').setDepth(306).setScale(0.8).setAlpha(0.9);
    this.add.image(W / 2, 356, 'bench').setDepth(356).setScale(1.0);

    /* 네 사람 */
    this.people = [];
    const spots = [[86, 520], [286, 520], [86, 680], [286, 680]];
    DAY07.notice.people.forEach((p, i) => {
      const c = this.add.container(spots[i][0], spots[i][1]).setDepth(500 + i);
      const img = this.add.image(0, -30, p.tex).setScale(1.5);
      c.add(img);
      const label = this.add.text(0, 26, p.first, UI.style(13, PAL.ink, {
        align: 'center', wordWrap: { width: 130 }
      })).setOrigin(0.5, 0);
      c.add(label);

      /* 오래 보고 있음을 알려주는 고리 */
      const ring = this.add.graphics();
      c.add(ring);

      c.setSize(140, 120);
      c.setInteractive();
      c.info = p; c.label = label; c.ring = ring; c.hold = 0; c.found = false;
      c.on('pointerdown', () => { if (!c.found) c.holding = true; });
      c.on('pointerup', () => { c.holding = false; });
      c.on('pointerout', () => { c.holding = false; });
      this.people.push(c);
    });

    this.counter = this.add.text(W - 24, 128, '', UI.style(FONT.small, PAL.inkSoft))
      .setOrigin(1, 0.5).setDepth(820);
    this.refresh();

    this.time.delayedCall(900, () => this.setHint(DAY07.notice.holdHint));
  }

  refresh() {
    this.counter.setText(DAY07.notice.counter + this.seen + ' / ' + this.people.length);
  }

  update(time, delta) {
    if (!this.people) return;
    this.people.forEach((c) => {
      if (c.found) return;
      if (c.holding) c.hold += delta; else c.hold = Math.max(0, c.hold - delta * 1.6);

      c.ring.clear();
      if (c.hold > 40) {
        const p = Math.min(1, c.hold / 1100);
        c.ring.lineStyle(4, HEX(PAL.sunDeep), 0.85);
        c.ring.beginPath();
        c.ring.arc(0, -26, 44, Phaser.Math.DegToRad(-90),
          Phaser.Math.DegToRad(-90 + 360 * p));
        c.ring.strokePath();
      }
      if (c.hold >= 1100) this.reveal(c);
    });
  }

  reveal(c) {
    c.found = true;
    c.holding = false;
    c.ring.clear();
    c.disableInteractive();
    c.label.setText(c.info.found).setColor(PAL.clay);
    this.tweens.add({ targets: c.label, alpha: 0.3, duration: 200, yoyo: true, repeat: 1 });
    AudioSystem.found();
    this.seen++;
    this.refresh();

    if (this.seen >= this.people.length) {
      this.time.delayedCall(900, () => this.finish());
    }
  }

  finish() {
    if (this.finished) return;
    SaveSystem.set('reflections.day7Noticed', this.seen);
    this.setHint(DAY07.notice.done);
    this.time.delayedCall(1400, () => {
      this.dialogue.play(DAY07.notice.talk, () => {
        this.setHint('');
        this.complete([DAY07.notice.done]);
      });
    });
  }
};
