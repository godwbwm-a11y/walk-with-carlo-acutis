/* DAY 8 · 가롤로 어디 있어? — 퀘스트 표시는 뜨지 않습니다.
   빈 자리마다 지난 날의 목소리가 아주 짧게 들릴 뿐입니다. */

window.Day8SearchScene = class Day8SearchScene extends WorldScene {
  constructor() { super('Day8SearchScene'); }

  create() {
    this.initWorld({ width: 2200, height: GAME.HEIGHT, speed: 112 });
    SaveSystem.checkpoint('Day8SearchScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();

    const H = GAME.HEIGHT;
    this.looked = {};
    this.flags = { friend: false, hallway: false, said: false };

    this.add.image(0, 0, 'sky_ordinary').setOrigin(0, 0).setDisplaySize(2200, 380).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0xd2c8b2, 1); g.fillRect(0, 360, 2200, H - 360);
    g.fillStyle(0xdcd3bf, 1); g.fillRect(0, 360, 2200, 12);
    g.fillStyle(0xc2b8a2, 1); g.fillRect(0, 700, 2200, H - 700);

    for (let x = -20; x < 1300; x += 120) {
      const h = 100 + ((x * 11) % 70);
      g.fillStyle(((x / 120) | 0) % 2 === 0 ? 0xb7c0c8 : 0xaab4bd, 1);
      g.fillRect(x, 360 - h, 98, h);
      g.fillStyle(0xe4ecf1, 0.6);
      for (let r = 0; r < Math.floor(h / 30); r++)
        for (let c = 0; c < 3; c++) g.fillRect(x + 12 + c * 28, 360 - h + 14 + r * 30, 18, 12);
    }

    /* 가롤로가 서 있던 자리들 */
    this.add.image(200, 420, 'store_front').setDepth(420).setScale(0.95);
    this.add.image(560, 380, 'tree_big').setDepth(380).setScale(0.95);
    this.add.image(640, 412, 'bench').setDepth(412).setScale(1.05);
    this.add.image(900, 400, 'bus_stop').setDepth(400).setScale(0.9);
    this.add.image(1160, 384, 'goal_post').setDepth(384).setScale(0.9);
    this.add.image(1300, 380, 'school_gate').setDepth(380).setScale(1.0);

    const spots = [[120, 560], [200, 560], [640, 556], [900, 556], [1160, 560]];
    DAY08.search.places.forEach((p, i) => {
      const x = spots[i][0];
      const mark = this.add.image(x, spots[i][1], 'empty_spot').setDepth(4).setAlpha(0.5);
      this.tweens.add({ targets: mark, alpha: 0.18, duration: 2200, yoyo: true, repeat: -1 });
      this.addInteractable({
        id: 'd8_' + p.id, x: x, y: 700, label: p.label, range: 74, markerY: spots[i][1] - 46,
        onInteract: () => this.lookAt(p)
      });
    });

    /* 교실 */
    const room = this.add.graphics().setDepth(-25);
    room.fillStyle(0xeee3cd, 1); room.fillRect(1400, 0, 800, 470);
    room.fillStyle(0xc7b291, 1); room.fillRect(1400, 470, 800, 374);
    room.fillStyle(0xb3a081, 1); room.fillRect(1400, 464, 800, 12);
    room.fillStyle(0x8a6340, 1); room.fillRect(1400, 0, 18, 470);
    /* 교실 창문 — 안이라는 것이 한눈에 보이도록 */
    for (let i = 0; i < 3; i++) {
      const wx = 1760 + i * 150;
      room.fillStyle(0x8a6340, 1); room.fillRect(wx, 150, 118, 190);
      room.fillStyle(0xcfe4ef, 1); room.fillRect(wx + 7, 157, 104, 176);
      room.fillStyle(0xeee3cd, 0.9); room.fillRect(wx + 56, 157, 6, 176);
    }
    /* 바닥 나뭇결 */
    room.fillStyle(0xbca783, 0.5);
    for (let x = 1400; x < 2200; x += 64) room.fillRect(x, 476, 3, 368);
    this.add.image(1600, 300, 'board_class').setDepth(300).setScale(1.05);
    for (let i = 0; i < 6; i++) {
      const x = 1500 + (i % 3) * 150, y = 520 + Math.floor(i / 3) * 96;
      this.add.image(x, y, 'desk').setDepth(y).setScale(1.0).setAlpha(0.95);
    }
    [[1500, 486, 'child_front'], [1800, 484, 'villager_front'], [1650, 584, 'resident_front']]
      .forEach((p) => {
        const img = this.add.image(p[0], p[1], p[2]).setDepth(p[1]).setScale(1.16);
        this.tweens.add({ targets: img, y: p[1] - 3, duration: 900 + Math.random() * 400, yoyo: true, repeat: -1 });
      });
    this.friend = this.add.image(1980, 486, 'friend_front').setDepth(486).setScale(1.2);
    this.tweens.add({ targets: this.friend, y: 482, duration: 950, yoyo: true, repeat: -1 });

    this.addInteractable({
      id: 'd8_class', x: 1520, y: 700, label: '교실', range: 86, priority: 1, markerY: 420,
      onInteract: () => this.classroom()
    });
    this.friendItem = this.addInteractable({
      id: 'd8_friend', x: 1980, y: 700, label: '친구', range: 78, priority: 2, markerY: 436,
      onInteract: () => this.talkFriend()
    });
    this.outItem = this.addInteractable({
      id: 'd8_out', x: 2150, y: 700, label: '하교', range: 88, priority: 1, markerY: 560,
      onInteract: () => this.goOut()
    });

    this.createPlayer(110, 700);
    this.physics.world.setBounds(40, 640, 2140, 140);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('금요일, 가롤로가 없는 길');
    this.pauseBtn = UI.pauseButton(this);

    this.disableInteractable('d8_friend');
    this.disableInteractable('d8_out');

    UI.fadeIn(this, 900, [222, 226, 232]);
  }

  /* 빈 자리 — 지난 날의 목소리만 아주 짧게 */
  lookAt(p) {
    if (this.looked[p.id]) { this.dialogue.say([p.empty]); return; }
    this.looked[p.id] = true;
    this.noteFound('d8_' + p.id);

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.setInputLocked(true);
    this.dialogue.say([p.empty], () => {
      const veil = this.add.graphics().setDepth(880).setScrollFactor(0);
      veil.fillStyle(0x101a2e, 0.86); veil.fillRect(0, 0, W, H);
      veil.setAlpha(0);
      this.tweens.add({ targets: veil, alpha: 1, duration: 700 });

      const d = this.add.text(W / 2, H * 0.38, p.from, UI.style(FONT.small, '#8fa5c8'))
        .setOrigin(0.5).setDepth(890).setScrollFactor(0).setAlpha(0);
      const t = this.add.text(W / 2, H * 0.46, '“' + p.echo + '”', UI.style(21, PAL.cream, {
        align: 'center', wordWrap: { width: W - 70 }
      })).setOrigin(0.5).setDepth(890).setScrollFactor(0).setAlpha(0);
      this.tweens.add({ targets: [d, t], alpha: 1, duration: 900 });

      this.time.delayedCall(2600, () => {
        this.tweens.add({
          targets: [veil, d, t], alpha: 0, duration: 900,
          onComplete: () => {
            [veil, d, t].forEach(o => o.destroy());
            this.dialogue.say([DAY08.search.after], () => {
              this.setInputLocked(false);
              if (Object.keys(this.looked).length >= 3) this.enableInteractable('d8_out');
            });
          }
        });
      });
    });
  }

  classroom() {
    if (this.flags.friend) {
      if (!this.flags.hallway) { this.hallway(); return; }
      this.dialogue.say(['수업이 곧 끝난다.']);
      return;
    }
    this.flags.friend = true;
    this.setInputLocked(true);
    this.dialogue.play(DAY08.school.arrive, () => {
      /* 선택지는 나오지 않습니다. 플레이어가 직접 다가가야 합니다. */
      this.enableInteractable('d8_friend');
      this.setInputLocked(false);
    });
  }

  talkFriend() {
    if (this.flags.said) { this.dialogue.say([{ s: '친구', t: '아까 고마웠어.' }]); return; }
    this.openMiniGame('SeeFriendScene');
  }

  /* 쉬는 시간 복도 */
  hallway() {
    this.flags.hallway = true;
    this.dialogue.play(DAY08.school.hallway, () => {
      this.enableInteractable('d8_out');
    });
  }

  onMiniGameDone(key) {
    if (key !== 'SeeFriendScene') return;
    this.flags.said = true;
    this.disableInteractable('d8_friend');
    /* 카드는 팝업으로 뜨지 않고 여행 노트에 조용히 들어갑니다 */
    Collection.unlock('j11');
    AudioSystem.found();
    this.time.delayedCall(600, () => this.hallway());
  }

  goOut() {
    this.goScene('Day8WalkScene', {}, [214, 210, 196]);
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
