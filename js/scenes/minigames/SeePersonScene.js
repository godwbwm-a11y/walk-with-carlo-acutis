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

    this.count = this.add.text(W / 2, 132, '', UI.style(FONT.small, '#dfd2bd')).setOrigin(0.5).setDepth(60);
    this.refresh();
  }

  makePerson(data, x, y, i) {
    const who = ['player_front', 'villager_front', 'child_front', 'clerk_front'][i % 4];
    const img = this.add.image(x, y, who).setDepth(y).setScale(1.35);
    const tagBg = this.add.graphics().setDepth(y + 1);
    const tag = this.add.text(x, y - 52, data.first, UI.style(13, PAL.ink)).setOrigin(0.5).setDepth(y + 2);
    const drawTag = (t, color) => {
      tagBg.clear();
      const w = t.width + 20;
      tagBg.fillStyle(HEX(color), 0.95);
      tagBg.fillRoundedRect(x - w / 2, t.y - 13, w, 26, 13);
    };
    drawTag(tag, '#e8e2d6');

    const zone = this.add.zone(x, y - 10, 96, 120).setInteractive().setDepth(y + 3);
    const rec = { img: img, tag: tag, drawTag: drawTag, data: data, done: false, holding: 0, zone: zone };

    zone.on('pointerdown', () => { if (!rec.done) rec.holding = 1; });
    zone.on('pointerup', () => { rec.holding = 0; });
    zone.on('pointerout', () => { rec.holding = 0; });
    this.people.push(rec);
  }

  update(time, delta) {
    if (this.finished) return;
    this.people.forEach((p) => {
      if (p.done || !p.holding) return;
      p.holding += delta;
      if (p.holding > 1200) this.reveal(p);
      else if (p.holding > 300 && !p.hinted) {
        p.hinted = true;
        this.setHint(DAY04.see.watch);
      }
    });
  }

  reveal(p) {
    p.done = true;
    p.holding = 0;
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
