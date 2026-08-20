/* 미니게임 · 무거운 가방 — 오늘은 하나면 됩니다. */

window.HeavyBagScene = class HeavyBagScene extends MiniGameScene {
  constructor() { super('HeavyBagScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#3a4054', warm: false,
      title: DAY02.bag.title, hint: ''
    });
    if (this.closeBtn) this.closeBtn.setVisible(false);

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.stage = 'zip';
    this.throwTries = 0;
    this.chosen = null;

    const g = this.add.graphics().setDepth(-2);
    g.fillStyle(0x2f3547, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0x3a4054, 1); g.fillEllipse(W / 2, H * 0.52, W * 1.6, 620);

    /* 돌무더기와 작은 십자가 */
    this.pile = this.add.image(96, H - 132, 'stone_pile').setDepth(4).setScale(0.9).setAlpha(0.9);
    this.add.image(146, H - 152, 'cross_small').setDepth(5).setScale(0.85).setAlpha(0.9);
    this.pileLabel = this.add.text(96, H - 84, '', UI.style(14, '#cbbfae')).setOrigin(0.5).setDepth(6);

    /* 가방 */
    this.bag = this.add.image(W / 2, 470, 'bag_open').setDepth(10).setScale(1.72);
    this.bagLid = this.add.graphics().setDepth(14);
    this.bagLid.fillStyle(0x4f7d6a, 1);
    this.bagLid.fillRoundedRect(W / 2 - 172, 386, 344, 120, 22);
    this.bagLid.fillStyle(0x3e6a58, 1);
    this.bagLid.fillRoundedRect(W / 2 - 172, 470, 344, 40, 12);

    this.zipper = this.add.image(W / 2, 398, 'zipper').setDepth(16).setScale(1.62);
    this.pull = this.add.image(W / 2 - 156, 398, 'zip_pull').setDepth(17).setScale(1.5)
      .setInteractive({ draggable: true, useHandCursor: true });
    this.pullHome = this.pull.x;

    this.input.on('drag', (p, obj, dx, dy) => this.onDrag(p, obj, dx, dy));
    this.input.on('dragend', (p, obj) => this.onDragEnd(p, obj));

    this.stones = [];
    this.dialogue.play(DAY02.bag.open, () => this.setHint(DAY02.bag.openHint));
  }

  /* ── 지퍼 열기 ────────────────────────────── */
  onDrag(p, obj, dx, dy) {
    if (obj === this.pull && this.stage === 'zip') {
      obj.x = Phaser.Math.Clamp(dx, this.pullHome, this.pullHome + 312);
      const t = (obj.x - this.pullHome) / 312;
      this.bagLid.setAlpha(1 - t);
      if (t > 0.92) this.openBag();
      return;
    }
    if (obj.isStone) {
      obj.x = dx; obj.y = dy;
      const now = this.time.now;
      if (obj.lastT) {
        const dt = Math.max(1, now - obj.lastT);
        const d = Phaser.Math.Distance.Between(obj.lastX, obj.lastY, dx, dy);
        obj.speed = obj.speed * 0.6 + (d / dt) * 0.4;
      }
      obj.lastT = now; obj.lastX = dx; obj.lastY = dy;
    }
  }

  onDragEnd(p, obj) {
    if (obj === this.pull && this.stage === 'zip') {
      this.tweens.add({ targets: obj, x: this.pullHome, duration: 300 });
      this.bagLid.setAlpha(1);
      return;
    }
    if (obj && obj.isStone) this.dropStone(obj);
  }

  openBag() {
    if (this.stage !== 'zip') return;
    this.stage = 'look';
    AudioSystem.swipe();
    this.pull.disableInteractive();
    this.tweens.add({ targets: [this.zipper, this.pull, this.bagLid], alpha: 0, duration: 500 });
    this.setHint('');
    this.dialogue.say(DAY02.bag.opened, () => this.spawnStones());
  }

  /* ── 돌 ───────────────────────────────────── */
  pickList() {
    const concern = SaveSystem.get('reflections.mainConcern', null);
    const all = DAY02.bag.stones.slice();
    const base = ['공부', '친구', '가족', '미래', '비교', '실수', '외모', '기대'];
    let list = all.filter(s => base.indexOf(s.id) !== -1);
    if (concern && !list.find(s => s.id === concern)) {
      const extra = all.find(s => s.id === concern);
      if (extra) { list.pop(); list.unshift(extra); }
    }
    return list;
  }

  spawnStones() {
    const concern = SaveSystem.get('reflections.mainConcern', null);
    const list = this.pickList();

    list.forEach((s, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = 74 + col * 82;
      const y = 428 + row * 74;
      const big = (s.id === concern);
      const c = this.add.container(x, y).setDepth(30);
      const img = this.add.image(0, 0, 'stone').setScale(big ? 0.92 : 0.66);
      const t = this.add.text(0, 1, s.id, UI.style(big ? 15 : 13, PAL.cream)).setOrigin(0.5);
      c.add([img, t]);
      c.setSize(big ? 62 : 48, big ? 48 : 36);
      c.setInteractive({ draggable: true, useHandCursor: true });
      c.isStone = true; c.stone = s; c.homeX = x; c.homeY = y; c.speed = 0; c.big = big;
      c.on('pointerdown', () => { c.speed = 0; c.lastT = 0; });
      c.on('pointerup', () => { if ((c.speed || 0) < 0.06) this.tapStone(c); });
      c.setAlpha(0);
      this.tweens.add({ targets: c, alpha: 1, duration: 300, delay: i * 60 });
      this.stones.push(c);
    });

    this.time.delayedCall(900, () => {
      this.stage = 'throw';
      this.setHint(DAY02.bag.goalRemove);
    });
  }

  tapStone(c) {
    if (this.dialogue.isOpen) return;
    if (this.stage === 'choose') { this.chooseStone(c); return; }
    this.dialogue.say(c.stone.lines);
  }

  dropStone(c) {
    const fast = (c.speed || 0) > 0.55;
    const outOfBag = (c.y < 380 || c.y > 560 || c.x < 40 || c.x > GAME.WIDTH - 40);

    if (this.stage === 'throw') {
      if (outOfBag) {
        this.throwTries++;
        AudioSystem.step();
        this.tweens.add({ targets: c, x: c.homeX, y: c.homeY, duration: 700, ease: 'Sine.easeInOut' });
        this.dialogue.say(DAY02.bag.throwBack, () => {
          if (this.throwTries >= 2) this.toChoose();
        });
      } else {
        this.tweens.add({ targets: c, x: c.homeX, y: c.homeY, duration: 250 });
      }
      return;
    }

    if (this.stage === 'put' && c === this.chosen) {
      const nearPile = Phaser.Math.Distance.Between(c.x, c.y, this.pile.x, this.pile.y - 20) < 130;
      if (nearPile && !fast) { this.layDown(c); return; }
      if (nearPile && fast) {
        this.tweens.add({ targets: c, x: c.homeX, y: c.homeY, duration: 600, ease: 'Back.easeOut' });
        this.dialogue.say(DAY02.bag.tooFast);
        return;
      }
      this.tweens.add({ targets: c, x: c.homeX, y: c.homeY, duration: 300 });
      return;
    }

    this.tweens.add({ targets: c, x: c.homeX, y: c.homeY, duration: 250 });
  }

  toChoose() {
    this.stage = 'choose';
    this.setHint('');
    this.dialogue.play(DAY02.bag.whyBack, () => {
      this.setHint(DAY02.bag.goalPut + '  ' + DAY02.bag.pickHint);
    });
  }

  chooseStone(c) {
    this.chosen = c;
    this.stage = 'when';
    this.stones.forEach(s => { if (s !== c) this.tweens.add({ targets: s, alpha: 0.35, duration: 400 }); });
    this.tweens.add({ targets: c, scale: 1.18, duration: 300, yoyo: true });
    this.setHint('');

    this.dialogue.choose(DAY02.bag.whenQ, DAY02.bag.whenChoices, (key) => {
      SaveSystem.set('reflections.day2StoneWhen', key);
      this.dialogue.play(DAY02.bag.whenReply[key], () => {
        this.dialogue.play(DAY02.bag.persuade, () => {
          this.stage = 'put';
          this.setHint(DAY02.bag.putHint);
          this.pileLabel.setText('여기에 내려놓기');
          this.tweens.add({ targets: this.pile, scale: 1.0, duration: 600, yoyo: true, repeat: -1 });
        });
      });
    });
  }

  layDown(c) {
    if (this.finished) return;
    this.stage = 'done';
    this.tweens.killTweensOf(this.pile);
    this.pile.setScale(0.9);
    this.pileLabel.setText('');
    this.setHint('');
    c.disableInteractive();

    SaveSystem.set('reflections.entrustedConcern', c.stone.id);
    const left = SaveSystem.get('stonesLeftBehind', []) || [];
    if (left.indexOf(c.stone.id) === -1) { left.push(c.stone.id); SaveSystem.set('stonesLeftBehind', left); }

    this.tweens.add({
      targets: c, x: this.pile.x + 14, y: this.pile.y - 26, scale: 0.9, duration: 900, ease: 'Sine.easeInOut',
      onComplete: () => {
        AudioSystem.step();
        this.dialogue.say(DAY02.bag.putDown, () => {
          this.time.delayedCall(1600, () => {
            AudioSystem.wave();
            this.dialogue.say(DAY02.bag.cardFound, () => { this.finished = true; this.leave(); });
          });
        });
      }
    });
  }
};
