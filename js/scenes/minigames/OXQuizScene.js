/* 에필로그 미니게임 · 교리 OX 퀴즈
   주일학교 선생님이 문제를 읽으면, 맞는 말이면 O 쪽으로, 틀린 말이면 X 쪽으로 달려갑니다.
   세계 친구들도 같이 뛰어요 — 친구들이 몰려간 쪽이 늘 정답은 아닙니다.

   - 화면 왼쪽(O) · 오른쪽(X)을 누르면 그쪽으로 뜁니다(PC 는 ← →). 시간이 다 되기 전까지는 바꿔도 돼요.
   - 시간이 다 되면 정답과 함께 선생님이 한 줄로 풀어 줍니다.
   - 한 판에 열 문제. 문제는 할 때마다 섞여 나옵니다(js/data/oxquiz.js). */

window.OXQuizScene = class OXQuizScene extends MiniGameScene {
  constructor() { super('OXQuizScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#5e5a50',
      title: '교리 OX 퀴즈', hint: '맞는 말이면 O, 틀린 말이면 X 쪽으로! 화면 왼쪽·오른쪽을 눌러 뛰어요.'
    });
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const top = this.contentTop() + 4;
    this.N = 10;
    this.LIMIT = 7;                      // 한 문제에 주는 시간(초)

    if (window.Townscape) Townscape.strip(this, 'scn_plaza', 0, 0, W, H, { depth: -95 });
    const dim = this.add.graphics().setDepth(-90);
    dim.fillStyle(0x1c160e, 0.35); dim.fillRect(0, 0, W, top);

    /* 칠판 같은 문제판 */
    this.boardY = top + 4;
    const bh = 168;
    const bg = this.add.graphics().setDepth(10);
    bg.fillStyle(0x000000, 0.2); bg.fillRoundedRect(20, this.boardY + 4, W - 40, bh, 16);
    bg.fillStyle(0x2f4a3c, 1); bg.fillRoundedRect(18, this.boardY, W - 36, bh, 16);
    bg.lineStyle(6, 0x8a6a44, 1); bg.strokeRoundedRect(18, this.boardY, W - 36, bh, 16);
    this.numText = this.add.text(36, this.boardY + 16, '', UI.style(14, '#cfe3d4')).setDepth(12);
    this.qText = this.add.text(W / 2, this.boardY + 84, '', UI.style(19, '#f6f2e6', { align: 'center', wordWrap: { width: W - 76 }, lineSpacing: 6 }))
      .setOrigin(0.5).setDepth(12);
    this.timeBar = this.add.graphics().setDepth(12);

    /* 마당 — 분필로 그린 O 와 X */
    this.fieldTop = this.boardY + bh + 18;
    this.OX = { O: W * 0.27, X: W * 0.73 };
    this.footY = H - 190;
    const chalk = this.add.graphics().setDepth(-80);
    chalk.lineStyle(10, 0xf6f0e2, 0.75); chalk.strokeCircle(this.OX.O, this.footY - 60, 62);
    chalk.lineStyle(12, 0xf6f0e2, 0.75);
    chalk.lineBetween(this.OX.X - 50, this.footY - 110, this.OX.X + 50, this.footY - 10);
    chalk.lineBetween(this.OX.X + 50, this.footY - 110, this.OX.X - 50, this.footY - 10);
    chalk.lineStyle(3, 0xf6f0e2, 0.5);
    for (let y = this.fieldTop; y < H - 40; y += 22) chalk.lineBetween(W / 2, y, W / 2, y + 11);
    this.zoneGlow = this.add.graphics().setDepth(-79);

    /* 사람들 — 나와 친구들 */
    this.people = [];
    this.me = this.addPerson('player', W / 2, this.footY + 30, true);
    const friends = ['epi_leo', 'epi_kid1', 'epi_ita', 'epi_kid2', 'epi_bra', 'epi_fra'];
    friends.forEach((k, i) => {
      const x = W / 2 + (i % 2 ? 1 : -1) * (24 + (i >> 1) * 18);
      this.addPerson(k, x, this.footY - 40 + (i >> 1) * 36 + (i % 2) * 8, false);
    });

    /* 누르면 그쪽으로 */
    this.input.on('pointerdown', (p) => {
      if (!this.live || p.y < this.fieldTop - 30) return;
      this.choose(p.x < W / 2 ? 'O' : 'X');
    });
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-LEFT', () => { if (this.live) this.choose('O'); });
      this.input.keyboard.on('keydown-RIGHT', () => { if (this.live) this.choose('X'); });
    }

    this.qs = OXQUIZ.draw(this.N);
    this.idx = -1;
    this.right = 0;
    this.live = false;
    this.qText.setText('');

    const open = [
      { t: '주일학교 선생님이 마당 바닥에 분필로 커다란 O 와 X 를 그린다.' },
      { s: '주일학교 선생님', t: '교리 OX 퀴즈! 맞는 말이면 O, 틀린 말이면 X 로 뛰어가요!' },
      { s: '레오', t: 'O… X… like a game show!' },
      { s: '나', t: '친구 따라가면 안 돼. 내가 생각해서!' }
    ];
    this.dialogue.play(open, () => GameFX.countdown(this, () => { this.hud = this.ensureHud(); this.next(); }));
  }

  addPerson(key, x, y, me) {
    const p = { key: key, x: x, y: y, tx: x, ty: y, side: null, me: me, walk: 0 };
    p.shadow = this.add.image(x, y + 1, 'shadow').setScale(1.1).setAlpha(0.3);
    p.img = this.add.image(x, y, key + '_front').setOrigin(0.5, 0.9).setScale(me ? 1.6 : 1.4);
    if (me) {
      p.ring = this.add.ellipse(x, y, 40, 14, 0xffd27a, 0.8);
    }
    this.people.push(p);
    return p;
  }

  /* 그쪽 칸 안의 빈자리 — 사람들이 겹치지 않게 흩어 섭니다 */
  spot(side, p) {
    const cx = this.OX[side];
    const others = this.people.filter((q) => q !== p && q.side === side);
    for (let k = 0; k < 30; k++) {
      const x = cx + Phaser.Math.Between(-62, 62), y = this.footY - 60 + Phaser.Math.Between(-46, 70);
      if (others.every((q) => Math.hypot(q.tx - x, q.ty - y) > 34)) return { x: x, y: y };
    }
    return { x: cx + Phaser.Math.Between(-60, 60), y: this.footY + Phaser.Math.Between(-20, 30) };
  }

  moveTo(p, side) {
    if (p.side === side) return;
    p.side = side;
    const s = this.spot(side, p);
    p.tx = s.x; p.ty = s.y;
  }

  choose(side) {
    if (this.me.side === side) return;
    AudioSystem.step();
    this.moveTo(this.me, side);
    this.drawGlow();
  }

  drawGlow() {
    const g = this.zoneGlow; g.clear();
    if (!this.me.side) return;
    g.fillStyle(0xffd27a, 0.16);
    g.fillRoundedRect(this.me.side === 'O' ? 12 : GAME.WIDTH / 2 + 6, this.fieldTop, GAME.WIDTH / 2 - 18, GAME.HEIGHT - 50 - this.fieldTop, 18);
  }

  /* ── 다음 문제 ── */
  next() {
    this.idx++;
    if (this.idx >= this.qs.length) { this.end(); return; }
    const q = this.qs[this.idx];
    this.numText.setText((I18N.lang === 'ko' ? '문제 ' : 'Question ') + (this.idx + 1) + ' / ' + this.qs.length);
    this.qText.setText(q.q).setColor('#f6f2e6').setAlpha(0);
    this.tweens.add({ targets: this.qText, alpha: 1, duration: 300 });
    this.left = this.LIMIT;
    this.live = true;
    this.people.forEach((p) => { p.img.clearTint(); p.img.setAlpha(1); });
    /* 친구들 — 저마다 다른 때에, 대개는 맞게(가끔 우르르 틀리게) */
    const crowdWrong = Math.random() < 0.18;
    this.people.forEach((p) => {
      if (p.me) return;
      const good = crowdWrong ? Math.random() < 0.3 : Math.random() < 0.72;
      const side = good ? (q.o ? 'O' : 'X') : (q.o ? 'X' : 'O');
      this.time.delayedCall(Phaser.Math.Between(600, 3800), () => { if (this.live) this.moveTo(p, side); });
      if (Math.random() < 0.25) this.time.delayedCall(Phaser.Math.Between(4200, 6000), () => { if (this.live) this.moveTo(p, side === 'O' ? 'X' : 'O'); });
    });
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.people.forEach((p) => {
      const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
      const sp = (p.me ? 260 : 200) * dt;
      if (d > 1) {
        const k = Math.min(1, sp / d);
        p.x += dx * k; p.y += dy * k;
        p.walk += sp;
        const ph = Math.floor(p.walk / 9) % 4;
        if (Math.abs(dx) > Math.abs(dy) * 0.6) { p.img.setTexture(this.tex(p.key, 'side', ph === 0 ? 1 : ph === 2 ? 2 : 0)); p.img.setFlipX(dx < 0); }
        else { p.img.setTexture(this.tex(p.key, dy < 0 ? 'back' : 'front', ph % 2)); p.img.setFlipX(ph >= 2); }
      } else if (!p.jump) { p.img.setTexture(p.key + '_front'); p.img.setFlipX(false); }
      p.img.setPosition(p.x, p.y - (p.hop || 0)).setDepth(20 + p.y * 0.1);
      p.shadow.setPosition(p.x, p.y + 1).setDepth(p.img.depth - 0.2);
      if (p.ring) p.ring.setPosition(p.x, p.y).setDepth(p.img.depth - 0.3);
    });

    if (this.live) {
      this.left -= dt;
      this.drawTime();
      if (this.left <= 0) this.reveal();
    }
  }

  tex(key, dir, step) {
    const s = step === 2 ? '_walk2' : step ? '_walk' : '';
    const tries = [key + '_' + dir + s, key + '_' + dir + (step ? '_walk' : ''), key + '_' + dir, key + '_front'];
    for (let i = 0; i < tries.length; i++) if (this.textures.exists(tries[i])) return tries[i];
    return key + '_front';
  }

  drawTime() {
    const g = this.timeBar, W = GAME.WIDTH, y = this.boardY + 148;
    const f = Math.max(0, this.left / this.LIMIT);
    g.clear();
    g.fillStyle(0x000000, 0.3); g.fillRoundedRect(40, y, W - 80, 9, 4);
    g.fillStyle(f > 0.3 ? 0xf2d27a : 0xe8705a, 1); g.fillRoundedRect(40, y, Math.max(6, (W - 80) * f), 9, 4);
  }

  /* ── 정답! ── */
  reveal() {
    this.live = false;
    this.timeBar.clear();
    const q = this.qs[this.idx], ans = q.o ? 'O' : 'X';
    const W = GAME.WIDTH;
    /* 커다란 도장 */
    const stamp = this.add.text(this.OX[ans], this.footY - 64, ans, UI.style(120, q.o ? '#4fb06a' : '#e0505a', { stroke: '#ffffff', strokeThickness: 8, fontStyle: 'bold' }))
      .setOrigin(0.5).setDepth(500).setScale(2).setAlpha(0);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 0.9, duration: 260, ease: 'Back.easeOut' });
    this.time.delayedCall(2300, () => this.tweens.add({ targets: stamp, alpha: 0, duration: 300, onComplete: () => stamp.destroy() }));

    this.people.forEach((p) => {
      if (p.side === ans) {
        p.jump = true;
        this.tweens.add({ targets: p, hop: 16, duration: 160, yoyo: true, repeat: 2, onComplete: () => { p.hop = 0; p.jump = false; } });
      } else p.img.setTint(0xb0aaa0);
    });

    const mine = this.me.side;
    if (mine === ans) {
      this.right++;
      this.hud.hit(100, this.me.x, this.me.y - 90, '정답!');
      AudioSystem.found();
    } else {
      this.hud.miss(this.me.x, this.me.y - 80);
      if (!mine) GameFX.pop(this, this.me.x, this.me.y - 80, '가운데는 없어요!', { color: '#ffe7a8' });
    }
    this.qText.setText((q.o ? '⭕ 맞아요!' : '❌ 틀린 말이에요!') + '\n' + q.why).setColor(q.o ? '#bff0c8' : '#ffd0d0');
    this.time.delayedCall(3000, () => {
      /* 다음 문제는 가운데에서 다시 */
      this.people.forEach((p) => {
        p.side = null;
        if (p.me) { p.tx = W / 2; p.ty = this.footY + 30; }
        else { p.tx = W / 2 + Phaser.Math.Between(-70, 70); p.ty = this.footY - 50 + Phaser.Math.Between(-10, 70); }
      });
      this.drawGlow();
      this.time.delayedCall(500, () => this.next());
    });
  }

  gameStars() { return this.right >= 9 ? 3 : this.right >= 6 ? 2 : 1; }

  end() {
    this.qText.setText('');
    this.numText.setText('');
    const lines = [
      I18N.lang === 'ko' ? '열 문제 가운데 ' + this.right + '문제를 맞혔다.' : 'I got ' + this.right + ' out of 10 right.',
      { s: '주일학교 선생님', t: this.right >= 8 ? '와, 교리 박사네!' : '틀린 건 이제 안 잊어버리겠지?' },
      { s: '레오', t: 'I ran the wrong way… many times!' },
      { s: '주일학교 선생님', t: '괜찮아. 틀린 쪽에 서 봐야 맞는 쪽이 더 잘 보이거든.' }
    ];
    this.complete(lines);
  }
};
