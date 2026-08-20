/* 미니게임 · 한 시간의 게임 — 2000년대 초 오락실과 PC방을 채우던
   각도와 힘으로 포탄을 쏘는 그 게임처럼. 시간 제한도, 지는 것도 없습니다.
   카를로는 게임을 좋아했지만 일주일에 한 시간만 했습니다. */

window.FortressScene = class FortressScene extends MiniGameScene {
  constructor() { super('FortressScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: 's8', bg: '#22304a',
      title: '한 시간의 게임',
      hint: '누른 채 힘을 모았다가, 손을 떼면 발사!'
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.PLAY_TOP = 150;
    this.PLAY_BOT = 576;
    this.GROUND = 534;

    this.angle = 45;
    this.power = 0;
    this.charging = false;
    this.flying = false;
    this.round = 0;
    this.hits = 0;
    this.shots = 0;
    this.needHits = 2;
    this.trail = [];

    this.buildScreen();
    this.buildTerrain();
    this.buildControls();
    this.newRound();
  }

  /* ── 브라운관 게임 화면 ─────────────────────── */
  buildScreen() {
    const W = GAME.WIDTH;
    const bezel = this.add.graphics().setDepth(-6);
    bezel.fillStyle(HEX('#cfc7b6'), 1);
    bezel.fillRoundedRect(10, this.PLAY_TOP - 18, W - 20, this.PLAY_BOT - this.PLAY_TOP + 36, 16);
    bezel.fillStyle(HEX('#2a3550'), 1);
    bezel.fillRoundedRect(20, this.PLAY_TOP - 8, W - 40, this.PLAY_BOT - this.PLAY_TOP + 16, 10);

    /* 게임 속 하늘 */
    const sky = this.add.graphics().setDepth(-5);
    sky.fillStyle(HEX('#79b3d8'), 1);
    sky.fillRect(24, this.PLAY_TOP - 4, W - 48, this.PLAY_BOT - this.PLAY_TOP + 8);
    sky.fillStyle(HEX('#a9d2e8'), 1);
    sky.fillRect(24, this.PLAY_TOP - 4, W - 48, 90);
    for (let i = 0; i < 4; i++) {
      sky.fillStyle(0xffffff, 0.55);
      const cx = 60 + i * 78, cy = this.PLAY_TOP + 24 + (i % 2) * 34;
      sky.fillEllipse(cx, cy, 54, 20);
      sky.fillEllipse(cx - 14, cy + 4, 32, 15);
    }

    /* 주사선 — 옛날 화면 느낌 */
    const scan = this.add.graphics().setDepth(120);
    scan.fillStyle(0x000000, 0.05);
    for (let y = this.PLAY_TOP - 4; y < this.PLAY_BOT + 4; y += 4) scan.fillRect(24, y, W - 48, 2);

    this.maskShape = this.make.graphics({ add: false });
    this.maskShape.fillRect(24, this.PLAY_TOP - 4, W - 48, this.PLAY_BOT - this.PLAY_TOP + 8);
    this.playMask = this.maskShape.createGeometryMask();

    /* 바람 */
    this.windBar = this.add.graphics().setDepth(122);
    this.windText = this.add.text(W / 2, this.PLAY_TOP + 12, '', UI.style(FONT.small, PAL.ink))
      .setOrigin(0.5).setDepth(123);

    /* 카를로의 참견 — 화면 아래 여백에 */
    this.talk = this.add.text(W / 2, this.PLAY_BOT + 32, '', UI.style(FONT.small, PAL.cream, {
      align: 'center', wordWrap: { width: W - 80 }
    })).setOrigin(0.5).setDepth(130).setAlpha(0);

    this.scoreText = this.add.text(W - 34, this.PLAY_TOP + 12, '', UI.style(FONT.small, PAL.ink))
      .setOrigin(1, 0.5).setDepth(123);
  }

  /* ── 언덕 ───────────────────────────────────── */
  buildTerrain() {
    const W = GAME.WIDTH;
    this.hAt = (x) => this.GROUND
      - 26 * Math.sin(x / 96 + 0.6)
      - 14 * Math.sin(x / 41 + 1.9)
      - 8 * Math.sin(x / 23);

    const g = this.add.graphics().setDepth(-4);
    g.fillStyle(HEX('#6f9457'), 1);
    g.beginPath();
    g.moveTo(24, this.PLAY_BOT + 4);
    for (let x = 24; x <= W - 24; x += 4) g.lineTo(x, this.hAt(x));
    g.lineTo(W - 24, this.PLAY_BOT + 4);
    g.closePath();
    g.fillPath();

    g.fillStyle(HEX('#87ab68'), 1);
    g.beginPath();
    g.moveTo(24, this.PLAY_BOT + 4);
    for (let x = 24; x <= W - 24; x += 4) g.lineTo(x, this.hAt(x) + 8);
    g.lineTo(W - 24, this.PLAY_BOT + 4);
    g.closePath();
    g.fillPath();

    g.fillStyle(HEX('#5b7d47'), 1);
    for (let x = 30; x < W - 30; x += 17) g.fillRect(x, this.hAt(x) + 10, 2, 6);

    this.terrainG = g;
    this.terrainG.setMask(this.playMask);

    /* 내 대포 */
    this.cannonX = 66;
    this.cannon = this.add.image(this.cannonX, this.hAt(this.cannonX) + 4, 'cannon_carlo')
      .setOrigin(0.5, 1).setDepth(20).setScale(1.1);
    this.barrel = this.add.graphics().setDepth(19);
    this.drawBarrel();
  }

  drawBarrel() {
    const bx = this.cannonX + 4;
    const by = this.hAt(this.cannonX) - 14;
    const rad = Phaser.Math.DegToRad(this.angle);
    this.barrel.clear();
    this.barrel.lineStyle(7, HEX('#8f5a44'), 1);
    this.barrel.lineBetween(bx, by, bx + Math.cos(rad) * 30, by - Math.sin(rad) * 30);
    this.barrel.lineStyle(3, HEX('#c9553f'), 1);
    this.barrel.lineBetween(bx, by, bx + Math.cos(rad) * 26, by - Math.sin(rad) * 26);
    this.muzzle = { x: bx + Math.cos(rad) * 32, y: by - Math.sin(rad) * 32 };
  }

  /* ── 조작 ───────────────────────────────────── */
  buildControls() {
    const W = GAME.WIDTH;
    const panelY = 640;

    const p = this.add.graphics().setDepth(90);
    p.fillStyle(0x000000, 0.18); p.fillRoundedRect(16, panelY - 12, W - 32, 176, 18);
    p.fillStyle(HEX(PAL.paper), 0.97); p.fillRoundedRect(14, panelY - 16, W - 28, 176, 18);
    p.lineStyle(2, HEX(PAL.sun), 0.6); p.strokeRoundedRect(14, panelY - 16, W - 28, 176, 18);

    this.angleText = this.add.text(96, panelY + 20, '', UI.style(20, PAL.ink)).setOrigin(0.5).setDepth(95);
    this.add.text(96, panelY - 2, '각도', UI.style(14, PAL.inkSoft)).setOrigin(0.5).setDepth(95);

    UI.circleButton(this, 42, panelY + 20, 24, '−', () => this.nudge(-3), { size: 22 }).setDepth(95);
    UI.circleButton(this, 150, panelY + 20, 24, '+', () => this.nudge(3), { size: 20 }).setDepth(95);

    /* 힘 게이지 */
    this.add.text(272, panelY - 2, '힘', UI.style(14, PAL.inkSoft)).setOrigin(0.5).setDepth(95);
    const gb = this.add.graphics().setDepth(94);
    gb.fillStyle(HEX('#d8cdb8'), 1); gb.fillRoundedRect(196, panelY + 8, 152, 24, 12);
    this.powerBar = this.add.graphics().setDepth(95);

    /* 발사 — 누르고 있으면 힘이 차오릅니다 */
    this.fireBtn = UI.button(this, W / 2, panelY + 104, 236, 62, '발 사', null, { size: 20, fill: PAL.sun });
    this.fireBtn.setDepth(95);
    this.fireBtn.on('pointerdown', () => this.startCharge());
    this.fireBtn.on('pointerup', () => this.release());
    this.fireBtn.on('pointerout', () => this.release());

    this.updateAngleText();
    this.drawPower();
  }

  nudge(d) {
    if (this.flying || this.finished) return;
    this.angle = Phaser.Math.Clamp(this.angle + d, 10, 85);
    this.updateAngleText();
    this.drawBarrel();
  }

  updateAngleText() {
    this.angleText.setText(this.angle + '°');
  }

  drawPower() {
    this.powerBar.clear();
    if (this.power <= 0) return;
    const w = 148 * this.power;
    const color = this.power > 0.86 ? HEX(PAL.clay) : HEX('#e0954a');
    this.powerBar.fillStyle(color, 1);
    this.powerBar.fillRoundedRect(198, 650, Math.max(8, w), 20, 10);
  }

  startCharge() {
    if (this.flying || this.finished) return;
    this.charging = true;
    this.power = 0;
    this._chargeDir = 1;
  }

  release() {
    if (!this.charging) return;
    this.charging = false;
    if (this.power < 0.05) { this.power = 0; this.drawPower(); return; }
    this.fire();
  }

  /* ── 발사 ───────────────────────────────────── */
  fire() {
    this.flying = true;
    this.shots++;
    AudioSystem.boom();

    const rad = Phaser.Math.DegToRad(this.angle);
    const speed = 130 + this.power * 230;
    this.shell = this.add.image(this.muzzle.x, this.muzzle.y, 'shell_ball').setDepth(60).setScale(1.1);
    this.shell.setMask(this.playMask);
    this.vx = Math.cos(rad) * speed;
    this.vy = -Math.sin(rad) * speed;

    /* 포구 연기 */
    for (let i = 0; i < 8; i++) {
      const s = this.add.circle(this.muzzle.x, this.muzzle.y, Phaser.Math.Between(3, 7), 0xffffff, 0.5).setDepth(59);
      this.tweens.add({
        targets: s, x: s.x + Phaser.Math.Between(-24, 24), y: s.y + Phaser.Math.Between(-20, 10),
        alpha: 0, duration: 600, onComplete: () => s.destroy()
      });
    }
    this.power = 0;
    this.drawPower();
  }

  /* ── 한 판 ──────────────────────────────────── */
  newRound() {
    const W = GAME.WIDTH;
    this.round++;
    this.wind = Phaser.Math.FloatBetween(-46, 46);
    this.drawWind();

    const tx = Phaser.Math.Between(232, 332);
    this.targetX = tx;
    this.targetY = this.hAt(tx);
    if (this.target) this.target.destroy();
    this.target = this.add.image(tx, this.targetY + 4, 'target_box')
      .setOrigin(0.5, 1).setDepth(22).setScale(1.05);
    this.target.setAlpha(0);
    this.tweens.add({ targets: this.target, alpha: 1, y: this.targetY + 4, duration: 500 });
    this.tweens.add({ targets: this.target, angle: 3, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.scoreText.setText('맞힌 과녁 ' + this.hits + ' / ' + this.needHits);
    this.say(this.round === 1 ? '바람 잘 봐. 그게 반이야.' : '한 번 더. 이번엔 바람이 반대야.');
  }

  drawWind() {
    const cx = 96;
    this.windBar.clear();
    this.windBar.fillStyle(0xffffff, 0.55);
    this.windBar.fillRoundedRect(cx - 42, this.PLAY_TOP + 4, 84, 18, 9);
    const len = Phaser.Math.Clamp(Math.abs(this.wind) / 46, 0.1, 1) * 34;
    this.windBar.fillStyle(HEX(PAL.clay), 1);
    const dir = this.wind >= 0 ? 1 : -1;
    this.windBar.fillRect(cx, this.PLAY_TOP + 11, len * dir, 4);
    this.windBar.fillTriangle(
      cx + len * dir, this.PLAY_TOP + 7,
      cx + len * dir, this.PLAY_TOP + 17,
      cx + (len + 8) * dir, this.PLAY_TOP + 12
    );
    this.windText.setText('바람 ' + (this.wind >= 0 ? '→ ' : '← ') + Math.round(Math.abs(this.wind)));
    this.windText.setPosition(cx, this.PLAY_TOP + 34);
  }

  say(t) {
    this.talk.setText(t).setAlpha(0);
    this.tweens.add({ targets: this.talk, alpha: 0.95, duration: 400 });
  }

  /* ── 매 프레임 ──────────────────────────────── */
  update(time, delta) {
    const dt = Math.min(delta, 40) / 1000;

    if (this.charging) {
      this.power += this._chargeDir * dt * 0.85;
      if (this.power >= 1) { this.power = 1; this._chargeDir = -1; }
      if (this.power <= 0.06 && this._chargeDir < 0) { this.power = 0.06; this._chargeDir = 1; }
      this.drawPower();
      if (time - (this._blipAt || 0) > 90) { this._blipAt = time; AudioSystem.charge(); }
    }

    if (!this.flying || !this.shell) return;

    this.vy += 300 * dt;
    this.vx += this.wind * dt;
    this.shell.x += this.vx * dt;
    this.shell.y += this.vy * dt;
    this.shell.rotation += dt * 6;

    if (time - (this._trailAt || 0) > 34) {
      this._trailAt = time;
      const d = this.add.circle(this.shell.x, this.shell.y, 2.4, 0xffffff, 0.6).setDepth(58);
      d.setMask(this.playMask);
      this.tweens.add({ targets: d, alpha: 0, scale: 0.4, duration: 900, onComplete: () => d.destroy() });
    }

    /* 과녁에 닿았는지 — 여러 번 빗나가면 조금 너그러워집니다 */
    const reach = 26 + Math.min(18, Math.max(0, this.shots - 3) * 4);
    if (this.target && this.target.active &&
        Phaser.Math.Distance.Between(this.shell.x, this.shell.y, this.targetX, this.targetY - 20) < reach) {
      this.hitTarget();
      return;
    }

    /* 땅이나 화면 밖 */
    const W = GAME.WIDTH;
    if (this.shell.y > this.hAt(this.shell.x) || this.shell.x > W - 22 || this.shell.x < 22 || this.shell.y > this.PLAY_BOT) {
      this.missed();
    }
  }

  boomAt(x, y, big) {
    AudioSystem.boom();
    const n = big ? 16 : 9;
    for (let i = 0; i < n; i++) {
      const c = this.add.circle(x, y, Phaser.Math.Between(4, big ? 14 : 9),
        [0xf2b56b, 0xe0954a, 0xc9553f][i % 3], 0.85).setDepth(70);
      c.setMask(this.playMask);
      this.tweens.add({
        targets: c, x: x + Phaser.Math.Between(-46, 46), y: y + Phaser.Math.Between(-40, 18),
        alpha: 0, scale: 0.3, duration: Phaser.Math.Between(500, 900), onComplete: () => c.destroy()
      });
    }
    this.cameras.main.shake(big ? 260 : 140, big ? 0.006 : 0.003);
  }

  missed() {
    const x = this.shell.x, y = Math.min(this.shell.y, this.hAt(this.shell.x));
    this.shell.destroy(); this.shell = null;
    this.flying = false;
    this.boomAt(x, y, false);

    const near = Math.abs(x - this.targetX);
    if (near < 40) this.say('아 아깝다ㅋㅋ 조금만 더.');
    else if (x < this.targetX) this.say('짧았어. 힘을 조금 더.');
    else this.say('넘어갔어. 힘을 조금 줄여봐.');

    if (this.shots >= 5 && this.hits === 0) {
      this.setHint('잘 안 맞아도 괜찮아요. 지는 건 없어요.');
    }
  }

  hitTarget() {
    this.shell.destroy(); this.shell = null;
    this.flying = false;
    this.hits++;
    this.boomAt(this.targetX, this.targetY - 18, true);
    AudioSystem.found();

    const t = this.target;
    this.target = null;
    this.tweens.killTweensOf(t);
    this.tweens.add({
      targets: t, y: t.y - 40, angle: 220, alpha: 0, duration: 800, ease: 'Sine.easeIn',
      onComplete: () => t.destroy()
    });

    this.scoreText.setText('맞힌 과녁 ' + this.hits + ' / ' + this.needHits);

    if (this.hits >= this.needHits) {
      this.say('오, 잘하는데?');
      this.time.delayedCall(1100, () => this.done());
    } else {
      this.say('나이스! 한 판 더.');
      this.time.delayedCall(1200, () => this.newRound());
    }
  }

  done() {
    this.setHint('');
    if (this.fireBtn) this.fireBtn.setVisible(false);
    this.complete([
      '과녁이 두 번 다 넘어갔다.',
      '오랜만에 소리 내서 웃었다.',
      { s: '카를로', t: '재밌지?' },
      { s: '나', t: '어. 진짜 재밌어.' },
      { s: '카를로', t: '나도 이거 진짜 좋아했어.' },
      { s: '카를로', t: '좋아하니까 아껴서 한 거야.' }
    ]);
  }
};
