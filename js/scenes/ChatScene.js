/* 가롤로와의 메시지 — 휴대폰 메신저 화면처럼.

   - 위: 뒤로 가기(‹) · 프로필 사진 · 이름 · 상태 메시지. 닫기 단추가 글자를 가리지 않습니다.
   - 가운데: 날짜 띠, 그리고 말풍선. 같은 사람이 이어 보내면 이름과 사진은 첫 말풍선에만,
     보낸 시각은 이어진 말풍선의 마지막에만 붙습니다. 내가 보낸 말 옆의 ‘1’은 가롤로가 읽으면 사라집니다.
   - 아래: 메시지 입력창. 물어볼 말은 입력창 위에 ‘빠른 답장’으로 떠오릅니다.
     가롤로가 답하는 동안에는 빠른 답장이 내려가 대화가 화면을 넓게 씁니다. */

window.ChatScene = class ChatScene extends Phaser.Scene {
  constructor() { super('ChatScene'); }

  create(data) {
    /* 이 화면은 다른 화면 위에 올라옵니다 — 뒤에 가려지지 않게 맨 앞으로 */
    this.scene.bringToTop();
    data = data || {};
    this.from = data.from || null;
    this.onDoneScene = data.next || null;
    this.done = [];
    this.busy = false;
    this.last = null;                         // 마지막 말풍선 — 이어 보내기 판단
    this.unread = [];

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.C = {
      bg: '#b9cbdc', head: '#b9cbdc', ink: '#1d232c', sub: '#55657a',
      mine: '#ffe14d', theirs: '#ffffff', time: '#5f6f82', bar: '#ffffff', line: '#a7b9cc'
    };
    this.headH = 92;
    this.barH = 58;
    this.barTop = H - this.barH;
    this.viewBottom = this.barTop;            // 말풍선이 보이는 아래 끝(빠른 답장이 떠 있으면 그 위)

    this.add.graphics().fillStyle(HEX(this.C.bg), 1).fillRect(0, 0, W, H);

    /* ── 위: 대화방 머리 ── */
    const head = this.add.graphics().setDepth(20);
    head.fillStyle(HEX(this.C.head), 0.97); head.fillRect(0, 0, W, this.headH);
    head.lineStyle(1, HEX(this.C.line), 1); head.lineBetween(0, this.headH, W, this.headH);
    const back = this.add.text(22, 46, '‹', UI.style(40, this.C.ink)).setOrigin(0.5).setDepth(21);
    const backHit = this.add.zone(0, 0, 56, this.headH).setOrigin(0, 0).setDepth(22).setInteractive({ useHandCursor: true });
    backHit.on('pointerup', () => this.finish());
    this.avatarKey = (window.Figure && Figure.portrait) ? Figure.portrait(this, 'carlo_front', 40, '#c9553f') : null;
    if (this.avatarKey) this.add.image(66, 46, this.avatarKey).setDisplaySize(40, 40).setDepth(21);
    this.add.text(94, 34, CHAT.name, UI.style(18, this.C.ink, { fontStyle: 'bold' })).setOrigin(0, 0.5).setDepth(21);
    /* 상태 메시지 — 한 줄로, 넘치면 말줄임 */
    const st = this.add.text(94, 46, CHAT.status, UI.style(12, this.C.sub)).setOrigin(0, 0).setDepth(21);
    this.fitOneLine(st, W - 94 - 16);
    back.setAlpha(0.85);

    /* ── 가운데: 말풍선이 쌓이는 곳 ── */
    this.list = this.add.container(0, this.headH);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, this.headH, W, this.barTop - this.headH);
    this.list.setMask(shape.createGeometryMask());
    this.flowY = 16;
    this.dateBand();

    /* ── 아래: 입력창 ── */
    const bar = this.add.graphics().setDepth(40);
    bar.fillStyle(HEX(this.C.bar), 1); bar.fillRect(0, this.barTop, W, this.barH + 40);
    bar.lineStyle(1, 0xdde3ea, 1); bar.lineBetween(0, this.barTop, W, this.barTop);
    bar.fillStyle(0xf2f4f7, 1); bar.fillRoundedRect(52, this.barTop + 11, W - 112, 36, 18);
    this.add.text(26, this.barTop + 29, '+', UI.style(26, '#9aa5b3')).setOrigin(0.5).setDepth(41);
    this.inputHint = this.add.text(68, this.barTop + 29, '물어볼 말을 골라 보내요', UI.style(14, '#9aa5b3')).setOrigin(0, 0.5).setDepth(41);
    const send = this.add.graphics().setDepth(41);
    send.fillStyle(HEX('#ffe14d'), 1); send.fillRoundedRect(W - 50, this.barTop + 11, 38, 36, 12);
    this.add.text(W - 31, this.barTop + 29, '↑', UI.style(20, this.C.ink, { fontStyle: 'bold' })).setOrigin(0.5).setDepth(42);

    /* 빠른 답장 판 */
    this.sheet = this.add.container(0, 0).setDepth(35);

    /* 위아래로 끌어 지난 메시지 보기 */
    this.scroller = Scroller.create(this, {
      target: this.list, top: this.headH, height: this.barTop - this.headH,
      min: () => this.minY(), max: this.headH, depth: 25
    });

    Collection.unlock('c1');            // 가롤로의 상태메시지
    this.queue(CHAT.intro, () => this.showTopics());
    UI.fadeIn(this, 400);
  }

  /* 한 줄에 안 들어가면 끝을 줄입니다 */
  fitOneLine(t, maxW) {
    if (t.width <= maxW) return;
    let s = t.text;
    while (s.length > 1 && t.width > maxW) { s = s.slice(0, -1); t.setText(s + '…'); }
  }

  /* 맨 위 날짜 띠 */
  dateBand() {
    const W = GAME.WIDTH, d = new Date();
    const wd = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
    const t = this.add.text(W / 2, this.flowY + 12, (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + wd + '요일', UI.style(12, '#ffffff')).setOrigin(0.5);
    const g = this.add.graphics();
    g.fillStyle(0x2a3a52, 0.28); g.fillRoundedRect(W / 2 - t.width / 2 - 12, this.flowY + 2, t.width + 24, 22, 11);
    this.list.add([g, t]);
    this.flowY += 40;
  }

  nowText() {
    const d = new Date(), h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
    if (window.I18N && I18N.lang !== 'ko') return (h % 12 || 12) + ':' + m + (h < 12 ? ' AM' : ' PM');
    return (h < 12 ? '오전 ' : '오후 ') + (h % 12 || 12) + ':' + m;
  }

  minY() {
    const visible = this.viewBottom - this.headH - 12;
    return Math.min(this.headH, this.headH + visible - this.flowY);
  }

  /* 새 말이 오면 맨 아래로 — 부드럽게 따라 내려갑니다 */
  scrollToEnd() {
    if (this.scroller) this.scroller.toMin(260);
    else this.list.y = this.minY();
  }

  /* 말풍선 하나 */
  bubble(msg) {
    const W = GAME.WIDTH, C = this.C;
    const mine = msg.who === 'me';
    const cont = this.last && this.last.who === msg.who;      // 같은 사람이 이어서
    const maxW = 228;
    const left = 62;                                            // 가롤로 말풍선이 시작하는 자리(사진 옆)

    if (!cont) this.flowY += this.last ? 10 : 0;
    /* 이어 보내기면 앞 말풍선의 시각은 지우고, 마지막에만 남깁니다 */
    if (cont && this.last.time) { this.last.time.destroy(); this.last.time = null; }

    const grp = [];
    if (!mine && !cont) {
      if (this.avatarKey) grp.push(this.add.image(32, this.flowY + 18, this.avatarKey).setDisplaySize(38, 38));
      grp.push(this.add.text(left, this.flowY, CHAT.name, UI.style(13, '#3d4a5c')));
      this.flowY += 20;
    }

    const t = this.add.text(0, 0, msg.t, UI.style(16, C.ink, { wordWrap: { width: maxW }, lineSpacing: 4 }));
    const padX = 12, padY = 9;
    const bw = Math.min(maxW, t.width) + padX * 2;
    const bh = t.height + padY * 2;
    const x = mine ? W - 14 - bw : left;
    const y = this.flowY;

    const g = this.add.graphics();
    g.fillStyle(HEX(mine ? C.mine : C.theirs), 1);
    g.fillRoundedRect(x, y, bw, bh, 12);
    if (!cont) {                                                // 꼬리는 이어진 말풍선의 첫 번째에만
      if (mine) g.fillTriangle(x + bw - 8, y, x + bw + 6, y + 2, x + bw - 2, y + 12);
      else g.fillTriangle(x + 8, y, x - 6, y + 2, x + 2, y + 12);
    }
    t.setPosition(x + padX, y + padY);
    grp.push(g, t);

    /* 보낸 시각(과 내가 보낸 말의 읽음 표시) — 말풍선 옆 아래 */
    const time = this.add.text(mine ? x - 6 : x + bw + 6, y + bh, this.nowText(), UI.style(11, C.time)).setOrigin(mine ? 1 : 0, 1);
    grp.push(time);
    let one = null;
    if (mine) {
      one = this.add.text(x - 6, y + bh - 14, '1', UI.style(11, '#d9a400', { fontStyle: 'bold' })).setOrigin(1, 1);
      grp.push(one);
      this.unread.push(one);
    }

    this.list.add(grp);
    grp.forEach(o => o.setAlpha(0));
    this.tweens.add({ targets: grp, alpha: 1, duration: 200 });

    this.last = { who: msg.who, time: time };
    this.flowY += bh + 6;
    this.scrollToEnd();
    AudioSystem.tap();
  }

  /* 가롤로가 읽었습니다 — ‘1’이 사라집니다 */
  readAll() {
    this.unread.forEach((o) => { if (o.scene) this.tweens.add({ targets: o, alpha: 0, duration: 200, onComplete: () => o.destroy() }); });
    this.unread = [];
  }

  typing(cb) {
    const cont = this.last && this.last.who === 'carlo';
    const y = this.flowY + (cont ? 0 : 10 + 20);
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(62, y, 62, 36, 12);
    const items = [g];
    if (!cont && this.avatarKey) items.push(this.add.image(32, y - 2, this.avatarKey).setDisplaySize(38, 38).setAlpha(0.9));
    for (let i = 0; i < 3; i++) {
      const d = this.add.circle(80 + i * 13, y + 18, 3.5, HEX('#9aa8b8'));
      items.push(d);
      this.tweens.add({ targets: d, y: y + 13, duration: 360, yoyo: true, repeat: -1, delay: i * 120 });
    }
    this.list.add(items);
    const keep = this.flowY;
    this.flowY = y + 44;
    this.scrollToEnd();
    this.flowY = keep;
    this.time.delayedCall(640, () => {
      items.forEach(o => o.destroy());
      cb();
    });
  }

  /* 메시지를 순서대로 흘려보냅니다 */
  queue(lines, onDone) {
    this.busy = true;
    let i = 0;
    const next = () => {
      if (i >= lines.length) { this.busy = false; if (onDone) onDone(); return; }
      const msg = lines[i++];
      if (msg.who === 'carlo') {
        this.readAll();
        this.typing(() => { this.bubble(msg); this.time.delayedCall(360, next); });
      } else {
        this.bubble(msg);
        this.time.delayedCall(520, next);
      }
    };
    this.time.delayedCall(320, next);
  }

  /* ── 빠른 답장 ── */
  hideSheet() {
    this.sheet.removeAll(true);
    this.viewBottom = this.barTop;
  }

  showTopics() {
    const W = GAME.WIDTH;
    this.hideSheet();
    const left = CHAT.topics.filter(t => this.done.indexOf(t.id) === -1);
    const rows = left.slice(0, 3).map((t) => ({ label: t.label, fn: () => this.pick(t) }));
    rows.push({ label: left.length ? CHAT.endLabel : '이제 자러 갈게', fn: () => this.finish(), end: true });

    const chipH = 42, gap = 8, pad = 12;
    const head = 30;
    const total = head + rows.length * (chipH + gap) - gap + pad * 2;
    const top = this.barTop - total;
    const bg = this.add.graphics();
    bg.fillStyle(0xf4f6f9, 0.97); bg.fillRoundedRect(0, top, W, total + 20, { tl: 18, tr: 18, bl: 0, br: 0 });
    bg.lineStyle(1, 0xdde3ea, 1); bg.strokeRoundedRect(0.5, top + 0.5, W - 1, total + 20, { tl: 18, tr: 18, bl: 0, br: 0 });
    this.sheet.add(bg);
    this.sheet.add(this.add.text(18, top + pad + 8, this.done.length ? CHAT.again : CHAT.prompt, UI.style(13, '#6a7685')).setOrigin(0, 0.5));

    rows.forEach((r, i) => {
      const y = top + pad + head + i * (chipH + gap);
      const c = this.add.container(0, 0);
      const g = this.add.graphics();
      const draw = (hover) => {
        g.clear();
        g.fillStyle(r.end ? 0xffffff : (hover ? 0xfff3b0 : 0xffffff), 1);
        g.fillRoundedRect(14, y, W - 28, chipH, chipH / 2);
        g.lineStyle(1.5, r.end ? 0xc9d2dc : 0xf0c63a, 1);
        g.strokeRoundedRect(14, y, W - 28, chipH, chipH / 2);
      };
      draw(false);
      const t = this.add.text(W / 2, y + chipH / 2, r.label, UI.style(15, r.end ? '#6a7685' : this.C.ink, { align: 'center', wordWrap: { width: W - 64 } })).setOrigin(0.5);
      const z = this.add.zone(14, y, W - 28, chipH).setOrigin(0, 0).setInteractive({ useHandCursor: true });
      z.on('pointerover', () => draw(true)); z.on('pointerout', () => draw(false));
      z.on('pointerup', () => { if (window.Scroller && Scroller.caught) return; AudioSystem.select(); r.fn(); });
      c.add([g, t, z]);
      this.sheet.add(c);
    });
    this.sheet.setAlpha(0); this.sheet.y = 16;
    this.tweens.add({ targets: this.sheet, alpha: 1, y: 0, duration: 220, ease: 'Quad.easeOut' });
    this.viewBottom = top;
    this.scrollToEnd();
  }

  pick(topic) {
    if (this.busy) return;
    this.done.push(topic.id);
    this.hideSheet();
    this.queue(topic.lines, () => {
      if (topic.card && !Collection.has(topic.card)) {
        Collection.award(this, topic.card, () => this.showTopics());
      } else {
        this.showTopics();
      }
    });
  }

  finish() {
    if (this.busy || this._finishing) return;
    this._finishing = true;
    this.hideSheet();
    this.queue(CHAT.outro, () => {
      this.time.delayedCall(700, () => {
        AudioSystem.back();
        UI.fadeOut(this, 600, () => {
          this.scene.stop();
          if (this.onDoneScene && this.from) {
            const parent = this.scene.get(this.from);
            this.scene.resume(this.from);
            if (parent && parent.onChatDone) parent.onChatDone();
          } else if (this.from) {
            this.scene.resume(this.from);
          }
        }, [40, 60, 90]);
      });
    });
  }
};
