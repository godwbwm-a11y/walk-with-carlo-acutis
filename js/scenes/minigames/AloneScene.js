/* 미니게임 · 이번에는 혼자 — DAY 3 의 《아무것도 하지 않기》 와 같은 자리입니다.
   다만 가롤로가 없고, 안내도 훨씬 적습니다. 완료 표시도 없습니다. */

window.AloneScene = class AloneScene extends MiniGameScene {
  constructor() { super('AloneScene'); }

  create(data) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.from = (data && data.from) || null;
    this.finished = false;

    /* 틀도 제목도 없습니다 */
    const bg = this.add.graphics().setDepth(-100);
    bg.fillStyle(0x1a2033, 1); bg.fillRect(0, 0, W, H);

    /* 빈 성당 */
    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0x232a40, 1); g.fillRect(0, 0, W, 470);
    g.fillStyle(0x2b3350, 1); g.fillRect(0, 470, W, H - 470);
    g.fillStyle(0x1d2438, 1); g.fillRect(0, 464, W, 10);

    this.add.image(W / 2, 250, 'stained_glass').setDepth(-80).setScale(1.1).setAlpha(0.55);
    this.add.image(W / 2, 380, 'altar').setDepth(10).setScale(1.0).setAlpha(0.9);
    this.lamp = this.add.image(W / 2 + 96, 330, 'sanctuary_lamp').setDepth(12).setScale(1.0);
    this.glow = this.add.image(W / 2 + 96, 336, 'lamp_glow').setDepth(11).setScale(0.8).setAlpha(0.4);
    this.tweens.add({ targets: this.glow, alpha: 0.75, scale: 0.95, duration: 2200, yoyo: true, repeat: -1 });

    for (let r = 0; r < 3; r++) {
      this.add.image(W / 2, 540 + r * 74, 'pew').setDepth(20 + r).setScale(1.05).setAlpha(0.9);
    }
    this.me = this.add.image(W / 2 - 44, 606, 'player_back').setDepth(600).setScale(1.3);

    /* 글이 뜰 때만 뒤가 살짝 어두워집니다 — 스테인드글라스 위에서도 읽히도록 */
    this.plate = this.add.graphics().setDepth(195).setAlpha(0);
    this.plate.fillStyle(0x141a2b, 0.72);
    this.plate.fillRoundedRect(24, 138, W - 48, 152, 22);

    this.line = this.add.text(W / 2, 170, '', UI.style(19, PAL.cream, {
      align: 'center', lineSpacing: 8, wordWrap: { width: W - 80 }
    })).setOrigin(0.5).setDepth(200).setAlpha(0);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1600, [8, 10, 18]);
    AudioSystem.setAmbience('none');

    /* 0~15초 — 아무 글도 없습니다 */
    this.time.delayedCall(15000, () => this.show(DAY08.alone.q, () => {
      this.time.delayedCall(2200, () => this.show(DAY08.alone.line, () => {
        this.time.delayedCall(3000, () => this.speak());
      }));
    }));
  }

  show(text, after) {
    if (this.finished) return;
    this.line.setText(text).setAlpha(0);
    this.tweens.add({ targets: this.plate, alpha: 1, duration: 1400 });
    this.tweens.add({
      targets: this.line, alpha: 1, duration: 1400,
      onComplete: () => {
        this.time.delayedCall(2400, () => {
          this.tweens.add({ targets: this.plate, alpha: 0, duration: 1400 });
          this.tweens.add({
            targets: this.line, alpha: 0, duration: 1400,
            onComplete: () => { if (after) after(); }
          });
        });
      }
    });
  }

  /* 이번에는 플레이어가 먼저 말합니다 */
  speak() {
    if (this.finished) return;
    const W = GAME.WIDTH;
    const a = this.add.text(W / 2, 210, DAY08.alone.me1, UI.style(24, PAL.sun))
      .setOrigin(0.5).setDepth(200).setAlpha(0);
    this.tweens.add({ targets: [a, this.plate], alpha: 1, duration: 1200 });
    AudioSystem.bell();

    this.time.delayedCall(3200, () => {
      const b = this.add.text(W / 2, 256, DAY08.alone.me2, UI.style(24, PAL.cream))
        .setOrigin(0.5).setDepth(200).setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 1200 });
      this.time.delayedCall(3600, () => this.offer());
    });
  }

  /* 완료 표시가 없습니다. 스스로 일어나면 끝납니다. */
  offer() {
    if (this.finished || this.offered) return;
    this.offered = true;
    const W = GAME.WIDTH, H = GAME.HEIGHT;

    const stay = UI.button(this, W / 2, H - 170, 240, 54, DAY08.alone.stayBtn, () => {
      stay.destroy(); go.destroy();
      this.offered = false;
      this.time.delayedCall(14000, () => this.offer());
    }, { size: FONT.small, alpha: 0.85 });
    const go = UI.button(this, W / 2, H - 104, 240, 54, DAY08.alone.leaveBtn, () => {
      stay.destroy(); go.destroy();
      this.leaveQuietly();
    }, { size: FONT.small, fill: PAL.sun });
    [stay, go].forEach(o => o.setDepth(300).setAlpha(0));
    this.tweens.add({ targets: [stay, go], alpha: 1, duration: 1600 });
  }

  leaveQuietly() {
    if (this.finished) return;
    this.finished = true;
    SaveSystem.set('reflections.day8Stayed', true);
    UI.fadeOut(this, 1400, () => {
      const from = this.from;
      this.scene.stop();
      if (from) {
        const parent = this.scene.get(from);
        this.scene.resume(from);
        if (parent && parent.onMiniGameDone) parent.onMiniGameDone(this.scene.key);
      } else {
        this.scene.start('TitleScene');
      }
    }, [8, 10, 18]);
  }
};
