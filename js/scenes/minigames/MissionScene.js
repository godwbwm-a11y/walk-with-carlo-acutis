/* 미니게임 · 나의 파견 — DAY 4·5 에서 고른 것을 오늘의 삶과 잇습니다.
   점수도, 서약도 아닙니다. 지키지 못해도 실패가 아닙니다. */

window.MissionScene = class MissionScene extends MiniGameScene {
  constructor() { super('MissionScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#141d33',
      title: DAY06.mission.title, hint: DAY06.mission.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.answer = { place: null, gift: null, step: null, who: null };

    for (let i = 0; i < 40; i++) {
      this.add.image(Phaser.Math.Between(6, W - 6), Phaser.Math.Between(110, 700), 'star_bright')
        .setDepth(-30).setScale(Phaser.Math.FloatBetween(0.24, 0.5))
        .setAlpha(Phaser.Math.FloatBetween(0.15, 0.45));
    }

    this.me = this.add.image(W / 2, 470, 'player_front').setDepth(60).setScale(1.9);
    this.tweens.add({ targets: this.me, y: 464, duration: 900, yoyo: true, repeat: -1 });

    this.time.delayedCall(500, () => this.askPlace());
  }

  clearStage() {
    (this.stage || []).forEach(o => { if (o && o.destroy) o.destroy(); });
    this.stage = [];
  }

  /* 1 · 어디로 보내실까요 */
  askPlace() {
    const W = GAME.WIDTH;
    this.clearStage();
    this.setHint(DAY06.mission.hint);
    this.me.setVisible(false);   // 격자를 고르는 동안에는 잠시 비켜 둡니다

    let x = 88, y = 230;
    DAY06.mission.places.forEach((p, i) => {
      const c = this.add.container(x, y).setDepth(70);
      const g = this.add.graphics();
      g.fillStyle(0xf3ece2, 0.12); g.fillRoundedRect(-48, -44, 96, 88, 14);
      g.lineStyle(2, HEX(PAL.cream), 0.35); g.strokeRoundedRect(-48, -44, 96, 88, 14);
      c.add(g);
      c.add(this.add.text(0, -14, p.icon, UI.style(26, PAL.cream)).setOrigin(0.5));
      c.add(this.add.text(0, 20, p.label, UI.style(14, PAL.cream)).setOrigin(0.5));
      c.setSize(96, 92);
      c.setInteractive();
      c.on('pointerup', () => this.pickPlace(p));
      this.stage.push(c);
      x += 107;
      if ((i + 1) % 3 === 0) { x = 88; y += 104; }
    });
  }

  pickPlace(p) {
    this.answer.place = p;
    AudioSystem.select();
    this.clearStage();

    const W = GAME.WIDTH;
    const big = this.add.container(W / 2, 210).setDepth(70);
    const g = this.add.graphics();
    g.fillStyle(HEX(PAL.sun), 0.18); g.fillRoundedRect(-70, -60, 140, 120, 18);
    g.lineStyle(2, HEX(PAL.sun), 0.9); g.strokeRoundedRect(-70, -60, 140, 120, 18);
    big.add(g);
    big.add(this.add.text(0, -16, p.icon, UI.style(38, PAL.cream)).setOrigin(0.5));
    big.add(this.add.text(0, 30, p.label, UI.style(18, PAL.sun)).setOrigin(0.5));
    big.setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: big, scale: 1, alpha: 1, duration: 600, ease: 'Back.easeOut' });
    this.chosenPlace = big;

    this.time.delayedCall(800, () => this.askList(DAY06.mission.askGift, this.giftList(), (v) => {
      this.answer.gift = v;
      this.askList(DAY06.mission.askStep, this.stepList(), (v2) => {
        this.answer.step = v2;
        this.askList(DAY06.mission.askWho, DAY06.mission.who, (v3) => {
          this.answer.who = v3;
          this.think();
        });
      });
    }));
  }

  /* DAY 4 에서 고른 좋은 점을 맨 앞에 둡니다 */
  giftList() {
    const mine = SaveSystem.get('reflections.day4Strengths', []) || [];
    const main = SaveSystem.get('reflections.day4MainStrength', null);
    const list = [];
    if (main) list.push(main);
    mine.forEach(m => { if (list.indexOf(m) === -1) list.push(m); });
    DAY06.mission.gifts.forEach(g => { if (list.indexOf(g) === -1) list.push(g); });
    return list.slice(0, 8);
  }

  /* DAY 5 에서 고른 작은 한 걸음을 맨 앞에 둡니다 */
  stepList() {
    const mine = SaveSystem.get('reflections.day5Step', null);
    const list = [];
    if (mine) list.push(mine);
    DAY06.mission.steps.forEach(s => { if (list.indexOf(s) === -1) list.push(s); });
    return list.slice(0, 7);
  }

  askList(question, options, cb) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.clearStage();
    this.setHint('');

    const q = this.add.text(W / 2, 340, question, UI.style(20, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 7
    })).setOrigin(0.5).setDepth(70);
    this.stage.push(q);

    const list = this.add.container(0, 0).setDepth(70);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(0, 380, W, 380);
    list.setMask(shape.createGeometryMask());
    this.stage.push(list);

    let y = 414;
    options.forEach((o) => {
      const b = UI.button(this, W / 2, y, W - 74, 54, o, () => {
        AudioSystem.select();
        cb(o);
      }, { size: FONT.small });
      list.add(b);
      y += 62;
    });

    const max = Math.max(0, y - 750);
    if (this.scrollFn) this.input.off('pointermove', this.scrollFn);
    this.scrollFn = (p) => {
      if (!p.isDown || p.y < 384 || p.y > 756) return;
      const dy = p.y - (this.lastY === undefined ? p.y : this.lastY);
      this.lastY = p.y;
      list.y = Phaser.Math.Clamp(list.y + dy, -max, 0);
    };
    this.input.on('pointermove', this.scrollFn);
    this.input.on('pointerup', () => { this.lastY = undefined; });
  }

  /* 두 데이터를 잇습니다 */
  think() {
    this.clearStage();
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const t = this.add.text(W / 2, H * 0.5, DAY06.mission.thinking, UI.style(19, '#cbd8ea'))
      .setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 500, yoyo: true, hold: 900, repeat: 1 });
    this.time.delayedCall(2600, () => { t.destroy(); this.sendCard(); });
  }

  sentence() {
    const a = this.answer;
    if (a.gift.indexOf('모르겠') >= 0) {
      return a.place.label + '에서 오늘 하루를 잘 살아보겠습니다.';
    }
    return a.place.label + '에서 ' + this.stem(a.step) + '고, '
      + this.stem(a.gift) + '는 마음으로 살아보겠습니다.';
  }

  /* “먼저 인사한다” → “먼저 인사하”, “잘 들어준다” → “잘 들어주”
     끝의 ‘다’ 를 떼고, ‘ㄴ/는’ 이 붙은 형태를 원래 모습으로 되돌립니다. */
  stem(word) {
    let s = String(word).slice(0, -1);              // 끝의 ‘다’
    if (s.endsWith('는')) return s.slice(0, -1);     // 걷는다 → 걷
    const code = s.charCodeAt(s.length - 1) - 0xAC00;
    if (code >= 0 && code <= 11171 && code % 28 === 4) {   // 받침 ㄴ
      s = s.slice(0, -1) + String.fromCharCode(0xAC00 + (code - 4));
    }
    return s;
  }

  /* 파견 카드 */
  sendCard() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, a = this.answer;
    this.clearStage();
    if (this.chosenPlace) { this.chosenPlace.destroy(); this.chosenPlace = null; }
    this.me.setVisible(false);

    const card = this.add.container(W / 2, 300).setDepth(80);
    card.add(this.add.image(0, 0, 'send_card'));
    card.add(this.add.text(0, -80, DAY06.mission.cardTitle, UI.style(19, PAL.cream)).setOrigin(0.5));

    const rows = [
      ['장소', a.place.icon + ' ' + a.place.label],
      ['내가 가진 것', a.gift],
      ['작은 용기', a.step],
      ['기억할 사람', a.who]
    ];
    let y = -34;
    rows.forEach((r) => {
      card.add(this.add.text(-124, y, r[0], UI.style(13, PAL.inkSoft)).setOrigin(0, 0.5));
      card.add(this.add.text(124, y, r[1], UI.style(15, PAL.ink, {
        align: 'right', wordWrap: { width: 190 }
      })).setOrigin(1, 0.5));
      y += 36;
    });
    card.setAlpha(0);
    this.tweens.add({ targets: card, alpha: 1, duration: 700 });
    this.stage.push(card);
    AudioSystem.chime();

    const line = this.add.text(W / 2, 470, '“' + this.sentence() + '”', UI.style(20, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }, lineSpacing: 8
    })).setOrigin(0.5, 0).setDepth(80).setAlpha(0);
    this.tweens.add({ targets: line, alpha: 1, duration: 900, delay: 600 });
    this.stage.push(line);

    const keep = UI.button(this, W / 2, H - 172, 250, 58, DAY06.mission.keepBtn, () => this.keep(),
      { size: FONT.label, fill: PAL.sun });
    const again = UI.button(this, W / 2, H - 104, 250, 54, DAY06.mission.againBtn, () => {
      this.answer = { place: null, gift: null, step: null, who: null };
      keep.destroy(); again.destroy();
      this.askPlace();
    }, { size: FONT.small });
    [keep, again].forEach(b => b.setDepth(90).setAlpha(0));
    this.tweens.add({ targets: [keep, again], alpha: 1, duration: 700, delay: 900 });
    this.stage.push(keep); this.stage.push(again);
  }

  keep() {
    const a = this.answer;
    SaveSystem.set('reflections.day6Mission', {
      place: a.place.label, icon: a.place.icon,
      gift: a.gift, step: a.step, who: a.who,
      sentence: this.sentence()
    });
    this.clearStage();

    const unknown = (a.gift.indexOf('모르겠') >= 0);
    const after = () => {
      this.dialogue.play(DAY06.mission.after, () => {
        this.cardId = 'j8';
        this.complete([DAY06.mission.sendCard1, DAY06.mission.sendCard2]);
      });
    };
    if (unknown) this.dialogue.play(DAY06.mission.unknown, after);
    else after();
  }
};
