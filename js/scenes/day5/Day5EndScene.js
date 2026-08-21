/* DAY 5 · 엔딩 — 작은 조각 하나, 그리고 “용기를 내어라.” */

window.Day5EndScene = class Day5EndScene extends Phaser.Scene {
  constructor() { super('Day5EndScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#0e1830');

    this.add.image(W / 2, 0, 'sky_seoul_night').setOrigin(0.5, 0).setDisplaySize(W, H).setDepth(-40);
    this.add.image(W / 2, 320, 'seoul_night_block').setDepth(-30).setAlpha(0.85);
    const g = this.add.graphics().setDepth(-20);
    g.fillStyle(0x1b2540, 1); g.fillRect(0, 560, W, H - 560);
    g.fillStyle(0x2b3a5c, 1); g.fillRect(0, 730, W, H - 730);
    g.fillStyle(0xf3ece2, 0.3);
    for (let x = 6; x < W; x += 92) g.fillRect(x, 766, 52, 5);

    this.me = this.add.image(148, 604, 'player_back').setDepth(604).setScale(1.42);
    this.carlo = this.add.image(238, 616, 'carlo_back').setDepth(616).setScale(1.42);
    this.tweens.add({ targets: [this.me, this.carlo], y: '-=4', duration: 840, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1000, [8, 10, 18]);

    this.time.delayedCall(800, () => {
      this.dialogue.play(DAY05.end.walk, () => {
        this.dialogue.play(DAY05.end.talk, () => this.piece());
      });
    });
  }

  /* 어제의 조각을 떠올립니다 */
  piece() {
    const W = GAME.WIDTH;
    this.dialogue.play(DAY05.end.small, () => {
      const label = SaveSystem.get('reflections.day5Piece', null);
      if (label) {
        const t = this.add.text(W / 2, 300, '“' + label + '”', UI.style(21, PAL.sun))
          .setOrigin(0.5).setDepth(300).setAlpha(0);
        this.tweens.add({ targets: t, alpha: 1, duration: 800 });
        this.time.delayedCall(2400, () => this.tweens.add({
          targets: t, alpha: 0, duration: 700, onComplete: () => { t.destroy(); this.bye(); }
        }));
      } else {
        this.bye();
      }
    });
  }

  bye() {
    const W = GAME.WIDTH;
    const band = this.add.image(W / 2, 250, 'wyd_band').setDepth(300).setScale(1.4).setAlpha(0);
    this.tweens.add({ targets: band, alpha: 1, duration: 700 });

    this.dialogue.play(DAY05.end.bye, () => {
      band.destroy();
      this.tweens.add({ targets: this.carlo, x: W + 70, duration: 2200, ease: 'Sine.easeIn' });
      this.time.delayedCall(1600, () => this.phone());
    });
  }

  /* 스마트폰의 날짜가 잠깐 흔들립니다 */
  phone() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const veil = this.add.graphics().setDepth(400);
    veil.fillStyle(0x090c14, 0.9); veil.fillRect(0, 0, W, H);
    veil.setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 900 });

    const t = this.add.text(W / 2, H * 0.42, DAY05.end.phone1, UI.style(24, '#8fd0a8', {
      align: 'center', lineSpacing: 10
    })).setOrigin(0.5).setDepth(410).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 900, delay: 500 });

    this.time.delayedCall(2600, () => {
      this.cameras.main.shake(400, 0.004);
      t.setText(DAY05.end.phone2);
      AudioSystem.blip();
      this.time.delayedCall(1200, () => {
        this.dialogue.play(DAY05.end.huh, () => {
          this.tweens.add({
            targets: [veil, t], alpha: 0, duration: 900,
            onComplete: () => { veil.destroy(); t.destroy(); this.finale(); }
          });
        });
      });
    });
  }

  /* 검은 화면과 멀리서 들리는 성가, 그리고 주제 말씀 */
  finale() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, E = DAY05.end;
    this.cameras.main.fadeOut(900, 9, 12, 20);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.children.list.slice().forEach(o => o.destroy());
      this.cameras.main.fadeIn(900, 9, 12, 20);
      AudioSystem.setAmbience('none');
      AudioSystem.bell();

      const l1 = this.add.text(W / 2, H * 0.34, DAY05.theme.line1, UI.style(30, PAL.cream))
        .setOrigin(0.5).setDepth(90).setAlpha(0);
      const l2 = this.add.text(W / 2, H * 0.44, DAY05.theme.line2, UI.style(30, PAL.sun))
        .setOrigin(0.5).setDepth(90).setAlpha(0);
      this.tweens.add({ targets: l1, alpha: 1, duration: 1400, delay: 800 });
      this.tweens.add({ targets: l2, alpha: 1, duration: 1400, delay: 3000 });

      this.time.delayedCall(5400, () => {
        this.tweens.add({
          targets: [l1, l2], alpha: 0, duration: 900,
          onComplete: () => { l1.destroy(); l2.destroy(); this.complete(); }
        });
      });
    });
  }

  complete() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, E = DAY05.end;

    const title = this.add.text(W / 2, H * 0.28, E.complete, UI.style(28, PAL.cream))
      .setOrigin(0.5).setDepth(90).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 1000 });

    const line = this.add.text(W / 2, H * 0.48, '', UI.style(19, '#d9c9ae', {
      align: 'center', wordWrap: { width: W - 60 }, lineSpacing: 8
    })).setOrigin(0.5).setDepth(90).setAlpha(0);

    const seq = [E.line1, E.line2, E.last];
    let i = 0;
    const step = () => {
      if (i >= seq.length) { this.time.delayedCall(1200, () => this.done()); return; }
      line.setText(seq[i]);
      line.setColor(i === 2 ? PAL.sun : '#d9c9ae');
      line.setFontSize(i === 2 ? 23 : 19);
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
      day: 5, title: DAY05.note.day,
      strength: SaveSystem.get('reflections.day5Step', null),
      practice: SaveSystem.get('reflections.day5Practice', null),
      cards: Collection.countOfDay(5)
    });
    SaveSystem.completeDay(5);

    /* 다음 날로 바로 갈 수도, 오늘은 여기까지 해도 됩니다 */
    UI.dayEndButtons(this, 5);
  }
};
