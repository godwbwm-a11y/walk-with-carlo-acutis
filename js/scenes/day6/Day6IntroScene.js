/* DAY 6 · WYD 의 며칠, 그리고 마지막 밤이 온다 */

window.Day6IntroScene = class Day6IntroScene extends Phaser.Scene {
  constructor() { super('Day6IntroScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day6IntroScene', {});
    AudioSystem.unlock();
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#0d1524');

    this.index = 0;
    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1400, [8, 10, 18]);

    this.placeText = this.add.text(W / 2, 150, '', UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(60).setAlpha(0);

    UI.caption(this, DAY06.intro, {
      y: H * 0.36, hold: 1300,
      onDone: () => this.nextMemory()
    });
  }

  /* 사진처럼 짧은 장면들 */
  nextMemory() {
    if (this.index >= DAY06.memories.length) { this.toAlbum(); return; }
    const m = DAY06.memories[this.index];
    this.index++;

    if (this.art) { this.art.destroy(); this.art = null; }
    this.art = this.drawMemory(this.index - 1);
    this.art.setAlpha(0);
    this.placeText.setText(m.place).setAlpha(0);
    this.tweens.add({ targets: [this.art, this.placeText], alpha: 1, duration: 700 });

    this.time.delayedCall(700, () => {
      this.dialogue.play(m.lines, () => {
        AudioSystem.blip();
        const shot = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT * 0.72, DAY06.shutter,
          UI.style(FONT.small, PAL.cream)).setOrigin(0.5).setDepth(70).setAlpha(0);
        this.tweens.add({ targets: shot, alpha: 1, duration: 240, yoyo: true, hold: 300,
          onComplete: () => shot.destroy() });
        this.tweens.add({
          targets: [this.art, this.placeText], alpha: 0, duration: 600, delay: 500,
          onComplete: () => this.nextMemory()
        });
      });
    });
  }

  /* 장면마다 간단한 그림 하나 */
  drawMemory(i) {
    const W = GAME.WIDTH, cy = 360;
    const c = this.add.container(0, 0).setDepth(30);

    if (i === 0) {                                  /* 지하철 */
      c.add(this.add.image(W / 2, cy - 40, 'subway_car').setScale(1.0));
      c.add(this.add.image(120, cy + 120, 'player_front').setScale(1.6));
      c.add(this.add.image(260, cy + 120, 'pilgrim_e').setScale(1.6));
    } else if (i === 1) {                           /* 청년축제 */
      c.add(this.add.image(W / 2, cy - 60, 'stage_festival').setScale(1.0));
      c.add(this.add.image(150, cy + 110, 'child_front').setScale(1.7));
      c.add(this.add.image(250, cy + 118, 'player_front').setScale(1.6));
    } else if (i === 2) {                           /* 묵주기도 */
      c.add(this.add.image(W / 2, cy - 30, 'candle_small').setScale(2.6));
      c.add(this.add.image(140, cy + 110, 'pilgrim_a').setScale(1.6));
      c.add(this.add.image(240, cy + 110, 'player_front').setScale(1.6));
    } else if (i === 3) {                           /* 친구 소개 */
      ['pilgrim_c', 'player_front', 'pilgrim_b', 'pilgrim_d'].forEach((k, n) => {
        c.add(this.add.image(70 + n * 84, cy + 40, k).setScale(1.6));
      });
    } else if (i === 4) {                           /* 간식 */
      c.add(this.add.image(150, cy + 40, 'player_front').setScale(1.8));
      c.add(this.add.image(250, cy + 40, 'pilgrim_f').setScale(1.8));
      c.add(this.add.image(200, cy - 40, 'bread_loaf').setScale(1.4));
    } else if (i === 5) {                           /* 밤의 이야기 */
      c.add(this.add.image(W / 2, cy + 60, 'sleep_row').setScale(1.0).setTint(0x3a4160));
      for (let n = 0; n < 12; n++) {
        c.add(this.add.image(Phaser.Math.Between(20, W - 20), Phaser.Math.Between(180, 300),
          'star_bright').setScale(0.5).setAlpha(0.6));
      }
    } else if (i === 6) {                           /* 성당의 촛불 */
      [130, 195, 260].forEach((x, n) => c.add(this.add.image(x, cy, 'candle_small').setScale(2.2 - n * 0.2)));
      c.add(this.add.image(W / 2, cy - 110, 'cross_small').setScale(1.8));
    } else {                                        /* 서울 거리 */
      c.add(this.add.image(W / 2, cy - 40, 'wyd_arch').setScale(0.95));
      c.add(this.add.image(120, cy + 100, 'flag_row').setScale(0.9));
      c.add(this.add.image(280, cy + 100, 'flag_row').setScale(0.9));
    }
    return c;
  }

  /* 장면들이 여행 노트 안으로 들어갑니다 */
  toAlbum() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.placeText.setText('');
    const book = this.add.image(W / 2, H * 0.42, 'note_book').setDepth(40).setScale(0.4).setAlpha(0);
    this.tweens.add({ targets: book, alpha: 1, scale: 1, duration: 900, ease: 'Back.easeOut' });

    const t1 = this.add.text(W / 2, H * 0.42 - 20, DAY06.album, UI.style(22, PAL.sunDeep))
      .setOrigin(0.5).setDepth(42).setAlpha(0);
    const t2 = this.add.text(W / 2, H * 0.42 + 16, DAY06.albumSub, UI.style(FONT.small, PAL.inkSoft))
      .setOrigin(0.5).setDepth(42).setAlpha(0);
    this.tweens.add({ targets: [t1, t2], alpha: 1, duration: 900, delay: 700 });

    this.time.delayedCall(2600, () => {
      UI.fadeOut(this, 1000, () => this.lastNight(), [232, 226, 210]);
    });
  }

  /* 마지막 밤이 온다 */
  lastNight() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.children.list.slice().forEach(o => o.destroy());
    this.cameras.main.setBackgroundColor('#e2d8c4');
    this.cameras.main.fadeIn(900, 232, 226, 210);
    this.dialogue = new DialogueBox(this);

    this.add.image(W / 2, 0, 'sky_afternoon').setOrigin(0.5, 0).setDisplaySize(W, 380).setDepth(-30);
    const g = this.add.graphics().setDepth(-20);
    g.fillStyle(0xcfc3ab, 1); g.fillRect(0, 360, W, H - 360);
    g.fillStyle(0xdcd1b9, 1); g.fillRect(0, 360, W, 12);
    g.fillStyle(0xbfb49d, 1); g.fillRect(0, 700, W, H - 700);

    /* 큰 짐을 진 사람들이 한 방향으로 */
    for (let i = 0; i < 7; i++) {
      const x = 20 + i * 58, y = 470 + (i % 3) * 26;
      const img = this.add.image(x, y, ['pilgrim_a', 'pilgrim_b', 'pilgrim_c', 'pilgrim_d',
        'pilgrim_e', 'pilgrim_f', 'pilgrim_a'][i] + '_back').setDepth(y).setScale(1.05);
      this.tweens.add({ targets: img, x: x + 70, duration: 8000, repeat: -1, delay: i * 500 });
    }
    /* 큰 짐은 길가에도 놓여 있습니다 */
    [[36, 520], [352, 512], [200, 548]].forEach((b) => {
      this.add.image(b[0], b[1], 'big_backpack').setDepth(b[1]).setScale(0.72).setAlpha(0.95);
    });

    this.me = this.add.image(146, 600, 'player_back').setDepth(600).setScale(1.4);
    this.carlo = this.add.image(238, 612, 'carlo_back').setDepth(612).setScale(1.4);
    this.tweens.add({ targets: [this.me, this.carlo], y: '-=4', duration: 820, yoyo: true, repeat: -1 });

    this.time.delayedCall(800, () => {
      this.dialogue.play(DAY06.lastNight, () => {
        UI.caption(this, DAY06.caption, {
          y: H * 0.34, hold: 1400,
          onDone: () => this.prepare()
        });
      });
    });
  }

  /* 가방을 챙깁니다 */
  prepare() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, P = DAY06.prepare;
    const layer = this.add.container(0, 0).setDepth(820);   // 배경 인물보다 위에
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.95); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 130, P.title, UI.style(22, PAL.sun)).setOrigin(0.5));
    layer.add(this.add.image(W / 2, 210, 'big_backpack').setScale(1.2));

    let y = 292;
    P.items.forEach((it, i) => {
      const x = (i % 2 === 0) ? W / 2 - 82 : W / 2 + 82;
      const t = this.add.text(x, y, '· ' + it, UI.style(FONT.small, PAL.cream)).setOrigin(0.5).setAlpha(0);
      layer.add(t);
      this.tweens.add({ targets: t, alpha: 0.95, duration: 300, delay: i * 130 });
      if (i % 2 === 1) y += 34;
    });

    this.time.delayedCall(1900, () => {
      layer.add(UI.button(this, W / 2, H - 150, 260, 58, P.goBtn, () => {
        layer.destroy();
        this.dialogue.play(P.talk, () => {
          this.dialogue.play(P.open, () => this.showCards());
        });
      }, { size: FONT.label, fill: PAL.sun }));
    });
  }

  /* 지금까지 모은 말씀카드 몇 장을 잠깐 펼쳐 봅니다 */
  showCards() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const layer = this.add.container(0, 0).setDepth(820);   // 배경 인물보다 위에
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.95); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    const owned = Collection.owned();
    const picks = ['c4', 'b15', 'c3', 'b18'].filter(id => owned.indexOf(id) !== -1);
    const shown = picks.length ? picks : ['c4', 'c3', 'b18'];

    let y = 220;
    shown.slice(0, 4).forEach((id, i) => {
      const card = COLLECTION.get(id);
      if (!card) return;
      const cat = COLLECTION.cats[card.cat];
      const g = this.add.graphics();
      g.fillStyle(HEX(PAL.paper), 0.96); g.fillRoundedRect(W / 2 - 150, y - 40, 300, 80, 12);
      g.lineStyle(2, HEX(cat.color), 0.75); g.strokeRoundedRect(W / 2 - 150, y - 40, 300, 80, 12);
      layer.add(g);
      const t = this.add.text(W / 2, y, card.text.split('\n')[0], UI.style(FONT.small, PAL.ink, {
        align: 'center', wordWrap: { width: 268 }
      })).setOrigin(0.5);
      layer.add(t);
      g.setAlpha(0); t.setAlpha(0);
      this.tweens.add({ targets: [g, t], alpha: 1, duration: 500, delay: i * 260 });
      y += 96;
    });

    this.time.delayedCall(1800, () => {
      layer.add(UI.button(this, W / 2, H - 140, 250, 56, '가방에 넣는다', () => {
        layer.destroy();
        this.dialogue.play(DAY06.prepare.after, () => {
          UI.fadeOut(this, 900, () => this.scene.start('Day6PilgrimageScene'), [200, 190, 172]);
        });
      }, { size: FONT.small, fill: PAL.sun }));
    });
  }
};
