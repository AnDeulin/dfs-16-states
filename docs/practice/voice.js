/* Голос и субтитры для плеера практик.
   Текст шага режется на короткие фразы (до двух строк субтитров). Для каждой фразы ищется заранее записанный файл
   audio/<код>.mp3 (код — хэш произносимого текста, список в audio/index.js, его собирает tools/make_audio.py).
   Нет файла — берём голос браузера, но только качественный (Edge «Natural», Google, Apple); старые системные голоса
   Windows (Irina, Pavel) звучат как «переводчик» — их не используем, тогда фраза идёт только субтитром по времени чтения. */
(function (G) {
  'use strict';
  var D = G.DFSC = G.DFSC || {};
  var SS = G.speechSynthesis, V = D.Voice = {};

  /* ---------- фразы для субтитров ---------- */
  var MAX = 92;                                   // примерно две строки по 42–46 знаков
  function cut(s) {
    s = s.trim(); if (s.length <= MAX) return [s];
    var mid = s.length / 2, best = -1, seps = ['; ', ': ', ' — ', ', '];
    for (var k = 0; k < seps.length && best < 0; k++) {
      var at = -1, from = 0, x;
      while ((x = s.indexOf(seps[k], from)) >= 0) { if (at < 0 || Math.abs(x - mid) < Math.abs(at - mid)) at = x; from = x + 1; }
      if (at > 18 && at < s.length - 18) best = at + seps[k].length - 1;
    }
    if (best < 0) { best = s.lastIndexOf(' ', Math.round(mid)); if (best < 10) return [s]; }
    return cut(s.slice(0, best + 1)).concat(cut(s.slice(best + 1)));
  }
  V.chunks = function (text) {
    var out = [];
    String(text || '').split('\n').forEach(function (para, pi) {
      para = para.replace(/^(\d)\.\s/, '$1\u0002 ');                        // «1. Корни…» — номер пункта остаётся с текстом
      var parts = para.replace(/([.!?…])\s+(?=[«(А-ЯЁA-Z0-9])/g, '$1\u0001').replace(/\u0002/g, '.').split('\u0001');
      parts.forEach(function (p, k) { cut(p).forEach(function (c, j) { if (c) out.push({ t: c, br: pi > 0 && k === 0 && j === 0 }); }); });
    });
    return out;
  };

  /* ---------- текст для произношения (те же правила в tools/make_audio.py) ---------- */
  var LET = { A: 'а', B: 'бэ', C: 'эс', D: 'дэ' }, NUM = { 1: 'один', 2: 'два', 3: 'три', 4: 'четыре' };
  var ORD = { 1: 'Первое', 2: 'Второе', 3: 'Третье', 4: 'Четвёртое', 5: 'Пятое' };
  /* числа словами (синтезатор не читает цифры): именительный и родительный падеж, 0–100 */
  var U = ['ноль', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
  var UG = ['нуля', 'одного', 'двух', 'трёх', 'четырёх', 'пяти', 'шести', 'семи', 'восьми', 'девяти', 'десяти', 'одиннадцати', 'двенадцати', 'тринадцати', 'четырнадцати', 'пятнадцати', 'шестнадцати', 'семнадцати', 'восемнадцати', 'девятнадцати'];
  var TN = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
  var TG = ['', '', 'двадцати', 'тридцати', 'сорока', 'пятидесяти', 'шестидесяти', 'семидесяти', 'восьмидесяти', 'девяноста'];
  function nw(n, gen) {
    n = +n; if (n >= 100) return n === 100 ? (gen ? 'ста' : 'сто') : String(n); if (n < 20) return (gen ? UG : U)[n];
    var t = Math.floor(n / 10), u = n % 10; return (gen ? TG : TN)[t] + (u ? ' ' + (gen ? UG : U)[u] : '');
  }
  /* «два сантиметра», но «десять сантиметров», «от двух до трёх сантиметров» */
  function cm(prev) { return /(^|[\s-])(два|три|четыре)$/.test(prev) ? 'сантиметра' : 'сантиметров'; }
  var RNG = '(\\d+)\\s*[–-]\\s*(\\d+)', NB = '(?![а-яёa-z0-9])';
  V.say = function (s) {
    return String(s)
      .replace(/^([1-5])\.\s/, function (m, n) { return ORD[n] + ': '; })
      .replace(/\b([1-4])([ABCD])\b/g, function (m, n, l) { return NUM[n] + ' ' + LET[l]; })
      .replace(/\b3D\b/g, 'три-дэ')
      .replace(/\b(\d+)-значн/g, function (m, n) { return nw(n, 1) + 'значн'; })
      .replace(new RegExp('(^|\\s)от ' + RNG + ' до ' + RNG, 'g'), function (m, p, a, b, c, d) { return p + 'от ' + nw(a, 1) + '-' + nw(b, 1) + ' до ' + nw(c, 1) + '-' + nw(d, 1); })
      .replace(new RegExp('(^|\\s)на ' + RNG, 'g'), function (m, p, a, b) { return p + 'на ' + nw(a) + '-' + nw(b); })
      .replace(new RegExp(RNG, 'g'), function (m, a, b) { return 'от ' + nw(a, 1) + ' до ' + nw(b, 1); })
      .replace(/(\d+)\s*\+\s*(\d+)/g, function (m, a, b) { return nw(a) + ' плюс ' + nw(b); })
      .replace(/(^|\s)(от|до) (\d+)\b/g, function (m, p, w, n) { return p + w + ' ' + nw(n, 1); })
      .replace(/\d+/g, function (n) { return nw(n); })
      .replace(new RegExp('([а-яё]+)\\s*см' + NB, 'g'), function (m, w) { return w + ' ' + cm(w); })
      .replace(/[«»"]/g, '')
      .replace(/\s·\s/g, '. ')
      .replace(/\s+/g, ' ').trim();
  };
  /* код файла: FNV-1a по байтам UTF-8 произносимого текста */
  V.key = function (s) {
    var b = unescape(encodeURIComponent(V.say(s))), h = 0x811c9dc5;
    for (var i = 0; i < b.length; i++) { h ^= b.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  };
  V.readMs = function (s) { return Math.max(1500, 300 + s.length * 77); };   // не быстрее 13 знаков в секунду (норма для медленной практики)

  /* ---------- источники голоса ---------- */
  function files() { return (D.AUDIO && D.AUDIO.files) || {}; }
  V.hasFile = function (t) { return !!files()[V.key(t)]; };
  V.voice = null;
  function score(v) {
    var n = v.name || '';
    if (/natural|neural|online/i.test(n)) return 6;                     // Edge: Svetlana / Dmitry Online (Natural)
    if (/google/i.test(n)) return 5;                                    // Chrome: Google русский
    if (/milena|yuri|katya|enhanced|premium|siri/i.test(n)) return 5;   // Apple
    return 1;                                                           // старые системные голоса — не используем
  }
  function pick() {
    if (!SS) return;
    var list = SS.getVoices().filter(function (v) { return /^ru/i.test(v.lang) && score(v) >= 5; }).sort(function (a, b) { return score(b) - score(a); });
    V.voice = list[0] || null;
  }
  if (SS) { pick(); try { SS.addEventListener('voiceschanged', pick); } catch (e) { SS.onvoiceschanged = pick; } }
  V.webOk = function () { if (SS && !V.voice) pick(); return !!V.voice; };
  /* есть ли голос для этих фраз: файлы или хороший голос браузера */
  V.can = function (chunks) { if (V.webOk()) return true; for (var i = 0; i < (chunks || []).length; i++) if (V.hasFile(chunks[i].t)) return true; return false; };
  V.anyFiles = function () { for (var k in files()) return true; return false; };
  V.name = function () { return V.anyFiles() ? (D.AUDIO.voice || 'запись') : (V.voice ? V.voice.name.replace(/ - .*$/, '') : ''); };

  /* один элемент <audio> на всю страницу: так iOS разрешает следующие фразы после первого нажатия */
  var A = null, PRE = null;
  function audioEl() { if (!A) { A = new Audio(); A.preload = 'auto'; PRE = new Audio(); PRE.preload = 'auto'; } return A; }
  function url(t) { return 'audio/' + V.key(t) + '.mp3'; }

  /* ---------- проигрывание шага ----------
     run(chunks, {voice, rate}, onChunk(i), onDone) → {cancel}. */
  V.run = function (chunks, opt, onChunk, onDone) {
    var i = 0, dead = false, timer = null, guard = null, rate = opt.rate || 1, a = opt.voice ? audioEl() : null;
    function done() { if (!dead) { dead = true; onDone && onDone(); } }
    function advance(gap) { clearTimeout(guard); if (dead) return; i++; timer = setTimeout(next, gap || 0); }
    function next() {
      if (dead) return;
      if (i >= chunks.length) { done(); return; }
      onChunk && onChunk(i);
      var text = chunks[i].t, est = V.readMs(text) / rate, my = i;
      if (opt.voice && V.hasFile(text)) {
        a.onended = function () { if (my === i) advance(180 / rate); };
        a.onerror = function () { if (my === i) advance(); };
        a.src = url(text); a.playbackRate = rate;
        var pr = a.play(); if (pr && pr.catch) pr.catch(function () { if (my === i && !dead) timer = setTimeout(function () { advance(); }, est); });
        if (chunks[i + 1] && V.hasFile(chunks[i + 1].t)) PRE.src = url(chunks[i + 1].t);
        guard = setTimeout(function () { if (my === i && !dead) advance(); }, (files()[V.key(text)] * 1000 / rate) + 4000);
      } else if (opt.voice && V.webOk()) {
        var u = new SpeechSynthesisUtterance(V.say(text));
        u.lang = 'ru-RU'; u.voice = V.voice; u.rate = 0.96 * rate;
        u.onend = function () { if (my === i) advance(160); };
        u.onerror = function () { if (my === i) advance(); };
        try { SS.speak(u); } catch (e) { timer = setTimeout(advance, est); return; }
        guard = setTimeout(function () { if (my === i && !dead) { try { SS.cancel(); } catch (e) {} advance(); } }, est * 2.6 + 2500);
      } else timer = setTimeout(advance, est);
    }
    if (SS) { try { SS.cancel(); } catch (e) {} }
    next();
    return { cancel: function () { if (dead) return; dead = true; clearTimeout(timer); clearTimeout(guard); V.stop(); } };
  };
  V.stop = function () { try { if (SS) SS.cancel(); } catch (e) {} try { if (A) { A.onended = A.onerror = null; A.pause(); } } catch (e) {} };
})(window);
