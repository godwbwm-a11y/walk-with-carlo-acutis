/* 미니게임 1 · 《내 머릿속이 너무 시끄러워》
   알림을 지우는 것이 아니라, 옆으로 밀어 잠시 내려놓습니다. */

window.PhoneScene = class PhoneScene extends Phaser.Scene {
  constructor() { super('PhoneScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.cameras.main.setBackgroundColor('#0d1524');
    AudioSystem.unlock();
    AudioSystem.setAmbience('room');

    /* 폰 화면 */
    this.frame = this.add.graphics();
    this.frame.fillStyle(0x1c2436, 1);
    this.frame.fillRoundedRect(22, 96, W - 44, H - 210, 30);
    this.frame.lineStyle(3, 0x3b4a66, 1);
    this.frame.strokeRoundedRect(22, 96, W - 44, H - 210, 30);
    this.clock = this.add.text(W / 2, 130, '금요일 밤 11:04', UI.style(FONT.small, '#9fb4d6')).setOrigin(0.5);

    this.hintText = this.add.text(W / 2, 168, DAY01.phone.intro,
      UI.style(FONT.body, PAL.cream, { align: 'center', wordWrap: { width: W - 90 } })).setOrigin(0.5);
    this.subText = this.add.text(W / 2, 202, DAY01.phone.hint,
      UI.style(FONT.small, '#8fa5c8', { align: 'center', wordWrap: { width: W - 90 } })).setOrigin(0.5).setAlpha(0.85);

    this.cards = [];
    this.cleared = 0;
    const list = DAY01.phone.notifications;

    list.forEach((n, i) => {
      const c = this.makeCard(n, i, list.length);
      this.cards.push(c);
    });

    this.updateRemain();
    this.enableTop();
    UI.fadeIn(this, 600, [8, 12, 24]);
  }

  makeCard(n, i, total) {
    const W = GAME.WIDTH;
    const baseY = 256 + i * 57;
    const c = this.add.container(W / 2 + Phaser.Math.Between(-6, 6), baseY + 260);
    const img = this.add.image(0, 0, 'card').setDisplaySize(300, 84);
    const app = this.add.text(-128, -22, n.app, UI.style(14, '#8a99b8')).setOrigin(0, 0.5);
    const txt = this.add.text(-128, 8, n.text, UI.style(FONT.body, PAL.ink, { wordWrap: { width: 250 } })).setOrigin(0, 0.5);
    const dotG = this.add.graphics();
    dotG.fillStyle(HEX(PAL.clay), 1); dotG.fillCircle(128, -22, 5);
    c.add([img, app, txt, dotG]);
    c.setSize(300, 84);
    c.setRotation(Phaser.Math.FloatBetween(-0.03, 0.03));
    c.setDepth(100 + i);
    c.baseY = baseY;
    c.homeX = c.x;

    this.tweens.add({
      targets: c, y: baseY, duration: 520, delay: 260 + i * 190, ease: 'Back.easeOut',
      onStart: () => { if (i > 0) AudioSystem.tap(); }
    });
    return c;
  }

  enableTop() {
    const top = this.cards[this.cards.length - 1];
    if (!top) return;
    this.input.off('drag', this.onDrag, this);
    this.input.off('dragend', this.onDragEnd, this);
    top.setInteractive();
    this.input.setDraggable(top);
    this.input.on('drag', this.onDrag, this);
    this.input.on('dragend', this.onDragEnd, this);
  }

  onDrag(pointer, obj, dragX) {
    obj.x = dragX;
    const d = Math.abs(obj.x - obj.homeX);
    obj.setRotation((obj.x - obj.homeX) / 900);
    obj.setAlpha(Math.max(0.35, 1 - d / 260));
  }

  onDragEnd(pointer, obj) {
    const d = obj.x - obj.homeX;
    if (Math.abs(d) > 68) {
      AudioSystem.swipe();
      const dir = d > 0 ? 1 : -1;
      this.tweens.add({
        targets: obj, x: obj.homeX + dir * 460, alpha: 0, duration: 380, ease: 'Sine.easeIn',
        onComplete: () => { obj.destroy(); }
      });
      this.cards.pop();
      this.cleared++;
      this.updateRemain();
      if (this.cards.length > 0) this.enableTop();
      else this.time.delayedCall(500, () => this.quiet());
    } else {
      this.tweens.add({ targets: obj, x: obj.homeX, alpha: 1, rotation: 0, duration: 240, ease: 'Sine.easeOut' });
    }
  }

  updateRemain() {
    const left = this.cards.length;
    this.clock.setText(left > 0 ? '금요일 밤 11:04  ·  남은 알림 ' + left : '금요일 밤 11:04');
    if (left <= 4) this.hintText.setAlpha(0.45);
    if (left <= 2) this.subText.setAlpha(0.4);
  }

  /* 조용해진 화면 */
  quiet() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    AudioSystem.chime();
    this.tweens.add({ targets: [this.hintText, this.subText, this.clock], alpha: 0, duration: 600 });

    const q = this.add.text(W / 2, H * 0.34, DAY01.phone.quiet,
      UI.style(20, '#cfe0f5', { align: 'center' })).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: q, alpha: 1, duration: 900, delay: 700 });

    this.time.delayedCall(3100, () => {
      this.tweens.add({
        targets: q, alpha: 0, duration: 600,
        onComplete: () => { q.destroy(); this.askQuestion(); }
      });
    });
  }

  askQuestion() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const D = DAY01.phone;

    const title = this.add.text(W / 2, 202, D.question,
      UI.style(21, PAL.cream, { align: 'center', lineSpacing: 10 })).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 700 });

    const bw = 152, bh = 60, gapX = 18, gapY = 16;
    const startY = 320;
    const btns = [];

    D.options.forEach((label, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = W / 2 + (col === 0 ? -(bw / 2 + gapX / 2) : (bw / 2 + gapX / 2));
      const y = startY + row * (bh + gapY);
      const b = UI.button(this, x, y, bw, bh, label, () => {
        this.answer(label, btns, title);
      }, { size: FONT.label });
      b.setAlpha(0);
      btns.push(b);
      this.tweens.add({ targets: b, alpha: 1, duration: 300, delay: 200 + i * 60 });
    });

    this.freeNote = this.add.text(W / 2, H - 130, '정답은 없습니다. 지금 떠오르는 것을 고르세요.',
      UI.style(FONT.small, '#9fb4d6', { align: 'center', wordWrap: { width: W - 70 } })).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: this.freeNote, alpha: 0.9, duration: 700, delay: 700 });
  }

  answer(label, btns, title) {
    SaveSystem.set('reflections.mainConcern', label);
    AudioSystem.select();
    btns.forEach(b => b.disableInteractive());
    this.tweens.add({ targets: btns.concat([title, this.freeNote]), alpha: 0, duration: 500 });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const t = this.add.text(W / 2, H * 0.44, '“' + label + '”',
      UI.style(26, PAL.sun, { align: 'center' })).setOrigin(0.5).setAlpha(0);
    const s = this.add.text(W / 2, H * 0.52, DAY01.phone.answered,
      UI.style(FONT.body, '#cfe0f5', { align: 'center' })).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: [t, s], alpha: 1, duration: 800, delay: 400 });

    this.time.delayedCall(2600, () => {
      UI.fadeOut(this, 800, () => this.scene.start('RoomScene', { phoneDone: true }), [8, 12, 24]);
    });
  }
};
