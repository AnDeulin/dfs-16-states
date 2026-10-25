/* Движок 3D-сцены для практик: камера (вращение пальцем/мышью, щипок, колесо), слои с плавным появлением,
   подписи-метки (HTML), потоки частиц, свечение. Требует three.js (vendor/three.min.js, r149). */
(function (G) {
  'use strict';
  var D = G.DFSC = G.DFSC || {};
  var T = G.THREE;

  D.has3D = function () {
    try {
      if (!G.THREE) return false;
      var c = document.createElement('canvas');
      return !!(G.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  };

  var RAD = Math.PI / 180;
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function smooth(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }

  /* ---------- текстуры и материалы-помощники ---------- */
  var _glow = null;
  D.glowTexture = function () {
    if (_glow) return _glow;
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(.22, 'rgba(235,247,255,.8)');
    r.addColorStop(.55, 'rgba(150,205,255,.26)');
    r.addColorStop(1, 'rgba(150,205,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    _glow = new T.CanvasTexture(c);
    return _glow;
  };

  /* Голографическая «стеклянная» поверхность: прозрачная середина, яркий край (френель) */
  D.holoMaterial = function (o) {
    o = o || {};
    return new T.ShaderMaterial({
      transparent: true, depthWrite: false, side: T.DoubleSide,
      uniforms: {
        uColor: { value: new T.Color(o.color || 0x7f9bf0) },
        uRim: { value: new T.Color(o.rim || 0xcfe6ff) },
        uBase: { value: o.base != null ? o.base : 0.07 },
        uPow: { value: o.pow || 2.0 },
        uGain: { value: o.gain != null ? o.gain : 0.8 },
        uOpacity: { value: 1 }
      },
      vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 uColor; uniform vec3 uRim; uniform float uBase; uniform float uPow; uniform float uGain; uniform float uOpacity; varying vec3 vN; varying vec3 vV;' +
        'void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPow); vec3 col = mix(uColor, uRim, f); float a = (uBase + f * uGain) * uOpacity; gl_FragColor = vec4(col, a); }'
    });
  };

  D.glowSprite = function (color, size, opacity) {
    var m = new T.SpriteMaterial({ map: D.glowTexture(), color: color || 0xdff3ff, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: opacity != null ? opacity : 1 });
    var s = new T.Sprite(m); s.scale.set(size, size, 1); return s;
  };

  /* Огненная трубка с рисованием вдоль пути: ядро + мягкое свечение */
  D.fireTube = function (curve, r, segs, color) {
    var g = new T.Group();
    var core = new T.Mesh(new T.TubeGeometry(curve, segs, r, 8, false), new T.MeshBasicMaterial({ color: color || 0xf2fbff, transparent: true, depthWrite: false }));
    var halo = new T.Mesh(new T.TubeGeometry(curve, segs, r * 3.2, 8, false), new T.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: .22, depthWrite: false, blending: T.AdditiveBlending }));
    halo.material.userData.keep = true;
    g.add(halo); g.add(core);
    g.userData.draw = function (p) {
      [core, halo].forEach(function (m) {
        var n = m.geometry.index.count;
        m.geometry.setDrawRange(0, Math.max(0, Math.floor(p * n / 6)) * 6);
      });
    };
    g.userData.curve = curve;
    return g;
  };

  /* Поток светящихся частиц вдоль кривой */
  D.flow = function (curve, n, o) {
    o = o || {};
    var geo = new T.BufferGeometry(), pos = new Float32Array(n * 3);
    geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    var mat = new T.PointsMaterial({ map: D.glowTexture(), size: o.size || 0.07, color: o.color || 0xffffff, transparent: true, depthWrite: false, blending: T.AdditiveBlending, sizeAttenuation: true, opacity: o.opacity != null ? o.opacity : 0.95 });
    var pts = new T.Points(geo, mat); pts.frustumCulled = false;
    var speed = o.speed || 0.12, dir = o.dir || 1, ph = o.phase || 0;
    pts.userData.upd = function (t) {
      for (var i = 0; i < n; i++) {
        var u = (i / n + ph + t * speed * dir) % 1; if (u < 0) u += 1;
        var p = curve.getPointAt(u);
        pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
      }
      geo.attributes.position.needsUpdate = true;
    };
    pts.userData.upd(0);
    return pts;
  };

  /* ---------- сцена ---------- */
  function Stage(host, opt) {
    opt = opt || {};
    var self = this;
    this.host = host; this.opt = opt;
    this.layers = {}; this.fx = {}; this.labels = []; this.updaters = []; this.labelMode = 'focus'; this.focus = {};
    this.clock = 0; this.running = false; this.visible = true; this.reduce = false;
    try { this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    var coarse = false; try { coarse = window.matchMedia('(pointer: coarse)').matches; } catch (e) {}
    this.renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.75 : 2));
    this.renderer.setClearColor(0x000000, 0);
    this.canvas = this.renderer.domElement;
    this.canvas.className = 's3-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(this.canvas);

    this.labelBox = document.createElement('div'); this.labelBox.className = 's3-labels'; host.appendChild(this.labelBox);

    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(opt.fov || 30, 1, 0.05, 60);
    this.cam = { az: 28, el: 8, dist: 4.2, tx: 0, ty: 0.8, tz: 0.1 };      // текущее (в градусах)
    this.goal = { az: 28, el: 8, dist: 4.2, tx: 0, ty: 0.8, tz: 0.1 };      // цель
    this.limits = { elMin: -14, elMax: 78, dMin: 0.8, dMax: 7.5 };
    this.auto = false; this.autoSpeed = 14;                                  // градусов в секунду
    this.lastTouch = -99;
    this.userMoved = false;
    this.onuser = null;

    this._bind();
    this._resizeObs();
    this._io();
    this.resize();
  }

  Stage.prototype._resizeObs = function () {
    var self = this;
    if ('ResizeObserver' in window) { this.ro = new ResizeObserver(function () { self.resize(); }); this.ro.observe(this.host); }
    else { this._rs = function () { self.resize(); }; window.addEventListener('resize', this._rs); }
  };
  Stage.prototype._io = function () {
    var self = this;
    if (!('IntersectionObserver' in window)) return;
    this.io = new IntersectionObserver(function (es) { self.visible = es[0].isIntersecting; self._kick(); }, { threshold: 0.01 });
    this.io.observe(this.host);
    this._vis = function () { self._kick(); };
    document.addEventListener('visibilitychange', this._vis);
  };

  Stage.prototype.resize = function () {
    var w = Math.max(2, this.host.clientWidth), h = Math.max(2, this.host.clientHeight);
    if (w === this.w && h === this.h) return;
    this.w = w; this.h = h;
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
    this.camera.aspect = w / h;
    /* на узком экране отъезжаем дальше, чтобы сцена помещалась по ширине */
    var asp = w / h; this.distScale = asp >= 1.05 ? 1 : clamp(1.05 / asp, 1, 1.5);
    /* место под субтитры внизу картинки: сцена сдвигается вверх на --s3-shift пикселей */
    var sh = 0; try { sh = parseFloat(getComputedStyle(this.host).getPropertyValue('--s3-shift')) || 0; } catch (e) {}
    if (sh) this.camera.setViewOffset(w, h, 0, sh, w, h); else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
    this._kick();
  };

  /* ---------- управление камерой ---------- */
  Stage.prototype._bind = function () {
    var self = this, c = this.canvas, pts = {}, last = null;
    c.style.touchAction = 'pan-y';   /* вертикальный жест прокручивает страницу, горизонтальный вращает */
    function down(e) {
      try { c.setPointerCapture && c.setPointerCapture(e.pointerId); } catch (err) {}
      pts[e.pointerId] = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false };
      last = null; self.lastTouch = self.clock;
    }
    function move(e) {
      var p = pts[e.pointerId]; if (!p) return;
      var ids = Object.keys(pts);
      if (ids.length >= 2) {
        var a = pts[ids[0]], b = pts[ids[1]];
        var d0 = Math.hypot(a.x - b.x, a.y - b.y);
        p.x = e.clientX; p.y = e.clientY;
        var d1 = Math.hypot(a.x - b.x, a.y - b.y); if (!p.moved) { p.moved = true; self._user(); }
        if (last && d1 > 0) self.goal.dist = clamp(self.goal.dist * (last / d1), self.limits.dMin, self.limits.dMax);
        last = d1;
      } else {
        var dx = e.clientX - p.x, dy = e.clientY - p.y;
        p.x = e.clientX; p.y = e.clientY;
        /* простое касание или щелчок не считается вмешательством: нужно сдвинуть минимум на 8 пикселей */
        if (!p.moved) { if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) < 8) return; p.moved = true; self._user(); }
        self.goal.az -= dx * 0.42; self.cam.az -= dx * 0.42;
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
          self.goal.el = clamp(self.goal.el + dy * 0.30, self.limits.elMin, self.limits.elMax);
          self.cam.el = self.goal.el;
        }
      }
      self.lastTouch = self.clock; self._kick();
    }
    function up(e) { delete pts[e.pointerId]; last = null; self.lastTouch = self.clock; }
    c.addEventListener('pointerdown', down);
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    c.addEventListener('wheel', function (e) {
      if (!e.ctrlKey) return;     /* обычное колесо листает страницу; приближение — Ctrl + колесо или щипок */
      e.preventDefault();
      self.goal.dist = clamp(self.goal.dist * Math.exp(e.deltaY * 0.0012), self.limits.dMin, self.limits.dMax);
      self.lastTouch = self.clock; self._user(); self._kick();
    }, { passive: false });
    c.addEventListener('dblclick', function () { if (self.home) self.fly(self.home, true); });
  };
  Stage.prototype._user = function () { this.userMoved = true; if (this.onuser) this.onuser(); };

  /* Плавный облёт к виду {az, el, dist, t:[x,y,z]} (углы в градусах). Кратчайший путь по азимуту. */
  Stage.prototype.fly = function (v, instant) {
    if (!v) return;
    var g = this.goal;
    if (v.az != null) {
      var d = ((v.az - g.az) % 360 + 540) % 360 - 180;
      g.az = g.az + d;
    }
    if (v.el != null) g.el = clamp(v.el, this.limits.elMin, this.limits.elMax);
    if (v.dist != null) g.dist = v.dist;
    if (v.t) { g.tx = v.t[0]; g.ty = v.t[1]; g.tz = v.t[2]; }
    if (instant) { var c = this.cam; c.az = g.az; c.el = g.el; c.dist = g.dist; c.tx = g.tx; c.ty = g.ty; c.tz = g.tz; }
    this.userMoved = false; this._kick();
  };

  /* ---------- слои ---------- */
  function collectFade(obj) {
    var list = [];
    obj.traverse(function (o) {
      var m = o.material; if (!m) return;
      (Array.isArray(m) ? m : [m]).forEach(function (mm) {
        if (mm.userData.__f) return; mm.userData.__f = true; mm.transparent = true;
        if (mm.uniforms && mm.uniforms.uOpacity) list.push({ m: mm, u: 1, base: 1 });
        else list.push({ m: mm, base: mm.opacity != null ? mm.opacity : 1 });
      });
    });
    return list;
  }

  /* Регистрирует слой: obj — Object3D; o.k — скорость появления; o.pop — «выпрыгивание»; o.fn(v,e,t) — свой обработчик */
  Stage.prototype.layer = function (name, obj, o) {
    o = o || {};
    var L = { name: name, obj: obj, v: o.always ? 1 : 0, target: o.always ? 1 : 0, always: !!o.always, k: o.k || 3.2, pop: !!o.pop, fn: o.fn, fade: collectFade(obj), draw: obj.userData.draw };
    obj.visible = false;
    this.layers[name] = L;
    this.scene.add(obj);
    return L;
  };
  Stage.prototype.setState = function (on, fx) {
    var set = {}; (on || []).forEach(function (n) { set[n] = 1; });
    for (var n in this.layers) if (!this.layers[n].always) this.layers[n].target = set[n] ? 1 : 0;
    var f = {}; (fx || '').split(' ').forEach(function (n) { if (n) f[n] = 1; });
    this.fx = f; if (this.onState) this.onState(set, f); this._kick();
  };
  /* какие слои «в фокусе» на этом шаге: подписи показываем только у них (режим 'focus') */
  Stage.prototype.setFocus = function (names) { var f = {}; (names || []).forEach(function (n) { f[n] = 1; }); this.focus = f; this._kick(); };
  /* HTML-слой поверх сцены (шкалы, схемы): появляется и гаснет вместе со слоем */
  Stage.prototype.htmlLayer = function (name, el, o) {
    el.classList.add('s3-html'); this.host.appendChild(el);
    var g = new T.Group();
    return this.layer(name, g, { k: (o && o.k) || 4, fn: function (v, e) { el.style.opacity = e.toFixed(3); el.style.visibility = v > 0.01 ? 'visible' : 'hidden'; } });
  };
  Stage.prototype.layerOn = function (n) { var l = this.layers[n]; return !!l && l.target > 0; };

  /* Подпись, привязанная к точке сцены и слою */
  Stage.prototype.label = function (layerName, pos, text, o) {
    o = o || {};
    var el = document.createElement('div');
    el.className = 's3-lab' + (o.side === 'l' ? ' s3-lab--l' : '');
    el.innerHTML = '<i></i><span>' + text + '</span>';
    this.labelBox.appendChild(el);
    this.labels.push({ el: el, layer: layerName, pos: pos.clone ? pos : new T.Vector3(pos[0], pos[1], pos[2]), o: o });
    return el;
  };

  /* ---------- цикл ---------- */
  Stage.prototype._kick = function () {
    if (this.running || this.disposed) return;
    if (!this.visible || document.visibilityState === 'hidden') return;
    this.running = true; this._last = performance.now();
    var self = this;
    this._raf = requestAnimationFrame(function f(now) { self._frame(now, f); });
  };
  var tmp = new (G.THREE ? T.Vector3 : function () {})();
  Stage.prototype._frame = function (now, f) {
    if (this.disposed) return;
    if (!this.visible || document.visibilityState === 'hidden') { this.running = false; return; }
    var dt = Math.min(0.05, (now - this._last) / 1000); this._last = now; this.clock += dt;
    var t = this.clock, i;

    /* камера */
    if (this.auto && !this.reduce && t - this.lastTouch > 1.2) this.goal.az += this.autoSpeed * dt;
    var k = 1 - Math.exp(-dt * 5.2), c = this.cam, g = this.goal;
    c.az += (g.az - c.az) * k; c.el += (g.el - c.el) * k; c.dist += (g.dist - c.dist) * k;
    c.tx += (g.tx - c.tx) * k; c.ty += (g.ty - c.ty) * k; c.tz += (g.tz - c.tz) * k;
    var az = c.az * RAD, el = c.el * RAD;
    var dd = c.dist * (this.distScale || 1);
    this.camera.position.set(c.tx + dd * Math.sin(az) * Math.cos(el), c.ty + dd * Math.sin(el), c.tz + dd * Math.cos(az) * Math.cos(el));
    this.camera.lookAt(c.tx, c.ty, c.tz);

    /* слои */
    var kk = this.reduce ? 12 : 1;
    for (var n in this.layers) {
      var L = this.layers[n];
      var d = L.target - L.v;
      if (Math.abs(d) > 0.001) { L.v += d * (1 - Math.exp(-dt * L.k * kk)); if (Math.abs(L.target - L.v) < 0.002) L.v = L.target; }
      var e = smooth(L.v);
      L.obj.visible = L.v > 0.004;
      if (!L.obj.visible) continue;
      for (i = 0; i < L.fade.length; i++) { var q = L.fade[i]; if (q.u) q.m.uniforms.uOpacity.value = e; else q.m.opacity = q.base * e; }
      if (L.draw) L.draw(e);
      if (L.pop) { var s = 0.3 + 0.7 * Math.min(1.08, e * 1.08); L.obj.scale.setScalar(s); }
      if (L.fn) L.fn(L.v, e, t);
    }
    /* потоки */
    for (i = 0; i < this.updaters.length; i++) this.updaters[i](dt, t, this);
    /* подписи */
    this._labels();
    this.renderer.render(this.scene, this.camera);
    this._raf = requestAnimationFrame(f);
  };
  Stage.prototype._labels = function () {
    var w = this.w, h = this.h, cam = this.camera;
    for (var i = 0; i < this.labels.length; i++) {
      var b = this.labels[i], L = this.layers[b.layer], a = L ? smooth(L.v) : 1;
      var show = this.labelMode === 'all' ? 1 : (this.labelMode === 'off' ? 0 : (this.focus[b.layer] ? 1 : 0));
      a = Math.min(a, show);
      if (b.fade == null) b.fade = 0;
      b.fade += (a - b.fade) * 0.18; a = b.fade;
      if (a < 0.04 || (b.o.hide && b.o.hide(this))) { if (b.on !== 0) { b.el.style.opacity = 0; b.on = 0; } continue; }
      tmp.copy(b.pos).project(cam);
      if (tmp.z > 1) { b.el.style.opacity = 0; continue; }
      var x = (tmp.x * 0.5 + 0.5) * w, y = (-tmp.y * 0.5 + 0.5) * h;
      b.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      b.el.style.opacity = a.toFixed(2); b.on = 1;
    }
  };

  Stage.prototype.dispose = function () {
    this.disposed = true; this.running = false;
    cancelAnimationFrame(this._raf);
    if (this.ro) this.ro.disconnect();
    if (this.io) this.io.disconnect();
    if (this._rs) window.removeEventListener('resize', this._rs);
    if (this._vis) document.removeEventListener('visibilitychange', this._vis);
    this.scene.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      var m = o.material; if (m) (Array.isArray(m) ? m : [m]).forEach(function (x) { x.dispose && x.dispose(); });
    });
    try { this.renderer.dispose(); this.renderer.forceContextLoss(); } catch (e) {}
    if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
    if (this.labelBox.parentNode) this.labelBox.parentNode.removeChild(this.labelBox);
  };

  D.Stage = Stage;
  D.smooth = smooth; D.clamp = clamp;
})(window);
