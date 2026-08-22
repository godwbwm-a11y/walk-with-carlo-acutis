/* DAY 5 · 화요일 아침 — 눈을 뜨니 2027년 8월 3일, 서울 지하철 안. */

window.Day5SubwayScene = class Day5SubwayScene extends WorldScene {
  constructor() { super('Day5SubwayScene'); }

  create(data) {
    data = data || {};
    this.initWorld({ width: 900, height: GAME.HEIGHT, speed: 100 });
    SaveSystem.checkpoint('Day5SubwayScene', {});
    AudioSystem.unlock();
    AudioSystem.setAmbience('city');

    const W = GAME.WIDTH, H = GAME.HEIGHT, D = DAY05.subway;
    this.flags = { phone: false, crowd: false, way: false, carlo: false };

    /* 전동차 안 */
    this.add.tileSprite(450, 210, 900, 420, 'train_wall').setDepth(0);
    this.add.tileSprite(450, 632, 900, 424, 'train_floor').setDepth(0);
    const line = this.add.graphics().setDepth(1);
    line.fillStyle(0x8fa2b8, 1); line.fillRect(0, 414, 900, 10);

    [96, 316, 536, 756].forEach((x) => {
      this.add.image(x, 214, 'train_window').setDepth(2).setScale(1.08);
    });
    [206, 426, 646, 862].forEach((x) => {
      this.add.image(x, 104, 'hand_strap').setDepth(3).setScale(0.95).setAlpha(0.9);
    });
    /* 벽에 붙은 WYD 안내와 광고판 */
    const ads = this.add.graphics().setDepth(2);
    [[60, 300], [250, 296], [470, 302], [670, 296]].forEach((a, i) => {
      ads.fillStyle([0xe0954a, 0x3f6f8f, 0x7a5f8a, 0x4f7d6a][i], 0.9);
      ads.fillRoundedRect(a[0], a[1], 130, 62, 8);
      ads.fillStyle(0xfff8ec, 0.85);
      ads.fillRect(a[0] + 14, a[1] + 16, 74, 7);
      ads.fillRect(a[0] + 14, a[1] + 30, 50, 7);
      ads.fillRect(a[0] + 14, a[1] + 44, 62, 7);
    });

    this.add.image(180, 392, 'train_seat').setDepth(392).setScale(1.04);
    this.add.image(620, 392, 'train_seat').setDepth(392).setScale(1.04);
    this.add.image(846, 336, 'train_door').setDepth(336).setScale(1.06);
    this.add.image(430, 96, 'subway_sign').setDepth(6).setScale(0.92);

    /* 순례자들 */
    this.crowdImgs = [];
    const crowd = [
      [122, 500, 'pilgrim_a'], [244, 486, 'pilgrim_c'], [360, 508, 'pilgrim_b'],
      [478, 492, 'pilgrim_d'], [600, 506, 'pilgrim_e'], [706, 490, 'pilgrim_f'],
      [790, 508, 'pilgrim_a']
    ];
    crowd.forEach((c) => {
      const img = this.add.image(c[0], c[1], c[2]).setDepth(c[1]).setScale(1.2);
      this.tweens.add({ targets: img, y: c[1] - 3, duration: 800 + Math.random() * 400, yoyo: true, repeat: -1 });
      this.crowdImgs.push(img);
    });
    this.italian = this.add.image(724, 560, 'pilgrim_e').setDepth(560).setScale(1.24);

    /* 살펴볼 것들 — 걸어다니는 줄에 서서 위쪽을 바라봅니다 */
    const lookAt = [
      ['d5_seat', 122, 440, '옆자리', 'seat'],
      ['d5_water', 244, 434, '물을 나누는 사람들', 'water'],
      ['d5_window', 360, 200, '창밖', 'window'],
      ['d5_rosary', 478, 440, '묵주를 든 청년', 'rosary'],
      ['d5_sleep', 600, 454, '졸고 있는 사람', 'sleep'],
      ['d5_map', 706, 438, '지도를 보는 사람', 'map']
    ];
    lookAt.forEach((o) => {
      this.addInteractable({
        id: o[0], x: o[1], y: 636, label: o[3], range: 74, markerY: o[2], priority: 1,
        onInteract: () => this.look(o[4], o[0])
      });
    });

    this.phoneItem = this.addInteractable({
      id: 'd5_phone', x: 300, y: 706, texture: 'phone_obj', label: '스마트폰', scale: 1.2,
      priority: 4, onInteract: () => this.checkPhone()
    });
    this.carloItem = this.addInteractable({
      id: 'd5_carlo', x: 500, y: 690, label: '가롤로', marker: true,
      priority: 3, range: 72, markerY: 606, onInteract: () => this.talkCarlo()
    });
    this.wayItem = this.addInteractable({
      id: 'd5_way', x: 846, y: 690, label: '환승 통로', range: 92, markerY: 600, priority: 2,
      onInteract: () => this.openMiniGame('WayScene')
    });
    this.outItem = this.addInteractable({
      id: 'd5_out', x: 846, y: 690, label: '지상으로', range: 92, markerY: 600, priority: 2,
      onInteract: () => this.goOut()
    });

    this.createPlayer(210, 706);
    this.physics.world.setBounds(30, 640, 850, 150);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('2027 서울, 지하철');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, D.objective);

    this.disableInteractable('d5_way');
    this.disableInteractable('d5_out');
    this.disableInteractable('d5_carlo');

    UI.fadeIn(this, 1000, [8, 10, 18]);

    this.setInputLocked(true);
    UI.caption(this, DAY05.intro, {
      y: H * 0.34, hold: 1400,
      onDone: () => this.dialogue.play(D.wake, () => this.setInputLocked(false))
    });
  }

  look(key, id) {
    this.noteFound(id); AudioSystem.found();
    this.dialogue.say(DAY05.subway.look[key] || ['…']);
  }

  /* 스마트폰 → 날짜 → 가롤로 등장 */
  checkPhone() {
    if (this.flags.phone) { this.dialogue.say(['날짜는 그대로다.', '2027년 8월 3일.']); return; }
    this.flags.phone = true;
    this.disableInteractable('d5_phone');

    this.dialogue.play(DAY05.subway.phone, () => {
      this.carlo = this.add.image(500, 690, 'carlo_front').setDepth(690).setScale(1.35).setAlpha(0);
      this.tweens.add({ targets: this.carlo, alpha: 1, duration: 700 });
      this.carloItem.image = this.carlo;
      this.enableInteractable('d5_carlo');
      this.dialogue.play(DAY05.subway.shift, () => {
        this.objective.setText(DAY05.subway.objective2);
        this.showLangs();
      });
    });
  }

  /* 여러 언어가 겹쳤다가 웃음소리로 */
  showLangs() {
    const W = GAME.WIDTH;
    DAY05.subway.langs.forEach((t, i) => {
      this.time.delayedCall(i * 260, () => {
        const cam = this.cameras.main;
        const x = cam.scrollX + Phaser.Math.Between(60, W - 60);
        const txt = this.add.text(x, Phaser.Math.Between(360, 520), t,
          UI.style(FONT.small, PAL.cream)).setOrigin(0.5).setDepth(760);
        const g = this.add.graphics().setDepth(759);
        g.fillStyle(0x3f5a80, 0.9);
        g.fillRoundedRect(txt.x - txt.width / 2 - 10, txt.y - 15, txt.width + 20, 30, 8);
        this.tweens.add({
          targets: [txt, g], alpha: 0, duration: 900, delay: 1900 + i * 120,
          onComplete: () => { txt.destroy(); g.destroy(); }
        });
      });
    });
    this.time.delayedCall(2400, () => {
      this.dialogue.play(DAY05.subway.crowd, () => {
        this.flags.crowd = true;
        this.enableInteractable('d5_way');
        this.objective.setText(DAY05.subway.objective3);
      });
    });
  }

  /* 가롤로와의 잡담 — 이탈리아 청년이 알아봅니다 */
  talkCarlo() {
    if (this.flags.carlo) { this.dialogue.say([{ s: '가롤로', t: '모자 좀 눌러쓸게.' }]); return; }
    if (!this.flags.way) {
      this.dialogue.say([{ s: '가롤로', t: '저기 환승 통로에서 누가 길을 찾고 있는데?' }]);
      return;
    }
    this.flags.carlo = true;
    this.dialogue.play(DAY05.subway.carloTrain, () => {
      this.tweens.add({ targets: this.italian, y: 456, duration: 500, yoyo: true, repeat: 1 });
      this.dialogue.play(DAY05.subway.spotted, () => {
        this.enableInteractable('d5_out');
        this.objective.setText(DAY05.subway.objectiveOut);
      });
    });
  }

  onMiniGameDone(key) {
    if (key !== 'WayScene') return;
    this.flags.way = true;
    this.disableInteractable('d5_way');
    this.objective.setText('가롤로와 이야기해보자');
    AudioSystem.chime();
  }

  goOut() {
    this.dialogue.play(DAY05.subway.toGate, () => {
      this.goScene('Day5FestivalScene', {}, [232, 226, 210]);
    });
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
