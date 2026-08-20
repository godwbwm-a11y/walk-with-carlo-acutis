/* DAY 3 · 주일 아침 — 알람과 준비 */

window.Day3RoomScene = class Day3RoomScene extends WorldScene {
  constructor() { super('Day3RoomScene'); }

  create(data) {
    data = data || {};
    this.initWorld({ width: GAME.WIDTH, height: GAME.HEIGHT, speed: 104 });
    SaveSystem.checkpoint('Day3RoomScene', { ready: !!data.ready });
    AudioSystem.unlock();
    AudioSystem.setAmbience('room');

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const D = DAY03.room;
    this.ready = !!data.ready;

    this.add.tileSprite(W / 2, 92, W, 185, 'wall_tile').setDepth(0).setTint(0xfdf1dd);
    this.add.tileSprite(W / 2, (185 + H) / 2, W, H - 185, 'floor_tile').setDepth(0).setTint(0xe4cda6);
    const base = this.add.graphics().setDepth(1);
    base.fillStyle(HEX(PAL.woodDark), 0.6); base.fillRect(0, 179, W, 10);

    /* 주일 아침의 빛 */
    const sun = this.add.graphics().setDepth(2);
    for (let i = 0; i < 4; i++) {
      sun.fillStyle(0xfff3d8, 0.09);
      sun.fillTriangle(130 - i * 8, 189, 264 + i * 14, 189, 104 - i * 12, 540 + i * 40);
    }
    this.tweens.add({ targets: sun, alpha: 0.8, duration: 5200, yoyo: true, repeat: -1 });

    this.addProp(286, 128, 'poster', { originY: 0.5, depth: 4, scale: 1.3 });
    this.addProp(206, 606, 'rug', { originY: 0.5, depth: 3, scale: 0.86 });
    this.addProp(200, 318, 'lamp_room', { depth: 322, scale: 1.2 });
    this.addProp(348, 300, 'shelf', { scale: 1.2, solid: true, solidW: 52, solidH: 14 });

    this.addInteractable({
      id: 'd3_window', x: 160, y: 152, texture: 'window_warm', originY: 1, depth: 4, scale: 1.15,
      label: '내다보기', range: 74, markerY: 108,
      onInteract: () => this.look('window', 'd3_window')
    });
    this.addInteractable({
      id: 'd3_desk', x: 150, y: 330, texture: 'desk', label: '책상', scale: 1.2,
      solid: true, solidW: 78, solidH: 14,
      onInteract: () => this.look('desk', 'd3_desk')
    });
    this.addInteractable({
      id: 'd3_bed', x: 312, y: 460, texture: 'bed', label: '침대', scale: 1.15,
      solid: true, solidW: 70, solidH: 86, solidOffY: -46, markerY: 380,
      onInteract: () => this.look('bed', 'd3_bed')
    });
    this.addInteractable({
      id: 'd3_rosary', x: 66, y: 596, texture: 'rosary', label: '묵주', scale: 1.5,
      onInteract: () => this.look('rosary', 'd3_rosary')
    });

    /* 어제보다 가벼운 가방 */
    this.bagItem = this.addInteractable({
      id: 'd3_bag', x: 168, y: 560, texture: 'bag', label: '가방', scale: 1.2,
      onInteract: () => {
        this.noteFound('d3_bag');
        this.dialogue.say(D.bag, () => this.gentleLine());
      }
    });

    this.readyItem = this.addInteractable({
      id: 'd3_ready', x: 268, y: 660, texture: 'phone_obj', label: '준비하기', scale: 1.25,
      onInteract: () => this.openMiniGame('ReadyScene')
    });

    this.doorItem = this.addInteractable({
      id: 'd3_door', x: 52, y: 186, texture: 'door', originY: 1, depth: 5, scale: 1.15,
      label: '나가기', range: 78, markerY: 118,
      onInteract: () => this.goOut()
    });

    this.createPlayer(200, 726);
    this.physics.world.setBounds(16, 208, GAME.WIDTH - 32, 570);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('주일 아침, 내 방');
    this.pauseBtn = UI.pauseButton(this);
    this.objective = UI.objective(this, this.ready ? D.objectiveOut : D.objective);

    if (!this.ready) this.disableInteractable('d3_door');
    else this.disableInteractable('d3_ready');

    UI.fadeIn(this, 900);

    if (!data.ready && !data.woke) this.morning();
    else if (data.ready) {
      this.setInputLocked(true);
      this.time.delayedCall(400, () => this.dialogue.say(DAY03.ready.done, () => this.setInputLocked(false)));
    }
  }

  /* 알람과 첫 선택 */
  morning() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.setInputLocked(true);

    const veil = this.add.graphics().setDepth(700);
    veil.fillStyle(0x0b1020, 1); veil.fillRect(0, 0, W, H);

    const clock = this.add.container(W / 2, H * 0.34).setDepth(701);
    const g = this.add.graphics();
    g.fillStyle(0x1c2436, 1); g.fillRoundedRect(-120, -70, 240, 140, 20);
    g.lineStyle(2, 0x3b4a66, 1); g.strokeRoundedRect(-120, -70, 240, 140, 20);
    const t1 = this.add.text(0, -26, DAY03.alarm.header, UI.style(FONT.body, '#9fb4d6')).setOrigin(0.5);
    const t2 = this.add.text(0, 18, DAY03.alarm.sub, UI.style(24, PAL.cream)).setOrigin(0.5);
    clock.add([g, t1, t2]);
    clock.setAlpha(0);

    this.tweens.add({ targets: clock, alpha: 1, duration: 700 });
    this.tweens.add({ targets: clock, y: H * 0.34 - 6, duration: 240, yoyo: true, repeat: 5 });
    AudioSystem.chime();

    UI.caption(this, DAY03.intro, {
      y: H * 0.62, hold: 1300,
      onDone: () => {
        this.dialogue.choose('', DAY03.alarm.choices, (key) => {
          SaveSystem.set('reflections.day3Alarm', key);
          this.dialogue.say(DAY03.alarm.reply[key], () => {
            this.dialogue.say(DAY03.alarm.after, () => {
              this.tweens.add({
                targets: [veil, clock], alpha: 0, duration: 1200,
                onComplete: () => { veil.destroy(); clock.destroy(); this.setInputLocked(false); this.afterWake(); }
              });
            });
          });
        });
      }
    });
  }

  afterWake() {
    /* 어제 내려놓았던 고민이 잠깐 스친다 */
    const stone = SaveSystem.get('reflections.entrustedConcern', null);
    const lines = stone && DAY03.room.concern[stone];
    if (lines) {
      this.time.delayedCall(700, () => {
        this.setInputLocked(true);
        this.dialogue.say(lines, () => this.gentleLine(() => this.setInputLocked(false)));
      });
    }
  }

  /* 해결하지 않아도 괜찮다는 한 줄 */
  gentleLine(onDone) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const t = this.add.text(W / 2, H * 0.30, DAY03.room.gentle,
      UI.style(FONT.body, PAL.cream, { align: 'center', lineSpacing: 8, wordWrap: { width: W - 70 } }))
      .setOrigin(0.5).setDepth(1200).setAlpha(0);
    const back = this.add.graphics().setDepth(1199);
    back.fillStyle(0x101a2e, 0.5); back.fillRect(0, H * 0.30 - 62, W, 124);
    back.setAlpha(0);
    this.tweens.add({ targets: [t, back], alpha: 1, duration: 800 });
    this.time.delayedCall(2600, () => {
      this.tweens.add({
        targets: [t, back], alpha: 0, duration: 700,
        onComplete: () => { t.destroy(); back.destroy(); if (onDone) onDone(); }
      });
    });
  }

  look(key, id) {
    const lines = DAY03.room.objects[key] || ['…'];
    this.noteFound(id); AudioSystem.found();
    this.dialogue.say(lines);
  }

  onMiniGameDone(key) {
    if (key !== 'ReadyScene') return;
    this.ready = true;
    SaveSystem.checkpoint('Day3RoomScene', { ready: true, woke: true });
    this.disableInteractable('d3_ready');
    this.enableInteractable('d3_door');
    this.objective.setText(DAY03.room.objectiveOut);
    this.setInputLocked(true);
    this.dialogue.say(DAY03.ready.done, () => { AudioSystem.chime(); this.setInputLocked(false); });
  }

  goOut() {
    this.goScene('Day3StreetScene', {}, [235, 228, 210]);
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
