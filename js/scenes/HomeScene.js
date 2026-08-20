/* DAY 1 · SCENE 1 — 금요일 저녁, 집 */

window.HomeScene = class HomeScene extends WorldScene {
  constructor() { super('HomeScene'); }

  create(data) {
    data = data || {};
    this.initWorld({ width: GAME.WIDTH, height: GAME.HEIGHT, speed: 104 });
    SaveSystem.checkpoint('HomeScene');
    AudioSystem.unlock();
    AudioSystem.setAmbience('room');

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const D = DAY01.home;
    this.talked = false;

    /* 벽과 바닥 */
    this.add.tileSprite(W / 2, 92, W, 185, 'wall_tile').setDepth(0).setTint(0xf8e8d0);
    this.add.tileSprite(W / 2, (185 + H) / 2, W, H - 185, 'floor_tile').setDepth(0).setTint(0xd8bb90);
    const baseboard = this.add.graphics().setDepth(1);
    baseboard.fillStyle(HEX(PAL.woodDark), 0.7); baseboard.fillRect(0, 179, W, 10);

    /* 저녁 햇빛 */
    const sun = this.add.graphics().setDepth(2);
    for (let i = 0; i < 4; i++) {                    // 부드럽게 번지는 늦은 오후 햇빛
      sun.fillStyle(0xfbe4bb, 0.07);
      sun.fillTriangle(62 - i * 8, 189, 196 + i * 14, 189, 44 - i * 10, 470 + i * 40);
    }
    sun.setAlpha(0.7);
    this.tweens.add({ targets: sun, alpha: 1, duration: 4600, yoyo: true, repeat: -1 });

    this.addProp(200, 646, 'rug', { originY: 0.5, depth: 3, scale: 1.15 });

    /* 벽 오브젝트 */
    this.addInteractable({
      id: 'home_window', x: 96, y: 152, texture: 'window_warm', originY: 1, depth: 4, scale: 1.15,
      label: '내다보기', range: 74, markerY: 108,
      onInteract: () => this.look('window', 'home_window')
    });

    /* 내 방 문 */
    this.doorItem = this.addInteractable({
      id: 'home_door', x: 300, y: 186, texture: 'door', originY: 1, depth: 5, scale: 1.15,
      label: '방으로', range: 76, markerY: 118,
      onInteract: () => this.enterRoom()
    });

    /* 가구 */
    this.addInteractable({
      id: 'home_fridge', x: 52, y: 300, texture: 'fridge', label: '살펴보기', scale: 1.2, solid: true, solidW: 52, solidH: 14,
      onInteract: () => this.look('fridge', 'home_fridge')
    });
    this.addInteractable({
      id: 'home_table', x: 176, y: 352, texture: 'table', label: '살펴보기', scale: 1.2, solid: true, solidW: 84, solidH: 16,
      onInteract: () => this.look('table', 'home_table')
    });
    this.addInteractable({
      id: 'home_tv', x: 332, y: 452, texture: 'tv', label: '살펴보기', scale: 1.2, solid: true, solidW: 68, solidH: 14,
      onInteract: () => this.look('tv', 'home_tv')
    });
    this.addInteractable({
      id: 'home_sofa', x: 104, y: 566, texture: 'sofa', label: '앉아보기', scale: 1.2, solid: true, solidW: 96, solidH: 14,
      onInteract: () => this.look('sofa', 'home_sofa')
    });
    this.addProp(320, 626, 'plant', { scale: 1.2 });
    this.addProp(360, 640, 'plant', { scale: 0.95 });
    this.addInteractable({
      id: 'home_plant', x: 340, y: 632, label: '물 주기', range: 82, marker: true, markerY: 578,
      onInteract: () => this.openMiniGame('WaterPlantScene')
    });

    /* 엄마 */
    this.mom = this.add.image(120, 292, 'mom_front').setOrigin(0.5, 0.9).setDepth(292).setScale(1.12);
    this.add.image(120, 296, 'shadow').setDepth(291).setAlpha(0.6);
    this.tweens.add({ targets: this.mom, y: 289, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.momItem = this.addInteractable({
      id: 'home_mom', x: 120, y: 300, label: '말 걸기', range: 100, priority: 2, markerY: 246,
      onInteract: () => this.talkToMom()
    });

    /* 주인공 */
    this.createPlayer(200, 726);
    this.physics.world.setBounds(16, 208, GAME.WIDTH - 32, 570);   // 바닥 위에서만 걷습니다
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('우리 집 거실');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, D.objective);

    UI.fadeIn(this, 800);

    if (data.intro) {
      this.setInputLocked(true);
      UI.caption(this, DAY01.opening, {
        y: H * 0.4, hold: 1500,
        onDone: () => this.setInputLocked(false)
      });
    }
  }

  look(key, id) {
    const lines = DAY01.home.objects[key] || ['…'];
    this.noteFound(id);
    AudioSystem.found();
    this.dialogue.say(lines);
  }

  talkToMom() {
    const D = DAY01.home;
    if (this.dishesDone) {
      this.dialogue.play([{ s: '엄마', t: '가서 좀 쉬어. 내일 얘기하자.' }]);
      return;
    }
    if (this.talked) {
      this.dialogue.play([
        { s: '엄마', t: '아, 설거지 좀 도와줄래?' },
        { s: '엄마', t: '금방이야.' }
      ], () => {
        this.dialogue.choose('', [
          { key: 'yes', label: '도와드릴게요' },
          { key: 'no', label: '조금 이따가요' }
        ], (k) => {
          if (k === 'yes') this.openMiniGame('HelpMomScene');
        });
      });
      return;
    }
    this.dialogue.play(D.family, () => {
      this.dialogue.choose('', D.choices, (key) => {
        SaveSystem.set('reflections.familyChoice', key);
        const reply = D.choiceReply[key] || [];
        this.dialogue.play(reply.concat(D.familyEnd), () => {
          this.talked = true;
          this.momItem.label = '도와드리기';
          this.objective.setText(DAY01.home.objectiveAfter);
          AudioSystem.chime();
          Collection.award(this, 'b7');
        });
      });
    });
  }

  onMiniGameDone(key) {
    if (key === 'HelpMomScene') {
      this.dishesDone = true;
      this.momItem.label = '말 걸기';
    }
  }

  enterRoom() {
    if (!this.talked) {
      this.dialogue.play([{ s: '나', t: '…엄마가 뭐라고 하려던 것 같은데.' }]);
      return;
    }
    this.goScene('RoomScene', { intro: true });
  }

  update(time, delta) {
    this.updateWorld(time, delta);
  }
};
