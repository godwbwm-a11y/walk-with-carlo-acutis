/* EPILOGUE 7 · 단체사진, 그리고 사진 속 카를로.
   에필로그의 마지막 수집품은 카드가 아니라 이 사진 한 장입니다. */

window.EpPhotoScene = class EpPhotoScene extends Phaser.Scene {
  constructor() { super('EpPhotoScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('EpPhotoScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#141c2e');

    this.add.image(W / 2, 0, 'epi_sky_night').setOrigin(0.5, 0).setDisplaySize(W, 420).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0x4a4438, 1); g.fillRect(0, 400, W, H - 400);
    g.fillStyle(0x584f42, 1); g.fillRect(0, 400, W, 12);
    this.add.image(60, 404, 'church_front').setOrigin(0.5, 1).setDepth(2).setScale(0.8).setAlpha(0.9);
    this.add.image(W / 2 + 40, 300, 'epi_lights').setDepth(3).setScale(1.0).setAlpha(0.8);

    /* 모여 서는 사람들 */
    this.row = [];
    [[52, 470, 'epi_ita_front'], [124, 476, 'epi_phi_front'], [196, 472, 'player_front'],
     [268, 476, 'epi_leo_front'], [338, 470, 'epi_fra_front'],
     [88, 546, 'child_front'], [196, 550, 'epi_bra_front'], [300, 546, 'friend_front']]
      .forEach((p, i) => {
        const img = this.add.image(p[0], p[1], p[2]).setDepth(p[1]).setScale(1.35).setAlpha(0);
        this.tweens.add({ targets: img, alpha: 1, duration: 500, delay: i * 130 });
        this.tweens.add({ targets: img, y: p[1] - 4, duration: 900 + i * 70, yoyo: true, repeat: -1, delay: 700 });
        this.row.push(img);
      });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1100, [12, 16, 28]);

    this.time.delayedCall(1200, () => {
      this.dialogue.play(EPI.photo.call, () => this.countdown(0));
    });
  }

  countdown(i) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    if (i >= EPI.photo.count.length) { this.flash(); return; }

    const n = this.add.text(W / 2, H * 0.26, EPI.photo.count[i], UI.style(58, PAL.sun))
      .setOrigin(0.5).setDepth(300).setAlpha(0).setScale(0.7);
    const note = this.add.text(W / 2, H * 0.34, EPI.photo.countNote[i], UI.style(FONT.small, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: [n, note], alpha: 1, duration: 260 });
    this.tweens.add({ targets: n, scale: 1, duration: 300, ease: 'Back.easeOut' });
    AudioSystem.blip();

    /* 카운트마다 사람들이 조금씩 움직입니다 */
    this.row.forEach((o, k) => this.tweens.add({
      targets: o, x: o.x + Phaser.Math.Between(-6, 6), duration: 260, yoyo: true, delay: k * 40
    }));

    this.time.delayedCall(900, () => {
      this.tweens.add({
        targets: [n, note], alpha: 0, duration: 220,
        onComplete: () => { n.destroy(); note.destroy(); this.countdown(i + 1); }
      });
    });
  }

  flash() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const t = this.add.text(W / 2, H * 0.26, EPI.photo.shot, UI.style(34, PAL.cream))
      .setOrigin(0.5).setDepth(320);
    const f = this.add.graphics().setDepth(400);
    f.fillStyle(0xffffff, 1); f.fillRect(0, 0, W, H);
    AudioSystem.chime();

    this.time.delayedCall(500, () => {
      t.destroy();
      this.tweens.add({
        targets: f, alpha: 0, duration: 900,
        onComplete: () => { f.destroy(); this.showPhoto(); }
      });
    });
  }

  /* ── 우리 사진 ── */
  showPhoto() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.seen = [];

    const veil = this.add.graphics().setDepth(500);
    veil.fillStyle(0x0d1424, 1); veil.fillRect(0, 0, W, H);
    veil.setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 800 });
    this.tweens.add({ targets: this.row, alpha: 0, duration: 800 });

    this.photo = EpiPhoto.build(this, W / 2, 330, 1.1, { carloAlpha: 0.9 });
    this.photo.setDepth(510).setAlpha(0).setScale(0.9);
    this.tweens.add({ targets: this.photo, alpha: 1, scale: 1.1, duration: 900, ease: 'Back.easeOut' });

    this.hint = this.add.text(W / 2, 500, EPI.photo.lookHint, UI.style(FONT.small, '#cbd8ea', {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(520).setAlpha(0);
    this.tweens.add({ targets: this.hint, alpha: 0.9, duration: 800, delay: 900 });

    this.memoText = this.add.text(W / 2, 566, '', UI.style(19, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 7
    })).setOrigin(0.5).setDepth(520);
    this.memoWho = this.add.text(W / 2, 534, '', UI.style(13, '#8fa5c8'))
      .setOrigin(0.5).setDepth(520);

    /* 사람마다 누를 수 있는 자리를 둡니다 */
    this.taps = this.photo.photoTaps.map((p) => {
      const z = this.add.zone(W / 2 + p.x * 1.1, 330 + p.y * 1.1, 46, 60)
        .setOrigin(0.5).setDepth(530).setInteractive();
      z.on('pointerup', () => this.remember(p.id, p.img));
      return z;
    });

    this.time.delayedCall(2000, () => this.keepButton());
  }

  remember(id, img) {
    const m = EPI.photo.memories.find(x => x.id === id);
    if (!m) return;
    AudioSystem.tap();
    this.tweens.add({ targets: img, scale: img.scale * 1.18, duration: 200, yoyo: true });
    this.memoWho.setText(m.label);
    this.memoText.setText(m.text).setAlpha(0);
    this.tweens.add({ targets: this.memoText, alpha: 1, duration: 400 });
    if (this.seen.indexOf(id) === -1) this.seen.push(id);
    if (this.seen.length >= 3 && !this.carloReady) this.hintCarlo();
  }

  /* 셋쯤 보고 나면, 맨 뒤가 눈에 들어옵니다 */
  hintCarlo() {
    this.carloReady = true;
    const W = GAME.WIDTH;
    const c = this.photo.photoCarlo;
    this.tweens.add({ targets: c, alpha: 0.6, duration: 900, yoyo: true, repeat: -1 });

    const z = this.add.zone(W / 2 + EpiPhoto.carlo.x * 1.1, 330 + EpiPhoto.carlo.y * 1.1, 40, 52)
      .setOrigin(0.5).setDepth(540).setInteractive();
    z.on('pointerup', () => this.noticeCarlo());
    this.taps.push(z);

    if (this.zoomBtn) return;
    this.zoomBtn = UI.button(this, W / 2, GAME.HEIGHT - 178, 240, 54, EPI.carloPhoto.zoomBtn,
      () => this.noticeCarlo(), { size: FONT.small });
    this.zoomBtn.setDepth(540).setAlpha(0);
    this.tweens.add({ targets: this.zoomBtn, alpha: 1, duration: 800, delay: 1200 });
  }

  keepButton() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.keepBtn = UI.button(this, W / 2, H - 108, 260, 58, EPI.photo.keepBtn,
      () => this.keep(), { size: FONT.small, fill: PAL.sun });
    this.keepBtn.setDepth(540).setAlpha(0);
    this.tweens.add({ targets: this.keepBtn, alpha: 1, duration: 800 });
  }

  /* ── 사진 속 카를로 ── */
  noticeCarlo() {
    if (this.zooming) return;
    this.zooming = true;
    this.taps.forEach(z => z.destroy());
    this.taps = [];
    if (this.zoomBtn) { this.zoomBtn.destroy(); this.zoomBtn = null; }
    if (this.keepBtn) { this.keepBtn.destroy(); this.keepBtn = null; }
    this.hint.setText('');
    this.memoText.setText(''); this.memoWho.setText('');

    this.dialogue.play(EPI.carloPhoto.notice, () => this.zoom());
  }

  zoom() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const c = this.photo.photoCarlo;
    this.tweens.killTweensOf(c);
    c.setAlpha(1);

    /* 핀치 줌처럼 사진이 커집니다 */
    this.tweens.add({
      targets: this.photo,
      scale: 3.2,
      x: W / 2 - EpiPhoto.carlo.x * 3.2,
      y: 340 - EpiPhoto.carlo.y * 3.2,
      duration: 1800, ease: 'Sine.easeInOut'
    });
    AudioSystem.swipe();

    this.time.delayedCall(2000, () => {
      const t = this.add.text(W / 2, H * 0.72, EPI.carloPhoto.found, UI.style(30, PAL.sun))
        .setOrigin(0.5).setDepth(600).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 1000 });
      AudioSystem.bell();

      this.time.delayedCall(2800, () => {
        this.tweens.add({ targets: t, alpha: 0, duration: 700, onComplete: () => t.destroy() });
        this.tweens.add({
          targets: this.photo, scale: 1.1, x: W / 2, y: 330, duration: 1400, ease: 'Sine.easeInOut'
        });
        this.time.delayedCall(1500, () => {
          this.dialogue.play(EPI.carloPhoto.after, () => this.rememberDay8());
        });
      });
    });
  }

  /* DAY 8 의 마지막 대화가 떠오릅니다 */
  rememberDay8() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const a = this.add.text(W / 2, 566, EPI.carloPhoto.remember1, UI.style(20, '#cbd8ea'))
      .setOrigin(0.5).setDepth(600).setAlpha(0);
    const b = this.add.text(W / 2, 610, EPI.carloPhoto.remember2, UI.style(24, PAL.sun))
      .setOrigin(0.5).setDepth(600).setAlpha(0);

    this.tweens.add({ targets: a, alpha: 1, duration: 900 });
    this.tweens.add({ targets: b, alpha: 1, duration: 900, delay: 1600 });
    AudioSystem.chime();

    this.time.delayedCall(4400, () => {
      this.tweens.add({
        targets: [a, b], alpha: 0, duration: 800,
        onComplete: () => {
          a.destroy(); b.destroy();
          this.dialogue.play(EPI.carloPhoto.close, () => this.keep());
        }
      });
    });
  }

  /* 사진을 여행 노트 뒷표지에 붙입니다 */
  keep() {
    if (this.kept) return;
    this.kept = true;
    SaveSystem.set('epilogue.photoKept', true);
    AudioSystem.chime();
    if (this.keepBtn) { this.keepBtn.destroy(); this.keepBtn = null; }
    UI.fadeOut(this, 1000, () => this.scene.start('EpWalkScene'), [12, 16, 28]);
  }
};
