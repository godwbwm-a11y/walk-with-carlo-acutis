/* DAY 7 · 성당 앞과 석양 — 재능은 대단해 보여야만 재능인 건 아닐지도 모릅니다. */

window.Day7ChurchScene = class Day7ChurchScene extends Phaser.Scene {
  constructor() { super('Day7ChurchScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day7ChurchScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#e6c8a0');

    this.add.image(W / 2, 0, 'sky_evening').setOrigin(0.5, 0).setDisplaySize(W, 420).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0xbfae94, 1); g.fillRect(0, 400, W, H - 400);
    g.fillStyle(0xcbbb9f, 1); g.fillRect(0, 400, W, 12);
    g.fillStyle(0xafa088, 1); g.fillRect(0, 700, W, H - 700);

    this.add.image(W / 2, 380, 'church_front').setDepth(380).setScale(1.0);
    this.add.image(64, 400, 'tree_big').setDepth(400).setScale(0.85);
    this.add.image(330, 404, 'tree_big').setDepth(404).setScale(0.8);
    this.bench = this.add.image(W / 2, 560, 'bench').setDepth(560).setScale(1.15);

    this.me = this.add.image(146, 608, 'player_front').setDepth(608).setScale(1.36);
    this.carlo = this.add.image(244, 618, 'carlo_front').setDepth(618).setScale(1.36);
    this.tweens.add({ targets: [this.me, this.carlo], y: '-=4', duration: 860, yoyo: true, repeat: -1 });

    /* 아까 도움을 준 사람이 멀리 지나갑니다 */
    this.passer = this.add.image(-40, 520, 'grandma_front').setDepth(520).setScale(1.05).setAlpha(0.9);
    this.tweens.add({ targets: this.passer, x: W + 50, duration: 14000, repeat: -1, delay: 3000 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1000, [200, 170, 140]);

    this.time.delayedCall(800, () => {
      this.dialogue.play(DAY07.church, () => this.sunset());
    });
  }

  sunset() {
    const W = GAME.WIDTH;
    const veil = this.add.graphics().setDepth(-20);
    veil.fillStyle(0xe08a4a, 0.22); veil.fillRect(0, 0, W, GAME.HEIGHT);
    veil.setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 3000 });

    this.dialogue.play(DAY07.sunset, () => {
      this.scene.launch('ReceivedScene', { from: this.scene.key });
      this.scene.pause();
    });
  }

  onMiniGameDone(key) {
    if (key !== 'ReceivedScene') return;
    this.time.delayedCall(500, () => this.prayer());
  }

  /* 오늘의 기도 */
  prayer() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const veil = this.add.graphics().setDepth(800);
    veil.fillStyle(0x2b3b60, 0.94); veil.fillRect(0, 0, W, H);
    veil.setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 1100 });
    AudioSystem.bell();

    const head = this.add.text(W / 2, 122, DAY07.prayer.head, UI.style(19, PAL.sun))
      .setOrigin(0.5).setDepth(810).setAlpha(0);
    this.tweens.add({ targets: head, alpha: 1, duration: 900 });

    /* 오늘 고른 것들이 위에 조용히 남습니다 */
    const gift = SaveSystem.get('reflections.day7Gift', null);
    this.giftRows = [];
    if (gift) {
      const rows = [gift.gift, gift.who, gift.how];
      rows.forEach((r, i) => {
        const t = this.add.text(W / 2, 164 + i * 26, r, UI.style(14, '#cbd8ea', {
          align: 'center', wordWrap: { width: W - 70 }
        })).setOrigin(0.5).setDepth(810).setAlpha(0);
        this.tweens.add({ targets: t, alpha: 0.75, duration: 800, delay: 400 + i * 260 });
        this.giftRows.push(t);
      });
    }

    const body = this.add.text(W / 2, 258, '', UI.style(18, PAL.cream, {
      align: 'center', lineSpacing: 7, wordWrap: { width: W - 76 }
    })).setOrigin(0.5, 0).setDepth(810);

    const lines = DAY07.prayer.lines;
    let shown = [], i = 0;
    const step = () => {
      if (i >= lines.length) { this.time.delayedCall(1200, () => this.askWho(veil, body, head)); return; }
      shown.push(lines[i++]);
      if (shown.length > 12) shown.shift();
      body.setText(shown.join('\n'));
      body.setAlpha(0.45);
      this.tweens.add({ targets: body, alpha: 1, duration: 320 });
      this.time.delayedCall(lines[i - 1] === '' ? 200 : 660, step);
    };
    this.time.delayedCall(1600, step);
  }

  /* 아주 짧은 자유 기도 */
  askWho(veil, body, head) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    body.setText(DAY07.prayer.askWho);
    body.setY(196);
    head.setAlpha(0.4);
    /* 오늘의 요약은 잠시 물러납니다 */
    (this.giftRows || []).forEach(t => this.tweens.add({
      targets: t, alpha: 0, duration: 500, onComplete: () => t.destroy()
    }));
    this.giftRows = [];

    const layer = this.add.container(0, 0).setDepth(820);
    let y = 320;
    DAY07.prayer.who.forEach((w) => {
      layer.add(UI.button(this, W / 2, y, W - 76, 56, w, () => {
        layer.destroy();
        SaveSystem.set('reflections.day7PrayFor', w);
        this.remember(veil, body, head, w);
      }, { size: FONT.small }));
      y += 66;
    });
  }

  remember(veil, body, head, who) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    body.setText(DAY07.prayer.remember1 + who + DAY07.prayer.remember2);
    body.setY(H * 0.40);
    body.setAlpha(0);
    this.tweens.add({ targets: body, alpha: 1, duration: 900 });
    AudioSystem.chime();

    this.time.delayedCall(2600, () => {
      const b = UI.button(this, W / 2, H - 140, 240, 58, DAY07.prayer.endBtn, () => {
        b.destroy();
        this.tweens.add({
          targets: [veil, body, head], alpha: 0, duration: 900,
          onComplete: () => {
            [veil, body, head].forEach(o => o.destroy());
            UI.fadeOut(this, 1000, () => this.scene.start('Day7NoteScene'), [22, 30, 50]);
          }
        });
      }, { size: FONT.label, fill: PAL.sun });
      b.setDepth(830).setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 700 });
    });
  }
};
