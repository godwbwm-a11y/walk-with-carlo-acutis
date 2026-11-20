/* 부드러운 스크롤 — 손가락을 따라오고, 놓으면 미끄러지다 멈추고, 끝에서는 살짝 늘어났다 돌아옵니다.

   왜 따로 만들었나:
   예전에는 화면마다 “손가락이 움직인 만큼만 옮기기”를 따로 짜 두었습니다.
   손을 떼는 순간 뚝 멈추고, 영역 밖으로 손가락이 나가면 그 자리에서 끊기고,
   PC 의 휠로는 움직이지 않았으며, 닫힌 목록의 이벤트가 남아 쌓이기도 했습니다.
   이제 모든 목록이 이 하나를 씁니다.

   쓰는 법:
     const sc = Scroller.create(scene, {
       target: list,                 // .y 를 움직일 컨테이너(또는 글자)
       top: 180, height: 520,        // 끌기를 시작할 수 있는 화면 영역(세로)
       min: -max, max: 0,            // target.y 가 머물 범위 (숫자 또는 함수)
     });
     sc.setRange(min, max); sc.scrollTo(y, ms); sc.toMin(ms); sc.destroy();

   target 이 사라지거나 장면이 끝나면 저절로 정리됩니다. */

window.Scroller = (function () {

  const SLOP = 5;             // 이만큼 움직여야 ‘끌기’로 봅니다(그 전에는 누르기)
  const FRICTION = 325;       // 미끄러짐이 줄어드는 시간(ms) — 클수록 멀리 갑니다
  const SPRING = 110;         // 끝에서 되돌아오는 시간(ms)
  const RUBBER = 0.42;        // 끝을 넘어 끌 때 따라오는 비율
  const MAX_V = 4.2;          // 가장 빠른 미끄러짐(px/ms)

  const api = {
    /* 미끄러지는 목록을 손가락으로 붙잡은 그 터치는 단추를 누른 것으로 치지 않습니다 */
    caught: false
  };

  function val(v) { return typeof v === 'function' ? v() : v; }
  /* 손가락의 빠르기는 실제 시간으로 잽니다 — 게임 시계는 프레임마다만 흘러 같은 값이 나옵니다 */
  function clock() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

  api.create = function (scene, opt) {
    const W = GAME.WIDTH;
    const target = opt.target;
    const area = { x: opt.x || 0, w: opt.width || W, top: opt.top, h: opt.height };
    let rmin = opt.min === undefined ? 0 : opt.min;
    let rmax = opt.max === undefined ? 0 : opt.max;
    const lo = function () { return Math.min(val(rmin), val(rmax)); };
    const hi = function () { return val(rmax); };

    let y = target.y;
    let v = 0;                     // px/ms
    let tracking = false, dragging = false, tapOk = true;
    let lastY = 0, moved = 0;
    let samples = [];
    let glide = null;              // 휠·scrollTo 의 목표
    let glideMs = 90;
    let idleAt = 0;
    let alive = true;

    const inside = function (p) {
      return p.x >= area.x && p.x <= area.x + area.w && p.y >= area.top && p.y <= area.top + area.h;
    };
    /* 끌기는 화면 어디서 시작해도 됩니다 — 목록 밖(제목, 아래쪽 여백)을 밀어도 목록이 움직입니다.
       글상자처럼 그 칸 안에서만 밀어야 하는 곳은 strict 로 둡니다. */
    const canStart = function (p) {
      if (opt.strict) return inside(p);
      return p.x >= 0 && p.x <= GAME.WIDTH && p.y >= 0 && p.y <= GAME.HEIGHT;
    };
    const blocked = function (over) {
      if (opt.enabled && !opt.enabled()) return true;
      /* 목록이나 그 목록을 담은 판이 숨겨져 있으면 움직이지 않습니다 */
      for (let o = target; o; o = o.parentContainer) { if (!o.visible || o.alpha === 0) return true; }
      for (let i = 0; i < (over || []).length; i++) {
        if (over[i] && over[i].__blocksScroll && over[i] !== opt.owner) return true;
      }
      return false;
    };
    const set = function (ny) {
      y = ny;
      /* 반 화소 단위로 — 글자가 번지지 않습니다 (화면은 2 배로 그립니다) */
      target.y = Math.round(y * 2) / 2;
      if (opt.cull) cull();
      if (opt.onMove) opt.onMove(target.y);
      showBar();
    };

    /* 화면 밖의 줄은 그리지 않습니다 — 긴 목록(미니게임 44개, 말씀 63장)도 가볍게 넘어가도록 */
    function cull() {
      if (!target.list) return;
      const lo2 = area.top - 220, hi2 = area.top + area.h + 220;
      for (let i = 0; i < target.list.length; i++) {
        const o = target.list[i];
        const sy = target.y + o.y;
        o.setVisible(sy > lo2 && sy < hi2);
      }
    }
    if (opt.cull) target.scene.time.delayedCall(0, cull);

    /* ── 스크롤 막대 — 움직일 때만 살짝 보입니다 ── */
    let bar = null;
    if (opt.indicator !== false) {
      bar = scene.add.graphics().setScrollFactor(0).setAlpha(0);
      if (opt.parent) opt.parent.add(bar);
      else if (target.parentContainer) target.parentContainer.add(bar);
      else bar.setDepth((opt.depth !== undefined ? opt.depth : (target.depth || 0)) + 1);
    }
    function drawBar() {
      if (!bar || !bar.scene) return;
      const range = hi() - lo();
      bar.clear();
      if (range <= 1) return;
      const trackTop = area.top + 6, trackH = area.h - 12;
      const thumb = Math.max(28, trackH * area.h / (area.h + range));
      const t = Phaser.Math.Clamp((hi() - y) / range, 0, 1);
      const x = area.x + area.w - 7;
      bar.fillStyle(0xffffff, 0.16); bar.fillRoundedRect(x - 1, trackTop, 4, trackH, 2);
      bar.fillStyle(0xd9a25a, 0.85); bar.fillRoundedRect(x - 1, trackTop + (trackH - thumb) * t, 4, thumb, 2);
    }
    function showBar() {
      if (!bar || !bar.scene) return;
      drawBar();
      idleAt = scene.time.now;
      if (bar.alpha < 1 || bar.__fading) { scene.tweens.killTweensOf(bar); bar.__fading = false; bar.setAlpha(1); }
    }

    /* ── 손가락 ─────────────────────────────── */
    function onDown(p, over) {
      /* 한 번의 누름마다 처음 듣는 목록이 ‘붙잡음’ 표시를 지웁니다 */
      if (api._downId !== p.downTime) { api._downId = p.downTime; api.caught = false; }
      if (!alive || !canStart(p) || blocked(over)) return;
      const catching = Math.abs(v) > 0.25 || glide !== null;
      if (catching) api.caught = true;
      else y = target.y;                       // 다른 곳(트윈 등)에서 옮겼을 수 있습니다
      tracking = true; dragging = false;
      tapOk = !opt.tapZone || (over && over[0] === opt.tapZone);
      v = 0; glide = null;
      lastY = p.y; moved = 0;
      samples = [{ t: clock(), y: y }];
    }
    function onMove(p) {
      if (!alive || !tracking) return;
      if (!p.isDown) { onUp(); return; }
      const dy = p.y - lastY; lastY = p.y;
      moved += Math.abs(dy);
      if (!dragging && moved < SLOP) return;
      if (!dragging && opt.onDragStart) opt.onDragStart();
      dragging = true;
      if (hi() - lo() < 1) return;            // 넘칠 것이 없으면 움직이지 않습니다
      const out = y > hi() || y < lo();
      set(y + dy * (out ? RUBBER : 1));
      const now = clock();
      samples.push({ t: now, y: y });
      while (samples.length > 2 && now - samples[0].t > 100) samples.shift();
    }
    function onUp() {
      if (!tracking) return;
      tracking = false;
      if (!dragging) { if (opt.onTap && !api.caught && tapOk) opt.onTap(); return; }
      dragging = false;
      const now = clock();
      const a = samples[0], b = samples[samples.length - 1];
      if (b && a && b.t > a.t && now - b.t < 140) v = Phaser.Math.Clamp((b.y - a.y) / (b.t - a.t), -MAX_V, MAX_V);
      else v = 0;
    }
    function onWheel(p, over, dx, dy) {
      if (!alive || !canStart(p) || blocked(over)) return;
      v = 0;
      const base = glide === null ? y : glide;
      glide = Phaser.Math.Clamp(base - dy * 0.7, lo(), hi());
      glideMs = 90;
    }

    /* ── 매 프레임 — 미끄러짐과 되돌아옴 ─────── */
    function tick(time, delta) {
      if (!alive) return;
      if (!target.scene) { destroy(); return; }
      const dt = Math.min(delta, 50);
      if (!tracking) {
        if (glide !== null) {
          const k = 1 - Math.exp(-dt / glideMs);
          set(y + (glide - y) * k);
          if (Math.abs(glide - y) < 0.3) { set(glide); glide = null; }
        } else if (v !== 0) {
          let ny = y + v * dt;
          const out = ny > hi() || ny < lo();
          v *= Math.exp(-dt / (out ? 55 : FRICTION));
          set(ny);
          if (Math.abs(v) < 0.015) v = 0;
        } else if ((y = target.y, y > hi() + 0.25 || y < lo() - 0.25)) {
          const b = y > hi() ? hi() : lo();
          set(y + (b - y) * (1 - Math.exp(-dt / SPRING)));
          if (Math.abs(b - y) < 0.3) set(b);
        }
      }
      if (bar && bar.scene && bar.alpha > 0 && !tracking && v === 0 && glide === null
        && time - idleAt > 650 && !bar.__fading) {
        bar.__fading = true;
        scene.tweens.add({ targets: bar, alpha: 0, duration: 400, onComplete: () => { bar.__fading = false; } });
      }
    }

    scene.input.on('pointerdown', onDown);
    scene.input.on('pointermove', onMove);
    scene.input.on('pointerup', onUp);
    scene.input.on('gameout', onUp);
    scene.input.on('wheel', onWheel);
    scene.events.on('update', tick);
    scene.events.once('shutdown', destroy);
    if (target.once) target.once('destroy', destroy);

    function destroy() {
      if (!alive) return;
      alive = false;
      scene.input.off('pointerdown', onDown);
      scene.input.off('pointermove', onMove);
      scene.input.off('pointerup', onUp);
      scene.input.off('gameout', onUp);
      scene.input.off('wheel', onWheel);
      scene.events.off('update', tick);
      if (bar && bar.scene) bar.destroy();
    }

    const sc = {
      get y() { return y; },
      isDragging: function () { return dragging; },
      setRange: function (a, b) {
        rmin = a; rmax = b;
        if (!tracking && glide === null && v === 0) set(Phaser.Math.Clamp(y, lo(), hi()));
        return sc;
      },
      /* ms 를 주면 부드럽게, 0 이면 바로 */
      scrollTo: function (ny, ms) {
        ny = Phaser.Math.Clamp(ny, lo(), hi());
        v = 0;
        if (!ms) { glide = null; set(ny); }
        else { glide = ny; glideMs = ms / 4; }
        return sc;
      },
      toMin: function (ms) { return sc.scrollTo(lo(), ms); },
      toMax: function (ms) { return sc.scrollTo(hi(), ms); },
      sync: function () { y = target.y; return sc; },
      cull: function () { if (opt.cull) cull(); return sc; },
      destroy: destroy
    };
    return sc;
  };

  /* 목록 하나를 화면에 붙이는 지름길 — 가장 흔한 꼴입니다.
     list(컨테이너)의 내용이 화면 좌표 contentTop ~ contentBottom 에 그려져 있을 때,
     top ~ top+height 영역에서 위아래로 넘겨 봅니다. */
  api.list = function (scene, list, top, height, contentBottom, opt) {
    const max = Math.max(0, contentBottom - (top + height));
    return api.create(scene, Object.assign({ target: list, top: top, height: height, min: -max, max: 0 }, opt || {}));
  };

  return api;
})();
