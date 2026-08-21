/* 에필로그 미니게임 · 이거 먹어봐 — 매운 것을 권하는 것도 환대입니다. */

window.TasteScene = class TasteScene extends MiniGameScene {
  constructor() { super('TasteScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#c9a97f', warm: true,
      title: EPI.taste.title, hint: EPI.taste.hint
    });
    this.titleText.setColor(PAL.ink);
    this.hintText.setColor(PAL.inkSoft);

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.tried = [];

    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0xd6cdb8, 1); g.fillRect(0, 130, W, H - 130);
    this.add.image(W / 2, 320, 'epi_lights').setDepth(-20).setScale(1.1).setAlpha(0.6);
    this.add.image(W / 2, 430, 'epi_long_table').setDepth(20).setScale(0.95);

    this.leo = this.add.image(W / 2 + 66, 372, 'epi_leo_front').setDepth(24).setScale(1.5);
    this.tweens.add({ targets: this.leo, y: 368, duration: 950, yoyo: true, repeat: -1 });
    this.me = this.add.image(W / 2 - 74, 486, 'player_back').setDepth(486).setScale(1.5);

    this.face = this.add.text(W / 2 + 66, 300, '', UI.style(34, PAL.ink)).setOrigin(0.5).setDepth(120);
    this.shout = this.add.text(W / 2, 208, '', UI.style(32, PAL.clay)).setOrigin(0.5).setDepth(120);

    this.buildFoods();
  }

  buildFoods() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.btns = [];
    EPI.taste.foods.forEach((f, i) => {
      const x = (i % 2 === 0) ? W / 2 - 90 : W / 2 + 90;
      const y = 534 + Math.floor(i / 2) * 70;
      const b = UI.button(this, x, y, 170, 60, f.icon + '  ' + f.label,
        () => this.give(f), { size: FONT.small });
      b.setDepth(200);
      this.btns.push(b);
    });
  }

  give(f) {
    if (this.busy || this.finished) return;
    this.busy = true;
    this.tried.push(f.id);
    AudioSystem.select();
    this.btns.forEach(b => b.destroy());
    this.setHint('');

    const tex = f.id === 'tteok' ? 'epi_tteok'
      : f.id === 'gimbap' ? 'epi_gimbap'
      : f.id === 'snack' ? 'epi_snackbag'
      : f.id === 'fruit' ? 'epi_fruit'
      : f.id === 'drink' ? 'epi_drink' : 'bread_loaf';

    const item = this.add.image(this.me.x, this.me.y - 40, tex).setDepth(300).setScale(1.2);
    this.tweens.add({
      targets: item, x: this.leo.x, y: this.leo.y - 10, duration: 700, ease: 'Sine.easeInOut',
      onComplete: () => {
        this.tweens.add({ targets: item, alpha: 0, duration: 400, onComplete: () => item.destroy() });
        if (f.id === 'tteok') this.spicy();
        else if (f.id === 'gimbap') this.gimbap();
        else this.other();
      }
    });
  }

  /* 떡볶이 — 이 장면은 꼭 남깁니다 */
  spicy() {
    const W = GAME.WIDTH;
    this.dialogue.play(EPI.taste.tteok, () => {
      this.leo.setTint(0xff9a8a);
      this.face.setText('😳');
      this.tweens.add({ targets: this.leo, x: this.leo.x + 5, duration: 60, yoyo: true, repeat: 8 });

      this.shout.setText(EPI.taste.spicy).setAlpha(0).setScale(0.7);
      this.tweens.add({ targets: this.shout, alpha: 1, scale: 1.15, duration: 300, ease: 'Back.easeOut' });
      AudioSystem.boom();

      this.time.delayedCall(1800, () => {
        this.tweens.add({ targets: this.shout, alpha: 0, duration: 400 });
        this.dialogue.play(EPI.taste.tteokAfter, () => {
          this.leo.clearTint();
          this.face.setText('👍');
          this.shout.setText(EPI.taste.veryGood).setColor(PAL.leaf).setAlpha(0).setScale(0.7);
          this.tweens.add({ targets: this.shout, alpha: 1, scale: 1.1, duration: 400, ease: 'Back.easeOut' });
          AudioSystem.chime();
          this.time.delayedCall(2000, () => this.after());
        });
      });
    });
  }

  gimbap() {
    this.face.setText('🙂');
    this.dialogue.play(EPI.taste.gimbap, () => this.after());
  }

  other() {
    this.face.setText('🙂');
    this.dialogue.play(EPI.taste.other, () => this.after());
  }

  /* 하나 더 권할 수도 있고, 그만해도 됩니다 */
  after() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.busy = false;
    if (this.tried.length >= 2) { this.complete(EPI.taste.done); return; }

    this.face.setText('');
    this.shout.setText('').setColor(PAL.clay);
    this.setHint(EPI.taste.hint);
    this.buildFoods();

    const b = UI.button(this, W / 2, H - 68, 230, 54, '이제 그만 권하기',
      () => this.complete(EPI.taste.done), { size: FONT.small, fill: PAL.sun });
    b.setDepth(200);
    this.btns.push(b);
  }
};
