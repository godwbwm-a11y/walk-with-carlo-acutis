/* DAY 6 미니게임 · 성당 탐험대

   외국인 친구들과 함께 한국의 작은 성당 안을 걸어 다니며,
   “말씀을 선포하는 곳을 찾아라!” 같은 미션을 하나씩 풉니다.
   맞는 자리에 서면 FOUND! 와 함께 이름과 한 문장 설명이 나옵니다.
   엉뚱한 곳에 서도 그 자리의 이름을 알려 줍니다 — 틀려도 배웁니다. */

window.ChurchQuestScene = class ChurchQuestScene extends MiniGameScene {
  constructor() { super('ChurchQuestScene'); }

  create(data) {
    const Q = DAY06.quest;
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#2c3550',
      title: Q.title, hint: Q.missions[0].ask
    });
    this.hintText.setColor(PAL.sun);

    const W = GAME.WIDTH, H = GAME.HEIGHT;

    /* 지난번 흔적을 지웁니다 */
    this.idx = 0;
    this.busy = true;
    this.inside = null;
    this.foundIds = {};
    this.idleAt = 0;

    this.drawChurch();

    /* ── 성당 안의 자리들 ──────────────────────── */
    /* tx, ty 는 그 앞에 서야 하는 자리입니다 */
    const spots = [
      { id: 'lamp', tex: 'sanctuary_lamp', x: 252, y: 258, s: 1.0, tx: 252, ty: 338 },
      { id: 'ambo', tex: 'ch_ambo', x: 78, y: 356, s: 1.15, tx: 78, ty: 402 },
      { id: 'altar', tex: 'altar', x: 195, y: 344, s: 1.0, tx: 195, ty: 400 },
      { id: 'tabernacle', tex: 'ch_tabernacle', x: 318, y: 348, s: 1.1, tx: 318, ty: 400 },
      { id: 'font', tex: 'ch_font', x: 72, y: 676, s: 1.1, tx: 72, ty: 700 },
      { id: 'confess', tex: 'ch_confess', x: 326, y: 660, s: 1.0, tx: 326, ty: 706 }
    ];

    this.spots = spots.map((sp) => {
      const info = Q.missions.find(m => m.id === sp.id);
      const img = this.add.image(sp.x, sp.y, sp.tex).setDepth(sp.y).setScale(sp.s);
      const label = this.add.text(sp.tx, sp.ty + 22, info.name,
        UI.style(FONT.tiny, PAL.cream)).setOrigin(0.5).setDepth(760).setAlpha(0);
      const plate = this.add.graphics().setDepth(759).setAlpha(0);
      plate.fillStyle(0x101a2e, 0.7);
      plate.fillRoundedRect(sp.tx - label.width / 2 - 8, sp.ty + 12, label.width + 16, 20, 10);
      return { id: sp.id, name: info.name, img: img, label: label, plate: plate,
               tx: sp.tx, ty: sp.ty, shown: false };
    });

    /* ── 함께 온 친구들 ────────────────────────── */
    [[128, 560, 'pilgrim_e'], [214, 578, 'pilgrim_a'], [268, 552, 'pilgrim_c']]
      .forEach((f, i) => {
        const img = this.add.image(f[0], f[1], f[2]).setDepth(f[1]).setScale(1.2).setAlpha(0.95);
        this.tweens.add({ targets: img, y: f[1] - 4, duration: 1000 + i * 160, yoyo: true, repeat: -1 });
        this.tweens.add({
          targets: img, x: f[0] + Phaser.Math.Between(-26, 26),
          duration: 4000 + i * 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
      });

    /* ── 나 ────────────────────────────────────── */
    this.me = this.add.image(195, 762, 'player_back').setDepth(762).setScale(1.3);
    this.meShadow = this.add.image(195, 776, 'shadow').setDepth(760).setScale(1.2).setAlpha(0.4);

    /* ── 찾았습니다 알림 ───────────────────────── */
    this.banner = this.add.text(W / 2, 172, '',
      UI.style(26, PAL.sun, { align: 'center' })).setOrigin(0.5).setDepth(880).setAlpha(0);

    this.progress = this.add.text(W / 2, H - 30, '',
      UI.style(FONT.tiny, PAL.dim)).setOrigin(0.5).setDepth(880).setAlpha(0.85);
    this.updateProgress();

    /* ── 걷기 ──────────────────────────────────── */
    this.stick = new Joystick(this, { zoneTop: 150, radius: 46 });
    if (this.stick.hint) {
      this.stick.hint.setText(window.IS_DESKTOP ? '방향키로 걸어보세요' : '화면을 눌러 걸어보세요')
        .setPosition(W / 2, H - 58).setDepth(880);
    }

    this.time.delayedCall(400, () => {
      this.dialogue.play(Q.open, () => {
        this.busy = false;
        this.idleAt = this.time.now;
      });
    });
  }

  /* ── 성당 안 ─────────────────────────────────── */
  drawChurch() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;

    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0x3b4460, 1); g.fillRect(0, 140, W, H - 140);      // 벽
    g.fillStyle(0x4c5573, 1); g.fillRect(0, 300, W, H - 300);      // 바닥
    /* 바닥 돌 무늬 */
    g.lineStyle(1, 0x5b6485, 0.7);
    for (let y = 320; y < H; y += 44) g.lineBetween(0, y, W, y);
    for (let x = 30; x < W; x += 52) g.lineBetween(x, 300, x, H);
    /* 제단 단 */
    g.fillStyle(0x565f7d, 1); g.fillRect(0, 300, W, 118);
    g.fillStyle(0x626b8a, 1); g.fillRect(0, 300, W, 6);

    /* 창과 십자가 */
    this.add.image(64, 150, 'stained_glass').setOrigin(0.5, 0).setDepth(-88).setScale(0.72).setAlpha(0.9);
    this.add.image(326, 150, 'stained_glass').setOrigin(0.5, 0).setDepth(-88).setScale(0.72).setAlpha(0.9);
    this.add.image(195, 156, 'cross_wall').setOrigin(0.5, 0).setDepth(-86).setScale(0.62).setAlpha(0.95);

    /* 신자석 */
    for (let r = 0; r < 4; r++) {
      const y = 470 + r * 54;
      this.add.image(112, y, 'pew').setDepth(y - 4).setScale(0.82).setAlpha(0.95);
      this.add.image(286, y, 'pew').setDepth(y - 4).setScale(0.82).setAlpha(0.95);
    }

    /* 초 */
    this.add.image(150, 330, 'candle_stand').setDepth(330).setScale(0.62).setAlpha(0.9);
    this.add.image(240, 330, 'candle_stand').setDepth(330).setScale(0.62).setAlpha(0.9);
  }

  update(time, delta) {
    if (this.finished || !this.me || !this.me.scene) return;
    const dt = Math.min(delta, 40) / 1000;

    if (!this.busy && !this.dialogue.isOpen) {
      const v = this.stick.read();
      if (v.x !== 0 || v.y !== 0) {
        this.me.x = Phaser.Math.Clamp(this.me.x + v.x * 150 * dt, 44, GAME.WIDTH - 44);
        this.me.y = Phaser.Math.Clamp(this.me.y + v.y * 150 * dt, 336, 790);
        this.me.setTexture(v.y < -0.15 ? 'player_back' : 'player_front');
        if (Math.abs(v.x) > 0.2) this.me.setFlipX(v.x < 0);
        if (time - (this._stepAt || 0) > 320) { this._stepAt = time; AudioSystem.step(); }
        this.checkSpots(time);
      }
      /* 한참 못 찾으면 조용히 거듭니다 */
      if (time - this.idleAt > 26000) {
        this.idleAt = time;
        this.flash(DAY06.quest.lost);
      }
    }

    this.me.setDepth(this.me.y);
    this.meShadow.setPosition(this.me.x, this.me.y + 16).setDepth(this.me.y - 1);
  }

  /* ── 자리에 들어섰을 때 ──────────────────────── */
  checkSpots(time) {
    let near = null, best = 1e9;
    this.spots.forEach((sp) => {
      const d = Phaser.Math.Distance.Between(this.me.x, this.me.y, sp.tx, sp.ty);
      if (d < 42 && d < best) { best = d; near = sp; }
    });

    if (!near) { this.inside = null; return; }
    if (this.inside === near.id) return;            // 서 있는 동안 다시 울리지 않게
    this.inside = near.id;

    const target = DAY06.quest.missions[this.idx];
    if (!target) return;

    this.reveal(near);
    this.idleAt = time;

    if (near.id === target.id) this.found(near, target);
    else this.notIt(near);
  }

  reveal(sp) {
    if (sp.shown) return;
    sp.shown = true;
    this.tweens.add({ targets: [sp.label, sp.plate], alpha: 1, duration: 450 });
  }

  found(sp, mission) {
    const Q = DAY06.quest;
    this.busy = true;
    this.idx++;
    this.updateProgress();
    AudioSystem.found();
    if (this.stick) this.stick.reset();

    this.tweens.add({ targets: sp.img, scale: sp.img.scale * 1.14, duration: 260, yoyo: true });
    this.showBanner(Q.foundHead + '  ' + mission.name);

    this.time.delayedCall(900, () => {
      const lines = [{ t: mission.say }];
      if (mission.cheer) lines.push(mission.cheer);
      this.dialogue.play(lines, () => {
        if (this.idx >= Q.missions.length) { this.allFound(); return; }
        this.setHint(Q.missions[this.idx].ask);
        this.hintText.setColor(PAL.sun);
        this.inside = null;
        this.busy = false;
        this.idleAt = this.time.now;
      });
    });
  }

  /* 엉뚱한 곳이어도 그 자리의 이름은 알려 줍니다 */
  notIt(sp) {
    const Q = DAY06.quest;
    AudioSystem.blip();
    this.flash(Q.hereIs + sp.name + Q.notIt);
  }

  showBanner(msg) {
    this.banner.setText(msg).setAlpha(0).setScale(0.6);
    this.tweens.add({ targets: this.banner, alpha: 1, scale: 1, duration: 380, ease: 'Back.easeOut' });
    this.time.delayedCall(1500, () => {
      this.tweens.add({ targets: this.banner, alpha: 0, duration: 500 });
    });
  }

  flash(msg) {
    if (this._flashText && this._flashText.scene) this._flashText.destroy();
    const t = this.add.text(GAME.WIDTH / 2, 210, msg,
      UI.style(FONT.small, PAL.cream, { align: 'center', wordWrap: { width: GAME.WIDTH - 70 } }))
      .setOrigin(0.5).setDepth(880).setAlpha(0);
    this._flashText = t;
    this.tweens.add({ targets: t, alpha: 1, duration: 220 });
    this.time.delayedCall(1600, () => {
      if (!t.scene) return;
      this.tweens.add({ targets: t, alpha: 0, duration: 450, onComplete: () => t.destroy() });
    });
  }

  updateProgress() {
    this.progress.setText(DAY06.quest.progress + '  ' + this.idx + ' / ' + DAY06.quest.missions.length);
  }

  allFound() {
    const Q = DAY06.quest;
    this.busy = true;
    this.setHint('');
    if (this.stick) { this.stick.reset(); if (this.stick.hint) this.stick.hint.setVisible(false); }
    AudioSystem.chime();

    /* 이름표가 모두 켜진 성당을 한 번 보여 줍니다 */
    this.spots.forEach((sp, i) => {
      this.reveal(sp);
      this.tweens.add({ targets: sp.img, y: sp.img.y - 8, duration: 300, delay: i * 110, yoyo: true });
    });
    this.showBanner(Q.allFound);

    this.time.delayedCall(2200, () => this.complete(Q.done));
  }
};
