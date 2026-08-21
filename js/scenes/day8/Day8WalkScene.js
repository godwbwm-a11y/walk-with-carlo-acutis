/* DAY 8 · 하교 — 목표 표시도, 미션 알림도 없습니다.
   가방 속의 돌도, 도움이 필요한 사람도, 플레이어가 먼저 알아봅니다. */

window.Day8WalkScene = class Day8WalkScene extends WorldScene {
  constructor() { super('Day8WalkScene'); }

  create() {
    this.initWorld({ width: 1900, height: GAME.HEIGHT, speed: 110 });
    SaveSystem.checkpoint('Day8WalkScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();

    const H = GAME.HEIGHT;
    this.flags = { bag: false, stone: false, helped: false, door: false };

    this.add.image(0, 0, 'sky_evening').setOrigin(0, 0).setDisplaySize(1900, 400).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0xc0b49c, 1); g.fillRect(0, 380, 1900, H - 380);
    g.fillStyle(0xccc0a8, 1); g.fillRect(0, 380, 1900, 12);
    g.fillStyle(0xb0a48e, 1); g.fillRect(0, 700, 1900, H - 700);
    for (let x = 0; x < 1900; x += 110) { g.fillStyle(0xc7bba4, 0.7); g.fillRect(x + 12, 748, 60, 6); }

    this.add.image(200, 420, 'store_front').setDepth(420).setScale(0.95);
    this.add.image(520, 400, 'tree_big').setDepth(400).setScale(0.95);
    this.add.image(660, 420, 'bench').setDepth(420).setScale(1.0);
    this.add.image(1080, 400, 'house_a').setDepth(400).setScale(1.0);
    this.add.image(1560, 392, 'church_front').setDepth(392).setScale(0.92);

    /* 돌무더기 — DAY 2 에서 내려놓았던 그 자리 */
    this.pile = this.add.image(820, 470, 'stone_pile').setDepth(470).setScale(1.0);

    /* 도움이 필요한 사람들 — 아무 표시도 붙지 않습니다 */
    this.helpers = [];
    const people = [
      ['box', 1450, 520, 'resident_front'],
      ['ball', 600, 540, 'child_front'],
      ['stairs', 1080, 530, 'grandma_front'],
      ['drop', 300, 546, 'villager_front']
    ];
    people.forEach((p) => {
      const img = this.add.image(p[1], p[2], p[3]).setDepth(p[2]).setScale(1.16);
      this.tweens.add({ targets: img, y: p[2] - 4, duration: 900 + Math.random() * 400, yoyo: true, repeat: -1 });
      this.addInteractable({
        id: 'd8_' + p[0], x: p[1], y: 700, label: '다가간다', range: 72, priority: 1,
        marker: false, onInteract: () => this.help(p[0])
      });
      this.helpers.push(img);
    });
    this.add.image(1450, 486, 'big_backpack').setDepth(487).setScale(0.7).setAlpha(0.9);
    this.add.image(600, 508, 'ball_stuck').setDepth(509).setScale(0.9).setAlpha(0.9);

    this.bagItem = this.addInteractable({
      id: 'd8_bag', x: 780, y: 700, label: '가방', range: 84, priority: 2, marker: false,
      onInteract: () => this.openBag()
    });
    this.doorItem = this.addInteractable({
      id: 'd8_door', x: 1560, y: 700, label: '성당 문', range: 86, priority: 2, marker: false,
      onInteract: () => this.churchDoor()
    });

    this.createPlayer(110, 700);
    this.physics.world.setBounds(40, 640, 1840, 140);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('금요일 오후, 돌아가는 길');
    this.pauseBtn = UI.pauseButton(this);

    UI.fadeIn(this, 900, [214, 210, 196]);
    this.setInputLocked(true);
    this.time.delayedCall(700, () => this.dialogue.play(DAY08.walk.arrive, () => {
      this.setInputLocked(false);
      /* 돌무더기 근처에 오면 가방이 저절로 무거워집니다 */
      this.bagWatch = true;
    }));
  }

  /* 가방 — 카를로도, 안내도, 음악도 없습니다 */
  openBag() {
    if (this.flags.bag) {
      if (!this.flags.stone) { this.stonePuzzle(); return; }
      this.dialogue.say(['가방이 조금 가벼워졌다.']);
      return;
    }
    this.flags.bag = true;
    this.setInputLocked(true);
    this.dialogue.play(DAY08.walk.bagStop, () => this.stonePuzzle());
  }

  stonePuzzle() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.setInputLocked(true);

    const layer = this.add.container(0, 0).setDepth(880).setScrollFactor(0);
    const scrim = this.add.graphics().setScrollFactor(0);
    scrim.fillStyle(0x101a2e, 0.9); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    /* DAY 2 에서 내려놓았던 것, 또는 오늘의 작은 걱정 */
    const old = SaveSystem.get('reflections.entrustedConcern', null);
    const word = old || Phaser.Utils.Array.GetRandom(DAY08.walk.stoneWords);

    const pile = this.add.image(W / 2, 620, 'stone_pile').setScale(1.1).setScrollFactor(0);
    layer.add(pile);

    const stone = this.add.container(W / 2, 300).setScrollFactor(0);
    stone.add(this.add.image(0, 0, 'stone_one').setScale(1.5));
    stone.add(this.add.text(0, 0, word, UI.style(FONT.small, PAL.cream)).setOrigin(0.5));
    stone.setSize(90, 74);
    stone.setInteractive({ draggable: true, useHandCursor: true });
    layer.add(stone);

    const hint = this.add.text(W / 2, 180, DAY08.walk.stoneHint,
      UI.style(FONT.small, '#cbd8ea', { align: 'center', wordWrap: { width: W - 70 } }))
      .setOrigin(0.5).setScrollFactor(0);
    layer.add(hint);

    this.input.on('drag', this.stoneDrag = (p, obj, dx, dy) => {
      if (obj !== stone) return;
      obj.x = Phaser.Math.Clamp(dx, 40, W - 40);
      obj.y = Phaser.Math.Clamp(dy, 200, 660);
    });
    this.input.on('dragend', this.stoneEnd = (p, obj) => {
      if (obj !== stone || this.flags.stone) return;
      if (Phaser.Math.Distance.Between(obj.x, obj.y, W / 2, 620) > 110) return;
      this.flags.stone = true;
      SaveSystem.set('reflections.day8Stone', word);
      this.input.off('drag', this.stoneDrag);
      this.input.off('dragend', this.stoneEnd);
      stone.disableInteractive();
      AudioSystem.kick();
      hint.setText('');
      this.tweens.add({
        targets: stone, x: W / 2, y: 606, duration: 400, ease: 'Sine.easeIn',
        onComplete: () => this.afterStone(layer)
      });
    });
  }

  /* DAY 2 에서 카를로가 했던 말을 이번에는 플레이어가 합니다 */
  afterStone(layer) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.dialogue.play(DAY08.walk.stoneDrop, () => {
      const a = this.add.text(W / 2, 300, DAY08.walk.stoneLine1, UI.style(23, PAL.cream))
        .setOrigin(0.5).setDepth(890).setScrollFactor(0).setAlpha(0);
      layer.add(a);
      this.tweens.add({ targets: a, alpha: 1, duration: 1000 });

      this.time.delayedCall(2400, () => {
        const b = this.add.text(W / 2, 352, DAY08.walk.stoneLine2, UI.style(25, PAL.sun, {
          align: 'center', wordWrap: { width: W - 70 }
        })).setOrigin(0.5).setDepth(890).setScrollFactor(0).setAlpha(0);
        layer.add(b);
        this.tweens.add({ targets: b, alpha: 1, duration: 1000 });
        AudioSystem.chime();

        this.time.delayedCall(3000, () => this.remembered(layer));
      });
    });
  }

  /* 새 말씀이 아니라, 전에 받은 말씀이 다시 생각납니다 */
  remembered(layer) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const card = COLLECTION.get('b12');
    const had = Collection.has('b12');

    const t1 = this.add.text(W / 2, 460, DAY08.walk.remembered1, UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(890).setScrollFactor(0).setAlpha(0);
    const t2 = this.add.text(W / 2, 492, DAY08.walk.remembered2, UI.style(FONT.small, PAL.cream))
      .setOrigin(0.5).setDepth(890).setScrollFactor(0).setAlpha(0);
    layer.add(t1); layer.add(t2);
    this.tweens.add({ targets: t1, alpha: 1, duration: 900 });
    this.tweens.add({ targets: t2, alpha: 1, duration: 900, delay: 1200 });

    const glow = this.add.image(W / 2, 560, 'glow_small').setDepth(889)
      .setScrollFactor(0).setScale(2.2).setAlpha(0);
    layer.add(glow);
    this.tweens.add({ targets: glow, alpha: 0.9, duration: 1400, delay: 800, yoyo: true });

    const q = this.add.text(W / 2, 560, card ? card.text : '', UI.style(17, PAL.sun, {
      align: 'center', lineSpacing: 6, wordWrap: { width: W - 80 }
    })).setOrigin(0.5).setDepth(891).setScrollFactor(0).setAlpha(0);
    layer.add(q);
    this.tweens.add({ targets: q, alpha: 1, duration: 1000, delay: 1600 });

    if (!had) Collection.unlock('b12');

    this.time.delayedCall(4600, () => {
      const b = UI.button(this, W / 2, H - 120, 250, 56, '다시 걷는다', () => {
        layer.destroy();
        this.setInputLocked(false);
      }, { size: FONT.small, fill: PAL.sun });
      b.setScrollFactor(0);
      layer.add(b);
    });
  }

  /* 도움 — 아무 지시도 없습니다. 지나가도 됩니다. */
  help(id) {
    const h = DAY08.walk.helps.find(o => o.id === id);
    if (!h) return;
    if (this.helped && this.helped[id]) { this.dialogue.say(['고맙다는 인사를 받았다.']); return; }
    this.helped = this.helped || {};
    this.helped[id] = true;

    this.dialogue.play(h.lines, () => {
      if (this.flags.helped) return;
      this.flags.helped = true;
      SaveSystem.set('reflections.day8Help', h.label);
      this.dialogue.play(DAY08.walk.helpAfter, () => {
        this.time.delayedCall(900, () => this.dialogue.play(DAY08.walk.helpSmile));
      });
    });
  }

  /* 성당 문 — 들어가도, 지나가도 됩니다 */
  churchDoor() {
    if (this.flags.door) { this.goBeach(); return; }
    this.flags.door = true;
    this.setInputLocked(true);
    this.dialogue.play(DAY08.walk.churchDoor, () => {
      this.dialogue.choose(DAY08.walk.churchPrompt, DAY08.walk.churchChoices, (key) => {
        SaveSystem.set('reflections.day8Church', key);
        if (key === 'in') {
          this.goScene('Day8ChurchScene', {}, [20, 26, 44]);
        } else {
          this.dialogue.play(DAY08.walk.passLines, () => this.goBeach());
        }
      });
    });
  }

  goBeach() {
    this.goScene('Day8BeachScene', {}, [200, 170, 140]);
  }

  update(time, delta) {
    this.updateWorld(time, delta);
    /* 돌무더기 근처에서 가방이 무거워집니다 */
    if (this.bagWatch && !this.flags.bag && this.player &&
        Math.abs(this.player.x - 780) < 90) {
      this.bagWatch = false;
      this.openBag();
    }
  }
};
