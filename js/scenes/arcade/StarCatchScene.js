/* DAY 1 후반 · 별빛 모으기 — 가롤로의 하루가 끝난 밤, 창밖의 하늘에서.
   손가락(또는 ←→)으로 등불을 옮겨 떨어지는 별빛을 받습니다.
   금빛 별 +10, 길게 꼬리를 끄는 유성 +30, 회색 ‘걱정 구름’은 피하기.
   40초 동안 — 시간이 갈수록 빨라집니다. */

window.StarCatchScene = class StarCatchScene extends MiniGameScene {
  constructor() { super('StarCatchScene'); }

  create(data) {
    data = data || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.buildFrame({ from: data.from, title: '별빛 모으기', hint: '', bg: '#0c1530', warm: false });

    this.add.image(W / 2, H / 2, 'sky_night').setDisplaySize(W, H).setDepth(-90);
    for (let i = 0; i < 60; i++) {
      const s = this.add.image(Math.random() * W, Math.random() * H * 0.75, 'dot').setDepth(-80)
        .setScale(0.1 + Math.random() * 0.25).setAlpha(0.3 + Math.random() * 0.6);
      this.tweens.add({ targets: s, alpha: 0.1, duration: 1200 + Math.random() * 2400, yoyo: true, repeat: -1, delay: Math.random() * 2000 });
    }
    /* 지붕 실루엣과 창틀 */
    const g = this.add.graphics().setDepth(-70);
    g.fillStyle(0x0a1022, 1);
    g.fillRect(0, H - 120, W, 120);
    for (let x = -10; x < W; x += 70) { g.fillTriangle(x, H - 120, x + 35, H - 150, x + 70, H - 120); }

    /* 등불 — 받는 그릇 */
    this.lampX = W / 2;
    this.lampY = H - 180;
    this.glow = this.add.image(this.lampX, this.lampY, 'lamp_glow').setDisplaySize(170, 120).setTint(0xffd79a)
      .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.55).setDepth(10);
    this.lamp = this.add.container(this.lampX, this.lampY).setDepth(12);
    const lg = this.add.graphics();
    lg.fillStyle(0x3d2c20, 1); lg.fillRoundedRect(-30, 6, 60, 10, 4);
    lg.fillStyle(0xf6d79a, 0.95); lg.fillRoundedRect(-24, -18, 48, 26, 10);
    lg.fillStyle(0xfff4d6, 1); lg.fillEllipse(0, -6, 26, 14);
    lg.lineStyle(2, 0x8a6340, 1); lg.strokeRoundedRect(-24, -18, 48, 26, 10);
    lg.lineStyle(2, 0x8a6340, 1); lg.beginPath(); lg.arc(0, -18, 16, Math.PI, 0); lg.strokePath();
    this.lamp.add(lg);
    this.add.image(this.lampX, H - 92, 'carlo_back').setScale(1.5).setDepth(11).setName('holder');

    this.items = [];
    this.running = false;
    this.elapsed = 0;

    /* 손가락이 닿은 가로 위치로 등불이 따라갑니다 */
    this.targetX = this.lampX;
    this.input.on('pointerdown', (p) => { if (this.running) this.targetX = p.x; });
    this.input.on('pointermove', (p) => { if (this.running && p.isDown) this.targetX = p.x; });
    this.keys = this.input.keyboard ? this.input.keyboard.createCursorKeys() : null;

    const intro = data.intro || '가롤로: “오늘 하늘 봐. 별이 쏟아지는 것 같아. 우리 하나씩 받아 볼까?”';
    GameFX.intro(this, {
      key: this.scene.key, badge: 'DAY 1 · 밤', title: '별빛 모으기', sub: intro,
      how: ['화면을 누른 채 좌우로 움직여 등불을 옮겨요', '금빛 별 +10, 유성 +30', '회색 걱정 구름은 피하세요 — 연속이 끊겨요', '40초 동안, 점점 빨라집니다'],
      onStart: () => this.begin()
    });
  }

  begin() {
    this.hud = GameFX.hud(this, { time: 40 });
    this.running = true;
    this.spawnT = 0;
  }

  spawn() {
    const W = GAME.WIDTH;
    const r = Math.random();
    const fast = Math.min(1, this.elapsed / 35);
    let kind = 'star';
    if (r < 0.2 + fast * 0.12) kind = 'cloud';
    else if (r > 0.9) kind = 'comet';
    const x = 30 + Math.random() * (W - 60);
    let obj;
    if (kind === 'cloud') {
      obj = this.add.container(x, 120);
      const c = this.add.graphics();
      c.fillStyle(0x6f7a8c, 0.95); c.fillEllipse(0, 0, 54, 26); c.fillEllipse(-14, -8, 28, 22); c.fillEllipse(12, -10, 30, 24);
      c.fillStyle(0x4f5868, 1); c.fillEllipse(0, 6, 46, 10);
      obj.add(c);
      obj.add(this.add.text(0, 0, '…', UI.style(14, '#2b3140', { shadow: false })).setOrigin(0.5));
      obj.vy = 140 + fast * 120 + Math.random() * 40;
    } else if (kind === 'comet') {
      obj = this.add.container(x, 110);
      const tail = this.add.image(0, -26, 'lamp_glow').setDisplaySize(16, 70).setTint(0xbfe1ff).setBlendMode(Phaser.BlendModes.ADD);
      const head = this.add.image(0, 0, 'star_bright').setScale(1.3).setTint(0xdff1ff);
      obj.add([tail, head]);
      obj.vy = 330 + fast * 160;
    } else {
      obj = this.add.image(x, 110, 'star_bright').setScale(1.1 + Math.random() * 0.4).setTint(0xffe7a0);
      this.tweens.add({ targets: obj, angle: 360, duration: 2400, repeat: -1 });
      obj.vy = 170 + fast * 150 + Math.random() * 60;
    }
    obj.kind = kind;
    obj.setDepth(8);
    obj.vx = (Math.random() - 0.5) * 30;
    this.items.push(obj);
  }

  update(time, delta) {
    if (!this.running) return;
    const W = GAME.WIDTH;
    const dt = Math.min(delta, 50);
    this.elapsed += dt / 1000;

    /* 등불 움직임 — 손가락을 부드럽게 따라갑니다 */
    if (this.keys) {
      if (this.keys.left.isDown) this.targetX -= 0.55 * dt;
      if (this.keys.right.isDown) this.targetX += 0.55 * dt;
    }
    this.targetX = Phaser.Math.Clamp(this.targetX, 36, W - 36);
    this.lampX += (this.targetX - this.lampX) * (1 - Math.exp(-dt / 55));
    this.lamp.x = this.lampX; this.glow.x = this.lampX;
    const holder = this.children.getByName('holder');
    if (holder) holder.x = this.lampX;

    /* 새 별 */
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this.spawn();
      this.spawnT = Math.max(260, 720 - this.elapsed * 12) * (0.7 + Math.random() * 0.6);
    }

    /* 떨어지기와 받기 */
    for (let i = this.items.length - 1; i >= 0; i--) {
      const o = this.items[i];
      o.y += o.vy * dt / 1000;
      o.x = Phaser.Math.Clamp(o.x + o.vx * dt / 1000, 20, W - 20);
      const caught = Math.abs(o.y - (this.lampY - 6)) < 22 && Math.abs(o.x - this.lampX) < 40;
      if (caught) {
        if (o.kind === 'cloud') {
          this.hud.miss(this.lampX, this.lampY - 40);
          GameFX.flash(this, 0x4f5868);
          this.tweens.add({ targets: this.glow, alpha: 0.15, duration: 120, yoyo: true });
        } else {
          this.hud.hit(o.kind === 'comet' ? 30 : 10, this.lampX, this.lampY - 30, o.kind === 'comet' ? '유성!' : '');
          this.tweens.add({ targets: this.lamp, scaleX: 1.15, scaleY: 0.9, duration: 70, yoyo: true });
          this.tweens.add({ targets: this.glow, alpha: 0.9, duration: 90, yoyo: true });
        }
        o.destroy(); this.items.splice(i, 1);
        continue;
      }
      if (o.y > GAME.HEIGHT - 110) {
        if (o.kind !== 'cloud') { this.hud.combo = 0; }
        this.tweens.add({ targets: o, alpha: 0, duration: 200, onComplete: () => o.destroy() });
        this.items.splice(i, 1);
      }
    }

    if (this.hud.tick(dt)) this.end();
  }

  end() {
    this.running = false;
    this.items.forEach(o => o.destroy());
    this.items = [];
    const s = this.hud.score;
    this.finishGame({
      title: '별이 가득해요!', score: s, stars: s >= 520 ? 3 : s >= 280 ? 2 : 1,
      detail: '최대 ' + this.hud.maxCombo + ' 연속',
      line: '“별은 하늘에서 떨어지는 게 아니라, 원래 거기 있었던 거야.”'
    });
  }
};
