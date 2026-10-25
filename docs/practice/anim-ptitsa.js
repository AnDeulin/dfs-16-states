/* Анимация «Полёт белой птицы». Формула и порядок — по книге «Огненный цветок. Методика ДФС» и пособию
   для инструкторов; «психоэнергетическая партитура» (2B–2A–4A–2A–2B–4C) — по пособию. */
(function (G) {
  'use strict';
  var D = G.DFSC, A = D.A, L = D.L;

  function bird(x, y, s, cls) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><g class="' + (cls || '') + '">' +
      '<path d="M-34 4 C-22 -14 -8 -14 0 2 C8 -14 22 -14 34 4 C22 -2 10 0 0 12 C-10 0 -22 -2 -34 4 Z" fill="#fff" stroke="#e8f1ff" stroke-width="1.6" stroke-linejoin="round" filter="url(#ptG)"/></g></g>';
  }
  function lying(x, y) {
    /* человек лежит на песке (вид сбоку) */
    return '<g transform="translate(' + x + ' ' + y + ') scale(1.9)">' +
      '<ellipse cx="0" cy="0" rx="9" ry="9" fill="#cfd9ff"/>' +
      '<rect x="10" y="-6" width="42" height="12" rx="6" fill="#aebbee"/><rect x="50" y="-5" width="30" height="10" rx="5" fill="#9aa9e0"/></g>';
  }

  A.ptitsa = function () {
    var p = 'pt';
    var marks = [['2B', 60], ['2A', 138], ['4A', 216], ['2A', 294], ['2B', 372], ['4C', 450]];
    var ys = [78, 98, 116, 98, 78, 26];   // условная «высота» собранности: низ — расслабление, верх — готовность к действию
    var curve = 'M60 78 C100 78 100 98 138 98 C176 98 176 116 216 116 C256 116 256 98 294 98 C332 98 332 78 372 78 C410 78 420 26 450 26';
    var dots = marks.map(function (m, i) {
      return L('m' + (i + 1), '<circle cx="' + m[1] + '" cy="' + ys[i] + '" r="13" fill="#ffd27a"/><text x="' + m[1] + '" y="' + (ys[i] + 4.5) + '" text-anchor="middle" font-size="12.5" font-weight="800" fill="#3a2400">' + m[0] + '</text>');
    }).join('');
    var scene = A.defs(p) +
      '<defs><linearGradient id="ptSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#24418a"/><stop offset="1" stop-color="#6f93d4"/></linearGradient>' +
      '<linearGradient id="ptSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#21528f"/><stop offset="1" stop-color="#143a6c"/></linearGradient>' +
      '<clipPath id="ptClip"><rect x="20" y="14" width="500" height="250" rx="22"/></clipPath></defs>' +
      '<g clip-path="url(#ptClip)">' +
        '<rect x="20" y="14" width="500" height="250" fill="url(#ptSky)"/>' +
        '<circle cx="450" cy="62" r="20" fill="#f3e9c4" opacity=".8"/>' +
        L('cloud', '<g class="drift"><ellipse cx="120" cy="58" rx="46" ry="12" fill="#fff" opacity=".75"/><ellipse cx="148" cy="50" rx="30" ry="12" fill="#fff" opacity=".75"/></g>') +
        L('sea', '<rect x="20" y="168" width="500" height="100" fill="url(#ptSea)"/><path class="flow" d="M20 188 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#bfe0ff" stroke-width="2" stroke-dasharray="6 10" opacity=".7"/>') +
        L('sandL', '<path d="M20 214 C80 200 140 206 200 226 L200 270 L20 270 Z" fill="#b99a5a"/>') +
        L('sandR', '<path d="M330 226 C400 202 460 200 520 214 L520 270 L330 270 Z" fill="#b99a5a"/>') +
        L('sandAll', '<path d="M20 214 C120 200 300 200 520 214 L520 270 L20 270 Z" fill="#b99a5a"/>') +
        L('lie', lying(70, 214)) +
        L('lie2', lying(110, 214)) +
        L('birdA', bird(300, 100, 1.2, 'drift')) +
        L('birdB', bird(250, 124, 1.5, 'drift')) +
        L('birdC', bird(330, 108, 1.2, 'drift')) +
        L('cool', '<rect x="20" y="14" width="500" height="250" fill="#bff3ff" opacity=".12"/><path class="coolwave" d="M20 270 L520 270" stroke="#e6fbff" stroke-width="40" opacity=".35"/>') +
      '</g>' +
      /* кривая «расслабление ↔ собранность» */
      '<g transform="translate(0 286)">' +
        '<rect x="20" y="0" width="500" height="138" rx="18" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.1)"/>' +
        '<text class="cap2" x="34" y="22">готовность к действию</text><text class="cap2" x="34" y="130">глубокое расслабление</text>' +
        '<path d="' + curve + '" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3" stroke-linecap="round"/>' +
        '<g>' + L('curve', '<path class="draw" pathLength="1" d="' + curve + '" fill="none" stroke="#ffd27a" stroke-width="3.4" stroke-linecap="round"/>') + dots + '</g>' +
      '</g>';

    var steps = [
      { t: 'Подготовка', add: ['sandAll', 'cloud'],
        d: 'Удобно лягте, расслабьтесь, закройте глаза. Руки и ноги скрещены: правая сверху (у левшей — левая). Упражнение ставят в самый конец занятия, оно длится 25–35 минут.\nСлова упражнения автор просит произносить точно: их читает инструктор или вы по книге. Здесь — только схема путешествия.' },
      { t: 'Песок · состояние 2B', add: ['lie', 'm1'], tag: '2B',
        d: 'Первый этап: покой и тепло, вы отдыхаете.' },
      { t: 'Полёт · состояние 2A', add: ['birdA', 'm2', 'curve'], rm: ['lie'], tag: '2A',
        d: 'Второй этап: вы взлетаете и летите рядом с белой птицей — и сами становитесь ею.' },
      { t: 'Море · состояние 4A', add: ['sea', 'm3', 'birdB'], rm: ['sandAll', 'birdA'], tag: '4A',
        d: 'Третий этап: полёт над морем. Это самая «собранная» точка кривой.' },
      { t: 'Берег · состояние 2A', add: ['sandR', 'm4', 'birdC'], rm: ['birdB'],
        d: 'Четвёртый этап: возвращение. Вы снижаетесь к берегу и снова становитесь человеком.' },
      { t: 'Отдых · состояние 2B', add: ['sandAll', 'lie2', 'm5'], rm: ['sea', 'sandR', 'birdC'],
        d: 'Пятый этап: снова покой, как в начале.' },
      { t: 'Прохлада · состояние 4C', add: ['cool', 'm6'], ms: 12000,
        d: 'Шестой этап: бодрость разливается по телу снизу вверх. Затем — три глубоких вздоха, глаза открываются, вы встаёте.\nФинал упражнения активизирует. Для сна его, по пособию, делают только до этапа отдыха на песке.' }
    ];
    return { id: 'ptitsa', svg: A.svg('0 0 540 440', scene, 'sc-pt'), steps: steps, ar: '540/440', label: 'Анимация: «Полёт белой птицы» по шагам', maxh: '560px' };
  };
})(window);
