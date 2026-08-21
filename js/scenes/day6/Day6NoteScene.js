/* DAY 6 · 여행 노트 — 나의 작은 파견을 적습니다. */

window.Day6NoteScene = class Day6NoteScene extends Phaser.Scene {
  constructor() { super('Day6NoteScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, N = DAY06.note;
    SaveSystem.checkpoint('Day6NoteScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#16233f');

    this.add.image(W / 2, 300, 'note_book').setDepth(0).setScale(1.02).setAlpha(0.98);
    this.add.text(W / 2, 192, N.day, UI.style(FONT.body, PAL.sunDeep)).setOrigin(0.5).setDepth(2);
    this.add.text(W / 2, 224, N.prev, UI.style(13, '#b3a794')).setOrigin(0.5).setDepth(2);

    this.add.text(W / 2, 274, N.head, UI.style(16, PAL.ink, {
      align: 'center', lineSpacing: 6, wordWrap: { width: 214 }
    })).setOrigin(0.5).setDepth(2);
    this.add.text(W / 2, 330, N.headRef, UI.style(13, PAL.inkSoft)).setOrigin(0.5).setDepth(2);

    /* 어젯밤 기억한 사람들 */
    const stars = SaveSystem.get('reflections.day6Stars', []) || [];
    this.add.text(W / 2, 364, N.remembered, UI.style(13, PAL.inkSoft)).setOrigin(0.5).setDepth(2);
    let y = 388;
    (stars.length ? stars : [{ who: '아직 없습니다' }]).slice(0, 3).forEach((s) => {
      this.add.text(W / 2, y, '★  ' + (s.name || s.who), UI.style(15, PAL.clay))
        .setOrigin(0.5).setDepth(2);
      y += 24;
    });

    /* 오늘의 파견 */
    const m = SaveSystem.get('reflections.day6Mission', null);
    const line = this.add.text(W / 2, 500, m ? ('“' + m.sentence + '”') : N.missionTitle,
      UI.style(19, PAL.sun, { align: 'center', wordWrap: { width: W - 76 }, lineSpacing: 8 }))
      .setOrigin(0.5).setDepth(2).setAlpha(0);
    this.tweens.add({ targets: line, alpha: 1, duration: 1000, delay: 700 });

    const forgive = this.add.text(W / 2, 580, N.forgive, UI.style(FONT.small, '#cbbfae', {
      align: 'center', lineSpacing: 6, wordWrap: { width: W - 80 }
    })).setOrigin(0.5).setDepth(2).setAlpha(0);
    this.tweens.add({ targets: forgive, alpha: 1, duration: 1000, delay: 1600 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 900);
    this.time.delayedCall(3400, () => this.askAll());
  }

  askAll() {
    this.askChoice(DAY06.note.q1, DAY06.note.q1opts, 'reflections.day6Take', () => {
      this.askText(DAY06.note.q2, 'reflections.day6GoodTo', () => {
        this.askText(DAY06.note.q3, 'reflections.day6Share', () => this.practice());
      });
    });
  }

  askChoice(question, options, savePath, onDone) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(60);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.96); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 150, question, UI.style(20, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5));

    const list = this.add.container(0, 0);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, 200, W, 540);
    list.setMask(shape.createGeometryMask());
    layer.add(list);

    let y = 236;
    options.forEach((o) => {
      list.add(UI.button(this, W / 2, y, W - 70, 54, o, () => {
        SaveSystem.set(savePath, o);
        AudioSystem.select();
        layer.destroy();
        onDone();
      }, { size: FONT.small }));
      y += 62;
    });

    const max = Math.max(0, y - 720);
    if (this.scrollFn) this.input.off('pointermove', this.scrollFn);
    this.scrollFn = (p) => {
      if (!p.isDown || p.y < 204 || p.y > 736) return;
      const dy = p.y - (this.lastY === undefined ? p.y : this.lastY);
      this.lastY = p.y;
      list.y = Phaser.Math.Clamp(list.y + dy, -max, 0);
    };
    this.input.on('pointermove', this.scrollFn);
    this.input.on('pointerup', () => { this.lastY = undefined; });
  }

  askText(question, savePath, onDone) {
    TextInput.ask(this, {
      question: question,
      placeholder: DAY06.note.placeholder,
      skipLabel: DAY06.note.skip
    }, (v) => {
      if (v) SaveSystem.set(savePath, v);
      onDone();
    });
  }

  practice() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, N = DAY06.note;
    const layer = this.add.container(0, 0).setDepth(60);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.96); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 140, N.practiceTitle, UI.style(22, PAL.sun)).setOrigin(0.5));
    layer.add(this.add.text(W / 2, 176, '하나만 골라도 좋고, 오늘은 쉬어가도 좋습니다.',
      UI.style(FONT.small, '#cbbfae', { align: 'center', wordWrap: { width: W - 70 } })).setOrigin(0.5));

    let y = 250;
    N.practices.forEach((p, i) => {
      layer.add(UI.button(this, W / 2, y, W - 60, 78, p, () => this.choose(i, layer), { size: 15 }));
      y += 88;
    });
    layer.add(UI.button(this, W / 2, y + 4, W - 60, 52, N.practiceSkip, () => this.choose(-1, layer),
      { size: FONT.small, alpha: 0.9 }));
  }

  choose(i, layer) {
    if (i >= 0) SaveSystem.set('reflections.day6Practice', DAY06.note.practices[i]);
    AudioSystem.chime();
    layer.destroy();
    this.time.delayedCall(300, () => {
      UI.fadeOut(this, 800, () => this.scene.start('Day2AlbumScene',
        { day: 6, next: 'Day6EndScene', missed: DAY06.note.albumMissed }), [22, 30, 50]);
    });
  }
};
