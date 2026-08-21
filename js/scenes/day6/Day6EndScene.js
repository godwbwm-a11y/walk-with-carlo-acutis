/* DAY 6 · 엔딩 — 가방에 하나 새로 들어간 것, 그리고 “이제 네가 가라.” */

window.Day6EndScene = class Day6EndScene extends Phaser.Scene {
  constructor() { super('Day6EndScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#c8bda6');

    this.add.image(W / 2, 0, 'sky_seoul_day').setOrigin(0.5, 0).setDisplaySize(W, 380).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0xcfc3ab, 1); g.fillRect(0, 360, W, H - 360);
    g.fillStyle(0xdcd1b9, 1); g.fillRect(0, 360, W, 12);
    g.fillStyle(0xbfb49d, 1); g.fillRect(0, 700, W, H - 700);
    for (let x = 0; x < W; x += 96) { g.fillStyle(0xd6cbb4, 0.7); g.fillRect(x + 10, 740, 54, 6); }

    /* 정리하는 봉사자, 떠나는 순례자 */
    this.add.image(316, 520, 'pilgrim_b').setDepth(520).setScale(1.1).setAlpha(0.9);
    this.add.image(64, 540, 'pilgrim_d_back').setDepth(540).setScale(1.05).setAlpha(0.85);
    this.add.image(84, 512, 'big_backpack').setDepth(541).setScale(0.5).setAlpha(0.85);
    this.add.image(300, 490, 'trash_bit').setDepth(490).setScale(1.2).setAlpha(0.8);

    this.me = this.add.image(146, 606, 'player_back').setDepth(606).setScale(1.42);
    this.carlo = this.add.image(238, 618, 'carlo_back').setDepth(618).setScale(1.42);
    this.bob = this.tweens.add({ targets: [this.me, this.carlo], y: '-=4', duration: 840, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 1000, [22, 30, 50]);

    this.time.delayedCall(800, () => this.dialogue.play(DAY06.end.walk, () => this.bag()));
  }

  /* DAY 2 에서 돌이 들어 있던 그 가방 */
  bag() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, E = DAY06.end;
    const layer = this.add.container(0, 0).setDepth(820);   // 배경 인물보다 위에
    const scrim = this.add.graphics();
    scrim.fillStyle(0x101a2e, 0.95); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);
    layer.add(this.add.text(W / 2, 130, E.bagTitle, UI.style(21, PAL.sun)).setOrigin(0.5));
    layer.add(this.add.image(W / 2, 226, 'big_backpack').setScale(1.3));

    let y = 330;
    E.bagItems.forEach((it, i) => {
      const t = this.add.text(W / 2, y, '· ' + it, UI.style(FONT.small, PAL.cream))
        .setOrigin(0.5).setAlpha(0);
      layer.add(t);
      this.tweens.add({ targets: t, alpha: 0.95, duration: 400, delay: i * 260 });
      y += 34;
    });

    const empty = this.add.text(W / 2, y + 16, E.bagEmpty, UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setAlpha(0);
    layer.add(empty);
    this.tweens.add({ targets: empty, alpha: 1, duration: 700, delay: 1600 });

    this.time.delayedCall(2600, () => {
      layer.add(UI.button(this, W / 2, H - 140, 250, 56, '가방을 닫는다', () => {
        layer.destroy();
        this.dialogue.play(E.bagTalk, () => this.train());
      }, { size: FONT.small, fill: PAL.sun }));
    });
  }

  /* 지하철 */
  train() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const car = this.add.image(W / 2, 300, 'subway_car').setDepth(400).setScale(1.0).setAlpha(0);
    this.tweens.add({ targets: car, alpha: 1, duration: 900 });
    AudioSystem.swipe();

    this.time.delayedCall(700, () => {
      this.dialogue.play(DAY06.end.train, () => {
        UI.fadeOut(this, 1100, () => this.phone(), [8, 10, 18]);
      });
    });
  }

  /* 날짜가 흔들리지만 아직 완전히 돌아오지 않습니다 */
  phone() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, E = DAY06.end;
    this.children.list.slice().forEach(o => o.destroy());
    this.cameras.main.setBackgroundColor('#090c14');
    this.cameras.main.fadeIn(900, 8, 10, 18);
    this.dialogue = new DialogueBox(this);

    const t = this.add.text(W / 2, H * 0.42, E.phone1, UI.style(24, '#8fd0a8', {
      align: 'center', lineSpacing: 10
    })).setOrigin(0.5).setDepth(410).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 900, delay: 400 });

    this.time.delayedCall(2600, () => {
      this.cameras.main.shake(500, 0.004);
      t.setText(E.phone2);
      t.setAlpha(0.55);
      AudioSystem.blip();
      this.time.delayedCall(1600, () => {
        this.tweens.add({
          targets: t, alpha: 0, duration: 1000,
          onComplete: () => { t.destroy(); this.gospel(); }
        });
      });
    });
  }

  /* 예수님의 말씀 */
  gospel() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, E = DAY06.end;
    AudioSystem.setAmbience('none');
    AudioSystem.bell();

    const l1 = this.add.text(W / 2, H * 0.32, E.line1, UI.style(28, PAL.cream, {
      align: 'center', wordWrap: { width: W - 60 }
    })).setOrigin(0.5).setDepth(90).setAlpha(0);
    const l2 = this.add.text(W / 2, H * 0.48, E.line2, UI.style(21, PAL.sun, {
      align: 'center', lineSpacing: 8, wordWrap: { width: W - 60 }
    })).setOrigin(0.5).setDepth(90).setAlpha(0);
    const l3 = this.add.text(W / 2, H * 0.64, E.alone, UI.style(19, '#d9c9ae'))
      .setOrigin(0.5).setDepth(90).setAlpha(0);

    this.tweens.add({ targets: l1, alpha: 1, duration: 1400, delay: 700 });
    this.tweens.add({ targets: l2, alpha: 1, duration: 1400, delay: 3200 });
    this.tweens.add({ targets: l3, alpha: 1, duration: 1200, delay: 5600 });

    this.time.delayedCall(8200, () => {
      this.tweens.add({
        targets: [l1, l2, l3], alpha: 0, duration: 1000,
        onComplete: () => { [l1, l2, l3].forEach(o => o.destroy()); this.complete(); }
      });
    });
  }

  complete() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, E = DAY06.end;

    const title = this.add.text(W / 2, H * 0.26, E.complete, UI.style(28, PAL.cream))
      .setOrigin(0.5).setDepth(90).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 1000 });

    const line = this.add.text(W / 2, H * 0.46, '', UI.style(19, '#d9c9ae', {
      align: 'center', wordWrap: { width: W - 60 }, lineSpacing: 8
    })).setOrigin(0.5).setDepth(90).setAlpha(0);

    const seq = [E.over, E.begin, E.take, E.last];
    let i = 0;
    const step = () => {
      if (i >= seq.length) { this.time.delayedCall(1200, () => this.done()); return; }
      line.setText(seq[i]);
      line.setColor(i === 3 ? PAL.sun : (i === 1 ? PAL.cream : '#d9c9ae'));
      line.setFontSize(i === 3 ? 26 : (i === 1 ? 24 : 19));
      line.setAlpha(0);
      this.tweens.add({
        targets: line, alpha: 1, duration: 900,
        onComplete: () => {
          i++;
          this.time.delayedCall(i === 1 ? 1400 : 2400, () => {
            if (i >= seq.length) { step(); return; }
            this.tweens.add({ targets: line, alpha: 0, duration: 700, onComplete: step });
          });
        }
      });
    };
    this.time.delayedCall(1400, step);
  }

  done() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const m = SaveSystem.get('reflections.day6Mission', null);
    SaveSystem.addJournal({
      day: 6, title: DAY06.note.day,
      strength: m ? m.gift : null,
      practice: SaveSystem.get('reflections.day6Practice', null),
      cards: Collection.countOfDay(6)
    });
    SaveSystem.completeDay(6);

    /* 다음 날로 바로 갈 수도, 오늘은 여기까지 해도 됩니다 */
    UI.dayEndButtons(this, 6);
  }
};
