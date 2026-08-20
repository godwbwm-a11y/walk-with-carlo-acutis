/* 사진 찍기 — 프레임을 움직이고 크기를 바꾼 뒤 찍습니다. */

window.PhotoMode = class PhotoMode extends Phaser.Scene {
  constructor() { super('PhotoMode'); }

  create(data) {
    data = data || {};
    this.from = data.from;
    this.place = data.place || '';
    this.shot = null;
    /* 이 장면은 다시 열릴 때 같은 객체를 재사용하므로 지난 흔적을 지웁니다 */
    this.moveZone = null; this.handle = null; this.handleIcon = null;
    this.preview = null; this.previewKey = null; this.busy = false;

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.minW = 150; this.minH = 130;
    this.maxW = W - 30; this.maxH = 430;
    this.topLimit = 84; this.bottomLimit = H - 214;

    this.frame = new Phaser.Geom.Rectangle(W / 2 - 150, 210, 300, 230);

    this.mask = this.add.graphics().setDepth(10);
    this.border = this.add.graphics().setDepth(11);
    this.redraw();

    /* 프레임 안쪽을 끌어 위치 이동 */
    this.moveZone = this.add.zone(0, 0, 10, 10).setOrigin(0).setInteractive({ draggable: true }).setDepth(12);
    this.moveZone.on('drag', (p, dx, dy) => {
      this.frame.x = Phaser.Math.Clamp(dx, 12, W - this.frame.width - 12);
      this.frame.y = Phaser.Math.Clamp(dy, this.topLimit, this.bottomLimit - this.frame.height);
      this.redraw();
    });

    /* 오른쪽 아래 손잡이로 크기 조절 */
    this.handle = this.add.circle(0, 0, 30, HEX(PAL.cream), 0.96).setDepth(13)
      .setStrokeStyle(3, HEX(PAL.sunDeep), 0.9).setInteractive({ draggable: true });
    this.handleIcon = this.add.text(0, 0, '⤡', UI.style(22, PAL.sunDeep)).setOrigin(0.5).setDepth(14);
    this.tweens.add({ targets: this.handle, scale: 1.12, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.handle.on('drag', (p, dx, dy) => {
      const w = Phaser.Math.Clamp(dx - this.frame.x, this.minW, Math.min(this.maxW, W - 12 - this.frame.x));
      const h = Phaser.Math.Clamp(dy - this.frame.y, this.minH, Math.min(this.maxH, this.bottomLimit - this.frame.y));
      this.frame.width = w; this.frame.height = h;
      this.handle.setScale(1);
      this.redraw();
    });

    /* 프레임에 맞춰 드래그 영역과 손잡이를 자리잡게 합니다 */
    this.redraw();

    this.title = this.add.text(W / 2, 48, '사진 찍기', UI.style(21, PAL.cream)).setOrigin(0.5).setDepth(15);
    this.hint = this.add.text(W / 2, H - 190, '프레임을 끌어 옮기고, 모서리를 잡아 크기를 바꿔보세요.',
      UI.style(FONT.small, '#e2d6c2', { align: 'center', wordWrap: { width: W - 60 } }))
      .setOrigin(0.5).setDepth(15).setAlpha(0.9);

    this.shootBtn = UI.circleButton(this, W / 2, H - 116, 42, '●', () => this.take(), { size: 26, color: PAL.clay });
    this.shootBtn.setDepth(15);
    this.closeBtn = UI.button(this, W / 2 - 128, H - 116, 96, 56, '닫기', () => this.close(), { size: FONT.small });
    this.closeBtn.setDepth(15);
    this.albumBtn = UI.button(this, W / 2 + 128, H - 116, 96, 56, '사진첩', () => this.openGallery(), { size: FONT.small });
    this.albumBtn.setDepth(15);

    this.countText = this.add.text(W / 2, H - 56, '', UI.style(14, '#cbbfae')).setOrigin(0.5).setDepth(15);
    this.updateCount();
  }

  updateCount() {
    this.countText.setText('사진첩 ' + PhotoSystem.count() + ' / ' + PhotoSystem.MAX +
      (PhotoSystem.isFull() ? '  (가득 차면 오래된 사진부터 비워집니다)' : ''));
  }

  redraw() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, f = this.frame;
    this.mask.clear();
    this.mask.fillStyle(0x0d1524, 0.72);
    this.mask.fillRect(0, 0, W, f.y);
    this.mask.fillRect(0, f.y + f.height, W, H - f.y - f.height);
    this.mask.fillRect(0, f.y, f.x, f.height);
    this.mask.fillRect(f.x + f.width, f.y, W - f.x - f.width, f.height);

    const b = this.border;
    b.clear();
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

    if (this.moveZone && this.moveZone.input) {
      this.moveZone.setPosition(f.x, f.y).setSize(f.width, f.height);
      this.moveZone.input.hitArea.setSize(f.width, f.height);
    }
    if (this.handle && this.handleIcon) {
      this.handle.setPosition(f.x + f.width, f.y + f.height);
      this.handleIcon.setPosition(f.x + f.width, f.y + f.height);
    }
  }

  setUI(on) {
    [this.mask, this.border, this.handle, this.handleIcon, this.title, this.hint,
     this.shootBtn, this.closeBtn, this.albumBtn, this.countText].forEach(o => { if (o) o.setVisible(on); });
    if (this.moveZone) this.moveZone.setVisible(on);
  }

  take() {
    if (this.busy) return;
    this.busy = true;
    AudioSystem.select();
    this.setUI(false);

    /* 한 프레임 뒤에 찍어야 UI가 지워진 화면이 담깁니다 */
    this.time.delayedCall(60, () => {
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
        layer.add(this.add.text(W / 2, H * 0.63, '저장 공간이 부족해 사진첩에는 담지 못했어요.\n휴대폰에 저장해 주세요.',
          UI.style(FONT.small, PAL.clay, { align: 'center' })).setOrigin(0.5));
      } else if (res && res.removed > 0) {
        layer.add(this.add.text(W / 2, H * 0.63, '사진첩이 가득 차서 가장 오래된 사진 ' + res.removed + '장을 비웠어요.',
          UI.style(14, '#cbbfae', { align: 'center', wordWrap: { width: W - 70 } })).setOrigin(0.5));
      }

      const save = UI.button(this, W / 2, H * 0.70, 260, 60, '휴대폰에 저장', () => {
        PhotoSystem.download(photo);
        save.setLabel('저장했어요');
        note.setAlpha(1);
      }, { size: 19, fill: PAL.sun });
      layer.add(save);

      const note = this.add.text(W / 2, H * 0.755, '저장이 안 되면 사진을 길게 눌러 저장하세요.',
        UI.style(14, '#cbbfae', { align: 'center' })).setOrigin(0.5).setAlpha(0.55);
      layer.add(note);

      const again = UI.button(this, W / 2 - 84, H * 0.83, 150, 56, '다시 찍기', () => this.closePreview(), { size: FONT.small });
      const done = UI.button(this, W / 2 + 84, H * 0.83, 150, 56, '돌아가기', () => { this.closePreview(); this.close(); }, { size: FONT.small });
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

  close() {
    if (this.previewKey && this.textures.exists(this.previewKey)) this.textures.remove(this.previewKey);
    AudioSystem.back();
    this.scene.stop();
    if (this.from) this.scene.resume(this.from);
  }
};
