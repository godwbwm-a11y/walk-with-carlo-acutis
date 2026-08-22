/* 미니게임 · 마음 한마디 — 정답은 없습니다. */

window.HeartWordScene = class HeartWordScene extends MiniGameScene {
  constructor() { super('HeartWordScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#6f8f6a',
      title: DAY03.heart.title,
      hint: DAY03.heart.hint
    });
    if (this.closeBtn) this.closeBtn.setVisible(false);

    const W = GAME.WIDTH, H = GAME.HEIGHT;

    const g = this.add.graphics().setDepth(-1);
    g.fillStyle(HEX('#7fae6b'), 1); g.fillRect(0, 520, W, H - 520);
    g.fillStyle(HEX('#8fbf7a'), 1); g.fillRect(0, 520, W, 12);
    this.add.image(46, 540, 'tree_big').setOrigin(0.5, 1).setDepth(0).setScale(0.85).setAlpha(0.9);
    this.add.image(330, 540, 'bush').setOrigin(0.5, 1).setDepth(0).setScale(1.1).setAlpha(0.9);
    this.add.image(W / 2, 610, 'bench').setDepth(610).setScale(1.35);

    this.me = this.add.image(W / 2 - 34, 592, 'player_back').setDepth(592).setScale(1.3);
    this.carlo = this.add.image(W / 2 + 40, 596, 'carlo_back').setDepth(596).setScale(1.3);

    this.note = this.add.text(W / 2, 742, DAY03.heart.note, UI.style(FONT.small, PAL.ink))
      .setOrigin(0.5).setDepth(40).setAlpha(0.85);

    /* 마음의 말들이 천천히 떠다닙니다 */
    this.words = [];
    DAY03.heart.words.forEach((w, i) => {
      this.time.delayedCall(200 + i * 220, () => this.spawn(w, i));
    });
  }

  spawn(word, i) {
    const W = GAME.WIDTH;
    const cols = 2;
    const col = i % cols, row = Math.floor(i / cols);
    const x = W / 2 + (col === 0 ? -84 : 84) + Phaser.Math.Between(-10, 10);
    const y = 190 + row * 76 + Phaser.Math.Between(-8, 8);

    const c = this.add.container(x, y).setDepth(40);
    const t = this.add.text(0, 0, word, UI.style(17, PAL.ink)).setOrigin(0.5);
    const g = this.add.graphics();
    const w = Math.max(140, t.width + 30), h = 50;
    g.fillStyle(0xffffff, 0.95); g.fillRoundedRect(-w / 2, -h / 2, w, h, 25);
    g.lineStyle(2, HEX(PAL.sun), 0.65); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 25);
    c.add([g, t]);
    c.setSize(w, h + 10);
    c.setInteractive();
    c.word = word;
    c.on('pointerdown', () => this.choose(c));

    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 500 });
    this.tweens.add({
      targets: c, y: y + Phaser.Math.Between(-8, 8), x: x + Phaser.Math.Between(-10, 10),
      duration: Phaser.Math.Between(2600, 4200), yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
    this.words.push(c);
  }

  choose(picked) {
    if (this.finished) return;
    this.finished = true;
    SaveSystem.set('reflections.day3Heart', picked.word);
    AudioSystem.select();
    this.setHint('');
    this.note.setText('');

    /* 고른 한마디만 남습니다 */
    this.words.forEach((c) => {
      if (c === picked) return;
      this.tweens.killTweensOf(c);
      this.tweens.add({ targets: c, alpha: 0, duration: 900, delay: Phaser.Math.Between(0, 500) });
    });
    this.tweens.killTweensOf(picked);
    picked.disableInteractive();
    this.tweens.add({
      targets: picked, x: GAME.WIDTH / 2, y: GAME.HEIGHT * 0.36, scale: 1.25,
      duration: 1100, ease: 'Sine.easeInOut'
    });

    this.time.delayedCall(1900, () => {
      this.dialogue.play(DAY03.park.after, () => this.leave());
    });
  }
};
