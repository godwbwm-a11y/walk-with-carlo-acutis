/* 미니게임 · 원본 — 조각을 깨뜨리지 않고 옆으로 옮깁니다. */

window.MirrorScene = class MirrorScene extends MiniGameScene {
  constructor() { super('MirrorScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#2a2735', warm: false,
      title: DAY04.mirror.title, hint: DAY04.mirror.hint1
    });
    if (this.closeBtn) this.closeBtn.setVisible(false);

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.stage = 'cover';
    this.picked = [];

    /* 거울 */
    const frame = this.add.graphics().setDepth(2);
    frame.fillStyle(HEX(PAL.woodDark), 1); frame.fillRoundedRect(58, 168, 274, 356, 20);
    frame.fillStyle(HEX('#cfdae4'), 1); frame.fillRoundedRect(70, 180, 250, 332, 14);
    frame.fillStyle(0xffffff, 0.35); frame.fillTriangle(84, 500, 190, 194, 226, 194);

    this.meInMirror = this.add.image(195, 400, 'player_front').setDepth(4).setScale(2.4).setAlpha(0.95);

    /* 거울을 덮은 조각들 */
    this.pieces = [];
    const cols = 3;
    DAY04.mirror.labels.forEach((label, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = 108 + col * 87, y = 214 + row * 76;
      const c = this.add.container(x, y).setDepth(20);
      const t = this.add.text(0, 0, label, UI.style(15, PAL.ink)).setOrigin(0.5);
      const g = this.add.graphics();
      const w = Math.max(76, t.width + 22), h = 46;
      g.fillStyle(0xf3ece2, 0.97); g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      g.lineStyle(2, HEX(PAL.inkSoft), 0.35); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      c.add([g, t]);
      c.setSize(w, h + 8);
      c.setInteractive({ draggable: true, useHandCursor: true });
      c.isPiece = true;
      this.pieces.push(c);
    });

    this.input.on('drag', (p, obj, dx, dy) => {
      if (!obj.isPiece || this.stage !== 'move') return;
      obj.x = Phaser.Math.Clamp(dx, 20, GAME.WIDTH - 20);
      obj.y = Phaser.Math.Clamp(dy, 150, 620);
    });
    this.input.on('dragend', (p, obj) => { if (obj.isPiece) this.checkPiece(obj); });

    this.leftText = this.add.text(GAME.WIDTH / 2, 560, '', UI.style(FONT.small, '#dfd2bd')).setOrigin(0.5).setDepth(40);

    this.time.delayedCall(700, () => {
      this.dialogue.play(DAY04.mirror.cant, () => {
        this.stage = 'move';
        this.setHint(DAY04.mirror.hint2);
        this.refresh();
      });
    });
  }

  /* 조각이 거울 밖으로 나갔는지 */
  checkPiece(c) {
    const outside = (c.x < 74 || c.x > 316 || c.y < 186 || c.y > 506);
    if (outside) {
      c.moved = true;
      AudioSystem.tap();
      c.disableInteractive();
      this.tweens.add({ targets: c, alpha: 0.55, scale: 0.86, duration: 300 });
    }
    this.refresh();
  }

  refresh() {
    const left = this.pieces.filter(p => !p.moved).length;
    this.leftText.setText(left > 0 ? '아직 가려진 조각  ' + left : '');
    const shown = 1 - left / this.pieces.length;
    this.meInMirror.setAlpha(0.35 + shown * 0.6);
    if (left === 0 && this.stage === 'move') this.time.delayedCall(500, () => this.chooseStage());
  }

  /* 거울 아래에서 나타나는 새로운 조각들 */
  chooseStage() {
    if (this.stage === 'choose') return;
    this.stage = 'choose';
    this.setHint(DAY04.mirror.hint3);
    this.leftText.setText(DAY04.mirror.note);
    this.leftText.setPosition(GAME.WIDTH / 2, 626).setDepth(70)   // 목록 위로 올려 가려지지 않게
      .setWordWrapWidth(GAME.WIDTH - 70).setAlign('center');

    const W = GAME.WIDTH;
    this.pieces.forEach(p => this.tweens.add({ targets: p, alpha: 0.25, duration: 600 }));

    this.list = this.add.container(0, 0).setDepth(60);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, 196, W, 400);
    this.list.setMask(shape.createGeometryMask());

    const veil = this.veil = this.add.graphics().setDepth(55);
    veil.fillStyle(0x1f1c28, 0.92); veil.fillRect(0, 140, W, 560);

    let y = 220;
    this.chips = [];
    DAY04.mirror.strengths.forEach((label) => {
      const b = UI.button(this, W / 2, y, W - 70, 52, label, () => this.toggle(b, label), { size: FONT.small });
      b.picked = false;
      b.labelText = label;
      b.setAlpha(0.85);
      this.list.add(b);
      this.chips.push(b);
      y += 60;
    });
    this.listMax = Math.max(0, y - 560);
    this.scrollY = 0;

    this.input.on('pointermove', (p) => {
      if (this.stage !== 'choose' || !p.isDown) return;
      if (p.y < 196 || p.y > 596) return;
      const dy = p.y - (this.lastY || p.y);
      this.lastY = p.y;
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy, -this.listMax, 0);
      this.list.y = this.scrollY;
    });
    this.input.on('pointerup', () => { this.lastY = undefined; });

    this.doneBtn = UI.button(this, W / 2, 690, 240, 58, DAY04.mirror.doneBtn, () => this.finishChoose(),
      { size: FONT.label, fill: PAL.sun });
    this.doneBtn.setDepth(70);
  }

  toggle(btn, label) {
    const i = this.picked.indexOf(label);
    if (i >= 0) { this.picked.splice(i, 1); btn.setAlpha(0.85); btn.setScale(1); }
    else { this.picked.push(label); btn.setAlpha(1); btn.setScale(1.03); }
    AudioSystem.tap();
  }

  /* 고른 것만 거울 안으로 옮기고, 나머지 목록은 걷어냅니다 */
  showInMirror() {
    const keep = this.picked.slice(0, 3);
    (this.chips || []).forEach((b) => {
      const i = keep.indexOf(b.labelText);
      if (i < 0) {
        this.tweens.add({ targets: b, alpha: 0, duration: 500, onComplete: () => b.destroy() });
        return;
      }
      if (this.list) this.list.remove(b);
      b.setDepth(64);
      b.y += (this.list ? this.list.y : 0);
      this.tweens.add({
        targets: b, x: GAME.WIDTH / 2, y: 240 + i * 58, scale: 0.78,
        duration: 700, ease: 'Sine.easeInOut'
      });
    });
    if (this.veil) {
      this.tweens.add({ targets: this.veil, alpha: 0, duration: 700, onComplete: () => this.veil.destroy() });
    }
  }

  finishChoose() {
    if (this.finished) return;
    this.finished = true;
    SaveSystem.set('reflections.day4Strengths', this.picked.slice());
    if (this.doneBtn) this.doneBtn.destroy();
    this.setHint('');
    this.leftText.setText('');
    this.showInMirror();

    const n = this.picked.length;
    const lines = n === 0 ? DAY04.mirror.none : (n === 1 ? DAY04.mirror.one : DAY04.mirror.many);
    if (n === 0) SaveSystem.set('reflections.day4Strengths', ['아직 잘 모르겠다']);

    this.dialogue.play(lines, () => {
      this.dialogue.play(DAY04.mirror.after, () => {
        this.dialogue.play(DAY04.mirror.core, () => {
          Collection.award(this, 'c3', () => this.leave());
        });
      });
    });
  }
};
