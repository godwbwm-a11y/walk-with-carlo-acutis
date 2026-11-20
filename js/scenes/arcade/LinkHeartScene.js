/* DAY 7 후반 · 마음 잇기 — 내가 받은 것을 나누는 길.
   길 조각을 눌러 돌리면, ‘나’에서 시작한 빛이 친구들에게 흘러갑니다.
   모든 친구에게 빛이 닿으면 다음 판. 세 판 — 적게 돌릴수록 별이 많아요. */

window.LinkHeartScene = class LinkHeartScene extends MiniGameScene {
  constructor() { super('LinkHeartScene'); }

  create(data) {
    data = data || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.buildFrame({ from: data.from, title: '마음 잇기', hint: '', bg: '#2a2f4a', warm: true });
    this.add.image(W / 2, H / 2, 'lamp_glow').setDisplaySize(W * 1.6, H).setTint(0xffc89a).setAlpha(0.12).setDepth(-80).setBlendMode(Phaser.BlendModes.ADD);
    this.levels = [{ n: 4, t: 2 }, { n: 5, t: 3 }, { n: 6, t: 3 }];
    this.level = 0; this.turns = 0; this.layer = null;
    this.info = this.add.text(W / 2, 168, '', UI.style(16, '#e6eefa')).setOrigin(0.5).setDepth(20);
    this.faces = ['friend_front', 'pilgrim_a', 'child_front', 'pilgrim_e'];
    if (window.Figure && Figure.portrait) {
      Figure.portrait(this, 'player_front', 48, '#2f6b8f');
      this.faces.forEach(k => Figure.portrait(this, k, 48, '#c9553f'));
    }
    GameFX.intro(this, {
      key: this.scene.key, badge: 'DAY 7 · 성당 앞', title: '마음 잇기',
      sub: data.intro || '가롤로: “받은 걸 나누는 건, 길을 이어 주는 거랑 비슷해.”',
      how: ['길 조각을 누르면 오른쪽으로 90° 돌아가요', '‘나’에서 나온 빛이 모든 친구에게 닿게 이어 주세요', '세 판 — 판이 갈수록 넓어져요', '적게 돌릴수록 별이 많아요'],
      noCount: true,
      onStart: () => { this.hud = GameFX.hud(this); this.startAt = this.time.now; this.build(); }
    });
  }

  /* 무작위 미로(모든 칸이 이어진 나무 모양)를 만든 뒤 조각을 마구 돌려 놓습니다 — 언제나 풀 수 있습니다 */
  build() {
    const W = GAME.WIDTH;
    const L = this.levels[this.level];
    const n = L.n;
    if (this.layer) this.layer.destroy();
    this.layer = this.add.container(0, 0).setDepth(10);
    const size = Math.min(W - 40, 340), cell = size / n;
    this.n = n; this.cell = cell;
    this.x0 = W / 2 - size / 2; this.y0 = 210;

    const DIRS = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];   // dx, dy, 내 쪽, 상대 쪽
    const mask = new Array(n * n).fill(0);
    const seen = new Array(n * n).fill(false);
    const stack = [Math.floor(Math.random() * n * n)];
    seen[stack[0]] = true;
    while (stack.length) {
      const cur = stack[stack.length - 1];
      const cx = cur % n, cy = Math.floor(cur / n);
      const opts = DIRS.filter(d => { const x = cx + d[0], y = cy + d[1]; return x >= 0 && y >= 0 && x < n && y < n && !seen[y * n + x]; });
      if (!opts.length) { stack.pop(); continue; }
      const d = opts[Math.floor(Math.random() * opts.length)];
      const nx = (cy + d[1]) * n + (cx + d[0]);
      mask[cur] |= d[2]; mask[nx] |= d[3];
      seen[nx] = true; stack.push(nx);
    }
    /* 끝 칸(길이 하나뿐인 칸) 가운데서 나와 친구들의 자리를 고릅니다 */
    const leaves = []; for (let i = 0; i < n * n; i++) if ([1, 2, 4, 8].indexOf(mask[i]) !== -1) leaves.push(i);
    Phaser.Utils.Array.Shuffle(leaves);
    this.src = leaves[0];
    this.targets = leaves.slice(1, 1 + L.t);
    this.base = mask;
    this.rot = mask.map(() => Math.floor(Math.random() * 4));
    /* 우연히 이미 풀려 있으면 하나 더 돌려 둡니다 */
    if (this.reach().every(Boolean)) this.rot[this.targets[0]] = (this.rot[this.targets[0]] + 1) % 4;

    this.tiles = [];
    for (let i = 0; i < n * n; i++) {
      const c = this.add.container(this.x0 + (i % n + 0.5) * cell, this.y0 + (Math.floor(i / n) + 0.5) * cell);
      const bgc = this.add.graphics();
      bgc.fillStyle(0x0b1222, 0.55); bgc.fillRoundedRect(-cell / 2 + 2, -cell / 2 + 2, cell - 4, cell - 4, 8);
      const g = this.add.graphics();
      c.add([bgc, g]);
      c.g = g; c.idx = i;
      c.setAngle(this.rot[i] * 90);
      if (i === this.src || this.targets.indexOf(i) !== -1) {
        const key = i === this.src ? 'pt_player_front' : 'pt_' + this.faces[this.targets.indexOf(i) % this.faces.length];
        const face = this.textures.exists(key) ? this.add.image(c.x, c.y, key).setScale(cell / 60) : this.add.text(c.x, c.y, i === this.src ? '나' : '♥', UI.style(18, PAL.cream)).setOrigin(0.5);
        face.setDepth(12);
        this.layer.add(face);
        c.face = face;
      }
      c.setSize(cell, cell).setInteractive();
      c.on('pointerup', () => this.turn(c));
      this.layer.add(c);
      this.tiles.push(c);
    }
    /* 얼굴은 길 조각 위에 */
    this.tiles.forEach(c => { if (c.face) this.layer.bringToTop(c.face); });
    this.solvedNow = false;
    this.redraw();
    this.info.setText((this.level + 1) + ' / ' + this.levels.length + ' 판   ·   돌린 횟수 ' + this.turns);
  }

  conn(i) {
    const m = this.base[i], r = this.rot[i];
    let o = m;
    for (let k = 0; k < r; k++) o = ((o << 1) | (o >> 3)) & 15;     // 시계 방향으로 90°씩
    return o;
  }

  /* 나에게서 빛이 닿는 칸 */
  reach() {
    const n = this.n, lit = new Array(n * n).fill(false);
    const q = [this.src]; lit[this.src] = true;
    const DIRS = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
    while (q.length) {
      const cur = q.shift(), cx = cur % n, cy = Math.floor(cur / n), cm = this.conn(cur);
      DIRS.forEach(d => {
        const x = cx + d[0], y = cy + d[1];
        if (x < 0 || y < 0 || x >= n || y >= n) return;
        const nx = y * n + x;
        if (lit[nx] || !(cm & d[2]) || !(this.conn(nx) & d[3])) return;
        lit[nx] = true; q.push(nx);
      });
    }
    this.lit = lit;
    return this.targets.map(t => lit[t]);
  }

  redraw() {
    const got = this.reach();
    const cell = this.cell, w = Math.max(6, cell * 0.2);
    this.tiles.forEach((c) => {
      const m = this.base[c.idx], on = this.lit[c.idx];
      const g = c.g; g.clear();
      const col = on ? 0xffc86a : 0x8f9ab0;
      if (on) { g.fillStyle(0xffd79a, 0.18); g.fillRoundedRect(-cell / 2 + 2, -cell / 2 + 2, cell - 4, cell - 4, 8); }
      g.lineStyle(w, col, 1);
      const L = cell / 2 - 2;
      if (m & 1) g.lineBetween(0, 0, 0, -L);
      if (m & 2) g.lineBetween(0, 0, L, 0);
      if (m & 4) g.lineBetween(0, 0, 0, L);
      if (m & 8) g.lineBetween(0, 0, -L, 0);
      g.fillStyle(col, 1); g.fillCircle(0, 0, w * 0.75);
      if (on) { g.lineStyle(w * 0.35, 0xfff6dc, 0.8); if (m & 1) g.lineBetween(0, 0, 0, -L); if (m & 2) g.lineBetween(0, 0, L, 0); if (m & 4) g.lineBetween(0, 0, 0, L); if (m & 8) g.lineBetween(0, 0, -L, 0); }
    });
    return got;
  }

  turn(c) {
    if (!this.hud || this.solvedNow || c.turning) return;
    c.turning = true;
    this.turns++;
    AudioSystem.gPop();
    this.rot[c.idx] = (this.rot[c.idx] + 1) % 4;
    const before = this.lit ? this.targets.filter(t => this.lit[t]) : [];
    this.tweens.add({ targets: c, angle: c.angle + 90, duration: 120, ease: 'Quad.easeOut', onComplete: () => {
      c.turning = false;
      c.setAngle(this.rot[c.idx] * 90);
      const got = this.redraw();
      /* 새로 빛이 닿은 친구마다 */
      this.targets.filter(t => this.lit[t] && before.indexOf(t) === -1).forEach((t) => {
        const tc = this.tiles[t];
        this.hud.hit(30, tc.x, tc.y - 30, '닿았다!');
      });
      this.info.setText((this.level + 1) + ' / ' + this.levels.length + ' 판   ·   돌린 횟수 ' + this.turns);
      if (got.every(Boolean)) this.clear();
    } });
  }

  clear() {
    this.solvedNow = true;
    AudioSystem.chime();
    this.tiles.forEach((c, k) => { if (this.lit[c.idx]) this.tweens.add({ targets: c, scale: 1.08, duration: 120, yoyo: true, delay: k * 10 }); });
    GameFX.burst(this, GAME.WIDTH / 2, this.y0 + this.cell * this.n / 2, { count: 26, speed: 190 });
    this.hud.add(100 * (this.level + 1));
    this.time.delayedCall(1100, () => {
      this.level++;
      if (this.level < this.levels.length) this.build();
      else this.end();
    });
  }

  end() {
    const secs = (this.time.now - this.startAt) / 1000;
    const bonus = Math.max(0, Math.round(400 - this.turns * 3 - secs * 2));
    this.hud.add(bonus);
    this.finishGame({
      title: '모두에게 이어졌어요', score: this.hud.score,
      stars: this.turns <= 45 ? 3 : this.turns <= 80 ? 2 : 1,
      detail: this.turns + '번 돌림 · ' + Math.round(secs) + '초',
      line: '“네가 가진 게 작아 보여도, 이어지면 누군가에게 닿아.”'
    });
  }
};
