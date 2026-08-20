/* 미니게임 · 우리의 리듬 — PERFECT 도 MISS 도 COMBO 도 없습니다.
   놓쳐도 음악은 계속되고, 마지막에는 누르지 않아도 됩니다. */

window.RhythmScene = class RhythmScene extends MiniGameScene {
  constructor() { super('RhythmScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#3a3350',
      title: DAY05.rhythm.title, hint: DAY05.rhythm.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.beatIndex = 0;
    this.freeMode = false;
    this.notes = [];
    this.lineY = 560;

    this.add.image(W / 2, 200, 'stage_festival').setDepth(-30).setScale(1.1);

    /* 무대 위의 여러 나라 청년들 */
    this.band = [];
    ['pilgrim_b', 'pilgrim_c', 'pilgrim_e', 'pilgrim_d'].forEach((k, i) => {
      const img = this.add.image(78 + i * 78, 232, k).setDepth(232).setScale(1.2);
      this.band.push(img);
    });
    this.add.image(300, 244, 'drum_small').setDepth(244).setScale(0.9);

    /* 판정선 */
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0xf2b56b, 0.28); g.fillRect(0, this.lineY - 3, W, 6);

    /* 세 개의 큰 버튼 */
    this.pads = [];
    DAY05.rhythm.keys.forEach((k, i) => {
      const x = 76 + i * 119;
      const pad = UI.button(this, x, 680, 106, 92, k.icon + '\n' + k.label, () => this.hit(i), { size: FONT.small });
      pad.setDepth(60);
      this.pads.push(pad);
    });

    this.murmurText = this.add.text(W / 2, 612, '', UI.style(FONT.small, '#e6dcc8', {
      align: 'center', wordWrap: { width: W - 60 }
    })).setOrigin(0.5).setDepth(60).setAlpha(0);

    this.time.delayedCall(700, () => this.startBeats());
  }

  startBeats() {
    this.beatEvent = this.time.addEvent({
      delay: 640, loop: true, callback: () => this.spawn()
    });
  }

  spawn() {
    if (this.freeMode) return;
    const W = GAME.WIDTH;
    const lane = Phaser.Math.Between(0, 2);
    const x = 76 + lane * 119;
    const c = this.add.container(x, 150).setDepth(40);
    const g = this.add.graphics();
    g.fillStyle(HEX(PAL.sun), 0.9); g.fillRoundedRect(-32, -18, 64, 36, 12);
    c.add(g);
    c.add(this.add.text(0, 0, DAY05.rhythm.keys[lane].icon, UI.style(20, PAL.ink)).setOrigin(0.5));
    c.lane = lane;
    this.notes.push(c);
    AudioSystem.blip();

    this.beatIndex++;
    if (this.beatIndex === 5 || this.beatIndex === 11 || this.beatIndex === 17) {
      this.murmur(Math.floor(this.beatIndex / 6));
    }
    if (this.beatIndex >= 22) this.goFree();
  }

  murmur(i) {
    const t = DAY05.rhythm.murmur[Math.min(i, DAY05.rhythm.murmur.length - 1)];
    this.murmurText.setText(t).setAlpha(0);
    this.tweens.add({ targets: this.murmurText, alpha: 1, duration: 500 });
    this.time.delayedCall(2200, () => this.tweens.add({ targets: this.murmurText, alpha: 0, duration: 600 }));
    /* 무대의 청년들도 함께 움직입니다 */
    this.band.forEach((b, k) => {
      this.tweens.add({ targets: b, y: '-=8', duration: 320, yoyo: true, repeat: 3, delay: k * 90 });
    });
  }

  hit(lane) {
    /* 맞고 틀리고가 없습니다. 가까운 것이 있으면 함께 사라질 뿐입니다. */
    let near = null, best = 999;
    this.notes.forEach(n => {
      if (n.lane !== lane) return;
      const d = Math.abs(n.y - this.lineY);
      if (d < best) { best = d; near = n; }
    });
    if (near && best < 90) {
      this.notes = this.notes.filter(n => n !== near);
      this.tweens.add({
        targets: near, alpha: 0, scale: 1.4, duration: 260,
        onComplete: () => near.destroy()
      });
    }
    AudioSystem.tap();
  }

  /* 마지막 — 이제 누르지 않아도 됩니다 */
  goFree() {
    if (this.freeMode) return;
    this.freeMode = true;
    if (this.beatEvent) this.beatEvent.remove();
    this.setHint(DAY05.rhythm.freeHint);
    this.pads.forEach(p => this.tweens.add({ targets: p, alpha: 0.35, duration: 700 }));

    this.clapEvent = this.time.addEvent({
      delay: 420, repeat: 9, callback: () => {
        AudioSystem.tap();
        this.band.forEach((b, k) => {
          this.tweens.add({ targets: b, y: '-=6', duration: 180, yoyo: true, delay: k * 40 });
        });
      }
    });

    this.time.delayedCall(1200, () => {
      this.dialogue.say(DAY05.rhythm.free, () => {
        const music = SaveSystem.get('reflections.day4Strengths', []) || [];
        const done = () => { this.setHint(''); this.complete([DAY05.rhythm.done]); };
        if (music.indexOf('음악을 좋아한다') !== -1) this.dialogue.play(DAY05.rhythm.music, done);
        else done();
      });
    });
  }

  update(time, delta) {
    const dy = (delta / 1000) * 210;
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const n = this.notes[i];
      n.y += dy;
      if (n.y > this.lineY + 120) {          // 놓쳐도 조용히 지나갑니다
        this.notes.splice(i, 1);
        this.tweens.add({ targets: n, alpha: 0, duration: 300, onComplete: () => n.destroy() });
      }
    }
  }
};
