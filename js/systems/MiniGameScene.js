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

    this.titleText = this.add.text(W / 2, 52, opt.title || '',
      UI.style(22, PAL.cream)).setOrigin(0.5).setDepth(100);
    this.hintText = this.add.text(W / 2, 88, opt.hint || '',
      UI.style(FONT.small, '#dfd2bd', { align: 'center', wordWrap: { width: W - 60 } }))
      .setOrigin(0.5).setDepth(100).setAlpha(0.9);

    this.closeBtn = UI.circleButton(this, W - 34, 46, 21, '✕', () => this.giveUp(), { size: 17, alpha: 0.8 });
    this.closeBtn.setDepth(100);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 500);
  }

  setHint(t) { if (this.hintText) this.hintText.setText(t); }

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
      }
    });
  }
};
