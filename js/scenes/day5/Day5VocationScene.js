/* DAY 5 · 성소 박람회 — 성소는 직업 맞히기 퀴즈가 아닙니다. */

window.Day5VocationScene = class Day5VocationScene extends WorldScene {
  constructor() { super('Day5VocationScene'); }

  create() {
    this.initWorld({ width: 1800, height: GAME.HEIGHT, speed: 110 });
    SaveSystem.checkpoint('Day5VocationScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();

    const H = GAME.HEIGHT, V = DAY05.vocation;
    this.flags = { sister: false, heart: false, digital: false };
    this.seen = {};

    this.add.image(0, 0, 'sky_seoul_day').setOrigin(0, 0).setDisplaySize(1800, 380).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0xd9cdb6, 1); g.fillRect(0, 360, 1800, H - 360);
    g.fillStyle(0xe3d9c4, 1); g.fillRect(0, 360, 1800, 12);
    g.fillStyle(0xc8bda8, 1); g.fillRect(0, 700, 1800, H - 700);

    /* 부스 열두 개 */
    this.boothItems = [];
    V.booths.forEach((name, i) => {
      const x = 130 + i * 132;
      this.add.image(x, 470, 'fair_booth').setDepth(470).setScale(0.98);
      this.add.text(x, 437, name, UI.style(13, PAL.cream)).setOrigin(0.5).setDepth(472);
      this.addInteractable({
        id: 'd5_booth' + i, x: x, y: 640, label: name, range: 62, markerY: 384,
        onInteract: () => this.booth(name, i)
      });
    });

    /* 수도자와 사제 */
    this.sister = this.add.image(300, 620, 'sister_front').setDepth(620).setScale(1.32);
    this.priest = this.add.image(180, 610, 'priest_front').setDepth(610).setScale(1.28);
    this.tweens.add({ targets: [this.sister, this.priest], y: '-=4', duration: 880, yoyo: true, repeat: -1 });
    this.addInteractable({
      id: 'd5_sister', x: 300, y: 660, label: '수도자', range: 78, priority: 2, markerY: 556,
      onInteract: () => this.talkSister()
    });

    /* 디지털 전시 부스 — 카를로의 사진 */
    this.add.image(1620, 500, 'screen_stand').setDepth(500).setScale(1.05);
    this.addInteractable({
      id: 'd5_digital', x: 1620, y: 650, label: '디지털 전시', range: 84, priority: 1, markerY: 430,
      onInteract: () => this.digital()
    });

    /* 카를로 */
    this.carlo = this.add.image(400, 660, 'carlo_front').setDepth(660).setScale(1.35);
    this.tweens.add({ targets: this.carlo, y: 656, duration: 860, yoyo: true, repeat: -1 });
    this.addInteractable({
      id: 'd5_carlo', x: 400, y: 694, label: '카를로', range: 82, priority: 3, markerY: 596,
      onInteract: () => this.talkCarlo()
    });

    this.heartItem = this.addInteractable({
      id: 'd5_heart', x: 1000, y: 660, label: '마음이 멈추는 곳', range: 88, priority: 1, markerY: 430,
      onInteract: () => this.openMiniGame('HeartStopScene')
    });
    this.outItem = this.addInteractable({
      id: 'd5_out', x: 1750, y: 660, label: '개막미사로', range: 90, priority: 1, markerY: 560,
      onInteract: () => this.goOut()
    });

    this.createPlayer(110, 700);
    this.physics.world.setBounds(40, 620, 1740, 150);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('WYD SEOUL · 성소 박람회');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, V.objective);

    this.disableInteractable('d5_heart');
    this.disableInteractable('d5_digital');
    this.disableInteractable('d5_out');

    UI.fadeIn(this, 900, [214, 220, 208]);
    this.setInputLocked(true);
    this.time.delayedCall(700, () => this.dialogue.play(V.arrive, () => this.setInputLocked(false)));
  }

  booth(name, i) {
    this.seen[name] = true;
    this.noteFound('d5_booth' + i);
    AudioSystem.found();
    const lines = DAY05.vocation.boothTalk[name] || ['“여기도 하나의 부르심이에요.”'];
    this.dialogue.say(lines);
  }

  talkSister() {
    if (this.flags.sister) { this.dialogue.say([{ s: '수도자', t: '천천히 둘러봐요.' }]); return; }
    this.flags.sister = true;
    this.dialogue.play(DAY05.vocation.sisterTalk, () => {
      this.enableInteractable('d5_heart');
      this.objective.setText('마음이 멈추는 곳을 찾아보자');
    });
  }

  talkCarlo() {
    if (!this.flags.sister) { this.dialogue.say([{ s: '카를로', t: '저기 수녀님한테 한번 물어봐.' }]); return; }
    if (!this.flags.heart) { this.dialogue.say([{ s: '카를로', t: '천천히 둘러봐. 정답 없어.' }]); return; }
    if (!this.flags.digital) { this.dialogue.say([{ s: '카를로', t: '저쪽 화면에 뭐가 있는데.' }]); return; }
    this.dialogue.say([{ s: '카를로', t: '이제 미사 갈 시간이야.' }]);
  }

  /* 카를로가 자기 카드를 발견합니다 */
  digital() {
    if (this.flags.digital) { this.dialogue.say([{ s: '카를로', t: '사진 잘 나왔지?' }]); return; }
    this.flags.digital = true;
    this.disableInteractable('d5_digital');
    this.dialogue.play(DAY05.vocation.digital, () => {
      Collection.award(this, 'c12', () => {
        this.dialogue.play(DAY05.vocation.afterCard, () => {
          this.enableInteractable('d5_out');
          this.objective.setText(DAY05.vocation.objectiveOut);
        });
      });
    });
  }

  onMiniGameDone(key) {
    if (key !== 'HeartStopScene') return;
    this.flags.heart = true;
    this.disableInteractable('d5_heart');
    this.enableInteractable('d5_digital');
    this.objective.setText('디지털 전시를 보러 가자');
    AudioSystem.chime();
  }

  goOut() {
    this.goScene('Day5MassScene', {}, [40, 44, 70]);
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
