/* 공통 UI 부품 — 큰 터치 영역, 충분한 간격, 읽기 쉬운 글자 */

window.UI = (function () {

  /* 화면에 실제로 몇 배로 늘려 그려지는지 — PC 처럼 큰 화면에서도 또렷하도록 */
  function renderScale() {
    const g = window.__game;
    let shown = 1;
    if (g && g.scale && g.scale.canvasBounds && g.scale.canvasBounds.width > 0) {
      shown = g.scale.canvasBounds.width / GAME.WIDTH;
    }
    const dpr = window.devicePixelRatio || 1;
    return Phaser.Math.Clamp(Math.ceil(dpr * shown * 2) / 2, 1, 4);
  }

  /* 글자 크기를 한 곳에서 키웁니다. 코드가 숫자를 직접 넘겨도 함께 커집니다. */
  function fs(size) {
    return Math.max(FONT_MIN, Math.round(size * FONT_SCALE));
  }

  function style(size, color, extra) {
    const px = fs(size);
    return Object.assign({
      fontFamily: FONT.family,
      fontSize: px + 'px',
      color: color || PAL.ink,
      lineSpacing: Math.round(px * 0.52),
      resolution: renderScale()
    }, extra || {});
  }

  /* 읽기 힘든 배경 위에 글을 얹을 때 뒤에 까는 판 */
  function plate(scene, x, y, w, h, opt) {
    opt = opt || {};
    const g = scene.add.graphics();
    g.fillStyle(HEX(opt.fill || '#101a2e'), opt.alpha === undefined ? 0.72 : opt.alpha);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, opt.radius === undefined ? 20 : opt.radius);
    return g;
  }

  function panel(scene, x, y, w, h, opt) {
    opt = opt || {};
    const g = scene.add.graphics();
    const r = opt.radius === undefined ? 18 : opt.radius;
    if (opt.shadow !== false) {
      g.fillStyle(0x000000, 0.16);
      g.fillRoundedRect(x - w / 2 + 2, y - h / 2 + 5, w, h, r);
    }
    g.fillStyle(HEX(opt.fill || PAL.paper), opt.alpha === undefined ? 0.97 : opt.alpha);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
    if (opt.stroke !== false) {
      g.lineStyle(2, HEX(opt.strokeColor || PAL.sun), opt.strokeAlpha === undefined ? 0.55 : opt.strokeAlpha);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
    }
    return g;
  }

  /* 넉넉한 크기의 기본 버튼 (최소 높이 56) */
  function button(scene, x, y, w, h, label, onClick, opt) {
    opt = opt || {};
    h = Math.max(h, TOUCH.min);
    const c = scene.add.container(x, y);
    const g = scene.add.graphics();
    const fill = HEX(opt.fill || PAL.paper);
    const line = HEX(opt.strokeColor || PAL.sunDeep);

    function draw(pressed) {
      g.clear();
      const off = pressed ? 2 : 0;
      if (!pressed) { g.fillStyle(0x000000, 0.15); g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 16); }
      g.fillStyle(fill, opt.alpha === undefined ? 1 : opt.alpha);
      g.fillRoundedRect(-w / 2, -h / 2 + off, w, h, 16);
      g.lineStyle(2, line, opt.strokeAlpha === undefined ? 0.6 : opt.strokeAlpha);
      g.strokeRoundedRect(-w / 2, -h / 2 + off, w, h, 16);
    }
    draw(false);

    const t = scene.add.text(0, 0, label, style(opt.size || FONT.label, opt.color || PAL.ink, {
      align: 'center', wordWrap: { width: w - 26 }
    })).setOrigin(0.5);

    c.add([g, t]);
    c.setSize(w, h + 12);          // 손가락이 조금 빗나가도 눌리도록 여유를 둡니다
    c.setInteractive();

    /* 손가락이 스치기만 해도 눌리지 않도록 — 누른 자리에서 크게 벗어나면 취소합니다 */
    let downAt = null;
    c.on('pointerdown', function (p) {
      downAt = { x: p.x, y: p.y };
      draw(true); t.y = 2; AudioSystem.tap();
    });
    c.on('pointerup', function (p) {
      draw(false); t.y = 0;
      /* 누른 자리에서 크게 밀렸다면 누른 것으로 치지 않습니다.
         누른 순간을 보지 못했다면(버튼이 뒤늦게 생겼다면) 그대로 넣습니다. */
      const was = downAt; downAt = null;
      if (was && Phaser.Math.Distance.Between(was.x, was.y, p.x, p.y) > TOUCH.slop) return;
      if (onClick) onClick();
    });
    c.on('pointerout', function () { draw(false); t.y = 0; downAt = null; });
    c.on('pointerupoutside', function () { draw(false); t.y = 0; downAt = null; });
    c.setLabel = function (s) { t.setText(s); };
    return c;
  }

  /* 원형 아이콘 버튼 */
  function circleButton(scene, x, y, r, glyph, onClick, opt) {
    opt = opt || {};
    r = Math.max(r, TOUCH.min / 2);
    const c = scene.add.container(x, y);
    const g = scene.add.graphics();
    function draw(p) {
      g.clear();
      if (!p) { g.fillStyle(0x000000, 0.16); g.fillCircle(0, 4, r); }
      g.fillStyle(HEX(opt.fill || PAL.paper), opt.alpha === undefined ? 0.94 : opt.alpha);
      g.fillCircle(0, p ? 2 : 0, r);
      g.lineStyle(2, HEX(opt.strokeColor || PAL.sunDeep), 0.6);
      g.strokeCircle(0, p ? 2 : 0, r);
    }
    draw(false);
    const t = scene.add.text(0, 0, glyph, style(opt.size || 22, opt.color || PAL.ink)).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(r * 2 + 16, r * 2 + 16);
    c.setInteractive(new Phaser.Geom.Circle(r + 8, r + 8, r + 8), Phaser.Geom.Circle.Contains);
    let downAt = null;
    c.on('pointerdown', function (p) { downAt = { x: p.x, y: p.y }; draw(true); AudioSystem.tap(); });
    c.on('pointerup', function (p) {
      draw(false);
      const was = downAt; downAt = null;
      if (was && Phaser.Math.Distance.Between(was.x, was.y, p.x, p.y) > TOUCH.slop) return;
      if (onClick) onClick();
    });
    c.on('pointerout', function () { draw(false); downAt = null; });
    c.on('pointerupoutside', function () { draw(false); downAt = null; });
    return c;
  }

  /* ── 화면을 눌러야 다음으로 넘어갑니다 ──────────
     자동으로 휙 지나가 버리던 자리를 이걸로 바꿉니다. */
  function tapNext(scene, onDone, opt) {
    opt = opt || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const depth = opt.depth === undefined ? 940 : opt.depth;
    const y = opt.y === undefined ? H - 84 : opt.y;

    const c = scene.add.container(W / 2, y).setDepth(depth).setScrollFactor(0).setAlpha(0);
    const g = scene.add.graphics();
    const label = opt.label || GAME.TAP_NEXT;
    const t = scene.add.text(0, 0, label, style(FONT.small, PAL.cream)).setOrigin(0.5);
    const bw = Math.min(W - 40, t.width + 44);
    g.fillStyle(0x101a2e, 0.6);
    g.fillRoundedRect(-bw / 2, -22, bw, 44, 22);
    const arrow = scene.add.text(0, 30, '▼', style(FONT.tiny, PAL.sun)).setOrigin(0.5);
    c.add([g, t, arrow]);
    scene.tweens.add({ targets: c, alpha: 1, duration: 500, delay: opt.delay === undefined ? 400 : opt.delay });
    scene.tweens.add({ targets: arrow, y: 36, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    /* 화면 아무 데나 눌러도 됩니다 */
    const zone = scene.add.zone(W / 2, H / 2, W, H).setOrigin(0.5)
      .setDepth(depth - 1).setScrollFactor(0).setInteractive();

    let fired = false;
    const go = () => {
      if (fired) return;
      fired = true;
      AudioSystem.tap();
      zone.destroy();
      scene.tweens.add({
        targets: c, alpha: 0, duration: 220,
        onComplete: () => { c.destroy(); if (onDone) onDone(); }
      });
    };
    zone.on('pointerup', go);

    /* PC 에서는 스페이스·엔터로도 넘어갑니다 */
    if (scene.input.keyboard) {
      const keys = scene.input.keyboard.addKeys('SPACE,ENTER');
      const tick = () => {
        if (fired) { scene.events.off('update', tick); return; }
        if (keys.SPACE.isDown || keys.ENTER.isDown) { scene.events.off('update', tick); go(); }
      };
      scene.events.on('update', tick);
    }
    return { cancel: go };
  }

  /* ── 하루를 마친 뒤의 버튼들 ─────────────────
     다음 날로 바로 갈 수도 있고, 오늘은 여기까지 하고 저장해도 됩니다. */
  function dayEndButtons(scene, day) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const next = day + 1;
    const isEpi = (day === 8);
    const entry = {
      2: 'Day2RoomScene', 3: 'Day3RoomScene', 4: 'Day4RoomScene', 5: 'Day5SubwayScene',
      6: 'Day6IntroScene', 7: 'Day7RoomScene', 8: 'Day8MorningScene', 9: 'EpIntroScene'
    }[next];

    const label = isEpi ? '에필로그 열기' : ('DAY ' + next + ' 걷기');
    const rows = [];

    if (entry) {
      rows.push(button(scene, W / 2, H - 176, 268, 64, label, function () {
        askNextDay(scene, entry, isEpi);
      }, { size: FONT.label, fill: PAL.sun }));
    }
    rows.push(button(scene, W / 2 - 70, H - 96, 172, 58, '처음 화면으로', function () {
      fadeOut(scene, 700, function () { scene.scene.start('TitleScene'); });
    }, { size: FONT.small }));
    rows.push(button(scene, W / 2 + 100, H - 96, 116, 58, '보관함', function () {
      scene.scene.launch('GalleryScene', { from: scene.scene.key });
      scene.scene.pause();
    }, { size: FONT.small, fill: PAL.cream }));

    rows.forEach(function (b) { b.setDepth(80); });
    return rows;
  }

  /* 지금 이어서 걸을지 물어봅니다 */
  function askNextDay(scene, entry, isEpi) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    if (scene.__askingNext) return;
    scene.__askingNext = true;

    const layer = scene.add.container(0, 0).setDepth(600);
    const scrim = scene.add.graphics();
    scrim.fillStyle(0x0d1424, 0.95); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    layer.add(scene.add.text(W / 2, H * 0.34, '내일 하는 건 어때?',
      style(26, PAL.cream, { align: 'center' })).setOrigin(0.5));
    layer.add(scene.add.text(W / 2, H * 0.42, '물론 하고 싶다면 지금 해도 괜찮아.',
      style(FONT.body, PAL.dimWarm, { align: 'center', wordWrap: { width: W - 60 } })).setOrigin(0.5));

    layer.add(button(scene, W / 2, H * 0.56, 280, 64,
      isEpi ? '지금 에필로그를 볼래' : '지금 이어서 걸을래', function () {
        SaveSystem.checkpoint(entry, {});
        fadeOut(scene, 700, function () { scene.scene.start(entry); });
      }, { size: FONT.label, fill: PAL.sun }));

    layer.add(button(scene, W / 2, H * 0.56 + 82, 280, 60, '오늘은 여기까지 할래', function () {
      SaveSystem.set('checkpoint', null);
      fadeOut(scene, 700, function () { scene.scene.start('TitleScene'); });
    }, { size: FONT.small }));

    layer.add(button(scene, W / 2, H * 0.56 + 160, 200, 54, '다시 볼래', function () {
      layer.destroy();
      scene.__askingNext = false;
    }, { size: FONT.small, alpha: 0.9 }));
  }

  /* ── 제목 화면 아래 저작권 안내 ─────────────── */
  /* 작게, 버튼을 건드리지 않을 만큼만 */
  function footer(scene) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const a = scene.add.text(0, 0, GAME.COPYRIGHT, style(FONT.tiny, PAL.dim)).setOrigin(0.5);
    const b = scene.add.text(0, 0, GAME.LICENSE, style(FONT.tiny, PAL.dim, {
      align: 'center', wordWrap: { width: W - 28 }, lineSpacing: 2
    })).setOrigin(0.5);

    const inner = a.height + 2 + b.height;
    a.y = -inner / 2 + a.height / 2;
    b.y = inner / 2 - b.height / 2;

    const c = scene.add.container(W / 2, H - inner / 2 - 10).setDepth(60);
    c.add([a, b]);
    c.setAlpha(0.7);
    c.boxH = inner;
    return c;
  }

  /* 화면 가운데 자막 (연출용) */
  function caption(scene, lines, opt) {
    opt = opt || {};
    const y = opt.y || GAME.HEIGHT * 0.42;
    const c = scene.add.container(0, 0).setDepth(900).setScrollFactor(0);
    const back = scene.add.graphics();
    back.fillStyle(0x101a2e, 0.55);
    back.fillRect(0, y - 74, GAME.WIDTH, 148);
    back.setAlpha(0);
    const t = scene.add.text(GAME.WIDTH / 2, y, '', style(opt.size || FONT.body, opt.color || PAL.cream, {
      align: 'center', wordWrap: { width: GAME.WIDTH - 76 }, lineSpacing: 8
    })).setOrigin(0.5).setAlpha(0);

    /* 눌러야 다음 줄로 넘어갑니다 — 저절로 휙 지나가지 않게 */
    const tip = scene.add.text(GAME.WIDTH / 2, y + 76, GAME.TAP_NEXT,
      style(FONT.tiny, PAL.dim)).setOrigin(0.5).setAlpha(0);
    c.add([back, t, tip]);
    scene.tweens.add({ targets: back, alpha: 1, duration: 600 });

    const zone = scene.add.zone(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT)
      .setOrigin(0.5).setDepth(899).setScrollFactor(0).setInteractive();

    let i = 0;
    let ready = false;
    let closed = false;

    function finish() {
      if (closed) return;
      closed = true;
      zone.destroy();
      scene.tweens.add({ targets: [back, tip], alpha: 0, duration: 500 });
      scene.time.delayedCall(560, function () { c.destroy(); if (opt.onDone) opt.onDone(); });
    }

    function next() {
      if (i >= lines.length) { finish(); return; }
      ready = false;
      t.setText(lines[i++]);
      t.setAlpha(0);
      tip.setAlpha(0);
      scene.tweens.add({
        targets: t, alpha: 1, duration: 700, ease: 'Sine.easeOut',
        onComplete: function () {
          ready = true;
          scene.tweens.add({ targets: tip, alpha: 0.85, duration: 500, delay: 500 });
        }
      });
    }

    function step() {
      if (closed) return;
      if (!ready) {                                  // 아직 나타나는 중이면 즉시 완성
        scene.tweens.killTweensOf(t);
        t.setAlpha(1); ready = true;
        scene.tweens.add({ targets: tip, alpha: 0.85, duration: 300 });
        return;
      }
      AudioSystem.tap();
      scene.tweens.add({ targets: t, alpha: 0, duration: 400, onComplete: next });
    }
    zone.on('pointerup', step);

    if (scene.input.keyboard) {
      const keys = scene.input.keyboard.addKeys('SPACE,ENTER');
      let held = false;
      const tick = function () {
        if (closed) { scene.events.off('update', tick); return; }
        const down = keys.SPACE.isDown || keys.ENTER.isDown;
        if (down && !held) step();
        held = down;
      };
      scene.events.on('update', tick);
    }

    next();
    c.skip = finish;
    return c;
  }

  /* 상단 목표 안내 */
  function objective(scene, text) {
    const y = 44;
    const c = scene.add.container(GAME.WIDTH / 2 - 34, y).setDepth(880).setScrollFactor(0);
    const t = scene.add.text(0, 0, text, style(FONT.small, PAL.cream)).setOrigin(0.5);
    const w = Math.min(GAME.WIDTH - 132, t.width + 34);
    const g = scene.add.graphics();
    g.fillStyle(0x1c2740, 0.62);
    g.fillRoundedRect(-w / 2, -17, w, 34, 17);
    c.add([g, t]);
    c.setAlpha(0);
    scene.tweens.add({ targets: c, alpha: 1, duration: 500 });

    c.setText = function (s) {
      t.setText(s);
      const nw = Math.min(GAME.WIDTH - 132, t.width + 34);
      g.clear(); g.fillStyle(0x1c2740, 0.62); g.fillRoundedRect(-nw / 2, -17, nw, 34, 17);
      c.setAlpha(0);
      scene.tweens.add({ targets: c, alpha: 1, duration: 400 });
    };
    return c;
  }

  /* 상호작용 안내 말풍선 (오브젝트 위 물결표시) */
  function marker(scene, x, y) {
    const c = scene.add.container(x, y);
    const g = scene.add.graphics();
    g.fillStyle(0xffffff, 0.92);
    g.fillCircle(0, 0, 11);
    g.lineStyle(2, HEX(PAL.sunDeep), 0.8);
    g.strokeCircle(0, 0, 11);
    const t = scene.add.text(0, 0, '·', style(20, PAL.sunDeep)).setOrigin(0.5);
    t.setText('!');
    t.setFontSize(16);
    c.add([g, t]);
    scene.tweens.add({ targets: c, y: y - 5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    return c;
  }

  function fadeIn(scene, ms, color) {
    scene.cameras.main.fadeIn(ms || 700, ...(color || [12, 18, 34]));
  }

  function fadeOut(scene, ms, cb, color) {
    const cam = scene.cameras.main;
    cam.fadeOut(ms || 700, ...(color || [12, 18, 34]));
    cam.once('camerafadeoutcomplete', function () { if (cb) cb(); });
  }

  /* 일시정지(설정) 버튼 — 오른쪽 위 */
  /* 누르는 순간 바로 반응하고, 대고 있는 동안 눌린 채로 있는 버튼.
     제기를 차거나 공깃돌을 잡는 것처럼 때를 맞추는 놀이에 씁니다.
     (보통 버튼은 손을 뗄 때 반응하므로 한 박자 늦습니다.) */
  function padButton(scene, x, y, w, h, label, opt) {
    opt = opt || {};
    w = Math.max(w, TOUCH.min);
    h = Math.max(h, TOUCH.min);
    const c = scene.add.container(x, y);
    const g = scene.add.graphics();
    const fill = HEX(opt.fill || PAL.paper);
    const line = HEX(opt.strokeColor || PAL.sunDeep);
    const round = opt.round === undefined ? 18 : opt.round;

    function draw(pressed) {
      g.clear();
      if (!pressed) { g.fillStyle(0x000000, 0.16); g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, round); }
      g.fillStyle(fill, opt.alpha === undefined ? 0.96 : opt.alpha);
      g.fillRoundedRect(-w / 2, -h / 2 + (pressed ? 2 : 0), w, h, round);
      g.lineStyle(2, line, opt.strokeAlpha === undefined ? 0.6 : opt.strokeAlpha);
      g.strokeRoundedRect(-w / 2, -h / 2 + (pressed ? 2 : 0), w, h, round);
    }
    draw(false);

    const t = scene.add.text(0, 0, label, style(opt.size || FONT.label, opt.color || PAL.ink, {
      align: 'center', wordWrap: { width: w - 20 }
    })).setOrigin(0.5);

    c.add([g, t]);
    c.setSize(w, h);
    c.setInteractive();
    c.isDown = false;

    function press() {
      if (c.isDown) return;
      c.isDown = true; draw(true); t.y = 2;
      if (opt.quiet !== true) AudioSystem.tap();
      if (c.onPress) c.onPress();
    }
    function release() {
      if (!c.isDown) return;
      c.isDown = false; draw(false); t.y = 0;
      if (c.onRelease) c.onRelease();
    }
    c.on('pointerdown', press);
    c.on('pointerup', release);
    c.on('pointerout', release);
    c.on('pointerupoutside', release);

    c.setLabel = function (s) { t.setText(s); };
    c.release = release;
    return c;
  }

  function pauseButton(scene, sceneKeyToResume) {
    const b = circleButton(scene, GAME.WIDTH - 34, 44, 21, '❙❙', function () {
      scene.scene.pause();
      scene.scene.launch('PauseScene', { from: scene.scene.key });
    }, { size: 15, alpha: 0.85 });
    b.setDepth(890).setScrollFactor(0);
    return b;
  }

  return {
    style: style,
    fs: fs,
    plate: plate,
    tapNext: tapNext,
    dayEndButtons: dayEndButtons,
    footer: footer,
    panel: panel,
    button: button,
    circleButton: circleButton,
    padButton: padButton,
    caption: caption,
    objective: objective,
    marker: marker,
    fadeIn: fadeIn,
    fadeOut: fadeOut,
    pauseButton: pauseButton
  };
})();
