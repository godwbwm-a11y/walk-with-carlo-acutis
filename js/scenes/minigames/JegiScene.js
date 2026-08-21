/* 에필로그 미니게임 · 제기 하나 — 몇 번을 찼는지 세지 않습니다.
   떨어지면 여럿이 주워주고 다시 시작할 뿐입니다. */

window.JegiScene = class JegiScene extends MiniGameScene {
  constructor() { super('JegiScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#d0c3a4', warm: true,
      title: EPI.jegi.title, hint: ''
    });
    this.titleText.setColor(PAL.ink);
    this.hintText.setColor(PAL.inkSoft);

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    /* 위쪽은 본당 마당의 하늘 — 제기가 그 위로 올라갑니다 */
    this.add.image(W / 2, 130, 'epi_sky_day').setOrigin(0.5, 0)
      .setDisplaySize(W, 210).setDepth(-95);
    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0xd6cdb8, 1); g.fillRect(0, 330, W, H - 330);
    g.fillStyle(0xc4bba4, 1); g.fillRect(0, 470, W, H - 470);
    g.fillStyle(0xcdc3ac, 1); g.fillRect(0, 464, W, 10);
    this.add.image(40, 336, 'church_front').setOrigin(0.5, 1).setDepth(-88).setScale(0.7).setAlpha(0.9);
    this.add.image(300, 334, 'tree_big').setOrigin(0.5, 1).setDepth(-88).setScale(0.75).setAlpha(0.9);
    this.add.image(W / 2, 250, 'epi_lights').setDepth(-86).setScale(0.9).setAlpha(0.5);

    /* 말풍선에 가리지 않도록 마당을 위쪽에 둡니다 */
    this.me = this.add.image(W / 2 - 80, 476, 'player_front').setDepth(476).setScale(1.5);
    this.leo = this.add.image(W / 2 + 80, 472, 'epi_leo_front').setDepth(472).setScale(1.5);
    [this.me, this.leo].forEach((o, i) => {
      this.tweens.add({ targets: o, y: o.y - 4, duration: 900 + i * 120, yoyo: true, repeat: -1 });
    });
    this.watchers = [[64, 440, 'epi_ita_front'], [330, 444, 'epi_phi_front']].map((p) => {
      const img = this.add.image(p[0], p[1], p[2]).setDepth(p[1]).setScale(1.3).setAlpha(0.95);
      this.tweens.add({ targets: img, y: p[1] - 3, duration: 1000, yoyo: true, repeat: -1 });
      return img;
    });

    this.jegi = this.add.image(W / 2 - 80, 396, 'epi_jegi').setDepth(300).setScale(1.5).setAlpha(0);

    this.time.delayedCall(600, () => {
      this.dialogue.play(EPI.jegi.open, () => this.myTurn());
    });
  }

  /* 1 · 내가 먼저 — 두 번 차고 떨어집니다 */
  myTurn() {
    const W = GAME.WIDTH;
    this.setHint(EPI.jegi.hint);
    this.kicks = 0;
    this.alive = true;
    this.jegi.setPosition(W / 2 - 80, 396).setAlpha(1);
    this.fall(W / 2 - 80);

    this.zone = this.add.zone(W / 2, GAME.HEIGHT / 2, W, GAME.HEIGHT)
      .setOrigin(0.5).setInteractive().setDepth(400);
    this.zone.on('pointerdown', () => this.kick());
  }

  fall(x) {
    if (this.falling) this.falling.stop();
    this.falling = this.tweens.add({
      targets: this.jegi, y: 452, duration: 1500, ease: 'Sine.easeIn',
      onComplete: () => this.dropped()
    });
  }

  kick() {
    if (!this.alive || this.jegi.y > 446) return;
    this.kicks++;
    AudioSystem.kick();
    this.tweens.add({ targets: this.me, y: this.me.y + 6, duration: 120, yoyo: true });
    if (this.falling) this.falling.stop();

    if (this.kicks >= 2) {                     /* 두 번이면 충분합니다 */
      this.alive = false;
      this.tweens.add({
        targets: this.jegi, y: 330, x: this.jegi.x + 60, duration: 500, ease: 'Sine.easeOut',
        onComplete: () => this.tweens.add({
          targets: this.jegi, y: 456, x: this.jegi.x + 40, duration: 700, ease: 'Sine.easeIn',
          onComplete: () => this.dropped()
        })
      });
      return;
    }
    this.tweens.add({
      targets: this.jegi, y: 320, duration: 420, ease: 'Sine.easeOut',
      onComplete: () => this.fall()
    });
  }

  dropped() {
    if (this.done1) return;
    this.done1 = true;
    this.alive = false;
    if (this.zone) { this.zone.destroy(); this.zone = null; }
    this.setHint('');

    const t = this.add.text(GAME.WIDTH / 2, 200, EPI.jegi.drop, UI.style(18, PAL.ink))
      .setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 600 });
    this.time.delayedCall(1600, () => {
      this.tweens.add({ targets: t, alpha: 0, duration: 500, onComplete: () => t.destroy() });
      this.friendTurn();
    });
  }

  /* 2 · 레오의 차례 — “Easy!” */
  friendTurn() {
    const W = GAME.WIDTH;
    this.jegi.setPosition(W / 2 + 80, 396);
    this.dialogue.play(EPI.jegi.friendTurn, () => this.pickUp());

    this.time.delayedCall(2600, () => {
      this.tweens.add({ targets: this.leo, y: this.leo.y + 8, duration: 150, yoyo: true });
      this.tweens.add({ targets: this.jegi, x: W + 40, y: 370, angle: 260, duration: 900, ease: 'Sine.easeOut' });
      AudioSystem.kick();
    });
  }

  /* 3 · 서로 주워준다 */
  pickUp() {
    const W = GAME.WIDTH;
    this.jegi.setPosition(W + 40, 442).setAngle(0);
    this.watchers.forEach((o, i) => {
      this.tweens.add({ targets: o, x: W - 60 - i * 40, duration: 900, delay: i * 200, yoyo: true });
    });
    this.tweens.add({
      targets: this.jegi, x: W / 2, y: 424, duration: 1100, delay: 500, ease: 'Sine.easeInOut'
    });
    AudioSystem.found();

    this.time.delayedCall(2000, () => this.complete(EPI.jegi.done));
  }
};
