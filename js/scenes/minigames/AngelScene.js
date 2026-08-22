/* DAY 2 미니게임 · 수호천사

   마음의 소음이 위에서부터 내려옵니다.
   수호천사가 좌우로 움직이며 사탕을 던져, 그 말들이 나에게 닿지 못하게 합니다.

   지는 것은 없습니다.
   말이 자꾸 닿아 힘들어지면 가롤로가 천사들과 함께 와서
   아래에 포대를 세우고 같이 쏘아 줍니다. 그때부터는 훨씬 수월합니다. */

window.AngelScene = class AngelScene extends MiniGameScene {
  constructor() { super('AngelScene'); }

  create(data) {
    const A = DAY02.angel;
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#2b3348',
      title: A.title, hint: ''
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;

    this.TOP = 156;               // 소음이 내려오기 시작하는 줄
    this.LINE = 690;              // 이 줄까지 내려오면 마음에 닿습니다
    this.ANGEL_Y = 640;

    /* 지난번 흔적을 모두 지웁니다 */
    this.playing = false;
    this.level = null;
    this.blobs = [];
    this.candies = [];
    this.blocked = 0;
    this.heart = 5;
    this.helped = false;
    this.aimX = W / 2;
    this.shotAt = 0;
    this.spawnAt = 0;
    this.waveLeft = 0;
    this._flashText = null;

    /* ── 밤하늘 ────────────────────────────────── */
    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0x232b3e, 1); g.fillRect(0, this.TOP - 6, W, H - this.TOP + 6);
    g.fillStyle(0x2f3850, 1); g.fillRect(0, this.LINE, W, H - this.LINE);
    g.lineStyle(2, 0xf2b56b, 0.30); g.lineBetween(0, this.LINE, W, this.LINE);
    for (let i = 0; i < 40; i++) {
      const s = this.add.image(Phaser.Math.Between(8, W - 8), Phaser.Math.Between(this.TOP, this.LINE - 40), 'dot')
        .setDepth(-88).setScale(Phaser.Math.FloatBetween(0.1, 0.28))
        .setAlpha(Phaser.Math.FloatBetween(0.15, 0.5));
      this.tweens.add({ targets: s, alpha: 0.06, duration: Phaser.Math.Between(1800, 3600), yoyo: true, repeat: -1 });
    }

    /* ── 나 — 아래에서 지켜봅니다 ──────────────── */
    this.me = this.add.image(304, 748, 'player_front').setDepth(30).setScale(1.3);
    this.add.image(304, 764, 'shadow').setDepth(29).setScale(1.2).setAlpha(0.35);

    /* ── 수호천사 ──────────────────────────────── */
    this.angel = this.add.image(W / 2, this.ANGEL_Y, 'd2_angel').setDepth(40).setScale(1.35);
    this.tweens.add({ targets: this.angel, y: this.ANGEL_Y - 5, duration: 1200, yoyo: true, repeat: -1 });

    /* ── 세는 곳 ───────────────────────────────── */
    this.info = this.add.text(W / 2, 126, '', UI.style(FONT.small, PAL.cream, { align: 'center' }))
      .setOrigin(0.5, 0).setDepth(200);

    /* ── 조작 ──────────────────────────────────── */
    const bY = 812;
    this.btnLeft = UI.padButton(this, 58, bY, 84, 68, '◀', { size: 28, quiet: true });
    this.btnRight = UI.padButton(this, 150, bY, 84, 68, '▶', { size: 28, quiet: true });
    this.btnFire = UI.padButton(this, 300, bY, 128, 68, '사탕', { size: FONT.small, fill: PAL.sun });
    [this.btnLeft, this.btnRight, this.btnFire].forEach(b => b.setDepth(210).setVisible(false));
    this.btnFire.onPress = () => this.fire();

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyAD = this.input.keyboard.addKeys('A,D');
      this.input.keyboard.on('keydown-SPACE', () => {
        if (!this.dialogue.isOpen) this.fire();
      });
    }

    this.time.delayedCall(400, () => {
      this.dialogue.play(A.open, () => this.askLevel());
    });
  }

  /* ── 어느 정도로 해볼까요 ────────────────────── */
  askLevel() {
    const A = DAY02.angel;
    this.dialogue.choose(A.levelHead + '\n' + A.levelNote,
      A.levels.map(l => ({ key: l.key, label: l.label + '  —  ' + l.note })),
      (key) => {
        this.level = A.levels.find(l => l.key === key) || A.levels[0];
        SaveSystem.set('reflections.day2AngelLevel', this.level.label);
        this.startRound();
      });
  }

  startRound() {
    const A = DAY02.angel;
    this.setHint(A.hint);
    this.hintText.setColor(PAL.cream);
    this.blobs.forEach(b => b.destroy());
    this.candies.forEach(c => c.destroy());
    this.blobs = [];
    this.candies = [];
    this.blocked = 0;
    this.heart = 5;
    this.waveLeft = this.level.count || 25;     // 이만큼 막아내면 조용해집니다
    this.spawnAt = 0;
    [this.btnLeft, this.btnRight, this.btnFire].forEach(b => b.setVisible(true));
    this.updateInfo();
    this.playing = true;
  }

  /* ── 매 프레임 ───────────────────────────────── */
  update(time, delta) {
    if (this.finished || !this.angel || !this.angel.scene) return;
    const dt = Math.min(delta, 40) / 1000;
    const W = GAME.WIDTH;

    if (!this.playing || this.dialogue.isOpen) return;

    /* 좌우로 움직입니다 */
    let dir = 0;
    if (this.btnLeft && this.btnLeft.isDown) dir -= 1;
    if (this.btnRight && this.btnRight.isDown) dir += 1;
    const c = this.cursors, k = this.keyAD;
    if ((c && c.left.isDown) || (k && k.A.isDown)) dir -= 1;
    if ((c && c.right.isDown) || (k && k.D.isDown)) dir += 1;
    if (dir !== 0) this.aimX += dir * 300 * dt;
    this.aimX = Phaser.Math.Clamp(this.aimX, 34, W - 34);
    this.angel.x = Phaser.Math.Linear(this.angel.x, this.aimX, 0.32);

    /* 소음이 새로 내려옵니다 */
    if (time > this.spawnAt && this.waveLeft > 0) {
      this.spawnAt = time + this.level.gap;
      this.spawnBlob();
    }

    /* 사탕 */
    for (let i = this.candies.length - 1; i >= 0; i--) {
      const s = this.candies[i];
      s.y -= 620 * dt;
      s.angle += 420 * dt;
      if (s.y < this.TOP - 10) { s.destroy(); this.candies.splice(i, 1); }
    }

    /* 소음 */
    for (let i = this.blobs.length - 1; i >= 0; i--) {
      const b = this.blobs[i];
      b.y += this.level.fall * dt;
      b.x += b.drift * dt;
      if (b.x < 52) { b.x = 52; b.drift = Math.abs(b.drift); }
      if (b.x > W - 52) { b.x = W - 52; b.drift = -Math.abs(b.drift); }
      if (b.y >= this.LINE - 20) { this.reached(b); this.blobs.splice(i, 1); }
    }

    this.hitCheck();

    if (this.playing && this.waveLeft <= 0 && this.blobs.length === 0) this.cleared();
  }

  /* ── 소음 하나 ───────────────────────────────── */
  spawnBlob() {
    const W = GAME.WIDTH;
    const words = DAY02.angel.words || DAY02.noise.words;
    const word = words[Phaser.Math.Between(0, words.length - 1)];

    const c = this.add.container(Phaser.Math.Between(60, W - 60), this.TOP + 10).setDepth(60);
    const img = this.add.image(0, 0, 'd2_noise_blob');
    const t = this.add.text(0, 1, word, UI.style(13, PAL.cream, {
      align: 'center', wordWrap: { width: 86 }
    })).setOrigin(0.5);
    const w = Math.max(96, t.width + 26);
    img.setDisplaySize(w, 46);
    c.add([img, t]);
    c.hw = w / 2; c.hh = 23;
    c.drift = Phaser.Math.Between(-34, 34);
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 300 });
    this.blobs.push(c);
    this.waveLeft--;
  }

  /* ── 사탕을 던집니다 ─────────────────────────── */
  fire() {
    if (!this.playing || this.finished || this.dialogue.isOpen) return;
    const now = this.time.now;
    if (now - this.shotAt < 190) return;              // 너무 빨리 던지지는 못합니다
    this.shotAt = now;

    if (this.helped) {
      /* 가롤로가 온 뒤로는 사탕이 두 개씩 나갑니다 */
      this.throwCandy(this.angel.x - 13, this.ANGEL_Y - 18);
      this.throwCandy(this.angel.x + 13, this.ANGEL_Y - 18);
    } else {
      this.throwCandy(this.angel.x, this.ANGEL_Y - 18);
    }
    AudioSystem.blip();

    /* 가운데와 양쪽 끝의 포대도 함께 쏩니다 */
    if (this.helped && this.batteries) {
      this.batteries.forEach((b, i) => {
        this.time.delayedCall(70 + i * 45, () => {
          if (!this.playing || !b.scene) return;
          this.throwCandy(b.x, b.y - 24);
          this.tweens.add({ targets: b, y: b.baseY + 4, duration: 80, yoyo: true });
        });
      });
    }
  }

  throwCandy(x, y) {
    const s = this.add.image(x, y, 'd2_candy').setDepth(70).setScale(1.25);
    this.candies.push(s);
  }

  /* ── 사탕이 소음에 닿았을 때 ─────────────────── */
  hitCheck() {
    for (let i = this.candies.length - 1; i >= 0; i--) {
      const s = this.candies[i];
      let 맞음 = false;
      for (let j = this.blobs.length - 1; j >= 0; j--) {
        const b = this.blobs[j];
        if (Math.abs(s.x - b.x) < b.hw + 8 && Math.abs(s.y - b.y) < b.hh + 10) {
          this.popBlob(b);
          this.blobs.splice(j, 1);
          맞음 = true;
          break;
        }
      }
      if (맞음) { s.destroy(); this.candies.splice(i, 1); }
    }
  }

  popBlob(b) {
    this.blocked++;
    this.updateInfo();
    AudioSystem.found();
    this.tweens.add({
      targets: b, alpha: 0, scale: 1.35, y: b.y - 12, duration: 300,
      onComplete: () => b.destroy()
    });
  }

  /* ── 마음에 닿았을 때 — 지는 것은 아닙니다 ──── */
  reached(b) {
    this.heart--;
    this.updateInfo();
    AudioSystem.back();
    this.cameras.main.shake(160, 0.004);
    this.flash(DAY02.angel.hitLine);
    this.tweens.add({
      targets: b, alpha: 0, y: b.y + 26, duration: 380,
      onComplete: () => b.destroy()
    });
    this.tweens.add({ targets: this.me, alpha: 0.55, duration: 140, yoyo: true });

    if (this.heart <= 2 && !this.helped) this.callCarlo();
  }

  /* ── 가롤로와 천사들이 옵니다 ────────────────── */
  callCarlo() {
    const W = GAME.WIDTH, A = DAY02.angel;
    this.helped = true;
    this.playing = false;
    if (this.btnLeft) [this.btnLeft, this.btnRight, this.btnFire].forEach(b => b.release && b.release());

    this.dialogue.play(A.helpCome, () => {
      /* 가운데와 양쪽 끝, 포대 셋을 세웁니다 */
      this.batteries = [W / 2, 46, W - 46].map((x, i) => {
        const b = this.add.image(x, this.LINE + 26, 'd2_battery')
          .setDepth(35).setScale(i === 0 ? 1.2 : 1.0).setAlpha(0);
        b.baseY = b.y;
        this.tweens.add({ targets: b, alpha: 1, duration: 500, delay: i * 160 });
        return b;
      });

      this.carlo = this.add.image(W / 2 - 70, this.LINE + 30, 'carlo_front')
        .setDepth(34).setScale(1.15).setAlpha(0);
      this.tweens.add({ targets: this.carlo, alpha: 1, duration: 500, delay: 150 });

      /* 포대마다 천사가 하나씩 붙습니다 */
      this.helpers = [46, W - 46].map((x, i) => {
        const a = this.add.image(x, this.LINE - 16, 'd2_angel')
          .setDepth(38).setScale(1.0).setAlpha(0);
        this.tweens.add({ targets: a, alpha: 0.95, duration: 500, delay: 260 + i * 150 });
        this.tweens.add({ targets: a, y: this.LINE - 22, duration: 1100, yoyo: true, repeat: -1 });
        return a;
      });

      AudioSystem.chime();
      this.heart = 5;
      this.updateInfo();
      this.flash(A.helpLine);

      /* 소음은 그대로 쏟아집니다 — 대신 이쪽 화력이 세집니다 */

      this.time.delayedCall(900, () => { this.playing = true; });
    });
  }

  updateInfo() {
    const A = DAY02.angel;
    this.info.setText(A.scoreLabel + '  ' + this.blocked + '      ' + A.lifeLabel + '  ' + Math.max(0, this.heart) + ' / 5');
  }

  flash(msg) {
    if (this._flashText && this._flashText.scene) this._flashText.destroy();
    const t = this.add.text(GAME.WIDTH / 2, this.LINE - 104, msg,
      UI.style(FONT.small, PAL.sun, { align: 'center', wordWrap: { width: GAME.WIDTH - 70 } }))
      .setOrigin(0.5).setDepth(220).setAlpha(0);
    this._flashText = t;
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1300, () => {
      if (!t.scene) return;
      this.tweens.add({ targets: t, alpha: 0, duration: 420, onComplete: () => t.destroy() });
    });
  }

  /* ── 조용해졌습니다 ──────────────────────────── */
  cleared() {
    const W = GAME.WIDTH, A = DAY02.angel;
    this.playing = false;
    this.setHint('');
    [this.btnLeft, this.btnRight, this.btnFire].forEach(b => { if (b) b.setVisible(false); });
    this.candies.forEach(s => s.destroy());
    this.candies = [];
    AudioSystem.chime();

    const t = this.add.text(W / 2, this.TOP + 120, A.clearHead,
      UI.style(26, PAL.sun, { align: 'center' })).setOrigin(0.5).setDepth(220).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 800 });
    this.tweens.add({ targets: this.angel, y: this.ANGEL_Y - 16, duration: 400, yoyo: true, repeat: 1 });

    this.time.delayedCall(1100, () => {
      this.againBtn = UI.button(this, W / 2, 700, 240, 60, A.againBtn,
        () => { t.destroy(); this.playAgain(); }, { size: FONT.label, fill: PAL.sun });
      this.goBtn = UI.button(this, W / 2, 776, 240, 56, A.goBtn,
        () => { t.destroy(); this.finishAll(); }, { size: FONT.small });
      [this.againBtn, this.goBtn].forEach(b => b.setDepth(220).setAlpha(0));
      this.tweens.add({ targets: [this.againBtn, this.goBtn], alpha: 1, duration: 600 });
    });
  }

  playAgain() {
    if (this.againBtn) { this.againBtn.destroy(); this.againBtn = null; }
    if (this.goBtn) { this.goBtn.destroy(); this.goBtn = null; }
    AudioSystem.select();
    this.askLevel();
  }

  finishAll() {
    if (this.againBtn) { this.againBtn.destroy(); this.againBtn = null; }
    if (this.goBtn) { this.goBtn.destroy(); this.goBtn = null; }
    AudioSystem.setAmbience('room');
    this.complete(DAY02.angel.done);
  }
};
