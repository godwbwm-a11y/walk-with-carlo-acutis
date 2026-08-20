/* 공통 UI 부품 — 큰 터치 영역, 충분한 간격, 읽기 쉬운 글자 */

window.UI = (function () {

  function style(size, color, extra) {
    return Object.assign({
      fontFamily: FONT.family,
      fontSize: size + 'px',
      color: color || PAL.ink,
      lineSpacing: Math.round(size * 0.55),
      resolution: Math.min(3, window.devicePixelRatio || 1)
    }, extra || {});
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
    c.on('pointerdown', function () { draw(true); t.y = 2; AudioSystem.tap(); });
    c.on('pointerup', function () {
      draw(false); t.y = 0;
      if (onClick) onClick();
    });
    c.on('pointerout', function () { draw(false); t.y = 0; });
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
    c.on('pointerdown', function () { draw(true); AudioSystem.tap(); });
    c.on('pointerup', function () { draw(false); if (onClick) onClick(); });
    c.on('pointerout', function () { draw(false); });
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
    const t = scene.add.text(GAME.WIDTH / 2, y, '', style(opt.size || 20, opt.color || PAL.cream, {
      align: 'center', wordWrap: { width: GAME.WIDTH - 80 }
    })).setOrigin(0.5).setAlpha(0);
    c.add([back, t]);
    scene.tweens.add({ targets: back, alpha: 1, duration: 600 });

    let i = 0;
    function next() {
      if (i >= lines.length) {
        scene.tweens.add({ targets: back, alpha: 0, duration: 500 });
        scene.time.delayedCall(560, function () { c.destroy(); if (opt.onDone) opt.onDone(); });
        return;
      }
      t.setText(lines[i++]);
      t.setAlpha(0);
      scene.tweens.add({
        targets: t, alpha: 1, duration: 700, ease: 'Sine.easeOut',
        onComplete: function () {
          scene.time.delayedCall(opt.hold || 1400, function () {
            scene.tweens.add({ targets: t, alpha: 0, duration: 600, onComplete: next });
          });
        }
      });
    }
    next();
    return c;
  }

  /* 상단 목표 안내 */
  function objective(scene, text) {
    const y = 44;
    const c = scene.add.container(GAME.WIDTH / 2, y).setDepth(880).setScrollFactor(0);
    const t = scene.add.text(0, 0, text, style(FONT.small, PAL.cream)).setOrigin(0.5);
    const w = Math.min(GAME.WIDTH - 40, t.width + 34);
    const g = scene.add.graphics();
    g.fillStyle(0x1c2740, 0.62);
    g.fillRoundedRect(-w / 2, -17, w, 34, 17);
    c.add([g, t]);
    c.setAlpha(0);
    scene.tweens.add({ targets: c, alpha: 1, duration: 500 });

    c.setText = function (s) {
      t.setText(s);
      const nw = Math.min(GAME.WIDTH - 40, t.width + 34);
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
    panel: panel,
    button: button,
    circleButton: circleButton,
    caption: caption,
    objective: objective,
    marker: marker,
    fadeIn: fadeIn,
    fadeOut: fadeOut,
    pauseButton: pauseButton
  };
})();
