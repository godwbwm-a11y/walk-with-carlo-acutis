/* DAY 4 · 엔딩 — 나는 복사본이 아니다 */

window.Day4EndScene = class Day4EndScene extends Phaser.Scene {
  constructor() { super('Day4EndScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#0d1220');
    const E = DAY04.end;

    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x121a2b, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0x18233a, 1); g.fillRect(0, 470, W, H - 470);
    g.fillStyle(0x1e2b45, 1); g.fillRoundedRect(60, 360, 270, 300, 12);
    g.fillStyle(0x26354f, 1); g.fillRoundedRect(74, 376, 120, 60, 10);

    this.glow = this.add.image(196, 470, 'lamp_glow').setDepth(2).setScale(1.1).setAlpha(0.3);
    this.phone = this.add.image(196, 470, 'phone_obj').setDepth(3).setScale(1.5);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1200, [8, 10, 18]);

    this.time.delayedCall(900, () => {
      this.dialogue.say(E.room, () => {
        this.dialogue.say(E.scroll, () => {
          this.tweens.add({ targets: [this.phone, this.glow], alpha: 0, duration: 1000 });
          this.time.delayedCall(1100, () => this.mirror());
        });
      });
    });
  }

  mirror() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const frame = this.add.graphics().setDepth(10);
    frame.fillStyle(HEX(PAL.woodDark), 1); frame.fillRoundedRect(110, 210, 170, 250, 16);
    frame.fillStyle(0x2b3550, 1); frame.fillRoundedRect(120, 220, 150, 230, 10);
    const me = this.add.image(195, 350, 'player_front').setDepth(12).setScale(1.9).setAlpha(0.9);
    frame.setAlpha(0); me.setAlpha(0);
    this.tweens.add({ targets: [frame, me], alpha: 1, duration: 900 });

    const list = SaveSystem.get('reflections.day4Strengths', []) || [];
    const lines = DAY04.end.self.slice();
    list.slice(0, 2).forEach(s => lines.push({ s: '나', t: s.replace('한다', '하고') + '.' }));

    this.dialogue.say(DAY04.end.mirror, () => {
      this.dialogue.play(lines, () => {
        this.dialogue.play(DAY04.end.selfEnd, () => this.copier());
      });
    });
  }

  /* 복사기와 ERROR */
  copier() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const black = this.add.graphics().setDepth(50);
    black.fillStyle(0x090c14, 1); black.fillRect(0, 0, W, H);
    black.setAlpha(0);
    this.tweens.add({ targets: black, alpha: 1, duration: 1200 });

    this.time.delayedCall(1400, () => {
      const sound = this.add.text(W / 2, 180, DAY04.end.copySound, UI.style(FONT.body, '#8fa5c8'))
        .setOrigin(0.5).setDepth(60).setAlpha(0);
      this.copyBits = [sound];
      this.tweens.add({ targets: sound, alpha: 1, duration: 600 });
      AudioSystem.swipe();

      /* 똑같은 종이 두 장 */
      [0, 1].forEach((i) => {
        this.time.delayedCall(900 + i * 900, () => {
          const p = this.add.container(W / 2, 300 + i * 90).setDepth(60);
          const g = this.add.graphics();
          g.fillStyle(0xf3ece2, 0.95); g.fillRoundedRect(-110, -34, 220, 68, 8);
          p.add(g);
          [-60, -20, 20, 60].forEach(x => p.add(this.add.image(x, 0, 'villager_front').setScale(0.7).setTint(0x9aa0ac)));
          p.setAlpha(0);
          this.tweens.add({ targets: p, alpha: 1, y: p.y + 10, duration: 500 });
          this.copyBits.push(p);
          AudioSystem.tap();
        });
      });

      this.time.delayedCall(2900, () => {
        const err = this.add.text(W / 2, H * 0.56, DAY04.end.error, UI.style(34, PAL.clay))
          .setOrigin(0.5).setDepth(70).setAlpha(0);
        this.tweens.add({ targets: err, alpha: 1, duration: 200, yoyo: true, repeat: 3 });
        this.cameras.main.shake(500, 0.006);
        this.time.delayedCall(1400, () => { err.destroy(); this.original(); });
      });
    });
  }

  original() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const E = DAY04.end;

    (this.copyBits || []).forEach((o) => {      // 복사본을 걷어낸 자리에 사람들이 옵니다
      this.tweens.add({ targets: o, alpha: 0, duration: 600, onComplete: () => o.destroy() });
    });
    this.copyBits = [];

    const row = this.add.container(W / 2, H * 0.40).setDepth(80);
    const kinds = ['player_front', 'child_front', 'villager_front', 'grandma_front', 'clerk_front'];
    kinds.forEach((k, i) => {
      const s = this.add.image((i - 2) * 68, 0, k).setScale(i === 0 ? 1.7 : 1.35);
      row.add(s);
      s.setAlpha(0);
      this.tweens.add({ targets: s, alpha: 1, duration: 700, delay: i * 200 });
    });

    this.time.delayedCall(1600, () => {
      const t1 = this.add.text(W / 2, H * 0.58, E.original, UI.style(30, PAL.sun))
        .setOrigin(0.5).setDepth(80).setAlpha(0);
      this.tweens.add({ targets: t1, alpha: 1, duration: 900 });
      AudioSystem.chime();

      this.time.delayedCall(1600, () => {
        const t2 = this.add.text(W / 2, H * 0.66, E.line1, UI.style(24, PAL.cream))
          .setOrigin(0.5).setDepth(80).setAlpha(0);
        this.tweens.add({ targets: t2, alpha: 1, duration: 900 });
        this.time.delayedCall(1800, () => {
          const t3 = this.add.text(W / 2, H * 0.73, E.line2, UI.style(24, PAL.cream))
            .setOrigin(0.5).setDepth(80).setAlpha(0);
          this.tweens.add({ targets: t3, alpha: 1, duration: 900 });
          this.time.delayedCall(2200, () => this.finale());
        });
      });
    });
  }

  finale() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const E = DAY04.end;
    this.cameras.main.fadeOut(900, 9, 12, 20);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.children.list.slice().forEach(o => o.destroy());   // 거울·복사기·방까지 모두 걷어냅니다
      this.cameras.main.fadeIn(900, 9, 12, 20);

      const title = this.add.text(W / 2, H * 0.30, E.complete, UI.style(28, PAL.cream))
        .setOrigin(0.5).setDepth(90).setAlpha(0);
      this.tweens.add({ targets: title, alpha: 1, duration: 1000 });

      const line = this.add.text(W / 2, H * 0.50, '', UI.style(19, '#d9c9ae', {
        align: 'center', wordWrap: { width: W - 60 }, lineSpacing: 8
      })).setOrigin(0.5).setDepth(90).setAlpha(0);

      const seq = [E.line3, E.line4];
      let i = 0;
      const step = () => {
        if (i >= seq.length) { this.time.delayedCall(1200, () => this.done()); return; }
        line.setText(seq[i]);
        line.setColor(i === 1 ? PAL.sun : '#d9c9ae');
        line.setFontSize(i === 1 ? 23 : 19);
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
    });
  }

  done() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.addJournal({
      day: 4, title: DAY04.note.day,
      strength: SaveSystem.get('reflections.day4MainStrength', null),
      practice: SaveSystem.get('reflections.day4Practice', null),
      cards: Collection.countOfDay(4)
    });
    SaveSystem.completeDay(4);

    /* 다음 날로 바로 갈 수도, 오늘은 여기까지 해도 됩니다 */
    UI.dayEndButtons(this, 4);
  }
};
