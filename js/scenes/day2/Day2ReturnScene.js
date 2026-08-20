/* DAY 2 · 돌아가는 길 — 같은 길인데 걸음이 조금 가볍다. */

window.Day2ReturnScene = class Day2ReturnScene extends Phaser.Scene {
  constructor() { super('Day2ReturnScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day2ReturnScene', {});
    AudioSystem.setAmbience('room');

    this.add.image(W / 2, 0, 'sky_evening').setOrigin(0.5, 0).setDisplaySize(W, 380).setDepth(-20);
    const g = this.add.graphics().setDepth(-19);
    g.fillStyle(0xc4b294, 1); g.fillRect(0, 374, W, H - 374);
    g.fillStyle(0xc8b79c, 1); g.fillRect(0, 374, W, 12);
    g.fillStyle(0x9a9a96, 1); g.fillRect(0, 646, W, H - 646);
    g.fillStyle(0xf3ece2, 0.7);
    for (let x = 10; x < W; x += 90) g.fillRect(x, 690, 46, 6);

    /* 저녁빛을 받은 동네 */
    for (let x = -20; x < W + 40; x += 96) {
      const h = 90 + ((x * 7) % 60);
      g.fillStyle(((x / 96) | 0) % 2 === 0 ? 0xb0a08c : 0xa79684, 1);
      g.fillRect(x, 374 - h, 84, h);
      g.fillStyle(0xf2c08a, 0.55);
      for (let r = 0; r < Math.floor(h / 30); r++)
        for (let c = 0; c < 2; c++) g.fillRect(x + 14 + c * 34, 374 - h + 16 + r * 30, 20, 14);
    }

    this.stage = this.add.container(0, 0).setDepth(10);
    this.caption = this.add.text(W / 2, H - 178, '', UI.style(20, PAL.cream, {
      align: 'center', wordWrap: { width: W - 60 }, lineSpacing: 7
    })).setOrigin(0.5).setDepth(40).setAlpha(0);

    const shade = this.add.graphics().setDepth(35);
    shade.fillStyle(0x2b1f16, 0.35); shade.fillRect(0, H - 250, W, 250);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1100, [70, 56, 44]);

    this.scenes = [
      { build: () => this.vPark(), lines: DAY02.back.caption },
      { build: () => this.vPark2(), lines: DAY02.back.park },
      { build: () => this.vStore(), lines: DAY02.back.store },
      { build: () => this.vChild(), lines: null }
    ];
    this.index = 0;
    this.time.delayedCall(900, () => this.next());
  }

  clearStage() { this.stage.removeAll(true); }

  vPark() {
    const W = GAME.WIDTH;
    this.stage.add(this.add.image(W / 2 - 46, 620, 'tree_big').setScale(1.25).setOrigin(0.5, 1));
    this.stage.add(this.add.image(W / 2 + 96, 624, 'bush').setScale(1.15).setOrigin(0.5, 1));
    this.stage.add(this.add.image(W / 2, 604, 'player_back').setScale(1.45));
  }

  vPark2() {
    const W = GAME.WIDTH;
    this.stage.add(this.add.image(W / 2 - 70, 600, 'grandma_front').setScale(1.35));
    this.stage.add(this.add.image(W / 2 + 46, 604, 'villager_front').setScale(1.3));
    const o = this.add.image(W / 2 - 20, 590, 'orange').setScale(1.2);
    this.stage.add(o);
    this.tweens.add({ targets: o, x: W / 2 + 16, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  vStore() {
    const W = GAME.WIDTH;
    this.stage.add(this.add.image(W / 2, 596, 'store_front').setScale(1.1).setOrigin(0.5, 1));
    this.stage.add(this.add.image(W / 2 - 46, 596, 'clerk_front').setScale(1.2).setAlpha(0.95));
    this.stage.add(this.add.image(W / 2 + 66, 602, 'villager_back').setScale(1.2));
  }

  vChild() {
    const W = GAME.WIDTH;
    this.stage.add(this.add.image(W / 2 - 48, 602, 'child_front').setScale(1.2));
    this.stage.add(this.add.image(W / 2 + 40, 598, 'grandma_front').setScale(1.3).setTint(0xf0dcc0));
  }

  next() {
    if (this.index >= this.scenes.length) { this.finish(); return; }
    const cur = this.scenes[this.index++];
    this.clearStage();
    cur.build();
    this.stage.setAlpha(0);
    this.tweens.add({ targets: this.stage, alpha: 1, duration: 800 });

    if (cur.lines) {
      this.caption.setText(cur.lines.join('\n'));
      this.caption.setAlpha(0);
      this.tweens.add({ targets: this.caption, alpha: 0.95, duration: 800 });
      this.time.delayedCall(2600 + cur.lines.length * 500, () => this.fadeOutStep());
    } else {
      /* 마지막 장면은 대화로 */
      this.time.delayedCall(700, () => {
        this.dialogue.play(DAY02.back.child, () => {
          this.dialogue.say(DAY02.back.smile, () => this.fadeOutStep());
        });
      });
    }
  }

  fadeOutStep() {
    this.tweens.add({ targets: [this.stage, this.caption], alpha: 0, duration: 700, onComplete: () => this.next() });
  }

  finish() {
    UI.fadeOut(this, 1200, () => this.scene.start('Day2NoteScene'), [22, 30, 50]);
  }
};
