/* DAY 1 · SCENE 3 — 꿈속 해변. 카를로와의 첫 만남과 첫 산책 */

window.DreamBeachScene = class DreamBeachScene extends WorldScene {
  constructor() { super('DreamBeachScene'); }

  create(data) {
    data = data || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const WORLD_W = 1600;
    this.initWorld({ width: WORLD_W, height: H, speed: 100 });
    SaveSystem.checkpoint('DreamBeachScene');
    AudioSystem.unlock();
    AudioSystem.setAmbience('beach');
    AudioSystem.startPad();

    const D = DAY01.dream;
    this.met = false;
    this.discovered = 0;

    /* 하늘 · 별 */
    const SEA_TOP = 300;
    this.add.image(W / 2, 0, 'sky_night').setOrigin(0.5, 0)
      .setDisplaySize(W, SEA_TOP + 6).setScrollFactor(0).setDepth(-20);
    for (let i = 0; i < 40; i++) {
      const s = this.add.image(Phaser.Math.Between(0, WORLD_W), Phaser.Math.Between(16, 300), 'dot')
        .setScale(Phaser.Math.FloatBetween(0.16, 0.4))
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.8))
        .setScrollFactor(0.25).setDepth(-19);
      this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(1600, 3400), yoyo: true, repeat: -1 });
    }

    /* 수평선의 새벽빛 */
    const dawn = this.add.image(W / 2, SEA_TOP, 'lamp_glow').setScrollFactor(0).setDepth(-19)
      .setDisplaySize(W * 1.6, 190).setTint(0xffc79a).setAlpha(0.55);
    this.tweens.add({ targets: dawn, alpha: 0.75, duration: 5200, yoyo: true, repeat: -1 });

    /* 바다 · 모래 */
    const seaTop = SEA_TOP, seaBottom = 432;
    const g = this.add.graphics().setDepth(-15);
    g.fillStyle(0x1d3a58, 1); g.fillRect(0, seaTop, WORLD_W, seaBottom - seaTop);
    g.fillStyle(0x2f6b8f, 0.5); g.fillRect(0, seaTop, WORLD_W, 26);
    g.fillStyle(0x4d7fa0, 0.35); g.fillRect(0, seaBottom - 40, WORLD_W, 40);
    g.fillStyle(0xe6c9a6, 0.28); g.fillRect(0, seaTop, WORLD_W, 12);        // 수평선에 닿은 빛
    g.fillStyle(0xa9b8ca, 1); g.fillRect(0, seaBottom, WORLD_W, H - seaBottom);
    g.fillStyle(0x93a4ba, 0.7); g.fillRect(0, seaBottom, WORLD_W, 20);       // 젖은 모래
    for (let b = 0; b < 6; b++) {                                            // 아래로 갈수록 따뜻해지는 모래
      g.fillStyle(0xc3b49c, 0.05);
      g.fillRect(0, seaBottom + 40 + b * 30, WORLD_W, H - seaBottom - 40 - b * 30);
    }
    for (let i = 0; i < 260; i++) {                                          // 모래 알갱이
      g.fillStyle(i % 3 === 0 ? 0xffffff : 0x7d8ea4, 0.16);
      g.fillCircle(Phaser.Math.Between(0, WORLD_W), Phaser.Math.Between(seaBottom + 14, H - 6), Phaser.Math.FloatBetween(0.8, 2.0));
    }

    /* 밀려오는 파도 */
    this.foam = this.add.tileSprite(WORLD_W / 2, seaBottom - 4, WORLD_W, 12, 'seafoam').setDepth(-14).setAlpha(0.55);
    this.tweens.add({ targets: this.foam, y: seaBottom + 10, alpha: 0.35, duration: 3400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.foam2 = this.add.tileSprite(WORLD_W / 2, seaBottom - 22, WORLD_W, 12, 'seafoam').setDepth(-14).setAlpha(0.28);

    /* 모래 위 발자국 */
    for (let i = 0; i < 22; i++) {
      this.add.image(180 + i * 30, 596 + Math.sin(i * 0.6) * 22, 'footprint')
        .setDepth(1).setAlpha(0.5).setScale(0.9).setRotation(0.2);
    }

    /* 풍경 */
    this.addProp(300, 520, 'streetlamp', {});
    this.add.image(300, 452, 'lamp_glow').setDepth(2).setAlpha(0.5);
    this.addProp(1180, 520, 'streetlamp', {});
    this.add.image(1180, 452, 'lamp_glow').setDepth(2).setAlpha(0.5);
    this.addProp(1330, 470, 'boat', { scale: 1.1 });
    this.addProp(648, 556, 'rock', {});
    this.addProp(90, 500, 'rock', { scale: 0.8, alpha: 0.9 });

    this.createInteractables();

    /* 카를로 — 저 멀리 서 있다 */
    this.carlo = this.add.sprite(880, 596, 'carlo_back').setOrigin(0.5, 0.86).setDepth(596).setScale(1.12);
    this.carloShadow = this.add.image(880, 599, 'shadow').setDepth(595).setAlpha(0.5).setScale(1.1);
    this.tweens.add({ targets: this.carlo, y: 592, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    /* 주인공 */
    this.createPlayer(140, 620);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.stick = new Joystick(this);
    this.createActionButton();
    UI.pauseButton(this);
    this.objective = UI.objective(this, D.objective);

    this.physics.world.setBounds(40, 474, WORLD_W - 80, 186);   // 모래 위, 대화창 위쪽에서만 걷습니다

    UI.fadeIn(this, 1400);
    this.setInputLocked(true);
    UI.caption(this, D.caption, { y: H * 0.28, hold: 1600, onDone: () => this.setInputLocked(false) });

    /* 이따금 파도 소리 */
    this.time.addEvent({
      delay: 7200, loop: true,
      callback: () => AudioSystem.wave()
    });
  }

  createInteractables() {
    const D = DAY01.dream;

    this.addInteractable({
      id: 'beach_wave', x: 460, y: 496, label: '파도', range: 70, markerY: 452,
      onInteract: () => { AudioSystem.wave(); this.look('wave', 'beach_wave'); }
    });
    this.addInteractable({
      id: 'beach_shell', x: 520, y: 646, texture: 'shell', label: '줍기',
      onInteract: () => this.look('shell', 'beach_shell')
    });
    this.addInteractable({
      id: 'beach_rock', x: 648, y: 556, label: '앉아보기', range: 62, marker: false,
      onInteract: () => this.look('rock', 'beach_rock')
    });
    this.cat = this.addInteractable({
      id: 'beach_cat', x: 980, y: 650, texture: 'cat', label: '고양이',
      onInteract: (it) => {
        this.look('cat', 'beach_cat');
        if (it.image) this.tweens.add({ targets: it.image, y: it.image.y - 6, duration: 300, yoyo: true, repeat: 1 });
      }
    });
    this.addInteractable({
      id: 'beach_lamp', x: 1180, y: 540, label: '가로등', range: 66, marker: false,
      onInteract: () => this.look('lamp', 'beach_lamp')
    });
    this.addInteractable({
      id: 'beach_star', x: 760, y: 506, label: '하늘 보기', range: 78, marker: false,
      onInteract: () => this.look('star', 'beach_star')
    });
    this.addInteractable({
      id: 'beach_foot', x: 240, y: 612, label: '발자국', range: 66, marker: false,
      onInteract: () => this.look('footprint', 'beach_foot')
    });
    this.addInteractable({
      id: 'beach_boat', x: 1330, y: 500, label: '배', range: 70, marker: false,
      onInteract: () => this.look('boat', 'beach_boat')
    });

    /* 벤치 — 오늘의 이야기가 열리는 자리 */
    this.benchItem = this.addInteractable({
      id: 'beach_bench', x: 1020, y: 552, texture: 'bench', label: '앉기', range: 78, scale: 1.15, priority: 1,
      onInteract: () => this.sitBench()
    });
    this.benchItem.enabled = false;
    if (this.benchItem.marker) this.benchItem.marker.setVisible(false);
  }

  look(key, id) {
    const lines = DAY01.dream.objects[key] || ['…'];
    const before = SaveSystem.get('found', []).length;
    this.noteFound(id);
    if (SaveSystem.get('found', []).length > before) {
      this.discovered++;
      AudioSystem.found();
      this.checkWalkProgress();
    }
    this.dialogue.say(lines);
  }

  /* 카를로와 처음 만나는 순간 */
  meetCarlo() {
    if (this.met) return;
    this.met = true;
    this.setInputLocked(true);
    this.carlo.setTexture('carlo_front');
    this.tweens.add({ targets: [this.carlo, this.carloShadow], x: this.player.x + 46, duration: 900, ease: 'Sine.easeInOut' });

    this.time.delayedCall(700, () => {
      this.dialogue.play(DAY01.dream.meet, () => {
        this.setInputLocked(false);
        this.objective.setText(DAY01.dream.objectiveWalk);
        this.follow = true;
        this.benchItem.enabled = true;
        if (this.benchItem.marker) this.benchItem.marker.setVisible(true);
        AudioSystem.chime();
      });
    });
  }

  checkWalkProgress() {
    if (this.discovered === 3 && this.met && !this.walkTalked) {
      this.walkTalked = true;
      this.time.delayedCall(900, () => {
        if (this.dialogue.isOpen) return;
        this.dialogue.play(DAY01.dream.carloWalk, () => {
          this.objective.setText(DAY01.dream.objectiveBench);
        });
      });
    }
  }

  /* 벤치에 앉아 나누는 이야기 */
  sitBench() {
    const D = DAY01.dream;
    this.setInputLocked(true);
    if (this.stick) { this.stick.gfx.setVisible(false); }

    this.player.setVelocity(0, 0);
    this.player.setPosition(996, 560);
    this.player.setTexture('player_back');
    this.playerShadow.setAlpha(0);
    this.carlo.setTexture('carlo_back');
    this.tweens.add({ targets: [this.carlo, this.carloShadow], x: 1048, y: 560, duration: 600, ease: 'Sine.easeOut' });
    this.carloShadow.setAlpha(0);
    this.cameras.main.pan(1020, 460, 900, 'Sine.easeInOut');

    this.time.delayedCall(1000, () => {
      this.dialogue.play(D.bench, () => {
        this.dialogue.choose('', D.reasons, (key) => {
          SaveSystem.set('reflections.dislikeReason', key);
          const reply = D.reasonReply[key] || [];
          this.dialogue.play(reply.concat(D.benchEnd), () => this.toPrayer());
        });
      });
    });
  }

  toPrayer() {
    AudioSystem.bell();
    if (this.stick) this.stick.destroy();
    UI.fadeOut(this, 1400, () => this.scene.start('PrayerScene'), [12, 20, 40]);
  }

  update(time, delta) {
    this.updateWorld(time, delta);
    if (this.foam2) this.foam2.tilePositionX += 0.12;

    /* 카를로에게 다가가면 첫 만남 */
    if (!this.met && this.player && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.carlo.x, this.carlo.y) < 120) {
      this.meetCarlo();
    }

    /* 만난 뒤에는 조금 뒤에서 함께 걷습니다 */
    if (this.follow && !this.inputLocked && this.player) {
      const tx = this.player.x - (this.player.flipX ? -50 : 50);
      const ty = this.player.y + 8;
      const d = Phaser.Math.Distance.Between(this.carlo.x, this.carlo.y, tx, ty);
      if (d > 26) {
        this.carlo.x = Phaser.Math.Linear(this.carlo.x, tx, 0.045);
        this.carlo.y = Phaser.Math.Linear(this.carlo.y, ty, 0.045);
        this.carlo.setTexture(d > 60 ? 'carlo_back' : 'carlo_front');
        this.carlo.setFlipX(tx < this.carlo.x);
      }
      this.carlo.setDepth(this.carlo.y);
      this.carloShadow.setPosition(this.carlo.x, this.carlo.y + 3).setDepth(this.carlo.y - 1).setAlpha(0.5);
    }
  }
};
