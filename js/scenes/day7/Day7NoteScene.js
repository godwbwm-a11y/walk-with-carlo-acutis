/* DAY 7 · 여행 노트 — 내 장점을 모르겠다면, 사람들이 무엇을 부탁하는지에서 출발합니다. */

window.Day7NoteScene = class Day7NoteScene extends Phaser.Scene {
  constructor() { super('Day7NoteScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, N = DAY07.note;
    SaveSystem.checkpoint('Day7NoteScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#16233f');

    this.add.image(W / 2, 300, 'note_book').setDepth(0).setScale(1.02).setAlpha(0.98);
    this.add.text(W / 2, 194, N.day, UI.style(FONT.body, PAL.sunDeep)).setOrigin(0.5).setDepth(2);
    this.add.text(W / 2, 228, N.head, UI.style(FONT.small, PAL.clay)).setOrigin(0.5).setDepth(2);

    /* 오늘 발견한 것 */
    const found = SaveSystem.get('reflections.day7Used', null)
      || SaveSystem.get('reflections.day4MainStrength', null)
      || '아직 찾는 중';
    this.add.text(W / 2, 274, N.foundHead, UI.style(13, PAL.inkSoft)).setOrigin(0.5).setDepth(2);
    this.add.text(W / 2, 300, found, UI.style(18, PAL.ink, {
      align: 'center', wordWrap: { width: 214 }
    })).setOrigin(0.5).setDepth(2);

    /* 오늘 그것을 나눈 순간 */
    const help = SaveSystem.get('reflections.day7Help', null);
    const card = SaveSystem.get('reflections.day7Card', null);
    const moment = help || (card ? (card.target + '에게 카드를 만들었다.') : '친구에게 설명해주었다.');
    this.add.text(W / 2, 350, N.sharedHead, UI.style(13, PAL.inkSoft)).setOrigin(0.5).setDepth(2);
    this.add.text(W / 2, 376, moment, UI.style(16, PAL.ink, {
      align: 'center', wordWrap: { width: 214 }
    })).setOrigin(0.5).setDepth(2);

    /* 오늘 만든 카드 */
    if (card) {
      const c = this.add.container(W / 2, 470).setDepth(4).setScale(0.55);
      c.add(this.add.image(0, 0, 'made_card'));
      c.add(this.add.text(0, -48, card.icon, UI.style(42, PAL.ink)).setOrigin(0.5));
      c.add(this.add.text(0, 26, card.message, UI.style(24, PAL.ink, {
        align: 'center', wordWrap: { width: 232 }
      })).setOrigin(0.5));
      c.setAlpha(0);
      this.tweens.add({ targets: c, alpha: 1, duration: 900, delay: 700 });
    }

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 900);
    this.time.delayedCall(3000, () => this.askAll());
  }

  askAll() {
    this.askText(DAY07.note.q1, 'reflections.day7Like', null, () => {
      this.askText(DAY07.note.q2, 'reflections.day7Easy', null, () => {
        this.askText(DAY07.note.q3, 'reflections.day7AskedFor', DAY07.note.q3note, () => {
          this.askText(DAY07.note.q4, 'reflections.day7HelpWho', null, () => this.practice());
        });
      });
    });
  }

  askText(question, savePath, note, onDone) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(60);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.96); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 190, question, UI.style(21, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5));
    if (note) {
      layer.add(this.add.text(W / 2, 250, note, UI.style(FONT.small, '#cbbfae', {
        align: 'center', wordWrap: { width: W - 70 }
      })).setOrigin(0.5));
    }

    const field = TextInput.open(this, {
      x: W / 2, y: note ? 350 : 320, width: W - 76, height: 120,
      placeholder: DAY07.note.placeholder, depth: 1200
    });

    const done = (save) => {
      if (save && field) { const v = field.value(); if (v) SaveSystem.set(savePath, v); }
      if (field) field.destroy();
      layer.destroy();
      onDone();
    };

    if (field) {
      layer.add(UI.button(this, W / 2, note ? 474 : 444, 260, 60, '적었어요', () => done(true),
        { size: FONT.label, fill: PAL.sun }));
      layer.add(UI.button(this, W / 2, note ? 548 : 518, 260, 54, DAY07.note.skip, () => done(false),
        { size: FONT.small }));
      this.time.delayedCall(250, () => field.focus());
    } else {
      layer.add(UI.button(this, W / 2, 400, 260, 60, '넘어가기', () => done(false),
        { size: FONT.label, fill: PAL.sun }));
    }
  }

  practice() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, N = DAY07.note;
    const layer = this.add.container(0, 0).setDepth(60);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.96); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 116, N.practiceTitle, UI.style(22, PAL.sun)).setOrigin(0.5));
    layer.add(this.add.text(W / 2, 150, '하나만 골라도 좋고, 오늘은 쉬어가도 좋습니다.',
      UI.style(FONT.small, '#cbbfae', { align: 'center', wordWrap: { width: W - 70 } })).setOrigin(0.5));

    /* 여섯 가지 — 목록이 길어 스크롤합니다 */
    const list = this.add.container(0, 0);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, 180, W, 560);
    list.setMask(shape.createGeometryMask());
    layer.add(list);

    let y = 224;
    N.practices.forEach((p, i) => {
      list.add(UI.button(this, W / 2, y, W - 60, 76, p, () => this.choose(i, layer), { size: 15 }));
      y += 86;
    });
    list.add(UI.button(this, W / 2, y + 2, W - 60, 52, N.practiceSkip, () => this.choose(-1, layer),
      { size: FONT.small, alpha: 0.9 }));

    const max = Math.max(0, y + 40 - 720);
    this.input.on('pointermove', (p) => {
      if (!p.isDown || p.y < 184 || p.y > 736) return;
      const dy = p.y - (this.lastY === undefined ? p.y : this.lastY);
      this.lastY = p.y;
      list.y = Phaser.Math.Clamp(list.y + dy, -max, 0);
    });
    this.input.on('pointerup', () => { this.lastY = undefined; });
  }

  choose(i, layer) {
    if (i >= 0) SaveSystem.set('reflections.day7Practice', DAY07.note.practices[i]);
    AudioSystem.chime();
    layer.destroy();
    this.time.delayedCall(300, () => {
      UI.fadeOut(this, 800, () => this.scene.start('Day2AlbumScene',
        { day: 7, next: 'Day7EndScene', missed: DAY07.note.albumMissed }), [22, 30, 50]);
    });
  }
};
