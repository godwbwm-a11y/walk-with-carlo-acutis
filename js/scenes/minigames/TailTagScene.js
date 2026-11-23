/* 에필로그 미니게임 · 꼬리잡기
   WYD 교구 대회로 본당에 온 외국 청소년들과 본당 주일학교 친구들이 섞여 두 줄을 만듭니다.
   앞사람 어깨를 잡고 한 줄로 — 머리는 저쪽 줄 끝(꼬리)의 손수건을 잡으러 가고,
   꼬리는 잡히지 않게 몸을 흔들어 피합니다.

   - 우리 줄의 머리는 '나'. 화면을 밀어 움직입니다(PC 는 방향키).
   - 줄은 머리가 지나간 길을 그대로 따라옵니다 — 휙 돌면 꼬리가 크게 휘둘립니다.
   - 꼬리를 잡으면 잡힌 친구가 잡은 쪽 줄 끝에 붙습니다. 줄이 길어질수록 내 꼬리를 지키기 어려워집니다.
   - 한쪽 줄이 머리만 남거나, 시간이 다 되면 한 판이 끝납니다.
   마지막에는 두 줄이 하나로 이어져 마당을 한 바퀴 돕니다.

   난이도 —
   - 쉬움: 두 줄. 저쪽 머리는 우리 꼬리만 쫓습니다.
   - 보통: 세 줄! 저쪽 줄들끼리도 서로 꼬리를 잡고, 줄마다 움직임이 다릅니다
           (꼬리 뒤로 파고들기 · 옆으로 돌아 들어오기 · 지그재그로 꼬리 흔들기, 그리고 가끔 헛걸음).
   - 어려움: 보통과 같고, 저쪽 머리들이 더 빠르고 더 날쌔게 돕니다. */

window.TailTagScene = class TailTagScene extends MiniGameScene {
  constructor() { super('TailTagScene'); }

  create(data) {
    const T = EPI.tag;
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#5e5a50',
      title: T.title, hint: T.hint
    });
    const W = GAME.WIDTH, H = GAME.HEIGHT;

    /* 마당 — 화강석 판석, 분필로 그은 놀이 테두리 */
    if (window.Townscape) Townscape.strip(this, 'scn_plaza', 0, 0, W, H, { depth: -95 });
    const top = this.contentTop() + 6;
    this.F = { L: 22, R: W - 22, T: top + 26, B: H - 30 };
    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0x1c160e, 0.35); g.fillRect(0, 0, W, top);                    // 머리글이 읽히도록
    g.lineStyle(3, 0xf6f0e2, 0.6);
    g.strokeRoundedRect(this.F.L - 8, this.F.T - 20, this.F.R - this.F.L + 16, this.F.B - this.F.T + 26, 26);
    g.lineStyle(2, 0xf6f0e2, 0.25);
    g.strokeCircle(W / 2, (this.F.T + this.F.B) / 2, 70);
    /* 가장자리 — 성모당 화단과 나무 그늘 */
    if (this.textures.exists('epi_grotto')) this.add.image(W - 46, top + 6, 'epi_grotto').setOrigin(0.5, 0).setScale(0.55).setDepth(-80).setAlpha(0.95);
    const shade = this.add.graphics().setDepth(-85);
    shade.fillStyle(0x203018, 0.18); shade.fillEllipse(40, H - 120, 160, 90);

    this.hands = this.add.graphics().setDepth(18);
    this.ribbons = this.add.graphics().setDepth(400);

    /* 사람들 — 두 줄 모두 나라와 본당이 섞여 있습니다 */
    this.SP = 30;                     // 앞사람과의 간격
    this.LV = {
      easy: { name: '쉬움', desc: '두 줄. 처음 하는 꼬리잡기', teams: 2, speed: 140, turn: 3.1, dash: 0.22, patterns: ['chase'] },
      normal: { name: '보통', desc: '세 줄! 줄마다 움직임이 달라요', teams: 3, speed: 140, turn: 3.4, dash: 0.2, patterns: ['chase', 'flank', 'zigzag'] },
      hard: { name: '어려움', desc: '세 줄, 더 빠르고 날쌔게', teams: 3, speed: 157, turn: 3.8, dash: 0.16, patterns: ['chase', 'flank', 'zigzag'] }
    };
    this.level = this.level || 'easy';
    this.lines = [];
    this.buildLines();

    /* 조작 — 마당 어디든 밀어서 */
    this.stick = new Joystick(this, { zoneTop: top, radius: 46, noTap: true });
    if (this.stick.hint) this.stick.hint.setText(window.IS_DESKTOP ? '방향키로 머리를 움직여요' : T.stickHint).setDepth(500);

    /* 지난 판의 흔적을 지웁니다 */
    this.busy = true;
    this.started = false;
    this.hud = null; this.timeText = null; this._flash = null;
    this.myCatch = 0; this.theirCatch = 0;
    this.ending = false;
    this.levelUI = null;
    this.roundText = null;
    this.placeAll(true);

    this.dialogue.play(T.open, () => this.pickLevel());
  }

  /* ── 줄 세우기 — 난이도에 따라 두 줄 또는 세 줄 ── */
  buildLines() {
    const W = GAME.WIDTH, F = this.F, L = this.LV[this.level];
    this.lines.forEach((line) => line.members.forEach((m) => { m.img.destroy(); m.shadow.destroy(); m.ring.destroy(); }));
    this.lines = [this.makeLine('A', ['player', 'epi_kid1', 'epi_leo', 'epi_fra'], 0xf2a03a, 0xe8505a, W / 2 - 70, F.B - 150, 0, -1)];
    if (L.teams === 2) {
      this.lines.push(this.makeLine('B', ['epi_ita', 'epi_kid2', 'epi_phi', 'epi_bra'], 0x4f8fd8, 0x3fa0e0, W / 2 + 70, F.T + 150, 0, 1));
    } else {
      this.lines.push(this.makeLine('B', ['epi_ita', 'epi_kid2', 'epi_phi', 'epi_bra'], 0x4f8fd8, 0x3fa0e0, W / 2 - 60, F.T + 130, 0, 1));
      this.lines.push(this.makeLine('C', ['epi_spa', 'epi_kid3', 'epi_kid4', 'epi_kid5'], 0x58b06a, 0x2fae6a, W / 2 + 40, (F.T + F.B) / 2 + 10, -1, 0));
    }
    this.A = this.lines[0];
    /* 저쪽 머리들 — 줄마다 다른 버릇 */
    const pats = Phaser.Utils.Array.Shuffle(L.patterns.slice());
    this.lines.slice(1).forEach((line, i) => {
      line.ai = { heading: Math.atan2(line.dirY, line.dirX), speed: L.speed, pattern: pats[i % pats.length], prey: null, preyT: 0, feint: 0, feintT: 2 + Math.random() * 3, fx: 0, fy: 0, t: Math.random() * 6 };
    });
    this.lines.forEach((line) => { line.cool = 0; });
    this.placeAll(true);
  }

  /* ── 난이도 고르기 ── */
  pickLevel() {
    const W = GAME.WIDTH;
    this.busy = true;
    this.clearLevelUI();
    const c = this.add.container(0, 0).setDepth(720);
    const dim = this.add.graphics(); dim.fillStyle(0x15110c, 0.6); dim.fillRect(0, 0, W, GAME.HEIGHT);
    c.add(dim);
    c.add(this.add.text(W / 2, 250, '난이도를 골라요', UI.style(22, PAL.cream, { stroke: '#2a1e10', strokeThickness: 4 })).setOrigin(0.5));
    ['easy', 'normal', 'hard'].forEach((k, i) => {
      const L = this.LV[k], y = 330 + i * 118;
      c.add(UI.button(this, W / 2, y, 270, 64, L.name, () => this.startLevel(k), { size: FONT.label, fill: k === this.level ? PAL.sun : PAL.paper }));
      c.add(this.add.text(W / 2, y + 40, L.desc, UI.style(14, '#f2e8d4', { align: 'center', stroke: '#2a1e10', strokeThickness: 3, wordWrap: { width: W - 60 } })).setOrigin(0.5, 0));
    });
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 260 });
    this.levelUI = c;
  }

  clearLevelUI() { if (this.levelUI) { this.levelUI.destroy(); this.levelUI = null; } }

  startLevel(k) {
    this.clearLevelUI();
    this.clearRound();
    this.level = k;
    this.buildLines();
    AudioSystem.select();
    if (!this.started) GameFX.countdown(this, () => this.go());
    else { this.timeLeft = 75; this.busy = false; this.lines.forEach((l) => { l.cool = 900; }); }
  }

  /* 한 줄 — 머리에서 뒤로 곧게 늘어선 채로 시작합니다(dirX, dirY 는 머리가 보는 쪽) */
  makeLine(team, keys, ring, tail, x, y, dirX, dirY) {
    const line = { team: team, ring: ring, tail: tail, members: [], trail: [], dirX: dirX, dirY: dirY };
    keys.forEach((k, i) => line.members.push(this.makeMember(k, team, x - dirX * i * this.SP, y - dirY * i * this.SP)));
    for (let d = keys.length * this.SP + 60; d >= 0; d -= 3) line.trail.push({ x: x - dirX * d, y: y - dirY * d });
    line.trail.push({ x: x, y: y });
    return line;
  }

  makeMember(key, team, x, y) {
    const m = { key: key, x: x, y: y, walk: 0, join: 0 };
    m.ring = this.add.ellipse(x, y, 34, 12, 0xffffff, 0.75);
    m.shadow = this.add.image(x, y + 1, 'shadow').setScale(1.15).setAlpha(0.32);
    m.img = this.add.image(x, y, key + '_front').setOrigin(0.5, 0.9).setScale(1.45);
    return m;
  }

  go() {
    if (this.started) return;
    this.started = true;
    this.hud = this.ensureHud();
    this.timeLeft = 75;
    this.timeText = this.add.text(GAME.WIDTH - 82, 24, '', UI.style(17, '#ffe7a8')).setOrigin(0.5).setDepth(880);
    this.busy = false;
    this.lines.forEach((l) => { l.cool = 600; });
  }

  update(time, delta) {
    if (!this.A || this.finished) return;
    const dt = Math.min(delta, 40) / 1000;

    if (this.ending) { this.circleLap(dt); this.placeAll(); this.draw(time); return; }

    if (!this.busy && !this.dialogue.isOpen) {
      this.lines.forEach((l) => { l.cool -= delta; });
      /* 나 — 우리 줄 머리 */
      const v = this.stick.read();
      const sp = 152 * (v.run ? 1.15 : 1);
      this.moveHead(this.A, v.x * sp * dt, v.y * sp * dt);
      this.myMoving = Math.hypot(v.x, v.y) > 0.3;
      this.myDir = v;
      /* 저쪽 줄 머리들 */
      this.lines.forEach((l) => { if (l.ai) this.steerAI(l, dt); });
      this.checkCatch();
      /* 남은 시간 */
      this.timeLeft = Math.max(0, this.timeLeft - dt);
      if (this.timeText) this.timeText.setText('⏱ ' + Math.ceil(this.timeLeft));
      if (this.timeLeft <= 0) this.roundOver('time');
      if (v.x || v.y) {
        if (time - (this._stepAt || 0) > 260) { this._stepAt = time; AudioSystem.step(); }
      }
    }
    this.placeAll();
    this.draw(time);
  }

  moveHead(line, dx, dy) {
    const h = line.members[0], F = this.F;
    h.x = Phaser.Math.Clamp(h.x + dx, F.L, F.R);
    h.y = Phaser.Math.Clamp(h.y + dy, F.T, F.B);
    const last = line.trail[line.trail.length - 1];
    if (Phaser.Math.Distance.Between(last.x, last.y, h.x, h.y) > 1.5) line.trail.push({ x: h.x, y: h.y });
    /* 줄 길이만큼만 길을 기억합니다 */
    const keep = line.members.length * this.SP + 80;
    let acc = 0;
    for (let i = line.trail.length - 1; i > 0; i--) {
      acc += Phaser.Math.Distance.Between(line.trail[i].x, line.trail[i].y, line.trail[i - 1].x, line.trail[i - 1].y);
      if (acc > keep) { line.trail.splice(0, i - 1); break; }
    }
  }

  /* ── 저쪽 머리 — 누군가의 꼬리를 쫓되, 자기 꼬리가 위험하면 몸을 틀어 휘둘러 피합니다 ── */
  steerAI(B, dt) {
    const F = this.F, ai = B.ai, L = this.LV[this.level];
    const head = B.members[0], theirTail = B.members[B.members.length - 1];
    ai.t += dt;
    /* 쫓을 줄 — 꼬리가 가까운 줄(내 줄을 조금 더 좋아합니다). 너무 자주 바꾸지 않아요 */
    ai.preyT -= dt;
    if (!ai.prey || ai.preyT <= 0 || ai.prey.members.length <= 1) {
      let best = null, bd = 1e9;
      this.lines.forEach((o) => {
        if (o === B || o.members.length <= 1) return;
        const t = o.members[o.members.length - 1];
        const d = Phaser.Math.Distance.Between(head.x, head.y, t.x, t.y) * (o === this.A ? 0.8 : 1);
        if (d < bd) { bd = d; best = o; }
      });
      ai.prey = best || this.A; ai.preyT = 1.6;
    }
    const P = ai.prey, pHead = P.members[0], pTail = P.members[P.members.length - 1];
    let dx = 0, dy = 0;
    let dash = 0;
    if (B.cool > 0) {
      /* 잡고 잡힌 직후에는 잠깐 물러납니다 */
      dx = head.x - pHead.x; dy = head.y - pHead.y;
    } else if (ai.feint > 0) {
      /* 헛걸음 — 엉뚱한 쪽으로 몇 걸음 */
      ai.feint -= dt;
      dx = ai.fx - head.x; dy = ai.fy - head.y;
    } else {
      ai.feintT -= dt;
      if (this.level !== 'easy' && ai.feintT <= 0) {
        ai.feint = 0.6 + Math.random() * 0.5; ai.feintT = 4 + Math.random() * 4;
        ai.fx = Phaser.Math.Between(F.L + 40, F.R - 40); ai.fy = Phaser.Math.Between(F.T + 40, F.B - 40);
      }
      const td = Phaser.Math.Distance.Between(head.x, head.y, pTail.x, pTail.y);
      if (P.members.length > 1) {
        const bx = pTail.x - pHead.x, by = pTail.y - pHead.y, bl = Math.hypot(bx, by) || 1;
        /* 멀리서는 꼬리 뒤로 돌아 들어가고, 가까우면 곧장 손을 뻗습니다 */
        const far = Phaser.Math.Clamp((td - 50) / 80, 0, 1);
        let tx = pTail.x + bx / bl * far * 40, ty = pTail.y + by / bl * far * 40;
        if (ai.pattern === 'flank') {
          /* 옆으로 크게 돌아 들어오기 — 멀수록 옆으로 비켜 섭니다 */
          const side = Math.sin(ai.t * 0.5) >= 0 ? 1 : -1;
          tx += -by / bl * far * 90 * side; ty += bx / bl * far * 90 * side;
        }
        dx = tx - head.x; dy = ty - head.y;
      } else { dx = pHead.x - head.x; dy = pHead.y - head.y; }
      let cl = Math.hypot(dx, dy) || 1; dx /= cl; dy /= cl;
      if (ai.pattern === 'zigzag') {
        /* 지그재그 — 몸을 흔들어 자기 꼬리를 휘두릅니다 */
        const w = Math.sin(ai.t * 5.2) * 0.75;
        const ndx = dx - dy * w, ndy = dy + dx * w; cl = Math.hypot(ndx, ndy) || 1; dx = ndx / cl; dy = ndy / cl;
      }
      /* 쫓는 줄의 머리 가까이는 가지 않습니다 — 자기 줄이 그 길을 그대로 따라오니까요 */
      const rx = head.x - pHead.x, ry = head.y - pHead.y, rd = Math.hypot(rx, ry) || 1;
      if (rd < 80 && rd < td) { const k2 = (80 - rd) / 80 * 1.3; dx += rx / rd * k2; dy += ry / rd * k2; }
      /* 누군가의 머리가 내 꼬리로 오고 있으면 — 꼬리를 바깥으로 휘두르는 쪽으로 몸을 틉니다 */
      if (B.members.length > 1) {
        let k = 0, ax = 0, ay = 0, d = 1;
        this.lines.forEach((o) => {
          if (o === B) return;
          const oh = o.members[0];
          const ox = theirTail.x - oh.x, oy = theirTail.y - oh.y, od = Math.hypot(ox, oy) || 1;
          let mv;
          if (o === this.A) mv = this.myMoving ? (this.myDir || { x: 0, y: 0 }) : { x: 0, y: 0 };
          else mv = { x: Math.cos(o.ai.heading), y: Math.sin(o.ai.heading) };
          const ml = Math.hypot(mv.x, mv.y);
          const threat = ml > 0.3 ? Phaser.Math.Clamp(((mv.x * ox + mv.y * oy) / (ml * od) + 0.2) / 1.2, 0, 1) : 0;
          const kk = Phaser.Math.Clamp((175 - od) / 110, 0, 1) * threat;
          if (kk > k) { k = kk; ax = ox; ay = oy; d = od; }
        });
        if (k > 0) {
          dash = k;                              // 위험하면 발을 재촉합니다
          let px = -ay / d, py = ax / d;
          /* 마당 가운데 쪽으로 도는 방향을 고릅니다 */
          const cx = (F.L + F.R) / 2 - head.x, cy = (F.T + F.B) / 2 - head.y;
          if (px * cx + py * cy < 0) { px = -px; py = -py; }
          dx = dx * (1 - k) + px * k * 1.7;
          dy = dy * (1 - k) + py * k * 1.7;
        }
      }
    }
    /* 벽에서 밀어냅니다 */
    const wall = 30;
    if (head.x < F.L + wall) dx += (F.L + wall - head.x) / wall;
    if (head.x > F.R - wall) dx -= (head.x - (F.R - wall)) / wall;
    if (head.y < F.T + wall) dy += (F.T + wall - head.y) / wall;
    if (head.y > F.B - wall) dy -= (head.y - (F.B - wall)) / wall;
    /* 사람처럼 — 한 번에 확 돌지 못하고 둥글게 돕니다 */
    const want = Math.atan2(dy, dx);
    const diff = Phaser.Math.Angle.Wrap(want - ai.heading);
    const turn = L.turn * dt;
    ai.heading += Phaser.Math.Clamp(diff, -turn, turn);
    const sp = ai.speed * (B.cool > 0 ? 1.05 : 1 + L.dash * dash);
    this.moveHead(B, Math.cos(ai.heading) * sp * dt, Math.sin(ai.heading) * sp * dt);
  }

  /* ── 잡았다 / 잡혔다 ── */
  checkCatch() {
    const reach = (h, t) => Phaser.Math.Distance.Between(h.x, h.y - 18, t.x, t.y - 24) < 25;
    for (let i = 0; i < this.lines.length; i++) {
      const H = this.lines[i];
      if (H.cool > 0) continue;
      /* 손을 뻗어야 잡힙니다 — 가만히 서 있는 내 머리에 꼬리가 스쳐 지나간 건 치지 않아요 */
      if (H === this.A && !this.myMoving) continue;
      for (let j = 0; j < this.lines.length; j++) {
        const P = this.lines[j];
        if (P === H || P.cool > 0 || P.members.length <= 1) continue;
        if (reach(H.members[0], P.members[P.members.length - 1])) { this.caught(P, H); return; }
      }
    }
  }

  caught(from, to) {
    const T = EPI.tag;
    const m = from.members.pop();
    const mine = to === this.A, lost = from === this.A;
    /* 잡힌 친구는 잡은 줄 끝으로 달려가 붙습니다 */
    m.join = 1; m.fx = m.x; m.fy = m.y;
    to.members.push(m);
    from.cool = 1300; to.cool = 1300;
    if (mine) {
      this.myCatch++;
      this.hud.hit(this.level === 'hard' ? 80 : this.level === 'normal' ? 60 : 50, m.x, m.y - 50, T.caught);
      AudioSystem.chime();
      GameFX.burst(this, m.x, m.y - 30, { count: 18, speed: 150 });
      this.flash(T.caughtLine);
      from.ai.speed += 6;                       // 잡힐수록 저쪽이 조금 더 빨라집니다
    } else if (lost) {
      this.theirCatch++;
      this.hud.miss(m.x, m.y - 40);
      this.flash(T.lostLine);
    } else {
      AudioSystem.blip();
      this.flash(T.otherLine);
    }
    this.tweens.add({ targets: m.img, scaleY: 1.42, duration: 120, yoyo: true });
    /* 판이 끝났나 — 내 줄이 머리만 남거나, 저쪽 줄들이 모두 머리만 남으면 */
    if (this.A.members.length <= 1) this.time.delayedCall(700, () => this.roundOver('theirs'));
    else if (this.lines.every((l) => l === this.A || l.members.length <= 1)) this.time.delayedCall(700, () => this.roundOver('mine'));
  }

  flash(msg) {
    if (this._flash && this._flash.scene) this._flash.destroy();
    const t = this.add.text(GAME.WIDTH / 2, this.F.T + 4, msg,
      UI.style(FONT.small, PAL.cream, { align: 'center', wordWrap: { width: GAME.WIDTH - 80 }, stroke: '#2a1e10', strokeThickness: 4 }))
      .setOrigin(0.5, 0).setDepth(600).setAlpha(0);
    this._flash = t;
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(1400, () => { if (t.scene) this.tweens.add({ targets: t, alpha: 0, duration: 380, onComplete: () => t.destroy() }); });
  }

  /* ── 자리 잡기 — 줄은 머리가 지나간 길을 따라옵니다 ── */
  placeAll(first) {
    this.lines.forEach((line) => {
      const pts = [{ x: line.members[0].x, y: line.members[0].y }];
      for (let i = line.trail.length - 1; i >= 0; i--) pts.push(line.trail[i]);
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Phaser.Math.Distance.Between(pts[i].x, pts[i].y, pts[i - 1].x, pts[i - 1].y));
      line.members.forEach((m, idx) => {
        let tx = m.x, ty = m.y;
        if (idx > 0) {
          const want = idx * this.SP;
          let k = 1;
          while (k < cum.length - 1 && cum[k] < want) k++;
          const seg = (cum[k] - cum[k - 1]) || 1, f = Phaser.Math.Clamp((want - cum[k - 1]) / seg, 0, 1);
          tx = pts[k - 1].x + (pts[k].x - pts[k - 1].x) * f;
          ty = pts[k - 1].y + (pts[k].y - pts[k - 1].y) * f;
          if (m.join > 0) {                    // 새 줄로 달려가는 중
            m.join = Math.max(0, m.join - 0.045);
            const e = 1 - m.join;
            tx = m.fx + (tx - m.fx) * e; ty = m.fy + (ty - m.fy) * e;
          }
        }
        const ddx = tx - m.x, ddy = ty - m.y;
        m.x = tx; m.y = ty;
        this.face(m, first ? 0 : ddx, first ? (line.team === 'A' ? -1 : 1) : ddy);
        m.img.setPosition(m.x, m.y).setDepth(20 + m.y * 0.1);
        m.shadow.setPosition(m.x, m.y + 1).setDepth(m.img.depth - 0.2);
        m.ring.setPosition(m.x, m.y).setDepth(m.img.depth - 0.3).setFillStyle(line.ring, 0.7);
      });
    });
  }

  /* 움직이는 쪽을 봅니다 — 옆이면 옆모습, 위면 뒷모습. 걸음도 번갈아 */
  face(m, dx, dy) {
    const d = Math.hypot(dx, dy);
    if (d < 0.15) { if (m.lastDir) m.img.setTexture(this.tex(m.key, m.lastDir, 0)); return; }
    m.walk += d;
    const ph = Math.floor(m.walk / 7) % 4;
    let dir;
    if (Math.abs(dx) > Math.abs(dy) * 0.8) { dir = 'side'; m.img.setFlipX(dx < 0); }
    else { dir = dy < 0 ? 'back' : 'front'; m.img.setFlipX(ph >= 2); }
    m.lastDir = dir;
    m.img.setTexture(this.tex(m.key, dir, dir === 'side' ? (ph === 0 ? 1 : ph === 2 ? 2 : 0) : (ph % 2 === 0 ? 1 : 0)));
  }

  tex(key, dir, step) {
    const s = step === 2 ? '_walk2' : step ? '_walk' : '';
    const tries = [key + '_' + dir + s, key + '_' + dir + (step ? '_walk' : ''), key + '_' + dir, key + '_front'];
    for (let i = 0; i < tries.length; i++) if (this.textures.exists(tries[i])) return tries[i];
    return key + '_front';
  }

  /* 어깨를 잡은 손과 허리춤의 손수건 */
  draw(time) {
    const hg = this.hands, rg = this.ribbons;
    hg.clear(); rg.clear();
    this.lines.forEach((line) => {
      const ms = line.members;
      hg.lineStyle(4, 0xe6c09a, 0.95);
      for (let i = 1; i < ms.length; i++) {
        const a = ms[i - 1], b = ms[i];
        if (b.join > 0.2) continue;
        hg.lineBetween(b.x, b.y - 38, a.x, a.y - 42);
      }
      if (ms.length < 2 && !this.ending) return;
      /* 꼬리 — 움직임 반대쪽으로 펄럭입니다 */
      const t = ms[ms.length - 1], p = ms[ms.length - 2] || { x: t.x, y: t.y - 1 };
      let bx = t.x - p.x, by = t.y - p.y; const bl = Math.hypot(bx, by) || 1; bx /= bl; by /= bl;
      const nx = -by, ny = bx;
      const pts = [];
      for (let k = 0; k <= 7; k++) {
        const s = k * 4.4, wv = Math.sin(time / 90 + k * 0.9) * k * 0.9;
        pts.push({ x: t.x + bx * s + nx * wv, y: t.y - 24 + by * s + ny * wv + k * 1.4 });
      }
      rg.lineStyle(9, 0x2a1e14, 0.35);
      rg.beginPath(); rg.moveTo(pts[0].x, pts[0].y + 1); pts.forEach(q => rg.lineTo(q.x, q.y + 1)); rg.strokePath();
      rg.lineStyle(7, line.tail, 1);
      rg.beginPath(); rg.moveTo(pts[0].x, pts[0].y); pts.forEach(q => rg.lineTo(q.x, q.y)); rg.strokePath();
      rg.lineStyle(2, 0xffffff, 0.55);
      rg.beginPath(); rg.moveTo(pts[0].x, pts[0].y - 1); pts.slice(0, 4).forEach(q => rg.lineTo(q.x, q.y - 1)); rg.strokePath();
    });
  }

  gameStars() {
    const total = this.lines.reduce((n, l) => n + l.members.length, 0) || 8;
    return this.A.members.length >= total * 0.75 ? 3 : this.myCatch >= 3 ? 2 : 1;
  }

  /* ── 한 판이 끝났습니다 ── */
  roundOver(kind) {
    if (this.busy) return;
    const T = EPI.tag, W = GAME.WIDTH;
    this.busy = true;
    if (this.stick) this.stick.reset();
    AudioSystem.chime();
    const msg = kind === 'mine' ? T.winMine : kind === 'theirs' ? T.winTheirs : T.timeUp;
    this.roundText = this.add.text(W / 2, GAME.HEIGHT * 0.36, msg,
      UI.style(21, PAL.cream, { align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 6, stroke: '#2a1e10', strokeThickness: 5 }))
      .setOrigin(0.5).setDepth(700).setAlpha(0);
    this.tweens.add({ targets: this.roundText, alpha: 1, duration: 600 });
    this.time.delayedCall(900, () => {
      this.againBtn = UI.button(this, W / 2, 610, 250, 62, T.againBtn, () => this.playAgain(), { size: FONT.label, fill: PAL.sun });
      this.levelBtn = UI.button(this, W / 2, 684, 250, 54, T.levelBtn, () => { this.clearRound(); this.pickLevel(); }, { size: FONT.small });
      this.stopBtn = UI.button(this, W / 2, 752, 250, 54, T.stopBtn, () => this.finish(), { size: FONT.small });
      [this.againBtn, this.levelBtn, this.stopBtn].forEach(b => b.setDepth(700).setAlpha(0));
      this.tweens.add({ targets: [this.againBtn, this.levelBtn, this.stopBtn], alpha: 1, duration: 500 });
    });
  }

  clearRound() {
    ['againBtn', 'levelBtn', 'stopBtn', 'roundText'].forEach((k) => { if (this[k]) { this[k].destroy(); this[k] = null; } });
  }

  /* 한 판 더 — 처음 짝으로 다시 섭니다 */
  playAgain() {
    this.clearRound();
    this.buildLines();
    this.lines.forEach((l) => { if (l.ai) l.ai.speed += 6; l.cool = 900; });
    this.timeLeft = 75;
    AudioSystem.select();
    this.busy = false;
  }

  /* ── 마침 — 두 줄이 하나로 이어져 마당을 한 바퀴 ── */
  finish() {
    this.clearRound();
    const T = EPI.tag, W = GAME.WIDTH;
    if (this.stick) { this.stick.reset(); if (this.stick.hint) this.stick.hint.setVisible(false); }
    if (this.timeText) this.timeText.setVisible(false);
    /* 저쪽 줄 사람들이 우리 줄 끝에 차례로 붙습니다 */
    this.lines.forEach((l) => {
      if (l === this.A) return;
      l.members.splice(0).forEach((m) => { m.join = 1; m.fx = m.x; m.fy = m.y; this.A.members.push(m); });
    });
    this.lines = [this.A];
    this.A.ring = 0xf2c06a;
    this.ending = true;
    this.lapT = 0;
    const t = this.add.text(W / 2, GAME.HEIGHT * 0.3, T.doneLine,
      UI.style(21, PAL.cream, { align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 6, stroke: '#2a1e10', strokeThickness: 5 }))
      .setOrigin(0.5).setDepth(700).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 900, delay: 400 });
    AudioSystem.bell();
    this.time.delayedCall(4200, () => { this.ending = false; this.complete(T.done); });
  }

  /* 마지막 한 바퀴 — 머리가 마당 가운데를 크게 돕니다 */
  circleLap(dt) {
    this.lapT += dt;
    const h = this.A.members[0], F = this.F;
    const cx = (F.L + F.R) / 2, cy = (F.T + F.B) / 2 + 40, r = 118;
    const a = -Math.PI / 2 + this.lapT * 1.5;
    const tx = cx + Math.cos(a) * r, ty = cy + Math.sin(a) * r * 1.2;
    const dx = tx - h.x, dy = ty - h.y, d = Math.hypot(dx, dy) || 1;
    const step = Math.min(d, 210 * dt);
    this.moveHead(this.A, dx / d * step, dy / d * step);
  }
};
