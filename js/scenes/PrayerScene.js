/* DAY 1 · 오늘의 기도 — 조작도, 성공도, 실패도 없습니다. */

window.PrayerScene = class PrayerScene extends Phaser.Scene {
  constructor() { super('PrayerScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const D = DAY01.prayer;
    AudioSystem.setAmbience('beach');
    AudioSystem.startPad();

    const SEA_TOP = H * 0.46, SAND_TOP = H * 0.64;
    this.add.image(W / 2, 0, 'sky_night').setOrigin(0.5, 0).setDisplaySize(W, SEA_TOP + 6).setDepth(-10);
    const dawn = this.add.image(W / 2, SEA_TOP, 'lamp_glow').setDepth(-9)
      .setDisplaySize(W * 1.6, 190).setTint(0xffc79a).setAlpha(0.45);
    this.tweens.add({ targets: dawn, alpha: 0.7, duration: 5200, yoyo: true, repeat: -1 });

    for (let i = 0; i < 30; i++) {
      const s = this.add.image(Phaser.Math.Between(0, W), Phaser.Math.Between(16, SEA_TOP - 40), 'dot')
        .setScale(Phaser.Math.FloatBetween(0.15, 0.36)).setAlpha(Phaser.Math.FloatBetween(0.2, 0.7));
      this.tweens.add({ targets: s, alpha: 0.08, duration: Phaser.Math.Between(1800, 3600), yoyo: true, repeat: -1 });
    }

    /* 파도만 남은 화면 */
    const g = this.add.graphics().setDepth(-8);
    g.fillStyle(0x1d3a58, 1); g.fillRect(0, SEA_TOP, W, SAND_TOP - SEA_TOP);
    g.fillStyle(0x2f6b8f, 0.4); g.fillRect(0, SEA_TOP, W, 20);
    g.fillStyle(0xe6c9a6, 0.22); g.fillRect(0, SEA_TOP, W, 8);
    g.fillStyle(0xa9b8ca, 1); g.fillRect(0, SAND_TOP, W, H - SAND_TOP);
    g.fillStyle(0x93a4ba, 0.7); g.fillRect(0, SAND_TOP, W, 18);
    for (let i = 0; i < 160; i++) {
      g.fillStyle(i % 3 === 0 ? 0xffffff : 0x7d8ea4, 0.14);
      g.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(SAND_TOP + 12, H - 6), Phaser.Math.FloatBetween(0.8, 1.8));
    }

    /* 밀려왔다 물러가는 물결 */
    for (let i = 0; i < 3; i++) {
      const f = this.add.image(Phaser.Math.Between(60, W - 60), SAND_TOP - 34 - i * 30, 'seafoam')
        .setDisplaySize(Phaser.Math.Between(150, 260), 11)
        .setAlpha(0.3 + i * 0.08).setDepth(-7);
      this.tweens.add({
        targets: f, y: f.y + 22, alpha: 0.1, duration: 3400 + i * 500,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 500
      });
    }

    /* 기도문 — 따라 할 수 있도록 천천히, 그리고 잘 보이도록 뒤를 눌러 줍니다 */
    const rows = D.lines.length;
    const step = 38, top = H * 0.145;
    const plate = this.add.graphics().setDepth(-5).setAlpha(0);
    plate.fillStyle(0x0d1424, 0.55);
    plate.fillRoundedRect(18, top - 34, W - 36, rows * step + 34, 22);
    this.tweens.add({ targets: plate, alpha: 1, duration: 900 });

    const GAP = 1700;                       // 한 줄이 나오고 다음 줄까지의 시간
    this.lines = [];
    D.lines.forEach((line, i) => {
      const t = this.add.text(W / 2, top + i * step, line,
        UI.style(FONT.body, PAL.cream, { align: 'center' })).setOrigin(0.5).setAlpha(0).setDepth(-4);
      this.lines.push(t);
      this.tweens.add({ targets: t, alpha: line === '' ? 0 : 1, duration: 1200, delay: 700 + i * GAP });
    });

    /* 숨을 고르는 원 */
    const ring = this.add.graphics().setDepth(-6);
    ring.lineStyle(2, 0xfff0d6, 0.35);
    ring.strokeCircle(0, 0, 34);
    ring.setPosition(W / 2, H * 0.78);
    this.tweens.add({ targets: ring, scale: 1.45, alpha: 0.35, duration: 4200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    AudioSystem.bell();

    /* 5초 뒤 작은 건너뛰기 */
    this.time.delayedCall(D.skipAfter, () => {
      const b = UI.button(this, W / 2, H - 84, 150, 50, D.skipLabel, () => this.finish(),
        { size: FONT.small, alpha: 0.55, strokeAlpha: 0.35 });
      b.setAlpha(0);
      this.tweens.add({ targets: b, alpha: 0.75, duration: 700 });
    });

    const total = D.lines.length * GAP + D.hold + 1200;
    this.time.delayedCall(total, () => this.finish());
  }

  finish() {
    if (this._done) return;
    this._done = true;
    AudioSystem.chime();
    UI.fadeOut(this, 1200, () => this.scene.start('JournalScene'), [12, 20, 40]);
  }
};
