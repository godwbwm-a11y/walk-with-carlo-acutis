/* DAY 8 · 마지막 — 다음 날 버튼이 없습니다. 다음 날은 게임 밖에 있습니다. */

window.Day8EndScene = class Day8EndScene extends Phaser.Scene {
  constructor() { super('Day8EndScene'); }

  create(data) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.returning = !!(data && data.returning);

    AudioSystem.setAmbience('none');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#090c14');

    /* 새벽으로 물드는 하늘 */
    this.add.image(W / 2, 0, 'sky_lastdawn').setOrigin(0.5, 0)
      .setDisplaySize(W, H).setDepth(-40).setAlpha(0.55);
    for (let i = 0; i < 40; i++) {
      const s = this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(20, 560), 'dot')
        .setDepth(-35).setScale(Phaser.Math.FloatBetween(0.14, 0.36))
        .setAlpha(Phaser.Math.FloatBetween(0.15, 0.6));
      this.tweens.add({ targets: s, alpha: 0.08, duration: Phaser.Math.Between(1800, 3600),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2200) });
    }

    this.save();

    /* 노트를 보고 돌아왔다면 마지막 화면만 다시 보여줍니다 */
    if (this.returning) { UI.fadeIn(this, 500); this.finalScreen(true); return; }

    UI.fadeIn(this, 1200, [9, 12, 20]);
    this.time.delayedCall(1200, () => this.lines(0));
  }

  save() {
    if (this.saved) return;
    this.saved = true;
    SaveSystem.addJournal({
      day: 8, title: DAY08.note.day,
      plan: SaveSystem.get('lifePlan', null),
      becoming: SaveSystem.get('finalCard.becoming', null),
      walk: SaveSystem.get('reflections.day8Walk', null),
      cards: Collection.countOfDay(8)
    });
    SaveSystem.completeDay(8);
  }

  /* 성인은 멀리 있는 사람이 아닙니다 */
  lines(i) {
    const W = GAME.WIDTH, H = GAME.HEIGHT, E = DAY08.end;
    if (i >= E.lines.length) { this.time.delayedCall(600, () => this.carloLine()); return; }

    const last = (i === E.lines.length - 1);
    const t = this.add.text(W / 2, H * 0.42, E.lines[i], UI.style(last ? 24 : 20,
      last ? PAL.sun : '#d9c9ae', { align: 'center', wordWrap: { width: W - 60 }, lineSpacing: 10 }))
      .setOrigin(0.5).setDepth(60).setAlpha(0);

    this.tweens.add({
      targets: t, alpha: 1, duration: 1000,
      onComplete: () => {
        this.time.delayedCall(last ? 3200 : 2400, () => {
          this.tweens.add({
            targets: t, alpha: 0, duration: 800,
            onComplete: () => { t.destroy(); this.lines(i + 1); }
          });
        });
      }
    });
  }

  /* 가롤로의 인생 계획 옆에, 나의 인생 계획 */
  carloLine() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, E = DAY08.end;
    const plan = SaveSystem.get('lifePlan', null) || '한 걸음';

    const a = this.add.text(W / 2, H * 0.30, E.carlo, UI.style(20, PAL.cream, {
      align: 'center', wordWrap: { width: W - 60 }, lineSpacing: 9
    })).setOrigin(0.5).setDepth(60).setAlpha(0);
    const f = this.add.text(W / 2, H * 0.40, E.carloFrom, UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(60).setAlpha(0);
    const m = this.add.text(W / 2, H * 0.52, E.mine, UI.style(FONT.small, PAL.sunDeep))
      .setOrigin(0.5).setDepth(60).setAlpha(0);
    const p = this.add.text(W / 2, H * 0.585, plan, UI.style(23, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5).setDepth(60).setAlpha(0);

    this.tweens.add({ targets: a, alpha: 1, duration: 1300 });
    this.tweens.add({ targets: f, alpha: 1, duration: 900, delay: 1600 });
    this.tweens.add({ targets: m, alpha: 1, duration: 900, delay: 3200 });
    this.tweens.add({ targets: p, alpha: 1, duration: 1200, delay: 3800 });
    AudioSystem.bell();

    this.time.delayedCall(8000, () => {
      this.tweens.add({
        targets: [a, f, m, p], alpha: 0, duration: 1000,
        onComplete: () => { [a, f, m, p].forEach(o => o.destroy()); this.question(); }
      });
    });
  }

  /* 당신의 이야기는 여기서 끝날까요? */
  question() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, E = DAY08.end;
    const q = this.add.text(W / 2, H * 0.36, E.q, UI.style(22, '#d9c9ae', {
      align: 'center', wordWrap: { width: W - 60 }
    })).setOrigin(0.5).setDepth(60).setAlpha(0);
    this.tweens.add({ targets: q, alpha: 1, duration: 1200 });

    this.time.delayedCall(3200, () => {
      const no = this.add.text(W / 2, H * 0.46, E.no, UI.style(34, PAL.cream))
        .setOrigin(0.5).setDepth(60).setAlpha(0);
      this.tweens.add({ targets: no, alpha: 1, duration: 900 });
      AudioSystem.chime();

      this.time.delayedCall(2200, () => {
        const go = this.add.text(W / 2, H * 0.55, E.begin, UI.style(34, PAL.sun))
          .setOrigin(0.5).setDepth(60).setAlpha(0);
        this.tweens.add({ targets: go, alpha: 1, duration: 1000 });
        AudioSystem.bell();

        this.time.delayedCall(3000, () => {
          this.tweens.add({
            targets: [q, no, go], alpha: 0, duration: 1100,
            onComplete: () => { [q, no, go].forEach(o => o.destroy()); this.finalScreen(false); }
          });
        });
      });
    });
  }

  finalScreen(instant) {
    const W = GAME.WIDTH, H = GAME.HEIGHT, E = DAY08.end;
    const d = instant ? 0 : 1;

    const title = this.add.text(W / 2, H * 0.20, E.complete, UI.style(26, PAL.cream))
      .setOrigin(0.5).setDepth(70).setAlpha(instant ? 1 : 0);
    const sub = this.add.text(W / 2, H * 0.255, 'DAY 1 – DAY 8', UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(70).setAlpha(instant ? 1 : 0);
    if (!instant) this.tweens.add({ targets: [title, sub], alpha: 1, duration: 1000 });

    /* 모은 말씀 수 — 점수가 아니라 기록입니다 */
    const total = (SaveSystem.get('collection', []) || []).length;
    const count = this.add.text(W / 2, H * 0.315, '만난 말씀 ' + total + '장',
      UI.style(FONT.small, PAL.clay)).setOrigin(0.5).setDepth(70).setAlpha(instant ? 0.9 : 0);
    if (!instant) this.tweens.add({ targets: count, alpha: 0.9, duration: 900, delay: 600 * d });

    const pray = this.add.text(W / 2, H * 0.44, E.lastPrayer, UI.style(21, PAL.sun, {
      align: 'center', wordWrap: { width: W - 60 }, lineSpacing: 9
    })).setOrigin(0.5).setDepth(70).setAlpha(instant ? 1 : 0);
    if (!instant) this.tweens.add({ targets: pray, alpha: 1, duration: 1400, delay: 1400 * d });

    const core = this.add.text(W / 2, H * 0.545, GAME.CORE_LINE, UI.style(FONT.small, '#cbbfae', {
      align: 'center', lineSpacing: 6
    })).setOrigin(0.5).setDepth(70).setAlpha(instant ? 0.85 : 0);
    if (!instant) this.tweens.add({ targets: core, alpha: 0.85, duration: 1000, delay: 2600 * d });

    this.time.delayedCall(instant ? 100 : 4200, () => this.buttons());
  }

  /* 여기서 기록을 지우지 않습니다. 걸어온 날은 그대로 남습니다. */
  buttons() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, E = DAY08.end;

    const epi = UI.button(this, W / 2, H * 0.66, W - 100, 64, '에필로그 열기', () => {
      SaveSystem.checkpoint('EpIntroScene', {});
      UI.fadeOut(this, 700, () => this.scene.start('EpIntroScene'));
    }, { size: FONT.label, fill: PAL.sun });

    const note = UI.button(this, W / 2, H * 0.66 + 78, W - 100, 58, E.noteBtn, () => {
      UI.fadeOut(this, 500, () => this.scene.start('Day8ReviewScene', { from: 'Day8EndScene' }));
    }, { size: FONT.small, fill: PAL.cream });

    const box = UI.button(this, W / 2, H * 0.66 + 148, W - 100, 56, '보관함', () => {
      this.scene.launch('GalleryScene', { from: 'Day8EndScene' });
      this.scene.pause();
    }, { size: FONT.small });

    const home = UI.button(this, W / 2, H * 0.66 + 216, W - 100, 56, '처음 화면으로', () => {
      SaveSystem.set('checkpoint', null);
      UI.fadeOut(this, 700, () => this.scene.start('TitleScene'));
    }, { size: FONT.small });

    [epi, note, box, home].forEach((b, i) => {
      b.setDepth(80).setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 700, delay: 200 + i * 220 });
    });
    this.btns = [epi, note, box, home];
  }
};
