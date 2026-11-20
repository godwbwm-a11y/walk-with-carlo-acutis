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

  const AUTO_SHADOW = 'rgba(6,10,22,0.78)';

  /* 밝은 글자인지 — 밝은 글자는 대개 하늘·바다·밤 위에 직접 놓이므로 그림자를 깔아 줍니다 */
  function isLight(color) {
    if (typeof color !== 'string' || color[0] !== '#' || color.length < 7) return false;
    const r = parseInt(color.substr(1, 2), 16), g = parseInt(color.substr(3, 2), 16), b = parseInt(color.substr(5, 2), 16);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.62;
  }

  function style(size, color, extra) {
    const px = fs(size);
    const base = {
      fontFamily: FONT.family,
      fontSize: px + 'px',
      color: color || PAL.ink,
      lineSpacing: Math.round(px * 0.52),
      resolution: renderScale()
    };
    /* 배경이 무엇이든 읽히도록 — 밝은 글자 아래에 얇고 부드러운 어두운 그림자.
       종이 위의 진한 글자에는 그림자를 넣지 않습니다(번져 보입니다). */
    if (isLight(base.color) && !(extra && (extra.backgroundColor || extra.shadow === false))) {
      base.shadow = { offsetX: 0, offsetY: Math.max(1, Math.round(px / 14)), color: AUTO_SHADOW,
        blur: Math.max(3, Math.round(px / 5)), fill: true, stroke: true };
    }
    const out = Object.assign(base, extra || {});
    if (out.shadow === false) delete out.shadow;
    return out;
  }

  /* 읽기 힘든 배경 위에 글을 얹을 때 뒤에 까는 판 */
  /* 밝은 글자로 만들었다가 나중에 진한 색으로 바꾸는 곳이 있습니다(밝은 머리글 등).
     그때 자동으로 깔았던 그림자가 남으면 글자가 번져 보이므로 함께 거둡니다. */
  (function patchSetColor() {
    const T = Phaser.GameObjects.Text.prototype;
    const orig = T.setColor;
    T.setColor = function (color) {
      const r = orig.call(this, color);
      if (this.style && this.style.shadowColor === AUTO_SHADOW && !isLight(color)) {
        this.setShadow(0, 0, '#000', 0, false, false);
      }
      return r;
    };
  })();

  function plate(scene, x, y, w, h, opt) {
    opt = opt || {};
    const g = scene.add.graphics();
    g.fillStyle(HEX(opt.fill || '#101a2e'), opt.alpha === undefined ? 0.72 : opt.alpha);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, opt.radius === undefined ? 20 : opt.radius);
    return g;
  }

  /* ── 단추와 판의 겉모습(스킨) ─────────────────────────
     예전에는 도형에 두꺼운 주황 테두리와 딱딱한 그림자를 얹었습니다.
     이제 캔버스에 한 번 구워 둡니다 — 부드럽게 번진 그림자, 위에서 비치는 옅은 빛,
     머리카락처럼 가는 테두리, 알약처럼 둥근 모서리. 같은 크기·종류는 한 번만 굽습니다. */
  const SKIN_PAD = 14;

  function mix(hex, to, t) {
    const a = Phaser.Display.Color.HexStringToColor(hex), b = Phaser.Display.Color.HexStringToColor(to);
    const r = Math.round(a.red + (b.red - a.red) * t), g = Math.round(a.green + (b.green - a.green) * t), bl = Math.round(a.blue + (b.blue - a.blue) * t);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }
  function rgba(hex, al) {
    const c = Phaser.Display.Color.HexStringToColor(hex);
    return 'rgba(' + c.red + ',' + c.green + ',' + c.blue + ',' + al + ')';
  }

  /* 종류 — 색의 기준과 그림자 빛깔 */
  function skinStyle(fill) {
    const f = (fill || PAL.paper).toLowerCase();
    if (f === PAL.sun.toLowerCase()) {
      return { top: '#f9cf8e', bot: '#e8984a', line: 'rgba(170,92,30,0.45)', shadow: 'rgba(160,80,20,0.42)', hi: 'rgba(255,248,230,0.75)', glow: true };
    }
    if (f === PAL.paper.toLowerCase() || f === '#fdf3e0') {
      return { top: '#fffcf6', bot: '#f4e8d3', line: 'rgba(150,105,60,0.26)', shadow: 'rgba(30,20,12,0.26)', hi: 'rgba(255,255,255,0.95)' };
    }
    if (f === PAL.cream.toLowerCase()) {
      return { top: '#fffdf8', bot: '#efe4d2', line: 'rgba(150,105,60,0.22)', shadow: 'rgba(30,20,12,0.24)', hi: 'rgba(255,255,255,0.95)' };
    }
    return { top: mix(f, '#ffffff', 0.22), bot: mix(f, '#000000', 0.12), line: rgba(f, 0.55).replace('rgba', 'rgba'), shadow: 'rgba(25,18,12,0.3)', hi: 'rgba(255,255,255,0.45)' };
  }

  function skinKey(kind, fill, w, h, r) { return 'ui_' + kind + '_' + (fill || 'p').replace('#', '') + '_' + Math.round(w) + 'x' + Math.round(h) + '_' + Math.round(r); }

  /* 둥근 사각형(또는 원) 하나를 굽습니다 — 그림자 자리를 위해 둘레에 여백을 둡니다 */
  function skin(scene, kind, w, h, r, fill, opt) {
    opt = opt || {};
    const key = skinKey(kind, fill, w, h, r) + (opt.flat ? '_f' : '');
    if (scene.textures.exists(key)) return key;
    const S = skinStyle(fill);
    const R = window.HiTex ? HiTex.density(scene, 'prop') : 1;
    const P = SKIN_PAD;
    const tex = scene.textures.createCanvas(key, Math.ceil((w + P * 2) * R), Math.ceil((h + P * 2) * R));
    const c = tex.getContext();
    c.scale(R, R);
    const path = function (x, y, ww, hh, rr) {
      rr = Math.min(rr, ww / 2, hh / 2);
      c.beginPath();
      c.moveTo(x + rr, y); c.arcTo(x + ww, y, x + ww, y + hh, rr); c.arcTo(x + ww, y + hh, x, y + hh, rr);
      c.arcTo(x, y + hh, x, y, rr); c.arcTo(x, y, x + ww, y, rr); c.closePath();
    };
    /* 그림자 — 넓게 번진 것과 바로 아래 짙은 것 두 겹 */
    if (!opt.flat) {
      c.save();
      c.shadowColor = S.shadow; c.shadowBlur = 12; c.shadowOffsetY = 5;
      path(P, P, w, h, r); c.fillStyle = S.bot; c.fill();
      c.shadowColor = 'rgba(0,0,0,0.12)'; c.shadowBlur = 2; c.shadowOffsetY = 1;
      c.fill();
      c.restore();
    }
    /* 몸통 — 위가 밝고 아래로 갈수록 살짝 짙게 */
    const g = c.createLinearGradient(0, P, 0, P + h);
    g.addColorStop(0, S.top); g.addColorStop(1, S.bot);
    path(P, P, w, h, r); c.fillStyle = g; c.fill();
    /* 위쪽 가장자리의 빛 */
    c.save(); path(P, P, w, h, r); c.clip();
    const hg = c.createLinearGradient(0, P, 0, P + Math.min(h * 0.55, 30));
    hg.addColorStop(0, S.hi); hg.addColorStop(1, 'rgba(255,255,255,0)');
    c.globalAlpha = 0.55; c.fillStyle = hg; c.fillRect(P, P, w, Math.min(h * 0.55, 30)); c.globalAlpha = 1;
    c.restore();
    /* 가는 테두리 둘 — 바깥은 그늘, 안쪽은 빛 */
    c.lineWidth = 1; c.strokeStyle = S.line; path(P + 0.5, P + 0.5, w - 1, h - 1, r - 0.5); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.55)'; path(P + 1.5, P + 1.5, w - 3, h - 3, r - 1.5); c.stroke();
    if (window.HiTex) HiTex.mark(tex, R);
    tex.refresh();
    return key;
  }

  function plate(scene, x, y, w, h, opt) {
    opt = opt || {};
    const g = scene.add.graphics();
    g.fillStyle(HEX(opt.fill || '#101a2e'), opt.alpha === undefined ? 0.72 : opt.alpha);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, opt.radius === undefined ? 20 : opt.radius);
    return g;
  }

  /* 판 — 종이처럼 부드러운 카드. 예전처럼 장면에 바로 놓이고, 컨테이너에 넣어도 됩니다 */
  function panel(scene, x, y, w, h, opt) {
    opt = opt || {};
    const r = opt.radius === undefined ? 22 : opt.radius;
    const key = skin(scene, 'panel', w, h, r, opt.fill || PAL.paper, { flat: opt.shadow === false });
    const img = scene.add.image(x, y, key);
    if (opt.alpha !== undefined) img.setAlpha(opt.alpha);
    return img;
  }

  /* 누를 때의 움직임 — 살짝 작아졌다가 놓으면 탄력 있게 돌아옵니다 */
  function pressFx(scene, c, bg, down) {
    scene.tweens.killTweensOf(c);
    if (down) {
      scene.tweens.add({ targets: c, scaleX: 0.965, scaleY: 0.965, duration: 70, ease: 'Quad.easeOut' });
      if (bg && bg.setTint) bg.setTint(0xece4d8);
    } else {
      scene.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 220, ease: 'Back.easeOut' });
      if (bg && bg.clearTint) bg.clearTint();
    }
  }

  /* 넉넉한 크기의 기본 버튼 (최소 높이 56) */
  function button(scene, x, y, w, h, label, onClick, opt) {
    opt = opt || {};
    h = Math.max(h, TOUCH.min);
    const c = scene.add.container(x, y);
    /* 한 줄짜리는 알약 모양, 여러 줄짜리 큰 단추는 둥근 카드 모양 */
    const r = opt.radius !== undefined ? opt.radius : (h <= 64 ? h / 2 : 20);
    const bg = scene.add.image(0, 0, skin(scene, 'btn', w, h, r, opt.fill || PAL.paper));
    if (opt.alpha !== undefined) bg.setAlpha(opt.alpha);

    const t = scene.add.text(0, 0, label, style(opt.size || FONT.label, opt.color || PAL.ink, {
      align: 'center', wordWrap: { width: w - 34 }
    })).setOrigin(0.5);
    if (opt.alpha !== undefined && opt.alpha < 0.5) t.setAlpha(Math.max(0.45, opt.alpha + 0.2));
    /* 글이 단추보다 크면(영어는 대개 더 깁니다) 글자를 조금씩 줄여 단추 안에 담습니다 */
    const fit = function () {
      let size = parseInt(t.style.fontSize, 10) || FONT.label;
      while (size > 11 && (t.height > h - 6 || t.width > w - 14)) {
        size -= 1;
        t.setFontSize(size);
      }
    };
    fit();

    c.add([bg, t]);
    c.setSize(w, h + 12);          // 손가락이 조금 빗나가도 눌리도록 여유를 둡니다
    c.setInteractive();

    /* 손가락이 스치기만 해도 눌리지 않도록 — 누른 자리에서 크게 벗어나면 취소합니다 */
    let downAt = null;
    c.on('pointerdown', function (p) {
      downAt = { x: p.x, y: p.y };
      pressFx(scene, c, bg, true); AudioSystem.tap();
    });
    c.on('pointerup', function (p) {
      pressFx(scene, c, bg, false);
      /* 누른 자리에서 크게 밀렸다면 누른 것으로 치지 않습니다.
         누른 순간을 보지 못했다면(버튼이 뒤늦게 생겼다면) 그대로 넣습니다. */
      const was = downAt; downAt = null;
      if (was && Phaser.Math.Distance.Between(was.x, was.y, p.x, p.y) > TOUCH.slop) return;
      if (window.Scroller && Scroller.caught) return;     // 미끄러지던 목록을 멈추려던 터치
      if (onClick) onClick();
    });
    c.on('pointerout', function () { if (downAt) pressFx(scene, c, bg, false); downAt = null; });
    c.on('pointerupoutside', function () { pressFx(scene, c, bg, false); downAt = null; });
    c.setLabel = function (s) { t.setFontSize(opt.size || FONT.label); t.setText(s); fit(); };
    return c;
  }

  /* 원형 아이콘 버튼 — 반투명한 유리알 같은 동그라미 */
  function circleButton(scene, x, y, r, glyph, onClick, opt) {
    opt = opt || {};
    r = Math.max(r, TOUCH.min / 2);
    const c = scene.add.container(x, y);
    const bg = scene.add.image(0, 0, skin(scene, 'circ', r * 2, r * 2, r, opt.fill || PAL.paper));
    bg.setAlpha(opt.alpha === undefined ? 0.96 : Math.max(opt.alpha, 0.9));
    const t = scene.add.text(0, 0, glyph, style(opt.size || 22, opt.color || PAL.ink)).setOrigin(0.5);
    c.add([bg, t]);
    c.setSize(r * 2 + 16, r * 2 + 16);
    c.setInteractive(new Phaser.Geom.Circle(r + 8, r + 8, r + 8), Phaser.Geom.Circle.Contains);
    let downAt = null;
    c.on('pointerdown', function (p) { downAt = { x: p.x, y: p.y }; pressFx(scene, c, bg, true); AudioSystem.tap(); });
    c.on('pointerup', function (p) {
      pressFx(scene, c, bg, false);
      const was = downAt; downAt = null;
      if (was && Phaser.Math.Distance.Between(was.x, was.y, p.x, p.y) > TOUCH.slop) return;
      if (onClick) onClick();
    });
    c.on('pointerout', function () { if (downAt) pressFx(scene, c, bg, false); downAt = null; });
    c.on('pointerupoutside', function () { pressFx(scene, c, bg, false); downAt = null; });
    /* 글자 대신 선으로 그린 그림을 얹을 때 */
    c.icon = function (draw) {
      const g = scene.add.graphics();
      draw(g);
      c.add(g);
      return c;
    };
    return c;
  }

  /* 탭 — 어두운 알약 위를 밝은 손잡이가 미끄러져 옮겨 갑니다 */
  function segmented(scene, x, y, w, h, labels, index, onChange) {
    const c = scene.add.container(x, y);
    const n = labels.length, sw = (w - 8) / n;
    const track = scene.add.graphics();
    track.fillStyle(0x0b1222, 0.5); track.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    track.lineStyle(1, 0xffffff, 0.14); track.strokeRoundedRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1, h / 2);
    const thumb = scene.add.image(0, 0, skin(scene, 'btn', sw, h - 8, (h - 8) / 2, PAL.sun));
    c.add([track, thumb]);
    const texts = labels.map(function (l, i) {
      const t = scene.add.text(-w / 2 + 4 + sw * (i + 0.5), 0, l, style(FONT.label, PAL.cream)).setOrigin(0.5);
      c.add(t);
      return t;
    });
    const place = function (i, animate) {
      const tx = -w / 2 + 4 + sw * (i + 0.5);
      scene.tweens.killTweensOf(thumb);
      if (animate) scene.tweens.add({ targets: thumb, x: tx, duration: 260, ease: 'Cubic.easeOut' });
      else thumb.x = tx;
      texts.forEach(function (t, k) {
        t.setColor(k === i ? PAL.ink : PAL.cream);
        t.setShadow(0, 0, '#000', 0, false, false);
        if (k !== i) t.setShadow(0, 1, 'rgba(6,10,22,0.7)', 3, true, true);
      });
      c.index = i;
    };
    place(index || 0, false);
    c.setSize(w, h + 10);
    c.setInteractive();
    c.on('pointerup', function (p) {
      const lx = p.x - x + w / 2;
      const i = Phaser.Math.Clamp(Math.floor(lx / (w / n)), 0, n - 1);
      if (i === c.index) return;
      AudioSystem.tap();
      place(i, true);
      if (onChange) onChange(i);
    });
    c.setIndex = function (i) { place(i, true); };
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
    g.fillStyle(0x101a2e, 0.78);
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
    /* 푸터 자리의 배경이 밝은 모래색이라 검은 글씨가 가장 잘 읽힙니다 */
    const a = scene.add.text(0, 0, GAME.COPYRIGHT, style(FONT.tiny, '#000000')).setOrigin(0.5);
    const b = scene.add.text(0, 0, GAME.LICENSE, style(FONT.tiny, '#000000', {
      align: 'center', wordWrap: { width: W - 28 }, lineSpacing: 2
    })).setOrigin(0.5);

    const inner = a.height + 2 + b.height;
    a.y = -inner / 2 + a.height / 2;
    b.y = inner / 2 - b.height / 2;

    const c = scene.add.container(W / 2, H - inner / 2 - 10).setDepth(60);
    c.add([a, b]);
    c.setAlpha(0.9);            // 너무 옅으면 검은색이 회색으로 보입니다
    c.boxH = inner;
    return c;
  }

  /* 화면 가운데 자막 (연출용) */
  function caption(scene, lines, opt) {
    opt = opt || {};
    const y = opt.y || GAME.HEIGHT * 0.42;
    const c = scene.add.container(0, 0).setDepth(900).setScrollFactor(0);
    const back = scene.add.graphics();
    back.fillStyle(0x101a2e, 0.7);
    /* 아래의 “화면을 누르면 계속됩니다” 까지 덮도록 넉넉히 잡습니다.
       예전에는 그 줄이 띠 밖으로 나가 배경에 묻혔습니다. */
    back.fillRect(0, y - 74, GAME.WIDTH, 172);
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
    const t = scene.add.text(0, 0, '', style(FONT.small, PAL.cream)).setOrigin(0.5);
    t.__noFit = true;
    /* 알약 안에 들어가도록 — 긴 글(영어 등)은 글자를 조금 줄입니다 */
    const put = function (s) {
      t.setFontSize(FONT.small); t.setText(s);
      let size = FONT.small;
      while (size > 11 && t.width > GAME.WIDTH - 132 - 22) { size -= 1; t.setFontSize(size); }
    };
    put(text);
    const w = Math.min(GAME.WIDTH - 132, t.width + 34);
    const g = scene.add.graphics();
    g.fillStyle(0x1c2740, 0.8);
    g.fillRoundedRect(-w / 2, -17, w, 34, 17);
    c.add([g, t]);
    c.setAlpha(0);
    scene.tweens.add({ targets: c, alpha: 1, duration: 500 });

    c.setText = function (s) {
      put(s);
      const nw = Math.min(GAME.WIDTH - 132, t.width + 34);
      g.clear(); g.fillStyle(0x1c2740, 0.8); g.fillRoundedRect(-nw / 2, -17, nw, 34, 17);
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
    /* 흰 동그라미 위에서는 진한 먹빛이 가장 또렷합니다 */
    const t = scene.add.text(0, 0, '·', style(20, PAL.ink)).setOrigin(0.5);
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
    const round = opt.round === undefined ? 20 : opt.round;
    const bg = scene.add.image(0, 0, skin(scene, 'btn', w, h, round, opt.fill || PAL.paper));
    if (opt.alpha !== undefined) bg.setAlpha(opt.alpha);

    const t = scene.add.text(0, 0, label, style(opt.size || FONT.label, opt.color || PAL.ink, {
      align: 'center', wordWrap: { width: w - 20 }
    })).setOrigin(0.5);

    c.add([bg, t]);
    c.setSize(w, h);
    c.setInteractive();
    c.isDown = false;

    function press() {
      if (c.isDown) return;
      c.isDown = true; pressFx(scene, c, bg, true);
      if (opt.quiet !== true) AudioSystem.tap();
      if (c.onPress) c.onPress();
    }
    function release() {
      if (!c.isDown) return;
      c.isDown = false; pressFx(scene, c, bg, false);
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
    const b = circleButton(scene, GAME.WIDTH - 34, 44, 21, '', function () {
      scene.scene.pause();
      scene.scene.launch('PauseScene', { from: scene.scene.key });
    }, { size: 15, alpha: 0.92 });
    /* 글자(❙❙) 대신 두 개의 둥근 막대 */
    b.icon(function (g) {
      g.fillStyle(HEX(PAL.ink), 0.85);
      g.fillRoundedRect(-6.5, -7.5, 4.6, 15, 2.3);
      g.fillRoundedRect(1.9, -7.5, 4.6, 15, 2.3);
    });
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
    skin: skin,
    pressFx: pressFx,
    segmented: segmented,
    padButton: padButton,
    caption: caption,
    objective: objective,
    marker: marker,
    fadeIn: fadeIn,
    fadeOut: fadeOut,
    pauseButton: pauseButton
  };
})();
