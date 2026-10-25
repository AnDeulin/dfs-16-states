/* Общие части сцен: определения (градиенты, свечение), фигура человека, подписи. */
(function (G) {
  'use strict';
  var D = G.DFSC = G.DFSC || {};
  var A = D.A = D.A || {};
  var L = function (n, i, c) { return D.L(n, i, c); };

  /* Общие определения. p — уникальный префикс сцены (id в SVG не должны повторяться) */
  A.defs = function (p) {
    return '<defs>' +
      '<radialGradient id="' + p + 'S" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0" stop-color="#ffffff"/><stop offset=".38" stop-color="#e6f5ff"/><stop offset="1" stop-color="#7fc4ff" stop-opacity=".3"/></radialGradient>' +
      '<radialGradient id="' + p + 'H" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0" stop-color="#cfeaff" stop-opacity=".5"/><stop offset="1" stop-color="#9fd4ff" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + p + 'C" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#eaf7ff" stop-opacity=".12"/><stop offset="1" stop-color="#9fd4ff" stop-opacity=".5"/></linearGradient>' +
      '<linearGradient id="' + p + 'T" gradientUnits="userSpaceOnUse" x1="0" y1="380" x2="0" y2="94">' +
        '<stop offset="0" stop-color="#8fd0ff"/><stop offset="1" stop-color="#ffffff"/></linearGradient>' +
      '<filter id="' + p + 'G" filterUnits="userSpaceOnUse" x="-80" y="-80" width="620" height="860">' +
        '<feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<filter id="' + p + 'g" filterUnits="userSpaceOnUse" x="-80" y="-80" width="620" height="860"><feGaussianBlur stdDeviation="7"/></filter>' +
    '</defs>';
  };

  /* Человек, сидит, вид спереди. Центр по x = 200, пол y = 580 */
  A.body = function (p) {
    var torso = '<ellipse cx="200" cy="92" rx="34" ry="42"/>' +
      '<rect x="187" y="126" width="26" height="30" rx="10"/>' +
      '<path d="M128 170 C128 156 150 150 168 148 L232 148 C250 150 272 156 272 170 C282 222 280 300 268 372 C240 392 160 392 132 372 C120 300 118 222 128 170 Z"/>' +
      '<rect x="128" y="364" width="70" height="92" rx="30"/><rect x="202" y="364" width="70" height="92" rx="30"/>' +
      '<rect x="138" y="440" width="52" height="124" rx="22"/><rect x="210" y="440" width="52" height="124" rx="22"/>' +
      '<ellipse cx="164" cy="568" rx="36" ry="13"/><ellipse cx="236" cy="568" rx="36" ry="13"/>';
    var arms = '<path d="M130 168 C104 200 96 270 106 316 C112 350 134 384 160 404 L184 396 C160 372 144 340 142 306 C140 260 148 214 160 184 Z"/>' +
      '<path d="M270 168 C296 200 304 270 294 316 C288 350 266 384 240 404 L216 396 C240 372 256 340 258 306 C260 260 252 214 240 184 Z"/>';
    return '<ellipse cx="200" cy="586" rx="150" ry="9" fill="#000" opacity=".35"/>' +
      '<rect x="116" y="452" width="168" height="8" rx="4" fill="#2a3566" opacity=".8"/>' +
      '<defs><g id="' + p + 'bA">' + torso + '</g><g id="' + p + 'bB">' + arms + '</g></defs>' +
      '<use href="#' + p + 'bA" fill="#8095dc" stroke="#8095dc" stroke-width="5" stroke-linejoin="round"/>' +
      '<use href="#' + p + 'bA" fill="#1c2756"/>' +
      '<use href="#' + p + 'bB" fill="#98acee" stroke="#98acee" stroke-width="4" stroke-linejoin="round"/>' +
      '<use href="#' + p + 'bB" fill="#2b3a74"/>';
  };

  /* Подпись с выноской: x,y — куда указывает; lx,ly — где текст; a — выравнивание */
  A.lbl = function (txt, x, y, lx, ly, a) {
    return '<g class="sl"><line x1="' + x + '" y1="' + y + '" x2="' + (a === 'end' ? lx + 4 : lx - 4) + '" y2="' + ly + '"/>' +
      '<text x="' + lx + '" y="' + (ly + 4) + '" text-anchor="' + (a || 'start') + '">' + D.esc(txt) + '</text></g>';
  };

  /* Огненный шар центра */
  A.sphere = function (p, cx, cy, r) {
    r = r || 17;
    return '<g class="pop"><g class="gv">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 2.2) + '" fill="url(#' + p + 'H)"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#' + p + 'S)" filter="url(#' + p + 'G)"/></g></g>';
  };

  A.svg = function (vb, inner, cls) {
    return '<svg class="scene ' + (cls || '') + '" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" focusable="false">' + inner + '</svg>';
  };
})(window);
