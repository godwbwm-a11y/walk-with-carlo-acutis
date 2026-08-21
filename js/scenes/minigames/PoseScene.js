/* 에필로그 미니게임 · 사진은 이렇게 — 한 명은 꼭 다른 포즈를 합니다. */

window.PoseScene = class PoseScene extends MiniGameScene {
  constructor() { super('PoseScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#2f3f63',
      title: EPI.pose.title, hint: ''
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0x3a4a6e, 1); g.fillRect(0, 130, W, 330);
    g.fillStyle(0x4a5878, 1); g.fillRect(0, 460, W, H - 460);
    g.fillStyle(0x33405e, 1); g.fillRect(0, 454, W, 10);

    /* 다섯 사람이 나란히 */
    const tex = ['epi_ita_front', 'epi_phi_front', 'player_front', 'epi_leo_front', 'epi_fra_front'];
    this.row = tex.map((t, i) => {
      const c = this.add.container(52 + i * 72, 470).setDepth(60);
      const img = this.add.image(0, 0, t).setScale(1.5);
      c.add(img);
      const icon = this.add.text(0, -58, '', UI.style(26, PAL.cream)).setOrigin(0.5);
      c.add(icon);
      c.icon = icon;
      this.tweens.add({ targets: img, y: -4, duration: 900 + i * 80, yoyo: true, repeat: -1 });
      return c;
    });

    this.dialogue.play(EPI.pose.open, () => this.pick());
  }

  pick() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.setHint(EPI.pose.hint);
    this.btns = [];
    let y = 560;
    EPI.pose.poses.forEach((p, i) => {
      if (i >= 5) return;
      const x = (i % 2 === 0) ? W / 2 - 88 : W / 2 + 88;
      const yy = y + Math.floor(i / 2) * 74;
      const b = UI.button(this, x, yy, 168, 62, p.icon + '  ' + p.label,
        () => this.choose(p), { size: FONT.small });
      b.setDepth(200);
      this.btns.push(b);
    });
  }

  choose(p) {
    if (this.picked) return;
    this.picked = p;
    SaveSystem.set('epilogue.photoPose', p.label);
    AudioSystem.select();
    this.btns.forEach(b => b.destroy());
    this.setHint('');

    /* 모두 따라 합니다 — 한 명만 빼고 */
    const odd = 4;
    this.row.forEach((c, i) => {
      this.time.delayedCall(200 + i * 220, () => {
        c.icon.setText(i === odd ? '🤪' : p.icon);
        c.icon.setAlpha(0);
        this.tweens.add({ targets: c.icon, alpha: 1, duration: 300 });
        this.tweens.add({ targets: c, y: c.y - 8, duration: 200, yoyo: true });
        AudioSystem.tap();
      });
    });

    const W = GAME.WIDTH;
    const t = this.add.text(W / 2, 200, EPI.pose.follow, UI.style(18, PAL.cream))
      .setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 600, delay: 400 });

    this.time.delayedCall(1800, () => {
      t.setText(EPI.pose.odd);
      this.tweens.add({ targets: this.row[odd], scale: 1.1, duration: 240, yoyo: true });
      this.time.delayedCall(1600, () => { t.destroy(); this.shoot(); });
    });
  }

  shoot() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const n = this.add.text(W / 2, 250, '3', UI.style(46, PAL.sun)).setOrigin(0.5).setDepth(300);
    AudioSystem.blip();
    this.time.delayedCall(700, () => { n.setText('2'); AudioSystem.blip(); });
    this.time.delayedCall(1400, () => { n.setText('1'); AudioSystem.blip(); });
    this.time.delayedCall(2100, () => {
      n.destroy();
      const flash = this.add.graphics().setDepth(600);
      flash.fillStyle(0xffffff, 1); flash.fillRect(0, 0, W, H);
      AudioSystem.chime();
      this.add.text(W / 2, 200, EPI.pose.shot, UI.style(26, PAL.cream))
        .setOrigin(0.5).setDepth(700).setAlpha(0.001);
      this.tweens.add({
        targets: flash, alpha: 0, duration: 700,
        onComplete: () => { flash.destroy(); this.complete(EPI.pose.done); }
      });
    });
  }
};
