/* 3D-сцена «Созерцание»: простой предмет на столе; первая фаза — белое пространство внутри и 5 минут целостного взгляда;
   вторая фаза — тот же предмет внутри белого светящегося пространства ещё 5 минут. */
(function (G) {
  'use strict';
  var D = G.DFSC = G.DFSC || {};
  D.S3 = D.S3 || {};
  var T = G.THREE;

  var CAMS = {
    full: { az: 52, el: 10, dist: 4.0, t: [0, 0.95, 0.4] },
    side: { az: 90, el: 6, dist: 3.6, t: [0, 1.0, 0.45] },
    head: { az: 62, el: 8, dist: 1.5, t: [0, 1.38, 0.1] },
    cube: { az: 70, el: 18, dist: 1.5, t: [0, 0.86, 0.85] }
  };
  D.CAMS.soz = CAMS;

  function chipEl(text) { var e = document.createElement('div'); e.className = 's3-chip'; e.textContent = text; return e; }
  D.chipHTML = chipEl;

  D.S3.soz = function () {
    var steps = [
      { t: 'Подготовка', add: ['obj', 'eyeOpen'], cam: 'full',
        d: 'Устройтесь максимально удобно. Предмет — самый простой (спичечный коробок, детский кубик) — поставьте так, чтобы смотреть на него без напряжения.' },
      { t: 'Первая фаза · белое пространство', add: ['eyeShut', 'white'], rm: ['eyeOpen'], cam: 'head',
        d: 'Закройте глаза и добейтесь белого светящегося пространства внутри себя.' },
      { t: 'Первая фаза · смотрим на предмет', add: ['eyeOpen', 'gaze', 'lbl1'], rm: ['eyeShut'], cam: 'side', focus: ['gaze'],
        d: 'Откройте глаза и пять минут смотрите на предмет, не отрываясь. Не изучайте детали и не водите взглядом: воспринимайте предмет целиком, впуская его внутрь.' },
      { t: 'Вторая фаза · предмет внутри', add: ['eyeShut', 'white', 'inner', 'lbl2'], rm: ['eyeOpen', 'gaze', 'lbl1'], cam: 'head',
        d: 'Закройте глаза и ещё пять минут созерцайте тот же предмет в белом светящемся пространстве внутри.' },
      { t: 'Что должно получиться', rm: ['lbl2'], cam: 'full',
        d: 'Белое пустое светящееся пространство достигнуто по-настоящему; восприятие предмета целостное и без оценок. Всё занятие — 15–20 минут.' },
      { t: 'У упражнения есть конец', cam: 'full',
        d: 'В какой-то момент становится ясно, что «Созерцание» исчерпало себя как упражнение и стало постоянным качеством вашего сознания.' }
    ];

    function build(st) {
      var H = D.makeSeatedHuman(), A = H.A, V = H.V;
      st.scene.add(D.makeFloor(1.5));
      st.layer('shell', H.parts.shell, { always: true }); st.layer('bones', H.parts.bones, { always: true }); st.layer('chair', H.parts.chair, { always: true });
      st.layer('hands', H.parts.open, { always: true });

      /* стол и предмет */
      var tm = D.holoMaterial({ color: 0x8aa0e0, rim: 0xcfe0ff, base: 0.06, gain: 0.6, pow: 1.6 });
      var table = new T.Group();
      var top = new T.Mesh(new T.BoxGeometry(0.8, 0.04, 0.5), tm); top.position.set(0, 0.76, 0.9); table.add(top);
      [[-0.36, 0.7], [0.36, 0.7], [-0.36, 1.1], [0.36, 1.1]].forEach(function (q) { var l = new T.Mesh(new T.BoxGeometry(0.04, 0.74, 0.04), tm); l.position.set(q[0], 0.37, q[1]); table.add(l); });
      st.layer('table', table, { always: true });
      var cubeG = new T.Group();
      var cube = new T.Mesh(new T.BoxGeometry(0.13, 0.13, 0.13), new T.MeshBasicMaterial({ color: 0xf0dfae, transparent: true, opacity: 0.85 }));
      var edges = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(0.13, 0.13, 0.13)), new T.LineBasicMaterial({ color: 0xfff6d8, transparent: true }));
      cubeG.add(cube); cubeG.add(edges); cubeG.add(D.glowSprite(0xffe9b0, 0.5, 0.35)); cubeG.position.set(0, 0.845, 0.9);
      st.layer('obj', cubeG, { k: 3 });

      /* глаза */
      var eyeO = new T.Group(), eyeS = new T.Group();
      [1, -1].forEach(function (s) {
        var w = new T.Mesh(new T.SphereGeometry(0.0125, 14, 10), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true })); w.position.set(s * 0.035, 1.4, 0.088); eyeO.add(w);
        var arc = new T.CatmullRomCurve3([V(s * 0.05, 1.402, 0.085), V(s * 0.035, 1.392, 0.095), V(s * 0.02, 1.402, 0.098)]);
        eyeS.add(new T.Mesh(new T.TubeGeometry(arc, 10, 0.0026, 5, false), new T.MeshBasicMaterial({ color: 0xe6f3ff, transparent: true })));
      });
      st.layer('eyeOpen', eyeO, { k: 6 }); st.layer('eyeShut', eyeS, { k: 6 });

      /* белое светящееся пространство внутри головы */
      var white = new T.Group();
      var core = new T.Mesh(new T.SphereGeometry(0.058, 22, 16), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })); core.position.copy(A.s3); white.add(core);
      var glow = D.glowSprite(0xe6f3ff, 0.62, 0.9); glow.position.copy(A.s3); white.add(glow);
      st.layer('white', white, { k: 2.4, fn: function (v, e, t) { glow.scale.setScalar(0.55 + 0.05 * Math.sin(t * 1.6)); } });
      /* предмет внутри */
      var inner = new T.Group();
      var ic = new T.Mesh(new T.BoxGeometry(0.05, 0.05, 0.05), new T.MeshBasicMaterial({ color: 0xf0dfae, transparent: true, opacity: 0.95 }));
      ic.position.set(0, 1.388, 0.01); inner.add(ic);
      inner.add((function () { var e = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(0.05, 0.05, 0.05)), new T.LineBasicMaterial({ color: 0x6a5420, transparent: true })); e.position.copy(ic.position); return e; })());
      st.layer('inner', inner, { k: 2.6, fn: function (v, e, t) { inner.rotation.y = 0; ic.rotation.y = t * 0.5; } });
      /* взгляд: точки от глаз к предмету и «рамка целого» */
      var gaze = new T.Group(), flows = [];
      [0.035, -0.035].forEach(function (x, i) {
        var c = new T.CatmullRomCurve3([V(x, 1.4, 0.1), V(x * 0.6, 1.1, 0.5), V(0, 0.9, 0.84)]);
        var f = D.flow(c, 14, { speed: 0.22, size: 0.045, phase: i * 0.5 }); flows.push(f); gaze.add(f);
      });
      var frame = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(0.22, 0.22, 0.22)), new T.LineBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.9 }));
      frame.position.set(0, 0.85, 0.9); gaze.add(frame);
      st.layer('gaze', gaze, { k: 3 });
      st.htmlLayer('lbl1', chipEl('5 минут · смотрим'));
      st.htmlLayer('lbl2', chipEl('ещё 5 минут · внутри'));
      st.label('gaze', V(0.12, 0.92, 0.9), 'целиком, без деталей');
      st.label('white', V(0.08, 1.46, 0.0), 'белое пространство');
      st.updaters.push(function (dt, t) { flows.forEach(function (f) { f.userData.upd(t); }); });
      st.home = CAMS.full; st.cams = CAMS;
    }
    return { id: 'soz', label: '3D-схема: «Созерцание»', steps: steps, build: build, cams: CAMS, fallback: 'soz' };
  };
})(window);
