/* ДФС — спутник практики. Маршруты, главная (пять практик), страницы практик, «О методе», «Вспомнить», «В ситуации». */
(function () {
  'use strict';
  var D = window.DFSC = window.DFSC || {};
  /* Имена инструкторов на страницах: false — «версия одного из инструкторов» (до их согласия); true — имена */
  D.SHOW_NAMES = false;

  var CENTERS = { 1: 'Витальный', 2: 'Эмоциональный', 3: 'Ментальный', 4: 'Аккорд' };
  var RHY = { A: { g: '∞', n: 'Бесконечность', w: 'космос' }, B: { g: '~', n: 'Поток', w: 'жизнь' }, C: { g: '▪', n: 'Дискретность', w: 'точка' }, D: { g: '⚡', n: 'Распад', w: 'распад' } };
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function stateOf(id) { return STATES.filter(function (s) { return s.id === id; })[0]; }

  /* ---------- пять практик ---------- */
  var PRACTICES = [
    { n: 1, slug: 'cvetok', scene: 'cvetok', title: 'Огненный цветок', short: 'Цветок', essence: 'Основа всех упражнений: огненная конструкция в теле — от точки до корней и листьев.', time: '30–40 мин', note: '30 дней без перерыва' },
    { n: 2, slug: 'sozertsanie', scene: 'soz', title: 'Созерцание', short: 'Созерцание', essence: 'Смотрите на простой предмет целиком, а потом переносите его в белое светящееся пространство внутри.', time: '15–20 мин', note: '5 + 5 минут', extra: ['ozero'] },
    { n: 3, slug: 'ptitsa', scene: 'ptitsa', title: 'Полёт белой птицы', short: 'Птица', essence: 'Путешествие над морем: от глубокого расслабления к собранности и готовности к действию.', time: '25–35 мин', note: 'в конце занятия' },
    { n: 4, slug: 'kino', scene: 'kino', title: 'Кино', short: 'Кино', essence: 'Вечерний «фильм» о вашем дне, где вы — герой, а не камера.', time: 'вечером', note: 'наедине с собой' },
    { n: 5, slug: 'nol', scene: 'nol', title: 'Ноль-концентрация', short: 'Ноль', essence: 'Внимание ровно вдоль огненной оси, все показатели на нуле — покой, в котором можно действовать.', time: '15–45 мин', note: 'после цветка' }
  ];
  function practiceBy(slug) { return PRACTICES.filter(function (p) { return p.slug === slug; })[0]; }

  var ABOUT = ['start', 'map', 'ritmy', 'centry', 'life', 'slovar', 'know', 'bezopasnost'];
  var ABOUT_NOTE = { start: '3 шага', map: '7 шагов', ritmy: '5 шагов', centry: '6 шагов', life: '6 историй', slovar: '16 слов', know: '12 принципов', bezopasnost: 'до практики' };

  /* ---------- маршрут ---------- */
  function route() {
    var h = location.hash || '', m;
    if (h === '' || h === '#' || h === '#/') return { n: 'home' };
    if ((m = /^#\/p\/([\w-]+)/.exec(h))) return { n: 'practice', a: m[1] };
    if ((m = /^#\/about(?:\/([\w-]+))?/.exec(h))) return { n: 'about', a: m[1] || '' };
    if (/^#\/recall/.test(h)) return { n: 'recall' };
    if ((m = /^#\/sit(?:\/([\w-]+))?/.exec(h))) return { n: 'sit', a: m[1] || '' };
    if (h === '#/states' || /^#([1-4][A-D]|c[1-4]|r[A-D])$/i.test(h)) return { n: 'states' };
    return { n: 'home' };
  }

  var V = { home: $('#view-home'), practice: $('#view-practice'), about: $('#view-about'), states: $('#view-states'), recall: $('#view-recall'), sit: $('#view-sit') };
  var subhead = $('#subhead'), bar = $('#bar'), sentinel = $('#sentinel');
  var built = {};

  function setTopH() { var t = $('#top'); if (t) document.documentElement.style.setProperty('--topH', t.offsetHeight + 'px'); }
  window.addEventListener('resize', setTopH);

  function show(r) {
    Object.keys(V).forEach(function (k) { V[k].hidden = k !== r.n; });
    var sub = r.n === 'states' || r.n === 'recall' || r.n === 'sit';
    subhead.hidden = !sub; bar.hidden = sentinel.hidden = r.n !== 'states';
    var top = r.n === 'practice' ? 'home' : (sub ? 'states' : r.n);
    $$('[data-route]').forEach(function (a) { var on = a.getAttribute('data-route') === top; a.classList.toggle('is-on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $$('[data-sub]').forEach(function (a) { var on = a.getAttribute('data-sub') === r.n; a.classList.toggle('is-on', on); });
    if (r.n !== 'practice' && r.n !== 'about' && D.disposePlayers) D.disposePlayers();
    /* ряд пяти практик в верхней панели: виден на страницах практик, на телефоне заменяет строку с логотипом */
    var onP = r.n === 'practice';
    $$('#ptabs [data-p]').forEach(function (a) { var on = onP && a.getAttribute('data-p') === r.a; a.classList.toggle('is-on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $('#top').classList.toggle('top--p', onP);
    setTopH();
    document.title = 'ДФС — спутник практики: пять упражнений в 3D';
    if (r.n === 'home') { buildHome(); prefetch(); }
    else if (r.n === 'recall') { if (!built.recall) { buildRecall(); built.recall = true; } }
    else if (r.n === 'sit') buildSit(r.a);
    else if (r.n === 'practice' || r.n === 'about') loadPractice(r);
  }
  function go() {
    var r = route(); show(r);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', go);

  /* ---------- главная ---------- */
  function buildHome() {
    if (built.home) return; built.home = true;
    var cards = PRACTICES.map(function (p) {
      return '<a class="pcard" href="#/p/' + p.slug + '"><div class="pcard__img" style="background-image:url(img/p-' + p.slug + '.jpg)"></div><span class="pcard__n">' + p.n + '</span>' +
        '<div class="pcard__body"><h3>' + esc(p.title) + '</h3><p>' + esc(p.essence) + '</p><div class="pcard__meta"><span>' + esc(p.time) + '</span><span>' + esc(p.note) + '</span></div>' +
        '<span class="pcard__go">Открыть <i aria-hidden="true">→</i></span></div></a>';
    }).join('');
    V.home.innerHTML = '<section class="hero2"><span class="hero2__k">Методика ДФС · И. Н. Калинаускас</span><h1>Пять практик ДФС</h1>' +
      '<p>Вращайте фигуру, смотрите каждый шаг, повторяйте за экраном. Шпаргалка для тех, кто учится у инструктора.</p>' +
      '<div class="hero2__row"><a class="btn" href="#/p/cvetok">Начать с огненного цветка</a><a class="btn btn--ghost" href="#/about/start">С чего начать</a></div></section>' +
      '<section class="plist" aria-label="Пять практик">' + cards +
      '<a class="pcard pcard--about" href="#/about"><div class="pcard__body"><span class="pcard__k">Ещё на сайте</span><h3>О методе</h3><p>Как всё связано, четыре ритма, три центра, примеры из жизни, словарь и то, что важно знать до практики.</p><span class="pcard__go">Открыть <i aria-hidden="true">→</i></span></div></a></section>' +
      '<p class="home__how"><b>Как сочетаются.</b> Цветок — основа, его осваивают 30 дней подряд. Созерцание — отдельное упражнение на 15–20 минут. «Птица» завершает занятие, «Кино» — вечером, «Ноль-концентрация» — позже, в конце начального курса.</p>' +
      '<p class="home__note">Практики даны как шпаргалка к занятиям: для здоровых людей от 18 лет, с инструктором. <a href="#/about/bezopasnost">Что важно знать до практики</a></p>';
  }

  /* ---------- загрузка модулей практик ---------- */
  var CSS = ['practice/practice.css', 'practice/player.css'];
  var JS = ['vendor/three.min.js', 'practice/engine.js', 'practice/anim-common.js', 'practice/anim-cvetok.js', 'practice/anim-nol.js', 'practice/anim-soz.js', 'practice/anim-ptitsa.js',
    'practice/anim-kino.js', 'practice/anim-ozero.js', 'practice/anim-ritmy.js', 'practice/anim-centry.js', 'practice/anim-map.js',
    'practice/stage3d.js', 'practice/human.js', 'audio/index.js', 'practice/voice.js', 'practice/player.js', 'practice/scene-cvetok.js', 'practice/scene-nol.js', 'practice/scene-soz.js', 'practice/scene-ozero.js',
    'practice/scene-ptitsa.js', 'practice/scene-kino.js', 'practice/scene-centry.js', 'practice/lessons-1.js', 'practice/lessons-2.js', 'practice/lessons-3.js', 'practice/lessons-4.js'];
  var loading = null, loaded = false;
  function addFile(src) {
    return new Promise(function (ok, bad) {
      var el;
      if (/\.css$/.test(src)) { el = document.createElement('link'); el.rel = 'stylesheet'; el.href = src; }
      else { el = document.createElement('script'); el.src = src; el.async = false; }
      el.onload = function () { ok(); }; el.onerror = function () { bad(new Error(src)); };
      document.head.appendChild(el);
    });
  }
  function ensure() {
    if (loaded) return Promise.resolve();
    if (loading) return loading;
    CSS.forEach(function (c) { addFile(c); });
    /* скачиваются одновременно, выполняются по порядку (async=false) */
    loading = Promise.all(JS.map(addFile)).then(function () { loaded = true; });
    return loading;
  }
  function loadPractice(r) {
    var root = r.n === 'practice' ? $('#practice-root') : $('#about-root');
    if (!loaded) root.innerHTML = '<p class="loading">Загружаем 3D-сцену…</p>';
    ensure().then(function () {
      var cur = route(); if (cur.n !== r.n) return;
      if (D.disposePlayers) D.disposePlayers();
      if (r.n === 'practice') { var p = practiceBy(r.a); if (!p) { location.hash = '#/'; return; } root.innerHTML = practiceHTML(p); }
      else root.innerHTML = r.a ? aboutPageHTML(r.a) : aboutHubHTML();
      D.initPlayers(root);
      try { var ttl = r.n === 'practice' ? practiceBy(r.a).title : (r.a && lessonBy(r.a) ? lessonBy(r.a).title : 'О методе'); document.title = ttl + ' — ДФС, спутник практики'; } catch (e) {}
      window.scrollTo(0, 0);
    }).catch(function (e) { root.innerHTML = '<p class="loading">Не удалось загрузить материалы. Обновите страницу.</p>'; if (window.console) console.error(e); });
  }

  /* пока человек читает главную, тихо подгружаем 3D, чтобы практика открылась сразу */
  function prefetch() {
    try { if (navigator.connection && navigator.connection.saveData) return; } catch (e) {}
    var run = function () { ensure().catch(function () { loading = null; }); };
    setTimeout(function () { if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 4000 }); else run(); }, 1200);
  }

  /* ---------- общие блоки страниц ---------- */
  var WARN = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2.5 20h19Z"/><path d="M12 10v4.5M12 17.6v.2"/></svg>';
  var SAFE_LIST = [
    '<b>Остановитесь и скажите инструктору</b>, если во время упражнений появляются раскачивание, чувство «улетания», нарастающая тревога, жжение подошв или бессонница.',
    'По автору, упражнения без подготовленного инструктора рискованны: нужна индивидуальная коррекция, а побочные ощущения нужно уметь объяснить.',
    'Методика активизирует нервную систему и обмен веществ: нужна строгая дозировка, «Огненный цветок» пять раз в день делать не надо. Упражнения дают результат только как единый комплекс.',
    'Пособие просит инструкторов проверять людей из групп повышенного риска вместе со специалистами. Если у вас есть психиатрический или неврологический диагноз, практика возможна только по согласованию с врачом и инструктором.',
    'Опыт других людей — не повод экспериментировать на себе. Автор требует точного соблюдения инструкций.'
  ];
  function lessonBy(slug) { return (D.LESSONS || []).filter(function (l) { return l.slug === slug; })[0]; }
  function bullets(arr, cls) { return '<ul class="bul ' + (cls || '') + '">' + arr.map(function (x) { return '<li><span>' + x + '</span></li>'; }).join('') + '</ul>'; }
  function sec(id, title, inner) { return '<section class="sec" id="' + id + '"><h2 class="sec__h">' + esc(title) + '</h2>' + inner + '</section>'; }

  function sceneFor(name) {
    if (D.S3 && D.S3[name]) return D.S3[name]();
    var a = D.A && D.A[name] ? D.A[name]() : null; if (!a) return null;
    return { id: a.id, label: a.label, steps: a.steps, svg: a.svg, ar: a.ar };
  }
  function playerFor(name, uid, head, lead, opt) { var s = sceneFor(name); if (!s) return ''; if (uid) s.id = uid; if (head) s.head = head; if (lead) s.lead = lead; if (opt) { if (opt.next) s.next = opt.next; if (opt.note) s.note = opt.note; } return D.player(s); }
  function fold(id, title, inner) { return '<section class="sec sec--fold" id="' + id + '"><details class="fold"><summary><h2 class="sec__h">' + esc(title) + '</h2></summary><div class="fold__b">' + inner + '</div></details></section>'; }
  var PL_NOTE = 'Для здоровых людей от 18 лет, не вместо врача и инструктора. Жжение подошв, бессонница, нарастающая тревога, раскачивание — остановитесь и скажите инструктору. <a href="#safe" data-anch="safe">Подробнее внизу</a>';

  /* иконки тем (линейные, 24 px) — у каждого блока своя, в мягком цветном квадрате */
  var ICO = {
    checks: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.5 1.5L7.5 5M3.5 12l1.5 1.5L7.5 11M3.5 18l1.5 1.5L7.5 17"/>',
    buoy: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>',
    spark: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.2A4.6 4.6 0 0 1 21 18.6"/>',
    shield: '<path d="M12 3 4.5 6v6c0 4.4 3.2 7.6 7.5 9 4.3-1.4 7.5-4.6 7.5-9V6z"/><path d="m9 12 2 2 4-4"/>',
    lake: '<path d="M3 15c2 0 2-1.5 4.5-1.5S9.5 15 12 15s2.5-1.5 4.5-1.5S19 15 21 15"/><path d="M3 19c2 0 2-1.5 4.5-1.5S9.5 19 12 19s2.5-1.5 4.5-1.5S19 19 21 19"/><path d="M12 3c2 2.4 3.4 4.2 3.4 6.2a3.4 3.4 0 0 1-6.8 0C8.6 7.2 10 5.4 12 3z"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 18H20"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    home: '<path d="M4 11 12 4l8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    split: '<rect x="3.5" y="4" width="7" height="16" rx="2"/><rect x="13.5" y="4" width="7" height="16" rx="2"/>',
    box: '<path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
    pose: '<circle cx="12" cy="5" r="2"/><path d="M5 11h14M12 7v6l-3 7M12 13l3 7"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    rewind: '<path d="M11 6 4 12l7 6zM20 6l-7 6 7 6z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    q: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.3-2.5 3.8M12 17.2v.3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  function ico(name, tone) { return '<span class="ico ico--' + (tone || 'gold') + '" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + (ICO[name] || ICO.info) + '</svg></span>'; }
  var META_ICO = { 'Длительность': 'clock', 'Срок освоения': 'cal', 'Где': 'home', 'Когда': 'moon', 'Начинать': 'flag', 'Две фазы': 'split', 'Предмет': 'box', 'Поза': 'pose', 'Как': 'user', 'Порядок': 'rewind', 'Что это': 'info', 'Основа': 'lake' };
  /* раздел с темой: иконка + заголовок + подзаголовок; содержимое раскрыто */
  function blk(id, icon, tone, title, subtitle, inner, cls) {
    return '<section class="blk' + (cls ? ' ' + cls : '') + '" id="' + id + '"><header class="blk__h">' + ico(icon, tone) + '<div><h2>' + esc(title) + '</h2>' + (subtitle ? '<p>' + subtitle + '</p>' : '') + '</div></header>' + inner + '</section>';
  }
  function factsHTML(meta) {
    return '<div class="facts">' + (meta || []).map(function (m) { return '<div class="fact">' + ico(META_ICO[m[0]] || 'info', 'blue') + '<div><span class="fact__k">' + esc(m[0]) + '</span><span class="fact__v">' + m[1] + '</span></div></div>'; }).join('') + '</div>';
  }
  function checksHTML(arr) { return '<ul class="checks">' + arr.map(function (x) { return '<li><span>' + x + '</span></li>'; }).join('') + '</ul>'; }
  function qaHTML(arr) { return '<div class="qa2">' + arr.map(function (q) { return '<article class="qa2__i"><h3>' + ico('q', 'rose') + '<span>' + q[0] + '</span></h3><div class="qa2__a">' + q[1] + '</div></article>'; }).join('') + '</div>'; }
  function gainsHTML(arr) { return '<ul class="gains">' + arr.map(function (x) { return '<li><span>' + x + '</span></li>'; }).join('') + '</ul>'; }
  /* «в книге автора» и «у инструкторов» — таблица по деталям; имена инструкторов не показываем до их согласия */
  function diffHTML(l) {
    if (!l.diff) return '';
    return '<div class="cmp" role="table" aria-label="Чем версии инструкторов отличаются от книги"><div class="cmp__r cmp__r--h" role="row"><span role="columnheader">Деталь</span><span role="columnheader">В книге автора</span><span role="columnheader">У инструкторов</span></div>' +
      l.diff.map(function (r) { return '<div class="cmp__r" role="row"><b role="rowheader">' + esc(r[0]) + '</b><span role="cell"><i class="cmp__m">В книге</i>' + r[1] + '</span><span role="cell"><i class="cmp__m">У инструкторов</i>' + r[2] + '</span></div>'; }).join('') + '</div>' +
      '<p class="cmp__note">На странице и в 3D взята версия автора, кроме случаев, где у автора нет деталей (тогда это сказано в тексте шага). Добавки инструкторов не вносите в практику без согласия своего инструктора, особенно в первые 30 дней.</p>';
  }
  function safeHTML() {
    return blk('safe', 'shield', 'green', 'Важно до практики', 'Для здоровых людей от 18 лет. Сайт — шпаргалка к занятиям с инструктором, а не замена ему и не замена врачу.',
      '<ul class="checks checks--safe">' + SAFE_LIST.map(function (x) { return '<li><span>' + x + '</span></li>'; }).join('') + '</ul><p class="blk__more"><a href="#/about/bezopasnost">Подробнее о безопасности →</a></p>', 'blk--safe');
  }
  function pitfallsHTML(l) { return l.pitfalls ? blk('trouble', 'buoy', 'rose', 'Если не получается', '', qaHTML(l.pitfalls)) : ''; }
  function srcHTML(l) { return '<p class="srcline">' + ico('book', 'grey') + '<span><b>Источники.</b> ' + esc(l.src || '') + ' Сверено с источниками 25.10.2026.</span></p>'; }
  var PL_NOTE = 'Для здоровых людей от 18 лет, не вместо врача и инструктора. Жжение подошв, бессонница, нарастающая тревога, раскачивание — остановитесь и скажите инструктору. <a href="#safe" data-anch="safe">Подробнее</a>';

  /* ---------- страница практики ---------- */
  function practiceHTML(p) {
    var l = lessonBy(p.slug), i = PRACTICES.indexOf(p), next = PRACTICES[i + 1];
    var meta = (l.meta || []).map(function (m) { return '<span>' + ico(META_ICO[m[0]] || 'info', 'plain') + m[1] + '</span>'; }).join('');
    var head = '<header class="ph2"><h1><span class="ph2__n" aria-hidden="true">' + p.n + '</span>' + esc(p.title) + '</h1>' +
      '<p class="ph2__m">' + meta + '<a href="#before" data-anch="before">Перед началом ↓</a></p></header>';
    var toc = [['before', 'checks', 'gold', 'Перед началом']].concat(p.extra ? [['extra', 'lake', 'blue', 'Подсказка']] : []).concat(l.pitfalls ? [['trouble', 'buoy', 'rose', 'Если не получается']] : [])
      .concat(l.why ? [['why', 'spark', 'gold', 'Зачем']] : []).concat(l.diff ? [['versions', 'users', 'blue', 'Автор и инструкторы']] : []).concat([['safe', 'shield', 'green', 'Важно до практики']]);
    var h = '<article class="pp pp--v5">' + playerFor(p.scene, 'pl-' + p.slug, head, null, { next: next ? { href: '#/p/' + next.slug, t: next.title } : null, note: PL_NOTE }) +
      '<nav class="toc" aria-label="Разделы страницы">' + toc.map(function (x) { return '<a href="#' + x[0] + '" data-anch="' + x[0] + '">' + ico(x[1], x[2]) + '<span>' + x[3] + '</span></a>'; }).join('') + '</nav><div class="pp__body">';
    h += blk('before', 'checks', 'gold', 'Перед началом', 'Что важно знать, чтобы практика получилась',
      '<p class="blk__lead">' + l.lead + '</p>' + (l.conditions ? checksHTML(l.conditions) : ''));
    if (p.extra) p.extra.forEach(function (ex) {
      var el = lessonBy(ex);
      h += blk('extra', 'lake', 'blue', 'Подсказка к первой фазе: ' + el.title, el.kicker || '',
        '<p class="blk__lead">' + el.lead + '</p>' + playerFor(ex, 'pl-' + ex) + (el.why ? gainsHTML(el.why) : '') + (el.pitfalls ? qaHTML(el.pitfalls) : '') + diffHTML(el));
    });
    if (l.pitfalls) h += blk('trouble', 'buoy', 'rose', 'Если не получается', 'Частые трудности и что о них говорит автор', qaHTML(l.pitfalls));
    if (l.why) h += blk('why', 'spark', 'gold', l.whyTitle ? l.whyTitle.replace(/\s*\(.*\)$/, '') : 'Зачем это нужно', /автор/.test(l.whyTitle || '') ? 'Так описывает автор' : '', gainsHTML(l.why));
    if (l.diff) h += blk('versions', 'users', 'blue', 'Автор и инструкторы', 'Чем версии инструкторов отличаются от книги', diffHTML(l));
    h += safeHTML() + srcHTML(l);
    h += next ? '<a class="nextcta" href="#/p/' + next.slug + '"><span><small>Следующая практика</small><b>' + next.n + '. ' + esc(next.title) + '</b><em>' + esc(next.essence) + '</em></span>' + ico('arrow', 'gold') + '</a>'
      : '<a class="nextcta" href="#/about"><span><small>Дальше</small><b>О методе</b><em>Как всё связано, ритмы, центры, словарь.</em></span>' + ico('arrow', 'gold') + '</a>';
    return h + '</div></article>';
  }

  /* ---------- «О методе» ---------- */
  function aboutHubHTML() {
    var cards = ABOUT.map(function (s) {
      var l = lessonBy(s); if (!l) return '';
      return '<a class="cl-card" href="#/about/' + s + '"><div class="cl-card__art">' + (D.ICONS[l.icon] || '') + '</div><div class="cl-card__body"><span class="cl-card__t">' + esc(l.title) + '</span><span class="cl-card__s">' + esc(l.kicker) + '</span><span class="cl-card__meta">' + esc(ABOUT_NOTE[s] || '') + '</span></div></a>';
    }).join('');
    return '<div class="about"><header class="ph ph--solo"><div><h1>О методе</h1><p class="ph__lead">Как всё связано, язык состояний, примеры из жизни и то, что важно знать до практики.</p></div></header><div class="cl-grid">' + cards + '</div></div>';
  }
  function aboutPageHTML(slug) {
    var l = lessonBy(slug); if (!l || ABOUT.indexOf(slug) < 0) { location.hash = '#/about'; return ''; }
    var i = ABOUT.indexOf(slug), prev = lessonBy(ABOUT[i - 1]), next = lessonBy(ABOUT[i + 1]);
    var h = '<article class="pp"><nav class="crumb" aria-label="Путь"><a href="#/about">О методе</a></nav><header class="ph ph--solo"><div><p class="les__k">' + esc(l.kicker) + '</p><h1>' + esc(l.title) + '</h1><p class="ph__lead">' + l.lead + '</p></div></header>';
    if (l.meta) h += '<div class="ph__meta">' + l.meta.map(function (m) { return '<span class="chipm"><b>' + esc(m[0]) + '</b><span>' + m[1] + '</span></span>'; }).join('') + '</div>';
    if (l.note) h += '<div class="warn"><span>' + l.note + '</span></div>';
    if (l.doors) h += '<div class="go3">' + l.doors.map(function (d) { return '<div class="go"><span class="go__n">' + d.n + '</span><h3>' + esc(d.t) + '</h3><p>' + esc(d.p) + '</p><div class="go__l">' + d.links.map(function (k) { return '<a href="' + k[1] + '">' + esc(k[0]) + '</a>'; }).join('') + '</div></div>'; }).join('') + '</div>';
    if (l.anim) h += playerFor(l.anim, 'pl-' + l.slug);
    if (l.why) h += sec('why', l.whyTitle || 'Зачем это нужно', bullets(l.why));
    if (l.conditions) h += sec('cond', 'Условия', bullets(l.conditions));
    if (l.glossary) h += sec('gloss', 'Слова', '<dl class="cl-gloss">' + l.glossary.map(function (g) { return '<div><dt>' + esc(g[0]) + '</dt><dd>' + esc(g[1]) + '</dd></div>'; }).join('') + '</dl>');
    if (l.cases) {
      var card = function (c) { return '<article class="case"><h3>' + esc(c.a) + '</h3><p class="case__c">' + c.c + '</p><p class="case__e">' + c.e + '</p><p class="case__s">' + esc(c.s) + '</p></article>'; };
      var st = l.cases.filter(function (c) { return c.kind !== 'claim'; }), cl = l.cases.filter(function (c) { return c.kind === 'claim'; });
      h += sec('stories', 'Истории', '<div class="cases">' + st.map(card).join('') + '</div>');
      if (cl.length) h += '<details class="cases-more"><summary>Что ещё заявляет методика (' + cl.length + ')</summary><div class="cases">' + cl.map(card).join('') + '</div></details>';
    }
    if (l.principles) h += sec('princ', 'Принципы', '<div class="qa">' + l.principles.map(function (p, k) { return '<details' + (k < 1 ? ' open' : '') + '><summary>' + esc(p[0]) + '</summary><div><p>' + p[1] + '</p><p class="pr__s">' + esc(p[2]) + '</p></div></details>'; }).join('') + '</div>');
    (l.blocks || []).forEach(function (b, k) {
      var inner = '';
      if (b.p) inner += '<p class="blk__p">' + b.p + '</p>';
      if (b.ol) inner += '<ol class="olx">' + b.ol.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>';
      if (b.list) inner += bullets(b.list, 'bul--plain');
      if (b.after) inner += '<p class="blk__p" style="margin-top:12px">' + b.after + '</p>';
      if (b.cols) inner += '<div class="two">' + b.cols.map(function (c) { return '<div class="box"><h3>' + esc(c.t) + '</h3><p>' + c.p + '</p></div>'; }).join('') + '</div>';
      h += sec('b' + k, b.h, inner);
    });
    if (l.safety) h += sec('safe', 'Предупреждения автора', bullets(SAFE_LIST) + '<p class="blk__p" style="margin-top:12px">' + l.safety + '</p>');
    h += pitfallsHTML(l) + srcHTML(l);
    h += '<nav class="les__nav">' + (prev ? '<a class="nav-a" href="#/about/' + prev.slug + '"><small>Назад</small><b>' + esc(prev.title) + '</b></a>' : '<span></span>') + (next ? '<a class="nav-a nav-a--next" href="#/about/' + next.slug + '"><small>Дальше</small><b>' + esc(next.title) + '</b></a>' : '<a class="nav-a nav-a--next" href="#/"><small>К практикам</small><b>Пять практик ДФС</b></a>') + '</nav></article>';
    return h;
  }

  /* ---------- «Вспомнить» ---------- */
  var order = STATES.map(function (s) { return s.id; });
  function shuffled(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var k = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[k]; a[k] = x; } return a; }
  var deck = { i: 0, flip: false, mode: 'deck', ids: shuffled(order) };
  function badge(s) { return '<span class="badge">' + s.id + '</span>'; }
  function backHTML(s) {
    var d = RECALL[s.id] || {};
    var tr = s.tracks.map(function (t) { return esc(t.a + ' — ' + t.t); }).join('<br>');
    var head = d.kind === 'D' ? 'Что делать, если вы это узнали' : 'Когда включать';
    return '<p class="rc-one">' + esc(d.one || '') + '</p><h4>' + head + '</h4><ul class="rc-ul">' + (d.when || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
      (d.care ? '<h4>Осторожно</h4><p class="rc-care">' + esc(d.care) + '</p>' : '') +
      '<details class="rc-more"><summary>Подробнее</summary>' + (d.live ? '<h4>Пример из книги</h4><p class="rc-live">' + esc(d.live) + '</p>' : '') + '<h4>Как звучит</h4><p class="rc-tr">' + tr + '</p><a class="rc-link" href="#' + s.id + '">Картины, музыка и описание →</a></details>';
  }
  function frontHTML(s) {
    var im = s.imgs[0];
    return '<div class="rc-pic"><img src="' + im.src + '" width="' + im.w + '" height="' + im.h + '" alt="Картина для состояния ' + s.id + '"></div><div class="rc-id">' + badge(s) + '<div class="rc-meta"><b>' + RHY[s.r].g + ' ' + RHY[s.r].n + ' · «' + RHY[s.r].w + '»</b><span>Центр ' + s.c + ' · ' + CENTERS[s.c] + '</span></div></div><p class="rc-ask">Что это за состояние и когда оно нужно?</p>';
  }
  function buildRecall() {
    var v = V.recall;
    v.innerHTML = '<div class="rc-top"><div class="seg" role="group" aria-label="Режим"><button type="button" class="seg__b is-on" data-m="deck">Колода</button><button type="button" class="seg__b" data-m="list">Списком</button></div><button type="button" class="linkbtn" id="rc-shuffle">Перемешать</button></div><div id="rc-body"></div>';
    v.addEventListener('click', function (e) {
      var b = e.target.closest('.seg__b');
      if (b) { deck.mode = b.getAttribute('data-m'); $$('.seg__b', v).forEach(function (x) { x.classList.toggle('is-on', x === b); }); renderRecall(); return; }
      if (e.target.closest('#rc-shuffle')) { deck.ids = shuffled(deck.ids); deck.i = 0; deck.flip = false; renderRecall(); return; }
      if (e.target.closest('[data-a="flip"]')) { deck.flip = !deck.flip; renderRecall(); return; }
      if (e.target.closest('[data-a="next"]')) { deck.i = (deck.i + 1) % deck.ids.length; deck.flip = false; renderRecall(); return; }
      if (e.target.closest('[data-a="prev"]')) { deck.i = (deck.i - 1 + deck.ids.length) % deck.ids.length; deck.flip = false; renderRecall(); return; }
      var c = e.target.closest('.rc-card__face'); if (c && e.target.tagName !== 'A' && !e.target.closest('details')) { deck.flip = !deck.flip; renderRecall(); }
    });
    document.addEventListener('keydown', function (e) {
      if (V.recall.hidden || deck.mode !== 'deck') return;
      if (e.target.closest && e.target.closest('input,textarea')) return;
      if (e.key === 'ArrowRight') { deck.i = (deck.i + 1) % deck.ids.length; deck.flip = false; renderRecall(); }
      else if (e.key === 'ArrowLeft') { deck.i = (deck.i - 1 + deck.ids.length) % deck.ids.length; deck.flip = false; renderRecall(); }
    });
    renderRecall();
  }
  function renderRecall() {
    var body = $('#rc-body');
    if (deck.mode === 'list') {
      body.innerHTML = '<div class="rc-list">' + STATES.map(function (s) {
        var d = RECALL[s.id] || {};
        return '<article class="rcl r-' + s.r + '"><header>' + badge(s) + '<div class="rc-meta"><b>' + RHY[s.r].g + ' ' + RHY[s.r].n + '</b><span>' + CENTERS[s.c] + '</span></div></header><p class="rc-one">' + esc(d.one || '') + '</p><ul class="rc-ul">' + (d.when || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
          (d.care ? '<p class="rc-care"><b>Осторожно:</b> ' + esc(d.care) + '</p>' : '') + '<a class="rc-link" href="#' + s.id + '">Картины и музыка →</a></article>';
      }).join('') + '</div>';
      return;
    }
    var s = stateOf(deck.ids[deck.i]);
    body.innerHTML = '<div class="rc-deck r-' + s.r + '"><div class="rc-card' + (deck.flip ? ' is-back' : '') + '"><div class="rc-card__face">' +
      (deck.flip ? '<div class="rc-id rc-id--s">' + badge(s) + '<div class="rc-meta"><b>' + RHY[s.r].g + ' ' + RHY[s.r].n + '</b><span>' + CENTERS[s.c] + '</span></div></div>' + backHTML(s) : frontHTML(s)) + '</div></div>' +
      '<div class="rc-ctl"><button type="button" class="stp-btn" data-a="prev" aria-label="Предыдущая">‹</button><button type="button" class="rc-flip" data-a="flip">' + (deck.flip ? 'Скрыть ответ' : 'Показать ответ') + '</button><button type="button" class="stp-btn" data-a="next" aria-label="Следующая">›</button></div><p class="rc-n">' + (deck.i + 1) + ' / ' + deck.ids.length + '</p></div>';
  }

  /* ---------- «В ситуации» ---------- */
  function buildSit(arg) {
    var v = V.sit;
    var cur = SITUATIONS.filter(function (x) { return x.id === arg; })[0] || SITUATIONS[0];
    var list = SITUATIONS.map(function (x) { return '<a class="st-i' + (x.id === cur.id ? ' is-on' : '') + '" href="#/sit/' + x.id + '">' + esc(x.t) + '</a>'; }).join('');
    var TAG = { know: 'узнать', go: 'перейти' };
    var rows = cur.st.map(function (p) {
      var s = stateOf(p[0]);
      return '<a class="st-row r-' + s.r + '" href="#' + s.id + '"><span class="badge">' + s.id + '</span><span class="st-row__t"><b>' + (p[2] ? '<em class="st-tag st-tag--' + p[2] + '">' + TAG[p[2]] + '</em> ' : '') + RHY[s.r].g + ' ' + RHY[s.r].n + ' · ' + CENTERS[s.c] + '</b>' + esc(p[1]) + '</span><span class="st-go" aria-hidden="true">→</span></a>';
    }).join('');
    v.innerHTML = '<div class="st"><details class="st-pick"><summary><span>Ситуация</span><b>' + esc(cur.t) + '</b></summary><nav class="st-list" aria-label="Ситуации">' + list + '</nav></details>' +
      '<section class="st-res" aria-live="polite"><h2>' + esc(cur.t) + '</h2><h3>' + esc(cur.h || 'Что подойдёт') + '</h3><div class="st-rows">' + rows + '</div>' +
      (cur.care ? '<div class="st-care"><b>Осторожно</b>' + esc(cur.care) + '</div>' : '') + (cur.live ? '<div class="st-live"><b>Из книги</b>' + esc(cur.live) + '</div>' : '') + '</section></div>';
    var pick = $('.st-pick', v);
    try { if (pick && window.matchMedia('(min-width: 820px)').matches) pick.open = true; } catch (e) {}
  }

  /* подсветка раздела в странице практики при прокрутке */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.anch a, a[data-anch]'); if (!a) return;
    e.preventDefault(); var t = document.getElementById(a.getAttribute('data-anch')); if (!t) return;
    var dt = t.querySelector('details.safe, details.fold'); if (dt) dt.open = true;
    var bar = document.querySelector('.anch'), off = document.getElementById('top').offsetHeight + (bar ? bar.offsetHeight : 0) + 12;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - off, behavior: 'smooth' });
  });

  D.ICONS = D.ICONS || {};
  /* пять практик — в верхнем меню (ряд на страницах практик и выпадающий список у пункта «Практики») */
  (function () {
    var tabs = $('#ptabs');
    if (tabs) tabs.innerHTML = PRACTICES.map(function (p) { return '<a href="#/p/' + p.slug + '" data-p="' + p.slug + '" title="' + esc(p.title + ' · ' + p.time) + '"><b>' + p.n + '</b><span class="ptabs__s">' + esc(p.short) + '</span><span class="ptabs__l">' + esc(p.title) + '</span></a>'; }).join('');
  })();
  setTopH();
  go();
})();
