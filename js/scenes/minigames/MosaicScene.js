/* 미니게임 · 한 몸, 많은 지체 — 조각은 전부 다릅니다.
   멀리서 보면 한 방향으로 걷는 사람들이 됩니다. */

window.MosaicScene = class MosaicScene extends MiniGameScene {
  constructor() { super('MosaicScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#33415e',
      title: DAY05.mosaic.title, hint: DAY05.mosaic.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.placed = false;

    /* 큰 천 */
    this.cloth = this.add.container(W / 2, 300).setDepth(10);
    this.cloth.add(this.add.image(0, 0, 'cloth_big'));
    this.clothW = 300; this.clothH = 180;

    /* 다른 나라 청년들이 이미 붙여 놓은 조각들 */
    this.others = [];
    for (let i = 0; i < 46; i++) {
      const x = Phaser.Math.Between(-136, 136);
      const y = Phaser.Math.Between(-76, 76);
      const g = this.add.graphics();
      this.drawShape(g, ['circle', 'tri', 'square', 'star', 'wave', 'leaf', 'hand', 'road'][i % 8],
        x, y, 9, [0xc9553f, 0x3f6f8f, 0x7a5f8a, 0x4f7d6a, 0xd7a04f, 0x6d84c0][i % 6], 0.85);
      this.cloth.add(g);
      this.others.push(g);
    }

    this.time.delayedCall(500, () => this.dialogue.play(DAY05.mosaic.open, () => this.pickShape()));
  }

  /* 조각 하나 고르기 — 어제 고른 좋은 점에서 나온 조각이 맨 앞에 옵니다 */
  pickShape() {
    const W = GAME.WIDTH;
    const layer = this.add.container(0, 0).setDepth(200);
    this.pickLayer = layer;

    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.9); scrim.fillRect(0, 0, W, GAME.HEIGHT);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 142, DAY05.mosaic.hint,
      UI.style(19, PAL.cream, { align: 'center', wordWrap: { width: W - 70 } })).setOrigin(0.5));

    const list = [];
    const strengths = SaveSystem.get('reflections.day4Strengths', []) || [];
    for (let i = 0; i < strengths.length; i++) {
      const m = DAY05.mosaic.fromStrength[strengths[i]];
      if (m && !list.find(o => o.key === m.key)) { list.push({ key: m.key, label: m.label, mine: true }); break; }
    }
    DAY05.mosaic.shapes.forEach(s => { if (list.length < 9) list.push({ key: s.key, label: s.label }); });

    if (list[0] && list[0].mine) {
      layer.add(this.add.text(W / 2, 178, DAY05.mosaic.mine,
        UI.style(13, PAL.sun, { align: 'center' })).setOrigin(0.5));
    }

    let x = 88, y = 262;
    list.forEach((s, i) => {
      const c = this.add.container(x, y);
      const g = this.add.graphics();
      g.fillStyle(0xf3ece2, 0.14); g.fillRoundedRect(-46, -46, 92, 92, 14);
      g.lineStyle(2, HEX(s.mine ? PAL.sun : PAL.cream), s.mine ? 0.9 : 0.35);
      g.strokeRoundedRect(-46, -46, 92, 92, 14);
      c.add(g);
      const sg = this.add.graphics();
      this.drawShape(sg, s.key, 0, -6, 22, HEX(s.mine ? PAL.sun : PAL.cream), 1);
      c.add(sg);
      c.add(this.add.text(0, 30, s.label, UI.style(13, s.mine ? PAL.sun : PAL.cream)).setOrigin(0.5));
      c.setSize(92, 100);
      c.setInteractive();
      c.on('pointerup', () => this.chose(s));
      layer.add(c);
      x += 107;
      if ((i + 1) % 3 === 0) { x = 88; y += 130; }
    });
  }

  chose(s) {
    this.myShape = s;
    if (this.pickLayer) { this.pickLayer.destroy(); this.pickLayer = null; }
    AudioSystem.select();
    this.setHint(DAY05.mosaic.place);

    /* 천 위에 붙일 자리를 고릅니다 */
    const zone = this.add.zone(GAME.WIDTH / 2, 300, this.clothW, this.clothH).setOrigin(0.5)
      .setInteractive().setDepth(120);
    zone.on('pointerup', (p) => {
      if (this.placed) return;
      this.placed = true;
      zone.destroy();
      this.place(p.x - GAME.WIDTH / 2, p.y - 300);
    });
  }

  place(lx, ly) {
    const g = this.add.graphics();
    this.drawShape(g, this.myShape.key, lx, ly, 16, HEX(PAL.sun), 1);
    this.cloth.add(g);
    this.mine = g;
    AudioSystem.found();
    SaveSystem.set('reflections.day5Piece', this.myShape.label);

    this.tweens.add({ targets: g, alpha: 0.4, duration: 260, yoyo: true, repeat: 2 });
    this.time.delayedCall(1100, () => this.zoomOut());
  }

  /* 카메라가 멀어지면 전체 형상이 보입니다 */
  zoomOut() {
    const W = GAME.WIDTH;
    this.setHint('');
    this.dialogue.say(DAY05.mosaic.zoom, () => {
      this.tweens.add({ targets: this.cloth, scale: 0.62, y: 320, duration: 1400, ease: 'Sine.easeInOut' });

      /* 조각들이 모여 한 방향으로 걷는 사람들이 됩니다 */
      this.time.delayedCall(900, () => {
        this.walkers = [];
        for (let i = 0; i < 12; i++) {
          const img = this.add.image(40 + (i % 6) * 62, 470 + Math.floor(i / 6) * 56,
            ['pilgrim_a', 'pilgrim_b', 'pilgrim_c', 'pilgrim_d', 'pilgrim_e', 'pilgrim_f'][i % 6] + '_back')
            .setDepth(50).setScale(1.05).setAlpha(0);
          this.tweens.add({ targets: img, alpha: 1, duration: 700, delay: i * 90 });
          this.walkers.push(img);
        }
        const cross = this.add.graphics().setDepth(45).setAlpha(0);
        cross.fillStyle(HEX(PAL.sun), 0.85);
        cross.fillRect(W / 2 - 6, 556, 12, 74);
        cross.fillRect(W / 2 - 30, 578, 60, 12);
        this.tweens.add({ targets: cross, alpha: 1, duration: 900, delay: 900 });

        this.time.delayedCall(2400, () => {
          this.setHint(DAY05.mosaic.reveal);
          this.dialogue.play(DAY05.mosaic.talk, () => {
            this.setHint('');
            this.complete([DAY05.mosaic.reveal]);
          });
        });
      });
    });
  }

  /* 조각 모양 그리기 */
  drawShape(g, key, x, y, r, color, alpha) {
    g.fillStyle(color, alpha === undefined ? 1 : alpha);
    g.lineStyle(2, color, alpha === undefined ? 1 : alpha);
    if (key === 'circle') g.fillCircle(x, y, r);
    else if (key === 'tri') g.fillTriangle(x, y - r, x - r, y + r * 0.8, x + r, y + r * 0.8);
    else if (key === 'square') g.fillRoundedRect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, 3);
    else if (key === 'star') this.star(g, x, y, r, false);
    else if (key === 'blank') this.star(g, x, y, r, true);
    else if (key === 'wave') {
      g.beginPath();
      g.moveTo(x - r, y);
      g.lineTo(x - r * 0.4, y - r * 0.6);
      g.lineTo(x + r * 0.2, y + r * 0.4);
      g.lineTo(x + r, y - r * 0.3);
      g.strokePath();
    } else if (key === 'leaf') {
      g.fillEllipse(x, y, r * 1.2, r * 2);
    } else if (key === 'hand') {
      g.fillRoundedRect(x - r * 0.7, y - r * 0.2, r * 1.4, r * 1.2, 3);
      for (let i = 0; i < 3; i++) g.fillRoundedRect(x - r * 0.6 + i * r * 0.5, y - r, r * 0.34, r * 0.9, 2);
    } else if (key === 'road') {
      g.fillTriangle(x - r * 0.9, y + r, x + r * 0.9, y + r, x, y - r);
    } else if (key === 'ear') {
      g.beginPath();
      g.arc(x, y, r * 0.9, Phaser.Math.DegToRad(300), Phaser.Math.DegToRad(140));
      g.strokePath();
      g.fillCircle(x, y, r * 0.28);
    } else if (key === 'note') {
      g.fillCircle(x - r * 0.3, y + r * 0.6, r * 0.5);
      g.fillRect(x + r * 0.1, y - r, r * 0.24, r * 1.6);
    } else if (key === 'pixel') {
      for (let i = 0; i < 4; i++) {
        g.fillRect(x - r + (i % 2) * r * 1.1, y - r + Math.floor(i / 2) * r * 1.1, r * 0.9, r * 0.9);
      }
    } else if (key === 'brush') {
      g.fillRect(x - r * 0.2, y - r, r * 0.4, r * 1.3);
      g.fillTriangle(x - r * 0.5, y + r * 0.3, x + r * 0.5, y + r * 0.3, x, y + r);
    } else {
      g.fillCircle(x, y, r);
    }
  }

  star(g, x, y, r, hollow) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const rad = (i % 2 === 0) ? r : r * 0.46;
      const a = Phaser.Math.DegToRad(-90 + i * 36);
      pts.push(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    if (hollow) {
      g.beginPath();
      g.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
      g.closePath();
      g.strokePath();
    } else {
      g.fillPoints(pts.reduce((acc, v, i) => {
        if (i % 2 === 0) acc.push({ x: v, y: pts[i + 1] });
        return acc;
      }, []), true);
    }
  }
};
