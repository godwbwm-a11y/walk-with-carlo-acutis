/* 미니게임 · 마음의 소음 — 없애는 게임이 아닙니다. */

window.NoiseScene = class NoiseScene extends MiniGameScene {
  constructor() { super('NoiseScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#3f4a63',
      title: DAY02.noise.title,
      hint: DAY02.noise.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.calmed = false;
    this.taps = 0;

    /* 가운데 서 있는 나 */
    this.me = this.add.image(W / 2, H * 0.62, 'player_front').setDepth(20).setScale(1.5);
    this.add.image(W / 2, H * 0.62 + 6, 'shadow').setDepth(19).setScale(1.4).setAlpha(0.3);

    this.words = [];
    const list = DAY02.noise.words;
    list.forEach((w, i) => this.time.delayedCall(300 + i * 260, () => this.spawn(w)));

    this.tapHint = this.add.text(W / 2, H - 232, '', UI.style(FONT.small, '#dfd2bd', {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(60);

    /* 잠시 멈추기 버튼은 조금 뒤에 나타납니다 */
    this.time.delayedCall(6200, () => {
      if (this.calmed) return;
      this.pauseBtn = UI.button(this, W / 2, H - 150, 220, 58, DAY02.noise.pauseBtn,
        () => this.calm(), { size: FONT.label, fill: PAL.sun });
      this.pauseBtn.setDepth(60).setAlpha(0);
      this.tweens.add({ targets: this.pauseBtn, alpha: 1, duration: 700 });
    });
  }

  spawn(word) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const c = this.add.container(Phaser.Math.Between(70, W - 70), Phaser.Math.Between(180, H - 300)).setDepth(40);
    const t = this.add.text(0, 0, word, UI.style(19, PAL.ink)).setOrigin(0.5);
    const g = this.add.graphics();
    const w = t.width + 30, h = 44;
    g.fillStyle(0xffffff, 0.95); g.fillRoundedRect(-w / 2, -h / 2, w, h, 22);
    g.lineStyle(2, HEX(PAL.sky), 0.7); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
    c.add([g, t]);
    c.setSize(w, h + 10);
    c.setInteractive();
    c.on('pointerdown', () => this.push(c));
    c.speed = Phaser.Math.FloatBetween(0.5, 1.1);
    c.dir = new Phaser.Math.Vector2(Phaser.Math.FloatBetween(-1, 1), Phaser.Math.FloatBetween(-1, 1)).normalize();
    this.words.push(c);
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 400 });
  }

  /* 눌러도 사라지지 않고 자리만 옮깁니다 */
  push(c) {
    if (this.calmed) return;
    AudioSystem.swipe();
    this.taps++;
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.tweens.add({
      targets: c, x: Phaser.Math.Between(60, W - 60), y: Phaser.Math.Between(170, H - 290),
      duration: 420, ease: 'Sine.easeOut'
    });
    if (this.taps === 2) this.tapHint.setText(DAY02.noise.tapHint);
    if (this.taps === 4) this.tapHint.setText('없어지지 않는다. 자리만 바뀐다.');
    if (this.taps >= 6 && !this.pauseBtn) {
      this.time.delayedCall(300, () => {
        if (this.calmed || this.pauseBtn) return;
        this.pauseBtn = UI.button(this, GAME.WIDTH / 2, GAME.HEIGHT - 150, 220, 58, DAY02.noise.pauseBtn,
          () => this.calm(), { size: FONT.label, fill: PAL.sun });
        this.pauseBtn.setDepth(60);
      });
    }
  }

  calm() {
    if (this.calmed) return;
    this.calmed = true;
    AudioSystem.chime();
    AudioSystem.setAmbience('none');
    if (this.pauseBtn) this.pauseBtn.destroy();
    this.tapHint.setText('');
    this.setHint('');

    /* 단어는 그대로. 다만 느려지고 옅어집니다. */
    this.words.forEach((c) => {
      c.speed *= 0.12;
      this.tweens.add({ targets: c, alpha: 0.45, duration: 1600 });
    });

    const veil = this.add.graphics().setDepth(50);
    veil.fillStyle(0x2b3b60, 0.35); veil.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
    veil.setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 1400 });

    this.time.delayedCall(1500, () => {
      const t = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT * 0.34, DAY02.noise.calm,
        UI.style(20, PAL.cream, { align: 'center', wordWrap: { width: GAME.WIDTH - 70 } }))
        .setOrigin(0.5).setDepth(60).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 900 });

      this.time.delayedCall(2200, () => {
        this.dialogue.play(DAY02.noise.calmLine, () => {
          const b = UI.button(this, GAME.WIDTH / 2, GAME.HEIGHT - 150, 220, 58, DAY02.noise.goBtn,
            () => { AudioSystem.setAmbience('room'); this.leave(); }, { size: FONT.label, fill: PAL.sun });
          b.setDepth(60);
        });
      });
    });
  }

  update(time, delta) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const dt = delta / 16.7;
    this.words.forEach((c) => {
      c.x += c.dir.x * c.speed * dt;
      c.y += c.dir.y * c.speed * dt;
      if (c.x < 60 || c.x > W - 60) c.dir.x *= -1;
      if (c.y < 168 || c.y > H - 280) c.dir.y *= -1;
    });
  }
};
