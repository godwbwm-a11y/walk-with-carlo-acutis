/* DAY 4 · 점심시간 운동장 — 거울과 사람들 */

window.Day4YardScene = class Day4YardScene extends WorldScene {
  constructor() { super('Day4YardScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const WORLD = 1700;
    this.initWorld({ width: WORLD, height: H, speed: 108 });
    SaveSystem.checkpoint('Day4YardScene', {});
    AudioSystem.setAmbience('room');
    AudioSystem.startPad();

    this.flags = {};

    this.add.image(W / 2, 0, 'sky_morning').setOrigin(0.5, 0)
      .setDisplaySize(W, 340).setScrollFactor(0).setDepth(-30);
    const g = this.add.graphics().setDepth(-28);
    g.fillStyle(0xc4cdbe, 1); g.fillRect(0, 320, WORLD, 120);
    g.fillStyle(0xd8c9a6, 1); g.fillRect(0, 430, WORLD, H - 430);
    g.fillStyle(0xcbbb96, 1); g.fillRect(0, 430, WORLD, 12);
    for (let i = 0; i < 160; i++) {
      g.fillStyle(0xffffff, 0.08);
      g.fillEllipse(Phaser.Math.Between(0, WORLD), Phaser.Math.Between(450, H - 20), Phaser.Math.Between(12, 30), 5);
    }
    g.lineStyle(4, 0xf3ece2, 0.45);
    g.strokeRect(120, 480, WORLD - 240, 240);

    this.addProp(200, 430, 'goal_post', { originY: 1, depth: 3, alpha: 0.9, scale: 1.0 });
    this.addProp(1500, 430, 'goal_post', { originY: 1, depth: 3, alpha: 0.9, scale: 1.0 });
    this.addProp(60, 440, 'tree_big', { originY: 1, scale: 0.9 });
    this.addProp(900, 436, 'bush', { scale: 1.0 });
    this.addProp(1180, 596, 'bench', { scale: 1.25 });

    [[420, 'child_front'], [520, 'villager_front'], [680, 'villager_back'], [1330, 'child_front']]
      .forEach((p, i) => {
        const s = this.add.image(p[0], 600 + (i % 2) * 14, p[1]).setDepth(600).setScale(1.05);
        this.tweens.add({ targets: s, x: p[0] + 70, duration: 7000 + i * 900, yoyo: true, repeat: -1 });
      });

    this.carlo = this.add.image(1150, 586, 'carlo_front').setDepth(586).setScale(1.12);
    this.tweens.add({ targets: this.carlo, y: 583, duration: 1800, yoyo: true, repeat: -1 });

    this.carloItem = this.addInteractable({
      id: 'd4_carlo', x: 1150, y: 596, label: '카를로', range: 96, priority: 2, markerY: 534,
      onInteract: () => this.talkCarlo()
    });

    /* 담벼락 — 오늘 들은 말들이 종이로 붙어 있습니다 */
    this.wall = this.add.image(1000, 438, 'd4_wall').setOrigin(0.5, 1).setDepth(4).setScale(1.15);
    this.wallItem = this.addInteractable({
      id: 'd4_wall', x: 1000, y: 600, label: '담벼락', range: 96, priority: 2, markerY: 470,
      onInteract: () => this.lookWall()
    });
    this.wallItem.enabled = false;
    if (this.wallItem.marker) this.wallItem.marker.setVisible(false);

    this.benchCardItem = this.addInteractable({
      id: 'd4_benchcard', x: 1250, y: 606, label: '벤치 밑', range: 80, priority: 3, markerY: 560,
      onInteract: () => this.benchCard()
    });
    this.benchCardItem.enabled = false;
    if (this.benchCardItem.marker) this.benchCardItem.marker.setVisible(false);

    this.lonelyStudent = this.add.image(1560, 588, 'villager_front').setDepth(588).setScale(1.1).setAlpha(0.95);
    this.lonelyItem = this.addInteractable({
      id: 'd4_lonely', x: 1560, y: 600, label: '혼자 있는 학생', range: 92, priority: 2, markerY: 536,
      onInteract: () => this.lonely()
    });
    this.lonelyItem.enabled = false;
    if (this.lonelyItem.marker) this.lonelyItem.marker.setVisible(false);

    this.exitItem = this.addInteractable({
      id: 'd4_exit', x: 1662, y: 600, label: '하교하기', range: 92, priority: 1, markerY: 540,
      onInteract: () => this.goScene('Day4StreetScene', {}, [232, 200, 160])
    });
    this.exitItem.enabled = false;
    if (this.exitItem.marker) this.exitItem.marker.setVisible(false);

    this.createPlayer(120, 620);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.physics.world.setBounds(40, 578, WORLD - 80, 72);

    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('점심시간 운동장');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, DAY04.yard.objective);

    if (SaveSystem.get('reflections.day4Small', false)) this.player.setScale(0.92);
    UI.fadeIn(this, 900);
  }

  talkCarlo() {
    if (this.flags.mirror) { this.dialogue.say([{ s: '카를로', t: '천천히 걸어봐.' }]); return; }
    this.flags.carlo = true;
    this.setInputLocked(true);
    this.dialogue.play(DAY04.yard.meet, () => {
      this.dialogue.play(DAY04.yard.talk, () => {
        this.dialogue.play(DAY04.yard.talk2, () => {
          this.dialogue.play(DAY04.yard.talk3, () => {
            this.dialogue.play(DAY04.yard.small, () => {
              if (this.stick) this.stick.reset();
              this.scene.launch('MirrorScene', { from: this.scene.key });
              this.scene.pause();
            });
          });
        });
      });
    });
  }

  /* 담벼락 앞에서 — 카를로가 걸어옵니다 */
  lookWall() {
    if (this.flags.wall) { this.dialogue.say(['떨어진 종이들이 바닥에 그대로 있다.']); return; }
    this.flags.wall = true;
    this.disableInteractable('d4_wall');
    this.setInputLocked(true);

    this.dialogue.play(DAY04.bricks.look, () => {
      /* 카를로가 벤치 쪽에서 담벼락으로 옵니다 */
      this.tweens.add({
        targets: this.carlo, x: 1074, duration: 1100, ease: 'Sine.easeInOut',
        onComplete: () => {
          this.carloItem.x = 1074;
          if (this.carloItem.marker) this.carloItem.marker.x = 1074;
          if (this.stick) this.stick.reset();
          this.openMiniGame('BrickScene');
        }
      });
    });
  }

  benchCard() {
    this.disableInteractable('d4_benchcard');
    this.dialogue.say(DAY04.yard.benchCard, () => Collection.award(this, 'b6'));
  }

  /* 혼자 있는 학생 — 어떤 선택도 나무라지 않습니다 */
  lonely() {
    if (this.flags.lonely) { this.dialogue.say(['둘이 매점 쪽으로 걸어간다.']); return; }
    this.flags.lonely = true;
    this.setInputLocked(true);
    const L = DAY04.lonely;

    this.dialogue.say(L.see, () => {
      this.dialogue.choose('', L.choices, (key) => {
        SaveSystem.set('reflections.day4Lonely', key);
        this.dialogue.say(L.reply[key], () => {
          if (key === 'pass') { this.afterLonely(); return; }
          const list = SaveSystem.get('reflections.day4Strengths', []) || [];
          let extra = [];
          for (let i = 0; i < list.length; i++) {
            if (L.thanks[list[i]]) { extra = L.thanks[list[i]]; break; }
          }
          if (extra.length === 0) extra = L.thanks['아직 잘 모르겠다'];
          this.dialogue.play(L.thanks.base.concat(extra), () => {
            this.showStrength(list[0] || '아직 잘 모르겠다', () => {
              this.dialogue.play(L.realize, () => this.storeCard());
            });
          });
        });
      });
    });
  }

  showStrength(label, done) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const t = this.add.text(W / 2, H * 0.30, label, UI.style(26, PAL.sun))
      .setOrigin(0.5).setDepth(1200).setScrollFactor(0).setAlpha(0);
    const back = this.add.graphics().setDepth(1199).setScrollFactor(0);
    back.fillStyle(0x101a2e, 0.45); back.fillRect(0, H * 0.30 - 44, W, 88);
    back.setAlpha(0);
    this.tweens.add({ targets: [t, back], alpha: 1, duration: 800 });
    this.time.delayedCall(2200, () => {
      this.tweens.add({
        targets: [t, back], alpha: 0, duration: 700,
        onComplete: () => { t.destroy(); back.destroy(); done(); }
      });
    });
  }

  storeCard() {
    this.dialogue.say(DAY04.lonely.card, () => {
      Collection.award(this, 's11', () => this.afterLonely());
    });
  }

  afterLonely() {
    this.exitItem.enabled = true;
    if (this.exitItem.marker) this.exitItem.marker.setVisible(true);
    this.objective.setText('하교할 시간이다');
    this.setInputLocked(false);
  }

  onMiniGameDone(key) {
    if (key === 'MirrorScene') {
      this.flags.mirror = true;
      this.tweens.add({ targets: this.player, scale: 1.04, duration: 1200 });
      this.dialogue.play(DAY04.yard.afterMirror, () => {
        this.benchCardItem.enabled = true;
        if (this.benchCardItem.marker) this.benchCardItem.marker.setVisible(true);
        this.dialogue.play(DAY04.see.talkBefore, () => {
          if (this.stick) this.stick.reset();
          this.scene.launch('SeePersonScene', { from: this.scene.key });
          this.scene.pause();
        });
      });
    } else if (key === 'SeePersonScene') {
      /* 이제 담벼락이 눈에 들어옵니다 */
      this.wallItem.enabled = true;
      if (this.wallItem.marker) this.wallItem.marker.setVisible(true);
      this.objective.setText(DAY04.bricks.objective);
      this.setInputLocked(false);

    } else if (key === 'BrickScene') {
      /* 떨어진 종이들이 담벼락 밑에 쌓입니다 */
      this.tweens.add({ targets: this.wall, alpha: 0.55, duration: 1200 });
      this.fallenPapers();
      this.dialogue.play(DAY04.bricks.after, () => {
        this.lonelyItem.enabled = true;
        if (this.lonelyItem.marker) this.lonelyItem.marker.setVisible(true);
        this.objective.setText('운동장 구석을 한번 보자');
        this.setInputLocked(false);
      });
    }
  }

  /* 떨어진 종이 몇 장이 담벼락 밑에 남습니다 */
  fallenPapers() {
    for (let i = 0; i < 9; i++) {
      const x = 930 + Phaser.Math.Between(0, 140);
      const y = 452 + Phaser.Math.Between(0, 18);
      const p = this.add.graphics().setDepth(y - 200).setAlpha(0);
      p.fillStyle(0xf6f1e4, 0.92);
      p.fillRect(x, y, Phaser.Math.Between(16, 26), Phaser.Math.Between(9, 13));
      this.tweens.add({ targets: p, alpha: 1, duration: 700, delay: i * 90 });
    }
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
