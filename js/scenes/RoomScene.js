/* DAY 1 · SCENE 1-B / 2 — 내 방, 그리고 잠들기 */

window.RoomScene = class RoomScene extends WorldScene {
  constructor() { super('RoomScene'); }

  create(data) {
    data = data || {};
    this.initWorld({ width: GAME.WIDTH, height: GAME.HEIGHT, speed: 104 });
    SaveSystem.checkpoint('RoomScene', { phoneDone: !!data.phoneDone });
    AudioSystem.unlock();
    AudioSystem.setAmbience('room');

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const D = DAY01.room;
    this.phoneDone = !!data.phoneDone;

    this.add.tileSprite(W / 2, 92, W, 185, 'wall_tile').setDepth(0).setTint(0xf7e2c4);
    this.add.tileSprite(W / 2, (185 + H) / 2, W, H - 185, 'floor_tile').setDepth(0).setTint(0xd6b98f);
    const base = this.add.graphics().setDepth(1);
    base.fillStyle(HEX(PAL.woodDark), 0.7); base.fillRect(0, 179, W, 10);

    /* 스탠드 불빛 */
    const glow = this.add.image(120, 360, 'lamp_glow').setDepth(2).setScale(2.2).setAlpha(0.55);
    this.tweens.add({ targets: glow, alpha: 0.35, duration: 3000, yoyo: true, repeat: -1 });

    this.addProp(286, 128, 'poster', { originY: 0.5, depth: 4, scale: 1.3 });
    this.addInteractable({
      id: 'room_poster', x: 300, y: 150, label: '살펴보기', range: 78, marker: false,
      onInteract: () => this.look('poster', 'room_poster')
    });

    this.addInteractable({
      id: 'room_window', x: 160, y: 152, texture: 'window_warm', originY: 1, depth: 4, scale: 1.15,
      label: '내다보기', range: 74, markerY: 108,
      onInteract: () => this.look('window', 'room_window')
    });

    this.addProp(52, 186, 'door', { originY: 1, depth: 5, alpha: 0.92, scale: 1.15 });

    this.addInteractable({
      id: 'room_desk', x: 150, y: 330, texture: 'desk', label: '살펴보기', scale: 1.2, solid: true, solidW: 78, solidH: 14,
      onInteract: () => this.look('desk', 'room_desk')
    });
    this.addProp(198, 318, 'lamp_room', { depth: 322, scale: 1.2 });

    this.addInteractable({
      id: 'room_bed', x: 312, y: 460, texture: 'bed', label: '잠들기', scale: 1.15, solid: true, solidW: 70, solidH: 86, solidOffY: -46,
      markerY: 380, onInteract: () => this.sleep()
    });

    this.addInteractable({
      id: 'room_console', x: 78, y: 470, texture: 'console_toy', label: '살펴보기', scale: 1.4,
      onInteract: () => this.look('console', 'room_console')
    });
    this.addInteractable({
      id: 'room_bag', x: 168, y: 560, texture: 'bag', label: '살펴보기', scale: 1.2,
      onInteract: () => this.look('bag', 'room_bag')
    });
    this.addInteractable({
      id: 'room_rosary', x: 66, y: 596, texture: 'rosary', label: '살펴보기', scale: 1.5,
      onInteract: () => this.look('rosary', 'room_rosary')
    });

    this.addProp(206, 606, 'rug', { originY: 0.5, depth: 3, scale: 0.86 });
    this.addProp(348, 300, 'shelf', { scale: 1.2, solid: true, solidW: 52, solidH: 14 });

    /* 스마트폰 */
    this.phoneItem = this.addInteractable({
      id: 'room_phone', x: 268, y: 660, texture: 'phone_obj', label: '스마트폰', scale: 1.25,
      onInteract: () => this.openPhone()
    });

    this.createPlayer(200, 726);
    this.physics.world.setBounds(16, 208, GAME.WIDTH - 32, 570);   // 바닥 위에서만 걷습니다
    this.stick = new Joystick(this);
    this.createActionButton();
    UI.pauseButton(this);
    this.objective = UI.objective(this, this.phoneDone ? D.objectiveAfter : D.objective);

    if (this.phoneDone) {
      this.disableInteractable('room_phone');
    } else {
      this.disableInteractable('room_bed');
    }

    UI.fadeIn(this, 700);

    if (data.phoneDone) {
      /* 미니게임을 마치고 돌아온 직후 — 독백 */
      this.setInputLocked(true);
      this.time.delayedCall(500, () => {
        this.dialogue.play(D.monologue, () => {
          this.enableInteractable('room_bed');
          this.objective.setText(D.objectiveAfter);
        });
      });
    }
  }

  look(key, id) {
    const lines = DAY01.room.objects[key] || ['…'];
    this.noteFound(id);
    AudioSystem.found();
    this.dialogue.say(lines);
  }

  openPhone() {
    if (this.stick) this.stick.destroy();
    UI.fadeOut(this, 500, () => this.scene.start('PhoneScene'), [8, 12, 24]);
  }

  sleep() {
    if (!this.phoneDone) {
      this.dialogue.play([{ s: '나', t: '…자기 전에 폰이나 한 번 볼까.' }]);
      return;
    }
    this.setInputLocked(true);
    this.dialogue.say(['불을 껐다.', '바람 소리가 천천히 파도 소리로 변한다.'], () => {
      AudioSystem.setAmbience('beach');
      if (this.stick) this.stick.destroy();
      UI.fadeOut(this, 1600, () => this.scene.start('DreamBeachScene'), [10, 16, 32]);
    });
  }

  update(time, delta) {
    this.updateWorld(time, delta);
  }
};
