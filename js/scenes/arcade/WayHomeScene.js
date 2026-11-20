/* DAY 2 후반 · 돌아가는 길 — 해 질 녘, 가벼워진 걸음으로 집까지.
   화면을 누르면 폴짝(공중에서 한 번 더). 웅덩이와 돌부리는 뛰어넘고, 떠 있는 귤과 말씀 카드를 모읍니다.
   넘어져도 끝나지 않습니다 — 잠깐 비틀거릴 뿐. 45초 동안 달립니다. */

window.WayHomeScene = class WayHomeScene extends MiniGameScene {
  constructor() { super('WayHomeScene'); }

  create(data) {
    data = data || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.buildFrame({ from: data.from, title: '돌아가는 길', hint: '', bg: '#3a3550', warm: false });
    this.groundY = 640;

    this.add.image(W / 2, 0, 'sky_evening').setOrigin(0.5, 0).setDisplaySize(W, this.groundY + 20).setDepth(-90);
    this.add.circle(W * 0.78, 300, 26, 0xffe2b0, 0.95).setDepth(-89);
    this.add.image(W * 0.78, 300, 'lamp_glow').setDisplaySize(300, 200).setTint(0xffb27a).setAlpha(0.6).setDepth(-89).setBlendMode(Phaser.BlendModes.ADD);

    /* 멀리 있는 집들 — 천천히 흐릅니다 */
    this.far = [];
    let x = 0;
    while (x < W + 200) {
      const k = Math.random() < 0.5 ? 'house_a' : 'house_b';
      const img = this.add.image(x, this.groundY - 6, k).setOrigin(0, 1).setScale(0.75).setDepth(-60).setTint(0xd9b9b0);
      this.far.push(img);
      x += img.displayWidth + 8;
    }
    /* 길 */
    this.road = this.add.tileSprite(0, this.groundY, W, H - this.groundY, 'walk_tile').setOrigin(0, 0).setDepth(-50);
    const edge = this.add.graphics().setDepth(-49);
    edge.fillStyle(0x8a7a66, 1); edge.fillRect(0, this.groundY - 4, W, 6);

    this.px = 120; this.py = this.groundY; this.vy = 0; this.jumps = 0;
    this.player = this.add.image(this.px, this.py, 'player_front').setOrigin(0.5, 1).setScale(1.6).setDepth(30);
    this.shadow = this.add.image(this.px, this.groundY + 4, 'shadow').setScale(1.2).setDepth(29).setAlpha(0.5);
    this.carlo = this.add.image(54, this.groundY, 'carlo_front').setOrigin(0.5, 1).setScale(1.45).setDepth(28);
    this.cvy = 0; this.cy = this.groundY;

    this.things = [];
    this.running = false;
    this.elapsed = 0;
    this.hurtUntil = 0;
    this.stepT = 0;

    this.input.on('pointerdown', () => this.jump());
    if (this.input.keyboard) this.input.keyboard.on('keydown-SPACE', () => this.jump());
    if (this.input.keyboard) this.input.keyboard.on('keydown-UP', () => this.jump());

    GameFX.intro(this, {
      key: this.scene.key, badge: 'DAY 2 · 해 질 녘', title: '돌아가는 길',
      sub: data.intro || '가롤로: “가방이 가벼워졌으니까, 집까지 달려 볼까?”',
      how: ['화면을 누르면 폴짝 — 공중에서 한 번 더 뛸 수 있어요', '웅덩이와 돌부리는 뛰어넘기', '귤 +10 · 말씀 카드 +50', '45초 동안 달려요. 넘어져도 괜찮아요'],
      onStart: () => this.begin()
    });
  }

  begin() {
    this.hud = GameFX.hud(this, { time: 45 });
    this.running = true;
    this.nextObs = 900;
    this.nextItem = 600;
  }

  jump() {
    if (!this.running) return;
    if (this.jumps >= 2) return;
    this.vy = this.jumps === 0 ? -720 : -620;
    this.jumps++;
    AudioSystem.gPop();
    GameFX.burst(this, this.px, this.py, { count: 5, speed: 40, tints: [0xe8dccb, 0xffffff], size: 0.35 });
  }

  speed() { return 230 + this.elapsed * 5; }

  spawnObstacle() {
    const W = GAME.WIDTH;
    const kind = Math.random() < 0.55 ? 'puddle' : 'stone';
    let o;
    if (kind === 'puddle') {
      o = this.add.container(W + 60, this.groundY);
      const g = this.add.graphics();
      g.fillStyle(0x5c7d9e, 0.9); g.fillEllipse(0, 2, 70, 14);
      g.fillStyle(0xbfd9ee, 0.6); g.fillEllipse(-10, 0, 30, 4);
      o.add(g); o.w = 56; o.h = 8;
    } else {
      o = this.add.image(W + 40, this.groundY + 4, 'stone').setOrigin(0.5, 1).setScale(0.7);
      o.w = 36; o.h = 26;
    }
    o.kind = kind; o.setDepth(25); o.obs = true;
    this.things.push(o);
  }

  spawnItem() {
    const W = GAME.WIDTH;
    const card = Math.random() < 0.12;
    const y = this.groundY - (card ? 190 : 60 + Math.random() * 120);
    const o = this.add.image(W + 30, y, card ? 'small_card' : 'orange').setScale(card ? 0.32 : 0.75).setDepth(26);
    this.tweens.add({ targets: o, y: y - 8, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    o.kind = card ? 'card' : 'orange'; o.obs = false; o.w = card ? 40 : 26; o.h = card ? 28 : 26;
    this.things.push(o);
  }

  update(time, delta) {
    if (!this.running) return;
    const dt = Math.min(delta, 50) / 1000;
    this.elapsed += dt;
    let sp = this.speed();
    if (time < this.hurtUntil) sp *= 0.55;

    this.road.tilePositionX += sp * dt;
    const W = GAME.WIDTH;
    this.far.forEach((h) => {
      h.x -= sp * 0.25 * dt;
      if (h.x + h.displayWidth < 0) {
        const last = this.far.reduce((m, o) => Math.max(m, o.x + o.displayWidth), 0);
        h.x = Math.max(W, last + 8);
      }
    });

    /* 뛰기 */
    this.vy += 1900 * dt;
    this.py += this.vy * dt;
    if (this.py >= this.groundY) { this.py = this.groundY; this.vy = 0; this.jumps = 0; }
    this.player.y = this.py;
    this.shadow.setScale(1.2 * (1 - Math.min(0.6, (this.groundY - this.py) / 300)));
    this.stepT += dt;
    if (this.py >= this.groundY && this.stepT > 0.14) {
      this.stepT = 0;
      this.player.setTexture(this.player.texture.key === 'player_front' ? 'player_front_walk' : 'player_front');
    }
    this.player.setAlpha(time < this.hurtUntil ? (Math.floor(time / 80) % 2 ? 0.4 : 1) : 1);

    /* 가롤로도 뒤에서 따라 뛰고, 웅덩이가 오면 같이 폴짝 */
    this.cvy += 1900 * dt; this.cy += this.cvy * dt;
    if (this.cy >= this.groundY) { this.cy = this.groundY; this.cvy = 0; }
    this.carlo.y = this.cy;

    /* 나오기 */
    this.nextObs -= dt * 1000;
    if (this.nextObs <= 0) { this.spawnObstacle(); this.nextObs = Math.max(650, 1500 - this.elapsed * 18) * (0.75 + Math.random() * 0.6); }
    this.nextItem -= dt * 1000;
    if (this.nextItem <= 0) { this.spawnItem(); this.nextItem = 700 + Math.random() * 900; }

    for (let i = this.things.length - 1; i >= 0; i--) {
      const o = this.things[i];
      o.x -= sp * dt;
      if (o.obs && o.x < this.carlo.x + 70 && o.x > this.carlo.x + 40 && this.cy >= this.groundY) this.cvy = -620;
      const hitX = Math.abs(o.x - this.px) < (o.w / 2 + 12);
      if (o.obs) {
        if (hitX && this.py > this.groundY - o.h && time >= this.hurtUntil) {
          this.hurtUntil = time + 1000;
          this.hud.miss(this.px, this.py - 90);
          GameFX.burst(this, o.x, this.groundY - 6, { count: 10, tints: [0x9fc3e0, 0xffffff], speed: 70 });
        }
      } else {
        const oy = o.y;
        if (hitX && Math.abs(oy - (this.py - 40)) < 44) {
          this.hud.hit(o.kind === 'card' ? 50 : 10, o.x, oy - 10, o.kind === 'card' ? '말씀!' : '');
          if (o.kind === 'card') GameFX.flash(this, 0xfff1cf);
          o.destroy(); this.things.splice(i, 1);
          continue;
        }
      }
      if (o.x < -80) { o.destroy(); this.things.splice(i, 1); }
    }

    if (this.hud.tick(dt * 1000)) this.end();
  }

  end() {
    this.running = false;
    const s = this.hud.score;
    this.tweens.add({ targets: [this.player, this.carlo], y: '-=6', duration: 200, yoyo: true });
    this.finishGame({
      title: '집 앞에 도착!', score: s, stars: s >= 420 ? 3 : s >= 220 ? 2 : 1,
      detail: '넘어진 횟수 ' + this.hud.misses,
      line: '“걸음이 가볍지? 짐을 하나 내려놓았으니까.”'
    });
  }
};
