/* 미니게임 · 가롤로와 볼링 (2005 밀라노)
   토요일 오후, 동네 볼링장. 가롤로와 번갈아 굴립니다.

   - 레인 아래쪽을 누르면 그 자리에 공을 놓고, 누른 채 뒤로 당겼다가 놓으면 굴러갑니다.
     많이 당길수록 세게, 비스듬히 당기면 그 반대쪽으로 갑니다.
   - 핀은 진짜처럼 서로 부딪혀 넘어집니다(레인은 미터 단위로 계산하고, 화면에는 원근으로 그립니다).
   - 다섯 프레임. 스트라이크·스페어 점수 계산은 볼링 그대로입니다. 마지막 프레임은 보너스 투구가 있어요. */

window.BowlingScene = class BowlingScene extends MiniGameScene {
  constructor() { super('BowlingScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#1e1a2a', warm: false,
      title: '가롤로와 볼링', hint: '레인 아래를 누른 채 뒤로 당겼다가 놓으면 굴러가요.'
    });
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.place = (data && data.place) || 'milano';     // milano: 2005 밀라노 · seoul: 우리 동네(DAY 7)
    this.makeTextures();

    /* 레인 — 미터 단위 */
    this.LW = 1.05;              // 레인 폭
    this.HEAD = 16.6;            // 1번 핀 자리
    this.END = 18.0;             // 핀 덱 끝(그 뒤는 핏)
    this.BR = 0.11; this.PR = 0.062;
    this.FRAMES = 5;

    const top = this.contentTop();
    this.boardY = top + 2;
    /* 원근 — y = yH + A / (v + D), 크기 s = D / (v + D) */
    this.yNear = H - 40; this.yFar = this.boardY + 150;
    this.D = 20;
    this.A = (this.yNear - this.yFar) / (1 / this.D - 1 / (this.END + this.D));
    this.yH = this.yNear - this.A / this.D;
    this.K = 196;                // 가까운 쪽에서 1m 가 몇 px

    this.drawAlley();
    this.drawBoard();

    this.ballImg = this.add.image(0, 0, 'bowl_ball').setScale(0.5).setVisible(false);
    this.ballShadow = this.add.ellipse(0, 0, 30, 10, 0x000000, 0.3).setVisible(false);
    this.aimG = this.add.graphics().setDepth(300);
    this.pins = [];

    /* 사람들 */
    this.carlo = this.add.image(40, H - 96, 'carlo_front').setScale(1.35).setDepth(400);
    this.meImg = this.add.image(W - 40, H - 96, 'player_front').setScale(1.35).setDepth(400);
    this.talk = this.add.text(W / 2, this.boardY + 114, '', UI.style(FONT.small, PAL.cream, { align: 'center', stroke: '#1a1420', strokeThickness: 4, wordWrap: { width: W - 60 } }))
      .setOrigin(0.5).setDepth(450);
    this.turnText = this.add.text(W / 2, H - 22, '', UI.style(15, '#ffe7a8', { stroke: '#1a1420', strokeThickness: 4 })).setOrigin(0.5).setDepth(450);

    /* 조작 */
    this.input.on('pointerdown', (p) => this.down(p));
    this.input.on('pointermove', (p) => this.move(p));
    this.input.on('pointerup', (p) => this.up(p));

    this.score = { me: [], carlo: [] };
    this.frame = 0; this.who = 'me'; this.ballNo = 0;
    this.state = 'wait';
    this.time.delayedCall(10, () => {
      this.dialogue.play([
        { t: this.place === 'seoul' ? '목요일 오후, 동네 상가 지하의 작은 볼링장. 핀 쓰러지는 소리가 천장에 울린다.' : '토요일 오후, 밀라노의 작은 볼링장. 핀 쓰러지는 소리가 천장에 울린다.' },
        { s: '가롤로', t: '다섯 프레임만 하자. 내가 먼저 할까? 아니, 너 먼저!' },
        { s: '가롤로', t: '아래를 누르고 뒤로 쭉 당겼다가 놔. 새총처럼.' }
      ], () => this.startTurn());
    });
  }

  /* ── 그림 재료 ── */
  makeTextures() {
    const T = TextureFactory.canvasTex;
    T(this, 'bowl_pin', 40, 96, (c, w, h) => {
      c.save(); c.scale(2, 2);
      const g = c.createLinearGradient(2, 0, 18, 0);
      g.addColorStop(0, '#d9d4cc'); g.addColorStop(0.35, '#ffffff'); g.addColorStop(1, '#bfb8ae');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(10, 1);
      c.bezierCurveTo(14, 1, 14.5, 8, 12.6, 13);
      c.bezierCurveTo(12, 15, 12, 17, 14.5, 22);
      c.bezierCurveTo(19, 31, 18, 42, 13.5, 47);
      c.lineTo(6.5, 47);
      c.bezierCurveTo(2, 42, 1, 31, 5.5, 22);
      c.bezierCurveTo(8, 17, 8, 15, 7.4, 13);
      c.bezierCurveTo(5.5, 8, 6, 1, 10, 1);
      c.fill();
      c.fillStyle = '#d23a3a'; c.fillRect(7.6, 12.4, 4.8, 1.6); c.fillRect(7.4, 15.2, 5.2, 1.4);
      c.restore();
    });
    T(this, 'bowl_ball', 48, 48, (c) => {
      const g = c.createRadialGradient(17, 15, 3, 24, 24, 24);
      g.addColorStop(0, '#7fb0ff'); g.addColorStop(0.45, '#2f5fc9'); g.addColorStop(1, '#14286a');
      c.fillStyle = g; c.beginPath(); c.arc(24, 24, 23, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.arc(30, 30, 9, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#0b1230';
      [[21, 15, 3.2], [28, 16, 3.2], [24, 25, 3.8]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); });
    });
  }

  /* 미터 → 화면 */
  P(u, v) {
    const s = this.D / (v + this.D);
    return { x: GAME.WIDTH / 2 + u * this.K * s, y: this.yH + this.A / (v + this.D), s: s };
  }

  drawAlley() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const g = this.add.graphics().setDepth(-60);
    /* 벽과 이웃 레인 */
    g.fillStyle(0x2a2238, 1); g.fillRect(0, this.boardY + 60, W, H);
    const quad = (u0, u1, v0, v1, col, a) => {
      const a0 = this.P(u0, v0), a1 = this.P(u1, v0), b1 = this.P(u1, v1), b0 = this.P(u0, v1);
      g.fillStyle(col, a === undefined ? 1 : a);
      g.fillPoints([{ x: a0.x, y: a0.y }, { x: a1.x, y: a1.y }, { x: b1.x, y: b1.y }, { x: b0.x, y: b0.y }], true);
    };
    [-2.1, 2.1].forEach((c) => { quad(c - 0.53, c + 0.53, -0.4, this.END, 0x8a6a48, 0.55); });
    /* 도랑 */
    quad(-0.78, -0.53, -0.4, this.END, 0x3a3440); quad(0.53, 0.78, -0.4, this.END, 0x3a3440);
    /* 나무 레인 — 앞은 밝고 멀수록 어둡게, 판자 줄무늬 */
    const N = 30;
    for (let i = 0; i < N; i++) {
      const v0 = -0.4 + (this.END + 0.4) * i / N, v1 = -0.4 + (this.END + 0.4) * (i + 1) / N;
      const f = i / N;
      const col = Phaser.Display.Color.GetColor(Math.round(222 - 60 * f), Math.round(176 - 52 * f), Math.round(116 - 40 * f));
      quad(-0.53, 0.53, v0, v1, col);
    }
    g.lineStyle(1, 0x8a5e34, 0.35);
    for (let k = 1; k < 13; k++) {
      const u = -0.53 + 1.06 * k / 13, a = this.P(u, -0.4), b = this.P(u, this.END);
      g.lineBetween(a.x, a.y, b.x, b.y);
    }
    /* 반사광 */
    quad(-0.18, 0.06, 0.5, 14, 0xffffff, 0.08);
    /* 파울 라인 · 점 · 화살표 */
    const fl0 = this.P(-0.53, 0), fl1 = this.P(0.53, 0);
    g.lineStyle(3, 0x30201a, 0.8); g.lineBetween(fl0.x, fl0.y, fl1.x, fl1.y);
    for (let k = -2; k <= 2; k++) {
      const a = this.P(k * 0.18, 2.0); g.fillStyle(0x4a2e1a, 0.8); g.fillEllipse(a.x, a.y, 5 * a.s + 2, 2.5 * a.s + 1);
      const t = this.P(k * 0.18, 4.6 + Math.abs(k) * 0.35), t2 = this.P(k * 0.18, 4.9 + Math.abs(k) * 0.35);
      g.fillStyle(0x4a2e1a, 0.8); g.fillTriangle(t.x - 4 * t.s, t.y, t.x + 4 * t.s, t.y, t2.x, t2.y);
    }
    /* 핀 덱과 그 뒤 검은 핏, 위쪽 마스킹 */
    quad(-0.53, 0.53, 15.9, this.END, 0xe6c08e, 0.35);
    const pit = this.P(-0.9, this.END), pit2 = this.P(0.9, this.END);
    g.fillStyle(0x0d0a12, 1); g.fillRect(0, this.boardY + 60, W, pit.y - (this.boardY + 60));
    g.fillStyle(0x15111d, 1); g.fillRect(pit.x - 6, pit.y - 34, pit2.x - pit.x + 12, 34);
    /* 위 간판 */
    const neon = this.add.text(W / 2, this.boardY + 80, (this.place === 'seoul' ? 'BOWLING · SEOUL' : 'BOWLING · MILANO'), UI.style(15, '#ff9ad0', { stroke: '#5a1a40', strokeThickness: 3 })).setOrigin(0.5).setDepth(-50);
    this.tweens.add({ targets: neon, alpha: 0.7, duration: 900, yoyo: true, repeat: -1 });
  }

  /* ── 점수판 ── */
  drawBoard() {
    const W = GAME.WIDTH;
    this.boardG = this.add.graphics().setDepth(420);
    this.boardTexts = [];
  }

  renderBoard() {
    const W = GAME.WIDTH, y0 = this.boardY, g = this.boardG;
    g.clear();
    this.boardTexts.forEach((t) => t.destroy()); this.boardTexts = [];
    const x0 = 14, nameW = 54, fw = (W - 28 - nameW - 46) / this.FRAMES, rh = 26;
    g.fillStyle(0xfdf6e8, 0.96); g.fillRoundedRect(x0, y0, W - 28, rh * 2 + 4, 8);
    g.lineStyle(1, 0x8a7a66, 0.6);
    for (let i = 0; i <= this.FRAMES; i++) g.lineBetween(x0 + nameW + i * fw, y0 + 2, x0 + nameW + i * fw, y0 + rh * 2 + 2);
    g.lineBetween(x0 + 4, y0 + rh + 2, W - 18, y0 + rh + 2);
    const add = (x, y, s, size, col) => { const t = this.add.text(x, y, s, UI.style(size, col || PAL.ink)).setOrigin(0.5).setDepth(421); this.boardTexts.push(t); return t; };
    [['me', '나'], ['carlo', '가롤로']].forEach(([k, name], row) => {
      const y = y0 + 2 + rh * row + rh / 2;
      if (this.who === k && this.state !== 'end') { g.fillStyle(0xffd27a, 0.45); g.fillRect(x0 + 2, y - rh / 2 + 1, nameW - 3, rh - 2); }
      add(x0 + nameW / 2, y, name, 13);
      const rolls = this.score[k], marks = this.marks(rolls), tot = this.totals(rolls);
      for (let f = 0; f < this.FRAMES; f++) {
        const cx = x0 + nameW + f * fw + fw / 2;
        add(cx, y - 6, marks[f] ? marks[f].join(' ') : '', 11, '#6a4a2a');
        if (tot[f] !== undefined) add(cx, y + 6, String(tot[f]), 12);
      }
      const all = tot.length ? tot[tot.length - 1] : 0;
      add(W - 14 - 23, y, String(all), 15, '#a0402a');
    });
  }

  /* 프레임마다 굴린 결과를 표시(X / - 숫자) */
  marks(rolls) {
    const out = []; let i = 0;
    for (let f = 0; f < this.FRAMES && i < rolls.length; f++) {
      const last = f === this.FRAMES - 1;
      const m = [];
      if (!last) {
        if (rolls[i] === 10) { m.push('X'); i++; }
        else { m.push(rolls[i] ? String(rolls[i]) : '-'); if (i + 1 < rolls.length) m.push(rolls[i] + rolls[i + 1] === 10 ? '/' : (rolls[i + 1] ? String(rolls[i + 1]) : '-')); i += 2; }
      } else {
        let prev = null;
        for (let k = i; k < rolls.length; k++) {
          const r = rolls[k];
          if (r === 10 && (prev === null || prev === 10 || prev === 'spare')) { m.push('X'); prev = 10; }
          else if (prev !== null && prev !== 10 && prev !== 'spare' && prev + r === 10) { m.push('/'); prev = 'spare'; }
          else { m.push(r ? String(r) : '-'); prev = r; }
        }
        i = rolls.length;
      }
      out.push(m);
    }
    return out;
  }

  /* 누적 점수 — 스트라이크·스페어 보너스가 정해진 프레임까지만 */
  totals(rolls) {
    const out = []; let i = 0, sum = 0;
    for (let f = 0; f < this.FRAMES; f++) {
      if (i >= rolls.length) break;
      if (rolls[i] === 10) {
        if (i + 2 >= rolls.length) break;
        sum += 10 + rolls[i + 1] + rolls[i + 2]; i += 1;
      } else {
        if (i + 1 >= rolls.length) break;
        if (rolls[i] + rolls[i + 1] === 10) { if (i + 2 >= rolls.length) break; sum += 10 + rolls[i + 2]; }
        else sum += rolls[i] + rolls[i + 1];
        i += 2;
      }
      out.push(sum);
    }
    return out;
  }

  /* ── 차례 ── */
  startTurn() {
    this.ballNo = 0;
    this.setPins(null);
    this.renderBoard();
    this.nextBall();
  }

  nextBall() {
    this.state = 'aim';
    this.ball = { u: 0, v: 0.25, vu: 0, vv: 0, roll: 0, gutter: 0 };
    this.placeBall();
    this.ballImg.setVisible(true); this.ballShadow.setVisible(true);
    const mine = this.who === 'me';
    const ko = I18N.lang === 'ko', fr = this.frame + 1;
    this.turnText.setText(ko
      ? (mine ? (this.ballNo === 0 ? '내 차례' : '한 번 더') : '가롤로 차례') + ' · ' + fr + ' 프레임'
      : (mine ? (this.ballNo === 0 ? 'My turn' : 'One more') : "Carlo's turn") + ' · Frame ' + fr);
    [this.meImg, this.carlo].forEach((im) => im.setAlpha(0.6));
    (mine ? this.meImg : this.carlo).setAlpha(1);
    if (!mine) this.time.delayedCall(900, () => this.carloThrow());
  }

  /* 핀 세우기 — keep 이 있으면 그 핀만(두 번째 투구) */
  setPins(keep) {
    this.pins.forEach((p) => p.img.destroy());
    this.pins = [];
    const sp = 0.305, row = sp * Math.sqrt(3) / 2;
    let n = 0;
    for (let r = 0; r < 4; r++) for (let k = 0; k <= r; k++) {
      const id = n++;
      if (keep && keep.indexOf(id) < 0) continue;
      const p = { id: id, u: (k - r / 2) * sp, v: this.HEAD + r * row, vu: 0, vv: 0, down: false, gone: false, tilt: 0, spin: 0 };
      p.img = this.add.image(0, 0, 'bowl_pin').setOrigin(0.5, 0.95);
      this.pins.push(p);
    }
    this.drawPins();
  }

  drawPins() {
    this.pins.forEach((p) => {
      if (p.gone) { p.img.setVisible(false); return; }
      const q = this.P(p.u, p.v);
      p.img.setPosition(q.x, q.y).setScale(q.s * 0.7).setDepth(200 - p.v * 5).setAngle(p.tilt);
      if (p.down) p.img.setAlpha(Math.max(0.15, p.img.alpha - 0.004));
    });
  }

  placeBall() {
    const b = this.ball, q = this.P(b.u, b.v);
    this.ballImg.setPosition(q.x, q.y - 13 * q.s).setScale(q.s * 0.6).setDepth(200 - b.v * 5 + 0.5).setRotation(b.roll);
    this.ballShadow.setPosition(q.x + 3 * q.s, q.y).setSize(30 * q.s, 9 * q.s).setDepth(200 - b.v * 5);
  }

  /* ── 손가락 ── */
  down(p) {
    if (this.state !== 'aim' || this.who !== 'me' || this.dialogue.isOpen) return;
    if (p.y < this.P(0, 3.2).y) return;
    this.drag = { x: p.x, y: p.y };
    /* 누른 자리에 공을 놓습니다 */
    const u = (p.x - GAME.WIDTH / 2) / this.K;
    this.ball.u = Phaser.Math.Clamp(u, -0.4, 0.4);
    this.placeBall();
  }

  move(p) {
    if (!this.drag || this.state !== 'aim') return;
    const dx = this.drag.x - p.x, dy = this.drag.y - p.y;
    this.aim = { dx: dx, dy: dy };
    this.drawAim();
  }

  up() {
    if (!this.drag) return;
    this.drag = null;
    const a = this.aim; this.aim = null; this.aimG.clear();
    if (!a || a.dy > -18) return;                  // 아래로 당겨야 던집니다
    const pull = Math.min(1, -a.dy / 170);
    const ang = Phaser.Math.Clamp(Math.atan2(a.dx, -a.dy), -0.6, 0.6) * 0.13;
    this.throwBall(ang, 4.6 + pull * 4.6);
  }

  drawAim() {
    const g = this.aimG; g.clear();
    const a = this.aim; if (!a || a.dy > -10) return;
    const pull = Math.min(1, -a.dy / 170);
    const ang = Phaser.Math.Clamp(Math.atan2(a.dx, -a.dy), -0.6, 0.6) * 0.13;
    const b = this.ball;
    const len = 4 + pull * 12;
    for (let k = 1; k <= 14; k++) {
      const v = b.v + len * k / 14, u = b.u + Math.tan(ang) * (v - b.v);
      const q = this.P(u, v);
      g.fillStyle(0xffffff, 0.85 - k * 0.05); g.fillCircle(q.x, q.y, 3.4 * q.s + 0.8);
    }
    const q = this.P(b.u, b.v);
    g.fillStyle(pull > 0.85 ? 0xe8705a : 0xffd27a, 1); g.fillRoundedRect(q.x - 30, q.y + 18, 60 * pull, 6, 3);
    g.lineStyle(1, 0xffffff, 0.6); g.strokeRoundedRect(q.x - 30, q.y + 18, 60, 6, 3);
  }

  throwBall(ang, speed) {
    this.state = 'roll';
    this.rollT = 0;
    if (this.who === 'me') ang += Phaser.Math.FloatBetween(-0.005, 0.005);      // 레인 기름 — 같은 공은 없습니다
    this.ball.vu = Math.sin(ang) * speed;
    this.ball.vv = Math.cos(ang) * speed;
    this.standingBefore = this.pins.filter((p) => !p.down && !p.gone).length;
    AudioSystem.swipe();
  }

  /* 가롤로 — 포켓(1·3번 사이)을 노리지만 늘 정확하진 않아요 */
  carloThrow() {
    if (this.finished) return;
    const standing = this.pins.filter((p) => !p.down && !p.gone);
    let tu = 0.07;
    if (this.ballNo === 1 && standing.length) {
      tu = standing.reduce((s, p) => s + p.u, 0) / standing.length;
    }
    const u0 = Phaser.Math.FloatBetween(-0.12, 0.12);
    this.ball.u = u0; this.placeBall();
    const ang = Math.atan2(tu - u0 + Phaser.Math.FloatBetween(-0.16, 0.16), this.HEAD - this.ball.v);
    this.time.delayedCall(400, () => this.throwBall(ang, Phaser.Math.FloatBetween(6.5, 8.6)));
  }

  /* ── 물리 ── */
  update(time, delta) {
    if (this.state !== 'roll') return;
    const steps = 6, dt = Math.min(delta, 40) / 1000 / steps;
    for (let s = 0; s < steps; s++) this.step(dt);
    this.rollT += Math.min(delta, 40) / 1000;
    this.placeBall(); this.drawPins();
    const b = this.ball;
    const moving = this.pins.some((p) => !p.gone && Math.hypot(p.vu, p.vv) > 0.05);
    if ((b.v > this.END + 0.6 || b.stopped) && (!moving || this.rollT > 6)) this.settle();
    if (this.rollT > 9) this.settle();
  }

  step(dt) {
    const b = this.ball, LW2 = this.LW / 2;
    if (b.v < this.END + 1) {
      b.u += b.vu * dt; b.v += b.vv * dt;
      b.roll += b.vv * dt * 4;
      /* 도랑 — 빠지면 핀에 닿지 못하고 끝까지 굴러갑니다 */
      if (!b.gutter && Math.abs(b.u) > LW2 - 0.02) {
        b.gutter = Math.sign(b.u); b.vu = 0;
        if (this.who === 'me') this.say(Phaser.Utils.Array.GetRandom(['앗, 도랑!', '도랑으로 갔다ㅋㅋ 괜찮아.']));
      }
      if (b.gutter) b.u = b.gutter * (LW2 + 0.12);
      b.vv = Math.max(0.6, b.vv - 0.12 * dt);
    } else b.stopped = true;

    const R = this.BR, r = this.PR;
    this.pins.forEach((p) => {
      if (p.gone) return;
      p.u += p.vu * dt; p.v += p.vv * dt;
      const sp = Math.hypot(p.vu, p.vv);
      if (sp > 0) { const f = Math.max(0, sp - (p.down ? 2.2 : 3.2) * dt) / sp; p.vu *= f; p.vv *= f; }
      if (p.down) p.tilt += p.spin * dt;
      if (Math.abs(p.u) > LW2 + 0.2 || p.v > this.END + 0.4 || p.v < this.HEAD - 1.6) { p.gone = true; p.down = true; }
      else if (Math.abs(p.u) > LW2) { p.down = true; }
      /* 공과 핀 */
      if (!b.gutter && b.v < this.END + 0.5) this.collide(b, p, R + r, 7, 1.5);
    });
    for (let i = 0; i < this.pins.length; i++) for (let j = i + 1; j < this.pins.length; j++) {
      const a = this.pins[i], c = this.pins[j];
      if (a.gone || c.gone) continue;
      this.collide(a, c, r * 2 + (a.down || c.down ? 0.05 : 0), 1.5, 1.5);
    }
  }

  /* 두 원의 충돌 — 부딪힌 핀은 넘어집니다 */
  collide(a, c, dist, ma, mc) {
    const du = c.u - a.u, dv = c.v - a.v, d = Math.hypot(du, dv);
    if (d >= dist || d === 0) return;
    const nu = du / d, nv = dv / d;
    const rel = (a.vu - c.vu) * nu + (a.vv - c.vv) * nv;
    /* 겹친 만큼 떼어 놓기 */
    const push = (dist - d) / (ma + mc);
    a.u -= nu * push * mc; a.v -= nv * push * mc; c.u += nu * push * ma; c.v += nv * push * ma;
    if (rel <= 0) return;
    const e = 0.72, j = (1 + e) * rel / (1 / ma + 1 / mc);
    a.vu -= j / ma * nu; a.vv -= j / ma * nv; c.vu += j / mc * nu; c.vv += j / mc * nv;
    [a, c].forEach((p) => {
      if (p.id === undefined || p.down) return;
      if (rel > 0.25) {
        p.down = true; p.spin = Phaser.Math.Between(-1, 1) * 340 + (p.vu >= 0 ? 280 : -280);
        if (!this._clackAt || this.time.now - this._clackAt > 60) { this._clackAt = this.time.now; AudioSystem.blip(); }
      }
    });
  }

  /* 굴러간 결과 */
  settle() {
    if (this.state !== 'roll') return;
    this.state = 'wait';
    this.ballImg.setVisible(false); this.ballShadow.setVisible(false);
    const standing = this.pins.filter((p) => !p.down && !p.gone);
    const knocked = this.standingBefore - standing.length;
    const rolls = this.score[this.who];
    rolls.push(knocked);
    const last = this.frame === this.FRAMES - 1;
    const mine = this.who === 'me';
    const hud = this.ensureHud();

    let msg = '';
    const allDown = standing.length === 0;
    if (allDown && this.ballNo === 0) msg = mine ? '스트라이크!' : '가롤로 스트라이크!';
    else if (allDown) msg = mine ? '스페어!' : '가롤로 스페어!';
    else if (knocked === 0) msg = mine ? '하나도…' : '가롤로: 아… 하나도 ㅋㅋ';
    else msg = I18N.lang === 'ko' ? knocked + (mine ? '개 쓰러뜨렸다' : '개 — 가롤로') : knocked + (mine ? ' pins down' : ' pins — Carlo');
    this.banner(msg, allDown);
    if (mine) {
      /* 점수판의 점수는 볼링 점수 그대로 — 스트라이크가 이어지면 ‘연속’ */
      if (allDown && this.ballNo === 0) { hud.combo++; hud.hits++; hud.maxCombo = Math.max(hud.maxCombo, hud.combo); }
      else if (this.ballNo === 0 || !allDown) hud.combo = 0;
      if (allDown) GameFX.burst(this, GAME.WIDTH / 2, this.P(0, this.HEAD).y, { count: 26, speed: 200 });
      this.say(allDown ? (this.ballNo === 0 ? Phaser.Utils.Array.GetRandom(['Strike!! 대박!', '와, 깔끔하다!']) : '나이스 스페어!') : knocked >= 7 ? '거의 다 됐어!' : '');
    } else {
      this.say(allDown ? Phaser.Utils.Array.GetRandom(['오, 됐다!', '오늘 손이 좀 풀렸네ㅋㅋ']) : knocked <= 3 ? '…볼링은 컴퓨터보다 어렵네ㅋㅋ' : '');
    }
    this.renderBoard();
    if (mine) { const t = this.myTotal(); if (t !== hud.score) hud.add(t - hud.score); }

    this.time.delayedCall(1300, () => {
      /* 다음은? */
      let more;
      if (!last) more = this.ballNo === 0 && !allDown;
      else {
        const fr = rolls.slice(this.frameStart(rolls));
        const n = fr.length;
        more = n < 2 || (n === 2 && (fr[0] === 10 || fr[0] + fr[1] === 10));
      }
      if (more) {
        this.ballNo++;
        if (allDown) this.setPins(null);
        else this.setPins(standing.map((p) => p.id));
        this.nextBall();
        return;
      }
      /* 차례 넘기기 */
      if (this.who === 'me') { this.who = 'carlo'; this.startTurn(); return; }
      this.who = 'me';
      this.frame++;
      if (this.frame >= this.FRAMES) { this.end(); return; }
      this.startTurn();
    });
  }

  /* 마지막 프레임이 몇 번째 투구부터인지 */
  frameStart(rolls) {
    let i = 0;
    for (let f = 0; f < this.FRAMES - 1; f++) i += rolls[i] === 10 ? 1 : 2;
    return i;
  }

  banner(msg, big) {
    const t = this.add.text(GAME.WIDTH / 2, this.P(0, 9).y, msg, UI.style(big ? 34 : 24, big ? '#ffe07a' : '#ffffff', { stroke: '#2a1a10', strokeThickness: 6 }))
      .setOrigin(0.5).setDepth(460).setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' });
    this.tweens.add({ targets: t, alpha: 0, y: t.y - 30, delay: 900, duration: 400, onComplete: () => t.destroy() });
    if (big) AudioSystem.chime();
  }

  say(t) {
    if (!t) return;
    this.talk.setText(t).setAlpha(0);
    this.tweens.killTweensOf(this.talk);
    this.tweens.add({ targets: this.talk, alpha: 1, duration: 200 });
    this.tweens.add({ targets: this.talk, alpha: 0, delay: 2200, duration: 400 });
  }

  myTotal() { const t = this.totals(this.score.me); return t.length ? t[t.length - 1] : 0; }

  gameStars() { const s = this.myTotal(); return s >= 100 ? 3 : s >= 60 ? 2 : 1; }

  end() {
    this.state = 'end';
    this.renderBoard();
    this.turnText.setText('');
    const me = this.myTotal(), ct = this.totals(this.score.carlo), carlo = ct.length ? ct[ct.length - 1] : 0;
    const ko = I18N.lang === 'ko';
    const lines = [
      ko ? '나 ' + me + '점, 가롤로 ' + carlo + '점.' : 'Me ' + me + ', Carlo ' + carlo + '.',
      me >= carlo ? { s: '가롤로', t: '네가 이겼다! 다음엔 내가 이길 거야ㅋㅋ' } : { s: '가롤로', t: '이번엔 내가 이겼네. 근데 너 마지막 거 진짜 좋았어.' },
      { s: '가롤로', t: '핀은 다시 세우면 되잖아. 넘어져도 다시 서는 거, 그게 좋아.' }
    ];
    this.complete(lines);
  }
};
