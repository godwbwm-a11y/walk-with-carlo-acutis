/* DAY 4 후반 · 원본을 찾아라 — 하굣길, 똑같은 뒷모습들 사이에서.
   빛이 바랜 복사본들 사이에 진짜 ‘나’가 하나 있습니다. 찾아서 누르세요.
   판이 넘어갈수록 사람이 많아지고 복사본은 점점 원본을 닮아 갑니다.
   40초 — 맞히면 1초를 더 받고, 잘못 누르면 2초가 줄어듭니다. */

window.OriginalScene = class OriginalScene extends MiniGameScene {
  constructor() { super('OriginalScene'); }

  create(data) {
    data = data || {};
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    this.buildFrame({ from: data.from, title: '원본을 찾아라', hint: '', bg: '#33405e', warm: false });
    this.add.image(W / 2, 0, 'sky_afternoon').setOrigin(0.5, 0).setDisplaySize(W, H).setDepth(-90).setAlpha(0.55);
    this.boardTop = 170; this.boardBottom = H - 120;
    this.layer = this.add.container(0, 0).setDepth(10);
    this.round = 0; this.running = false;
    this.roundT = this.add.text(W / 2, 150, '', UI.style(16, '#e6eefa')).setOrigin(0.5).setDepth(20);

    GameFX.intro(this, {
      key: this.scene.key, badge: 'DAY 4 · 하굣길', title: '원본을 찾아라',
      sub: data.intro || '가롤로: “다 똑같아 보이지? 그래도 너는 하나야. 찾아봐.”',
      how: ['빛이 바랜 복사본들 사이에서 또렷한 ‘나’를 찾아 누르세요', '판이 넘어갈수록 사람이 많아지고 더 비슷해져요', '맞히면 +1초, 잘못 누르면 −2초', '40초 동안 몇 판까지 갈 수 있을까요?'],
      onStart: () => { this.hud = GameFX.hud(this, { time: 40 }); this.running = true; this.next(); }
    });
  }

  next() {
    const W = GAME.WIDTH;
    this.round++;
    this.layer.removeAll(true);
    const sizes = [[3, 3], [3, 3], [4, 3], [4, 4], [4, 4], [5, 4], [5, 5], [5, 5], [6, 5], [6, 6]];
    const sz = sizes[Math.min(sizes.length - 1, this.round - 1)];
    const cols = sz[0], rows = sz[1];
    const areaW = W - 40, areaH = this.boardBottom - this.boardTop;
    const cw = areaW / cols, ch = areaH / rows;
    const scale = Math.min(cw / 34, ch / 50) * 0.82;
    /* 복사본이 원본을 얼마나 닮았는지 — 판이 넘어갈수록 비슷해집니다 */
    const k = Math.min(1, (this.round - 1) / 9);
    const fade = Math.round(0x86 + (0xe6 - 0x86) * k);
    const copyTint = (fade << 16) | (fade << 8) | fade;
    const ans = Math.floor(Math.random() * cols * rows);
    this.roundT.setText(this.round + '판째');
    for (let i = 0; i < cols * rows; i++) {
      const x = 20 + cw * (i % cols + 0.5), y = this.boardTop + ch * (Math.floor(i / cols) + 0.5);
      const me = i === ans;
      const img = this.add.image(x, y + 10, 'player_back').setScale(scale).setInteractive();
      if (!me) {
        img.setTint(copyTint);
        /* 뒤쪽 판에서는 좌우가 뒤집힌 복사본도 섞입니다 */
        if (this.round > 3 && Math.random() < 0.35) img.setFlipX(true);
        img.setAlpha(0.92 - k * 0.1);
      }
      img.me = me;
      img.on('pointerup', () => this.pick(img));
      img.setScale(0);
      this.tweens.add({ targets: img, scale: scale, duration: 200, delay: i * 12, ease: 'Back.easeOut' });
      this.layer.add(img);
    }
  }

  pick(img) {
    if (!this.running || img.picked) return;
    if (img.me) {
      img.picked = true;
      this.hud.hit(10 + this.round * 5, img.x, img.y - 40, '원본!');
      this.hud.timeLeft = Math.min(this.hud.total, this.hud.timeLeft + 1);
      this.tweens.add({ targets: img, scale: img.scale * 1.35, duration: 160, yoyo: true });
      GameFX.flash(this, 0xfff1cf);
      this.time.delayedCall(260, () => { if (this.running) this.next(); });
    } else {
      this.hud.miss(img.x, img.y - 30);
      this.hud.timeLeft = Math.max(0, this.hud.timeLeft - 2);
      GameFX.pop(this, img.x, img.y - 10, '복사본', { color: '#cfd8e6', size: 15 });
      this.tweens.add({ targets: img, x: img.x + 5, duration: 40, yoyo: true, repeat: 2 });
    }
  }

  update(time, delta) {
    if (!this.running) return;
    if (this.hud.tick(Math.min(delta, 50))) this.end();
  }

  end() {
    this.running = false;
    /* 끝에 원본이 어디 있었는지 보여 줍니다 */
    this.layer.list.forEach((o) => { if (o.me) this.tweens.add({ targets: o, scale: o.scale * 1.3, duration: 300, yoyo: true, repeat: 1 }); else o.setAlpha(0.3); });
    const found = this.hud.hits;
    this.time.delayedCall(900, () => this.finishGame({
      title: '찾았다, 원본!', score: this.hud.score, stars: found >= 11 ? 3 : found >= 6 ? 2 : 1,
      detail: found + '판 성공',
      line: '“모든 사람은 원본으로 태어나. 너도, 저 사람들도.”'
    }));
  }
};
