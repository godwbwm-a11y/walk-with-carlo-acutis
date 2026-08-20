/* DAY 7 · 목요일 아침 — 눈을 뜨니 다시 내 방입니다. */

window.Day7RoomScene = class Day7RoomScene extends WorldScene {
  constructor() { super('Day7RoomScene'); }

  create(data) {
    data = data || {};
    this.initWorld({ width: GAME.WIDTH, height: GAME.HEIGHT, speed: 104 });
    SaveSystem.checkpoint('Day7RoomScene', {});
    AudioSystem.unlock();
    AudioSystem.setAmbience('room');

    const W = GAME.WIDTH, H = GAME.HEIGHT, D = DAY07.room;
    this.flags = { rosary: false };

    this.add.tileSprite(W / 2, 92, W, 185, 'wall_tile').setDepth(0).setTint(0xf7e6cc);
    this.add.tileSprite(W / 2, (185 + H) / 2, W, H - 185, 'floor_tile').setDepth(0).setTint(0xdcc09a);
    const base = this.add.graphics().setDepth(1);
    base.fillStyle(HEX(PAL.woodDark), 0.6); base.fillRect(0, 179, W, 10);

    this.addProp(286, 128, 'poster', { originY: 0.5, depth: 4, scale: 1.3 });
    this.addProp(206, 606, 'rug', { originY: 0.5, depth: 3, scale: 0.86 });
    this.addProp(200, 318, 'lamp_room', { depth: 322, scale: 1.2 });
    this.addProp(348, 300, 'shelf', { scale: 1.2, solid: true, solidW: 52, solidH: 14 });

    this.windowItem = this.addInteractable({
      id: 'd7_window', x: 160, y: 152, texture: 'window_warm', originY: 1, depth: 4, scale: 1.15,
      label: '창문', range: 78, markerY: 108, onInteract: () => this.openWindow()
    });
    this.addInteractable({
      id: 'd7_desk', x: 150, y: 330, texture: 'desk', label: '책상', scale: 1.2,
      solid: true, solidW: 78, solidH: 14, onInteract: () => this.look('desk', 'd7_desk')
    });
    this.addInteractable({
      id: 'd7_bed', x: 312, y: 460, texture: 'bed', label: '침대', scale: 1.15,
      solid: true, solidW: 70, solidH: 86, solidOffY: -46, markerY: 380,
      onInteract: () => this.look('bed', 'd7_bed')
    });
    this.addInteractable({
      id: 'd7_bag', x: 168, y: 560, texture: 'bag', label: '학교 가방', scale: 1.2,
      onInteract: () => this.look('bag', 'd7_bag')
    });
    this.addInteractable({
      id: 'd7_game', x: 300, y: 596, texture: 'console_toy', label: '게임기', scale: 1.2,
      onInteract: () => this.look('game', 'd7_game')
    });
    this.addInteractable({
      id: 'd7_phone', x: 240, y: 700, texture: 'phone_obj', label: '스마트폰', scale: 1.2,
      onInteract: () => this.look('phone', 'd7_phone')
    });

    /* 묵주 옆에 WYD 팔찌 */
    this.rosaryItem = this.addInteractable({
      id: 'd7_rosary', x: 66, y: 596, texture: 'rosary', label: '묵주', scale: 1.5,
      priority: 1, onInteract: () => this.lookRosary()
    });
    this.band = this.add.image(96, 606, 'wyd_band_small').setDepth(607).setScale(1.1);

    this.createPlayer(200, 726);
    this.physics.world.setBounds(16, 208, GAME.WIDTH - 32, 570);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('목요일 아침, 내 방');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, D.objective);

    this.disableInteractable('d7_window');

    UI.fadeIn(this, 1200, [8, 10, 18]);

    this.setInputLocked(true);
    UI.caption(this, DAY07.intro, {
      y: H * 0.34, hold: 1300,
      onDone: () => this.dialogue.play(DAY07.wake, () => this.setInputLocked(false))
    });
  }

  look(key, id) {
    this.noteFound(id); AudioSystem.found();
    this.dialogue.say(DAY07.room.objects[key] || ['…']);
  }

  /* 묵주 옆의 WYD 팔찌 — 꿈이 아니었을지도 모릅니다 */
  lookRosary() {
    if (this.flags.rosary) { this.dialogue.say(['팔찌는 그대로 있다.']); return; }
    this.flags.rosary = true;
    this.noteFound('d7_rosary');
    AudioSystem.found();
    this.tweens.add({ targets: this.band, scale: 1.4, duration: 400, yoyo: true });
    this.dialogue.play(DAY07.room.rosary, () => {
      this.enableInteractable('d7_window');
      this.objective.setText(DAY07.room.objectiveOut);
    });
  }

  openWindow() {
    this.setInputLocked(true);
    this.dialogue.play(DAY07.room.window, () => {
      UI.caption(this, DAY07.room.caption, {
        y: GAME.HEIGHT * 0.36, hold: 1500,
        onDone: () => this.goScene('Day7SchoolScene', {}, [222, 226, 232])
      });
    });
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
