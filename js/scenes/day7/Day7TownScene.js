/* DAY 7 · 동네 — 어제와 똑같은 길입니다. 다만 조금 오래 바라봅니다. */

window.Day7TownScene = class Day7TownScene extends WorldScene {
  constructor() { super('Day7TownScene'); }

  create() {
    this.initWorld({ width: 1700, height: GAME.HEIGHT, speed: 110 });
    SaveSystem.checkpoint('Day7TownScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();

    const H = GAME.HEIGHT;
    this.flags = { notice: false, helped: false, bench: false };

    this.add.image(0, 0, 'sky_ordinary').setOrigin(0, 0).setDisplaySize(1700, 380).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0x9fae86, 1); g.fillRect(0, 360, 1700, 120);
    g.fillStyle(0xc7bda6, 1); g.fillRect(0, 470, 1700, H - 470);
    g.fillStyle(0xd3c9b2, 1); g.fillRect(0, 470, 1700, 10);
    for (let x = 0; x < 1700; x += 110) { g.fillStyle(0xd8cfb8, 0.7); g.fillRect(x + 12, 748, 60, 6); }

    /* 편의점 · 공원 · 성당 가는 길 */
    this.add.image(200, 420, 'store_front').setDepth(420).setScale(1.0);
    this.add.image(560, 400, 'tree_big').setDepth(400).setScale(1.0);
    this.add.image(700, 424, 'bench').setDepth(424).setScale(1.05);
    this.add.image(860, 404, 'tree_big').setDepth(404).setScale(0.9);
    this.add.image(1240, 400, 'house_a').setDepth(400).setScale(1.0);
    this.add.image(1480, 396, 'church_front').setDepth(396).setScale(0.9);

    /* 어제와 똑같은 사람들 */
    this.folks = [];
    [[300, 560, 'villager_front'], [640, 566, 'grandma_front'],
     [980, 558, 'child_front'], [1320, 566, 'resident_front']].forEach((p) => {
      const img = this.add.image(p[0], p[1], p[2]).setDepth(p[1]).setScale(1.16).setAlpha(0.95);
      this.tweens.add({ targets: img, y: p[1] - 4, duration: 900 + Math.random() * 500, yoyo: true, repeat: -1 });
      this.folks.push(img);
    });

    this.carlo = this.add.image(220, 690, 'carlo_front').setDepth(690).setScale(1.34);
    this.tweens.add({ targets: this.carlo, y: 686, duration: 860, yoyo: true, repeat: -1 });
    this.addInteractable({
      id: 'd7_carlo', x: 220, y: 724, label: '카를로', range: 74, priority: 3, markerY: 626,
      onInteract: () => this.talkCarlo()
    });

    this.noticeItem = this.addInteractable({
      id: 'd7_notice', x: 640, y: 700, label: '천천히 바라본다', range: 92, priority: 1, markerY: 500,
      onInteract: () => this.openMiniGame('NoticeScene')
    });
    this.helpItem = this.addInteractable({
      id: 'd7_help', x: 1000, y: 700, label: '다가가 본다', range: 92, priority: 1, markerY: 500,
      onInteract: () => this.helpAsk()
    });
    this.benchItem = this.addInteractable({
      id: 'd7_bench', x: 700, y: 690, label: '벤치 옆', range: 70, priority: 0, markerY: 380,
      onInteract: () => this.bench()
    });
    this.outItem = this.addInteractable({
      id: 'd7_out', x: 1650, y: 700, label: '성당 쪽으로', range: 92, priority: 1, markerY: 560,
      onInteract: () => this.goOut()
    });


    /* 편의점 — 어느 날이든 들어갈 수 있습니다 */
    this.addInteractable({
      id: 'store_enter', x: 200, y: 640, label: '편의점', range: 88, markerY: 460,
      onInteract: () => {
        if (this.stick) this.stick.reset();
        this.scene.launch('StoreScene', { from: this.scene.key });
        this.scene.pause();
      }
    });
    this.createPlayer(120, 700);
    this.physics.world.setBounds(40, 640, 1640, 150);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('목요일 오후, 우리 동네');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, DAY07.town.objective);

    this.disableInteractable('d7_help');
    this.disableInteractable('d7_bench');
    this.disableInteractable('d7_out');

    UI.fadeIn(this, 900, [200, 196, 180]);
    this.setInputLocked(true);
    this.time.delayedCall(700, () => this.dialogue.play(DAY07.town.arrive, () => this.setInputLocked(false)));
  }

  talkCarlo() {
    if (!this.flags.notice) { this.dialogue.say([{ s: '카를로', t: '한번 천천히 둘러봐.' }]); return; }
    if (!this.flags.helped) { this.dialogue.say([{ s: '카를로', t: '한 사람이면 충분해.' }]); return; }
    this.dialogue.say([{ s: '카를로', t: '성당 쪽으로 걸어볼까?' }]);
  }

  /* 한 사람에게 다가가기 — 모두 돕지 않아도 됩니다 */
  helpAsk() {
    if (this.flags.helped) { this.dialogue.say(['오늘은 여기까지도 충분하다.']); return; }
    const opts = DAY07.help.people.map(p => ({ key: p.key, label: p.label }));
    this.dialogue.choose(DAY07.help.prompt, opts, (key) => {
      const p = DAY07.help.people.find(o => o.key === key);
      SaveSystem.set('reflections.day7Help', p.label);
      this.dialogue.play(p.lines, () => {
        if (p.kind === 'ball') this.ballTask(p);
        else if (p.kind === 'chair') this.chairTask(p);
        else this.helpDone();
      });
    });
  }

  /* 나뭇가지 사이의 공을 밀어냅니다 */
  ballTask(p) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.setInputLocked(true);
    const cam = this.cameras.main;
    const layer = this.add.container(0, 0).setDepth(880).setScrollFactor(0);
    const scrim = this.add.graphics().setScrollFactor(0);
    scrim.fillStyle(0x101a2e, 0.86); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 200, DAY07.help.ballHint,
      UI.style(19, PAL.cream, { align: 'center', wordWrap: { width: W - 70 } })).setOrigin(0.5)
      .setScrollFactor(0));

    const tree = this.add.image(W / 2, 420, 'tree_big').setScale(1.3).setScrollFactor(0);
    layer.add(tree);
    const ball = this.add.image(W / 2 - 40, 420, 'ball_stuck').setScale(1.5).setScrollFactor(0);
    layer.add(ball);

    let taps = 0;
    const push = UI.button(this, W / 2, 620, 250, 60, '→  밀어낸다', () => {
      taps++;
      AudioSystem.tap();
      this.tweens.add({ targets: ball, x: ball.x + 32, duration: 220 });
      if (taps >= 3) {
        push.destroy();
        this.tweens.add({
          targets: ball, x: W / 2 + 120, y: 560, angle: 260, duration: 700,
          onComplete: () => {
            layer.destroy();
            this.setInputLocked(false);
            this.dialogue.play(p.after, () => this.helpDone());
          }
        });
      }
    }, { size: FONT.label, fill: PAL.sun });
    push.setScrollFactor(0).setDepth(890);
    layer.add(push);
  }

  /* 의자를 하나씩 옮깁니다 */
  chairTask(p) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.setInputLocked(true);
    const layer = this.add.container(0, 0).setDepth(880).setScrollFactor(0);
    const scrim = this.add.graphics().setScrollFactor(0);
    scrim.fillStyle(0x101a2e, 0.86); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 200, DAY07.help.chairHint,
      UI.style(19, PAL.cream, { align: 'center', wordWrap: { width: W - 70 } })).setOrigin(0.5)
      .setScrollFactor(0));

    let left = 3;
    [90, 195, 300].forEach((x, i) => {
      const ch = this.add.image(x, 400, 'chair_item').setScale(1.5).setScrollFactor(0);
      ch.setInteractive();
      layer.add(ch);
      ch.on('pointerup', () => {
        ch.disableInteractive();
        AudioSystem.tap();
        this.tweens.add({
          targets: ch, y: 600, x: 90 + i * 105, duration: 500,
          onComplete: () => {
            left--;
            if (left === 0) {
              this.time.delayedCall(500, () => {
                layer.destroy();
                this.setInputLocked(false);
                this.dialogue.play(p.after, () => this.helpDone());
              });
            }
          }
        });
      });
    });
  }

  helpDone() {
    this.flags.helped = true;
    this.disableInteractable('d7_help');
    this.dialogue.play(DAY07.help.noReward, () => {
      this.dialogue.play(DAY07.help.after, () => {
        this.dialogue.say(DAY07.help.card, () => {
          Collection.award(this, 'b22', () => {
            this.enableInteractable('d7_out');
            this.objective.setText(DAY07.town.objectiveOut);
          });
        });
      });
    });
  }

  /* 벤치 옆의 성인 카드 */
  bench() {
    if (this.flags.bench) { this.dialogue.say(['벤치 옆은 이제 조용하다.']); return; }
    this.flags.bench = true;
    this.disableInteractable('d7_bench');
    this.dialogue.say(DAY07.town.bench, () => Collection.award(this, 's14'));
  }

  onMiniGameDone(key) {
    if (key !== 'NoticeScene') return;
    this.flags.notice = true;
    this.disableInteractable('d7_notice');
    this.enableInteractable('d7_help');
    this.enableInteractable('d7_bench');
    this.objective.setText(DAY07.town.objective2);
    AudioSystem.chime();
  }

  goOut() {
    this.goScene('Day7ChurchScene', {}, [200, 170, 140]);
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
