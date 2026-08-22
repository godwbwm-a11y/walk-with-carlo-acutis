/* DAY 8 · 해변 — 회상, 마지막 성찰, 나의 인생 계획, 그리고 마지막 기도. */

window.Day8BeachScene = class Day8BeachScene extends Phaser.Scene {
  constructor() { super('Day8BeachScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day8BeachScene', {});
    AudioSystem.setAmbience('beach');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#e6c8a0');

    this.add.image(W / 2, 0, 'sky_evening').setOrigin(0.5, 0).setDisplaySize(W, 430).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0x2f6b8f, 1); g.fillRect(0, 410, W, 90);
    g.fillStyle(0x4d86a8, 0.7); g.fillRect(0, 410, W, 16);
    g.fillStyle(0xc8b394, 1); g.fillRect(0, 500, W, H - 500);
    g.fillStyle(0xd4c0a2, 0.7); g.fillRect(0, 500, W, 12);

    this.foam = [];
    for (let i = 0; i < 5; i++) {
      const f = this.add.image(Phaser.Math.Between(0, W), 500 - Phaser.Math.Between(2, 20), 'seafoam')
        .setDepth(-20).setAlpha(0.5).setScale(Phaser.Math.FloatBetween(0.8, 1.4));
      this.tweens.add({
        targets: f, x: f.x + Phaser.Math.Between(-30, 30), alpha: 0.15,
        duration: Phaser.Math.Between(2600, 4200), yoyo: true, repeat: -1
      });
    }

    this.bench = this.add.image(W / 2, 596, 'bench').setDepth(596).setScale(1.15);
    this.me = this.add.image(W / 2 - 8, 608, 'player_back').setDepth(600).setScale(1.4);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1200, [200, 170, 140]);

    this.time.delayedCall(900, () => {
      this.dialogue.play(DAY08.beach.route, () => {
        this.dialogue.play(DAY08.beach.arrive, () => {
          this.time.delayedCall(2200, () => {
            this.dialogue.play(DAY08.beach.wait, () => this.memories(0));
          });
        });
      });
    });
  }

  /* 지난 일곱 날이 파도 소리와 함께 */
  memories(i) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const list = DAY08.beach.memories;
    if (i >= list.length) {
      this.dialogue.play(DAY08.beach.afterMemory, () => this.faith());
      return;
    }
    const m = list[i];
    const veil = this.add.graphics().setDepth(700);
    veil.fillStyle(0x101a2e, 0.88); veil.fillRect(0, 0, W, H);
    veil.setAlpha(0);

    const d = this.add.text(W / 2, H * 0.34, m.day, UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(710).setAlpha(0);
    const s = this.add.text(W / 2, H * 0.42, m.scene, UI.style(19, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(710).setAlpha(0);
    const l = this.add.text(W / 2, H * 0.52, m.line, UI.style(21, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(710).setAlpha(0);

    this.tweens.add({ targets: [veil, d, s], alpha: 1, duration: 600 });
    this.tweens.add({ targets: l, alpha: 1, duration: 700, delay: 700 });

    this.time.delayedCall(2300, () => {
      this.tweens.add({
        targets: [veil, d, s, l], alpha: 0, duration: 600,
        onComplete: () => {
          [veil, d, s, l].forEach(o => o.destroy());
          this.memories(i + 1);
        }
      });
    });
  }

  /* 나는 왜 신앙생활을 하고 있을까? */
  faith() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, F = DAY08.faith;
    const layer = this.add.container(0, 0).setDepth(800);
    this.faithLayer = layer;
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.94); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 120, F.q, UI.style(22, PAL.cream, {
      align: 'center', wordWrap: { width: W - 60 }
    })).setOrigin(0.5));
    layer.add(this.add.text(W / 2, 158, F.note, UI.style(13, '#8fa5c8')).setOrigin(0.5));

    const list = this.add.container(0, 0);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, 186, W, 474);
    list.setMask(shape.createGeometryMask());
    layer.add(list);

    let y = 220;
    F.options.forEach((o) => {
      list.add(UI.button(this, W / 2, y, W - 68, 56, o, () => this.faithPick(o), { size: FONT.small }));
      y += 66;
    });

    /* 목록이 길어 위아래로 넘겨봅니다 */
    layer.add(this.add.text(W / 2, 676, DAY08.faith.scrollHint, UI.style(13, '#8fa5c8'))
      .setOrigin(0.5).setAlpha(0.9));

    const max = Math.max(0, y - 686);
    this.input.on('pointermove', (p) => {
      if (!p.isDown || !this.faithLayer || p.y < 190 || p.y > 656) return;
      const dy = p.y - (this.lastY === undefined ? p.y : this.lastY);
      this.lastY = p.y;
      list.y = Phaser.Math.Clamp(list.y + dy, -max, 0);
    });
    this.input.on('pointerup', () => { this.lastY = undefined; });

    layer.add(UI.button(this, W / 2, H - 92, 250, 54, F.writeBtn, () => this.faithWrite(),
      { size: FONT.small, fill: PAL.sun }));
  }

  faithWrite() {
    if (this.faithLayer) { this.faithLayer.destroy(); this.faithLayer = null; }
    if (!TextInput.supported(this)) { this.faith(); return; }
    TextInput.ask(this, {
      question: DAY08.faith.q,
      placeholder: DAY08.faith.placeholder,
      skipLabel: '고르는 걸로 할래요'
    }, (v) => {
      if (v) this.faithPick(v); else this.faith();
    });
  }

  faithPick(answer) {
    const W = GAME.WIDTH, H = GAME.HEIGHT, F = DAY08.faith;
    if (this.faithLayer) { this.faithLayer.destroy(); this.faithLayer = null; }
    SaveSystem.set('reflections.day8Faith', answer);
    AudioSystem.select();

    const layer = this.add.container(0, 0).setDepth(800);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.94); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 260, '“' + answer + '”', UI.style(21, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5));

    /* 어떤 답이어도 나무라지 않습니다 */
    let extra = [];
    if (answer.indexOf('모르겠') >= 0) extra = [F.unknown1, F.unknown2];
    else if (answer.indexOf('가롤로처럼') >= 0) extra = [F.saint1, F.saint2];

    extra.forEach((e, i) => {
      const t = this.add.text(W / 2, 360 + i * 40, e, UI.style(FONT.small, PAL.cream, {
        align: 'center', wordWrap: { width: W - 70 }
      })).setOrigin(0.5).setAlpha(0);
      layer.add(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 800, delay: 600 + i * 500 });
    });

    this.time.delayedCall(extra.length ? 2600 : 1800, () => {
      layer.add(UI.button(this, W / 2, H - 140, 250, 56, '계속', () => {
        layer.destroy(); this.plan();
      }, { size: FONT.small, fill: PAL.sun }));
    });
  }

  /* 나의 인생 계획 — 딱 하나 */
  plan() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, P = DAY08.plan;
    const layer = this.add.container(0, 0).setDepth(800);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.95); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    const head = this.add.text(W / 2, 150, P.head, UI.style(FONT.small, '#8fa5c8')).setOrigin(0.5);
    const carlo = this.add.text(W / 2, 220, P.carlo, UI.style(21, PAL.cream, {
      align: 'center', lineSpacing: 8, wordWrap: { width: W - 70 }
    })).setOrigin(0.5);
    const ask = this.add.text(W / 2, 320, P.ask, UI.style(20, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setAlpha(0);
    const one = this.add.text(W / 2, 370, P.onlyOne, UI.style(FONT.small, PAL.cream)).setOrigin(0.5).setAlpha(0);
    layer.add(head); layer.add(carlo); layer.add(ask); layer.add(one);
    this.tweens.add({ targets: ask, alpha: 1, duration: 900, delay: 1600 });
    this.tweens.add({ targets: one, alpha: 1, duration: 900, delay: 2600 });

    this.time.delayedCall(3600, () => {
      layer.destroy();
      this.planList();
    });
  }

  planList() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, P = DAY08.plan;
    const layer = this.add.container(0, 0).setDepth(800);
    this.planLayer = layer;
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.95); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 106, P.onlyOne, UI.style(20, PAL.sun)).setOrigin(0.5));

    const list = this.add.container(0, 0);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, 140, W, 524);
    list.setMask(shape.createGeometryMask());
    layer.add(list);

    let y = 174;
    P.items.forEach((it) => {
      list.add(UI.button(this, W / 2, y, W - 62, 54, it.icon + '  ' + it.label,
        () => this.planPick(it.label), { size: FONT.small }));
      y += 62;
    });

    /* 열두 가지가 다 들어가지 않아 위아래로 넘겨봅니다 */
    layer.add(this.add.text(W / 2, 682, DAY08.faith.scrollHint, UI.style(13, '#8fa5c8'))
      .setOrigin(0.5).setAlpha(0.9));

    const max = Math.max(0, y - 664);
    if (this.planScroll) this.input.off('pointermove', this.planScroll);
    this.planScroll = (p) => {
      if (!p.isDown || !this.planLayer || p.y < 144 || p.y > 660) return;
      const dy = p.y - (this.lastY === undefined ? p.y : this.lastY);
      this.lastY = p.y;
      list.y = Phaser.Math.Clamp(list.y + dy, -max, 0);
    };
    this.input.on('pointermove', this.planScroll);
    this.input.on('pointerup', () => { this.lastY = undefined; });

    layer.add(UI.button(this, W / 2, H - 88, 250, 54, P.writeBtn, () => this.planWrite(),
      { size: FONT.small, fill: PAL.sun }));
  }

  planWrite() {
    if (this.planLayer) { this.planLayer.destroy(); this.planLayer = null; }
    if (!TextInput.supported(this)) { this.planList(); return; }
    TextInput.ask(this, {
      question: DAY08.plan.ask,
      placeholder: DAY08.plan.placeholder,
      skipLabel: '고르는 걸로 할래요'
    }, (v) => {
      if (v) this.planPick(v); else this.planList();
    });
  }

  planPick(plan) {
    const W = GAME.WIDTH, H = GAME.HEIGHT, P = DAY08.plan;
    if (this.planLayer) { this.planLayer.destroy(); this.planLayer = null; }
    AudioSystem.chime();

    const layer = this.add.container(0, 0).setDepth(800);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.95); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 240, plan, UI.style(26, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5));

    [P.note1, P.note2, P.note3].forEach((n, i) => {
      const t = this.add.text(W / 2, 356 + i * 38, n, UI.style(FONT.small, '#cbbfae', {
        align: 'center', wordWrap: { width: W - 70 }
      })).setOrigin(0.5).setAlpha(0);
      layer.add(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 700, delay: 500 + i * 450 });
    });

    this.time.delayedCall(2400, () => {
      layer.add(UI.button(this, W / 2, H - 168, 260, 58, P.keepBtn, () => {
        SaveSystem.set('lifePlan', plan);
        layer.destroy();
        this.scene.launch('MyPathScene', { from: this.scene.key });
        this.scene.pause();
      }, { size: FONT.label, fill: PAL.sun }));
      layer.add(UI.button(this, W / 2, H - 100, 260, 54, P.againBtn, () => {
        layer.destroy(); this.planList();
      }, { size: FONT.small }));
    });
  }

  onMiniGameDone(key) {
    if (key !== 'MyPathScene') return;
    this.time.delayedCall(500, () => this.prayer());
  }

  /* 마지막 기도 — 이번에는 가롤로가 기도문을 알려주지 않습니다 */
  prayer() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, P = DAY08.prayer;
    const veil = this.add.graphics().setDepth(800);
    veil.fillStyle(0x2b3b60, 0.92); veil.fillRect(0, 0, W, H);
    veil.setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 1200 });
    this.prayerVeil = veil;

    const ask = this.add.text(W / 2, 200, P.ask, UI.style(21, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(810).setAlpha(0);
    this.tweens.add({ targets: ask, alpha: 1, duration: 1000, delay: 600 });

    /* 10초 동안 아무것도 없습니다 */
    this.time.delayedCall(10000, () => {
      const h1 = this.add.text(W / 2, 288, P.hintLater1, UI.style(FONT.small, '#cbd8ea'))
        .setOrigin(0.5).setDepth(810).setAlpha(0);
      const h2 = this.add.text(W / 2, 318, P.hintLater2, UI.style(FONT.small, '#cbd8ea'))
        .setOrigin(0.5).setDepth(810).setAlpha(0);
      const s = this.add.text(W / 2, 378, P.simple, UI.style(23, PAL.sun, {
        align: 'center', wordWrap: { width: W - 70 }
      })).setOrigin(0.5).setDepth(810).setAlpha(0);
      this.tweens.add({ targets: [h1, h2], alpha: 1, duration: 900 });
      this.tweens.add({ targets: s, alpha: 1, duration: 900, delay: 900 });

      this.time.delayedCall(1800, () => {
        const a = UI.button(this, W / 2, H - 246, 260, 56, P.btnSimple,
          () => this.pray('simple', [ask, h1, h2, s], [a, b, c]), { size: FONT.small, fill: PAL.sun });
        const b = UI.button(this, W / 2, H - 178, 260, 54, P.btnMine,
          () => this.pray('mine', [ask, h1, h2, s], [a, b, c]), { size: FONT.small });
        const c = UI.button(this, W / 2, H - 110, 260, 54, P.btnStay,
          () => this.pray('stay', [ask, h1, h2, s], [a, b, c]), { size: FONT.small });
        [a, b, c].forEach(o => o.setDepth(820).setAlpha(0));
        this.tweens.add({ targets: [a, b, c], alpha: 1, duration: 900 });
      });
    });
  }

  pray(kind, texts, btns) {
    btns.forEach(o => o.destroy());
    texts.forEach(o => o.destroy());
    SaveSystem.set('reflections.day8PrayKind', kind);

    if (kind === 'mine') { this.prayMine(); return; }
    if (kind === 'stay') { this.prayStay(); return; }
    this.prayLines();
  }

  prayMine() {
    if (window.MusicSystem) MusicSystem.setWanted(false);
    if (!TextInput.supported(this)) { this.prayLines(); return; }
    TextInput.ask(this, {
      question: '예수님,',
      placeholder: DAY08.prayer.placeholder,
      okLabel: '아멘.',
      skipLabel: '기도문으로 할래요',
      height: 150,
      backHead: '이렇게 기도했습니다'
    }, (v) => {
      if (v) SaveSystem.set('reflections.day8Prayer', v);
      if (v) this.prayEnd(); else this.prayLines();
    });
  }

  prayStay() {
    if (window.MusicSystem) MusicSystem.setWanted(false);
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    let i = 0;
    const t = this.add.text(W / 2, H * 0.42, '', UI.style(19, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(830);
    const step = () => {
      if (i >= DAY08.prayer.stayLines.length) { this.time.delayedCall(1600, () => { t.destroy(); this.prayEnd(); }); return; }
      t.setText(DAY08.prayer.stayLines[i++]).setAlpha(0);
      this.tweens.add({
        targets: t, alpha: 1, duration: 1200,
        onComplete: () => this.time.delayedCall(2000, () => {
          this.tweens.add({ targets: t, alpha: 0, duration: 900, onComplete: step });
        })
      });
    };
    step();
  }

  prayLines() {
    if (window.MusicSystem) MusicSystem.setWanted(false);
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const view = PrayerView.open(this, DAY08.prayer.lines, {
      top: 200, bottom: H - 190, depth: 830,
      onDone: () => {
        this.time.delayedCall(1400, () => {
          const b = UI.button(this, W / 2, H - 120, 240, 56, DAY08.prayer.endBtn, () => {
            b.destroy(); view.destroy(); this.prayEnd();
          }, { size: FONT.label, fill: PAL.sun });
          b.setDepth(840);
        });
      }
    });
    this.prayBody = view.layer;
  }

  /* 기도 뒤에 아무 카드도, 축하음도 없습니다. 파도뿐입니다. */
  prayEnd() {
    this.tweens.add({
      targets: this.prayerVeil, alpha: 0, duration: 1400,
      onComplete: () => {
        if (this.prayerVeil) this.prayerVeil.destroy();
        AudioSystem.wave();
        this.time.delayedCall(1800, () => {
          UI.fadeOut(this, 1200, () => this.scene.start('Day8HomeScene'), [22, 30, 50]);
        });
      }
    });
  }
};
