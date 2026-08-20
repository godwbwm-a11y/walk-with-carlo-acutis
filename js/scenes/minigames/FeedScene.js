/* 미니게임 · 멈추지 않는 피드 — 점수도, 나무람도 없습니다. */

window.FeedScene = class FeedScene extends MiniGameScene {
  constructor() { super('FeedScene'); }

  create(data) {
    this.buildFrame({
      from: (data && data.from) || null, card: null, bg: '#2b3348', warm: false,
      title: DAY04.feed.title, hint: DAY04.feed.hint
    });

    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.index = 0;
    this.stopped = false;

    const frame = this.add.graphics().setDepth(-1);
    frame.fillStyle(0x1c2436, 1); frame.fillRoundedRect(18, 128, W - 36, 520, 26);
    frame.lineStyle(3, 0x3b4a66, 1); frame.strokeRoundedRect(18, 128, W - 36, 520, 26);

    this.list = this.add.container(0, 0).setDepth(10);
    const shape = this.make.graphics({ add: false });
    shape.fillRect(20, 132, W - 40, 512);
    this.list.setMask(shape.createGeometryMask());

    /* 조금씩 작아지는 나 */
    this.meBox = this.add.container(58, 712).setDepth(40);
    this.me = this.add.image(0, 0, 'player_front').setScale(1.5);
    this.meBox.add(this.me);
    this.meLabel = this.add.text(58, 762, '나', UI.style(FONT.small, '#9fb4d6')).setOrigin(0.5).setDepth(40);

    this.counter = this.add.text(W - 40, 716, '', UI.style(14, '#8fa5c8')).setOrigin(1, 0.5).setDepth(40);

    this.posts = [];
    for (let i = 0; i < 3; i++) this.spawn();

    /* 위로 밀어 넘깁니다 */
    this.input.on('pointerdown', (p) => { if (!this.stopped && p.y > 140 && p.y < 650) this.dragFrom = p.y; });
    this.input.on('pointerup', (p) => {
      if (this.stopped || this.dragFrom === undefined) return;
      if (this.dragFrom - p.y > 40) this.next();
      this.dragFrom = undefined;
    });

    this.murmur = this.add.text(W / 2, 668, '', UI.style(FONT.body, PAL.cream, {
      align: 'center', lineSpacing: 5, wordWrap: { width: 250 }
    })).setOrigin(0.5).setDepth(40).setAlpha(0);
  }

  spawn() {
    const W = GAME.WIDTH;
    const P = DAY04.feed.posts[(this.posts.length + this.index) % DAY04.feed.posts.length];
    const y = 236 + this.posts.length * 250;

    const c = this.add.container(W / 2, y);
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.97); g.fillRoundedRect(-158, -110, 316, 220, 16);
    g.fillStyle(0xdde5ec, 1); g.fillRoundedRect(-142, -46, 284, 118, 10);
    g.fillStyle(0xc7d4de, 1); g.fillCircle(-118, -78, 18);
    c.add(g);
    c.add(this.add.text(-92, -86, P.who, UI.style(FONT.small, PAL.ink)).setOrigin(0, 0.5));
    c.add(this.add.text(-92, -64, '방금 전', UI.style(12, PAL.inkSoft)).setOrigin(0, 0.5));
    c.add(this.add.text(0, 12, P.text, UI.style(19, PAL.inkSoft, { align: 'center' })).setOrigin(0.5));

    const tag = this.add.text(0, 88, P.tag, UI.style(FONT.small, PAL.clay)).setOrigin(0.5).setAlpha(0);
    c.add(tag);
    this.tweens.add({ targets: tag, alpha: 1, duration: 700, delay: 500 });

    this.list.add(c);
    this.posts.push(c);
  }

  next() {
    if (this.stopped) return;
    this.index++;
    AudioSystem.swipe();

    const gone = this.posts.shift();
    this.tweens.add({ targets: gone, alpha: 0, duration: 300, onComplete: () => gone.destroy() });
    this.posts.forEach((c) => this.tweens.add({ targets: c, y: c.y - 250, duration: 320, ease: 'Sine.easeOut' }));
    this.spawn();
    this.posts[this.posts.length - 1].y = 236 + (this.posts.length - 1) * 250;

    /* 아주 조금씩 작아집니다 */
    const scale = Math.max(0.62, 1.5 - this.index * 0.075);
    this.tweens.add({ targets: this.me, scale: scale, duration: 500 });
    this.counter.setText(this.index + '개 넘김');

    const m = DAY04.feed.murmur.find(x => x.at === this.index);
    if (m) this.say(m.t);
    if (this.index >= 8 && !this.stopBtn) this.showStop();
  }

  say(text) {
    this.murmur.setText('“' + text + '”');
    this.murmur.setAlpha(0);
    this.tweens.add({ targets: this.murmur, alpha: 1, duration: 500 });
    this.time.delayedCall(2200, () => this.tweens.add({ targets: this.murmur, alpha: 0, duration: 600 }));
  }

  showStop() {
    const W = GAME.WIDTH;
    this.say('잠깐… 나 왜 기분이 이상하지?');
    this.stopBtn = UI.button(this, W / 2, 762, 220, 56, DAY04.feed.stopBtn, () => this.stop_(), {
      size: FONT.label, fill: PAL.sun
    });
    this.stopBtn.setDepth(50).setAlpha(0);
    this.tweens.add({ targets: this.stopBtn, alpha: 1, duration: 900, delay: 800 });
  }

  stop_() {
    this.stopped = true;
    SaveSystem.set('reflections.day4Feed', this.index);
    SaveSystem.set('reflections.day4Small', true);
    AudioSystem.chime();
    if (this.stopBtn) this.stopBtn.destroy();
    this.setHint('');
    this.counter.setText('');
    this.murmur.setText('');

    this.dialogue.say([DAY04.feed.after1, DAY04.feed.after2], () => {
      this.setHint(DAY04.feed.tapMe);
      this.me.setInteractive({ useHandCursor: true });
      this.me.once('pointerdown', () => {
        this.me.disableInteractive();
        this.tweens.add({ targets: this.me, scale: this.me.scale * 1.06, duration: 200, yoyo: true });
        this.setHint('');
        this.dialogue.say(DAY04.feed.tapped, () => {
          this.dialogue.say([DAY04.feed.after3].concat(DAY04.feed.paper), () => {
            this.finished = true;
            Collection.award(this, 'j3', () => this.leave());
          });
        });
      });
    });
  }
};
