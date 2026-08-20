/* 미니게임 · 화분에 물주기 — 서두르지 않아도 됩니다. */

window.WaterPlantScene = class WaterPlantScene extends MiniGameScene {
  constructor() { super('WaterPlantScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: 's4', bg: '#3c5470',
      title: '화분에 물주기',
      hint: '물뿌리개를 끌어 화분 위로 옮기면 물이 나옵니다.'
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;

    /* 창가의 화분 자리 */
    const room = this.add.graphics().setDepth(-1);
    room.fillStyle(HEX('#4a6482'), 1); room.fillRect(0, 0, W, 560);
    room.fillStyle(HEX('#3d5470'), 1); room.fillRect(0, 596, W, H - 596);
    room.fillStyle(HEX(PAL.wood), 1); room.fillRect(0, 556, W, 40);
    room.fillStyle(HEX(PAL.woodDark), 1); room.fillRect(0, 592, W, 8);

    const win = this.add.graphics().setDepth(-1);
    win.fillStyle(HEX('#f6cf9a'), 0.9); win.fillRoundedRect(58, 150, 274, 210, 10);
    win.fillStyle(HEX('#f2b56b'), 0.9); win.fillRect(58, 280, 274, 80);
    win.fillStyle(HEX(PAL.woodDark), 1);
    win.fillRect(190, 150, 8, 210); win.fillRect(58, 250, 274, 8);
    win.lineStyle(8, HEX(PAL.woodDark), 1); win.strokeRoundedRect(58, 150, 274, 210, 10);
    const light = this.add.graphics().setDepth(0);
    light.fillStyle(0xfbe4bb, 0.14);
    light.fillTriangle(70, 360, 320, 360, 360, 556);
    light.fillTriangle(70, 360, 30, 556, 360, 556);

    this.pots = [];
    [78, 195, 312].forEach((x, i) => this.pots.push(this.makePot(x, 556, i)));

    this.can = this.add.image(W / 2, 258, 'watering_can').setScale(1.5).setDepth(60)
      .setInteractive({ draggable: true, useHandCursor: true });
    this.canHome = { x: W / 2, y: 258 };
    this.dragHint = this.add.text(W / 2, 204, '↓ 끌어보세요', UI.style(FONT.small, PAL.ink))
      .setOrigin(0.5).setDepth(60).setAlpha(0.85);

    this.input.on('drag', (p, obj, dx, dy) => {
      if (obj !== this.can) return;
      this.can.x = Phaser.Math.Clamp(dx, 30, W - 30);
      this.can.y = Phaser.Math.Clamp(dy, 150, 505);
      this.pouring = true;
    });
    this.input.on('dragstart', () => {
      this.dragging = true;
      if (this.dragHint) { this.tweens.add({ targets: this.dragHint, alpha: 0, duration: 300 }); }
    });
    this.input.on('dragend', () => {
      this.dragging = false; this.pouring = false; this.can.setRotation(0);
      this.tweens.add({ targets: this.can, x: this.canHome.x, y: this.canHome.y, duration: 420, ease: 'Sine.easeOut' });
    });

    this.drops = [];
  }

  makePot(x, y, idx) {
    const c = { x: x, y: y, gauge: 0, done: false };
    c.leaves = [];

    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x000000, 0.16); g.fillEllipse(x, y + 12, 66, 14);
    g.fillStyle(0xc9755a, 1);
    g.fillRoundedRect(x - 30, y - 34, 60, 44, 6);
    g.fillStyle(0xb56750, 1);
    g.fillRoundedRect(x - 34, y - 40, 68, 12, 4);
    c.soil = this.add.ellipse(x, y - 30, 54, 14, HEX('#8a6f52')).setDepth(11);

    /* 시들어 늘어진 잎 */
    const leafColors = [0x8aa96b, 0x7d9c60, 0x9dbb7c];
    for (let i = 0; i < 3; i++) {
      const leaf = this.add.ellipse(x + (i - 1) * 15, y - 52 - i * 6, 30, 15, leafColors[i]);
      leaf.setDepth(12);
      leaf.setRotation((i - 1) * 0.5 + 0.55);
      leaf.baseRot = (i - 1) * 0.5;
      c.leaves.push(leaf);
    }
    c.stem = this.add.rectangle(x, y - 44, 4, 26, 0x6f8f56).setDepth(11);
    c.flower = this.add.circle(x, y - 76, 9, HEX('#f0a3b5')).setDepth(13).setVisible(false);
    c.flowerMid = this.add.circle(x, y - 76, 4, HEX(PAL.sun)).setDepth(14).setVisible(false);

    /* 물 게이지 */
    c.barBg = this.add.rectangle(x, y + 26, 56, 8, 0x000000, 0.25).setDepth(15);
    c.bar = this.add.rectangle(x - 28, y + 26, 2, 8, HEX('#7fc4e8')).setOrigin(0, 0.5).setDepth(16);
    return c;
  }

  update(time, delta) {
    if (!this.can) return;
    const pouring = this.dragging && this.can.y < 512;

    if (pouring) {
      this.can.setRotation(0.5);
      const target = this.pots.find(p => Math.abs(p.x - this.can.x) < 46 && this.can.y < p.y - 20);

      if (time - (this._dropAt || 0) > 90) {
        this._dropAt = time;
        const d = this.add.circle(this.can.x + 26, this.can.y + 8, 3, HEX('#9cd6f0'), 0.9).setDepth(55);
        this.tweens.add({
          targets: d, y: (target ? target.y - 32 : 540), alpha: 0.2, duration: 420,
          onComplete: () => d.destroy()
        });
      }

      if (target && !target.done) {
        target.gauge = Math.min(1, target.gauge + delta / 2600);
        target.bar.width = 2 + 54 * target.gauge;
        target.soil.fillColor = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.ValueToColor('#8a6f52'),
          Phaser.Display.Color.ValueToColor('#6b563c'), 100, Math.round(target.gauge * 100)
        ).color;
        if (target.gauge >= 1) this.bloom(target);
      } else if (target && target.done) {
        if (time - (this._spillAt || 0) > 2400) {
          this._spillAt = time;
          this.setHint('물이 조금 넘쳤어요. 괜찮아요.');
        }
      }
    } else if (this.can.rotation !== 0 && !this.dragging) {
      this.can.setRotation(0);
    }
  }

  bloom(pot) {
    if (pot.done) return;
    pot.done = true;
    AudioSystem.found();
    pot.leaves.forEach((leaf, i) => {
      this.tweens.add({
        targets: leaf, rotation: leaf.baseRot * 0.6, scaleY: 1.25, y: leaf.y - 6,
        duration: 700, ease: 'Back.easeOut', delay: i * 90
      });
    });
    pot.flower.setVisible(true).setScale(0);
    pot.flowerMid.setVisible(true).setScale(0);
    this.tweens.add({ targets: [pot.flower, pot.flowerMid], scale: 1, duration: 600, ease: 'Back.easeOut', delay: 260 });
    pot.bar.fillColor = HEX(PAL.leaf);

    for (let i = 0; i < 6; i++) {
      const s = this.add.image(pot.x + Phaser.Math.Between(-24, 24), pot.y - 60, 'spark')
        .setDepth(30).setScale(0.7);
      this.tweens.add({ targets: s, y: s.y - 40, alpha: 0, duration: 900, delay: i * 70, onComplete: () => s.destroy() });
    }

    const left = this.pots.filter(p => !p.done).length;
    if (left === 0) {
      this.setHint('');
      this.complete([
        '화분 셋이 모두 물을 마셨다.',
        '잎이 조금 펴진 것 같다.',
        '작은 일인데, 마음이 조금 가벼워졌다.'
      ]);
    } else {
      this.setHint('남은 화분 ' + left + '개');
    }
  }
};
