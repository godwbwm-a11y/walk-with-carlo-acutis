/* DAY 2 · 여행 노트 — 오늘 내려놓은 것을 적어 둡니다. */

window.Day2NoteScene = class Day2NoteScene extends Phaser.Scene {
  constructor() { super('Day2NoteScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day2NoteScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#16233f');

    const N = DAY02.note;
    const concern = SaveSystem.get('reflections.entrustedConcern', null);

    this.add.image(W / 2, 300, 'note_book').setDepth(0).setScale(1.02).setAlpha(0.98);
    this.add.text(W / 2, 190, N.day, UI.style(FONT.body, PAL.sunDeep)).setOrigin(0.5).setDepth(2);
    this.add.text(W / 2, 228, N.head, UI.style(FONT.small, PAL.inkSoft)).setOrigin(0.5).setDepth(2);
    this.add.text(W / 2, 274, concern || '오늘의 마음', UI.style(30, PAL.clay)).setOrigin(0.5).setDepth(2);

    this.l1 = this.add.text(W / 2, 336, N.line1, UI.style(19, PAL.ink)).setOrigin(0.5).setDepth(2).setAlpha(0);
    this.l2 = this.add.text(W / 2, 372, N.line2, UI.style(19, PAL.ink)).setOrigin(0.5).setDepth(2).setAlpha(0);
    this.tweens.add({ targets: this.l1, alpha: 1, duration: 900, delay: 600 });
    this.tweens.add({ targets: this.l2, alpha: 1, duration: 900, delay: 1800 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 900);

    this.time.delayedCall(3200, () => this.askFirst());
  }

  /* 두 가지 질문 — 적지 않아도 넘어갈 수 있습니다 */
  askFirst() {
    this.ask(DAY02.note.q1, 'reflections.day2Alone', () => {
      this.ask(DAY02.note.q2, 'reflections.day2Entrust', () => this.practice());
    });
  }

  ask(question, savePath, onDone) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(60);

    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.88); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    layer.add(this.add.text(W / 2, 192, question, UI.style(21, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5));

    const field = TextInput.open(this, {
      x: W / 2, y: 326, width: W - 76, height: 130,
      placeholder: DAY02.note.placeholder, depth: 1200
    });

    const done = (save) => {
      if (save && field) {
        const v = field.value();
        if (v) SaveSystem.set(savePath, v);
      }
      if (field) field.destroy();
      layer.destroy();
      onDone();
    };

    if (field) {
      const ok = UI.button(this, W / 2, 452, 260, 60, '적었어요', () => done(true),
        { size: FONT.label, fill: PAL.sun });
      const skip = UI.button(this, W / 2, 526, 260, 54, DAY02.note.skip, () => done(false),
        { size: FONT.small });
      layer.add([ok, skip]);
      this.time.delayedCall(250, () => field.focus());
    } else {
      const skip = UI.button(this, W / 2, 400, 260, 60, '넘어가기', () => done(false),
        { size: FONT.label, fill: PAL.sun });
      layer.add(skip);
    }
  }

  /* 오늘의 작은 실천 */
  practice() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const N = DAY02.note;
    const layer = this.add.container(0, 0).setDepth(60);

    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.88); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    layer.add(this.add.text(W / 2, 176, N.practiceTitle, UI.style(22, PAL.sun)).setOrigin(0.5));
    layer.add(this.add.text(W / 2, 212, '하나만 골라도 좋고, 오늘은 쉬어가도 좋습니다.',
      UI.style(FONT.small, '#cbbfae', { align: 'center', wordWrap: { width: W - 70 } })).setOrigin(0.5));

    let y = 300;
    N.practices.forEach((p, i) => {
      const b = UI.button(this, W / 2, y, W - 60, 86, p, () => this.choosePractice(i, layer),
        { size: FONT.small });
      layer.add(b);
      y += 100;
    });
    const skip = UI.button(this, W / 2, y + 6, W - 60, 54, N.practiceSkip, () => this.choosePractice(-1, layer),
      { size: FONT.small, alpha: 0.9 });
    layer.add(skip);
  }

  choosePractice(i, layer) {
    if (i >= 0) SaveSystem.set('reflections.day2Practice', DAY02.note.practices[i]);
    AudioSystem.chime();
    layer.destroy();
    this.time.delayedCall(300, () => {
      UI.fadeOut(this, 800, () => this.scene.start('Day2AlbumScene'), [22, 30, 50]);
    });
  }
};
