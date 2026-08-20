/* 직접 적어보는 칸 — 브라우저의 입력창을 게임 화면 위에 얹습니다.
   입력이 어려운 환경에서는 조용히 건너뜁니다. */

window.TextInput = (function () {

  function supported(scene) {
    return !!(scene.add.dom && scene.game.domContainer);
  }

  /* opt: { x, y, width, height, placeholder, value } */
  function open(scene, opt, onChange) {
    opt = opt || {};
    if (!supported(scene)) return null;

    const w = opt.width || GAME.WIDTH - 76;
    const h = opt.height || 120;
    const html =
      '<textarea style="' +
      'width:' + w + 'px;height:' + h + 'px;' +
      'box-sizing:border-box;padding:14px 16px;' +
      'font-family:' + FONT.family.replace(/"/g, "'") + ';' +
      'font-size:18px;line-height:1.6;color:#3d2c20;' +
      'background:#fdf3e0;border:2px solid rgba(224,149,74,.6);border-radius:14px;' +
      'outline:none;resize:none;-webkit-appearance:none;" ' +
      'placeholder="' + (opt.placeholder || '') + '" ' +
      'maxlength="200">' + (opt.value || '') + '</textarea>';

    const el = scene.add.dom(opt.x || GAME.WIDTH / 2, opt.y || GAME.HEIGHT / 2).createFromHTML(html);
    el.setDepth(opt.depth === undefined ? 1200 : opt.depth);
    const area = el.node.querySelector('textarea');

    if (onChange) el.addListener('input').on('input', function () { onChange(area.value); });

    return {
      dom: el,
      focus: function () { try { area.focus(); } catch (e) {} },
      value: function () { return (area.value || '').trim(); },
      destroy: function () { el.destroy(); }
    };
  }

  return { open: open, supported: supported };
})();
