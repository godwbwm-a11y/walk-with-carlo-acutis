/* 미니게임 · 숙제하기 — 틀려도 괜찮습니다. 다시 보면 됩니다. */

window.HomeworkScene = class HomeworkScene extends MiniGameScene {
  constructor() { super('HomeworkScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: 's6', bg: '#3a4f6e',
      title: '숙제하기',
      hint: '딴생각이 떠오르면 톡 눌러 옆에 두세요.'
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;

    /* 공책 */
    const page = this.add.graphics().setDepth(0);
    page.fillStyle(0x000000, 0.15); page.fillRoundedRect(24, 154, W - 48, 512, 16);
    page.fillStyle(HEX(PAL.paper), 1); page.fillRoundedRect(22, 150, W - 44, 512, 16);
    page.lineStyle(2, HEX('#d8c7a8'), 1);
    for (let i = 0; i < 11; i++) page.lineBetween(44, 228 + i * 40, W - 44, 228 + i * 40);
    page.lineStyle(2, HEX(PAL.clay), 0.5); page.lineBetween(62, 158, 62, 654);

    this.questions = [
      { q: '17 + 25 = ?', a: ['42', '32', '45'], correct: 0 },
      { q: "'설레다'의 바른 표기는?", a: ['설레이다', '설레다', '설레임'], correct: 1 },
      { q: "'감사합니다'를 영어로 하면?", a: ['Thanks giving', 'Thank your', 'Thank you'], correct: 2 }
    ];
    this.qIndex = 0;

    this.qText = this.add.text(W / 2, 206, '', UI.style(21, PAL.ink, {
      align: 'center', wordWrap: { width: W - 90 }
    })).setOrigin(0.5, 0).setDepth(10);

    this.feedback = this.add.text(W / 2, 314, '', UI.style(FONT.small, PAL.clay)).setOrigin(0.5).setDepth(10);
    this.progress = this.add.text(W / 2, 700, '', UI.style(FONT.small, '#dfd2bd')).setOrigin(0.5).setDepth(10);

    this.buttons = [];
    this.thoughts = [];
    this.showQuestion();

    /* 이따금 떠오르는 딴생각 */
    this.thoughtTimer = this.time.addEvent({
      delay: 3600, loop: true, callback: () => this.spawnThought()
    });
  }

  showQuestion() {
    const W = GAME.WIDTH;
    this.buttons.forEach(b => b.destroy());
    this.buttons = [];
    const q = this.questions[this.qIndex];
    this.qText.setText('문제 ' + (this.qIndex + 1) + '.\n' + q.q);
    this.progress.setText('문제 ' + (this.qIndex + 1) + ' / ' + this.questions.length);
    this.feedback.setText('');

    q.a.forEach((label, i) => {
      const b = UI.button(this, W / 2, 386 + i * 78, W - 110, 60, label, () => this.answer(i), { size: FONT.label });
      b.setDepth(10);
      this.buttons.push(b);
    });
  }

  answer(i) {
    if (this.finished) return;
    const q = this.questions[this.qIndex];
    if (i === q.correct) {
      AudioSystem.found();
      this.feedback.setColor(PAL.leaf).setText('맞았다!');
      this.qIndex++;
      this.time.delayedCall(700, () => {
        if (this.qIndex >= this.questions.length) {
          if (this.thoughtTimer) this.thoughtTimer.remove();
          this.thoughts.forEach(t => t.destroy());
          this.setHint('');
          this.complete([
            '숙제를 끝냈다.',
            '대단한 집중은 아니었지만, 끝까지 앉아 있었다.',
            '이것도 하느님께 드릴 수 있을까.'
          ]);
        } else {
          this.showQuestion();
        }
      });
    } else {
      AudioSystem.back();
      this.feedback.setColor(PAL.clay).setText('음… 다시 볼까?');
      const b = this.buttons[i];
      this.tweens.add({ targets: b, x: b.x + 8, duration: 60, yoyo: true, repeat: 3 });
    }
  }

  spawnThought() {
    if (this.finished || this.thoughts.length >= 3) return;
    const W = GAME.WIDTH;
    const texts = ['치킨…', '주말에 뭐하지', '걔는 왜 그랬을까', '시험 언제지', '유튜브 볼까', '졸려…'];
    const t = texts[Phaser.Math.Between(0, texts.length - 1)];

    const c = this.add.container(Phaser.Math.Between(80, W - 80), Phaser.Math.Between(250, 630)).setDepth(40);
    const label = this.add.text(0, 0, t, UI.style(FONT.small, PAL.inkSoft)).setOrigin(0.5);
    const g = this.add.graphics();
    const w = label.width + 30, h = 44;
    g.fillStyle(0xffffff, 0.94); g.fillRoundedRect(-w / 2, -h / 2, w, h, 22);
    g.lineStyle(2, HEX(PAL.sky), 0.8); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
    g.fillStyle(0xffffff, 0.94); g.fillCircle(-w / 2 + 12, h / 2 + 8, 5);
    c.add([g, label]);
    c.setSize(w, h + 12);
    c.setInteractive();
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, y: c.y - 8, duration: 400 });
    this.tweens.add({ targets: c, y: c.y - 14, duration: 1800, yoyo: true, repeat: -1 });

    c.on('pointerdown', () => {
      AudioSystem.swipe();
      this.tweens.add({
        targets: c, x: c.x + 160, alpha: 0, duration: 340,
        onComplete: () => { c.destroy(); this.thoughts = this.thoughts.filter(x => x !== c); }
      });
    });
    this.thoughts.push(c);
  }
};
