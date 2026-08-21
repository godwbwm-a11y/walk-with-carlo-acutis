/* DAY 8 · 금요일 아침 — 창밖에 아무도 없습니다. */

window.Day8MorningScene = class Day8MorningScene extends WorldScene {
  constructor() { super('Day8MorningScene'); }

  create() {
    this.initWorld({ width: GAME.WIDTH, height: GAME.HEIGHT, speed: 104 });
    SaveSystem.checkpoint('Day8MorningScene', {});
    AudioSystem.unlock();
    AudioSystem.setAmbience('room');

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.flags = { window: false, note: false };

    this.add.tileSprite(W / 2, 92, W, 185, 'wall_tile').setDepth(0).setTint(0xf7e6cc);
    this.add.tileSprite(W / 2, (185 + H) / 2, W, H - 185, 'floor_tile').setDepth(0).setTint(0xdcc09a);
    const base = this.add.graphics().setDepth(1);
    base.fillStyle(HEX(PAL.woodDark), 0.6); base.fillRect(0, 179, W, 10);

    this.addProp(286, 128, 'poster', { originY: 0.5, depth: 4, scale: 1.3 });
    this.addProp(206, 606, 'rug', { originY: 0.5, depth: 3, scale: 0.86 });
    this.addProp(200, 318, 'lamp_room', { depth: 322, scale: 1.2 });
    this.addProp(348, 300, 'shelf', { scale: 1.2, solid: true, solidW: 52, solidH: 14 });
    this.addProp(300, 596, 'bag', { scale: 1.1, alpha: 0.95 });
    this.addProp(66, 596, 'rosary', { scale: 1.4, alpha: 0.9 });

    this.addInteractable({
      id: 'd8_window', x: 160, y: 152, texture: 'window_warm', originY: 1, depth: 4, scale: 1.15,
      label: '창문', range: 78, markerY: 108, priority: 2, onInteract: () => this.openWindow()
    });
    this.noteItem = this.addInteractable({
      id: 'd8_note', x: 150, y: 330, texture: 'desk', label: '여행 노트', scale: 1.2,
      solid: true, solidW: 78, solidH: 14, priority: 1, onInteract: () => this.openNote()
    });
    this.add.image(150, 306, 'note_small').setDepth(332).setScale(1.0);

    this.addInteractable({
      id: 'd8_bed', x: 312, y: 460, texture: 'bed', label: '침대', scale: 1.15,
      solid: true, solidW: 70, solidH: 86, solidOffY: -46, markerY: 380,
      onInteract: () => this.look('bed', 'd8_bed')
    });
    this.addInteractable({
      id: 'd8_phone', x: 240, y: 700, texture: 'phone_obj', label: '스마트폰', scale: 1.2,
      onInteract: () => this.look('phone', 'd8_phone')
    });
    this.outItem = this.addInteractable({
      id: 'd8_out', x: 52, y: 186, texture: 'door', originY: 1, depth: 5, scale: 1.15,
      label: '학교로', range: 78, markerY: 118, onInteract: () => this.goOut()
    });

    this.createPlayer(200, 726);
    this.physics.world.setBounds(16, 208, GAME.WIDTH - 32, 570);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('금요일 아침, 내 방');
    this.pauseBtn = UI.pauseButton(this);

    /* 오늘은 목표 안내가 없습니다 */
    this.disableInteractable('d8_out');

    UI.fadeIn(this, 1400, [8, 10, 18]);
    this.setInputLocked(true);
    UI.caption(this, DAY08.intro, {
      y: H * 0.34, hold: 1400,
      onDone: () => this.dialogue.play(DAY08.morning.wake, () => this.setInputLocked(false))
    });
  }

  look(key, id) {
    this.noteFound(id); AudioSystem.found();
    this.dialogue.say(DAY08.morning.objects[key] || ['…']);
  }

  openWindow() {
    if (this.flags.window) { this.dialogue.say(['골목은 여전히 비어 있다.']); return; }
    this.flags.window = true;
    this.dialogue.play(DAY08.morning.window, () => {
      this.enableInteractable('d8_note');
    });
  }

  /* 지금까지의 말씀을 한 번 넘겨봅니다 */
  openNote() {
    if (this.flags.note) { this.dialogue.say(['노트는 가방 안에 있다.']); return; }
    if (!this.flags.window) { this.dialogue.say(['여행 노트가 책상 위에 놓여 있다.']); return; }
    this.flags.note = true;

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.setInputLocked(true);
    this.dialogue.play(DAY08.morning.note, () => {
      const layer = this.add.container(0, 0).setDepth(900).setScrollFactor(0);
      const scrim = this.add.graphics().setScrollFactor(0);
      scrim.fillStyle(0x101a2e, 0.95); scrim.fillRect(0, 0, W, H);
      layer.add(scrim);

      let y = 230;
      DAY08.morning.noteLines.forEach((line, i) => {
        const t = this.add.text(W / 2, y, line, UI.style(19, PAL.cream))
          .setOrigin(0.5).setAlpha(0).setScrollFactor(0);
        layer.add(t);
        this.tweens.add({ targets: t, alpha: 0.9, duration: 400, delay: i * 280 });
        y += 46;
      });

      this.time.delayedCall(2200, () => {
        const b = UI.button(this, W / 2, H - 150, 250, 56, '노트를 닫는다', () => {
          layer.destroy();
          this.dialogue.play(DAY08.morning.noteClose, () => {
            this.dialogue.say(DAY08.morning.bag, () => {
              this.enableInteractable('d8_out');
              this.setInputLocked(false);
            });
          });
        }, { size: FONT.small, fill: PAL.sun });
        b.setScrollFactor(0);
        layer.add(b);
      });
    });
  }

  goOut() {
    this.goScene('Day8SearchScene', {}, [222, 226, 232]);
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
