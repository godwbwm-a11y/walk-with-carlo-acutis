/* 미니게임 · 순례길 — 빨리 도착하는 것이 목표가 아닙니다. 함께 도착하세요. */

window.PilgrimWalkScene = class PilgrimWalkScene extends MiniGameScene {
  constructor() { super('PilgrimWalkScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#c8bda6', warm: true,
      title: DAY06.walk.title, hint: DAY06.walk.hint
    });
    this.titleText.setColor(PAL.ink);
    this.hintText.setColor(PAL.inkSoft);

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.index = 0;
    this.together = 0;
    this.choices = [];

    /* 오후의 길 */
    this.add.image(W / 2, 0, 'sky_afternoon').setOrigin(0.5, 0).setDisplaySize(W, 300).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0x9aa984, 1); g.fillRect(0, 280, W, 120);
    this.road = this.add.tileSprite(W / 2, 560, W, 320, 'road_pilgrim').setDepth(-20);
    g.fillStyle(0x6f9b6a, 0.55);
    for (let x = -10; x < W + 20; x += 74) { g.fillCircle(x, 290, 26); }

    /* 앞서 걷는 순례자들 */
    this.walkers = [];
    [[60, 430], [150, 415], [250, 438], [330, 420], [110, 470], [300, 466]].forEach((p, i) => {
      const img = this.add.image(p[0], p[1], ['pilgrim_a', 'pilgrim_b', 'pilgrim_c', 'pilgrim_d', 'pilgrim_e', 'pilgrim_f'][i] + '_back')
        .setDepth(p[1]).setScale(0.95 + i * 0.03).setAlpha(0.9);
      this.tweens.add({ targets: img, y: p[1] - 5, duration: 700 + i * 90, yoyo: true, repeat: -1 });
      this.walkers.push(img);
    });

    this.me = this.add.image(150, 660, 'player_back').setDepth(660).setScale(1.42);
    this.carlo = this.add.image(238, 672, 'carlo_back').setDepth(672).setScale(1.42);
    this.bob = this.tweens.add({ targets: [this.me, this.carlo], y: '-=4', duration: 780, yoyo: true, repeat: -1 });

    this.counter = this.add.text(W - 24, 128, '', UI.style(FONT.small, PAL.inkSoft))
      .setOrigin(1, 0.5).setDepth(820);
    this.refresh();

    this.time.delayedCall(600, () => this.next());
  }

  refresh() {
    this.counter.setText(DAY06.walk.counter + this.together + ' / ' + DAY06.walk.events.length);
  }

  /* 길 위의 작은 사건들 */
  next() {
    if (this.index >= DAY06.walk.events.length) { this.finish(); return; }
    const e = DAY06.walk.events[this.index];

    this.roadMove(1200);
    this.time.delayedCall(1000, () => {
      const open = [];
      if (e.who) open.push({ s: e.who, t: e.ask });
      else open.push({ t: e.ask });
      open.push({ t: e.sub });
      const pre = e.pre ? e.pre.concat(open) : open;
      this.dialogue.play(pre, () => this.ask(e));
    });
  }

  roadMove(ms) {
    this.tweens.add({
      targets: this.road, tilePositionY: this.road.tilePositionY - 180,
      duration: ms, ease: 'Sine.easeInOut'
    });
    this.walkers.forEach((w, i) => {
      this.tweens.add({ targets: w, x: w.x + Phaser.Math.Between(-12, 12), duration: ms });
    });
  }

  ask(e) {
    const W = GAME.WIDTH;
    this.clearButtons();
    let y = 232;
    e.opts.forEach((o, i) => {
      const b = UI.button(this, W / 2, y, W - 74, 58, o.label, () => this.pick(e, o), { size: FONT.small });
      b.setDepth(820).setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 320, delay: i * 100 });
      this.buttons.push(b);
      y += 70;
    });
  }

  clearButtons() {
    (this.buttons || []).forEach(b => b.destroy());
    this.buttons = [];
  }

  /* 어떤 선택도 나무라지 않습니다 */
  pick(e, o) {
    this.clearButtons();
    this.choices.push(o.label);
    this.together++;
    this.refresh();
    AudioSystem.select();

    const lines = o.after.map(l => (typeof l === 'string' ? { t: l } : l));
    this.dialogue.play(lines, () => {
      this.index++;
      if (e.kind === 'bag') {
        this.setHint(DAY06.walk.lighter);
        this.time.delayedCall(1400, () => { this.setHint(DAY06.walk.hint); this.next(); });
      } else {
        this.next();
      }
    });
  }

  finish() {
    SaveSystem.set('reflections.day6Walk', this.choices.slice());
    this.roadMove(1600);
    this.time.delayedCall(1400, () => {
      this.dialogue.say(DAY06.walk.card, () => {
        this.cardId = 'b19';
        this.complete([DAY06.walk.lighter]);
      });
    });
  }
};
