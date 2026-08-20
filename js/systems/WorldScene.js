/* 걸어다니는 장면의 공통 뼈대 — 이동, 상호작용, 깊이 정렬, 액션 버튼 */

window.WorldScene = class WorldScene extends Phaser.Scene {

  initWorld(opt) {
    opt = opt || {};
    this.inputLocked = false;
    this.interactables = [];
    this.nearTarget = null;
    this.solids = this.physics.add.staticGroup();
    this.worldW = opt.width || GAME.WIDTH;
    this.worldH = opt.height || GAME.HEIGHT;
    this.walkSpeed = opt.speed || 108;
    this._stepAt = 0;
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
    this.dialogue = new DialogueBox(this);
    this.events.off('resume', this.onResumeWorld, this);   // 장면을 다시 열 때 중복 등록 방지
    this.events.on('resume', this.onResumeWorld, this);
  }

  setInputLocked(v) {
    this.inputLocked = v;
    const show = !v && !!this.nearTarget;
    if (this.actionBtn) this.actionBtn.setVisible(show);
    if (this.actionLabel) this.actionLabel.setVisible(show);
  }

  createPlayer(x, y) {
    this.playerShadow = this.add.image(x, y + 20, 'shadow').setDepth(y - 1);
    this.player = this.physics.add.sprite(x, y, 'player_front');
    this.player.setOrigin(0.5, 0.86);
    this.player.body.setSize(20, 12).setOffset(6, 28);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(y);
    this.player.setScale(1.12);
    this.playerShadow.setScale(1.1);
    this.physics.add.collider(this.player, this.solids);
    this.facing = 'front';
    return this.player;
  }

  /* 장식용 오브젝트 */
  addProp(x, y, texture, opt) {
    opt = opt || {};
    const img = this.add.image(x, y, texture).setOrigin(0.5, opt.originY === undefined ? 0.9 : opt.originY);
    img.setDepth(opt.depth === undefined ? y : opt.depth);
    if (opt.scale) img.setScale(opt.scale);
    if (opt.alpha !== undefined) img.setAlpha(opt.alpha);
    if (opt.tint) img.setTint(opt.tint);
    if (opt.solid) this.addSolid(x, y, opt.solidW || img.displayWidth * 0.8, opt.solidH || 16, opt.solidOffY || -4);
    return img;
  }

  addSolid(x, y, w, h, offY) {
    const r = this.add.rectangle(x, y + (offY || 0), w, h);
    this.physics.add.existing(r, true);
    this.solids.add(r);
    r.setVisible(false);
    return r;
  }

  /* 말을 걸거나 살펴볼 수 있는 대상 */
  addInteractable(cfg) {
    const item = {
      id: cfg.id,
      x: cfg.x, y: cfg.y,
      range: cfg.range || 74,
      label: cfg.label || '살펴보기',
      onInteract: cfg.onInteract,
      priority: cfg.priority || 0,
      enabled: cfg.enabled === undefined ? true : cfg.enabled,
      image: null, marker: null, once: !!cfg.once, done: false
    };
    if (cfg.texture) {
      item.image = this.addProp(cfg.x, cfg.y, cfg.texture, cfg);
    }
    if (cfg.marker !== false) {
      const my = cfg.markerY === undefined ? cfg.y - (item.image ? item.image.displayHeight * 0.95 : 34) : cfg.markerY;
      item.marker = UI.marker(this, cfg.x, my).setDepth(700);
      item.marker.setAlpha(0.9);
    }
    this.interactables.push(item);
    return item;
  }

  disableInteractable(id) {
    const it = this.interactables.find(i => i.id === id);
    if (it) { it.enabled = false; if (it.marker) it.marker.setVisible(false); }
  }

  enableInteractable(id) {
    const it = this.interactables.find(i => i.id === id);
    if (it) { it.enabled = true; if (it.marker) it.marker.setVisible(true); }
  }

  createActionButton() {
    const b = UI.circleButton(this, GAME.WIDTH - 62, GAME.HEIGHT - 108, 40, '', () => {
      this.tryInteract();
    }, { size: FONT.small, fill: PAL.cream });
    b.setDepth(880).setScrollFactor(0).setVisible(false);
    this.actionLabel = this.add.text(GAME.WIDTH - 62, GAME.HEIGHT - 108, '살펴보기',
      UI.style(FONT.small, PAL.ink, { align: 'center' })).setOrigin(0.5).setDepth(885).setScrollFactor(0).setVisible(false);
    this.actionBtn = b;
    return b;
  }

  /* 오른쪽 위 작은 사진 버튼 */
  createPhotoButton(place) {
    this.photoPlace = place || '';
    const x = GAME.WIDTH - 34, y = 104;
    const b = UI.circleButton(this, x, y, 22, '', () => this.openPhoto(), { size: 14, alpha: 0.85 });
    b.setDepth(890).setScrollFactor(0);
    this.photoIcon = this.add.image(x, y, 'camera_icon').setScale(0.62)
      .setDepth(892).setScrollFactor(0);
    this.photoBtn = b;
    return b;
  }

  openPhoto() {
    if (this.inputLocked) return;
    if (this.stick) this.stick.reset();
    this.setHudVisible(false);
    this.scene.launch('PhotoMode', { from: this.scene.key, place: this.photoPlace });
    this.scene.pause();
  }

  /* 사진에 조작 화면이 담기지 않도록 잠시 감춥니다 */
  setHudVisible(v) {
    [this.objective, this.actionBtn, this.actionLabel, this.photoBtn, this.photoIcon, this.pauseBtn]
      .forEach(o => { if (o) o.setVisible(v); });
    if (this.stick && this.stick.hint) this.stick.hint.setVisible(v);
    this.interactables.forEach(it => { if (it.marker) it.marker.setVisible(v); });
  }

  /* 미니게임은 이 장면 위에 잠깐 올라왔다 갑니다 */
  openMiniGame(key) {
    if (this.stick) this.stick.reset();
    this.scene.launch(key, { from: this.scene.key });
    this.scene.pause();
  }

  onResumeWorld() {
    if (this.stick) this.stick.reset();
    this.setHudVisible(true);
    if (this.actionBtn) this.actionBtn.setVisible(false);
    if (this.actionLabel) this.actionLabel.setVisible(false);
    this.setInputLocked(false);
  }

  tryInteract() {
    if (this.inputLocked || !this.nearTarget) return;
    const t = this.nearTarget;
    if (t.once) { t.done = true; if (t.marker) t.marker.setVisible(false); }
    if (t.onInteract) t.onInteract(t);
  }

  /* 매 프레임 — 이동과 가까운 대상 찾기 */
  updateWorld(time, delta) {
    const p = this.player;
    if (!p) return;

    let vx = 0, vy = 0;
    if (this.stick && !this.inputLocked) {
      const v = this.stick.read();
      vx = v.x * this.walkSpeed;
      vy = v.y * this.walkSpeed;
    }
    p.setVelocity(vx, vy);

    const moving = (vx !== 0 || vy !== 0);
    if (moving) {
      const want = vy < -8 ? 'back' : 'front';
      if (want !== this.facing) { this.facing = want; p.setTexture('player_' + want); }
      if (Math.abs(vx) > 6) p.setFlipX(vx < 0);
      p.setScale(1.12, 1.12 + Math.sin(time / 90) * 0.04);
      p.setRotation(Math.sin(time / 180) * 0.03);
      if (time - this._stepAt > 330) { this._stepAt = time; AudioSystem.step(); }
    } else {
      p.setScale(1.12, 1.12);
      p.setRotation(0);
    }

    p.setDepth(p.y);
    if (this.playerShadow) {
      this.playerShadow.setPosition(p.x, p.y + 3).setDepth(p.y - 1);
      this.playerShadow.setAlpha(moving ? 0.75 : 0.9);
    }

    /* 가장 가까운 상호작용 대상 */
    let best = null, bestD = Infinity;
    for (let i = 0; i < this.interactables.length; i++) {
      const it = this.interactables[i];
      if (!it.enabled || it.done) { if (it.marker) it.marker.setVisible(false); continue; }
      const d = Phaser.Math.Distance.Between(p.x, p.y, it.x, it.y);
      if (it.marker) {
        const visible = d < 200;                 // 가까운 것만 표시해 화면을 조용하게
        it.marker.setVisible(visible);
        if (visible) {
          it.marker.setAlpha(d < it.range ? 1 : 0.45);
          it.marker.setScale(d < it.range ? 1.1 : 0.85);
        }
      }
      if (d < it.range) {
        const score = d - it.priority * 1000;      // 사람에게 먼저 말을 겁니다
        if (score < bestD) { bestD = score; best = it; }
      }
    }
    this.nearTarget = best;

    if (this.actionBtn) {
      const show = !!best && !this.inputLocked;
      if (show !== this.actionBtn.visible) {
        this.actionBtn.setVisible(show);
        this.actionLabel.setVisible(show);
        if (show) {
          this.actionBtn.setScale(0.8);
          this.tweens.add({ targets: this.actionBtn, scale: 1, duration: 180, ease: 'Back.easeOut' });
        }
      }
      if (show) this.actionLabel.setText(best.label);
    }
  }

  /* 오브젝트를 살펴본 기록 */
  noteFound(id) {
    SaveSystem.markFound(id);
  }

  goScene(key, data, fadeColor) {
    if (this._leaving) return;
    this._leaving = true;
    if (this.stick) this.stick.destroy();
    UI.fadeOut(this, 650, () => {
      this.scene.start(key, data);
    }, fadeColor);
  }
};
