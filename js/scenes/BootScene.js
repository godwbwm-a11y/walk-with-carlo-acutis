/* 첫 장면 — 모든 그림을 코드로 만들어 두고 제목 화면으로 넘어갑니다. */

window.BootScene = class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    SaveSystem.load();
    TextureFactory.createAll(this);
    if (TextureFactory.createDay2) TextureFactory.createDay2(this);
    if (TextureFactory.createDay3) TextureFactory.createDay3(this);
    if (TextureFactory.createDay5) TextureFactory.createDay5(this);
    if (TextureFactory.createDay6) TextureFactory.createDay6(this);
    if (TextureFactory.createDay7) TextureFactory.createDay7(this);
    if (TextureFactory.createDay8) TextureFactory.createDay8(this);
    if (TextureFactory.createEpi) TextureFactory.createEpi(this);

    /* 저사양 기기 배려: 픽셀 비율 상한 */
    this.cameras.main.setBackgroundColor(PAL.night);

    /* 장면이 바뀔 때마다 배경 음악을 켜거나 물러나게 합니다.
       여기쯤이면 모든 장면이 이미 만들어져 있습니다. */
    if (window.MusicSystem) {
      this.game.scene.scenes.forEach((s) => {
        const key = s.sys.settings.key;
        /* 잠시 얹혔다 사라지는 화면은 음악을 건드리지 않습니다 */
        if (key === 'PauseScene' || key === 'GalleryScene' || key === 'PhotoMode') return;
        s.sys.events.on(Phaser.Scenes.Events.START, () => MusicSystem.forScene(key));
      });
      MusicSystem.forScene('TitleScene');
    }

    const el = document.getElementById('boot-screen');
    if (el) {
      el.classList.add('hide');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 800);
    }

    this.time.delayedCall(120, () => this.scene.start('TitleScene'));
  }
};
