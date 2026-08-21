/* DAY 3 · 여행 노트 */

window.Day3NoteScene = class Day3NoteScene extends Phaser.Scene {
  constructor() { super('Day3NoteScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day3NoteScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#16233f');

    const N = DAY03.note;
    const word = SaveSystem.get('reflections.day3Heart', null);

    this.add.image(W / 2, 300, 'note_book').setDepth(0).setScale(1.02).setAlpha(0.98);
    this.add.text(W / 2, 190, N.day, UI.style(FONT.body, PAL.sunDeep)).setOrigin(0.5).setDepth(2);
    this.add.text(W / 2, 228, N.head, UI.style(FONT.small, PAL.inkSoft)).setOrigin(0.5).setDepth(2);
    this.add.text(W / 2, 274, word ? ('“' + word + '”') : '“…”',
      UI.style(26, PAL.clay, { align: 'center', wordWrap: { width: W - 110 } })).setOrigin(0.5).setDepth(2);

    this.l1 = this.add.text(W / 2, 344, N.sub, UI.style(FONT.small, PAL.inkSoft)).setOrigin(0.5).setDepth(2).setAlpha(0);
    this.l2 = this.add.text(W / 2, 388, N.line, UI.style(20, PAL.ink)).setOrigin(0.5).setDepth(2).setAlpha(0);
    this.tweens.add({ targets: this.l1, alpha: 1, duration: 900, delay: 600 });
    this.tweens.add({ targets: this.l2, alpha: 1, duration: 900, delay: 1800 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 900);
    this.time.delayedCall(3200, () => this.askFirst());
  }

  askFirst() {
    this.ask(DAY03.note.q1, 'reflections.day3Q1', () => {
      this.ask(DAY03.note.q2, 'reflections.day3Q2', () => this.practice());
    });
  }

  ask(question, savePath, onDone) {
    TextInput.ask(this, {
      question: question,
      placeholder: DAY03.note.placeholder,
      skipLabel: DAY03.note.skip
    }, (v) => {
      if (v) SaveSystem.set(savePath, v);
      onDone();
    });
  }

  practice() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const N = DAY03.note;
    const layer = this.add.container(0, 0).setDepth(60);

    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.88); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    layer.add(this.add.text(W / 2, 176, N.practiceTitle, UI.style(22, PAL.sun)).setOrigin(0.5));
    layer.add(this.add.text(W / 2, 212, '하나만 골라도 좋고, 오늘은 쉬어가도 좋습니다.',
      UI.style(FONT.small, '#cbbfae', { align: 'center', wordWrap: { width: W - 70 } })).setOrigin(0.5));

    let y = 300;
    N.practices.forEach((p, i) => {
      layer.add(UI.button(this, W / 2, y, W - 60, 86, p, () => this.choose(i, layer), { size: FONT.small }));
      y += 100;
    });
    layer.add(UI.button(this, W / 2, y + 6, W - 60, 54, N.practiceSkip, () => this.choose(-1, layer),
      { size: FONT.small, alpha: 0.9 }));
  }

  choose(i, layer) {
    if (i >= 0) SaveSystem.set('reflections.day3Practice', DAY03.note.practices[i]);
    AudioSystem.chime();
    layer.destroy();
    this.time.delayedCall(300, () => {
      UI.fadeOut(this, 800, () => this.scene.start('Day2AlbumScene', { day: 3, next: 'Day3EndScene', missed: DAY03.note.albumMissed }), [22, 30, 50]);
    });
  }
};
