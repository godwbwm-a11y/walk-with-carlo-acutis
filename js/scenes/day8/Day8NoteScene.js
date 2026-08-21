/* DAY 8 · 여행 노트 — 8일 전의 나와 지금의 나를 나란히 놓아봅니다. */

window.Day8NoteScene = class Day8NoteScene extends Phaser.Scene {
  constructor() { super('Day8NoteScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, N = DAY08.note;
    SaveSystem.checkpoint('Day8NoteScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#16233f');

    /* 여덟 날이 한 장에 들어가야 해서 노트 한 면을 크게 폅니다 */
    UI.panel(this, W / 2, 450, W - 40, 552, { fill: PAL.paper, radius: 22 }).setDepth(0);
    const rule = this.add.graphics().setDepth(1);
    rule.lineStyle(2, HEX(PAL.sun), 0.45);
    rule.lineBetween(48, 258, W - 48, 258);

    this.add.text(W / 2, 208, N.day, UI.style(FONT.body, PAL.sunDeep)).setOrigin(0.5).setDepth(2);
    this.add.text(W / 2, 238, N.head, UI.style(FONT.small, PAL.clay)).setOrigin(0.5).setDepth(2);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 900, [22, 30, 50]);

    this.rowObjs = [];
    this.rowY = 280;                       /* 줄이 두 줄로 넘어가면 그만큼 아래로 내려갑니다 */
    this.time.delayedCall(900, () => this.rows(0));
  }

  /* 여덟 날의 문장이 한 줄씩 올라옵니다 */
  rows(i) {
    const W = GAME.WIDTH, N = DAY08.note;
    if (i >= N.rows.length) { this.time.delayedCall(900, () => this.plan()); return; }

    const r = N.rows[i];
    const value = JourneyText.value(r.key, r.fallback);

    const a = this.add.text(52, this.rowY, r.label, UI.style(11, PAL.inkSoft)).setDepth(3).setAlpha(0);
    const b = this.add.text(52, this.rowY + 16, String(value), UI.style(15, PAL.ink, {
      wordWrap: { width: W - 104 }
    })).setDepth(3).setAlpha(0);
    this.rowY += 22 + b.height + 6;
    this.rowObjs.push(a, b);
    this.tweens.add({ targets: [a, b], alpha: 1, duration: 420 });
    AudioSystem.tap();

    this.time.delayedCall(620, () => this.rows(i + 1));
  }

  /* 그리고 오늘 내가 고른 한 걸음 */
  plan() {
    const W = GAME.WIDTH, N = DAY08.note;
    const plan = SaveSystem.get('lifePlan', null) || '한 걸음';
    const y = this.rowY + 10;

    const a = this.add.text(52, y, N.planLabel, UI.style(11, PAL.sunDeep)).setDepth(3).setAlpha(0);
    const b = this.add.text(52, y + 18, plan, UI.style(18, PAL.sunDeep, {
      wordWrap: { width: W - 104 }, lineSpacing: 5
    })).setDepth(3).setAlpha(0);
    this.rowObjs.push(a, b);
    this.tweens.add({ targets: [a, b], alpha: 1, duration: 900 });
    AudioSystem.chime();

    this.time.delayedCall(2600, () => this.sameAndDifferent());
  }

  /* 같은 사람 · 다른 선택 */
  sameAndDifferent() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, N = DAY08.note;
    const scrim = this.add.graphics().setDepth(50);
    scrim.fillStyle(0x101a2e, 0.94); scrim.fillRect(0, 0, W, H);
    scrim.setAlpha(0);
    this.tweens.add({ targets: scrim, alpha: 1, duration: 1000 });

    const a = this.add.text(W / 2, H * 0.36, N.same, UI.style(21, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5).setDepth(55).setAlpha(0);
    const b = this.add.text(W / 2, H * 0.46, N.diff, UI.style(21, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5).setDepth(55).setAlpha(0);

    this.tweens.add({ targets: a, alpha: 1, duration: 1100, delay: 900 });
    this.tweens.add({ targets: b, alpha: 1, duration: 1100, delay: 3000 });

    this.time.delayedCall(5800, () => {
      this.tweens.add({
        targets: [a, b], alpha: 0, duration: 800,
        onComplete: () => { a.destroy(); b.destroy(); this.lastQuestion(scrim); }
      });
    });
  }

  /* 마지막 질문 — 적지 않아도 됩니다 */
  lastQuestion(scrim) {
    const W = GAME.WIDTH, H = GAME.HEIGHT, N = DAY08.note;
    const layer = this.add.container(0, 0).setDepth(60);
    layer.add(this.add.text(W / 2, 200, N.lastQ, UI.style(21, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5));

    const field = TextInput.open(this, {
      x: W / 2, y: 336, width: W - 76, height: 130, placeholder: N.placeholder, depth: 1200
    });

    const done = (save) => {
      if (save && field) { const v = field.value(); if (v) SaveSystem.set('reflections.day8Walk', v); }
      if (field) field.destroy();
      layer.destroy();
      scrim.destroy();
      AudioSystem.chime();
      this.time.delayedCall(300, () => this.album());
    };

    if (field) {
      layer.add(UI.button(this, W / 2, 466, 260, 60, '적었어요', () => done(true),
        { size: FONT.label, fill: PAL.sun }));
      layer.add(UI.button(this, W / 2, 540, 260, 54, N.skip, () => done(false),
        { size: FONT.small }));
      this.time.delayedCall(250, () => field.focus());
    } else {
      layer.add(UI.button(this, W / 2, 420, 260, 60, '넘어가기', () => done(false),
        { size: FONT.label, fill: PAL.sun }));
    }
  }

  album() {
    UI.fadeOut(this, 800, () => this.scene.start('Day2AlbumScene',
      { day: 8, next: 'Day8EndScene', missed: DAY08.note.albumMissed }), [22, 30, 50]);
  }
};
