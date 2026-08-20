/* DAY 2 · 편의점 — 아주 평범한 몇 마디 */

window.Day2StoreScene = class Day2StoreScene extends Phaser.Scene {
  constructor() { super('Day2StoreScene'); }

  create(data) {
    data = data || {};
    this.from = data.from || null;
    this.bought = false; this.readBoard = false; this.kindDone = false;

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const S = DAY02.store;
    this.cameras.main.setBackgroundColor('#eef2f4');

    /* 가게 안 */
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0xf3f6f8, 1); g.fillRect(0, 0, W, 408);
    g.fillStyle(0xdfe6ea, 1); g.fillRect(0, 404, W, H - 404);
    g.fillStyle(0xcfd8de, 1); g.fillRect(0, 398, W, 10);
    g.fillStyle(0x4f9d8a, 1); g.fillRect(0, 74, W, 12);

    /* 음료 진열대 */
    const shelf = this.add.graphics().setDepth(2);
    shelf.fillStyle(0xd9dee2, 1); shelf.fillRoundedRect(22, 120, 150, 220, 10);
    shelf.fillStyle(0xbfe0ea, 1); shelf.fillRect(30, 128, 134, 66);
    shelf.fillRect(30, 202, 134, 66); shelf.fillRect(30, 276, 134, 58);
    const colors = [0xf2b56b, 0x8fc0d9, 0xc9755a, 0x7ba065, 0xf0913f, 0x9d8ac4];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      shelf.fillStyle(colors[(r * 5 + c) % colors.length], 1);
      shelf.fillRoundedRect(36 + c * 26, 134 + r * 74, 18, 34, 4);
    }

    /* 계산대와 아르바이트생 */
    const counter = this.add.graphics().setDepth(6);
    counter.fillStyle(0xe6dccb, 1); counter.fillRoundedRect(210, 286, 158, 84, 8);
    counter.fillStyle(0xd5c9b4, 1); counter.fillRect(210, 286, 158, 12);
    counter.fillStyle(0x9aa4b0, 1); counter.fillRoundedRect(300, 252, 46, 38, 6);
    this.clerk = this.add.image(266, 262, 'clerk_front').setDepth(5).setScale(1.35);
    this.tweens.add({ targets: this.clerk, y: 259, duration: 1900, yoyo: true, repeat: -1 });

    /* 게시판 */
    this.add.image(84, 348, 'board_notice').setDepth(4).setScale(0.95);

    /* 반짝임 */
    this.spark = this.add.image(352, 274, 'spark').setDepth(20).setScale(1.5).setVisible(false);
    this.tweens.add({ targets: this.spark, alpha: 0.35, scale: 1.7, duration: 900, yoyo: true, repeat: -1 });

    this.add.text(W / 2, 40, '편의점', UI.style(21, PAL.ink)).setOrigin(0.5).setDepth(30);
    this.hint = this.add.text(W / 2, 394, '', UI.style(FONT.small, PAL.inkSoft, {
      align: 'center', wordWrap: { width: W - 60 }
    })).setOrigin(0.5).setDepth(30);

    this.dialogue = new DialogueBox(this);

    this.btns = [];
    this.buildButtons();

    UI.fadeIn(this, 500, [235, 240, 244]);
    this.time.delayedCall(400, () => this.dialogue.play(S.enter.map(l => (typeof l === 'string' ? { t: l } : l))));
  }

  buildButtons() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.btns.forEach(b => b.destroy());
    this.btns = [];

    const rows = [];
    rows.push({ label: this.bought ? '음료를 하나 더 볼까' : '음료 고르기', fn: () => this.buy() });
    rows.push({ label: '게시판 보기', fn: () => this.board() });
    if (this.readBoard && !this.kindDone) rows.push({ label: '따뜻한 말 건네기', fn: () => this.kind() });
    rows.push({ label: '나가기', fn: () => this.leave() });

    let y = H - 416;
    rows.forEach((r) => {
      const b = UI.button(this, W / 2, y, W - 70, 56, r.label, r.fn, { size: FONT.label });
      b.setDepth(30);
      this.btns.push(b);
      y += 64;
    });
  }

  buy() {
    const S = DAY02.store;
    if (this.bought) { this.dialogue.say(S.shelf); return; }
    this.bought = true;
    this.dialogue.play(S.buy, () => {
      this.dialogue.choose('', S.choices, (key) => {
        SaveSystem.set('reflections.day2Clerk', key);
        this.dialogue.play(S.reply[key], () => this.buildButtons());
      });
    });
  }

  board() {
    const S = DAY02.store;
    this.dialogue.say(S.board, () => {
      if (!this.readBoard) {
        this.readBoard = true;
        this.hint.setText('“오늘 누군가에게 따뜻한 말을 한마디 해보세요.”');
        this.buildButtons();
      }
    });
  }

  kind() {
    const S = DAY02.store;
    this.kindDone = true;
    this.dialogue.play(S.kindTalk, () => {
      this.spark.setVisible(true);
      this.hint.setText('계산대 옆에서 작은 빛이 반짝인다.');
      this.spark.setInteractive(new Phaser.Geom.Circle(6, 6, 22), Phaser.Geom.Circle.Contains);
      this.spark.once('pointerdown', () => {
        this.spark.disableInteractive();
        this.tweens.add({ targets: this.spark, alpha: 0, duration: 400 });
        this.dialogue.say(S.sparkFound, () => {
          Collection.award(this, 's8', () => { this.hint.setText(''); this.buildButtons(); });
        });
      });
      this.buildButtons();
    });
  }

  leave() {
    if (this.dialogue.isOpen) return;
    AudioSystem.back();
    UI.fadeOut(this, 450, () => {
      const from = this.from;
      this.scene.stop();
      if (from) this.scene.resume(from);
      else this.scene.start('TitleScene');
    }, [235, 240, 244]);
  }
};
