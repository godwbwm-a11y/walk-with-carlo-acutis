/* EPILOGUE 9 · FINAL — 제목의 절반이 사라지고, 남은 것은 오늘 걷는 나입니다.
   그러나 혼자가 아닙니다. */

window.EpFinalScene = class EpFinalScene extends Phaser.Scene {
  constructor() { super('EpFinalScene'); }

  create(data) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.returning = !!(data && data.returning);

    AudioSystem.setAmbience('none');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#080c16');

    for (let i = 0; i < 40; i++) {
      const s = this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(20, H - 40), 'dot')
        .setDepth(-35).setScale(Phaser.Math.FloatBetween(0.12, 0.32))
        .setAlpha(Phaser.Math.FloatBetween(0.12, 0.5));
      this.tweens.add({ targets: s, alpha: 0.06, duration: Phaser.Math.Between(2000, 3800),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2400) });
    }

    this.save();

    if (this.returning) { UI.fadeIn(this, 500); this.lastScreen(true); return; }

    UI.fadeIn(this, 1200, [8, 10, 18]);
    this.time.delayedCall(1200, () => this.lines(0));
  }

  save() {
    if (this.saved) return;
    this.saved = true;
    SaveSystem.set('epilogue.completed', true);
    SaveSystem.set('dayCompleted.epilogue', true);
    SaveSystem.addJournal({
      day: 99.5, title: 'EPILOGUE · ' + EPI.title,
      friend: SaveSystem.get('epilogue.newFriendName', null),
      word: SaveSystem.get('epilogue.learnedWord', null),
      favorite: SaveSystem.get('epilogue.favoriteGame', null)
    });
    SaveSystem.set('checkpoint', null);
  }

  /* WYD 는 서울에서 끝나지 않습니다 */
  lines(i) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    if (i >= EPI.final.lines.length) { this.time.delayedCall(600, () => this.wydWord()); return; }

    const t = this.add.text(W / 2, H * 0.44, EPI.final.lines[i], UI.style(21, PAL.cream, {
      align: 'center', wordWrap: { width: W - 60 }, lineSpacing: 10
    })).setOrigin(0.5).setDepth(60).setAlpha(0);

    this.tweens.add({
      targets: t, alpha: 1, duration: 900,
      onComplete: () => {
        this.time.delayedCall(2400, () => {
          this.tweens.add({
            targets: t, alpha: 0, duration: 800,
            onComplete: () => { t.destroy(); this.lines(i + 1); }
          });
        });
      }
    });
  }

  /* 서울 WYD 의 주제 말씀 */
  wydWord() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const t = this.add.text(W / 2, H * 0.40, EPI.final.wydWord, UI.style(25, PAL.sun, {
      align: 'center', lineSpacing: 10
    })).setOrigin(0.5).setDepth(60).setAlpha(0);
    const r = this.add.text(W / 2, H * 0.50, EPI.final.wydRef, UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(60).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 1400 });
    this.tweens.add({ targets: r, alpha: 1, duration: 900, delay: 1800 });
    AudioSystem.bell();

    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: [t, r], alpha: 0, duration: 900,
        onComplete: () => { t.destroy(); r.destroy(); this.carloWord(); }
      });
    });
  }

  /* 그리고 카를로의 말 — 이번에는 조금씩 작아집니다 */
  carloWord() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const t = this.add.text(W / 2, H * 0.36, EPI.final.carlo, UI.style(22, PAL.cream, {
      align: 'center', lineSpacing: 9
    })).setOrigin(0.5).setDepth(60).setAlpha(0);
    const f = this.add.text(W / 2, H * 0.45, EPI.final.carloFrom, UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(60).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 1300 });
    this.tweens.add({ targets: f, alpha: 1, duration: 900, delay: 1600 });

    this.time.delayedCall(4600, () => {
      /* 카를로의 문장이 천천히 작아지고, 내 카드가 그 자리에 옵니다 */
      this.tweens.add({ targets: [t, f], alpha: 0.28, scale: 0.72, y: '-=60', duration: 1600 });
      this.time.delayedCall(1000, () => this.myCard(t, f));
    });
  }

  myCard(t, f) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const plan = SaveSystem.get('lifePlan', null) || '한 걸음';

    const head = this.add.text(W / 2, H * 0.56, EPI.final.mine, UI.style(FONT.small, PAL.sunDeep))
      .setOrigin(0.5).setDepth(60).setAlpha(0);
    const p = this.add.text(W / 2, H * 0.625, plan, UI.style(26, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5).setDepth(60).setAlpha(0);

    this.tweens.add({ targets: head, alpha: 1, duration: 900 });
    this.tweens.add({ targets: p, alpha: 1, duration: 1200, delay: 600 });
    AudioSystem.chime();

    this.time.delayedCall(3800, () => {
      this.tweens.add({
        targets: [t, f, head, p], alpha: 0, duration: 900,
        onComplete: () => {
          [t, f, head, p].forEach(o => o.destroy());
          this.noteCloses();
        }
      });
    });
  }

  /* 여행 노트가 닫힙니다 — 탁. */
  noteCloses() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const book = this.add.image(W / 2, H * 0.44, 'note_book').setDepth(70).setScale(0.9).setAlpha(0);
    this.tweens.add({ targets: book, alpha: 1, duration: 700 });

    this.time.delayedCall(1200, () => {
      this.tweens.add({
        targets: book, scaleY: 0.06, duration: 400, ease: 'Sine.easeIn',
        onComplete: () => {
          AudioSystem.kick();
          const t = this.add.text(W / 2, H * 0.53, EPI.final.noteClose, UI.style(20, '#8fa5c8'))
            .setOrigin(0.5).setDepth(70).setAlpha(0);
          this.tweens.add({ targets: t, alpha: 1, duration: 300, yoyo: true, hold: 500 });
          this.time.delayedCall(1600, () => {
            this.tweens.add({
              targets: [book, t], alpha: 0, duration: 800,
              onComplete: () => { book.destroy(); t.destroy(); this.titleFades(); }
            });
          });
        }
      });
    });
  }

  /* 제목의 절반이 사라집니다 */
  titleFades() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const a = this.add.text(W / 2, H * 0.36, '《오늘,', UI.style(25, PAL.cream)).setOrigin(0.5).setDepth(80).setAlpha(0);
    const b = this.add.text(W / 2, H * 0.42, '카를로 아쿠티스와 함께', UI.style(25, PAL.cream)).setOrigin(0.5).setDepth(80).setAlpha(0);
    const c = this.add.text(W / 2, H * 0.48, '걷습니다》', UI.style(25, PAL.cream)).setOrigin(0.5).setDepth(80).setAlpha(0);

    this.tweens.add({ targets: [a, b, c], alpha: 1, duration: 1200 });

    this.time.delayedCall(3000, () => {
      this.tweens.add({ targets: b, alpha: 0, duration: 2000 });
      this.tweens.add({ targets: a, y: H * 0.39, duration: 2000 });
      this.tweens.add({ targets: c, y: H * 0.45, duration: 2000 });

      this.time.delayedCall(2400, () => {
        const t = this.add.text(W / 2, H * 0.54, EPI.final.tomorrow, UI.style(23, PAL.sun, {
          align: 'center', wordWrap: { width: W - 60 }
        })).setOrigin(0.5).setDepth(80).setAlpha(0);
        this.tweens.add({ targets: t, alpha: 1, duration: 1200 });
        AudioSystem.bell();

        this.time.delayedCall(3000, () => {
          const n = this.add.text(W / 2, H * 0.62, EPI.final.notAlone, UI.style(23, PAL.cream, {
            align: 'center', wordWrap: { width: W - 60 }
          })).setOrigin(0.5).setDepth(80).setAlpha(0);
          this.tweens.add({ targets: n, alpha: 1, duration: 1400 });
          AudioSystem.chime();

          this.time.delayedCall(3600, () => {
            this.tweens.add({
              targets: [a, b, c, t, n], alpha: 0, duration: 1200,
              onComplete: () => {
                [a, b, c, t, n].forEach(o => o.destroy());
                this.lastScreen(false);
              }
            });
          });
        });
      });
    });
  }

  /* 마지막 화면 — 단체사진. 이번에는 확대할 수 없습니다. */
  lastScreen(instant) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;

    const photo = EpiPhoto.build(this, W / 2, 300, 1.06, {
      caption: EPI.final.photoLabel, carloAlpha: 0.85
    });
    photo.setDepth(90).setAlpha(instant ? 1 : 0);
    if (!instant) this.tweens.add({ targets: photo, alpha: 1, duration: 1400 });

    const cap = this.add.text(W / 2, 456, EPI.final.photoCaption, UI.style(19, PAL.sun, {
      align: 'center', wordWrap: { width: W - 60 }
    })).setOrigin(0.5).setDepth(95).setAlpha(instant ? 1 : 0);
    const end = this.add.text(W / 2, 512, EPI.final.end, UI.style(24, PAL.cream))
      .setOrigin(0.5).setDepth(95).setAlpha(instant ? 1 : 0);
    if (!instant) {
      this.tweens.add({ targets: cap, alpha: 1, duration: 1000, delay: 1200 });
      this.tweens.add({ targets: end, alpha: 1, duration: 1000, delay: 2400 });
      AudioSystem.bell();
    }

    this.time.delayedCall(instant ? 100 : 3600, () => {
      /* 처음 끝까지 왔다면 크레딧이 저절로 흐릅니다 */
      if (!instant && !SaveSystem.get('epilogue.creditsSeen', false)) {
        UI.fadeOut(this, 1200, () => this.scene.start('EpCreditsScene', { from: 'EpFinalScene' }), [7, 11, 20]);
        return;
      }
      this.buttons();
    });
  }

  buttons() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, F = EPI.final;
    const rows = [
      { label: CREDITS.againBtn, fill: PAL.sun, go: () => this.scene.start('EpCreditsScene', { from: 'EpFinalScene' }) },
      { label: F.btnPhoto, fill: PAL.cream, go: () => this.scene.start('EpPhotoBookScene', { from: 'EpFinalScene' }) },
      { label: F.btnCards, fill: PAL.paper, go: () => { this.scene.launch('GalleryScene', { from: 'EpFinalScene' }); this.scene.pause(); } },
      { label: F.btnPlan, fill: PAL.paper, go: () => this.showPlan() },
      { label: '다시 걷고 싶은 날 고르기', fill: PAL.paper, go: () => this.backToPicker() }
    ];

    this.btns = rows.map((r, i) => {
      const b = UI.button(this, W / 2, 560 + i * 58, W - 110, 48, r.label, r.go,
        { size: FONT.small, fill: r.fill });
      b.setDepth(100).setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 600, delay: 150 + i * 180 });
      return b;
    });
  }

  showPlan() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    if (this.planLayer) return;
    const plan = SaveSystem.get('lifePlan', null) || '한 걸음';
    const becoming = SaveSystem.get('finalCard.becoming', null);

    const layer = this.add.container(0, 0).setDepth(400);
    this.planLayer = layer;
    const scrim = this.add.graphics();
    scrim.fillStyle(0x080c16, 0.95); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    const card = this.add.container(W / 2, H * 0.42);
    card.add(this.add.image(0, 0, 'my_card'));
    card.add(this.add.text(0, -28, DAY08.card.title, UI.style(20, PAL.sunDeep)).setOrigin(0.5));
    card.add(this.add.text(0, -2, DAY08.card.sub, UI.style(FONT.small, PAL.inkSoft)).setOrigin(0.5));
    card.add(this.add.text(0, 46, plan, UI.style(23, PAL.ink, {
      align: 'center', wordWrap: { width: 250 }, lineSpacing: 8
    })).setOrigin(0.5));
    layer.add(card);

    if (becoming) {
      layer.add(this.add.text(W / 2, H * 0.60, '“' + becoming + '”', UI.style(17, '#cbbfae', {
        align: 'center', wordWrap: { width: W - 80 }, lineSpacing: 6
      })).setOrigin(0.5));
    }

    layer.add(UI.button(this, W / 2, H - 130, 220, 56, '닫기', () => {
      layer.destroy(); this.planLayer = null;
    }, { size: FONT.small }));
  }

  /* 기록을 지우지 않습니다 — 걷고 싶은 날을 골라 다시 걸을 뿐입니다 */
  backToPicker() {
    SaveSystem.set('checkpoint', null);
    UI.fadeOut(this, 700, () => this.scene.start('TitleScene', { picker: true }));
  }
};
