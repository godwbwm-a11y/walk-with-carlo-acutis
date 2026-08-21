/* 에필로그 미니게임 · 따라 해봐! — 틀려도 그냥 다시 합니다.
   마지막에는 내가 만든 동작을 모두가 따라 합니다. */

window.FollowScene = class FollowScene extends MiniGameScene {
  constructor() { super('FollowScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#3a3358',
      title: EPI.follow.title, hint: EPI.follow.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.stage = [];
    this.mine = [];

    const g = this.add.graphics().setDepth(-90);
    g.fillStyle(0x453d66, 1); g.fillRect(0, 130, W, 320);
    g.fillStyle(0x554a78, 1); g.fillRect(0, 450, W, H - 450);
    g.fillStyle(0x362f52, 1); g.fillRect(0, 444, W, 10);
    this.add.image(46, 430, 'epi_speaker').setDepth(20).setScale(1.2);

    const tex = ['epi_bra_front', 'epi_ita_front', 'player_front', 'epi_leo_front', 'epi_spa_front'];
    this.row = tex.map((t, i) => {
      const img = this.add.image(52 + i * 72, 452, t).setDepth(60).setScale(1.45);
      this.tweens.add({ targets: img, y: 448, duration: 620 + i * 40, yoyo: true, repeat: -1 });
      return img;
    });

    this.slot = this.add.text(W / 2, 250, '', UI.style(56, PAL.cream)).setOrigin(0.5).setDepth(100);
    this.label = this.add.text(W / 2, 330, '', UI.style(FONT.small, '#cbd8ea', {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(100);

    this.time.delayedCall(500, () => this.theirTurn());
  }

  clearStage() {
    (this.stage || []).forEach(o => { if (o && o.destroy) o.destroy(); });
    this.stage = [];
  }

  show(seq, headline, after) {
    this.label.setText(headline);
    let i = 0;
    const next = () => {
      if (i >= seq.length) { this.slot.setText(''); if (after) after(); return; }
      const m = EPI.follow.moves[seq[i++]];
      this.slot.setText(m.icon).setAlpha(0).setScale(0.7);
      this.tweens.add({ targets: this.slot, alpha: 1, scale: 1, duration: 260 });
      this.row.forEach((o, k) => this.tweens.add({
        targets: o, y: 448 - 10, duration: 180, yoyo: true, delay: k * 40
      }));
      AudioSystem.tap();
      this.time.delayedCall(620, next);
    };
    next();
  }

  /* 1 · 한 나라의 친구 */
  theirTurn() {
    this.show([0, 0], EPI.follow.theirTurn, () => {
      this.time.delayedCall(500, () => this.koreaTurn());
    });
  }

  /* 2 · 본당 친구 */
  koreaTurn() {
    this.show([1, 2], EPI.follow.koreaTurn, () => {
      this.time.delayedCall(500, () => this.myTurn());
    });
  }

  /* 3 · 내 차례 — 세 가지를 고릅니다 */
  myTurn() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.label.setText(EPI.follow.myTurn);
    this.setHint(EPI.follow.myTurnHint);

    /* 내가 고른 순서는 위쪽에, 지금 나오는 동작은 가운데에 */
    this.picked = this.add.text(W / 2, 190, '', UI.style(28, PAL.sun)).setOrigin(0.5).setDepth(100);
    this.slot.setText('');

    EPI.follow.moves.forEach((m, i) => {
      const x = (i % 2 === 0) ? W / 2 - 90 : W / 2 + 90;
      const y = 560 + Math.floor(i / 2) * 78;
      const b = UI.button(this, x, y, 170, 66, m.icon + '  ' + m.label, () => this.take(i),
        { size: FONT.small });
      b.setDepth(200);
      this.stage.push(b);
    });
  }

  take(i) {
    if (this.mine.length >= 3) return;
    this.mine.push(i);
    this.picked.setText(this.mine.map(k => EPI.follow.moves[k].icon).join(' '));
    AudioSystem.select();
    if (this.mine.length >= 3) {
      this.clearStage();
      this.setHint('');
      this.time.delayedCall(700, () => this.everyone());
    }
  }

  /* 처음에는 엉망, 그러다 맞습니다 */
  everyone() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.picked.setAlpha(0.5);
    this.label.setText(EPI.follow.together);

    let pass = 0;
    const run = () => {
      const messy = (pass === 0);
      this.mine.forEach((k, i) => {
        this.time.delayedCall(i * 420, () => {
          this.slot.setText(EPI.follow.moves[k].icon).setAlpha(1);
          this.row.forEach((o, n) => {
            const late = messy ? Phaser.Math.Between(0, 260) : n * 30;
            this.time.delayedCall(late, () => this.tweens.add({
              targets: o, y: 438, duration: 170, yoyo: true
            }));
          });
          AudioSystem.tap();
        });
      });
      pass++;
      if (pass < 3) this.time.delayedCall(this.mine.length * 420 + 400, run);
      else this.time.delayedCall(this.mine.length * 420 + 600, () => this.wide());
    };
    run();
  }

  wide() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.slot.setText('');
    this.label.setText('');
    this.picked.setAlpha(0);

    /* 카메라가 멀어집니다 */
    this.tweens.add({ targets: this.row, scale: 1.05, duration: 1200 });
    const a = this.add.text(W / 2, 250, EPI.follow.wide, UI.style(20, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(300).setAlpha(0);
    const b = this.add.text(W / 2, 310, EPI.follow.remember, UI.style(FONT.small, '#8fa5c8', {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(300).setAlpha(0);
    this.tweens.add({ targets: a, alpha: 1, duration: 900 });
    this.tweens.add({ targets: b, alpha: 1, duration: 900, delay: 1800 });
    AudioSystem.bell();

    this.time.delayedCall(4200, () => this.complete(EPI.follow.done));
  }
};
