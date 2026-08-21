/* 동네 편의점 — 어느 날이든 같은 가게, 같은 알바생입니다.
   올 때마다 조금씩 친해지고, 어느 날 덤을 하나 받습니다. */

window.StoreScene = class StoreScene extends Phaser.Scene {
  constructor() { super('StoreScene'); }

  create(data) {
    data = data || {};
    this.from = data.from || null;
    this.showBoard = !!data.board;          /* DAY 2 에서만 게시판이 열립니다 */
    this.boardDone = false;
    this.kindDone = false;
    this.boughtToday = false;
    this.talkedToday = false;

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.cameras.main.setBackgroundColor('#eef2f4');

    /* 가게 안 */
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0xf3f6f8, 1); g.fillRect(0, 0, W, 408);
    g.fillStyle(0xdfe6ea, 1); g.fillRect(0, 404, W, H - 404);
    g.fillStyle(0xcfd8de, 1); g.fillRect(0, 398, W, 10);
    g.fillStyle(0x4f9d8a, 1); g.fillRect(0, 76, W, 14);

    /* 진열대 */
    const shelf = this.add.graphics().setDepth(2);
    shelf.fillStyle(0xd9dee2, 1); shelf.fillRoundedRect(20, 124, 152, 220, 10);
    shelf.fillStyle(0xbfe0ea, 1);
    shelf.fillRect(28, 132, 136, 66); shelf.fillRect(28, 206, 136, 66); shelf.fillRect(28, 280, 136, 58);
    const colors = [0xf2b56b, 0x8fc0d9, 0xc9755a, 0x7ba065, 0xf0913f, 0x9d8ac4];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      shelf.fillStyle(colors[(r * 5 + c) % colors.length], 1);
      shelf.fillRoundedRect(34 + c * 26, 138 + r * 74, 18, 34, 4);
    }

    /* 계산대와 아르바이트생 */
    const counter = this.add.graphics().setDepth(6);
    counter.fillStyle(0xe6dccb, 1); counter.fillRoundedRect(206, 288, 164, 86, 8);
    counter.fillStyle(0xd5c9b4, 1); counter.fillRect(206, 288, 164, 12);
    counter.fillStyle(0x9aa4b0, 1); counter.fillRoundedRect(300, 252, 46, 38, 6);
    this.clerk = this.add.image(264, 262, 'clerk_front').setDepth(5).setScale(1.45);
    this.tweens.add({ targets: this.clerk, y: 259, duration: 1900, yoyo: true, repeat: -1 });

    if (this.showBoard) this.add.image(84, 352, 'board_notice').setDepth(4).setScale(0.95);

    this.spark = this.add.image(352, 274, 'spark').setDepth(20).setScale(1.5).setVisible(false);
    this.tweens.add({ targets: this.spark, alpha: 0.35, scale: 1.7, duration: 900, yoyo: true, repeat: -1 });

    this.add.text(W / 2, 40, STORE.title, UI.style(FONT.body, PAL.ink)).setOrigin(0.5).setDepth(30);

    /* 얼마나 친해졌는지 */
    const f = this.friend();
    this.friendText = this.add.text(W - 16, 40,
      STORE.friendLabel[Math.min(f, STORE.friendLabel.length - 1)],
      UI.style(FONT.tiny, PAL.inkSoft)).setOrigin(1, 0.5).setDepth(30).setAlpha(0.85);

    this.hint = this.add.text(W / 2, 392, '', UI.style(FONT.small, PAL.inkSoft, {
      align: 'center', wordWrap: { width: W - 56 }
    })).setOrigin(0.5, 1).setDepth(30);

    this.dialogue = new DialogueBox(this);
    this.btns = [];

    /* 몇 번째 방문인지 세어 둡니다 */
    const visits = SaveSystem.get('store.visits', 0) + 1;
    SaveSystem.set('store.visits', visits);

    UI.fadeIn(this, 500, [235, 240, 244]);
    this.buildButtons();
    this.time.delayedCall(400, () => {
      const line = f >= 3 ? STORE.enterFriend : (visits > 1 ? STORE.enterAgain : STORE.enter);
      this.dialogue.play(line);
    });
  }

  friend() { return SaveSystem.get('store.friend', 0); }

  addFriend() {
    const f = this.friend() + 1;
    SaveSystem.set('store.friend', f);
    this.friendText.setText(STORE.friendLabel[Math.min(f, STORE.friendLabel.length - 1)]);
    return f;
  }

  buildButtons() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.btns.forEach(b => b.destroy());
    this.btns = [];

    const rows = [];
    rows.push({ label: STORE.btnBuy, fn: () => this.buy() });
    rows.push({ label: STORE.btnTalk, fn: () => this.talk() });
    if (this.showBoard) rows.push({ label: STORE.btnBoard, fn: () => this.board() });
    rows.push({ label: STORE.btnOut, fn: () => this.leave() });

    let y = H - 300 - (rows.length - 3) * 34;
    rows.forEach((r) => {
      const b = UI.button(this, W / 2, y, W - 64, 62, r.label, r.fn, { size: FONT.label });
      b.setDepth(30);
      this.btns.push(b);
      y += 72;
    });
  }

  setButtons(on) {
    this.btns.forEach(b => b.setVisible(on));
  }

  /* ── 뭘 좀 사 먹기 ───────────────────────── */
  buy() {
    if (this.boughtToday) { this.dialogue.say([STORE.boughtToday]); return; }
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.setButtons(false);
    this.hint.setText(STORE.buyHint);

    const layer = this.add.container(0, 0).setDepth(60);
    const scrim = this.add.graphics();
    scrim.fillStyle(0xf3f6f8, 0.94); scrim.fillRect(0, 404, W, H - 404);
    layer.add(scrim);

    STORE.snacks.forEach((s, i) => {
      const x = (i % 2 === 0) ? W / 2 - 92 : W / 2 + 92;
      const y = 458 + Math.floor(i / 2) * 76;
      const b = UI.button(this, x, y, 174, 64, s.icon + '  ' + s.label, () => {
        layer.destroy();
        this.eat(s);
      }, { size: FONT.small });
      layer.add(b);
    });
    const back = UI.button(this, W / 2, 458 + 3 * 76, 200, 56, '그냥 둘러보기', () => {
      layer.destroy();
      this.hint.setText('');
      this.setButtons(true);
    }, { size: FONT.small, alpha: 0.9 });
    layer.add(back);
  }

  eat(snack) {
    const W = GAME.WIDTH;
    this.setButtons(false);
    this.boughtToday = true;
    this.hint.setText('');
    SaveSystem.set('store.lastSnack', snack.label);

    const item = this.add.image(W / 2, 300, snack.tex).setDepth(70).setScale(1.4).setAlpha(0);
    this.tweens.add({ targets: item, alpha: 1, y: 268, duration: 600 });
    AudioSystem.select();

    this.dialogue.play(STORE.pay, () => {
      this.dialogue.say([STORE.eating], () => {
        this.tweens.add({ targets: item, alpha: 0, duration: 500, onComplete: () => item.destroy() });
        this.rateTaste(snack);
      });
    });
  }

  /* ── 맛 평가 ─────────────────────────────── */
  rateTaste(snack) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.setButtons(false);
    this.hint.setText(STORE.tasteHint);

    const layer = this.add.container(0, 0).setDepth(60);
    const scrim = this.add.graphics();
    scrim.fillStyle(0xf3f6f8, 0.94); scrim.fillRect(0, 404, W, H - 404);
    layer.add(scrim);

    STORE.tastes.forEach((t, i) => {
      const b = UI.button(this, W / 2, 456 + i * 70, W - 76, 60, t.label, () => {
        layer.destroy();
        this.hint.setText('');
        this.saidTaste(snack, t);
      }, { size: FONT.small });
      layer.add(b);
    });
  }

  saidTaste(snack, taste) {
    const list = SaveSystem.get('store.tastes', []) || [];
    list.push({ snack: snack.label, taste: taste.label });
    SaveSystem.set('store.tastes', list.slice(-12));

    this.dialogue.play(
      [{ s: '나', t: taste.say }].concat(STORE.clerkReply[taste.key] || []),
      () => {
        const f = this.addFriend();
        if (f >= STORE.giftAt && !SaveSystem.get('store.gotGift', false)) this.giveGift();
        else this.setButtons(true);
      }
    );
  }

  /* ── 이야기 나누기 ───────────────────────── */
  talk() {
    if (this.talkedToday) { this.dialogue.say([STORE.talkedToday]); return; }
    this.talkedToday = true;
    const f = this.friend();
    const lines = STORE.talk[Math.min(f, STORE.talk.length - 1)];
    this.setButtons(false);
    this.dialogue.play(lines, () => {
      const nf = this.addFriend();
      if (nf >= STORE.giftAt && !SaveSystem.get('store.gotGift', false)) this.giveGift();
      else this.setButtons(true);
    });
  }

  /* ── 덤 ──────────────────────────────────── */
  giveGift() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.set('store.gotGift', true);
    AudioSystem.chime();

    this.dialogue.play(STORE.gift, () => {
      const c = this.add.container(W / 2, 300).setDepth(80).setAlpha(0).setScale(0.8);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.14); g.fillRoundedRect(-104, -34, 210, 76, 18);
      g.fillStyle(HEX(PAL.paper), 0.98); g.fillRoundedRect(-106, -38, 210, 76, 18);
      g.lineStyle(2, HEX(PAL.sunDeep), 0.8); g.strokeRoundedRect(-106, -38, 210, 76, 18);
      c.add(g);
      c.add(this.add.text(0, -12, '🍬', UI.style(26, PAL.ink)).setOrigin(0.5));
      c.add(this.add.text(0, 16, STORE.giftName, UI.style(FONT.small, PAL.ink)).setOrigin(0.5));
      this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 600, ease: 'Back.easeOut' });

      this.time.delayedCall(2400, () => {
        this.tweens.add({
          targets: c, alpha: 0, duration: 600,
          onComplete: () => { c.destroy(); this.setButtons(true); }
        });
      });
    });
  }

  /* ── 게시판 (DAY 2) ──────────────────────── */
  board() {
    const S = DAY02.store;
    this.dialogue.say(S.board, () => {
      if (this.boardDone) return;
      this.boardDone = true;
      this.hint.setText('“오늘 누군가에게 따뜻한 말을 한마디 해보세요.”');
      if (this.kindDone) return;
      this.kindDone = true;
      this.setButtons(false);
      this.dialogue.play(S.kindTalk, () => {
        this.spark.setVisible(true);
        this.hint.setText('계산대 옆에서 작은 빛이 반짝인다.');
        this.spark.setInteractive(new Phaser.Geom.Circle(6, 6, 26), Phaser.Geom.Circle.Contains);
        this.spark.once('pointerup', () => {
          this.spark.disableInteractive();
          this.tweens.add({ targets: this.spark, alpha: 0, duration: 400 });
          this.dialogue.say(S.sparkFound, () => {
            Collection.award(this, 's9', () => { this.hint.setText(''); this.setButtons(true); });
          });
        });
        this.setButtons(true);
      });
    });
  }

  leave() {
    if (this.dialogue.isOpen) return;
    AudioSystem.back();
    UI.fadeOut(this, 450, () => {
      const from = this.from;
      this.scene.stop();
      if (from) {
        this.scene.resume(from);
        const parent = this.scene.get(from);
        if (parent && parent.onStoreDone) parent.onStoreDone();
      } else {
        this.scene.start('TitleScene');
      }
    });
  }
};
