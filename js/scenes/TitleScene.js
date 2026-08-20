/* 제목 화면 — 새벽 바다를 배경으로 */

window.TitleScene = class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.add.image(W / 2, H / 2, 'sky_night').setDisplaySize(W, H);

    /* 별 */
    for (let i = 0; i < 46; i++) {
      const s = this.add.image(Phaser.Math.Between(8, W - 8), Phaser.Math.Between(20, H * 0.5), 'dot')
        .setScale(Phaser.Math.FloatBetween(0.18, 0.42))
        .setAlpha(Phaser.Math.FloatBetween(0.25, 0.85));
      this.tweens.add({
        targets: s, alpha: 0.15, duration: Phaser.Math.Between(1400, 3200),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000)
      });
    }

    /* 수평선의 새벽빛 */
    const dawn = this.add.image(W / 2, H * 0.50, 'lamp_glow')
      .setDisplaySize(W * 1.7, 200).setTint(0xffc79a).setAlpha(0.45);
    this.tweens.add({ targets: dawn, alpha: 0.7, duration: 5200, yoyo: true, repeat: -1 });

    /* 바다와 모래 */
    const seaY = H * 0.50;
    const sea = this.add.graphics();
    sea.fillStyle(HEX(PAL.seaDeep), 1); sea.fillRect(0, seaY, W, H * 0.13);
    sea.fillStyle(HEX(PAL.sea), 0.75); sea.fillRect(0, seaY, W, 22);
    sea.fillStyle(0xb8a68c, 1); sea.fillRect(0, seaY + H * 0.13, W, H);
    sea.fillStyle(0xc4b299, 0.6); sea.fillRect(0, seaY + H * 0.13, W, 14);

    for (let i = 0; i < 5; i++) {
      const f = this.add.image(Phaser.Math.Between(0, W), seaY + H * 0.13 - Phaser.Math.Between(2, 24), 'seafoam')
        .setAlpha(0.5).setScale(Phaser.Math.FloatBetween(0.7, 1.3));
      this.tweens.add({
        targets: f, x: f.x + Phaser.Math.Between(-30, 30), alpha: 0.15,
        duration: Phaser.Math.Between(2600, 4200), yoyo: true, repeat: -1
      });
    }

    /* 걸어가는 두 사람의 실루엣 */
    const p1 = this.add.image(W * 0.42, 596, 'player_back').setScale(1.2);
    const p2 = this.add.image(W * 0.58, 600, 'carlo_back').setScale(1.2);
    this.tweens.add({ targets: [p1, p2], y: '-=4', duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    /* 제목 */
    this.add.text(W / 2, H * 0.17, '오늘,', UI.style(24, PAL.cream)).setOrigin(0.5).setAlpha(0.92);
    this.add.text(W / 2, H * 0.235, '카를로 아쿠티스와\n함께 걷습니다',
      UI.style(FONT.title, PAL.cream, { align: 'center' })).setOrigin(0.5);
    this.add.text(W / 2, H * 0.345, GAME.CORE_LINE,
      UI.style(FONT.small, '#e6d9c4', { align: 'center' })).setOrigin(0.5).setAlpha(0.9);

    /* 버튼 */
    const hasSave = SaveSystem.hasSave();
    let y = 676;
    if (hasSave) {
      UI.button(this, W / 2, y, 250, 60, '이어서 걷기', () => this.continueGame(), { size: 19 });
      y += 74;
      UI.button(this, W / 2, y, 250, 58, '처음부터 걷기', () => this.confirmRestart(),
        { size: 18, fill: PAL.cream, alpha: 0.9 });
    } else {
      UI.button(this, W / 2, y, 250, 62, '걷기 시작하기', () => this.startNew(), { size: 20 });
    }

    /* 소리 설정 */
    this.bgmBtn = UI.circleButton(this, 44, 48, 24, '♪', () => this.toggle('bgm'), { size: 18 });
    this.sfxBtn = UI.circleButton(this, 108, 48, 24, '🔔', () => this.toggle('sfx'), { size: 17 });
    this.slash = this.add.graphics().setDepth(50);
    this.refreshSound();

    this.add.text(W / 2, H - 34, 'DAY 1 체험판 · 2027 서울 WYD 를 준비하며',
      UI.style(14, PAL.inkSoft)).setOrigin(0.5).setAlpha(0.9);

    /* 첫 터치에 소리 시작 */
    this.input.once('pointerdown', () => {
      AudioSystem.unlock();
      AudioSystem.setAmbience('beach');
      AudioSystem.startPad();
    });

    UI.fadeIn(this, 900);
  }

  refreshSound() {
    const bgm = SaveSystem.get('settings.bgm', true);
    const sfx = SaveSystem.get('settings.sfx', true);
    this.bgmBtn.list[1].setAlpha(bgm ? 1 : 0.35);
    this.sfxBtn.list[1].setAlpha(sfx ? 1 : 0.35);

    /* 꺼진 상태는 빗금으로 분명히 보여줍니다 */
    this.slash.clear();
    this.slash.lineStyle(3, HEX(PAL.clay), 0.85);
    if (!bgm) this.slash.lineBetween(30, 62, 58, 34);
    if (!sfx) this.slash.lineBetween(94, 62, 122, 34);

    AudioSystem.setBgm(bgm); AudioSystem.setSfx(sfx);
  }

  toggle(kind) {
    const v = !SaveSystem.get('settings.' + kind, true);
    SaveSystem.set('settings.' + kind, v);
    this.refreshSound();
  }

  startNew() {
    AudioSystem.unlock();
    SaveSystem.checkpoint('HomeScene');
    UI.fadeOut(this, 700, () => this.scene.start('HomeScene', { intro: true }));
  }

  continueGame() {
    AudioSystem.unlock();
    const cp = SaveSystem.get('checkpoint', null);
    const scene = (cp && cp.scene) ? cp.scene : 'HomeScene';
    UI.fadeOut(this, 700, () => this.scene.start(scene, cp || {}));
  }

  confirmRestart() {
    const dlg = new DialogueBox(this);
    dlg.choose('처음부터 다시 걸을까요?\n지금까지의 기록은 지워집니다.', [
      { key: 'no', label: '아니요, 이어서 걸을래요' },
      { key: 'yes', label: '네, 처음부터 걷습니다' }
    ], (k) => {
      dlg.destroy();
      if (k === 'yes') { SaveSystem.reset(); this.startNew(); }
    });
  }
};
