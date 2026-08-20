/* 미니게임 · 하느님이 내게 주신 것 — 발견에서 나눔으로 */

window.GiftScene = class GiftScene extends MiniGameScene {
  constructor() { super('GiftScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#2f3b5c', warm: false,
      title: DAY04.gift.title, hint: DAY04.gift.hint
    });
    if (this.closeBtn) this.closeBtn.setVisible(false);

    const W = GAME.WIDTH, H = GAME.HEIGHT;

    /* 밤하늘 */
    const g = this.add.graphics().setDepth(-2);
    g.fillStyle(0x1b2545, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0x2b3b60, 1); g.fillEllipse(W / 2, H + 120, W * 2, 420);
    for (let i = 0; i < 90; i++) {
      g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.5));
      g.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(20, 620), Phaser.Math.FloatBetween(0.6, 1.6));
    }

    let list = (SaveSystem.get('reflections.day4Strengths', []) || []).slice();
    if (list.length === 0) list = ['아직 잘 모르겠다'];
    if (list.length < 3) {
      DAY04.mirror.strengths.forEach(s => {
        if (list.length < 4 && list.indexOf(s) === -1 && s !== '아직 잘 모르겠다') list.push(s);
      });
    }
    this.list = list;

    this.stars = [];
    const rows = Math.ceil(list.length / 2);
    list.forEach((label, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = W / 2 + (col === 0 ? -88 : 88);
      const y = 200 + row * 86;
      const c = this.add.container(x, y).setDepth(20);
      const t = this.add.text(0, 0, label, UI.style(15, PAL.ink, {
        align: 'center', wordWrap: { width: 140 }
      })).setOrigin(0.5);
      const gg = this.add.graphics();
      const w = Math.max(150, t.width + 26), h = Math.max(52, t.height + 26);
      gg.fillStyle(0xfff6e6, 0.96); gg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
      gg.lineStyle(2, HEX(PAL.sun), 0.7); gg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
      const halo = this.add.image(0, 0, 'lamp_glow').setScale(0.5).setAlpha(0.25).setTint(0xffe0a8);
      c.add([halo, gg, t]);
      c.setSize(w, h + 8);
      c.setInteractive();
      c.label = label; c.halo = halo;
      c.on('pointerdown', () => this.pick(c));
      this.tweens.add({ targets: halo, alpha: 0.45, scale: 0.62, duration: 2200, yoyo: true, repeat: -1, delay: i * 200 });
      this.stars.push(c);
    });
  }

  pick(picked) {
    if (this.picked) return;
    this.picked = picked.label;
    SaveSystem.set('reflections.day4MainStrength', picked.label);
    AudioSystem.select();
    this.setHint('');

    this.stars.forEach((c) => {
      if (c === picked) return;
      this.tweens.add({ targets: c, alpha: 0, duration: 900 });
    });
    this.tweens.add({ targets: picked, x: GAME.WIDTH / 2, y: 250, scale: 1.12, duration: 900, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: picked.halo, alpha: 0.8, scale: 1.1, duration: 900 });

    this.time.delayedCall(1300, () => this.askUse());
  }

  askUse() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const uses = DAY04.gift.uses[this.picked] || DAY04.gift.usesDefault;

    const t = this.add.text(W / 2, 358, DAY04.gift.use, UI.style(FONT.body, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(60).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 700 });

    this.useUi = [t];
    let y = 434;
    uses.forEach((u, i) => {
      const b = UI.button(this, W / 2, y, W - 70, 60, u, () => this.chooseUse(u), { size: FONT.small });
      b.setDepth(60).setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 500, delay: 300 + i * 120 });
      this.useUi.push(b);
      y += 70;
    });
  }

  chooseUse(use) {
    if (this.finished) return;
    this.finished = true;
    SaveSystem.set('reflections.day4Use', use);
    AudioSystem.chime();
    (this.useUi || []).forEach((o) => {   // 고른 뒤에는 버튼을 치워 말씀카드가 잘 보이게
      this.tweens.add({ targets: o, alpha: 0, duration: 500, onComplete: () => o.destroy() });
    });
    this.useUi = [];
    this.dialogue.play(DAY04.sunset.giftAfter, () => {
      Collection.award(this, 'j4', () => this.leave());
    });
  }
};
