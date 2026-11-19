/* 사람 그리기 — 캔버스 2D 로 빛과 그늘, 머리결, 눈빛까지 그립니다.

   예전 사람은 둥근 도형 몇 개를 납작한 색으로 채운 것이었습니다.
   이제는 왼쪽 위에서 빛이 온다고 정하고, 모든 부분에 빛과 그늘을 줍니다.
   얼굴에는 흰자와 눈동자, 눈빛, 눈썹, 콧날, 입술, 볼의 혈색이 있고,
   머리는 결과 윤기가 있으며, 옷에는 주름과 솔기, 운동화에는 밑창과 끈이 있습니다.

   좌표는 예전과 같은 32 × 46 (논리 단위) — 가운데 x = 16, 발끝이 아래입니다.
   그래서 장면들의 크기·원점·물리 몸통은 하나도 바뀌지 않습니다.

   쓸 수 있는 선택지
     skin hair shirt pants shoes        필수 색
     back                               뒷모습
     step                               걷는 한 장 (다리를 벌리고 팔을 흔듭니다)
     stripe                             가슴의 가로 줄무늬 색
     bag                                뒷모습의 배낭 색
     hairStyle   short wavy long bob ponytail bun curly
     collar      'polo' 이면 깃이 달린 셔츠
     longSleeve  긴소매 (카디건처럼 단추를 달려면 cardigan: true)
     robe        발목까지 오는 긴 옷 (수도복·수단)
     veil        수녀님의 베일 색
     roman       사제의 로만칼라
     cap         주교의 작은 모자 색
     cross       가슴 십자가 (true 또는 색)
     crutch      목발
     child       어린이 (작고 머리가 조금 큽니다)
     eye         눈동자 색 */

window.Figure = (function () {

  /* ── 색 ─────────────────────────────────── */
  const SHADE = [42, 24, 20];          // 그늘은 차가운 회색이 아니라 따뜻한 갈색 쪽으로
  const LIGHT = [255, 247, 232];       // 빛은 따뜻한 흰색 쪽으로

  function rgbOf(n) { return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function tone(n, f) {
    const c = rgbOf(n), t = f < 0 ? SHADE : LIGHT, k = Math.min(1, Math.abs(f || 0));
    return [c[0] + (t[0] - c[0]) * k, c[1] + (t[1] - c[1]) * k, c[2] + (t[2] - c[2]) * k];
  }
  function col(n, f, a) {
    const c = tone(n, f);
    return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a === undefined ? 1 : a) + ')';
  }
  function lum(n) { const c = rgbOf(n); return (c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11) / 255; }

  /* ── 도형 ───────────────────────────────── */
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function ell(ctx, x, y, rx, ry) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  }
  /* 원기둥처럼 보이게 — 왼쪽은 밝고 오른쪽은 어둡게 */
  function hGrad(ctx, x0, x1, n, lit, dim) {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, col(n, lit));
    g.addColorStop(0.38, col(n, lit * 0.25));
    g.addColorStop(1, col(n, -dim));
    return g;
  }
  function vGrad(ctx, y0, y1, n, top, bottom) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, col(n, top));
    g.addColorStop(1, col(n, -bottom));
    return g;
  }

  /* ── 뼈대 ───────────────────────────────── */
  function bones(o) {
    const s = o.step ? 1 : 0;
    return {
      cx: 16,
      H: { x: 16, y: 9.0, rx: 6.0, ry: 6.8 },     // 머리: 예전보다 작아 몸이 3.3 등신쯤 됩니다
      shoulder: 17.6,
      hem: 28.9,
      legTop: 28.1,
      ankle: 41.6,
      legL: 13.1 - s * 1.5, legR: 18.9 + s * 1.5,
      footL: 12.6 - s * 2.4, footR: 19.4 + s * 2.4,
      liftL: s * 0.9,                              // 내딛는 다리는 발꿈치가 들려 조금 짧아 보입니다
      swingL: -s * 1.7, swingR: s * 0.9            // 팔은 다리와 엇갈려 흔듭니다
    };
  }

  /* ── 다리와 신발 ────────────────────────── */
  function legs(ctx, o, B, back) {
    if (o.robe) return;
    const P = o.pants;
    /* 골반 */
    ctx.fillStyle = hGrad(ctx, B.cx - 6.2, B.cx + 6.2, P, 0.12, 0.28);
    rr(ctx, B.cx - 6.0, B.legTop - 0.6, 12.0, 4.6, 1.8); ctx.fill();

    [[B.legL, B.liftL], [B.legR, 0]].forEach(function (L, i) {
      const x = L[0], lift = L[1], w = 4.9, top = B.legTop + 0.8, bot = B.ankle - lift + 0.4;
      ctx.fillStyle = hGrad(ctx, x - w / 2, x + w / 2, P, 0.16, 0.34 + i * 0.06);
      rr(ctx, x - w / 2, top, w, bot - top, 2.0); ctx.fill();
      /* 무릎에 닿는 빛 */
      ctx.fillStyle = col(P, 0.22, 0.35);
      ell(ctx, x - 0.7, top + (bot - top) * 0.48, 1.0, 1.6); ctx.fill();
      /* 바짓단 */
      ctx.fillStyle = col(P, -0.32, 0.8);
      rr(ctx, x - w / 2, bot - 1.0, w, 1.0, 0.5); ctx.fill();
    });

    /* 가랑이 사이의 어둠과 솔기 */
    ctx.strokeStyle = col(P, -0.45, 0.85); ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.moveTo(B.cx, B.legTop + 1.6); ctx.lineTo(B.cx, B.legTop + 4.4); ctx.stroke();
    /* 허리 */
    ctx.fillStyle = col(P, -0.25, 0.7);
    rr(ctx, B.cx - 6.0, B.legTop - 0.6, 12.0, 0.9, 0.4); ctx.fill();
    if (!back) {
      /* 주머니 */
      ctx.strokeStyle = col(P, -0.3, 0.55); ctx.lineWidth = 0.4;
      ctx.beginPath(); ctx.moveTo(B.cx - 5.2, B.legTop + 0.6); ctx.quadraticCurveTo(B.cx - 3.8, B.legTop + 2.6, B.cx - 2.6, B.legTop + 0.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(B.cx + 5.2, B.legTop + 0.6); ctx.quadraticCurveTo(B.cx + 3.8, B.legTop + 2.6, B.cx + 2.6, B.legTop + 0.4); ctx.stroke();
    }
  }

  function shoes(ctx, o, B, back) {
    const S = o.shoes;
    const light = lum(S) > 0.62;
    [[B.footL, B.liftL, -1], [B.footR, 0, 1]].forEach(function (F) {
      const x = F[0], lift = F[1], side = F[2];
      const y = B.ankle - 0.4 - lift;
      const t = side * 0.35;                         // 발끝이 바깥으로 조금 향합니다
      /* 겉감 */
      ctx.fillStyle = vGrad(ctx, y, y + 3.2, S, 0.2, light ? 0.18 : 0.32);
      ctx.beginPath();
      ctx.moveTo(x - 2.3 + t, y + 0.2);
      ctx.quadraticCurveTo(x + t, y - 0.45, x + 2.3 + t, y + 0.2);
      ctx.quadraticCurveTo(x + 3.0 + t, y + 1.2, x + 2.9 + t, y + 2.5);
      ctx.lineTo(x - 2.9 + t, y + 2.5);
      ctx.quadraticCurveTo(x - 3.0 + t, y + 1.2, x - 2.3 + t, y + 0.2);
      ctx.closePath(); ctx.fill();
      /* 밑창 */
      ctx.fillStyle = light ? 'rgba(190,182,170,1)' : col(S, -0.5);
      rr(ctx, x - 3.0 + t, y + 2.2, 6.0, 0.95, 0.45); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.32)';
      rr(ctx, x - 2.7 + t, y + 2.25, 5.4, 0.28, 0.14); ctx.fill();
      if (!back) {
        /* 발등과 끈 */
        ctx.fillStyle = col(S, light ? -0.07 : 0.12, 0.9);
        ell(ctx, x + t, y + 0.7, 1.25, 0.7); ctx.fill();
        ctx.strokeStyle = col(S, light ? -0.34 : 0.3, 0.8); ctx.lineWidth = 0.26;
        ctx.beginPath();
        ctx.moveTo(x - 0.75 + t, y + 0.45); ctx.lineTo(x + 0.75 + t, y + 0.6);
        ctx.moveTo(x - 0.7 + t, y + 1.0); ctx.lineTo(x + 0.7 + t, y + 1.15);
        ctx.stroke();
        /* 앞코의 빛 */
        ctx.fillStyle = 'rgba(255,255,255,' + (light ? 0.5 : 0.2) + ')';
        ell(ctx, x + side * 1.3 - 0.3, y + 1.6, 0.85, 0.38); ctx.fill();
      } else {
        /* 뒤꿈치 */
        ctx.fillStyle = col(S, -0.18, 0.75);
        rr(ctx, x - 1.4 + t, y + 0.3, 2.8, 1.8, 0.8); ctx.fill();
      }
    });
  }

  /* ── 몸통 ───────────────────────────────── */
  function torsoPath(ctx, B, o) {
    const cx = B.cx, top = B.shoulder;
    const hem = o.robe ? 42.4 : B.hem;
    const flare = o.robe ? 9.0 : 6.7;
    ctx.beginPath();
    ctx.moveTo(cx - 8.3, top + 1.9);
    ctx.quadraticCurveTo(cx - 8.5, top - 0.3, cx - 6.0, top - 0.5);
    ctx.lineTo(cx + 6.0, top - 0.5);
    ctx.quadraticCurveTo(cx + 8.5, top - 0.3, cx + 8.3, top + 1.9);
    ctx.quadraticCurveTo(cx + 7.0, top + 6.0, cx + (o.robe ? 7.4 : 6.9), top + 8.6);
    ctx.lineTo(cx + flare, hem);
    ctx.quadraticCurveTo(cx, hem + 0.7, cx - flare, hem);
    ctx.lineTo(cx - (o.robe ? 7.4 : 6.9), top + 8.6);
    ctx.quadraticCurveTo(cx - 7.0, top + 6.0, cx - 8.3, top + 1.9);
    ctx.closePath();
  }

  function torso(ctx, o, B, back) {
    const S = o.shirt, cx = B.cx, top = B.shoulder;
    const hem = o.robe ? 42.4 : B.hem;
    torsoPath(ctx, B, o);
    ctx.fillStyle = hGrad(ctx, cx - 9, cx + 9, S, 0.2, 0.34);
    ctx.fill();

    ctx.save();
    torsoPath(ctx, B, o);
    ctx.clip();
    /* 어깨에 닿는 빛, 아래로 갈수록 그늘 */
    const g = ctx.createLinearGradient(0, top - 1, 0, hem);
    g.addColorStop(0, col(S, 0.3, 0.55)); g.addColorStop(0.3, col(S, 0, 0)); g.addColorStop(1, col(S, -0.35, 0.55));
    ctx.fillStyle = g; ctx.fillRect(cx - 10, top - 1, 20, hem - top + 2);
    /* 겨드랑이 아래 그늘 */
    ctx.fillStyle = col(S, -0.38, 0.5);
    ell(ctx, cx - 7.2, top + 5.6, 1.4, 3.2); ctx.fill();
    ell(ctx, cx + 7.2, top + 5.6, 1.4, 3.2); ctx.fill();
    /* 가슴의 줄무늬 */
    if (o.stripe !== undefined && o.stripe !== null) {
      ctx.fillStyle = hGrad(ctx, cx - 9, cx + 9, o.stripe, 0.08, 0.22);
      ctx.fillRect(cx - 10, top + 5.8, 20, 1.8);
      ctx.fillStyle = col(o.stripe, -0.3, 0.35);
      ctx.fillRect(cx - 10, top + 7.4, 20, 0.35);
    }
    /* 옷 주름 */
    ctx.strokeStyle = col(S, -0.32, 0.55); ctx.lineWidth = 0.45;
    ctx.beginPath();
    if (o.robe) {
      ctx.moveTo(cx - 3.6, top + 12); ctx.quadraticCurveTo(cx - 4.2, top + 18, cx - 4.8, hem - 0.4);
      ctx.moveTo(cx + 3.0, top + 13); ctx.quadraticCurveTo(cx + 3.6, top + 19, cx + 4.4, hem - 0.4);
    } else {
      ctx.moveTo(cx - 4.4, hem - 3.6); ctx.quadraticCurveTo(cx - 3.0, hem - 2.0, cx - 3.6, hem - 0.4);
      ctx.moveTo(cx + 2.6, hem - 4.2); ctx.quadraticCurveTo(cx + 3.8, hem - 2.4, cx + 3.2, hem - 0.4);
    }
    ctx.stroke();
    if (back) {
      /* 등의 골과 날개뼈에 닿는 빛 */
      ctx.strokeStyle = col(S, -0.3, 0.45); ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx, top + 1.5); ctx.lineTo(cx, top + 9.5); ctx.stroke();
      ctx.fillStyle = col(S, 0.25, 0.35);
      ell(ctx, cx - 3.6, top + 3.2, 2.4, 1.6); ctx.fill();
    }
    ctx.restore();

    /* 밑단 */
    if (!o.robe) {
      ctx.fillStyle = col(S, -0.3, 0.7);
      ctx.beginPath();
      ctx.moveTo(cx - 6.9, hem - 0.7); ctx.quadraticCurveTo(cx, hem + 0.1, cx + 6.9, hem - 0.7);
      ctx.lineTo(cx + 6.7, hem); ctx.quadraticCurveTo(cx, hem + 0.7, cx - 6.7, hem);
      ctx.closePath(); ctx.fill();
    }
    if (back) return;

    /* 앞 — 깃과 단추 */
    if (o.collar === 'polo') {
      /* 단추 섶 */
      ctx.fillStyle = col(S, -0.14);
      rr(ctx, cx - 0.65, top + 0.4, 1.3, 5.0, 0.5); ctx.fill();
      ctx.fillStyle = col(S, 0.5);
      ell(ctx, cx, top + 1.9, 0.38, 0.38); ctx.fill();
      ell(ctx, cx, top + 3.7, 0.38, 0.38); ctx.fill();
      /* 깃 두 장 */
      [-1, 1].forEach(function (sd) {
        ctx.beginPath();
        ctx.moveTo(cx + sd * 0.3, top + 0.9);
        ctx.lineTo(cx + sd * 3.9, top - 0.9);
        ctx.lineTo(cx + sd * 2.0, top + 2.9);
        ctx.closePath();
        ctx.fillStyle = col(S, sd < 0 ? 0.18 : 0.02); ctx.fill();
        ctx.strokeStyle = col(S, -0.38, 0.8); ctx.lineWidth = 0.35; ctx.stroke();
      });
    } else if (o.cardigan) {
      ctx.strokeStyle = col(S, -0.35, 0.8); ctx.lineWidth = 0.45;
      ctx.beginPath(); ctx.moveTo(cx, top + 0.6); ctx.lineTo(cx, hem - 0.4); ctx.stroke();
      ctx.fillStyle = col(S, 0.45);
      [3.2, 6.2, 9.2].forEach(function (d) { ell(ctx, cx + 0.9, top + d, 0.4, 0.4); ctx.fill(); });
    } else if (o.robe && !o.veil) {
      /* 수단의 단추 */
      ctx.fillStyle = col(S, 0.4, 0.9);
      for (let d = 2.6; d < 22; d += 2.4) { ell(ctx, cx, top + d, 0.32, 0.32); ctx.fill(); }
    } else if (!o.roman && !o.veil) {
      /* 둥근 목둘레 */
      ctx.fillStyle = col(S, -0.42);
      ell(ctx, cx, top + 0.1, 2.7, 1.25); ctx.fill();
    }
  }

  /* ── 팔 ─────────────────────────────────── */
  function arms(ctx, o, B, back) {
    const sleeve = o.shirt;
    const longS = o.longSleeve || o.robe;
    [[-1, B.swingL], [1, B.swingR]].forEach(function (A) {
      const s = A[0], swing = back ? -A[1] : A[1];
      const L = 10.6 + swing;                  // 앞으로 흔든 팔은 짧아 보입니다
      ctx.save();
      ctx.translate(B.cx + s * 7.7, B.shoulder + 0.6);
      ctx.rotate(-s * 0.1);
      /* 팔 (살) */
      ctx.fillStyle = hGrad(ctx, -1.8, 1.8, o.skin, 0.12, 0.26 + (s > 0 ? 0.06 : 0));
      rr(ctx, -1.55, 0, 3.1, L, 1.55); ctx.fill();
      /* 소매 */
      const sl = longS ? L - 1.0 : 5.0;
      ctx.fillStyle = hGrad(ctx, -2.1, 2.1, sleeve, 0.18, 0.32 + (s > 0 ? 0.06 : 0));
      rr(ctx, -2.0, -0.9, 4.0, sl + 0.9, 1.9); ctx.fill();
      ctx.fillStyle = col(sleeve, -0.34, 0.75);
      rr(ctx, -2.0, sl - 0.75, 4.0, 0.75, 0.38); ctx.fill();
      if (o.stripe !== undefined && o.stripe !== null && !longS) {
        ctx.fillStyle = col(o.stripe, 0, 0.95);
        ctx.fillRect(-2.0, 2.7, 4.0, 0.95);
      }
      /* 손 */
      const hg = ctx.createRadialGradient(-0.5, L + 0.2, 0.2, 0, L + 0.6, 2.2);
      hg.addColorStop(0, col(o.skin, 0.12)); hg.addColorStop(1, col(o.skin, -0.18));
      ctx.fillStyle = hg;
      ell(ctx, 0, L + 0.6, 1.45, 1.7); ctx.fill();
      ctx.strokeStyle = col(o.skin, -0.3, 0.6); ctx.lineWidth = 0.28;
      ctx.beginPath(); ctx.moveTo(-s * 0.75, L + 0.15); ctx.lineTo(-s * 0.75, L + 1.2); ctx.stroke();
      ctx.restore();
    });
  }

  /* ── 목과 머리 ──────────────────────────── */
  function neck(ctx, o, B) {
    const cx = B.cx;
    ctx.fillStyle = hGrad(ctx, cx - 2, cx + 2, o.skin, 0.04, 0.24);
    rr(ctx, cx - 1.9, B.H.y + 4.4, 3.8, B.shoulder - B.H.y - 3.8, 1.2); ctx.fill();
    /* 턱 아래 그늘 */
    ctx.fillStyle = col(o.skin, -0.34, 0.6);
    ell(ctx, cx, B.H.y + 5.9, 2.2, 1.0); ctx.fill();
  }

  function headPath(ctx, H) {
    const x = H.x, y = H.y, rx = H.rx, ry = H.ry;
    ctx.beginPath();
    ctx.ellipse(x, y - 0.3, rx, ry * 0.97, 0, Math.PI, 0);
    ctx.bezierCurveTo(x + rx, y + ry * 0.5, x + rx * 0.55, y + ry * 0.98, x, y + ry);
    ctx.bezierCurveTo(x - rx * 0.55, y + ry * 0.98, x - rx, y + ry * 0.5, x - rx, y - 0.3);
    ctx.closePath();
  }

  function ears(ctx, o, H) {
    [-1, 1].forEach(function (s) {
      const x = H.x + s * (H.rx - 0.15), y = H.y + 0.9;
      ctx.fillStyle = col(o.skin, s > 0 ? -0.12 : 0.02);
      ell(ctx, x, y, 1.2, 1.85); ctx.fill();
      ctx.fillStyle = col(o.skin, -0.3, 0.8);
      ell(ctx, x + s * 0.15, y + 0.1, 0.5, 0.95); ctx.fill();
    });
  }

  function face(ctx, o, H) {
    const x = H.x, y = H.y;
    headPath(ctx, H);
    const g = ctx.createRadialGradient(x - H.rx * 0.38, y - H.ry * 0.3, 0.4, x, y + 0.6, H.rx * 1.55);
    g.addColorStop(0, col(o.skin, 0.14));
    g.addColorStop(0.5, col(o.skin, 0));
    g.addColorStop(1, col(o.skin, -0.2));
    ctx.fillStyle = g; ctx.fill();
  }

  function features(ctx, o, H) {
    const x = H.x, y = H.y;
    const eyeY = y + 0.5;
    const iris = o.eye !== undefined ? o.eye : 0x3a2a20;
    const browC = o.veil ? 0x4a3a30 : o.hair;

    /* 볼의 혈색 */
    [-1, 1].forEach(function (s) {
      const g = ctx.createRadialGradient(x + s * 3.3, y + 2.5, 0.1, x + s * 3.3, y + 2.5, 1.9);
      g.addColorStop(0, 'rgba(236,128,112,0.32)'); g.addColorStop(1, 'rgba(236,128,112,0)');
      ctx.fillStyle = g; ell(ctx, x + s * 3.3, y + 2.5, 1.9, 1.4); ctx.fill();
    });

    /* 눈 — 흰자, 눈동자, 눈빛, 윗눈꺼풀 */
    [-1, 1].forEach(function (s) {
      const ex = x + s * 2.45;
      ctx.fillStyle = '#fbf6ee';
      ell(ctx, ex, eyeY, 1.38, 0.98); ctx.fill();
      ctx.save();
      ell(ctx, ex, eyeY, 1.38, 0.98); ctx.clip();
      const ig = ctx.createRadialGradient(ex, eyeY + 0.35, 0.1, ex, eyeY, 1.05);
      ig.addColorStop(0, col(iris, 0.28)); ig.addColorStop(1, col(iris, -0.3));
      ctx.fillStyle = ig; ell(ctx, ex + s * 0.05, eyeY + 0.08, 0.98, 0.98); ctx.fill();
      ctx.fillStyle = 'rgba(18,10,8,0.95)'; ell(ctx, ex + s * 0.05, eyeY + 0.08, 0.46, 0.46); ctx.fill();
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ell(ctx, ex + 0.38, eyeY - 0.3, 0.3, 0.3); ctx.fill();
      ctx.strokeStyle = 'rgba(40,24,18,0.9)'; ctx.lineWidth = 0.42;
      ctx.beginPath(); ctx.ellipse(ex, eyeY + 0.12, 1.45, 1.05, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
      /* 눈썹 */
      ctx.strokeStyle = col(browC, -0.12, 0.92); ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(ex - s * 1.3 + (s > 0 ? 0 : 0), eyeY - 1.75);
      ctx.quadraticCurveTo(ex, eyeY - 2.35, ex + s * 1.35, eyeY - 1.9);
      ctx.stroke();
    });

    /* 코 — 콧날의 빛과 콧망울 그늘 */
    ctx.fillStyle = col(o.skin, 0.32, 0.6);
    ell(ctx, x - 0.25, y + 1.6, 0.35, 0.9); ctx.fill();
    ctx.strokeStyle = col(o.skin, -0.38, 0.75); ctx.lineWidth = 0.42;
    ctx.beginPath(); ctx.moveTo(x - 0.75, y + 2.75); ctx.quadraticCurveTo(x, y + 3.15, x + 0.85, y + 2.7); ctx.stroke();

    /* 입 — 살짝 웃는 입꼬리와 아랫입술 */
    ctx.strokeStyle = 'rgba(160,82,72,0.95)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(x - 1.35, y + 4.15); ctx.quadraticCurveTo(x, y + 4.85, x + 1.35, y + 4.15); ctx.stroke();
    ctx.fillStyle = 'rgba(214,128,116,0.55)';
    ell(ctx, x, y + 4.95, 0.85, 0.35); ctx.fill();
  }

  /* ── 머리카락 ───────────────────────────── */
  function hairFill(ctx, o, y0, y1) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, col(o.hair, 0.2));
    g.addColorStop(0.45, col(o.hair, 0));
    g.addColorStop(1, col(o.hair, -0.25));
    return g;
  }
  function shine(ctx, o, x0, y0, cx, cy, x1, y1, w, a) {
    ctx.strokeStyle = col(o.hair, 0.55, a === undefined ? 0.55 : a); ctx.lineWidth = w || 0.8;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke();
  }
  function strands(ctx, o, list) {
    ctx.strokeStyle = col(o.hair, -0.35, 0.6); ctx.lineWidth = 0.32;
    ctx.beginPath();
    list.forEach(function (s) { ctx.moveTo(s[0], s[1]); ctx.quadraticCurveTo(s[2], s[3], s[4], s[5]); });
    ctx.stroke();
  }

  /* 머리 모양을 채운 뒤, 그 모양 안에서만 윤기와 결을 그립니다 — 밖으로 삐져나오지 않게 */
  function inside(ctx, fn) {
    ctx.save(); ctx.clip(); fn(); ctx.restore();
  }

  /* 정수리 — 두개골보다 조금 부풀어 오른 타원. 왼쪽 관자놀이에서 오른쪽 관자놀이까지 */
  function crown(ctx, H, w, lift) {
    ctx.ellipse(H.x, H.y - 0.4, H.rx + w, H.ry * 0.97 + lift, 0, Math.PI, 0);
  }

  function liftOf(st) { return st === 'curly' ? 1.6 : st === 'wavy' ? 1.0 : st === 'bun' || st === 'ponytail' ? 0.6 : st === 'long' || st === 'bob' ? 0.85 : 0.75; }

  /* 얼굴 뒤로 내려오는 머리 (긴 머리·단발·묶은 머리의 뒤쪽) */
  function hairBehind(ctx, o, H) {
    const x = H.x, y = H.y, st = o.hairStyle;
    if (st === 'long') {
      ctx.fillStyle = hairFill(ctx, o, y - 6, y + 15);
      ctx.beginPath();
      ctx.moveTo(x - H.rx - 1.0, y - 0.6);
      ctx.quadraticCurveTo(x - H.rx - 2.0, y + 8.0, x - H.rx - 1.0, y + 14.2);
      ctx.quadraticCurveTo(x, y + 15.2, x + H.rx + 1.0, y + 14.2);
      ctx.quadraticCurveTo(x + H.rx + 2.0, y + 8.0, x + H.rx + 1.0, y - 0.6);
      ctx.closePath(); ctx.fill();
    } else if (st === 'bob') {
      ctx.fillStyle = hairFill(ctx, o, y - 6, y + 7);
      ctx.beginPath();
      ctx.moveTo(x - H.rx - 1.2, y - 0.6);
      ctx.quadraticCurveTo(x - H.rx - 1.7, y + 4.6, x - H.rx - 0.4, y + 6.2);
      ctx.lineTo(x + H.rx + 0.4, y + 6.2);
      ctx.quadraticCurveTo(x + H.rx + 1.7, y + 4.6, x + H.rx + 1.2, y - 0.6);
      ctx.closePath(); ctx.fill();
    } else if (st === 'ponytail' && !o.back) {
      ctx.fillStyle = hairFill(ctx, o, y, y + 10);
      ell(ctx, x + H.rx + 0.8, y + 4.0, 1.45, 3.8); ctx.fill();
    } else if (st === 'bun' && !o.back) {
      ctx.fillStyle = hairFill(ctx, o, y - H.ry - 4, y - H.ry + 2);
      ell(ctx, x, y - H.ry - 0.9, 2.7, 2.2); ctx.fill();
      inside(ctx, function () {
        shine(ctx, o, x - 1.7, y - H.ry - 1.0, x - 0.4, y - H.ry - 2.6, x + 1.1, y - H.ry - 2.0, 0.55);
      });
    }
  }

  /* 앞모습의 머리 */
  function hairFront(ctx, o, H) {
    const x = H.x, y = H.y, rx = H.rx, ry = H.ry;
    const st = o.hairStyle || 'short';
    const lift = liftOf(st);
    const top = y - 0.4 - ry * 0.97 - lift;          // 머리카락의 가장 높은 곳
    ctx.fillStyle = hairFill(ctx, o, top, y + 2);

    if (st === 'curly') {
      const bumps = [[-6.3, 0.6], [-6.7, -2.0], [-5.8, -4.5], [-3.9, -6.3], [-1.3, -7.3], [1.4, -7.3], [3.9, -6.2], [5.8, -4.4], [6.7, -1.9], [6.3, 0.7]];
      ctx.beginPath();
      bumps.forEach(function (b) { ctx.moveTo(x + b[0] + 2.0, y + b[1]); ctx.ellipse(x + b[0], y + b[1], 2.0, 1.9, 0, 0, Math.PI * 2); });
      ctx.moveTo(x + rx + 0.4, y - 1.4);
      ctx.ellipse(x, y - 1.4, rx + 0.4, ry * 0.88, 0, 0, Math.PI, true);
      [[-3.7, -2.8], [-1.2, -3.3], [1.3, -3.2], [3.8, -2.7]].forEach(function (b) {
        ctx.moveTo(x + b[0] + 1.45, y + b[1]); ctx.ellipse(x + b[0], y + b[1], 1.45, 1.15, 0, 0, Math.PI * 2);
      });
      ctx.fill();
      inside(ctx, function () {
        ctx.strokeStyle = col(o.hair, 0.42, 0.5); ctx.lineWidth = 0.4;
        bumps.forEach(function (b, i) {
          if (i % 2) return;
          ctx.beginPath(); ctx.arc(x + b[0] - 0.3, y + b[1] - 0.3, 1.0, Math.PI * 1.1, Math.PI * 1.75); ctx.stroke();
        });
      });
      return;
    }

    ctx.beginPath();
    if (st === 'bun' || st === 'ponytail') {
      /* 넘겨 빗은 머리 — 가르마와 귀 위로 넘긴 결 */
      ctx.moveTo(x - rx - 0.45, y + 1.0);
      crown(ctx, H, 0.45, lift);
      ctx.lineTo(x + rx + 0.45, y + 1.0);
      ctx.quadraticCurveTo(x + rx - 0.4, y - 2.2, x + 1.0, y - 3.6);
      ctx.quadraticCurveTo(x - 0.2, y - 3.1, x - 0.6, y - 3.8);
      ctx.quadraticCurveTo(x - rx + 0.6, y - 2.3, x - rx - 0.45, y + 1.0);
      ctx.closePath(); ctx.fill();
      inside(ctx, function () {
        shine(ctx, o, x - rx * 0.75, y - ry * 0.55, x - rx * 0.3, top + 1.1, x + rx * 0.3, top + 1.0, 0.75);
        strands(ctx, o, [[x - 0.6, y - 3.8, x - 3.0, y - 6.2, x - 5.6, y - 1.6], [x + 1.0, y - 3.6, x + 3.6, y - 6.0, x + 5.6, y - 1.4]]);
      });
      return;
    }

    if (st === 'long' || st === 'bob') {
      /* 가르마를 타고 얼굴 옆으로 흘러내리는 머리 */
      const end = st === 'long' ? y + 11.4 : y + 5.8;
      ctx.moveTo(x - rx - 1.0, end);
      ctx.quadraticCurveTo(x - rx - 1.5, y + 2.0, x - rx - 0.6, y - 0.4);
      crown(ctx, H, 0.6, lift);
      ctx.quadraticCurveTo(x + rx + 1.5, y + 2.0, x + rx + 1.0, end);
      ctx.lineTo(x + rx - 0.2, end);
      ctx.quadraticCurveTo(x + rx - 0.2, y + 0.6, x + rx - 1.3, y - 2.0);
      if (st === 'bob') {
        /* 일자로 내린 앞머리 */
        ctx.lineTo(x + rx - 1.1, y - 2.5);
        ctx.quadraticCurveTo(x, y - 2.0, x - rx + 1.1, y - 2.5);
        ctx.lineTo(x - rx + 1.3, y - 2.0);
      } else {
        ctx.quadraticCurveTo(x + 1.6, y - 2.6, x - 0.4, y - 4.3);
        ctx.quadraticCurveTo(x - 2.6, y - 2.4, x - rx + 1.3, y - 2.0);
      }
      ctx.quadraticCurveTo(x - rx + 0.2, y + 0.6, x - rx + 0.2, end);
      ctx.closePath(); ctx.fill();
      inside(ctx, function () {
        shine(ctx, o, x - rx * 0.8, y - ry * 0.45, x - rx * 0.35, top + 1.1, x + rx * 0.25, top + 1.0, 0.8);
        strands(ctx, o, [[x - rx - 0.4, y - 0.6, x - rx - 0.8, y + 4.0, x - rx - 0.4, end - 0.8],
          [x + rx + 0.4, y - 0.6, x + rx + 0.8, y + 4.0, x + rx + 0.4, end - 0.8],
          [x - 0.4, top + 0.8, x - 2.4, y - 4.6, x - 4.2, y - 2.4]]);
      });
      return;
    }

    /* 짧은 머리(기본)와 물결 머리 — 귀가 드러나도록 옆은 짧게, 구레나룻은 가늘게 */
    const wavy = st === 'wavy';
    const w = wavy ? 0.5 : 0.3;
    ctx.moveTo(x - rx + 0.9, y + 2.4);
    ctx.lineTo(x - rx - 0.1, y + 0.6);
    ctx.lineTo(x - rx - w, y - 0.4);
    crown(ctx, H, w, lift);
    ctx.lineTo(x + rx + 0.1, y + 0.6);
    ctx.lineTo(x + rx - 0.9, y + 2.4);
    ctx.lineTo(x + rx - 1.5, y + 0.4);
    ctx.lineTo(x + rx - 1.2, y - 2.4);
    if (wavy) {
      /* 왼쪽 가르마에서 오른쪽으로 넘긴 물결 */
      ctx.quadraticCurveTo(x + 4.9, y - 3.5, x + 3.6, y - 4.5);
      ctx.quadraticCurveTo(x + 2.7, y - 3.3, x + 1.0, y - 3.9);
      ctx.quadraticCurveTo(x - 0.1, y - 4.1, x - 1.1, y - 5.0);
      ctx.quadraticCurveTo(x - 1.9, y - 4.6, x - 2.5, y - 5.4);
      ctx.quadraticCurveTo(x - 3.9, y - 3.9, x - rx + 1.2, y - 2.6);
    } else {
      ctx.quadraticCurveTo(x + 3.4, y - 2.9, x + 2.4, y - 3.9);
      ctx.quadraticCurveTo(x + 1.0, y - 2.9, x - 0.5, y - 3.8);
      ctx.quadraticCurveTo(x - 2.2, y - 2.8, x - 3.7, y - 3.6);
      ctx.quadraticCurveTo(x - 4.9, y - 2.6, x - rx + 1.2, y - 2.4);
    }
    ctx.lineTo(x - rx + 1.5, y + 0.4);
    ctx.closePath(); ctx.fill();

    if (wavy) {
      /* 옆머리의 웨이브 — 테두리가 물결지게 */
      [[x - rx - 0.35, y - 2.2, 1.05, 1.3], [x - rx + 0.5, y - 4.7, 1.2, 1.1], [x + rx + 0.3, y - 1.9, 1.0, 1.25], [x + rx - 0.6, y - 4.5, 1.15, 1.05]]
        .forEach(function (b) { ell(ctx, b[0], b[1], b[2], b[3]); ctx.fill(); });
    }

    ctx.beginPath();
    ctx.moveTo(x - rx - w, y - 0.4);
    crown(ctx, H, w, lift);
    ctx.lineTo(x + rx - 1.2, y - 2.4);
    ctx.lineTo(x - rx + 1.2, y - 2.4);
    ctx.closePath();
    inside(ctx, function () {
      shine(ctx, o, x - rx * 0.78, y - ry * 0.5, x - rx * 0.3, top + 1.15, x + rx * 0.35, top + 1.1, wavy ? 0.9 : 0.75);
      if (wavy) {
        ctx.strokeStyle = col(o.hair, 0.42, 0.5); ctx.lineWidth = 0.45;
        ctx.beginPath(); ctx.arc(x + 2.6, y - 4.6, 1.4, Math.PI * 1.0, Math.PI * 1.7); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 0.2, y - 5.6, 1.3, Math.PI * 1.1, Math.PI * 1.8); ctx.stroke();
        /* 가르마 */
        ctx.strokeStyle = col(o.skin, -0.1, 0.55); ctx.lineWidth = 0.3;
        ctx.beginPath(); ctx.moveTo(x - 2.5, y - 5.4); ctx.quadraticCurveTo(x - 2.3, top + 3.0, x - 1.6, top + 1.2); ctx.stroke();
      }
      strands(ctx, o, wavy
        ? [[x - 1.6, top + 1.4, x + 1.4, y - 5.6, x + 3.6, y - 4.5], [x - 1.8, top + 2.4, x + 0.4, y - 4.6, x + 1.0, y - 3.9], [x - 2.8, top + 2.0, x - 3.6, y - 4.4, x - 4.6, y - 2.8]]
        : [[x - 1.4, top + 1.0, x - 2.4, y - 4.8, x - 3.7, y - 3.6], [x + 0.6, top + 0.8, x + 0.4, y - 4.6, x - 0.5, y - 3.8], [x + 2.6, top + 1.4, x + 3.0, y - 4.6, x + 2.4, y - 3.9]]);
    });
  }

  /* 뒷모습의 머리 */
  function hairBack(ctx, o, H) {
    const x = H.x, y = H.y, rx = H.rx, ry = H.ry;
    const st = o.hairStyle || 'short';
    const lift = liftOf(st);
    const top = y - 0.4 - ry * 0.97 - lift;
    const nape = st === 'long' ? y + 14.4 : st === 'bob' ? y + 6.2 : y + 5.0;
    ctx.fillStyle = hairFill(ctx, o, top, nape);

    if (st === 'curly') {
      ctx.beginPath();
      for (let a = 0; a < 14; a++) {
        const t = Math.PI * (0.92 + a * 0.093);
        const bx = x + Math.cos(t) * (rx + 0.4), by = y - 0.6 + Math.sin(t) * (ry + 0.5);
        ctx.moveTo(bx + 1.9, by); ctx.ellipse(bx, by, 1.9, 1.8, 0, 0, Math.PI * 2);
      }
      ctx.moveTo(x + rx + 0.6, y - 0.6); ctx.ellipse(x, y - 0.6, rx + 0.6, ry + 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      inside(ctx, function () {
        ctx.strokeStyle = col(o.hair, 0.4, 0.45); ctx.lineWidth = 0.4;
        for (let a = 0; a < 7; a++) {
          ctx.beginPath(); ctx.arc(x - 4 + a * 1.4, y - 3 + (a % 2) * 2.2, 0.9, Math.PI, Math.PI * 1.8); ctx.stroke();
        }
      });
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x - rx - 0.35, y + 1.2);
    crown(ctx, H, 0.35, lift);
    ctx.lineTo(x + rx + 0.35, y + 1.2);
    if (st === 'long' || st === 'bob') {
      const sw = st === 'long' ? 1.2 : 1.0;
      ctx.quadraticCurveTo(x + rx + sw + 0.6, y + (nape - y) * 0.55, x + rx + sw - 0.3, nape);
      ctx.quadraticCurveTo(x, nape + 0.8, x - rx - sw + 0.3, nape);
      ctx.quadraticCurveTo(x - rx - sw - 0.6, y + (nape - y) * 0.55, x - rx - 0.5, y + 1.2);
    } else {
      /* 목덜미로 갈수록 좁아지는 짧은 머리 */
      ctx.bezierCurveTo(x + rx + 0.2, y + 3.4, x + 3.6, y + 4.4, x + 2.7, nape);
      ctx.quadraticCurveTo(x, nape + 0.6, x - 2.7, nape);
      ctx.bezierCurveTo(x - 3.6, y + 4.4, x - rx - 0.2, y + 3.4, x - rx - 0.5, y + 1.2);
    }
    ctx.closePath(); ctx.fill();

    if (st === 'wavy') {
      /* 뒤에서 봐도 물결지는 옆머리와 목덜미 */
      [[x - rx - 0.3, y - 1.8, 1.05, 1.3], [x + rx + 0.3, y - 1.5, 1.05, 1.3],
       [x - rx + 0.4, y + 1.9, 1.1, 1.1], [x + rx - 0.4, y + 2.1, 1.1, 1.1],
       [x - 1.4, nape - 0.2, 1.2, 0.9], [x + 1.4, nape - 0.1, 1.2, 0.9]]
        .forEach(function (b) { ell(ctx, b[0], b[1], b[2], b[3]); ctx.fill(); });
      ctx.beginPath();
      ctx.moveTo(x - rx - 0.35, y + 1.2); crown(ctx, H, 0.35, lift); ctx.lineTo(x + rx + 0.35, y + 1.2);
      ctx.lineTo(x + 2.7, nape); ctx.lineTo(x - 2.7, nape); ctx.closePath();
    }
    inside(ctx, function () {
      /* 정수리의 은은한 윤기, 가마로 모이는 결 */
      shine(ctx, o, x - rx * 0.8, y - ry * 0.35, x - rx * 0.35, top + 1.2, x + rx * 0.2, top + 1.1, 0.7, 0.32);
      strands(ctx, o, [[x - 1.6, top + 1.6, x - 4.0, y - 2.6, x - 4.6, y + 1.0], [x + 2.4, top + 1.6, x + 4.6, y - 2.0, x + 4.4, y + 1.4]]);
      strands(ctx, o, [[x + 0.6, y - 4.4, x - 2.6, y - 2.0, x - 4.0, y + 2.2],
        [x + 0.6, y - 4.4, x + 3.0, y - 2.0, x + 4.0, y + 2.4],
        [x + 0.6, y - 4.4, x + 0.6, y - 1.0, x + 0.2, nape - 0.8]]);
      ctx.strokeStyle = col(o.hair, -0.4, 0.7); ctx.lineWidth = 0.35;
      ctx.beginPath(); ctx.arc(x + 0.6, y - 4.4, 0.8, 0, Math.PI * 1.6); ctx.stroke();
    });

    if (st === 'ponytail') {
      ctx.fillStyle = hairFill(ctx, o, y, y + 13);
      ctx.beginPath();
      ctx.moveTo(x - 1.2, y + 0.4);
      ctx.quadraticCurveTo(x - 2.4, y + 7.0, x - 0.2, y + 12.6);
      ctx.quadraticCurveTo(x + 2.4, y + 7.0, x + 1.2, y + 0.4);
      ctx.closePath(); ctx.fill();
      inside(ctx, function () { shine(ctx, o, x - 0.6, y + 1.6, x - 1.2, y + 6.0, x - 0.4, y + 10.0, 0.5); });
      ctx.fillStyle = 'rgba(200,70,80,0.95)';
      rr(ctx, x - 1.35, y + 0.1, 2.7, 1.0, 0.5); ctx.fill();
    } else if (st === 'bun') {
      ctx.fillStyle = hairFill(ctx, o, y - 5, y + 1);
      ell(ctx, x, y - 1.8, 2.8, 2.5); ctx.fill();
      inside(ctx, function () { shine(ctx, o, x - 1.7, y - 2.2, x - 0.4, y - 3.9, x + 1.2, y - 3.3, 0.55); });
    }
  }

  /* ── 옷차림의 표지 ──────────────────────── */
  function veilBehind(ctx, o, H) {
    const x = H.x, y = H.y;
    ctx.fillStyle = vGrad(ctx, y - 9, y + 17, o.veil, 0.16, 0.32);
    ctx.beginPath();
    ctx.moveTo(x - H.rx - 1.4, y - 1.4);
    ctx.bezierCurveTo(x - H.rx - 2.0, y - H.ry - 3.6, x + H.rx + 2.0, y - H.ry - 3.6, x + H.rx + 1.4, y - 1.4);
    ctx.quadraticCurveTo(x + H.rx + 3.4, y + 8.0, x + H.rx + 2.8, y + (o.back ? 19.4 : 15.6));
    ctx.lineTo(x - H.rx - 2.8, y + (o.back ? 19.4 : 15.6));
    ctx.quadraticCurveTo(x - H.rx - 3.4, y + 8.0, x - H.rx - 1.4, y - 1.4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = col(o.veil, -0.4, 0.6); ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(x - H.rx - 1.2, y + 4); ctx.quadraticCurveTo(x - H.rx - 2.0, y + 9, x - H.rx - 1.6, y + 14);
    ctx.moveTo(x + H.rx + 1.2, y + 4); ctx.quadraticCurveTo(x + H.rx + 2.0, y + 9, x + H.rx + 1.6, y + 14);
    ctx.stroke();
  }

  function veilFront(ctx, o, H) {
    const x = H.x, y = H.y;
    /* 이마의 흰 띠와 턱 아래의 흰 깃 */
    ctx.fillStyle = vGrad(ctx, y - 6, y - 2, 0xf6f2ea, 0.05, 0.12);
    ctx.beginPath();
    ctx.moveTo(x - H.rx - 0.4, y - 1.4);
    ctx.bezierCurveTo(x - H.rx, y - H.ry - 1.0, x + H.rx, y - H.ry - 1.0, x + H.rx + 0.4, y - 1.4);
    ctx.quadraticCurveTo(x, y - 3.4, x - H.rx - 0.4, y - 1.4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = vGrad(ctx, y + 4, y + 9, 0xf6f2ea, 0.05, 0.16);
    ctx.beginPath();
    ctx.moveTo(x - 4.6, y + 4.6);
    ctx.quadraticCurveTo(x, y + 8.6, x + 4.6, y + 4.6);
    ctx.lineTo(x + 5.4, y + 8.0);
    ctx.quadraticCurveTo(x, y + 9.6, x - 5.4, y + 8.0);
    ctx.closePath(); ctx.fill();
  }

  function romanCollar(ctx, o, B) {
    const cx = B.cx, y = B.shoulder - 1.4;
    ctx.fillStyle = col(o.shirt, -0.1);
    rr(ctx, cx - 2.6, y - 0.4, 5.2, 1.8, 0.8); ctx.fill();
    ctx.fillStyle = '#f7f3ea';
    rr(ctx, cx - 0.85, y, 1.7, 1.25, 0.3); ctx.fill();
  }

  function zucchetto(ctx, o, H) {
    const x = H.x, y = H.y - H.ry - 0.2;
    ctx.fillStyle = vGrad(ctx, y - 2, y + 1.2, o.cap, 0.25, 0.25);
    ctx.beginPath(); ctx.ellipse(x, y + 0.6, 3.6, 2.0, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = col(o.cap, -0.3);
    ell(ctx, x, y + 0.6, 3.6, 0.5); ctx.fill();
  }

  function chestCross(ctx, o, B) {
    const cx = B.cx, y = B.shoulder + 3.6;
    const gold = o.cross === true ? 0xd7b45f : o.cross;
    ctx.strokeStyle = col(gold, -0.1, 0.8); ctx.lineWidth = 0.3;
    ctx.beginPath(); ctx.moveTo(cx - 2.6, B.shoulder - 0.6); ctx.lineTo(cx, y); ctx.lineTo(cx + 2.6, B.shoulder - 0.6); ctx.stroke();
    ctx.fillStyle = vGrad(ctx, y, y + 4.4, gold, 0.4, 0.2);
    rr(ctx, cx - 0.55, y, 1.1, 4.2, 0.3); ctx.fill();
    rr(ctx, cx - 1.7, y + 1.1, 3.4, 1.05, 0.3); ctx.fill();
  }

  function crutch(ctx, o, B) {
    const x = B.cx + 10.2;
    const wood = 0xb98a5e;
    ctx.fillStyle = hGrad(ctx, x - 0.9, x + 0.9, wood, 0.25, 0.3);
    rr(ctx, x - 0.75, B.shoulder + 2.4, 1.5, 44.6 - B.shoulder - 2.4, 0.7); ctx.fill();
    ctx.fillStyle = col(wood, -0.15);
    rr(ctx, x - 2.0, B.shoulder + 2.2, 4.0, 1.3, 0.6); ctx.fill();          // 팔걸이
    rr(ctx, x - 1.7, B.shoulder + 11.6, 3.4, 1.0, 0.5); ctx.fill();         // 손잡이
    ctx.fillStyle = '#4a3f3a';
    rr(ctx, x - 1.0, 43.6, 2.0, 1.4, 0.5); ctx.fill();                       // 고무 끝
  }

  function backpack(ctx, o, B) {
    const cx = B.cx, top = B.shoulder + 0.8;
    const C = o.bag;
    /* 어깨끈 */
    ctx.fillStyle = col(C, -0.25);
    rr(ctx, cx - 6.6, top - 1.4, 2.0, 4.0, 0.9); ctx.fill();
    rr(ctx, cx + 4.6, top - 1.4, 2.0, 4.0, 0.9); ctx.fill();
    /* 가방 몸통 */
    ctx.fillStyle = hGrad(ctx, cx - 7, cx + 7, C, 0.22, 0.32);
    rr(ctx, cx - 6.4, top, 12.8, 12.2, 3.2); ctx.fill();
    const g = ctx.createLinearGradient(0, top, 0, top + 12.2);
    g.addColorStop(0, col(C, 0.25, 0.5)); g.addColorStop(0.35, col(C, 0, 0)); g.addColorStop(1, col(C, -0.3, 0.5));
    ctx.fillStyle = g; rr(ctx, cx - 6.4, top, 12.8, 12.2, 3.2); ctx.fill();
    /* 손잡이 고리 */
    ctx.strokeStyle = col(C, -0.3); ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(cx, top + 0.2, 1.4, Math.PI, 0); ctx.stroke();
    /* 앞주머니와 지퍼 */
    ctx.fillStyle = col(C, -0.1);
    rr(ctx, cx - 4.4, top + 6.0, 8.8, 5.2, 1.8); ctx.fill();
    ctx.strokeStyle = col(C, -0.42, 0.85); ctx.lineWidth = 0.35;
    ctx.beginPath(); ctx.moveTo(cx - 3.6, top + 7.0); ctx.lineTo(cx + 3.6, top + 7.0); ctx.stroke();
    ctx.fillStyle = 'rgba(230,220,200,0.9)';
    rr(ctx, cx + 2.6, top + 6.7, 0.7, 1.4, 0.3); ctx.fill();
    /* 바늘땀 */
    ctx.setLineDash([0.5, 0.5]);
    ctx.strokeStyle = col(C, 0.35, 0.5); ctx.lineWidth = 0.25;
    rr(ctx, cx - 5.8, top + 0.6, 11.6, 11.0, 2.8); ctx.stroke();
    ctx.setLineDash([]);
  }

  /* ── 한 사람 ────────────────────────────── */
  function draw(ctx, o) {
    const B = bones(o);
    if (o.child) {
      /* 어린이 — 몸은 작게, 머리는 조금 크게 */
      B.H.rx *= 1.1; B.H.ry *= 1.08;
      ctx.translate(16, 45.4); ctx.scale(0.84, 0.84); ctx.translate(-16, -45.4);
    }
    const H = B.H;

    if (o.back) {
      legs(ctx, o, B, true);
      shoes(ctx, o, B, true);
      torso(ctx, o, B, true);
      arms(ctx, o, B, true);
      neck(ctx, o, B);
      if (o.bag && !o.veil) backpack(ctx, o, B);
      ears(ctx, o, H);
      if (o.veil) {
        veilBehind(ctx, o, H);
      } else {
        hairBack(ctx, o, H);
        if (o.cap) zucchetto(ctx, o, H);
      }
      return;
    }

    if (!o.veil) hairBehind(ctx, o, H);
    legs(ctx, o, B, false);
    shoes(ctx, o, B, false);
    torso(ctx, o, B, false);
    arms(ctx, o, B, false);
    if (o.veil) veilBehind(ctx, o, H);
    neck(ctx, o, B);
    if (!o.veil) ears(ctx, o, H);
    face(ctx, o, H);
    features(ctx, o, H);
    if (o.veil) {
      veilFront(ctx, o, H);
    } else {
      hairFront(ctx, o, H);
      if (o.cap) zucchetto(ctx, o, H);
    }
    if (o.roman) romanCollar(ctx, o, B);
    if (o.cross) chestCross(ctx, o, B);
    if (o.crutch) crutch(ctx, o, B);
  }

  /* 캔버스에 한 사람을 그립니다. R 은 논리 단위 하나에 들어가는 화소 수입니다.
     따로 그린 뒤 둘레에 옅은 테두리를 둘러, 어떤 배경 위에서도 또렷하게 떠오르게 합니다. */
  function render(target, o, R) {
    const W = target.canvas.width, Ht = target.canvas.height;
    const fig = document.createElement('canvas');
    fig.width = W; fig.height = Ht;
    const f = fig.getContext('2d');
    f.scale(R, R);
    f.lineCap = 'round'; f.lineJoin = 'round';
    draw(f, o);

    const sil = document.createElement('canvas');
    sil.width = W; sil.height = Ht;
    const s = sil.getContext('2d');
    s.drawImage(fig, 0, 0);
    s.globalCompositeOperation = 'source-in';
    s.fillStyle = 'rgba(46,28,22,0.52)';
    s.fillRect(0, 0, W, Ht);

    const k = Math.max(1, Math.round(R * 0.45));
    const d = Math.max(1, Math.round(k * 0.7));
    [[k, 0], [-k, 0], [0, k], [0, -k], [d, d], [-d, d], [d, -d], [-d, -d]].forEach(function (p) {
      target.drawImage(sil, p[0], p[1]);
    });
    target.drawImage(fig, 0, 0);
  }

  /* ── 대화창의 얼굴 ───────────────────────────
     같은 사람을 크게 다시 그려 머리와 어깨만 동그랗게 오려 냅니다. */
  const opts = {};
  function portrait(scene, texKey, size, ring) {
    const key = 'pt_' + texKey;
    if (scene.textures.exists(key)) return key;
    const o = opts[texKey];
    if (!o) return null;
    const R = window.HiTex ? HiTex.density(scene, 'figure') : 1;
    const S = Math.round(size * R);
    /* 먼저 사람 전체를 크게 그립니다 */
    const k = (size / 22) * R;                       // 머리와 어깨(가로 약 22칸)가 동그라미에 들어가게
    const full = document.createElement('canvas');
    full.width = Math.ceil(32 * k); full.height = Math.ceil(46 * k);
    render(full.getContext('2d'), o, k);
    /* 머리 꼭대기를 찾습니다 */
    const fc = full.getContext('2d');
    const data = fc.getImageData(0, 0, full.width, Math.ceil(full.height * 0.6)).data;
    let topY = 0;
    find: for (let y = 0; y < full.height * 0.6; y++) {
      for (let x = 0; x < full.width; x++) {
        if (data[(y * full.width + x) * 4 + 3] > 40) { topY = y; break find; }
      }
    }
    const tex = scene.textures.createCanvas(key, S, S);
    const ctx = tex.getContext();
    ctx.save();
    ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - R, 0, Math.PI * 2); ctx.closePath();
    const bg = ctx.createRadialGradient(S / 2, S * 0.38, S * 0.05, S / 2, S / 2, S / 2);
    bg.addColorStop(0, '#fff6e4'); bg.addColorStop(1, ring || '#e8cfa6');
    ctx.fillStyle = bg; ctx.fill();
    ctx.clip();
    ctx.drawImage(full, Math.round(S / 2 - 16 * k), Math.round(-topY + S * 0.1));
    ctx.restore();
    ctx.lineWidth = 2.5 * R;
    ctx.strokeStyle = ring || '#d2822f';
    ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 1.5 * R, 0, Math.PI * 2); ctx.stroke();
    if (window.HiTex) HiTex.mark(tex, R);
    tex.refresh();
    return key;
  }

  return { render: render, draw: draw, opts: opts, portrait: portrait };
})();
