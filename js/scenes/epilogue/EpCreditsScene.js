/* 엔딩 크레딧 — 밤하늘 위로 천천히 흘러갑니다.
   길게 누르면 빨라지고, 언제든 건너뛸 수 있습니다. */

window.EpCreditsScene = class EpCreditsScene extends Phaser.Scene {
  constructor() { super('EpCreditsScene'); }

  create(data) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.from = (data && data.from) || 'EpFinalScene';

    AudioSystem.setAmbience('none');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#070b14');

    /* 별 */
    for (let i = 0; i < 54; i++) {
      const s = this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(20, H - 20), 'dot')
        .setDepth(-40).setScale(Phaser.Math.FloatBetween(0.12, 0.34))
        .setAlpha(Phaser.Math.FloatBetween(0.12, 0.55));
      this.tweens.add({ targets: s, alpha: 0.05, duration: Phaser.Math.Between(2000, 4200),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2600) });
    }

    this.roll = this.add.container(0, H).setDepth(10);
    this.build();

    /* 위아래 어스름 — 글이 화면 밖으로 부드럽게 사라지도록 */
    const veil = this.add.graphics().setDepth(60);
    veil.fillStyle(0x070b14, 0.85); veil.fillRect(0, 0, W, 64);
    veil.fillStyle(0x070b14, 0.9); veil.fillRect(0, H - 82, W, 82);

    this.skipBtn = UI.button(this, W / 2, H - 44, 200, 48, CREDITS.skip,
      () => this.done(), { size: FONT.small, alpha: 0.9 });
    this.skipBtn.setDepth(80);

    this.hintText = this.add.text(W / 2, 34, CREDITS.hint, UI.style(12, '#6d8098'))
      .setOrigin(0.5).setDepth(80).setAlpha(0);
    this.tweens.add({ targets: this.hintText, alpha: 0.85, duration: 900, delay: 900 });
    this.time.delayedCall(6000, () => this.tweens.add({
      targets: this.hintText, alpha: 0, duration: 900
    }));

    /* 길게 누르면 빨라집니다 */
    this.fast = false;
    this.input.on('pointerdown', (p) => { if (p.y < H - 84) this.fast = true; });
    this.input.on('pointerup', () => { this.fast = false; });
    this.input.on('pointerupoutside', () => { this.fast = false; });

    this.finished = false;
    UI.fadeIn(this, 1200, [7, 11, 20]);
  }

  /* 한 줄씩 쌓아 올립니다 */
  build() {
    const W = GAME.WIDTH;
    const wrap = { align: 'center', wordWrap: { width: W - 64 }, lineSpacing: 9 };
    let y = 0;

    CREDITS.lines.forEach((it) => {
      if (it.t === 'gap') { y += it.h || 24; return; }

      if (it.t === 'rule') {
        const g = this.add.graphics();
        g.lineStyle(2, HEX(PAL.sun), 0.28);
        g.lineBetween(W / 2 - 70, y + 16, W / 2 + 70, y + 16);
        this.roll.add(g);
        y += 48;
        return;
      }

      let obj;
      if (it.t === 'role') {
        obj = this.add.text(W / 2, y, it.v, UI.style(14, '#8fa5c8', wrap)).setOrigin(0.5, 0);
        y += obj.height + 8;

      } else if (it.t === 'name') {
        obj = this.add.text(W / 2, y, it.v, UI.style(28, PAL.sun, wrap)).setOrigin(0.5, 0);
        y += obj.height + 10;

      } else if (it.t === 'big') {
        obj = this.add.text(W / 2, y, it.v, UI.style(24, PAL.cream, wrap)).setOrigin(0.5, 0);
        y += obj.height + 10;

      } else if (it.t === 'strong') {
        obj = this.add.text(W / 2, y, it.v, UI.style(18, PAL.clay, wrap)).setOrigin(0.5, 0);
        y += obj.height + 8;

      } else if (it.t === 'small') {
        obj = this.add.text(W / 2, y, it.v, UI.style(12, '#7f8ea6', wrap)).setOrigin(0.5, 0);
        y += obj.height + 8;

      } else if (it.t === 'made') {
        obj = this.add.text(W / 2, y, it.v, UI.style(19, PAL.cream, wrap)).setOrigin(0.5, 0);
        y += obj.height + 8;

      } else if (it.t === 'the_end') {
        obj = this.add.text(W / 2, y, it.v, UI.style(30, PAL.sun, wrap)).setOrigin(0.5, 0);
        y += obj.height + 10;

      } else if (it.t === 'yourname') {
        /* 여기에는 이름을 적어 두었다면 그 이름이 올라갑니다 */
        const mine = SaveSystem.get('epilogue.newFriendName', null);
        const who = (mine && mine !== '나') ? mine : 'YOUR NAME';
        obj = this.add.text(W / 2, y, it.v + '\n' + who, UI.style(24, PAL.sun, wrap)).setOrigin(0.5, 0);
        y += obj.height + 10;

      } else if (it.t === 'quote') {
        obj = this.add.text(W / 2, y + 12, '“' + it.v + '”',
          UI.style(19, PAL.cream, { align: 'center', wordWrap: { width: W - 84 }, lineSpacing: 8 }))
          .setOrigin(0.5, 0);
        y += obj.height + 28;

      } else {
        obj = this.add.text(W / 2, y, it.v, UI.style(17, '#d9c9ae', wrap)).setOrigin(0.5, 0);
        y += obj.height + 7;
      }

      this.roll.add(obj);
    });

    this.rollHeight = y;
  }

  update(time, delta) {
    if (this.finished) return;
    const d = Math.min(delta, 50) / 1000;
    this.roll.y -= (this.fast ? 280 : 72) * d;

    if (this.roll.y < -this.rollHeight) this.done();
  }

  done() {
    if (this.finished) return;
    this.finished = true;
    SaveSystem.set('epilogue.creditsSeen', true);

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    if (this.skipBtn) this.skipBtn.destroy();
    if (this.hintText) this.hintText.destroy();

    /* 마지막 한 줄만 남기고 갑니다 */
    const t = this.add.text(W / 2, H * 0.46, CREDITS.after, UI.style(21, PAL.sun, {
      align: 'center', wordWrap: { width: W - 60 }
    })).setOrigin(0.5).setDepth(90).setAlpha(0);
    this.tweens.add({ targets: this.roll, alpha: 0, duration: 900 });
    this.tweens.add({ targets: t, alpha: 1, duration: 1200, delay: 500 });
    AudioSystem.bell();

    this.time.delayedCall(3400, () => {
      UI.fadeOut(this, 1200, () => this.scene.start(this.from, { returning: true }), [8, 10, 18]);
    });
  }
};
