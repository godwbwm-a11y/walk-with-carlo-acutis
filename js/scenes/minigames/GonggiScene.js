/* 에필로그 미니게임 · 공기놀이
   손등에 얹은 다섯 개를 튕겨 올리고, 내려올 때를 맞춰 낚아챕니다.
   놓쳐도 아무도 그만두자고 하지 않습니다. */

window.GonggiScene = class GonggiScene extends MiniGameScene {
  constructor() { super('GonggiScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#cfc4a6', warm: true,
      title: EPI.gonggi.title, hint: EPI.gonggi.hint
    });
    this.titleText.setColor(PAL.ink);
    this.hintText.setColor(PAL.inkSoft);

    const W = GAME.WIDTH, H = GAME.HEIGHT;

    this.HAND_X = W / 2;
    this.HAND_Y = 578;          // 손등 높이
    this.REST_Y = this.HAND_Y - 20;
    this.FLOOR = 606;           // 돌이 굴러 떨어지는 바닥
    this.G = 1050;              // 잡을수록 조금씩 빨라집니다

    /* ── 돗자리와 마당 ─────────────────────────── */
    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0xd6cdb8, 1); g.fillRect(0, 130, W, H - 130);
    g.fillStyle(0xc9bfa6, 0.6); g.fillRect(0, 660, W, H - 660);
    this.add.image(W / 2, 560, 'epi_mat').setDepth(-40).setScale(1.15);

    /* 둘러앉아 보는 친구들 */
    [[62, 300, 'epi_ita_front'], [330, 304, 'epi_phi_front'], [W / 2, 268, 'epi_leo_front']]
      .forEach((p) => {
        const img = this.add.image(p[0], p[1], p[2]).setDepth(10).setScale(1.3);
        this.tweens.add({ targets: img, y: p[1] - 4, duration: 950 + Math.random() * 260, yoyo: true, repeat: -1 });
      });

    /* ── 손과 공깃돌 다섯 ──────────────────────── */
    this.handShadow = this.add.image(this.HAND_X, this.HAND_Y + 26, 'shadow')
      .setDepth(40).setScale(2).setAlpha(0.32);
    this.hand = this.add.image(this.HAND_X, this.HAND_Y, 'epi_hand_back')
      .setDepth(50).setScale(1.35);
    /* 잡을 때가 되면 손 둘레가 환해집니다 — 가장 밝을 때 누르면 ‘딱!’ */
    this.zoneGlow = this.add.image(this.HAND_X, this.HAND_Y - 20, 'lamp_glow').setDisplaySize(220, 150)
      .setTint(0xffd27a).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setDepth(45);

    this.stones = [];
    for (let i = 0; i < 5; i++) {
      const st = this.add.image(this.stoneHomeX(i), this.REST_Y, 'epi_gonggi')
        .setDepth(70).setScale(1.7);
      st.vy = 0; st.vx = 0; st.spin = 0;
      this.stones.push(st);
    }

    /* ── 세는 곳 — 안내글 바로 아래에 놓습니다 ── */
    const top = this.contentTop();
    this.countText = this.add.text(W / 2, top + 18, '', UI.style(FONT.body, PAL.ink, { align: 'center' }))
      .setOrigin(0.5).setDepth(200);
    this.flashY = top + 62;

    /* ── 조작 ──────────────────────────────────── */
    this.actBtn = UI.padButton(this, W / 2, 776, 232, 80, EPI.gonggi.throwBtn,
      { size: FONT.label, fill: PAL.sun });
    this.actBtn.setDepth(210);
    this.actBtn.onPress = () => this.act();

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', () => {
        if (!this.dialogue.isOpen) this.act();
      });
    }

    /* 장면은 다시 열려도 같은 것을 씁니다 — 지난번 흔적을 모두 지웁니다 */
    this.count = 0;
    this.state = 'wait';        // wait · ready · air · caught · scatter
    this.cooling = false;
    this.rising = false;
    this.G = 1050;
    this.stopped = false;
    this.kind = '보통'; this.lastKind = null; this.floatLeft = 0;
    this.helpedOnce = false;
    this.stopBtn = null;
    this._flashText = null;
    this.avgY = this.REST_Y;

    this.dialogue.play(EPI.gonggi.open, () => this.ready());
  }

  stoneHomeX(i) { return this.HAND_X - 26 + i * 13; }

  /* ── 던질 준비 ───────────────────────────────── */
  ready() {
    if (this.finished || this.stopped) return;
    this.state = 'ready';
    this.cooling = false;
    this.hand.setTexture('epi_hand_back').setAngle(0);
    this.hand.setPosition(this.HAND_X, this.HAND_Y);
    this.stones.forEach((st, i) => {
      st.vy = 0; st.vx = 0; st.spin = 0;
      this.tweens.add({
        targets: st, x: this.stoneHomeX(i), y: this.REST_Y, angle: 0, scale: 1.7,
        duration: 300, ease: 'Sine.easeOut'
      });
    });
    this.actBtn.setLabel(EPI.gonggi.throwBtn);
    this.updateCount();
  }

  act() {
    if (this.finished || this.stopped || this.dialogue.isOpen) return;
    if (this.state === 'ready') this.toss();
    else if (this.state === 'air') this.grab();
  }

  /* ── 손등을 튕겨 올린다 ──────────────────────── */
  toss() {
    this.state = 'air';
    this.rising = true;              // 던진 바로 그 순간에 눌러도 잡히지 않게
    this.actBtn.setLabel(EPI.gonggi.catchBtn);

    /* 던질 때마다 높이와 떨어지는 결이 달라집니다 — 같은 박자로 누르면 잡히지 않습니다.
       잡은 횟수가 늘수록 더 까다로운 던지기가 섞입니다. */
    const pool = ['보통', '보통', '높이', '낮게'];
    if (this.count >= 2) pool.push('깃털', '높이');
    if (this.count >= 4) pool.push('흔들', '깃털', '낮게');
    let kind = pool[Math.floor(Math.random() * pool.length)];
    if (kind === this.lastKind && Math.random() < 0.6) kind = pool[Math.floor(Math.random() * pool.length)];
    this.lastKind = kind;
    this.kind = kind;
    const base = { '보통': 630, '높이': 800, '낮게': 470, '깃털': 650, '흔들': 690 }[kind];
    const spread = kind === '높이' ? 30 : 25;
    const v0 = base + Phaser.Math.Between(-spread, spread);
    this.floated = false;            // 깃털: 꼭대기에서 잠깐 떠 있다가
    this.wobbleT = 0;                // 흔들: 내려오다 한 번 멈칫
    AudioSystem.swipe();
    if (kind === '높이') AudioSystem.gPop();

    this.stones.forEach((st, i) => {
      st.vy = -(v0 + Phaser.Math.Between(-12, 12));
      st.vx = (i - 2) * 10 + Phaser.Math.Between(-6, 6) + (kind === '흔들' ? Phaser.Math.Between(-20, 20) : 0);
      st.spin = Phaser.Math.Between(-170, 170);
    });

    this.tweens.killTweensOf(this.hand);
    this.tweens.add({
      targets: this.hand, y: this.HAND_Y - (kind === '높이' ? 34 : 24), angle: -12,
      duration: 130, ease: 'Sine.easeOut', yoyo: true
    });
  }

  update(time, delta) {
    if (this.finished || this.state !== 'air') return;
    const dt = Math.min(delta, 40) / 1000;
    const vy0 = this.stones[0].vy;
    /* 깃털 — 꼭대기 근처에서 0.35초쯤 거의 떠 있습니다 */
    let g = this.G;
    if (this.kind === '깃털' && Math.abs(vy0) < 160 && !this.floated) {
      this.floatLeft = (this.floatLeft === undefined || this.floatLeft <= 0) ? 0.35 : this.floatLeft;
      this.floated = true;
    }
    if (this.floatLeft > 0) { this.floatLeft -= dt; g = this.G * 0.12; if (this.floatLeft <= 0) this.floatLeft = 0; }
    /* 흔들 — 내려오다가 한 번 살짝 튀어 오릅니다(손이 미리 움찔하면 놓칩니다) */
    if (this.kind === '흔들' && vy0 > 260 && this.wobbleT === 0 && this.avgY > this.HAND_Y - 112) {
      this.wobbleT = 1;
      this.stones.forEach(st => { st.vy = -Phaser.Math.Between(150, 210); });
    }
    let sum = 0;
    for (let i = 0; i < this.stones.length; i++) {
      const st = this.stones[i];
      st.vy += g * dt;
      st.y += st.vy * dt;
      st.x += st.vx * dt;
      st.angle += st.spin * dt;
      sum += st.y;
    }
    this.avgY = sum / this.stones.length;
    this.rising = this.stones[0].vy < 0;
    const z = this.catchZone();
    this.zoneGlow.setAlpha(z === 'perfect' ? 0.6 : 0);
    if (this.avgY >= this.FLOOR) { this.zoneGlow.setAlpha(0); this.scatter(); }
  }

  /* 잡을 수 있는 때 — 내려오는 중, 손등 가까이 왔을 때만.
     너무 일찍(높은 곳에서) 누르거나 올라가는 중에 누르면 헛손질입니다.
     손등에 거의 닿을 때 잡으면 ‘딱!’ — 그때만 손 둘레가 잠깐 환해집니다. */
  catchZone() {
    if (this.state !== 'air' || this.rising) return null;
    const near = this.HAND_Y - this.avgY;          // 손등까지 남은 거리 (아래로 지나가면 음수)
    const okFrom = Math.max(62, 98 - this.count * 4);
    const perfectFrom = Math.max(18, 36 - this.count * 2);
    if (near < perfectFrom) return 'perfect';
    if (near < okFrom) return 'ok';
    return null;
  }

  /* ── 낚아챈다 ────────────────────────────────── */
  grab() {
    if (this.cooling) return;
    const zone = this.catchZone();

    this.swingHand();

    if (zone) { this.catchAll(zone === 'perfect'); return; }

    /* 너무 일찍 누르면 손이 허공을 스칩니다 — 돌은 계속 내려오고, 곧 다시 잡을 수 있습니다 */
    AudioSystem.swipe();
    this.flash(EPI.gonggi.whiff);
    this.cooling = true;
    this.time.delayedCall(330, () => { this.cooling = false; });
  }

  swingHand() {
    this.tweens.killTweensOf(this.hand);
    this.hand.setAngle(0);
    this.tweens.add({
      targets: this.hand, angle: -22, y: this.HAND_Y - 14,
      duration: 90, ease: 'Sine.easeOut', yoyo: true,
      onComplete: () => { this.hand.setPosition(this.HAND_X, this.HAND_Y).setAngle(0); }
    });
  }

  catchAll(perfect) {
    this.state = 'caught';
    this.zoneGlow.setAlpha(0);
    this.count++;
    this.G = Math.min(1450, 1050 + this.count * 45);
    AudioSystem.found();
    this.hand.setTexture('epi_hand_open');
    this.stones.forEach((st, i) => {
      st.vy = 0; st.vx = 0; st.spin = 0;
      this.tweens.add({
        targets: st, x: this.stoneHomeX(i), y: this.HAND_Y - 26, angle: 0, scale: 1.5,
        duration: 190, ease: 'Sine.easeOut'
      });
    });
    this.updateCount();
    this.bounceCount();
    this.ensureHud().hit(perfect ? 30 : 15, GAME.WIDTH / 2, this.HAND_Y - 90, perfect ? '딱!' : '잡았다!');
    this.flash(EPI.gonggi.caught);
    if (!this.stopBtn) this.showStopButton();
    this.time.delayedCall(1150, () => this.ready());
  }

  gameStars() { return this.count >= 8 ? 3 : this.count >= 4 ? 2 : 1; }

  /* ── 또르르 ──────────────────────────────────── */
  scatter() {
    this.state = 'scatter';
    AudioSystem.back();
    if (this.hud) this.hud.miss(GAME.WIDTH / 2, this.HAND_Y - 80);
    this.flash(EPI.gonggi.missed);
    this.stones.forEach((st) => {
      st.vy = 0; st.vx = 0; st.spin = 0;
      this.tweens.add({
        targets: st,
        x: Phaser.Math.Clamp(st.x + Phaser.Math.Between(-92, 92), 48, GAME.WIDTH - 48),
        y: this.FLOOR + Phaser.Math.Between(-6, 26),
        angle: Phaser.Math.Between(-90, 90),
        duration: 620, ease: 'Sine.easeOut'
      });
    });
    if (!this.stopBtn) this.showStopButton();

    /* 처음 놓쳤을 때만 친구들이 말을 겁니다 */
    if (!this.helpedOnce) {
      this.helpedOnce = true;
      this.time.delayedCall(820, () => {
        if (this.finished || this.stopped) return;
        this.dialogue.play(EPI.gonggi.helped, () => this.helpPickUp());
      });
      return;
    }
    this.time.delayedCall(820, () => this.helpPickUp());
  }

  helpPickUp() {
    if (this.finished || this.stopped) return;
    AudioSystem.found();
    this.ready();
  }

  showStopButton() {
    this.stopBtn = UI.button(this, GAME.WIDTH / 2, 700, 232, 56, EPI.gonggi.stopBtn,
      () => this.finish(), { size: FONT.small });
    this.stopBtn.setDepth(210).setAlpha(0);
    this.tweens.add({ targets: this.stopBtn, alpha: 1, duration: 500 });
  }

  updateCount() {
    this.countText.setText(EPI.gonggi.countLabel + ' ' + this.count + EPI.gonggi.unit);
  }

  bounceCount() {
    this.tweens.killTweensOf(this.countText);
    this.countText.setScale(1);
    this.tweens.add({ targets: this.countText, scale: 1.22, duration: 120, yoyo: true });
  }

  flash(msg) {
    /* 앞의 말이 아직 남아 있으면 물러나게 합니다 — 겹쳐 찍히지 않도록 */
    if (this._flashText && this._flashText.scene) this._flashText.destroy();
    const t = this.add.text(GAME.WIDTH / 2, this.flashY, msg,
      UI.style(FONT.small, PAL.ink, { align: 'center', wordWrap: { width: GAME.WIDTH - 70 } }))
      .setOrigin(0.5).setDepth(205).setAlpha(0);
    this._flashText = t;
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1250, () => {
      if (!t.scene) return;
      this.tweens.add({ targets: t, alpha: 0, duration: 400, onComplete: () => t.destroy() });
    });
  }

  finish() {
    if (this.stopped) return;
    this.stopped = true;
    this.state = 'done';
    this.setHint('');
    this.countText.setText('');
    if (this.stopBtn) { this.stopBtn.destroy(); this.stopBtn = null; }
    if (this.actBtn) { this.actBtn.setVisible(false); }
    this.complete(EPI.gonggi.done);
  }
};
