/* EPILOGUE 2 · 본당 마당 — 버스가 들어오고, 어색함이 축구공 하나로 깨집니다.
   놀이는 순서도 개수도 정해져 있지 않습니다. 하나만 하고 앉아도 됩니다. */

window.EpYardScene = class EpYardScene extends WorldScene {
  constructor() { super('EpYardScene'); }

  create() {
    this.initWorld({ width: 1440, height: GAME.HEIGHT, speed: 112 });
    SaveSystem.checkpoint('EpYardScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.played = (SaveSystem.get('epilogue.games', []) || []).slice();
    this.opened = false;
    this.bagDone = false;

    /* ── 마당 ── */
    this.add.image(0, 0, 'epi_sky_day').setOrigin(0, 0).setDisplaySize(1440, 420).setDepth(-40);
    this.add.tileSprite(720, 622, 1440, 444, 'epi_yard_tile').setDepth(-30);
    const g = this.add.graphics().setDepth(-29);
    g.fillStyle(0xe0d7c2, 1); g.fillRect(0, 396, 1440, 12);
    g.fillStyle(0xc4bba4, 0.5); g.fillRect(0, 700, 1440, 144);

    this.addProp(110, 400, 'church_front', { originY: 1, depth: 4, scale: 1.15 });
    this.addProp(250, 398, 'epi_grotto', { originY: 1, depth: 5, scale: 0.9 });
    this.addProp(1400, 396, 'tree_big', { originY: 1, depth: 6, scale: 0.95 });
    this.addProp(640, 392, 'tree_city', { originY: 1, depth: 6, scale: 0.9 });

    this.banner = this.add.image(470, 236, 'epi_banner').setDepth(8).setScale(1.05);
    this.bannerText = this.add.text(470, 236, EPI.dream.banner,
      UI.style(12, PAL.ink, { align: 'center', wordWrap: { width: 258 }, lineSpacing: 3 }))
      .setOrigin(0.5).setDepth(9);

    this.addProp(430, 462, 'epi_desk_name', { depth: 462, scale: 1.0, solid: true, solidW: 100, solidH: 14 });
    this.addProp(360, 470, 'epi_flag_kr', { depth: 470, scale: 1.0 });
    this.addProp(1130, 470, 'epi_long_table', { depth: 470, scale: 0.95, solid: true, solidW: 180, solidH: 16 });
    this.add.image(1130, 372, 'epi_lights').setDepth(7).setScale(1.0).setAlpha(0.55);

    /* 본당 어른들과 청소년들 */
    this.crowd = [];
    [[300, 520, 'villager_front'], [560, 508, 'resident_front'], [900, 516, 'child_front'],
     [1240, 512, 'grandma_front'], [1000, 470, 'villager_back']].forEach((p) => {
      const img = this.add.image(p[0], p[1], p[2]).setDepth(p[1]).setScale(1.16).setAlpha(0.95);
      this.tweens.add({ targets: img, y: p[1] - 3, duration: 900 + Math.random() * 500, yoyo: true, repeat: -1 });
      this.crowd.push(img);
    });

    this.createPlayer(300, 640);
    this.physics.world.setBounds(40, 430, 1360, 340);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.stick = new Joystick(this);
    this.createActionButton();
    this.createPhotoButton('우리 본당 마당, WYD 인천교구 대회');
    this.pauseBtn = UI.pauseButton(this);

    this.buildActivities();
    this.interactables.forEach(it => this.disableInteractable(it.id));

    UI.fadeIn(this, 1000, [214, 205, 184]);
    this.setInputLocked(true);
    this.time.delayedCall(900, () => this.openingTalk());
  }

  /* ── 놀거리들 ── */
  buildActivities() {
    this.addProp(700, 596, 'epi_mat', { depth: 3, originY: 0.5, scale: 0.9 });
    [[664, 578], [686, 604], [720, 580]].forEach((p) => {
      this.add.image(p[0], p[1], 'epi_gonggi').setDepth(4).setScale(1.5).setAlpha(0.95);
    });

    this.addInteractable({
      id: 'ep_soccer', x: 560, y: 640, texture: 'soccer_ball', label: '축구', scale: 1.3,
      markerY: 580, priority: 1, onInteract: () => this.play('soccer')
    });
    this.addInteractable({
      id: 'ep_gonggi', x: 700, y: 620, texture: 'epi_gonggi', label: '공기놀이', scale: 2.0,
      markerY: 566, onInteract: () => this.play('gonggi')
    });
    this.addInteractable({
      id: 'ep_jegi', x: 840, y: 636, texture: 'epi_jegi', label: '제기차기', scale: 1.4,
      markerY: 574, onInteract: () => this.play('jegi')
    });
    this.addInteractable({
      id: 'ep_dance', x: 980, y: 634, texture: 'epi_speaker', label: '음악', scale: 1.2,
      markerY: 572, onInteract: () => this.play('dance')
    });
    this.addInteractable({
      id: 'ep_snack', x: 1130, y: 560, label: '간식', range: 92, markerY: 430,
      onInteract: () => this.play('snack')
    });
    this.add.image(1092, 452, 'epi_tteok').setDepth(455).setScale(1.0);
    this.add.image(1168, 452, 'epi_gimbap').setDepth(455).setScale(1.0);

    /* 세계에서 온 친구들 */
    this.leo = this.add.image(620, 560, 'epi_leo_front').setDepth(560).setScale(1.3);
    this.tweens.add({ targets: this.leo, y: 556, duration: 950, yoyo: true, repeat: -1 });
    this.friends = [];
    [[760, 552, 'epi_ita_front'], [1010, 556, 'epi_phi_front'],
     [1210, 550, 'epi_fra_front'], [880, 500, 'epi_bra_front']].forEach((p) => {
      const img = this.add.image(p[0], p[1], p[2]).setDepth(p[1]).setScale(1.28);
      this.tweens.add({ targets: img, y: p[1] - 4, duration: 800 + Math.random() * 500, yoyo: true, repeat: -1 });
      this.friends.push(img);
    });

    this.addInteractable({
      id: 'ep_photo', x: 1290, y: 620, texture: 'epi_spa_front', label: '사진', scale: 1.3,
      markerY: 556, priority: 1, onInteract: () => this.play('photo')
    });
    this.addInteractable({
      id: 'ep_words', x: 620, y: 620, label: '레오', range: 78, markerY: 500, priority: 2,
      onInteract: () => this.play('words')
    });

    /* 가방을 잃어버린 친구 — 표시가 없습니다 */
    this.lost = this.add.image(1330, 546, 'epi_bra_front').setDepth(546).setScale(1.28).setVisible(false);
    this.addInteractable({
      id: 'ep_bag', x: 1330, y: 620, label: '', range: 76, marker: false,
      onInteract: () => this.lostBag()
    });

    this.addInteractable({
      id: 'ep_rest', x: 1130, y: 640, label: '자리에 앉기', range: 86, marker: false,
      onInteract: () => this.rest()
    });
  }

  /* ── 친구가 뛰어온다 ── */
  openingTalk() {
    this.dialogue.play(EPI.dream.talk, () => this.busArrives());
  }

  /* ── 버스가 들어온다 ── */
  busArrives() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.cameras.main.stopFollow();
    this.tweens.add({ targets: this.cameras.main, scrollX: 1050, duration: 1800, ease: 'Sine.easeInOut' });

    const bus = this.add.image(1600, 470, 'bus_side').setDepth(468).setScale(1.15);
    this.tweens.add({
      targets: bus, x: 1330, duration: 2600, ease: 'Sine.easeOut',
      onComplete: () => AudioSystem.blip()
    });

    this.time.delayedCall(2000, () => {
      this.dialogue.play(EPI.bus.lines, () => this.hellos(bus));
    });
  }

  /* 여러 나라 말이 한꺼번에 들립니다 */
  hellos(bus) {
    const cam = this.cameras.main;
    EPI.bus.hellos.forEach((word, i) => {
      this.time.delayedCall(i * 420, () => {
        const x = cam.scrollX + 60 + (i % 3) * 120;
        const y = 300 + Math.floor(i / 3) * 56;
        const c = this.add.container(x, y).setDepth(820);
        c.add(this.add.image(0, 0, 'epi_bubble'));
        c.add(this.add.text(-4, -8, word, UI.style(15, PAL.ink)).setOrigin(0.5));
        c.setAlpha(0).setScale(0.8);
        this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 400 });
        AudioSystem.talk();
        this.time.delayedCall(2400, () => this.tweens.add({
          targets: c, alpha: 0, duration: 600, onComplete: () => c.destroy()
        }));
      });
    });

    this.time.delayedCall(EPI.bus.hellos.length * 420 + 500, () => {
      const c = this.add.container(cam.scrollX + GAME.WIDTH / 2, 400).setDepth(830);
      c.add(this.add.image(0, 0, 'epi_bubble').setScale(1.25, 1.1));
      c.add(this.add.text(-4, -8, EPI.bus.korean, UI.style(15, PAL.clay)).setOrigin(0.5));
      c.setAlpha(0);
      this.tweens.add({ targets: c, alpha: 1, duration: 500 });
      AudioSystem.chime();
      this.time.delayedCall(2600, () => this.tweens.add({
        targets: c, alpha: 0, duration: 600, onComplete: () => c.destroy()
      }));
      this.time.delayedCall(1400, () => {
        this.dialogue.play(EPI.bus.after, () => this.mirror(bus));
      });
    });
  }

  /* DAY 5 와 거울처럼 뒤집힌 하루 */
  mirror(bus) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const veil = this.add.graphics().setDepth(860).setScrollFactor(0).setAlpha(0);
    veil.fillStyle(0x101a2e, 0.85); veil.fillRect(0, 0, W, H);
    const a = this.add.text(W / 2, H * 0.40, EPI.bus.mirror1, UI.style(19, '#cbd8ea', {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(870).setScrollFactor(0).setAlpha(0);
    const b = this.add.text(W / 2, H * 0.50, EPI.bus.mirror2, UI.style(21, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(870).setScrollFactor(0).setAlpha(0);

    this.tweens.add({ targets: [veil, a], alpha: 1, duration: 900 });
    this.tweens.add({ targets: b, alpha: 1, duration: 900, delay: 2000 });

    this.time.delayedCall(4800, () => {
      this.tweens.add({
        targets: [veil, a, b], alpha: 0, duration: 900,
        onComplete: () => {
          veil.destroy(); a.destroy(); b.destroy();
          this.tweens.add({ targets: bus, x: 1620, alpha: 0.6, duration: 3000 });
          this.firstHello();
        }
      });
    });
  }

  /* ── 첫 번째 인사 ── */
  firstHello() {
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.leo.setPosition(this.player.x + 90, this.player.y - 76).setDepth(this.player.y - 76);
    this.dialogue.play(EPI.hello.open, () => this.pickGreeting());
  }

  pickGreeting() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(900).setScrollFactor(0);
    const scrim = this.add.graphics().setScrollFactor(0);
    scrim.fillStyle(0x101a2e, 0.7); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 300, EPI.hello.pickHint, UI.style(19, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setScrollFactor(0));

    EPI.hello.picks.forEach((p, i) => {
      const b = UI.button(this, W / 2, 388 + i * 84, W - 100, 68, p.icon + '   ' + p.label, () => {
        SaveSystem.set('epilogue.greeting', p.key);
        AudioSystem.select();
        layer.destroy();
        this.greetingDone(p);
      }, { size: FONT.label });
      b.setScrollFactor(0);
      layer.add(b);
    });
  }

  greetingDone(pick) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    /* 고른 인사를 실제로 해봅니다 */
    if (pick.key === 'bow') {
      this.tweens.add({ targets: this.player, y: this.player.y + 8, duration: 300, yoyo: true });
    } else {
      this.tweens.add({ targets: this.player, angle: 6, duration: 220, yoyo: true, repeat: 2 });
    }
    const t = this.add.text(this.player.x, this.player.y - 96, pick.icon, UI.style(34, PAL.cream))
      .setOrigin(0.5).setDepth(880).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, y: t.y - 20, duration: 700, yoyo: true,
      onComplete: () => t.destroy() });
    AudioSystem.chime();

    this.time.delayedCall(1200, () => {
      this.player.setAngle(0);
      this.dialogue.play(EPI.hello.after, () => this.askName());
    });
  }

  askName() {
    TextInput.ask(this, {
      question: EPI.hello.namePrompt,
      placeholder: EPI.hello.namePlaceholder,
      okLabel: '이름을 말한다',
      skipLabel: EPI.hello.nameSkip,
      height: 96,
      backHead: '이렇게 알려주었습니다'
    }, (v) => {
      SaveSystem.set('epilogue.newFriendName', v || EPI.hello.defaultName);
      this.nameShown(v || EPI.hello.defaultName);
    });
  }

  nameShown(name) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const plate = this.add.graphics().setDepth(875).setScrollFactor(0).setAlpha(0);
    plate.fillStyle(0x101a2e, 0.78);
    plate.fillRoundedRect(40, H * 0.28, W - 80, H * 0.30, 22);

    const a = this.add.text(W / 2, H * 0.34, 'LEO', UI.style(26, PAL.cream))
      .setOrigin(0.5).setDepth(880).setScrollFactor(0).setAlpha(0);
    const plus = this.add.text(W / 2, H * 0.39, '+', UI.style(20, '#8fa5c8'))
      .setOrigin(0.5).setDepth(880).setScrollFactor(0).setAlpha(0);
    const b = this.add.text(W / 2, H * 0.44, name, UI.style(26, PAL.sun, {
      align: 'center', wordWrap: { width: W - 80 }
    })).setOrigin(0.5).setDepth(880).setScrollFactor(0).setAlpha(0);
    const q = this.add.text(W / 2, H * 0.53, EPI.hello.question, UI.style(FONT.small, '#cbbfae'))
      .setOrigin(0.5).setDepth(880).setScrollFactor(0).setAlpha(0);

    this.tweens.add({ targets: [plate, a, plus, b], alpha: 1, duration: 900 });
    this.tweens.add({ targets: q, alpha: 1, duration: 900, delay: 1600 });
    AudioSystem.bell();

    this.time.delayedCall(4200, () => {
      this.tweens.add({
        targets: [plate, a, plus, b, q], alpha: 0, duration: 800,
        onComplete: () => {
          [plate, a, plus, b, q].forEach(o => o.destroy());
          this.dialogue.play(EPI.welcome.lines, () => this.ball());
        }
      });
    });
  }

  /* ── 축구공 하나가 어색함을 깨뜨립니다 ── */
  ball() {
    const ball = this.add.image(this.player.x + 260, this.player.y - 20, 'soccer_ball')
      .setDepth(this.player.y).setScale(1.3);
    this.tweens.add({
      targets: ball, x: this.player.x + 96, duration: 1400, ease: 'Sine.easeOut',
      onComplete: () => AudioSystem.kick()
    });
    this.tweens.add({ targets: ball, angle: 360, duration: 1400 });

    this.time.delayedCall(1500, () => {
      this.dialogue.play(EPI.welcome.ball, () => {
        this.tweens.add({
          targets: ball, x: this.player.x + 30, y: this.player.y + 6, duration: 500,
          onComplete: () => ball.destroy()
        });
        this.openPlay();
      });
    });
  }

  /* ── 같이 놀자 ── */
  openPlay() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.opened = true;
    this.interactables.forEach(it => {
      if (it.id !== 'ep_bag' && it.id !== 'ep_rest') this.enableInteractable(it.id);
    });
    this.refreshRest();

    const head = this.add.text(W / 2, 150, EPI.games.head, UI.style(24, PAL.cream))
      .setOrigin(0.5).setDepth(880).setScrollFactor(0).setAlpha(0);
    const note = this.add.text(W / 2, 186, EPI.games.note, UI.style(FONT.small, '#e6d9c4', {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(880).setScrollFactor(0).setAlpha(0);
    this.tweens.add({ targets: [head, note], alpha: 1, duration: 800 });
    this.time.delayedCall(3200, () => this.tweens.add({
      targets: [head, note], alpha: 0, duration: 900,
      onComplete: () => { head.destroy(); note.destroy(); }
    }));

    this.setInputLocked(false);
  }

  play(id) {
    const item = EPI.games.items.find(i => i.id === id);
    if (id === 'words') { this.openMiniGame('TwoWordsScene'); return; }
    if (!item) return;
    this.pending = id;
    this.openMiniGame(item.scene);
  }

  onMiniGameDone(key) {
    if (key === 'TwoWordsScene') { this.afterPlay(null); return; }
    const id = this.pending;
    this.pending = null;
    const item = EPI.games.items.find(i => i.id === id);
    if (!item) { this.afterPlay(null); return; }

    if (this.played.indexOf(id) === -1) {
      this.played.push(id);
      SaveSystem.set('epilogue.games', this.played.slice());
    }
    this.disableInteractable('ep_' + id);
    this.afterPlay(item.done);
  }

  afterPlay(line) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.refreshRest();
    if (this.played.length >= 2 && !this.bagDone) this.showLostFriend();

    if (!line) return;
    const t = this.add.text(W / 2, 168, line, UI.style(18, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(880).setScrollFactor(0).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 700 });
    this.time.delayedCall(2600, () => this.tweens.add({
      targets: t, alpha: 0, duration: 700, onComplete: () => t.destroy()
    }));
  }

  refreshRest() {
    const it = this.interactables.find(i => i.id === 'ep_rest');
    if (!it) return;
    if (this.played.length >= 1) {
      it.enabled = true;
      it.label = EPI.games.enough;
    } else {
      it.enabled = false;
    }
  }

  /* ── 가방을 찾는 친구 — 아무 표시도 없습니다 ── */
  showLostFriend() {
    if (this.lost.visible) return;
    this.lost.setVisible(true).setAlpha(0);
    this.tweens.add({ targets: this.lost, alpha: 1, duration: 800 });
    this.tweens.add({ targets: this.lost, x: this.lost.x - 26, duration: 1400, yoyo: true, repeat: -1 });
    this.enableInteractable('ep_bag');
    this.dialogue.play(EPI.help.notice);
  }

  lostBag() {
    if (this.bagDone) { this.dialogue.say(['가방은 잘 찾았다.']); return; }
    this.bagDone = true;
    this.disableInteractable('ep_bag');
    this.setInputLocked(true);

    this.dialogue.play(EPI.help.ask, () => {
      const bag = this.add.image(1372, 566, 'big_backpack').setDepth(566).setScale(0.9).setAlpha(0);
      this.tweens.add({ targets: bag, alpha: 1, duration: 600 });
      AudioSystem.found();

      this.dialogue.play(EPI.help.found, () => this.together());
    });
  }

  together() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const a = this.add.text(W / 2, H * 0.34, EPI.help.remember, UI.style(FONT.small, '#8fa5c8', {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(880).setScrollFactor(0).setAlpha(0);
    const b = this.add.text(W / 2, H * 0.41, EPI.help.together, UI.style(28, PAL.sun))
      .setOrigin(0.5).setDepth(880).setScrollFactor(0).setAlpha(0);
    const c = this.add.text(W / 2, H * 0.50, EPI.help.noReward, UI.style(FONT.small, '#cbbfae', {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(880).setScrollFactor(0).setAlpha(0);

    this.tweens.add({ targets: a, alpha: 1, duration: 800 });
    this.tweens.add({ targets: b, alpha: 1, duration: 900, delay: 1000 });
    this.tweens.add({ targets: c, alpha: 1, duration: 900, delay: 2800 });
    AudioSystem.bell();

    this.time.delayedCall(5400, () => {
      this.tweens.add({
        targets: [a, b, c], alpha: 0, duration: 800,
        onComplete: () => {
          [a, b, c].forEach(o => o.destroy());
          this.setInputLocked(false);
        }
      });
    });
  }

  /* ── 이제 앉을까 ── */
  rest() {
    const left = EPI.games.items.filter(i => this.played.indexOf(i.id) === -1).length;
    const prompt = left > 0 ? EPI.games.enoughHint : '';
    this.dialogue.choose(prompt, [
      { key: 'yes', label: '자리에 앉는다' },
      { key: 'no', label: '조금 더 논다' }
    ], (k) => {
      if (k === 'yes') this.favorite();
    });
  }

  /* 제일 재밌었던 것 — 순위가 아니라 기억입니다 */
  favorite() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const mine = EPI.games.items.filter(i => this.played.indexOf(i.id) !== -1);
    if (!mine.length) { this.goDinner(); return; }

    this.setInputLocked(true);
    const layer = this.add.container(0, 0).setDepth(900).setScrollFactor(0);
    const scrim = this.add.graphics().setScrollFactor(0);
    scrim.fillStyle(0x101a2e, 0.94); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 170, EPI.games.favoriteQ, UI.style(21, PAL.cream))
      .setOrigin(0.5).setScrollFactor(0));

    let y = 250;
    mine.forEach((m) => {
      const b = UI.button(this, W / 2, y, W - 90, 60, m.icon + '   ' + m.label, () => {
        SaveSystem.set('epilogue.favoriteGame', m.label);
        AudioSystem.select();
        layer.destroy();
        this.goDinner();
      }, { size: FONT.small });
      b.setScrollFactor(0);
      layer.add(b);
      y += 70;
    });

    const skip = UI.button(this, W / 2, y + 10, 240, 54, '다 재밌었어', () => {
      SaveSystem.set('epilogue.favoriteGame', '다 재밌었어');
      layer.destroy();
      this.goDinner();
    }, { size: FONT.small, fill: PAL.sun });
    skip.setScrollFactor(0);
    layer.add(skip);
  }

  goDinner() {
    this.goScene('EpDinnerScene', {}, [232, 190, 150]);
  }

  update(time, delta) { this.updateWorld(time, delta); }
};
