/* DAY 8 후반 · 일곱 날의 기억 — 혼자 걸은 날 저녁, 지난 날들을 떠올리며.
   여섯 개의 기억(돌, 묵주, 별, 십자가, 성경, 축구공)이 차례로 빛납니다. 같은 순서로 눌러 보세요.
   한 판마다 하나씩 길어집니다. 세 번 틀리면 끝 — 그래도 기억한 만큼 별이 남습니다. */

window.MemoryWalkScene = class MemoryWalkScene extends MiniGameScene {
  constructor() { super('MemoryWalkScene'); }

  create(data) {
    data = data || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.buildFrame({ from: data.from, title: '일곱 날의 기억', hint: '', bg: '#1b2440', warm: false });
    this.add.image(W / 2, H / 2, 'sky_night').setDisplaySize(W, H).setDepth(-90).setAlpha(0.8);

    const items = [
      { tex: 'stone', name: 'DAY 2 · 돌', col: 0x9aa4b0, f: 392.0 },
      { tex: 'rosary', name: '묵주', col: 0xb28fd0, f: 440.0 },
      { tex: 'star_bright', name: 'DAY 6 · 별', col: 0xffe08a, f: 523.25 },
      { tex: 'cross_small', name: '십자가', col: 0xe0a070, f: 587.33 },
      { tex: 'bible_book', name: '말씀', col: 0xd77a6a, f: 659.25 },
      { tex: 'soccer_ball', name: '친구들', col: 0x8fc0d9, f: 783.99 }
    ];
    this.pads = items.map((it, i) => {
      const x = W / 2 + (i % 2 === 0 ? -82 : 82), y = 280 + Math.floor(i / 2) * 150;
      const c = this.add.container(x, y).setDepth(10);
      const glow = this.add.image(0, 0, 'lamp_glow').setDisplaySize(220, 220).setTint(it.col).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      const bg = this.add.image(0, 0, UI.skin(this, 'circ', 120, 120, 60, PAL.paper));
      const img = this.add.image(0, -6, it.tex).setScale(it.tex === 'star_bright' ? 2.2 : it.tex === 'bible_book' ? 0.9 : 1.1);
      if (it.tex === 'star_bright') img.setTint(0xf2b034);
      const label = this.add.text(0, 44, it.name, UI.style(11, PAL.inkSoft, { shadow: false })).setOrigin(0.5);
      c.add([glow, bg, img, label]);
      c.it = it; c.glow = glow; c.i = i;
      c.setSize(124, 124).setInteractive(new Phaser.Geom.Circle(62, 62, 62), Phaser.Geom.Circle.Contains);
      c.on('pointerdown', () => this.press(c));
      return c;
    });
    this.status = this.add.text(W / 2, 180, '', UI.style(18, PAL.cream)).setOrigin(0.5).setDepth(20);
    this.lives = 3;
    this.livesT = this.add.text(W - 24, 112, '', UI.style(16, '#ff9b8b')).setOrigin(1, 0.5).setDepth(880);
    this.seq = []; this.pos = 0; this.listening = false;

    GameFX.intro(this, {
      key: this.scene.key, badge: 'DAY 8 · 집으로', title: '일곱 날의 기억',
      sub: data.intro || '오늘은 가롤로가 없습니다. 그래도 기억은 남아 있어요.',
      how: ['기억들이 하나씩 빛나요 — 순서를 잘 보세요', '같은 순서로 눌러요', '한 판마다 하나씩 길어져요', '세 번 틀리면 끝. 기억한 만큼 별이 남아요'],
      onStart: () => { this.hud = GameFX.hud(this); this.updateLives(); this.nextRound(); }
    });
  }

  updateLives() { this.livesT.setText('♥'.repeat(this.lives) + '♡'.repeat(3 - this.lives)); }

  light(c, ms) {
    this.tweens.killTweensOf([c, c.glow]);
    c.glow.setAlpha(0.9); c.setScale(1.1);
    this.tweens.add({ targets: c.glow, alpha: 0, duration: ms || 420 });
    this.tweens.add({ targets: c, scale: 1, duration: ms || 420, ease: 'Quad.easeOut' });
    this.toneFor(c);
  }
  toneFor(c) {
    /* 기억마다 제 음이 있습니다 */
    const idx = [0, 1, 2, 3, 4, 5].indexOf(c.i);
    AudioSystem.gScore(idx + 1);
  }

  nextRound() {
    this.seq.push(Math.floor(Math.random() * this.pads.length));
    this.pos = 0;
    this.listening = false;
    this.status.setText(this.seq.length + '번째 기억 — 잘 보세요');
    const speed = Math.max(260, 620 - this.seq.length * 25);
    this.seq.forEach((p, i) => this.time.delayedCall(700 + i * speed, () => this.light(this.pads[p], speed * 0.8)));
    this.time.delayedCall(700 + this.seq.length * speed, () => {
      this.listening = true;
      this.status.setText('이제 따라 눌러 보세요');
    });
  }

  press(c) {
    if (!this.listening) return;
    this.light(c, 260);
    if (c.i === this.seq[this.pos]) {
      this.pos++;
      if (this.pos === this.seq.length) {
        this.listening = false;
        this.hud.hit(10 * this.seq.length, GAME.WIDTH / 2, 230, this.seq.length + '개!');
        GameFX.flash(this, 0xfff1cf);
        this.time.delayedCall(600, () => this.nextRound());
      }
    } else {
      this.listening = false;
      this.lives--;
      this.updateLives();
      this.hud.miss(c.x, c.y - 70);
      const want = this.pads[this.seq[this.pos]];
      this.tweens.add({ targets: want.glow, alpha: 0.9, duration: 200, yoyo: true, repeat: 2 });
      if (this.lives <= 0) { this.time.delayedCall(900, () => this.end()); return; }
      this.status.setText('괜찮아요, 같은 순서를 한 번 더');
      this.time.delayedCall(1100, () => {
        this.pos = 0;
        const speed = Math.max(260, 620 - this.seq.length * 25);
        this.seq.forEach((p, i) => this.time.delayedCall(300 + i * speed, () => this.light(this.pads[p], speed * 0.8)));
        this.time.delayedCall(300 + this.seq.length * speed, () => { this.listening = true; this.status.setText('이제 따라 눌러 보세요'); });
      });
    }
  }

  end() {
    const best = this.seq.length - 1;
    this.finishGame({
      title: '기억이 이렇게 많아요', score: this.hud.score,
      stars: best >= 9 ? 3 : best >= 5 ? 2 : 1,
      detail: '가장 길게 ' + best + '개',
      line: '“가롤로는 없지만, 같이 걸은 날들은 그대로 남아 있어.”'
    });
  }
};
