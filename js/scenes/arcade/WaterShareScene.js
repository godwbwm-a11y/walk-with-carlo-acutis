/* DAY 6 후반 · 물 한 병의 나눔 — 파견미사를 마친 아침, 뜨거운 햇볕 아래.
   땀방울을 단 목마른 순례자가 여기저기 고개를 내밉니다. 사라지기 전에 눌러 물을 건네세요.
   이미 물병을 든 사람은 “괜찮아요!” — 누르지 않아도 됩니다. 아이에게 건네면 +20. 40초. */

window.WaterShareScene = class WaterShareScene extends MiniGameScene {
  constructor() { super('WaterShareScene'); }

  create(data) {
    data = data || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.buildFrame({ from: data.from, title: '물 한 병의 나눔', hint: '', bg: '#6f8f5f', warm: false });
    this.add.image(W / 2, 0, 'sky_morning').setOrigin(0.5, 0).setDisplaySize(W, 330).setDepth(-90);
    const ground = this.add.graphics().setDepth(-85);
    ground.fillStyle(0x8fae6f, 1); ground.fillRect(0, 320, W, H - 320);
    ground.fillStyle(0x7f9f62, 1);
    for (let i = 0; i < 70; i++) ground.fillEllipse(Math.random() * W, 330 + Math.random() * (H - 340), 6 + Math.random() * 10, 2 + Math.random() * 3);
    this.add.circle(W * 0.8, 120, 30, 0xfff1c0).setDepth(-88);
    this.add.image(W * 0.8, 120, 'lamp_glow').setDisplaySize(260, 260).setTint(0xfff0b0).setAlpha(0.5).setDepth(-88).setBlendMode(Phaser.BlendModes.ADD);

    /* 순례자가 나오는 아홉 자리 — 앞줄일수록 크게 */
    this.spots = [];
    const rows = [[360, 0.95], [490, 1.15], [630, 1.35]];
    rows.forEach((r, ri) => {
      for (let c = 0; c < 3; c++) {
        const x = W * (0.2 + c * 0.3) + (ri % 2 ? 16 : -16);
        const mat = this.add.image(x, r[0] + 26, 'mat_ground').setScale(0.5 * r[1]).setDepth(r[0] - 2).setAlpha(0.9);
        this.spots.push({ x: x, y: r[0], s: r[1], busy: false, mat: mat });
      }
    });
    this.people = [];
    this.running = false;
    this.elapsed = 0;

    GameFX.intro(this, {
      key: this.scene.key, badge: 'DAY 6 · 파견의 아침', title: '물 한 병의 나눔',
      sub: data.intro || '가롤로: “다들 목마를 거야. 우리 물 나눠 주자!”',
      how: ['땀방울을 단 목마른 사람을 눌러 물을 건네요 (+10)', '아이에게 건네면 +20', '물병을 이미 든 사람은 누르지 마세요', '40초 — 점점 빨라져요'],
      onStart: () => { this.hud = GameFX.hud(this, { time: 40 }); this.running = true; this.spawnT = 300; }
    });
  }

  spawn() {
    const free = this.spots.filter(s => !s.busy);
    if (!free.length) return;
    const sp = free[Math.floor(Math.random() * free.length)];
    sp.busy = true;
    const r = Math.random();
    const kind = r < 0.22 ? 'fine' : r < 0.36 ? 'child' : 'thirsty';
    const tex = kind === 'child' ? 'child_front' : ['pilgrim_a', 'pilgrim_b', 'pilgrim_c', 'pilgrim_d', 'pilgrim_e'][Math.floor(Math.random() * 5)];
    const c = this.add.container(sp.x, sp.y + 30).setDepth(sp.y).setAlpha(0);
    const body = this.add.image(0, 0, tex).setOrigin(0.5, 1).setScale(1.5 * sp.s);
    c.add(body);
    if (kind === 'fine') {
      c.add(this.add.image(16 * sp.s, -30 * sp.s, 'water_bottle').setScale(0.5 * sp.s));
      c.add(this.add.text(0, -86 * sp.s, '괜찮아요!', UI.style(12, PAL.ink, { backgroundColor: 'rgba(255,255,255,0.85)', padding: { x: 5, y: 2 }, shadow: false })).setOrigin(0.5));
    } else {
      const drop = this.add.text(18 * sp.s, -70 * sp.s, '💧', UI.style(18, '#fff', { shadow: false })).setOrigin(0.5);
      c.add(drop);
      this.tweens.add({ targets: drop, y: drop.y + 8, duration: 420, yoyo: true, repeat: -1 });
      c.add(this.add.text(-20 * sp.s, -84 * sp.s, '목말라…', UI.style(12, PAL.ink, { backgroundColor: 'rgba(255,255,255,0.85)', padding: { x: 5, y: 2 }, shadow: false })).setOrigin(0.5));
    }
    c.kind = kind; c.spot = sp;
    c.setSize(60 * sp.s, 110 * sp.s);
    /* 컨테이너의 누르는 자리는 크기의 가운데를 기준으로 잡힙니다 — 발밑에서 머리까지 */
    c.setInteractive(new Phaser.Geom.Rectangle(0, -55 * sp.s, 60 * sp.s, 110 * sp.s), Phaser.Geom.Rectangle.Contains);
    c.on('pointerdown', () => this.give(c));
    const stay = Math.max(900, 2000 - this.elapsed * 28) * (0.8 + Math.random() * 0.4);
    this.tweens.add({ targets: c, y: sp.y, alpha: 1, duration: 160, ease: 'Back.easeOut' });
    c.timer = this.time.delayedCall(stay, () => this.away(c, false));
    this.people.push(c);
  }

  away(c, served) {
    if (!c.scene || c.gone) return;
    c.gone = true;
    if (c.timer) c.timer.remove();
    if (!served && c.kind !== 'fine') this.hud.combo = 0;
    this.tweens.add({ targets: c, y: c.y + 30, alpha: 0, duration: 200, onComplete: () => { c.spot.busy = false; c.destroy(); } });
    this.people = this.people.filter(p => p !== c);
  }

  give(c) {
    if (!this.running || c.gone) return;
    if (c.kind === 'fine') {
      this.hud.miss(c.x, c.y - 120 * c.spot.s);
      GameFX.pop(this, c.x, c.y - 90 * c.spot.s, '이미 있어요', { color: '#cfd8e6', size: 15 });
      this.away(c, true);
      return;
    }
    /* 물병이 날아가 닿습니다 */
    const b = this.add.image(GAME.WIDTH / 2, GAME.HEIGHT - 60, 'water_bottle').setScale(0.7).setDepth(900);
    this.tweens.add({ targets: b, x: c.x, y: c.y - 60 * c.spot.s, angle: 360, duration: 180, ease: 'Quad.easeOut', onComplete: () => b.destroy() });
    this.hud.hit(c.kind === 'child' ? 20 : 10, c.x, c.y - 110 * c.spot.s, '고마워!');
    GameFX.burst(this, c.x, c.y - 60 * c.spot.s, { tints: [0x9fd0e6, 0xdff0f8, 0xffffff], count: 12 });
    this.away(c, true);
  }

  update(time, delta) {
    if (!this.running) return;
    const dt = Math.min(delta, 50);
    this.elapsed += dt / 1000;
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this.spawn();
      if (this.elapsed > 15 && Math.random() < 0.35) this.spawn();
      this.spawnT = Math.max(380, 900 - this.elapsed * 14);
    }
    if (this.hud.tick(dt)) this.end();
  }

  end() {
    this.running = false;
    this.people.slice().forEach(c => this.away(c, true));
    const s = this.hud.score;
    this.time.delayedCall(400, () => this.finishGame({
      title: '모두 시원해졌어요', score: s, stars: s >= 460 ? 3 : s >= 250 ? 2 : 1,
      detail: this.hud.hits + '명에게 건넴',
      line: '“물 한 병이 별거 아닌 것 같아도, 목마른 사람한테는 전부야.”'
    }));
  }
};
