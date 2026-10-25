/* Анимация «Четыре ритма». Описания и ключевые слова — по книге «Огненный цветок. Методика ДФС», раздел «Азбука ритмов». */
(function (G) {
  'use strict';
  var D = G.DFSC, A = D.A, L = D.L;

  /* плитка 220×220 в точке (x, y) */
  function tile(name, x, y, col, word, glyph, inner) {
    return L(name,
      '<g transform="translate(' + x + ' ' + y + ')">' +
      '<rect width="220" height="220" rx="22" fill="rgba(255,255,255,.04)" stroke="' + col + '" stroke-opacity=".6" stroke-width="2"/>' +
      '<g clip-path="url(#rt' + name + ')">' + inner + '</g>' +
      '<text x="18" y="38" font-size="15" font-weight="800" fill="' + col + '" letter-spacing=".08em">РИТМ ' + glyph + '</text>' +
      '<text x="18" y="206" font-family="Georgia,serif" font-size="30" font-weight="700" fill="#fff">' + word + '</text></g>');
  }

  A.ritmy = function () {
    var p = 'rt';
    var clip = ['rB', 'rC', 'rD', 'rA'].map(function (n) { return '<clipPath id="rt' + n + '"><rect width="220" height="220" rx="22"/></clipPath>'; }).join('');
    /* B — непрерывный поток */
    var wB = '';
    [70, 108, 146].forEach(function (y, i) {
      var d = 'M-40 ' + y; for (var k = 0; k < 8; k++) d += ' q30 ' + (k % 2 ? 22 : -22) + ' 60 0';
      wB += '<path class="wv" style="animation-duration:' + (4 + i) + 's" d="' + d + '" fill="none" stroke="#34c768" stroke-width="' + (4 - i * .6) + '" stroke-linecap="round" opacity="' + (1 - i * .22) + '"/>';
    });
    /* C — дискретные точки в ритме */
    var dC = '';
    for (var r = 0; r < 3; r++) for (var c = 0; c < 5; c++) dC += '<rect class="tick" style="animation-delay:' + ((c + r * 2) * .22).toFixed(2) + 's" x="' + (24 + c * 36) + '" y="' + (62 + r * 38) + '" width="22" height="22" rx="4" fill="#f4b400"/>';
    /* D — распад: осыпающиеся осколки */
    var dD = '';
    [[40, 60, 0], [96, 52, .6], [150, 66, 1.2], [70, 100, 1.9], [128, 96, .3], [170, 110, 1.5], [30, 120, 2.4], [110, 130, .9]].forEach(function (f, i) {
      dD += '<path class="shard" style="animation-delay:' + f[2] + 's" d="M' + f[0] + ' ' + f[1] + ' l16 6 l-8 16 Z" fill="#ff6b6b"/>';
    });
    /* A — бесконечность: расходящиеся круги и звёзды */
    var dA = '<circle class="ex" cx="110" cy="100" r="14" fill="none" stroke="#5b8cff" stroke-width="2.4"/><circle class="ex e2" cx="110" cy="100" r="14" fill="none" stroke="#5b8cff" stroke-width="2.4"/><circle class="ex e3" cx="110" cy="100" r="14" fill="none" stroke="#5b8cff" stroke-width="2.4"/><circle cx="110" cy="100" r="5" fill="#cfe0ff"/>';
    [[30, 50], [190, 60], [50, 150], [180, 140], [150, 30], [76, 34]].forEach(function (s, i) { dA += '<circle class="twinkle" style="animation-delay:' + (i * .5) + 's" cx="' + s[0] + '" cy="' + s[1] + '" r="2.2" fill="#fff"/>'; });

    var scene = '<defs>' + clip + '</defs>' +
      tile('rB', 20, 20, '#34c768', 'жизнь', 'B ~', wB) +
      tile('rC', 260, 20, '#f4b400', 'точка', 'C ▪', dC) +
      tile('rD', 20, 260, '#ff6b6b', 'распад', 'D ⚡', dD) +
      tile('rA', 260, 260, '#5b8cff', 'космос', 'A ∞', dA);

    /* вступление: четыре пустые «ячейки» — потом в них по очереди появляются ритмы */
    var slots = '';
    [['B ~', 20, 20], ['C ▪', 260, 20], ['D ⚡', 20, 260], ['A ∞', 260, 260]].forEach(function (s) {
      slots += '<rect x="' + s[1] + '" y="' + s[2] + '" width="220" height="220" rx="22" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.3)" stroke-width="2" stroke-dasharray="8 8"/>' +
        '<text x="' + (s[1] + 110) + '" y="' + (s[2] + 128) + '" text-anchor="middle" font-family="Georgia,serif" font-size="56" font-weight="700" fill="rgba(255,255,255,.22)">' + s[0] + '</text>';
    });
    scene += L('slots', slots);

    var steps = [
      { t: 'Ритм — звучание пространства', add: ['slots'],
        d: 'Чувство включённости в пространство автор называет «ритмом»: это звучание пространства, которое вы способны ощутить. Звучания бывают разными, и различаются они по виду деятельности. Ритмов четыре.' },
      { t: 'Ритм B · «жизнь»', add: ['rB'], rm: ['slots'],
        d: 'Тихий парк с белками, концертный зал, где мелодия течёт, как большая река, неспешная задушевная беседа за чаем. Пространство ощущается как непрерывный живой поток. Ключевое слово — «жизнь».' },
      { t: 'Ритм C · «точка»', add: ['rC'],
        d: 'Бодрое, деловое, чёткое: развод караула, офис с чёткими линиями, спортивные соревнования, марш. Пространство ощущается как множество отдельных объектов. Хочется действовать сразу. Ключевое слово — «точка».' },
      { t: 'Ритм D · «распад»', add: ['rD'],
        d: 'Сырой тёмный лес, разрушенные дома, больница, место трагедии, злая музыка из проезжающей машины. Пространство ощущается как разрушающее. Это тоже часть мира: важно понимать, о чём оно сообщает, и как на это отвечать. Ключевое слово — «распад».' },
      { t: 'Ритм A · «космос»', add: ['rA'],
        d: 'Лужайка и бездонное небо; старинный храм, в который человек входит из городской суеты. Ощущение сопричастности бесконечному миру. Ключевое слово — «космос».' }
    ];
    return { id: 'ritmy', svg: A.svg('0 0 500 500', scene, 'sc-rt'), steps: steps, ar: '1/1', label: 'Анимация: четыре ритма — жизнь, точка, распад, космос', maxh: '520px' };
  };
})(window);
