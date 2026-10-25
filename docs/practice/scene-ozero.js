/* 3D-сцена «Озеро покоя»: внутри фигуры тихое глубокое озеро; поверхность успокаивается, погружение, шум сверху не доходит до глубины,
   чем глубже покой — тем белее и ярче светится внутреннее пространство. */
(function (G) {
  'use strict';
  var D = G.DFSC = G.DFSC || {};
  D.S3 = D.S3 || {};
  var T = G.THREE;

  var CAMS = {
    full: { az: 28, el: 8, dist: 3.9, t: [0, 0.8, 0.1] },
    lake: { az: 25, el: 16, dist: 1.5, t: [0, 0.82, 0.02] },
    deep: { az: 30, el: 6, dist: 1.6, t: [0, 0.72, 0.02] }
  };
  D.CAMS.ozero = CAMS;

  D.S3.ozero = function () {
    var steps = [
      { t: 'Озеро внутри вас', add: ['ripples'], cam: 'full',
        d: 'Ощутите себя пространством. Внутри — тихое глубокое озеро.' },
      { t: 'Гладь как зеркало', add: ['mirror'], rm: ['ripples'], cam: 'lake',
        d: 'Поверхность неподвижна, как зеркало: небо и лес отражаются в ней чисто.' },
      { t: 'Погружение', add: ['diver', 'deep'], cam: 'deep', ms: 9000,
        d: 'Вы опускаетесь вглубь своего покоя: чем глубже, тем тише.' },
      { t: 'Покой, который не качает шторм', add: ['storm'], rm: ['mirror'], cam: 'deep', ms: 11000,
        d: 'На поверхности — волны, ветер, голоса, а в глубине спокойно. Такой покой не зависит от суеты вокруг и от всплесков эмоций.' },
      { t: 'Белое светящееся пространство', add: ['white'], cam: 'full', ms: 8000,
        d: 'Так вы приходите к пустому белому светящемуся пространству внутри. Чем глубже покой, тем белее и ярче оно светится.' }
    ];

    function build(st) {
      var H = D.makeSeatedHuman(), V = H.V;
      st.scene.add(D.makeFloor(1.3));
      st.layer('shell', H.parts.shell, { always: true }); st.layer('chair', H.parts.chair, { always: true }); st.layer('hands', H.parts.joined, { always: true });
      st.layer('bones', H.parts.bones, { always: true });

      /* озеро: поверхность с рябью + объём воды вниз до пупка */
      var yTop = 0.9, yBot = 0.6;
      var lake = new T.Group();
      var surfGeo = new T.PlaneGeometry(0.3, 0.2, 30, 20); surfGeo.rotateX(-Math.PI / 2);
      var base = surfGeo.attributes.position.array.slice();
      var surf = new T.Mesh(surfGeo, new T.MeshBasicMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.5, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending, wireframe: false }));
      surf.position.set(0, yTop, -0.02); lake.add(surf);
      var rim = new T.Mesh(new T.TorusGeometry(0.1, 0.002, 6, 48), new T.MeshBasicMaterial({ color: 0xe6f5ff, transparent: true })); rim.rotation.x = Math.PI / 2; rim.scale.set(1.5, 1, 1); rim.position.set(0, yTop, -0.02); lake.add(rim);
      var vol = new T.Mesh(new T.CylinderGeometry(0.15, 0.09, yTop - yBot, 32, 1, true), new T.ShaderMaterial({
        transparent: true, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending,
        uniforms: { uOpacity: { value: 1 }, uA: { value: 0.28 } },
        vertexShader: 'varying float vY; void main(){ vY = uv.y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader: 'uniform float uOpacity; uniform float uA; varying float vY; void main(){ vec3 top = vec3(0.45,0.72,1.0); vec3 bot = vec3(0.1,0.2,0.55); gl_FragColor = vec4(mix(bot, top, vY), (0.12 + 0.6*vY*vY) * uA * uOpacity * 3.0); }'
      }));
      vol.scale.set(1, 1, 0.7); vol.position.set(0, (yTop + yBot) / 2, -0.02); lake.add(vol);
      st.layer('lake', lake, { always: true });
      lake.visible = true;

      var amp = { v: 0.012, target: 0.012 }, ripple = new T.Group();
      st.layer('ripples', ripple, { k: 2 }); st.layer('mirror', new T.Group(), { k: 2 }); st.layer('storm', new T.Group(), { k: 2 });
      /* «погружение»: светящаяся точка спускается по оси озера */
      var diver = new T.Group(); diver.add(D.glowSprite(0xffffff, 0.12, 1)); diver.add(D.glowSprite(0x8fcfff, 0.34, 0.5));
      st.layer('diver', diver, { k: 3, fn: function (v, e, t) { var u = 0.5 + 0.5 * Math.sin(t * 0.5 - 1.2); diver.position.set(0, yTop - 0.03 - u * (yTop - yBot - 0.07), -0.02); } });
      var deep = new T.Group(); var dg = D.glowSprite(0x6fb6ff, 0.5, 0.35); dg.position.set(0, yBot + 0.04, -0.02); deep.add(dg);
      st.layer('deep', deep, { k: 2 });
      /* белое светящееся внутри */
      var white = new T.Group();
      var wc = D.glowSprite(0xffffff, 0.8, 0.7); wc.position.set(0, 0.78, -0.02); white.add(wc);
      var wc2 = D.glowSprite(0xdff0ff, 1.7, 0.32); wc2.position.set(0, 0.8, -0.02); white.add(wc2);
      st.layer('white', white, { k: 1.4, fn: function (v, e, t) { wc.scale.setScalar(0.85 + 0.08 * Math.sin(t * 1.2)); } });

      var pos = surfGeo.attributes.position;
      st.updaters.push(function (dt, t, stage) {
        var L = stage.layers;
        var target = (L.ripples.target > 0.5) ? 0.022 : (L.storm.target > 0.5 ? 0.03 : 0.0015);
        amp.v += (target - amp.v) * (1 - Math.exp(-dt * 2.2));
        for (var i = 0; i < pos.count; i++) {
          var x = base[i * 3], z = base[i * 3 + 2];
          pos.setY(i, Math.sin(x * 38 + t * 2.4) * amp.v * 0.5 + Math.cos(z * 44 - t * 2.1) * amp.v * 0.5);
        }
        pos.needsUpdate = true;
      });
      st.label('lake', V(0.15, yTop, -0.02), 'озеро');
      st.layers.lake.obj.visible = true;
      st.home = CAMS.full; st.cams = CAMS;
    }
    return { id: 'ozero', label: '3D-схема: озеро покоя внутри', steps: steps, build: build, cams: CAMS, fallback: 'ozero' };
  };
})(window);
