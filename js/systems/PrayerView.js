/* 기도문 보기 — 하루의 마지막 기도를 함께 바칠 수 있도록.

   한 줄씩 천천히 나오고, 창을 넘어가면 스스로 조용히 밀려 올라갑니다.
   손으로 위아래로 밀면 앞줄을 다시 볼 수 있고,
   가볍게 한 번 누르면 남은 줄이 한꺼번에 나옵니다.
   글자는 따라 읽기 좋도록 본문보다 크게 잡았습니다. */

window.PrayerView = (function () {

  function open(scene, lines, opt) {
    opt = opt || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;

    const top = opt.top === undefined ? 190 : opt.top;
    const bottom = opt.bottom === undefined ? H - 168 : opt.bottom;
    const depth = opt.depth === undefined ? 810 : opt.depth;
    const size = opt.size === undefined ? 23 : opt.size;
    const color = opt.color || PAL.cream;
    const gap = opt.gap === undefined ? 1400 : opt.gap;        // 한 줄과 다음 줄 사이
    const blankGap = opt.blankGap === undefined ? 620 : opt.blankGap;
    const startDelay = opt.delay === undefined ? 0 : opt.delay;
    const viewH = Math.max(140, bottom - top);

    const view = {};
    const all = Array.isArray(lines) ? lines.slice() : String(lines).split('\n');

    /* ── 글이 놓이는 자리 ──────────────────────── */
    const layer = scene.add.container(0, 0).setDepth(depth).setScrollFactor(0);
    const text = scene.add.text(W / 2, top, '', UI.style(size, color, {
      align: 'center', lineSpacing: 12, wordWrap: { width: W - 64 }
    })).setOrigin(0.5, 0).setScrollFactor(0);
    layer.add(text);

    /* 창 밖으로 나간 글은 잘라 둡니다.
       카메라가 움직이는 장면에서도 창이 함께 밀리지 않도록 화면에 붙입니다. */
    const mask = scene.make.graphics({ add: false });
    mask.setScrollFactor(0);
    mask.fillRect(0, top - 8, W, viewH + 16);
    layer.setMask(mask.createGeometryMask());

    /* ── 손으로 미는 자리 ──────────────────────── */
    const zone = scene.add.zone(W / 2, top + viewH / 2, W, viewH)
      .setOrigin(0.5).setInteractive().setDepth(depth - 1).setScrollFactor(0);

    let shown = [];
    let idx = 0;
    let timer = null;
    let done = false;
    let holdUntil = 0;            // 손으로 민 뒤에는 잠시 따라가지 않습니다

    function lowest() { return Math.min(top, bottom - text.height); }
    function clamp() { text.y = Phaser.Math.Clamp(text.y, lowest(), top); }
    function canScroll() { return text.height > viewH + 2; }

    /* 새 줄이 창 아래로 밀려나면 그만큼 천천히 올라갑니다 */
    function follow() {
      const want = lowest();
      if (Date.now() < holdUntil) { clamp(); return; }
      if (want < text.y - 0.5) {
        scene.tweens.add({
          targets: text, y: want,
          duration: opt.followMs === undefined ? 1000 : opt.followMs,
          ease: 'Sine.easeInOut'
        });
      } else {
        clamp();
      }
    }

    function finish() {
      if (done) return;
      done = true;
      if (opt.onDone) opt.onDone(view);
    }

    function step() {
      timer = null;
      if (idx >= all.length) { finish(); return; }
      const line = all[idx++];
      shown.push(line);
      text.setText(shown.join('\n'));
      scene.tweens.killTweensOf(text);
      text.setAlpha(0.5);
      scene.tweens.add({ targets: text, alpha: 1, duration: 420 });
      follow();
      maybeHint();
      if (line !== '' && opt.quiet !== true) AudioSystem.talk();
      timer = scene.time.delayedCall(line === '' ? blankGap : gap, step);
    }

    /* 가볍게 누르면 남은 줄이 한꺼번에 — 기다리게 하지 않습니다 */
    function revealAll() {
      if (done) return;
      if (timer) { timer.remove(); timer = null; }
      while (idx < all.length) shown.push(all[idx++]);
      text.setText(shown.join('\n'));
      scene.tweens.killTweensOf(text);
      text.setAlpha(1);
      /* 보고 있던 자리에 그대로 둡니다 — 나머지는 손으로 내려 읽습니다 */
      clamp();
      maybeHint();
      finish();
    }

    let downY = null, downTextY = 0, moved = 0;
    zone.on('pointerdown', (p) => { downY = p.y; downTextY = text.y; moved = 0; });
    zone.on('pointermove', (p) => {
      if (downY === null) return;
      const dy = p.y - downY;
      moved = Math.max(moved, Math.abs(dy));
      if (moved > 6 && canScroll()) {
        scene.tweens.killTweensOf(text);
        text.setAlpha(1);
        text.y = downTextY + dy;
        clamp();
        holdUntil = Date.now() + 4000;
        if (hint && hint.scene && hint.alpha > 0) {
          scene.tweens.add({ targets: hint, alpha: 0, duration: 500 });
        }
      }
    });
    function release() {
      const was = downY !== null;
      const small = moved <= 6;
      downY = null;
      if (was && small) revealAll();
    }
    zone.on('pointerup', release);
    zone.on('pointerupoutside', () => { downY = null; });
    zone.on('pointerout', () => { downY = null; });

    /* PC — 휠로도 움직입니다 */
    zone.on('wheel', (p, dx, dy) => {
      if (!canScroll()) return;
      scene.tweens.killTweensOf(text);
      text.setAlpha(1);
      text.y -= dy * 0.5;
      clamp();
      holdUntil = Date.now() + 4000;
    });

    /* ── 밀어 볼 수 있다는 작은 안내 ─────────────
       글이 창을 처음 넘어가는 순간에 한 번만 알려 줍니다. */
    let hint = null;
    let hintShown = false;
    if (opt.hint !== false) {
      hint = scene.add.text(W / 2, bottom + 18,
        window.IS_DESKTOP ? '위아래로 끌어 다시 볼 수 있습니다' : '손으로 위아래로 움직일 수 있습니다',
        UI.style(FONT.tiny, '#9db0cc')).setOrigin(0.5).setDepth(depth).setScrollFactor(0).setAlpha(0);
    }

    function maybeHint() {
      if (hintShown || !hint || !hint.scene || !canScroll()) return;
      hintShown = true;
      scene.tweens.add({ targets: hint, alpha: 0.8, duration: 700 });
      scene.time.delayedCall(5600, () => {
        if (hint && hint.scene) scene.tweens.add({ targets: hint, alpha: 0, duration: 800 });
      });
    }

    /* ── 바깥에서 쓸 수 있는 것들 ──────────────── */
    view.layer = layer;
    view.text = text;
    view.zone = zone;
    view.hint = hint;
    view.isDone = function () { return done; };
    view.revealAll = revealAll;
    view.scrollToTop = function () {
      scene.tweens.killTweensOf(text);
      scene.tweens.add({ targets: text, y: top, duration: 700, ease: 'Sine.easeInOut' });
      holdUntil = Date.now() + 4000;
    };
    /* 사라질 때는 안내와 함께 조용히 */
    view.fade = function (ms, cb) {
      const targets = [layer];
      if (hint && hint.scene) targets.push(hint);
      scene.tweens.add({
        targets: targets, alpha: 0, duration: ms || 900,
        onComplete: function () { view.destroy(); if (cb) cb(); }
      });
    };
    view.destroy = function () {
      if (timer) { timer.remove(); timer = null; }
      if (zone && zone.scene) zone.destroy();
      if (hint && hint.scene) hint.destroy();
      if (layer && layer.scene) layer.destroy();
      if (mask) mask.destroy();
    };

    scene.events.once('shutdown', view.destroy);

    if (startDelay > 0) timer = scene.time.delayedCall(startDelay, step);
    else step();

    return view;
  }

  return { open: open };
})();
