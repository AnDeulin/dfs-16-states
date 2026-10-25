/* Анимация «Кино». Шаги — по книге «Огненный цветок. Методика ДФС» (раздел «Кино» и «Шпаргалки») и пособию. */
(function (G) {
  'use strict';
  var D = G.DFSC, A = D.A, L = D.L;

  function person(x, y, s, col) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<circle cx="0" cy="-30" r="9" fill="' + (col || '#cfd9ff') + '"/><path d="M-10 -18 h20 l4 30 h-28 Z" fill="' + (col || '#aebbee') + '"/><rect x="-9" y="10" width="7" height="22" rx="3" fill="' + (col || '#aebbee') + '"/><rect x="2" y="10" width="7" height="22" rx="3" fill="' + (col || '#aebbee') + '"/></g>';
  }
  function camera(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-16" y="-10" width="28" height="20" rx="4" fill="#ff9a9a"/><path d="M12 -5 l12 -6 v22 l-12 -6 Z" fill="#ff9a9a"/></g>';
  }

  A.kino = function () {
    var p = 'kn';
    var scenes = [['22:00', '#3a4a8f'], ['18:00', '#5a4a8f'], ['13:00', '#8f6a3a'], ['09:00', '#3a8f6a'], ['07:00', '#8f3a5a']];
    var timeline = scenes.map(function (s, i) {
      var x = 70 + i * 100;
      return '<g><circle cx="' + x + '" cy="372" r="6" fill="rgba(255,255,255,.55)"/><text class="cap2" x="' + x + '" y="396" text-anchor="middle">' + s[0] + '</text></g>';
    }).join('');
    var scene = A.defs(p) +
      /* кресло и зритель (вид сзади, слева) */
      '<ellipse cx="90" cy="332" rx="76" ry="9" fill="#000" opacity=".3"/>' +
      '<rect x="36" y="238" width="104" height="82" rx="26" fill="#2a3566"/><rect x="44" y="214" width="88" height="70" rx="26" fill="#33437f"/>' +
      '<circle cx="88" cy="226" r="22" fill="#4d5f99"/>' +
      /* экран */
      '<rect x="170" y="60" width="330" height="188" rx="14" fill="#05081a" stroke="#6b80c4" stroke-width="2.4"/>' +
      L('screen', '<rect x="178" y="68" width="314" height="172" rx="9" fill="url(#' + p + 'W)"/>') +
      '<defs><linearGradient id="' + p + 'W" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffef6" stop-opacity=".95"/><stop offset="1" stop-color="#ffe9b8" stop-opacity=".75"/></linearGradient></defs>' +
      /* кадры дня */
      L('f1', '<rect x="198" y="92" width="130" height="124" rx="8" fill="#3a4a8f"/>' + person(262, 168, 1.4)) +
      L('f2', '<rect x="198" y="92" width="130" height="124" rx="8" fill="#8f6a3a"/>' + person(262, 168, 1.4)) +
      L('f3', '<rect x="198" y="92" width="130" height="124" rx="8" fill="#3a8f6a"/>' + person(262, 168, 1.4)) +
      /* верно: вы в главной роли; неверно: камера в центре */
      L('hero', '<rect x="188" y="88" width="136" height="124" rx="8" fill="#26356f"/>' + person(256, 166, 1.3, '#ffe3a0') + '<path d="M236 108 l20 -12 l20 12" fill="none" stroke="#ffd27a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><text x="256" y="230" text-anchor="middle" font-size="13.5" font-weight="700" fill="#10153a">вы — в главной роли</text>') +
      L('cam', '<rect x="344" y="88" width="136" height="124" rx="8" fill="#3a2433"/>' + camera(412, 150) + '<path d="M380 108 l64 84 M444 108 l-64 84" stroke="#ff9a9a" stroke-width="3.4" stroke-linecap="round"/><text x="412" y="230" text-anchor="middle" font-size="13.5" font-weight="700" fill="#7a1d1d">не камера</text>') +
      /* поток событий навстречу */
      L('toward', '<path class="flow" d="M170 150 L140 150 M170 168 L128 168 M170 186 L140 186" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1 9" fill="none"/>' +
        '<text class="cap2" x="500" y="266" text-anchor="end">события идут навстречу вам</text>') +
      L('zoom', '<circle cx="262" cy="160" r="46" fill="none" stroke="#ffd27a" stroke-width="3"/><path d="M296 194 L322 220" stroke="#ffd27a" stroke-width="5" stroke-linecap="round"/>') +
      /* шкала дня: идём справа налево */
      L('time', '<line x1="70" y1="372" x2="470" y2="372" stroke="rgba(255,255,255,.35)" stroke-width="2.6"/>' + timeline +
        '<path d="M70 372 L470 372" stroke="#ffd27a" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="1 12" class="flow"/>' +
        '<text class="cap" x="70" y="352">вечер</text><text class="cap" x="470" y="352" text-anchor="end">утро</text>' +
        '<path d="M120 318 H20 M44 304 L20 318 L44 332" stroke="#ffd27a" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>') +
      L('head', '<text class="cap" x="270" y="322" text-anchor="middle">так идёт фильм: от вечера к утру  →</text>');

    var steps = [
      { t: 'Завершающее дело дня', add: ['screen'],
        d: '«Кино» — последнее, что вы делаете за день. Это самостоятельное упражнение: в группе его не проведёшь.' },
      { t: 'Фильм о вас', add: ['f1', 'time'],
        d: 'Вы смотрите цветной широкоформатный фильм, где главная роль — ваша.' },
      { t: 'События идут назад', add: ['f2', 'head', 'toward'], rm: ['f1'],
        d: 'Все события идут в обратном порядке: от вечера к утру.' },
      { t: 'Вы — герой, а не камера', add: ['hero', 'cam'], rm: ['f2', 'toward'],
        d: 'Важно быть героем фильма, а не камерой, вокруг которой всё вращается. Для этого нужны навыки растождествления и устойчивое самосознание.' },
      { t: 'Почему «назад»', add: ['toward', 'f3'], rm: ['hero', 'cam'],
        d: 'Встречающий на вокзале встанет лицом к потоку людей; машины, едущие на вас, видно лучше, чем уезжающие. Так и здесь: события, идущие навстречу, легче рассмотреть. Плёнку можно ускорить, замедлить, увеличить кадр.' },
      { t: 'Крупнее, медленнее, стоп', add: ['zoom'], rm: ['toward'],
        d: 'Пример из книги: не помнишь, где оставил записную книжку. Увеличиваешь кадр и замедляешь, пока не увидишь, как уходил из офиса с сумкой и телефоном, а книжка осталась на столе.' },
      { t: 'Что получается и что мешает', rm: ['zoom', 'f3'], add: ['f1'],
        d: 'Чтобы фильм шёл непрерывно, нужно быть осознанным в течение всего дня. У упражнения есть конец: его результат становится постоянным качеством инструмента.' }
    ];
    return { id: 'kino', svg: A.svg('0 0 520 420', scene, 'sc-kn'), steps: steps, ar: '520/420', label: 'Анимация: «Кино» по шагам', maxh: '540px' };
  };
})(window);
