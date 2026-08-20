/* DAY 2 · 아침 — 내 방에서 나갈 준비를 한다 */

window.Day2RoomScene = class Day2RoomScene extends WorldScene {
  constructor() { super('Day2RoomScene'); }

  create(data) {
    data = data || {};
    this.initWorld({ width: GAME.WIDTH, height: GAME.HEIGHT, speed: 104 });
    SaveSystem.checkpoint('Day2RoomScene', { phoneDone: !!data.phoneDone, packed: !!data.packed });
    AudioSystem.unlock();
    AudioSystem.setAmbience('room');

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const D = DAY02.room;
    this.phoneDone = !!data.phoneDone;
    this.packed = !!data.packed;

    /* 토요일 아침의 방 */
    this.add.tileSprite(W / 2, 92, W, 185, 'wall_tile').setDepth(0).setTint(0xfdf0da);
    this.add.tileSprite(W / 2, (185 + H) / 2, W, H - 185, 'floor_tile').setDepth(0).setTint(0xe2c99f);
    const base = this.add.graphics().setDepth(1);
    base.fillStyle(HEX(PAL.woodDark), 0.6); base.fillRect(0, 179, W, 10);

    const sun = this.add.graphics().setDepth(2);
    for (let i = 0; i < 4; i++) {
      sun.fillStyle(0xfff1d0, 0.08);
      sun.fillTriangle(120 - i * 8, 189, 250 + i * 14, 189, 96 - i * 12, 520 + i * 40);
    }
    this.tweens.add({ targets: sun, alpha: 0.75, duration: 5000, yoyo: true, repeat: -1 });

    this.addProp(286, 128, 'poster', { originY: 0.5, depth: 4, scale: 1.3 });
    this.addProp(206, 606, 'rug', { originY: 0.5, depth: 3, scale: 0.86 });
    this.addProp(200, 318, 'lamp_room', { depth: 322, scale: 1.2 });

    /* 거울 */
    const m = this.add.graphics().setDepth(300);
    m.fillStyle(HEX(PAL.woodDark), 1); m.fillRoundedRect(28, 236, 56, 104, 12);
    m.fillStyle(0xdfeaf2, 1); m.fillRoundedRect(33, 241, 46, 94, 9);
    m.fillStyle(0xffffff, 0.45); m.fillTriangle(36, 330, 70, 246, 78, 246);

    this.addInteractable({
      id: 'd2_mirror', x: 56, y: 344, label: '거울 보기', range: 74, markerY: 226,
      onInteract: () => this.lookVariant('mirror', 'd2_mirror')
    });
    this.addInteractable({
      id: 'd2_window', x: 160, y: 152, texture: 'window_warm', originY: 1, depth: 4, scale: 1.15,
      label: '내다보기', range: 74, markerY: 108,
      onInteract: () => this.look('window', 'd2_window')
    });
    this.addInteractable({
      id: 'd2_desk', x: 150, y: 330, texture: 'desk', label: '책상', scale: 1.2,
      solid: true, solidW: 78, solidH: 14,
      onInteract: () => this.lookVariant('desk', 'd2_desk')
    });
    this.addInteractable({
      id: 'd2_shelf', x: 348, y: 300, texture: 'shelf', label: '책장', scale: 1.2,
      solid: true, solidW: 52, solidH: 14, markerY: 236,
      onInteract: () => this.dialogue.say(['어제 정리해 둔 책장.', '성경책은 맨 아래 칸에 있다.'])
    });
    this.addInteractable({
      id: 'd2_bed', x: 312, y: 460, texture: 'bed', label: '침대', scale: 1.15,
      solid: true, solidW: 70, solidH: 86, solidOffY: -46, markerY: 380,
      onInteract: () => this.look('bed', 'd2_bed')
    });
    this.addInteractable({
      id: 'd2_rosary', x: 66, y: 596, texture: 'rosary', label: '살펴보기', scale: 1.5,
      onInteract: () => this.look('rosary', 'd2_rosary')
    });

    this.bagItem = this.addInteractable({
      id: 'd2_bag', x: 168, y: 560, texture: 'bag', label: '나갈 준비', scale: 1.2,
      onInteract: () => this.openPrepare()
    });
    this.phoneItem = this.addInteractable({
      id: 'd2_phone', x: 268, y: 660, texture: 'phone_obj', label: '스마트폰', scale: 1.25,
      onInteract: () => this.openPhone()
    });
    this.doorItem = this.addInteractable({
      id: 'd2_door', x: 52, y: 186, texture: 'door', originY: 1, depth: 5, scale: 1.15,
      label: '밖으로', range: 78, markerY: 118,
      onInteract: () => this.goOut()
    });

    this.createPlayer(200, 726);
    this.physics.world.setBounds(16, 208, GAME.WIDTH - 32, 570);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('토요일 아침, 내 방');
    this.pauseBtn = UI.pauseButton(this);

    this.objective = UI.objective(this, this.packed ? D.objectiveOut : (this.phoneDone ? D.objectiveAfter : D.objective));
    if (!this.phoneDone) this.disableInteractable('d2_bag');
    if (!this.packed) this.disableInteractable('d2_door');

    UI.fadeIn(this, 900);

    if (!data.phoneDone && !data.packed) {
      this.setInputLocked(true);
      UI.caption(this, DAY02.intro, {
        y: H * 0.36, hold: 1500,
        onDone: () => this.dialogue.play(D.wake, () => this.setInputLocked(false))
      });
    }
    if (data.packed) {
      this.setInputLocked(true);
      this.time.delayedCall(400, () => {
        this.dialogue.say(DAY02.prepare.done, () => {
          this.enableInteractable('d2_door');
          this.objective.setText(D.objectiveOut);
          this.setInputLocked(false);
        });
      });
    }
  }

  look(key, id) {
    const lines = DAY02.room.objects[key] || ['…'];
    this.noteFound(id); AudioSystem.found();
    this.dialogue.say(lines);
  }

  /* DAY 1 에서 고른 마음에 따라 달라지는 오브젝트 */
  lookVariant(key, id) {
    const node = DAY02.room.objects[key] || {};
    const concern = SaveSystem.get('reflections.mainConcern', null);
    const lines = (concern && node[concern]) ? node[concern] : node.default || ['…'];
    this.noteFound(id); AudioSystem.found();
    this.dialogue.say(lines);
  }

  openPhone() {
    if (this.phoneDone) { this.dialogue.say(DAY02.room.objects.sns); return; }
    if (this.stick) this.stick.reset();
    this.scene.launch('Day2PhoneScene', { from: this.scene.key });
    this.scene.pause();
  }

  openPrepare() {
    if (this.packed) { this.dialogue.say(['가방은 다 챙겼다.']); return; }
    this.openMiniGame('PrepareBagScene');
  }

  goOut() {
    this.goScene('Day2StreetScene', { fromRoom: true }, [250, 230, 200]);
  }

  onMiniGameDone(key) {
    if (key === 'PrepareBagScene') {
      this.packed = true;
      SaveSystem.checkpoint('Day2RoomScene', { phoneDone: true, packed: true });
      this.bagItem.label = '가방';
      this.setInputLocked(true);
      this.dialogue.say(DAY02.prepare.done, () => {
        this.enableInteractable('d2_door');
        this.objective.setText(DAY02.room.objectiveOut);
        AudioSystem.chime();
        this.setInputLocked(false);
      });
    }
  }

  onPhoneDone() {
    this.phoneDone = true;
    SaveSystem.checkpoint('Day2RoomScene', { phoneDone: true, packed: this.packed });
    this.enableInteractable('d2_bag');
    this.objective.setText(DAY02.room.objectiveAfter);
    this.setInputLocked(true);
    this.dialogue.say(DAY02.room.phone.after, () => this.setInputLocked(false));
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
