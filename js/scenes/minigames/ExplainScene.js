/* 미니게임 · 같이 풀어보자 — 정답을 맞히는 게임이 아니라 설명하는 순서를 만들어봅니다. */

window.ExplainScene = class ExplainScene extends MiniGameScene {
  constructor() { super('ExplainScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#d8cdb6', warm: true,
      title: DAY07.explain.title, hint: DAY07.explain.hint
    });
    this.titleText.setColor(PAL.ink);
    this.hintText.setColor(PAL.inkSoft);

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.slots = [];
    this.placed = 0;

    /* 책상 위 */
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0xc4b79c, 1); g.fillRect(0, 130, W, H - 130);
    g.fillStyle(0xcfc3aa, 1); g.fillRect(0, 130, W, 10);

    this.add.image(72, 690, 'player_front').setDepth(690).setScale(1.3);
    this.add.image(310, 700, 'friend_front').setDepth(700).setScale(1.3);
    this.add.image(190, 660, 'workbook').setDepth(660).setScale(1.2);

    /* 빈 자리 세 칸 */
    for (let i = 0; i < 3; i++) {
      const y = 210 + i * 92;
      const sg = this.add.graphics().setDepth(10);
      sg.fillStyle(0xf3ece2, 0.35); sg.fillRoundedRect(W / 2 - 150, y - 34, 300, 68, 12);
      sg.lineStyle(2, HEX(PAL.sunDeep), 0.5); sg.strokeRoundedRect(W / 2 - 150, y - 34, 300, 68, 12);
      const num = this.add.text(W / 2 - 128, y, String(i + 1), UI.style(20, PAL.inkSoft))
        .setOrigin(0.5).setDepth(11);
      this.slots.push({ y: y, filled: false, g: sg, num: num });
    }

    this.add.text(W / 2, 508, DAY07.explain.place, UI.style(FONT.small, PAL.inkSoft))
      .setOrigin(0.5).setDepth(20);

    /* 섞인 카드 세 장 */
    this.cards = [];
    const order = [0, 1, 2];
    Phaser.Utils.Array.Shuffle(order);
    order.forEach((idx, i) => {
      const c = this.add.container(78 + i * 118, 570).setDepth(60);
      const cg = this.add.graphics();
      cg.fillStyle(0xfdf3e0, 0.98); cg.fillRoundedRect(-54, -40, 108, 80, 10);
      cg.lineStyle(2, HEX(PAL.sunDeep), 0.7); cg.strokeRoundedRect(-54, -40, 108, 80, 10);
      c.add(cg);
      c.add(this.add.text(0, 0, DAY07.explain.steps[idx], UI.style(14, PAL.ink, {
        align: 'center', wordWrap: { width: 92 }
      })).setOrigin(0.5));
      c.setSize(108, 88);
      c.setInteractive({ draggable: true, useHandCursor: true });
      c.idx = idx;
      c.homeX = c.x; c.homeY = c.y;
      this.cards.push(c);
    });

    this.input.on('drag', (p, obj, dx, dy) => {
      if (obj.idx === undefined || obj.done) return;
      obj.x = dx; obj.y = dy;
      obj.setDepth(200);
    });
    this.input.on('dragend', (p, obj) => {
      if (obj.idx === undefined || obj.done) return;
      this.drop(obj);
    });
  }

  drop(c) {
    /* 가장 가까운 빈 칸 */
    let best = -1, bestD = 90;
    this.slots.forEach((s, i) => {
      if (s.filled) return;
      const d = Math.abs(c.y - s.y);
      if (d < bestD) { bestD = d; best = i; }
    });

    if (best < 0) {
      this.tweens.add({ targets: c, x: c.homeX, y: c.homeY, duration: 260 });
      c.setDepth(60);
      return;
    }

    /* 순서가 달라도 나무라지 않고, 다시 놓을 수 있습니다 */
    if (best !== c.idx) {
      AudioSystem.back();
      this.setHint(DAY07.explain.wrong);
      this.tweens.add({ targets: c, x: c.homeX, y: c.homeY, duration: 300 });
      c.setDepth(60);
      this.time.delayedCall(1600, () => this.setHint(DAY07.explain.hint));
      return;
    }

    const s = this.slots[best];
    s.filled = true;
    c.done = true;
    c.disableInteractive();
    s.num.setAlpha(0.35);
    AudioSystem.found();
    this.tweens.add({ targets: c, x: GAME.WIDTH / 2, y: s.y, duration: 300, ease: 'Sine.easeOut' });
    c.setDepth(60);

    this.placed++;
    if (this.placed >= 3) this.time.delayedCall(700, () => this.finish());
  }

  finish() {
    this.setHint('');
    this.dialogue.play(DAY07.explain.done, () => {
      /* DAY 4 에서 고른 좋은 점이 아주 작게 떠오릅니다 */
      const mine = SaveSystem.get('reflections.day4MainStrength', null)
        || (SaveSystem.get('reflections.day4Strengths', []) || [])[0];
      if (mine) {
        const t = this.add.text(GAME.WIDTH / 2, 128, mine, UI.style(19, PAL.clay, {
          align: 'center', wordWrap: { width: GAME.WIDTH - 70 }
        })).setOrigin(0.5).setDepth(300).setAlpha(0);
        this.tweens.add({ targets: t, alpha: 1, duration: 900 });
        SaveSystem.set('reflections.day7Used', mine);
        this.time.delayedCall(2600, () => {
          this.tweens.add({
            targets: t, alpha: 0, duration: 700,
            onComplete: () => { t.destroy(); this.complete([DAY07.explain.mine]); }
          });
        });
      } else {
        this.complete([DAY07.explain.mine]);
      }
    });
  }
};
