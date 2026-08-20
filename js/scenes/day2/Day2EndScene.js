/* DAY 2 · 엔딩 — 오늘은 하나면 됐습니다. */

window.Day2EndScene = class Day2EndScene extends Phaser.Scene {
  constructor() { super('Day2EndScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#0d1220');
    const E = DAY02.end;

    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x121a2b, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0x18233a, 1); g.fillRect(0, 470, W, H - 470);
    g.fillStyle(0x1e2b45, 1); g.fillRoundedRect(60, 360, 270, 300, 12);
    g.fillStyle(0x26354f, 1); g.fillRoundedRect(74, 376, 120, 60, 10);

    this.phoneGlow = this.add.image(196, 470, 'lamp_glow').setDepth(2).setScale(1.1).setAlpha(0.35);
    this.phone = this.add.image(196, 470, 'phone_obj').setDepth(3).setScale(1.5);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1200, [8, 10, 18]);
    this.time.delayedCall(900, () => this.dialogue.say(E.room, () => this.searchBox()));
  }

  searchBox() {
    const W = GAME.WIDTH;
    const box = this.add.container(W / 2, 340).setDepth(30);
    const g = this.add.graphics();
    g.fillStyle(0xfdf3e0, 0.96); g.fillRoundedRect(-140, -26, 280, 52, 26);
    g.lineStyle(2, HEX(PAL.sunDeep), 0.6); g.strokeRoundedRect(-140, -26, 280, 52, 26);
    const t = this.add.text(-112, 0, '', UI.style(18, PAL.ink)).setOrigin(0, 0.5);
    const cursor = this.add.text(-112, 0, '|', UI.style(18, PAL.inkSoft)).setOrigin(0, 0.5);
    box.add([g, t, cursor]);
    box.setAlpha(0);
    this.tweens.add({ targets: box, alpha: 1, duration: 600 });
    this.tweens.add({ targets: cursor, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });

    const word = DAY02.end.search;
    let i = 0;
    this.time.addEvent({
      delay: 170, repeat: word.length - 1,
      callback: () => {
        i++;
        t.setText(word.substring(0, i));
        cursor.x = -112 + t.width + 2;
        AudioSystem.talk();
        if (i >= word.length) {
          this.time.delayedCall(1400, () => {
            this.dialogue.say(DAY02.end.stop, () => {
              this.tweens.add({ targets: [box, this.phone, this.phoneGlow], alpha: 0, duration: 900 });
              this.time.delayedCall(1000, () => this.dialogue.play(DAY02.end.words, () => this.stone()));
            });
          });
        }
      }
    });
  }

  stone() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const black = this.add.graphics().setDepth(50);
    black.fillStyle(0x090c14, 1); black.fillRect(0, 0, W, H);
    black.setAlpha(0);
    this.tweens.add({ targets: black, alpha: 1, duration: 1400 });

    this.time.delayedCall(1600, () => {
      const s = this.add.image(W / 2, H * 0.34, 'stone').setDepth(60).setScale(0.9).setAlpha(0);
      this.tweens.add({ targets: s, alpha: 1, duration: 900 });
      this.tweens.add({
        targets: s, y: H * 0.52, duration: 2200, delay: 900, ease: 'Sine.easeIn',
        onComplete: () => { AudioSystem.step(); this.time.delayedCall(900, () => this.finale()); }
      });
    });
  }

  finale() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const E = DAY02.end;
    const title = this.add.text(W / 2, H * 0.28, E.complete, UI.style(28, PAL.cream))
      .setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 1000 });
    AudioSystem.chime();

    const line = this.add.text(W / 2, H * 0.46, '', UI.style(20, '#d9c9ae', {
      align: 'center', wordWrap: { width: W - 60 }, lineSpacing: 8
    })).setOrigin(0.5).setDepth(70).setAlpha(0);

    const seq = [E.line1, E.line2, E.line3];
    let i = 0;
    const step = () => {
      if (i >= seq.length) { this.time.delayedCall(1000, () => this.done()); return; }
      line.setText(seq[i]);
      line.setColor(i === 2 ? PAL.sun : '#d9c9ae');
      line.setFontSize(i === 2 ? 23 : 20);
      line.setAlpha(0);
      this.tweens.add({
        targets: line, alpha: 1, duration: 900,
        onComplete: () => {
          i++;
          this.time.delayedCall(2200, () => {
            if (i >= seq.length) { this.time.delayedCall(200, step); return; }
            this.tweens.add({ targets: line, alpha: 0, duration: 700, onComplete: step });
          });
        }
      });
    };
    this.time.delayedCall(1600, step);
  }

  done() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.addJournal({
      day: 2, title: DAY02.note.day,
      concern: SaveSystem.get('reflections.entrustedConcern', null),
      practice: SaveSystem.get('reflections.day2Practice', null),
      cards: Collection.countOfDay(2)
    });
    SaveSystem.completeDay(2);

    UI.button(this, W / 2 - 66, H - 96, 176, 58, '처음 화면으로', () => {
      UI.fadeOut(this, 700, () => this.scene.start('TitleScene'));
    }, { size: FONT.small }).setDepth(80);
    UI.button(this, W / 2 + 100, H - 96, 108, 58, '보관함', () => {
      this.scene.launch('GalleryScene', { from: 'Day2EndScene' });
      this.scene.pause();
    }, { size: FONT.small, fill: PAL.cream }).setDepth(80);
  }
};
