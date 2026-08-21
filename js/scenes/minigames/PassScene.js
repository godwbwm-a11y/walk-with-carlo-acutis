/* 에필로그 미니게임 · 패스! — 골대도 점수도 없습니다. 공을 이어주기만 하면 됩니다. */

window.PassScene = class PassScene extends MiniGameScene {
  constructor() { super('PassScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#8aa96b',
      title: EPI.pass.title, hint: EPI.pass.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.passes = 0;
    this.missed = false;
    this.busy = true;

    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0x7d9c60, 1); g.fillRect(0, 130, W, H - 130);
    g.fillStyle(0x86a668, 1);
    for (let y = 150; y < H; y += 56) g.fillRect(0, y, W, 26);
    g.lineStyle(3, 0xf4ede0, 0.5);
    g.strokeRoundedRect(24, 170, W - 48, H - 240, 18);

    /* 다섯 사람이 둥글게 섭니다 */
    /* 이름표와 사람이 어긋나지 않도록 EPI.pass.names 순서 그대로 세웁니다 */
    const spots = [[76, 300], [314, 300], [60, 500], [195, 646], [330, 500]];
    const tex = ['friend_front', 'epi_phi_front', 'epi_ita_front', 'player_front', 'epi_fra_front'];
    this.people = spots.map((s, i) => {
      const c = this.add.container(s[0], s[1]).setDepth(60);
      const img = this.add.image(0, 0, tex[i]).setScale(1.5);
      c.add(img);
      c.add(this.add.text(0, 44, EPI.pass.names[i], UI.style(12, PAL.cream)).setOrigin(0.5));
      c.setSize(74, 96);
      c.setInteractive();
      c.idx = i;
      c.on('pointerup', () => this.passTo(c));
      this.tweens.add({ targets: img, y: -4, duration: 900 + i * 90, yoyo: true, repeat: -1 });
      return c;
    });

    this.holder = this.people[3];               /* 처음에는 내가 들고 있습니다 */
    this.ball = this.add.image(this.holder.x + 30, this.holder.y + 20, 'soccer_ball')
      .setDepth(200).setScale(1.3);
    this.tweens.add({ targets: this.ball, angle: 360, duration: 2400, repeat: -1 });

    this.count = this.add.text(W / 2, H - 62, '', UI.style(FONT.small, PAL.cream))
      .setOrigin(0.5).setDepth(100).setAlpha(0.9);

    this.time.delayedCall(600, () => { this.busy = false; });
  }

  passTo(target) {
    if (this.finished || this.busy || target === this.holder) return;
    this.busy = true;
    AudioSystem.kick();

    /* 세 번째 패스는 한 번 빗나갑니다 — 그리고 아무 일도 일어나지 않습니다 */
    const willMiss = (this.passes === 2 && !this.missed);
    const tx = willMiss ? target.x + 150 : target.x + 30;
    const ty = willMiss ? target.y - 120 : target.y + 20;

    this.tweens.add({
      targets: this.ball, x: tx, y: ty, duration: 620, ease: 'Sine.easeOut',
      onComplete: () => {
        if (willMiss) { this.miss(target); return; }
        this.holder = target;
        this.passes++;
        this.count.setText(EPI.pass.step + '  ' + this.passes);
        this.tweens.add({ targets: target, scale: 1.08, duration: 180, yoyo: true });
        if (this.passes >= 5) { this.time.delayedCall(600, () => this.finish()); return; }
        this.busy = false;
      }
    });
  }

  miss(target) {
    this.missed = true;
    this.dialogue.play(EPI.pass.miss, () => {
      this.tweens.add({
        targets: this.ball, x: target.x + 30, y: target.y + 20, duration: 700, ease: 'Sine.easeInOut',
        onComplete: () => {
          this.holder = target;
          this.passes++;
          this.count.setText(EPI.pass.step + '  ' + this.passes);
          this.busy = false;
        }
      });
    });
  }

  /* CLEAR 도 점수도 뜨지 않습니다 */
  finish() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.setHint('');
    this.count.setText('');

    this.people.forEach((c, i) => {
      c.disableInteractive();
      this.tweens.add({ targets: c, y: c.y - 14, duration: 320, yoyo: true, delay: i * 90 });
    });
    AudioSystem.chime();

    const t = this.add.text(W / 2, 200, EPI.pass.doneLine, UI.style(22, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 900, delay: 700 });

    this.time.delayedCall(2600, () => this.complete(EPI.pass.done));
  }
};
