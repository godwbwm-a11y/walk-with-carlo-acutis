/* 직접 적어보는 칸 — 브라우저의 입력창을 게임 화면 위에 얹습니다.
   휴대폰 자판이 아래에서 올라와도 가려지지 않도록 글 쓰는 칸을 화면 위쪽에 둡니다.
   입력이 어려운 환경에서는 조용히 건너뜁니다. */

window.TextInput = (function () {

  function supported(scene) {
    return !!(scene.add.dom && scene.game.domContainer);
  }

  /* 낮은 수준 입력칸 — 되도록 아래의 ask() 를 쓰세요. */
  function open(scene, opt, onChange) {
    opt = opt || {};
    if (!supported(scene)) return null;

    const w = opt.width || GAME.WIDTH - 60;
    const h = opt.height || 140;
    const fontPx = opt.fontSize || 21;
    const html =
      '<textarea style="' +
      'width:' + w + 'px;height:' + h + 'px;' +
      'box-sizing:border-box;padding:16px 18px;' +
      'font-family:' + FONT.family.replace(/"/g, "'") + ';' +
      'font-size:' + fontPx + 'px;line-height:1.55;color:#3d2c20;' +
      'background:#fdf3e0;border:3px solid rgba(210,130,47,.85);border-radius:16px;' +
      'outline:none;resize:none;-webkit-appearance:none;" ' +
      'placeholder="' + (opt.placeholder || '') + '" ' +
      'maxlength="200">' + (opt.value || '') + '</textarea>';

    const el = scene.add.dom(opt.x || GAME.WIDTH / 2, opt.y || GAME.HEIGHT * 0.3).createFromHTML(html);
    el.setDepth(opt.depth === undefined ? 1200 : opt.depth);
    const area = el.node.querySelector('textarea');

    if (onChange) el.addListener('input').on('input', function () { onChange(area.value); });

    return {
      dom: el,
      focus: function () { try { area.focus(); } catch (e) {} },
      blur: function () { try { area.blur(); } catch (e) {} },
      value: function () { return (area.value || '').trim(); },
      destroy: function () { try { area.blur(); } catch (e) {} el.destroy(); }
    };
  }

  /* ── 물어보고, 적고, 적은 것을 보여주기까지 한 번에 ──────────────
     opt: { question, note, placeholder, okLabel, skipLabel, showBack }
     onDone(value|null) 로 돌려줍니다. */
  function ask(scene, opt, onDone) {
    opt = opt || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const depth = opt.depth === undefined ? 1400 : opt.depth;

    const layer = scene.add.container(0, 0).setDepth(depth).setScrollFactor(0);
    const scrim = scene.add.graphics().setScrollFactor(0);
    scrim.fillStyle(0x0e1526, 0.97); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    /* 1 · 질문은 맨 위에 */
    let y = 74;
    const q = scene.add.text(W / 2, y, opt.question || '', UI.style(FONT.body, PAL.cream, {
      align: 'center', wordWrap: { width: W - 52 }, lineSpacing: 8
    })).setOrigin(0.5, 0).setScrollFactor(0);
    layer.add(q);
    y += q.height + 10;

    if (opt.note) {
      const n = scene.add.text(W / 2, y, opt.note, UI.style(FONT.small, PAL.dimWarm, {
        align: 'center', wordWrap: { width: W - 60 }, lineSpacing: 6
      })).setOrigin(0.5, 0).setScrollFactor(0);
      layer.add(n);
      y += n.height + 12;
    }
    y += 12;

    /* 2 · 글 쓰는 칸은 자판이 올라와도 보이도록 화면 위쪽에 */
    const boxH = opt.height || 150;
    const field = open(scene, {
      x: W / 2, y: y + boxH / 2,
      width: W - 52, height: boxH,
      placeholder: opt.placeholder || '천천히 적어보세요',
      depth: depth + 10
    });

    /* 3 · 버튼은 칸 바로 아래에 — 자판 위로 올라오도록 */
    const btnY = y + boxH + 42;
    const finish = (save) => {
      let v = null;
      if (save && field) v = field.value();
      if (field) field.destroy();
      layer.destroy();
      if (save && v) showBack(scene, v, opt, () => onDone(v));
      else onDone(save ? (v || null) : null);
    };

    if (field) {
      const ok = UI.button(scene, W / 2, btnY, 260, 64, opt.okLabel || '다 적었어요',
        () => finish(true), { size: FONT.label, fill: PAL.sun });
      const skip = UI.button(scene, W / 2, btnY + 78, 260, 58, opt.skipLabel || '적지 않고 넘어가기',
        () => finish(false), { size: FONT.small });
      ok.setScrollFactor(0); skip.setScrollFactor(0);
      layer.add(ok); layer.add(skip);
      scene.time.delayedCall(260, () => field.focus());
    } else {
      const ok = UI.button(scene, W / 2, y + 40, 260, 64, opt.skipLabel || '넘어가기',
        () => finish(false), { size: FONT.label, fill: PAL.sun });
      ok.setScrollFactor(0);
      layer.add(ok);
    }
  }

  /* 적은 글을 크게 한 번 보여줍니다 — 잘리지 않게 크기를 맞춥니다 */
  function showBack(scene, value, opt, after) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = scene.add.container(0, 0).setDepth(1400).setScrollFactor(0).setAlpha(0);
    const scrim = scene.add.graphics().setScrollFactor(0);
    scrim.fillStyle(0x0e1526, 0.97); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    const head = scene.add.text(W / 2, H * 0.22, opt.backHead || '이렇게 적었습니다',
      UI.style(FONT.small, PAL.dim)).setOrigin(0.5).setScrollFactor(0);
    layer.add(head);

    let size = 26;
    const body = scene.add.text(W / 2, H * 0.44, '“' + value + '”',
      UI.style(size, PAL.sun, { align: 'center', wordWrap: { width: W - 64 }, lineSpacing: 10 }))
      .setOrigin(0.5).setScrollFactor(0);
    while (body.height > H * 0.40 && size > 16) {
      size -= 1;
      body.setStyle(UI.style(size, PAL.sun, {
        align: 'center', wordWrap: { width: W - 64 }, lineSpacing: 9
      }));
    }
    layer.add(body);

    scene.tweens.add({ targets: layer, alpha: 1, duration: 400 });
    AudioSystem.chime();

    const go = UI.button(scene, W / 2, H - 128, 250, 62, '계속', () => {
      layer.destroy();
      if (after) after();
    }, { size: FONT.label, fill: PAL.sun });
    go.setScrollFactor(0).setAlpha(0);
    layer.add(go);
    scene.tweens.add({ targets: go, alpha: 1, duration: 400, delay: 500 });
  }

  return { open: open, ask: ask, supported: supported, showBack: showBack };
})();
