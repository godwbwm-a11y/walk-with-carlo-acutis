/* 미니게임 · 나의 길 — 잘못 고른 길은 없습니다.
   어느 쪽으로 걸어도 결국 하나의 넓은 길로 이어집니다. */

window.MyPathScene = class MyPathScene extends MiniGameScene {
  constructor() { super('MyPathScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#141d33',
      title: DAY08.path.title, hint: DAY08.path.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.stepIndex = 0;
    this.taken = [];

    this.add.tileSprite(W / 2, H / 2, W, H, 'path_tile').setDepth(-40).setAlpha(0.9);
    for (let i = 0; i < 50; i++) {
      this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(120, H - 60), 'star_bright')
        .setDepth(-30).setScale(Phaser.Math.FloatBetween(0.2, 0.45))
        .setAlpha(Phaser.Math.FloatBetween(0.12, 0.4));
    }

    this.me = this.add.image(W / 2, 690, 'player_back').setDepth(690).setScale(1.5);

    this.words = DAY08.path.words.slice();
    Phaser.Utils.Array.Shuffle(this.words);

    this.time.delayedCall(600, () => this.fork());
  }

  clearForks() {
    (this.forks || []).forEach(o => o.destroy());
    this.forks = [];
  }

  /* 갈림길 — 세 걸음이면 충분합니다 */
  fork() {
    if (this.stepIndex >= 3) { this.merge(); return; }
    const W = GAME.WIDTH;
    this.clearForks();

    const y = 520 - this.stepIndex * 40;
    const pick = this.words.splice(0, 3);
    pick.forEach((w, i) => {
      const x = 76 + i * 119;
      const c = this.add.container(x, y).setDepth(70);
      c.add(this.add.image(0, 0, 'path_sign'));
      c.add(this.add.text(0, 0, w, UI.style(FONT.small, PAL.cream)).setOrigin(0.5));
      c.setSize(120, 60);
      c.setInteractive();
      c.setAlpha(0);
      this.tweens.add({ targets: c, alpha: 1, duration: 400, delay: i * 120 });
      c.on('pointerup', () => this.walk(c, w));
      this.forks.push(c);
    });

    /* 걷는 동안 지난 날들이 떠오릅니다 */
    if (this.stepIndex < DAY08.path.memories.length) {
      const m = this.add.text(W / 2, 190, DAY08.path.memories[this.stepIndex],
        UI.style(FONT.small, '#8fa5c8', { align: 'center', wordWrap: { width: W - 70 } }))
        .setOrigin(0.5).setDepth(70).setAlpha(0);
      this.tweens.add({ targets: m, alpha: 1, duration: 900, delay: 300 });
      this.time.delayedCall(3200, () => this.tweens.add({
        targets: m, alpha: 0, duration: 800, onComplete: () => m.destroy()
      }));
    }
  }

  walk(c, word) {
    if (this.walking) return;
    this.walking = true;
    this.taken.push(word);
    AudioSystem.step();

    this.forks.forEach(o => { if (o !== c) this.tweens.add({ targets: o, alpha: 0.15, duration: 400 }); });
    this.tweens.add({
      targets: this.me, x: c.x, y: c.y + 46, scale: 1.5 - this.stepIndex * 0.08,
      duration: 900, ease: 'Sine.easeInOut',
      onComplete: () => {
        this.me.setDepth(this.me.y);
        this.stepIndex++;
        this.walking = false;
        this.time.delayedCall(500, () => this.fork());
      }
    });
  }

  /* 모든 길이 하나로 */
  merge() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.clearForks();
    this.setHint('');
    SaveSystem.set('reflections.day8Path', this.taken.slice());

    const road = this.add.graphics().setDepth(-20);
    road.fillStyle(0x3d4a6b, 1);
    road.fillTriangle(W / 2 - 30, 380, W / 2 + 30, 380, W / 2 + 190, H);
    road.fillTriangle(W / 2 - 30, 380, W / 2 - 190, H, W / 2 + 190, H);
    road.setAlpha(0);
    this.tweens.add({ targets: road, alpha: 1, duration: 1400 });

    this.tweens.add({ targets: this.me, x: W / 2, y: 470, scale: 1.1, duration: 1200 });

    const t = this.add.text(W / 2, 300, DAY08.path.merge, UI.style(19, '#cbd8ea', {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(80).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 900, delay: 900 });

    this.time.delayedCall(2800, () => {
      this.tweens.add({ targets: t, alpha: 0, duration: 600 });
      const plan = SaveSystem.get('lifePlan', null) || '한 걸음';
      const p = this.add.text(W / 2, 250, plan, UI.style(25, PAL.sun, {
        align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
      })).setOrigin(0.5).setDepth(80).setAlpha(0);
      const s = this.add.text(W / 2, 330, DAY08.path.mine, UI.style(FONT.small, PAL.cream, {
        align: 'center', wordWrap: { width: W - 70 }
      })).setOrigin(0.5).setDepth(80).setAlpha(0);
      this.tweens.add({ targets: p, alpha: 1, duration: 1100, delay: 600 });
      this.tweens.add({ targets: s, alpha: 1, duration: 1100, delay: 1600 });
      AudioSystem.chime();

      this.time.delayedCall(4200, () => {
        this.cardId = 'j12';
        this.complete([DAY08.path.mine]);
      });
    });
  }
};
