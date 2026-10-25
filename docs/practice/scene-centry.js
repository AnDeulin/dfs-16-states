/* 3D-сцена «Три центра и четвёрка»: физический, эмоциональный и интеллектуальный источники энергии; доминанта — один центр сильнее;
   «четвёрка» (аккорд) — все три звучат вместе с одинаковой силой. */
(function (G) {
  'use strict';
  var D = G.DFSC = G.DFSC || {};
  D.S3 = D.S3 || {};
  var T = G.THREE;

  var CAMS = {
    full: { az: 26, el: 6, dist: 3.9, t: [0, 0.8, 0.1] },
    low: { az: 34, el: 14, dist: 2.2, t: [0, 0.6, 0.05] },
    mid: { az: 30, el: 8, dist: 2.3, t: [0, 1.0, 0] },
    high: { az: 26, el: 6, dist: 2.0, t: [0, 1.36, 0] }
  };
  D.CAMS.centry = CAMS;

  D.S3.centry = function () {
    var steps = [
      { t: 'Три источника энергии', cam: 'full',
        d: 'В деятельности выделяют три основных источника энергии, они определяют уровень активности. Вспомните себя за спортом или переноской тяжестей, за душевной беседой, за подсчётом доходов и расходов — вы почувствуете разницу.' },
      { t: '1-й уровень · физический', add: ['c1'], cam: 'low',
        d: 'Физическая активность: спорт, огород, танец, перенос тяжестей, любые формы движения. Знакомое «сейчас горы сверну» — это избыток энергии в первом центре.' },
      { t: '2-й уровень · эмоциональный', add: ['c2'], cam: 'mid',
        d: 'Эмоционально-чувственная активность: душевная беседа, расслабленный отдых, налаживание контактов с людьми. От наполненности второго центра зависит качество общения.' },
      { t: '3-й уровень · интеллектуальный', add: ['c3'], cam: 'high',
        d: 'Когнитивная (интеллектуальная) активность: деловые бумаги, расчёты, подготовка к экзамену, анализ ситуаций. Память, острота ума и сообразительность зависят от энергии третьего центра.' },
      { t: 'Психоэнергетическая доминанта', add: ['dom'], cam: 'full',
        d: 'В жизни каждого складывается предпочтительный источник энергии и предпочтительный ритм — энергетическая привычка. Она складывается в раннем детстве и годам к семи становится устойчивой. Тот, у кого доминирует один центр, неэффективен там, где нужен другой.' },
      { t: '4-й уровень · «четвёрка», аккорд', add: ['chord', 'four'], rm: ['dom'], cam: 'full', ms: 13000,
        d: 'Состояние, в котором все три источника включены одновременно и с одинаковой мощностью и становятся единым полным источником энергии. Оно делает человека гармоничным и устойчивым. Практически никогда не возникает само: разве что в резонансе с пространством, звучащим так, — на вершине горы, в храме, под великую музыку. Осознанно им овладевают на практике.' }
    ];

    function build(st) {
      var H = D.makeSeatedHuman(), A = H.A, V = H.V;
      st.scene.add(D.makeFloor(1.3));
      st.layer('shell', H.parts.shell, { always: true }); st.layer('bones', H.parts.bones, { always: true }); st.layer('chair', H.parts.chair, { always: true });
      st.layer('hands', H.parts.open, { always: true });
      var orbs = [A.s1, A.s2, A.s3].map(function (p, i) {
        var o = D.makeOrb(0.05); o.position.copy(p); st.layer('c' + (i + 1), o, { pop: true, k: 2.6 }); return o;
      });
      st.layer('dom', new T.Group(), { k: 3 }); st.layer('chord', new T.Group(), { k: 3 });
      var aura = new T.Mesh(new T.SphereGeometry(1, 44, 30), D.holoMaterial({ color: 0xbfe3ff, rim: 0xffffff, base: 0.0, gain: 0.9, pow: 2.6 }));
      aura.scale.set(0.5, 1.12, 0.42); aura.position.set(0, 0.92, 0.03);
      st.layer('four', aura, { k: 1.4, fn: function (v, e, t) { aura.material.uniforms.uGain.value = 0.55 + 0.25 * Math.sin(t * 1.4); } });
      var four = document.createElement('div'); four.className = 's3-four'; four.textContent = '4'; st.htmlLayer('fourN', four);
      st.layers.fourN.target = 0;
      st.label('c1', V(0.06, 0.56, -0.05), '1 · физический');
      st.label('c2', V(0.06, 0.99, -0.06), '2 · эмоциональный');
      st.label('c3', V(0.06, 1.385, 0.04), '3 · интеллектуальный');
      var sizeNow = [1, 1, 1];
      st.updaters.push(function (dt, t, stage) {
        var dom = stage.layers.dom.target > 0.5, chord = stage.layers.chord.target > 0.5;
        var want = dom ? [0.62, 1.55, 0.95] : (chord ? [1.15, 1.15, 1.15] : [1, 1, 1]);
        for (var i = 0; i < 3; i++) {
          sizeNow[i] += (want[i] - sizeNow[i]) * (1 - Math.exp(-dt * 2.4));
          var p = chord ? 1 + 0.06 * Math.sin(t * 1.4 + 0) : (1 + 0.08 * Math.sin(t * (1.3 + i * 0.4) + i));
          orbs[i].userData.inner.scale.setScalar(sizeNow[i] * p);
        }
        stage.layers.fourN.target = chord ? 1 : 0;
      });
      st.home = CAMS.full; st.cams = CAMS;
    }
    return { id: 'centry', label: '3D-схема: три центра и «четвёрка»', steps: steps, build: build, cams: CAMS, fallback: 'centry' };
  };
})(window);
