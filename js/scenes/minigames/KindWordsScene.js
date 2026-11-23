/* 미니게임 · 말 바꾸기
   아래에서 말풍선이 떠오릅니다. 가시 돋친 회색 풍선은 상처 주는 말, 따뜻한 풍선은 좋은 말.

   - 손가락으로 회색 풍선을 긋듯이 지나가면 터지면서 좋은 말로 바뀌어 위로 올라갑니다.
   - 좋은 말 풍선은 건드리지 말고 그냥 올려 보내요(그어 버리면 연속이 끊깁니다).
   - 회색 풍선이 위까지 올라가 버리면 마음(♥)이 하나 줄어요. 좋은 말이 올라가면 조금 채워집니다.
   - 60초, 또는 마음이 다 닳으면 끝. 갈수록 빨리, 많이 떠오릅니다. */

window.KindWordsScene = class KindWordsScene extends MiniGameScene {
  constructor() { super('KindWordsScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#33405e', warm: false,
      title: '말 바꾸기', hint: '가시 돋친 회색 말풍선을 손가락으로 그어 터뜨려요. 따뜻한 말은 그냥 올려 보내요!'
    });
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.top = this.contentTop();

    /* 해 질 녘 교실 창가 같은 배경 */
    TextureFactory.canvasTex(this, 'kw_bg', 8, 512, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#2c3656'); g.addColorStop(0.55, '#5a5878'); g.addColorStop(1, '#c79a86');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    });
    this.add.image(0, 0, 'kw_bg').setOrigin(0, 0).setDisplaySize(W, H).setDepth(-60);
    const win = this.add.graphics().setDepth(-55);
    win.lineStyle(6, 0xffffff, 0.06);
    for (let x = 40; x < W; x += 110) win.lineBetween(x, this.top + 60, x, H);

    /* 맨 위 — 나, 그리고 마음 */
    this.LINE = this.top + 92;                      // 이 선을 넘으면 ‘들린’ 말
    this.me = this.add.image(W / 2, this.LINE + 8, 'player_front').setOrigin(0.5, 1).setScale(1.5).setDepth(40);
    const ln = this.add.graphics().setDepth(5);
    ln.lineStyle(2, 0xffffff, 0.18); ln.lineBetween(20, this.LINE + 12, W - 20, this.LINE + 12);
    this.hearts = 5; this.heartFill = 0;
    this.heartText = this.add.text(20, this.top + 14, '', UI.style(24, '#ff8a9a', { stroke: '#2a1e28', strokeThickness: 4 })).setDepth(80);
    this.timeText = this.add.text(W - 22, this.top + 16, '', UI.style(18, '#ffe7a8', { stroke: '#2a1e28', strokeThickness: 4 })).setOrigin(1, 0).setDepth(80);

    this.trail = this.add.graphics().setDepth(300);
    this.pts = [];
    this.bubbles = [];
    this.state = 'wait';
    this.timeLeft = 60;
    this.changed = 0; this.slicedKind = 0; this.leaked = 0;

    this.input.on('pointerdown', (p) => { this.pts = [{ x: p.x, y: p.y, t: this.time.now }]; this.prev = { x: p.x, y: p.y }; });
    this.input.on('pointermove', (p) => { if (p.isDown && this.prev) this.slice(this.prev.x, this.prev.y, p.x, p.y); if (p.isDown) { this.pts.push({ x: p.x, y: p.y, t: this.time.now }); this.prev = { x: p.x, y: p.y }; } });
    this.input.on('pointerup', () => { this.prev = null; });

    this.renderHud();
    this.dialogue.play([
      { t: '하루 동안 들은 말들이 머릿속에 떠다닌다.' },
      { s: '가롤로', t: '그 말, 그대로 두지 말자. 다른 말로 바꿔 보는 거야.' },
      { s: '가롤로', t: '좋은 말은 건드리지 말고 그냥 둬. 그건 네 거니까.' }
    ], () => GameFX.countdown(this, () => { this.hud = this.ensureHud(); this.state = 'play'; this.spawnAt = 0; }));
  }

  renderHud() {
    let s = '';
    for (let i = 0; i < 5; i++) s += i < this.hearts ? '♥' : '♡';
    this.heartText.setText(s);
    this.timeText.setText('⏱ ' + Math.ceil(this.timeLeft));
  }

  /* ── 말풍선 ── */
  spawn() {
    const W = GAME.WIDTH, elapsed = 60 - this.timeLeft;
    const bad = Math.random() < 0.68;
    const pair = Phaser.Utils.Array.GetRandom(KINDWORDS.pairs);
    const text = bad ? pair[0] : Phaser.Utils.Array.GetRandom(KINDWORDS.kind);
    const c = this.add.container(Phaser.Math.Between(70, W - 70), GAME.HEIGHT + 40).setDepth(100);
    const t = this.add.text(0, 0, text, UI.style(17, bad ? '#f1eef2' : '#5a3a2a', { align: 'center', wordWrap: { width: 150 } })).setOrigin(0.5);
    const w = Math.max(96, t.width + 34), h = Math.max(54, t.height + 26);
    const g = this.add.graphics();
    if (bad) {
      /* 가시 돋친 회색 풍선 */
      g.fillStyle(0x3b3d4a, 0.95);
      const pts = []; const n = 18;
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = i % 2 ? 1 : 1.13; pts.push({ x: Math.cos(a) * w / 2 * r, y: Math.sin(a) * h / 2 * r }); }
      g.fillPoints(pts, true);
      g.lineStyle(2, 0x1e1f28, 1); g.strokePoints(pts, true);
    } else {
      g.fillStyle(0xfff1dc, 0.97); g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
      g.lineStyle(3, 0xf2a86a, 1); g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2);
      g.fillStyle(0xfff1dc, 0.97); g.fillTriangle(-8, h / 2 - 2, 8, h / 2 - 2, 0, h / 2 + 10);
    }
    c.add([g, t]);
    const sp = 70 + elapsed * 1.6 + Math.random() * 30;
    const b = { c: c, bad: bad, pair: pair, w: w, h: h, vy: -sp, sway: Math.random() * 6, amp: 14 + Math.random() * 18, x0: c.x, dead: false };
    this.bubbles.push(b);
  }

  /* 손가락이 지나간 선분이 풍선을 지나갔나 */
  slice(x1, y1, x2, y2) {
    if (this.state !== 'play') return;
    this.bubbles.forEach((b) => {
      if (b.dead) return;
      const cx = b.c.x, cy = b.c.y;
      /* 선분과 타원의 대략적인 교차 — 풍선 중심까지의 거리 */
      const dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy || 1;
      const k = Phaser.Math.Clamp(((cx - x1) * dx + (cy - y1) * dy) / L, 0, 1);
      const px = x1 + dx * k - cx, py = y1 + dy * k - cy;
      if ((px * px) / Math.pow(b.w / 2, 2) + (py * py) / Math.pow(b.h / 2, 2) > 1) return;
      if (b.bad) this.change(b); else this.oops(b);
    });
  }

  /* 상처 주는 말 → 좋은 말 */
  change(b) {
    b.dead = true; this.changed++;
    const x = b.c.x, y = b.c.y, ko = I18N.lang === 'ko';
    this.hud.hit(10, x, y - 30);
    AudioSystem.blip();
    /* 조각 */
    for (let i = 0; i < 10; i++) {
      const s = this.add.circle(x, y, Phaser.Math.Between(3, 6), 0x5a5c6a, 0.9).setDepth(120);
      this.tweens.add({ targets: s, x: x + Phaser.Math.Between(-60, 60), y: y + Phaser.Math.Between(-40, 50), alpha: 0, duration: 500, onComplete: () => s.destroy() });
    }
    b.c.destroy();
    const kind = this.add.text(x, y, b.pair[1], UI.style(18, '#ffe7a8', { stroke: '#4a2a1a', strokeThickness: 4, align: 'center', wordWrap: { width: 200 } })).setOrigin(0.5).setDepth(130).setScale(0.6);
    this.tweens.add({ targets: kind, scale: 1, duration: 200, ease: 'Back.easeOut' });
    this.tweens.add({ targets: kind, y: this.LINE - 10, x: GAME.WIDTH / 2, alpha: 0, delay: 650, duration: 900, ease: 'Sine.easeIn', onComplete: () => { kind.destroy(); this.gain(0.25); } });
  }

  /* 좋은 말을 그어 버렸을 때 */
  oops(b) {
    if (b.hitAt && this.time.now - b.hitAt < 600) return;
    b.hitAt = this.time.now; this.slicedKind++;
    this.hud.miss(b.c.x, b.c.y - 30);
    this.tweens.add({ targets: b.c, angle: { from: -8, to: 8 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => b.c.setAngle(0) });
  }

  gain(f) {
    this.heartFill += f;
    if (this.heartFill >= 1) { this.heartFill = 0; if (this.hearts < 5) { this.hearts++; this.renderHud(); this.tweens.add({ targets: this.heartText, scale: 1.3, duration: 120, yoyo: true }); } }
  }

  update(time, delta) {
    const dt = Math.min(delta, 40) / 1000;
    /* 손가락 자국 */
    const now = this.time.now;
    this.pts = this.pts.filter((q) => now - q.t < 160);
    this.trail.clear();
    if (this.pts.length > 1) {
      for (let i = 1; i < this.pts.length; i++) {
        const a = this.pts[i - 1], b = this.pts[i];
        this.trail.lineStyle(2 + i * 0.8, 0xfff6e0, 0.25 + i / this.pts.length * 0.6);
        this.trail.lineBetween(a.x, a.y, b.x, b.y);
      }
    }
    if (this.state !== 'play') return;

    this.timeLeft = Math.max(0, this.timeLeft - dt);
    this.spawnAt -= dt;
    if (this.spawnAt <= 0) {
      const elapsed = 60 - this.timeLeft;
      this.spawn();
      if (elapsed > 25 && Math.random() < 0.35) this.spawn();
      this.spawnAt = Math.max(0.45, 1.15 - elapsed * 0.012);
    }
    this.bubbles.forEach((b) => {
      if (b.dead) return;
      b.c.y += b.vy * dt;
      b.sway += dt * 2;
      b.c.x = b.x0 + Math.sin(b.sway) * b.amp;
      if (b.c.y < this.LINE + 20) {
        b.dead = true;
        if (b.bad) {
          /* 들어 버린 말 — 마음이 하나 줄어요 */
          this.leaked++; this.hearts--; this.renderHud();
          this.hud.miss(b.c.x, b.c.y);
          this.tweens.add({ targets: this.me, alpha: 0.5, duration: 120, yoyo: true, repeat: 1 });
          this.tweens.add({ targets: b.c, alpha: 0, y: b.c.y - 20, duration: 300, onComplete: () => b.c.destroy() });
        } else {
          this.hud.add(5); this.gain(0.34);
          this.tweens.add({ targets: b.c, alpha: 0, scale: 0.6, x: GAME.WIDTH / 2, y: this.LINE - 20, duration: 400, onComplete: () => b.c.destroy() });
        }
      }
    });
    this.bubbles = this.bubbles.filter((b) => !b.dead);
    this.renderHud();
    if (this.hearts <= 0 || this.timeLeft <= 0) this.end();
  }

  gameStars() { return this.changed >= 45 && this.leaked <= 1 ? 3 : this.changed >= 25 ? 2 : 1; }

  end() {
    if (this.state === 'end') return;
    this.state = 'end';
    this.bubbles.forEach((b) => { if (!b.dead) this.tweens.add({ targets: b.c, alpha: 0, duration: 400 }); });
    const ko = I18N.lang === 'ko';
    this.complete([
      ko ? '상처 주는 말 ' + this.changed + '개를 좋은 말로 바꿨다.' : 'I turned ' + this.changed + ' hurtful words into kind ones.',
      { s: '가롤로', t: '들은 말을 다 지울 수는 없어.' },
      { s: '가롤로', t: '그래도 내가 건네는 말은 고를 수 있지. 오늘은 그걸로 충분해.' }
    ]);
  }
};
