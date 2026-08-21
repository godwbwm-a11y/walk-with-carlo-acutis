/* 제목 화면 — 새벽 바다를 배경으로 */

window.TitleScene = class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
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
    const p1 = this.add.image(W * 0.42, 596, 'player_back').setScale(1.2);
    const p2 = this.add.image(W * 0.58, 600, 'carlo_back').setScale(1.2);
    this.tweens.add({ targets: [p1, p2], y: '-=4', duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    /* 제목 */
    this.add.text(W / 2, H * 0.17, '오늘,', UI.style(24, PAL.cream)).setOrigin(0.5).setAlpha(0.92);
    this.add.text(W / 2, H * 0.235, '카를로 아쿠티스와\n함께 걷습니다',
      UI.style(FONT.title, PAL.cream, { align: 'center' })).setOrigin(0.5);
    this.add.text(W / 2, H * 0.345, GAME.CORE_LINE,
      UI.style(FONT.small, '#e6d9c4', { align: 'center' })).setOrigin(0.5).setAlpha(0.9);

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
    let y = 668;

    if (cp && cp.scene) {
      UI.button(this, W / 2, y, 250, 60, '이어서 걷기', () => this.continueGame(), { size: 19 });
    } else if (day1 && !day2) {
      UI.button(this, W / 2, y, 250, 60, 'DAY 2 걷기', () => this.startDay(2), { size: 19 });
    } else if (day2 && !day3) {
      UI.button(this, W / 2, y, 250, 60, 'DAY 3 걷기', () => this.startDay(3), { size: 19 });
    } else if (day3 && !day4) {
      UI.button(this, W / 2, y, 250, 60, 'DAY 4 걷기', () => this.startDay(4), { size: 19 });
    } else if (day4 && !day5) {
      UI.button(this, W / 2, y, 250, 60, 'DAY 5 걷기', () => this.startDay(5), { size: 19 });
    } else if (day5 && !day6) {
      UI.button(this, W / 2, y, 250, 60, 'DAY 6 걷기', () => this.startDay(6), { size: 19 });
    } else if (day6 && !day7) {
      UI.button(this, W / 2, y, 250, 60, 'DAY 7 걷기', () => this.startDay(7), { size: 19 });
    } else if (day7 && !day8) {
      UI.button(this, W / 2, y, 250, 60, 'DAY 8 걷기', () => this.startDay(8), { size: 19 });
    } else if (day8 && !epi) {
      UI.button(this, W / 2, y, 250, 60, '에필로그 열기', () => this.startDay(9), { size: 19 });
    } else if (!day1) {
      UI.button(this, W / 2, y, 250, 60, '걷기 시작하기', () => this.startDay(1), { size: 19 });
    } else {
      UI.button(this, W / 2, y, 250, 60, '다시 걷기', () => this.dayPicker(), { size: 19 });
    }

    y += 74;
    UI.button(this, W / 2, y, 250, 56, 'DAY 선택', () => this.dayPicker(),
      { size: FONT.small, fill: PAL.cream, alpha: 0.92 });

    /* 소리 설정 */
    this.bgmBtn = UI.circleButton(this, 44, 48, 24, '♪', () => this.toggle('bgm'), { size: 18 });
    this.sfxBtn = UI.circleButton(this, 108, 48, 24, '🔔', () => this.toggle('sfx'), { size: 17 });
    this.slash = this.add.graphics().setDepth(50);
    UI.button(this, W - 66, 48, 104, 48, '보관함', () => {
      this.scene.launch('GalleryScene', { from: 'TitleScene' });
      this.scene.pause();
    }, { size: FONT.small, alpha: 0.92 });
    this.refreshSound();

    this.add.text(W / 2, H - 34, 'DAY 1 – DAY 8 · EPILOGUE',
      UI.style(14, PAL.inkSoft)).setOrigin(0.5).setAlpha(0.9);

    /* 첫 터치에 소리 시작 */
    this.input.once('pointerdown', () => {
      AudioSystem.unlock();
      AudioSystem.setAmbience('beach');
      AudioSystem.startPad();
    });

    UI.fadeIn(this, 900);
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

    layer.add(this.add.text(W / 2, 96, '어느 날을 걸을까요?',
      UI.style(21, PAL.cream)).setOrigin(0.5));

    const day1 = SaveSystem.get('dayCompleted.day1', false);
    const day2 = SaveSystem.get('dayCompleted.day2', false);
    const day3 = SaveSystem.get('dayCompleted.day3', false);
    const day4 = SaveSystem.get('dayCompleted.day4', false);
    const day5done = SaveSystem.get('dayCompleted.day5', false);
    const day6done = SaveSystem.get('dayCompleted.day6', false);
    const day7done = SaveSystem.get('dayCompleted.day7', false);
    const day8done = SaveSystem.get('dayCompleted.day8', false);
    const days = [
      { n: 1, label: 'DAY 1 · 금요일', sub: '“성당에 꼭 가야 해?”', open: true, need: '' },
      { n: 2, label: 'DAY 2 · 토요일', sub: '“나 말고, 하느님.”', open: day1, need: 'DAY 1' },
      { n: 3, label: 'DAY 3 · 주일', sub: '“예수님 곁에 머물기”', open: day2, need: 'DAY 2' },
      { n: 4, label: 'DAY 4 · 월요일', sub: '“나는 복사본이 아니다.”', open: day3, need: 'DAY 3' },
      { n: 5, label: 'DAY 5 · 화요일', sub: '“용기를 내어라.”', open: day4, need: 'DAY 4' },
      { n: 6, label: 'DAY 6 · 수요일', sub: '“이제 너희가 가라.”', open: day5done, need: 'DAY 5' },
      { n: 7, label: 'DAY 7 · 목요일', sub: '“내가 받은 것을 나눈다.”', open: day6done, need: 'DAY 6' },
      { n: 8, label: 'DAY 8 · 금요일', sub: '“이제 내가 걷는다.”', open: day7done, need: 'DAY 7' },
      { n: 9, label: EPI.gate.label, sub: EPI.gate.sub, open: day8done, need: 'DAY 8', bonus: true }
    ];

    let y = 138;
    days.forEach((d) => {
      const got = Collection.countOfDay(d.n);
      const all = COLLECTION.byDay(d.n).length;
      const label = !d.open
        ? d.label + '\n🔒 ' + d.need + ' 을 마치면 열립니다'
        : d.bonus
          ? d.label + '\n' + d.sub                 /* 에필로그는 말씀을 세지 않습니다 */
          : d.label + '\n' + d.sub + '   (말씀 ' + got + '/' + all + ')';
      const b = UI.button(this, W / 2, y, W - 70, 58, label, () => {
        if (!d.open) return;
        layer.destroy(); this.picker = null;
        this.startDay(d.n);
      }, { size: FONT.small, fill: d.open ? PAL.paper : PAL.cream, alpha: d.open ? 1 : 0.6 });
      layer.add(b);
      y += 66;
    });

    layer.add(UI.button(this, W / 2, y + 6, 200, 52, '닫기', () => {
      layer.destroy(); this.picker = null;
    }, { size: FONT.small, alpha: 0.9 }));
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
