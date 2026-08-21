/* DAY 3 · 엔딩 — 내 안에 머물러라 */

window.Day3EndScene = class Day3EndScene extends Phaser.Scene {
  constructor() { super('Day3EndScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#0d1220');
    const E = DAY03.end;

    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x121a2b, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0x18233a, 1); g.fillRect(0, 470, W, H - 470);
    g.fillStyle(0x1e2b45, 1); g.fillRoundedRect(60, 360, 270, 300, 12);
    g.fillStyle(0x26354f, 1); g.fillRoundedRect(74, 376, 120, 60, 10);

    this.phoneGlow = this.add.image(196, 470, 'lamp_glow').setDepth(2).setScale(1.1).setAlpha(0.35);
    this.phone = this.add.image(196, 470, 'phone_obj').setDepth(3).setScale(1.5);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1200, [8, 10, 18]);

    this.time.delayedCall(900, () => {
      this.dialogue.say(E.room, () => {
        this.tweens.add({ targets: [this.phone, this.phoneGlow], alpha: 0, duration: 1100 });
        this.time.delayedCall(1200, () => this.dialogue.play(E.words, () => this.light()));
      });
    });
  }

  /* 성체등을 닮은 작은 빛 */
  light() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const black = this.add.graphics().setDepth(50);
    black.fillStyle(0x070a12, 1); black.fillRect(0, 0, W, H);
    black.setAlpha(0);
    this.tweens.add({ targets: black, alpha: 1, duration: 1600 });

    this.time.delayedCall(2000, () => {
      const glow = this.add.image(W / 2, H * 0.38, 'lamp_glow').setDepth(60)
        .setScale(0.6).setAlpha(0).setTint(0xffd9a8);
      const core = this.add.image(W / 2, H * 0.38, 'spark').setDepth(61).setScale(0).setTint(0xfff1cf);
      this.tweens.add({ targets: glow, alpha: 0.7, scale: 1.5, duration: 2200 });
      this.tweens.add({ targets: core, alpha: 1, scale: 2.2, duration: 1800 });
      this.tweens.add({ targets: [glow, core], alpha: 0.45, duration: 3000, yoyo: true, repeat: -1, delay: 2200 });
      AudioSystem.bell();

      this.time.delayedCall(2600, () => {
        const t = this.add.text(W / 2, H * 0.56, '“' + DAY03.end.light + '”',
          UI.style(24, PAL.cream, { align: 'center' })).setOrigin(0.5).setDepth(62).setAlpha(0);
        this.tweens.add({ targets: t, alpha: 1, duration: 1400 });
        this.time.delayedCall(3400, () => this.finale());
      });
    });
  }

  finale() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const E = DAY03.end;

    const title = this.add.text(W / 2, H * 0.20, E.complete, UI.style(28, PAL.cream))
      .setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 1000 });
    AudioSystem.chime();

    const line = this.add.text(W / 2, H * 0.72, '', UI.style(20, '#d9c9ae', {
      align: 'center', wordWrap: { width: W - 60 }, lineSpacing: 8
    })).setOrigin(0.5).setDepth(70).setAlpha(0);

    const seq = [E.line1, E.line2];
    let i = 0;
    const step = () => {
      if (i >= seq.length) { this.time.delayedCall(1200, () => this.done()); return; }
      line.setText(seq[i]);
      line.setColor(i === 1 ? PAL.sun : '#d9c9ae');
      line.setFontSize(i === 1 ? 23 : 20);
      line.setAlpha(0);
      this.tweens.add({
        targets: line, alpha: 1, duration: 900,
        onComplete: () => {
          i++;
          this.time.delayedCall(2400, () => {
            if (i >= seq.length) { step(); return; }
            this.tweens.add({ targets: line, alpha: 0, duration: 700, onComplete: step });
          });
        }
      });
    };
    this.time.delayedCall(1400, step);
  }

  done() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.addJournal({
      day: 3, title: DAY03.note.day,
      word: SaveSystem.get('reflections.day3Heart', null),
      practice: SaveSystem.get('reflections.day3Practice', null),
      cards: Collection.countOfDay(3)
    });
    SaveSystem.completeDay(3);

    /* 다음 날로 바로 갈 수도, 오늘은 여기까지 해도 됩니다 */
    UI.dayEndButtons(this, 3);
  }
};
