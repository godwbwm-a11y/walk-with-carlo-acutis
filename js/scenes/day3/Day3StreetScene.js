/* DAY 3 · 주일의 동네 — 버스정류장까지 */

window.Day3StreetScene = class Day3StreetScene extends WorldScene {
  constructor() { super('Day3StreetScene'); }

  create(data) {
    data = data || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const WORLD = 2500;
    this.initWorld({ width: WORLD, height: H, speed: 108 });
    SaveSystem.checkpoint('Day3StreetScene', {});
    AudioSystem.unlock();
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();

    this.flags = { bus: false };
    this.buildBackground(WORLD);
    this.buildProps();
    this.buildInteractables();

    this.createPlayer(120, 620);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.physics.world.setBounds(40, 578, WORLD - 80, 72);

    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('주일 아침의 동네');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, DAY03.street.objective);

    UI.fadeIn(this, 900);
    this.setInputLocked(true);
    UI.caption(this, DAY03.street.mood, { y: H * 0.30, hold: 1400, onDone: () => this.setInputLocked(false) });
  }

  buildBackground(WORLD) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const SKY = 330, GROUND = 560, ROAD = 762;

    this.add.image(W / 2, 0, 'sky_morning').setOrigin(0.5, 0)
      .setDisplaySize(W, SKY + 6).setScrollFactor(0).setDepth(-30);

    for (let i = 0; i < 6; i++) {
      const c = this.add.image(Phaser.Math.Between(0, WORLD), Phaser.Math.Between(40, 200), 'cloud_soft')
        .setDisplaySize(Phaser.Math.Between(160, 260), Phaser.Math.Between(60, 100))
        .setAlpha(0.8).setScrollFactor(0.25).setDepth(-29);
      this.tweens.add({ targets: c, x: c.x + 40, duration: 26000, yoyo: true, repeat: -1 });
    }

    const g = this.add.graphics().setDepth(-28);
    g.fillStyle(0xc9d6c3, 1); g.fillRect(0, SKY, WORLD, GROUND - SKY);
    g.fillStyle(0xbccbb6, 1);
    for (let x = 0; x < WORLD; x += 260) g.fillEllipse(x, SKY + 30, 420, 120);
    for (let x = 40; x < WORLD; x += 118) {
      const h = 70 + ((x * 7) % 60);
      g.fillStyle(((x / 118) | 0) % 2 === 0 ? 0xaebbb4 : 0xa5b3ad, 1);
      g.fillRect(x, GROUND - h, 96, h);
      g.fillStyle(0x94a39d, 1); g.fillRect(x, GROUND - h, 96, 8);
      g.fillStyle(0xc7d2cb, 0.7);
      for (let r = 0; r < Math.floor(h / 30); r++)
        for (let c = 0; c < 3; c++) g.fillRect(x + 12 + c * 26, GROUND - h + 18 + r * 30, 16, 14);
    }
    g.fillStyle(0xd7cec1, 1); g.fillRect(0, GROUND, WORLD, ROAD - GROUND);
    g.fillStyle(0xc7bdae, 1); g.fillRect(0, GROUND, WORLD, 8);
    g.fillStyle(0x9a9a96, 1); g.fillRect(0, ROAD, WORLD, H - ROAD);
    g.fillStyle(0xf3ece2, 0.85);
    for (let x = 10; x < WORLD; x += 90) g.fillRect(x, ROAD + 40, 46, 6);

    this.add.tileSprite(WORLD / 2, (GROUND + ROAD) / 2, WORLD, ROAD - GROUND, 'walk_tile')
      .setDepth(-27).setAlpha(0.5);

    const zone = this.add.graphics().setDepth(-26);
    zone.fillStyle(0x8fbf7a, 0.32); zone.fillRect(1080, GROUND, 560, ROAD - GROUND);

    this.roadY = ROAD;
  }

  buildProps() {
    const P = (x, y, key, opt) => this.addProp(x, y, key, opt || {});

    P(180, 560, 'house_a', { scale: 1.15, originY: 1, depth: 4 });
    P(400, 560, 'house_b', { scale: 1.0, originY: 1, depth: 4 });
    P(300, 596, 'bush', { scale: 1.0 });

    P(760, 566, 'store_front', { scale: 1.1, originY: 1, depth: 4 });
    P(980, 560, 'house_b', { scale: 0.95, originY: 1, depth: 4 });

    /* 공원 */
    P(1180, 604, 'tree_big', { scale: 1.15 });
    P(1480, 600, 'tree_big', { scale: 0.95 });
    P(1320, 606, 'bench', { scale: 1.2 });
    P(1600, 606, 'bush', { scale: 1.05 });

    /* 어제 내려놓은 돌무더기 */
    P(1244, 586, 'stone_pile', { scale: 0.85 });
    P(1296, 570, 'cross_small', { scale: 0.85 });

    /* 버스정류장 */
    P(2120, 596, 'bus_stop', { scale: 1.1, originY: 1, depth: 4 });
    P(2020, 600, 'bus_sign', { scale: 1.0 });

    /* 주일 아침의 사람들 */
    [[560, 'villager_front'], [900, 'grandma_front'], [1700, 'villager_back'], [1860, 'child_front']]
      .forEach((p, i) => {
        const s = this.add.image(p[0], 624 + (i % 2) * 10, p[1]).setDepth(624).setScale(1.05).setAlpha(0.95);
        this.tweens.add({ targets: s, x: s.x + 120, duration: 22000 + i * 3000, yoyo: true, repeat: -1 });
      });

    this.time.addEvent({
      delay: 9000, loop: true, callback: () => {
        const cam = this.cameras.main;
        const car = this.add.image(cam.scrollX - 160, this.roadY + 34, 'car_side')
          .setDepth(900).setScale(0.9).setTint(0xe6eef4);
        this.tweens.add({
          targets: car, x: cam.scrollX + GAME.WIDTH + 200, duration: 4600, ease: 'Linear',
          onComplete: () => car.destroy()
        });
      }
    });
  }

  buildInteractables() {
    const S = DAY03.street;

    this.addInteractable({
      id: 'd3_store', x: 760, y: 600, label: '편의점', range: 86, markerY: 540,
      onInteract: () => { this.noteFound('d3_store'); this.dialogue.say(S.store); }
    });

    this.addInteractable({
      id: 'd3_stone', x: 1262, y: 592, label: '돌무더기', range: 86, priority: 1, markerY: 548,
      onInteract: () => this.lookStone()
    });

    this.addInteractable({
      id: 'd3_bench', x: 1320, y: 612, label: '벤치', range: 70, marker: false,
      onInteract: () => this.dialogue.say(['아침 벤치는 아직 차갑다.'])
    });

    this.busItem = this.addInteractable({
      id: 'd3_bus', x: 2100, y: 610, label: '버스정류장', range: 96, priority: 2, markerY: 540,
      onInteract: () => this.atBusStop()
    });
  }

  /* 어제 내려놓은 돌 */
  lookStone() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const stone = SaveSystem.get('reflections.entrustedConcern', null);
    this.noteFound('d3_stone');
    const label = stone ? ('[' + stone + ']') : '[어제 내려놓은 것]';
    this.dialogue.say([label].concat(DAY03.street.stone.look), () => {
      const t = this.add.text(W / 2, H * 0.28, DAY03.street.stone.quiet,
        UI.style(FONT.body, PAL.cream, { align: 'center' }))
        .setOrigin(0.5).setDepth(1200).setAlpha(0).setScrollFactor(0);
      const back = this.add.graphics().setDepth(1199).setScrollFactor(0);
      back.fillStyle(0x101a2e, 0.5); back.fillRect(0, H * 0.28 - 40, W, 80);
      back.setAlpha(0);
      this.tweens.add({ targets: [t, back], alpha: 1, duration: 800 });
      this.time.delayedCall(2400, () => {
        this.tweens.add({
          targets: [t, back], alpha: 0, duration: 700,
          onComplete: () => { t.destroy(); back.destroy(); }
        });
      });
    });
  }

  /* 정류장에서 카를로를 만난다 */
  atBusStop() {
    if (this.flags.bus) { this.dialogue.say(['버스를 기다린다.']); return; }
    this.flags.bus = true;
    this.setInputLocked(true);
    this.disableInteractable('d3_bus');

    this.carlo = this.add.image(2170, 616, 'carlo_front').setDepth(616).setScale(1.12).setAlpha(0);
    this.tweens.add({ targets: this.carlo, alpha: 1, duration: 600 });
    this.cameras.main.pan(2160, 500, 900, 'Sine.easeInOut');

    this.dialogue.play(DAY03.bus.meet, () => {
      this.dialogue.play(DAY03.bus.talk, () => {
        this.dialogue.say(DAY03.bus.wait, () => {
          if (this.stick) this.stick.reset();
          this.scene.launch('LookAroundScene', { from: this.scene.key });
          this.scene.pause();
        });
      });
    });
  }

  onMiniGameDone(key) {
    if (key !== 'LookAroundScene') return;
    this.setInputLocked(true);
    this.dialogue.play(DAY03.bus.after, () => this.hiddenCard());
  }

  /* 광고판 옆 작은 종이 */
  hiddenCard() {
    const spark = this.add.image(2062, 604, 'spark').setDepth(700).setScale(1.3);
    this.tweens.add({ targets: spark, alpha: 0.4, scale: 1.7, duration: 900, yoyo: true, repeat: -1 });

    this.paperItem = this.addInteractable({
      id: 'd3_paper', x: 2062, y: 604, label: '작은 종이', range: 96, priority: 3, markerY: 556,
      onInteract: () => {
        this.disableInteractable('d3_paper');
        this.tweens.add({ targets: spark, alpha: 0, duration: 400 });
        this.dialogue.say(DAY03.bus.paper, () => {
          Collection.award(this, 'b14', () => this.busArrives());
        });
      }
    });

    this.objective.setText('작은 종이를 살펴보자');
    this.setInputLocked(false);

    /* 그냥 지나쳐도 버스는 옵니다 */
    this.time.delayedCall(32000, () => {
      if (this.paperItem && this.paperItem.enabled && !this._boarding) this.busArrives();
    });
  }

  busArrives() {
    if (this._boarding) return;
    this._boarding = true;
    this.setInputLocked(true);
    this.objective.setText('버스에 오르자');

    const bus = this.add.image(this.player.x + 460, 700, 'bus_side').setDepth(880).setScale(1.15);
    this.tweens.add({
      targets: bus, x: this.player.x + 40, duration: 1700, ease: 'Sine.easeOut',
      onComplete: () => {
        this.dialogue.say(DAY03.bus.arrive, () => {
          if (this.stick) this.stick.reset();
          UI.fadeOut(this, 900, () => this.scene.start('Day3ChurchScene'), [230, 220, 205]);
        });
      }
    });
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
