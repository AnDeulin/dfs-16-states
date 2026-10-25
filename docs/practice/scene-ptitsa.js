/* 3D-сцена «Полёт белой птицы»: схема путешествия по этапам (песок → полёт → море → берег → отдых → прохлада).
   Слова упражнения на сайте не приводятся. Партитура: 2B–2A–4A–2A–2B–4C. */
(function (G) {
  'use strict';
  var D = G.DFSC = G.DFSC || {};
  D.S3 = D.S3 || {};
  var T = G.THREE;

  var CAMS = {
    island: { az: 62, el: 28, dist: 5.2, t: [0, 0.2, 0.1] },
    near:   { az: 50, el: 20, dist: 3.7, t: [0, 0.2, 0.1] },
    sky:    { az: 58, el: 12, dist: 5.0, t: [0, 0.9, 0] },
    high:   { az: 38, el: 20, dist: 8.6, t: [0, 1.3, 0] },
    body:   { az: 78, el: 24, dist: 4.4, t: [0, 0.2, 0.1] }
  };
  D.CAMS.ptitsa = CAMS;

  function makeBird() {
    var g = new T.Group(), flap = [];
    var wm = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92, side: T.DoubleSide, depthWrite: false });
    var body = new T.Mesh(new T.SphereGeometry(1, 16, 12), wm); body.scale.set(0.05, 0.045, 0.15); g.add(body);
    var head = new T.Mesh(new T.SphereGeometry(0.034, 12, 10), wm); head.position.set(0, 0.02, 0.15); g.add(head);
    var beak = new T.Mesh(new T.ConeGeometry(0.012, 0.045, 8), new T.MeshBasicMaterial({ color: 0xffe3a0, transparent: true })); beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.018, 0.2); g.add(beak);
    var tail = new T.Mesh(new T.ConeGeometry(0.04, 0.16, 6), wm); tail.rotation.x = -Math.PI / 2; tail.position.set(0, 0, -0.2); tail.scale.set(1, 0.3, 1); g.add(tail);
    [1, -1].forEach(function (s) {
      var shp = new T.Shape(); shp.moveTo(0, 0.06); shp.bezierCurveTo(0.2, 0.2, 0.55, 0.18, 0.74, -0.04); shp.bezierCurveTo(0.52, -0.02, 0.32, -0.1, 0.0, -0.1); shp.lineTo(0, 0.06);
      var w = new T.Mesh(new T.ShapeGeometry(shp, 12), wm); w.rotation.x = -Math.PI / 2;
      var piv = new T.Group(); piv.add(w); piv.scale.x = s; piv.position.set(s * 0.03, 0.02, 0); g.add(piv); flap.push({ p: piv, s: s });
    });
    g.add(D.glowSprite(0xcfe9ff, 0.7, 0.6));
    g.userData.flap = function (t) { flap.forEach(function (f) { f.p.rotation.z = f.s * Math.sin(t * 6.5) * 0.55; }); };
    return g;
  }

  D.chartHTML = function () {
    var el = document.createElement('div'); el.className = 's3-chart';
    var pts = [[18, 56], [58, 46], [98, 36], [138, 46], [178, 56], [214, 14]];
    var codes = ['2B', '2A', '4A', '2A', '2B', '4C'];
    var path = 'M18 56 C38 56 38 46 58 46 C78 46 78 36 98 36 C118 36 118 46 138 46 C158 46 158 56 178 56 C200 56 204 14 214 14';
    var marks = pts.map(function (p, i) { return '<g class="m" data-m="m' + (i + 1) + '"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="9"/><text x="' + p[0] + '" y="' + (p[1] + 3.5) + '" text-anchor="middle">' + codes[i] + '</text></g>'; }).join('');
    el.innerHTML = '<svg viewBox="0 0 232 74" aria-hidden="true"><text class="ax" x="2" y="10">собранность</text><text class="ax" x="2" y="72">расслабление</text><path d="' + path + '" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2.2" stroke-linecap="round"/>' + marks + '</svg>';
    return el;
  };

  D.S3.ptitsa = function () {
    var steps = [
      { t: 'Подготовка', cam: 'island',
        d: 'Удобно лягте, расслабьтесь, закройте глаза. Руки и ноги скрещены: правая сверху (у левшей — левая). Упражнение ставят в самый конец занятия, оно длится 25–35 минут.\nСлова упражнения автор просит произносить точно: их читает инструктор или вы по книге. Здесь — только схема путешествия.' },
      { t: 'Песок · состояние 2B', add: ['m1'], cam: 'near',
        d: 'Первый этап: покой и тепло, вы отдыхаете.' },
      { t: 'Полёт · состояние 2A', add: ['bird', 'birdA', 'you', 'm2'], cam: 'sky',
        d: 'Второй этап: вы взлетаете и летите рядом с белой птицей — и сами становитесь ею.' },
      { t: 'Море · состояние 4A', add: ['sea', 'birdB', 'm3'], rm: ['birdA'], cam: 'high',
        d: 'Третий этап: полёт над морем. Это самая «собранная» точка кривой.' },
      { t: 'Берег · состояние 2A', add: ['birdC', 'm4'], rm: ['birdB'], cam: 'sky',
        d: 'Четвёртый этап: возвращение. Вы снижаетесь к берегу и снова становитесь человеком.' },
      { t: 'Отдых · состояние 2B', add: ['m5'], rm: ['bird', 'birdC', 'you'], cam: 'near',
        d: 'Пятый этап: снова покой, как в начале.' },
      { t: 'Прохлада · состояние 4C', add: ['cool', 'm6'], cam: 'body', ms: 12000,
        d: 'Шестой этап: бодрость разливается по телу снизу вверх. Затем — три глубоких вздоха, глаза открываются, вы встаёте.\nФинал упражнения активизирует. Для сна его, по пособию, делают только до этапа отдыха на песке.' }
    ];

    function build(st) {
      var H = D.makeLyingHuman(), A = H.A, V = H.V; H.root.position.y = 0.02;
      st.host.parentNode.classList.add('pl__stage--day');
      st.scene.add(H.root);
      /* остров с песком и море */
      var isl = new T.Group();
      var ground = new T.Mesh(new T.CircleGeometry(20, 64), new T.MeshBasicMaterial({ color: 0xcdb277 }));
      ground.rotation.x = -Math.PI / 2; ground.position.y = -0.32; isl.add(ground);
      var sand = new T.Mesh(new T.CircleGeometry(1.9, 72), new T.MeshBasicMaterial({ color: 0xe7d197 }));
      sand.rotation.x = -Math.PI / 2; sand.position.y = 0.02; isl.add(sand);
      var skirt = new T.Mesh(new T.CylinderGeometry(1.9, 1.9, 0.36, 72, 1, true), new T.MeshBasicMaterial({ color: 0xb99d62, side: T.DoubleSide })); skirt.position.y = -0.16; isl.add(skirt);
      var edge = new T.Mesh(new T.RingGeometry(1.86, 1.93, 96), new T.MeshBasicMaterial({ color: 0xf2e0a8, transparent: true, opacity: 0.8, side: T.DoubleSide })); edge.rotation.x = -Math.PI / 2; edge.position.y = 0.024; isl.add(edge);
      st.scene.add(isl);
      /* море: гладкая вода с мягким переливом цвета по гребням волн (без проволочной сетки); ниже уровня песка, чтобы волны не прорезали остров */
      var seaG = new T.PlaneGeometry(80, 80, 90, 90); seaG.rotateX(-Math.PI / 2);
      var seaBase = seaG.attributes.position.array.slice();
      seaG.setAttribute('color', new T.BufferAttribute(new Float32Array(seaG.attributes.position.count * 3), 3));
      var sea = new T.Group();
      sea.add(new T.Mesh(seaG, new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.96 })));
      sea.position.y = -0.1;
      st.layer('sea', sea, { k: 1.6 });
      /* птица и «вы» */
      var bird = makeBird(); st.layer('bird', bird, { k: 3 });
      st.layer('birdA', new T.Group(), { k: 3 }); st.layer('birdB', new T.Group(), { k: 3 }); st.layer('birdC', new T.Group(), { k: 3 });
      var you = new T.Group(); you.add(D.glowSprite(0xffffff, 0.2, 1)); you.add(D.glowSprite(0xffe9b0, 0.5, 0.55));
      st.layer('you', you, { k: 3 });
      var youHome = A.chest.clone();
      /* прохлада — волна вдоль тела снизу вверх */
      var cool = new T.Group();
      var ring = new T.Mesh(new T.TorusGeometry(0.24, 0.012, 10, 48), new T.MeshBasicMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false })); ring.position.y = 0.1; cool.add(ring);
      var halo = new T.Mesh(new T.TorusGeometry(0.24, 0.07, 10, 48), new T.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.2, blending: T.AdditiveBlending, depthWrite: false })); halo.position.y = 0.1; cool.add(halo);
      var aura = new T.Mesh(new T.CapsuleGeometry(0.28, 1.5, 6, 24), D.holoMaterial({ color: 0x9fd4ff, rim: 0xe9f6ff, base: 0, gain: 0.4, pow: 2.2 }));
      aura.rotation.x = Math.PI / 2; aura.position.set(0, 0.12, 0.15); cool.add(aura);
      st.layer('cool', cool, { k: 2, fn: function (v, e, t) { var u = (t * 0.16) % 1; ring.position.z = halo.position.z = 1.15 - u * 2.1; ring.rotation.y = halo.rotation.y = Math.PI / 2; } });
      /* маркеры партитуры и схема */
      ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'].forEach(function (n) { st.layer(n, new T.Group(), { k: 6 }); });
      var chart = D.chartHTML(); st.host.appendChild(chart);
      st.onState = function (set) { [].slice.call(chart.querySelectorAll('.m')).forEach(function (g) { g.classList.toggle('on', !!set[g.getAttribute('data-m')]); }); };

      /* движение птицы */
      var mode = 'A', pos = V(1.2, 1.1, 0), look = V(0, 0, 1), tC = 0;
      st.updaters.push(function (dt, t, stage) {
        var L = stage.layers;
        var m = L.birdC.target > 0.5 ? 'C' : (L.birdB.target > 0.5 ? 'B' : 'A');
        if (m !== mode) { mode = m; tC = 0; }
        if (m === 'C') tC += dt;
        var target;
        if (m === 'B') { var a = t * 0.34; target = V(Math.cos(a) * 4.2, 2.4 + Math.sin(t * 0.7) * 0.15, Math.sin(a) * 4.2); }
        else if (m === 'C') { var u = Math.min(1, tC / 7), r = 2.2 - 1.7 * u, a2 = t * 0.5; target = V(Math.cos(a2) * r, 1.4 - 1.2 * u + Math.sin(t * 0.9) * 0.05, Math.sin(a2) * r - 0.2); }
        else { var a3 = t * 0.62; target = V(Math.cos(a3) * 1.25, 1.15 + Math.sin(t * 1.1) * 0.1, Math.sin(a3) * 1.25 - 0.1); }
        var prev = pos.clone(); pos.lerp(target, 1 - Math.exp(-dt * 2.6));
        var dir = pos.clone().sub(prev); if (dir.lengthSq() > 1e-8) { dir.normalize(); look.lerp(dir, 0.15); }
        bird.position.copy(pos); bird.lookAt(pos.clone().add(look));
        bird.userData.flap(t);
        you.position.lerp(L.birdA.target + L.birdB.target + L.birdC.target > 0.5 ? pos.clone().add(V(0, 0.02, 0)) : youHome, 1 - Math.exp(-dt * 4));
        /* море дышит */
        if (L.sea.v > 0.01) {
          var p = seaG.attributes.position;
          var col = seaG.attributes.color;
          for (var i = 0; i < p.count; i += 1) {
            var x = seaBase[i * 3], z = seaBase[i * 3 + 2];
            var h = Math.sin(x * 0.9 + t * 0.9) * 0.028 + Math.cos(z * 0.7 - t * 0.8) * 0.024;
            p.setY(i, h);
            var k = Math.min(1, Math.max(0, (h + 0.052) / 0.104)), far = Math.min(1, Math.hypot(x, z) / 30);
            col.setXYZ(i, 0.09 + 0.2 * k + 0.25 * far, 0.28 + 0.24 * k + 0.2 * far, 0.55 + 0.17 * k + 0.1 * far);
          }
          p.needsUpdate = true; col.needsUpdate = true;
        }
      });
      st.label('bird', V(0, 1.2, 0), 'птица');
      st.limits.dMax = 12;
      st.home = CAMS.island; st.cams = CAMS;
    }
    return { id: 'ptitsa', label: '3D-схема: «Полёт белой птицы»', steps: steps, build: build, cams: CAMS, fallback: 'ptitsa' };
  };
})(window);
