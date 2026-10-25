/* Закрытый раздел «Практики» — движок пошаговых анимаций.
   Анимация = SVG-сцена со слоями (.L, data-l) + список шагов. Шаг включает слои, эффекты и подпись. */
(function (G) {
  'use strict';
  var D = G.DFSC = G.DFSC || {};
  var REG = {};

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  D.esc = esc;

  /* Слой: <g class="L" data-l="name"> */
  D.L = function (name, inner, cls) {
    return '<g class="L' + (cls ? ' ' + cls : '') + '" data-l="' + name + '">' + inner + '</g>';
  };

  /* Шаги с накоплением: add — включить, rm — выключить, fx — эффекты только на этом шаге */
  function resolve(steps) {
    var on = {};
    return steps.map(function (s) {
      (s.add || []).forEach(function (n) { on[n] = true; });
      (s.rm || []).forEach(function (n) { delete on[n]; });
      return { t: s.t, d: s.d, on: Object.keys(on), fx: (s.fx || []).join(' '), ms: s.ms, tag: s.tag };
    });
  }

  var ICON = {
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.8-6.8a.8.8 0 0 0 0-1.4L9.2 4.5A.8.8 0 0 0 8 5.2z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.2" fill="currentColor"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2" fill="currentColor"/></svg>',
    replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4.6h4.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* Возвращает HTML фигуры; сам запуск — в init() после вставки в страницу */
  D.stepper = function (cfg) {
    cfg.steps = resolve(cfg.steps);
    REG[cfg.id] = cfg;
    var list = cfg.steps.map(function (s, i) {
      return '<li class="stp__li"><button type="button" class="stp__item" data-i="' + i + '">' +
        '<span class="stp__num">' + (i + 1) + '</span>' +
        '<span class="stp__t">' + esc(s.t) + '</span></button></li>';
    }).join('');
    var ar = String(cfg.ar || '2/3').split('/');
    var arn = (+ar[0]) / (+ar[1] || 1);
    return '<figure class="stp" data-id="' + cfg.id + '" style="--ar:' + (cfg.ar || '2/3') + ';--arn:' + arn.toFixed(4) + ';--maxh:' + (cfg.maxh || '620px') + '" tabindex="-1">' +
      '<div class="stp__col">' +
        '<div class="stp__stage" role="img" aria-label="' + esc(cfg.label || 'Анимация') + '">' + cfg.svg + '</div>' +
        '<div class="stp__ctl">' +
          '<button type="button" class="stp__btn" data-a="prev" aria-label="Предыдущий шаг">' + ICON.prev + '</button>' +
          '<button type="button" class="stp__btn stp__btn--main" data-a="play" aria-label="Запустить">' + ICON.play + '</button>' +
          '<button type="button" class="stp__btn" data-a="next" aria-label="Следующий шаг">' + ICON.next + '</button>' +
          '<span class="stp__count" aria-live="polite"></span>' +
        '</div>' +
        '<div class="stp__bar" aria-hidden="true"><i></i></div>' +
      '</div>' +
      '<div class="stp__side">' +
        '<div class="stp__cap" aria-live="polite"><p class="stp__ck"></p><h4 class="stp__ct"></h4><p class="stp__cd"></p></div>' +
        '<details class="stp__all"><summary>Все шаги (' + cfg.steps.length + ')</summary><ol class="stp__list">' + list + '</ol></details>' +
      '</div>' +
    '</figure>';
  };

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function wire(el) {
    var cfg = REG[el.getAttribute('data-id')];
    if (!cfg || el.__wired) return;
    el.__wired = true;
    var svg = el.querySelector('svg');
    var layers = [].slice.call(svg.querySelectorAll('.L'));
    var items = [].slice.call(el.querySelectorAll('.stp__item'));
    var btnPlay = el.querySelector('[data-a="play"]');
    var count = el.querySelector('.stp__count');
    var capK = el.querySelector('.stp__ck'), capT = el.querySelector('.stp__ct'), capD = el.querySelector('.stp__cd');
    var bar = el.querySelector('.stp__bar i');
    var n = cfg.steps.length;
    var cur = 0, playing = false, timer = null, started = false;

    function dur(s) {
      if (s.ms) return s.ms;
      return Math.min(14000, 4200 + (s.d || '').length * 38);
    }
    function setPlayIcon() {
      var atEnd = cur === n - 1 && !playing;
      btnPlay.innerHTML = playing ? ICON.pause : (atEnd ? ICON.replay : ICON.play);
      btnPlay.setAttribute('aria-label', playing ? 'Пауза' : (atEnd ? 'Повторить' : 'Запустить'));
    }
    function show(i, scroll) {
      cur = Math.max(0, Math.min(n - 1, i));
      var s = cfg.steps[cur];
      layers.forEach(function (g) {
        g.classList.toggle('on', s.on.indexOf(g.getAttribute('data-l')) >= 0);
      });
      svg.setAttribute('data-fx', s.fx);
      svg.setAttribute('data-step', cur);
      items.forEach(function (b, k) {
        var a = k === cur;
        b.parentNode.classList.toggle('is-active', a);
        if (a) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      count.textContent = (cur + 1) + ' / ' + n;
      capK.textContent = 'Шаг ' + (cur + 1) + ' из ' + n;
      capT.textContent = s.t;
      capD.textContent = s.d;
      bar.style.width = ((cur + 1) / n * 100) + '%';
      if (scroll) {
        var act = items[cur];
        var box = el.querySelector('.stp__list');
        if (box && box.scrollHeight > box.clientHeight + 4 && box.clientHeight > 0) {
          var off = act.offsetTop - box.clientHeight / 2 + act.offsetHeight / 2;
          try { box.scrollTo({ top: Math.max(0, off), behavior: reduce ? 'auto' : 'smooth' }); } catch (e) { box.scrollTop = off; }
        }
      }
      setPlayIcon();
    }
    function stop() { playing = false; clearTimeout(timer); setPlayIcon(); }
    function tick() {
      clearTimeout(timer);
      if (!playing) return;
      timer = setTimeout(function () {
        if (cur >= n - 1) { stop(); return; }
        show(cur + 1, true);
        tick();
      }, dur(cfg.steps[cur]));
    }
    function play() {
      if (cur >= n - 1) show(0, true);
      playing = true; started = true; setPlayIcon(); tick();
    }

    el.addEventListener('click', function (e) {
      var a = e.target.closest('[data-a]');
      if (a) {
        var act = a.getAttribute('data-a');
        if (act === 'play') { playing ? stop() : play(); }
        else if (act === 'next') { stop(); show(cur + 1, true); }
        else if (act === 'prev') { stop(); show(cur - 1, true); }
        return;
      }
      var it = e.target.closest('.stp__item');
      if (it) { stop(); show(+it.getAttribute('data-i'), false); }
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { stop(); show(cur + 1, true); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { stop(); show(cur - 1, true); e.preventDefault(); }
    });

    show(0, false);
    /* на широком экране список шагов открыт, на телефоне свёрнут */
    var all = el.querySelector('.stp__all');
    try { if (all && window.matchMedia('(min-width: 900px)').matches) all.open = true; } catch (e) {}
    el.__stop = stop;
  }

  D.init = function (root) {
    [].slice.call((root || document).querySelectorAll('.stp')).forEach(wire);
  };
  D.stopAll = function (root) {
    [].slice.call((root || document).querySelectorAll('.stp')).forEach(function (e) { if (e.__stop) e.__stop(); });
  };
})(window);
