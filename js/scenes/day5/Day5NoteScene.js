/* DAY 5 · 여행 노트 — 나라 개수를 세지 않습니다. 만난 사람의 이름만 적습니다. */

window.Day5NoteScene = class Day5NoteScene extends Phaser.Scene {
  constructor() { super('Day5NoteScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, N = DAY05.note;
    SaveSystem.checkpoint('Day5NoteScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#16233f');

    this.add.image(W / 2, 300, 'note_book').setDepth(0).setScale(1.02).setAlpha(0.98);
    this.add.text(W / 2, 196, N.day, UI.style(FONT.body, PAL.sunDeep)).setOrigin(0.5).setDepth(2);
    this.add.text(W / 2, 226, N.head, UI.style(FONT.small, PAL.inkSoft)).setOrigin(0.5).setDepth(2);

    this.drawMap(W / 2, 274);

    /* 오늘 만난 사람들 — 나라 수를 세지 않고 이름만 적습니다 */
    const friends = SaveSystem.get('reflections.day5Friends', []) || [];
    let y = 326;
    N.met.forEach((m) => {
      const met = friends.indexOf(m.name) !== -1;
      this.add.text(W / 2, y, m.name + '  ·  ' + m.from,
        UI.style(15, met ? PAL.ink : '#b3a794')).setOrigin(0.5).setDepth(2).setAlpha(met ? 1 : 0.5);
      y += 24;
    });

    const metLine = this.add.text(W / 2, 486, N.metLine, UI.style(20, PAL.sun, {
      align: 'center', wordWrap: { width: W - 80 }
    })).setOrigin(0.5).setDepth(2).setAlpha(0);
    this.tweens.add({ targets: metLine, alpha: 1, duration: 1000, delay: 800 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 900);
    this.time.delayedCall(2800, () => this.askAll());
  }

  /* 점수도 방문 국가 수도 세지 않는, 그냥 작은 세계지도 */
  drawMap(cx, cy) {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x8fc0d9, 0.35); g.fillRoundedRect(cx - 96, cy - 30, 192, 60, 9);
    g.fillStyle(0x6f9b6a, 0.75);
    g.fillEllipse(cx - 62, cy - 6, 34, 20);
    g.fillEllipse(cx - 36, cy + 12, 18, 22);
    g.fillEllipse(cx - 5, cy - 10, 25, 17);
    g.fillEllipse(cx + 5, cy + 10, 22, 18);
    g.fillEllipse(cx + 36, cy - 7, 36, 22);
    g.fillEllipse(cx + 68, cy + 12, 20, 13);
    g.fillStyle(HEX(PAL.sun), 1);
    [-62, -36, -5, 5, 36, 68].forEach((dx, i) => g.fillCircle(cx + dx, cy - 6 + (i % 2) * 14, 3));
  }

  askAll() {
    this.askChoice(DAY05.note.q1, DAY05.note.q1opts, 'reflections.day5Approach', () => {
      this.showAnswer(DAY05.note.q2, SaveSystem.get('reflections.day5Fear', '잘 모르겠다'), () => {
        this.showAnswer(DAY05.note.q3, SaveSystem.get('reflections.day5Step', '오늘 한 걸음 걷는다'), () => {
          this.practice();
        });
      });
    });
  }

  askChoice(question, options, savePath, onDone) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(60);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.96); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 200, question, UI.style(21, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5));

    let y = 300;
    options.forEach((o) => {
      layer.add(UI.button(this, W / 2, y, W - 70, 58, o, () => {
        SaveSystem.set(savePath, o);
        AudioSystem.select();
        layer.destroy();
        onDone();
      }, { size: FONT.small }));
      y += 70;
    });
  }

  /* 미니게임에서 고른 것을 그대로 보여줍니다 */
  showAnswer(question, answer, onDone) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(60);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.96); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 240, question, UI.style(20, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5));
    layer.add(this.add.text(W / 2, 360, '“' + answer + '”', UI.style(23, PAL.sun, {
      align: 'center', wordWrap: { width: W - 90 }, lineSpacing: 8
    })).setOrigin(0.5));
    layer.add(UI.button(this, W / 2, 500, 250, 58, '적어둡니다', () => {
      AudioSystem.select();
      layer.destroy();
      onDone();
    }, { size: FONT.label, fill: PAL.sun }));
  }

  practice() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, N = DAY05.note;
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
    if (i >= 0) SaveSystem.set('reflections.day5Practice', DAY05.note.practices[i]);
    AudioSystem.chime();
    layer.destroy();
    this.time.delayedCall(300, () => {
      UI.fadeOut(this, 800, () => this.scene.start('Day2AlbumScene',
        { day: 5, next: 'Day5EndScene', missed: DAY05.note.albumMissed }), [22, 30, 50]);
    });
  }
};
