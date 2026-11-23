/* 미니게임 · 가롤로와 자전거
   해 질 녘 강변 자전거길을 가롤로와 나란히 달립니다.

   - [페달] 을 누르고 있으면 빨라지고, 떼면 천천히 미끄러집니다. 오르막에서는 느려지고 내리막에서는 빨라져요.
   - [점프] 로 돌과 웅덩이를 넘습니다. 경사로를 빠르게 타면 높이 날아요.
   - 앞에 걷는 사람이 있으면 [따르릉] — 비켜 주면 고맙다고 인사해요. 그냥 부딪치면 멈춰서 사과해야 해요.
   - 길에 놓인 별을 모으고, 결승선(가롤로가 좋아하던 젤라토 가게!)까지.
   - 장애물의 자리와 종류는 탈 때마다 바뀝니다. */

window.BikeScene = class BikeScene extends MiniGameScene {
  constructor() { super('BikeScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#2a3046', warm: false,
      title: '가롤로와 자전거', hint: '[페달]을 누르고 있으면 달려요. 돌은 [점프], 사람은 [따르릉]!'
    });
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.top = this.contentTop();
    this.LEN = 7200;                       // 길이(px)
    this.BASE = H - 230;                   // 평지 높이(화면 y)
    this.SX = 120;                         // 내 자전거가 화면에서 서는 자리

    this.buildSky();
    this.world = this.add.container(0, 0).setDepth(10);
    this.makeCourse();
    this.drawGround();

    this.bikeG = this.add.graphics().setDepth(40);
    this.me = { x: 60, y: this.ground(60), vx: 0, vy: 0, on: true, wheel: 0, crash: 0, key: 'player' };
    this.carlo = { x: 20, y: this.ground(20), vx: 0, vy: 0, on: true, wheel: 0, crash: 0, key: 'carlo' };
    this.meImg = this.add.image(0, 0, 'player_side').setOrigin(0.5, 1).setScale(1.15).setDepth(41);
    this.carloImg = this.add.image(0, 0, 'carlo_side').setOrigin(0.5, 1).setScale(1.15).setDepth(39);
    this.world.add([this.bikeG, this.carloImg, this.meImg]);

    this.talk = this.add.text(W / 2, this.top + 16, '', UI.style(FONT.small, PAL.cream, { align: 'center', stroke: '#1a1420', strokeThickness: 4, wordWrap: { width: W - 60 } }))
      .setOrigin(0.5, 0).setDepth(300);
    this.progG = this.add.graphics().setDepth(300);

    this.buildControls();
    this.state = 'wait';
    this.t = 0; this.stars = 0; this.bells = 0; this.bumps = 0;
    this.camX = 0;
    this.dialogue.play([
      { t: '해 질 녘, 강변 자전거길. 가롤로가 자전거 두 대를 끌고 왔다.' },
      { s: '가롤로', t: '저 끝에 젤라토 가게 있어. 먼저 가는 사람이… 아니, 같이 가자!' },
      { s: '가롤로', t: '사람 보이면 따르릉 꼭 하고. 그냥 지나가면 깜짝 놀라.' }
    ], () => GameFX.countdown(this, () => { this.state = 'ride'; this.hud = this.ensureHud(); }));
  }

  /* ── 하늘과 먼 풍경(천천히 흐릅니다) ── */
  buildSky() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    TextureFactory.canvasTex(this, 'bike_sky', 8, 512, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#3d4a7a'); g.addColorStop(0.45, '#c9788a'); g.addColorStop(0.72, '#f2b27a'); g.addColorStop(1, '#f8d9a0');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    });
    this.add.image(0, this.top - 10, 'bike_sky').setOrigin(0, 0).setDisplaySize(W, this.BASE - this.top - 40).setDepth(-20);
    const sun = this.add.graphics().setDepth(-19);
    sun.fillStyle(0xffe2a8, 0.35); sun.fillCircle(W * 0.72, this.BASE - 150, 46);
    sun.fillStyle(0xfff1cf, 1); sun.fillCircle(W * 0.72, this.BASE - 150, 26);
    /* 먼 도시 — 두 겹 */
    this.far = [];
    [[0x6b5a7c, 0.9, 0.08, 120], [0x51466a, 1, 0.18, 80]].forEach(([col, a, par, hmax], layer) => {
      const g = this.add.graphics().setDepth(-18 + layer);
      const rnd = new Phaser.Math.RandomDataGenerator(['bike' + layer]);
      for (let x = 0; x < W * 3; ) {
        const bw = rnd.between(18, 46), bh = rnd.between(hmax * 0.3, hmax);
        g.fillStyle(col, a); g.fillRect(x, this.BASE - 70 - bh + layer * 18, bw, bh + 40);
        if (layer === 1) { g.fillStyle(0xffd98a, 0.55); for (let k = 0; k < 6; k++) g.fillRect(x + rnd.between(3, bw - 6), this.BASE - 70 - bh + 18 + rnd.between(4, bh - 8), 3, 4); }
        x += bw + rnd.between(0, 10);
      }
      this.far.push({ g: g, par: par });
    });
    /* 강 */
    const river = this.add.graphics().setDepth(-15);
    river.fillStyle(0x6f7fa8, 1); river.fillRect(0, this.BASE - 46, W, 40);
    river.fillStyle(0xf6c98a, 0.5); river.fillRect(W * 0.72 - 30, this.BASE - 44, 60, 3);
    this.sparkle = this.add.graphics().setDepth(-14);
  }

  /* ── 길 만들기 — 언덕, 경사로, 돌, 웅덩이, 과속턱, 사람, 별 ── */
  makeCourse() {
    const rnd = Math.random;
    this.hills = [];
    for (let x = 700; x < this.LEN - 800; x += 900 + Math.floor(rnd() * 500)) this.hills.push({ x: x, w: 260 + rnd() * 160, h: 26 + rnd() * 34 });
    this.ramps = []; this.obs = []; this.starList = [];
    const kinds = ['stone', 'puddle', 'bump', 'walker', 'ramp', 'stone', 'walker', 'puddle', 'ramp'];
    let x = 520;
    while (x < this.LEN - 500) {
      const k = kinds[Math.floor(rnd() * kinds.length)];
      if (k === 'ramp') {
        this.ramps.push({ x: x, w: 90, h: 34 });
        for (let i = 0; i < 4; i++) this.starList.push({ x: x + 140 + i * 42, y: -60 - Math.sin(i / 3 * Math.PI) * 50, got: false });
        x += 320;
      } else {
        this.obs.push({ kind: k, x: x, done: false, hit: false });
        if (k === 'stone' || k === 'puddle') this.starList.push({ x: x, y: -78, got: false });
        x += 240 + Math.floor(rnd() * 260);
      }
      if (rnd() < 0.45) { for (let i = 0; i < 3; i++) this.starList.push({ x: x - 120 + i * 30, y: -24, got: false }); }
    }
  }

  /* 땅 높이(화면 y) */
  ground(x) {
    let y = this.BASE;
    for (let i = 0; i < this.hills.length; i++) {
      const h = this.hills[i], d = (x - h.x) / h.w;
      if (Math.abs(d) < 1) y -= h.h * (Math.cos(d * Math.PI) + 1) / 2;
    }
    for (let i = 0; i < this.ramps.length; i++) {
      const r = this.ramps[i];
      if (x >= r.x && x <= r.x + r.w) y -= r.h * (x - r.x) / r.w;
    }
    return y;
  }

  drawGround() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const g = this.add.graphics();
    /* 풀 둑 · 길 · 아래 잔디 */
    g.fillStyle(0x5a7a4a, 1);
    g.beginPath(); g.moveTo(-40, H);
    for (let x = -40; x <= this.LEN + 400; x += 12) g.lineTo(x, this.ground(x) - 6);
    g.lineTo(this.LEN + 400, H); g.closePath(); g.fillPath();
    g.fillStyle(0x8a8f96, 1);
    g.beginPath(); g.moveTo(-40, H);
    for (let x = -40; x <= this.LEN + 400; x += 12) g.lineTo(x, this.ground(x));
    g.lineTo(this.LEN + 400, H); g.closePath(); g.fillPath();
    g.fillStyle(0xc9554a, 1);                                // 자전거길(붉은 아스팔트)
    g.beginPath(); g.moveTo(-40, this.BASE + 30);
    for (let x = -40; x <= this.LEN + 400; x += 12) g.lineTo(x, this.ground(x) + 2);
    for (let x = this.LEN + 400; x >= -40; x -= 12) g.lineTo(x, this.ground(x) + 22);
    g.closePath(); g.fillPath();
    g.fillStyle(0xf2efe6, 0.85);
    for (let x = 0; x < this.LEN + 400; x += 56) { const y = this.ground(x) + 11; g.fillRect(x, y, 26, 2.5); }
    g.fillStyle(0x4f6e3e, 1); g.fillRect(-40, this.BASE + 50, this.LEN + 500, H);
    /* 가로등과 나무 */
    for (let x = 200; x < this.LEN; x += 340) {
      const y = this.ground(x) - 4;
      g.fillStyle(0x3a3f4a, 1); g.fillRect(x, y - 92, 4, 92); g.fillRect(x - 10, y - 94, 18, 4);
      g.fillStyle(0xffe6a8, 0.9); g.fillCircle(x - 8, y - 89, 4);
      const tx = x + 170, ty = this.ground(tx) - 4;
      g.fillStyle(0x5a4030, 1); g.fillRect(tx - 3, ty - 40, 6, 40);
      g.fillStyle(0x3f6a3a, 1); g.fillCircle(tx, ty - 52, 22); g.fillCircle(tx - 14, ty - 40, 15); g.fillCircle(tx + 14, ty - 42, 16);
    }
    /* 경사로 */
    this.ramps.forEach((r) => {
      const y = this.ground(r.x - 1);
      g.fillStyle(0x9a6a40, 1); g.fillTriangle(r.x, y + 2, r.x + r.w, y + 2, r.x + r.w, y - r.h + 2);
      g.fillStyle(0xf2c86a, 1); g.fillRect(r.x + r.w - 4, y - r.h + 2, 4, r.h);
      g.lineStyle(2, 0x6a4628, 1); g.lineBetween(r.x, y + 2, r.x + r.w, y - r.h + 2);
    });
    /* 결승선 — 젤라토 가게 */
    const fx = this.LEN, fy = this.ground(fx);
    for (let k = 0; k < 8; k++) { g.fillStyle(k % 2 ? 0x222222 : 0xffffff, 1); g.fillRect(fx, fy - 2 + (k % 2) * 0, 8, 22); g.fillRect(fx + 8, fy + (k % 2 ? -2 : 8), 8, 12); }
    g.fillStyle(0xf4e6d0, 1); g.fillRect(fx + 60, fy - 96, 120, 96);
    g.fillStyle(0xe98aa0, 1); for (let k = 0; k < 6; k++) g.fillRect(fx + 60 + k * 20, fy - 108, 10, 16);
    g.fillStyle(0x8fd0e0, 1); for (let k = 0; k < 6; k++) g.fillRect(fx + 70 + k * 20, fy - 108, 10, 16);
    g.fillStyle(0x5a3a2a, 1); g.fillRect(fx + 100, fy - 56, 30, 56);
    this.world.add(g);
    const sign = this.add.text(fx + 120, fy - 80, 'GELATO', UI.style(16, '#c9554a')).setOrigin(0.5);
    this.world.add(sign);

    /* 장애물 */
    this.obs.forEach((o) => {
      const y = this.ground(o.x);
      if (o.kind === 'stone') {
        const s = this.add.graphics();
        s.fillStyle(0x000000, 0.2); s.fillEllipse(o.x, y + 3, 34, 7);
        s.fillStyle(0x7d7468, 1); s.fillEllipse(o.x, y - 8, 30, 22);
        s.fillStyle(0x9a9286, 1); s.fillEllipse(o.x - 4, y - 12, 16, 9);
        o.obj = s;
      } else if (o.kind === 'puddle') {
        const s = this.add.graphics();
        s.fillStyle(0x4a6a9a, 0.9); s.fillEllipse(o.x, y + 6, 70, 12);
        s.fillStyle(0xbfd8f0, 0.6); s.fillEllipse(o.x - 10, y + 4, 26, 3);
        o.obj = s;
      } else if (o.kind === 'bump') {
        const s = this.add.graphics();
        for (let k = 0; k < 5; k++) { s.fillStyle(k % 2 ? 0x222222 : 0xf2c84a, 1); s.fillRect(o.x - 15 + k * 6, y - 5, 6, 7); }
        o.obj = s;
      } else if (o.kind === 'walker') {
        const keys = ['epi_ita', 'epi_leo', 'epi_bra', 'epi_fra', 'epi_kid1', 'epi_kid2'];
        const k = keys[Math.floor(Math.random() * keys.length)];
        o.obj = this.add.image(o.x, y + 2, this.textures.exists(k + '_side') ? k + '_side' : k + '_front').setOrigin(0.5, 1).setScale(1.15);
        o.key = k; o.wx = o.x; o.step = Math.random() * 10;
      }
      this.world.add(o.obj);
    });
    /* 별 */
    this.starList.forEach((s) => {
      s.wy = this.ground(s.x) + s.y;
      const t = this.add.graphics();
      t.fillStyle(0xffe07a, 1);
      const pts = []; for (let k = 0; k < 10; k++) { const r = k % 2 ? 4.5 : 10, a = -Math.PI / 2 + k * Math.PI / 5; pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r }); }
      t.fillPoints(pts, true);
      t.lineStyle(1.5, 0xc9902a, 1); t.strokePoints(pts, true);
      t.setPosition(s.x, s.wy);
      this.tweens.add({ targets: t, scale: 1.15, duration: 500, yoyo: true, repeat: -1 });
      s.obj = t;
      this.world.add(t);
    });
  }

  buildControls() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, y = H - 70;
    const plate = this.add.graphics().setDepth(290);
    plate.fillStyle(0x10131e, 0.55); plate.fillRect(0, H - 140, W, 140);
    this.pedalBtn = UI.button(this, 96, y, 160, 92, '페달', null, { size: 22, fill: PAL.sun }).setDepth(300);
    this.jumpBtn = UI.button(this, W - 96, y, 160, 92, '점프', null, { size: 22, fill: PAL.paper }).setDepth(300);
    this.bellBtn = UI.circleButton(this, W / 2, y - 46, 30, '🔔', null, { size: 22 }).setDepth(300);
    this.pedalBtn.on('pointerdown', () => { this.pedal = true; });
    ['pointerup', 'pointerout'].forEach((e) => this.pedalBtn.on(e, () => { this.pedal = false; }));
    this.jumpBtn.on('pointerdown', () => this.jump());
    this.bellBtn.on('pointerdown', () => this.ring());
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-RIGHT', () => { this.pedal = true; });
      this.input.keyboard.on('keyup-RIGHT', () => { this.pedal = false; });
      this.input.keyboard.on('keydown-UP', () => this.jump());
      this.input.keyboard.on('keydown-SPACE', () => this.jump());
      this.input.keyboard.on('keydown-B', () => this.ring());
    }
  }

  jump() {
    if (this.state !== 'ride' || !this.me.on || this.me.crash > 0) return;
    this.me.vy = -440; this.me.on = false;
    AudioSystem.swipe();
  }

  ring() {
    if (this.state !== 'ride') return;
    AudioSystem.chime();
    this.tweens.add({ targets: this.bellBtn, angle: { from: -14, to: 14 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => this.bellBtn.setAngle(0) });
    /* 앞 260px 안의 사람이 비켜 줍니다 */
    this.obs.forEach((o) => {
      if (o.kind !== 'walker' || o.done || o.aside) return;
      const d = o.wx - this.me.x;
      if (d > 0 && d < 280) {
        o.aside = true; this.bells++;
        this.hud.hit(30, o.wx - this.camX, this.ground(o.wx) - 80, '따르릉!');
        this.tweens.add({ targets: o.obj, y: o.obj.y + 26, alpha: 0.75, duration: 420 });
        this.time.delayedCall(300, () => this.say(Phaser.Utils.Array.GetRandom(['“Grazie!”', '“감사합니다~”', '“Thank you!”'])));
      }
    });
  }

  say(t) {
    this.talk.setText(t).setAlpha(1);
    this.tweens.killTweensOf(this.talk);
    this.tweens.add({ targets: this.talk, alpha: 0, delay: 1800, duration: 400 });
  }

  /* ── 매 프레임 ── */
  update(time, delta) {
    const dt = Math.min(delta, 40) / 1000;
    if (this.state === 'ride' || this.state === 'finish') {
      if (this.state === 'ride') this.t += dt;
      this.ride(this.me, dt, this.state === 'ride' && this.pedal);
      this.carloAI(dt);
      this.checkThings();
    }
    /* 카메라 */
    this.camX = Phaser.Math.Clamp(this.me.x - this.SX, 0, this.LEN + 260 - GAME.WIDTH);
    this.world.x = -this.camX;
    this.far.forEach((f) => { f.g.x = -((this.camX * f.par) % (GAME.WIDTH * 2)); });
    this.drawBikes(time);
    this.drawProgress();
    /* 사람들 걷기 */
    this.obs.forEach((o) => {
      if (o.kind !== 'walker' || o.done) return;
      o.step += dt * 6; o.wx -= dt * 18 * (o.aside ? 0.4 : 1);
      o.obj.x = o.wx; if (!o.aside) o.obj.y = this.ground(o.wx) + 2;
      o.obj.setFlipX(true);
      if (this.textures.exists(o.key + '_side_walk')) o.obj.setTexture(Math.floor(o.step) % 2 ? o.key + '_side_walk' : o.key + '_side');
    });
  }

  ride(b, dt, pedal) {
    const gx = this.ground(b.x), slope = (this.ground(b.x + 4) - this.ground(b.x - 4)) / 8;
    if (b.crash > 0) { b.crash -= dt; b.vx = Math.max(0, b.vx - 600 * dt); }
    else if (pedal) b.vx = Math.min(330, b.vx + (b.vx < 120 ? 260 : 150) * dt);
    else b.vx = Math.max(0, b.vx - 34 * dt);
    if (b.on) b.vx = Math.max(0, Math.min(400, b.vx + slope * 520 * dt));      // 내리막 +, 오르막 −
    b.x += b.vx * dt;
    if (b.on) {
      const ny = this.ground(b.x);
      /* 경사로 끝처럼 땅이 갑자기 꺼지면 공중으로(언덕 내리막은 그대로 따라 내려가요) */
      if (ny - b.y > b.vx * dt * 0.6 + 2 && b.vx > 120) { b.on = false; b.vy = -b.vx * 0.36; }
      else b.y = ny;
    }
    if (!b.on) {
      b.vy += 1150 * dt; b.y += b.vy * dt;
      const ny = this.ground(b.x);
      if (b.y >= ny) { b.y = ny; b.on = true; b.vy = 0; if (b === this.me) AudioSystem.step(); }
    }
    b.wheel += b.vx * dt / 14;
    if (b.x >= this.LEN && b === this.me && this.state === 'ride') this.finish();
  }

  /* 가롤로 — 내 옆을 지키며 달립니다(조금 앞서거나 조금 뒤에서) */
  carloAI(dt) {
    const c = this.carlo, want = this.me.x - 50 + Math.sin(this.time.now / 1800) * 40;
    const pedal = this.state === 'finish' ? c.x < this.LEN + 40 : c.x < want;
    /* 가롤로는 장애물 앞에서 알아서 뛰어요 */
    if (c.on && this.obs.some((o) => (o.kind === 'stone' || o.kind === 'puddle') && o.x - c.x > 10 && o.x - c.x < 46)) { c.vy = -420; c.on = false; }
    this.ride(c, dt, pedal);
    if (c.vx > this.me.vx + 60) c.vx = this.me.vx + 60;
  }

  checkThings() {
    const m = this.me;
    if (m.crash > 0) return;
    this.obs.forEach((o) => {
      if (o.done) return;
      const ox = o.kind === 'walker' ? o.wx : o.x;
      const dx = ox - m.x;
      if (dx < -30) {
        o.done = true;
        if (!o.hit && (o.kind === 'stone' || o.kind === 'puddle')) this.hud.hit(10, m.x - this.camX, m.y - 90, '휙!');
        return;
      }
      if (Math.abs(dx) > 18) return;
      const air = this.ground(m.x) - m.y;
      if (o.kind === 'stone' && air < 18) this.bump(o, '쿵! 돌에 걸렸다.');
      else if (o.kind === 'puddle' && air < 8) { o.hit = true; o.done = true; m.vx *= 0.6; this.splash(m.x, this.ground(m.x)); this.hud.miss(m.x - this.camX, m.y - 80); this.say('첨벙! 바지가 젖었다ㅋㅋ'); }
      else if (o.kind === 'bump' && air < 6) { o.done = true; if (m.vx > 230) { m.vy = -220; m.on = false; this.say('덜컹!'); } }
      else if (o.kind === 'walker' && !o.aside && air < 40) { this.bump(o, '앗, 죄송합니다!'); o.aside = true; this.tweens.add({ targets: o.obj, y: o.obj.y + 26, duration: 300 }); }
    });
    this.starList.forEach((s) => {
      if (s.got) return;
      if (Math.abs(s.x - m.x) < 20 && Math.abs(s.wy - (m.y - 36)) < 34) {
        s.got = true; this.stars++;
        this.hud.hit(20, s.x - this.camX, s.wy - 20);
        this.tweens.killTweensOf(s.obj);
        this.tweens.add({ targets: s.obj, y: s.obj.y - 30, alpha: 0, scale: 1.6, duration: 300, onComplete: () => s.obj.destroy() });
      }
    });
  }

  bump(o, line) {
    o.hit = true; o.done = true; this.bumps++;
    this.me.crash = 0.9; this.me.vx *= 0.25;
    this.hud.miss(this.me.x - this.camX, this.me.y - 80);
    this.cameras.main.shake(160, 0.006);
    this.say(line);
    this.tweens.add({ targets: this.meImg, angle: { from: -12, to: 12 }, duration: 90, yoyo: true, repeat: 3, onComplete: () => this.meImg.setAngle(0) });
  }

  splash(x, y) {
    for (let i = 0; i < 10; i++) {
      const c = this.add.circle(x, y, Phaser.Math.Between(2, 4), 0xbfe0ff, 0.9);
      this.world.add(c);
      this.tweens.add({ targets: c, x: x + Phaser.Math.Between(-26, 26), y: y - Phaser.Math.Between(10, 34), alpha: 0, duration: 500, onComplete: () => c.destroy() });
    }
  }

  /* 자전거 그리기 — 바퀴살이 굴러갑니다 */
  drawBikes(time) {
    const g = this.bikeG; g.clear();
    [[this.carlo, this.carloImg, 0x3f8f6a], [this.me, this.meImg, 0x4f7fd8]].forEach(([b, img, col]) => {
      const tilt = b.on ? Math.atan2(this.ground(b.x + 14) - this.ground(b.x - 14), 28) : Phaser.Math.Clamp(b.vy / 900, -0.4, 0.4);
      const cos = Math.cos(tilt), sin = Math.sin(tilt);
      const R = (dx, dy) => ({ x: b.x + dx * cos - dy * sin, y: b.y + dx * sin + dy * cos });
      const wr = 13;
      const back = R(-20, -wr), front = R(20, -wr);
      g.fillStyle(0x000000, 0.18); g.fillEllipse(b.x, this.ground(b.x) + 2, 52, 6);
      [back, front].forEach((w) => {
        g.lineStyle(3, 0x222428, 1); g.strokeCircle(w.x, w.y, wr);
        g.lineStyle(1, 0x9aa0aa, 0.9);
        for (let k = 0; k < 4; k++) { const a = b.wheel + k * Math.PI / 4; g.lineBetween(w.x - Math.cos(a) * wr, w.y - Math.sin(a) * wr, w.x + Math.cos(a) * wr, w.y + Math.sin(a) * wr); }
      });
      const seat = R(-6, -34), bar = R(16, -38), crank = R(-2, -wr);
      g.lineStyle(4, col, 1);
      g.lineBetween(back.x, back.y, crank.x, crank.y); g.lineBetween(crank.x, crank.y, seat.x, seat.y);
      g.lineBetween(seat.x, seat.y, back.x, back.y); g.lineBetween(seat.x, seat.y + 4, bar.x, bar.y + 6);
      g.lineBetween(crank.x, crank.y, bar.x, bar.y + 6); g.lineBetween(bar.x, bar.y, front.x, front.y);
      g.lineStyle(3, 0x2a2a2a, 1); g.lineBetween(seat.x - 6, seat.y - 2, seat.x + 5, seat.y - 2); g.lineBetween(bar.x - 4, bar.y - 2, bar.x + 4, bar.y);
      /* 타는 사람 — 페달을 밟으면 걸음 그림이 번갈아 */
      const pedaling = b.vx > 20 && b.on;
      const frame = pedaling ? (Math.floor(b.wheel * 1.2) % 2 ? '_side_walk' : '_side') : '_side';
      const key = b.key + frame;
      if (this.textures.exists(key)) img.setTexture(key);
      const hip = R(-2, -26);
      img.setPosition(hip.x, hip.y + 26).setRotation(tilt);
      if (b.crash <= 0) img.setAngle(Phaser.Math.RadToDeg(tilt));
    });
  }

  drawProgress() {
    const g = this.progG, W = GAME.WIDTH, y = this.top + 4;
    g.clear();
    g.fillStyle(0x000000, 0.35); g.fillRoundedRect(40, y - 4, W - 80, 8, 4);
    const f = Phaser.Math.Clamp(this.me.x / this.LEN, 0, 1), fc = Phaser.Math.Clamp(this.carlo.x / this.LEN, 0, 1);
    g.fillStyle(0xffd27a, 1); g.fillRoundedRect(40, y - 4, Math.max(8, (W - 80) * f), 8, 4);
    g.fillStyle(0x3f8f6a, 1); g.fillCircle(40 + (W - 80) * fc, y, 5);
    g.fillStyle(0x4f7fd8, 1); g.fillCircle(40 + (W - 80) * f, y, 6);
    g.fillStyle(0xe98aa0, 1); g.fillRect(W - 44, y - 9, 6, 18);
  }

  finish() {
    this.state = 'finish';
    this.pedal = false;
    AudioSystem.bell();
    const bonus = Math.max(0, Math.round((60 - this.t) * 5));
    if (bonus) this.hud.add(bonus);
    this.say('도착! 젤라토 가게!');
    this.time.delayedCall(2200, () => this.end());
  }

  gameStars() { return this.bumps === 0 && this.stars >= 12 ? 3 : this.bumps <= 2 ? 2 : 1; }

  end() {
    this.state = 'end';
    const ko = I18N.lang === 'ko', sec = Math.round(this.t);
    const lines = [
      ko ? sec + '초 만에 도착. 별 ' + this.stars + '개, 따르릉 ' + this.bells + '번.' : 'Arrived in ' + sec + 's. ' + this.stars + ' stars, ' + this.bells + ' bell rings.',
      { s: '가롤로', t: '피스타치오 하나, 초코 하나 주세요!' },
      { s: '가롤로', t: this.bumps === 0 ? '오늘 한 번도 안 부딪쳤네. 따르릉 잘하더라.' : '부딪쳤을 때 바로 사과하는 거, 그거 멋있었어.' },
      { s: '가롤로', t: '혼자 달리면 빠르고, 같이 달리면 멀리 가.' }
    ];
    this.complete(lines);
  }
};
