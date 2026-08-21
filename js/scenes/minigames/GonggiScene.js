/* 에필로그 미니게임 · 공기놀이 — 실패해도 아무도 그만두자고 하지 않습니다. */

window.GonggiScene = class GonggiScene extends MiniGameScene {
  constructor() { super('GonggiScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#cfc4a6', warm: true,
      title: EPI.gonggi.title, hint: EPI.gonggi.hint
    });
    this.titleText.setColor(PAL.ink);
    this.hintText.setColor(PAL.inkSoft);

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.round = 0;
    this.caught = 0;

    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0xd6cdb8, 1); g.fillRect(0, 130, W, H - 130);
    this.add.image(W / 2, 470, 'epi_mat').setDepth(-40).setScale(1.05);

    [[70, 330, 'epi_ita_front'], [326, 334, 'epi_phi_front'], [W / 2, 300, 'epi_leo_front']]
      .forEach((p) => {
        const img = this.add.image(p[0], p[1], p[2]).setDepth(10).setScale(1.35);
        this.tweens.add({ targets: img, y: p[1] - 4, duration: 950, yoyo: true, repeat: -1 });
      });
    this.add.image(W / 2, 640, 'player_back').setDepth(20).setScale(1.5);

    /* 바닥의 공깃돌 넷 */
    this.stones = [];
    [[W / 2 - 54, 452], [W / 2 - 18, 480], [W / 2 + 20, 452], [W / 2 + 56, 482]].forEach((s, i) => {
      const st = this.add.image(s[0], s[1], 'epi_gonggi').setDepth(60).setScale(1.7);
      st.setInteractive({ useHandCursor: true });
      st.home = { x: s[0], y: s[1] };
      st.taken = false;
      st.on('pointerup', () => this.grab(st));
      this.stones.push(st);
    });

    /* 던지는 돌 */
    this.up = this.add.image(W / 2, 560, 'epi_gonggi').setDepth(70).setScale(1.8);

    this.dialogue.play(EPI.gonggi.open, () => this.ready());
  }

  ready() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    if (this.throwBtn) this.throwBtn.destroy();
    this.throwBtn = UI.button(this, W / 2, H - 120, 250, 60, EPI.gonggi.throwBtn,
      () => this.toss(), { size: FONT.label, fill: PAL.sun });
    this.throwBtn.setDepth(200);
  }

  /* 돌을 던지면 잠깐만 시간이 있습니다 */
  toss() {
    if (this.flying || this.finished) return;
    this.flying = true;
    this.caught = 0;
    if (this.throwBtn) { this.throwBtn.destroy(); this.throwBtn = null; }
    AudioSystem.swipe();

    this.tweens.add({
      targets: this.up, y: 300, duration: 620, ease: 'Sine.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.up, y: 560, duration: 620, ease: 'Sine.easeIn',
          onComplete: () => this.land()
        });
      }
    });
  }

  grab(st) {
    if (!this.flying || st.taken) return;
    st.taken = true;
    this.caught++;
    AudioSystem.tap();
    /* 집은 돌은 손 옆에 나란히 놓입니다 */
    this.tweens.add({
      targets: st, x: GAME.WIDTH / 2 - 42 + this.caught * 28, y: 610,
      scale: 1.2, duration: 260
    });
  }

  land() {
    this.flying = false;
    this.round++;

    if (this.caught === 0) { this.scatter(); return; }

    /* 하나라도 집었으면 그냥 넘어갑니다 */
    AudioSystem.chime();
    if (this.round >= 2) { this.time.delayedCall(700, () => this.finish()); return; }
    this.time.delayedCall(700, () => this.ready());
  }

  /* 또르르— */
  scatter() {
    const W = GAME.WIDTH;
    this.setHint(EPI.gonggi.missed);
    AudioSystem.back();
    this.stones.forEach((st, i) => {
      this.tweens.add({
        targets: st, x: st.x + Phaser.Math.Between(-90, 90), y: st.y + Phaser.Math.Between(40, 110),
        angle: Phaser.Math.Between(-90, 90), duration: 700, ease: 'Sine.easeOut'
      });
    });

    this.time.delayedCall(900, () => {
      this.dialogue.play(EPI.gonggi.helped, () => {
        /* 여럿이 함께 주워 제자리로 */
        this.stones.forEach((st, i) => {
          st.taken = false;
          this.tweens.add({
            targets: st, x: st.home.x, y: st.home.y, angle: 0, scale: 1.7,
            duration: 700, delay: i * 120, ease: 'Sine.easeInOut'
          });
        });
        AudioSystem.found();
        this.setHint(EPI.gonggi.hint);
        this.time.delayedCall(1200, () => {
          if (this.round >= 2) this.finish(); else this.ready();
        });
      });
    });
  }

  finish() {
    this.setHint('');
    if (this.throwBtn) { this.throwBtn.destroy(); this.throwBtn = null; }
    this.stones.forEach(st => st.disableInteractive());
    this.complete(EPI.gonggi.done);
  }
};
