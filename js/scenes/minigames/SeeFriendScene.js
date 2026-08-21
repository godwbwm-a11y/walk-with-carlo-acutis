/* 미니게임 · 이번에는 네가 선택한다 — 선택지가 먼저 나오지 않습니다.
   DAY 4 에서 배운 대로, 먼저 바라봅니다. */

window.SeeFriendScene = class SeeFriendScene extends MiniGameScene {
  constructor() { super('SeeFriendScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#d8cdb6', warm: true,
      title: DAY08.see.title, hint: ''
    });
    this.titleText.setColor(PAL.ink);
    this.hintText.setColor(PAL.inkSoft);

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.found = [];
    this.stage = [];

    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0xe8dcc2, 1); g.fillRect(0, 130, W, 426);
    g.fillStyle(0xd7c9ac, 1); g.fillRect(0, 556, W, H - 556);
    g.fillStyle(0xcbbb9c, 1); g.fillRect(0, 550, W, 10);

    /* 배경 인물은 선택지 아래에 머뭅니다 */
    this.friend = this.add.image(W / 2, 480, 'friend_front').setDepth(-20).setScale(2.2);
    this.tweens.add({ targets: this.friend, y: 475, duration: 1000, yoyo: true, repeat: -1 });
    this.add.image(W / 2, 534, 'desk').setDepth(-18).setScale(1.25);
    this.me = this.add.image(96, 660, 'player_back').setDepth(-16).setScale(1.4);

    this.time.delayedCall(500, () => {
      this.dialogue.play(DAY08.see.open, () => this.watch());
    });
  }

  clearStage() {
    (this.stage || []).forEach(o => { if (o && o.destroy) o.destroy(); });
    this.stage = [];
  }

  /* 세 장면을 오래 바라봅니다 */
  watch() {
    const W = GAME.WIDTH;
    this.setHint(DAY08.see.holdHint);
    this.moments = [];

    let y = 210;
    DAY08.see.moments.forEach((m, i) => {
      const c = this.add.container(W / 2, y).setDepth(70);
      const g = this.add.graphics();
      g.fillStyle(0xf3ece2, 0.5); g.fillRoundedRect(-152, -34, 304, 68, 12);
      g.lineStyle(2, HEX(PAL.sunDeep), 0.4); g.strokeRoundedRect(-152, -34, 304, 68, 12);
      c.add(g);
      const t = this.add.text(0, 0, m.scene, UI.style(FONT.small, PAL.inkSoft, {
        align: 'center', wordWrap: { width: 274 }
      })).setOrigin(0.5);
      c.add(t);
      const ring = this.add.graphics();
      c.add(ring);
      c.setSize(304, 76);
      c.setInteractive();
      c.info = m; c.label = t; c.ring = ring; c.hold = 0; c.done = false;
      c.on('pointerdown', () => { if (!c.done) c.holding = true; });
      c.on('pointerup', () => { c.holding = false; });
      c.on('pointerout', () => { c.holding = false; });
      this.moments.push(c);
      this.stage.push(c);
      y += 84;
    });
  }

  update(time, delta) {
    if (!this.moments) return;
    this.moments.forEach((c) => {
      if (c.done) return;
      if (c.holding) c.hold += delta; else c.hold = Math.max(0, c.hold - delta * 1.6);
      c.ring.clear();
      if (c.hold > 40) {
        const p = Math.min(1, c.hold / 1000);
        c.ring.fillStyle(HEX(PAL.sun), 0.28);
        c.ring.fillRoundedRect(-152, -34, 304 * p, 68, 12);
      }
      if (c.hold >= 1000) this.reveal(c);
    });
  }

  reveal(c) {
    c.done = true; c.holding = false;
    c.ring.clear();
    c.disableInteractive();
    c.label.setText('“' + c.info.found + '”').setColor(PAL.clay);
    this.found.push(c.info.found);
    AudioSystem.found();
    this.tweens.add({ targets: c, scale: 1.03, duration: 200, yoyo: true });

    if (this.found.length >= this.moments.length) {
      this.time.delayedCall(900, () => this.choose());
    }
  }

  /* 무엇을 말해줄지는 플레이어가 고릅니다 */
  choose() {
    const W = GAME.WIDTH;
    this.setHint(DAY08.see.pick);
    this.moments.forEach((c) => {
      c.setInteractive();
      c.removeAllListeners('pointerup');
      c.on('pointerup', () => this.say(c.info.found));
      c.list[0].clear();
      c.list[0].fillStyle(HEX(PAL.paper), 0.95);
      c.list[0].fillRoundedRect(-152, -34, 304, 68, 12);
      c.list[0].lineStyle(2, HEX(PAL.sunDeep), 0.8);
      c.list[0].strokeRoundedRect(-152, -34, 304, 68, 12);
    });
  }

  say(word) {
    SaveSystem.set('reflections.day8SaidTo', word);
    AudioSystem.select();
    this.clearStage();
    this.moments = null;
    this.setHint('');

    this.dialogue.play(DAY08.see.say.concat([{ s: '나', t: word }]).concat(DAY08.see.reply), () => {
      this.mirror();
    });
  }

  /* DAY 4 의 거울이 잠깐 겹칩니다 */
  mirror() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const veil = this.add.graphics().setDepth(300);
    veil.fillStyle(0x2b3550, 0.9); veil.fillRect(0, 0, W, H);
    veil.setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 800 });

    const t = this.add.text(W / 2, 240, DAY08.see.mirror, UI.style(FONT.small, '#cbd8ea'))
      .setOrigin(0.5).setDepth(310).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 700, delay: 300 });

    const mine = (SaveSystem.get('reflections.day4Strengths', []) || []).slice(0, 3);
    const list = mine.length ? mine : ['잘 들어준다'];
    const rows = [];
    list.forEach((s, i) => {
      const r = this.add.text(W / 2, 320 + i * 42, s, UI.style(21, PAL.sun, {
        align: 'center', wordWrap: { width: W - 80 }
      })).setOrigin(0.5).setDepth(310).setAlpha(0);
      this.tweens.add({ targets: r, alpha: 1, duration: 700, delay: 700 + i * 300 });
      rows.push(r);
    });

    this.time.delayedCall(2600 + list.length * 300, () => {
      this.tweens.add({
        targets: [veil, t].concat(rows), alpha: 0, duration: 800,
        onComplete: () => {
          [veil, t].concat(rows).forEach(o => o.destroy());
          this.dialogue.play(DAY08.see.realize, () => {
            this.complete(['오늘은 내가 먼저 말을 건넸다.']);
          });
        }
      });
    });
  }
};
