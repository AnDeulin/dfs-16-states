/* 3D-сцена «Кино»: вечером вы в кресле смотрите цветной широкоформатный фильм о своём дне — события идут в обратном порядке,
   от вечера к утру; вы — в главной роли, а не за кинокамерой. */
(function (G) {
  'use strict';
  var D = G.DFSC = G.DFSC || {};
  D.S3 = D.S3 || {};
  var T = G.THREE;

  var CAMS = {
    full:  { az: 146, el: 14, dist: 6.0, t: [0, 1.0, 1.1] },
    side:  { az: 90, el: 8, dist: 5.0, t: [0, 1.0, 0.95] },
    over:  { az: 158, el: 12, dist: 4.6, t: [0, 1.05, 1.3] },
    front: { az: 24, el: 8, dist: 4.4, t: [0, 1.0, 0.9] }
  };
  D.CAMS.kino = CAMS;

  /* маленькие рисованные «кадры» для экрана */
  function canvasPlane(w, h, draw, size) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d'); draw(g, w, h);
    var tex = new T.CanvasTexture(c); tex.anisotropy = 4;
    var m = new T.Mesh(new T.PlaneGeometry(size * w / h, size), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: T.DoubleSide }));
    return m;
  }
  function round(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function person(g, cx, cy, s, col) {
    g.fillStyle = col; g.beginPath(); g.arc(cx, cy - s * 0.62, s * 0.2, 0, 7); g.fill();
    g.beginPath(); g.moveTo(cx - s * 0.22, cy - s * 0.35); g.lineTo(cx + s * 0.22, cy - s * 0.35); g.lineTo(cx + s * 0.3, cy + s * 0.2); g.lineTo(cx - s * 0.3, cy + s * 0.2); g.closePath(); g.fill();
    g.fillRect(cx - s * 0.2, cy + s * 0.2, s * 0.15, s * 0.45); g.fillRect(cx + s * 0.05, cy + s * 0.2, s * 0.15, s * 0.45);
  }
  function frame(label, bg) {
    return canvasPlane(480, 360, function (g, w, h) {
      g.fillStyle = bg; round(g, 6, 6, w - 12, h - 12, 26); g.fill(); person(g, w / 2, h * 0.52, 190, 'rgba(220,230,255,.95)');
      g.fillStyle = 'rgba(255,255,255,.9)'; g.font = '700 38px sans-serif'; g.textAlign = 'left'; g.fillText(label, 28, 58);
    }, 0.75);
  }
  function mainRole() {
    return canvasPlane(480, 400, function (g, w, h) {
      g.fillStyle = '#26356f'; round(g, 6, 6, w - 12, h - 12, 26); g.fill();
      var gr = g.createRadialGradient(w / 2, h * 0.5, 10, w / 2, h * 0.5, 200); gr.addColorStop(0, 'rgba(255,227,160,.55)'); gr.addColorStop(1, 'rgba(255,227,160,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      person(g, w / 2, h * 0.5, 190, '#ffe3a0'); g.fillStyle = '#fff'; g.font = '700 30px sans-serif'; g.textAlign = 'center'; g.fillText('вы — в главной роли', w / 2, h - 28);
    }, 0.8);
  }
  function camWrong() {
    return canvasPlane(480, 400, function (g, w, h) {
      g.fillStyle = '#3a2433'; round(g, 6, 6, w - 12, h - 12, 26); g.fill();
      g.fillStyle = '#ff9a9a'; round(g, w / 2 - 80, h / 2 - 50, 120, 90, 14); g.fill(); g.beginPath(); g.moveTo(w / 2 + 44, h / 2 - 30); g.lineTo(w / 2 + 100, h / 2 - 56); g.lineTo(w / 2 + 100, h / 2 + 56); g.lineTo(w / 2 + 44, h / 2 + 30); g.fill();
      g.strokeStyle = '#ff6b6b'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(90, 90); g.lineTo(w - 90, h - 110); g.moveTo(w - 90, 90); g.lineTo(90, h - 110); g.stroke();
      g.fillStyle = '#ffd0d0'; g.font = '700 30px sans-serif'; g.textAlign = 'center'; g.fillText('не камера', w / 2, h - 28);
    }, 0.8);
  }

  D.timelineHTML = function () {
    var el = document.createElement('div'); el.className = 's3-time';
    el.innerHTML = '<span>вечер</span><div class="tl"><i></i></div><span>утро</span><b>так идёт фильм →</b>';
    return el;
  };

  D.S3.kino = function () {
    var steps = [
      { t: 'Завершающее дело дня', add: ['screen'], cam: 'full',
        d: '«Кино» — последнее, что вы делаете за день. Это самостоятельное упражнение: в группе его не проведёшь.' },
      { t: 'Фильм о вас', add: ['f1', 'time'], cam: 'over',
        d: 'Вы смотрите цветной широкоформатный фильм, где главная роль — ваша.' },
      { t: 'События идут назад', add: ['f2', 'toward'], rm: ['f1'], cam: 'side',
        d: 'Все события идут в обратном порядке: от вечера к утру.' },
      { t: 'Вы — герой, а не камера', add: ['hero', 'cam'], rm: ['f2', 'toward'], cam: 'over',
        d: 'Важно быть героем фильма, а не камерой, вокруг которой всё вращается. Для этого нужны навыки растождествления и устойчивое самосознание.' },
      { t: 'Почему «назад»', add: ['toward', 'f3'], rm: ['hero', 'cam'], cam: 'side',
        d: 'Встречающий на вокзале встанет лицом к потоку людей; машины, едущие на вас, видно лучше, чем уезжающие. Так и здесь: события, идущие навстречу, легче рассмотреть. Плёнку можно ускорить, замедлить, увеличить кадр.' },
      { t: 'Крупнее, медленнее, стоп', add: ['zoom'], rm: ['toward'], cam: 'over',
        d: 'Пример из книги: не помнишь, где оставил записную книжку. Увеличиваешь кадр и замедляешь, пока не увидишь, как уходил из офиса с сумкой и телефоном, а книжка осталась на столе.' },
      { t: 'Что получается и что мешает', rm: ['zoom', 'f3'], add: ['f1'], cam: 'full',
        d: 'Чтобы фильм шёл непрерывно, нужно быть осознанным в течение всего дня. У упражнения есть конец: его результат становится постоянным качеством инструмента.' }
    ];

    function build(st) {
      var H = D.makeSeatedHuman(), A = H.A, V = H.V;
      st.scene.add(D.makeFloor(2.4));
      st.layer('shell', H.parts.shell, { always: true }); st.layer('bones', H.parts.bones, { always: true }); st.layer('hands', H.parts.open, { always: true });
      /* кресло вместо стула */
      var cm = D.holoMaterial({ color: 0x6b7fc0, rim: 0xb7caff, base: 0.07, gain: 0.55, pow: 1.5 }), ch = new T.Group();
      var seat = new T.Mesh(new T.BoxGeometry(0.62, 0.12, 0.6), cm); seat.position.set(0, 0.4, 0.05); ch.add(seat);
      var back = new T.Mesh(new T.BoxGeometry(0.62, 0.7, 0.1), cm); back.position.set(0, 0.8, -0.25); back.rotation.x = -0.12; ch.add(back);
      [1, -1].forEach(function (s) { var arm = new T.Mesh(new T.BoxGeometry(0.1, 0.14, 0.52), cm); arm.position.set(s * 0.36, 0.62, 0.02); ch.add(arm); var leg = new T.Mesh(new T.BoxGeometry(0.06, 0.34, 0.06), cm); leg.position.set(s * 0.26, 0.17, 0.3); ch.add(leg); var leg2 = leg.clone(); leg2.position.z = -0.2; ch.add(leg2); });
      st.layer('armchair', ch, { always: true });

      /* экран */
      var scr = new T.Group();
      var panel = new T.Mesh(new T.PlaneGeometry(2.0, 1.12), new T.MeshBasicMaterial({ color: 0x7fa6e6, transparent: true, opacity: 0.5, depthWrite: false })); panel.position.set(0, 1.05, 2.1); panel.rotation.y = Math.PI; scr.add(panel);
      var edges = new T.LineSegments(new T.EdgesGeometry(new T.PlaneGeometry(2.04, 1.16)), new T.LineBasicMaterial({ color: 0xbfd6ff })); edges.position.copy(panel.position); edges.rotation.y = Math.PI; scr.add(edges);
      var gl = D.glowSprite(0x8fc0ff, 3.6, 0.28); gl.position.set(0, 1.05, 2.4); scr.add(gl);
      st.layer('screen', scr, { k: 2.5 });

      function onScreen(m, x, y, s, name) { m.position.set(x, y, 2.07); m.rotation.y = Math.PI; m.renderOrder = 5; if (s) m.scale.setScalar(s); st.layer(name, m, { k: 3.5 }); return m; }
      onScreen(frame('22:00', '#3a4a8f'), -0.55, 1.05, 1, 'f1');
      onScreen(frame('13:00', '#8f6a3a'), -0.55, 1.05, 1, 'f2');
      onScreen(frame('09:00', '#3a8f6a'), -0.55, 1.05, 1, 'f3');
      onScreen(mainRole(), -0.5, 1.05, 1, 'hero');
      onScreen(camWrong(), 0.5, 1.05, 1, 'cam');
      var zoom = new T.Group(); var zr = new T.Mesh(new T.TorusGeometry(0.2, 0.02, 10, 40), new T.MeshBasicMaterial({ color: 0xffd27a, transparent: true })); zoom.add(zr);
      var zh = new T.Mesh(new T.BoxGeometry(0.2, 0.035, 0.02), new T.MeshBasicMaterial({ color: 0xffd27a, transparent: true })); zh.position.set(-0.26, -0.2, 0); zh.rotation.z = -Math.PI / 4; zoom.add(zh);
      zoom.position.set(-0.55, 1.05, 2.05); st.layer('zoom', zoom, { k: 3.5 });

      /* события идут навстречу зрителю */
      var tw = new T.Group(), fl = [];
      [-0.25, 0, 0.25].forEach(function (x, i) {
        var c = new T.CatmullRomCurve3([V(x * 2, 1.0 + x * 0.3, 1.95), V(x * 1.2, 1.15, 1.2), V(x * 0.4, 1.3, 0.4), V(0, 1.38, 0.12)]);
        var f = D.flow(c, 16, { speed: 0.16, size: 0.06, phase: i / 3 }); fl.push(f); tw.add(f);
      });
      st.layer('toward', tw, { k: 3 });
      st.htmlLayer('time', D.timelineHTML());
      st.label('screen', V(0.9, 1.7, 2.1), 'экран');
      st.label('hero', V(-0.9, 1.5, 2.1), 'вы', { side: 'l' });
      st.updaters.push(function (dt, t) { fl.forEach(function (f) { f.userData.upd(t); }); });
      st.home = CAMS.full; st.cams = CAMS;
    }
    return { id: 'kino', label: '3D-схема: «Кино»', steps: steps, build: build, cams: CAMS, fallback: 'kino' };
  };
})(window);
