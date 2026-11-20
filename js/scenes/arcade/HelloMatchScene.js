/* DAY 5 후반 · 인사 짝 맞추기 — 서울의 밤, 오늘 만난 사람들의 인사를 떠올리며.
   카드 두 장을 뒤집어 ‘인사말’과 ‘그 나라 말’을 짝지어요. 연달아 맞히면 점수가 불어납니다. */

window.HelloMatchScene = class HelloMatchScene extends MiniGameScene {
  constructor() { super('HelloMatchScene'); }

  create(data) {
    data = data || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.buildFrame({ from: data.from, title: '인사 짝 맞추기', hint: '', bg: '#1d2a4a', warm: false });
    this.add.image(W / 2, 300, 'seoul_night_block').setDepth(-80).setAlpha(0.35);

    this.pairs = [
      ['안녕하세요', '한국어', '🇰🇷'], ['Ciao!', '이탈리아어', '🇮🇹'], ['¡Hola!', '스페인어', '🇪🇸'], ['Bonjour', '프랑스어', '🇫🇷'],
      ['Olá!', '포르투갈어', '🇧🇷'], ['Kumusta!', '필리핀어', '🇵🇭'], ['Jambo!', '스와힐리어', '🇰🇪'], ['Hello!', '영어', '🇬🇧']
    ];
    this.cols = 4; this.rows = 4;
    this.cw = 82; this.ch = 104; this.gap = 10;
    this.top = 190;
    this.flips = 0; this.found = 0; this.open = []; this.pendingHide = null; this.over = false;

    GameFX.intro(this, {
      key: this.scene.key, badge: 'DAY 5 · 서울의 밤', title: '인사 짝 맞추기',
      sub: data.intro || '가롤로: “오늘 인사 몇 개나 들었어? 짝을 맞춰 보자!”',
      how: ['카드를 두 장씩 뒤집어요', '인사말과 그 나라 말이 짝이에요 (예: Ciao! ↔ 이탈리아어)', '연달아 맞히면 점수가 불어나요', '적게 뒤집을수록 별이 많아요'],
      noCount: true,
      onStart: () => { this.hud = GameFX.hud(this); this.startAt = this.time.now; this.deal(); }
    });
  }

  deal() {
    const W = GAME.WIDTH;
    const cards = [];
    this.pairs.forEach((p, i) => { cards.push({ id: i, face: p[0], sub: p[2], kind: 'hello' }); cards.push({ id: i, face: p[1], sub: p[2], kind: 'lang' }); });
    Phaser.Utils.Array.Shuffle(cards);
    const totalW = this.cols * this.cw + (this.cols - 1) * this.gap;
    const x0 = W / 2 - totalW / 2 + this.cw / 2;
    this.cards = cards.map((cd, i) => {
      const x = x0 + (i % this.cols) * (this.cw + this.gap);
      const y = this.top + Math.floor(i / this.cols) * (this.ch + this.gap) + this.ch / 2;
      const c = this.add.container(x, y).setDepth(10);
      const back = this.add.image(0, 0, UI.skin(this, 'btn', this.cw, this.ch, 14, PAL.sun));
      const mark = this.add.text(0, 0, '✦', UI.style(26, '#fff6e2', { shadow: false })).setOrigin(0.5);
      const front = this.add.image(0, 0, UI.skin(this, 'btn', this.cw, this.ch, 14, PAL.paper)).setVisible(false);
      const t1 = this.add.text(0, -12, cd.face, UI.style(cd.kind === 'hello' ? 17 : 15, cd.kind === 'hello' ? PAL.ink : '#3f6f8f', {
        align: 'center', wordWrap: { width: this.cw - 10 }, shadow: false })).setOrigin(0.5).setVisible(false);
      const t2 = this.add.text(0, 26, cd.sub, UI.style(18, PAL.ink, { shadow: false })).setOrigin(0.5).setVisible(false);
      c.add([back, mark, front, t1, t2]);
      c.cd = cd; c.parts = { back, mark, front, t1, t2 };
      c.setSize(this.cw, this.ch).setInteractive();
      c.on('pointerup', () => this.flip(c));
      c.setScale(0);
      this.tweens.add({ targets: c, scale: 1, duration: 220, delay: i * 30, ease: 'Back.easeOut' });
      return c;
    });
  }

  show(c, faceUp, cb) {
    this.tweens.killTweensOf(c);           // 덮이는 중에 다시 눌러도 그림이 엇갈리지 않게
    this.tweens.add({ targets: c, scaleX: 0, duration: 110, ease: 'Quad.easeIn', onComplete: () => {
      const p = c.parts;
      p.back.setVisible(!faceUp); p.mark.setVisible(!faceUp);
      p.front.setVisible(faceUp); p.t1.setVisible(faceUp); p.t2.setVisible(faceUp);
      this.tweens.add({ targets: c, scaleX: 1, duration: 120, ease: 'Quad.easeOut', onComplete: cb });
    } });
  }

  /* 틀린 두 장이 아직 펼쳐져 있을 때 다른 카드를 누르면 기다리지 않고 바로 덮습니다 */
  hideNow() {
    const p = this.pendingHide;
    if (!p) return;
    this.pendingHide = null;
    if (p.timer) p.timer.remove();
    p.cards.forEach((o) => {
      this.tweens.killTweensOf(o);
      o.scaleX = 1;
      const q = o.parts; q.back.setVisible(true); q.mark.setVisible(true); q.front.setVisible(false); q.t1.setVisible(false); q.t2.setVisible(false);
    });
  }

  /* 누르는 즉시 판정합니다 — 뒤집히는 그림을 기다리느라 손가락이 막히지 않게 */
  flip(c) {
    if (!this.hud || this.over) return;
    if (this.pendingHide) {
      if (this.pendingHide.cards.indexOf(c) !== -1) return;
      this.hideNow();
    }
    if (c.done || this.open.indexOf(c) !== -1 || this.open.length >= 2) return;
    AudioSystem.gPop();
    this.flips++;
    this.open.push(c);
    this.show(c, true);
    if (this.open.length < 2) return;
    const [a, b] = this.open;
    this.open = [];
    if (a.cd.id === b.cd.id) {
      a.done = b.done = true;
      this.found++;
      const last = this.found === this.pairs.length;
      if (last) this.over = true;
      this.time.delayedCall(260, () => {
        this.hud.hit(40, (a.x + b.x) / 2, Math.min(a.y, b.y) - 50, '짝!');
        [a, b].forEach(o => { this.tweens.add({ targets: o, scaleY: 1.1, duration: 120, yoyo: true }); o.parts.front.setTint(0xfff1cf); });
        if (last) this.end();
      });
    } else {
      this.hud.combo = 0;
      const pend = { cards: [a, b] };
      this.pendingHide = pend;
      pend.timer = this.time.delayedCall(900, () => {
        if (this.pendingHide !== pend) return;
        this.pendingHide = null;
        this.show(a, false); this.show(b, false);
      });
    }
  }

  end() {
    const secs = (this.time.now - this.startAt) / 1000;
    const bonus = Math.max(0, Math.round(300 - secs * 3 - (this.flips - 16) * 6));
    if (bonus > 0) this.hud.add(bonus);
    GameFX.burst(this, GAME.WIDTH / 2, 420, { count: 30, speed: 200 });
    this.time.delayedCall(800, () => this.finishGame({
      title: '모두 짝을 찾았어요', score: this.hud.score,
      stars: this.flips <= 26 ? 3 : this.flips <= 38 ? 2 : 1,
      detail: this.flips + '번 뒤집음 · ' + Math.round(secs) + '초',
      line: '“말은 달라도, 인사하는 마음은 다 똑같더라.”'
    }));
  }
};
