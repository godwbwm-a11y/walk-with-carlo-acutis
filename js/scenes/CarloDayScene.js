/* 가롤로의 하루 — 2005년 밀라노.
   여기서는 플레이어가 가롤로가 됩니다. 곁에서 걷던 사람이 곧 나 자신이 됩니다.
   길은 아침에서 밤으로 한 방향으로만 이어집니다. 꿈이기 때문입니다. */

window.CarloDayScene = class CarloDayScene extends WorldScene {
  constructor() { super('CarloDayScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const WORLD_W = 2900;
    this.WORLD_W = WORLD_W;

    this.initWorld({ width: WORLD_W, height: H, speed: 104, playerTex: 'carlo' });
    SaveSystem.checkpoint('CarloDayScene');
    AudioSystem.unlock();
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();

    this.stage = -1;
    this.isNight = false;
    this.riding = false;

    this.buildSky();
    this.buildStreet();
    this.buildBuildings();
    this.buildPeople();
    this.createDecor();
    this.createStops();

    this.createPlayer(150, 604);
    this.createBall();
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('가롤로의 하루 · 밀라노');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, ' ').setVisible(false);

    this.physics.world.setBounds(30, 552, WORLD_W - 60, 178);   // 인도 아래쪽까지 내려갈 수 있습니다

    UI.fadeIn(this, 1600, [250, 246, 236]);
    this.setInputLocked(true);
    UI.caption(this, CARLO_DAY.opening, {
      y: H * 0.3, hold: 1700,
      onDone: () => this.dialogue.play(CARLO_DAY.wake, () => this.advance())
    });

    this.time.addEvent({ delay: 15000, loop: true, callback: () => this.sendTram() });
    this.time.delayedCall(6000, () => this.sendTram());
  }

  /* ── 하늘과 멀리 보이는 도시 ─────────────────── */
  buildSky() {
    const W = GAME.WIDTH;
    this.skyDay = this.add.image(W / 2, 0, 'sky_day').setOrigin(0.5, 0)
      .setDisplaySize(W, 500).setScrollFactor(0).setDepth(-30);
    this.skyNight = this.add.image(W / 2, 0, 'sky_milan_night').setOrigin(0.5, 0)
      .setDisplaySize(W, 500).setScrollFactor(0).setDepth(-29).setAlpha(0);

    this.stars = [];
    for (let i = 0; i < 30; i++) {
      const s = this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(14, 300), 'dot')
        .setScale(Phaser.Math.FloatBetween(0.14, 0.34))
        .setScrollFactor(0).setDepth(-28).setAlpha(0);
      this.stars.push(s);
    }

    /* 멀리 흐르는 도시 — 걷는 만큼 아주 조금 움직입니다 */
    for (let i = 0; i < 5; i++) {
      this.add.image(i * 352, 424, 'skyline_far').setOrigin(0, 1)
        .setScrollFactor(0.32).setDepth(-26).setAlpha(0.7);
    }
    this.add.image(250, 400, 'duomo_far').setOrigin(0.5, 1)
      .setScrollFactor(0.32).setDepth(-25).setAlpha(0.85).setScale(1.15);

    /* 아침 구름 */
    this.clouds = [];
    for (let i = 0; i < 5; i++) {
      const cw = Phaser.Math.Between(90, 150);
      const c = this.add.container(Phaser.Math.Between(0, W), Phaser.Math.Between(46, 168))
        .setScrollFactor(0).setDepth(-27).setAlpha(0.5);
      c.add([
        this.add.ellipse(0, 0, cw, cw * 0.36, 0xffffff, 0.85),
        this.add.ellipse(-cw * 0.2, -cw * 0.09, cw * 0.5, cw * 0.34, 0xffffff, 0.85),
        this.add.ellipse(cw * 0.22, -cw * 0.05, cw * 0.42, cw * 0.28, 0xffffff, 0.85)
      ]);
      this.clouds.push(c);
    }
  }

  /* ── 도로와 인도 ─────────────────────────────── */
  buildStreet() {
    const WORLD_W = this.WORLD_W, H = GAME.HEIGHT;
    const ROAD_TOP = 466, CURB = 522, WALK = 540;

    const g = this.add.graphics().setDepth(-20);
    g.fillStyle(0x6b6f78, 1); g.fillRect(0, ROAD_TOP, WORLD_W, CURB - ROAD_TOP);
    g.fillStyle(0x777b84, 1); g.fillRect(0, ROAD_TOP, WORLD_W, 8);

    /* 전차 레일 */
    g.fillStyle(0x8f949c, 1);
    g.fillRect(0, ROAD_TOP + 24, WORLD_W, 3);
    g.fillRect(0, ROAD_TOP + 40, WORLD_W, 3);

    /* 연석과 인도 */
    g.fillStyle(0xbdb4a4, 1); g.fillRect(0, CURB, WORLD_W, WALK - CURB);
    g.fillStyle(0xd6ccb8, 1); g.fillRect(0, WALK, WORLD_W, H - WALK);
    g.lineStyle(1, 0xc4b9a4, 1);
    for (let x = 0; x < WORLD_W; x += 44) g.lineBetween(x, WALK, x, H);
    for (let y = WALK + 48; y < H; y += 48) g.lineBetween(0, y, WORLD_W, y);

    /* 건물이 인도에 드리우는 그늘 */
    g.fillStyle(0x8f8571, 0.16);
    for (let x = 0; x < WORLD_W; x += 210) g.fillRect(x, WALK, 132, 46);
    g.fillStyle(0x8f8571, 0.09);
    g.fillRect(0, WALK, WORLD_W, 18);

    /* 인도의 얼룩과 빛 */
    for (let i = 0; i < 320; i++) {
      g.fillStyle(i % 4 === 0 ? 0xffffff : 0xb2a893, 0.14);
      g.fillCircle(Phaser.Math.Between(0, WORLD_W), Phaser.Math.Between(WALK + 6, H - 6),
        Phaser.Math.FloatBetween(1, 3));
    }

    /* 낙엽과 자잘한 자국 — 아래쪽이 비어 보이지 않도록 */
    for (let i = 0; i < 90; i++) {
      const lx = Phaser.Math.Between(0, WORLD_W), ly = Phaser.Math.Between(672, H - 10);
      g.fillStyle(0xc0ad8b, 0.5);
      g.fillEllipse(lx, ly, Phaser.Math.Between(5, 11), Phaser.Math.Between(3, 6));
    }

    this.roadY = ROAD_TOP + 30;

    /* 저녁이 오면 덮이는 푸른 장막 */
    this.veil = this.add.rectangle(0, 0, GAME.WIDTH, H, 0x16233f)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(760).setAlpha(0);
  }

  /* ── 건물과 가로등 ───────────────────────────── */
  buildBuildings() {
    const BASE = 472;
    this.addProp(180, BASE, 'apart_milan', { scale: 1.0, depth: 300 });
    this.addProp(520, BASE, 'church_milan', { scale: 1.05, depth: 302 });
    this.addProp(1080, BASE, 'school_milan', { scale: 1.0, depth: 300 });
    this.addProp(1650, BASE, 'apart_milan', { scale: 1.0, depth: 300 });
    this.addProp(2680, BASE, 'apart_milan', { scale: 1.02, depth: 300 });

    /* 사이를 메우는 낮은 건물들 */
    [[340, 0xe0c9a8], [760, 0xd6bfa0], [900, 0xe6d2b0], [1330, 0xdcc3a2],
     [1480, 0xe4cda9], [1880, 0xd9c09f], [2050, 0xe6d4b4], [2420, 0xdcc4a4],
     [2540, 0xe2cba8], [2860, 0xd8bf9e]].forEach((cfg) => {
      const x = cfg[0], color = cfg[1];
      const g = this.add.graphics().setDepth(280);
      const h = 120 + ((x * 7) % 60);
      g.fillStyle(color, 1); g.fillRoundedRect(x - 56, BASE - h, 112, h, 4);
      g.fillStyle(0x000000, 0.07); g.fillRect(x - 56, BASE - h, 112, 7);
      for (let r = 0; r < 2; r++) {
        for (let i = 0; i < 3; i++) {
          g.fillStyle(0x7d5c40, 1); g.fillRoundedRect(x - 42 + i * 30, BASE - h + 22 + r * 44, 20, 26, 3);
          g.fillStyle(0xf6d79a, 0.85); g.fillRoundedRect(x - 39 + i * 30, BASE - h + 25 + r * 44, 14, 20, 2);
        }
      }
    });

    /* 밤이 되면 켜지는 가로등 */
    this.lampGlows = [];
    [260, 700, 1200, 1740, 2130, 2600].forEach((x) => {
      this.addProp(x, 548, 'streetlamp', { scale: 1.25, depth: 540 });
      const glow = this.add.image(x, 452, 'lamp_glow').setDepth(541).setAlpha(0).setScale(1.15);
      this.lampGlows.push(glow);
    });

    /* 광장 — 밤에 사람들이 앉아 있는 자리 */
    this.addProp(2252, 542, 'fountain_city', { scale: 1.15, depth: 522 });
    this.addProp(2352, 570, 'bench', { scale: 1.1, depth: 570 });
  }

  /* ── 등장인물 ────────────────────────────────── */
  buildPeople() {
    /* 학교 앞 — 괴롭히는 아이들과 친구 */
    this.friend = this.add.sprite(1148, 600, 'friend_front').setOrigin(0.5, 0.86).setDepth(600).setScale(1.12);
    this.friendShadow = this.add.image(1148, 603, 'shadow').setDepth(599).setAlpha(0.4).setScale(1.05);
    this.bullies = [
      this.add.sprite(1196, 590, 'bully_a').setOrigin(0.5, 0.86).setDepth(590).setScale(1.1),
      this.add.sprite(1232, 612, 'bully_b').setOrigin(0.5, 0.86).setDepth(612).setScale(1.1)
    ];
    this.bullies.forEach((b, i) => {
      this.tweens.add({ targets: b, y: b.y - 4, duration: 800 + i * 130, yoyo: true, repeat: -1 });
    });

    /* 집 앞 — 어머니. 밤에 나타납니다 */
    this.mom = this.add.sprite(2724, 604, 'mom_front').setOrigin(0.5, 0.86).setDepth(604).setScale(1.12).setAlpha(0);
    this.momShadow = this.add.image(2724, 607, 'shadow').setDepth(603).setAlpha(0).setScale(1.05);

    /* 개 한 마리 */
    this.dog = this.add.image(660, 626, 'dog_small').setDepth(626).setScale(1.05);
    this.tweens.add({ targets: this.dog, y: 622, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  /* ── 걷다가 살펴볼 수 있는 것들 ───────────────── */
  createDecor() {
    this.addProp(430, 588, 'tree_city', { scale: 1.15, depth: 588 });
    this.addProp(1560, 588, 'tree_city', { scale: 1.1, depth: 588 });
    this.addProp(2480, 588, 'tree_city', { scale: 1.05, depth: 588 });

    this.addInteractable({
      id: 'md_tree', x: 430, y: 596, label: '가로수', range: 66, marker: false,
      onInteract: () => this.look('tree', 'md_tree')
    });
    this.addInteractable({
      id: 'md_dog', x: 660, y: 630, label: '개', range: 70,
      onInteract: () => {
        this.look('dog', 'md_dog');
        this.tweens.add({ targets: this.dog, y: this.dog.y - 10, duration: 220, yoyo: true, repeat: 2 });
      }
    });
    this.addInteractable({
      id: 'md_poster', x: 1340, y: 584, texture: 'poster_wall', label: '포스터', scale: 1.15, markerY: 512,
      onInteract: () => this.look('poster', 'md_poster')
    });
    this.bikeItem = this.addInteractable({
      id: 'md_bike', x: 1780, y: 622, texture: 'bike_city', label: '자전거 타기',
      scale: 1.15, range: 76, markerY: 580,
      onInteract: () => this.mountBike()
    });
    this.addInteractable({
      id: 'md_fountain', x: 2252, y: 570, label: '분수', range: 76, markerY: 502,
      onInteract: () => this.look('fountain', 'md_fountain')
    });
    this.addInteractable({
      id: 'md_lamp', x: 2600, y: 578, label: '가로등', range: 62, marker: false,
      onInteract: () => this.look('lamp', 'md_lamp')
    });
    this.addInteractable({
      id: 'md_tram', x: 980, y: 566, label: '선로', range: 66, marker: false,
      onInteract: () => { AudioSystem.tram(); this.look('tram', 'md_tram'); }
    });

    /* 비둘기들 */
    this.pigeons = [];
    [[2150, 648], [2185, 662], [2245, 644]].forEach((p) => {
      const b = this.add.image(p[0], p[1], 'pigeon').setDepth(p[1]).setScale(1.1);
      this.pigeons.push(b);
      this.tweens.add({ targets: b, y: p[1] - 4, duration: Phaser.Math.Between(600, 1000), yoyo: true, repeat: -1 });
    });
    this.addInteractable({
      id: 'md_pigeon', x: 2185, y: 656, label: '비둘기', range: 68, marker: false,
      onInteract: () => {
        this.look('pigeon', 'md_pigeon');
        this.pigeons.forEach((b, i) => this.tweens.add({
          targets: b, y: b.y - 30, x: b.x + Phaser.Math.Between(-30, 30),
          alpha: 0.6, duration: 700, delay: i * 90, yoyo: true
        }));
      }
    });
    this.addInteractable({
      id: 'md_window', x: 1950, y: 566, label: '창문', range: 64, marker: false,
      onInteract: () => this.look('window', 'md_window')
    });
  }

  /* ── 축구공 — 발에 닿으면 굴러갑니다 ────────── */
  createBall() {
    this.ball = this.physics.add.image(860, 664, 'soccer_ball').setScale(1.2).setDepth(664);
    this.ball.body.setCircle(11, 1, 1);
    this.ball.setBounce(0.7).setDrag(150).setAngularDrag(150).setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.ball, () => this.kickBall());
  }

  kickBall() {
    const now = this.time.now;
    if (now - (this._kickAt || 0) < 170) return;
    this._kickAt = now;

    const a = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.ball.x, this.ball.y);
    const v = this.player.body.velocity;
    const run = Math.sqrt(v.x * v.x + v.y * v.y);
    const power = 165 + run * (this.riding ? 1.15 : 0.95);
    this.ball.setVelocity(Math.cos(a) * power, Math.sin(a) * power);
    this.ball.setAngularVelocity(Phaser.Math.Between(-380, 380));
    AudioSystem.kick();

    if (!this._ballTouched) {
      this._ballTouched = true;
      this.noteFound('md_ball');
      AudioSystem.found();
      this.floatText(this.ball.x, this.ball.y - 44, CARLO_DAY.objects.ball[1]);
    }
  }

  /* ── 자전거 ─────────────────────────────────── */
  mountBike() {
    if (this.riding) return;
    this.riding = true;
    this.walkSpeed = 188;
    this.stepGap = 380;
    this.stepSound = function () { AudioSystem.bikeTick(); };

    this.bikeItem.enabled = false;
    if (this.bikeItem.image) this.bikeItem.image.setVisible(false);
    if (this.bikeItem.marker) this.bikeItem.marker.setVisible(false);

    this.rideSprite = this.add.image(this.player.x, this.player.y + 7, 'bike_city')
      .setScale(1.15).setDepth(this.player.y - 1);
    AudioSystem.select();
    this.noteFound('md_bike');
    this.notice('자전거를 탔다. 다시 누르면 내립니다.');
  }

  dismountBike() {
    if (!this.riding) return;
    this.riding = false;
    this.walkSpeed = 104;
    this.stepGap = 0;
    this.stepSound = null;

    if (this.rideSprite) { this.rideSprite.destroy(); this.rideSprite = null; }

    /* 세워 둔 자리에 다시 놓입니다 */
    const bx = Phaser.Math.Clamp(this.player.x + 30, 60, this.WORLD_W - 60);
    const by = Phaser.Math.Clamp(this.player.y, 570, 716);
    this.bikeItem.x = bx; this.bikeItem.y = by;
    if (this.bikeItem.image) {
      this.bikeItem.image.setPosition(bx, by).setDepth(by).setVisible(true);
    }
    if (this.bikeItem.marker) this.bikeItem.marker.destroy();
    this.bikeItem.marker = UI.marker(this, bx, by - 46).setDepth(700);
    this.bikeItem.marker.setAlpha(0.9);
    this.bikeItem.enabled = true;

    AudioSystem.back();
    this.notice('자전거에서 내렸다.');
  }

  /* 자전거를 탄 채로는 다른 것을 할 수 없습니다 */
  tryInteract() {
    if (this.inputLocked) return;
    if (this.riding) { this.dismountBike(); return; }
    super.tryInteract();
  }

  /* ── 화면에 잠깐 떠오르는 안내 ───────────────── */
  notice(msg) {
    const W = GAME.WIDTH;
    if (this._notice) { this._notice.destroy(); this._notice = null; }
    const c = this.add.container(W / 2, 152).setDepth(886).setScrollFactor(0);
    const t = this.add.text(0, 0, msg, UI.style(FONT.small, PAL.cream, { align: 'center' })).setOrigin(0.5);
    const g = this.add.graphics();
    const w = Math.min(W - 36, t.width + 34);
    g.fillStyle(0x1c2740, 0.72); g.fillRoundedRect(-w / 2, -19, w, 38, 19);
    c.add([g, t]);
    c.setAlpha(0);
    this._notice = c;
    this.tweens.add({ targets: c, alpha: 1, duration: 240 });
    this.time.delayedCall(2400, () => {
      this.tweens.add({
        targets: c, alpha: 0, duration: 500,
        onComplete: () => { c.destroy(); if (this._notice === c) this._notice = null; }
      });
    });
  }

  /* 세상 위에 잠깐 떠올랐다 사라지는 글 */
  floatText(x, y, msg) {
    const t = this.add.text(x, y, msg,
      UI.style(FONT.small, PAL.cream, { align: 'center', wordWrap: { width: 250 } }))
      .setOrigin(0.5).setDepth(872);
    const g = this.add.graphics().setDepth(871);
    g.fillStyle(0x1c2740, 0.66);
    g.fillRoundedRect(x - t.width / 2 - 13, y - t.height / 2 - 8, t.width + 26, t.height + 16, 15);
    this.tweens.add({
      targets: [t, g], alpha: 0, y: '-=28', duration: 1900, delay: 900,
      onComplete: () => { t.destroy(); g.destroy(); }
    });
  }

  look(key, id) {
    const lines = CARLO_DAY.objects[key] || ['…'];
    const before = SaveSystem.get('found', []).length;
    this.noteFound(id);
    if (SaveSystem.get('found', []).length > before) AudioSystem.found();
    this.dialogue.say(lines);
  }

  /* ── 하루의 순서 ─────────────────────────────── */
  createStops() {
    const O = CARLO_DAY.objectives;
    this.stops = [
      { x: 520, y: 592, markerY: 470, label: '성당', obj: O.church, run: () => this.doChurch() },
      { x: 1096, y: 592, markerY: 480, label: '학교 앞', obj: O.school, run: () => this.doSchool() },
      { x: 1650, y: 592, markerY: 480, label: '집', obj: O.home, run: () => this.doHome() },
      { x: 2210, y: 600, markerY: 480, label: '역 앞', obj: O.night, run: () => this.doNight() },
      { x: 2700, y: 600, markerY: 480, label: '집 앞', obj: O.last, run: () => this.doLast() }
    ];

    this.stopItems = this.stops.map((s, i) => {
      const it = this.addInteractable({
        id: 'stop_' + i, x: s.x, y: s.y, label: s.label, range: 84,
        markerY: s.markerY, priority: 2, once: true,
        onInteract: () => { this.setInputLocked(true); s.run(); }
      });
      it.enabled = false;
      if (it.marker) it.marker.setVisible(false);
      return it;
    });
  }

  advance() {
    this.stage++;
    if (this.stage >= this.stops.length) { this.finishDay(); return; }
    const s = this.stops[this.stage];
    const it = this.stopItems[this.stage];
    it.enabled = true;
    if (it.marker) it.marker.setVisible(true);
    this.objective.setVisible(true).setText(s.obj);
    this.setInputLocked(false);
    AudioSystem.chime();
  }

  /* ── 1 · 성당 ───────────────────────────────── */
  doChurch() {
    const C = CARLO_DAY.church;
    this.dialogue.play(C.arrive, () => {
      this.showVignette('adoration', C.adoration, () => {
        Collection.award(this, 'c6', () => {
          this.dialogue.play(C.after, () => this.advance());
        });
      });
    });
  }

  /* ── 2 · 학교 ───────────────────────────────── */
  doSchool() {
    const S = CARLO_DAY.school;
    this.cameras.main.stopFollow();
    this.cameras.main.pan(1190, 520, 900, 'Sine.easeInOut');
    this.dialogue.play(S.arrive, () => {
      this.dialogue.choose(S.prompt, S.choices, (key) => {
        SaveSystem.set('reflections.carloSchoolChoice', key);
        const reply = S.reply[key] || [];
        this.dialogue.play(reply.concat(S.body), () => {
          this.walkWithFriend(() => {
            Collection.award(this, 'b10', () => {
              this.dialogue.play(S.after, () => {
                this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
                this.advance();
              });
            });
          });
        });
      });
    });
  }

  walkWithFriend(onDone) {
    /* 괴롭히던 아이들은 흩어지고, 친구와 함께 걷습니다 */
    this.bullies.forEach((b, i) => {
      this.tweens.add({
        targets: b, x: b.x + 150 + i * 40, alpha: 0, duration: 1400, delay: i * 200, ease: 'Sine.easeIn'
      });
    });
    this.player.setPosition(1120, 604);
    this.tweens.add({
      targets: [this.friend, this.friendShadow], x: 1084, y: 606, duration: 900, ease: 'Sine.easeInOut',
      onComplete: () => {
        this.friend.setTexture('friend_back');
        this.tweens.add({
          targets: [this.friend, this.friendShadow], x: 1010, duration: 2200, ease: 'Sine.easeInOut'
        });
        this.tweens.add({
          targets: this.player, x: 1046, duration: 2200, ease: 'Sine.easeInOut',
          onComplete: () => { if (onDone) onDone(); }
        });
      }
    });
  }

  /* ── 3 · 집 · 컴퓨터와 한 시간의 게임 ─────────── */
  doHome() {
    this.dialogue.play(CARLO_DAY.home.arrive, () => this.openMiniGame('MiracleMapScene'));
  }

  onMiniGameDone(key) {
    const Hm = CARLO_DAY.home;
    this.setInputLocked(true);
    if (key === 'MiracleMapScene') {
      this.time.delayedCall(400, () => {
        this.dialogue.play(Hm.afterMap, () => {
          this.dialogue.play(Hm.beforeGame, () => this.openMiniGame('FortressScene'));
        });
      });
    } else if (key === 'FortressScene') {
      this.time.delayedCall(400, () => {
        AudioSystem.alarm();
        this.dialogue.play(Hm.afterGame, () => {
          Collection.award(this, 'c7', () => this.nightfall(() => this.advance()));
        });
      });
    } else if (key === 'NightShareScene') {
      this.time.delayedCall(400, () => {
        this.dialogue.play(CARLO_DAY.night.after, () => this.advance());
      });
    } else {
      this.setInputLocked(false);
    }
  }

  /* 낮이 저물고 도시에 불이 켜집니다 */
  nightfall(onDone) {
    if (this.isNight) { if (onDone) onDone(); return; }
    this.isNight = true;
    AudioSystem.bell();

    this.tweens.add({ targets: this.skyNight, alpha: 1, duration: 3200 });
    this.tweens.add({ targets: this.skyDay, alpha: 0.25, duration: 3200 });
    this.tweens.add({ targets: this.clouds, alpha: 0.08, duration: 2600 });
    this.tweens.add({ targets: this.veil, alpha: 0.5, duration: 3200 });
    this.tweens.add({ targets: this.lampGlows, alpha: 0.55, duration: 2400, delay: 900 });
    this.stars.forEach((s, i) => {
      this.tweens.add({
        targets: s, alpha: Phaser.Math.FloatBetween(0.35, 0.85),
        duration: 2200, delay: 1000 + i * 40
      });
    });

    UI.caption(this, ['해가 졌다.'], { y: GAME.HEIGHT * 0.3, hold: 1200, onDone: onDone });
  }

  /* ── 4 · 밤거리 ─────────────────────────────── */
  doNight() {
    this.dialogue.play(CARLO_DAY.night.arrive, () => this.openMiniGame('NightShareScene'));
  }

  /* ── 5 · 집 앞 · 어머니와 밤하늘 ─────────────── */
  doLast() {
    const L = CARLO_DAY.last;
    this.tweens.add({ targets: [this.mom, this.momShadow], alpha: 1, duration: 900 });
    this.momShadow.setAlpha(0.4);
    this.cameras.main.stopFollow();
    this.cameras.main.pan(2712, 540, 900, 'Sine.easeInOut');
    this.time.delayedCall(700, () => {
      this.dialogue.play(L.arrive, () => {
        this.dialogue.play(L.mother, () => {
          this.showVignette('stars', L.stars, () => {
            Collection.award(this, 'c8', () => this.finishDay());
          });
        });
      });
    });
  }

  finishDay() {
    if (this._done) return;
    this._done = true;
    Collection.award(this, 'c9', () => {
      this.setHudVisible(false);
      if (this.stick) this.stick.reset();
      this.showVignette('beach', CARLO_DAY.back, () => this.toPrayer(), { keep: true });
    });
  }

  toPrayer() {
    SaveSystem.set('carloDayDone', true);
    AudioSystem.bell();
    AudioSystem.setAmbience('beach');
    if (this.stick) this.stick.destroy();
    UI.fadeOut(this, 1600, () => this.scene.start('PrayerScene'), [12, 20, 40]);
  }

  /* ── 화면을 잠시 덮는 짧은 연출 ───────────────── */
  showVignette(kind, lines, onDone, opt) {
    opt = opt || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    if (this.stick) this.stick.reset();
    this.setHudVisible(false);

    const layer = this.add.container(0, 0).setDepth(950).setScrollFactor(0).setAlpha(0);
    if (kind === 'adoration') this.paintAdoration(layer);
    else if (kind === 'stars') this.paintStars(layer);
    else this.paintBeach(layer);

    const cap = kind === 'adoration' ? CARLO_DAY.vignette.adorationCaption
      : (kind === 'stars' ? CARLO_DAY.vignette.starsCaption : '');
    if (cap) {
      const t = this.add.text(W / 2, 64, cap, UI.style(FONT.small, PAL.cream, { align: 'center' }))
        .setOrigin(0.5).setScrollFactor(0).setAlpha(0.8);
      layer.add(t);
    }

    const fadeMs = kind === 'beach' ? 1600 : 1000;
    this.tweens.add({
      targets: layer, alpha: 1, duration: fadeMs,
      onComplete: () => {
        this.dialogue.play(lines, () => {
          if (opt.keep) { if (onDone) onDone(); return; }
          this.tweens.add({
            targets: layer, alpha: 0, duration: 900,
            onComplete: () => {
              layer.destroy();
              this.setHudVisible(true);
              if (onDone) onDone();
            }
          });
        });
      }
    });
    return layer;
  }

  /* 성당 안 — 성체 앞 */
  paintAdoration(layer) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const g = this.add.graphics().setScrollFactor(0);
    g.fillStyle(0x2a2038, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0x3a2c44, 1); g.fillRect(0, 0, W, 120);
    /* 기둥과 아치 */
    g.fillStyle(0x3d3050, 1);
    [-40, W + 40].forEach((x) => { g.fillRect(x - 46, 0, 92, H); });
    g.fillStyle(0x352a48, 1);
    g.fillRect(0, H - 210, W, 210);
    /* 제대 */
    g.fillStyle(0x4a3a58, 1); g.fillRoundedRect(W / 2 - 116, 420, 232, 90, 8);
    g.fillStyle(0xf3ece2, 0.9); g.fillRoundedRect(W / 2 - 124, 414, 248, 20, 6);
    /* 아치와 스테인드글라스 */
    [[74, 244], [W - 74, 244]].forEach((p) => {
      g.fillStyle(0x4a3a5e, 1);
      g.fillRoundedRect(p[0] - 40, p[1] - 128, 80, 250, 14);
      g.fillStyle(0x6f5b8a, 1);
      g.fillRoundedRect(p[0] - 30, p[1] - 112, 60, 220, 8);
      g.slice(p[0], p[1] - 108, 30, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false); g.fillPath();
      g.fillStyle(0x9b78b4, 0.85); g.fillRoundedRect(p[0] - 22, p[1] - 96, 44, 60, 14);
      g.fillStyle(0xc98a6a, 0.8); g.fillRoundedRect(p[0] - 22, p[1] - 30, 44, 56, 8);
      g.fillStyle(0x7fa0c4, 0.8); g.fillRoundedRect(p[0] - 22, p[1] + 32, 44, 56, 8);
      g.lineStyle(3, 0x3d3050, 1);
      g.strokeRoundedRect(p[0] - 30, p[1] - 112, 60, 220, 8);
      g.lineBetween(p[0], p[1] - 100, p[0], p[1] + 92);
    });

    /* 신자석 */
    g.fillStyle(0x4a3a2c, 1);
    for (let i = 0; i < 2; i++) {
      const y = 596 + i * 74;
      g.fillRoundedRect(-10, y, W + 20, 16, 6);
      g.fillRoundedRect(-10, y + 16, W + 20, 40, 4);
      g.fillStyle(0x5c4839, 1); g.fillRoundedRect(-10, y + 16, W + 20, 8, 4);
      g.fillStyle(0x4a3a2c, 1);
    }
    layer.add(g);

    const glow = this.add.image(W / 2, 356, 'lamp_glow').setScrollFactor(0)
      .setDisplaySize(250, 250).setTint(0xffdca8).setAlpha(0.42);
    this.tweens.add({ targets: glow, alpha: 0.6, scale: glow.scale * 1.06, duration: 3600, yoyo: true, repeat: -1 });
    layer.add(glow);

    const mon = this.add.image(W / 2, 414, 'monstrance').setOrigin(0.5, 1).setScrollFactor(0).setScale(1.5);
    layer.add(mon);

    /* 촛불 */
    [W / 2 - 96, W / 2 + 96].forEach((x, i) => {
      const c = this.add.graphics().setScrollFactor(0);
      c.fillStyle(0xf3ece2, 1); c.fillRoundedRect(x - 5, 372, 10, 44, 3);
      layer.add(c);
      const fl = this.add.image(x, 366, 'spark').setScrollFactor(0).setScale(1.1).setTint(0xffd08a);
      this.tweens.add({ targets: fl, scaleY: 1.5, alpha: 0.7, duration: 420 + i * 90, yoyo: true, repeat: -1 });
      layer.add(fl);
    });

    /* 무릎 꿇은 뒷모습 — 나 자신 */
    const me = this.add.image(W / 2, 604, 'carlo_back').setScrollFactor(0).setScale(2.0).setOrigin(0.5, 1);
    layer.add(me);
    this.tweens.add({ targets: me, y: 608, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    /* 먼지 속의 빛 */
    for (let i = 0; i < 14; i++) {
      const d = this.add.circle(Phaser.Math.Between(60, W - 60), Phaser.Math.Between(200, 560),
        Phaser.Math.FloatBetween(1, 2.4), 0xffe6bb, 0.5).setScrollFactor(0);
      this.tweens.add({
        targets: d, y: d.y - Phaser.Math.Between(40, 90), alpha: 0.05,
        duration: Phaser.Math.Between(4000, 8000), yoyo: true, repeat: -1, delay: i * 220
      });
      layer.add(d);
    }
  }

  /* 창밖의 밤하늘 */
  paintStars(layer) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const img = this.add.image(W / 2, 0, 'sky_milan_night').setOrigin(0.5, 0)
      .setDisplaySize(W, H).setScrollFactor(0);
    layer.add(img);

    const neb = this.add.image(W / 2, H * 0.34, 'nebula').setScrollFactor(0)
      .setDisplaySize(W * 1.3, 320).setAlpha(0.22).setTint(0xbcd0ff);
    layer.add(neb);

    for (let i = 0; i < 80; i++) {
      const s = this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(20, H * 0.62), 'dot')
        .setScrollFactor(0).setScale(Phaser.Math.FloatBetween(0.12, 0.36))
        .setAlpha(Phaser.Math.FloatBetween(0.25, 0.9));
      this.tweens.add({
        targets: s, alpha: 0.1, duration: Phaser.Math.Between(1600, 3800), yoyo: true, repeat: -1
      });
      layer.add(s);
    }

    /* 창틀 */
    const g = this.add.graphics().setScrollFactor(0);
    g.fillStyle(0x1a1420, 1);
    g.fillRect(0, 0, 26, H); g.fillRect(W - 26, 0, 26, H);
    g.fillRect(0, 0, W, 22); g.fillRect(0, H * 0.62, W, H);
    g.fillStyle(0x241c2c, 1); g.fillRect(W / 2 - 6, 0, 12, H * 0.62);
    layer.add(g);

    /* 창가에 놓인 도시의 불빛 */
    const city = this.add.graphics().setScrollFactor(0);
    city.fillStyle(0x241f33, 1);
    for (let x = 26; x < W - 26; x += 46) {
      const h = 40 + ((x * 13) % 60);
      city.fillRect(x, H * 0.62 - h, 40, h);
    }
    city.fillStyle(0xf6d79a, 0.8);
    for (let i = 0; i < 26; i++) {
      city.fillRect(Phaser.Math.Between(30, W - 40), H * 0.62 - Phaser.Math.Between(8, 78), 5, 6);
    }
    layer.add(city);

    const me = this.add.image(W / 2 - 74, 646, 'carlo_back').setScrollFactor(0).setScale(2.2).setOrigin(0.5, 1);
    layer.add(me);
    this.tweens.add({ targets: me, y: 642, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  /* 돌아온 해변 */
  paintBeach(layer) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const SEA_TOP = H * 0.44, SAND = H * 0.62;

    const sky = this.add.image(W / 2, 0, 'sky_night').setOrigin(0.5, 0)
      .setDisplaySize(W, SEA_TOP + 6).setScrollFactor(0);
    layer.add(sky);

    const dawn = this.add.image(W / 2, SEA_TOP, 'lamp_glow').setScrollFactor(0)
      .setDisplaySize(W * 1.6, 190).setTint(0xffc79a).setAlpha(0.55);
    this.tweens.add({ targets: dawn, alpha: 0.75, duration: 5200, yoyo: true, repeat: -1 });
    layer.add(dawn);

    const g = this.add.graphics().setScrollFactor(0);
    g.fillStyle(0x1d3a58, 1); g.fillRect(0, SEA_TOP, W, SAND - SEA_TOP);
    g.fillStyle(0x2f6b8f, 0.45); g.fillRect(0, SEA_TOP, W, 22);
    g.fillStyle(0xe6c9a6, 0.24); g.fillRect(0, SEA_TOP, W, 9);
    g.fillStyle(0xa9b8ca, 1); g.fillRect(0, SAND, W, H - SAND);
    g.fillStyle(0x93a4ba, 0.7); g.fillRect(0, SAND, W, 18);
    for (let i = 0; i < 200; i++) {
      g.fillStyle(i % 3 === 0 ? 0xffffff : 0x7d8ea4, 0.15);
      g.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(SAND + 12, H - 6), Phaser.Math.FloatBetween(0.8, 2));
    }
    layer.add(g);

    for (let i = 0; i < 3; i++) {
      const f = this.add.image(Phaser.Math.Between(60, W - 60), SAND - 30 - i * 26, 'seafoam')
        .setScrollFactor(0).setDisplaySize(Phaser.Math.Between(150, 250), 11).setAlpha(0.3 + i * 0.08);
      this.tweens.add({
        targets: f, y: f.y + 20, alpha: 0.1, duration: 3400 + i * 500,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 400
      });
      layer.add(f);
    }

    const me = this.add.image(W / 2 - 34, SAND + 108, 'player_back').setScrollFactor(0).setScale(1.5).setOrigin(0.5, 1);
    const ca = this.add.image(W / 2 + 34, SAND + 112, 'carlo_back').setScrollFactor(0).setScale(1.5).setOrigin(0.5, 1);
    this.tweens.add({ targets: [me, ca], y: '-=4', duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    layer.add([me, ca]);
  }

  /* ── 지나가는 전차 ───────────────────────────── */
  sendTram() {
    if (!this.player || this._done) return;
    const fromLeft = Math.random() < 0.5;
    const y = this.roadY - 6;
    const tram = this.add.image(fromLeft ? -180 : this.WORLD_W + 180, y, 'tram_milan')
      .setOrigin(0.5, 0.9).setDepth(460).setScale(1.05).setFlipX(!fromLeft);
    if (this.isNight) tram.setTint(0xa9b6cc);
    AudioSystem.tram();
    this.tweens.add({
      targets: tram, x: fromLeft ? this.WORLD_W + 200 : -200,
      duration: 16000, ease: 'Sine.easeInOut',
      onComplete: () => tram.destroy()
    });
  }

  update(time, delta) {
    this.updateWorld(time, delta);

    if (this.ball) this.ball.setDepth(this.ball.y);

    if (this.riding && this.rideSprite && this.player) {
      this.rideSprite.setPosition(this.player.x, this.player.y + 7).setDepth(this.player.y - 1);
      this.rideSprite.setFlipX(this.player.flipX);

      if (this.actionBtn && !this.inputLocked) {
        this.actionBtn.setVisible(true);
        this.actionLabel.setVisible(true).setText('내리기');
      }
      /* 다른 것에 다가가면, 내려야 한다고 알려줍니다 */
      if (this.nearTarget && this.nearTarget !== this.bikeItem &&
          time - (this._rideNoteAt || 0) > 4200) {
        this._rideNoteAt = time;
        this.notice('자전거에서 내려야 할 수 있어요.');
      }
    }

    if (this.clouds) {
      this.clouds.forEach((c, i) => {
        c.x += 0.06 + i * 0.02;
        if (c.x > GAME.WIDTH + 140) c.x = -140;
      });
    }
  }
};
