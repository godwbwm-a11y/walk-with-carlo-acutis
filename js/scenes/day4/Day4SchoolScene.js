/* DAY 4 · 등굣길과 교실, 그리고 복도 */

window.Day4SchoolScene = class Day4SchoolScene extends WorldScene {
  constructor() { super('Day4SchoolScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const WORLD = 2000;
    this.initWorld({ width: WORLD, height: H, speed: 108 });
    SaveSystem.checkpoint('Day4SchoolScene', {});
    AudioSystem.unlock();
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();

    this.flags = {};
    this.buildBackground(WORLD);
    this.buildProps();
    this.buildInteractables();

    this.createPlayer(120, 620);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.physics.world.setBounds(40, 578, WORLD - 80, 72);

    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('월요일 아침, 학교');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, DAY04.gate.objective);

    UI.fadeIn(this, 900);
  }

  buildBackground(WORLD) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const SKY = 330, GROUND = 560, ROAD = 762;

    this.add.image(W / 2, 0, 'sky_morning').setOrigin(0.5, 0)
      .setDisplaySize(W, SKY + 6).setScrollFactor(0).setDepth(-30).setTint(0xdfe6ee);

    const g = this.add.graphics().setDepth(-28);
    g.fillStyle(0xc9d1c6, 1); g.fillRect(0, SKY, WORLD, GROUND - SKY);
    for (let x = 40; x < WORLD; x += 118) {
      const h = 70 + ((x * 7) % 60);
      g.fillStyle(((x / 118) | 0) % 2 === 0 ? 0xb2bcb6 : 0xa9b4ae, 1);
      g.fillRect(x, GROUND - h, 96, h);
      g.fillStyle(0xc7d2cb, 0.7);
      for (let r = 0; r < Math.floor(h / 30); r++)
        for (let c = 0; c < 3; c++) g.fillRect(x + 12 + c * 26, GROUND - h + 18 + r * 30, 16, 14);
    }
    g.fillStyle(0xd7cec1, 1); g.fillRect(0, GROUND, WORLD, ROAD - GROUND);
    g.fillStyle(0xc7bdae, 1); g.fillRect(0, GROUND, WORLD, 8);
    g.fillStyle(0x9a9a96, 1); g.fillRect(0, ROAD, WORLD, H - ROAD);

    g.fillStyle(0xf0e7d6, 1); g.fillRect(760, 300, 520, ROAD - 300);
    g.fillStyle(0xe2d7c2, 1); g.fillRect(760, 300, 520, 16);
    g.fillStyle(0xe6ecf0, 1); g.fillRect(1340, 300, 620, ROAD - 300);
    g.fillStyle(0xd4dde4, 1); g.fillRect(1340, 300, 620, 16);

    this.add.tileSprite(WORLD / 2, (GROUND + ROAD) / 2, WORLD, ROAD - GROUND, 'walk_tile')
      .setDepth(-27).setAlpha(0.4);
    this.roadY = ROAD;
  }

  buildProps() {
    const P = (x, y, key, opt) => this.addProp(x, y, key, opt || {});
    P(420, 566, 'school_gate', { scale: 1.25, originY: 1, depth: 4 });
    P(240, 560, 'house_b', { scale: 0.95, originY: 1, depth: 4 });
    P(620, 596, 'bush', { scale: 1.0 });

    for (let i = 0; i < 6; i++) {
      const x = 820 + (i % 3) * 150;
      const y = 470 + Math.floor(i / 3) * 96;
      P(x, y, 'desk', { scale: 0.95, depth: y });
      if (i !== 4) {
        this.add.image(x, y - 40, i % 2 ? 'villager_front' : 'child_front')
          .setDepth(y - 1).setScale(1.0).setAlpha(0.95);
      }
    }
    P(1030, 356, 'board_notice', { scale: 1.3 });

    P(1420, 560, 'shelf', { scale: 1.1, originY: 1, depth: 4 });
    P(1700, 380, 'board_notice', { scale: 1.1 });
    [1480, 1600, 1760, 1880].forEach((x, i) => {
      const s = this.add.image(x, 600 + (i % 2) * 12, i % 2 ? 'villager_front' : 'child_front')
        .setDepth(600).setScale(1.05);
      this.tweens.add({ targets: s, x: x + 60, duration: 9000 + i * 1200, yoyo: true, repeat: -1 });
    });

    [200, 320, 560].forEach((x, i) => {
      const s = this.add.image(x, 616 + (i % 2) * 10, i % 2 ? 'child_front' : 'villager_back')
        .setDepth(616).setScale(1.05).setAlpha(0.95);
      this.tweens.add({ targets: s, x: x + 220, duration: 16000 + i * 2000, yoyo: true, repeat: -1 });
    });
  }

  buildInteractables() {
    this.addInteractable({
      id: 'd4_gate_talk', x: 420, y: 600, label: '지나가는 말', range: 90, markerY: 540,
      onInteract: () => this.gateTalk()
    });
    this.deskItem = this.addInteractable({
      id: 'd4_mydesk', x: 1120, y: 566, label: '내 자리', range: 88, priority: 2, markerY: 508,
      onInteract: () => this.classroom()
    });
    this.hallItem = this.addInteractable({
      id: 'd4_hall', x: 1620, y: 600, label: '복도', range: 96, priority: 2, markerY: 540,
      onInteract: () => this.hallway()
    });
    this.exitItem = this.addInteractable({
      id: 'd4_toyard', x: 1940, y: 600, label: '운동장으로', range: 96, priority: 2, markerY: 540,
      onInteract: () => this.goScene('Day4YardScene', {}, [200, 214, 190])
    });
    this.exitItem.enabled = false;
    if (this.exitItem.marker) this.exitItem.marker.setVisible(false);
  }

  gateTalk() {
    if (this.flags.gate) { this.dialogue.say(['아침의 말들이 계속 오간다.']); return; }
    this.flags.gate = true;
    this.noteFound('d4_gate');
    const lines = [];
    DAY04.gate.talks.forEach(set => set.forEach(t => lines.push({ s: '학생', t: t })));
    this.dialogue.play(lines, () => this.dialogue.say(DAY04.gate.look));
  }

  /* 교실 — 시험지 */
  classroom() {
    if (this.flags.class) { this.dialogue.say(['수업 준비가 시작된다.']); return; }
    this.flags.class = true;
    this.setInputLocked(true);
    const C = DAY04.classroom;

    this.dialogue.say(C.arrive, () => {
      this.dialogue.play(C.around, () => {
        this.dialogue.choose('', C.choices, (key) => {
          SaveSystem.set('reflections.day4Test', key);
          this.dialogue.say(C.reply[key], () => {
            if (key === 'others') this.numbersFly(() => this.foldPaper());
            else this.foldPaper();
          });
        });
      });
    });
  }

  /* 점수 숫자가 이름보다 커 보이는 순간 */
  numbersFly(done) {
    const W = GAME.WIDTH;
    DAY04.classroom.numbers.forEach((n, i) => {
      const t = this.add.text(Phaser.Math.Between(60, W - 60), Phaser.Math.Between(220, 520), n,
        UI.style(26, PAL.clay)).setOrigin(0.5).setDepth(1100).setScrollFactor(0).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 0.9, scale: 1.7, duration: 900, delay: i * 160 });
      this.tweens.add({
        targets: t, alpha: 0, duration: 700, delay: 1900 + i * 160,
        onComplete: () => t.destroy()
      });
    });
    this.time.delayedCall(3200, done);
  }

  foldPaper() {
    this.dialogue.say(DAY04.classroom.fold, () => {
      Collection.award(this, 'b16', () => {
        this.objective.setText('복도로 나가자');
        this.setInputLocked(false);
      });
    });
  }

  /* 복도 — 말들이 붙는다 */
  hallway() {
    if (this.flags.hall) { this.dialogue.say(['복도는 여전히 시끄럽다.']); return; }
    if (!this.flags.class) { this.dialogue.say([{ s: '나', t: '먼저 교실에 가야지.' }]); return; }
    this.flags.hall = true;
    this.setInputLocked(true);

    const W = GAME.WIDTH;
    const lines = DAY04.hallway.voices.map(v => ({ s: '누군가', t: v }));
    this.dialogue.play(lines, () => {
      DAY04.hallway.bubbles.forEach((b, i) => {
        this.time.delayedCall(i * 260, () => {
          const t = this.add.text(Phaser.Math.Between(80, W - 80), Phaser.Math.Between(240, 520), b,
            UI.style(FONT.small, PAL.ink)).setOrigin(0.5).setDepth(1100).setScrollFactor(0);
          const g = this.add.graphics().setDepth(1099).setScrollFactor(0);
          g.fillStyle(0xffffff, 0.94);
          g.fillRoundedRect(t.x - t.width / 2 - 14, t.y - 20, t.width + 28, 40, 20);
          this.tweens.add({
            targets: [t, g], alpha: 0, duration: 800, delay: 2400 + i * 120,
            onComplete: () => { t.destroy(); g.destroy(); }
          });
        });
      });
      this.time.delayedCall(2800, () => {
        if (this.stick) this.stick.reset();
        this.scene.launch('WordsScene', { from: this.scene.key });
        this.scene.pause();
      });
    });
  }

  onMiniGameDone(key) {
    if (key !== 'WordsScene') return;
    this.setInputLocked(false);
    this.exitItem.enabled = true;
    if (this.exitItem.marker) this.exitItem.marker.setVisible(true);
    this.objective.setText('점심시간, 운동장으로 가자');
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
