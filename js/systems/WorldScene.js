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
    this.playerTex = opt.playerTex || 'player';   // 가롤로의 하루에서는 가롤로가 됩니다
    this._stepAt = 0;
    this._frameAt = 0;
    this._walkFrame = false;
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
    Render.setBounds(this.cameras.main, 0, 0, this.worldW, this.worldH);
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

  /* 방향과 걸음 여부에 맞는 그림으로 바꿉니다.
     걷기 그림이 없는 인물이면 조용히 선 자세를 씁니다. */
  setWalkTexture(dir, stepping) {
    const p = this.player;
    if (!p) return;
    let key = this.playerTex + '_' + dir + (stepping ? '_walk' : '');
    if (!this.textures.exists(key)) key = this.playerTex + '_' + dir;
    if (p.texture.key !== key) p.setTexture(key);
  }

  createPlayer(x, y) {
    this.playerShadow = this.add.image(x, y + 20, 'shadow').setDepth(y - 1);
    this.player = this.physics.add.sprite(x, y, this.playerTex + '_front');
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
    const originY = opt.originY === undefined ? 0.9 : opt.originY;
    const img = this.add.image(x, y, texture).setOrigin(0.5, originY);
    img.setDepth(opt.depth === undefined ? y : opt.depth);
    if (opt.scale) img.setScale(opt.scale);
    if (opt.alpha !== undefined) img.setAlpha(opt.alpha);
    if (opt.tint) img.setTint(opt.tint);
    if (opt.solid) this.addSolid(x, y, opt.solidW || img.displayWidth * 0.8, opt.solidH || 16, opt.solidOffY || -4);
    /* 바닥에 닿는 그림자 — 물건이 떠 보이지 않게 합니다.
       붙이지 않는 것: 벽에 걸린 것(originY 를 따로 준 것), 물 위나 벽에 있는 것,
       그리고 건물처럼 큰 것. 건물 밑에 그림자를 깔면 도리어 떠 보입니다. */
    const airborne = /poster|wall|window|sky|cloud|boat|banner|flag|sign|star/.test(texture);
    const tooWide = img.displayWidth > 120;
    const grounded = opt.originY === undefined && opt.shadow !== false && !airborne && !tooWide;
    if (grounded || opt.shadow === true) {
      const w = img.displayWidth * (opt.shadowScale || 0.82);
      const sh = this.add.image(x, y + (opt.shadowOffY || -1), 'shadow')
        .setDisplaySize(w, w * 0.3)
        .setAlpha(opt.shadowAlpha === undefined ? 0.5 : opt.shadowAlpha)
        .setDepth(img.depth - 0.5);
      img.groundShadow = sh;
    }
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
    const b = UI.circleButton(this, GAME.WIDTH - 64, GAME.HEIGHT - 112, 46, '', () => {
      this.tryInteract();
    }, { size: FONT.small, fill: PAL.cream });
    b.setDepth(880).setScrollFactor(0).setVisible(false);
    this.actionLabel = this.add.text(GAME.WIDTH - 64, GAME.HEIGHT - 112, '살펴보기',
      UI.style(FONT.small, PAL.ink, { align: 'center', wordWrap: { width: 84 } }))
      .setOrigin(0.5).setDepth(885).setScrollFactor(0).setVisible(false);
    this.actionBtn = b;

    /* PC — 스페이스·엔터로도 살펴봅니다 */
    if (this.input.keyboard) {
      const keys = this.input.keyboard.addKeys('SPACE,ENTER,E');
      let held = false;
      this.events.on('update', () => {
        const down = keys.SPACE.isDown || keys.ENTER.isDown || keys.E.isDown;
        if (down && !held && !this.inputLocked && this.nearTarget) this.tryInteract();
        held = down;
      });
    }
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
  /* ── 잠긴 채로 남지 않게 지켜봅니다 ─────────────
     조작이 잠기는 것은 대화나 이벤트가 끝날 때 풀어 주기로 하고 잠급니다.
     그 풀어 주는 자리가 한 번이라도 어긋나면, 걷지도 들어가지도 못해
     게임이 멈춘 것처럼 보입니다. 아무 일도 일어나지 않는 채로 오래 잠겨 있으면
     스스로 풀어 줍니다. */
  watchLock(time) {
    if (!this.inputLocked) { this._lockAt = 0; return; }

    const 대화중 = this.dialogue && (this.dialogue.isOpen || this.dialogue.choiceOpen);
    const 글쓰는중 = !!window.__typing;
    /* 자막·안내·카드처럼 화면 터치를 기다리는 것이 있으면 기다립니다 */
    const 터치기다림 = this.children.list.some(o =>
      o.type === 'Zone' && o.visible !== false && o.input);
    /* 미니게임 같은 다른 화면이 위에 떠 있으면 기다립니다 */
    let 위에다른화면 = false;
    try {
      위에다른화면 = this.scene.manager.getScenes(true)
        .some(s => s !== this && s.sys.settings.key !== 'PauseScene');
    } catch (e) {}

    if (대화중 || 글쓰는중 || 터치기다림 || 위에다른화면) { this._lockAt = 0; return; }

    if (!this._lockAt) { this._lockAt = time; return; }
    if (time - this._lockAt > 9000) {
      this._lockAt = 0;
      this.setInputLocked(false);
    }
  }

  updateWorld(time, delta) {
    this.watchLock(time);

    const p = this.player;
    /* 장면이 물러나는 중이면 몸이 먼저 사라져 있기도 합니다.
       여기서 한 번 걸러 두지 않으면 갱신 도중에 멈춰 버립니다. */
    if (!p || !p.body || !p.scene) return;

    let vx = 0, vy = 0;
    if (this.stick && !this.inputLocked) {
      const v = this.stick.read();
      vx = v.x * this.walkSpeed;
      vy = v.y * this.walkSpeed;
    }
    p.setVelocity(vx, vy);

    const moving = (vx !== 0 || vy !== 0);
    const gap = this.stepGap || 330;
    if (moving) {
      const want = vy < -8 ? 'back' : 'front';
      this.facing = want;
      if (Math.abs(vx) > 6) p.setFlipX(vx < 0);
      /* 걷는 자세와 선 자세를 발소리의 절반 간격으로 번갈아 보여 줍니다.
         발이 벌어지는 순간에 소리가 나도록 같은 시계를 씁니다. */
      if (time - this._frameAt > gap / 2) {
        this._frameAt = time;
        this._walkFrame = !this._walkFrame;
      }
      this.setWalkTexture(want, this._walkFrame);
      p.setScale(1.12, 1.12 + Math.sin(time / 90) * 0.03);
      p.setRotation(Math.sin(time / 180) * 0.02);
      if (time - this._stepAt > gap) {
        this._stepAt = time;
        if (this.stepSound) this.stepSound(); else AudioSystem.step();
      }
    } else {
      this._walkFrame = false;
      this._frameAt = time;
      this.setWalkTexture(this.facing || 'front', false);
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
