/* 미니게임 공통 틀 — 실패도, 점수도, 시간 제한도 없습니다.
   그날의 이야기를 손으로 한 번 겪어보게 하는 장치일 뿐입니다. */

window.MiniGameScene = class MiniGameScene extends Phaser.Scene {

  buildFrame(opt) {
    opt = opt || {};
    this.from = opt.from || null;
    this.cardId = opt.card || null;
    this.finished = false;

    const W = GAME.WIDTH, H = GAME.HEIGHT;

    const bg = this.add.graphics().setDepth(-100);
    bg.fillStyle(HEX(opt.bg || '#2b3b60'), 1);
    bg.fillRect(0, 0, W, H);
    if (opt.warm !== false) {
      bg.fillStyle(HEX(PAL.sun), 0.06);
      bg.fillRect(0, 0, W, H);
    }

    /* 제목과 안내가 겹치지 않도록 안내 글의 높이만큼 자리를 잡습니다 */
    this.titleText = this.add.text(W / 2, 46, opt.title || '',
      UI.style(FONT.body, PAL.cream, { align: 'center', wordWrap: { width: W - 110 } }))
      .setOrigin(0.5, 0).setDepth(100);

    this.hintText = this.add.text(W / 2, this.titleText.y + this.titleText.height + 10, opt.hint || '',
      UI.style(FONT.small, PAL.dimWarm, { align: 'center', wordWrap: { width: W - 56 }, lineSpacing: 5 }))
      .setOrigin(0.5, 0).setDepth(100);

    /* 밝은 배경 위에서는 머리글을 진하게 — 흰 글씨는 안 보였습니다 */
    if (opt.lightHeader) {
      const plate = this.add.graphics().setDepth(99);
      plate.fillStyle(0xfdf3e0, 0.86);
      plate.fillRect(0, 0, W, this.hintText.y + this.hintText.height + 12);
      this.titleText.setColor(PAL.ink);
      this.hintText.setColor(PAL.inkSoft);
    }

    this.closeBtn = UI.circleButton(this, W - 38, 48, 24, '✕', () => this.giveUp(), { size: FONT.small, alpha: 0.85 });
    this.closeBtn.setDepth(100);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 500);
  }

  /* 제목과 안내 아래로 내용을 놓을 수 있는 첫 줄 */
  contentTop() {
    if (this.hintText && this.hintText.text) return this.hintText.y + this.hintText.height + 14;
    if (this.titleText) return this.titleText.y + this.titleText.height + 14;
    return 112;
  }

  setHint(t) {
    if (!this.hintText) return;
    this.hintText.setText(t);
    this.hintText.y = this.titleText ? this.titleText.y + this.titleText.height + 10 : 84;
  }

  /* 도중에 그만두어도 괜찮습니다 */
  giveUp() {
    if (this.finished) return;
    AudioSystem.back();
    this.leave();
  }

  /* 끝맺음 — 한두 문장을 남기고, 말씀 카드를 드립니다 */
  complete(lines, onAfter) {
    if (this.finished) return;
    this.finished = true;
    AudioSystem.chime();
    if (this.closeBtn) this.closeBtn.setVisible(false);

    const arr = Array.isArray(lines) ? lines : [lines];
    this.time.delayedCall(500, () => {
      this.dialogue.play(arr.map(l => (typeof l === 'string' ? { t: l } : l)), () => {
        const go = () => { if (onAfter) onAfter(); this.leave(); };
        if (this.cardId) Collection.award(this, this.cardId, go);
        else go();
      });
    });
  }

  leave() {
    const from = this.from;
    UI.fadeOut(this, 450, () => {
      this.scene.stop();
      if (from) {
        const parent = this.scene.get(from);
        this.scene.resume(from);
        if (parent && parent.onMiniGameDone) parent.onMiniGameDone(this.scene.key);
      } else {
        this.scene.start('TitleScene');        // 돌아갈 곳이 없으면 처음 화면으로
      }
    });
  }
};
