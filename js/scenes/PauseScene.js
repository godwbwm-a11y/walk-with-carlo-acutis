/* 일시정지 — 소리 설정과 처음 화면으로 */

window.PauseScene = class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene'); }

  create(data) {
    /* 이 화면은 다른 화면 위에 올라옵니다 — 뒤에 가려지지 않게 맨 앞으로 */
    this.scene.bringToTop();
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.from = (data && data.from) || 'TitleScene';

    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.62);
    scrim.fillRect(0, 0, W, H);

    const top = H / 2 - 270;
    UI.panel(this, W / 2, top + 268, W - 40, 536, { fill: PAL.paper });
    this.add.text(W / 2, top + 44, '잠시 쉬어갑니다', UI.style(22, PAL.ink)).setOrigin(0.5);
    this.add.text(W / 2, top + 80, '기록은 자동으로 저장됩니다.', UI.style(FONT.small, PAL.inkSoft)).setOrigin(0.5);

    const bw = W - 92;
    let y = top + 146;
    this.bgmBtn = UI.button(this, W / 2 - bw / 4 - 4, y, bw / 2 - 8, 54, '', () => this.toggle('bgm'), { size: 16 });
    this.sfxBtn = UI.button(this, W / 2 + bw / 4 + 4, y, bw / 2 - 8, 54, '', () => this.toggle('sfx'), { size: 16 });
    y += 66;
    this.speedBtn = UI.button(this, W / 2, y, bw, 54, '', () => this.cycleSpeed(), { size: FONT.label });
    y += 66;
    UI.button(this, W / 2, y, bw, 54, '지난 대화 다시 보기', () => this.showLog(), { size: FONT.label, fill: PAL.cream });
    y += 66;
    UI.button(this, W / 2, y, bw, 54, '보관함', () => {
      this.scene.launch('GalleryScene', { from: 'PauseScene' });
      this.scene.pause();
    }, { size: FONT.label, fill: PAL.cream });
    y += 72;
    UI.button(this, W / 2, y, bw, 58, '계속 걷기', () => this.resume(), { size: FONT.label, fill: PAL.sun });
    y += 68;
    UI.button(this, W / 2, y, 230, 50, '처음 화면으로', () => {
      this.scene.stop(this.from);
      this.scene.stop();
      this.scene.start('TitleScene');
    }, { size: FONT.small, alpha: 0.85 });
    this.refresh();
  }

  cycleSpeed() {
    const list = DialogueBox.SPEEDS;
    const cur = SaveSystem.get('settings.textSpeed', 'normal');
    const i = list.findIndex(x => x.key === cur);
    SaveSystem.set('settings.textSpeed', list[(i + 1) % list.length].key);
    this.refresh();
  }

  /* 지난 대화 — 놓친 말을 위아래로 밀어 다시 읽습니다 */
  showLog() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(100);
    layer.add(this.add.rectangle(W / 2, H / 2, W, H, 0x0b1222, 0.86).setInteractive());
    layer.add(UI.panel(this, W / 2, H / 2 - 30, W - 24, H - 170, { fill: PAL.paper }));
    const top = 50 + 22, bottom = H - 115 - 14;
    layer.add(this.add.text(W / 2, top + 6, '지난 대화', UI.style(20, PAL.ink)).setOrigin(0.5, 0));
    const viewTop = top + 46;
    const list = this.add.container(0, viewTop);
    const hist = DialogueBox.history;
    let y = 0;
    if (!hist.length) {
      list.add(this.add.text(W / 2, 20, '아직 나눈 대화가 없습니다.', UI.style(17, PAL.inkSoft)).setOrigin(0.5, 0));
      y = 60;
    }
    hist.forEach(h => {
      const carlo = h.s === '가롤로' || h.s === '소년';
      const mine = h.s === '나' || h.s === '나의 선택';
      if (h.s) {
        list.add(this.add.text(30, y, h.s, UI.style(14, carlo ? PAL.clay : (mine ? PAL.sea : PAL.inkSoft))));
        y += 22;
      }
      const t = this.add.text(30, y, h.t, UI.style(17, h.s ? PAL.ink : PAL.inkSoft, { wordWrap: { width: W - 84 }, lineSpacing: 6 }));
      list.add(t);
      y += t.height + 16;
    });
    layer.add(list);
    const viewH = bottom - viewTop;
    const mk = this.make.graphics({ add: false });
    mk.fillRect(14, viewTop, W - 28, viewH);
    list.setMask(mk.createGeometryMask());
    /* 맨 아래(가장 최근)부터 보여 줍니다 */
    const minY = Math.min(viewTop, viewTop - (y - viewH));
    list.y = minY;
    Scroller.create(this, { target: list, top: viewTop, height: viewH, min: minY, max: viewTop, parent: layer });
    layer.add(UI.button(this, W / 2, H - 70, 200, 56, '닫기', () => {
      mk.destroy(); layer.destroy();
    }, { size: FONT.label }));
  }

  refresh() {
    const bgm = SaveSystem.get('settings.bgm', true);
    const sfx = SaveSystem.get('settings.sfx', true);
    this.bgmBtn.setLabel('♪ 음악 ' + (bgm ? '켬' : '끔'));
    this.sfxBtn.setLabel('효과음 ' + (sfx ? '켬' : '끔'));
    const sp = DialogueBox.SPEEDS.find(x => x.key === SaveSystem.get('settings.textSpeed', 'normal')) || DialogueBox.SPEEDS[1];
    this.speedBtn.setLabel('글자 속도   ' + sp.name);
    AudioSystem.setBgm(bgm); AudioSystem.setSfx(sfx);
  }

  toggle(kind) {
    SaveSystem.set('settings.' + kind, !SaveSystem.get('settings.' + kind, true));
    this.refresh();
  }

  resume() {
    this.scene.resume(this.from);
    this.scene.stop();
  }
};
