/* 고른 주인공을 게임 전체에 입힙니다.
   모든 장면은 ‘player_…’ 그림을 쓰므로, 그 그림만 고른 모습으로 다시 그리면
   걷는 장면·이야기 장면·대화창 얼굴·미니게임에 한꺼번에 나타납니다. */

window.Hero = (function () {
  const KEYS = ['front', 'front_walk', 'back', 'back_walk', 'side', 'side_walk', 'side_walk2'];

  function byId(id) {
    return HEROES.find(function (h) { return h.id === id; }) || HEROES[0];
  }
  function currentId() { return SaveSystem.get('settings.hero', null) || HEROES[0].id; }

  return {
    /* 아직 한 번도 고르지 않았는지 — 처음 걸을 때 고르는 화면을 띄웁니다 */
    chosen: function () { return !!SaveSystem.get('settings.hero', null); },
    current: function () { return byId(currentId()); },
    byId: byId,
    look: function (id) { return byId(id || currentId()).look; },

    /* 미리 보기용 그림 — hero_<id>_front 등 */
    preview: function (scene, id) {
      const name = 'hero_' + id;
      TextureFactory.walker(scene, name, byId(id).look, { back: true });
      if (window.Figure && Figure.portrait) Figure.portrait(scene, name + '_front', 76, byId(id).ring);
      return name;
    },

    /* 고른 주인공으로 바꿉니다. 지금 화면에서 player_… 를 쓰는 그림은 잠시 비워 두었다가 다시 채웁니다. */
    choose: function (scene, id) {
      SaveSystem.set('settings.hero', byId(id).id);
      const tm = scene.textures;
      const users = [];
      scene.game.scene.getScenes(false).forEach(function (s) {
        if (!s.children) return;
        const walk = function (list) {
          list.forEach(function (o) {
            if (o.list) walk(o.list);
            if (o.texture && /^(pt_)?player_/.test(o.texture.key)) { users.push([o, o.texture.key]); o.setTexture('__DEFAULT'); }
          });
        };
        walk(s.children.list);
      });
      KEYS.forEach(function (k) { if (tm.exists('player_' + k)) tm.remove('player_' + k); });
      if (tm.exists('pt_player_front')) tm.remove('pt_player_front');
      TextureFactory.walker(scene, 'player', byId(id).look, { back: true });
      users.forEach(function (u) {
        if (/^pt_/.test(u[1]) && window.Figure) Figure.portrait(scene, u[1].slice(3), 64, byId(id).ring);
        if (tm.exists(u[1])) u[0].setTexture(u[1]);
      });
    }
  };
})();
