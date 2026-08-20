/* 사진 — 게임 화면의 일부를 잘라 사진첩에 보관하고, 휴대폰에도 저장합니다.
   사진은 기기 안에만 저장되며 어디로도 전송되지 않습니다. */

window.PhotoSystem = (function () {

  const KEY = 'carlo_walk_photos_v1';
  const MAX = 12;
  const SCALE = 2;                 // 또렷하게 보이도록 두 배로 키워 저장

  let photos = null;

  function load() {
    if (photos) return photos;
    try {
      const raw = window.localStorage.getItem(KEY);
      photos = raw ? JSON.parse(raw) : [];
    } catch (e) { photos = []; }
    return photos;
  }

  function persist() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(photos));
      return true;
    } catch (e) {
      return false;               // 저장 공간이 부족한 경우
    }
  }

  function list() { return load().slice().reverse(); }   // 최신 사진이 앞으로
  function count() { return load().length; }
  function isFull() { return load().length >= MAX; }

  function stamp(d) {
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* 화면의 사각형 영역을 잘라 사진으로 만듭니다. */
  function capture(scene, rect, place, done) {
    const g = scene.game;
    const x = Math.max(0, Math.round(rect.x));
    const y = Math.max(0, Math.round(rect.y));
    const w = Math.min(GAME.WIDTH - x, Math.round(rect.width));
    const h = Math.min(GAME.HEIGHT - y, Math.round(rect.height));

    g.renderer.snapshotArea(x, y, w, h, function (img) {
      const cv = document.createElement('canvas');
      cv.width = w * SCALE;
      cv.height = h * SCALE;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      try {
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
      } catch (e) {
        if (done) done(null);
        return;
      }

      /* 아래쪽에 작은 서명 */
      const barH = Math.max(26, Math.round(cv.height * 0.085));
      const grd = ctx.createLinearGradient(0, cv.height - barH * 1.6, 0, cv.height);
      grd.addColorStop(0, 'rgba(16,26,46,0)');
      grd.addColorStop(1, 'rgba(16,26,46,0.55)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, cv.height - barH * 1.6, cv.width, barH * 1.6);

      ctx.fillStyle = 'rgba(255,248,236,0.92)';
      ctx.font = Math.round(barH * 0.46) + "px 'Gowun Dodum','Apple SD Gothic Neo',sans-serif";
      ctx.textBaseline = 'middle';
      ctx.fillText('오늘, 카를로 아쿠티스와 함께 걷습니다', Math.round(barH * 0.4), cv.height - barH * 0.55);

      const when = stamp(new Date());
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255,248,236,0.7)';
      ctx.font = Math.round(barH * 0.38) + "px 'Gowun Dodum','Apple SD Gothic Neo',sans-serif";
      ctx.fillText(when, cv.width - Math.round(barH * 0.4), cv.height - barH * 0.55);

      const data = cv.toDataURL('image/jpeg', 0.82);
      if (done) done({ data: data, place: place || '', when: when, w: cv.width, h: cv.height });
    });
  }

  /* 사진첩에 보관합니다. 가득 차면 가장 오래된 사진을 비웁니다. */
  function add(photo) {
    load();
    const item = {
      id: 'p' + Date.now() + Math.floor(Math.random() * 1000),
      data: photo.data, place: photo.place, when: photo.when
    };
    photos.push(item);
    let removed = 0;
    while (photos.length > MAX) { photos.shift(); removed++; }
    let ok = persist();
    while (!ok && photos.length > 1) {          // 공간이 부족하면 오래된 것부터 비웁니다
      photos.shift(); removed++;
      ok = persist();
    }
    return { ok: ok, item: item, removed: removed };
  }

  function remove(id) {
    load();
    photos = photos.filter(function (p) { return p.id !== id; });
    persist();
  }

  function clear() { photos = []; persist(); }

  /* 휴대폰에 저장 — 브라우저에 따라 바로 받아지거나 새 창으로 열립니다. */
  function download(photo) {
    const name = 'carlo-walk-' + (photo.when || '').replace(/[.: ]/g, '') + '.jpg';
    try {
      const a = document.createElement('a');
      a.href = photo.data;
      a.download = name;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch (e) {
      try { window.open(photo.data, '_blank'); } catch (e2) {}
      return false;
    }
  }

  return {
    load: load, list: list, count: count, isFull: isFull, MAX: MAX,
    capture: capture, add: add, remove: remove, clear: clear, download: download
  };
})();
