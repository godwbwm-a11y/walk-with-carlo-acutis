/* DAY 6 미니게임 · 주교님의 낱말퀴즈

   주교님이 교리와 성경에 대한 가로세로 문제를 내십니다.
   답은 직접 적습니다. 맞으면 주교님이 뜻을 풀어 주시고,
   모르거나 틀리면 외국인 친구들이 옆에서 힌트를 줍니다.
   두 번 헤매면 보기 중에서 고를 수 있게 해 드립니다 — 막히는 일은 없습니다. */

window.CrosswordScene = class CrosswordScene extends MiniGameScene {
  constructor() { super('CrosswordScene'); }

  create(data) {
    const C = DAY06.crossword;
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#4b5a48', warm: true,
      title: C.title, hint: C.hint
    });

    const W = GAME.WIDTH;

    /* 지난번 흔적을 지웁니다 */
    this.idx = 0;
    this.tries = 0;
    this.solved = [];

    /* ── 격자 ──────────────────────────────────── */
    const cell = 58, gap = 4;
    this.gridX = Math.round((W - (C.cols * cell + (C.cols - 1) * gap)) / 2);
    this.gridY = 148;
    this.cell = cell; this.gap = gap;

    /* 어느 칸을 쓰는지, 어느 칸에서 낱말이 시작하는지 먼저 셈합니다 */
    const used = {}, starts = {};
    C.entries.forEach((e) => {
      const syl = Array.from(e.answer);
      syl.forEach((s, i) => {
        const r = e.dir === '가로' ? e.r : e.r + i;
        const c = e.dir === '가로' ? e.c + i : e.c;
        used[r + ',' + c] = s;
      });
      starts[e.r + ',' + e.c] = e.n;
    });
    this.answerAt = used;

    this.cellText = {};
    const gfx = this.add.graphics().setDepth(10);
    Object.keys(used).forEach((key) => {
      const rc = key.split(',');
      const r = +rc[0], c = +rc[1];
      const x = this.gridX + c * (cell + gap);
      const y = this.gridY + r * (cell + gap);
      gfx.fillStyle(0x000000, 0.18); gfx.fillRoundedRect(x + 2, y + 3, cell, cell, 7);
      gfx.fillStyle(0xfdf3e0, 1); gfx.fillRoundedRect(x, y, cell, cell, 7);
      gfx.lineStyle(2, HEX(PAL.woodDark), 0.55); gfx.strokeRoundedRect(x, y, cell, cell, 7);

      const t = this.add.text(x + cell / 2, y + cell / 2 + 1, '',
        UI.style(26, PAL.ink)).setOrigin(0.5).setDepth(14);
      this.cellText[key] = t;

      if (starts[key] !== undefined) {
        this.add.text(x + 5, y + 3, String(starts[key]),
          UI.style(FONT.tiny, PAL.sunDeep)).setOrigin(0, 0).setDepth(14);
      }
    });

    const gridBottom = this.gridY + C.rows * cell + (C.rows - 1) * gap;

    this.progress = this.add.text(W / 2, gridBottom + 16, '',
      UI.style(FONT.small, PAL.cream)).setOrigin(0.5, 0).setDepth(20).setAlpha(0.9);

    /* ── 주교님과 친구들 ───────────────────────── */
    const peopleY = gridBottom + 96;
    this.bishop = this.add.image(64, peopleY, 'd6_bishop').setDepth(30).setScale(1.5);
    this.tweens.add({ targets: this.bishop, y: peopleY - 4, duration: 1500, yoyo: true, repeat: -1 });
    this.add.text(64, peopleY + 46, '주교님', UI.style(FONT.tiny, PAL.dimWarm))
      .setOrigin(0.5).setDepth(30).setAlpha(0.85);

    this.friends = {};
    [['루카', 214, 'pilgrim_e'], ['마리아', 276, 'pilgrim_a'], ['레아', 336, 'pilgrim_c']]
      .forEach((f, i) => {
        const img = this.add.image(f[1], peopleY, f[2]).setDepth(30).setScale(1.35);
        this.tweens.add({ targets: img, y: peopleY - 4, duration: 900 + i * 130, yoyo: true, repeat: -1 });
        this.add.text(f[1], peopleY + 40, f[0], UI.style(FONT.tiny, PAL.dimWarm))
          .setOrigin(0.5).setDepth(30).setAlpha(0.8);
        this.friends[f[0]] = img;
      });

    /* ── 지금 문제 ─────────────────────────────── */
    const clueY = peopleY + 56;
    this.cluePlate = this.add.graphics().setDepth(24);
    this.clueText = this.add.text(W / 2, clueY + 16, '',
      UI.style(FONT.small, PAL.ink, { align: 'center', wordWrap: { width: W - 82 }, lineSpacing: 5 }))
      .setOrigin(0.5, 0).setDepth(26);
    this.clueY = clueY;

    this.askBtn = UI.button(this, W / 2, 762, 250, 62, C.askBtn,
      () => this.ask(), { size: FONT.label, fill: PAL.sun });
    this.askBtn.setDepth(40).setVisible(false);

    this.updateProgress();
    this.time.delayedCall(400, () => {
      this.dialogue.play(C.open, () => this.nextClue());
    });
  }

  /* ── 다음 문제 ───────────────────────────────── */
  nextClue() {
    const C = DAY06.crossword;
    if (this.idx >= C.entries.length) { this.allDone(); return; }
    const e = C.entries[this.idx];
    this.tries = 0;
    this.clueText.setText(e.n + ' ' + e.dir + '\n' + e.clue);
    this.drawCluePlate();
    this.askBtn.setVisible(true);
    this.updateProgress();
  }

  drawCluePlate() {
    const W = GAME.WIDTH;
    const h = this.clueText.height + 32;
    this.cluePlate.clear();
    this.cluePlate.fillStyle(0xfdf3e0, 0.94);
    this.cluePlate.fillRoundedRect(20, this.clueY, W - 40, h, 14);
    this.cluePlate.lineStyle(2, HEX(PAL.sunDeep), 0.5);
    this.cluePlate.strokeRoundedRect(20, this.clueY, W - 40, h, 14);
  }

  updateProgress() {
    const C = DAY06.crossword;
    this.progress.setText(C.progress + '  ' + this.idx + ' / ' + C.entries.length);
  }

  /* ── 답을 적습니다 ───────────────────────────── */
  ask() {
    const C = DAY06.crossword;
    const e = C.entries[this.idx];
    this.askBtn.setVisible(false);

    if (!TextInput.supported(this)) { this.pickFromList(); return; }

    TextInput.ask(this, {
      question: e.n + ' ' + e.dir + ' — ' + e.clue,
      placeholder: C.placeholder,
      okLabel: C.okBtn,
      skipLabel: C.skipBtn,
      maxLength: 12,
      showBack: false          // 답은 되비추지 않고 바로 주교님께
    }, (v) => this.check(v));
  }

  /* 두 번 헤매면 보기 중에서 고릅니다 */
  pickFromList() {
    const e = DAY06.crossword.entries[this.idx];
    const opts = [e.answer].concat(e.decoys || [])
      .map((t) => ({ key: t, label: t }));
    Phaser.Utils.Array.Shuffle(opts);
    this.dialogue.choose(e.clue, opts, (key) => {
      this.check(key, true);
    });
  }

  check(v, fromList) {
    const C = DAY06.crossword;
    const e = C.entries[this.idx];
    const said = String(v == null ? '' : v).replace(/\s/g, '');

    if (said === e.answer) { this.right(e); return; }

    /* 틀렸거나 모르겠다고 했을 때 — 친구들이 거듭니다 */
    this.tries++;
    const 친구 = this.friends[e.who];
    if (친구) this.tweens.add({ targets: 친구, y: 친구.y - 12, duration: 200, yoyo: true });
    AudioSystem.blip();

    const lines = [];
    lines.push({ s: '주교님', t: said === '' ? C.dontKnow : C.wrong });
    lines.push({ s: e.who, t: e.hint });

    this.dialogue.play(lines, () => {
      if (fromList || this.tries >= 2) { this.pickFromList(); return; }
      this.askBtn.setVisible(true);
    });
  }

  /* ── 맞았습니다 ──────────────────────────────── */
  right(e) {
    AudioSystem.found();
    this.fillWord(e);
    this.solved.push(e.answer);
    this.idx++;
    this.updateProgress();

    this.tweens.add({ targets: this.bishop, y: this.bishop.y - 10, duration: 220, yoyo: true });
    this.dialogue.play([
      { s: '주교님', t: DAY06.crossword.right },
      { s: '주교님', t: e.explain }
    ], () => this.nextClue());
  }

  fillWord(e) {
    const syl = Array.from(e.answer);
    syl.forEach((s, i) => {
      const r = e.dir === '가로' ? e.r : e.r + i;
      const c = e.dir === '가로' ? e.c + i : e.c;
      const t = this.cellText[r + ',' + c];
      if (!t || t.text === s) return;                 // 이미 채워진 교차 칸은 그대로
      t.setText(s).setScale(0.4).setAlpha(0);
      this.tweens.add({
        targets: t, scale: 1, alpha: 1, duration: 320, delay: i * 110, ease: 'Back.easeOut'
      });
    });
  }

  /* ── 다 채웠습니다 ───────────────────────────── */
  allDone() {
    const W = GAME.WIDTH;
    this.askBtn.setVisible(false);
    this.cluePlate.clear();
    this.clueText.setText('');
    AudioSystem.chime();

    const t = this.add.text(W / 2, this.clueY + 10, DAY06.crossword.filled,
      UI.style(22, PAL.sun, { align: 'center' })).setOrigin(0.5, 0).setDepth(30).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 800 });

    Object.keys(this.cellText).forEach((key, i) => {
      const c = this.cellText[key];
      this.tweens.add({ targets: c, scale: 1.16, duration: 220, delay: i * 40, yoyo: true });
    });

    this.time.delayedCall(1900, () => this.complete(DAY06.crossword.done));
  }
};
