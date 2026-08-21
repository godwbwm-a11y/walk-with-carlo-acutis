/* 우리의 사진 — 여행 노트 뒷표지에 붙은 단체사진 한 장.
   말씀카드가 아니라 사람이 남습니다. */

window.EpPhotoBookScene = class EpPhotoBookScene extends Phaser.Scene {
  constructor() { super('EpPhotoBookScene'); }

  create(data) {
    data = data || {};
    this.from = data.from || 'EpFinalScene';

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    AudioSystem.setAmbience('none');
    this.cameras.main.setBackgroundColor('#16233f');

    const back = this.add.graphics();
    back.fillStyle(0x22314f, 1); back.fillRect(0, 0, W, 118);
    this.add.text(W / 2, 46, '우리의 사진', UI.style(22, PAL.cream)).setOrigin(0.5);
    this.add.text(W / 2, 80, EPI.sub, UI.style(FONT.small, '#8fa5c8')).setOrigin(0.5);
    UI.circleButton(this, W - 36, 46, 22, '✕', () => this.close(), { size: 18 });

    /* 여행 노트의 뒷표지 */
    /* 사진과 그날의 기록이 모두 들어가야 합니다 */
    UI.panel(this, W / 2, 462, W - 40, 604, { fill: PAL.paper, radius: 22 });

    const photo = EpiPhoto.build(this, W / 2, 330, 1.06, {
      caption: EPI.final.photoLabel, carloAlpha: 0.85
    });
    photo.setDepth(20).setAlpha(0);
    this.tweens.add({ targets: photo, alpha: 1, duration: 700 });

    this.add.text(W / 2, 496, EPI.final.photoCaption, UI.style(19, PAL.sunDeep, {
      align: 'center', wordWrap: { width: W - 90 }
    })).setOrigin(0.5).setDepth(30);

    /* 그날 남은 것들 */
    const friend = SaveSystem.get('epilogue.newFriendName', null);
    const word = SaveSystem.get('epilogue.learnedWord', null);
    const fav = SaveSystem.get('epilogue.favoriteGame', null);
    const games = SaveSystem.get('epilogue.games', []) || [];

    let y = 544;
    const row = (label, value) => {
      if (!value) return;
      this.add.text(48, y, label, UI.style(11, PAL.inkSoft)).setDepth(30);
      this.add.text(48, y + 16, String(value), UI.style(15, PAL.ink, {
        wordWrap: { width: W - 96 }
      })).setDepth(30);
      y += 44;
    };
    row('처음 인사한 친구', friend ? ('레오 · ' + friend) : null);
    row('내가 배운 말', word);
    row('제일 재밌었던 것', fav);
    if (games.length) {
      const names = EPI.games.items.filter(i => games.indexOf(i.id) !== -1)
        .map(i => i.icon + ' ' + i.label).join('   ');
      row(EPI.games.played, names);
    }

    UI.fadeIn(this, 500);
  }

  close() {
    UI.fadeOut(this, 500, () => this.scene.start(this.from, { returning: true }));
  }
};
