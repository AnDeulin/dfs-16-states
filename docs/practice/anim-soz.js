/* Анимация «Созерцание». Шаги — по книге «Огненный цветок. Методика ДФС» и пособию для инструкторов. */
(function (G) {
  'use strict';
  var D = G.DFSC, A = D.A, L = D.L;

  /* куб (простой предмет) в точке x,y; s — размер ребра */
  function cube(x, y, s, a) {
    var d = s * .42;
    return '<g opacity="' + (a || 1) + '">' +
      '<path d="M' + x + ' ' + y + ' h' + s + ' v' + s + ' h-' + s + ' Z" fill="#e8d9b0" stroke="#fff3cf" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M' + x + ' ' + y + ' l' + d + ' -' + d + ' h' + s + ' l-' + d + ' ' + d + ' Z" fill="#fbefcf" stroke="#fff3cf" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M' + (x + s) + ' ' + y + ' l' + d + ' -' + d + ' v' + s + ' l-' + d + ' ' + d + ' Z" fill="#cdb988" stroke="#fff3cf" stroke-width="2" stroke-linejoin="round"/></g>';
  }

  A.soz = function () {
    var p = 'sz';
    /* профиль головы, смотрит влево */
    var head = '<path d="M372 332 C372 300 356 292 352 270 C348 252 354 246 352 232 C350 214 360 206 360 186 C360 140 322 100 276 100 C230 100 196 140 196 186 C196 206 200 214 190 232 C186 240 176 244 182 252 C186 258 190 258 188 266 C186 274 190 278 196 280 C204 282 206 290 206 298 L206 332 Z" />';
    var scene = A.defs(p) +
      '<ellipse cx="260" cy="392" rx="230" ry="12" fill="#000" opacity=".3"/>' +
      /* стол и предмет */
      '<rect x="20" y="322" width="150" height="10" rx="5" fill="#2a3566"/><rect x="38" y="332" width="8" height="58" fill="#2a3566"/><rect x="144" y="332" width="8" height="58" fill="#2a3566"/>' +
      L('obj', cube(70, 258, 52, 1)) +
      /* человек */
      '<g><use href="#' + p + 'hd" fill="#4d5f99" stroke="#4d5f99" stroke-width="5" stroke-linejoin="round"/><use href="#' + p + 'hd" fill="#18203d"/></g>' +
      '<defs><g id="' + p + 'hd">' + head + '<rect x="232" y="318" width="150" height="74" rx="20"/></g></defs>' +
      /* белое светящееся пространство внутри */
      L('white', '<ellipse class="breath" cx="282" cy="198" rx="62" ry="72" fill="#fffaf0" opacity=".9" filter="url(#' + p + 'g)"/><ellipse cx="282" cy="198" rx="40" ry="50" fill="#fffef8" opacity=".95"/>') +
      /* глаз: открыт/закрыт */
      L('eyeOpen', '<ellipse cx="210" cy="198" rx="10" ry="6" fill="#fff"/><circle cx="207" cy="198" r="3.4" fill="#10153a"/>') +
      L('eyeShut', '<path d="M199 199 Q210 206 221 199" stroke="#fff3cf" stroke-width="2.4" fill="none" stroke-linecap="round"/>') +
      /* взгляд на предмет — целиком */
      L('gaze', '<path class="flow" d="M204 198 L132 262 M204 198 L134 304" stroke="#fff" stroke-width="2.4" stroke-dasharray="1 10" stroke-linecap="round" fill="none"/>' +
        '<rect x="58" y="240" width="98" height="76" rx="12" fill="none" stroke="#ffd27a" stroke-width="2" stroke-dasharray="6 5"/>' +
        '<text class="cap2" x="107" y="228" text-anchor="middle">целиком, без деталей</text>') +
      /* предмет внутри */
      L('inner', '<g class="breath">' + cube(262, 188, 30, .95) + '</g>') +
      L('lbl1', '<text class="cap" x="352" y="52" text-anchor="end">5 минут</text>') +
      L('lbl2', '<text class="cap" x="352" y="52" text-anchor="end">ещё 5 минут</text>');

    var steps = [
      { t: 'Подготовка', add: ['obj', 'eyeOpen'],
        d: 'Устройтесь максимально удобно. Предмет — самый простой (спичечный коробок, детский кубик) — поставьте так, чтобы смотреть на него без напряжения.' },
      { t: 'Первая фаза · белое пространство', add: ['eyeShut', 'white'], rm: ['eyeOpen'],
        d: 'Закройте глаза и добейтесь белого светящегося пространства внутри себя.' },
      { t: 'Первая фаза · смотрим на предмет', add: ['eyeOpen', 'gaze', 'lbl1'], rm: ['eyeShut'],
        d: 'Откройте глаза и пять минут смотрите на предмет, не отрываясь. Не изучайте детали и не водите взглядом: воспринимайте предмет целиком, впуская его внутрь.' },
      { t: 'Вторая фаза · предмет внутри', add: ['eyeShut', 'white', 'inner', 'lbl2'], rm: ['eyeOpen', 'gaze', 'lbl1', 'obj'],
        d: 'Закройте глаза и ещё пять минут созерцайте тот же предмет в белом светящемся пространстве внутри.' },
      { t: 'Что должно получиться', rm: ['lbl2'],
        d: 'Белое пустое светящееся пространство достигнуто по-настоящему; восприятие предмета целостное и без оценок. Всё занятие — 15–20 минут.' },
      { t: 'У упражнения есть конец',
        d: 'В какой-то момент становится ясно, что «Созерцание» исчерпало себя как упражнение и стало постоянным качеством вашего сознания.' }
    ];
    return { id: 'soz', svg: A.svg('0 0 420 420', scene, 'sc-sz'), steps: steps, ar: '1/1', label: 'Анимация: «Созерцание» по шагам', maxh: '520px' };
  };
})(window);
