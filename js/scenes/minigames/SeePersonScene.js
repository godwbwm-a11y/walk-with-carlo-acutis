/* 미니게임 · 한 사람을 제대로 보기 — 천천히 봐야 보이는 것 */

window.SeePersonScene = class SeePersonScene extends MiniGameScene {
  constructor() { super('SeePersonScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#6f8f6a',
      title: DAY04.see.title, hint: DAY04.see.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.found = 0;

    const g = this.add.graphics().setDepth(-1);
    g.fillStyle(HEX('#8fbf7a'), 1); g.fillRect(0, 300, W, H - 300);
    g.fillStyle(HEX('#7fae6b'), 1); g.fillRect(0, 300, W, 14);
    g.fillStyle(HEX('#d7cec1'), 1); g.fillRect(0, 726, W, H - 726);
    this.add.image(48, 320, 'tree_big').setOrigin(0.5, 1).setDepth(0).setScale(0.8).setAlpha(0.9);
    this.add.image(340, 322, 'bush').setOrigin(0.5, 1).setDepth(0).setScale(1.0).setAlpha(0.9);
    this.add.image(W / 2, 300, 'goal_post').setOrigin(0.5, 1).setDepth(0).setScale(0.85).setAlpha(0.55);

    this.people = [];
    const spots = [[86, 420], [286, 440], [120, 588], [300, 606]];
    DAY04.see.people.forEach((p, i) => this.makePerson(p, spots[i][0], spots[i][1], i));

    this.count = this.add.text(W / 2, this.contentTop(), '',
      UI.style(FONT.small, PAL.cream)).setOrigin(0.5, 0).setDepth(60);
    this.refresh();
  }

  makePerson(data, x, y, i) {
    const who = ['player_front', 'villager_front', 'child_front', 'clerk_front'][i % 4];
    const img = this.add.image(x, y, who).setDepth(y).setScale(1.45);
    const tagBg = this.add.graphics().setDepth(y + 1);
    const tag = this.add.text(x, y - 58, data.first, UI.style(FONT.small, PAL.ink, {
      align: 'center', wordWrap: { width: 150 }
    })).setOrigin(0.5).setDepth(y + 2);
    const drawTag = (t, color) => {
      tagBg.clear();
      const w = t.width + 22, h = t.height + 14;
      tagBg.fillStyle(HEX(color), 0.96);
      tagBg.fillRoundedRect(x - w / 2, t.y - h / 2, w, h, h / 2);
    };
    drawTag(tag, '#e8e2d6');

    /* 얼마나 오래 바라보고 있는지 눈에 보이게 — 그냥 눌렀다 떼면 아무 일도 없어 보였습니다 */
    const ring = this.add.graphics().setDepth(y + 4);

    const zone = this.add.zone(x, y - 10, 116, 140).setInteractive().setDepth(y + 5);
    const rec = {
      img: img, tag: tag, drawTag: drawTag, data: data,
      done: false, hold: 0, holding: false, zone: zone, ring: ring, x: x, y: y
    };

    zone.on('pointerdown', () => { if (!rec.done) rec.holding = true; });
    zone.on('pointerup', () => { rec.holding = false; });
    zone.on('pointerout', () => { rec.holding = false; });
    zone.on('pointerupoutside', () => { rec.holding = false; });
    this.people.push(rec);
  }

  update(time, delta) {
    if (this.finished || !this.people) return;
    this.people.forEach((p) => {
      if (p.done) { p.ring.clear(); return; }

      /* 손을 떼면 곧바로 사라지지 않고 천천히 줄어듭니다 */
      if (p.holding) p.hold = Math.min(1200, p.hold + delta);
      else p.hold = Math.max(0, p.hold - delta * 1.4);

      p.ring.clear();
      if (p.hold > 40) {
        const t = p.hold / 1200;
        p.ring.lineStyle(6, HEX(PAL.sun), 0.35);
        p.ring.strokeCircle(p.x, p.y - 12, 46);
        p.ring.lineStyle(6, HEX(PAL.sun), 0.95);
        p.ring.beginPath();
        p.ring.arc(p.x, p.y - 12, 46, Phaser.Math.DegToRad(-90),
          Phaser.Math.DegToRad(-90 + 360 * t), false);
        p.ring.strokePath();
      }
      if (p.hold >= 1200) this.reveal(p);
    });
  }

  reveal(p) {
    p.done = true;
    p.hold = 0;
    p.holding = false;
    p.ring.clear();
    p.zone.disableInteractive();
    AudioSystem.found();
    this.found++;
    this.setHint(DAY04.see.hint);
    this.refresh();

    this.tweens.add({ targets: p.img, y: p.img.y - 6, duration: 300, yoyo: true });
    p.tag.setText(p.data.found);
    p.tag.setColor(PAL.cream);
    p.drawTag(p.tag, PAL.leaf);

    this.dialogue.say([p.data.scene], () => {
      if (this.found >= DAY04.see.need) this.done_();
    });
  }

  refresh() {
    this.count.setText('발견한 좋은 점  ' + this.found + ' / ' + DAY04.see.need);
  }

  done_() {
    if (this.finished) return;
    this.finished = true;
    SaveSystem.set('reflections.day4Seen', this.found);
    this.setHint('');
    this.count.setText('');
    this.dialogue.play(DAY04.see.talkAfter, () => this.leave());
  }
};
