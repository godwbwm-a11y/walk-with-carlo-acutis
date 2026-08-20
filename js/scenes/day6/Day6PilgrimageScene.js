/* DAY 6 · 순례길 — 함께 걸어 철야기도 장소로 갑니다. */

window.Day6PilgrimageScene = class Day6PilgrimageScene extends WorldScene {
  constructor() { super('Day6PilgrimageScene'); }

  create() {
    this.initWorld({ width: 2000, height: GAME.HEIGHT, speed: 112 });
    SaveSystem.checkpoint('Day6PilgrimageScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();

    const H = GAME.HEIGHT;
    this.flags = { meet: false, walk: false, during: false, rest: false };
    this.rested = {};

    this.add.image(0, 0, 'sky_afternoon').setOrigin(0, 0).setDisplaySize(2000, 380).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0x9aa984, 1); g.fillRect(0, 360, 2000, 130);
    g.fillStyle(0x6f9b6a, 0.5);
    for (let x = -10; x < 2000; x += 88) g.fillCircle(x, 372, 30);
    this.add.tileSprite(1000, 660, 2000, 380, 'road_pilgrim').setDepth(-20);

    /* 그늘 쉼터 */
    this.add.image(1070, 470, 'shade_tent').setDepth(470).setScale(1.05);
    this.add.image(1230, 466, 'shade_tent').setDepth(466).setScale(0.95).setAlpha(0.95);

    /* 앞서 걷는 순례자들 */
    this.crowd = [];
    for (let i = 0; i < 16; i++) {
      const x = 60 + i * 120 + Phaser.Math.Between(-30, 30);
      const y = 470 + (i % 4) * 26;
      const img = this.add.image(x, y, ['pilgrim_a', 'pilgrim_b', 'pilgrim_c', 'pilgrim_d',
        'pilgrim_e', 'pilgrim_f'][i % 6] + '_back').setDepth(y).setScale(1.05).setAlpha(0.92);
      this.tweens.add({ targets: img, y: y - 5, duration: 700 + i * 40, yoyo: true, repeat: -1 });
      this.crowd.push(img);
    }

    /* 친구들 */
    this.friends = {};
    const npcs = [
      ['luca', 340, 640, 'pilgrim_e', '루카'],
      ['maria', 470, 630, 'pilgrim_a', '마리아'],
      ['lea', 600, 642, 'pilgrim_c', '레아'],
      ['jiwoo', 1180, 636, 'child_front', '지우']
    ];
    npcs.forEach((n) => {
      const img = this.add.image(n[1], n[2], n[3]).setDepth(n[2]).setScale(1.28);
      this.tweens.add({ targets: img, y: n[2] - 4, duration: 840, yoyo: true, repeat: -1 });
      this.friends[n[0]] = img;
    });

    /* 카를로 */
    this.carlo = this.add.image(230, 660, 'carlo_front').setDepth(660).setScale(1.34);
    this.tweens.add({ targets: this.carlo, y: 656, duration: 860, yoyo: true, repeat: -1 });
    this.addInteractable({
      id: 'd6_carlo', x: 230, y: 694, label: '카를로', range: 78, priority: 3, markerY: 598,
      onInteract: () => this.talkCarlo()
    });

    this.addInteractable({
      id: 'd6_meet', x: 470, y: 680, label: '친구들', range: 92, priority: 2, markerY: 570,
      onInteract: () => this.meet()
    });
    this.restItem = this.addInteractable({
      id: 'd6_rest', x: 1070, y: 690, label: DAY06.rest.label, range: 92, priority: 1, markerY: 400,
      onInteract: () => this.rest()
    });
    this.jiwooItem = this.addInteractable({
      id: 'd6_jiwoo', x: 1180, y: 676, label: '지우', range: 74, priority: 2, markerY: 590,
      onInteract: () => this.restTalk('jiwoo')
    });
    this.mariaItem = this.addInteractable({
      id: 'd6_maria', x: 1330, y: 676, label: '마리아', range: 74, priority: 2, markerY: 590,
      onInteract: () => this.restTalk('maria')
    });
    this.outItem = this.addInteractable({
      id: 'd6_out', x: 1950, y: 680, label: '철야 장소로', range: 96, priority: 1, markerY: 570,
      onInteract: () => this.goOut()
    });

    this.createPlayer(140, 690);
    this.physics.world.setBounds(40, 620, 1940, 160);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('WYD SEOUL · 순례길');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, DAY06.street.objective);

    this.disableInteractable('d6_rest');
    this.disableInteractable('d6_jiwoo');
    this.disableInteractable('d6_maria');
    this.disableInteractable('d6_out');

    UI.fadeIn(this, 900, [200, 190, 172]);
  }

  meet() {
    if (this.flags.meet) { this.dialogue.say([{ s: '루카', t: 'Come on!' }]); return; }
    this.flags.meet = true;
    this.disableInteractable('d6_meet');
    this.dialogue.play(DAY06.street.meet, () => this.openMiniGame('PilgrimWalkScene'));
  }

  talkCarlo() {
    if (!this.flags.meet) { this.dialogue.say([{ s: '카를로', t: '저기 친구들 있잖아. 같이 가자.' }]); return; }
    if (!this.flags.during) { this.dialogue.say([{ s: '카를로', t: '조금 더 걸어볼까?' }]); return; }
    if (!this.flags.rest) { this.dialogue.say([{ s: '카를로', t: '앞에 그늘이 있대. 잠깐 쉬자.' }]); return; }
    this.dialogue.say([{ s: '카를로', t: '이제 거의 다 왔어.' }]);
  }

  /* 걷는 동안의 조용한 대화 */
  during() {
    this.setInputLocked(true);
    this.dialogue.play(DAY06.during, () => {
      this.dialogue.say(DAY06.duringCard, () => {
        Collection.award(this, 'j7', () => {
          this.flags.during = true;
          this.enableInteractable('d6_rest');
          this.enableInteractable('d6_jiwoo');
          this.enableInteractable('d6_maria');
          this.objective.setText('중간 쉼터에서 잠깐 쉬어가자');
          this.setInputLocked(false);
        });
      });
    });
  }

  rest() {
    if (this.flags.rest) { this.dialogue.say(['그늘이 시원하다.']); return; }
    this.flags.rest = true;
    AudioSystem.found();
    this.dialogue.say(DAY06.rest.look, () => {
      this.enableInteractable('d6_out');
      this.objective.setText('철야 장소로 가자');
    });
  }

  restTalk(who) {
    if (this.rested[who]) { this.dialogue.say([{ t: '조금 쉬고 나니 얼굴이 밝아졌다.' }]); return; }
    this.rested[who] = true;
    AudioSystem.found();
    this.dialogue.play(DAY06.rest[who]);
  }

  onMiniGameDone(key) {
    if (key !== 'PilgrimWalkScene') return;
    this.flags.walk = true;
    AudioSystem.chime();
    this.time.delayedCall(500, () => this.during());
  }

  goOut() {
    this.goScene('Day6FieldScene', {}, [200, 190, 172]);
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
