/* DAY 5 · WYD 안내구역과 청년축제 — 세계가 서울로 왔습니다. */

window.Day5FestivalScene = class Day5FestivalScene extends WorldScene {
  constructor() { super('Day5FestivalScene'); }

  create(data) {
    data = data || {};
    this.initWorld({ width: 2200, height: GAME.HEIGHT, speed: 112 });
    SaveSystem.checkpoint('Day5FestivalScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();

    const W = GAME.WIDTH, H = GAME.HEIGHT, D = DAY05.festival;
    this.flags = { gate: false, hello: false, rhythm: false, mosaic: false };
    this.talked = {};

    this.add.image(0, 0, 'sky_seoul_day').setOrigin(0, 0).setDisplaySize(2200, 400).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0xd7cbb4, 1); g.fillRect(0, 380, 2200, H - 380);
    g.fillStyle(0xe1d7c2, 1); g.fillRect(0, 380, 2200, 14);
    g.fillStyle(0xc6bba6, 1); g.fillRect(0, 690, 2200, H - 690);
    for (let x = 0; x < 2200; x += 120) {
      g.fillStyle(0xece3d2, 0.6); g.fillRect(x + 12, 726, 60, 6);
    }

    /* 먼 건물들 */
    for (let x = -30; x < 2200; x += 116) {
      const h = 110 + ((x * 13) % 90);
      g.fillStyle(((x / 116) | 0) % 2 === 0 ? 0xb6c3cd : 0xa9b7c3, 1);
      g.fillRect(x, 380 - h, 96, h);
      g.fillStyle(0xdfeaf0, 0.6);
      for (let r = 0; r < Math.floor(h / 32); r++)
        for (let c = 0; c < 3; c++) g.fillRect(x + 12 + c * 28, 380 - h + 16 + r * 32, 18, 13);
    }

    /* WYD 안내구역 */
    this.add.image(300, 300, 'wyd_arch').setDepth(300).setScale(1.06);
    this.add.image(150, 400, 'flag_row').setDepth(400).setScale(1.0);
    this.add.image(470, 400, 'flag_row').setDepth(400).setScale(1.0);
    this.add.image(420, 470, 'guide_desk').setDepth(470).setScale(1.0);

    /* 축제 구역 */
    [780, 960, 1140].forEach((x, i) => {
      this.add.image(x, 470, 'booth_tent').setDepth(470).setScale(1.0);
    });
    this.add.image(1420, 400, 'stage_festival').setDepth(400).setScale(1.05);
    this.add.image(1830, 430, 'cloth_big').setDepth(430).setScale(0.92);

    /* 사람들 */
    this.crowd = [];
    const people = [
      [180, 560, 'pilgrim_b'], [360, 546, 'pilgrim_c'], [560, 566, 'pilgrim_d'],
      [700, 548, 'pilgrim_e'], [1040, 556, 'pilgrim_a'], [1240, 548, 'pilgrim_f'],
      [1560, 560, 'pilgrim_b'], [1700, 546, 'pilgrim_c'], [2020, 556, 'pilgrim_d'],
      [2110, 548, 'pilgrim_e']
    ];
    people.forEach((p) => {
      const img = this.add.image(p[0], p[1], p[2]).setDepth(p[1]).setScale(1.14);
      this.tweens.add({ targets: img, y: p[1] - 4, duration: 760 + Math.random() * 500, yoyo: true, repeat: -1 });
      this.crowd.push(img);
    });

    /* NPC 넷 */
    this.npcImgs = {};
    const npcs = [
      ['jiwoo', 850, 620, 'child_front', '지우'],
      ['luca', 1010, 636, 'pilgrim_e', '루카'],
      ['maria', 1170, 620, 'pilgrim_a', '마리아'],
      ['lea', 1300, 636, 'pilgrim_c', '레아']
    ];
    npcs.forEach((n) => {
      const img = this.add.image(n[1], n[2], n[3]).setDepth(n[2]).setScale(1.3);
      this.tweens.add({ targets: img, y: n[2] - 4, duration: 820, yoyo: true, repeat: -1 });
      this.npcImgs[n[0]] = img;
      this.addInteractable({
        id: 'd5_' + n[0], x: n[1], y: n[2] + 40, label: n[4], range: 78, priority: 2,
        markerY: n[2] - 46, onInteract: () => this.talkNpc(n[0])
      });
    });

    /* 가롤로 */
    this.carlo = this.add.image(230, 640, 'carlo_front').setDepth(640).setScale(1.35);
    this.tweens.add({ targets: this.carlo, y: 636, duration: 840, yoyo: true, repeat: -1 });
    this.addInteractable({
      id: 'd5_carlo', x: 230, y: 676, label: '가롤로', range: 84, priority: 3, markerY: 576,
      onInteract: () => this.talkCarlo()
    });

    this.helloItem = this.addInteractable({
      id: 'd5_hello', x: 470, y: 660, label: '인사해보기', range: 88, priority: 1, markerY: 470,
      onInteract: () => this.openMiniGame('HelloScene')
    });
    this.rhythmItem = this.addInteractable({
      id: 'd5_rhythm', x: 1420, y: 660, label: '무대', range: 92, priority: 1, markerY: 500,
      onInteract: () => this.openMiniGame('RhythmScene')
    });
    this.mosaicItem = this.addInteractable({
      id: 'd5_mosaic', x: 1830, y: 660, label: '공동 작품', range: 92, priority: 1, markerY: 520,
      onInteract: () => this.openMiniGame('MosaicScene')
    });
    this.outItem = this.addInteractable({
      id: 'd5_out', x: 2150, y: 660, label: '화해의 공원으로', range: 92, priority: 1, markerY: 560,
      onInteract: () => this.goOut()
    });

    this.createPlayer(120, 690);
    this.physics.world.setBounds(40, 600, 2140, 170);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('WYD SEOUL · 청년축제');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, DAY05.gate.objective);

    this.disableInteractable('d5_rhythm');
    this.disableInteractable('d5_mosaic');
    this.disableInteractable('d5_out');
    ['jiwoo', 'luca', 'maria', 'lea'].forEach(k => this.disableInteractable('d5_' + k));

    UI.fadeIn(this, 900, [232, 226, 210]);

    this.setInputLocked(true);
    this.time.delayedCall(700, () => {
      this.dialogue.play(DAY05.gate.arrive, () => {
        this.dialogue.play(DAY05.gate.stop, () => this.setInputLocked(false));
      });
    });
  }

  talkCarlo() {
    if (!this.flags.hello) { this.dialogue.say([{ s: '가롤로', t: '가서 인사 한번 해봐.' }]); return; }
    if (this.talkedCount() < 4) {
      this.dialogue.say([{ s: '가롤로', t: '사람들이랑 더 이야기해봐. 시간 많아.' }]);
      return;
    }
    if (this.flags.after) { this.dialogue.say([{ s: '가롤로', t: '무대 쪽으로 가볼까?' }]); return; }
    this.flags.after = true;
    this.dialogue.play(DAY05.festival.after, () => {
      this.enableInteractable('d5_rhythm');
      this.objective.setText(DAY05.festival.objective2);
    });
  }

  talkedCount() { return Object.keys(this.talked).length; }

  talkNpc(key) {
    const npc = DAY05.festival.npcs[key];
    if (this.talked[key]) { this.dialogue.say([{ s: npc.name, t: '또 만났네요!' }]); return; }
    this.talked[key] = true;

    const strengths = SaveSystem.get('reflections.day4Strengths', []) || [];
    const listens = (strengths.indexOf('잘 들어준다') !== -1 ||
      strengths.indexOf('다른 사람의 기분을 잘 알아차린다') !== -1);

    this.dialogue.play(npc.lines, () => {
      const after = () => {
        const met = SaveSystem.get('reflections.day5Friends', []) || [];
        if (met.indexOf(npc.name) === -1) { met.push(npc.name); SaveSystem.set('reflections.day5Friends', met); }
        AudioSystem.found();
        if (this.talkedCount() >= 4) this.objective.setText('가롤로와 이야기해보자');
      };
      if (listens) this.dialogue.play(npc.listen, after);   // 어제 고른 좋은 점이 여기서 쓰입니다
      else after();
    });
  }

  onMiniGameDone(key) {
    if (key === 'HelloScene') {
      this.flags.hello = true;
      this.disableInteractable('d5_hello');
      ['jiwoo', 'luca', 'maria', 'lea'].forEach(k => this.enableInteractable('d5_' + k));
      this.objective.setText(DAY05.festival.objective);
      this.time.delayedCall(400, () => this.dialogue.play(DAY05.festival.arrive));
    } else if (key === 'RhythmScene') {
      this.flags.rhythm = true;
      this.disableInteractable('d5_rhythm');
      this.enableInteractable('d5_mosaic');
      this.objective.setText(DAY05.festival.objective3);
    } else if (key === 'MosaicScene') {
      this.flags.mosaic = true;
      this.disableInteractable('d5_mosaic');
      this.enableInteractable('d5_out');
      this.objective.setText(DAY05.festival.objectiveOut);
    }
    AudioSystem.chime();
  }

  goOut() {
    this.goScene('Day5ReconcileScene', {}, [214, 220, 208]);
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
