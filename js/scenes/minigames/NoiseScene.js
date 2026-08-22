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

    /* 말들이 떠다니는 범위 — 아래 글과 단추는 건드리지 않습니다 */
    this.TOP = 170; this.BOTTOM = 590;

    this.tapHint = this.add.text(W / 2, H - 196, '', UI.style(FONT.small, '#dfd2bd', {
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
    const t = this.add.text(0, 0, word, UI.style(19, PAL.ink)).setOrigin(0.5);
    const w = t.width + 30, h = 44;
    const spot = this.freeSpot(w, h);

    const c = this.add.container(spot.x, spot.y).setDepth(40);
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.95); g.fillRoundedRect(-w / 2, -h / 2, w, h, 22);
    g.lineStyle(2, HEX(PAL.sky), 0.7); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
    c.add([g, t]);
    c.setSize(w, h + 10);
    c.setInteractive();
    c.on('pointerdown', () => this.push(c));
    c.hw = w / 2; c.hh = h / 2;
    c.speed = Phaser.Math.FloatBetween(0.5, 1.1);
    c.dir = new Phaser.Math.Vector2(Phaser.Math.FloatBetween(-1, 1), Phaser.Math.FloatBetween(-1, 1)).normalize();
    this.words.push(c);
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 400 });
  }

  /* 이미 떠 있는 말들과 가장 덜 겹치는 자리를 찾아 줍니다 */
  freeSpot(w, h) {
    const W = GAME.WIDTH;
    let best = null, bestGap = -1e9;
    for (let n = 0; n < 26; n++) {
      const x = Phaser.Math.Between(Math.round(40 + w / 2), Math.round(W - 40 - w / 2));
      const y = Phaser.Math.Between(this.TOP + 24, this.BOTTOM - 24);
      let gap = 1e9;
      this.words.forEach((c) => {
        const dx = Math.abs(c.x - x) - (c.hw + w / 2);
        const dy = Math.abs(c.y - y) - (c.hh + h / 2);
        gap = Math.min(gap, Math.max(dx, dy));
      });
      if (gap > 12) return { x: x, y: y };
      if (gap > bestGap) { bestGap = gap; best = { x: x, y: y }; }
    }
    return best;
  }

  /* 서로 겹치면 살짝 밀어냅니다 — 시끄럽되, 글자는 가리지 않도록 */
  separate() {
    const list = this.words;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const ox = (a.hw + b.hw + 8) - Math.abs(dx);
        const oy = (a.hh + b.hh + 8) - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        if (ox < oy) {
          const s = (dx < 0 ? -1 : 1) * ox * 0.5;
          a.x -= s; b.x += s;
        } else {
          const s = (dy < 0 ? -1 : 1) * oy * 0.5;
          a.y -= s; b.y += s;
        }
      }
    }
  }

  /* 눌러도 사라지지 않고 자리만 옮깁니다 */
  push(c) {
    if (this.calmed) return;
    AudioSystem.swipe();
    this.taps++;
    const spot = this.freeSpot(c.hw * 2, c.hh * 2);
    this.tweens.add({
      targets: c, x: spot.x, y: spot.y, duration: 420, ease: 'Sine.easeOut'
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
          /* 다시 걸으려는데 소음이 또 몰려옵니다 — 수호천사가 나섭니다 */
          const b = UI.button(this, GAME.WIDTH / 2, GAME.HEIGHT - 150, 220, 58, DAY02.noise.goBtn,
            () => {
              UI.fadeOut(this, 600, () => {
                this.scene.start('AngelScene', { from: this.from });
              });
            }, { size: FONT.label, fill: PAL.sun });
          b.setDepth(60);
        });
      });
    });
  }

  update(time, delta) {
    const W = GAME.WIDTH;
    const dt = Math.min(delta, 40) / 16.7;
    this.words.forEach((c) => {
      c.x += c.dir.x * c.speed * dt;
      c.y += c.dir.y * c.speed * dt;
      if (c.x < 40 + c.hw) { c.x = 40 + c.hw; c.dir.x = Math.abs(c.dir.x); }
      if (c.x > W - 40 - c.hw) { c.x = W - 40 - c.hw; c.dir.x = -Math.abs(c.dir.x); }
      if (c.y < this.TOP + c.hh) { c.y = this.TOP + c.hh; c.dir.y = Math.abs(c.dir.y); }
      if (c.y > this.BOTTOM - c.hh) { c.y = this.BOTTOM - c.hh; c.dir.y = -Math.abs(c.dir.y); }
    });
    this.separate();
  }
};
