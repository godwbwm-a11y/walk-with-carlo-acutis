/* DAY 4 · 여행 노트 — 남의 좋은 점을 먼저, 그리고 나의 좋은 점 */

window.Day4NoteScene = class Day4NoteScene extends Phaser.Scene {
  constructor() { super('Day4NoteScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day4NoteScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#16233f');

    const N = DAY04.note;
    const list = SaveSystem.get('reflections.day4Strengths', []) || [];
    const main = SaveSystem.get('reflections.day4MainStrength', null);

    this.add.image(W / 2, 300, 'note_book').setDepth(0).setScale(1.02).setAlpha(0.98);
    this.add.text(W / 2, 186, N.day, UI.style(FONT.body, PAL.sunDeep)).setOrigin(0.5).setDepth(2);
    this.add.text(W / 2, 222, N.head, UI.style(FONT.small, PAL.inkSoft)).setOrigin(0.5).setDepth(2);

    const shown = list.slice(0, 4).join('\n') || '아직 잘 모르겠다';
    this.add.text(W / 2, 258, shown, UI.style(17, PAL.ink, { align: 'center', lineSpacing: 6 }))
      .setOrigin(0.5, 0).setDepth(2);

    if (main) {
      this.add.text(W / 2, 372, main, UI.style(23, PAL.clay, { align: 'center', wordWrap: { width: W - 110 } }))
        .setOrigin(0.5).setDepth(2);
    }

    this.line = this.add.text(W / 2, 424, N.line, UI.style(FONT.small, PAL.inkSoft, {
      align: 'center', lineSpacing: 6, wordWrap: { width: W - 110 }
    })).setOrigin(0.5, 0).setDepth(2).setAlpha(0);
    this.tweens.add({ targets: this.line, alpha: 1, duration: 1000, delay: 900 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 900);
    this.time.delayedCall(3000, () => this.askAll());
  }

  /* 먼저 남의 좋은 점, 그다음 나의 좋은 점 */
  askAll() {
    this.ask(DAY04.note.q1, 'reflections.day4CompareWith', () => {
      this.ask(DAY04.note.q2, 'reflections.day4TheirGood', () => {
        this.ask(DAY04.note.q3, 'reflections.day4MyGood', () => this.practice());
      });
    });
  }

  ask(question, savePath, onDone) {
    TextInput.ask(this, {
      question: question,
      placeholder: DAY04.note.placeholder,
      skipLabel: DAY04.note.skip
    }, (v) => {
      if (v) SaveSystem.set(savePath, v);
      onDone();
    });
  }

  practice() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const N = DAY04.note;
    const layer = this.add.container(0, 0).setDepth(60);

    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.96); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 150, N.practiceTitle, UI.style(22, PAL.sun)).setOrigin(0.5));
    layer.add(this.add.text(W / 2, 186, '하나만 골라도 좋고, 오늘은 쉬어가도 좋습니다.',
      UI.style(FONT.small, '#cbbfae', { align: 'center', wordWrap: { width: W - 70 } })).setOrigin(0.5));

    let y = 260;
    N.practices.forEach((p, i) => {
      layer.add(UI.button(this, W / 2, y, W - 60, 82, p, () => this.choose(i, layer), { size: 15 }));
      y += 92;
    });
    layer.add(UI.button(this, W / 2, y + 4, W - 60, 52, N.practiceSkip, () => this.choose(-1, layer),
      { size: FONT.small, alpha: 0.9 }));
  }

  choose(i, layer) {
    if (i >= 0) SaveSystem.set('reflections.day4Practice', DAY04.note.practices[i]);
    AudioSystem.chime();
    layer.destroy();
    this.time.delayedCall(300, () => {
      UI.fadeOut(this, 800, () => this.scene.start('Day2AlbumScene',
        { day: 4, next: 'Day4EndScene', missed: DAY04.note.albumMissed }), [22, 30, 50]);
    });
  }
};
