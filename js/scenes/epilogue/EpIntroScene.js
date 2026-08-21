/* EPILOGUE 1 · 마지막 금요일 밤, 그리고 다시 꿈 — 이번에는 해변이 아닙니다. */

window.EpIntroScene = class EpIntroScene extends Phaser.Scene {
  constructor() { super('EpIntroScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.set('epilogue.played', true);
    SaveSystem.set('epilogue.games', []);       /* 다시 걸으면 그날의 놀이도 새로 */
    SaveSystem.checkpoint('EpIntroScene', {});
    AudioSystem.unlock();
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#141020');

    /* 불이 꺼진 방, 책상 위만 조금 밝습니다 */
    this.add.image(W / 2, 620, 'desk_night').setDepth(10).setScale(1.05);
    this.add.image(W / 2, 500, 'lamp_glow').setDepth(5).setScale(2.2).setAlpha(0.2);
    this.add.image(W / 2 - 96, 590, 'note_book').setDepth(20).setScale(0.3);
    this.add.image(W / 2 - 18, 604, 'rosary').setDepth(20).setScale(1.0).setAlpha(0.9);
    this.add.image(W / 2 + 62, 600, 'wyd_band_small').setDepth(20).setScale(1.1);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1400, [20, 16, 32]);

    this.time.delayedCall(1000, () => {
      UI.caption(this, EPI.intro.caption, {
        y: H * 0.26, hold: 1300,
        onDone: () => this.dialogue.play(EPI.intro.lines, () => this.card())
      });
    });
  }

  /* 카메라가 MY CARD 쪽으로 천천히 갑니다 */
  card() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const plan = SaveSystem.get('lifePlan', null) || '한 걸음';

    const c = this.add.container(W / 2, 380).setDepth(200).setScale(0.6).setAlpha(0);
    c.add(this.add.image(0, 0, 'my_card'));
    c.add(this.add.text(0, -28, DAY08.card.title, UI.style(20, PAL.sunDeep)).setOrigin(0.5));
    c.add(this.add.text(0, -2, EPI.intro.deskHead, UI.style(FONT.small, PAL.inkSoft)).setOrigin(0.5));
    c.add(this.add.text(0, 46, plan, UI.style(23, PAL.ink, {
      align: 'center', wordWrap: { width: 250 }, lineSpacing: 8
    })).setOrigin(0.5));

    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 1400, ease: 'Sine.easeOut' });
    AudioSystem.chime();

    this.time.delayedCall(3600, () => {
      const t = this.add.text(W / 2, H * 0.78, EPI.intro.fade, UI.style(FONT.small, '#8fa5c8'))
        .setOrigin(0.5).setDepth(210).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 0.9, duration: 1000 });
      AudioSystem.wave();

      this.time.delayedCall(2600, () => {
        /* 파도 소리 대신 자동차 소리, 새소리, 사람들 목소리 */
        AudioSystem.setAmbience('city');
        this.tweens.add({ targets: [c, t], alpha: 0, duration: 1200 });
        this.time.delayedCall(1400, () => this.wake());
      });
    });
  }

  /* 눈을 뜨면 우리 성당 앞 */
  wake() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    UI.fadeOut(this, 1200, () => {
      this.children.list.slice().forEach(o => o.destroy());
      this.cameras.main.setBackgroundColor('#b9d8ea');
      this.cameras.main.fadeIn(1400, 235, 226, 207);
      this.dialogue = new DialogueBox(this);
      AudioSystem.setAmbience('city');

      this.add.image(W / 2, 0, 'epi_sky_day').setOrigin(0.5, 0).setDisplaySize(W, 420).setDepth(-40);
      const g = this.add.graphics().setDepth(-30);
      g.fillStyle(0xd6cdb8, 1); g.fillRect(0, 400, W, H - 400);
      g.fillStyle(0xe0d7c2, 1); g.fillRect(0, 400, W, 12);

      this.add.image(W / 2 + 10, 400, 'church_front').setOrigin(0.5, 1).setDepth(4).setScale(1.15);
      this.add.image(56, 398, 'epi_grotto').setOrigin(0.5, 1).setDepth(5).setScale(0.9);
      this.add.image(342, 396, 'tree_big').setOrigin(0.5, 1).setDepth(6).setScale(0.95);

      this.me = this.add.image(W / 2 - 30, 640, 'player_back').setDepth(640).setScale(1.4);
      this.tweens.add({ targets: this.me, y: 636, duration: 950, yoyo: true, repeat: -1 });

      this.time.delayedCall(1400, () => {
        this.dialogue.play(EPI.dream.wake, () => this.place());
      });
    }, [235, 226, 207]);
  }

  place() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const t = this.add.text(W / 2, H * 0.30, EPI.dream.place, UI.style(28, PAL.sunDeep, {
      align: 'center'
    })).setOrigin(0.5).setDepth(300).setAlpha(0);
    const plate = this.add.graphics().setDepth(299).setAlpha(0);
    plate.fillStyle(0x2b1f16, 0.7);
    plate.fillRoundedRect(40, H * 0.30 - 34, W - 80, 68, 20);

    this.tweens.add({ targets: [t, plate], alpha: 1, duration: 1200 });
    AudioSystem.bell();

    this.time.delayedCall(2800, () => {
      this.tweens.add({
        targets: [t, plate], alpha: 0, duration: 900,
        onComplete: () => {
          t.destroy(); plate.destroy();
          this.dialogue.play(EPI.dream.after, () => this.done());
        }
      });
    });
  }

  done() {
    UI.fadeOut(this, 900, () => this.scene.start('EpYardScene'), [214, 205, 184]);
  }
};
