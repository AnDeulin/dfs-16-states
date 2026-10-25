/* Анимация «Огненный цветок». Порядок и формулировки шагов — по книге И. Н. Калинаускаса
   «Огненный цветок. Методика ДФС», раздел «Огненный цветок — функциональная система». */
(function (G) {
  'use strict';
  var D = G.DFSC, A = D.A, L = D.L;

  A.cvetok = function () {
    var p = 'fc';
    var scene = A.defs(p) + A.body(p) +
      /* свечение вокруг фигуры при пульсации */
      '<ellipse class="halo" cx="200" cy="300" rx="170" ry="300" fill="url(#' + p + 'H)" opacity="0"/>' +
      /* руки: соединены / раскрыты */
      L('handsJoined', '<ellipse cx="200" cy="402" rx="30" ry="14" fill="#2c3a70" stroke="#6b80c4" stroke-width="2"/><path d="M178 400 Q200 392 222 400" fill="none" stroke="#6b80c4" stroke-width="1.6"/>') +
      L('handsOpen', '<ellipse cx="172" cy="406" rx="21" ry="12" fill="#33437f" stroke="#7d92d6" stroke-width="2"/><ellipse cx="228" cy="406" rx="21" ry="12" fill="#33437f" stroke="#7d92d6" stroke-width="2"/>') +
      /* огненная точка в копчике */
      L('point', '<g class="pop"><circle cx="200" cy="378" r="14" fill="url(#' + p + 'H)"/><circle cx="200" cy="378" r="5" fill="#fffaf0" filter="url(#' + p + 'G)"/></g>' + A.lbl('точка', 206, 380, 296, 392)) +
      /* стебель */
      L('stem', '<path class="draw" pathLength="1" d="M200 378 L200 94" fill="none" stroke="url(#' + p + 'T)" stroke-width="5.5" stroke-linecap="round" filter="url(#' + p + 'G)"/>' + A.lbl('стебель', 203, 150, 296, 150)) +
      /* чаша */
      L('cup', '<path d="M148 40 C150 98 250 98 252 40 Z" fill="url(#' + p + 'C)" stroke="#dff3ff" stroke-width="2.4" stroke-linejoin="round" filter="url(#' + p + 'G)"/>' +
               '<ellipse cx="200" cy="40" rx="52" ry="9" fill="rgba(220,240,255,.16)" stroke="#dff3ff" stroke-width="2"/>' + A.lbl('чаша', 254, 42, 296, 42)) +
      /* поток сверху вниз */
      L('flowDown', '<path class="flow" d="M200 4 L200 372" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="1 15" opacity=".95"/>' +
                    '<path class="flow" d="M170 14 C176 50 190 70 200 92 M230 14 C224 50 210 70 200 92" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1 13" opacity=".8"/>') +
      /* корни */
      L('roots', '<path class="draw" pathLength="1" d="M200 352 C184 410 178 480 164 574" fill="none" stroke="#bfe6ff" stroke-width="4.2" stroke-linecap="round" filter="url(#' + p + 'G)"/>' +
                 '<path class="draw" pathLength="1" d="M200 352 C216 410 222 480 236 574" fill="none" stroke="#bfe6ff" stroke-width="4.2" stroke-linecap="round" filter="url(#' + p + 'G)"/>' +
                 '<path d="M164 574 l-14 4 M164 574 l-3 8 M164 574 l10 6 M236 574 l14 4 M236 574 l3 8 M236 574 l-10 6" stroke="#bfe6ff" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
                 A.lbl('корни', 170, 520, 70, 520, 'end')) +
      L('flowUp', '<path class="flow up" d="M164 590 C178 480 184 410 200 352" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 14"/>' +
                  '<path class="flow up" d="M236 590 C222 480 216 410 200 352" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 14"/>') +
      /* листья */
      L('leaves', '<path class="draw" pathLength="1" d="M200 234 C168 234 140 252 128 292 C120 332 140 382 172 406" fill="none" stroke="#f2fbff" stroke-width="4" stroke-linecap="round" filter="url(#' + p + 'G)"/>' +
                  '<path class="draw" pathLength="1" d="M200 234 C232 234 260 252 272 292 C280 332 260 382 228 406" fill="none" stroke="#f2fbff" stroke-width="4" stroke-linecap="round" filter="url(#' + p + 'G)"/>' +
                  A.lbl('листья', 122, 300, 70, 300, 'end')) +
      L('flowLeaves', '<path class="flow up" d="M172 406 C140 382 120 332 128 292 C140 252 168 234 200 234" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 14"/>' +
                      '<path class="flow up" d="M228 406 C260 382 280 332 272 292 C260 252 232 234 200 234" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 14"/>') +
      /* три центра */
      L('s1', A.sphere(p, 200, 350) + A.lbl('1-й центр', 218, 350, 296, 352), 's1') +
      L('s2', A.sphere(p, 200, 234) + A.lbl('2-й центр', 218, 234, 296, 236), 's2') +
      L('s3', A.sphere(p, 200, 94) + A.lbl('3-й центр', 218, 94, 296, 96), 's3') +
      /* пульсация: кольца и надписи */
      L('pulse', '<circle class="ring" cx="200" cy="234" r="30"/><circle class="ring r2" cx="200" cy="234" r="30"/><circle class="ring r3" cx="200" cy="234" r="30"/>' +
                 '<text class="inh" x="200" y="618" text-anchor="middle">вдох — энергия внутрь</text><text class="exh" x="200" y="618" text-anchor="middle">выдох — выжигаем лишнее</text>', 'pulseL');

    var steps = [
      { t: 'Подготовка', add: ['handsJoined'],
        d: 'Сядьте ровно, не опираясь на спинку стула; ноги стоят на полу под прямым углом. Руки сложены: левая поверх правой (у левшей — наоборот). Глаза открыты, взгляд мягкий, без фокуса.' },
      { t: 'Первая фаза · огненная точка', add: ['point'],
        d: 'Всё внимание — в копчик. Там появляется «огненная точка».' },
      { t: 'Огненный стебель', add: ['stem'],
        d: 'Плавным непрерывным движением точка поднимается внутри позвоночника и оставляет за собой «огненный стебель».' },
      { t: 'Огненная чаша', add: ['cup'],
        d: 'Дойдя до центра головы, точка раскрывается «огненной чашей».' },
      { t: 'Энергия сверху', add: ['flowDown'],
        d: 'Сверху в чашу входит огненная энергия и по стеблю стекает вниз.' },
      { t: 'Первый центр', add: ['s1'],
        d: 'Внизу она собирается в «огненный шар» первого центра — вокруг стебля, размером примерно с яблоко. Шар закрепляем.' },
      { t: 'Второй центр', add: ['s2'],
        d: 'Энергия продолжает поступать сверху и собирается в шар второго центра. Закрепляем.' },
      { t: 'Третий центр', add: ['s3'],
        d: 'Так же возникает шар третьего центра. Закрепляем.' },
      { t: 'Вторая фаза · корни', add: ['roots', 'flowUp'],
        d: 'Из первого шара «огненные корни» уходят в обе ноги — до подошв и пальцев. Снизу по корням энергия поднимается в первый шар. Теперь два потока: сверху через чашу и снизу по корням.' },
      { t: 'Листья', add: ['leaves', 'flowLeaves', 'handsOpen'], rm: ['handsJoined'],
        d: 'Из второго шара «огненные листья» идут в обе руки. Когда они доходят до ладоней и пальцев, руки раскрываются ладонями вверх; через них энергия течёт во второй шар. Три потока: чаша, корни, листья.' },
      { t: 'Третья фаза · огненная пульсация', fx: ['pulse'], add: ['pulse'],
        d: 'На вдохе энергия входит из пространства через чашу, корни и листья, на выдохе уходит тем же путём и «выжигает» в теле лишнее, больное, ненужное. Дыхание ровное и свободное; две-три пульсации можно сделать на задержке дыхания и затем мягко вернуть дыхание. Всего 24–36 пульсаций.', ms: 14000 },
      { t: 'Четвёртая фаза · сворачиваем', rm: ['pulse', 'flowDown', 'flowUp', 'flowLeaves', 'roots', 'leaves', 'cup', 'stem', 'handsOpen', 'point'], add: ['handsJoined'],
        d: 'Пульсацию останавливают. Корни втягивают в первый шар вместе с участком стебля от копчика до первого центра. Листья — во второй шар (руки смыкаются: правая сверху, у левшей — левая) вместе с участком стебля между первым и вторым центрами. Чашу закрывают и втягивают в третий шар вместе с участком между вторым и третьим.', ms: 13000 },
      { t: 'Отдаём шары', fx: ['give'],
        d: 'Первый шар отдают импульсом прямо перед собой, второй — так же, третий — вертикально вверх. Каждый — с благодарностью пространству.', ms: 9000 }
    ];
    return { id: 'cvetok', svg: A.svg('0 0 400 640', scene, 'sc-fc'), steps: steps, ar: '400/640', label: 'Анимация: построение «Огненного цветка» по шагам' };
  };
})(window);
