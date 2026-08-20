/* 카를로와의 메시지 — 익숙한 채팅 화면처럼 */

window.ChatScene = class ChatScene extends Phaser.Scene {
  constructor() { super('ChatScene'); }

  create(data) {
    data = data || {};
    this.from = data.from || null;
    this.onDoneScene = data.next || null;
    this.done = [];
    this.busy = false;

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.headH = 100;
    this.replyTop = H - 274;

    this.add.graphics().fillStyle(HEX('#9db6cf'), 1).fillRect(0, 0, W, H);
    const paper = this.add.graphics();
    paper.fillStyle(HEX('#a9c0d6'), 1); paper.fillRect(0, this.headH, W, this.replyTop - this.headH);

    /* 위쪽 대화방 이름 */
    const head = this.add.graphics().setDepth(20);
    head.fillStyle(HEX('#2b3b60'), 1); head.fillRect(0, 0, W, this.headH);
    this.add.circle(48, 50, 21, HEX(PAL.clay)).setDepth(21);
    this.add.image(48, 52, 'carlo_front').setScale(0.72).setDepth(22);
    this.add.text(80, 36, CHAT.name, UI.style(19, PAL.cream)).setOrigin(0, 0.5).setDepth(21);
    this.add.text(80, 62, CHAT.status, UI.style(13, '#b9c6df', { wordWrap: { width: W - 130 } }))
      .setOrigin(0, 0.5).setDepth(21).setAlpha(0.9);
    UI.circleButton(this, W - 32, 46, 20, '✕', () => this.finish(), { size: 16 }).setDepth(21);

    /* 메시지가 쌓이는 곳 */
    this.list = this.add.container(0, this.headH + 12);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, this.headH, W, this.replyTop - this.headH);
    this.list.setMask(shape.createGeometryMask());
    this.flowY = 22;

    const rp = this.add.graphics().setDepth(29);
    rp.fillStyle(HEX('#8fa9c2'), 1); rp.fillRect(0, this.replyTop, W, H - this.replyTop);
    rp.lineStyle(2, HEX('#7e98b2'), 1); rp.lineBetween(0, this.replyTop, W, this.replyTop);
    this.replyPanel = this.add.container(0, 0).setDepth(30);
    this.promptText = this.add.text(W / 2, this.replyTop + 26, CHAT.prompt,
      UI.style(FONT.small, PAL.ink)).setOrigin(0.5).setDepth(30).setAlpha(0.75);

    /* 위아래로 끌어 지난 메시지 보기 */
    this.input.on('pointerdown', (p) => {
      if (p.y < this.headH || p.y > this.replyTop) return;
      this.drag = true; this.lastY = p.y;
    });
    this.input.on('pointermove', (p) => {
      if (!this.drag) return;
      const dy = p.y - this.lastY; this.lastY = p.y;
      this.list.y = Phaser.Math.Clamp(this.list.y + dy, this.minY(), this.headH + 12);
    });
    this.input.on('pointerup', () => { this.drag = false; });

    Collection.unlock('c1');            // 카를로의 상태메시지
    this.queue(CHAT.intro, () => this.showTopics());
    UI.fadeIn(this, 400);
  }

  minY() {
    const visible = this.replyTop - this.headH - 24;
    return Math.min(this.headH + 12, this.headH + 12 + visible - this.flowY);
  }

  scrollToEnd() {
    this.list.y = this.minY();
  }

  /* 말풍선 하나 */
  bubble(msg) {
    const W = GAME.WIDTH;
    const mine = msg.who === 'me';
    const maxW = 236;
    const t = this.add.text(0, 0, msg.t,
      UI.style(18, mine ? PAL.ink : PAL.ink, { wordWrap: { width: maxW }, lineSpacing: 5 }));
    const padX = 16, padY = 12;
    const bw = Math.min(maxW, t.width) + padX * 2;
    const bh = t.height + padY * 2;
    const x = mine ? W - 18 - bw : 18;

    const g = this.add.graphics();
    g.fillStyle(HEX(mine ? '#ffe9a8' : '#ffffff'), 1);
    g.fillRoundedRect(x, this.flowY, bw, bh, 14);
    g.fillTriangle(
      mine ? x + bw : x, this.flowY + 12,
      mine ? x + bw + 7 : x - 7, this.flowY + 16,
      mine ? x + bw : x, this.flowY + 24
    );

    t.setPosition(x + padX, this.flowY + padY);
    const grp = [g, t];
    if (!mine) {
      const n = this.add.text(x, this.flowY - 17, CHAT.name, UI.style(13, '#3d5170')).setAlpha(0.8);
      grp.push(n);
    }
    this.list.add(grp);

    const holder = { alpha: 0 };
    grp.forEach(o => o.setAlpha(0));
    this.tweens.add({ targets: grp, alpha: 1, duration: 220 });

    this.flowY += bh + (msg.who === 'carlo' ? 26 : 14);
    this.scrollToEnd();
    AudioSystem.tap();
  }

  typing(cb) {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(18, this.flowY, 76, 42, 14);
    const dots = [];
    for (let i = 0; i < 3; i++) {
      const d = this.add.circle(38 + i * 18, this.flowY + 21, 4, HEX('#8fa5c8'));
      dots.push(d);
      this.tweens.add({ targets: d, y: this.flowY + 15, duration: 380, yoyo: true, repeat: -1, delay: i * 130 });
    }
    this.list.add([g].concat(dots));
    this.scrollToEnd();
    this.time.delayedCall(620, () => {
      g.destroy(); dots.forEach(d => d.destroy());
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
        this.typing(() => { this.bubble(msg); this.time.delayedCall(360, next); });
      } else {
        this.bubble(msg);
        this.time.delayedCall(480, next);
      }
    };
    this.time.delayedCall(320, next);
  }

  clearReplies() {
    this.replyPanel.removeAll(true);
  }

  showTopics() {
    const W = GAME.WIDTH;
    this.clearReplies();
    this.promptText.setText(this.done.length ? CHAT.again : CHAT.prompt).setVisible(true);

    const left = CHAT.topics.filter(t => this.done.indexOf(t.id) === -1);
    const rows = left.slice(0, 3);
    let y = this.replyTop + 62;

    rows.forEach((topic) => {
      const b = UI.button(this, W / 2, y, W - 44, 50, topic.label, () => this.pick(topic), { size: FONT.small });
      this.replyPanel.add(b);
      y += 54;
    });

    const b = UI.button(this, W / 2, y, W - 44, 50,
      left.length ? CHAT.endLabel : '이제 자러 갈게', () => this.finish(),
      { size: FONT.small, fill: PAL.cream, alpha: 0.9 });
    this.replyPanel.add(b);
  }

  pick(topic) {
    if (this.busy) return;
    this.done.push(topic.id);
    this.clearReplies();
    this.promptText.setVisible(false);
    this.queue(topic.lines, () => {
      if (topic.card && !Collection.has(topic.card)) {
        Collection.award(this, topic.card, () => this.showTopics());
      } else {
        this.showTopics();
      }
    });
  }

  finish() {
    if (this.busy) return;
    this.clearReplies();
    this.promptText.setVisible(false);
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
