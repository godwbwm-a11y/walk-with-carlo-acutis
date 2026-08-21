/* 단체사진을 그리는 곳 — 사진 찍는 장면, 마지막 화면, 다시 보기에서 모두 이 그림을 씁니다.
   에필로그의 마지막 수집품은 카드가 아니라 이 사진 한 장입니다. */

window.EpiPhoto = {

  /* 사진 속 사람들. id 가 있는 사람은 눌러서 기억을 볼 수 있습니다. */
  people: [
    /* 뒷줄 */
    { x: -104, y: -34, tex: 'epi_ita_front', s: 0.86 },
    { x: -52,  y: -38, tex: 'epi_phi_front', s: 0.86, id: 'jegi' },
    { x: 4,    y: -36, tex: 'friend_front',  s: 0.86, id: 'mine' },
    { x: 58,   y: -38, tex: 'epi_fra_front', s: 0.86, id: 'word' },
    { x: 110,  y: -34, tex: 'epi_bra_front', s: 0.86 },
    /* 앞줄 */
    { x: -84,  y: 20,  tex: 'epi_spa_front', s: 1.0 },
    { x: -28,  y: 22,  tex: 'player_front',  s: 1.06 },
    { x: 30,   y: 22,  tex: 'epi_leo_front', s: 1.0, id: 'leo' },
    { x: 86,   y: 20,  tex: 'epi_ita_front', s: 1.0, id: 'spicy' },
    /* 바닥에 앉은 사람들 */
    { x: -56,  y: 62,  tex: 'child_front',   s: 0.8 },
    { x: 4,    y: 64,  tex: 'epi_phi_front', s: 0.8 },
    { x: 62,   y: 62,  tex: 'villager_front', s: 0.8 }
  ],

  /* 맨 뒤, 성당 입구 가까이 — 아주 작게 */
  carlo: { x: 118, y: -60, s: 0.6 },

  /* 사진 한 장을 만들어 돌려줍니다 */
  build: function (scene, x, y, scale, opt) {
    opt = opt || {};
    const c = scene.add.container(x, y);

    c.add(scene.add.image(0, 0, 'epi_frame'));

    /* 사진 안쪽 — 밤의 본당 마당 */
    const inner = scene.add.graphics();
    inner.fillStyle(0x1b2740, 1);
    inner.fillRoundedRect(-148, -125, 296, 190, 6);
    c.add(inner);

    const ground = scene.add.graphics();
    ground.fillStyle(0x3d4a63, 1); ground.fillRect(-148, 10, 296, 55);
    ground.fillStyle(0x46536e, 1); ground.fillRect(-148, 10, 296, 5);
    c.add(ground);

    /* 성당 실루엣과 전구 */
    const chapel = scene.add.image(96, 12, 'church_front').setScale(0.4).setAlpha(0.5);
    c.add(chapel);
    const lights = scene.add.image(-40, -96, 'epi_lights').setScale(0.72).setAlpha(0.75);
    c.add(lights);

    /* 사람들 */
    const taps = [];
    EpiPhoto.people.forEach(function (p) {
      const img = scene.add.image(p.x, p.y, p.tex).setScale(p.s);
      c.add(img);
      if (p.id) taps.push({ id: p.id, img: img, x: p.x, y: p.y });
    });

    /* 그리고 맨 뒤에 카를로 */
    const carlo = scene.add.image(EpiPhoto.carlo.x, EpiPhoto.carlo.y, 'carlo_front')
      .setScale(EpiPhoto.carlo.s).setAlpha(opt.carloAlpha === undefined ? 0.95 : opt.carloAlpha);
    c.add(carlo);

    /* 아래 여백의 한 줄 */
    if (opt.caption !== false) {
      c.add(scene.add.text(0, 88, opt.caption || EPI.final.photoLabel,
        UI.style(12, PAL.inkSoft)).setOrigin(0.5));
    }

    c.setScale(scale === undefined ? 1 : scale);
    c.photoCarlo = carlo;
    c.photoTaps = taps;
    return c;
  }
};
