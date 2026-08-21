/* 직접 적어보는 칸

   게임 화면(캔버스) 위에 브라우저 입력창을 따로 띄웁니다.
   예전처럼 Phaser 안에 입력칸을 얹으면, 자판이 올라올 때
   화면 높이가 바뀌면서 게임 화면 전체가 다시 맞춰지고 — 그림이 깨졌습니다.

   지금은 적는 동안 게임 화면을 그대로 얼려 두고,
   글 적는 칸만 위에 조용히 올라옵니다.
   엔터를 누르면 그대로 다음으로 넘어갑니다. */

window.TextInput = (function () {

  let live = null;                 // 지금 열려 있는 칸

  function supported() {
    return !!(typeof document !== 'undefined' && document.body);
  }

  /* ── 적는 동안 게임 화면이 흔들리지 않게 붙잡아 둡니다 ── */
  function hold(game) {
    window.__typing = true;
    try { if (game && game.scale) game.scale.stopListeners(); } catch (e) {}
  }

  function release(game) {
    window.__typing = false;
    try {
      if (game && game.scale) {
        game.scale.startListeners();
        game.scale.refresh();
      }
    } catch (e) {}
  }

  /* 자판이 올라오면 보이는 높이만큼만 씁니다 */
  function fitToViewport(layer) {
    const vv = window.visualViewport;
    if (!vv) return;
    layer.style.height = vv.height + 'px';
    layer.style.top = vv.offsetTop + 'px';
  }

  /* ── 물어보고, 적고, 적은 것을 보여주기까지 한 번에 ──────────────
     opt: { question, note, placeholder, okLabel, skipLabel, showBack, maxLength }
     onDone(value|null) 로 돌려줍니다. */
  function ask(scene, opt, onDone) {
    opt = opt || {};
    if (!supported()) { onDone(null); return; }
    /* 앞서 열린 칸이 남아 있으면 조용히 치웁니다 —
       장면이 도중에 바뀌어도 다음부터 안 열리는 일이 없도록 */
    if (live) live.dispose();

    const game = scene.game;
    hold(game);

    const layer = document.createElement('div');
    layer.id = 'ask-layer';

    const inner = document.createElement('div');
    inner.className = 'ask-inner';
    layer.appendChild(inner);

    if (opt.question) {
      const q = document.createElement('p');
      q.className = 'ask-q';
      q.textContent = opt.question;
      inner.appendChild(q);
    }
    if (opt.note) {
      const n = document.createElement('p');
      n.className = 'ask-note';
      n.textContent = opt.note;
      inner.appendChild(n);
    }

    /* 한 줄 칸입니다 — 엔터가 “다 적었어요” 와 같은 뜻이 되도록 */
    const field = document.createElement('input');
    field.className = 'ask-field';
    field.type = 'text';
    field.enterKeyHint = 'done';
    field.autocomplete = 'off';
    field.setAttribute('autocapitalize', 'off');
    field.maxLength = opt.maxLength || 120;
    field.placeholder = opt.placeholder || '천천히 적어보세요';
    field.value = opt.value || '';
    inner.appendChild(field);

    const tip = document.createElement('p');
    tip.className = 'ask-tip';
    tip.textContent = '엔터를 누르면 그대로 넘어갑니다';
    inner.appendChild(tip);

    const ok = document.createElement('button');
    ok.className = 'ask-btn';
    ok.type = 'button';
    ok.textContent = opt.okLabel || '다 적었어요';
    inner.appendChild(ok);

    const skip = document.createElement('button');
    skip.className = 'ask-btn ask-skip';
    skip.type = 'button';
    skip.textContent = opt.skipLabel || '적지 않고 넘어가기';
    inner.appendChild(skip);

    document.body.appendChild(layer);
    fitToViewport(layer);

    const onViewport = function () { fitToViewport(layer); };
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onViewport);
      window.visualViewport.addEventListener('scroll', onViewport);
    }

    let closed = false;

    /* 화면에서만 치웁니다 — 돌려줄 값은 건드리지 않습니다 */
    function dispose() {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onViewport);
        window.visualViewport.removeEventListener('scroll', onViewport);
      }
      try { field.blur(); } catch (e) {}
      if (layer.parentNode) layer.parentNode.removeChild(layer);
      if (live && live.layer === layer) live = null;
      setTimeout(function () { release(game); }, 60);
    }

    function close(save) {
      if (closed) return;
      closed = true;
      const v = save ? (field.value || '').trim() : '';
      dispose();

      if (save && v) {
        if (opt.showBack === false) { onDone(v); return; }
        showBack(scene, v, opt, function () { onDone(v); });
      } else {
        onDone(save ? null : null);
      }
    }

    ok.addEventListener('click', function () { close(true); });
    skip.addEventListener('click', function () { close(false); });
    field.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        close(true);
      }
    });

    live = { close: close, dispose: dispose, field: field, layer: layer };

    /* 적는 도중에 장면이 바뀌어도 칸이 남지 않게 */
    scene.events.once('shutdown', function () {
      if (live && live.layer === layer) { closed = true; dispose(); }
    });

    setTimeout(function () { try { field.focus(); } catch (e) {} }, 80);
  }

  /* 적은 글을 크게 한 번 보여줍니다 — 잘리지 않게 크기를 맞춥니다 */
  function showBack(scene, value, opt, after) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = scene.add.container(0, 0).setDepth(1400).setScrollFactor(0).setAlpha(0);
    const scrim = scene.add.graphics().setScrollFactor(0);
    scrim.fillStyle(0x0e1526, 0.97); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    const head = scene.add.text(W / 2, H * 0.22, (opt && opt.backHead) || '이렇게 적었습니다',
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

    const go = UI.button(scene, W / 2, H - 128, 250, 62, '계속', function () {
      layer.destroy();
      if (after) after();
    }, { size: FONT.label, fill: PAL.sun });
    go.setScrollFactor(0).setAlpha(0);
    layer.add(go);
    scene.tweens.add({ targets: go, alpha: 1, duration: 400, delay: 500 });
  }

  return { ask: ask, supported: supported, showBack: showBack };
})();
