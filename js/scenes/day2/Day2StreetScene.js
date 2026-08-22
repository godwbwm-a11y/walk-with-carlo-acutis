/* DAY 2 · 동네에서 성당까지 — 하나의 길을 계속 걷습니다. */

window.Day2StreetScene = class Day2StreetScene extends WorldScene {
  constructor() { super('Day2StreetScene'); }

  create(data) {
    data = data || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const WORLD = 3800;
    this.initWorld({ width: WORLD, height: H, speed: 97 });   // 아직 가방이 무겁다
    SaveSystem.checkpoint('Day2StreetScene', {});
    AudioSystem.unlock();
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();

    this.flags = { child: false, park: false, school: false, carlo: false, stoneDone: false };
    this.storeKind = false;

    this.buildBackground(WORLD);
    this.buildProps();
    this.buildInteractables();

    this.createPlayer(120, 620);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.physics.world.setBounds(40, 578, WORLD - 80, 72);

    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('성당 가는 길');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, DAY02.street.objective);

    UI.fadeIn(this, 900);
  }

  /* ── 배경 ─────────────────────────────────── */
  buildBackground(WORLD) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const SKY = 330, GROUND = 560, ROAD = 762;

    this.add.image(W / 2, 0, 'sky_morning').setOrigin(0.5, 0)
      .setDisplaySize(W, SKY + 6).setScrollFactor(0).setDepth(-30);

    for (let i = 0; i < 7; i++) {
      const c = this.add.image(Phaser.Math.Between(0, WORLD), Phaser.Math.Between(40, 210), 'cloud_soft')
        .setDisplaySize(Phaser.Math.Between(150, 280), Phaser.Math.Between(60, 110))
        .setAlpha(0.75).setScrollFactor(0.25).setDepth(-29);
      this.tweens.add({ targets: c, x: c.x + 40, duration: 26000, yoyo: true, repeat: -1 });
    }

    const g = this.add.graphics().setDepth(-28);
    g.fillStyle(0xc9d6c3, 1); g.fillRect(0, SKY, WORLD, GROUND - SKY);      // 먼 언덕
    g.fillStyle(0xbccbb6, 1);
    for (let x = 0; x < WORLD; x += 260) g.fillEllipse(x, SKY + 30, 420, 120);

    /* 멀리 보이는 동네 */
    for (let x = 40; x < WORLD; x += 118) {
      const h = Phaser.Math.Between(70, 130);
      g.fillStyle(x % 236 === 40 ? 0xaebbb4 : 0xa5b3ad, 1);
      g.fillRect(x, GROUND - h, 96, h);
      g.fillStyle(0x94a39d, 1);
      g.fillRect(x, GROUND - h, 96, 8);
      g.fillStyle(0xc7d2cb, 0.7);
      for (let r = 0; r < Math.floor(h / 30); r++)
        for (let c = 0; c < 3; c++) g.fillRect(x + 12 + c * 26, GROUND - h + 18 + r * 30, 16, 14);
    }
    g.fillStyle(0xbcc9c2, 0.45);
    g.fillRect(0, GROUND - 12, WORLD, 12);
    g.fillStyle(0xd7cec1, 1); g.fillRect(0, GROUND, WORLD, ROAD - GROUND);  // 인도
    g.fillStyle(0xc7bdae, 1); g.fillRect(0, GROUND, WORLD, 8);
    g.fillStyle(0x9a9a96, 1); g.fillRect(0, ROAD, WORLD, H - ROAD);         // 찻길
    g.fillStyle(0xf3ece2, 0.85);
    for (let x = 10; x < WORLD; x += 90) g.fillRect(x, ROAD + 40, 46, 6);

    /* 인도 블록 무늬 */
    this.add.tileSprite(WORLD / 2, (GROUND + ROAD) / 2, WORLD, ROAD - GROUND, 'walk_tile')
      .setDepth(-27).setAlpha(0.5);

    /* 구역마다 다른 바닥빛 */
    const zone = this.add.graphics().setDepth(-26);
    zone.fillStyle(0x8fbf7a, 0.35); zone.fillRect(1500, GROUND, 620, ROAD - GROUND);   // 공원
    zone.fillStyle(0xe8dcc6, 0.30); zone.fillRect(3300, GROUND, 500, ROAD - GROUND);   // 성당 마당

    this.roadY = ROAD;
    this.groundY = GROUND;
  }

  /* ── 풍경 ─────────────────────────────────── */
  buildProps() {
    const P = (x, y, key, opt) => this.addProp(x, y, key, opt || {});

    /* 골목 */
    P(180, 560, 'house_a', { scale: 1.15, originY: 1, depth: 4 });
    P(400, 560, 'house_b', { scale: 1.0, originY: 1, depth: 4 });
    P(560, 560, 'house_a', { scale: 0.95, originY: 1, depth: 4 });
    P(700, 560, 'house_b', { scale: 1.1, originY: 1, depth: 4 });
    P(300, 596, 'bush', { scale: 1.0 });
    P(640, 600, 'bush', { scale: 0.9 });

    /* 편의점 */
    P(1210, 566, 'store_front', { scale: 1.1, originY: 1, depth: 4 });
    P(1000, 560, 'house_b', { scale: 0.95, originY: 1, depth: 4 });
    P(1420, 560, 'house_a', { scale: 1.0, originY: 1, depth: 4 });

    /* 공원 */
    P(1600, 604, 'tree_big', { scale: 1.15 });
    P(1900, 600, 'tree_big', { scale: 0.95 });
    P(2060, 606, 'bush', { scale: 1.1 });
    P(1740, 606, 'bench', { scale: 1.25 });
    this.pigeons = [1660, 1980].map(x => {
      const p = this.add.image(x, 662, 'pigeon').setDepth(662).setScale(1.1);
      this.tweens.add({ targets: p, x: x + Phaser.Math.Between(30, 70), duration: 5200, yoyo: true, repeat: -1 });
      return p;
    });

    /* 학교 */
    P(2260, 604, 'goal_post', { scale: 1.0, originY: 1, depth: 3, alpha: 0.9 });
    P(2420, 566, 'school_gate', { scale: 1.2, originY: 1, depth: 4 });
    P(2600, 600, 'board_notice', { scale: 1.1 });
    P(2760, 560, 'house_b', { scale: 1.0, originY: 1, depth: 4 });

    /* 성당 가는 길 */
    P(2950, 600, 'streetlamp', { scale: 1.1 });
    P(3260, 600, 'streetlamp', { scale: 1.1 });
    P(3180, 618, 'stone_pile', { scale: 0.9 });
    P(3238, 600, 'cross_small', { scale: 0.9 });

    /* 성당 마당 */
    P(3620, 570, 'church_front', { scale: 1.25, originY: 1, depth: 4 });
    P(3420, 604, 'tree_big', { scale: 0.9 });
    [3480, 3560, 3700, 3760].forEach((x, i) => {
      const who = ['villager_front', 'villager_back', 'grandma_front', 'child_front'][i];
      const p = this.add.image(x, 622 + (i % 2) * 14, who).setDepth(622).setScale(1.05);
      this.tweens.add({ targets: p, y: p.y - 4, duration: 1500 + i * 200, yoyo: true, repeat: -1 });
    });

    /* 전봇대 */
    for (let x = 240; x < 3300; x += 420) {
      const g2 = this.add.graphics().setDepth(2);
      g2.fillStyle(0x9a9384, 1); g2.fillRect(x, 430, 9, 132);
      g2.fillRect(x - 18, 452, 45, 6);
      g2.lineStyle(2, 0x8b8578, 0.8);
      g2.lineBetween(x + 4, 456, x + 424, 470);
    }

    /* 지나가는 차 */
    this.time.addEvent({
      delay: 6500, loop: true, callback: () => {
        const cam = this.cameras.main;
        const dir = Math.random() < 0.5 ? 1 : -1;
        const startX = dir > 0 ? cam.scrollX - 160 : cam.scrollX + GAME.WIDTH + 160;
        const car = this.add.image(startX, this.roadY + 34, 'car_side')
          .setDepth(900).setScale(0.9).setFlipX(dir < 0)
          .setTint([0xffffff, 0xd8e4ee, 0xe6d6c2][Phaser.Math.Between(0, 2)]);
        this.tweens.add({
          targets: car, x: startX + dir * (GAME.WIDTH + 340), duration: 4200,
          ease: 'Linear', onComplete: () => car.destroy()
        });
      }
    });
  }

  /* ── 말을 걸 수 있는 것들 ─────────────────── */
  buildInteractables() {
    const S = DAY02.street;

    this.cat = this.addInteractable({
      id: 'd2_cat', x: 330, y: 652, texture: 'cat', label: '고양이', scale: 1.1,
      onInteract: (it) => {
        this.noteFound('d2_cat');
        this.dialogue.say(S.cat, () => {
          if (it.image) this.tweens.add({ targets: it.image, x: it.image.x - 60, alpha: 0.3, duration: 1400 });
        });
      }
    });

    this.add.image(470, 624, 'resident_front').setDepth(624).setScale(1.1);
    this.addProp(496, 634, 'plant', { scale: 1.0, depth: 634 });
    this.addInteractable({
      id: 'd2_neighbor', x: 470, y: 634, label: '인사하기', range: 86, priority: 2, markerY: 578,
      onInteract: () => { this.noteFound('d2_neighbor'); this.dialogue.play(S.neighbor); }
    });

    this.addInteractable({
      id: 'd2_store', x: 1210, y: 600, label: '편의점', range: 92, priority: 2, markerY: 540,
      onInteract: () => this.enterStore()
    });

    this.addInteractable({
      id: 'd2_bench', x: 1740, y: 612, label: '벤치', range: 76, marker: false,
      onInteract: () => this.dialogue.say(['벤치에 잠깐 앉는다.', '나무 그늘이 시원하다.'])
    });

    this.benchSpark = this.add.image(1786, 648, 'spark').setDepth(700).setScale(1.2).setVisible(false);
    this.tweens.add({ targets: this.benchSpark, alpha: 0.4, scale: 1.5, duration: 900, yoyo: true, repeat: -1 });
    this.sparkItem = this.addInteractable({
      id: 'd2_spark_park', x: 1786, y: 648, label: '작은 빛', range: 82, priority: 3, markerY: 606,
      onInteract: () => {
        this.disableInteractable('d2_spark_park');
        this.benchSpark.setVisible(false);
        this.dialogue.say(DAY02.park.benchSpark, () => Collection.award(this, 'b13'));
      }
    });
    this.sparkItem.enabled = false;
    if (this.sparkItem.marker) this.sparkItem.marker.setVisible(false);

    this.addInteractable({
      id: 'd2_ground', x: 2260, y: 616, label: '운동장', range: 80, marker: false,
      onInteract: () => this.dialogue.say(DAY02.school.ground)
    });
    this.addInteractable({
      id: 'd2_board', x: 2600, y: 616, label: '게시판', range: 78, markerY: 560,
      onInteract: () => { this.noteFound('d2_board'); this.dialogue.say(DAY02.school.board); }
    });

    this.churchItem = this.addInteractable({
      id: 'd2_church', x: 3620, y: 604, label: '성당으로', range: 96, priority: 2, markerY: 520,
      onInteract: () => this.enterChurch()
    });
    this.churchItem.enabled = false;
    if (this.churchItem.marker) this.churchItem.marker.setVisible(false);
  }

  enterStore() {
    if (this.stick) this.stick.reset();
    this.scene.launch('StoreScene', { from: this.scene.key, board: true });
    this.scene.pause();
  }

  enterChurch() {
    this.goScene('Day2ChurchScene', {}, [230, 215, 195]);
  }

  /* ── 걷다가 일어나는 일들 ─────────────────── */

  /* 어린이 */
  eventChild() {
    this.setInputLocked(true);
    const child = this.add.image(this.player.x + 210, 624, 'child_front').setDepth(624).setScale(1.0);
    this.tweens.add({
      targets: child, x: this.player.x + 62, duration: 900, ease: 'Sine.easeOut',
      onComplete: () => {
        AudioSystem.tap();
        this.dialogue.play(DAY02.street.child, () => {
          this.tweens.add({ targets: child, x: child.x + 220, duration: 1500, ease: 'Sine.easeIn' });
          this.time.delayedCall(700, () => {
            this.dialogue.play(DAY02.street.childEnd, () => {
              this.tweens.add({ targets: child, alpha: 0, duration: 600, onComplete: () => child.destroy() });
              this.setInputLocked(false);
            });
          });
        });
      }
    });
  }

  /* 공원 · 할머니와 귤 */
  eventPark() {
    this.setInputLocked(true);
    const gx = this.player.x + 150;
    this.grandma = this.add.image(gx, 618, 'grandma_front').setDepth(618).setScale(1.15);
    this.bagProp = this.add.image(gx + 26, 636, 'paper_bag').setDepth(636).setScale(1.0);

    this.dialogue.say(DAY02.park.arrive, () => {
      this.tweens.add({
        targets: this.bagProp, y: 660, angle: 40, duration: 500, ease: 'Bounce.easeOut',
        onComplete: () => {
          AudioSystem.step();
          this.dialogue.say(DAY02.park.drop, () => {
            if (this.stick) this.stick.reset();
            this.scene.launch('OrangeScene', { from: this.scene.key });
            this.scene.pause();
          });
        }
      });
    });
  }

  /* 학교 앞 */
  eventSchool() {
    this.setInputLocked(true);
    const concern = SaveSystem.get('reflections.mainConcern', null);
    const lines = (concern && DAY02.school.concern[concern]) || DAY02.school.concernDefault;
    this.dialogue.say(DAY02.school.arrive, () => {
      this.dialogue.play(lines.map(l => (typeof l === 'string' ? { t: l } : l)), () => {
        if (this.stick) this.stick.reset();
        this.scene.launch('NoiseScene', { from: this.scene.key });
        this.scene.pause();
      });
    });
  }

  /* 카를로 */
  eventCarlo() {
    this.setInputLocked(true);
    this.carlo = this.add.sprite(3070, 618, 'carlo_front').setOrigin(0.5, 0.86).setDepth(618).setScale(1.12);
    this.carloShadow = this.add.image(3070, 621, 'shadow').setDepth(617).setAlpha(0.4).setScale(1.1);
    this.carlo.setAlpha(0);
    this.tweens.add({ targets: [this.carlo, this.carloShadow], alpha: 1, duration: 600 });
    this.cameras.main.pan(3130, 500, 900, 'Sine.easeInOut');

    this.dialogue.say(DAY02.road.uphill, () => {
      this.dialogue.play(DAY02.road.meet, () => {
        if (this.stick) this.stick.reset();
        this.scene.launch('HeavyBagScene', { from: this.scene.key });
        this.scene.pause();
      });
    });
  }

  /* ── 미니게임에서 돌아왔을 때 ─────────────── */
  onMiniGameDone(key) {
    if (key === 'OrangeScene') this.afterOrange();
    else if (key === 'NoiseScene' || key === 'AngelScene') this.afterNoise();
    else if (key === 'HeavyBagScene') this.afterBag();
  }

  afterOrange() {
    const caught = SaveSystem.get('reflections.day2Oranges', 0);
    const lines = (caught >= 5 ? DAY02.park.allCaught : DAY02.park.someCaught)
      .concat(DAY02.park.grandmaEnd);
    this.setInputLocked(true);
    this.dialogue.play(lines.map(l => (typeof l === 'string' ? { t: l } : l)), () => {
      if (this.grandma) {
        this.tweens.add({ targets: [this.grandma, this.bagProp], x: '-=260', alpha: 0.2, duration: 2600 });
      }
      this.dialogue.say(DAY02.park.afterBag, () => {
        this.sparkItem.enabled = true;
        if (this.sparkItem.marker) this.sparkItem.marker.setVisible(true);
        this.benchSpark.setVisible(true);
        this.setInputLocked(false);
      });
    });
  }

  afterNoise() {
    this.setInputLocked(false);
  }

  afterBag() {
    /* 돌 하나를 내려놓고 왔다 */
    this.flags.stoneDone = true;
    this.walkSpeed = 108;
    AudioSystem.setAmbience('room');

    const laid = this.add.image(3200, 600, 'stone').setDepth(601).setScale(0.7).setAlpha(0);
    this.tweens.add({ targets: laid, alpha: 1, duration: 800 });

    this.setInputLocked(true);
    this.objective.setText(DAY02.walk.objective);
    this.churchItem.enabled = true;
    if (this.churchItem.marker) this.churchItem.marker.setVisible(true);
    this.followCarlo = true;

    this.dialogue.play(DAY02.bag.after, () => {
      Collection.award(this, 'b12', () => {
        this.dialogue.play(DAY02.walk.talk1, () => {
          this.setInputLocked(false);
          this.walkTalkStage = 1;
        });
      });
    });
  }

  /* 함께 걷는 동안 이어지는 대화 */
  updateWalkTalk() {
    if (!this.followCarlo || this.inputLocked || this.dialogue.isOpen) return;
    const x = this.player.x;
    if (this.walkTalkStage === 1 && x > 3300) {
      this.walkTalkStage = 2;
      this.setInputLocked(true);
      this.dialogue.play(DAY02.walk.talk2, () => {
        this.time.delayedCall(1600, () => {
          this.dialogue.play(DAY02.walk.talk3, () => this.setInputLocked(false));
        });
      });
    } else if (this.walkTalkStage === 2 && x > 3520 && !this.yardDone) {
      this.yardDone = true;
      this.setInputLocked(true);
      this.dialogue.say(DAY02.yard.arrive, () => {
        this.dialogue.play(DAY02.yard.carlo, () => {
          this.tweens.add({ targets: [this.carlo, this.carloShadow], alpha: 0.55, duration: 900 });
          this.followCarlo = false;
          this.objective.setText(DAY02.yard.objective);
          this.dialogue.say(DAY02.yard.lookBack, () => this.setInputLocked(false));
        });
      });
    }
  }

  update(time, delta) {
    this.updateWorld(time, delta);
    if (!this.player) return;

    /* 카를로가 옆에서 함께 걷습니다 */
    if (this.followCarlo && this.carlo && !this.inputLocked) {
      const tx = this.player.x - 52;
      const ty = this.player.y - 4;
      const d = Phaser.Math.Distance.Between(this.carlo.x, this.carlo.y, tx, ty);
      if (d > 24) {
        this.carlo.x = Phaser.Math.Linear(this.carlo.x, tx, 0.05);
        this.carlo.y = Phaser.Math.Linear(this.carlo.y, ty, 0.05);
        this.carlo.setTexture(d > 70 ? 'carlo_back' : 'carlo_front');
        this.carlo.setFlipX(tx < this.carlo.x);
      }
      this.carlo.setDepth(this.carlo.y);
      this.carloShadow.setPosition(this.carlo.x, this.carlo.y + 3).setDepth(this.carlo.y - 1);
      this.updateWalkTalk();
    }

    if (this.inputLocked) return;
    const x = this.player.x;
    if (!this.flags.child && x > 720) { this.flags.child = true; this.eventChild(); }
    else if (!this.flags.park && x > 1660) { this.flags.park = true; this.eventPark(); }
    else if (!this.flags.school && x > 2380) { this.flags.school = true; this.eventSchool(); }
    else if (!this.flags.carlo && x > 2980) { this.flags.carlo = true; this.eventCarlo(); }
  }

  onStoreDone(gaveKindWord) {
    if (gaveKindWord) Collection.award(this, 's9');
  }
};
