/* 제목 화면 — 새벽 바다를 배경으로 */

window.TitleScene = class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create(data) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.openPicker = !!(data && data.picker);
    this.add.image(W / 2, H / 2, 'sky_night').setDisplaySize(W, H);

    /* 별 */
    for (let i = 0; i < 46; i++) {
      const s = this.add.image(Phaser.Math.Between(8, W - 8), Phaser.Math.Between(20, H * 0.5), 'dot')
        .setScale(Phaser.Math.FloatBetween(0.18, 0.42))
        .setAlpha(Phaser.Math.FloatBetween(0.25, 0.85));
      this.tweens.add({
        targets: s, alpha: 0.15, duration: Phaser.Math.Between(1400, 3200),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000)
      });
    }

    /* 수평선의 새벽빛 */
    const dawn = this.add.image(W / 2, H * 0.50, 'lamp_glow')
      .setDisplaySize(W * 1.7, 200).setTint(0xffc79a).setAlpha(0.45);
    this.tweens.add({ targets: dawn, alpha: 0.7, duration: 5200, yoyo: true, repeat: -1 });

    /* 바다와 모래 */
    const seaY = H * 0.50;
    const sea = this.add.graphics();
    sea.fillStyle(HEX(PAL.seaDeep), 1); sea.fillRect(0, seaY, W, H * 0.13);
    sea.fillStyle(HEX(PAL.sea), 0.75); sea.fillRect(0, seaY, W, 22);
    sea.fillStyle(0xb8a68c, 1); sea.fillRect(0, seaY + H * 0.13, W, H);
    sea.fillStyle(0xc4b299, 0.6); sea.fillRect(0, seaY + H * 0.13, W, 14);

    for (let i = 0; i < 5; i++) {
      const f = this.add.image(Phaser.Math.Between(0, W), seaY + H * 0.13 - Phaser.Math.Between(2, 24), 'seafoam')
        .setAlpha(0.5).setScale(Phaser.Math.FloatBetween(0.7, 1.3));
      this.tweens.add({
        targets: f, x: f.x + Phaser.Math.Between(-30, 30), alpha: 0.15,
        duration: Phaser.Math.Between(2600, 4200), yoyo: true, repeat: -1
      });
    }

    /* 걸어가는 두 사람의 실루엣 */
    const p1 = this.add.image(W * 0.42, 552, 'player_back').setScale(1.3);
    const p2 = this.add.image(W * 0.58, 556, 'carlo_back').setScale(1.3);
    this.tweens.add({ targets: [p1, p2], y: '-=4', duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    /* 제목 — 글자가 커졌으니 줄 간격도 함께 넓힙니다 */
    /* 제목 첫 줄 — 아래 두 줄과 같은 크기로 읽히도록 */
    this.add.text(W / 2, 126, '오늘,', UI.style(FONT.title, PAL.cream)).setOrigin(0.5).setAlpha(0.96);
    this.add.text(W / 2, 200, '카를로 아쿠티스와\n함께 걷습니다',
      UI.style(FONT.title, PAL.cream, { align: 'center', lineSpacing: 12 })).setOrigin(0.5);
    this.add.text(W / 2, 300, GAME.CORE_LINE,
      UI.style(FONT.small, PAL.dimWarm, { align: 'center', lineSpacing: 7 }))
      .setOrigin(0.5).setAlpha(0.95);

    /* 버튼 */
    const cp = SaveSystem.get('checkpoint', null);
    const day1 = SaveSystem.get('dayCompleted.day1', false);
    const day2 = SaveSystem.get('dayCompleted.day2', false);
    const day3 = SaveSystem.get('dayCompleted.day3', false);
    const day4 = SaveSystem.get('dayCompleted.day4', false);
    const day5 = SaveSystem.get('dayCompleted.day5', false);
    const day6 = SaveSystem.get('dayCompleted.day6', false);
    const day7 = SaveSystem.get('dayCompleted.day7', false);
    const day8 = SaveSystem.get('dayCompleted.day8', false);
    const epi = SaveSystem.get('dayCompleted.epilogue', false);
    /* 해변에 앉은 두 사람이 가려지지 않도록 단추를 푸터 쪽으로 내립니다 */
    let y = 666;

    if (cp && cp.scene) {
      UI.button(this, W / 2, y, 268, 66, '이어서 걷기', () => this.continueGame(), { size: FONT.body });
    } else if (day1 && !day2) {
      UI.button(this, W / 2, y, 268, 66, 'DAY 2 걷기', () => this.startDay(2), { size: FONT.body });
    } else if (day2 && !day3) {
      UI.button(this, W / 2, y, 268, 66, 'DAY 3 걷기', () => this.startDay(3), { size: FONT.body });
    } else if (day3 && !day4) {
      UI.button(this, W / 2, y, 268, 66, 'DAY 4 걷기', () => this.startDay(4), { size: FONT.body });
    } else if (day4 && !day5) {
      UI.button(this, W / 2, y, 268, 66, 'DAY 5 걷기', () => this.startDay(5), { size: FONT.body });
    } else if (day5 && !day6) {
      UI.button(this, W / 2, y, 268, 66, 'DAY 6 걷기', () => this.startDay(6), { size: FONT.body });
    } else if (day6 && !day7) {
      UI.button(this, W / 2, y, 268, 66, 'DAY 7 걷기', () => this.startDay(7), { size: FONT.body });
    } else if (day7 && !day8) {
      UI.button(this, W / 2, y, 268, 66, 'DAY 8 걷기', () => this.startDay(8), { size: FONT.body });
    } else if (day8 && !epi) {
      UI.button(this, W / 2, y, 268, 66, '에필로그 열기', () => this.startDay(9), { size: FONT.body });
    } else if (!day1) {
      UI.button(this, W / 2, y, 268, 66, '걷기 시작하기', () => this.startDay(1), { size: FONT.body });
    } else {
      UI.button(this, W / 2, y, 268, 66, '다시 걷기', () => this.dayPicker(), { size: FONT.body });
    }

    y += 80;
    UI.button(this, W / 2, y, 268, 60, 'DAY 선택', () => this.dayPicker(),
      { size: FONT.label, fill: PAL.cream, alpha: 0.94 });

    /* 소리 설정 */
    this.bgmBtn = UI.circleButton(this, 44, 48, 24, '♪', () => this.toggle('bgm'), { size: 18 });
    this.sfxBtn = UI.circleButton(this, 108, 48, 24, '🔔', () => this.toggle('sfx'), { size: 17 });
    this.slash = this.add.graphics().setDepth(50);
    UI.button(this, W - 66, 48, 104, 48, '보관함', () => {
      this.scene.launch('GalleryScene', { from: 'TitleScene' });
      this.scene.pause();
    }, { size: FONT.small, alpha: 0.92 });
    this.refreshSound();

    UI.footer(this);

    /* 첫 터치에 소리 시작 */
    this.input.once('pointerdown', () => {
      AudioSystem.unlock();
      AudioSystem.setAmbience('beach');
      AudioSystem.startPad();
    });

    UI.fadeIn(this, 900);
    /* 에필로그에서 “다시 걷고 싶은 날 고르기”로 들어오면 바로 목록을 엽니다 */
    if (this.openPicker) this.time.delayedCall(320, () => this.dayPicker());
  }

  refreshSound() {
    const bgm = SaveSystem.get('settings.bgm', true);
    const sfx = SaveSystem.get('settings.sfx', true);
    this.bgmBtn.list[1].setAlpha(bgm ? 1 : 0.35);
    this.sfxBtn.list[1].setAlpha(sfx ? 1 : 0.35);

    /* 꺼진 상태는 빗금으로 분명히 보여줍니다 */
    this.slash.clear();
    this.slash.lineStyle(3, HEX(PAL.clay), 0.85);
    if (!bgm) this.slash.lineBetween(30, 62, 58, 34);
    if (!sfx) this.slash.lineBetween(94, 62, 122, 34);

    AudioSystem.setBgm(bgm); AudioSystem.setSfx(sfx);
  }

  toggle(kind) {
    const v = !SaveSystem.get('settings.' + kind, true);
    SaveSystem.set('settings.' + kind, v);
    this.refreshSound();
  }

  startNew() { this.startDay(1); }

  /* DAY 별 시작 지점 */
  startDay(n) {
    AudioSystem.unlock();
    if (n === 10) {                       /* 엔딩 크레딧은 저장하지 않고 바로 봅니다 */
      UI.fadeOut(this, 600, () => this.scene.start('EpCreditsScene', { from: 'TitleScene' }));
      return;
    }
    const entry = n === 9 ? { scene: 'EpIntroScene', data: {} }
      : n === 8 ? { scene: 'Day8MorningScene', data: {} }
      : n === 7 ? { scene: 'Day7RoomScene', data: {} }
      : n === 6 ? { scene: 'Day6IntroScene', data: {} }
      : n === 5 ? { scene: 'Day5SubwayScene', data: {} }
      : n === 4 ? { scene: 'Day4RoomScene', data: {} }
      : n === 3 ? { scene: 'Day3RoomScene', data: {} }
      : n === 2 ? { scene: 'Day2RoomScene', data: {} }
      : { scene: 'HomeScene', data: { intro: true } };
    SaveSystem.checkpoint(entry.scene, entry.data);
    UI.fadeOut(this, 700, () => this.scene.start(entry.scene, entry.data));
  }

  /* 걸었던 날 다시 고르기 */
  dayPicker() {
    if (this.picker) return;
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(200);
    this.picker = layer;

    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.97); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    layer.add(this.add.text(W / 2, 74, '어느 날을 걸을까요?',
      UI.style(FONT.body, PAL.cream)).setOrigin(0.5));
    layer.add(this.add.text(W / 2, 108, '위아래로 넘겨보세요',
      UI.style(FONT.tiny, PAL.dim)).setOrigin(0.5).setAlpha(0.9));

    /* 어느 날이든 바로 고를 수 있습니다 — 순서대로 걷지 않아도 됩니다 */
    const days = [
      { n: 1, label: 'DAY 1 · 금요일', sub: '“성당에 꼭 가야 해?”', open: true },
      { n: 2, label: 'DAY 2 · 토요일', sub: '“나 말고, 하느님.”', open: true },
      { n: 3, label: 'DAY 3 · 주일', sub: '“예수님 곁에 머물기”', open: true },
      { n: 4, label: 'DAY 4 · 월요일', sub: '“나는 복사본이 아니다.”', open: true },
      { n: 5, label: 'DAY 5 · 화요일', sub: '“용기를 내어라.”', open: true },
      { n: 6, label: 'DAY 6 · 수요일', sub: '“이제 너희가 가라.”', open: true },
      { n: 7, label: 'DAY 7 · 목요일', sub: '“내가 받은 것을 나눈다.”', open: true },
      { n: 8, label: 'DAY 8 · 금요일', sub: '“이제 내가 걷는다.”', open: true },
      { n: 9, label: EPI.gate.label, sub: EPI.gate.sub, open: true, bonus: true },
      { n: 10, label: '엔딩 크레딧', sub: '“다음에는 당신이 만들어보세요.”', open: true, bonus: true }
    ];

    /* 아홉 줄에 글자가 커져 한 화면에 다 들어가지 않습니다 — 밀어서 봅니다 */
    const top = 136, viewH = H - top - 108;
    const list = this.add.container(0, top);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, top, W, viewH);
    list.setMask(shape.createGeometryMask());
    layer.add(list);

    /* 줄마다 제목·부제·말씀 수를 따로 그려 글이 잘리지 않게 합니다 */
    let y = 46;
    const rowW = W - 52, rowH = 84;
    days.forEach((d) => {
      const got = Collection.countOfDay(d.n);
      const all = COLLECTION.byDay(d.n).length;
      const row = this.add.container(W / 2, y);

      const g = this.add.graphics();
      const draw = (pressed) => {
        g.clear();
        if (!pressed) { g.fillStyle(0x000000, 0.15); g.fillRoundedRect(-rowW / 2, -rowH / 2 + 4, rowW, rowH, 16); }
        g.fillStyle(HEX(d.open ? PAL.paper : PAL.wallShade), d.open ? 1 : 0.55);
        g.fillRoundedRect(-rowW / 2, -rowH / 2 + (pressed ? 2 : 0), rowW, rowH, 16);
        g.lineStyle(2, HEX(PAL.sunDeep), d.open ? 0.6 : 0.28);
        g.strokeRoundedRect(-rowW / 2, -rowH / 2 + (pressed ? 2 : 0), rowW, rowH, 16);
      };
      draw(false);
      row.add(g);

      row.add(this.add.text(-rowW / 2 + 20, -rowH / 2 + 14, d.label,
        UI.style(FONT.small, d.open ? PAL.sunDeep : PAL.inkSoft)).setOrigin(0, 0));

      const sub = d.open ? d.sub : '🔒 ' + (d.need || '') + ' 을 마치면 열립니다';
      row.add(this.add.text(-rowW / 2 + 20, 4, sub,
        UI.style(d.open ? FONT.body : FONT.small, d.open ? PAL.ink : PAL.inkSoft, {
          wordWrap: { width: rowW - 40 }
        })).setOrigin(0, 0).setAlpha(d.open ? 1 : 0.85));

      if (d.open && !d.bonus) {
        row.add(this.add.text(rowW / 2 - 18, -rowH / 2 + 15, '말씀 ' + got + '/' + all,
          UI.style(FONT.tiny, PAL.inkSoft)).setOrigin(1, 0).setAlpha(0.85));
      }

      row.setSize(rowW, rowH + 8);
      row.setInteractive();
      let downAt = null;
      row.on('pointerdown', (p) => { downAt = { x: p.x, y: p.y }; draw(true); AudioSystem.tap(); });
      row.on('pointerout', () => { draw(false); downAt = null; });
      row.on('pointerupoutside', () => { draw(false); downAt = null; });
      row.on('pointerup', (p) => {
        draw(false);
        const was = downAt; downAt = null;
        if (!was || Phaser.Math.Distance.Between(was.x, was.y, p.x, p.y) > TOUCH.slop) return;
        if (!d.open) return;
        layer.destroy(); this.picker = null;
        this.startDay(d.n);
      });

      list.add(row);
      y += rowH + 14;
    });

    const max = Math.max(0, y - viewH + 20);
    let lastY;
    const move = (p) => {
      if (!p.isDown || !this.picker) return;
      if (p.y < top || p.y > top + viewH) return;
      const dy = p.y - (lastY === undefined ? p.y : lastY);
      lastY = p.y;
      list.y = Phaser.Math.Clamp(list.y + dy, top - max, top);
    };
    this.input.on('pointermove', move);
    this.input.on('pointerup', () => { lastY = undefined; });

    layer.add(UI.button(this, W / 2, H - 56, 220, 58, '닫기', () => {
      this.input.off('pointermove', move);
      layer.destroy(); this.picker = null;
    }, { size: FONT.label, alpha: 0.95 }));
  }

  continueGame() {
    AudioSystem.unlock();
    const cp = SaveSystem.get('checkpoint', null);
    const scene = (cp && cp.scene) ? cp.scene : 'HomeScene';
    UI.fadeOut(this, 700, () => this.scene.start(scene, cp || {}));
  }

  confirmRestart() {
    const dlg = new DialogueBox(this);
    dlg.choose('처음부터 다시 걸을까요?\n지금까지의 기록은 지워집니다.', [
      { key: 'no', label: '아니요, 이어서 걸을래요' },
      { key: 'yes', label: '네, 처음부터 걷습니다' }
    ], (k) => {
      dlg.destroy();
      if (k === 'yes') { SaveSystem.reset(); this.startDay(1); }
    });
  }
};
