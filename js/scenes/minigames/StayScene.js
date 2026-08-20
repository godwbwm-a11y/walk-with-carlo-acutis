/* 미니게임 · 별 아래 머물기 — 이름은 미니게임이지만 사실 비게임입니다.
   조작 UI 가 모두 사라지고, 성체 앞에는 아무 조작도 남지 않습니다. */

window.StayScene = class StayScene extends MiniGameScene {
  constructor() { super('StayScene'); }

  create(data) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.from = (data && data.from) || null;
    this.finished = false;
    this.t = 0;

    /* 틀도 제목도 닫기 버튼도 없습니다 */
    const bg = this.add.graphics().setDepth(-100);
    bg.fillStyle(0x080e1f, 1); bg.fillRect(0, 0, W, H);
    this.add.image(W / 2, 0, 'sky_vigil').setOrigin(0.5, 0).setDisplaySize(W, H).setDepth(-90);

    for (let i = 0; i < 80; i++) {
      const s = this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(60, 470), 'star_bright')
        .setDepth(-80).setScale(Phaser.Math.FloatBetween(0.26, 0.7))
        .setAlpha(Phaser.Math.FloatBetween(0.18, 0.7));
      this.tweens.add({
        targets: s, alpha: s.alpha * 0.3, duration: Phaser.Math.Between(1600, 3600),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000)
      });
    }

    /* 십자가와 촛불, 그리고 수많은 실루엣 */
    this.add.image(W / 2, 430, 'wyd_cross').setDepth(10).setScale(0.9).setAlpha(0.9);
    [[96, 520], [292, 520], [60, 560], [330, 556]].forEach((c) => {
      const cd = this.add.image(c[0], c[1], 'candle_small').setDepth(20).setScale(1.2);
      this.tweens.add({ targets: cd, alpha: 0.6, duration: 1400, yoyo: true, repeat: -1 });
    });
    for (let r = 0; r < 4; r++) {
      this.add.image(W / 2, 600 + r * 58, 'sleep_row')
        .setDepth(30 + r).setScale(1.02 - r * 0.03).setTint(0x2b3550).setAlpha(0.95);
    }

    this.line = this.add.text(W / 2, H * 0.30, '', UI.style(20, PAL.cream, {
      align: 'center', lineSpacing: 8, wordWrap: { width: W - 80 }
    })).setOrigin(0.5).setDepth(200).setAlpha(0);

    this.core1 = this.add.text(W / 2, H * 0.28, DAY06.vigil.core1, UI.style(23, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(200).setAlpha(0);
    this.core2 = this.add.text(W / 2, H * 0.36, DAY06.vigil.core2, UI.style(23, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(200).setAlpha(0);
    this.coreFrom = this.add.text(W / 2, H * 0.43, DAY06.vigil.coreFrom, UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(200).setAlpha(0);

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1600, [8, 10, 18]);
    AudioSystem.setAmbience('none');
    AudioSystem.bell();

    /* 0~7초 — 아무 문장도 없습니다 */
    DAY06.vigil.lines.forEach((l) => {
      this.time.delayedCall(l.at * 1000, () => this.show(l.t));
    });
    this.time.delayedCall(30000, () => this.core());
  }

  show(text) {
    if (this.finished) return;
    this.line.setText(text);
    this.line.setAlpha(0);
    this.tweens.add({
      targets: this.line, alpha: 1, duration: 1400,
      onComplete: () => {
        this.time.delayedCall(2600, () => this.tweens.add({ targets: this.line, alpha: 0, duration: 1400 }));
      }
    });
  }

  /* 30초 — 카를로의 인생 계획 */
  core() {
    if (this.finished) return;
    this.tweens.add({ targets: this.core1, alpha: 1, duration: 1800 });
    this.time.delayedCall(2400, () => this.tweens.add({ targets: this.core2, alpha: 1, duration: 1800 }));
    this.time.delayedCall(4600, () => this.tweens.add({ targets: this.coreFrom, alpha: 1, duration: 1200 }));

    this.time.delayedCall(8200, () => {
      this.tweens.add({ targets: [this.core1, this.core2, this.coreFrom], alpha: 0, duration: 1800 });
      this.time.delayedCall(2200, () => this.offer());
    });
  }

  /* 버튼은 아주 늦게, 아주 작게 나타납니다 */
  offer() {
    if (this.finished || this.offered) return;
    this.offered = true;
    const W = GAME.WIDTH, H = GAME.HEIGHT;

    const a = UI.button(this, W / 2, H - 172, 230, 54, DAY06.vigil.stayBtn, () => {
      a.destroy(); b.destroy();
      this.offered = false;
      this.time.delayedCall(12000, () => this.offer());     // 시간 제한은 없습니다
    }, { size: FONT.small, alpha: 0.85 });
    const b = UI.button(this, W / 2, H - 106, 230, 54, DAY06.vigil.goBtn, () => {
      a.destroy(); b.destroy();
      this.leaveQuietly();
    }, { size: FONT.small, fill: PAL.sun });
    [a, b].forEach(o => o.setDepth(300).setAlpha(0));
    this.tweens.add({ targets: [a, b], alpha: 1, duration: 1600 });
  }

  leaveQuietly() {
    if (this.finished) return;
    this.finished = true;
    SaveSystem.set('reflections.day6Stayed', true);
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
