/* 미니게임 · 설거지 도와드리기 — 큰 사랑으로 하는 작은 일 */

window.HelpMomScene = class HelpMomScene extends MiniGameScene {
  constructor() { super('HelpMomScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: 's2', bg: '#40587a',
      title: '설거지 도와드리기',
      hint: '접시를 손가락으로 문질러 보세요.'
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.plateIndex = 0;
    this.totalPlates = 3;

    /* 싱크대 */
    const sink = this.add.graphics().setDepth(0);
    sink.fillStyle(HEX('#8fa2b8'), 1); sink.fillRoundedRect(24, 300, W - 48, 300, 24);
    sink.fillStyle(HEX('#7c8fa6'), 1); sink.fillRoundedRect(38, 316, W - 76, 268, 18);
    sink.fillStyle(HEX('#6d7f96'), 1); sink.fillRoundedRect(W / 2 - 26, 560, 52, 16, 6);
    sink.fillStyle(HEX('#b8c6d6'), 1); sink.fillRoundedRect(W / 2 - 8, 250, 16, 60, 6);
    sink.fillRoundedRect(W / 2 - 8, 250, 60, 14, 7);

    /* 물기 어린 싱크대 */
    sink.fillStyle(HEX('#93a8c0'), 0.55); sink.fillEllipse(W / 2, 470, 250, 150);

    /* 어머니 — 옆에서 같이 */
    this.add.image(84, 296, 'shadow').setScale(1.2).setDepth(4).setAlpha(0.35);
    this.add.image(84, 292, 'mom_front').setScale(1.5).setDepth(5);
    this.add.text(84, 214, '“같이 하자.”', UI.style(FONT.small, PAL.cream)).setOrigin(0.5).setDepth(5).setAlpha(0.9);

    /* 건조대 */
    const rack = this.add.graphics().setDepth(2);
    rack.fillStyle(HEX('#6d7f96'), 1); rack.fillRoundedRect(232, 636, 130, 64, 10);
    rack.lineStyle(3, HEX('#8fa2b8'), 1);
    for (let i = 0; i < 5; i++) rack.lineBetween(248 + i * 24, 642, 248 + i * 24, 694);
    this.rackX = 296; this.rackY = 660; this.racked = 0;

    this.momLine = this.add.text(W / 2, 760, '“고마워. 같이 하니까 금방이네.”',
      UI.style(FONT.body, PAL.cream, { align: 'center', wordWrap: { width: W - 60 } }))
      .setOrigin(0.5).setDepth(60).setAlpha(0);

    this.stackText = this.add.text(104, 660, '', UI.style(FONT.small, '#dfd2bd')).setOrigin(0.5).setDepth(60);

    this.rubbing = false;
    this.input.on('pointerdown', (p) => { this.rubbing = true; this.rub(p); });
    this.input.on('pointermove', (p) => { if (this.rubbing) this.rub(p); });
    this.input.on('pointerup', () => { this.rubbing = false; });

    this.nextPlate();
  }

  nextPlate() {
    const W = GAME.WIDTH;
    if (this.plateIndex >= this.totalPlates) {
      this.tweens.add({ targets: this.momLine, alpha: 1, duration: 700 });
      this.setHint('');
      this.complete([
        '접시 세 개를 다 닦았다.',
        { s: '엄마', t: '고마워. 같이 하니까 금방이네.' },
        '대단한 일은 아니었는데, 엄마가 웃었다.'
      ]);
      return;
    }
    this.plateIndex++;
    this.stackText.setText('남은 접시 ' + (this.totalPlates - this.plateIndex + 1) + '개');

    this.plate = this.add.image(W / 2, 450, 'plate').setScale(1.6).setDepth(20).setAlpha(0);
    this.tweens.add({ targets: this.plate, alpha: 1, y: 440, duration: 400 });

    /* 얼룩과 거품 */
    this.spots = [];
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 58;
      const s = this.add.ellipse(
        W / 2 + Math.cos(a) * r, 440 + Math.sin(a) * r,
        Phaser.Math.Between(12, 24), Phaser.Math.Between(10, 20),
        [0xb98a5e, 0xa7794f, 0xc2a06e][i % 3], 0.85
      ).setDepth(21).setRotation(Math.random() * 3);
      this.spots.push(s);
    }
  }

  rub(p) {
    if (!this.spots || this.finished) return;
    let cleaned = false;
    this.spots.forEach((s) => {
      if (!s.active) return;
      if (Phaser.Math.Distance.Between(p.x, p.y, s.x, s.y) < 40) {
        s.alpha -= 0.16;
        s.scaleX = Math.max(0.2, s.scaleX - 0.04);
        cleaned = true;
        if (s.alpha <= 0.05) {
          s.destroy();
          this.bubble(s.x, s.y);
        }
      }
    });
    if (cleaned && Math.random() < 0.35) this.bubble(p.x, p.y);
    if (cleaned && Math.random() < 0.1) AudioSystem.swipe();

    this.spots = this.spots.filter(s => s.active);
    if (this.spots.length === 0 && this.plate) this.finishPlate();
  }

  bubble(x, y) {
    const b = this.add.circle(x + Phaser.Math.Between(-10, 10), y, Phaser.Math.Between(3, 8), 0xffffff, 0.55)
      .setDepth(30);
    this.tweens.add({
      targets: b, y: b.y - Phaser.Math.Between(30, 70), alpha: 0,
      duration: Phaser.Math.Between(700, 1300), onComplete: () => b.destroy()
    });
  }

  finishPlate() {
    const plate = this.plate;
    this.plate = null;
    AudioSystem.found();
    for (let i = 0; i < 6; i++) this.bubble(plate.x + Phaser.Math.Between(-40, 40), plate.y);
    this.racked++;
    this.tweens.add({
      targets: plate, x: this.rackX - 34 + this.racked * 22, y: this.rackY, scale: 0.9, angle: -8,
      duration: 700, ease: 'Sine.easeInOut',
      onComplete: () => { this.time.delayedCall(280, () => this.nextPlate()); }
    });
  }
};
