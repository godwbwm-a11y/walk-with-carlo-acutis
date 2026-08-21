/* 미니게임 · 내가 가진 것으로 — 게임 안에서만 만들고 여행 노트에 간직합니다.
   실제로 어디에도 보내지 않습니다. */

window.MakeCardScene = class MakeCardScene extends MiniGameScene {
  constructor() { super('MakeCardScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#1e2a3e',
      title: DAY07.make.title, hint: DAY07.make.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.made = { icon: null, label: null, message: null, target: null };

    this.add.image(W / 2, 300, 'pc_screen_big').setDepth(-20).setScale(0.98).setAlpha(0.35);

    this.time.delayedCall(400, () => this.step1());
  }

  clearStage() {
    (this.stage || []).forEach(o => { if (o && o.destroy) o.destroy(); });
    this.stage = [];
  }

  /* 1 · 그림 고르기 */
  step1() {
    const W = GAME.WIDTH;
    this.clearStage();
    this.setHint(DAY07.make.step1);

    let x = 88, y = 230;
    DAY07.make.images.forEach((img, i) => {
      const c = this.add.container(x, y).setDepth(70);
      const g = this.add.graphics();
      g.fillStyle(0xf3ece2, 0.12); g.fillRoundedRect(-46, -44, 92, 88, 14);
      g.lineStyle(2, HEX(PAL.cream), 0.35); g.strokeRoundedRect(-46, -44, 92, 88, 14);
      c.add(g);
      c.add(this.add.text(0, -12, img.icon, UI.style(28, PAL.cream)).setOrigin(0.5));
      c.add(this.add.text(0, 22, img.label, UI.style(13, PAL.cream)).setOrigin(0.5));
      c.setSize(92, 92);
      c.setInteractive();
      c.on('pointerup', () => {
        this.made.icon = img.icon; this.made.label = img.label;
        AudioSystem.select();
        this.step2();
      });
      this.stage.push(c);
      x += 107;
      if ((i + 1) % 3 === 0) { x = 88; y += 104; }
    });
  }

  /* 2 · 말 고르기 (직접 적어도 됩니다) */
  step2() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.clearStage();
    this.setHint(DAY07.make.step2);
    this.preview(180);

    const list = this.add.container(0, 0).setDepth(70);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, 330, W, 360);
    list.setMask(shape.createGeometryMask());
    this.stage.push(list);

    let y = 364;
    DAY07.make.messages.forEach((m) => {
      list.add(UI.button(this, W / 2, y, W - 76, 52, m, () => {
        this.made.message = m;
        AudioSystem.select();
        this.step3();
      }, { size: FONT.small }));
      y += 60;
    });

    const max = Math.max(0, y - 680);
    if (this.scrollFn) this.input.off('pointermove', this.scrollFn);
    this.scrollFn = (p) => {
      if (!p.isDown || p.y < 334 || p.y > 686) return;
      const dy = p.y - (this.lastY === undefined ? p.y : this.lastY);
      this.lastY = p.y;
      list.y = Phaser.Math.Clamp(list.y + dy, -max, 0);
    };
    this.input.on('pointermove', this.scrollFn);
    this.input.on('pointerup', () => { this.lastY = undefined; });

    const w = UI.button(this, W / 2, H - 84, 250, 54, DAY07.make.writeBtn, () => this.writeOwn(),
      { size: FONT.small, fill: PAL.sun });
    w.setDepth(80);
    this.stage.push(w);
  }

  writeOwn() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.clearStage();
    this.preview(180);

    const layer = this.add.container(0, 0).setDepth(300);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.94); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 200, DAY07.make.step2, UI.style(20, PAL.cream)).setOrigin(0.5));
    this.stage.push(layer);

    layer.destroy();
    this.stage.pop();
    if (!TextInput.supported(this)) { this.step2(); return; }

    TextInput.ask(this, {
      question: DAY07.make.step2,
      placeholder: DAY07.make.placeholder,
      skipLabel: '고르는 걸로 할래요',
      height: 130,
      backHead: '이렇게 적었습니다'
    }, (v) => {
      if (v) this.made.message = v;
      if (!this.made.message) { this.step2(); return; }
      this.step3();
    });
  }

  /* 3 · 누구에게 */
  step3() {
    const W = GAME.WIDTH;
    this.clearStage();
    this.setHint(DAY07.make.step3);
    this.preview(200);

    let y = 400;
    DAY07.make.targets.forEach((t) => {
      const b = UI.button(this, W / 2, y, W - 76, 52, t, () => {
        this.made.target = t;
        AudioSystem.select();
        this.show();
      }, { size: FONT.small });
      b.setDepth(70);
      this.stage.push(b);
      y += 60;
    });
  }

  /* 만들어지는 중인 카드 미리보기 */
  preview(cy) {
    const W = GAME.WIDTH;
    const c = this.add.container(W / 2, cy).setDepth(60).setScale(0.62);
    c.add(this.add.image(0, 0, 'made_card'));
    if (this.made.icon) c.add(this.add.text(0, -46, this.made.icon, UI.style(40, PAL.ink)).setOrigin(0.5));
    if (this.made.message) {
      c.add(this.add.text(0, 22, this.made.message, UI.style(24, PAL.ink, {
        align: 'center', wordWrap: { width: 230 }
      })).setOrigin(0.5));
    }
    this.stage.push(c);
    return c;
  }

  /* 완성된 카드 */
  show() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.clearStage();
    this.setHint('');

    const c = this.add.container(W / 2, 300).setDepth(80);
    c.add(this.add.image(0, 0, 'made_card'));
    c.add(this.add.text(0, -52, this.made.icon, UI.style(46, PAL.ink)).setOrigin(0.5));
    c.add(this.add.text(0, 24, this.made.message, UI.style(24, PAL.ink, {
      align: 'center', wordWrap: { width: 236 }, lineSpacing: 6
    })).setOrigin(0.5));
    c.add(this.add.text(108, 72, 'DAY 7', UI.style(12, PAL.inkSoft)).setOrigin(1, 0.5));
    c.setScale(0.7).setAlpha(0);
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 600, ease: 'Back.easeOut' });
    this.stage.push(c);
    AudioSystem.chime();

    const to = this.add.text(W / 2, 430, '→  ' + this.made.target, UI.style(FONT.body, PAL.sun))
      .setOrigin(0.5).setDepth(80).setAlpha(0);
    this.tweens.add({ targets: to, alpha: 1, duration: 700, delay: 500 });
    this.stage.push(to);

    this.time.delayedCall(900, () => {
      this.dialogue.play(DAY07.make.talk, () => {
        const keep = UI.button(this, W / 2, H - 176, 260, 58, DAY07.make.keepBtn, () => this.keep(),
          { size: FONT.label, fill: PAL.sun });
        const again = UI.button(this, W / 2, H - 106, 260, 54, DAY07.make.againBtn, () => {
          keep.destroy(); again.destroy();
          this.made = { icon: null, label: null, message: null, target: null };
          this.step1();
        }, { size: FONT.small });
        [keep, again].forEach(b => b.setDepth(90));
        this.stage.push(keep); this.stage.push(again);
      });
    });
  }

  keep() {
    SaveSystem.set('reflections.day7Card', {
      icon: this.made.icon, image: this.made.label,
      message: this.made.message, target: this.made.target
    });
    this.clearStage();
    this.complete(['카드를 여행 노트에 간직했다.']);
  }
};
