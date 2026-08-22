/* 미니게임 · 한 시간의 게임 — 2000년대 초 오락실과 PC방을 채우던
   각도와 힘으로 포탄을 쏘는 그 게임처럼. 시간 제한도, 지는 것도 없습니다.
   가롤로는 게임을 좋아했지만 일주일에 한 시간만 했습니다.

   과녁 두 개를 맞히면 이야기는 이어질 수 있지만, 더 하고 싶으면
   원하는 만큼 더 할 수 있습니다. 난이도도 그때마다 고를 수 있습니다.
   그만두는 것은 언제나 플레이어가 정합니다 — 가롤로가 그랬던 것처럼. */

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

    /* 난이도 — 바람, 과녁까지의 거리, 맞았다고 볼 범위, 그리고 전봇대 */
    this.LEVELS = {
      easy:   { name: '쉽게',   wind: 18, near: 196, far: 264, reach: 36, pole: false },
      normal: { name: '보통',   wind: 46, near: 232, far: 316, reach: 26, pole: false },
      hard:   { name: '어렵게', wind: 82, near: 268, far: 340, reach: 20, pole: true }
    };
    this.level = 'normal';

    this.angle = 45;
    this.power = 0;
    this.charging = false;
    this.flying = false;
    this.round = 0;
    this.hits = 0;
    this.shots = 0;
    this.roundShots = 0;
    this.needHits = 2;
    this.freeMode = false;      // 이야기에 필요한 두 판을 마친 뒤
    this.freeHits = 0;
    this.locked = false;        // 판이 넘어가는 사이에는 쏠 수 없습니다

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

    /* 가롤로의 참견 — 화면 아래 여백에 */
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
    this.panelY = panelY;

    const p = this.add.graphics().setDepth(90);
    p.fillStyle(0x000000, 0.18); p.fillRoundedRect(16, panelY - 12, W - 32, 176, 18);
    p.fillStyle(HEX(PAL.paper), 0.97); p.fillRoundedRect(14, panelY - 16, W - 28, 176, 18);
    p.lineStyle(2, HEX(PAL.sun), 0.6); p.strokeRoundedRect(14, panelY - 16, W - 28, 176, 18);

    this.angleText = this.add.text(96, panelY + 20, '', UI.style(20, PAL.ink)).setOrigin(0.5).setDepth(95);
    const angleLabel = this.add.text(96, panelY - 2, '각도', UI.style(14, PAL.inkSoft)).setOrigin(0.5).setDepth(95);

    const minus = UI.circleButton(this, 42, panelY + 20, 24, '−', () => this.nudge(-3), { size: 22 }).setDepth(95);
    const plus = UI.circleButton(this, 150, panelY + 20, 24, '+', () => this.nudge(3), { size: 20 }).setDepth(95);

    /* 힘 게이지 */
    const powerLabel = this.add.text(272, panelY - 2, '힘', UI.style(14, PAL.inkSoft)).setOrigin(0.5).setDepth(95);
    const gb = this.add.graphics().setDepth(94);
    gb.fillStyle(HEX('#d8cdb8'), 1); gb.fillRoundedRect(196, panelY + 8, 152, 24, 12);
    this.powerBar = this.add.graphics().setDepth(95);

    /* 발사 — 누르고 있으면 힘이 차오릅니다 */
    this.fireBtn = UI.button(this, W / 2, panelY + 104, 236, 62, '발 사', null, { size: 20, fill: PAL.sun });
    this.fireBtn.setDepth(95);
    this.fireBtn.on('pointerdown', () => this.startCharge());
    this.fireBtn.on('pointerup', () => this.release());
    this.fireBtn.on('pointerout', () => this.release());

    /* 이어하기 판이 뜰 때 잠시 물러나는 것들 */
    this.controls = [this.angleText, angleLabel, minus, plus, powerLabel, gb, this.powerBar, this.fireBtn];
    this.againGroup = this.add.container(0, 0).setDepth(96);

    this.updateAngleText();
    this.drawPower();
  }

  /* ── 한 판 더 할까? ─────────────────────────── */
  showAgain() {
    const W = GAME.WIDTH, panelY = this.panelY;
    this.controls.forEach(o => o.setVisible(false));
    this.againGroup.removeAll(true);

    const title = this.add.text(W / 2, panelY + 2,
      this.freeHits === 0 ? '한 판 더 할까?' : '더 할래?', UI.style(FONT.body, PAL.ink)).setOrigin(0.5);
    this.againGroup.add(title);

    const keys = ['easy', 'normal', 'hard'];
    keys.forEach((key, i) => {
      const L = this.LEVELS[key];
      const on = key === this.level;
      const b = UI.button(this, 75 + i * 120, panelY + 52, 110, 56, L.name,
        () => this.pickLevel(key),
        { size: FONT.small, fill: on ? PAL.sun : PAL.paper, strokeAlpha: on ? 0.95 : 0.5 });
      this.againGroup.add(b);
    });

    const stop = UI.button(this, W / 2, panelY + 122, 236, 56, '이제 그만',
      () => this.done(), { size: FONT.label, fill: PAL.cream });
    this.againGroup.add(stop);

    this.setHint('원하는 만큼 더 해도 됩니다.');
  }

  hideAgain() {
    this.againGroup.removeAll(true);
    this.controls.forEach(o => o.setVisible(true));
  }

  pickLevel(key) {
    this.level = key;
    this.freeMode = true;
    this.hideAgain();
    if (this.LEVELS[key].pole) this.setHint('전봇대를 넘겨야 합니다. 각도를 높여 보세요.');
    else this.setHint('누른 채 힘을 모았다가, 손을 떼면 발사!');
    this.newRound();
  }

  /* 이야기에 필요한 두 판이 끝난 자리 */
  enterFree() {
    this.freeMode = true;
    this.freeHits = 0;
    this.showAgain();
  }

  /* ── 전봇대 ─────────────────────────────────── */
  buildPole() {
    this.clearPole();
    if (!this.LEVELS[this.level].pole) return;
    const x = 196, top = 392;
    const groundY = this.hAt(x);
    const g = this.add.graphics().setDepth(18);
    g.fillStyle(HEX('#8a6340'), 1); g.fillRect(x - 6, top, 12, groundY - top + 8);
    g.fillStyle(HEX('#6f5b49'), 1);
    g.fillRect(x - 17, top + 16, 34, 5);
    g.fillRect(x - 13, top + 34, 26, 4);
    g.fillStyle(HEX('#9d7a56'), 1); g.fillRect(x - 6, top, 4, groundY - top + 8);
    g.setMask(this.playMask);
    this.pole = { g: g, x: x, top: top, halfW: 9 };
  }

  clearPole() {
    if (this.pole) { this.pole.g.destroy(); this.pole = null; }
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
    if (this.flying || this.finished || this.locked) return;
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
    const L = this.LEVELS[this.level];
    /* 앞 판의 포탄이 아직 날고 있다면 거두어들입니다 */
    if (this.shell) { this.shell.destroy(); this.shell = null; }
    this.flying = false;
    this.locked = false;
    this.round++;
    this.roundShots = 0;
    this.wind = Phaser.Math.FloatBetween(-L.wind, L.wind);
    this.drawWind();
    this.buildPole();

    const tx = Phaser.Math.Between(L.near, L.far);
    this.targetX = tx;
    this.targetY = this.hAt(tx);
    if (this.target) this.target.destroy();
    this.target = this.add.image(tx, this.targetY + 4, 'target_box')
      .setOrigin(0.5, 1).setDepth(22).setScale(this.level === 'easy' ? 1.25 : 1.05);
    this.target.setAlpha(0);
    this.tweens.add({ targets: this.target, alpha: 1, y: this.targetY + 4, duration: 500 });
    this.tweens.add({ targets: this.target, angle: 3, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.updateScore();
    if (this.freeMode) this.say(L.pole ? '전봇대 넘겨야 돼. 각도!' : '가자, 한 판 더.');
    else this.say(this.round === 1 ? '바람 잘 봐. 그게 반이야.' : '한 번 더. 이번엔 바람이 반대야.');
  }

  updateScore() {
    this.scoreText.setText(this.freeMode
      ? '맞힌 과녁 ' + this.hits + '개'
      : '맞힌 과녁 ' + this.hits + ' / ' + this.needHits);
  }

  drawWind() {
    const cx = 96;
    this.windBar.clear();
    this.windBar.fillStyle(0xffffff, 0.55);
    this.windBar.fillRoundedRect(cx - 42, this.PLAY_TOP + 4, 84, 18, 9);
    const len = Phaser.Math.Clamp(Math.abs(this.wind) / this.LEVELS[this.level].wind, 0.1, 1) * 34;
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

    /* 과녁에 닿았는지 — 그 판에서 여러 번 빗나가면 조금 너그러워집니다 */
    const reach = this.LEVELS[this.level].reach + Math.min(18, Math.max(0, this.roundShots - 3) * 4);
    if (this.target && this.target.active &&
        Phaser.Math.Distance.Between(this.shell.x, this.shell.y, this.targetX, this.targetY - 20) < reach) {
      this.hitTarget();
      return;
    }

    /* 전봇대 */
    if (this.pole && Math.abs(this.shell.x - this.pole.x) < this.pole.halfW && this.shell.y > this.pole.top) {
      this.missed('전봇대에 맞았다. 더 높이 쏴 봐.');
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

  missed(reason) {
    const x = this.shell.x, y = Math.min(this.shell.y, this.hAt(this.shell.x));
    this.shell.destroy(); this.shell = null;
    this.flying = false;
    this.roundShots++;
    this.boomAt(x, y, false);

    if (reason) this.say(reason);
    else {
      const near = Math.abs(x - this.targetX);
      if (near < 40) this.say('아 아깝다ㅋㅋ 조금만 더.');
      else if (x < this.targetX) this.say('짧았어. 힘을 조금 더.');
      else this.say('넘어갔어. 힘을 조금 줄여봐.');
    }

    if (this.roundShots >= 5 && !this.freeMode && this.hits === 0) {
      this.setHint('잘 안 맞아도 괜찮아요. 지는 건 없어요.');
    }
  }

  hitTarget() {
    this.shell.destroy(); this.shell = null;
    this.flying = false;
    this.locked = true;
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

    if (this.freeMode) this.freeHits++;
    this.updateScore();

    if (this.freeMode) {
      this.say(this.nudgeLine());
      this.time.delayedCall(1200, () => { this.clearPole(); this.showAgain(); });
    } else if (this.hits >= this.needHits) {
      this.say('오, 잘하는데?');
      this.time.delayedCall(1200, () => this.enterFree());
    } else {
      this.say('나이스! 한 판 더.');
      this.time.delayedCall(1200, () => this.newRound());
    }
  }

  /* 계속할수록 가롤로가 슬며시 건네는 말 — 다그치지는 않습니다 */
  nudgeLine() {
    const lines = [
      '나이스!',
      '오, 늘었는데?',
      '재밌지? 나도 그랬어.',
      '…슬슬 한 시간 다 돼 가는데.',
      '난 이쯤에서 껐어.',
      'ㅋㅋ 알았어. 하고 싶은 만큼 해.'
    ];
    return lines[Phaser.Math.Clamp(this.freeHits - 1, 0, lines.length - 1)];
  }

  /* 과녁 두 개를 이미 넘겼다면, 닫기 버튼도 곱게 끝내줍니다 */
  giveUp() {
    if (this.finished) return;
    if (this.hits >= this.needHits) { this.done(); return; }
    super.giveUp();
  }

  done() {
    if (this.finished) return;
    this.locked = true;
    if (this.shell) { this.shell.destroy(); this.shell = null; this.flying = false; }
    this.setHint('');
    this.againGroup.removeAll(true);
    this.controls.forEach(o => o.setVisible(false));
    this.clearPole();
    this.scoreText.setText('');

    const lines = [
      this.hits <= 2 ? '과녁이 두 번 다 넘어갔다.' : '과녁이 ' + this.hits + '번 넘어갔다.',
      '오랜만에 소리 내서 웃었다.'
    ];
    if (this.freeHits >= 3) {
      lines.push({ s: '가롤로', t: '많이 했네ㅋㅋ' });
      lines.push({ s: '나', t: '…너무 재밌어서.' });
      lines.push({ s: '가롤로', t: '알아. 나도 그랬어.' });
    } else {
      lines.push({ s: '가롤로', t: '재밌지?' });
      lines.push({ s: '나', t: '어. 진짜 재밌어.' });
    }
    lines.push({ s: '가롤로', t: '나도 이거 진짜 좋아했어.' });
    lines.push({ s: '가롤로', t: '좋아하니까 아껴서 한 거야.' });
    if (this.freeHits > 0) {
      lines.push({ s: '가롤로', t: '근데 그만두자고 한 건 너였어.' });
      lines.push({ s: '가롤로', t: '그게 제일 어려운 거야.' });
    }
    this.complete(lines);
  }
};
