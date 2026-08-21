/* DAY 7 · 밤 — 아침과 똑같은 방입니다. 그런데 책상 위가 조금 달라졌습니다. */

window.Day7EndScene = class Day7EndScene extends Phaser.Scene {
  constructor() { super('Day7EndScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#2b2438');

    this.add.tileSprite(W / 2, 92, W, 185, 'wall_tile').setDepth(0).setTint(0x6b5a52);
    this.add.tileSprite(W / 2, (185 + H) / 2, W, H - 185, 'floor_tile').setDepth(0).setTint(0x6a5a48);
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x4a3d33, 0.7); g.fillRect(0, 179, W, 10);

    this.add.image(160, 152, 'window_night').setOrigin(0.5, 1).setDepth(4).setScale(1.5);
    this.add.image(200, 318, 'lamp_room').setDepth(322).setScale(1.2);
    this.add.image(200, 300, 'lamp_glow').setDepth(321).setScale(1.4).setAlpha(0.35);
    this.add.image(150, 330, 'desk').setDepth(330).setScale(1.2);
    this.add.image(312, 460, 'bed').setDepth(460).setScale(1.15);
    this.add.image(168, 560, 'bag').setDepth(560).setScale(1.2).setAlpha(0.9);
    this.add.image(66, 596, 'rosary').setDepth(596).setScale(1.5).setAlpha(0.9);

    this.me = this.add.image(300, 520, 'player_front').setDepth(520).setScale(1.3);
    this.carlo = this.add.image(120, 128, 'carlo_front').setDepth(6).setScale(0.9).setAlpha(0.9);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1000, [22, 30, 50]);

    this.time.delayedCall(800, () => {
      this.dialogue.play(DAY07.end.open, () => this.showCard());
    });
  }

  /* 오늘 만든 카드를 다시 봅니다 */
  showCard() {
    const W = GAME.WIDTH;
    const made = SaveSystem.get('reflections.day7Card', null);
    if (!made) { this.talk2(); return; }

    this.dialogue.say(DAY07.end.cardLook, () => {
      const c = this.add.container(W / 2, 300).setDepth(500).setScale(0.5).setAlpha(0);
      c.add(this.add.image(0, 0, 'made_card'));
      c.add(this.add.text(0, -48, made.icon, UI.style(44, PAL.ink)).setOrigin(0.5));
      c.add(this.add.text(0, 26, made.message, UI.style(24, PAL.ink, {
        align: 'center', wordWrap: { width: 232 }
      })).setOrigin(0.5));
      this.tweens.add({ targets: c, alpha: 1, scale: 0.85, duration: 700 });
      this.time.delayedCall(2400, () => {
        this.tweens.add({
          targets: c, alpha: 0, duration: 600,
          onComplete: () => { c.destroy(); this.talk2(); }
        });
      });
    });
  }

  talk2() {
    this.dialogue.play(DAY07.end.talk2, () => {
      this.dialogue.play(DAY07.end.bye, () => {
        this.tweens.add({
          targets: this.carlo, x: -40, alpha: 0, duration: 2400, ease: 'Sine.easeIn'
        });
        this.time.delayedCall(1800, () => this.desk());
      });
    });
  }

  /* 책상 위 — 지금까지의 말씀 몇 장, 그리고 오늘의 카드 */
  desk() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    UI.fadeOut(this, 900, () => {
      this.children.list.slice().forEach(o => o.destroy());
      this.cameras.main.setBackgroundColor('#1a1526');
      this.cameras.main.fadeIn(900, 22, 20, 34);
      this.dialogue = new DialogueBox(this);

      this.add.image(W / 2, 620, 'desk_night').setDepth(10).setScale(1.05);
      this.add.image(W / 2, 500, 'lamp_glow').setDepth(5).setScale(2.2).setAlpha(0.22);
      this.add.text(W / 2, 130, DAY07.end.deskHead, UI.style(FONT.small, '#8fa5c8'))
        .setOrigin(0.5).setDepth(20).setAlpha(0.8);

      /* 지금까지의 말씀들 */
      let y = 190;
      DAY07.end.deskCards.forEach((line, i) => {
        const t = this.add.text(W / 2, y, line, UI.style(FONT.small, '#cbbfae'))
          .setOrigin(0.5).setDepth(20).setAlpha(0);
        this.tweens.add({ targets: t, alpha: 0.7, duration: 600, delay: i * 300 });
        y += 34;
      });

      /* 그리고 오늘의 카드 */
      this.time.delayedCall(1900, () => this.todayCard(y + 46));
    }, [22, 20, 34]);
  }

  todayCard(cy) {
    const W = GAME.WIDTH;
    const front = this.add.text(W / 2, cy, DAY07.end.todayFront, UI.style(20, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5).setDepth(30).setAlpha(0);
    this.tweens.add({ targets: front, alpha: 1, duration: 1000 });
    AudioSystem.chime();

    this.time.delayedCall(2800, () => {
      /* 카드가 뒤집힙니다 */
      this.tweens.add({
        targets: front, scaleX: 0, duration: 500, ease: 'Sine.easeIn',
        onComplete: () => {
          front.setText(DAY07.end.todayBack);
          this.tweens.add({ targets: front, scaleX: 1, duration: 500, ease: 'Sine.easeOut' });
        }
      });
      this.time.delayedCall(3400, () => {
        this.tweens.add({
          targets: front, alpha: 0, duration: 900,
          onComplete: () => { front.destroy(); this.finale(); }
        });
      });
    });
  }

  finale() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, E = DAY07.end;
    UI.fadeOut(this, 900, () => {
      this.children.list.slice().forEach(o => o.destroy());
      this.cameras.main.setBackgroundColor('#090c14');
      this.cameras.main.fadeIn(900, 9, 12, 20);
      AudioSystem.setAmbience('none');

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
            this.time.delayedCall(2600, () => {
              if (i >= seq.length) { step(); return; }
              this.tweens.add({ targets: line, alpha: 0, duration: 700, onComplete: step });
            });
          }
        });
      };
      this.time.delayedCall(1400, step);
    }, [9, 12, 20]);
  }

  done() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const gift = SaveSystem.get('reflections.day7Gift', null);
    SaveSystem.addJournal({
      day: 7, title: DAY07.note.day,
      strength: gift ? gift.gift : SaveSystem.get('reflections.day7Used', null),
      practice: SaveSystem.get('reflections.day7Practice', null),
      cards: Collection.countOfDay(7)
    });
    SaveSystem.completeDay(7);

    /* 다음 날로 바로 갈 수도, 오늘은 여기까지 해도 됩니다 */
    UI.dayEndButtons(this, 7);
  }
};
