/* DAY 8 · 집으로 — “내가 가고 싶어서.” 이 한 문장이 8일의 성장입니다. */

window.Day8HomeScene = class Day8HomeScene extends Phaser.Scene {
  constructor() { super('Day8HomeScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day8HomeScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#e8d6b8');

    this.add.tileSprite(W / 2, 110, W, 220, 'wall_tile').setDepth(0).setTint(0xf0dcbc);
    this.add.tileSprite(W / 2, 540, W, 620, 'floor_tile').setDepth(0).setTint(0xdcc09a);
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(HEX(PAL.woodDark), 0.55); g.fillRect(0, 216, W, 10);

    this.add.image(74, 220, 'front_door').setOrigin(0.5, 1).setDepth(4).setScale(1.1);
    this.add.image(W / 2 + 40, 470, 'table_home').setDepth(470).setScale(1.05);
    this.add.image(300, 160, 'tv').setDepth(5).setScale(1.1);
    this.mom = this.add.image(288, 430, 'mom_front').setDepth(430).setScale(1.3);
    this.tweens.add({ targets: this.mom, y: 426, duration: 1000, yoyo: true, repeat: -1 });

    this.me = this.add.image(120, 600, 'player_front').setDepth(600).setScale(1.36);
    this.tweens.add({ targets: this.me, y: 596, duration: 900, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1000, [22, 30, 50]);

    this.time.delayedCall(900, () => {
      this.dialogue.play(DAY08.home.arrive, () => this.answer());
    });
  }

  /* DAY 1 과 같은 질문. 다른 대답. */
  answer() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.dialogue.play(DAY08.home.answer, () => {
      /* 이 한 문장은 밝은 방 위에서도 또렷해야 합니다 */
      const plate = this.add.graphics().setDepth(299).setAlpha(0);
      plate.fillStyle(0x2b1f16, 0.62);
      plate.fillRoundedRect(24, H * 0.34 - 46, W - 48, 92, 22);
      const t = this.add.text(W / 2, H * 0.34, DAY08.home.why, UI.style(28, PAL.sun, {
        align: 'center', wordWrap: { width: W - 90 }
      })).setOrigin(0.5).setDepth(300).setAlpha(0);
      this.tweens.add({ targets: [t, plate], alpha: 1, duration: 1100 });
      AudioSystem.chime();
      SaveSystem.set('reflections.day8Mass', true);

      this.time.delayedCall(3000, () => {
        this.tweens.add({
          targets: [t, plate], alpha: 0, duration: 900,
          onComplete: () => {
            t.destroy(); plate.destroy();
            this.dialogue.play(DAY08.home.after, () => this.night());
          }
        });
      });
    });
  }

  /* 밤 — 여행 노트를 처음부터 넘겨봅니다 */
  night() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    UI.fadeOut(this, 900, () => {
      this.children.list.slice().forEach(o => o.destroy());
      this.cameras.main.setBackgroundColor('#1a1526');
      this.cameras.main.fadeIn(900, 22, 20, 34);
      this.dialogue = new DialogueBox(this);

      this.add.image(W / 2, 640, 'desk_night').setDepth(10).setScale(1.05);
      this.add.image(W / 2, 520, 'lamp_glow').setDepth(5).setScale(2.2).setAlpha(0.22);
      this.add.image(W / 2 - 96, 596, 'note_small').setDepth(20).setScale(1.4);
      this.add.image(W / 2 + 10, 604, 'rosary').setDepth(20).setScale(1.1).setAlpha(0.9);
      this.add.image(W / 2 + 96, 600, 'wyd_band_small').setDepth(20).setScale(1.2);

      this.time.delayedCall(800, () => {
        this.dialogue.play(DAY08.home.night, () => this.pages(0));
      });
    }, [22, 20, 34]);
  }

  /* DAY 1 부터 DAY 8 까지 한 장씩 */
  pages(i) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const list = DAY08.home.pages;
    if (i >= list.length) { this.lastPage(); return; }

    const p = list[i];
    const d = this.add.text(W / 2, 250, p.d, UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(60).setAlpha(0);
    const t = this.add.text(W / 2, 292, p.t, UI.style(26, PAL.cream))
      .setOrigin(0.5).setDepth(60).setAlpha(0);
    this.tweens.add({ targets: [d, t], alpha: 1, duration: 400 });
    AudioSystem.tap();

    this.time.delayedCall(900, () => {
      this.tweens.add({
        targets: [d, t], alpha: 0, duration: 350,
        onComplete: () => { d.destroy(); t.destroy(); this.pages(i + 1); }
      });
    });
  }

  lastPage() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const head = this.add.text(W / 2, 250, DAY08.home.lastPage, UI.style(FONT.small, PAL.sunDeep))
      .setOrigin(0.5).setDepth(60).setAlpha(0);
    const plan = SaveSystem.get('lifePlan', null) || '한 걸음';
    const t = this.add.text(W / 2, 306, plan, UI.style(25, PAL.sun, {
      align: 'center', wordWrap: { width: W - 80 }, lineSpacing: 8
    })).setOrigin(0.5).setDepth(60).setAlpha(0);

    this.tweens.add({ targets: head, alpha: 1, duration: 900 });
    this.tweens.add({ targets: t, alpha: 1, duration: 1100, delay: 700 });
    AudioSystem.chime();

    this.time.delayedCall(3400, () => {
      this.dialogue.say(DAY08.home.close, () => {
        UI.fadeOut(this, 1600, () => this.scene.start('Day8GoodbyeScene'), [4, 6, 12]);
      });
    });
  }
};
