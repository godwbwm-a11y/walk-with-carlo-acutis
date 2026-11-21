/* DAY 2 · 성당 안 — 게임이 조금씩 사라지고, 조용해집니다. */

window.Day2ChurchScene = class Day2ChurchScene extends Phaser.Scene {
  constructor() { super('Day2ChurchScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day2ChurchScene', {});
    AudioSystem.setAmbience('none');
    AudioSystem.startPad();

    this.found = 0;
    this.cameras.main.setBackgroundColor('#2b2634');

    /* 성당 안 */
    /* 기둥과 스테인드글라스, 늑골 천장, 대리석 바닥 — 안쪽 제단으로 빛이 모입니다 */
    Townscape.nave(this, { floorY: 470, mood: 'warm', depth: 0 });
    this.add.rectangle(W / 2, H / 2, W, H, 0x2a1e30, 0.4).setDepth(0.5);       // 조용히 가라앉은 빛
    const top = this.add.graphics().setDepth(0.6);                              // 위쪽 글이 잘 읽히도록
    top.fillGradientStyle(0x150f1c, 0x150f1c, 0x150f1c, 0x150f1c, 0.55, 0.55, 0, 0); top.fillRect(0, 0, W, 200);

    this.add.image(W / 2, 300, 'altar').setDepth(6).setScale(1.15);
    this.add.image(W / 2, 236, 'lamp_glow').setDepth(5).setScale(1.6).setAlpha(0.35);
    [520, 590, 660].forEach((y, i) => {
      this.add.image(W / 2, y, 'pew').setDepth(y).setScale(1.25).setAlpha(0.95 - i * 0.05);
    });

    this.glass = this.add.image(64, 250, 'stained_glass').setDepth(4).setScale(0.95);
    /* 창으로 들어오는 빛과 그 안에 떠도는 먼지 */
    if (window.Cine) {
      Cine.rays(this, 70, 220, { angle: -0.5, fan: 0.12, count: 4, length: 560, depth: 5, alpha: 0.13 });
      Cine.motes(this, 60, 260, 260, 380, { depth: 6, count: 16, alpha: 0.5 });
    }
    this.candle = this.add.image(304, 402, 'candle_stand').setDepth(8).setScale(1.05);
    this.lamp = this.add.image(96, 210, 'sanctuary_lamp').setDepth(8).setScale(1.05);

    /* 빛줄기 */
    const beam = this.add.graphics().setDepth(3);
    for (let i = 0; i < 4; i++) {
      beam.fillStyle(0xffe9c4, 0.05);
      beam.fillTriangle(50 - i * 6, 300, 96 + i * 10, 300, 200 + i * 22, 700);
    }
    this.tweens.add({ targets: beam, alpha: 0.75, duration: 5200, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    this.hint = this.add.text(W / 2, 92, '', UI.style(FONT.body, PAL.cream, {
      align: 'center', wordWrap: { width: W - 60 }
    })).setOrigin(0.5).setDepth(60);
    this.count = this.add.text(W / 2, 146, '', UI.style(FONT.small, '#cbbfae')).setOrigin(0.5).setDepth(60);

    UI.fadeIn(this, 1200, [230, 215, 195]);
    AudioSystem.bell();

    this.time.delayedCall(700, () => {
      this.dialogue.say(DAY02.church.enter, () => this.startLights());
    });
  }

  startLights() {
    this.hint.setText(DAY02.church.hint);
    this.refresh();

    const spots = [
      { obj: this.candle, key: 'candle', r: 46 },
      { obj: this.glass, key: 'glass', r: 60 },
      { obj: this.lamp, key: 'lamp', r: 44 }
    ];
    spots.forEach((sp) => {
      const halo = this.add.image(sp.obj.x, sp.obj.y - 10, 'lamp_glow').setDepth(38)
        .setScale(0.9).setAlpha(0.35).setTint(0xfff1cf);
      this.tweens.add({ targets: halo, alpha: 0.6, scale: 1.15, duration: 1600, yoyo: true, repeat: -1 });
      const spark = this.add.image(sp.obj.x, sp.obj.y - 10, 'spark').setDepth(40).setScale(1.6);
      this.tweens.add({ targets: spark, alpha: 0.4, scale: 2.1, duration: 1100, yoyo: true, repeat: -1 });
      sp.halo = halo;
      sp.obj.setInteractive({ useHandCursor: true });
      sp.obj.once('pointerdown', () => {
        sp.obj.disableInteractive();
        this.tweens.add({ targets: [spark, sp.halo], alpha: 0, duration: 400, onComplete: () => { spark.destroy(); sp.halo.destroy(); } });
        this.touch(sp.key);
      });
      sp.spark = spark;
    });
  }

  refresh() {
    this.count.setText('찾은 빛  ' + this.found + ' / 3');
  }

  touch(key) {
    this.found++;
    AudioSystem.found();
    this.refresh();

    const lines = DAY02.church.lights[key];
    if (key !== 'lamp') {
      this.dialogue.say(lines);
      return;
    }
    /* 성체등 — 잠시 멈춘다 */
    this.dialogue.say(lines, () => {
      Collection.award(this, 'c2', () => {
        this.time.delayedCall(400, () => this.checkDone());
      });
    });
  }

  checkDone() {
    if (this.found < 3 || this._done) return;
    this._done = true;
    this.hint.setText('');
    this.count.setText('');
    this.dialogue.say(DAY02.church.afterLights, () => {
      const b = UI.button(this, GAME.WIDTH / 2, GAME.HEIGHT - 130, 240, 60, DAY02.church.toRelic,
        () => this.toRelic(), { size: FONT.label, fill: PAL.sun });
      b.setDepth(60).setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 700 });
    });
  }

  toRelic() {
    UI.fadeOut(this, 900, () => this.scene.start('Day2RelicScene'), [26, 22, 32]);
  }

  update() {
    if (this.found >= 3 && !this._checked && !this.dialogue.isOpen) {
      this._checked = true;
      this.checkDone();
    }
  }
};
