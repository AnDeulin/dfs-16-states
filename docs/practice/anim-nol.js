/* Анимация «Ноль-концентрация». Шаги — по книге «Огненный цветок. Методика ДФС» и пособию для инструкторов. */
(function (G) {
  'use strict';
  var D = G.DFSC, A = D.A, L = D.L;

  function dial(cx, cy, k) {
    return '<g>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="27" fill="#0d1432" stroke="#6b80c4" stroke-width="2"/>' +
      '<path d="M' + (cx - 20) + ' ' + (cy + 8) + ' A21 21 0 0 1 ' + (cx + 20) + ' ' + (cy + 8) + '" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1.6"/>' +
      '<path d="M' + cx + ' ' + (cy - 21) + ' v5 M' + (cx - 17) + ' ' + (cy - 12) + ' l3 3 M' + (cx + 17) + ' ' + (cy - 12) + ' l-3 3" stroke="rgba(255,255,255,.5)" stroke-width="1.6" stroke-linecap="round"/>' +
      '<g class="needle" style="transform-origin:' + cx + 'px ' + (cy + 8) + 'px;animation-delay:-' + (k * .7) + 's"><line x1="' + cx + '" y1="' + (cy + 8) + '" x2="' + cx + '" y2="' + (cy - 15) + '" stroke="#ffd27a" stroke-width="2.4" stroke-linecap="round"/></g>' +
      '<circle cx="' + cx + '" cy="' + (cy + 8) + '" r="3" fill="#ffd27a"/></g>';
  }

  A.nol = function () {
    var p = 'nl';
    var scene = A.defs(p) + A.body(p) +
      '<ellipse class="halo" cx="200" cy="300" rx="170" ry="300" fill="url(#' + p + 'H)" opacity="0"/>' +
      /* построенный цветок: стебель, чаша, три шара */
      L('flower', '<path d="M200 378 L200 94" stroke="url(#' + p + 'T)" stroke-width="4" stroke-linecap="round" fill="none" opacity=".7"/>' +
        '<path d="M148 40 C150 98 250 98 252 40 Z" fill="url(#' + p + 'C)" stroke="#dff3ff" stroke-width="2" opacity=".75"/><ellipse cx="200" cy="40" rx="52" ry="9" fill="none" stroke="#dff3ff" stroke-width="1.6" opacity=".75"/>' +
        '<circle cx="200" cy="350" r="15" fill="url(#' + p + 'S)"/><circle cx="200" cy="234" r="15" fill="url(#' + p + 'S)"/><circle cx="200" cy="94" r="15" fill="url(#' + p + 'S)"/>') +
      L('pulse', '<circle class="ring" cx="200" cy="234" r="30"/><circle class="ring r2" cx="200" cy="234" r="30"/><circle class="ring r3" cx="200" cy="234" r="30"/>') +
      /* продление стебля над макушкой */
      L('ext', '<path class="draw" pathLength="1" d="M200 40 L200 -18" fill="none" stroke="url(#' + p + 'T)" stroke-width="5" stroke-linecap="round" filter="url(#' + p + 'G)"/>' + A.lbl('+15–20 см', 203, 4, 296, 4)) +
      /* ось */
      L('axis', '<path class="draw" pathLength="1" d="M200 378 L200 -18" fill="none" stroke="#f4fbff" stroke-width="7" stroke-linecap="round" filter="url(#' + p + 'G)"/>' +
        '<path class="axisflow" d="M200 378 L200 -18" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="40 40"/>' + A.lbl('огненная ось', 206, 330, 296, 330)) +
      L('calm', '<ellipse class="breath" cx="200" cy="230" rx="130" ry="250" fill="url(#' + p + 'H)"/>') +
      L('dials', dial(340, 96, 1) + dial(340, 166, 2) + dial(340, 236, 3) + '<text class="cap2" x="340" y="284" text-anchor="middle">всё на нуле</text>') +
      L('attn', '<path class="attn" d="M200 378 L200 -18" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-dasharray="26 54" opacity=".5" filter="url(#' + p + 'G)"/>' +
        '<path d="M178 80 L178 360 M222 80 L222 360" stroke="rgba(255,255,255,.22)" stroke-width="1.4" stroke-dasharray="2 6"/>');

    var steps = [
      { t: 'Где мы находимся', add: ['flower', 'pulse'], fx: ['pulse'],
        d: 'Упражнение делают, когда «Огненный цветок» уже построен и идёт пульсация. Осваивать его начинают в конце начального курса, после того как конструкция цветка сформирована.' },
      { t: 'Вступление · 1', rm: ['pulse'],
        d: 'Останавливают огненную пульсацию.' },
      { t: 'Вступление · 2', add: ['ext'],
        d: 'Стебель продлевают вверх за макушку на 15–20 см.' },
      { t: 'Вступление · 3', add: ['axis'],
        d: 'Получается «огненная ось» — от копчика до верхнего конца продлённого стебля.' },
      { t: 'Вступление · 4', add: ['calm'],
        d: 'Внутри всё затихает: мышечных и эмоциональных зажимов — минимум.' },
      { t: 'Вступление · 5', add: ['dials'],
        d: 'Все внутренние показатели — на нуле, как стрелки приборов.' },
      { t: 'Основная фаза · внимание в оси', add: ['attn'],
        d: 'Всё внимание — в огненной оси; оно распределено вдоль всей её длины, а не собрано в одной точке.' },
      { t: 'Основная фаза · твёрдо',
        d: 'Состояние держат уверенно, твёрдо, неколебимо. Длительность — от 15–20 до 40–45 минут.' },
      { t: 'Завершение', rm: ['attn', 'dials', 'calm', 'axis', 'ext'], add: ['pulse'], fx: ['pulse'],
        d: 'Ось убирают, верхний конец продлённого стебля втягивают, пульсацию возобновляют.' }
    ];
    return { id: 'nol', svg: A.svg('0 -30 400 670', scene, 'sc-nl'), steps: steps, ar: '400/670', label: 'Анимация: «Ноль-концентрация» по шагам' };
  };
})(window);
