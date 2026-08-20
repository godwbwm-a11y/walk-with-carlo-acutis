/* 미니게임 · 어디에 마음이 멈추나요? — 성소를 맞히는 퀴즈가 아닙니다.
   여러 개를 골라도, 하나도 고르지 않아도 결과는 나오지 않습니다. */

window.HeartStopScene = class HeartStopScene extends MiniGameScene {
  constructor() { super('HeartStopScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#2c3b56',
      title: DAY05.heart.title, hint: DAY05.heart.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.picked = [];

    this.list = this.add.container(0, 0).setDepth(40);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, 140, W, 500);
    this.list.setMask(shape.createGeometryMask());

    this.cards = [];
    let y = 186;
    DAY05.heart.scenes.forEach((label) => {
      const c = this.add.container(W / 2, y);
      const g = this.add.graphics();
      g.fillStyle(HEX(PAL.paper), 0.94); g.fillRoundedRect(-152, -34, 304, 68, 14);
      g.lineStyle(2, HEX(PAL.sunDeep), 0.4); g.strokeRoundedRect(-152, -34, 304, 68, 14);
      c.add(g);
      const t = this.add.text(0, 0, label, UI.style(FONT.small, PAL.ink, {
        align: 'center', wordWrap: { width: 272 }
      })).setOrigin(0.5);
      c.add(t);
      const heart = this.add.text(128, -18, '♡', UI.style(19, PAL.sunDeep)).setOrigin(0.5).setAlpha(0.35);
      c.add(heart);
      c.setSize(304, 76);
      c.setInteractive();
      c.picked = false;
      c.label = label;
      c.g = g; c.heart = heart;
      c.on('pointerdown', (p) => { this.downY = p.y; });
      c.on('pointerup', (p) => {                     // 목록을 밀다가 잘못 골라지지 않도록
        if (this.downY !== undefined && Math.abs(p.y - this.downY) > 10) return;
        this.toggle(c);
      });
      this.list.add(c);
      this.cards.push(c);
      y += 80;
    });

    this.listMax = Math.max(0, y - 600);
    this.scrollY = 0;
    this.input.on('pointermove', (p) => {
      if (!p.isDown || p.y < 150 || p.y > 630) return;
      const dy = p.y - (this.lastY === undefined ? p.y : this.lastY);
      this.lastY = p.y;
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy, -this.listMax, 0);
      this.list.y = this.scrollY;
    });
    this.input.on('pointerup', () => { this.lastY = undefined; });

    this.note = this.add.text(W / 2, 664, DAY05.heart.note, UI.style(FONT.small, '#cbd8ea', {
      align: 'center', wordWrap: { width: W - 60 }
    })).setOrigin(0.5).setDepth(70);

    this.doneBtn = UI.button(this, W / 2, 740, 250, 58, DAY05.heart.doneBtn, () => this.finish(),
      { size: FONT.label, fill: PAL.sun });
    this.doneBtn.setDepth(70);
  }

  toggle(c) {
    const i = this.picked.indexOf(c.label);
    c.picked = !c.picked;
    if (i >= 0) this.picked.splice(i, 1);
    else this.picked.push(c.label);

    c.g.clear();
    c.g.fillStyle(HEX(c.picked ? PAL.sun : PAL.paper), c.picked ? 0.98 : 0.94);
    c.g.fillRoundedRect(-152, -34, 304, 68, 14);
    c.g.lineStyle(2, HEX(PAL.sunDeep), c.picked ? 0.95 : 0.4);
    c.g.strokeRoundedRect(-152, -34, 304, 68, 14);
    c.heart.setText(c.picked ? '♥' : '♡').setAlpha(c.picked ? 1 : 0.35);
    AudioSystem.tap();
  }

  finish() {
    if (this.finished) return;
    SaveSystem.set('reflections.day5Vocation', this.picked.slice());

    /* 고른 것만 남기고 목록을 걷어냅니다 */
    this.doneBtn.destroy();
    this.note.destroy();
    this.setHint('');
    const keep = this.picked.slice(0, 3);
    this.cards.forEach((c) => {
      if (keep.indexOf(c.label) < 0) {
        this.tweens.add({ targets: c, alpha: 0, duration: 450, onComplete: () => c.destroy() });
        return;
      }
      const i = keep.indexOf(c.label);
      this.list.remove(c);
      c.setDepth(60);
      c.y += this.list.y;
      this.tweens.add({
        targets: c, x: GAME.WIDTH / 2, y: 240 + i * 88, scale: 0.94,
        duration: 700, ease: 'Sine.easeInOut'
      });
    });

    this.time.delayedCall(900, () => {
      const lines = (this.picked.length > 0) ? DAY05.heart.talkSome : DAY05.heart.talkNone;
      this.dialogue.play(lines, () => {
        this.dialogue.play(DAY05.heart.guide, () => {
          this.complete(['오늘은 여기까지 살펴보았다.']);
        });
      });
    });
  }
};
