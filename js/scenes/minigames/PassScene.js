/* 에필로그 미니게임 · 축구 한 판
   공을 몰고 골대로 갑니다. 상대가 몰고 있으면 가까이 가서 뺏습니다.
   점수판은 있지만, 끝나고 나면 아무도 그 숫자를 기억하지 않습니다. */

window.PassScene = class PassScene extends MiniGameScene {
  constructor() { super('PassScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#8aa96b',
      title: EPI.pass.title, hint: EPI.pass.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;

    /* 운동장 경계 */
    this.L = 20; this.R = W - 20;
    this.T = 140; this.B = 660;
    this.GOAL_L = 132; this.GOAL_R = 258;
    this.THEIR_LINE = this.T + 12;      // 이 선을 넘으면 저쪽 골
    this.MY_LINE = this.B - 12;

    /* 사람이 서 있을 수 있는 범위 — 골대 안으로는 못 들어갑니다 */
    this.PT = this.T + 72; this.PB = this.B - 72;

    /* ── 잔디 ──────────────────────────────────── */
    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0x7d9c60, 1); g.fillRect(0, 130, W, H - 130);
    g.fillStyle(0x86a668, 1);
    for (let y = this.T; y < this.B; y += 58) g.fillRect(0, y, W, 29);
    g.lineStyle(3, 0xf4ede0, 0.45);
    g.strokeRect(this.L, this.T, this.R - this.L, this.B - this.T);
    g.lineBetween(this.L, (this.T + this.B) / 2, this.R, (this.T + this.B) / 2);
    g.strokeCircle(W / 2, (this.T + this.B) / 2, 52);

    /* 조작하는 자리는 잔디와 나눕니다 */
    const pad = this.add.graphics().setDepth(-88);
    pad.fillStyle(0x5f7a4a, 1); pad.fillRect(0, 668, W, H - 668);
    pad.lineStyle(2, 0xf4ede0, 0.25); pad.lineBetween(0, 668, W, 668);

    /* ── 골대 둘 ───────────────────────────────── */
    this.add.image(W / 2, this.T, 'epi_goal').setOrigin(0.5, 0).setDepth(6);
    this.add.image(W / 2, this.B, 'epi_goal').setOrigin(0.5, 1).setFlipY(true).setDepth(6);

    /* ── 사람들 ────────────────────────────────── */
    this.me = this.add.image(W / 2, 560, 'player_front').setScale(1.45);
    this.me.shadow = this.add.image(this.me.x, this.me.y + 22, 'shadow').setScale(1.3).setAlpha(0.34);

    this.opps = [
      this.add.image(148, 300, 'epi_leo_front').setScale(1.45),
      this.add.image(250, 262, 'epi_ita_front').setScale(1.45)
    ];
    this.opps.forEach((o) => {
      o.shadow = this.add.image(o.x, o.y + 22, 'shadow').setScale(1.3).setAlpha(0.34);
    });

    this.ball = this.add.image(W / 2, (this.T + this.B) / 2, 'soccer_ball').setScale(1.25);

    /* ── 점수판 — 골대 바로 아래, 잔디 위에 ───── */
    this.scoreText = this.add.text(W / 2, 226, '', UI.style(FONT.body, PAL.cream, { align: 'center' }))
      .setOrigin(0.5).setDepth(200);
    this.flashY = 300;

    /* ── 조작 ──────────────────────────────────── */
    this.stick = new Joystick(this, { zoneTop: 676, radius: 46 });
    if (this.stick.hint) {
      this.stick.hint.setText(window.IS_DESKTOP ? '방향키로 움직이세요' : '이 아래를 눌러 움직이세요')
        .setPosition(128, 826).setDepth(210);
    }

    this.actBtn = UI.padButton(this, 310, 760, 116, 96, EPI.pass.kickBtn,
      { size: FONT.label, fill: PAL.sun });
    this.actBtn.setDepth(210);
    this.actBtn.onPress = () => this.act();

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', () => {
        if (!this.dialogue.isOpen) this.act();
      });
    }

    /* 장면은 다시 열려도 같은 것을 씁니다 — 지난번 흔적을 모두 지웁니다 */
    this.myGoals = 0;
    this.theirGoals = 0;
    this._flashText = null;
    this.bvx = 0; this.bvy = 0;
    this.stealCool = 0;
    this.ballCool = 0;
    this.busy = true;
    this.owner = null;
    this.updateScore();

    this.dialogue.play(EPI.pass.open, () => this.kickOff('me'));
  }

  /* ── 가운데에서 다시 ─────────────────────────── */
  kickOff(who) {
    const W = GAME.WIDTH;
    this.me.setPosition(W / 2, 560);
    this.opps[0].setPosition(148, 300);
    this.opps[1].setPosition(250, 262);
    this.bvx = 0; this.bvy = 0;
    this.opps.forEach((o) => { o.shootCool = 900; });
    this.owner = (who === 'me') ? 'me' : this.opps[0];
    const h = (who === 'me') ? this.me : this.opps[0];
    this.ball.setPosition(h.x, h.y + 20);
    this.stealCool = 800;
    this.ballCool = 0;
    this.busy = false;
    this.updateActLabel();
  }

  update(time, delta) {
    if (this.finished || !this.me || !this.me.scene) return;
    const dt = Math.min(delta, 40) / 1000;
    this.stealCool -= delta;
    this.ballCool -= delta;

    if (!this.busy && !this.dialogue.isOpen) {
      /* 내가 움직입니다 */
      const v = this.stick.read();
      if (v.x !== 0 || v.y !== 0) {
        this.me.x = Phaser.Math.Clamp(this.me.x + v.x * 172 * dt, this.L + 16, this.R - 16);
        this.me.y = Phaser.Math.Clamp(this.me.y + v.y * 172 * dt, this.PT, this.PB);
        if (Math.abs(v.x) > 0.2) this.me.setFlipX(v.x < 0);
        if (time - (this._stepAt || 0) > 300) { this._stepAt = time; AudioSystem.step(); }
      }
      this.opps.forEach((o, i) => this.moveOpp(o, i, dt));
      this.moveBall(dt);
      this.checkContact();
    }

    /* 그림자와 앞뒤 정렬 */
    [this.me].concat(this.opps).forEach((p) => {
      p.shadow.setPosition(p.x, p.y + 22);
      p.setDepth(20 + p.y * 0.1);
      p.shadow.setDepth(p.depth - 1);
    });
    this.ball.setDepth(20 + this.ball.y * 0.1 + 2);
  }

  /* ── 상대의 움직임 ───────────────────────────── */
  moveOpp(o, i, dt) {
    let tx, ty, sp;

    if (this.owner === o) {
      /* 공을 몰고 우리 골대로 갑니다.
         뺏은 자리에서 곧바로 차지는 않습니다 — 한 박자 몰고 갑니다. */
      o.shootCool = (o.shootCool || 0) - dt * 1000;
      if (o.shootCool <= 0 &&
          Phaser.Math.Distance.Between(o.x, o.y, GAME.WIDTH / 2, this.B) < 168) {
        this.oppShoot(o);
        return;
      }
      tx = GAME.WIDTH / 2; ty = this.PB; sp = 104;
    } else if (this.owner === null) {
      /* 굴러다니는 공 — 가까운 쪽이 달려갑니다 */
      const mine = this.nearestOpp();
      if (mine === o) { tx = this.ball.x; ty = this.ball.y; sp = 134; }
      else { tx = GAME.WIDTH / 2; ty = (this.T + this.B) / 2; sp = 96; }
    } else {
      /* 내가 몰고 있으면 쫓아옵니다 — 나보다는 조금 느립니다 */
      tx = this.me.x; ty = this.me.y; sp = 118 + i * 6;
    }

    const d = Phaser.Math.Distance.Between(o.x, o.y, tx, ty);
    if (d < 4) return;
    const ang = Math.atan2(ty - o.y, tx - o.x);
    o.x = Phaser.Math.Clamp(o.x + Math.cos(ang) * sp * dt, this.L + 16, this.R - 16);
    o.y = Phaser.Math.Clamp(o.y + Math.sin(ang) * sp * dt, this.PT, this.PB);
    o.setFlipX(Math.cos(ang) < 0);
  }

  nearestOpp() {
    let best = null, bd = 1e9;
    this.opps.forEach((o) => {
      const d = Phaser.Math.Distance.Between(o.x, o.y, this.ball.x, this.ball.y);
      if (d < bd) { bd = d; best = o; }
    });
    return best;
  }

  /* ── 공 ──────────────────────────────────────── */
  moveBall(dt) {
    if (this.owner) {
      const h = (this.owner === 'me') ? this.me : this.owner;
      this.ball.x = Phaser.Math.Linear(this.ball.x, h.x, 0.32);
      this.ball.y = Phaser.Math.Linear(this.ball.y, h.y + 20, 0.32);
      this.ball.angle += (h.flipX ? -3 : 3);
      return;
    }

    this.ball.x += this.bvx * dt;
    this.ball.y += this.bvy * dt;
    this.ball.angle += this.bvx * dt * 0.9;
    const f = Math.pow(0.42, dt);
    this.bvx *= f; this.bvy *= f;

    if (this.ball.x < this.L + 8) { this.ball.x = this.L + 8; this.bvx = Math.abs(this.bvx) * 0.6; }
    if (this.ball.x > this.R - 8) { this.ball.x = this.R - 8; this.bvx = -Math.abs(this.bvx) * 0.6; }

    const inMouth = this.ball.x > this.GOAL_L && this.ball.x < this.GOAL_R;
    if (this.ball.y <= this.THEIR_LINE) {
      if (inMouth) { this.goalFor('me'); return; }
      this.ball.y = this.THEIR_LINE; this.bvy = Math.abs(this.bvy) * 0.6;
    }
    if (this.ball.y >= this.MY_LINE) {
      if (inMouth) { this.goalFor('them'); return; }
      this.ball.y = this.MY_LINE; this.bvy = -Math.abs(this.bvy) * 0.6;
    }
  }

  /* 굴러다니는 공은 먼저 닿는 사람의 것입니다 */
  checkContact() {
    if (this.owner === null) {
      if (this.ballCool > 0) return;
      if (Phaser.Math.Distance.Between(this.ball.x, this.ball.y, this.me.x, this.me.y + 16) < 30) {
        this.give('me'); return;
      }
      for (const o of this.opps) {
        if (Phaser.Math.Distance.Between(this.ball.x, this.ball.y, o.x, o.y + 16) < 30) {
          this.give(o); return;
        }
      }
      return;
    }
    /* 내가 몰고 있는데 상대가 붙으면 뺏깁니다 */
    if (this.owner === 'me' && this.stealCool <= 0) {
      for (const o of this.opps) {
        if (Phaser.Math.Distance.Between(o.x, o.y, this.me.x, this.me.y) < 36) {
          this.give(o);
          this.flash(EPI.pass.lost);
          AudioSystem.back();
          return;
        }
      }
    }
  }

  give(who) {
    this.owner = who;
    this.bvx = 0; this.bvy = 0;
    this.stealCool = 750;
    if (who && who !== 'me') who.shootCool = 900;
    this.updateActLabel();
  }

  /* ── 단추 ────────────────────────────────────── */
  act() {
    if (this.finished || this.busy || this.dialogue.isOpen) return;

    if (this.owner === 'me') { this.shoot(); return; }

    if (this.owner) {                                  // 상대가 몰고 있습니다
      const o = this.owner;
      const d = Phaser.Math.Distance.Between(this.me.x, this.me.y, o.x, o.y);
      if (d < 58) {
        this.give('me');
        this.flash(EPI.pass.stole);
        AudioSystem.found();
        this.tweens.add({ targets: o, angle: -8, duration: 120, yoyo: true });
      } else {
        AudioSystem.swipe();
      }
      return;
    }
    AudioSystem.swipe();                               // 공은 아직 굴러가는 중
  }

  shoot() {
    const gx = GAME.WIDTH / 2, gy = this.T;
    const far = Phaser.Math.Distance.Between(this.me.x, this.me.y, gx, gy) > 250;
    let ang = Math.atan2(gy - this.ball.y, gx - this.ball.x);
    ang += far ? Phaser.Math.FloatBetween(-0.34, 0.34) : Phaser.Math.FloatBetween(-0.05, 0.05);

    this.owner = null;
    this.bvx = Math.cos(ang) * 545;
    this.bvy = Math.sin(ang) * 545;
    this.ballCool = 280;
    AudioSystem.kick();
    this.tweens.add({ targets: this.me, scale: 1.58, duration: 110, yoyo: true });
    this.updateActLabel();
    if (far) this.flash(EPI.pass.tooFar);
  }

  oppShoot(o) {
    const gx = GAME.WIDTH / 2, gy = this.B;
    const ang = Math.atan2(gy - this.ball.y, gx - this.ball.x) + Phaser.Math.FloatBetween(-0.42, 0.42);
    this.owner = null;
    this.bvx = Math.cos(ang) * 520;
    this.bvy = Math.sin(ang) * 520;
    this.ballCool = 280;
    AudioSystem.kick();
    this.tweens.add({ targets: o, scale: 1.58, duration: 110, yoyo: true });
    this.updateActLabel();
  }

  /* ── 골 ──────────────────────────────────────── */
  goalFor(side) {
    this.busy = true;
    this.bvx = 0; this.bvy = 0;
    this.owner = null;

    if (side === 'me') {
      this.myGoals++;
      AudioSystem.chime();
      this.flash(EPI.pass.myGoal);
      this.tweens.add({ targets: this.me, y: this.me.y - 16, duration: 200, yoyo: true, repeat: 1 });
    } else {
      this.theirGoals++;
      AudioSystem.bell();
      this.flash(EPI.pass.theirGoal);
      this.opps.forEach((o, i) => {
        this.tweens.add({ targets: o, y: o.y - 16, duration: 200, delay: i * 90, yoyo: true, repeat: 1 });
      });
    }
    this.updateScore();

    this.time.delayedCall(1600, () => {
      if (this.finished) return;
      if (this.myGoals + this.theirGoals >= 3) { this.finish(); return; }
      this.kickOff(side === 'me' ? 'them' : 'me');
    });
  }

  updateScore() {
    const P = EPI.pass;
    this.scoreText.setText(P.mine + ' ' + this.myGoals + '   ·   ' + P.theirs + ' ' + this.theirGoals);
  }

  updateActLabel() {
    if (!this.actBtn) return;
    this.actBtn.setLabel(this.owner === 'me' ? EPI.pass.kickBtn : EPI.pass.stealBtn);
  }

  flash(msg) {
    /* 앞의 말이 아직 남아 있으면 물러나게 합니다 — 겹쳐 찍히지 않도록 */
    if (this._flashText && this._flashText.scene) this._flashText.destroy();
    const t = this.add.text(GAME.WIDTH / 2, this.flashY, msg,
      UI.style(FONT.small, PAL.cream, { align: 'center', wordWrap: { width: GAME.WIDTH - 80 } }))
      .setOrigin(0.5).setDepth(205).setAlpha(0);
    this._flashText = t;
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(1200, () => {
      if (!t.scene) return;
      this.tweens.add({ targets: t, alpha: 0, duration: 380, onComplete: () => t.destroy() });
    });
  }

  /* ── 마침 — 이긴 쪽을 부르지 않습니다 ────────── */
  finish() {
    const W = GAME.WIDTH;
    this.busy = true;
    this.setHint('');
    if (this.actBtn) this.actBtn.setVisible(false);
    if (this.stick) { this.stick.reset(); if (this.stick.hint) this.stick.hint.setVisible(false); }

    [this.me].concat(this.opps).forEach((p, i) => {
      this.tweens.add({ targets: p, y: p.y - 14, duration: 320, yoyo: true, delay: i * 100 });
    });
    AudioSystem.chime();

    const t = this.add.text(W / 2, 300, EPI.pass.doneLine,
      UI.style(22, PAL.cream, { align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 6 }))
      .setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 900, delay: 600 });

    this.time.delayedCall(2600, () => this.complete(EPI.pass.done));
  }
};
