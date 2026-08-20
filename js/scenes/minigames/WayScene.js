/* 미니게임 · 같이 가는 길 — 혼자 정답을 찾는 것이 아니라, 같이 길을 찾습니다.
   틀려도 되돌아가지 않습니다. 웃으며 다시 물어볼 뿐입니다. */

window.WayScene = class WayScene extends MiniGameScene {
  constructor() { super('WayScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#33415e',
      title: DAY05.way.title, hint: DAY05.way.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.step = 0;
    this.helped = 0;

    /* 환승 통로 */
    const g = this.add.graphics().setDepth(-40);
    g.fillStyle(0xdfe6ec, 1); g.fillRect(0, 120, W, 330);
    g.fillStyle(0x9aa6b2, 1); g.fillRect(0, 450, W, H - 450);
    g.fillStyle(0xa7b3bf, 0.7);
    for (let x = -20; x < W + 40; x += 70) g.fillRect(x, 470, 46, 6);
    g.fillStyle(0xc6ced7, 1); g.fillRect(0, 120, W, 10);

    this.me = this.add.image(112, 560, 'player_back').setDepth(560).setScale(1.5);
    this.other = this.add.image(272, 540, 'pilgrim_a').setDepth(540).setScale(1.5);
    this.tweens.add({ targets: [this.me, this.other], y: '-=4', duration: 700, yoyo: true, repeat: -1 });

    this.counter = this.add.text(W / 2, 720, '', UI.style(FONT.small, '#cbd8ea'))
      .setOrigin(0.5).setDepth(60);
    this.refreshCounter();

    this.time.delayedCall(600, () => this.dialogue.play(DAY05.way.open, () => this.next()));
  }

  refreshCounter() {
    this.counter.setText(DAY05.way.counter + this.helped + ' / 3');
  }

  next() {
    if (this.step >= DAY05.way.steps.length) { this.finish(); return; }
    const s = DAY05.way.steps[this.step];
    this.other.setTexture(['pilgrim_a', 'pilgrim_c', 'pilgrim_f'][this.step]);
    this.dialogue.say([{ s: s.who, t: s.ask }, { t: s.sub }], () => {
      if (s.kind === 'sign') this.signStep(s);
      else if (s.kind === 'map') this.mapStep(s);
      else this.joinStep(s);
    });
  }

  clearStage() {
    (this.stage || []).forEach(o => { if (o && o.destroy) o.destroy(); });
    this.stage = [];
  }

  /* 1 · 표지판에서 방향 고르기 */
  signStep(s) {
    const W = GAME.WIDTH;
    this.clearStage();
    let y = 210;
    s.signs.forEach((label, i) => {
      const b = UI.button(this, W / 2, y, W - 80, 62, label, () => {
        if (i === s.answer) { this.good(s); return; }
        AudioSystem.back();
        this.dialogue.say([{ s: 'Pilgrim', t: s.wrong }]);
      }, { size: FONT.small, fill: i === s.answer ? PAL.paper : PAL.paper });
      b.setDepth(60);
      this.stage.push(b);
      y += 78;
    });
  }

  /* 2 · 거꾸로 든 지도를 돌리기 */
  mapStep(s) {
    const W = GAME.WIDTH;
    this.clearStage();

    const map = this.add.container(W / 2, 280).setDepth(60);
    const mg = this.add.graphics();
    mg.fillStyle(0xf3ece2, 1); mg.fillRoundedRect(-88, -62, 176, 124, 10);
    mg.lineStyle(2, 0xd9c2a3, 1); mg.strokeRoundedRect(-88, -62, 176, 124, 10);
    mg.fillStyle(0x8fc0d9, 1); mg.fillRect(-70, -20, 140, 10);
    mg.fillStyle(0x6f9b6a, 1); mg.fillCircle(-40, 24, 12); mg.fillCircle(44, 10, 10);
    mg.fillStyle(0xc9553f, 1); mg.fillTriangle(0, -52, -10, -34, 10, -34);   // 북쪽 표시
    map.add(mg);
    map.add(this.add.text(0, 44, 'WYD', UI.style(15, PAL.inkSoft)).setOrigin(0.5));
    map.setAngle(180);
    this.stage.push(map);

    const hint = this.add.text(W / 2, 400, '지도를 좌우로 밀어 돌려보세요.',
      UI.style(FONT.small, '#cbd8ea')).setOrigin(0.5).setDepth(60);
    this.stage.push(hint);

    let last = null, done = false;
    this.input.on('pointermove', this.mapDrag = (p) => {
      if (done || !p.isDown) return;
      if (last === null) { last = p.x; return; }
      map.angle += (p.x - last) * 0.9;
      last = p.x;
    });
    this.input.on('pointerup', this.mapUp = () => {
      last = null;
      if (done) return;
      const a = Phaser.Math.Wrap(map.angle, -180, 180);
      if (Math.abs(a) < 26) {
        done = true;
        this.tweens.add({ targets: map, angle: 0, duration: 300 });
        this.time.delayedCall(360, () => this.good(s));
      } else {
        AudioSystem.tap();
      }
    });
  }

  /* 3 · 무리에 함께 서기 */
  joinStep(s) {
    const W = GAME.WIDTH;
    this.clearStage();

    const group = [];
    for (let i = 0; i < 5; i++) {
      const img = this.add.image(60 + i * 58, 330, ['pilgrim_a', 'pilgrim_b', 'pilgrim_c', 'pilgrim_d', 'pilgrim_e'][i])
        .setDepth(330).setScale(1.25);
      this.tweens.add({ targets: img, y: '-=4', duration: 640, yoyo: true, repeat: -1, delay: i * 90 });
      group.push(img); this.stage.push(img);
    }
    const b = UI.button(this, W / 2, 470, 260, 62, '같이 간다', () => this.good(s), { size: FONT.label, fill: PAL.sun });
    b.setDepth(60);
    this.stage.push(b);
  }

  good(s) {
    this.helped++;
    this.refreshCounter();
    AudioSystem.chime();
    this.clearStage();
    if (this.mapDrag) { this.input.off('pointermove', this.mapDrag); this.mapDrag = null; }
    if (this.mapUp) { this.input.off('pointerup', this.mapUp); this.mapUp = null; }
    this.step++;
    this.dialogue.say(s.ok, () => this.next());
  }

  finish() {
    SaveSystem.set('reflections.day5Helped', this.helped);
    this.dialogue.play(DAY05.way.bottle, () => {
      this.dialogue.say(DAY05.way.card, () => {
        this.cardId = 'b17';
        this.complete(['같이 걸으니 길이 조금 쉬웠다.']);
      });
    });
  }
};
