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
    /* 대화는 화면 한가운데에 놓습니다 — 어디를 보고 있어도 눈이 바로 갑니다 */
    const boxW = W - 24;
    const boxH = 276;
    const boxY = Math.round(H * 0.5);

    this.container = scene.add.container(0, 0).setDepth(1000).setScrollFactor(0).setVisible(false);

    /* 뒤가 무엇이든 글이 읽히도록 화면 전체를 살짝 눌러 줍니다 */
    this.scrim = scene.add.graphics();
    this.scrim.fillStyle(0x0d1424, 0.42);
    this.scrim.fillRect(0, 0, W, H);

    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x000000, 0.24);
    this.bg.fillRoundedRect(W / 2 - boxW / 2 + 2, boxY - boxH / 2 + 6, boxW, boxH, 22);
    this.bg.fillStyle(HEX(PAL.paper), 0.99);
    this.bg.fillRoundedRect(W / 2 - boxW / 2, boxY - boxH / 2, boxW, boxH, 22);
    this.bg.lineStyle(3, HEX(PAL.sunDeep), 0.7);
    this.bg.strokeRoundedRect(W / 2 - boxW / 2, boxY - boxH / 2, boxW, boxH, 22);

    this.namePlate = scene.add.graphics();
    this.nameText = scene.add.text(W / 2 - boxW / 2 + 24, boxY - boxH / 2 - 18, '',
      UI.style(FONT.small, PAL.cream)).setOrigin(0, 0.5);

    this.padX = 26;
    this.padY = 26;
    this.viewH = boxH - this.padY * 2;

    /* 글이 길면 상자 안에서 위아래로 밀어 볼 수 있습니다 */
    this.textLayer = scene.add.container(0, 0);
    this.text = scene.add.text(
      W / 2 - boxW / 2 + this.padX, boxY - boxH / 2 + this.padY, '',
      UI.style(FONT.dialogue, PAL.ink, { wordWrap: { width: boxW - this.padX * 2 } })
    );
    this.textLayer.add(this.text);
    /* 잘라내는 틀도 화면에 붙여 둡니다.
       이것을 빼두면 카메라가 따라 움직이는 장면에서 틀만 배경과 함께 밀려나,
       말풍선은 그대로인데 글자만 잘려 사라집니다. */
    const mask = scene.make.graphics({ add: false });
    mask.setScrollFactor(0);
    mask.fillRect(W / 2 - boxW / 2, boxY - boxH / 2 + 8, boxW, boxH - 16);
    this.textLayer.setMask(mask.createGeometryMask());
    this.maskShape = mask;

    this.arrow = scene.add.text(W / 2 + boxW / 2 - 28, boxY + boxH / 2 - 24, '▼',
      UI.style(FONT.tiny, PAL.sunDeep)).setOrigin(0.5);
    scene.tweens.add({ targets: this.arrow, alpha: 0.25, duration: 800, yoyo: true, repeat: -1 });

    this.container.add([this.scrim, this.bg, this.namePlate, this.nameText, this.textLayer, this.arrow]);

    /* 화면 전체 터치로 진행 — 손가락이 크게 밀리면 넘기지 않습니다 */
    this.hit = scene.add.zone(W / 2, H / 2, W, H).setOrigin(0.5)
      .setInteractive().setDepth(999).setScrollFactor(0).setVisible(false);
    this._down = null;
    this.hit.on('pointerdown', (p) => { this._down = { x: p.x, y: p.y, ty: this.text.y }; });
    this.hit.on('pointermove', (p) => {
      if (!this._down || !this.scrollable) return;
      const dy = p.y - this._down.y;
      this.text.y = Phaser.Math.Clamp(this._down.ty + dy, this.minTextY, this.baseTextY);
    });
    this.hit.on('pointerup', (p) => {
      const d = this._down; this._down = null;
      if (!d) return;
      if (Phaser.Math.Distance.Between(d.x, d.y, p.x, p.y) > TOUCH.slop) return;
      this.advance();
    });

    /* PC — 스페이스·엔터로도 넘어갑니다 */
    if (scene.input.keyboard) {
      /* 한 장면에서 상자를 새로 만들면 먼저 쓰던 상자는 조용히 물러납니다.
         남겨 두면 이미 지워진 글자를 만지려다 갱신이 멈춥니다. */
      if (scene.__dlgKeyTick) scene.events.off('update', scene.__dlgKeyTick);

      this._keys = scene.input.keyboard.addKeys('SPACE,ENTER');
      this._keyTick = () => {
        if (!this.container || !this.container.scene) return;   // 이미 지워진 상자
        if (!this.isOpen || this.choiceOpen) { this._keyHeld = false; return; }
        const down = this._keys.SPACE.isDown || this._keys.ENTER.isDown;
        if (down && !this._keyHeld) this.advance();
        this._keyHeld = down;
      };
      scene.events.on('update', this._keyTick);
      scene.__dlgKeyTick = this._keyTick;
      scene.events.once('shutdown', () => {
        scene.events.off('update', this._keyTick);
        if (scene.__dlgKeyTick === this._keyTick) scene.__dlgKeyTick = null;
      });
    }

    this.choiceGroup = scene.add.container(0, 0).setDepth(1010).setScrollFactor(0);
    this.boxY = boxY; this.boxW = boxW; this.boxH = boxH;
    this.baseTextY = boxY - boxH / 2 + this.padY;
    this.minTextY = this.baseTextY;
    this.scrollable = false;
  }

  /* 이 상자가 아직 화면에 살아 있는지 — 장면이 물러가면 글자가 먼저 지워집니다.
     지워진 글자를 만지면 그 자리에서 오류가 나고, 대화가 영영 넘어가지 않습니다. */
  alive() {
    return !!(this.text && this.text.scene && this.nameText && this.nameText.scene
      && this.container && this.container.scene);
  }

  _drawName(name) {
    if (!this.alive()) return;
    this.namePlate.clear();
    if (!name) { this.nameText.setText(''); return; }
    this.nameText.setText(name);
    const w = this.nameText.width + 26;
    const x = GAME.WIDTH / 2 - this.boxW / 2 + 10;
    const y = this.boxY - this.boxH / 2 - 30;
    const color = (name === '가롤로' || name === '소년') ? HEX(PAL.clay) : HEX(PAL.sea);
    this.namePlate.fillStyle(color, 0.95);
    this.namePlate.fillRoundedRect(x, y, w, 30, 15);
    this.nameText.setPosition(x + 13, y + 15);
  }

  /* lines: [{s:'엄마', t:'...'}] 또는 [{t:'서술문'}] */
  play(lines, onDone) {
    if (!this.alive()) { if (onDone) onDone(); return; }   // 이미 지워진 상자
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

  /* 긴 글은 글자를 조금 줄이고, 그래도 넘치면 밀어 볼 수 있게 합니다 */
  _fit() {
    let size = FONT.dialogue;
    this.text.setStyle(UI.style(size, PAL.ink, {
      wordWrap: { width: this.boxW - this.padX * 2 }
    }));
    while (this.text.height > this.viewH && size > 17) {
      size -= 1;
      this.text.setStyle(UI.style(size, PAL.ink, {
        wordWrap: { width: this.boxW - this.padX * 2 }
      }));
    }
    this.text.y = this.baseTextY;
    const over = this.text.height - this.viewH;
    this.scrollable = over > 0;
    this.minTextY = this.scrollable ? this.baseTextY - over - 8 : this.baseTextY;
  }

  _show() {
    /* 상자가 지워졌으면 붙잡지 말고 그대로 마칩니다 */
    if (!this.alive()) { this.isOpen = false; const cb0 = this.onDone; this.onDone = null; if (cb0) cb0(); return; }
    const line = this.lines[this.index];
    this._drawName(line.s || '');
    this.full = (line && line.t != null) ? String(line.t) : '';
    this.text.setText('');
    this.arrow.setVisible(false);
    this.typing = true;

    /* 다 쓴 모습으로 먼저 크기를 잡아 두면 글자가 튀지 않습니다 */
    this.text.setText(this.full);
    this._fit();
    this.text.setText('');

    let i = 0;
    if (this.timerEvent) this.timerEvent.remove();
    this.timerEvent = this.scene.time.addEvent({
      delay: 32,
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
    if (!this.alive()) { this.close(); return; }
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
    if (this.container && this.container.scene) this.container.setVisible(false);
    if (this.hit && this.hit.scene) this.hit.setVisible(false);
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

    /* 선택지도 화면 한가운데에 모읍니다 */
    const n = options.length;
    const bh = 66, gap = 16;
    let promptH = 0;
    let promptText = null;
    if (prompt) {
      promptText = this.scene.add.text(W / 2, 0, prompt,
        UI.style(FONT.body, PAL.cream, { align: 'center', wordWrap: { width: W - 60 } }))
        .setOrigin(0.5).setScrollFactor(0);
      promptH = promptText.height + 30;
    }

    const totalH = promptH + n * bh + (n - 1) * gap;
    let top = Math.round(H / 2 - totalH / 2);
    if (top < 96) top = 96;                    // 선택지가 많아도 위로 넘치지 않게

    if (promptText) {
      promptText.setPosition(W / 2, top + promptText.height / 2);
      this.choiceGroup.add(promptText);
    }

    const startY = top + promptH + bh / 2;
    options.forEach((opt, i) => {
      const y = startY + i * (bh + gap);
      const b = UI.button(this.scene, W / 2, y + 20, W - 56, bh, opt.label, () => {
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
    if (this._keyTick) this.scene.events.off('update', this._keyTick);
    if (this.maskShape) this.maskShape.destroy();
    this.container.destroy();
    this.hit.destroy();
    this.choiceGroup.destroy();
  }
};
