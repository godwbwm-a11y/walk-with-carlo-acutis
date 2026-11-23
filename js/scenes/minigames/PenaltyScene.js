/* 미니게임 · 가롤로와 승부차기
   성당 뒤 작은 운동장. 골대 하나, 공 하나. 가롤로와 번갈아 차고 막습니다.

   - 찰 때: 공에서 골대 쪽으로 손가락을 휙 밀어 찹니다. 밀어 올린 방향으로 가고,
     빠르게 밀수록 높이 뜹니다(너무 세면 크로스바 위로). 위쪽 구석은 막기 어렵습니다.
   - 막을 때: 가롤로가 공을 차기 전에 골대 안 막고 싶은 자리를 누르면 그쪽으로 몸을 날립니다.
     가롤로는 차기 직전에 몸이 살짝 기울어요 — 늘 정직하지는 않지만.
   - 다섯 번씩. 같으면 한 번씩 더(서든데스, 최대 세 번). 그래도 같으면 무승부. */

window.PenaltyScene = class PenaltyScene extends MiniGameScene {
  constructor() { super('PenaltyScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#2f5a3a', warm: false,
      title: '가롤로와 승부차기', hint: '찰 때는 공에서 골대 쪽으로 휙! 막을 때는 막을 자리를 눌러요.'
    });
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.top = this.contentTop();

    /* 골대(화면 좌표) — 골라인은 아래 변, 크로스바는 위 변 */
    this.G = { L: 74, R: W - 74, T: this.top + 120, B: this.top + 250 };
    this.SPOT = { x: W / 2, y: H - 150 };

    this.drawField();
    this.keeper = this.add.image(W / 2, this.G.B + 4, 'carlo_front').setOrigin(0.5, 1).setScale(1.7).setDepth(30);
    this.shooter = this.add.image(W / 2 + 34, this.SPOT.y + 40, 'player_back').setOrigin(0.5, 1).setScale(1.8).setDepth(60);
    this.ball = this.add.image(this.SPOT.x, this.SPOT.y, 'soccer_ball').setScale(1.7).setDepth(55);
    this.ballShadow = this.add.ellipse(this.SPOT.x, this.SPOT.y + 16, 34, 9, 0x000000, 0.25).setDepth(54);
    this.aimG = this.add.graphics().setDepth(70);

    this.board = this.add.text(W / 2, this.top + 26, '', UI.style(20, '#ffffff', { stroke: '#1d3322', strokeThickness: 5 })).setOrigin(0.5).setDepth(80);
    this.marks = this.add.text(W / 2, this.top + 60, '', UI.style(15, '#e9f3dc', { stroke: '#1d3322', strokeThickness: 4, align: 'center' })).setOrigin(0.5).setDepth(80);
    this.say = this.add.text(W / 2, this.SPOT.y - 120, '', UI.style(26, '#fff3c4', { stroke: '#22301c', strokeThickness: 6, align: 'center' })).setOrigin(0.5).setDepth(90).setAlpha(0);
    this.roleText = this.add.text(W / 2, H - 40, '', UI.style(16, '#ffe7a8', { stroke: '#1d3322', strokeThickness: 4 })).setOrigin(0.5).setDepth(90);

    this.rec = { me: [], carlo: [] };          // true 골, false 실패
    this.round = 0; this.state = 'wait';
    this.input.on('pointerdown', (p) => this.down(p));
    this.input.on('pointermove', (p) => this.move(p));
    this.input.on('pointerup', (p) => this.up(p));

    this.renderBoard();
    this.dialogue.play([
      { t: '성당 뒤 작은 운동장. 골대 하나에 그물이 반쯤 찢어져 있다.' },
      { s: '가롤로', t: '승부차기 하자! 다섯 번씩. 네가 먼저 차.' },
      { s: '가롤로', t: '공에서 골대 쪽으로 휙 밀면 돼. 너무 세게 하면 하늘로 간다ㅋㅋ' }
    ], () => GameFX.countdown(this, () => { this.hud = this.ensureHud(); this.nextTurn(); }));
  }

  drawField() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, G = this.G;
    const g = this.add.graphics().setDepth(-50);
    /* 하늘과 성당 담장 */
    g.fillStyle(0x9cc6e0, 1); g.fillRect(0, 0, W, G.T - 10);
    g.fillStyle(0xc9b79a, 1); g.fillRect(0, G.T - 60, W, 56);
    g.fillStyle(0xb5a284, 1); for (let x = 0; x < W; x += 28) g.fillRect(x, G.T - 60, 2, 56);
    g.fillStyle(0x8a6a50, 1); g.fillTriangle(W - 120, G.T - 60, W - 60, G.T - 110, W, G.T - 60);
    g.fillStyle(0xa27c5c, 1); g.fillRect(W - 110, G.T - 60, 100, 40);
    g.fillStyle(0xf2efe6, 1); g.fillRect(W - 62, G.T - 140, 4, 30); g.fillRect(W - 70, G.T - 132, 20, 4);
    /* 잔디 — 줄무늬, 멀수록 좁게 */
    for (let i = 0; i < 14; i++) {
      const y0 = G.T - 4 + Math.pow(i / 14, 1.5) * (H - G.T + 4), y1 = G.T - 4 + Math.pow((i + 1) / 14, 1.5) * (H - G.T + 4);
      g.fillStyle(i % 2 ? 0x5f9a4c : 0x6aa857, 1); g.fillRect(0, y0, W, y1 - y0 + 1);
    }
    /* 페널티 박스 선 */
    g.lineStyle(3, 0xf4f6ee, 0.85);
    g.lineBetween(20, G.B + 70, W - 20, G.B + 70); g.lineBetween(20, G.B + 70, 0, H - 20); g.lineBetween(W - 20, G.B + 70, W, H - 20);
    g.lineBetween(G.L - 30, G.B, G.R + 30, G.B);
    g.fillStyle(0xf4f6ee, 1); g.fillEllipse(this.SPOT.x, this.SPOT.y + 16, 14, 5);
    /* 골대 — 그물, 기둥 */
    const n = this.add.graphics().setDepth(10);
    n.fillStyle(0xffffff, 0.12); n.fillRect(G.L, G.T, G.R - G.L, G.B - G.T);
    n.lineStyle(1, 0xffffff, 0.45);
    for (let x = G.L; x <= G.R; x += 12) n.lineBetween(x, G.T, x + (x - GAME.WIDTH / 2) * 0.06, G.B);
    for (let y = G.T; y <= G.B; y += 12) n.lineBetween(G.L, y, G.R, y);
    const p = this.add.graphics().setDepth(40);
    p.fillStyle(0xffffff, 1);
    p.fillRect(G.L - 6, G.T - 6, 7, G.B - G.T + 8); p.fillRect(G.R - 1, G.T - 6, 7, G.B - G.T + 8); p.fillRect(G.L - 6, G.T - 6, G.R - G.L + 12, 7);
    p.fillStyle(0xd9dde3, 1); p.fillRect(G.L - 1, G.T + 1, 2, G.B - G.T); p.fillRect(G.R + 4, G.T + 1, 2, G.B - G.T);
  }

  renderBoard() {
    const ko = I18N.lang === 'ko';
    const me = this.rec.me.filter(Boolean).length, c = this.rec.carlo.filter(Boolean).length;
    this.board.setText((ko ? '나 ' : 'Me ') + me + '  :  ' + c + (ko ? ' 가롤로' : ' Carlo'));
    const row = (a) => { const s = []; for (let i = 0; i < Math.max(5, a.length); i++) s.push(a[i] === undefined ? '·' : a[i] ? '●' : '○'); return s.join(' '); };
    this.marks.setText(row(this.rec.me) + '\n' + row(this.rec.carlo));
  }

  /* ── 차례 ── */
  nextTurn() {
    const me = this.rec.me.length, c = this.rec.carlo.length;
    if (me === c) {
      if (this.decided()) { this.end(); return; }
      this.role = 'shoot';
    } else this.role = 'keep';
    this.resetBall();
    const ko = I18N.lang === 'ko';
    if (this.role === 'shoot') {
      this.keeper.setTexture('carlo_front').setPosition(GAME.WIDTH / 2, this.G.B + 4).setAngle(0);
      this.shooter.setTexture(this.tex('player', 'back')).setPosition(GAME.WIDTH / 2 + 34, this.SPOT.y + 40).setAngle(0);
      this.roleText.setText(ko ? '내가 찰 차례 — 공에서 골대 쪽으로 휙!' : 'Your kick — flick from the ball to the goal!');
      this.state = 'aim';
    } else {
      this.keeper.setTexture('player_front').setPosition(GAME.WIDTH / 2, this.G.B + 4).setAngle(0);
      this.shooter.setTexture(this.tex('carlo', 'back')).setPosition(GAME.WIDTH / 2 - 34, this.SPOT.y + 40).setAngle(0);
      this.roleText.setText(ko ? '내가 막을 차례 — 막을 자리를 눌러요' : 'Your save — tap where to dive');
      this.state = 'keepWait';
      this.carloKick();
    }
  }

  tex(key, dir) { return this.textures.exists(key + '_' + dir) ? key + '_' + dir : key + '_front'; }

  /* 다섯 번씩 다 찼거나, 남은 기회로 따라잡을 수 없으면 끝 */
  decided() {
    const me = this.rec.me, c = this.rec.carlo, n = me.length;
    const gm = me.filter(Boolean).length, gc = c.filter(Boolean).length;
    if (n < 5) {
      const left = 5 - n;
      return gm > gc + left || gc > gm + left;
    }
    if (gm !== gc) return true;
    return n >= 8;                                      // 서든데스는 세 번까지
  }

  resetBall() {
    this.tweens.killTweensOf([this.ball, this.keeper, this.ballShadow]);
    this.ball.setPosition(this.SPOT.x, this.SPOT.y).setScale(1.7).setAngle(0).setAlpha(1);
    this.ballShadow.setPosition(this.SPOT.x, this.SPOT.y + 16).setScale(1).setAlpha(1);
    this.aimG.clear();
  }

  /* ── 내가 찰 때 ── */
  down(p) {
    if (this.state === 'aim' && Phaser.Math.Distance.Between(p.x, p.y, this.SPOT.x, this.SPOT.y) < 120 && !this.dialogue.isOpen) {
      this.drag = { x: p.x, y: p.y, t: this.time.now, pts: [{ x: p.x, y: p.y, t: this.time.now }] };
    } else if (this.state === 'keepWait' || this.state === 'keepFly') {
      this.dive(p.x, p.y);
    }
  }

  move(p) {
    if (!this.drag) return;
    this.drag.pts.push({ x: p.x, y: p.y, t: this.time.now });
    if (this.drag.pts.length > 12) this.drag.pts.shift();
    const g = this.aimG; g.clear();
    g.lineStyle(5, 0xffffff, 0.5);
    g.beginPath(); g.moveTo(this.drag.pts[0].x, this.drag.pts[0].y); this.drag.pts.forEach((q) => g.lineTo(q.x, q.y)); g.strokePath();
    if (this.drag.y - p.y > 70) this.up(p);             // 충분히 밀었으면 그 자리에서 찹니다
  }

  up(p) {
    const d = this.drag; if (!d) return;
    this.drag = null; this.aimG.clear();
    const dx = p.x - d.x, dy = p.y - d.y;
    if (dy > -30) return;                                // 위로 밀어야 찹니다
    const dt = Math.max(40, this.time.now - d.t);
    const speed = Math.hypot(dx, dy) / dt;               // px/ms
    /* 기울기 0.75(약 37°)면 골대 기둥 — 그보다 비스듬하면 옆으로 빗나갑니다 */
    let tx = this.SPOT.x + Phaser.Math.Clamp(dx / -dy, -1.6, 1.6) * (this.G.R - this.G.L) / 2 / 0.75;
    /* 빠를수록 높이 — 손가락 속도 약 2.6 px/ms 를 넘으면 크로스바 위로 */
    const lift = Phaser.Math.Clamp((speed - 0.35) / 2.2, 0, 1.25);
    let ty = this.G.B - 14 - lift * (this.G.B - this.G.T);
    tx += Phaser.Math.FloatBetween(-8, 8);
    this.shoot(tx, ty, 'me');
  }

  /* 공을 보냅니다 — who 가 찬 공, 막는 사람은 상대 */
  shoot(tx, ty, who) {
    this.state = who === 'me' ? 'fly' : 'keepFly';
    AudioSystem.swipe();
    this.tweens.add({ targets: this.shooter, y: this.shooter.y - 10, duration: 90, yoyo: true });
    const G = this.G;
    const wide = tx < G.L - 2 || tx > G.R + 2, over = ty < G.T - 2;
    const post = !over && (Math.abs(tx - G.L) < 7 || Math.abs(tx - G.R) < 7) || (!wide && Math.abs(ty - G.T) < 6);
    const dur = who === 'me' ? 620 : 700;
    this.shot = { tx: tx, ty: ty, who: who, wide: wide, over: over, post: post, at: this.time.now + dur };
    /* 차는 쪽이 가롤로면 키퍼(나)는 그동안 누를 수 있고, 내가 찼으면 가롤로가 몸을 날립니다 */
    if (who === 'me') this.carloDive(tx, ty, dur);
    this.tweens.add({ targets: this.ball, x: tx, y: ty, scale: 0.9, angle: 540, duration: dur, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: this.ballShadow, x: tx, y: Math.min(G.B + 6, this.SPOT.y + 16), scaleX: 0.5, alpha: 0.5, duration: dur });
    this.time.delayedCall(dur, () => this.resolve());
  }

  /* 가롤로 키퍼 — 반쯤은 맞는 쪽으로 몸을 날립니다. 위쪽 구석은 손이 잘 닿지 않아요 */
  carloDive(tx, ty, dur) {
    const cx = GAME.WIDTH / 2, side = tx < cx - 30 ? -1 : tx > cx + 30 ? 1 : 0;
    const read = Math.random() < 0.5 + Math.min(0.15, this.round * 0.02);
    let go = read ? side : Phaser.Utils.Array.GetRandom([-1, 0, 1]);
    const reach = go === 0 ? 0 : 108;
    this.keeperGoal = { x: cx + go * reach, y: go === 0 ? this.G.B - 40 : this.G.B - 45 };
    this.time.delayedCall(dur * 0.25, () => {
      this.tweens.add({ targets: this.keeper, x: this.keeperGoal.x, y: this.G.B + 4 - (go === 0 ? 14 : 6), angle: go * 62, duration: dur * 0.5, ease: 'Quad.easeOut' });
    });
  }

  /* ── 내가 막을 때 — 가롤로가 달려와 찹니다 ── */
  carloKick() {
    const G = this.G;
    /* 여섯 칸 중 하나(가끔은 빗나감) */
    const col = Phaser.Math.Between(-1, 1), high = Math.random() < 0.45;
    let tx = GAME.WIDTH / 2 + col * Phaser.Math.Between(70, 112), ty = high ? G.T + 22 : G.B - 26;
    if (Math.random() < 0.1) { if (Math.random() < 0.5) tx = col <= 0 ? G.L - 20 : G.R + 20; else ty = G.T - 24; }
    this.carloTarget = { tx: tx, ty: ty };
    this.dived = null;
    /* 몸이 기우는 쪽 — 70% 는 정직하게 */
    const honest = Math.random() < 0.7, lean = honest ? Math.sign(col) : -Math.sign(col) || Phaser.Utils.Array.GetRandom([-1, 1]);
    this.time.delayedCall(650, () => { if (!this.finished) this.tweens.add({ targets: this.shooter, angle: lean * 7, duration: 300 }); });
    this.tweens.add({ targets: this.shooter, x: this.SPOT.x - 14, y: this.SPOT.y + 34, duration: 1100, delay: 200, ease: 'Sine.easeIn' });
    this.time.delayedCall(1400, () => { if (!this.finished) this.shoot(tx, ty, 'carlo'); });
  }

  dive(x, y) {
    if (this.dived) return;
    const G = this.G, cx = GAME.WIDTH / 2;
    const gx = Phaser.Math.Clamp(x, cx - 118, cx + 118), gy = Phaser.Math.Clamp(y, G.T + 10, G.B - 10);
    this.dived = { x: gx, y: gy, at: this.time.now };
    const go = gx < cx - 30 ? -1 : gx > cx + 30 ? 1 : 0;
    this.keeperGoal = { x: gx, y: gy };
    this.tweens.add({ targets: this.keeper, x: gx, y: G.B + 4 - (G.B - gy) * 0.35, angle: go * 60, duration: 260, ease: 'Quad.easeOut' });
    AudioSystem.step();
  }

  /* ── 들어갔나? ── */
  resolve() {
    const s = this.shot, G = this.G, ko = I18N.lang === 'ko';
    if (!s) return;
    this.shot = null;
    let goal = !s.wide && !s.over && !s.post;
    let saved = false;
    if (goal) {
      /* 키퍼가 날아간 자리와 공이 닿은 자리 */
      let k = this.keeperGoal || { x: GAME.WIDTH / 2, y: G.B - 40 };
      if (s.who === 'carlo' && (!this.dived)) k = { x: GAME.WIDTH / 2, y: G.B - 40 };
      const reachX = s.who === 'me' ? 46 : 54, reachY = s.who === 'me' ? 52 : 60;
      const corner = Math.abs(s.tx - GAME.WIDTH / 2) > 100 && s.ty < G.T + 34;
      if (Math.abs(s.tx - k.x) < reachX && Math.abs(s.ty - k.y) < reachY && !(corner && s.who === 'me' && Math.random() < 0.6)) saved = true;
      if (saved) goal = false;
    }
    const rec = s.who === 'me' ? this.rec.me : this.rec.carlo;
    rec.push(goal);
    this.renderBoard();
    const hud = this.hud || this.ensureHud();
    let line;
    if (s.who === 'me') {
      if (goal) {
        const corner = Math.abs(s.tx - GAME.WIDTH / 2) > 95 && s.ty < G.T + 40;
        hud.hit(corner ? 150 : 100, s.tx, s.ty - 30, corner ? (ko ? '구석!' : 'Top corner!') : (ko ? '골!' : 'Goal!'));
        GameFX.burst(this, s.tx, s.ty, { count: 24, speed: 200 });
        AudioSystem.chime();
        line = ko ? '골!!' : 'GOAL!!';
        this.netShake();
      } else {
        hud.miss(s.tx, s.ty);
        line = saved ? (ko ? '가롤로가 막았다!' : 'Carlo saves it!') : s.post ? (ko ? '땡! 골대!' : 'Clang! The post!') : s.over ? (ko ? '하늘로 날아갔다…' : 'Way over the bar…') : (ko ? '옆으로 빗나갔다' : 'Wide of the post');
        if (!saved) this.bounceOut(s);
      }
    } else {
      if (goal) { hud.miss(s.tx, s.ty); line = ko ? '가롤로 골…!' : 'Carlo scores…!'; this.netShake(); }
      else if (saved) {
        hud.hit(100, s.tx, s.ty - 30, ko ? '선방!' : 'Save!');
        GameFX.burst(this, s.tx, s.ty, { count: 20, speed: 180 });
        AudioSystem.chime();
        line = ko ? '막았다!!' : 'SAVED!!';
      } else { line = s.post ? (ko ? '골대! 살았다' : 'Off the post! Phew') : (ko ? '가롤로가 빗나갔다' : 'Carlo misses'); this.bounceOut(s); }
    }
    this.flash(line, goal || saved);
    this.round++;
    this.time.delayedCall(1500, () => this.nextTurn());
  }

  netShake() {
    this.tweens.add({ targets: this.ball, y: this.ball.y - 6, duration: 80, yoyo: true, repeat: 2 });
    this.cameras.main.shake(140, 0.004);
  }

  bounceOut(s) {
    const dx = s.tx < GAME.WIDTH / 2 ? -1 : 1;
    this.tweens.add({ targets: this.ball, x: this.ball.x + dx * 60, y: this.ball.y - 40, alpha: 0, duration: 500, ease: 'Quad.easeOut' });
  }

  flash(t, good) {
    this.say.setText(t).setColor(good ? '#fff3c4' : '#ffffff').setAlpha(0).setScale(0.7);
    this.tweens.killTweensOf(this.say);
    this.tweens.add({ targets: this.say, alpha: 1, scale: 1, duration: 200, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.say, alpha: 0, delay: 1000, duration: 300 });
  }

  gameStars() {
    const good = this.rec.me.filter(Boolean).length + this.rec.carlo.filter((x) => !x).length;
    return good >= 7 ? 3 : good >= 4 ? 2 : 1;
  }

  end() {
    this.state = 'end';
    this.roleText.setText('');
    const ko = I18N.lang === 'ko';
    const me = this.rec.me.filter(Boolean).length, c = this.rec.carlo.filter(Boolean).length;
    const lines = [
      ko ? '나 ' + me + ' : ' + c + ' 가롤로.' : 'Me ' + me + ' : ' + c + ' Carlo.',
      me > c ? { s: '가롤로', t: '졌다! 마지막 거 진짜 못 막겠더라ㅋㅋ' } : me < c ? { s: '가롤로', t: '이번엔 내가 이겼네. 근데 너 막는 거 꽤 하던데?' } : { s: '가롤로', t: '비겼다! 이런 게 제일 좋아. 내일 또 하면 되니까.' },
      { s: '가롤로', t: '공 차고 나면 같이 성당 들렀다 가자. 오늘 고마웠다고 말하게.' }
    ];
    this.complete(lines);
  }
};
