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

    /* 저사양 기기 배려: 픽셀 비율 상한 */
    this.cameras.main.setBackgroundColor(PAL.night);

    const el = document.getElementById('boot-screen');
    if (el) {
      el.classList.add('hide');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 800);
    }

    this.time.delayedCall(120, () => this.scene.start('TitleScene'));
  }
};
