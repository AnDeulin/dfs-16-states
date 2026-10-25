/* Модель человека для 3D-сцен: стилизованный «стеклянный» манекен с позвоночником, черепом и рёбрами внутри.
   Размеры в метрах, y — вверх, человек смотрит в +z. Сидящая и лежащая позы. */
(function (G) {
  'use strict';
  var D = G.DFSC = G.DFSC || {};
  var T = G.THREE;
  if (!T) return;

  function V(x, y, z) { return new T.Vector3(x, y, z); }
  var UP = new T.Vector3(0, 1, 0);

  /* конечность: усечённый цилиндр + шаровые концы */
  function limb(p0, p1, r0, r1, mat) {
    var g = new T.Group(), d = p1.clone().sub(p0), len = d.length();
    var cyl = new T.Mesh(new T.CylinderGeometry(r1, r0, len, 22, 1, true), mat);
    cyl.position.copy(p0).add(p1).multiplyScalar(0.5);
    cyl.quaternion.setFromUnitVectors(UP, d.clone().normalize());
    g.add(cyl);
    [[p0, r0], [p1, r1]].forEach(function (a) {
      var s = new T.Mesh(new T.SphereGeometry(a[1], 20, 14), mat); s.position.copy(a[0]); g.add(s);
    });
    return g;
  }
  function ell(rx, ry, rz, mat, x, y, z) {
    var m = new T.Mesh(new T.SphereGeometry(1, 24, 16), mat); m.scale.set(rx, ry, rz); m.position.set(x || 0, y || 0, z || 0); return m;
  }
  function onSide(fn) { return [1, -1].map(fn); }

  /* ладонь: пластина + пять пальцев; flip — ладонью вверх */
  function hand(mat, side, palmUp, curl) {
    var g = new T.Group();
    var palm = ell(0.042, 0.011, 0.048, mat, 0, 0, 0); g.add(palm);
    for (var i = 0; i < 4; i++) {
      var x = (i - 1.5) * 0.019;
      g.add(limb(V(x, 0, 0.04), V(x * 1.15, 0.004, 0.092 - Math.abs(i - 1.5) * 0.006), 0.0085, 0.0065, mat));
    }
    g.add(limb(V(side * 0.036, 0, 0.012), V(side * 0.07, 0.004, 0.05), 0.0095, 0.0075, mat));
    if (palmUp) g.rotation.z = Math.PI;
    return g;
  }

  /* ---------- сидящий человек ---------- */
  D.makeSeatedHuman = function (opts) {
    opts = opts || {};
    var holo = function (o) { return D.holoMaterial(o); };
    var body = { color: 0x6f8ff0, rim: 0xd6ebff, base: 0.06, gain: 0.85, pow: 2.1 };
    var A = {};                                   // якоря и кривые
    var root = new T.Group();
    var parts = {};                               // отдельные слои тела

    /* --- основное тело --- */
    var shell = new T.Group(); root.add(shell); parts.shell = shell;
    var mat = holo(body);
    var prof = [[0.001, 0.43], [0.15, 0.44], [0.19, 0.50], [0.185, 0.60], [0.162, 0.72], [0.150, 0.82], [0.165, 0.93], [0.188, 1.03], [0.208, 1.10], [0.19, 1.16], [0.105, 1.20], [0.058, 1.225]]
      .map(function (p) { return new T.Vector2(p[0], p[1]); });
    var torso = new T.Mesh(new T.LatheGeometry(prof, 40), mat); torso.scale.set(1, 1, 0.66); torso.position.z = -0.02; shell.add(torso);
    shell.add(limb(V(0, 1.2, -0.02), V(0, 1.30, -0.015), 0.046, 0.042, mat));                         // шея
    var head = ell(0.088, 0.112, 0.1, mat, 0, 1.385, 0.0); shell.add(head);
    shell.add(ell(0.06, 0.05, 0.07, mat, 0, 1.30, 0.034));                                              // подбородок
    var nose = new T.Mesh(new T.ConeGeometry(0.013, 0.036, 12), mat); nose.rotation.x = Math.PI / 2; nose.position.set(0, 1.372, 0.108); shell.add(nose);
    onSide(function (s) { shell.add(ell(0.012, 0.027, 0.02, mat, s * 0.089, 1.385, -0.005)); });         // уши
    /* плечи, руки (плечо + предплечья в позе) */
    onSide(function (s) {
      shell.add(ell(0.062, 0.062, 0.062, mat, s * 0.215, 1.105, -0.02));
      shell.add(limb(V(s * 0.215, 1.105, -0.02), V(s * 0.235, 0.845, -0.03), 0.05, 0.04, mat));
    });
    /* ноги */
    onSide(function (s) {
      shell.add(limb(V(s * 0.1, 0.5, -0.01), V(s * 0.105, 0.49, 0.42), 0.092, 0.064, mat));            // бедро
      shell.add(limb(V(s * 0.105, 0.49, 0.42), V(s * 0.105, 0.085, 0.465), 0.062, 0.04, mat));         // голень
      shell.add(ell(0.05, 0.03, 0.115, mat, s * 0.105, 0.04, 0.53));                                      // стопа
      for (var i = 0; i < 5; i++) shell.add(ell(0.0095, 0.012, 0.016, mat, s * (0.105 + (i - 2) * 0.017), 0.022, 0.635 - Math.abs(i - 2) * 0.006));
    });

    /* --- предплечья и кисти: два положения --- */
    var open = new T.Group(), mo = holo(body);
    onSide(function (s) { open.add(limb(V(s * 0.235, 0.845, -0.03), V(s * 0.17, 0.565, 0.235), 0.04, 0.03, mo)); });
    /* руки сложены: у человека лицом в +z левая — на стороне +x. joined: левая поверх правой; joinedR: правая поверх левой */
    function joinedPose(leftOnTop) {
      var g = new T.Group(), m = holo(body);
      onSide(function (s) { g.add(limb(V(s * 0.235, 0.845, -0.03), V(s * 0.075, 0.585, 0.2), 0.04, 0.03, m)); });
      var hl = hand(m, 1, false), hr = hand(m, -1, false);
      hl.position.set(0.0, leftOnTop ? 0.578 : 0.552, 0.272); hr.position.set(0.0, leftOnTop ? 0.552 : 0.578, 0.272);
      hl.rotation.set(0.1, 0, 0); hr.rotation.set(0.1, 0, 0);
      g.add(hr); g.add(hl); return g;
    }
    var joined = joinedPose(true), joinedR = joinedPose(false);
    onSide(function (s) {
      var h = hand(mo, s, true); h.position.set(s * 0.17, 0.545, 0.3); h.rotation.y = s * 0.12; open.add(h);
    });
    parts.joined = joined; parts.joinedR = joinedR; parts.open = open; root.add(joined); root.add(joinedR); root.add(open);

    /* --- скелет внутри: позвоночник, череп, рёбра --- */
    var bones = new T.Group(); root.add(bones); parts.bones = bones;
    var bm = holo({ color: 0xa9c4ff, rim: 0xffffff, base: 0.22, gain: 0.7, pow: 1.5 });
    var spinePts = [V(0, 0.455, -0.115), V(0, 0.52, -0.135), V(0, 0.62, -0.125), V(0, 0.74, -0.11), V(0, 0.86, -0.12), V(0, 0.98, -0.135), V(0, 1.10, -0.125), V(0, 1.19, -0.10), V(0, 1.27, -0.07), V(0, 1.33, -0.04), V(0, 1.385, 0.0)];
    var spine = new T.CatmullRomCurve3(spinePts);
    for (var i = 0; i < 27; i++) {
      var u = 0.02 + i / 27 * 0.88, p = spine.getPointAt(u), tan = spine.getTangentAt(u);
      var r = 0.03 - i * 0.0004, v = new T.Mesh(new T.CylinderGeometry(r, r * 1.05, 0.013, 14), bm);
      v.position.copy(p); v.quaternion.setFromUnitVectors(UP, tan); bones.add(v);
    }
    var rm = holo({ color: 0x9fb8f5, rim: 0xe6f1ff, base: 0.06, gain: 0.42, pow: 1.4 });
    var skull = new T.Mesh(new T.SphereGeometry(1, 22, 16), holo({ color: 0xa9c4ff, rim: 0xffffff, base: 0.05, gain: 0.55, pow: 1.4 }));
    skull.scale.set(0.078, 0.098, 0.088); skull.position.set(0, 1.388, 0); bones.add(skull);
    for (var k = 0; k < 8; k++) {
      var yy = 0.80 + k * 0.05, a1 = 0.13 + Math.sin(k / 7 * Math.PI) * 0.055, b1 = a1 * 0.72, pts = [];
      for (var q = 0; q <= 14; q++) {
        var th = (-0.82 + q / 14 * 1.64) * Math.PI;                       // дуга по спине, спереди разрыв
        pts.push(V(Math.sin(th) * a1, yy - Math.abs(th) * 0.012 + 0.02, -0.04 - Math.cos(th) * b1 + 0.0));
      }
      bones.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 28, 0.0026, 6, false), rm));
    }
    var pelvis = new T.Mesh(new T.TorusGeometry(0.115, 0.012, 8, 36), bm); pelvis.rotation.x = Math.PI / 2; pelvis.scale.set(1, 0.72, 1); pelvis.position.set(0, 0.5, -0.04); bones.add(pelvis);

    /* --- стул (сиденье без спинки) --- */
    var chair = new T.Group(); root.add(chair); parts.chair = chair;
    var cm = holo({ color: 0x5b6a9e, rim: 0x9fb3ee, base: 0.05, gain: 0.45, pow: 1.6 });
    var seat = new T.Mesh(new T.BoxGeometry(0.46, 0.035, 0.46), cm); seat.position.set(0, 0.44, 0.06); chair.add(seat);
    [[-0.2, -0.14], [0.2, -0.14], [-0.2, 0.26], [0.2, 0.26]].forEach(function (q) {
      var l = new T.Mesh(new T.BoxGeometry(0.03, 0.42, 0.03), cm); l.position.set(q[0], 0.21, q[1]); chair.add(l);
    });

    /* --- якоря и кривые для огня --- */
    A.coccyx = V(0, 0.46, -0.105);
    A.s1 = V(0, 0.56, -0.088);
    A.s2 = V(0, 0.99, -0.1);
    A.s3 = V(0, 1.385, 0.0);
    A.crown = V(0, 1.497, 0.0);
    A.cupBase = V(0, 1.385, 0.0);
    /* чаша: дно в центре головы, ровный край на 2–3 см за поверхностью головы на уровне висков (так у инструкторов;
       у автора размер не указан). Голова — эллипсоид 0,088 × 0,112 × 0,1 м; на высоте края (+4,5 см от центра) её полуширина 8,1 см, полуглубина 9,2 см. */
    A.cupProfile = [[0, 0], [0.03, 0.002], [0.06, 0.01], [0.085, 0.022], [0.1, 0.034], [0.107, 0.045]];
    A.cupRim = { r: 0.107, h: 0.045, zScale: 1.1 };
    A.spine = spine;
    var stemPts = spinePts.map(function (p) { return V(p.x, p.y, p.z + 0.012); });          /* внутри позвоночника, как у автора */ stemPts[0] = A.coccyx.clone(); stemPts[stemPts.length - 1] = A.s3.clone();
    A.stem = new T.CatmullRomCurve3(stemPts);
    A.sole = [V(0.105, 0.0, 0.5), V(-0.105, 0.0, 0.5)];

    /* корни: от первого центра по ногам до подошв и пальцев и ещё ~10 см ниже пола (у автора — до подошв; инструкторы продлевают на 2–3 или ~10 см) */
    A.roots = onSide(function (s) {
      return new T.CatmullRomCurve3([
        A.s1.clone(), V(s * 0.05, 0.53, 0.04), V(s * 0.095, 0.5, 0.18), V(s * 0.106, 0.49, 0.38), V(s * 0.108, 0.38, 0.446), V(s * 0.108, 0.2, 0.46),
        V(s * 0.108, 0.07, 0.48), V(s * 0.108, -0.01, 0.51), V(s * 0.109, -0.1, 0.535)
      ]);
    });
    /* тонкие корешки: небольшой веер под полом (иллюстрация, не длиннее основных корней) */
    A.rootlets = [];
    onSide(function (s) {
      for (var i = 0; i < 7; i++) {
        var a = (i / 7) * Math.PI * 2 + (s > 0 ? 0 : 0.4), L = 0.05 + (i % 3) * 0.025;
        var p0 = V(s * 0.108, -0.02, 0.51), dx = Math.cos(a) * L, dz = Math.sin(a) * L;
        A.rootlets.push(new T.CatmullRomCurve3([p0, V(p0.x + dx * 0.35, -0.05, p0.z + dz * 0.35 + 0.01), V(p0.x + dx * 0.75, -0.085, p0.z + dz * 0.75 + 0.02), V(p0.x + dx, -0.105 - (i % 2) * 0.01, p0.z + dz + 0.02)]));
      }
    });

    /* листья: от второго центра по плечам и рукам до ладоней и пальцев и ещё немного за кисти (инструкторы: на несколько сантиметров) */
    A.leaves = onSide(function (s) {
      return new T.CatmullRomCurve3([
        A.s2.clone(), V(s * 0.1, 1.07, -0.08), V(s * 0.19, 1.1, -0.04), V(s * 0.228, 0.86, -0.03), V(s * 0.2, 0.68, 0.1), V(s * 0.172, 0.56, 0.24),
        V(s * 0.18, 0.565, 0.34), V(s * 0.2, 0.6, 0.43), V(s * 0.23, 0.66, 0.5)
      ]);
    });
    A.palm = [V(0.17, 0.55, 0.3), V(-0.17, 0.55, 0.3)];
    A.cup = null;

    /* вход энергии над головой */
    A.top = V(0, 1.95, 0.0);

    return { root: root, parts: parts, A: A, V: V, limb: limb };
  };

  /* ---------- лежащий человек (на песке): голова в -z, ноги в +z, лицом вверх ---------- */
  D.makeLyingHuman = function () {
    var mat = D.holoMaterial({ color: 0x3a60cc, rim: 0xeaf3ff, base: 0.2, gain: 0.95, pow: 1.9 });
    var root = new T.Group(), A = {}, y0 = 0.1;
    var prof = [[0.001, -0.02], [0.14, 0.0], [0.17, 0.08], [0.16, 0.2], [0.14, 0.3], [0.15, 0.42], [0.175, 0.54], [0.2, 0.62], [0.18, 0.68], [0.1, 0.72], [0.055, 0.74]]
      .map(function (p) { return new T.Vector2(p[0], p[1]); });
    var torso = new T.Mesh(new T.LatheGeometry(prof, 36), mat);
    torso.scale.set(1, 1, 0.55); torso.rotation.x = -Math.PI / 2; torso.position.set(0, y0, 0.05); root.add(torso);
    root.add(limb(V(0, y0 + 0.02, -0.68), V(0, y0 + 0.05, -0.76), 0.046, 0.042, mat));
    root.add(ell(0.088, 0.1, 0.112, mat, 0, y0 + 0.07, -0.87));
    var nose = new T.Mesh(new T.ConeGeometry(0.013, 0.036, 12), mat); nose.position.set(0, y0 + 0.175, -0.9); root.add(nose);
    [1, -1].forEach(function (s) {
      root.add(ell(0.012, 0.02, 0.027, mat, s * 0.089, y0 + 0.07, -0.88));
      root.add(limb(V(s * 0.09, y0, 0.1), V(s * 0.1, y0 + 0.005, 0.56), 0.092, 0.064, mat));                  // бедро
      var ax = s > 0 ? -0.035 : 0.035;                                                                          // лодыжки скрещены
      root.add(limb(V(s * 0.1, y0 + 0.005, 0.56), V(ax, y0 + (s > 0 ? 0.0 : 0.045), 1.0), 0.062, 0.04, mat));  // голень
      root.add(ell(0.04, 0.032, 0.105, mat, ax, y0 + (s > 0 ? 0.015 : 0.06), 1.1));                            // стопа
      /* руки скрещены на груди */
      root.add(ell(0.062, 0.062, 0.062, mat, s * 0.215, y0 + 0.07, -0.56));
      root.add(limb(V(s * 0.215, y0 + 0.07, -0.56), V(s * 0.25, y0 + 0.035, -0.32), 0.05, 0.04, mat));
      root.add(limb(V(s * 0.25, y0 + 0.035, -0.32), V(-s * 0.11, y0 + 0.12 + (s > 0 ? 0.0 : 0.035), -0.46), 0.04, 0.03, mat));
      root.add(ell(0.045, 0.014, 0.05, mat, -s * 0.13, y0 + 0.135 + (s > 0 ? 0.0 : 0.035), -0.48));
    });
    A.chest = V(0, y0 + 0.2, -0.4);
    A.head = V(0, y0 + 0.2, -0.87);
    A.feet = V(0, y0 + 0.05, 1.1);
    A.y0 = y0;
    return { root: root, A: A, V: V, limb: limb, ell: ell };
  };

  D.hum = { V: V, limb: limb, ell: ell, hand: hand };
})(window);
