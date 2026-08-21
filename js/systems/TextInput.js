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

  /* 게임 화면이 실제로 재는 크기 — 캔버스를 담은 자리입니다.
     자판이 올라오면 이 자리가 낮아지고, 내려가면 되돌아옵니다. */
  function frameSize(game) {
    try {
      const p = game && game.scale && game.scale.parent;
      if (p && p.getBoundingClientRect) {
        const b = p.getBoundingClientRect();
        return { w: Math.round(b.width), h: Math.round(b.height) };
      }
    } catch (e) {}
    return { w: window.innerWidth, h: window.innerHeight };
  }

  let heldSize = null;
  let heldInterval = null;
  let holdToken = 0;

  function hold(game) {
    holdToken++;
    window.__typing = true;
    if (heldInterval === null) {
      heldSize = frameSize(game);
      try {
        if (game && game.scale) {
          game.scale.stopListeners();
          /* 창 크기 알림을 끄는 것만으로는 모자랍니다.
             Phaser 는 0.5초마다 스스로 자리 크기를 다시 재기 때문에,
             그대로 두면 자판이 덮은 크기로 캔버스가 줄어듭니다. */
          heldInterval = game.scale.resizeInterval;
          game.scale.resizeInterval = 1000000;
        }
      } catch (e) {}
    }
    return holdToken;
  }

  /* 자판이 다 내려가 자리가 제자리로 돌아온 뒤에야 다시 맞춥니다.
     곧바로 맞추면 아직 자판이 덮고 있는 작은 크기로 한 번 줄었다가
     되돌아옵니다 — 화면이 깜빡이는 것처럼 보입니다. */
  function release(game, token) {
    if (token !== holdToken) return;        // 그 사이 새 칸이 열렸으면 그대로 둡니다
    const start = heldSize;
    let last = frameSize(game);
    let steady = 0;
    let tries = 0;

    function done(needRefresh) {
      if (token !== holdToken) return;
      window.__typing = false;
      heldSize = null;
      try {
        if (game && game.scale) {
          if (heldInterval !== null) { game.scale.resizeInterval = heldInterval; heldInterval = null; }
          game.scale.startListeners();
          /* 자리 크기를 먼저 다시 재야 반영됩니다 */
          if (needRefresh) { game.scale.getParentBounds(); game.scale.refresh(); }
        }
      } catch (e) {}
    }

    function settle() {
      if (token !== holdToken) return;
      const now = frameSize(game);
      steady = (now.w === last.w && now.h === last.h) ? steady + 1 : 0;
      last = now;
      tries++;

      const backToStart = !!start && now.w === start.w && Math.abs(now.h - start.h) <= 2;

      /* 제자리로 돌아왔고 잠잠하면 — 크기가 그대로이니 다시 맞출 것도 없습니다 */
      if (steady >= 3 && backToStart) { done(false); return; }
      /* 돌아오지 않았더라도 충분히 잠잠해졌으면 그 크기에 한 번만 맞춥니다 */
      if (steady >= 3 && tries > 14) { done(true); return; }
      if (tries > 44) { done(true); return; }            // 약 2.2초

      setTimeout(settle, 50);
    }
    setTimeout(settle, 50);
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
    const token = hold(game);

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
      release(game, token);   // 자판이 다 내려간 것을 보고 스스로 맞춥니다
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
