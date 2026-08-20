/* DAY 4 · 월요일 아침 */

window.Day4RoomScene = class Day4RoomScene extends WorldScene {
  constructor() { super('Day4RoomScene'); }

  create(data) {
    data = data || {};
    this.initWorld({ width: GAME.WIDTH, height: GAME.HEIGHT, speed: 104 });
    SaveSystem.checkpoint('Day4RoomScene', { fed: !!data.fed });
    AudioSystem.unlock();
    AudioSystem.setAmbience('room');

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const D = DAY04.room;
    this.fed = !!data.fed;

    this.add.tileSprite(W / 2, 92, W, 185, 'wall_tile').setDepth(0).setTint(0xf7e6cc);
    this.add.tileSprite(W / 2, (185 + H) / 2, W, H - 185, 'floor_tile').setDepth(0).setTint(0xdcc09a);
    const base = this.add.graphics().setDepth(1);
    base.fillStyle(HEX(PAL.woodDark), 0.6); base.fillRect(0, 179, W, 10);

    this.addProp(286, 128, 'poster', { originY: 0.5, depth: 4, scale: 1.3 });
    this.addProp(206, 606, 'rug', { originY: 0.5, depth: 3, scale: 0.86 });
    this.addProp(200, 318, 'lamp_room', { depth: 322, scale: 1.2 });
    this.addProp(348, 300, 'shelf', { scale: 1.2, solid: true, solidW: 52, solidH: 14 });

    this.addInteractable({
      id: 'd4_window', x: 160, y: 152, texture: 'window_warm', originY: 1, depth: 4, scale: 1.15,
      label: '내다보기', range: 74, markerY: 108, onInteract: () => this.look('window', 'd4_window')
    });
    this.addInteractable({
      id: 'd4_desk', x: 150, y: 330, texture: 'desk', label: '책상', scale: 1.2,
      solid: true, solidW: 78, solidH: 14, onInteract: () => this.look('desk', 'd4_desk')
    });
    this.addInteractable({
      id: 'd4_bed', x: 312, y: 460, texture: 'bed', label: '침대', scale: 1.15,
      solid: true, solidW: 70, solidH: 86, solidOffY: -46, markerY: 380,
      onInteract: () => this.look('bed', 'd4_bed')
    });
    this.addInteractable({
      id: 'd4_bag', x: 168, y: 560, texture: 'bag', label: '가방', scale: 1.2,
      onInteract: () => this.look('bag', 'd4_bag')
    });
    this.addInteractable({
      id: 'd4_rosary', x: 66, y: 596, texture: 'rosary', label: '묵주', scale: 1.5,
      onInteract: () => this.look('rosary', 'd4_rosary')
    });
    this.phoneItem = this.addInteractable({
      id: 'd4_phone', x: 268, y: 660, texture: 'phone_obj', label: '스마트폰', scale: 1.25,
      onInteract: () => this.openFeed()
    });
    this.doorItem = this.addInteractable({
      id: 'd4_door', x: 52, y: 186, texture: 'door', originY: 1, depth: 5, scale: 1.15,
      label: '학교로', range: 78, markerY: 118, onInteract: () => this.goOut()
    });

    this.createPlayer(200, 726);
    this.physics.world.setBounds(16, 208, GAME.WIDTH - 32, 570);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('월요일 아침, 내 방');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, this.fed ? D.objectiveOut : D.objective);

    if (!this.fed) this.disableInteractable('d4_door');
    else this.disableInteractable('d4_phone');

    UI.fadeIn(this, 900);

    if (!data.fed) {
      this.setInputLocked(true);
      UI.caption(this, DAY04.intro, {
        y: H * 0.34, hold: 1300,
        onDone: () => this.dialogue.play(D.wake, () => this.setInputLocked(false))
      });
    }
  }

  look(key, id) {
    const lines = DAY04.room.objects[key] || ['…'];
    this.noteFound(id); AudioSystem.found();
    this.dialogue.say(lines);
  }

  openFeed() {
    if (this.fed) { this.dialogue.say(['이제 그만 보자.']); return; }
    this.openMiniGame('FeedScene');
  }

  onMiniGameDone(key) {
    if (key !== 'FeedScene') return;
    this.fed = true;
    SaveSystem.checkpoint('Day4RoomScene', { fed: true });
    this.disableInteractable('d4_phone');
    this.enableInteractable('d4_door');
    this.objective.setText(DAY04.room.objectiveOut);
    AudioSystem.chime();
  }

  goOut() {
    this.goScene('Day4SchoolScene', {}, [222, 226, 232]);
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
