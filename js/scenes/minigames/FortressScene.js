/* 미니게임 · 한 시간의 게임 — 2000년대 초 오락실과 PC방을 채우던
   각도와 힘으로 포탄을 쏘는 그 게임처럼. 시간 제한도, 지는 것도 없습니다.
   가롤로는 게임을 좋아했지만 일주일에 한 시간만 했습니다.

   과녁 두 개를 맞히면 이야기는 이어질 수 있지만, 더 하고 싶으면
   원하는 만큼 더 할 수 있습니다. 난이도도 그때마다 고를 수 있습니다.
   그만두는 것은 언제나 플레이어가 정합니다 — 가롤로가 그랬던 것처럼.

   판마다 맵이 바뀝니다 — 언덕, 사막, 설원, 바다 섬, 밤의 성, 달.
   맵마다 땅 모양과 바람, 무게(중력), 장애물, 과녁(서 있는 상자 · 움직이는 상자 · 풍선)이 다릅니다. */

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

    /* 게임 속 하늘 — 맵마다 다시 그립니다(drawMap) */
    this.skyG = this.add.graphics().setDepth(-5);

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
    this.mapText = this.add.text(32, this.PLAY_BOT - 6, '', UI.style(13, '#ffffff', { backgroundColor: '#00000055', padding: { x: 7, y: 2 } }))
      .setOrigin(0, 1).setDepth(123);
  }

  /* ── 맵 ─────────────────────────────────────── */
  mapDefs() {
    const G = this.GROUND;
    const bump = (x, c, w) => Math.abs(x - c) < w ? Math.pow(Math.cos((x - c) / w * Math.PI / 2), 2) : 0;
    return {
      hills: {
        name: '언덕', sky: ['#79b3d8', '#a9d2e8'], ground: ['#6f9457', '#87ab68', '#5b7d47'], wind: 1, grav: 300, deco: 'clouds',
        h: (x) => G - 26 * Math.sin(x / 96 + 0.6) - 14 * Math.sin(x / 41 + 1.9) - 8 * Math.sin(x / 23),
        line: '언덕 맵. 기본이지.'
      },
      desert: {
        name: '사막', sky: ['#e9a868', '#f6d8a8'], ground: ['#c99a5a', '#dcb173', '#b0834a'], wind: 1.15, grav: 300, deco: 'sun',
        h: (x) => G + 6 - 38 * Math.sin(x / 118 + 0.2) - 9 * Math.sin(x / 47 + 1),
        cactus: [150, 330], line: '사막이다. 모래바람 세게 불어.'
      },
      snow: {
        name: '설원', sky: ['#a9bfd8', '#e2ebf4'], ground: ['#dfe8f2', '#ffffff', '#b9c7d6'], wind: 1.4, grav: 300, deco: 'snow',
        h: (x) => G - 18 * Math.sin(x / 70 + 1) - 12 * Math.sin(x / 31) - 20 * bump(x, 200, 70),
        pines: [120, 360], balloon: true, line: '설원! 과녁이 풍선에 매달려 있어.'
      },
      sea: {
        name: '바다 섬', sky: ['#6fbde6', '#bfe4f4'], ground: ['#d6bf86', '#e8d7a2', '#b9a46c'], wind: 1, grav: 300, deco: 'clouds',
        water: G - 2,
        h: (x) => G + 34 - 74 * bump(x, 62, 78) - 78 * bump(x, 292, 96),
        palms: [40, 340], line: '섬이야. 짧으면 바다에 풍덩.'
      },
      castle: {
        name: '밤의 성', sky: ['#18213e', '#33406a'], ground: ['#45533a', '#57674a', '#36402c'], wind: 0.8, grav: 300, deco: 'stars',
        h: (x) => G - 8 * Math.sin(x / 60) - 6 * Math.sin(x / 27 + 2),
        wall: { x: 176, w: 30, hgt: 92 }, line: '성벽 너머야. 높이 쏴.'
      },
      moon: {
        name: '달', sky: ['#05070f', '#141a30'], ground: ['#8e9096', '#a9abb1', '#6f7178'], wind: 0, grav: 150, deco: 'earth',
        h: (x) => G - 12 * Math.sin(x / 50) + 14 * bump(x, 150, 26) + 12 * bump(x, 262, 22) - 10 * bump(x, 320, 40),
        moving: true, line: '달이다! 바람은 없고 둥둥 떠.'
      }
    };
  }

  buildTerrain() {
    this.MAPS = this.mapDefs();
    this.mapOrder = ['hills', 'desert', 'snow', 'sea', 'castle', 'moon'];
    this.terrainG = this.add.graphics().setDepth(-4);
    this.terrainG.setMask(this.playMask);
    this.decoG = this.add.graphics().setDepth(-3);
    this.decoG.setMask(this.playMask);
    this.waterG = this.add.graphics().setDepth(21);
    this.waterG.setMask(this.playMask);

    /* 내 대포 */
    this.cannonX = 66;
    this.cannon = this.add.image(this.cannonX, 0, 'cannon_carlo').setOrigin(0.5, 1).setDepth(20).setScale(1.1);
    this.barrel = this.add.graphics().setDepth(19);
    this.useMap('hills');
  }

  useMap(key) {
    this.mapKey = key;
    this.map = this.MAPS[key];
    this.hAt = this.map.h;
    this.drawMap();
    this.cannon.setY(this.hAt(this.cannonX) + 4);
    this.drawBarrel();
    this.mapText.setText(this.map.name);
    /* 밤하늘·우주에서는 바람과 점수 글씨를 밝게 */
    const dark = this.map.deco === 'stars' || this.map.deco === 'earth';
    [this.windText, this.scoreText].forEach((t) => t.setColor(dark ? '#f4ead2' : PAL.ink));
  }

  /* 맵을 그립니다 — 하늘, 땅, 장식 */
  drawMap() {
    const W = GAME.WIDTH, M = this.map, T = this.PLAY_TOP, B = this.PLAY_BOT;
    const L = 24, R = W - 24;
    const sky = this.skyG; sky.clear();
    /* 위는 짙게, 땅 쪽으로 갈수록 옅게 */
    const c0 = Phaser.Display.Color.HexStringToColor(M.sky[0]), c1 = Phaser.Display.Color.HexStringToColor(M.sky[1]);
    const n = 24, hh = (B - T + 8) / n;
    for (let i = 0; i < n; i++) {
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(c0, c1, n - 1, i);
      sky.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
      sky.fillRect(L, T - 4 + i * hh, R - L, hh + 1);
    }
    const rnd = new Phaser.Math.RandomDataGenerator([M.name]);
    if (M.deco === 'clouds' || M.deco === 'snow') {
      for (let i = 0; i < 4; i++) {
        sky.fillStyle(0xffffff, 0.55);
        const cx = 60 + i * 78, cy = T + 24 + (i % 2) * 34;
        sky.fillEllipse(cx, cy, 54, 20); sky.fillEllipse(cx - 14, cy + 4, 32, 15);
      }
    }
    if (M.deco === 'sun') {
      sky.fillStyle(0xfff1c8, 0.35); sky.fillCircle(300, T + 70, 40);
      sky.fillStyle(0xfff3d0, 1); sky.fillCircle(300, T + 70, 24);
    }
    if (M.deco === 'stars' || M.deco === 'earth') {
      for (let i = 0; i < 46; i++) { sky.fillStyle(0xffffff, rnd.realInRange(0.3, 0.9)); sky.fillCircle(rnd.between(L, R), rnd.between(T, B - 120), rnd.realInRange(0.6, 1.5)); }
    }
    if (M.deco === 'stars') {
      sky.fillStyle(0xfff6d8, 0.25); sky.fillCircle(290, T + 72, 30);
      sky.fillStyle(0xfff6d8, 1); sky.fillCircle(290, T + 72, 18);
      sky.fillStyle(HEX(M.sky[0]), 1); sky.fillCircle(298, T + 66, 15);
    }
    if (M.deco === 'earth') {
      sky.fillStyle(0x3f7fd0, 1); sky.fillCircle(296, T + 76, 22);
      sky.fillStyle(0x5ca35a, 1); sky.fillEllipse(288, T + 70, 16, 12); sky.fillEllipse(304, T + 86, 12, 8);
      sky.fillStyle(0xffffff, 0.5); sky.fillEllipse(300, T + 62, 18, 5);
    }

    const g = this.terrainG; g.clear();
    const fillLand = (off, col) => {
      g.fillStyle(HEX(col), 1);
      g.beginPath(); g.moveTo(L, B + 4);
      for (let x = L; x <= R; x += 4) g.lineTo(x, this.hAt(x) + off);
      g.lineTo(R, B + 4); g.closePath(); g.fillPath();
    };
    fillLand(0, M.ground[0]);
    fillLand(8, M.ground[1]);
    g.fillStyle(HEX(M.ground[2]), 1);
    for (let x = 30; x < R - 6; x += 17) g.fillRect(x, this.hAt(x) + 10, 2, 6);
    if (this.mapKey === 'moon') {
      [[110, 16], [200, 10], [300, 13]].forEach(([cx, r]) => { g.fillStyle(HEX(M.ground[2]), 1); g.fillEllipse(cx, this.hAt(cx) + 22, r * 2, r * 0.7); });
    }

    const d = this.decoG; d.clear();
    (M.cactus || []).forEach((x) => {
      const y = this.hAt(x) + 4;
      d.fillStyle(0x4f8a46, 1); d.fillRoundedRect(x - 4, y - 30, 8, 30, 4);
      d.fillRoundedRect(x - 12, y - 22, 6, 12, 3); d.fillRoundedRect(x + 6, y - 26, 6, 12, 3);
      d.fillRect(x - 12, y - 14, 10, 4); d.fillRect(x + 2, y - 18, 10, 4);
    });
    (M.pines || []).forEach((x) => {
      const y = this.hAt(x) + 4;
      d.fillStyle(0x6a4a30, 1); d.fillRect(x - 2, y - 10, 4, 10);
      d.fillStyle(0x2f5a46, 1);
      d.fillTriangle(x - 14, y - 8, x + 14, y - 8, x, y - 30); d.fillTriangle(x - 11, y - 20, x + 11, y - 20, x, y - 40);
      d.fillStyle(0xffffff, 0.9); d.fillTriangle(x - 5, y - 33, x + 5, y - 33, x, y - 40);
    });
    (M.palms || []).forEach((x) => {
      const y = this.hAt(x) + 4;
      d.lineStyle(5, 0x8a6a44, 1); d.beginPath(); d.moveTo(x, y); d.lineTo(x + 4, y - 18); d.lineTo(x + 2, y - 36); d.strokePath();
      d.fillStyle(0x3f8a4a, 1);
      [-1, 1].forEach((k) => { d.fillEllipse(x + 2 + k * 12, y - 36, 26, 7); d.fillEllipse(x + 2 + k * 9, y - 31, 20, 6); });
    });
    if (M.deco === 'snow') {
      for (let i = 0; i < 40; i++) { d.fillStyle(0xffffff, 0.8); d.fillCircle(rnd.between(L, R), rnd.between(T + 30, B - 40), rnd.realInRange(1, 2.2)); }
    }

    const w = this.waterG; w.clear();
    if (M.water) {
      w.fillStyle(0x3f86c0, 0.92); w.fillRect(L, M.water, R - L, B - M.water + 6);
      w.fillStyle(0xffffff, 0.35);
      for (let x = L + 6; x < R; x += 22) w.fillRect(x, M.water + 3, 10, 2);
    }
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

  /* ── 장애물 — 어려움의 전봇대, 성의 성벽 ── */
  buildPole() {
    this.clearPole();
    const wall = this.map.wall;
    if (wall) {
      const x = wall.x, gy = this.hAt(x), top = gy - wall.hgt;
      const g = this.add.graphics().setDepth(18);
      g.fillStyle(0x6d6a72, 1); g.fillRect(x - wall.w / 2, top, wall.w, wall.hgt + 10);
      for (let i = 0; i < 3; i++) g.fillRect(x - wall.w / 2 + i * 11, top - 8, 8, 8);
      g.fillStyle(0x56535a, 1);
      for (let y = top + 8; y < gy; y += 12) g.fillRect(x - wall.w / 2, y, wall.w, 2);
      g.fillStyle(0xf2c86a, 0.85); g.fillRect(x - 3, top + 24, 6, 10);
      g.setMask(this.playMask);
      this.pole = { g: g, x: x, top: top - 8, halfW: wall.w / 2 + 2 };
      return;
    }
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
    /* 가벼운 곳(달)에서는 같은 힘으로도 천천히, 높이 납니다 — 닿는 거리는 같게 */
    const speed = (130 + this.power * 230) * Math.sqrt(this.map.grav / 300);
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

    /* 맵 — 첫 판은 언덕, 그다음부터는 지난 판과 다른 맵을 골라요 */
    let key = 'hills';
    if (this.round > 1) {
      const opts = this.mapOrder.filter((k) => k !== this.mapKey);
      key = opts[Phaser.Math.Between(0, opts.length - 1)];
    }
    this.useMap(key);
    const M = this.map;
    this.wind = Phaser.Math.FloatBetween(-L.wind, L.wind) * M.wind;
    this.drawWind();
    this.buildPole();

    /* 과녁 자리 — 물 위나 성벽 바로 뒤는 피합니다 */
    let tx = Phaser.Math.Between(L.near, L.far);
    for (let i = 0; i < 40; i++) {
      const ok = (!M.water || this.hAt(tx) < M.water - 10) && (!M.wall || tx > M.wall.x + 40);
      if (ok) break;
      tx = Phaser.Math.Between(Math.min(L.near + 20, 300), Math.max(L.far, 320));
    }
    if (M.water && this.hAt(tx) >= M.water - 10) tx = 292;
    this.targetX = tx;
    this.targetY = this.hAt(tx);
    this.clearTarget();
    /* 과녁 모양 — 서 있는 상자, 움직이는 상자(달·가끔), 풍선(설원·가끔) */
    let kind = 'box';
    if (M.balloon) kind = 'balloon';
    else if (M.moving) kind = 'move';
    else if (this.freeMode && this.level !== 'easy' && Math.random() < 0.3) kind = Math.random() < 0.5 ? 'move' : 'balloon';
    this.targetKind = kind;
    const sc = this.level === 'easy' ? 1.25 : 1.05;
    if (kind === 'balloon') {
      const c = this.add.container(tx, this.targetY - 110).setDepth(22);
      const g = this.add.graphics();
      g.lineStyle(1.5, 0x5a4a3a, 1); g.lineBetween(0, -10, 0, 22);
      g.fillStyle(0xe8505a, 1); g.fillEllipse(0, -26, 30, 36);
      g.fillStyle(0xffffff, 0.45); g.fillEllipse(-6, -34, 8, 12);
      g.fillStyle(0xe8505a, 1); g.fillTriangle(-4, -8, 4, -8, 0, -4);
      const box = this.add.image(0, 40, 'target_box').setOrigin(0.5, 1).setScale(sc * 0.8);
      c.add([g, box]);
      this.target = c;
      this.tweens.add({ targets: c, y: c.y - 46, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    } else {
      this.target = this.add.image(tx, this.targetY + 4, 'target_box').setOrigin(0.5, 1).setDepth(22).setScale(sc);
      this.tweens.add({ targets: this.target, angle: 3, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      if (kind === 'move') {
        const span = this.level === 'hard' ? 46 : 32;
        this.target.x = tx - span;
        this.tweens.add({
          targets: this.target, x: Math.min(GAME.WIDTH - 40, tx + span), duration: this.level === 'hard' ? 1500 : 2100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
          onUpdate: () => { if (this.target && this.target.active) this.target.y = this.hAt(this.target.x) + 4; }
        });
      }
    }
    this.target.setAlpha(0);
    this.tweens.add({ targets: this.target, alpha: 1, duration: 500 });

    this.updateScore();
    if (this.freeMode) this.say(L.pole && !M.wall ? '전봇대 넘겨야 돼. 각도!' : M.line);
    else this.say(this.round === 1 ? '바람 잘 봐. 그게 반이야.' : M.line);
  }

  clearTarget() {
    if (this.target) { this.tweens.killTweensOf(this.target); this.target.destroy(); this.target = null; }
  }

  /* 포탄이 닿아야 할 곳 */
  hitPoint() {
    const t = this.target;
    if (!t) return null;
    if (this.targetKind === 'balloon') return { x: t.x, y: t.y + 10 };
    return { x: t.x, y: t.y - 24 };
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
    const len = this.wind === 0 ? 0 : Phaser.Math.Clamp(Math.abs(this.wind) / (this.LEVELS[this.level].wind * 1.4), 0.1, 1) * 34;
    this.windBar.fillStyle(HEX(PAL.clay), 1);
    if (len === 0) { this.windBar.fillCircle(cx, this.PLAY_TOP + 13, 3); }
    const dir = this.wind >= 0 ? 1 : -1;
    this.windBar.fillRect(cx, this.PLAY_TOP + 11, len * dir, 4);
    if (len > 0) this.windBar.fillTriangle(
      cx + len * dir, this.PLAY_TOP + 7,
      cx + len * dir, this.PLAY_TOP + 17,
      cx + (len + 8) * dir, this.PLAY_TOP + 12
    );
    this.windText.setText(Math.round(Math.abs(this.wind)) === 0 ? '바람 없음' : '바람 ' + (this.wind >= 0 ? '→ ' : '← ') + Math.round(Math.abs(this.wind)));
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

    this.vy += this.map.grav * dt;
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
    const hp = this.hitPoint();
    if (hp && this.target.active && Phaser.Math.Distance.Between(this.shell.x, this.shell.y, hp.x, hp.y) < reach) {
      this.hitTarget();
      return;
    }

    /* 전봇대 */
    if (this.pole && Math.abs(this.shell.x - this.pole.x) < this.pole.halfW && this.shell.y > this.pole.top) {
      this.missed(this.map.wall ? '성벽에 맞았다. 더 높이!' : '전봇대에 맞았다. 더 높이 쏴 봐.');
      return;
    }

    /* 땅이나 화면 밖 */
    const W = GAME.WIDTH;
    if (this.map.water && this.shell.y > this.map.water && this.shell.y < this.hAt(this.shell.x)) {
      this.splash();
      return;
    }
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
    if (this.hud) { this.hud.combo = 0; AudioSystem.gMiss(); }
    this.boomAt(x, y, false);

    if (reason) this.say(reason);
    else {
      const tx = this.target ? this.target.x : this.targetX;
      const near = Math.abs(x - tx);
      if (near < 40) this.say('아 아깝다ㅋㅋ 조금만 더.');
      else if (x < tx) this.say('짧았어. 힘을 조금 더.');
      else this.say('넘어갔어. 힘을 조금 줄여봐.');
    }

    if (this.roundShots >= 5 && !this.freeMode && this.hits === 0) {
      this.setHint('잘 안 맞아도 괜찮아요. 지는 건 없어요.');
    }
  }

  /* 바다에 빠졌을 때 — 물보라 */
  splash() {
    const x = this.shell.x, y = this.map.water;
    this.shell.destroy(); this.shell = null;
    this.flying = false;
    this.roundShots++;
    if (this.hud) { this.hud.combo = 0; AudioSystem.gMiss(); }
    AudioSystem.swipe();
    for (let i = 0; i < 12; i++) {
      const c = this.add.circle(x, y, Phaser.Math.Between(2, 5), 0xdff1ff, 0.9).setDepth(70);
      c.setMask(this.playMask);
      this.tweens.add({ targets: c, x: x + Phaser.Math.Between(-22, 22), y: y - Phaser.Math.Between(16, 46), alpha: 0, duration: 700, ease: 'Quad.easeOut', onComplete: () => c.destroy() });
    }
    this.say('풍덩! 바다에 빠졌다. 조금 더 멀리.');
  }

  hitTarget() {
    this.shell.destroy(); this.shell = null;
    this.flying = false;
    this.locked = true;
    this.hits++;
    /* 적게 쏘고 맞힐수록 큰 점수 */
    const hp = this.hitPoint();
    const bonus = this.targetKind === 'box' ? 0 : 30;      // 움직이는 과녁·풍선은 덤
    this.ensureHud().hit(50 + bonus + Math.max(0, 40 - this.roundShots * 10), hp.x, hp.y - 40, this.roundShots === 0 ? '한 방에!' : '명중!');
    this.boomAt(hp.x, hp.y + 6, true);
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
