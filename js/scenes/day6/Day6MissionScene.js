/* DAY 6 · 헤어짐과 파견 — “끝난 거야?” “아니. 이제 시작인데.” */

window.Day6MissionScene = class Day6MissionScene extends Phaser.Scene {
  constructor() { super('Day6MissionScene'); }

  create() {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    SaveSystem.checkpoint('Day6MissionScene', {});
    AudioSystem.setAmbience('city');
    AudioSystem.startPad();
    this.cameras.main.setBackgroundColor('#c8bda6');

    this.add.image(W / 2, 0, 'sky_seoul_day').setOrigin(0.5, 0).setDisplaySize(W, 380).setDepth(-40);
    const g = this.add.graphics().setDepth(-30);
    g.fillStyle(0x9aa984, 1); g.fillRect(0, 360, W, H - 360);
    g.fillStyle(0xa9b791, 1); g.fillRect(0, 360, W, 12);
    this.add.image(W / 2, 300, 'wyd_cross').setDepth(4).setScale(0.5).setAlpha(0.75);

    this.me = this.add.image(146, 604, 'player_front').setDepth(604).setScale(1.4);
    this.carlo = this.add.image(240, 616, 'carlo_front').setDepth(616).setScale(1.4);
    this.tweens.add({ targets: [this.me, this.carlo], y: '-=4', duration: 840, yoyo: true, repeat: -1 });

    this.dialogue = new DialogueBox(this);
    UI.fadeIn(this, 900, [8, 10, 18]);

    this.time.delayedCall(800, () => this.dialogue.play(DAY06.farewell.open, () => this.friends()));
  }

  /* 하나씩 인사하고 멀어집니다 */
  friends() {
    const W = GAME.WIDTH;
    const order = [
      ['jiwoo', 'child_front'], ['luca', 'pilgrim_e'],
      ['maria', 'pilgrim_a'], ['lea', 'pilgrim_c']
    ];
    let i = 0;
    const next = () => {
      if (i >= order.length) { this.dialogue.play(DAY06.farewell.after, () => this.card()); return; }
      const [key, tex] = order[i];
      i++;
      const npc = this.add.image(W - 60, 590, tex).setDepth(590).setScale(1.32).setAlpha(0);
      this.tweens.add({ targets: npc, alpha: 1, x: 310, duration: 800 });
      this.time.delayedCall(900, () => {
        this.dialogue.play(DAY06.farewell[key], () => {
          this.tweens.add({
            targets: npc, alpha: 0, x: W + 60, duration: 1100,
            onComplete: () => { npc.destroy(); next(); }
          });
        });
      });
    };
    next();
  }

  card() {
    this.dialogue.say(DAY06.farewell.card, () => {
      Collection.award(this, 'b20', () => {
        this.dialogue.play(DAY06.mission.talk, () => {
          this.scene.launch('MissionScene', { from: this.scene.key });
          this.scene.pause();
        });
      });
    });
  }

  onMiniGameDone(key) {
    if (key !== 'MissionScene') return;
    this.time.delayedCall(500, () => this.gospel());
  }

  /* 마태 28장 — 가라고 하셨는데, 같이 계신다 */
  gospel() {
    const W = GAME.WIDTH, H = GAME.HEIGHT, M = DAY06.mission;
    this.dialogue.play(M.gospel, () => {
      const veil = this.add.graphics().setDepth(800);
      veil.fillStyle(0x090c14, 0.96); veil.fillRect(0, 0, W, H);
      veil.setAlpha(0);
      this.tweens.add({ targets: veil, alpha: 1, duration: 1200 });
      AudioSystem.bell();

      const l1 = this.add.text(W / 2, H * 0.32, M.gospel1, UI.style(21, PAL.cream, {
        align: 'center', lineSpacing: 8, wordWrap: { width: W - 70 }
      })).setOrigin(0.5).setDepth(810).setAlpha(0);
      const r1 = this.add.text(W / 2, H * 0.42, M.gospelRef1, UI.style(FONT.small, '#8fa5c8'))
        .setOrigin(0.5).setDepth(810).setAlpha(0);
      const l2 = this.add.text(W / 2, H * 0.55, M.gospel2, UI.style(21, PAL.sun, {
        align: 'center', lineSpacing: 8, wordWrap: { width: W - 70 }
      })).setOrigin(0.5).setDepth(810).setAlpha(0);
      const r2 = this.add.text(W / 2, H * 0.65, M.gospelRef2, UI.style(FONT.small, '#8fa5c8'))
        .setOrigin(0.5).setDepth(810).setAlpha(0);

      this.tweens.add({ targets: [l1, r1], alpha: 1, duration: 1400, delay: 900 });
      this.tweens.add({ targets: [l2, r2], alpha: 1, duration: 1400, delay: 3400 });

      this.time.delayedCall(6200, () => {
        this.tweens.add({
          targets: [veil, l1, r1, l2, r2], alpha: 0, duration: 1100,
          onComplete: () => {
            [veil, l1, r1, l2, r2].forEach(o => o.destroy());
            this.dialogue.play(M.gospelAfter, () => this.goodbye());
          }
        });
      });
    });
  }

  /* 마지막 WYD 대화 — DAY 2~6 을 돌아봅니다 */
  goodbye() {
    this.dialogue.play(DAY06.goodbye.open, () => this.recall(0));
  }

  recall(i) {
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const list = DAY06.goodbye.recall;
    if (i >= list.length) {
      this.dialogue.play(DAY06.goodbye.after, () => {
        this.dialogue.say(DAY06.goodbye.fade, () => {
          this.tweens.add({ targets: this.carlo, alpha: 0.35, duration: 700, yoyo: true });
          this.time.delayedCall(1800, () => {
            UI.fadeOut(this, 1000, () => this.scene.start('Day6NoteScene'), [22, 30, 50]);
          });
        });
      });
      return;
    }

    const r = list[i];
    const veil = this.add.graphics().setDepth(700);
    veil.fillStyle(0x101a2e, 0.92); veil.fillRect(0, 0, W, H);
    veil.setAlpha(0);

    const day = this.add.text(W / 2, H * 0.34, r.day, UI.style(FONT.small, '#8fa5c8'))
      .setOrigin(0.5).setDepth(710).setAlpha(0);
    const scene = this.add.text(W / 2, H * 0.42, r.scene, UI.style(19, PAL.cream, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(710).setAlpha(0);
    const line = this.add.text(W / 2, H * 0.52, r.line, UI.style(22, PAL.sun, {
      align: 'center', wordWrap: { width: W - 70 }
    })).setOrigin(0.5).setDepth(710).setAlpha(0);

    this.tweens.add({ targets: [veil, day, scene], alpha: 1, duration: 600 });
    this.tweens.add({ targets: line, alpha: 1, duration: 700, delay: 700 });

    this.time.delayedCall(2400, () => {
      this.tweens.add({
        targets: [veil, day, scene, line], alpha: 0, duration: 600,
        onComplete: () => {
          [veil, day, scene, line].forEach(o => o.destroy());
          this.recall(i + 1);
        }
      });
    });
  }
};
