/* 잠시 멈춰 바라보는 화면 — 파도, 넓은 바다, 은하수. */

window.VistaScene = class VistaScene extends Phaser.Scene {
  constructor() { super('VistaScene'); }

  create(data) {
    data = data || {};
    this.kind = data.kind || 'wave';
    this.from = data.from || null;
    this.card = data.card || null;

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.cameras.main.setBackgroundColor('#101c38');

    if (this.kind === 'wave') this.buildWave();
    else if (this.kind === 'sea') this.buildSea();
    else this.buildGalaxy();

    /* 아래 안내와 버튼 */
    this.caption = this.add.text(W / 2, 86, this.captionText || '',
      UI.style(19, PAL.cream, { align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 6 }))
      .setOrigin(0.5).setDepth(200).setAlpha(0);
    this.tweens.add({ targets: this.caption, alpha: 0.95, duration: 1200, delay: 600 });

    const barY = H - 92;
    const bar = this.add.graphics().setDepth(199);
    bar.fillStyle(0x0d1524, 0.45); bar.fillRoundedRect(14, barY - 44, W - 28, 88, 22);

    UI.button(this, W / 2 - 84, barY, 150, 58, '사진 찍기', () => this.photo(), { size: FONT.small, fill: PAL.sun })
      .setDepth(200);
    UI.button(this, W / 2 + 84, barY, 150, 58, '돌아가기', () => this.close(), { size: FONT.small })
      .setDepth(200);

    UI.fadeIn(this, 900);
    AudioSystem.wave();

    if (this.card) {
      this.time.delayedCall(2600, () => {
        Collection.award(this, this.card);
      });
    }
  }

  /* ── 파도 앞에 선 사람 ─────────────────────
     카메라는 사람 뒤에 있고, 그 앞으로 파도가 들어왔다 나갑니다. */
  buildWave() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.captionText = '파도가 발끝까지 왔다가 돌아간다.\n차갑지 않다. 꿈이라서 그런가.';

    /* 하늘과 수평선 */
    const SEA_TOP = 250;
    this.add.image(W / 2, 0, 'sky_night').setOrigin(0.5, 0).setDisplaySize(W, SEA_TOP + 8).setDepth(-12);
    for (let i = 0; i < 30; i++) {
      const s = this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(20, SEA_TOP - 40), 'dot')
        .setDepth(-11).setScale(Phaser.Math.FloatBetween(0.14, 0.36))
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.75));
      this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(1800, 3400), yoyo: true, repeat: -1 });
    }
    const dawn = this.add.image(W / 2, SEA_TOP, 'lamp_glow').setDepth(-11)
      .setDisplaySize(W * 1.7, 180).setTint(0xffc79a).setAlpha(0.5);
    this.tweens.add({ targets: dawn, alpha: 0.72, duration: 5000, yoyo: true, repeat: -1 });

    /* 바다와 젖은 모래 */
    const SAND_TOP = 470;
    const g = this.add.graphics().setDepth(-10);
    g.fillStyle(0x1d3a58, 1); g.fillRect(0, SEA_TOP, W, SAND_TOP - SEA_TOP);
    g.fillStyle(0xe6c9a6, 0.22); g.fillRect(0, SEA_TOP, W, 10);
    g.fillStyle(0x2f6b8f, 0.45); g.fillRect(0, SEA_TOP + 18, W, 40);
    g.fillStyle(0xa9b8ca, 1); g.fillRect(0, SAND_TOP, W, H - SAND_TOP);
    g.fillStyle(0x93a4ba, 0.75); g.fillRect(0, SAND_TOP, W, 26);
    for (let i = 0; i < 300; i++) {
      g.fillStyle(i % 3 === 0 ? 0xffffff : 0x7d8ea4, 0.16);
      g.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(SAND_TOP + 18, H - 4),
        Phaser.Math.FloatBetween(0.8, 2.1));
    }

    /* 먼 바다의 잔물결 */
    for (let i = 0; i < 7; i++) {
      const y = SEA_TOP + 30 + i * 26;
      const f = this.add.image(Phaser.Math.Between(40, W - 40), y, 'seafoam')
        .setDisplaySize(Phaser.Math.Between(90, 220), 8)
        .setAlpha(0.12 + i * 0.03).setDepth(-9);
      this.tweens.add({
        targets: f, x: f.x + Phaser.Math.Between(-40, 40), alpha: 0.05,
        duration: Phaser.Math.Between(3000, 5200), yoyo: true, repeat: -1, delay: i * 240
      });
    }

    this.add.image(64, 668, 'shell').setScale(1.4).setDepth(4).setRotation(-0.3);
    this.add.image(326, 690, 'shell').setScale(1.2).setDepth(4).setRotation(0.5);

    /* 뒤에서 바라본 나 — 온몸이 다 보입니다 */
    const feetY = 626;
    this.meShadow = this.add.image(W / 2, feetY + 6, 'shadow').setDepth(28).setAlpha(0.42).setScale(1.5);
    this.me = this.add.image(W / 2, feetY, 'player_back').setOrigin(0.5, 0.94)
      .setDepth(30).setScale(2.6);
    this.tweens.add({ targets: this.me, y: feetY - 5, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    /* 밀려왔다 밀려가는 물 — 사람 앞을 지나갑니다 */
    const water = this.add.graphics().setDepth(40);
    this.waterY = H + 40;
    this.drawWater = (y) => {
      water.clear();
      if (y > H) return;
      water.fillStyle(0x6f93b4, 0.5);
      water.fillRect(0, y, W, H - y + 20);
      water.fillStyle(0x9fc0d8, 0.45);
      water.fillRect(0, y, W, 18);
      water.fillStyle(0xffffff, 0.7);
      for (let i = 0; i < 32; i++) {
        const x = (i * 18 + (y * 0.6) % 36);
        water.fillCircle(x, y + Math.sin(i * 1.7 + y * 0.05) * 5, Phaser.Math.FloatBetween(3, 7));
      }
      water.fillStyle(0xffffff, 0.32);
      water.fillRect(0, y - 4, W, 5);
      water.fillStyle(0xffffff, 0.14);
      for (let k = 1; k < 5; k++) {
        const ly = y + k * 30 + Math.sin(k + y * 0.03) * 6;
        if (ly > H) break;
        water.fillRect(20 + k * 14, ly, W - 60 - k * 20, 2);
      }
    };
    this.drawWater(this.waterY);

    /* 발목까지 왔다가 다시 물러갑니다 */
    this.tweens.add({
      targets: this, waterY: feetY - 10, duration: 3200, ease: 'Sine.easeInOut',
      yoyo: true, repeat: -1, hold: 700, repeatDelay: 1100,
      onUpdate: () => this.drawWater(this.waterY),
      onYoyo: () => AudioSystem.wave(),
      onRepeat: () => AudioSystem.wave()
    });

    /* 만지면 물결이 퍼집니다 */
    this.input.on('pointerdown', (p) => {
      if (p.y < SEA_TOP || p.y > GAME.HEIGHT - 150) return;
      const ring = this.add.circle(p.x, p.y, 6).setStrokeStyle(2, 0xffffff, 0.8).setDepth(45);
      this.tweens.add({
        targets: ring, radius: 54, alpha: 0, duration: 900,
        onUpdate: () => ring.setRadius(ring.radius),
        onComplete: () => ring.destroy()
      });
    });
  }

  /* ── 바위에 앉아 바라보는 넓은 바다 ─────── */
  buildSea() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.captionText = '바다가 넓게 열린다.\n저 배는 밤새 어디에 있었을까.';

    const seaTop = H * 0.40;
    this.add.image(W / 2, 0, 'sky_night').setOrigin(0.5, 0).setDisplaySize(W, seaTop + 6).setDepth(-10);
    const dawn = this.add.image(W / 2, seaTop, 'lamp_glow').setDepth(-9)
      .setDisplaySize(W * 1.8, 220).setTint(0xffc79a).setAlpha(0.5);
    this.tweens.add({ targets: dawn, alpha: 0.75, duration: 5000, yoyo: true, repeat: -1 });

    const g = this.add.graphics().setDepth(-8);
    g.fillStyle(0x1d3a58, 1); g.fillRect(0, seaTop, W, H - seaTop);
    g.fillStyle(0xe6c9a6, 0.25); g.fillRect(0, seaTop, W, 10);

    /* 천천히 흐르는 물결 */
    for (let i = 0; i < 9; i++) {
      const y = seaTop + 26 + i * 34;
      const f = this.add.image(Phaser.Math.Between(40, W - 40), y, 'seafoam')
        .setDisplaySize(Phaser.Math.Between(90, 240), 9)
        .setAlpha(0.14 + i * 0.03).setDepth(-7);
      this.tweens.add({
        targets: f, x: f.x + Phaser.Math.Between(-40, 40), alpha: 0.06,
        duration: Phaser.Math.Between(3000, 5200), yoyo: true, repeat: -1, delay: i * 220
      });
    }

    /* 수평선에 닿은 빛의 띠 */
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0xf0b98d, 0.10 - i * 0.015);
      g.fillRect(0, seaTop + 10 + i * 9, W, 5);
    }

    /* 어선 두 척 */
    [{ x: 84, y: seaTop + 58, s: 0.8, d: 44000 }, { x: W - 76, y: seaTop + 132, s: 1.15, d: 58000 }]
      .forEach((b) => {
        const boat = this.add.image(b.x, b.y, 'boat').setScale(b.s).setDepth(5);
        const light = this.add.circle(b.x, b.y - 18 * b.s, 3, 0xfff1cf).setDepth(6);
        this.tweens.add({ targets: [boat, light], y: '+=3', duration: 1800, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: light, alpha: 0.3, duration: 1400, yoyo: true, repeat: -1 });
        this.tweens.add({
          targets: [boat, light], x: b.s < 1 ? W + 90 : -90, duration: b.d, repeat: -1, ease: 'Linear'
        });
      });

    /* 갈매기 */
    for (let i = 0; i < 5; i++) this.gull(i * 2600);

    /* 앞쪽 바위와 앉아 있는 두 사람 */
    const rockY = H - 214;
    const r = this.add.graphics().setDepth(40);
    r.fillStyle(0x4a5468, 1);
    r.fillEllipse(W / 2, rockY + 116, W + 120, 260);
    r.fillStyle(0x59647a, 1);
    r.fillEllipse(W / 2 - 46, rockY + 74, 240, 96);
    r.fillStyle(0x3f4a5c, 1);
    r.fillEllipse(W / 2 + 120, rockY + 96, 150, 70);

    this.add.image(W / 2 - 34, rockY + 6, 'player_back').setScale(1.25).setDepth(41);
    this.add.image(W / 2 + 32, rockY + 8, 'carlo_back').setScale(1.25).setDepth(41);
  }

  gull(delay) {
    const W = GAME.WIDTH;
    const y = Phaser.Math.Between(120, 300);
    const g = this.add.graphics().setDepth(30);
    const draw = (flap) => {
      g.clear();
      g.lineStyle(2.6, 0xffffff, 0.9);
      g.beginPath();
      g.moveTo(-15, 0); g.lineTo(0, flap ? -7 : 4); g.lineTo(15, 0);
      g.strokePath();
      g.lineStyle(2, 0xffffff, 0.5);
      g.beginPath();
      g.moveTo(-9, 1); g.lineTo(0, flap ? -3 : 3); g.lineTo(9, 1);
      g.strokePath();
    };
    draw(true);
    g.setPosition(-30, y);
    let flap = true;
    const timer = this.time.addEvent({
      delay: 260, loop: true, callback: () => { flap = !flap; draw(flap); }
    });
    this.tweens.add({
      targets: g, x: W + 40, y: y + Phaser.Math.Between(-50, 50),
      duration: Phaser.Math.Between(9000, 15000), delay: delay, repeat: -1,
      onRepeat: () => { g.x = -30; g.y = Phaser.Math.Between(120, 300); }
    });
    this.events.once('shutdown', () => timer.remove());
  }

  /* ── 은하수 ───────────────────────────────── */
  buildGalaxy() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.captionText = '하늘이 열린다.\n별이 이렇게 많았구나.';

    const bg = this.add.graphics().setDepth(-20);
    bg.fillStyle(0x070d1e, 1); bg.fillRect(0, 0, W, H);

    /* 은하수 띠 — 부드럽게 번지는 빛구름 */
    const angle = -0.62;
    const cx = W / 2, cy = H * 0.42;
    const tints = [0x8f9fd6, 0xb9a9d8, 0xffe0bd, 0x9fd0e0];
    for (let i = -5; i <= 5; i++) {
      const px = cx + Math.cos(angle) * i * 105;
      const py = cy + Math.sin(angle) * i * 105;
      const n = this.add.image(px, py, 'nebula').setDepth(-18)
        .setDisplaySize(Phaser.Math.Between(280, 430), Phaser.Math.Between(130, 230))
        .setRotation(angle + Phaser.Math.FloatBetween(-0.15, 0.15))
        .setTint(tints[(i + 5) % tints.length])
        .setAlpha(Phaser.Math.FloatBetween(0.3, 0.52))
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: n, alpha: n.alpha * 0.6, duration: Phaser.Math.Between(4000, 7000),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000)
      });
    }

    /* 별 — 한 장의 그림으로 만들어 두어 가볍게 */
    TextureFactory.make(this, 'starfield', W, H, (g) => {
      for (let i = 0; i < 620; i++) {
        const x = Phaser.Math.Between(0, W), y = Phaser.Math.Between(0, H);
        const d = Math.abs((y - H * 0.42) + (x - W / 2) * 0.72) / 260;
        const dense = Math.max(0, 1 - d);
        if (Math.random() > 0.25 + dense * 0.7) continue;
        const a = Phaser.Math.FloatBetween(0.25, 0.95) * (0.45 + dense * 0.55);
        const c = Math.random() < 0.12 ? 0xffe6c4 : (Math.random() < 0.12 ? 0xc9d8ff : 0xffffff);
        g.fillStyle(c, a);
        g.fillCircle(x, y, Phaser.Math.FloatBetween(0.6, 1.9));
      }
    });
    this.add.image(W / 2, H / 2, 'starfield').setDepth(-17);

    /* 은하수 한가운데의 밝은 심장 */
    [[-1.4, 0xffe0bd], [0.9, 0x9fd0e0]].forEach((c) => {
      const px = cx + Math.cos(angle) * c[0] * 150;
      const py = cy + Math.sin(angle) * c[0] * 150;
      const core = this.add.image(px, py, 'nebula').setDepth(-17)
        .setDisplaySize(210, 130).setRotation(angle).setTint(c[1]).setAlpha(0.5)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: core, alpha: 0.28, duration: 5200, yoyo: true, repeat: -1 });
    });

    /* 크게 반짝이는 별 몇 개 */
    for (let i = 0; i < 34; i++) {
      const s = this.add.image(Phaser.Math.Between(10, W - 10), Phaser.Math.Between(10, H * 0.78), 'spark')
        .setScale(Phaser.Math.FloatBetween(0.4, 1.0))
        .setAlpha(Phaser.Math.FloatBetween(0.4, 0.95)).setDepth(-16);
      this.tweens.add({
        targets: s, alpha: 0.12, duration: Phaser.Math.Between(1400, 3400),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2200)
      });
    }

    /* 이따금 지나가는 별똥별 */
    this.time.addEvent({
      delay: 5200, loop: true, callback: () => {
        const x = Phaser.Math.Between(40, W - 40), y = Phaser.Math.Between(40, H * 0.5);
        const g = this.add.graphics().setDepth(-15);
        g.lineStyle(2, 0xffffff, 0.9);
        g.lineBetween(0, 0, -60, 34);
        g.setPosition(x, y);
        this.tweens.add({
          targets: g, x: x - 190, y: y + 108, alpha: 0, duration: 900, ease: 'Sine.easeIn',
          onComplete: () => g.destroy()
        });
      }
    });

    /* 아래쪽 땅과 올려다보는 두 사람 */
    const groundY = H - 214;
    const gr = this.add.graphics().setDepth(40);
    gr.fillStyle(0x121a2e, 1);
    gr.fillEllipse(W / 2, groundY + 150, W + 140, 280);
    this.add.image(W / 2 - 30, groundY + 4, 'player_back').setScale(1.2).setDepth(41).setTint(0x9aa8c4);
    this.add.image(W / 2 + 32, groundY + 6, 'carlo_back').setScale(1.2).setDepth(41).setTint(0x9aa8c4);
  }

  photo() {
    /* 여기서는 화면 전체가 그대로 한 장이 됩니다 */
    this.scene.launch('PhotoMode', {
      from: 'VistaScene', place: this.placeName(), full: true
    });
    this.scene.pause();
  }

  placeName() { return '꿈 속 바닷가'; }

  close() {
    const from = this.from;
    UI.fadeOut(this, 500, () => {
      this.scene.stop();
      if (from) this.scene.resume(from);
    });
  }
};
