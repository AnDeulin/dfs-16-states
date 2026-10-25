/* 3D-сцена «Ноль-концентрация»: цветок построен → пульсация остановлена → стебель продлён над макушкой на 15–20 см →
   огненная ось от копчика → внимание распределено вдоль всей оси, приборы на нуле → ось убирают, пульсация возвращается. */
(function (G) {
  'use strict';
  var D = G.DFSC = G.DFSC || {};
  D.S3 = D.S3 || {};
  var T = G.THREE;

  var CAMS = {
    full: { az: 24, el: 7, dist: 3.9, t: [0, 0.8, 0.1] },
    head: { az: 22, el: 6, dist: 1.9, t: [0, 1.5, 0] },
    spine: { az: 90, el: 3, dist: 3.8, t: [0, 1.0, -0.05] }
  };
  D.CAMS.nol = CAMS;

  D.gaugesHTML = function (n, caption) {
    var g = '<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27" fill="rgba(9,15,46,.6)" stroke="rgba(255,255,255,.35)" stroke-width="2"/>' +
      '<path d="M12 40 A20 20 0 0 1 48 40" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.6"/>' +
      '<path d="M30 10v5M14 18l3 3M46 18l-3 3" stroke="rgba(255,255,255,.6)" stroke-width="1.8" stroke-linecap="round"/>' +
      '<g class="needle" style="transform-origin:30px 38px"><line x1="30" y1="38" x2="30" y2="14" stroke="#ffd27a" stroke-width="2.6" stroke-linecap="round"/></g><circle cx="30" cy="38" r="3.2" fill="#ffd27a"/></svg>';
    var el = document.createElement('div'); el.className = 's3-gauges';
    var h = ''; for (var i = 0; i < (n || 3); i++) h += '<div class="s3-gauge">' + g + '</div>';
    el.innerHTML = h + '<span>' + (caption || '') + '</span>';
    return el;
  };

  D.S3.nol = function () {
    var steps = [
      { t: 'Где мы находимся', add: ['flower', 'pulse'], fx: ['pulse'], cam: 'full',
        d: 'Упражнение делают, когда «Огненный цветок» уже построен и идёт пульсация. Осваивать его начинают в конце начального курса, после того как конструкция цветка сформирована.' },
      { t: 'Вступление · 1', rm: ['pulse'], cam: 'full',
        d: 'Останавливают огненную пульсацию.' },
      { t: 'Вступление · 2', add: ['ext'], cam: 'head',
        d: 'Стебель продлевают вверх за макушку на 15–20 см.' },
      { t: 'Вступление · 3', add: ['axis'], cam: 'spine',
        d: 'Получается «огненная ось» — от копчика до верхнего конца продлённого стебля.' },
      { t: 'Вступление · 4', add: ['calm'], cam: 'full',
        d: 'Внутри всё затихает: мышечных и эмоциональных зажимов — минимум.' },
      { t: 'Вступление · 5', add: ['dials'], cam: 'full',
        d: 'Все внутренние показатели — на нуле, как стрелки приборов.' },
      { t: 'Основная фаза · внимание в оси', add: ['attn'], cam: 'spine',
        d: 'Всё внимание — в огненной оси; оно распределено вдоль всей её длины, а не собрано в одной точке.' },
      { t: 'Основная фаза · твёрдо', cam: 'full',
        d: 'Состояние держат уверенно, твёрдо, неколебимо. Длительность — от 15–20 до 40–45 минут.' },
      { t: 'Завершение', rm: ['attn', 'dials', 'calm', 'axis', 'ext'], add: ['pulse'], fx: ['pulse'], cam: 'full',
        d: 'Ось убирают, верхний конец продлённого стебля втягивают, пульсацию возобновляют.' }
    ];

    function build(st) {
      var H = D.makeSeatedHuman(), A = H.A, V = H.V;
      st.scene.add(D.makeFloor(1.3));
      st.layer('shell', H.parts.shell, { always: true }); st.layer('bones', H.parts.bones, { always: true }); st.layer('chair', H.parts.chair, { always: true });
      st.layer('handsOpen', H.parts.open, { always: true });

      /* построенный цветок (приглушённый): стебель, чаша, три шара */
      var fl = new T.Group();
      var stem = D.fireTube(A.stem, 0.006, 90, 0xdff3ff); fl.add(stem); stem.userData.draw(1);
      var cup = new T.Mesh(new T.LatheGeometry(A.cupProfile.map(function (p) { return new T.Vector2(p[0], p[1]); }), 36),
        new T.MeshBasicMaterial({ color: 0xbfe3ff, transparent: true, opacity: 0.18, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending }));
      cup.position.copy(A.cupBase); cup.scale.z = A.cupRim.zScale; fl.add(cup);
      [A.s1, A.s2, A.s3].forEach(function (p) { var o = D.makeOrb(0.036); o.position.copy(p); fl.add(o); });
      st.layer('flower', fl, { k: 2.5 });
      /* пульсация (как в цветке) */
      var pulse = new T.Group(), shells = [];
      for (var i = 0; i < 3; i++) { var sh = new T.Mesh(new T.SphereGeometry(1, 32, 22), D.holoMaterial({ color: 0x9fd4ff, rim: 0xffffff, base: 0, gain: 0, pow: 2.4 })); sh.position.set(0, 0.95, 0.02); pulse.add(sh); shells.push(sh); }
      st.layer('pulse', pulse, { k: 2.5, fn: function (v, e, t) { for (var i = 0; i < 3; i++) { var u = ((t / 4.8) + i / 3) % 1; shells[i].scale.set(0.3 + u * 0.95, 0.62 + u * 1.0, 0.26 + u * 0.8); shells[i].material.uniforms.uGain.value = (1 - u) * (1 - u) * 0.6; } } });

      /* продление стебля и ось */
      var top = A.crown.y;
      var extCurve = new T.CatmullRomCurve3([V(0, 1.44, 0), V(0, 1.52, 0), V(0, top + 0.1, 0), V(0, top + 0.18, 0)]);
      st.layer('ext', D.fireTube(extCurve, 0.0105, 40, 0xffffff), { k: 1.6 });
      var axisPts = A.stem.getPoints(40).concat([V(0, 1.55, 0), V(0, top + 0.18, 0)]);
      var axisCurve = new T.CatmullRomCurve3(axisPts);
      st.layer('axis', D.fireTube(axisCurve, 0.013, 140, 0xffffff), { k: 0.9 });
      var calm = new T.Mesh(new T.SphereGeometry(1, 40, 28), D.holoMaterial({ color: 0x9fd4ff, rim: 0xe9f6ff, base: 0, gain: 0.5, pow: 2.2 }));
      calm.scale.set(0.5, 1.08, 0.42); calm.position.set(0, 0.88, 0.04);
      st.layer('calm', calm, { k: 1.8, fn: function (v, e, t) { calm.material.uniforms.uGain.value = (0.18 + 0.12 * Math.sin(t * 1.1)) ; } });
      /* внимание, распределённое вдоль всей оси: ровная «жемчужная нить» */
      var attn = new T.Group(), fAttn = [D.flow(axisCurve, 70, { speed: 0.035, size: 0.07, color: 0xffffff }), D.flow(axisCurve, 70, { speed: -0.03, size: 0.05, color: 0xbfe3ff, phase: 0.5 })];
      fAttn.forEach(function (f) { attn.add(f); });
      st.layer('attn', attn, { k: 2.4 });
      /* приборы на нуле (HTML поверх сцены) */
      st.htmlLayer('dials', D.gaugesHTML(3, 'всё на нуле'));

      st.label('ext', V(0.02, top + 0.17, 0), '+15–20 см');
      st.label('axis', V(0.03, 0.86, -0.07), 'огненная ось');
      st.updaters.push(function (dt, t) { fAttn.forEach(function (f) { f.userData.upd(t); }); });
      st.home = CAMS.full; st.cams = CAMS;
    }
    return { id: 'nol', label: '3D-схема: «Ноль-концентрация»', steps: steps, build: build, cams: CAMS, fallback: 'nol' };
  };
})(window);
