/* Анимация «Озеро покоя». Основа — раздел «Шпаргалки попробовавшим» («Созерцание») в книге «Огненный цветок. Методика ДФС». */
(function (G) {
  'use strict';
  var D = G.DFSC, A = D.A, L = D.L;

  A.ozero = function () {
    var p = 'oz';
    var wave = function (y, amp, cls, op) {
      var d = 'M-20 ' + y; for (var i = 0; i < 13; i++) d += ' q' + (25) + ' ' + (i % 2 ? amp : -amp) + ' 50 0';
      return '<path class="' + cls + '" d="' + d + '" fill="none" stroke="#cfe6ff" stroke-width="2.6" opacity="' + op + '" stroke-linecap="round"/>';
    };
    var scene = A.defs(p) +
      '<defs><linearGradient id="ozW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a6fc4"/><stop offset=".45" stop-color="#1b3a86"/><stop offset="1" stop-color="#0a1235"/></linearGradient>' +
      '<radialGradient id="ozL" cx="50%" cy="100%" r="80%"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".5" stop-color="#fff2cf" stop-opacity=".45"/><stop offset="1" stop-color="#fff2cf" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="ozClip"><rect x="24" y="30" width="352" height="500" rx="26"/></clipPath></defs>' +
      '<g clip-path="url(#ozClip)">' +
        '<rect x="24" y="30" width="352" height="500" fill="url(#ozW)"/>' +
        /* небо над водой и отражение */
        '<rect x="24" y="30" width="352" height="90" fill="#7fb0ee" opacity=".55"/>' +
        L('refl', '<path d="M60 112 q40 -34 80 0 t80 0 t80 0 t80 0" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/><ellipse cx="200" cy="150" rx="110" ry="9" fill="#fff" opacity=".18"/>') +
        L('ripples', wave(112, 9, 'rip', .9) + wave(130, 8, 'rip2', .55)) +
        L('storm', '<g class="rip">' + wave(106, 16, 'rip', .95) + '</g>' + wave(124, 14, 'rip2', .8) + '<path d="M70 52 l-10 28 M150 44 l-10 28 M240 58 l-10 28 M320 48 l-10 28" stroke="#dbeaff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>') +
        L('deep', '<rect x="24" y="190" width="352" height="340" fill="#06103a" opacity=".55"/><text class="cap2" x="44" y="236">тишина и покой</text>') +
        L('diver', '<g class="diver"><circle cx="200" cy="0" r="8" fill="#ffe3a0" filter="url(#' + p + 'G)"/><path d="M200 -8 L200 -120" stroke="#ffe3a0" stroke-width="1.4" stroke-dasharray="2 5" opacity=".6"/></g>') +
        L('white', '<ellipse class="breath" cx="200" cy="560" rx="300" ry="330" fill="url(#ozL)"/><ellipse class="breath" cx="200" cy="520" rx="130" ry="100" fill="#fffdf4" opacity=".32" filter="url(#' + p + 'g)"/>') +
      '</g>' +
      '<rect x="24" y="30" width="352" height="500" rx="26" fill="none" stroke="rgba(255,255,255,.12)"/>';

    var steps = [
      { t: 'Озеро внутри вас', add: ['ripples'],
        d: 'Ощутите себя пространством. Внутри — тихое глубокое озеро.' },
      { t: 'Гладь как зеркало', add: ['refl'], rm: ['ripples'],
        d: 'Поверхность неподвижна, как зеркало: небо и лес отражаются в ней чисто.' },
      { t: 'Погружение', add: ['diver', 'deep'],
        d: 'Вы опускаетесь вглубь своего покоя: чем глубже, тем тише.', ms: 9000 },
      { t: 'Покой, который не качает шторм', add: ['storm'], rm: ['refl'],
        d: 'На поверхности — волны, ветер, голоса, а в глубине спокойно. Такой покой не зависит от суеты вокруг и от всплесков эмоций.', ms: 11000 },
      { t: 'Белое светящееся пространство', add: ['white'],
        d: 'Так вы приходите к пустому белому светящемуся пространству внутри. Чем глубже покой, тем белее и ярче оно светится.', ms: 8000 }
    ];
    return { id: 'ozero', svg: A.svg('0 0 400 560', scene, 'sc-oz'), steps: steps, ar: '400/560', label: 'Анимация: внутреннее озеро покоя', maxh: '600px' };
  };
})(window);
