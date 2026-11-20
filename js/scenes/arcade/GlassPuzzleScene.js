/* DAY 3 후반 · 빛의 조각 — 주일 저녁, 오늘 본 성당 창을 떠올리며.
   흩어진 스테인드글라스 조각을 빈자리로 밀어 한 장의 창을 완성하는 밀기 퍼즐입니다.
   적게 움직일수록, 빨리 맞출수록 별이 늘어납니다. 시간 제한은 없습니다. */

window.GlassPuzzleScene = class GlassPuzzleScene extends MiniGameScene {
  constructor() { super('GlassPuzzleScene'); }

  create(data) {
    data = data || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.buildFrame({ from: data.from, title: '빛의 조각', hint: '', bg: '#2b2534', warm: false });
    this.N = 3;
    this.size = 312;
    this.cell = this.size / this.N;
    this.bx = W / 2 - this.size / 2;
    this.by = 250;

    this.paintGlass();
    /* 창틀 */
    const frame = this.add.graphics().setDepth(5);
    frame.fillStyle(0x3f3228, 1); frame.fillRoundedRect(this.bx - 14, this.by - 14, this.size + 28, this.size + 28, 18);
    frame.fillStyle(0x1c1620, 1); frame.fillRoundedRect(this.bx - 4, this.by - 4, this.size + 8, this.size + 8, 8);
    this.add.image(W / 2, this.by + this.size / 2, 'lamp_glow').setDisplaySize(this.size * 1.7, this.size * 1.5)
      .setTint(0xffd9a0).setAlpha(0.18).setBlendMode(Phaser.BlendModes.ADD).setDepth(4);

    /* 정답 미리보기 (누르고 있는 동안) */
    this.preview = this.add.image(W / 2, this.by + this.size / 2, 'gp_full').setDisplaySize(this.size, this.size).setDepth(40).setAlpha(0);
    this.peek = UI.button(this, W / 2, this.by + this.size + 58, 190, 52, '완성 그림 보기', null, { size: FONT.small });
    this.peek.on('pointerdown', () => this.tweens.add({ targets: this.preview, alpha: 0.96, duration: 150 }));
    const hide = () => this.tweens.add({ targets: this.preview, alpha: 0, duration: 200 });
    this.peek.on('pointerup', hide); this.peek.on('pointerout', hide);

    this.info = this.add.text(W / 2, 200, '', UI.style(17, PAL.cream)).setOrigin(0.5).setDepth(50);
    this.moves = 0; this.secs = 0; this.running = false;

    this.build();
    GameFX.intro(this, {
      key: this.scene.key, badge: 'DAY 3 · 주일 저녁', title: '빛의 조각',
      sub: data.intro || '가롤로: “아까 성당 창 기억나? 조각조각 모여서 빛이 됐잖아.”',
      how: ['빈칸 옆의 조각을 누르면 그쪽으로 밀려요', '한 장의 창을 완성하세요', '‘완성 그림 보기’를 누르고 있으면 정답이 보여요', '적게 움직일수록 별이 많아요'],
      noCount: true,
      onStart: () => { this.running = true; this.startAt = this.time.now; }
    });
  }

  /* 퍼즐 그림 — 성작과 빛살이 있는 둥근 창 */
  paintGlass() {
    if (this.textures.exists('gp_full')) return;
    const S = this.size, R = window.HiTex ? HiTex.density(this, 'prop') : 1;
    const full = document.createElement('canvas'); full.width = S * R; full.height = S * R;
    const c = full.getContext('2d'); c.scale(R, R);
    /* 둥근 장미창 — 가운데서 퍼지는 꽃잎과 고리들이 있어, 조각마다 생김새가 다릅니다 */
    const cx = S / 2, cy = S / 2;
    c.fillStyle = '#1f2a48'; c.fillRect(0, 0, S, S);
    /* 네 귀퉁이 — 서로 다른 색의 잎 무늬 */
    [['#7ba065', 0, 0], ['#c9755a', S, 0], ['#5f8fbf', 0, S], ['#9d8ac4', S, S]].forEach(function (q) {
      const gq = c.createRadialGradient(q[1], q[2], 4, q[1], q[2], S * 0.5);
      gq.addColorStop(0, q[0]); gq.addColorStop(1, 'rgba(31,42,72,0)');
      c.fillStyle = gq; c.fillRect(0, 0, S, S);
    });
    const ring = function (r0, r1, n, colsR, off) {
      for (let k = 0; k < n; k++) {
        const a0 = (k / n) * Math.PI * 2 + (off || 0), a1 = ((k + 1) / n) * Math.PI * 2 + (off || 0);
        c.beginPath(); c.arc(cx, cy, r1, a0, a1); c.arc(cx, cy, r0, a1, a0, true); c.closePath();
        c.fillStyle = colsR[k % colsR.length]; c.fill();
        c.strokeStyle = 'rgba(30,22,18,0.9)'; c.lineWidth = 2; c.stroke();
      }
    };
    ring(118, 150, 24, ['#3f6f8f', '#8fc0d9', '#5f8fbf', '#9d8ac4']);
    ring(80, 118, 12, ['#f2b56b', '#c9755a', '#e9d27a', '#d98c6a'], Math.PI / 12);
    ring(46, 80, 8, ['#7ba065', '#a6c487', '#4f7d6a', '#9fc38a']);
    /* 가운데 — 성작과 성체, 빛 */
    const g = c.createRadialGradient(cx, cy, 2, cx, cy, 48);
    g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#f4d9a0');
    c.beginPath(); c.arc(cx, cy, 46, 0, Math.PI * 2); c.fillStyle = g; c.fill();
    c.strokeStyle = '#2b2018'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#c9a24e';
    c.beginPath(); c.moveTo(cx - 20, cy - 2); c.lineTo(cx + 20, cy - 2); c.quadraticCurveTo(cx + 19, cy + 16, cx, cy + 18); c.quadraticCurveTo(cx - 19, cy + 16, cx - 20, cy - 2); c.fill();
    c.fillRect(cx - 3, cy + 17, 6, 12); c.fillRect(cx - 13, cy + 28, 26, 5);
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(cx, cy - 16, 12, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#c9a24e'; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = '#c9a24e'; c.fillRect(cx - 1, cy - 24, 2, 16); c.fillRect(cx - 6, cy - 18, 12, 2);
    /* 바깥 테 */
    c.beginPath(); c.arc(cx, cy, 151, 0, Math.PI * 2); c.strokeStyle = '#2b2018'; c.lineWidth = 4; c.stroke();
    const fullTex = this.textures.addCanvas('gp_full', full);
    if (window.HiTex) HiTex.mark(fullTex, R);
    /* 조각마다 따로 */
    const n = this.N, cs = S / n;
    for (let i = 0; i < n * n; i++) {
      const cv = document.createElement('canvas'); cv.width = cs * R; cv.height = cs * R;
      const x = cv.getContext('2d');
      x.drawImage(full, (i % n) * cs * R, Math.floor(i / n) * cs * R, cs * R, cs * R, 0, 0, cs * R, cs * R);
      x.strokeStyle = 'rgba(20,14,10,0.9)'; x.lineWidth = 3 * R; x.strokeRect(0, 0, cs * R, cs * R);
      x.strokeStyle = 'rgba(255,255,255,0.25)'; x.lineWidth = 1 * R; x.strokeRect(2 * R, 2 * R, cs * R - 4 * R, cs * R - 4 * R);
      const t = this.textures.addCanvas('gp_' + i, cv);
      if (window.HiTex) HiTex.mark(t, R);
    }
  }

  build() {
    const n = this.N;
    this.grid = [];                       // grid[pos] = 조각 번호 (n*n-1 = 빈칸)
    for (let i = 0; i < n * n; i++) this.grid.push(i);
    /* 정답에서 무작위로 밀어 섞습니다 — 언제나 풀 수 있습니다 */
    let empty = n * n - 1, prev = -1;
    for (let k = 0; k < 140; k++) {
      const nb = this.neighbors(empty).filter(p => p !== prev);
      const p = nb[Math.floor(Math.random() * nb.length)];
      this.grid[empty] = this.grid[p]; this.grid[p] = n * n - 1;
      prev = empty; empty = p;
    }
    this.tiles = {};
    this.grid.forEach((piece, pos) => {
      if (piece === n * n - 1) return;
      const img = this.add.image(this.px(pos), this.py(pos), 'gp_' + piece).setDepth(10).setInteractive();
      img.piece = piece;
      img.on('pointerup', () => this.tap(img));
      this.tiles[piece] = img;
    });
    this.updateInfo();
  }

  px(pos) { return this.bx + (pos % this.N) * this.cell + this.cell / 2; }
  py(pos) { return this.by + Math.floor(pos / this.N) * this.cell + this.cell / 2; }
  neighbors(pos) {
    const n = this.N, r = Math.floor(pos / n), c = pos % n, out = [];
    if (r > 0) out.push(pos - n); if (r < n - 1) out.push(pos + n);
    if (c > 0) out.push(pos - 1); if (c < n - 1) out.push(pos + 1);
    return out;
  }

  tap(img) {
    if (!this.running || this.sliding) return;
    const n = this.N, pos = this.grid.indexOf(img.piece), empty = this.grid.indexOf(n * n - 1);
    if (this.neighbors(empty).indexOf(pos) === -1) {
      this.tweens.add({ targets: img, x: img.x + 4, duration: 40, yoyo: true, repeat: 1 });
      return;
    }
    this.grid[empty] = img.piece; this.grid[pos] = n * n - 1;
    this.moves++;
    this.sliding = true;
    AudioSystem.gPop();
    this.tweens.add({ targets: img, x: this.px(empty), y: this.py(empty), duration: 110, ease: 'Quad.easeOut',
      onComplete: () => {
        this.sliding = false;
        /* 제자리에 들어간 조각은 반짝 */
        if (img.piece === empty) GameFX.burst(this, img.x, img.y, { count: 6, size: 0.35, speed: 50 });
        this.updateInfo();
        if (this.solved()) this.win();
      } });
  }

  solved() { return this.grid.every((p, i) => p === i); }

  updateInfo() {
    const right = this.grid.filter((p, i) => p === i && p !== this.N * this.N - 1).length;
    this.info.setText('움직임 ' + this.moves + '   ·   제자리 ' + right + ' / ' + (this.N * this.N - 1));
  }

  update() {
    if (this.running) this.secs = (this.time.now - this.startAt) / 1000;
  }

  win() {
    this.running = false;
    const n = this.N;
    const last = this.add.image(this.px(n * n - 1), this.py(n * n - 1), 'gp_' + (n * n - 1)).setDepth(10).setAlpha(0);
    this.tweens.add({ targets: last, alpha: 1, duration: 500 });
    const glow = this.add.image(GAME.WIDTH / 2, this.by + this.size / 2, 'lamp_glow').setDisplaySize(this.size * 1.9, this.size * 1.7)
      .setTint(0xffe7b0).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setDepth(30);
    this.tweens.add({ targets: glow, alpha: 0.6, duration: 700, yoyo: true, hold: 500 });
    GameFX.burst(this, GAME.WIDTH / 2, this.by + this.size / 2, { count: 30, speed: 180 });
    AudioSystem.bell();
    const score = Math.max(100, Math.round(1500 - this.moves * 12 - this.secs * 4));
    this.time.delayedCall(1500, () => this.finishGame({
      title: '창이 다 맞춰졌어요', score: score,
      stars: this.moves <= 45 ? 3 : this.moves <= 90 ? 2 : 1,
      detail: this.moves + '번 · ' + Math.round(this.secs) + '초',
      line: '“조각 하나하나는 그냥 색유리야. 같이 있어야 빛이 그림이 돼.”'
    }));
  }
};
