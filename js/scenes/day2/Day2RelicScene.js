/* DAY 2 · 유해 공경과 기도 — 여기서는 조작이 사라집니다. */

window.Day2RelicScene = class Day2RelicScene extends Phaser.Scene {
  constructor() { super('Day2RelicScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day2RelicScene', {});
    AudioSystem.setAmbience('none');
    AudioSystem.startPad();

    this.cameras.main.setBackgroundColor('#221d2a');

    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x2b2534, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0x372f42, 1); g.fillRect(0, 520, W, H - 520);

    this.add.image(W / 2, 340, 'lamp_glow').setDepth(1).setScale(2.6).setAlpha(0.5);
    this.relic = this.add.image(W / 2, 350, 'relic_case').setDepth(6).setScale(1.35);
    this.add.image(78, 396, 'candle_stand').setDepth(6).setScale(0.9);
    this.add.image(W - 78, 396, 'candle_stand').setDepth(6).setScale(0.9);

    /* 조용히 머무는 사람들 */
    [[70, 560], [300, 596], [150, 640]].forEach((p, i) => {
      this.add.image(p[0], p[1], i === 1 ? 'villager_back' : 'player_back')
        .setDepth(p[1]).setScale(1.05).setAlpha(0.45).setTint(0x9a93aa);
    });

    this.tweens.add({ targets: this.relic, y: 346, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1100, [26, 22, 32]);
    AudioSystem.bell();

    this.time.delayedCall(900, () => {
      this.dialogue.say(DAY02.relic.lines, () => {
        this.stayBtn = UI.button(this, W / 2, H - 130, 240, 62, DAY02.relic.stayBtn,
          () => this.stay(), { size: FONT.label, fill: PAL.sun });
        this.stayBtn.setDepth(60).setAlpha(0);
        this.tweens.add({ targets: this.stayBtn, alpha: 1, duration: 800 });
      });
    });
  }

  /* 화면의 모든 조작이 사라집니다 */
  stay() {
    if (this.stayBtn) this.stayBtn.destroy();
    AudioSystem.chime();
    const W = GAME.WIDTH, H = GAME.HEIGHT;

    this.line = this.add.text(W / 2, H * 0.72, '', UI.style(20, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5).setDepth(70).setAlpha(0);

    const concern = SaveSystem.get('reflections.entrustedConcern', null);
    const steps = [
      { t: '', hold: 3000 },
      { t: DAY02.relic.q1, hold: 3200 },
      { t: concern ? concern : '오늘 마음에 걸리던 것', hold: 2800, big: true },
      { t: DAY02.relic.q2, hold: 3200 },
      { t: DAY02.relic.q3, hold: 3000 }
    ];

    let i = 0;
    const next = () => {
      if (i >= steps.length) { this.prayerChoice(); return; }
      const st = steps[i++];
      if (!st.t) { this.time.delayedCall(st.hold, next); return; }
      this.line.setText(st.t);
      this.line.setFontSize(st.big ? 30 : 20);
      this.line.setColor(st.big ? PAL.sun : PAL.cream);
      this.tweens.add({
        targets: this.line, alpha: 1, duration: 900,
        onComplete: () => {
          this.time.delayedCall(st.hold, () => {
            this.tweens.add({ targets: this.line, alpha: 0, duration: 800, onComplete: next });
          });
        }
      });
    };
    next();
  }

  prayerChoice() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.line.setText('');
    const P = DAY02.prayer;

    const title = this.add.text(W / 2, H * 0.60, P.choose,
      UI.style(FONT.body, PAL.cream)).setOrigin(0.5).setDepth(70).setAlpha(0);
    const b1 = UI.button(this, W / 2, H * 0.70, 260, 60, P.withText, () => {
      [title, b1, b2].forEach(o => o.destroy());
      this.prayWithText();
    }, { size: FONT.label, fill: PAL.paper });
    const b2 = UI.button(this, W / 2, H * 0.70 + 76, 260, 60, P.withOwn, () => {
      [title, b1, b2].forEach(o => o.destroy());
      this.prayWithOwn();
    }, { size: FONT.label, fill: PAL.sun });
    [b1, b2].forEach(b => b.setDepth(70).setAlpha(0));
    this.tweens.add({ targets: [title, b1, b2], alpha: 1, duration: 800 });
  }

  /* 기도문으로 기도하기 */
  prayWithText() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const lines = DAY02.prayer.text;
    const t = this.add.text(W / 2, H * 0.30, '', UI.style(19, PAL.cream, {
      align: 'center', lineSpacing: 9, wordWrap: { width: W - 70 }
    })).setOrigin(0.5, 0).setDepth(70);

    let shown = [];
    let i = 0;
    const step = () => {
      if (i >= lines.length) { this.time.delayedCall(1200, () => this.silence()); return; }
      shown.push(lines[i++]);
      t.setText(shown.join('\n'));
      t.setAlpha(0.2);
      this.tweens.add({ targets: t, alpha: 1, duration: 500 });
      this.time.delayedCall(lines[i - 1] === '' ? 260 : 900, step);
    };
    step();
    this.prayerText = t;
  }

  /* 내 말로 기도하기 */
  prayWithOwn() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const P = DAY02.prayer;

    const head = this.add.text(W / 2, 210, P.ownHeader, UI.style(22, PAL.cream)).setOrigin(0.5).setDepth(70);
    this.input.setTopOnly(true);

    const field = TextInput.open(this, {
      x: W / 2, y: 330, width: W - 76, height: 150,
      placeholder: P.ownPlaceholder, depth: 1200
    });

    if (!field) {
      /* 입력이 안 되는 환경이면 기도문으로 이어집니다 */
      head.destroy();
      this.prayWithText();
      return;
    }

    const note = this.add.text(W / 2, 424, '적지 않아도 괜찮습니다.',
      UI.style(14, '#cbbfae')).setOrigin(0.5).setDepth(70).setAlpha(0.8);

    const finish = (save) => {
      const v = field.value();
      if (save && v) {
        SaveSystem.set('reflections.day2Prayer', v);
      }
      field.destroy();
      [head, note, saveBtn, skipBtn].forEach(o => { if (o) o.destroy(); });
      this.silence();
    };

    const saveBtn = UI.button(this, W / 2, 500, 270, 60, P.saveBtn, () => finish(true),
      { size: FONT.label, fill: PAL.sun });
    const skipBtn = UI.button(this, W / 2, 574, 270, 54, P.noSaveBtn, () => finish(false),
      { size: FONT.small });
    [saveBtn, skipBtn].forEach(b => b.setDepth(70));

    this.time.delayedCall(300, () => field.focus());
  }

  /* 기도 뒤의 침묵 */
  silence() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    if (this.prayerText) {
      this.tweens.add({ targets: this.prayerText, alpha: 0.55, duration: 1200 });
    }
    this.time.delayedCall(5000, () => {
      const s = this.add.text(W / 2, H * 0.72, DAY02.prayer.silence1,
        UI.style(FONT.body, '#d9c9ae', { align: 'center', wordWrap: { width: W - 70 } }))
        .setOrigin(0.5).setDepth(70).setAlpha(0);
      this.tweens.add({ targets: s, alpha: 1, duration: 1200 });

      this.time.delayedCall(5000, () => {
        const b = UI.button(this, W / 2, H - 120, 250, 60, DAY02.prayer.standBtn,
          () => this.stand(), { size: FONT.label, fill: PAL.paper });
        b.setDepth(70).setAlpha(0);
        this.tweens.add({ targets: b, alpha: 1, duration: 900 });
      });
    });
  }

  stand() {
    AudioSystem.tap();
    this.children.list.slice().forEach((o) => {
      if (o.depth >= 70) this.tweens.add({ targets: o, alpha: 0, duration: 500 });
    });

    /* 의자 옆의 책갈피 */
    this.time.delayedCall(700, () => {
      const W = GAME.WIDTH, H = GAME.HEIGHT;
      const spark = this.add.image(W / 2 + 96, H * 0.74, 'spark').setDepth(80).setScale(1.4);
      this.tweens.add({ targets: spark, alpha: 0.4, scale: 1.8, duration: 900, yoyo: true, repeat: -1 });
      this.dialogue.say(DAY02.prayer.bookmark, () => {
        this.tweens.add({ targets: spark, alpha: 0, duration: 400 });
        Collection.award(this, 'j1', () => this.toSunset());
      });
    });
  }

  toSunset() {
    UI.fadeOut(this, 1100, () => this.scene.start('Day2SunsetScene'), [246, 201, 143]);
  }
};
