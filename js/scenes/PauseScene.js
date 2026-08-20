/* 일시정지 — 소리 설정과 처음 화면으로 */

window.PauseScene = class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene'); }

  create(data) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.from = (data && data.from) || 'TitleScene';

    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.62);
    scrim.fillRect(0, 0, W, H);

    UI.panel(this, W / 2, H / 2, W - 60, 400, { fill: PAL.paper });

    this.add.text(W / 2, H / 2 - 160, '잠시 쉬어갑니다', UI.style(22, PAL.ink)).setOrigin(0.5);
    this.add.text(W / 2, H / 2 - 118, '기록은 자동으로 저장됩니다.', UI.style(FONT.small, PAL.inkSoft)).setOrigin(0.5);

    this.bgmBtn = UI.button(this, W / 2, H / 2 - 44, 230, 56, '', () => this.toggle('bgm'), { size: FONT.label });
    this.sfxBtn = UI.button(this, W / 2, H / 2 + 26, 230, 56, '', () => this.toggle('sfx'), { size: FONT.label });
    this.refresh();

    UI.button(this, W / 2, H / 2 + 100, 230, 56, '계속 걷기', () => this.resume(), { size: FONT.label, fill: PAL.sun });
    UI.button(this, W / 2, H / 2 + 170, 230, 52, '처음 화면으로', () => {
      this.scene.stop(this.from);
      this.scene.stop();
      this.scene.start('TitleScene');
    }, { size: FONT.small, alpha: 0.85 });
  }

  refresh() {
    const bgm = SaveSystem.get('settings.bgm', true);
    const sfx = SaveSystem.get('settings.sfx', true);
    this.bgmBtn.setLabel('배경 소리   ' + (bgm ? '켬' : '끔'));
    this.sfxBtn.setLabel('효과음   ' + (sfx ? '켬' : '끔'));
    AudioSystem.setBgm(bgm); AudioSystem.setSfx(sfx);
  }

  toggle(kind) {
    SaveSystem.set('settings.' + kind, !SaveSystem.get('settings.' + kind, true));
    this.refresh();
  }

  resume() {
    this.scene.resume(this.from);
    this.scene.stop();
  }
};
