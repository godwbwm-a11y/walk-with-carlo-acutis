/* DAY 7 · 학교 가는 길과 교실 — 평범합니다. 그런데 부탁이 하나 들어옵니다. */

window.Day7SchoolScene = class Day7SchoolScene extends WorldScene {
  constructor() { super('Day7SchoolScene'); }

  create() {
    this.initWorld({ width: 2000, height: GAME.HEIGHT, speed: 112 });
    SaveSystem.checkpoint('Day7SchoolScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();

    const H = GAME.HEIGHT;
    this.flags = { route: false, gate: false, friend: false, explained: false, board: false, breakTime: false };

    this.add.image(0, 0, 'sky_ordinary').setOrigin(0, 0).setDisplaySize(2000, 380).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0xd2c8b2, 1); g.fillRect(0, 360, 2000, H - 360);
    g.fillStyle(0xdcd3bf, 1); g.fillRect(0, 360, 2000, 12);
    g.fillStyle(0xc2b8a2, 1); g.fillRect(0, 700, 2000, H - 700);

    /* 등굣길 — 편의점, 공원, 학교 */
    for (let x = -20; x < 1000; x += 120) {
      const h = 100 + ((x * 11) % 70);
      g.fillStyle(((x / 120) | 0) % 2 === 0 ? 0xb7c0c8 : 0xaab4bd, 1);
      g.fillRect(x, 360 - h, 98, h);
      g.fillStyle(0xe4ecf1, 0.6);
      for (let r = 0; r < Math.floor(h / 30); r++)
        for (let c = 0; c < 3; c++) g.fillRect(x + 12 + c * 28, 360 - h + 14 + r * 30, 18, 12);
    }
    this.add.image(220, 400, 'store_front').setDepth(400).setScale(0.95);
    this.add.image(560, 380, 'tree_big').setDepth(380).setScale(0.95);
    this.add.image(640, 400, 'bench').setDepth(400).setScale(1.0);
    this.add.image(980, 380, 'school_gate').setDepth(380).setScale(1.0);

    /* 교실 — 복도 문을 지나 안으로 들어갑니다 */
    const room = this.add.graphics().setDepth(-25);
    room.fillStyle(0xe8dcc2, 1); room.fillRect(1080, 0, 920, 470);
    room.fillStyle(0xd7c9ac, 1); room.fillRect(1080, 470, 920, 374);
    room.fillStyle(0xcbbb9c, 1); room.fillRect(1080, 464, 920, 12);
    room.fillStyle(0x8a6340, 1); room.fillRect(1080, 0, 18, 470);      // 문틀
    room.fillStyle(0xb98a5e, 1); room.fillRect(1084, 120, 10, 330);
    this.add.image(1300, 300, 'board_class').setDepth(300).setScale(1.05);
    this.add.image(1660, 280, 'poster_wall').setDepth(280).setScale(1.0);

    for (let i = 0; i < 8; i++) {
      const x = 1180 + (i % 4) * 140, y = 520 + Math.floor(i / 4) * 96;
      this.add.image(x, y, 'desk').setDepth(y).setScale(1.0).setAlpha(0.95);
    }
    [[1180, 486, 'friend_front'], [1460, 488, 'child_front'], [1740, 484, 'villager_front'],
     [1320, 584, 'resident_front']].forEach((p) => {
      const img = this.add.image(p[0], p[1], p[2]).setDepth(p[1]).setScale(1.16);
      this.tweens.add({ targets: img, y: p[1] - 3, duration: 900 + Math.random() * 400, yoyo: true, repeat: -1 });
    });

    /* 카를로는 교문 앞까지만 */
    this.carlo = this.add.image(300, 660, 'carlo_front').setDepth(660).setScale(1.34);
    this.tweens.add({ targets: this.carlo, y: 656, duration: 860, yoyo: true, repeat: -1 });
    this.addInteractable({
      id: 'd7_carlo', x: 300, y: 694, label: '카를로', range: 76, priority: 3, markerY: 596,
      onInteract: () => this.talkCarlo()
    });

    this.addInteractable({
      id: 'd7_gate', x: 980, y: 680, label: '학교 앞', range: 90, priority: 1, markerY: 420,
      onInteract: () => this.atGate()
    });
    this.friendItem = this.addInteractable({
      id: 'd7_friend', x: 1180, y: 700, label: '친구', range: 76, priority: 2, markerY: 436,
      onInteract: () => this.friendAsk()
    });
    this.boardItem = this.addInteractable({
      id: 'd7_board', x: 1300, y: 680, label: '게시판', range: 82, priority: 1, markerY: 244,
      onInteract: () => this.board()
    });
    this.breakItem = this.addInteractable({
      id: 'd7_break', x: 1560, y: 700, label: '친구들', range: 80, priority: 2, markerY: 436,
      onInteract: () => this.breakTime()
    });
    this.outItem = this.addInteractable({
      id: 'd7_out', x: 1940, y: 690, label: '컴퓨터실로', range: 92, priority: 1, markerY: 560,
      onInteract: () => this.goOut()
    });

    this.createPlayer(120, 700);
    this.physics.world.setBounds(40, 630, 1940, 150);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('목요일, 학교');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, DAY07.route.objective);

    this.disableInteractable('d7_friend');
    this.disableInteractable('d7_board');
    this.disableInteractable('d7_break');
    this.disableInteractable('d7_out');

    UI.fadeIn(this, 900, [222, 226, 232]);

    this.setInputLocked(true);
    this.time.delayedCall(700, () => {
      this.dialogue.play(DAY07.route.talk, () => this.setInputLocked(false));
    });
  }

  talkCarlo() {
    if (!this.flags.gate) { this.dialogue.say([{ s: '카를로', t: '학교 앞까지 같이 가자.' }]); return; }
    this.dialogue.say([{ s: '카를로', t: '난 여기서 기다릴게. 잘 살아봐.' }]);
  }

  /* 교문 앞 — 어제 고른 파견 장소가 잠깐 떠오릅니다 */
  atGate() {
    if (this.flags.gate) { this.dialogue.say(['교실은 저쪽이다.']); return; }
    this.flags.gate = true;
    this.disableInteractable('d7_gate');
    this.setInputLocked(true);

    const mission = SaveSystem.get('reflections.day6Mission', null);
    const after = () => {
      this.dialogue.play(DAY07.route.gate, () => {
        this.tweens.add({ targets: this.carlo, alpha: 0.35, duration: 900 });
        this.enableInteractable('d7_friend');
        this.enableInteractable('d7_board');
        this.objective.setText(DAY07.school.objective);
        this.dialogue.play(DAY07.school.arrive, () => this.setInputLocked(false));
      });
    };
    if (mission && mission.place === '학교') {
      this.dialogue.say(DAY07.route.memory.concat([
        { s: '나', t: '어제 내가 학교를 골랐었지…' }
      ]), after);
    } else {
      after();
    }
  }

  /* 친구의 부탁 */
  friendAsk() {
    if (this.flags.friend) { this.dialogue.say([{ s: '친구', t: '아까 고마웠어.' }]); return; }
    this.flags.friend = true;
    this.setInputLocked(true);

    this.dialogue.play(DAY07.school.friendAsk, () => {
      this.dialogue.choose(DAY07.school.prompt, DAY07.school.choices, (key) => {
        SaveSystem.set('reflections.day7Friend', key);
        const strengths = SaveSystem.get('reflections.day4Strengths', []) || [];
        const listens = strengths.indexOf('잘 들어준다') !== -1;
        this.dialogue.play(DAY07.school.reply[key], () => {
          const go = () => this.openMiniGame('ExplainScene');
          if (listens) this.dialogue.play(DAY07.school.listen, go);
          else go();
        });
      });
    });
  }

  board() {
    if (this.flags.board) { this.dialogue.say(['게시판에는 이제 압정만 남아 있다.']); return; }
    this.flags.board = true;
    this.disableInteractable('d7_board');
    this.dialogue.say(DAY07.school.board, () => Collection.award(this, 'j9'));
  }

  breakTime() {
    if (this.flags.breakTime) { this.dialogue.say([{ s: '학생', t: '수업 곧 시작한대.' }]); return; }
    this.flags.breakTime = true;
    this.dialogue.play(DAY07.school.breakTime, () => {
      this.enableInteractable('d7_out');
      this.objective.setText(DAY07.school.objective2);
    });
  }

  onMiniGameDone(key) {
    if (key !== 'ExplainScene') return;
    this.flags.explained = true;
    AudioSystem.chime();
    this.time.delayedCall(400, () => {
      this.dialogue.say(DAY07.school.cardBook, () => {
        Collection.award(this, 'b21', () => {
          this.enableInteractable('d7_break');
          this.objective.setText('쉬는 시간에 친구들 이야기를 들어보자');
        });
      });
    });
  }

  goOut() {
    this.goScene('Day7ComputerScene', {}, [30, 40, 60]);
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
