/* 미니게임 · 굴러가는 귤 — 다 못 잡아도 괜찮습니다. */

window.OrangeScene = class OrangeScene extends MiniGameScene {
  constructor() { super('OrangeScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#6f8f6a',
      title: DAY02.park.orangeTitle,
      hint: DAY02.park.orangeHint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;

    /* 공원 바닥 */
    const g = this.add.graphics().setDepth(-1);
    g.fillStyle(HEX('#8fbf7a'), 1); g.fillRect(0, 236, W, H - 236);
    g.fillStyle(HEX('#7fae6b'), 1); g.fillRect(0, 236, W, 14);
    for (let i = 0; i < 60; i++) {
      g.fillStyle(0xffffff, 0.10);
      g.fillEllipse(Phaser.Math.Between(0, W), Phaser.Math.Between(256, H - 20), Phaser.Math.Between(10, 26), 5);
    }
    this.add.image(52, 320, 'tree_big').setDepth(0).setScale(0.95).setOrigin(0.5, 1);
    this.add.image(336, 300, 'bush').setDepth(0).setScale(1.2).setOrigin(0.5, 1);
    this.add.image(298, 352, 'grandma_front').setDepth(2).setScale(1.7);
    this.add.image(246, 372, 'paper_bag').setDepth(1).setScale(0.85).setAngle(26);

    this.caught = 0;
    this.total = 5;
    this.oranges = [];
    this.timeLeft = 15;

    this.progress = this.add.text(W / 2, 196, '', UI.style(FONT.body, PAL.cream)).setOrigin(0.5).setDepth(40);
    this.timerText = this.add.text(W - 34, 196, '', UI.style(FONT.small, PAL.cream)).setOrigin(1, 0.5).setDepth(40);
    this.refresh();

    for (let i = 0; i < this.total; i++) this.spawn(i);

    this.timer = this.time.addEvent({
      delay: 1000, repeat: this.timeLeft - 1,
      callback: () => {
        this.timeLeft--;
        this.refresh();
        if (this.timeLeft <= 0) this.done();
      }
    });
  }

  spawn(i) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const o = this.add.image(268 - i * 14, 386 + i * 6, 'orange').setDepth(30).setScale(1.3);
    o.setInteractive({ useHandCursor: true });
    o.on('pointerdown', () => this.catchIt(o));
    this.oranges.push(o);

    const roam = () => {
      if (!o.active) return;
      const tx = Phaser.Math.Between(40, W - 40);
      const ty = Phaser.Math.Between(300, H - 120);
      this.tweens.add({
        targets: o, x: tx, y: ty, duration: Phaser.Math.Between(1100, 2000), ease: 'Sine.easeInOut',
        onComplete: roam
      });
      this.tweens.add({ targets: o, angle: o.angle + Phaser.Math.Between(180, 420), duration: 1600 });
    };
    this.time.delayedCall(120 + i * 90, roam);
  }

  catchIt(o) {
    if (!o.active || this.finished) return;
    AudioSystem.found();
    this.caught++;
    this.tweens.killTweensOf(o);
    this.tweens.add({
      targets: o, x: 262, y: 372, scale: 0.6, alpha: 0, duration: 420, ease: 'Sine.easeIn',
      onComplete: () => o.destroy()
    });
    this.oranges = this.oranges.filter(x => x !== o);
    this.refresh();
    if (this.caught >= this.total) this.time.delayedCall(400, () => this.done());
  }

  refresh() {
    this.progress.setText('주운 귤  ' + this.caught + ' / ' + this.total);
    this.timerText.setText(this.timeLeft > 0 ? this.timeLeft + '초' : '');
  }

  done() {
    if (this.finished) return;
    if (this.timer) this.timer.remove();
    this.oranges.forEach(o => this.tweens.killTweensOf(o));
    SaveSystem.set('reflections.day2Oranges', this.caught);
    this.setHint('');
    this.timerText.setText('');
    const lines = this.caught >= this.total
      ? ['귤 다섯 개를 모두 주웠다.']
      : ['할머니가 나머지를 함께 줍는다.'];
    this.complete(lines);
  }
};
