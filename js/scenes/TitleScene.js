/* 제목 화면 — 새벽 바다를 배경으로 */

window.TitleScene = class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create(data) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.openPicker = !!(data && data.picker);
    this.openArcade = !!(data && data.arcade);
    this.modal = null;
    this.picker = null;            // 다시 열린 화면에 지난번 목록의 흔적이 남지 않게
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
    if (window.Cine) Cine.glitter(this, W / 2, seaY, seaY + H * 0.13, { spread: 80, count: 34, alpha: 0.6 });

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
    /* 제목 — 세 줄이 같은 크기로 읽히되, 이름 줄은 화면에 맞게 줄입니다 */
    this.add.text(W / 2, 122, '오늘,', UI.style(FONT.title, PAL.cream)).setOrigin(0.5).setAlpha(0.96);

    const nameLine = this.add.text(W / 2, 180, '가롤로(카를로) 아쿠티스와',
      UI.style(FONT.title, PAL.cream, { align: 'center' })).setOrigin(0.5);
    let ns = FONT.title;
    while (nameLine.width > W - 34 && ns > 18) {
      ns -= 1;
      nameLine.setStyle(UI.style(ns, PAL.cream, { align: 'center' }));
    }

    this.add.text(W / 2, 228, '함께 걷습니다',
      UI.style(FONT.title, PAL.cream, { align: 'center' })).setOrigin(0.5);
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
    UI.button(this, W / 2 - 70, y, 128, 60, 'DAY 선택', () => this.dayPicker(),
      { size: FONT.label, fill: PAL.cream, alpha: 0.94 });
    UI.button(this, W / 2 + 70, y, 128, 60, '🎮 미니게임', () => this.arcadePicker(),
      { size: FONT.small, fill: PAL.cream, alpha: 0.94 });

    /* 소리 설정 */
    this.bgmBtn = UI.circleButton(this, 44, 48, 24, '♪', () => this.toggle('bgm'), { size: 18 });
    this.sfxBtn = UI.circleButton(this, 108, 48, 24, '🔔', () => this.toggle('sfx'), { size: 17 });
    this.slash = this.add.graphics().setDepth(50);
    /* 주인공 — 지금 고른 얼굴. 누르면 다른 모습으로 바꿀 수 있습니다 */
    if (window.Hero) {
      const hb = UI.circleButton(this, 172, 48, 24, '', () => this.heroPicker(null), { size: 14 });
      const fk = Figure.portrait(this, 'player_front', 64, Hero.current().ring);
      if (fk) hb.add(this.add.image(0, 0, fk).setDisplaySize(44, 44));
      this.add.text(172, 82, '주인공', UI.style(11, PAL.dimWarm)).setOrigin(0.5).setAlpha(0.9);
    }
    /* 언어 — 한국어 / English */
    if (window.I18N) {
      UI.button(this, 238, 48, 62, 48, I18N.lang === 'en' ? 'EN' : 'KO', () => this.languagePicker(),
        { size: 14, alpha: 0.92 });
      this.add.text(238, 82, '언어', UI.style(11, PAL.dimWarm)).setOrigin(0.5).setAlpha(0.9);
    }
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

    /* 오늘이 교회의 시간으로 어떤 날인지 — 게임 밖의 오늘과 이어 줍니다 */
    if (window.Liturgy) this.todayCard();

    UI.fadeIn(this, 900);
    /* 에필로그에서 “다시 걷고 싶은 날 고르기”로 들어오면 바로 목록을 엽니다 */
    if (this.openPicker) this.time.delayedCall(320, () => this.dayPicker());
    else if (this.openArcade) this.time.delayedCall(200, () => this.arcadePicker());
    else this.time.delayedCall(1500, () => this.practiceCheckin());
  }

  /* ── 오늘의 카드 ─────────────────────────────
     전례 시기와 색, 대축일·주일, 오늘의 말씀 한 줄. 누르면 가롤로가 한마디 건넵니다. */
  todayCard() {
    const W = GAME.WIDTH;
    const info = Liturgy.today();
    const word = Liturgy.word();
    const top = 342, cw = W - 52;
    const c = this.add.container(W / 2, top).setDepth(40).setAlpha(0);

    const head = this.add.text(-cw / 2 + 40, 16, info.title,
      UI.style(15, PAL.cream, { wordWrap: { width: cw - 56 } })).setOrigin(0, 0);
    let y = 16 + head.height + 8;
    let body = null, from = null;
    if (word) {
      body = this.add.text(-cw / 2 + 18, y, word.text.replace(/\n/g, ' '),
        UI.style(15, '#f4ead6', { wordWrap: { width: cw - 36 }, lineSpacing: 5 })).setOrigin(0, 0);
      y += body.height + 4;
      from = this.add.text(cw / 2 - 18, y, '— ' + word.from, UI.style(13, PAL.dim)).setOrigin(1, 0);
      y += from.height;
    }
    const h = y + 14;

    const g = this.add.graphics();
    g.fillStyle(0x0b1222, 0.62);
    g.fillRoundedRect(-cw / 2, 0, cw, h, 16);
    g.lineStyle(1.5, HEX(info.color.hex), 0.75);
    g.strokeRoundedRect(-cw / 2, 0, cw, h, 16);
    /* 전례 색 — 작은 원 하나 */
    g.fillStyle(HEX(info.color.hex), 1);
    g.fillCircle(-cw / 2 + 24, 16 + head.height / 2, 7);
    g.lineStyle(1.5, 0xffffff, 0.5);
    g.strokeCircle(-cw / 2 + 24, 16 + head.height / 2, 7);
    c.add([g, head]);
    if (body) c.add([body, from]);

    /* 서울 세계청년대회까지 */
    if (info.wyd) {
      const pill = this.add.text(0, h + 10, info.wyd.text, UI.style(13, PAL.ink, {
        backgroundColor: PAL.sun, padding: { x: 12, y: 5 }
      })).setOrigin(0.5, 0);
      c.add(pill);
    }

    const hit = this.add.zone(W / 2, top + h / 2, cw, h).setInteractive().setDepth(41);
    hit.on('pointerup', () => { if (this.modal) return; AudioSystem.tap(); this.todayDetail(info, word); });
    this.tweens.add({ targets: c, alpha: 1, duration: 900, delay: 700 });
    this.todayBox = c;
  }

  /* 카드를 누르면 — 오늘의 이름, 시기의 뜻, 가롤로의 한마디 */
  todayDetail(info, word) {
    if (this.modal) return;
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(300);
    this.modal = layer;
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x0b1222, 0.7).setInteractive();
    layer.add(dim);
    const pw = W - 40;
    const lines = [];
    const t1 = this.add.text(W / 2, 0, info.dateText, UI.style(15, PAL.inkSoft)).setOrigin(0.5, 0);
    const t2 = this.add.text(W / 2, 0, info.title, UI.style(20, PAL.ink, { align: 'center', wordWrap: { width: pw - 48 } })).setOrigin(0.5, 0);
    const t3 = this.add.text(W / 2, 0, info.seasonName + ' · ' + info.color.name + '\n' + info.seasonLine,
      UI.style(15, PAL.inkSoft, { align: 'center', wordWrap: { width: pw - 48 }, lineSpacing: 6 })).setOrigin(0.5, 0);
    lines.push(t1, t2, t3);
    if (word) {
      lines.push(this.add.text(W / 2, 0, word.text, UI.style(17, PAL.ink, { align: 'center', wordWrap: { width: pw - 48 }, lineSpacing: 7 })).setOrigin(0.5, 0));
      lines.push(this.add.text(W / 2, 0, '— ' + word.from, UI.style(14, PAL.inkSoft)).setOrigin(0.5, 0));
    }
    const say = this.add.text(W / 2, 0, '가롤로 : “' + info.carlo + '”',
      UI.style(16, PAL.clay, { align: 'center', wordWrap: { width: pw - 48 }, lineSpacing: 6 })).setOrigin(0.5, 0);
    lines.push(say);
    if (info.wyd) lines.push(this.add.text(W / 2, 0, info.wyd.text, UI.style(14, PAL.sunDeep)).setOrigin(0.5, 0));

    const gaps = [6, 10, 18, 8, 18, 14, 10];
    let total = 28;
    lines.forEach((t, i) => { total += t.height + (i < lines.length - 1 ? gaps[i] || 10 : 0); });
    total += 28 + 76;
    const top = Math.round(H / 2 - total / 2);
    layer.add(UI.panel(this, W / 2, top + total / 2, pw, total, { radius: 20 }));
    /* 전례 색 띠 */
    const band = this.add.graphics();
    band.fillStyle(HEX(info.color.hex), 1);
    band.fillRoundedRect(W / 2 - pw / 2 + 18, top + 10, pw - 36, 6, 3);
    layer.add(band);
    let y = top + 28;
    lines.forEach((t, i) => { t.y = y; y += t.height + (gaps[i] || 10); layer.add(t); });
    layer.add(UI.button(this, W / 2, top + total - 46, 180, 56, '닫기', () => {
      layer.destroy(); this.modal = null;
    }, { size: FONT.label }));
  }

  /* ── 작은 실천 돌아보기 ─────────────────────────
     노트에서 고른 실천을 다음 날 한 번만 조용히 묻습니다. 못 했어도 실패가 아닙니다. */
  practiceCheckin() {
    const entry = SaveSystem.pendingPractice && SaveSystem.pendingPractice();
    if (!entry || this.modal) return;
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(300).setAlpha(0);
    this.modal = layer;
    layer.add(this.add.rectangle(W / 2, H / 2, W, H, 0x0b1222, 0.72).setInteractive());
    const pw = W - 36;
    /* 내용의 높이를 먼저 재고 판을 그립니다 */
    const q = this.add.text(W / 2, 0, '지난번에 정한 작은 실천, 기억나?',
      UI.style(19, PAL.ink, { align: 'center', wordWrap: { width: pw - 40 } })).setOrigin(0.5, 0);
    const card = this.add.text(W / 2, 0, entry.text.replace(/\n/g, ' '),
      UI.style(17, PAL.ink, { align: 'center', wordWrap: { width: pw - 70 }, lineSpacing: 6,
        backgroundColor: '#f6e6c8', padding: { x: 14, y: 12 } })).setOrigin(0.5, 0);
    const src = this.add.text(W / 2, 0, 'DAY ' + entry.day + ' 노트에서', UI.style(13, PAL.inkSoft)).setOrigin(0.5, 0);
    const head = 126;
    const cardY = head + q.height + 16;
    const srcY = cardY + card.height + 6;
    const by0 = srcY + src.height + 40;               // 첫 단추의 가운데
    const ph = by0 + 2 * 64 + 48;
    const top = Math.round(H / 2 - ph / 2);
    layer.add(UI.panel(this, W / 2, top + ph / 2, pw, ph, { radius: 20 }));
    layer.add(this.add.image(W / 2, top + 52, 'carlo_front').setScale(1.3));
    layer.add(this.add.text(W / 2, top + 98, '가롤로', UI.style(15, PAL.clay)).setOrigin(0.5, 0));
    q.y = top + head; card.y = top + cardY; src.y = top + srcY;
    layer.add([q, card, src]);
    /* 대답한 뒤의 한마디 — 단추가 있던 자리에 나타납니다 */
    const reply = this.add.text(W / 2, top + by0 - 30, '',
      UI.style(18, PAL.clay, { align: 'center', wordWrap: { width: pw - 50 }, lineSpacing: 6 })).setOrigin(0.5, 0);
    layer.add(reply);

    const replies = {
      done: '그랬구나. 대단한 일이 아니어도 돼. 그걸로 충분해.',
      notyet: '괜찮아. 실패한 거 아니야. 다시 생각난 것만으로도 한 걸음이야.',
      today: '좋아. 오늘 하루 안에서 딱 한 번이면 돼. 내일 또 물어볼게.'
    };
    const opts = [
      { key: 'done', label: '해 봤어요' },
      { key: 'today', label: '오늘 해 볼게요' },
      { key: 'notyet', label: '아직이요' }
    ];
    const by = top + by0;
    const btns = [];
    opts.forEach((o, i) => {
      const b = UI.button(this, W / 2, by + i * 64, pw - 70, 56, o.label, () => {
        SaveSystem.answerPractice(entry, o.key);
        AudioSystem.select();
        btns.forEach(x => x.destroy());
        reply.setText(replies[o.key]);
        layer.add(UI.button(this, W / 2, top + ph - 58, 180, 56, '고마워', () => {
          this.tweens.add({ targets: layer, alpha: 0, duration: 300, onComplete: () => { layer.destroy(); this.modal = null; } });
        }, { size: FONT.label, fill: PAL.sun }));
      }, { size: FONT.label, fill: i === 0 ? PAL.sun : PAL.paper });
      btns.push(b);
      layer.add(b);
    });
    this.tweens.add({ targets: layer, alpha: 1, duration: 500 });
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
    /* 처음 걸을 때는 함께 걸을 ‘나’부터 고릅니다 */
    if (window.Hero && !Hero.chosen() && n !== 10) { this.heroPicker(() => this.startDay(n)); return; }
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
    if (window.Interlude) Interlude.resetDay(n);         // 그날의 후반부 게임도 다시 만납니다
    UI.fadeOut(this, 700, () => this.scene.start(entry.scene, entry.data));
  }

  /* ── 언어 고르기 — 바꾸면 제목 화면을 새로 열어 모든 글을 그 언어로 다시 씁니다 ── */
  languagePicker() {
    if (this.picker) return;
    const dlg = new DialogueBox(this);
    this.picker = dlg;
    const opts = I18N.LANGS.map(l => ({ key: l.id, label: (l.id === I18N.lang ? '✓ ' : '') + l.label }));
    dlg.choose('언어 / Language', opts, (k) => {
      dlg.destroy();
      this.picker = null;
      if (k === I18N.lang) return;
      I18N.set(k);
      AudioSystem.select();
      UI.fadeOut(this, 300, () => this.scene.restart());
    });
  }

  /* ── 주인공 고르기 ─────────────────────────────
     가운데에서 고른 모습이 천천히 돌며 걸어 보입니다(앞 → 옆 → 뒤 → 옆).
     after 가 있으면 고른 뒤 바로 걷기 시작합니다. */
  heroPicker(after) {
    if (this.picker) return;
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(200);
    this.picker = layer;
    this.coverBehind(layer);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 1); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 76, '함께 걸을 ‘나’를 골라 주세요', UI.style(22, PAL.cream)).setOrigin(0.5));
    layer.add(this.add.text(W / 2, 130, '이 모습으로 이야기 속을 걸어요\n제목 화면에서 언제든 바꿀 수 있어요',
      UI.style(13, PAL.dim, { align: 'center', lineSpacing: 4 })).setOrigin(0.5).setAlpha(0.95));

    let pick = Hero.current().id;
    HEROES.forEach(h => Hero.preview(this, h.id));

    /* 무대 — 따뜻한 빛과 발밑 그림자 */
    const glow = this.add.image(W / 2, 340, 'lamp_glow').setDisplaySize(330, 330).setTint(0xffd79a).setAlpha(0.22)
      .setBlendMode(Phaser.BlendModes.ADD);
    const shadow = this.add.image(W / 2, 436, 'shadow').setDisplaySize(118, 30).setAlpha(0.55);
    const fig = this.add.image(W / 2, 440, 'hero_' + pick + '_front').setOrigin(0.5, 0.94).setScale(4.2);
    layer.add([glow, shadow, fig]);
    this.tweens.add({ targets: fig, scaleY: 4.28, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    /* 앞 → 옆으로 걷기 → 뒤 → 반대쪽 옆으로 걷기 */
    const seq = [];
    for (let i = 0; i < 5; i++) seq.push(['front', '', false]);
    for (let k = 0; k < 2; k++) [['_walk'], [''], ['_walk2'], ['']].forEach(f => seq.push(['side', f[0], false]));
    for (let i = 0; i < 4; i++) seq.push(['back', '', false]);
    for (let k = 0; k < 2; k++) [['_walk'], [''], ['_walk2'], ['']].forEach(f => seq.push(['side', f[0], true]));
    let step = 0;
    const show = () => {
      const f = seq[step % seq.length];
      const key = 'hero_' + pick + '_' + f[0] + f[1];
      if (this.textures.exists(key)) fig.setTexture(key);
      fig.setFlipX(f[2]);
    };
    const timer = this.time.addEvent({ delay: 180, loop: true, callback: () => { step++; show(); } });
    layer.once('destroy', () => timer.remove());

    const name = this.add.text(W / 2, 486, '', UI.style(26, PAL.cream)).setOrigin(0.5);
    const tag = this.add.text(W / 2, 518, '', UI.style(14, '#cbd8ea')).setOrigin(0.5);
    layer.add([name, tag]);

    /* 얼굴 셋 */
    const chips = HEROES.map((h, i) => {
      const x = W / 2 + (i - 1) * 112, y = 604;
      const c = this.add.container(x, y);
      const ring = this.add.graphics();
      const face = this.add.image(0, 0, 'pt_hero_' + h.id + '_front').setDisplaySize(76, 76);
      const label = this.add.text(0, 56, h.name, UI.style(14, PAL.cream)).setOrigin(0.5);
      c.add([ring, face, label]);
      c.ring = ring; c.hero = h;
      c.setSize(100, 120).setInteractive();
      c.on('pointerup', () => { if (pick !== h.id) { pick = h.id; AudioSystem.tap(); refresh(true); } });
      layer.add(c);
      return c;
    });
    const refresh = (pop) => {
      const h = Hero.byId(pick);
      name.setText(h.name); tag.setText(h.tag);
      chips.forEach((c) => {
        const on = c.hero.id === pick;
        c.ring.clear();
        if (on) {
          c.ring.fillStyle(HEX(c.hero.ring), 0.35); c.ring.fillCircle(0, 0, 50);
          c.ring.lineStyle(3, 0xffe2a8, 1); c.ring.strokeCircle(0, 0, 44);
        }
        this.tweens.add({ targets: c, scale: on ? 1.08 : 0.92, alpha: on ? 1 : 0.7, duration: 180, ease: 'Back.easeOut' });
      });
      step = 0; show();
      if (pop) { fig.setScale(3.6); this.tweens.add({ targets: fig, scaleX: 4.2, duration: 260, ease: 'Back.easeOut' }); }
    };
    refresh(false);

    layer.add(UI.button(this, W / 2, H - 116, 268, 62, after ? '이 모습으로 걷기' : '이 모습으로 할게요', () => {
      Hero.choose(this, pick);
      AudioSystem.select();
      layer.destroy(); this.picker = null;
      if (after) after();
    }, { size: FONT.body }));
    layer.add(UI.button(this, W / 2, H - 46, 140, 46, '닫기', () => {
      layer.destroy(); this.picker = null;
    }, { size: FONT.small, fill: PAL.cream, alpha: 0.9 }));
  }

  /* 목록 화면이 덮고 있는 동안 뒤의 제목 화면은 그리지 않습니다 — 손전화에서 스크롤이 매끄럽도록 */
  coverBehind(layer) {
    const hidden = [];
    this.children.list.forEach((o) => {
      if (o !== layer && o.visible && (o.depth || 0) < layer.depth) { o.setVisible(false); hidden.push(o); }
    });
    layer.once('destroy', () => hidden.forEach(o => { if (o.scene) o.setVisible(true); }));
  }

  /* ── 미니게임 모음 ─────────────────────────────
     이야기 속 미니게임을 언제든 골라 다시 즐깁니다. 이야기의 기록은 바뀌지 않습니다(연습 모드). */
  arcadePicker() {
    if (this.picker) return;
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(200);
    this.picker = layer;
    this.coverBehind(layer);
    const scrim = this.add.graphics();
    scrim.fillStyle(0x0d1528, 1); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    const games = ARCADE.games;
    const played = games.filter(g => GameFX.plays(g.key) > 0).length;
    const starSum = games.reduce((a, g) => a + GameFX.stars(g.key), 0);
    layer.add(this.add.text(W / 2, 58, '미니게임 모음', UI.style(24, PAL.cream)).setOrigin(0.5));
    layer.add(this.add.text(W / 2, 92, '해 본 게임 ' + played + ' / ' + games.length + '   ·   모은 별 ★ ' + starSum,
      UI.style(14, '#cbd8ea')).setOrigin(0.5));

    const top = 120, viewH = H - top - 100;
    const list = this.add.container(0, top);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, top, W, viewH);
    list.setMask(shape.createGeometryMask());
    layer.add(list);

    const rowW = W - 40, rowH = 108;
    const kindColor = { '액션': '#e8705a', '퍼즐': '#3f6f8f', '리듬': '#7a5f8a', '손놀이': '#4f7d6a' };
    let y = 16;
    ARCADE.groups.forEach((grp) => {
      const items = games.filter(g => g.day === grp.day);
      if (!items.length) return;
      list.add(this.add.text(26, y + 8, grp.label, UI.style(14, '#f2c68a')).setOrigin(0, 0));
      y += 40;
      items.forEach((g) => {
        const row = this.add.container(W / 2, y + rowH / 2);
        const bg = this.add.image(0, 0, UI.skin(this, 'btn', rowW, rowH, 20, PAL.paper));
        row.add(bg);
        const tag = this.add.text(-rowW / 2 + 18, -rowH / 2 + 13, g.kind, UI.style(11, '#ffffff', {
          backgroundColor: kindColor[g.kind] || '#8a6340', padding: { x: 7, y: 2 }, shadow: false })).setOrigin(0, 0);
        row.add(tag);
        let tx = -rowW / 2 + 18 + tag.width + 8;
        if (g.late) {
          const nw = this.add.text(tx, -rowH / 2 + 13, 'NEW', UI.style(11, '#ffffff', {
            backgroundColor: '#e8984a', padding: { x: 6, y: 2 }, shadow: false })).setOrigin(0, 0);
          row.add(nw);
        }
        row.add(this.add.text(-rowW / 2 + 18, -rowH / 2 + 38, g.title, UI.style(17, PAL.ink)).setOrigin(0, 0));
        row.add(this.add.text(-rowW / 2 + 18, -rowH / 2 + 68, g.desc, UI.style(12, PAL.inkSoft, {
          wordWrap: { width: rowW - 112 }, lineSpacing: 2 })).setOrigin(0, 0));
        const st = GameFX.stars(g.key), b = GameFX.best(g.key);
        row.add(this.add.text(rowW / 2 - 18, -10, '★'.repeat(st) + '☆'.repeat(3 - st),
          UI.style(16, st ? '#e8a03a' : '#d9cdb8', { shadow: false })).setOrigin(1, 0.5));
        row.add(this.add.text(rowW / 2 - 18, 14, b ? '최고 ' + b : (GameFX.plays(g.key) ? '해 봄' : '▶ 시작'),
          UI.style(12, b ? PAL.sunDeep : PAL.inkSoft)).setOrigin(1, 0.5));

        row.setSize(rowW, rowH);
        row.setInteractive();
        let downAt = null;
        row.on('pointerdown', (p) => { downAt = { x: p.x, y: p.y }; UI.pressFx(this, row, bg, true); AudioSystem.tap(); });
        row.on('pointerout', () => { if (downAt) UI.pressFx(this, row, bg, false); downAt = null; });
        row.on('pointerupoutside', () => { UI.pressFx(this, row, bg, false); downAt = null; });
        row.on('pointerup', (p) => {
          UI.pressFx(this, row, bg, false);
          const was = downAt; downAt = null;
          if (!was || Phaser.Math.Distance.Between(was.x, was.y, p.x, p.y) > TOUCH.slop) return;
          if (Scroller.caught) return;
          AudioSystem.unlock();
          this.picker = null;
          UI.fadeOut(this, 360, () => this.scene.start(g.key, { arcade: true }));
        });
        list.add(row);
        y += rowH + 10;
      });
      y += 8;
    });

    Scroller.create(this, { target: list, top: top, height: viewH, min: top - Math.max(0, y - viewH + 10), max: top, cull: true });

    layer.add(UI.button(this, W / 2, H - 52, 220, 56, '닫기', () => {
      layer.destroy(); this.picker = null;
    }, { size: FONT.label }));
  }

  /* 걸었던 날 다시 고르기 */
  dayPicker() {
    if (this.picker) return;
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(200);
    this.picker = layer;
    this.coverBehind(layer);

    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 1); scrim.fillRect(0, 0, W, H);
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

      /* 부드러운 카드 + 왼쪽의 날짜 동그라미 + 말씀을 모은 만큼 차오르는 가는 막대 */
      const done = !d.bonus && SaveSystem.get('dayCompleted.day' + d.n, false);
      const bg = this.add.image(0, 0, UI.skin(this, 'btn', rowW, rowH, 20, PAL.paper));
      row.add(bg);

      const bx = -rowW / 2 + 36;
      const badge = this.add.graphics();
      if (done) {
        badge.fillStyle(HEX('#e8984a'), 1); badge.fillCircle(bx, 0, 20);
        badge.fillStyle(0xffffff, 0.25); badge.fillCircle(bx - 5, -6, 8);
      } else {
        badge.fillStyle(HEX(d.bonus ? '#efe2f2' : '#f6ead6'), 1); badge.fillCircle(bx, 0, 20);
        badge.lineStyle(1.5, HEX(d.bonus ? '#9d8ac4' : '#d9a25a'), 0.8); badge.strokeCircle(bx, 0, 20);
      }
      row.add(badge);
      row.add(this.add.text(bx, 0, d.bonus ? (d.n === 9 ? '✦' : '♪') : String(d.n),
        UI.style(d.bonus ? 17 : 19, done ? '#ffffff' : (d.bonus ? '#7a5f8a' : PAL.sunDeep), { shadow: false })).setOrigin(0.5));
      if (done) row.add(this.add.text(bx + 15, 14, '✓', UI.style(12, '#3f7d4a', { shadow: false })).setOrigin(0.5));

      const tx = -rowW / 2 + 68;
      row.add(this.add.text(tx, -rowH / 2 + 15, d.label, UI.style(14, d.bonus ? '#7a5f8a' : PAL.sunDeep)).setOrigin(0, 0));
      row.add(this.add.text(tx, -2, d.sub, UI.style(18, PAL.ink, { wordWrap: { width: rowW - 90 } })).setOrigin(0, 0));

      if (d.open && !d.bonus && all > 0) {
        const pw = 54, px = rowW / 2 - 18 - pw, py = -rowH / 2 + 22;
        row.add(this.add.text(rowW / 2 - 18, -rowH / 2 + 10, got + '/' + all, UI.style(12, PAL.inkSoft)).setOrigin(1, 0));
        const bar = this.add.graphics();
        bar.fillStyle(HEX('#eadcc4'), 1); bar.fillRoundedRect(px, py + 8, pw, 4, 2);
        if (got > 0) { bar.fillStyle(HEX('#e8984a'), 1); bar.fillRoundedRect(px, py + 8, Math.max(4, pw * got / all), 4, 2); }
        row.add(bar);
      }

      row.setSize(rowW, rowH + 8);
      row.setInteractive();
      let downAt = null;
      row.on('pointerdown', (p) => { downAt = { x: p.x, y: p.y }; UI.pressFx(this, row, bg, true); AudioSystem.tap(); });
      row.on('pointerout', () => { if (downAt) UI.pressFx(this, row, bg, false); downAt = null; });
      row.on('pointerupoutside', () => { UI.pressFx(this, row, bg, false); downAt = null; });
      row.on('pointerup', (p) => {
        UI.pressFx(this, row, bg, false);
        const was = downAt; downAt = null;
        if (!was || Phaser.Math.Distance.Between(was.x, was.y, p.x, p.y) > TOUCH.slop) return;
        if (Scroller.caught) return;
        if (!d.open) return;
        layer.destroy(); this.picker = null;
        this.startDay(d.n);
      });

      list.add(row);
      y += rowH + 14;
    });

    const max = Math.max(0, y - viewH + 20);
    Scroller.create(this, { target: list, top: top, height: viewH, min: top - max, max: top, cull: true });

    layer.add(UI.button(this, W / 2, H - 56, 220, 58, '닫기', () => {
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
