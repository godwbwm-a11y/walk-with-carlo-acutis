/* 미니게임 · 용기의 한 걸음 — 벽을 부수지 않습니다.
   오늘 두려움을 다 이길 필요도 없습니다. 발판 세 개면 충분합니다. */

window.CourageScene = class CourageScene extends MiniGameScene {
  constructor() { super('CourageScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#141d33',
      title: DAY05.courage.title, hint: DAY05.courage.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.stepIndex = 0;

    /* 밤의 서울, 그리고 끝이 보이지 않는 길 */
    this.add.image(W / 2, 300, 'seoul_night_block').setDepth(-30).setAlpha(0.55);
    const g = this.add.graphics().setDepth(-20);
    g.fillStyle(0x1b2540, 1); g.fillRect(0, 520, W, H - 520);
    g.fillStyle(0x22304f, 1);
    g.fillTriangle(W / 2 - 150, H, W / 2 + 150, H, W / 2, 520);

    this.me = this.add.image(W / 2, 750, 'player_back').setDepth(750).setScale(1.5);
    this.bob = this.tweens.add({ targets: this.me, y: '-=4', duration: 760, yoyo: true, repeat: -1 });

    this.time.delayedCall(500, () => this.pickFear());
  }

  /* 1 · 조금 두려운 것 하나 */
  pickFear() {
    const W = GAME.WIDTH;
    const layer = this.add.container(0, 0).setDepth(200);
    this.layer = layer;

    const scrim = this.add.graphics();
    scrim.fillStyle(0x0d1524, 0.94); scrim.fillRect(0, 0, W, GAME.HEIGHT);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 128, DAY05.courage.hint,
      UI.style(20, PAL.cream, { align: 'center', wordWrap: { width: W - 70 } })).setOrigin(0.5));

    const list = this.add.container(0, 0);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, 176, W, 470);
    list.setMask(shape.createGeometryMask());
    layer.add(list);

    let y = 212;
    DAY05.courage.fears.forEach((f) => {
      const b = UI.button(this, W / 2, y, W - 70, 56, f, () => this.chooseFear(f), { size: FONT.small });
      list.add(b);
      y += 66;
    });

    const max = Math.max(0, y - 620);
    this.input.on('pointermove', (p) => {
      if (!p.isDown || p.y < 180 || p.y > 640 || !this.layer) return;
      const dy = p.y - (this.lastY === undefined ? p.y : this.lastY);
      this.lastY = p.y;
      list.y = Phaser.Math.Clamp(list.y + dy, -max, 0);
    });
    this.input.on('pointerup', () => { this.lastY = undefined; });
  }

  chooseFear(f) {
    this.fear = f;
    SaveSystem.set('reflections.day5Fear', f);
    if (this.layer) { this.layer.destroy(); this.layer = null; }
    AudioSystem.select();

    const W = GAME.WIDTH;
    this.fearText = this.add.text(W / 2, 168, f, UI.style(23, PAL.clay, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: this.fearText, alpha: 1, duration: 700 });

    /* 벽 대신 작은 발판 세 개 */
    this.plates = [];
    [[195, 640], [195, 570], [195, 500]].forEach((p, i) => {
      const img = this.add.image(p[0], p[1], 'step_plate').setDepth(30).setAlpha(0);
      this.tweens.add({ targets: img, alpha: 1, duration: 600, delay: 500 + i * 260 });
      this.plates.push(img);
    });

    this.time.delayedCall(1000, () => {
      this.setHint(DAY05.courage.noWall);
      this.time.delayedCall(1800, () => this.askStep());
    });
  }

  /* 2 · 가장 작은 한 걸음 */
  askStep() {
    const W = GAME.WIDTH;
    this.setHint(DAY05.courage.askStep);
    const opts = DAY05.courage.steps[this.fear] || DAY05.courage.steps['잘 모르겠다'];

    this.stepBtns = [];
    let y = 254;
    opts.forEach((o, i) => {
      const b = UI.button(this, W / 2, y, W - 76, 60, o, () => this.walk(o), { size: FONT.small });
      b.setDepth(70).setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 360, delay: i * 130 });
      this.stepBtns.push(b);
      y += 72;
    });
  }

  /* 3 · 발판 위를 한 걸음씩 */
  walk(choice) {
    if (this.walking) return;
    this.walking = true;
    this.step = choice;
    SaveSystem.set('reflections.day5Step', choice);
    (this.stepBtns || []).forEach(b => this.tweens.add({
      targets: b, alpha: 0, duration: 350, onComplete: () => b.destroy()
    }));
    this.setHint('');

    this.chosenText = this.add.text(GAME.WIDTH / 2, 232, '“' + choice + '”',
      UI.style(19, PAL.sun, { align: 'center', wordWrap: { width: GAME.WIDTH - 80 } }))
      .setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: this.chosenText, alpha: 1, duration: 600 });

    this.time.delayedCall(700, () => this.oneStep());
  }

  oneStep() {
    if (this.bob) { this.bob.stop(); this.bob = null; }   // 제자리 흔들림을 멈추고 실제로 걸어갑니다
    if (this.stepIndex >= 3) { this.arrive(); return; }
    const target = this.plates[this.stepIndex];
    this.stepIndex++;

    this.tweens.add({
      targets: this.me, y: target.y - 4, scale: 1.5 - this.stepIndex * 0.08,
      duration: 900, ease: 'Sine.easeInOut',
      onStart: () => AudioSystem.step(),                 // 폭죽도, 레벨업도 없습니다
      onComplete: () => {
        this.me.setDepth(this.me.y);
        this.tweens.add({ targets: target, alpha: 0.35, duration: 500 });
        if (this.stepIndex === 2) {
          this.setHint(DAY05.courage.oneStep);
          this.time.delayedCall(900, () => { this.setHint(''); this.oneStep(); });
        } else {
          this.time.delayedCall(700, () => this.oneStep());
        }
      }
    });
  }

  arrive() {
    const carlo = this.add.image(this.me.x + 56, this.me.y + 6, 'carlo_back')
      .setDepth(this.me.y + 6).setScale(1.24).setAlpha(0);
    this.tweens.add({ targets: carlo, alpha: 1, duration: 800 });
    this.time.delayedCall(1000, () => {
      this.dialogue.play(DAY05.courage.last, () => {
        this.cardId = 'j6';
        this.complete(['무서운 것은 그대로다.', '그런데 한 걸음 앞에 서 있다.']);
      });
    });
  }
};
