/* 미니게임 · 기다리는 동안 — 지나치던 것을 바라봅니다. */

window.LookAroundScene = class LookAroundScene extends MiniGameScene {
  constructor() { super('LookAroundScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#6f93b4',
      title: DAY03.look.title,
      hint: DAY03.look.hint,
      lightHeader: true             /* 아침 하늘이 밝아 글씨를 진하게 */
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.found = [];

    /* 정류장에서 바라보는 풍경 */
    this.add.image(W / 2, 0, 'sky_morning').setOrigin(0.5, 0).setDisplaySize(W, 420).setDepth(-10);
    const g = this.add.graphics().setDepth(-9);
    g.fillStyle(0xc9d6c3, 1); g.fillRect(0, 400, W, 160);
    g.fillStyle(0xd7cec1, 1); g.fillRect(0, 556, W, H - 556);
    g.fillStyle(0xc7bdae, 1); g.fillRect(0, 556, W, 8);
    g.fillStyle(0xaebbb4, 1);
    g.fillRect(20, 470, 90, 90); g.fillRect(250, 452, 110, 108);
    g.fillStyle(0xc7d2cb, 0.7);
    g.fillRect(34, 486, 22, 18); g.fillRect(70, 486, 22, 18);
    g.fillRect(268, 470, 26, 20); g.fillRect(312, 470, 26, 20);

    /* 성당 종탑을 멀리 */
    g.fillStyle(0xe6dccb, 1); g.fillRect(160, 430, 60, 130);
    g.fillStyle(0xd5c9b4, 1); g.fillTriangle(152, 432, 228, 432, 190, 392);
    g.fillStyle(0xb5705c, 1); g.fillRect(187, 372, 6, 22); g.fillRect(180, 378, 20, 6);

    this.spots = {};
    this.makeSpot('bird', 100, 320, () => this.add.image(100, 320, 'branch_bird').setScale(1.2));
    this.makeSpot('bell', 190, 420, () => this.add.image(190, 420, 'lamp_glow').setScale(0.9).setAlpha(0.5).setTint(0xfff1cf));
    this.makeSpot('family', 302, 636, () => {
      const c = this.add.container(302, 636);
      c.add(this.add.image(-16, 0, 'grandma_front').setScale(1.15));
      c.add(this.add.image(16, 8, 'child_front').setScale(0.95));
      return c;
    });
    this.makeSpot('cloud', 286, 236, () => this.add.image(286, 236, 'cloud_soft').setDisplaySize(190, 80).setAlpha(0.95));
    this.makeSpot('shoes', 132, 704, () => this.add.image(132, 704, 'shoe_pair').setScale(1.25));

    this.count = this.add.text(W / 2, this.contentTop(), '',
      UI.style(FONT.small, PAL.ink)).setOrigin(0.5, 0).setDepth(101);
    this.refresh();
  }

  makeSpot(id, x, y, build) {
    const obj = build();
    obj.setDepth(y).setAlpha(0.96);
    const halo = this.add.image(x, y, 'lamp_glow').setDepth(y - 1).setScale(0.7).setAlpha(0.25).setTint(0xfff1cf);
    this.tweens.add({ targets: halo, alpha: 0.45, scale: 0.85, duration: 1500, yoyo: true, repeat: -1 });

    const zone = this.add.zone(x, y, 120, 120).setInteractive().setDepth(y + 1);
    zone.once('pointerdown', () => {
      if (this.finished) return;
      zone.disableInteractive();
      this.tweens.add({ targets: halo, alpha: 0, duration: 400 });
      this.tweens.add({ targets: obj, scale: obj.scale * 1.08, duration: 260, yoyo: true });
      this.touch(id);
    });
    this.spots[id] = { obj: obj, halo: halo, zone: zone };
  }

  touch(id) {
    const spot = DAY03.look.spots.find(s => s.id === id);
    if (!spot || this.found.indexOf(id) !== -1) return;
    this.found.push(id);
    AudioSystem.found();
    this.refresh();
    this.dialogue.say(spot.lines, () => {
      if (this.found.length >= DAY03.look.need) this.done();
    });
  }

  refresh() {
    this.count.setText('바라본 것  ' + this.found.length + ' / ' + DAY03.look.need);
  }

  done() {
    if (this.finished) return;
    SaveSystem.set('reflections.day3Look', this.found.slice());
    this.setHint('');
    this.count.setText('');
    this.complete([DAY03.look.done]);
  }
};
