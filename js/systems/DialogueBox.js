/* 대화 상자 — 글자 21px, 화면 아무 곳이나 눌러 다음으로. 선택지는 큰 버튼으로. */

window.DialogueBox = class DialogueBox {

  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;
    this.lines = [];
    this.index = 0;
    this.onDone = null;
    this.typing = false;
    this.full = '';
    this.timerEvent = null;

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const boxW = W - 28, boxH = 164;
    const boxY = H - 112;

    this.container = scene.add.container(0, 0).setDepth(1000).setScrollFactor(0).setVisible(false);

    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x000000, 0.18);
    this.bg.fillRoundedRect(W / 2 - boxW / 2 + 2, boxY - boxH / 2 + 5, boxW, boxH, 20);
    this.bg.fillStyle(HEX(PAL.paper), 0.98);
    this.bg.fillRoundedRect(W / 2 - boxW / 2, boxY - boxH / 2, boxW, boxH, 20);
    this.bg.lineStyle(2, HEX(PAL.sun), 0.6);
    this.bg.strokeRoundedRect(W / 2 - boxW / 2, boxY - boxH / 2, boxW, boxH, 20);

    this.namePlate = scene.add.graphics();
    this.nameText = scene.add.text(W / 2 - boxW / 2 + 22, boxY - boxH / 2 - 15, '', UI.style(FONT.small, PAL.cream)).setOrigin(0, 0.5);

    this.text = scene.add.text(
      W / 2 - boxW / 2 + 22, boxY - boxH / 2 + 24, '',
      UI.style(FONT.dialogue, PAL.ink, { wordWrap: { width: boxW - 44 } })
    );

    this.arrow = scene.add.text(W / 2 + boxW / 2 - 26, boxY + boxH / 2 - 26, '▼', UI.style(15, PAL.sunDeep)).setOrigin(0.5);
    scene.tweens.add({ targets: this.arrow, alpha: 0.25, duration: 800, yoyo: true, repeat: -1 });

    this.container.add([this.bg, this.namePlate, this.nameText, this.text, this.arrow]);

    /* 화면 전체 터치로 진행 */
    this.hit = scene.add.zone(W / 2, H / 2, W, H).setOrigin(0.5)
      .setInteractive().setDepth(999).setScrollFactor(0).setVisible(false);
    this.hit.on('pointerdown', () => this.advance());

    this.choiceGroup = scene.add.container(0, 0).setDepth(1010).setScrollFactor(0);
    this.boxY = boxY; this.boxW = boxW; this.boxH = boxH;
  }

  _drawName(name) {
    this.namePlate.clear();
    if (!name) { this.nameText.setText(''); return; }
    this.nameText.setText(name);
    const w = this.nameText.width + 26;
    const x = GAME.WIDTH / 2 - this.boxW / 2 + 10;
    const y = this.boxY - this.boxH / 2 - 30;
    const color = (name === '카를로' || name === '소년') ? HEX(PAL.clay) : HEX(PAL.sea);
    this.namePlate.fillStyle(color, 0.95);
    this.namePlate.fillRoundedRect(x, y, w, 30, 15);
    this.nameText.setPosition(x + 13, y + 15);
  }

  /* lines: [{s:'엄마', t:'...'}] 또는 [{t:'서술문'}] */
  play(lines, onDone) {
    this.lines = Array.isArray(lines) ? lines.slice() : [lines];
    this.index = 0;
    this.onDone = onDone || null;
    this.isOpen = true;
    this.container.setVisible(true);
    this.hit.setVisible(true);
    if (this.scene.setInputLocked) this.scene.setInputLocked(true);
    this._show();
  }

  /* 문자열과 { s, t } 를 섞어서 넘겨도 됩니다 */
  say(textOrArray, onDone) {
    const arr = (Array.isArray(textOrArray) ? textOrArray : [textOrArray])
      .map(t => (typeof t === 'string' ? { t: t } : t));
    this.play(arr, onDone);
  }

  _show() {
    const line = this.lines[this.index];
    this._drawName(line.s || '');
    this.full = (line && line.t != null) ? String(line.t) : '';
    this.text.setText('');
    this.arrow.setVisible(false);
    this.typing = true;

    let i = 0;
    if (this.timerEvent) this.timerEvent.remove();
    this.timerEvent = this.scene.time.addEvent({
      delay: 34,
      repeat: this.full.length - 1,
      callback: () => {
        i++;
        this.text.setText(this.full.substring(0, i));
        if (i % 3 === 0) AudioSystem.talk();
        if (i >= this.full.length) { this.typing = false; this.arrow.setVisible(true); }
      }
    });
    if (this.full.length === 0) { this.typing = false; this.arrow.setVisible(true); }
  }

  advance() {
    if (!this.isOpen || this.choiceOpen) return;
    if (this.typing) {                     // 타이핑 중이면 즉시 완성
      if (this.timerEvent) this.timerEvent.remove();
      this.text.setText(this.full);
      this.typing = false;
      this.arrow.setVisible(true);
      return;
    }
    this.index++;
    if (this.index >= this.lines.length) { this.close(); return; }
    AudioSystem.tap();
    this._show();
  }

  close() {
    this.isOpen = false;
    this.container.setVisible(false);
    this.hit.setVisible(false);
    if (this.timerEvent) this.timerEvent.remove();
    if (this.scene.setInputLocked) this.scene.setInputLocked(false);
    const cb = this.onDone; this.onDone = null;
    if (cb) cb();
  }

  /* 선택지 — 정답도 점수도 없습니다. */
  choose(prompt, options, cb) {
    this.choiceOpen = true;
    this.hit.setVisible(false);
    this.container.setVisible(false);
    if (this.scene.setInputLocked) this.scene.setInputLocked(true);

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const scrim = this.scene.add.graphics().setScrollFactor(0);
    scrim.fillStyle(0x101a2e, 0.55);
    scrim.fillRect(0, 0, W, H);
    this.choiceGroup.add(scrim);

    const n = options.length;
    const bh = 58, gap = 14;
    const totalH = n * bh + (n - 1) * gap;
    const startY = H - 132 - totalH + bh / 2;

    if (prompt) {
      const p = this.scene.add.text(W / 2, startY - bh / 2 - 40, prompt,
        UI.style(FONT.body, PAL.cream, { align: 'center', wordWrap: { width: W - 70 } })).setOrigin(0.5).setScrollFactor(0);
      this.choiceGroup.add(p);
    }

    options.forEach((opt, i) => {
      const y = startY + i * (bh + gap);
      const b = UI.button(this.scene, W / 2, y + 24, W - 64, bh, opt.label, () => {
        AudioSystem.select();
        this.closeChoices();
        if (cb) cb(opt.key, opt);
      }, { size: FONT.label });
      b.setAlpha(0).setScrollFactor(0);      // 카메라가 움직이는 장면에서도 화면에 고정
      this.choiceGroup.add(b);
      this.scene.tweens.add({ targets: b, alpha: 1, y: y, duration: 260, delay: i * 70, ease: 'Sine.easeOut' });
    });
  }

  closeChoices() {
    this.choiceOpen = false;
    this.choiceGroup.removeAll(true);
    if (this.scene.setInputLocked) this.scene.setInputLocked(false);
  }

  destroy() {
    if (this.timerEvent) this.timerEvent.remove();
    this.container.destroy();
    this.hit.destroy();
    this.choiceGroup.destroy();
  }
};
