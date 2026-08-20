/* DAY 4 · 하교, 학원가, 그리고 석양 */

window.Day4StreetScene = class Day4StreetScene extends Phaser.Scene {
  constructor() { super('Day4StreetScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day4StreetScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#e6c8a0');

    this.add.image(W / 2, 0, 'sky_evening').setOrigin(0.5, 0).setDisplaySize(W, 400).setDepth(-20);
    const g = this.add.graphics().setDepth(-19);
    g.fillStyle(0xc4b294, 1); g.fillRect(0, 380, W, H - 380);
    g.fillStyle(0xd3c1a2, 1); g.fillRect(0, 380, W, 12);
    g.fillStyle(0x9a9a96, 1); g.fillRect(0, 700, W, H - 700);
    g.fillStyle(0xf3ece2, 0.7);
    for (let x = 10; x < W; x += 90) g.fillRect(x, 742, 46, 6);
    for (let x = -20; x < W + 40; x += 96) {
      const h = 90 + ((x * 7) % 60);
      g.fillStyle(((x / 96) | 0) % 2 === 0 ? 0xb0a08c : 0xa79684, 1);
      g.fillRect(x, 380 - h, 84, h);
      g.fillStyle(0xf2c08a, 0.5);
      for (let r = 0; r < Math.floor(h / 30); r++)
        for (let c = 0; c < 2; c++) g.fillRect(x + 14 + c * 34, 380 - h + 16 + r * 30, 20, 14);
    }

    this.signs = [];
    [[54, 250], [190, 214], [320, 258]].forEach((s, i) => {
      const sg = this.add.graphics().setDepth(-18);
      sg.fillStyle([0xc9553f, 0x3f6f8f, 0x7a5f8a][i], 0.92);
      sg.fillRoundedRect(s[0] - 40, s[1] - 18, 80, 36, 6);
      const t = this.add.text(s[0], s[1], ['영어', '수학', '코딩'][i], UI.style(15, PAL.cream))
        .setOrigin(0.5).setDepth(-17);
      this.signs.push(t);
    });

    this.me = this.add.image(150, 596, 'player_back').setDepth(596).setScale(1.35);
    this.carlo = this.add.image(236, 600, 'carlo_back').setDepth(600).setScale(1.35);
    this.tweens.add({ targets: [this.me, this.carlo], y: '-=4', duration: 640, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1000, [232, 200, 160]);

    this.time.delayedCall(800, () => {
      this.dialogue.play(DAY04.exit.talk, () => {
        this.dialogue.play(DAY04.exit.talk2, () => this.ads());
      });
    });
  }

  ads() {
    const W = GAME.WIDTH;
    DAY04.exit.ads.forEach((a, i) => {
      this.time.delayedCall(i * 300, () => {
        const t = this.add.text(Phaser.Math.Between(90, W - 90), Phaser.Math.Between(160, 330), a,
          UI.style(FONT.small, PAL.cream)).setOrigin(0.5).setDepth(80);
        const g = this.add.graphics().setDepth(79);
        g.fillStyle(0xc9553f, 0.9);
        g.fillRoundedRect(t.x - t.width / 2 - 12, t.y - 17, t.width + 24, 34, 8);
        this.tweens.add({
          targets: [t, g], alpha: 0, duration: 900, delay: 2600 + i * 140,
          onComplete: () => { t.destroy(); g.destroy(); }
        });
      });
    });
    this.time.delayedCall(1700, () => this.dialogue.play(DAY04.exit.adsTalk, () => this.copyStreet()));
  }

  copyStreet() {
    const W = GAME.WIDTH;
    this.copies = [];
    for (let i = 0; i < 6; i++) {
      const c = this.add.image(-60 - i * 70, 620 + (i % 2) * 10, 'villager_back')
        .setDepth(620).setScale(1.2).setTint(0x9aa0ac);
      this.copies.push(c);
      this.tweens.add({ targets: c, x: W + 80, duration: 9000, delay: i * 500, repeat: -1 });
    }
    this.time.delayedCall(1800, () => {
      this.tweens.add({ targets: this.me, alpha: 0.45, duration: 120, yoyo: true, repeat: 6 });
      this.me.setTint(0x9aa0ac);
      this.dialogue.say(DAY04.exit.copy, () => this.pickMine());
    });
  }

  pickMine() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    let list = (SaveSystem.get('reflections.day4Strengths', []) || []).slice();
    if (list.length === 0) list = ['아직 잘 모르겠다'];
    if (list.length < 3) {
      DAY04.mirror.strengths.forEach(s => { if (list.length < 3 && list.indexOf(s) === -1) list.push(s); });
    }

    const layer = this.add.container(0, 0).setDepth(200);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.7); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    const head = this.add.text(W / 2, 252, DAY04.exit.copyPick,
      UI.style(20, PAL.cream, { align: 'center' })).setOrigin(0.5);
    const plate = this.add.graphics();          // 학원 간판과 겹치지 않게 글자 밑에 판을 깝니다
    plate.fillStyle(0x101a2e, 0.88);
    plate.fillRoundedRect(W / 2 - head.width / 2 - 20, 252 - head.height / 2 - 14,
      head.width + 40, head.height + 28, 14);
    layer.add(plate); layer.add(head);

    let y = 340;
    list.slice(0, 4).forEach((label) => {
      layer.add(UI.button(this, W / 2, y, W - 70, 58, label, () => {
        SaveSystem.set('reflections.day4Own', label);
        layer.destroy();
        this.me.clearTint();
        this.tweens.add({ targets: this.me, scale: 1.45, duration: 700, yoyo: true });
        AudioSystem.chime();
        this.dialogue.play(DAY04.exit.copyAfter, () => this.sunset());
      }, { size: FONT.small }));
      y += 68;
    });
  }

  sunset() {
    this.copies.forEach(c => this.tweens.add({ targets: c, alpha: 0, duration: 1200 }));
    this.signs.forEach(t => this.tweens.add({ targets: t, alpha: 0.3, duration: 1200 }));
    this.time.delayedCall(1000, () => {
      this.dialogue.play(DAY04.sunset.talk, () => {
        this.dialogue.play(DAY04.sunset.quiz, () => {
          this.scene.launch('GiftScene', { from: this.scene.key });
          this.scene.pause();
        });
      });
    });
  }

  onMiniGameDone(key) {
    if (key !== 'GiftScene') return;
    this.time.delayedCall(400, () => this.prayer());
  }

  /* 오늘의 기도 */
  prayer() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const strength = SaveSystem.get('reflections.day4MainStrength', null);

    const veil = this.add.graphics().setDepth(200);
    veil.fillStyle(0x2b3b60, 0.92); veil.fillRect(0, 0, W, H);
    veil.setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 1000 });
    AudioSystem.bell();

    if (strength) {
      const s = this.add.text(W / 2, 146, strength, UI.style(23, PAL.sun, { align: 'center' }))
        .setOrigin(0.5).setDepth(210).setAlpha(0);
      this.tweens.add({ targets: s, alpha: 1, duration: 900 });
      this.strengthText = s;
    }

    const t = this.add.text(W / 2, 196, '', UI.style(18, PAL.cream, {
      align: 'center', lineSpacing: 7, wordWrap: { width: W - 76 }
    })).setOrigin(0.5, 0).setDepth(210);

    const lines = DAY04.prayer.lines;
    let shown = [], i = 0;
    const step = () => {
      if (i >= lines.length) { this.time.delayedCall(1200, () => this.prayerEnd(veil, t)); return; }
      shown.push(lines[i++]);
      if (shown.length > 13) shown.shift();
      t.setText(shown.join('\n'));
      t.setAlpha(0.45);
      this.tweens.add({ targets: t, alpha: 1, duration: 320 });
      this.time.delayedCall(lines[i - 1] === '' ? 200 : 680, step);
    };
    this.time.delayedCall(900, step);
  }

  prayerEnd(veil, t) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const more = UI.button(this, W / 2, H - 176, 250, 56, DAY04.prayer.moreBtn, () => {
      more.destroy(); done.destroy();
      this.freePrayer(veil, t);
    }, { size: FONT.small });
    const done = UI.button(this, W / 2, H - 108, 250, 58, DAY04.prayer.endBtn, () => {
      more.destroy(); done.destroy();
      this.bye(veil, t);
    }, { size: FONT.label, fill: PAL.sun });
    [more, done].forEach(b => b.setDepth(210).setAlpha(0));
    this.tweens.add({ targets: [more, done], alpha: 1, duration: 800 });
  }

  freePrayer(veil, t) {
    const W = GAME.WIDTH;
    t.setText(DAY04.prayer.moreHead);
    t.setY(226);
    if (this.strengthText) this.strengthText.setAlpha(0.5);

    const field = TextInput.open(this, {
      x: W / 2, y: 346, width: W - 76, height: 130,
      placeholder: DAY04.prayer.placeholder, depth: 1200
    });
    if (!field) { this.bye(veil, t); return; }

    const finish = (save) => {
      if (save) { const v = field.value(); if (v) SaveSystem.set('reflections.day4Prayer', v); }
      field.destroy(); a.destroy(); b.destroy();
      this.bye(veil, t);
    };
    const a = UI.button(this, W / 2, 472, 260, 58, DAY04.prayer.saveBtn, () => finish(true),
      { size: FONT.small, fill: PAL.sun });
    const b = UI.button(this, W / 2, 542, 260, 52, DAY04.prayer.skipBtn, () => finish(false),
      { size: FONT.small });
    [a, b].forEach(x => x.setDepth(210));
    this.time.delayedCall(250, () => field.focus());
  }

  bye(veil, t) {
    const targets = [veil, t];
    if (this.strengthText) targets.push(this.strengthText);
    this.tweens.add({
      targets: targets, alpha: 0, duration: 900,
      onComplete: () => {
        targets.forEach(o => o.destroy());
        this.dialogue.play(DAY04.sunset.reflect, () => {
          this.dialogue.play(DAY04.sunset.bye, () => {
            this.tweens.add({ targets: this.carlo, x: GAME.WIDTH + 70, duration: 2400, ease: 'Sine.easeIn' });
            this.time.delayedCall(1700, () => {
              UI.fadeOut(this, 1100, () => this.scene.start('Day4NoteScene'), [22, 30, 50]);
            });
          });
        });
      }
    });
  }
};
