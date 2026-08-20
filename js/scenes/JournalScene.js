/* DAY 1 · 여행 노트 — 오늘 걸은 길을 한 장에 남깁니다. */

window.JournalScene = class JournalScene extends Phaser.Scene {
  constructor() { super('JournalScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const J = DAY01.journal;
    const concern = SaveSystem.get('reflections.mainConcern', '잘 모르겠다');
    const found = SaveSystem.get('found', []).length;

    AudioSystem.setAmbience('beach');
    this.cameras.main.setBackgroundColor('#1b2a4a');

    /* 노트 종이 */
    UI.panel(this, W / 2, H * 0.44, W - 46, 430, { fill: PAL.paper, radius: 22 });

    const g = this.add.graphics();
    g.lineStyle(2, HEX(PAL.sun), 0.45);
    g.lineBetween(46, H * 0.44 - 168, W - 46, H * 0.44 - 168);

    this.add.text(W / 2, H * 0.44 - 192, J.day, UI.style(FONT.body, PAL.sunDeep)).setOrigin(0.5);

    const body = J.body.map(l => l.replace('{concern}', concern)).join('\n');
    this.add.text(W / 2, H * 0.44 - 60, body,
      UI.style(20, PAL.ink, { align: 'center', lineSpacing: 12 })).setOrigin(0.5);

    this.add.text(W / 2, H * 0.44 + 96, '오늘 걸으며 살펴본 것 ' + found + '가지',
      UI.style(FONT.small, PAL.inkSoft)).setOrigin(0.5);

    this.add.text(W / 2, H * 0.44 + 150, GAME.CORE_LINE,
      UI.style(FONT.small, PAL.clay, { align: 'center', lineSpacing: 6 })).setOrigin(0.5);

    /* DAY COMPLETE */
    const c = this.add.text(W / 2, H * 0.10, J.complete, UI.style(24, PAL.cream)).setOrigin(0.5).setAlpha(0);
    const n = this.add.text(W / 2, H * 0.145, J.next, UI.style(FONT.body, '#d9c9ae')).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: [c, n], alpha: 1, duration: 900, delay: 300 });

    this.add.text(W / 2, H - 168, J.teaser,
      UI.style(FONT.small, '#c9d6ea', { align: 'center', lineSpacing: 6 })).setOrigin(0.5).setAlpha(0.85);

    UI.button(this, W / 2, H - 90, 250, 58, '처음 화면으로', () => {
      UI.fadeOut(this, 600, () => this.scene.start('TitleScene'));
    }, { size: 18 });

    /* 저장 */
    SaveSystem.addJournal({
      day: 1, title: J.day, concern: concern, found: found,
      reason: SaveSystem.get('reflections.dislikeReason', null)
    });
    SaveSystem.completeDay(1);

    AudioSystem.chime();
    UI.fadeIn(this, 900);

    /* 반짝이는 작은 빛 */
    this.time.addEvent({
      delay: 1400, loop: true, callback: () => {
        const s = this.add.image(Phaser.Math.Between(40, W - 40), H * 0.20, 'spark').setAlpha(0.8).setDepth(50);
        this.tweens.add({ targets: s, y: s.y - 60, alpha: 0, duration: 2600, onComplete: () => s.destroy() });
      }
    });
  }
};
