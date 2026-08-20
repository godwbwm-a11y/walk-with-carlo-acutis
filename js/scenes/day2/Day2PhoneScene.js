/* DAY 2 · 가족 단톡방 — 아침에 온 메시지 */

window.Day2PhoneScene = class Day2PhoneScene extends Phaser.Scene {
  constructor() { super('Day2PhoneScene'); }

  create(data) {
    data = data || {};
    this.from = data.from || null;
    this.answered = false;

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const P = DAY02.room.phone;
    this.cameras.main.setBackgroundColor('#0d1524');

    const frame = this.add.graphics();
    frame.fillStyle(0x1c2436, 1); frame.fillRoundedRect(18, 74, W - 36, H - 170, 28);
    frame.lineStyle(3, 0x3b4a66, 1); frame.strokeRoundedRect(18, 74, W - 36, H - 170, 28);
    frame.fillStyle(0x2b3b60, 1); frame.fillRoundedRect(18, 74, W - 36, 84, { tl: 28, tr: 28, bl: 0, br: 0 });

    this.add.text(W / 2, 104, P.header, UI.style(14, '#9fb4d6')).setOrigin(0.5);
    this.add.text(W / 2, 132, P.room, UI.style(19, PAL.cream)).setOrigin(0.5);

    this.flowY = 188;
    this.msgs = [];
    this.replyPanel = this.add.container(0, 0).setDepth(20);

    UI.fadeIn(this, 500, [8, 12, 24]);
    this.time.delayedCall(500, () => this.next(0));
  }

  next(i) {
    const P = DAY02.room.phone;
    if (i >= P.lines.length) { this.time.delayedCall(500, () => this.showChoices()); return; }
    this.bubble(P.lines[i].t, false);
    this.time.delayedCall(750, () => this.next(i + 1));
  }

  bubble(text, mine) {
    const W = GAME.WIDTH;
    const maxW = 214;
    const t = this.add.text(0, 0, text, UI.style(18, PAL.ink, { wordWrap: { width: maxW }, lineSpacing: 5 }));
    const bw = Math.min(maxW, t.width) + 30, bh = t.height + 24;
    const x = mine ? W - 42 - bw : 42;
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(HEX(mine ? '#ffe9a8' : '#ffffff'), 1);
    g.fillRoundedRect(x, this.flowY, bw, bh, 14);
    t.setPosition(x + 15, this.flowY + 12).setDepth(11);

    const objs = [g, t];
    if (!mine) {
      objs.push(this.add.text(x, this.flowY - 18, '엄마', UI.style(13, '#9fb4d6')).setAlpha(0.9).setDepth(11));
    }
    objs.forEach(o => o.setAlpha(0));
    this.tweens.add({ targets: objs, alpha: 1, duration: 240 });
    this.flowY += bh + (mine ? 16 : 26);
    AudioSystem.tap();
    return objs;
  }

  showChoices() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const P = DAY02.room.phone;
    let y = H - 300;
    P.choices.forEach((c, i) => {
      const b = UI.button(this, W / 2, y, W - 84, 52, c.label, () => this.pick(c), { size: FONT.small });
      b.setAlpha(0).setDepth(20);
      this.replyPanel.add(b);
      this.tweens.add({ targets: b, alpha: 1, duration: 260, delay: i * 70 });
      y += 58;
    });
  }

  pick(choice) {
    if (this.answered) return;
    this.answered = true;
    SaveSystem.set('reflections.day2Reply', choice.key);
    this.replyPanel.removeAll(true);
    AudioSystem.select();

    if (choice.key !== 'silent') this.bubble(choice.label, true);
    else this.add.text(GAME.WIDTH / 2, this.flowY + 10, '…읽고 그냥 두었다.',
      UI.style(FONT.small, '#8fa5c8')).setOrigin(0.5);

    this.time.delayedCall(1100, () => {
      UI.fadeOut(this, 600, () => {
        const from = this.from;
        this.scene.stop();
        if (from) {
          const parent = this.scene.get(from);
          this.scene.resume(from);
          if (parent && parent.onPhoneDone) parent.onPhoneDone();
        } else {
          this.scene.start('TitleScene');
        }
      }, [8, 12, 24]);
    });
  }
};
