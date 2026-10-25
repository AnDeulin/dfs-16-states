/* Плеер практик: сцена (3D или запасной SVG) + субтитры на картинке + голос + текст шагов сбоку.
   Устроен как видеоплеер с расшифровкой (YouTube, TED, Coursera): под сценой панель управления, рядом список шагов,
   у текущего шага раскрыт текст и подсвечена фраза, которая сейчас звучит. На телефоне текст шага — под панелью.
   Описание сцены: {id, label, steps, build?, cams?, svg?, fallback?, head?, next?, note?}. Шаги накапливаются: add/rm/fx/cam/focus. */
(function (G) {
  'use strict';
  var D = G.DFSC = G.DFSC || {};
  var REG = {}, INST = [];

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function resolve(steps) {
    var on = {};
    return steps.map(function (s) {
      (s.add || []).forEach(function (n) { on[n] = true; });
      (s.rm || []).forEach(function (n) { delete on[n]; });
      return { t: s.t, d: s.d, on: Object.keys(on), fx: (s.fx || []).join(' '), ms: s.ms, cam: s.cam, add: s.add || [], focus: s.focus, subTop: !!s.subTop };
    });
  }
  /* настройки, общие для всех плееров (помним между страницами; если хранилище недоступно — просто значения по умолчанию) */
  var PREF = { voice: true, cc: null, rate: 1, size: 'm' };
  try { var sv = JSON.parse(localStorage.getItem('dfs.player') || '{}'); for (var k in sv) if (k in PREF) PREF[k] = sv[k]; } catch (e) {}
  /* субтитры по умолчанию: на телефоне включены, на ПК выключены — там тот же текст стоит рядом с картинкой */
  if (PREF.cc === null) { try { PREF.cc = !G.matchMedia('(min-width: 1024px)').matches; } catch (e) { PREF.cc = true; } }
  function savePref() { try { localStorage.setItem('dfs.player', JSON.stringify(PREF)); } catch (e) {} }
  var RATES = [1, 0.8, 1.25], RATE_T = { 1: 'Обычный', 0.8: 'Медленнее', 1.25: 'Быстрее' };
  var SIZES = [['s', 'Мельче'], ['m', 'Обычные'], ['l', 'Крупнее']];
  var hintShown = false; try { hintShown = localStorage.getItem('dfs.hint') === '1'; } catch (e) {}

  var I = {
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.8-6.8a.8.8 0 0 0 0-1.4L9.2 4.5A.8.8 0 0 0 8 5.2z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.2" fill="currentColor"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2" fill="currentColor"/></svg>',
    replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4.6h4.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    vol: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path class="w1" d="M15.5 8.5a5 5 0 0 1 0 7"/><path class="w2" d="M18.5 5.5a9 9 0 0 1 0 13"/><path class="x" d="m16 9 5 6m0-6-5 6"/></svg>',
    cc: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10.5 10.2a2.4 2.4 0 1 0 0 3.6M17 10.2a2.4 2.4 0 1 0 0 3.6"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
    rot: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v4.8h-4.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    full: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path class="f1" d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/><path class="f2" d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>',
    drag: '<svg viewBox="0 0 48 24" aria-hidden="true"><path d="M4 12h40M10 6l-6 6 6 6M38 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  var VIEWS = { front: { az: 0, el: 6 }, side: { az: 90, el: 6 }, back: { az: 180, el: 6 } };
  var VIEW_T = [['auto', 'По шагам'], ['front', 'Спереди'], ['side', 'Сбоку'], ['back', 'Сзади'], ['spin', 'Вращать']];

  function chunkHTML(ch) { return ch.map(function (c, k) { return (c.br ? '<br>' : '') + '<span class="ch" data-k="' + k + '">' + esc(c.t) + '</span>'; }).join(' '); }

  /* Возвращает HTML плеера; запуск — D.initPlayers(root) после вставки в страницу */
  D.player = function (cfg) {
    cfg.steps = resolve(cfg.steps);
    cfg.steps.forEach(function (s) { s.ch = D.Voice ? D.Voice.chunks(s.d) : [{ t: s.d }]; });
    REG[cfg.id] = cfg;
    var n = cfg.steps.length, three = !!cfg.build;
    var seg = cfg.steps.map(function (s, i) { return '<button type="button" class="pl__sg" data-i="' + i + '" aria-label="Шаг ' + (i + 1) + ': ' + esc(s.t) + '" title="' + (i + 1) + '. ' + esc(s.t) + '"><i></i></button>'; }).join('');
    var list = cfg.steps.map(function (s, i) {
      return '<li class="pl__li" data-i="' + i + '"><button type="button" class="pl__it" data-i="' + i + '"><span class="pl__num">' + (i + 1) + '</span><span class="pl__t">' + esc(s.t) + '</span></button>' +
        '<p class="pl__lt">' + chunkHTML(s.ch) + '</p></li>';
    }).join('');
    var views = three ? '<div class="pl__mg" role="radiogroup" aria-label="Камера"><span class="pl__mh">Камера</span><div class="pl__seg2">' +
      VIEW_T.map(function (v) { return '<button type="button" class="pl__opt' + (v[0] === 'auto' ? ' is-on' : '') + '" role="radio" aria-checked="' + (v[0] === 'auto') + '" data-v="' + v[0] + '">' + v[1] + '</button>'; }).join('') + '</div></div>' +
      '<label class="pl__sw"><input type="checkbox" data-o="labels"><span>Названия частей на картинке</span></label>' : '';
    var menu = '<div class="pl__menu" role="dialog" aria-label="Настройки показа" hidden>' + views +
      '<label class="pl__sw"><input type="checkbox" data-o="voice"><span>Голос</span></label>' +
      '<label class="pl__sw"><input type="checkbox" data-o="cc"><span>Субтитры на картинке</span></label>' +
      '<div class="pl__mg" role="radiogroup" aria-label="Темп"><span class="pl__mh">Темп</span><div class="pl__seg2">' +
      RATES.map(function (r) { return '<button type="button" class="pl__opt" role="radio" data-r="' + r + '">' + RATE_T[r] + '</button>'; }).join('') + '</div></div>' +
      '<div class="pl__mg" role="radiogroup" aria-label="Размер субтитров"><span class="pl__mh">Размер субтитров</span><div class="pl__seg2">' +
      SIZES.map(function (z) { return '<button type="button" class="pl__opt" role="radio" data-z="' + z[0] + '">' + z[1] + '</button>'; }).join('') + '</div></div>' +
      '<p class="pl__vnote"></p></div>';
    return '<section class="pl' + (three ? ' pl--3d' : ' pl--svg') + (cfg.head ? ' pl--has-head' : '') + '" data-id="' + cfg.id + '"' +
      (cfg.next ? ' data-next="' + esc(cfg.next.href) + '" data-next-t="' + esc(cfg.next.t) + '"' : '') + ' aria-label="' + esc(cfg.label || 'Анимация') + '">' +
      (cfg.head ? '<div class="pl__head">' + cfg.head + '</div>' : '') +
      '<div class="pl__stagebox"><div class="pl__stage" tabindex="0" aria-label="Сцена: стрелки — шаги, пробел — показ">' +
        '<div class="pl__view"></div>' +
        '<div class="pl__top"><div class="pl__seg">' + seg + '</div><span class="pl__n"></span></div>' +
        (three ? '<div class="pl__hint" aria-hidden="true">' + I.drag + '<span>Потяните — повернуть</span></div>' : '') +
        '<div class="pl__sub" aria-hidden="true"><span></span></div>' +
      '</div>' +
      '<div class="pl__bar">' +
        '<div class="pl__bl"><button type="button" class="pl__ib" data-a="voice" aria-pressed="true" title="Голос">' + I.vol + '<span class="pl__ibt">Голос</span></button>' +
          '<button type="button" class="pl__ib pl__ib--cc" data-a="cc" aria-pressed="true" title="Субтитры">' + I.cc + '<span class="pl__ibt">Субтитры</span></button></div>' +
        '<div class="pl__ctl">' +
          '<button type="button" class="pl__b" data-a="prev" aria-label="Предыдущий шаг">' + I.prev + '</button>' +
          '<button type="button" class="pl__b pl__b--main" data-a="play" aria-label="Слушать и смотреть по шагам">' + I.play + '</button>' +
          '<button type="button" class="pl__b" data-a="next" aria-label="Следующий шаг">' + I.next + '</button></div>' +
        '<div class="pl__br"><button type="button" class="pl__ib pl__ib--full" data-a="full" aria-pressed="false" title="Режим практики: картинка на весь экран, экран не гаснет (клавиша F)">' + I.full + '<span class="pl__ibt">Режим практики</span></button>' +
          '<button type="button" class="pl__ib" data-a="menu" aria-expanded="false" aria-haspopup="dialog" title="Камера, голос, темп, размер субтитров">' + I.gear + '<span class="pl__ibt">Настройки</span></button></div>' +
        menu +
      '</div></div>' +
      '<div class="pl__side">' +
        '<article class="pl__cap" aria-live="polite"><p class="pl__k"></p><h3 class="pl__ct"></h3><p class="pl__cd"></p>' +
          '<button type="button" class="pl__go" data-a="go">Дальше</button></article>' +
        '<details class="pl__all"><summary class="pl__allh">Все шаги · ' + n + '</summary><ol class="pl__list">' + list + '</ol></details>' +
        (cfg.note ? '<p class="pl__note">' + cfg.note + '</p>' : '') +
      '</div></section>';
  };

  function wire(el) {
    if (el.__pl) return;
    var cfg = REG[el.getAttribute('data-id')]; if (!cfg) return;
    var n = cfg.steps.length, cur = 0, playing = false, narr = null, gapT = null, wake = null;
    var nextHref = el.getAttribute('data-next'), nextT = el.getAttribute('data-next-t');
    var view = el.querySelector('.pl__view'), stageBox = el.querySelector('.pl__stage'), sub = el.querySelector('.pl__sub'), subT = sub.firstChild;
    var segs = [].slice.call(el.querySelectorAll('.pl__sg')), lis = [].slice.call(el.querySelectorAll('.pl__li'));
    var listBox = el.querySelector('.pl__all'), menu = el.querySelector('.pl__menu'), btnMenu = el.querySelector('[data-a="menu"]');
    var btnPlay = el.querySelector('[data-a="play"]'), btnGo = el.querySelector('[data-a="go"]');
    var capK = el.querySelector('.pl__k'), capT = el.querySelector('.pl__ct'), capD = el.querySelector('.pl__cd'), cnt = el.querySelector('.pl__n');
    var hint = el.querySelector('.pl__hint'), box = el.querySelector('.pl__stagebox'), btnFull = el.querySelector('[data-a="full"]');
    var stage = null, svg = null, mode = 'auto', started = false, t0 = 0, full = false, uiT = null;
    var inst = { el: el, getStage: function () { return stage; }, dispose: function () { stop(); if (stage) { stage.dispose(); stage = null; } } };
    el.__pl = inst; INST.push(inst);

    /* ---------- настройки ---------- */
    var V = D.Voice || { can: function () { return false; }, anyFiles: function () { return false; }, webOk: function () { return false; }, name: function () { return ''; } };
    function syncPrefs() {
      var hasVoice = V.anyFiles() || V.webOk();
      el.querySelector('[data-a="voice"]').setAttribute('aria-pressed', String(PREF.voice && hasVoice));
      el.querySelector('[data-a="voice"]').classList.toggle('is-off', !(PREF.voice && hasVoice));
      el.querySelector('[data-a="cc"]').setAttribute('aria-pressed', String(PREF.cc));
      el.classList.toggle('no-cc', !PREF.cc);
      el.classList.toggle('sub-s', PREF.size === 's'); el.classList.toggle('sub-l', PREF.size === 'l');
      [].slice.call(menu.querySelectorAll('[data-z]')).forEach(function (b) { var on = b.getAttribute('data-z') === PREF.size; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
      [].slice.call(menu.querySelectorAll('input[data-o]')).forEach(function (inp) {
        var o = inp.getAttribute('data-o');
        if (o === 'voice') { inp.checked = PREF.voice && hasVoice; inp.disabled = !hasVoice; }
        else if (o === 'cc') inp.checked = PREF.cc;
        else if (o === 'labels') inp.checked = !!(stage && stage.labelMode === 'all');
      });
      [].slice.call(menu.querySelectorAll('[data-r]')).forEach(function (b) { var on = +b.getAttribute('data-r') === PREF.rate; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
      var note = menu.querySelector('.pl__vnote');
      note.textContent = !hasVoice ? 'Озвучка ещё не записана, а хорошего русского голоса в этом браузере нет — текст идёт субтитрами.' :
        (V.anyFiles() ? 'Озвучка: ' + V.name() + '.' : 'Голос браузера: ' + V.name() + '.');
    }
    function openMenu(on) { menu.hidden = !on; btnMenu.setAttribute('aria-expanded', String(on)); el.classList.toggle('menu-open', on); if (on) syncPrefs(); }

    /* ---------- шаги ---------- */
    function estMs(s) { var t = 0; s.ch.forEach(function (c) { t += V.readMs ? V.readMs(c.t) + 160 : 3000; }); return Math.max(3500, t) / PREF.rate + 1100; }
    function setPlayIcon() {
      var atEnd = cur === n - 1 && !playing;
      btnPlay.innerHTML = playing ? I.pause : (atEnd ? I.replay : I.play);
      btnPlay.setAttribute('aria-label', playing ? 'Пауза' : (atEnd ? 'Сначала' : 'Слушать и смотреть по шагам'));
      el.classList.toggle('is-playing', playing);
      document.body.classList.toggle('pl-on', playing);               // на телефоне нижнее меню прячется на время показа
      if (full) showUI();
    }
    function apply(i, instant) {
      var s = cfg.steps[i];
      if (stage) {
        stage.setState(s.on, s.fx);
        stage.setFocus(s.focus || s.add || []);
        if (mode === 'auto' && s.cam && cfg.cams && cfg.cams[s.cam]) stage.fly(cfg.cams[s.cam], instant);
      } else if (svg) {
        [].slice.call(svg.querySelectorAll('.L')).forEach(function (g) { g.classList.toggle('on', s.on.indexOf(g.getAttribute('data-l')) >= 0); });
        svg.setAttribute('data-fx', s.fx);
      }
    }
    function mark(k) {
      [].slice.call(el.querySelectorAll('.pl__li.is-active .ch, .pl__cd .ch')).forEach(function (c) { var kk = +c.getAttribute('data-k'); c.classList.toggle('is-now', kk === k); c.classList.toggle('is-past', k >= 0 && kk < k); });
      var s = cfg.steps[cur];
      sub.classList.toggle('pl__sub--top', !!s.subTop);                // действие внизу (корни, стопы) — субтитры наверх
      if (k >= 0 && s.ch[k]) { subT.textContent = s.ch[k].t; sub.classList.add('is-on'); } else sub.classList.remove('is-on');
    }
    function scrollList() {
      var li = lis[cur]; if (!li || !listBox || listBox.scrollHeight <= listBox.clientHeight + 2) return;
      var top = li.offsetTop - listBox.offsetTop - 12;
      if (top < listBox.scrollTop || top + li.offsetHeight > listBox.scrollTop + listBox.clientHeight) listBox.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
    function show(i, instant) {
      cur = Math.max(0, Math.min(n - 1, i)); var s = cfg.steps[cur];
      segs.forEach(function (b, k) { b.classList.toggle('is-done', k < cur); b.classList.toggle('is-cur', k === cur); });
      lis.forEach(function (li, k) { li.classList.toggle('is-active', k === cur); var b = li.firstChild; if (k === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      capK.textContent = 'Шаг ' + (cur + 1) + ' из ' + n; capT.textContent = s.t; capD.innerHTML = chunkHTML(s.ch); cnt.textContent = (cur + 1) + ' / ' + n;
      var last = cur >= n - 1;
      btnGo.textContent = last ? (nextHref ? 'Дальше: ' + nextT : 'Сначала') : 'Дальше';
      el.classList.toggle('is-last', last);
      el.querySelector('[data-a="prev"]').setAttribute('aria-disabled', String(cur === 0));
      el.querySelector('[data-a="next"]').setAttribute('aria-disabled', String(last));
      el.style.setProperty('--dur', (estMs(s) / 1000).toFixed(2) + 's');
      mark(-1); apply(cur, instant); setPlayIcon(); scrollList();
    }
    function restartFill() { var b = segs[cur]; if (!b) return; var i = b.firstChild; i.style.animation = 'none'; void i.offsetWidth; i.style.animation = ''; }
    function cancelNarr() { if (narr) { narr.cancel(); narr = null; } clearTimeout(gapT); }
    function runStep() {
      cancelNarr(); if (!playing) return;
      var s = cfg.steps[cur]; t0 = Date.now(); restartFill();
      var want = PREF.voice && V.can(s.ch);
      narr = V.run ? V.run(s.ch, { voice: want, rate: PREF.rate }, function (k) { mark(k); }, function () {
        narr = null; mark(-1);
        var rest = Math.max(1100 / PREF.rate, 3500 / PREF.rate - (Date.now() - t0));          // пауза между шагами, анимация успевает доиграть
        gapT = setTimeout(function () { if (!playing) return; if (cur >= n - 1) { stop(); return; } show(cur + 1); runStep(); }, rest);
      }) : null;
    }
    function keepAwake(on) {
      try {
        if (on && 'wakeLock' in navigator && !wake) navigator.wakeLock.request('screen').then(function (w) { wake = w; w.addEventListener('release', function () { wake = null; }); }, function () {});
        else if (!on && wake) { wake.release(); wake = null; }
      } catch (e) {}
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden && playing) keepAwake(true); });
    function bringIntoView() {
      try {
        if (!window.matchMedia('(max-width: 979px)').matches) return;
        var r = stageBox.getBoundingClientRect(), top = (document.getElementById('top') || { offsetHeight: 58 }).offsetHeight;
        if (r.top < top || r.top > top + 80) window.scrollTo({ top: r.top + window.pageYOffset - top - 8, behavior: 'smooth' });
      } catch (e) {}
    }
    function stop() { playing = false; cancelNarr(); mark(-1); if (!full) keepAwake(false); setPlayIcon(); }

    /* ---------- «Режим практики»: картинка на весь экран, экран не гаснет, пульт прячется через 3 с и появляется по касанию ---------- */
    function showUI() {
      el.classList.add('ui-on'); clearTimeout(uiT);
      if (full && playing) uiT = setTimeout(function () { if (menu.hidden) el.classList.remove('ui-on'); }, 3000);
    }
    function setFull(on) {
      if (on === full) return;
      full = on; el.classList.toggle('pl--full', on); document.body.classList.toggle('pl-full-on', on);
      btnFull.setAttribute('aria-pressed', String(on)); btnFull.title = on ? 'Выйти из режима практики (Esc)' : 'Режим практики: картинка на весь экран, экран не гаснет (клавиша F)';
      try {
        if (on && box.requestFullscreen && !document.fullscreenElement) box.requestFullscreen().catch(function () {});
        else if (!on && document.fullscreenElement) document.exitFullscreen().catch(function () {});
      } catch (e) {}
      keepAwake(on || playing); showUI();
      if (stage) setTimeout(function () { stage.resize(); }, 60);
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && full && el.isConnected && menu.hidden) setFull(false); });
    document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement && full && el.isConnected) setFull(false); });
    var downAt = null;
    box.addEventListener('pointerdown', function (e) { downAt = { x: e.clientX, y: e.clientY }; if (full) showUI(); });
    box.addEventListener('pointermove', function () { if (full && !el.classList.contains('ui-on')) showUI(); });
    stageBox.addEventListener('pointerup', function (e) {
      if (!full || !downAt) return;
      if (Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 8 && !e.target.closest('button')) { if (el.classList.contains('ui-on') && playing) { el.classList.remove('ui-on'); clearTimeout(uiT); } else showUI(); }
    });
    function play() { if (cur >= n - 1) show(0); playing = true; keepAwake(true); setPlayIcon(); bringIntoView(); runStep(); }
    /* стрелки и полоски не останавливают показ: он продолжается с выбранного шага */
    function go(d) {
      if (d > 0 && cur >= n - 1) { if (nextHref) location.hash = nextHref; else { stop(); show(0); } return; }
      if (d < 0 && cur === 0) return;
      show(cur + d); if (playing) runStep();
    }
    function jump(i) { show(i); if (playing) runStep(); }
    function setMode(m) {
      mode = m;
      [].slice.call(menu.querySelectorAll('[data-v]')).forEach(function (c) { var on = c.getAttribute('data-v') === m; c.classList.toggle('is-on', on); c.setAttribute('aria-checked', String(on)); });
      if (!stage) return;
      stage.auto = (m === 'spin');
      var full = stage.cams && stage.cams.full || { dist: 4.2, t: [0, 0.8, 0.12] };
      if (m === 'auto') { var s = cfg.steps[cur]; if (s.cam && cfg.cams) stage.fly(cfg.cams[s.cam]); }
      else if (VIEWS[m]) stage.fly({ az: VIEWS[m].az, el: VIEWS[m].el, dist: full.dist, t: full.t });
      else if (m === 'spin') stage.fly({ az: stage.goal.az, el: 8, dist: full.dist, t: full.t });
    }

    /* ---------- события ---------- */
    el.addEventListener('click', function (e) {
      var a = e.target.closest('[data-a]');
      if (a) {
        var k = a.getAttribute('data-a');
        if (k === 'play') { playing ? stop() : play(); }
        else if (k === 'next' || k === 'go') go(1);
        else if (k === 'prev') go(-1);
        else if (k === 'voice') { if (!(V.anyFiles() || V.webOk())) { openMenu(true); return; } PREF.voice = !PREF.voice; savePref(); syncPrefs(); if (playing) runStep(); }
        else if (k === 'cc') { PREF.cc = !PREF.cc; savePref(); syncPrefs(); }
        else if (k === 'full') setFull(!full);
        else if (k === 'menu') openMenu(menu.hidden);
        return;
      }
      var vb = e.target.closest('[data-v]'); if (vb) { setMode(vb.getAttribute('data-v')); return; }
      var rb = e.target.closest('[data-r]'); if (rb) { PREF.rate = +rb.getAttribute('data-r'); savePref(); syncPrefs(); show(cur); if (playing) runStep(); return; }
      var zb = e.target.closest('[data-z]'); if (zb) { PREF.size = zb.getAttribute('data-z'); savePref(); syncPrefs(); return; }
      var sg = e.target.closest('.pl__sg, .pl__it'); if (sg) { jump(+sg.getAttribute('data-i')); return; }
      var ch = e.target.closest('.ch'); if (ch && ch.closest('.pl__li.is-active, .pl__cd')) { return; }
    });
    menu.addEventListener('change', function (e) {
      var o = e.target.getAttribute('data-o'); if (!o) return;
      if (o === 'labels') { if (stage) { stage.labelMode = e.target.checked ? 'all' : 'focus'; stage._kick(); } return; }
      PREF[o] = e.target.checked; savePref(); syncPrefs(); if (o === 'voice' && playing) runStep();
    });
    document.addEventListener('click', function (e) { if (!el.isConnected) return; if (!menu.hidden && !e.target.closest('.pl__menu') && !e.target.closest('[data-a="menu"]') && el.contains(menu)) openMenu(false); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (!menu.hidden) { openMenu(false); btnMenu.focus(); } else if (full) setFull(false); }
    });
    stageBox.addEventListener('keydown', function (e) {
      if (e.target !== stageBox) return;
      if (e.key === 'c' || e.key === 'с' || e.key === 'C' || e.key === 'С') { PREF.cc = !PREF.cc; savePref(); syncPrefs(); e.preventDefault(); }
      else if (e.key === 'f' || e.key === 'а' || e.key === 'F' || e.key === 'А') { setFull(!full); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
      else if (e.key === ' ') { playing ? stop() : play(); e.preventDefault(); }
    });

    /* ---------- запуск сцены: лениво, когда блок виден ---------- */
    function start() {
      if (started) return; started = true;
      if (cfg.build && D.has3D()) {
        stage = new D.Stage(view, { fov: cfg.fov });
        cfg.build(stage);
        stage.onuser = function () { if (mode === 'auto') { mode = 'free'; [].slice.call(menu.querySelectorAll('[data-v]')).forEach(function (c) { c.classList.remove('is-on'); c.setAttribute('aria-checked', 'false'); }); } if (hint) hint.classList.add('is-gone'); };
        show(cur, true);
      } else {
        var src = cfg.svg || (cfg.fallback && D.A && D.A[cfg.fallback] ? D.A[cfg.fallback]().svg : '');
        view.innerHTML = src; svg = view.querySelector('svg');
        var mg = menu.querySelectorAll('.pl__mg')[0]; if (mg && mg.querySelector('[data-v]')) { mg.hidden = true; var lb = menu.querySelector('[data-o="labels"]'); if (lb) lb.closest('label').hidden = true; }
        if (hint) hint.hidden = true;
        el.classList.add('pl--fallback');
        show(cur, true);
      }
    }
    show(0, true); syncPrefs();
    if (D.Voice && G.speechSynthesis) { try { G.speechSynthesis.addEventListener('voiceschanged', syncPrefs); } catch (e) {} }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { start(); io.disconnect(); } }, { rootMargin: '200px' });
      io.observe(el);
    } else start();
    if (hint) {
      if (hintShown) hint.hidden = true;
      else { hintShown = true; try { localStorage.setItem('dfs.hint', '1'); } catch (e) {} setTimeout(function () { hint.classList.add('is-gone'); }, 7000); }
    }
    /* список шагов: на ПК раскрыт всегда, на телефоне — по нажатию (текущий шаг и так виден под пультом) */
    function syncList() { try { if (G.matchMedia('(min-width: 1024px)').matches) listBox.open = true; } catch (e) {} }
    syncList(); G.addEventListener('resize', syncList);
  }

  D.initPlayers = function (root) { [].slice.call((root || document).querySelectorAll('.pl')).forEach(wire); };
  D.disposePlayers = function () { if (D.Voice) D.Voice.stop(); INST.splice(0).forEach(function (i) { i.dispose(); }); };
  D.stopAll = function () { D.disposePlayers(); };
})(window);
