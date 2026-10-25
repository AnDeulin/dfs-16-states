/* 3D-сцена «Огненный цветок»: точка в копчике → стебель по позвоночнику → чаша → три шара → корни (ниже стоп)
   → листья (дальше кистей) → пульсация → сворачивание → отдача шаров. Порядок шагов — по книге Калинаускаса. */
(function (G) {
  'use strict';
  var D = G.DFSC = G.DFSC || {};
  D.S3 = D.S3 || {};
  var T = G.THREE;

  /* виды камеры: az, el — градусы; t — куда смотрим */
  var CAMS = {
    full:   { az: 24, el: 7, dist: 3.9, t: [0, 0.76, 0.12] },
    wide:   { az: 36, el: 12, dist: 4.8, t: [0, 1.0, 0.5] },
    head:   { az: 22, el: 24, dist: 1.5, t: [0, 1.38, 0] },
    top:    { az: 20, el: 22, dist: 2.6, t: [0, 1.48, 0] },
    pelvis: { az: 32, el: 18, dist: 2.0, t: [0, 0.55, 0.05] },
    chest:  { az: 28, el: 8, dist: 2.1, t: [0, 1.0, 0] },
    spine:  { az: 90, el: 4, dist: 3.4, t: [0, 0.92, -0.05] },
    roots:  { az: 30, el: 3, dist: 3.1, t: [0, 0.34, 0.42] },
    leaves: { az: 38, el: 22, dist: 2.7, t: [0.08, 0.74, 0.38] }
  };
  D.CAMS = D.CAMS || {};
  D.CAMS.cvetok = CAMS;

  function orb(r) {
    var g = new T.Group(), inner = new T.Group();
    var core = new T.Mesh(new T.SphereGeometry(r, 28, 20), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
    var h1 = D.glowSprite(0xcfe9ff, r * 7.5, 0.85), h2 = D.glowSprite(0x6fb6ff, r * 17, 0.3);
    inner.add(h2); inner.add(h1); inner.add(core); g.add(inner);
    g.userData.inner = inner;
    return g;
  }

  /* Пол: тонкий диск с кольцами; сквозь него видны корни */
  D.makeOrb = orb;
  D.makeFloor = function (r) {
    var g = new T.Group();
    var disc = new T.Mesh(new T.CircleGeometry(r, 64), new T.MeshBasicMaterial({ color: 0x5f86e8, transparent: true, opacity: 0.1, side: T.DoubleSide, depthWrite: false }));
    disc.rotation.x = -Math.PI / 2; g.add(disc);
    [0.42, 0.78, 1.14].forEach(function (rr, i) {
      if (rr > r) return;
      var ring = new T.Mesh(new T.RingGeometry(rr - 0.004, rr + 0.004, 96), new T.MeshBasicMaterial({ color: 0x9cc0ff, transparent: true, opacity: 0.22 - i * 0.05, side: T.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; g.add(ring);
    });
    return g;
  };

  D.S3.cvetok = function () {
    var steps = [
      { t: 'Подготовка', add: ['handsJoined'], cam: 'full',
        d: 'Сядьте ровно, не опираясь на спинку стула; ноги стоят на полу под прямым углом. Руки сложены: левая поверх правой (у левшей — наоборот). Глаза открыты, взгляд мягкий, без фокуса.' },
      { t: 'Первая фаза · огненная точка', add: ['point'], cam: 'pelvis',
        d: 'Всё внимание — в копчик. Там появляется «огненная точка».' },
      { t: 'Огненный стебель', add: ['stem'], cam: 'spine',
        d: 'Плавным непрерывным движением точка поднимается внутри позвоночника и оставляет за собой «огненный стебель».', ms: 6500 },
      { t: 'Огненная чаша', add: ['cup'], cam: 'head',
        d: 'Дойдя до центра головы, точка раскрывается «огненной чашей». Дно чаши — в центре головы. Края ровные, без наклона, и на 2–3 сантиметра выходят за пределы головы — на уровне висков.' },
      { t: 'Энергия сверху', add: ['flowDown'], cam: 'top',
        d: 'Сверху в чашу входит огненная энергия и по стеблю стекает вниз.' },
      { t: 'Первый центр', add: ['s1'], cam: 'pelvis',
        d: 'Внизу, у крестца, она собирается в «огненный шар» первого центра — вокруг стебля, размером примерно с яблоко. Закрепляем: удерживаем его вниманием, пока он не станет устойчивым.' },
      { t: 'Второй центр', add: ['s2'], cam: 'chest',
        d: 'Энергия продолжает поступать сверху и собирается в шар второго центра — в груди, ближе к позвоночнику, между лопатками. Закрепляем.' },
      { t: 'Третий центр', add: ['s3'], cam: 'head',
        d: 'Так же возникает шар третьего центра — в центре головы, на дне чаши. Закрепляем.' },
      { t: 'Вторая фаза · корни', add: ['roots', 'flowUp'], cam: 'roots', subTop: true,
        d: 'Из первого шара «огненные корни» уходят в обе ноги — до подошв и пальцев ног. Инструкторы продлевают корни ниже пола — на 2–3 см или примерно на 10 (в 3D — 10); у автора — до подошв.\nСнизу по корням энергия поднимается в первый шар. Теперь два потока: сверху через чашу и снизу по корням.', ms: 12000 },
      { t: 'Листья', add: ['leaves', 'flowLeaves', 'handsOpen'], rm: ['handsJoined'], cam: 'leaves',
        d: 'Из второго шара «огненные листья» идут в обе руки — до ладоней и пальцев; инструкторы продлевают их ещё на несколько сантиметров за кисти.\nКогда листья дошли до ладоней, руки раскрываются ладонями вверх. Через них энергия течёт во второй шар.\nТеперь три потока: чаша, корни, листья.', ms: 12000 },
      { t: 'Третья фаза · огненная пульсация', fx: ['pulse'], add: ['pulse'], cam: 'full',
        d: 'Энергия входит из пространства через чашу, корни и листья, а затем уходит тем же путём и «выжигает» в теле лишнее, больное, ненужное. Всего 24–36 пульсаций.\nПульсация идёт сама, дыхание поначалу лишь помогает задать ей ритм: дышите ровно и свободно.\nАвтор предлагает две-три пульсации сделать на задержке дыхания. Осваивайте это только так, как показал инструктор, и затем мягко верните дыхание.', ms: 14000 },
      { t: 'Четвёртая фаза · сворачиваем', rm: ['pulse', 'flowDown', 'flowUp', 'flowLeaves', 'roots', 'leaves', 'cup', 'stem', 'handsOpen', 'point'], add: ['handsJoinedR'], cam: 'full',
        d: 'Пульсацию останавливают и всё втягивают обратно в шары:\n1. Корни — в первый шар, вместе с участком стебля от копчика до первого центра.\n2. Листья — во второй шар, вместе с участком стебля между первым и вторым центрами. Руки смыкаются: правая сверху (у левшей — левая).\n3. Чашу закрывают и втягивают в третий шар, вместе с участком стебля между вторым и третьим центрами.', ms: 13000 },
      { t: 'Отдаём шары', fx: ['give'], cam: 'wide',
        d: 'Первый шар отдают импульсом прямо перед собой, второй — так же, третий — вертикально вверх. Каждый — с благодарностью пространству.\nОриентир на любом шаге: ощущения реальные, телесные, а не картинки в воображении. На старте они могут быть слабыми — это нормально; главное — делать точно и без пропусков.', ms: 11000 }
    ];

    function build(st) {
      var H = D.makeSeatedHuman(), A = H.A, V = H.V;
      st.scene.add(D.makeFloor(1.35));
      st.layer('shell', H.parts.shell, { always: true }); st.layer('bones', H.parts.bones, { always: true }); st.layer('chair', H.parts.chair, { always: true });
      st.layer('handsJoined', H.parts.joined, { k: 3 }); st.layer('handsJoinedR', H.parts.joinedR, { k: 3 }); st.layer('handsOpen', H.parts.open, { k: 3 });

      /* точка в копчике */
      var pt = new T.Group(); pt.position.copy(A.coccyx);
      pt.add(new T.Mesh(new T.SphereGeometry(0.016, 16, 12), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true })));
      pt.add(D.glowSprite(0xcfe9ff, 0.2, 0.9)); pt.add(D.glowSprite(0x6fb6ff, 0.5, 0.3));
      st.layer('point', pt, { pop: true, k: 3.5 });

      /* стебель */
      st.layer('stem', D.fireTube(A.stem, 0.0085, 120, 0xf6fcff), { k: 1.1 });

      /* чаша */
      var cup = new T.Group();
      var prof = A.cupProfile.map(function (p) { return new T.Vector2(p[0], p[1]); });
      var bowl = new T.Mesh(new T.LatheGeometry(prof, 40), new T.MeshBasicMaterial({ color: 0xbfe3ff, transparent: true, opacity: 0.4, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending }));
      var rim = new T.Mesh(new T.TorusGeometry(A.cupRim.r, 0.0035, 8, 64), new T.MeshBasicMaterial({ color: 0xf2fbff, transparent: true }));
      rim.rotation.x = Math.PI / 2; rim.position.y = A.cupRim.h;
      var inner = D.glowSprite(0xaee0ff, 0.2, 0.45); inner.position.y = 0.02;
      cup.add(bowl); cup.add(rim); cup.add(inner); cup.position.copy(A.cupBase); cup.scale.z = A.cupRim.zScale;
      st.layer('cup', cup, { k: 2.2 });

      /* три шара (внутри — группа для «отдачи») */
      var orbs = {};
      [['s1', A.s1], ['s2', A.s2], ['s3', A.s3]].forEach(function (a) {
        var o = orb(0.046); o.position.copy(a[1]); orbs[a[0]] = o;
        st.layer(a[0], o, { pop: true, k: 2.6 });
      });

      /* корни: от первого шара по ногам и под пол */
      var roots = new T.Group(), rootTubes = [];
      A.roots.forEach(function (c) { var f = D.fireTube(c, 0.0105, 130, 0xe6f5ff); roots.add(f); rootTubes.push(f); });
      A.rootlets.forEach(function (c) { var f = D.fireTube(c, 0.0048, 40, 0xcfe9ff); roots.add(f); rootTubes.push(f); });
      roots.userData.draw = function (p) { rootTubes.forEach(function (f, i) { var q = i < 2 ? p : Math.max(0, (p - 0.55) / 0.45); f.userData.draw(q); }); };
      st.layer('roots', roots, { k: 0.9 });

      /* листья: от второго шара по рукам и за кисти + «пластинки» листьев */
      var leaves = new T.Group(), leafTubes = [], blades = [];
      A.leaves.forEach(function (c, ci) {
        var f = D.fireTube(c, 0.0095, 130, 0xf2fbff); leaves.add(f); leafTubes.push(f);
        [0.7, 0.78, 0.86, 0.93, 1.0].forEach(function (u, k) {
          var p = c.getPointAt(u), tan = c.getTangentAt(u), len = 0.17 - k * 0.022, w = 0.046 - k * 0.006;
          var shp = new T.Shape(); shp.moveTo(0, 0); shp.quadraticCurveTo(w, len * 0.45, 0, len); shp.quadraticCurveTo(-w, len * 0.45, 0, 0);
          var m = new T.Mesh(new T.ShapeGeometry(shp, 10), new T.MeshBasicMaterial({ color: 0xcdeaff, transparent: true, opacity: 0.5, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending }));
          m.position.copy(p);
          var side = ci === 0 ? 1 : -1, dir = tan.clone().add(V(side * 0.35, 0.75 + k * 0.1, 0)).normalize();
          m.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
          m.rotateY((k % 2 ? 1 : -1) * 0.6);
          leaves.add(m); blades.push({ m: m, u: u });
        });
      });
      leaves.userData.draw = function (p) {
        leafTubes.forEach(function (f) { f.userData.draw(p); });
        blades.forEach(function (b) { var q = Math.max(0, (p - b.u + 0.1) / 0.12); b.m.visible = q > 0.02; b.m.scale.setScalar(Math.min(1, q)); });
      };
      st.layer('leaves', leaves, { k: 0.9 });

      /* потоки частиц */
      var downPts = [V(0, 1.86, 0), V(0, 1.72, 0), V(0, 1.6, 0), V(0, 1.5, 0)];
      var stemRev = A.stem.getPoints(40).reverse().slice(1);
      var downCurve = new T.CatmullRomCurve3(downPts.concat(stemRev));
      var fDown = [D.flow(downCurve, 34, { speed: 0.1, size: 0.07 }), D.flow(new T.CatmullRomCurve3([V(-0.3, 1.8, 0.08), V(-0.17, 1.64, 0.04), V(-0.06, 1.5, 0.0), V(0, 1.42, 0)]), 12, { speed: 0.12, size: 0.055 }),
        D.flow(new T.CatmullRomCurve3([V(0.3, 1.8, 0.08), V(0.17, 1.64, 0.04), V(0.06, 1.5, 0.0), V(0, 1.42, 0)]), 12, { speed: 0.12, size: 0.055, phase: 0.4 })];
      var gDown = new T.Group(); fDown.forEach(function (f) { gDown.add(f); });
      st.layer('flowDown', gDown, { k: 3 });

      var gUp = new T.Group(), fUp = [];
      A.roots.forEach(function (c, i) {
        var rev = new T.CatmullRomCurve3(c.getPoints(60).reverse());
        var f = D.flow(rev, 30, { speed: 0.09, size: 0.07, phase: i * 0.5 }); gUp.add(f); fUp.push(f);
      });
      st.layer('flowUp', gUp, { k: 3 });

      var gLv = new T.Group(), fLv = [];
      A.leaves.forEach(function (c, i) {
        var rev = new T.CatmullRomCurve3(c.getPoints(60).reverse());
        var f = D.flow(rev, 30, { speed: 0.09, size: 0.07, phase: i * 0.5 }); gLv.add(f); fLv.push(f);
      });
      st.layer('flowLeaves', gLv, { k: 3 });

      /* пульсация: расходящиеся оболочки и дыхание ауры */
      var pulse = new T.Group(), shells = [];
      for (var i = 0; i < 3; i++) {
        var sh = new T.Mesh(new T.SphereGeometry(1, 36, 24), D.holoMaterial({ color: 0x9fd4ff, rim: 0xffffff, base: 0, gain: 0.0, pow: 2.4 }));
        sh.position.set(0, 0.95, 0.02); pulse.add(sh); shells.push(sh);
      }
      var aura = new T.Mesh(new T.SphereGeometry(1, 40, 28), D.holoMaterial({ color: 0x9fd4ff, rim: 0xe9f6ff, base: 0.0, gain: 0.5, pow: 2.2 }));
      aura.scale.set(0.5, 1.08, 0.42); aura.position.set(0, 0.88, 0.04); pulse.add(aura);
      st.layer('pulse', pulse, { k: 2.5, fn: function (v, e, t) {
        for (var i = 0; i < 3; i++) {
          var u = ((t / 4.8) + i / 3) % 1;
          shells[i].scale.set(0.3 + u * 0.95, 0.62 + u * 1.0, 0.26 + u * 0.8);
          shells[i].material.uniforms.uGain.value = (1 - u) * (1 - u) * 0.6;
        }
        aura.material.uniforms.uGain.value = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.3));
      } });

      /* подписи */
      st.label('point', V(0.02, 0.46, -0.105), 'точка');
      st.label('stem', V(0.0, 0.82, -0.07), 'стебель');
      st.label('cup', V(0.107, 1.43, 0), 'чаша');
      var gv = function (s) { return !!s.fx.give; };
      st.label('s3', V(0.05, 1.385, 0.04), 'центр 3', { hide: gv });
      st.label('s2', V(0.05, 0.99, -0.06), 'центр 2', { hide: gv });
      st.label('s1', V(0.05, 0.56, -0.05), 'центр 1', { hide: gv });
      st.label('roots', V(0.108, 0.12, 0.47), 'корни');
      st.label('leaves', V(0.27, 0.72, 0.52), 'листья');

      /* «отдача» шаров и поток частиц */
      var giveP = 0;
      st.updaters.push(function (dt, t, stage) {
        var speed = stage.fx.pulse ? 2.1 : 1;
        fDown.forEach(function (f) { f.userData.upd(t * speed); });
        fUp.forEach(function (f) { f.userData.upd(t * speed); });
        fLv.forEach(function (f) { f.userData.upd(t * speed); });
        giveP += ((stage.fx.give ? 1 : 0) - giveP) * (1 - Math.exp(-dt * (stage.fx.give ? 0.9 : 8)));
        var g = D.smooth(giveP);
        orbs.s1.userData.inner.position.set(0, 0, 1.9 * g); orbs.s2.userData.inner.position.set(0, 0, 1.9 * g); orbs.s3.userData.inner.position.set(0, 1.5 * g, 0);
        ['s1', 's2', 's3'].forEach(function (n) {
          var inn = orbs[n].userData.inner, s = 1 - 0.55 * g;
          inn.scale.setScalar(s);
          inn.children.forEach(function (c) { if (c.material) c.material.opacity *= (1 - g * 0.97); });
        });
        /* пока шары улетают, подпись центров гаснет */
      });
      st.home = CAMS.full;
      st.cams = CAMS;
    }
    return { id: 'cvetok', label: '3D-схема: построение «Огненного цветка»', steps: steps, build: build, cams: CAMS, fallback: 'cvetok' };
  };
})(window);
