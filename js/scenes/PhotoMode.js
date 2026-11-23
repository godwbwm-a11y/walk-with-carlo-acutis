/* 사진 찍기 — 프레임의 모양·자리·크기를 고르고, 망원으로 당겨서 찍습니다.
   사진에는 글자가 담기지 않도록 뒤 장면의 글자와 조작 화면을 잠시 감춥니다. */

window.PhotoMode = class PhotoMode extends Phaser.Scene {
  constructor() { super('PhotoMode'); }

  create(data) {
    /* 이 화면은 다른 화면 위에 올라옵니다 — 뒤에 가려지지 않게 맨 앞으로 */
    this.scene.bringToTop();
    data = data || {};
    this.from = data.from;
    this.place = data.place || '';
    this.shot = null;
    /* 이 장면은 다시 열릴 때 같은 객체를 재사용하므로 지난 흔적을 지웁니다 */
    this.moveZone = null; this.handle = null; this.handleIcon = null; this.panZone = null;
    this.preview = null; this.previewKey = null; this.busy = false;
    this.pinch = null; this.restored = false;

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.minW = 120; this.minH = 110;
    this.topLimit = 120; this.bottomLimit = H - 238;
    this.maxW = W - 24; this.maxH = this.bottomLimit - this.topLimit;

    /* 뒤 장면 — 글자를 감추고 카메라를 망원으로 쓸 준비 */
    this.src = this.from ? this.scene.get(this.from) : null;
    this.hideSourceText();
    this.prepareCamera();

    this.full = !!data.full;
    this.ratio = 0;                         // 0 = 자유
    this.frame = new Phaser.Geom.Rectangle(W / 2 - 150, 220, 300, 230);

    /* 프레임 바깥을 끌면 장면을 둘러봅니다 */
    this.panZone = this.add.zone(0, 0, W, H).setOrigin(0).setInteractive({ draggable: true }).setDepth(5);
    this.panZone.on('dragstart', (p) => this.panStart(p));
    this.panZone.on('drag', (p) => this.panMove(p));

    this.mask = this.add.graphics().setDepth(10);
    this.border = this.add.graphics().setDepth(11);

    /* 프레임 안쪽을 끌어 위치 이동 */
    this.moveZone = this.add.zone(0, 0, 10, 10).setOrigin(0).setInteractive({ draggable: true }).setDepth(12);
    this.moveZone.on('drag', (p, dx, dy) => {
      if (this.pinch) return;
      this.frame.x = Phaser.Math.Clamp(dx, 12, W - this.frame.width - 12);
      this.frame.y = Phaser.Math.Clamp(dy, this.topLimit, this.bottomLimit - this.frame.height);
      this.redraw();
    });

    /* 오른쪽 아래 손잡이로 크기 조절 */
    this.handle = this.add.circle(0, 0, 26, HEX(PAL.cream), 0.96).setDepth(13)
      .setStrokeStyle(3, HEX(PAL.sunDeep), 0.9).setInteractive({ draggable: true });
    this.handleIcon = this.add.text(0, 0, '⤡', UI.style(20, PAL.sunDeep)).setOrigin(0.5).setDepth(14);
    this.handle.on('drag', (p, dx, dy) => {
      if (this.pinch) return;
      this.resizeTo(dx - this.frame.x, dy - this.frame.y);
    });

    this.title = this.add.text(W / 2, 34, '사진 찍기', UI.style(FONT.body, PAL.cream)).setOrigin(0.5).setDepth(15);

    /* 프레임 모양 */
    this.buildRatioChips(78);

    /* 망원 */
    this.buildZoomBar(H - 208);

    this.hint = this.add.text(W / 2, H - 148, '', UI.style(13, PAL.dimWarm, { align: 'center', wordWrap: { width: W - 40 } }))
      .setOrigin(0.5).setDepth(15).setAlpha(0.95);

    this.shootBtn = UI.circleButton(this, W / 2, H - 76, 38, '●', () => this.take(), { size: 26, color: PAL.clay });
    this.shootBtn.setDepth(15);
    this.closeBtn = UI.button(this, W / 2 - 126, H - 76, 96, 54, '닫기', () => this.close(), { size: FONT.small });
    this.closeBtn.setDepth(15);
    this.albumBtn = UI.button(this, W / 2 + 126, H - 76, 96, 54, '사진첩', () => this.openGallery(), { size: FONT.small });
    this.albumBtn.setDepth(15);

    this.countText = this.add.text(W / 2, H - 16, '', UI.style(13, '#cbbfae')).setOrigin(0.5).setDepth(15);
    this.updateCount();

    /* 두 손가락으로 벌리고 오므리기, 마우스 휠 */
    this.input.on('pointermove', () => this.updatePinch());
    this.input.on('pointerup', () => this.updatePinch());
    this.input.on('wheel', (p, objs, dx, dy) => this.setZoom(this.zoom * (dy > 0 ? 1 / 1.1 : 1.1)));

    this.setRatio(this.full ? 'full' : 'free');
    this.events.once('shutdown', () => this.restoreSource());
  }

  /* ── 뒤 장면의 글자 감추기 ─────────────────────── */

  hideSourceText() {
    this.hidden = [];
    const s = this.src;
    if (!s || !s.children) return;
    const hide = (o) => { if (o.visible) { this.hidden.push(o); o.setVisible(false); } };
    const isText = (o) => o.type === 'Text' || o.type === 'BitmapText' || o.type === 'DOMElement';
    const hasText = (c) => c.list && c.list.some(o => isText(o) || (o.list && hasText(o)));
    /* 컨테이너 안의 글자만 골라 감춥니다 (건물 간판처럼 그림의 일부인 경우) */
    const hideTextIn = (c) => c.list.forEach(o => { if (isText(o)) hide(o); else if (o.list) hideTextIn(o); });

    s.children.list.forEach(o => {
      if (!o.visible) return;
      if (isText(o)) { hide(o); return; }
      /* 장면이 ‘사진에는 빼 주세요’ 하고 표시해 둔 것 */
      if (o.photoUi) { hide(o); return; }
      const fixed = o.scrollFactorX === 0 && o.scrollFactorY === 0;
      const pressable = o.input && o.input.enabled;
      if (o.list) {
        /* 화면에 붙은 글자 상자(대화창·안내판)와 단추는 통째로 */
        if ((fixed && hasText(o)) || (pressable && hasText(o))) hide(o); else hideTextIn(o);
        return;
      }
      /* 화면에 붙은 누를 수 있는 것(단추·조이스틱)도 사진에는 필요 없습니다 */
      if (fixed && pressable) hide(o);
    });
    /* 조이스틱 안내 글자의 받침판 */
    if (s.stick && s.stick.hintPlate) hide(s.stick.hintPlate);
    if (s.stick && s.stick.gfx) hide(s.stick.gfx);
  }

  /* ── 카메라 (망원) ─────────────────────────────── */

  prepareCamera() {
    this.zoom = 1;
    const s = this.src;
    const cam = s && s.cameras ? s.cameras.main : null;
    this.cam = cam;
    if (!cam) return;
    const RES = Render.RES;
    this.saved = {
      zoom: cam.zoom, sx: cam.scrollX, sy: cam.scrollY,
      useBounds: cam.useBounds, follow: cam._follow
    };
    /* 지금 보이는 세상의 범위 (390×844 화면 기준) */
    const v = this.viewAt(cam.zoom, cam.scrollX, cam.scrollY);
    this.view0 = v;
    /* 둘러볼 수 있는 범위 — 장면 경계가 있으면 경계, 없으면 지금 보이는 곳 */
    if (cam.useBounds && cam._bounds && cam._bounds.width > 0) {
      const b = cam._bounds;
      this.limit = { x: b.x - Render.OX, y: b.y - Render.OY, w: b.width, h: b.height };
    } else {
      this.limit = { x: v.x, y: v.y, w: v.w, h: v.h };
    }
    /* 찍는 동안에는 카메라가 주인공을 따라가지 않고, 경계 계산도 직접 합니다 */
    cam._follow = null;
    cam.useBounds = false;
    this.unit = RES / cam.zoom;              // 화면 1칸이 세상에서 몇 칸인지 (망원 1배일 때)
  }

  /* 카메라 값으로 보이는 세상의 사각형을 계산합니다 (Phaser 카메라 행렬과 같은 식) */
  viewAt(zoom, sx, sy) {
    const cam = this.cam;
    const ox = cam.width * cam.originX, oy = cam.height * cam.originY;
    const x = (0 - cam.x - ox) / zoom + ox + sx;
    const y = (0 - cam.y - oy) / zoom + oy + sy;
    return { x: x, y: y, w: cam.width / zoom, h: cam.height / zoom };
  }

  /* 화면 위 한 점(390×844 좌표)이 세상의 어디인지 */
  worldAt(px, py) {
    const cam = this.cam, RES = Render.RES;
    const ox = cam.width * cam.originX, oy = cam.height * cam.originY;
    return {
      x: (px * RES - cam.x - ox) / cam.zoom + ox + cam.scrollX,
      y: (py * RES - cam.y - oy) / cam.zoom + oy + cam.scrollY
    };
  }

  /* 화면 위 한 점이 세상의 P 를 가리키도록 스크롤을 맞추고, 범위 밖으로 나가지 않게 합니다 */
  aim(px, py, P) {
    const cam = this.cam, RES = Render.RES;
    const ox = cam.width * cam.originX, oy = cam.height * cam.originY;
    let sx = P.x - ox - (px * RES - cam.x - ox) / cam.zoom;
    let sy = P.y - oy - (py * RES - cam.y - oy) / cam.zoom;
    const v = this.viewAt(cam.zoom, sx, sy), L = this.limit;
    if (v.w >= L.w) sx += (L.x + (L.w - v.w) / 2) - v.x;
    else sx += Phaser.Math.Clamp(v.x, L.x, L.x + L.w - v.w) - v.x;
    if (v.h >= L.h) sy += (L.y + (L.h - v.h) / 2) - v.y;
    else sy += Phaser.Math.Clamp(v.y, L.y, L.y + L.h - v.h) - v.y;
    cam.setScroll(sx, sy);
  }

  setZoom(z, ax, ay) {
    if (!this.cam) return;
    z = Phaser.Math.Clamp(z, 1, 3);
    const f = this.frame;
    if (ax === undefined) { ax = f.x + f.width / 2; ay = f.y + f.height / 2; }
    const P = this.worldAt(ax, ay);
    this.zoom = z;
    this.cam.setZoom(this.saved.zoom * z);
    this.aim(ax, ay, P);
    this.updateZoomBar();
  }

  panStart(p) {
    if (!this.cam) return;
    this.panFrom = { x: p.x, y: p.y, sx: this.cam.scrollX, sy: this.cam.scrollY };
  }

  panMove(p) {
    if (!this.cam || this.pinch) return;
    if (!this.panFrom) { this.panStart(p); return; }   // 두 손가락을 뗀 뒤 남은 손가락에서 다시 시작
    const k = this.unit / this.zoom, a = this.panFrom, cam = this.cam;
    cam.setScroll(a.sx - (p.x - a.x) * k, a.sy - (p.y - a.y) * k);
    /* 범위 안으로 되돌리기 — 화면 가운데를 기준으로 다시 맞춥니다 */
    this.aim(GAME.WIDTH / 2, GAME.HEIGHT / 2, this.worldAt(GAME.WIDTH / 2, GAME.HEIGHT / 2));
  }

  updatePinch() {
    const ps = [this.input.pointer1, this.input.pointer2].filter(q => q && q.isDown);
    if (ps.length < 2) { this.pinch = null; return; }
    const d = Phaser.Math.Distance.Between(ps[0].x, ps[0].y, ps[1].x, ps[1].y);
    const cx = (ps[0].x + ps[1].x) / 2, cy = (ps[0].y + ps[1].y) / 2;
    if (!this.pinch) { this.pinch = { d: Math.max(d, 1), z: this.zoom }; this.panFrom = null; return; }
    this.setZoom(this.pinch.z * d / this.pinch.d, cx, cy);
  }

  buildZoomBar(y) {
    const W = GAME.WIDTH;
    this.zoomY = y;
    this.trackX0 = 82; this.trackX1 = W - 166;
    const g = this.add.graphics().setDepth(15);
    g.fillStyle(0x0d1524, 0.55); g.fillRoundedRect(14, y - 25, W - 28, 50, 25);
    this.zoomTrack = g;
    this.zoomFill = this.add.graphics().setDepth(16);
    this.zoomKnob = this.add.circle(this.trackX0, y, 13, HEX(PAL.sun), 1).setDepth(17)
      .setStrokeStyle(3, 0xfff8ec, 0.95);
    /* 손가락이 닿기 쉽게 막대 전체를 누를 수 있게 합니다 */
    this.zoomZone = this.add.zone((this.trackX0 + this.trackX1) / 2, y, this.trackX1 - this.trackX0 + 36, 48)
      .setInteractive({ draggable: true }).setDepth(18);
    const fromX = (p) => this.setZoom(1 + 2 * Phaser.Math.Clamp((p.x - this.trackX0) / (this.trackX1 - this.trackX0), 0, 1));
    this.zoomZone.on('pointerdown', fromX);
    this.zoomZone.on('drag', fromX);

    this.zoomOut = UI.circleButton(this, 44, y, 20, '−', () => this.setZoom(this.zoom - 0.25), { size: 22 });
    this.zoomIn = UI.circleButton(this, W - 44, y, 20, '+', () => this.setZoom(this.zoom + 0.25), { size: 22 });
    this.zoomOut.setDepth(17); this.zoomIn.setDepth(17);
    this.zoomText = this.add.text(W - 116, y, '', UI.style(14, PAL.cream)).setOrigin(0.5).setDepth(17);
    if (!this.cam) [g, this.zoomFill, this.zoomKnob, this.zoomZone, this.zoomOut, this.zoomIn, this.zoomText].forEach(o => o.setVisible(false));
    this.updateZoomBar();
  }

  updateZoomBar() {
    if (!this.zoomKnob) return;
    const t = (this.zoom - 1) / 2;
    const x = this.trackX0 + (this.trackX1 - this.trackX0) * t, y = this.zoomY;
    const g = this.zoomFill;
    g.clear();
    g.fillStyle(0xfff8ec, 0.28); g.fillRoundedRect(this.trackX0, y - 3, this.trackX1 - this.trackX0, 6, 3);
    g.fillStyle(HEX(PAL.sun), 0.95); g.fillRoundedRect(this.trackX0, y - 3, Math.max(6, x - this.trackX0), 6, 3);
    this.zoomKnob.setPosition(x, y);
    this.zoomText.setText((I18N.is('en') ? 'Zoom ' : '망원 ') + this.zoom.toFixed(1) + '×');
  }

  /* ── 프레임 모양 ──────────────────────────────── */

  buildRatioChips(y) {
    const W = GAME.WIDTH;
    const items = [['free', '자유'], ['1:1', '1:1'], ['4:5', '4:5'], ['16:9', '16:9'], ['full', '전체']];
    const gap = 6, cw = Math.floor((W - 24 - gap * (items.length - 1)) / items.length), ch = 44;
    this.chips = items.map((it, i) => {
      const x = 12 + cw / 2 + i * (cw + gap);
      const c = this.add.container(x, y).setDepth(15);
      const bg = this.add.graphics();
      const t = this.add.text(0, 0, it[1], UI.style(15, PAL.cream, { align: 'center', wordWrap: { width: cw - 8 } })).setOrigin(0.5);
      c.add([bg, t]);
      c.setSize(cw, ch).setInteractive({ useHandCursor: true });
      c.on('pointerup', () => { AudioSystem.tap(); this.setRatio(it[0]); });
      c.key = it[0]; c.bg = bg; c.label = t; c.cw = cw; c.ch = ch;
      return c;
    });
  }

  drawChips() {
    (this.chips || []).forEach(c => {
      const on = c.key === this.ratioKey;
      c.bg.clear();
      c.bg.fillStyle(on ? HEX(PAL.sun) : 0x0d1524, on ? 1 : 0.6);
      c.bg.fillRoundedRect(-c.cw / 2, -c.ch / 2, c.cw, c.ch, c.ch / 2);
      if (!on) { c.bg.lineStyle(1.5, 0xfff8ec, 0.4); c.bg.strokeRoundedRect(-c.cw / 2, -c.ch / 2, c.cw, c.ch, c.ch / 2); }
      c.label.setColor(on ? PAL.ink : PAL.cream);
    });
  }

  setRatio(key) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.ratioKey = key;
    const R = { free: 0, '1:1': 1, '4:5': 4 / 5, '16:9': 16 / 9 };
    const wasFull = this.full;
    this.full = key === 'full';
    if (this.full) {
      this.frame.setTo(0, 0, W, H);
    } else {
      this.ratio = R[key] || 0;
      if (wasFull) this.frame.setTo(W / 2 - 150, 220, 300, 230);
      const cx = this.frame.centerX, cy = this.frame.centerY;
      if (this.ratio) {
        /* 지금 넓이를 살리되 들어갈 수 있는 크기로 */
        let w = Math.max(this.frame.width, 260), h = w / this.ratio;
        if (h > this.maxH) { h = this.maxH; w = h * this.ratio; }
        if (w > this.maxW) { w = this.maxW; h = w / this.ratio; }
        this.frame.width = w; this.frame.height = h;
      }
      this.frame.x = Phaser.Math.Clamp(cx - this.frame.width / 2, 12, W - 12 - this.frame.width);
      this.frame.y = Phaser.Math.Clamp(cy - this.frame.height / 2, this.topLimit, this.bottomLimit - this.frame.height);
    }
    const handles = !this.full;
    [this.moveZone, this.handle, this.handleIcon].forEach(o => o.setVisible(handles));
    if (handles) { this.moveZone.setInteractive(); this.handle.setInteractive(); }
    else { this.moveZone.disableInteractive(); this.handle.disableInteractive(); }
    this.hint.setText(this.full
      ? '지금 보이는 화면 그대로 한 장이 됩니다.\n화면을 끌면 둘러볼 수 있어요.'
      : '프레임 안을 끌어 옮기고 ⤡ 로 크기를 바꿔요.\n프레임 바깥을 끌면 장면을 둘러봐요.');
    this.drawChips();
    this.redraw();
  }

  resizeTo(w, h) {
    const W = GAME.WIDTH, f = this.frame;
    const mw = Math.min(this.maxW, W - 12 - f.x), mh = Math.min(this.maxH, this.bottomLimit - f.y);
    if (this.ratio) {
      /* 손가락이 더 멀리 간 쪽을 따라 비율을 지킵니다 */
      w = Math.max(w, h * this.ratio);
      w = Phaser.Math.Clamp(w, Math.max(this.minW, this.minH * this.ratio), Math.min(mw, mh * this.ratio));
      h = w / this.ratio;
    } else {
      w = Phaser.Math.Clamp(w, this.minW, mw);
      h = Phaser.Math.Clamp(h, this.minH, mh);
    }
    f.width = w; f.height = h;
    this.redraw();
  }

  updateCount() {
    this.countText.setText('사진첩 ' + PhotoSystem.count() + ' / ' + PhotoSystem.MAX +
      (PhotoSystem.isFull() ? '  (가득 차면 오래된 사진부터 비워집니다)' : ''));
  }

  redraw() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, f = this.frame;
    this.mask.clear();
    const b = this.border;
    b.clear();
    if (this.full) {
      /* 전체 화면일 때는 위아래 조작 줄만 살짝 어둡게 */
      this.mask.fillStyle(0x0d1524, 0.62);
      this.mask.fillRect(0, 0, W, 104);
      this.mask.fillRect(0, H - 238, W, 238);
      this.placeHandles();
      return;
    }
    this.mask.fillStyle(0x0d1524, 0.72);
    this.mask.fillRect(0, 0, W, f.y);
    this.mask.fillRect(0, f.y + f.height, W, H - f.y - f.height);
    this.mask.fillRect(0, f.y, f.x, f.height);
    this.mask.fillRect(f.x + f.width, f.y, W - f.x - f.width, f.height);

    b.lineStyle(2, 0xfff8ec, 0.85);
    b.strokeRect(f.x, f.y, f.width, f.height);
    b.lineStyle(4, HEX(PAL.sun), 0.95);
    const c = 22;
    b.lineBetween(f.x, f.y, f.x + c, f.y); b.lineBetween(f.x, f.y, f.x, f.y + c);
    b.lineBetween(f.x + f.width, f.y, f.x + f.width - c, f.y); b.lineBetween(f.x + f.width, f.y, f.x + f.width, f.y + c);
    b.lineBetween(f.x, f.y + f.height, f.x + c, f.y + f.height); b.lineBetween(f.x, f.y + f.height, f.x, f.y + f.height - c);
    b.lineStyle(1, 0xfff8ec, 0.25);
    b.lineBetween(f.x + f.width / 3, f.y, f.x + f.width / 3, f.y + f.height);
    b.lineBetween(f.x + f.width * 2 / 3, f.y, f.x + f.width * 2 / 3, f.y + f.height);
    b.lineBetween(f.x, f.y + f.height / 3, f.x + f.width, f.y + f.height / 3);
    b.lineBetween(f.x, f.y + f.height * 2 / 3, f.x + f.width, f.y + f.height * 2 / 3);

    this.placeHandles();
  }

  placeHandles() {
    const f = this.frame;
    if (this.moveZone && this.moveZone.input) {
      this.moveZone.setPosition(f.x, f.y).setSize(f.width, f.height);
      this.moveZone.input.hitArea.setSize(f.width, f.height);
    }
    if (this.handle && this.handleIcon) {
      this.handle.setPosition(f.x + f.width, f.y + f.height);
      this.handleIcon.setPosition(f.x + f.width, f.y + f.height);
    }
  }

  uiList() {
    return [this.mask, this.border, this.title, this.hint, this.shootBtn, this.closeBtn, this.albumBtn,
      this.countText, this.zoomTrack, this.zoomFill, this.zoomKnob, this.zoomOut, this.zoomIn, this.zoomText]
      .concat(this.chips || []);
  }

  setUI(on) {
    const zoomOk = !!this.cam;
    this.uiList().forEach(o => {
      if (!o) return;
      if (!zoomOk && [this.zoomTrack, this.zoomFill, this.zoomKnob, this.zoomOut, this.zoomIn, this.zoomText].includes(o)) return;
      o.setVisible(on);
    });
    if (this.handle) this.handle.setVisible(on && !this.full);
    if (this.handleIcon) this.handleIcon.setVisible(on && !this.full);
    if (this.moveZone) this.moveZone.setVisible(on && !this.full);
  }

  take() {
    if (this.busy) return;
    this.busy = true;
    AudioSystem.select();
    this.setUI(false);

    /* 한 프레임 뒤에 찍어야 UI가 지워진 화면이 담깁니다 */
    this.time.delayedCall(80, () => {
      PhotoSystem.capture(this, this.frame, this.place, (photo) => {
        this.busy = false;
        if (!photo) { this.setUI(true); this.fail('사진을 만들지 못했어요.'); return; }
        const res = PhotoSystem.add(photo);
        this.lastPhoto = photo;
        this.showPreview(photo, res);
      });
    });
  }

  fail(msg) {
    const t = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT * 0.5, msg,
      UI.style(FONT.body, PAL.cream)).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: t, alpha: 0, duration: 2200, onComplete: () => t.destroy() });
  }

  showPreview(photo, res) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const key = 'photo_preview_' + Date.now();
    this.previewKey = key;

    const build = () => {
      const layer = this.add.container(0, 0).setDepth(40);
      this.preview = layer;
      const scrim = this.add.graphics();
      scrim.fillStyle(0x0d1524, 0.9); scrim.fillRect(0, 0, W, H);
      layer.add(scrim);
      /* 뒤의 조작 단추가 눌리지 않도록 막아 둡니다 */
      const block = this.add.zone(0, 0, W, H).setOrigin(0).setInteractive();
      layer.add(block);

      layer.add(this.add.text(W / 2, 74, '사진이 사진첩에 담겼어요',
        UI.style(21, PAL.cream)).setOrigin(0.5));

      const img = this.add.image(W / 2, H * 0.40, key);
      const fit = Math.min((W - 60) / img.width, (H * 0.44) / img.height);
      img.setScale(fit);
      layer.add(img);

      const g = this.add.graphics();
      g.lineStyle(3, HEX(PAL.paper), 0.9);
      g.strokeRoundedRect(W / 2 - img.displayWidth / 2 - 7, H * 0.40 - img.displayHeight / 2 - 7,
        img.displayWidth + 14, img.displayHeight + 14, 10);
      layer.add(g);

      if (res && !res.ok) {
        layer.add(this.add.text(W / 2, H * 0.65, '저장 공간이 부족해 사진첩에는 담지 못했어요.\n휴대폰에 저장해 주세요.',
          UI.style(FONT.small, PAL.clay, { align: 'center' })).setOrigin(0.5));
      } else if (res && res.removed > 0) {
        layer.add(this.add.text(W / 2, H * 0.65, '사진첩이 가득 차서 가장 오래된 사진 ' + res.removed + '장을 비웠어요.',
          UI.style(14, '#cbbfae', { align: 'center', wordWrap: { width: W - 70 } })).setOrigin(0.5));
      }

      const save = UI.button(this, W / 2, H * 0.71, 260, 60, '휴대폰에 저장', () => {
        PhotoSystem.download(photo);
        save.setLabel('저장했어요');
        note.setAlpha(1);
      }, { size: 19, fill: PAL.sun });
      layer.add(save);

      const note = this.add.text(W / 2, H * 0.765, '저장이 안 되면 사진을 길게 눌러 저장하세요.',
        UI.style(14, '#cbbfae', { align: 'center' })).setOrigin(0.5).setAlpha(0.55);
      layer.add(note);

      const again = UI.button(this, W / 2 - 84, H * 0.84, 150, 56, '다시 찍기', () => this.closePreview(), { size: FONT.small });
      const done = UI.button(this, W / 2 + 84, H * 0.84, 150, 56, '돌아가기', () => { this.closePreview(); this.close(); }, { size: FONT.small });
      layer.add([again, done]);

      layer.setAlpha(0);
      this.tweens.add({ targets: layer, alpha: 1, duration: 260 });
      AudioSystem.chime();
    };

    this.textures.once('addtexture-' + key, build);
    this.textures.addBase64(key, photo.data);
  }

  closePreview() {
    if (this.preview) { this.preview.destroy(); this.preview = null; }
    if (this.previewKey && this.textures.exists(this.previewKey)) this.textures.remove(this.previewKey);
    this.previewKey = null;
    this.setUI(true);
    this.updateCount();
  }

  openGallery() {
    this.scene.launch('GalleryScene', { from: 'PhotoMode', tab: 'photo' });
    this.scene.pause();
  }

  /* 뒤 장면을 처음 모습 그대로 돌려놓습니다 */
  restoreSource() {
    if (this.restored) return;
    this.restored = true;
    (this.hidden || []).forEach(o => { if (o.scene) o.setVisible(true); });
    this.hidden = [];
    const cam = this.cam, s = this.saved;
    if (cam && s) {
      cam.setZoom(s.zoom);
      cam.setScroll(s.sx, s.sy);
      cam.useBounds = s.useBounds;
      cam._follow = s.follow;
    }
    this.cam = null;
  }

  close() {
    if (this.previewKey && this.textures.exists(this.previewKey)) this.textures.remove(this.previewKey);
    AudioSystem.back();
    this.restoreSource();
    this.scene.stop();
    if (this.from) this.scene.resume(this.from);
  }
};
