/* 말씀 카드 수집 — 모으는 재미는 있지만 점수도 등수도 없습니다. */

window.Collection = (function () {

  function owned() {
    return SaveSystem.get('collection', []) || [];
  }

  function has(id) {
    return owned().indexOf(id) !== -1;
  }

  /* 카드를 얻습니다. 이미 있으면 아무 일도 없습니다. */
  function unlock(id) {
    if (!id || has(id)) return null;
    const card = COLLECTION.get(id);
    if (!card) return null;
    const list = owned().slice();
    list.push(id);
    SaveSystem.set('collection', list);
    return card;
  }

  /* 화면 위에 카드를 얻었다는 연출을 띄웁니다. */
  function show(scene, card, onDone) {
    if (!card) { if (onDone) onDone(); return; }
    const W = GAME.WIDTH, H = GAME.HEIGHT;
    const cat = COLLECTION.cats[card.cat];

    const layer = scene.add.container(0, 0).setDepth(2000).setScrollFactor(0);
    const scrim = scene.add.graphics().setScrollFactor(0);
    scrim.fillStyle(0x0d1524, 0.78); scrim.fillRect(0, 0, W, H);
    layer.add(scrim);

    const cy = H * 0.44;
    const cardG = scene.add.graphics().setScrollFactor(0);
    cardG.fillStyle(0x000000, 0.18); cardG.fillRoundedRect(W / 2 - 152, cy - 116, 304, 240, 20);
    cardG.fillStyle(HEX(PAL.paper), 1); cardG.fillRoundedRect(W / 2 - 154, cy - 120, 308, 240, 20);
    cardG.lineStyle(2, HEX(cat.color), 0.7); cardG.strokeRoundedRect(W / 2 - 154, cy - 120, 308, 240, 20);
    cardG.fillStyle(HEX(cat.color), 1); cardG.fillRoundedRect(W / 2 - 154, cy - 120, 308, 40, { tl: 20, tr: 20, bl: 0, br: 0 });
    layer.add(cardG);

    layer.add(scene.add.text(W / 2, cy - 100, cat.icon + '  ' + cat.name,
      UI.style(FONT.small, PAL.cream)).setOrigin(0.5).setScrollFactor(0));
    layer.add(scene.add.text(W / 2, cy - 16, card.text,
      UI.style(19, PAL.ink, { align: 'center', lineSpacing: 8, wordWrap: { width: 264 } }))
      .setOrigin(0.5).setScrollFactor(0));
    layer.add(scene.add.text(W / 2, cy + 76, '— ' + card.from,
      UI.style(FONT.small, PAL.inkSoft)).setOrigin(0.5).setScrollFactor(0));
    layer.add(scene.add.text(W / 2, cy - 156, '말씀을 하나 얻었습니다',
      UI.style(FONT.body, PAL.sun)).setOrigin(0.5).setScrollFactor(0));
    layer.add(scene.add.text(W / 2, cy + 156, '화면을 누르면 계속',
      UI.style(FONT.small, '#d9c9ae')).setOrigin(0.5).setScrollFactor(0).setAlpha(0.85));

    layer.setAlpha(0);
    scene.tweens.add({ targets: layer, alpha: 1, duration: 400 });
    AudioSystem.found();

    const zone = scene.add.zone(W / 2, H / 2, W, H).setOrigin(0.5)
      .setInteractive().setDepth(2001).setScrollFactor(0);
    zone.once('pointerdown', function () {
      AudioSystem.tap();
      scene.tweens.add({
        targets: layer, alpha: 0, duration: 300,
        onComplete: function () { layer.destroy(); zone.destroy(); if (onDone) onDone(); }
      });
    });
  }

  /* 얻은 뒤 곧바로 보여주는 짧은 방법 */
  function award(scene, id, onDone) {
    const card = unlock(id);
    if (!card) { if (onDone) onDone(); return false; }
    show(scene, card, onDone);
    return true;
  }

  return {
    owned: owned,
    has: has,
    unlock: unlock,
    show: show,
    award: award,
    count: function () { return owned().length; },
    total: function () { return COLLECTION.cards.length; }
  };
})();
