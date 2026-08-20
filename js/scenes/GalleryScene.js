/* 보관함 — 모은 말씀과 찍은 사진을 봅니다. */

window.GalleryScene = class GalleryScene extends Phaser.Scene {
  constructor() { super('GalleryScene'); }

  create(data) {
    data = data || {};
    this.from = data.from || null;
    this.tab = data.tab || 'word';
    this.texKeys = [];

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.viewTop = 178;
    this.viewH = H - this.viewTop - 26;

    this.add.graphics().fillStyle(HEX(PAL.night), 1).fillRect(0, 0, W, H);
    const back = this.add.graphics();
    back.fillStyle(0x22314f, 1); back.fillRect(0, 0, W, this.viewTop - 10);

    this.add.text(W / 2, 46, '보관함', UI.style(22, PAL.cream)).setOrigin(0.5);
    UI.circleButton(this, W - 36, 46, 22, '✕', () => this.close(), { size: 18 });

    this.tabWord = UI.button(this, W / 2 - 88, 116, 158, 54, '말씀', () => this.setTab('word'), { size: FONT.label });
    this.tabPhoto = UI.button(this, W / 2 + 88, 116, 158, 54, '사진첩', () => this.setTab('photo'), { size: FONT.label });

    /* 내용이 넘치면 위아래로 끌어서 봅니다 */
    this.content = this.add.container(0, this.viewTop);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, this.viewTop, W, this.viewH);
    this.content.setMask(shape.createGeometryMask());

    this.scrollY = 0; this.maxScroll = 0;
    this.dragging = false; this.moved = 0;

    this.input.on('pointerdown', (p) => {
      if (p.y < this.viewTop || p.y > this.viewTop + this.viewH) return;
      this.dragging = true; this.lastY = p.y; this.moved = 0;
    });
    this.input.on('pointermove', (p) => {
      if (!this.dragging) return;
      const dy = p.y - this.lastY;
      this.lastY = p.y; this.moved += Math.abs(dy);
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy, -this.maxScroll, 0);
      this.content.y = this.viewTop + this.scrollY;
    });
    this.input.on('pointerup', () => { this.dragging = false; });

    this.hintScroll = this.add.text(W / 2, H - 12, '', UI.style(13, '#8fa5c8')).setOrigin(0.5, 1);

    this.setTab(this.tab);
    UI.fadeIn(this, 400);
  }

  setTab(tab) {
    this.tab = tab;
    this.scrollY = 0; this.content.y = this.viewTop;
    this.content.removeAll(true);
    this.texKeys.forEach(k => { if (this.textures.exists(k)) this.textures.remove(k); });
    this.texKeys = [];

    const on = { fill: PAL.sun, strokeAlpha: 0.9 }, off = { fill: PAL.paper };
    this.tabWord.destroy(); this.tabPhoto.destroy();
    const W = GAME.WIDTH;
    this.tabWord = UI.button(this, W / 2 - 88, 116, 158, 54, '말씀', () => this.setTab('word'),
      Object.assign({ size: FONT.label }, tab === 'word' ? on : off));
    this.tabPhoto = UI.button(this, W / 2 + 88, 116, 158, 54, '사진첩', () => this.setTab('photo'),
      Object.assign({ size: FONT.label }, tab === 'photo' ? on : off));

    if (tab === 'word') this.buildWords(); else this.buildPhotos();
  }

  buildWords() {
    const W = GAME.WIDTH;
    let y = 10;
    const owned = Collection.count();
    this.content.add(this.add.text(W / 2, y, '모은 말씀  ' + owned + ' / ' + Collection.total(),
      UI.style(FONT.body, PAL.sun)).setOrigin(0.5, 0));
    y += 44;

    const titles = { 1: 'DAY 1 · 금요일', 2: 'DAY 2 · 토요일', 3: 'DAY 3 · 주일', 99: '카를로의 하루 · 밀라노' };

    COLLECTION.days().forEach((day) => {
      const cards = COLLECTION.byDay(day);
      const got = Collection.countOfDay(day);

      const head = this.add.graphics();
      head.fillStyle(HEX('#22314f'), 1);
      head.fillRoundedRect(16, y, W - 32, 40, 10);
      this.content.add(head);
      this.content.add(this.add.text(30, y + 20, titles[day] || ('DAY ' + day),
        UI.style(FONT.small, PAL.cream)).setOrigin(0, 0.5));
      this.content.add(this.add.text(W - 30, y + 20, got + ' / ' + cards.length,
        UI.style(FONT.small, PAL.sun)).setOrigin(1, 0.5));
      y += 52;

      cards.forEach((card) => {
        const cat = COLLECTION.cats[card.cat];
        const have = Collection.has(card.id);
        /* 글이 몇 줄이 되든 칸이 함께 늘어나도록 먼저 재어 봅니다 */
        const body = have ? this.add.text(W / 2, 0, card.text,
          UI.style(18, PAL.ink, { align: 'center', lineSpacing: 6, wordWrap: { width: W - 76 } })).setOrigin(0.5, 0) : null;
        const h = have ? Math.max(104, body.height + 76) : 62;
        const g = this.add.graphics();
        g.fillStyle(HEX(have ? PAL.paper : '#2b3b60'), have ? 0.97 : 0.5);
        g.fillRoundedRect(16, y, W - 32, h, 14);
        g.lineStyle(2, HEX(cat.color), have ? 0.6 : 0.2);
        g.strokeRoundedRect(16, y, W - 32, h, 14);
        this.content.add(g);

        if (have) {
          this.content.add(this.add.text(30, y + 18, cat.icon + ' ' + cat.name,
            UI.style(12, cat.color)).setOrigin(0, 0.5));
          body.setY(y + 34);
          this.content.add(body);
          this.content.add(this.add.text(W - 34, y + h - 24, '— ' + card.from,
            UI.style(14, PAL.inkSoft)).setOrigin(1, 0.5));
        } else {
          this.content.add(this.add.text(W / 2, y + 18, '아직 만나지 못한 말씀',
            UI.style(FONT.small, '#8fa5c8')).setOrigin(0.5, 0));
          this.content.add(this.add.text(W / 2, y + 40, card.where,
            UI.style(13, '#6f86ad', { align: 'center', wordWrap: { width: W - 80 } })).setOrigin(0.5, 0));
        }
        y += h + 12;
      });
      y += 18;
    });

    this.finishLayout(y);
  }

  buildPhotos() {
    const W = GAME.WIDTH;
    const list = PhotoSystem.list();
    let y = 10;

    this.content.add(this.add.text(W / 2, y, '사진  ' + list.length + ' / ' + PhotoSystem.MAX,
      UI.style(FONT.body, PAL.sun)).setOrigin(0.5, 0));
    y += 42;

    if (list.length === 0) {
      this.content.add(this.add.text(W / 2, y + 40,
        '아직 찍은 사진이 없어요.\n\n걷다가 마음에 드는 곳에서\n오른쪽 아래 사진 버튼을 눌러보세요.',
        UI.style(FONT.body, '#9fb4d6', { align: 'center', lineSpacing: 8 })).setOrigin(0.5, 0));
      this.finishLayout(y + 190);
      return;
    }

    const cols = 3, gap = 10, size = Math.floor((W - 32 - gap * (cols - 1)) / cols);
    list.forEach((p, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = 16 + col * (size + gap);
      const py = y + row * (size + gap);

      const frame = this.add.graphics();
      frame.fillStyle(HEX(PAL.paper), 0.9);
      frame.fillRoundedRect(x, py, size, size, 10);
      this.content.add(frame);

      const key = 'gal_' + p.id;
      this.texKeys.push(key);
      this.textures.once('addtexture-' + key, () => {
        if (!this.scene.isActive()) return;
        const img = this.add.image(x + size / 2, py + size / 2, key);
        const fit = Math.min((size - 8) / img.width, (size - 8) / img.height);
        img.setScale(fit);
        this.content.add(img);
        img.setInteractive({ useHandCursor: true });
        img.on('pointerup', () => { if (this.moved < 10) this.viewPhoto(p, key); });
      });
      this.textures.addBase64(key, p.data);
    });

    const rows = Math.ceil(list.length / cols);
    this.finishLayout(y + rows * (size + gap) + 30);
  }

  finishLayout(contentH) {
    this.maxScroll = Math.max(0, contentH - this.viewH + 20);
    this.hintScroll.setText(this.maxScroll > 0 ? '위아래로 끌어서 더 볼 수 있어요' : '');
  }

  viewPhoto(photo, key) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    AudioSystem.tap();
    const layer = this.add.container(0, 0).setDepth(60);

    const scrim = this.add.graphics();
    scrim.fillStyle(0x0d1524, 0.94); scrim.fillRect(0, 0, W, H);
    scrim.setInteractive(new Phaser.Geom.Rectangle(0, 0, W, H), Phaser.Geom.Rectangle.Contains);
    layer.add(scrim);

    const img = this.add.image(W / 2, H * 0.40, key);
    const fit = Math.min((W - 50) / img.width, (H * 0.48) / img.height);
    img.setScale(fit);
    layer.add(img);

    layer.add(this.add.text(W / 2, H * 0.40 + img.displayHeight / 2 + 26,
      (photo.place ? photo.place + ' · ' : '') + photo.when,
      UI.style(FONT.small, '#cbbfae')).setOrigin(0.5));

    layer.add(UI.button(this, W / 2, H * 0.72, 260, 60, '휴대폰에 저장', () => {
      PhotoSystem.download(photo);
    }, { size: 19, fill: PAL.sun }));

    layer.add(UI.button(this, W / 2 - 84, H * 0.83, 150, 56, '삭제', () => {
      PhotoSystem.remove(photo.id);
      layer.destroy();
      this.setTab('photo');
    }, { size: FONT.small, fill: PAL.cream }));

    layer.add(UI.button(this, W / 2 + 84, H * 0.83, 150, 56, '닫기', () => layer.destroy(), { size: FONT.small }));
  }

  close() {
    AudioSystem.back();
    this.texKeys.forEach(k => { if (this.textures.exists(k)) this.textures.remove(k); });
    const from = this.from;
    this.scene.stop();
    if (from) this.scene.resume(from);
    else this.scene.start('TitleScene');
  }
};
