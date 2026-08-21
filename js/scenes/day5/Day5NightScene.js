/* DAY 5 · 밤의 서울 — 용기에 대한 이야기, 한 걸음, 그리고 오늘의 기도. */

window.Day5NightScene = class Day5NightScene extends Phaser.Scene {
  constructor() { super('Day5NightScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day5NightScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#0e1830');

    this.add.image(W / 2, 0, 'sky_seoul_night').setOrigin(0.5, 0).setDisplaySize(W, H).setDepth(-40);
    this.add.image(W / 2, 300, 'seoul_night_block').setDepth(-30).setAlpha(0.9);
    const g = this.add.graphics().setDepth(-20);
    g.fillStyle(0x1b2540, 1); g.fillRect(0, 540, W, H - 540);
    g.fillStyle(0x22304f, 1); g.fillRect(0, 540, W, 10);
    g.fillStyle(0x2b3a5c, 1); g.fillRect(0, 720, W, H - 720);
    g.fillStyle(0xf3ece2, 0.35);
    for (let x = 6; x < W; x += 92) g.fillRect(x, 758, 52, 5);

    /* 작은 무리들로 흩어지는 청년들 */
    for (let i = 0; i < 5; i++) {
      const x = 40 + i * 76, y = 556 + (i % 2) * 14;
      const img = this.add.image(x, y, ['pilgrim_a', 'pilgrim_c', 'pilgrim_d', 'pilgrim_b', 'pilgrim_f'][i] + '_back')
        .setDepth(y).setScale(1.0).setAlpha(0.75);
      this.tweens.add({ targets: img, x: x + 60, duration: 9000, repeat: -1, delay: i * 700 });
    }

    this.me = this.add.image(148, 606, 'player_back').setDepth(606).setScale(1.42);
    this.carlo = this.add.image(238, 618, 'carlo_back').setDepth(618).setScale(1.42);
    this.tweens.add({ targets: [this.me, this.carlo], y: '-=4', duration: 840, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1100, [8, 10, 18]);

    this.time.delayedCall(900, () => {
      this.dialogue.play(DAY05.night.arrive, () => {
        this.dialogue.play(DAY05.night.talk, () => {
          this.scene.launch('CourageScene', { from: this.scene.key });
          this.scene.pause();
        });
      });
    });
  }

  onMiniGameDone(key) {
    if (key !== 'CourageScene') return;
    this.time.delayedCall(500, () => this.prayer());
  }

  /* 오늘의 기도 */
  prayer() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const veil = this.add.graphics().setDepth(800);   // 밤거리의 사람들보다 위에
    veil.fillStyle(0x101a2e, 0.94); veil.fillRect(0, 0, W, H);
    veil.setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 1100 });
    AudioSystem.bell();

    const head = this.add.text(W / 2, 132, DAY05.prayer.head, UI.style(20, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(810).setAlpha(0);
    this.tweens.add({ targets: head, alpha: 1, duration: 900 });

    /* 오늘 만난 사람들이 짧게 지나갑니다 */
    const faces = ['child_front', 'pilgrim_e', 'pilgrim_a', 'pilgrim_c', 'pilgrim_b', 'pilgrim_d'];
    faces.forEach((k, i) => {
      this.time.delayedCall(600 + i * 340, () => {
        const img = this.add.image(46 + i * 60, 190, k).setDepth(810).setScale(1.15).setAlpha(0);
        this.tweens.add({ targets: img, alpha: 1, duration: 500 });
        this.time.delayedCall(3400, () => this.tweens.add({
          targets: img, alpha: 0, duration: 800, onComplete: () => img.destroy()
        }));
      });
    });

    const view = PrayerView.open(this, DAY05.prayer.lines, {
      top: 250, bottom: H - 190, depth: 810, delay: 1400,
      onDone: () => this.time.delayedCall(1200, () => this.askWho(veil, view, head))
    });
  }

  /* 누구를 위해 기도할까요 — 짧게 끝냅니다 */
  askWho(veil, view, head) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    view.destroy();
    const t = this.add.text(W / 2, 210, DAY05.prayer.askWho, UI.style(21, PAL.cream, {
      align: 'center', lineSpacing: 8, wordWrap: { width: W - 76 }
    })).setOrigin(0.5, 0).setDepth(810);
    head.setAlpha(0.4);

    const layer = this.add.container(0, 0).setDepth(820);
    const list = this.add.container(0, 0);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, 280, W, 400);
    list.setMask(shape.createGeometryMask());
    layer.add(list);

    let y = 314;
    DAY05.prayer.who.forEach((w) => {
      const b = UI.button(this, W / 2, y, W - 76, 54, w, () => {
        layer.destroy();
        SaveSystem.set('reflections.day5PrayFor', w);
        this.remember(veil, t, head, w);
      }, { size: FONT.small });
      list.add(b);
      y += 62;
    });

    const max = Math.max(0, y - 660);
    this.input.on('pointermove', (p) => {
      if (!p.isDown || p.y < 284 || p.y > 676) return;
      const dy = p.y - (this.lastY === undefined ? p.y : this.lastY);
      this.lastY = p.y;
      list.y = Phaser.Math.Clamp(list.y + dy, -max, 0);
    });
    this.input.on('pointerup', () => { this.lastY = undefined; });
  }

  /* 받침에 따라 “을 / 를” 을 골라 붙입니다 */
  particle(word) {
    const code = word.charCodeAt(word.length - 1) - 0xAC00;
    if (code < 0 || code > 11171) return '를';
    return (code % 28 === 0) ? '를' : '을';
  }

  remember(veil, t, head, who) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    t.setText(DAY05.prayer.remember + who + this.particle(who) + DAY05.prayer.remember2);
    t.setY(H * 0.40);
    t.setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 900 });
    AudioSystem.chime();

    this.time.delayedCall(2600, () => {
      const b = UI.button(this, W / 2, H - 140, 250, 58, DAY05.prayer.endBtn, () => {
        b.destroy();
        this.tweens.add({
          targets: [veil, t, head], alpha: 0, duration: 900,
          onComplete: () => {
            [veil, t, head].forEach(o => o.destroy());
            UI.fadeOut(this, 1000, () => this.scene.start('Day5NoteScene'), [8, 10, 18]);
          }
        });
      }, { size: FONT.label, fill: PAL.sun });
      b.setDepth(830).setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 700 });
    });
  }
};
