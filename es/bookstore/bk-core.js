/* BookStore RGM · núcleo compartido por todas las páginas (tienda, ficha, autores, colecciones, Mis libros).
   Datos: window.BOOKSTORE_CATALOG (catalog.js). Rutas: <body data-base="../"> = camino hasta la raíz del BookStore.
   Biblioteca/compras/lector: SIMULADOS con ?demo=1 hasta conectar inicio de sesión + Stripe + servicio del lector. */
(function () {
  'use strict';
  var BASE = document.body.getAttribute('data-base') || '';
  var CAT = (window.BOOKSTORE_CATALOG || []).slice();
  var DEMO = new URLSearchParams(location.search).get('demo') === '1' || (function () { try { return localStorage.getItem('bk_demo') === '1'; } catch (e) { return false; } })();
  try { if (new URLSearchParams(location.search).get('demo') === '1') localStorage.setItem('bk_demo', '1'); } catch (e) {}
  // ----- compra real (Stripe + Worker). Oculta: se activa con ?compra=1 y se apaga con ?compra=0 -----
  var API = 'https://claude-rgm.alejandrofabriciomotta.workers.dev';
  (function () { try { var c = new URLSearchParams(location.search).get('compra'); if (c === '1') localStorage.setItem('bk_compra', '1'); if (c === '0') localStorage.removeItem('bk_compra'); } catch (e) {} })();
  var LIVE = (function () { try { return localStorage.getItem('bk_compra') === '1'; } catch (e) { return false; } })();
  (function () { var m = /#acceso=([^&]+)/.exec(location.hash); if (m) { try { localStorage.setItem('bk_sesion', m[1]); } catch (e) {} try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} } })();
  function token() { try { return localStorage.getItem('bk_sesion') || ''; } catch (e) { return ''; } }
  function api(path, o) { o = o || {}; o.headers = o.headers || {}; var t = token(); if (t && !o.headers.Authorization) o.headers.Authorization = 'Bearer ' + t; return fetch(API + path, o); }
  var IDI = { es: 'Español', pt: 'Português', en: 'English', multi: 'Multi-idioma' };
  var TIPOS = ['Manuales y Guías', 'Antologías', 'Magazines', 'Mentores Expertos'];
  var LBL = { 'Manuales y Guías': 'Manual o Guía', 'Antologías': 'Antología', 'Magazines': 'Magazine', 'Mentores Expertos': 'Libro · Mentor Experto', 'Libros': 'Libro' };
  var PAL = { 'Manuales y Guías': ['#5b4a3a', '#3A3129'], 'Antologías': ['#7A6652', '#4b3f33'], 'Magazines': ['#8a6f55', '#5b4a3a'], 'Mentores Expertos': ['#6a5845', '#3A3129'], 'Libros': ['#7a5f45', '#3d3128'] };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); };
  var cmp = function (a, b) { return a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true }); };
  var slug = function (s) { return norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  function get(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var S = { owned: DEMO ? get('bk_owned', []) : [], seen: get('bk_vistos', []) };

  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  var byId = {};
  CAT.forEach(function (w, i) { w._i = i; w._v = (w.ventas || 0) || (DEMO ? hash(w.id) % 240 : 0); w._q = norm([w.titulo, w.autor, w.tags.join(' '), IDI[w.idioma]].join(' ')); byId[w.id] = w; });

  function precioFinal(w) { return w.oferta != null ? w.oferta : w.precio; }
  function esGratis(w) { return w.oferta === 0 || w.precio === 0; }
  function precioHtml(w) {
    if (w.precio == null) return '<p class="bk-precio">Precio a confirmar</p>';
    if (esGratis(w)) return '<p class="bk-precio">' + (w.precio ? '<s>US$ ' + w.precio + '</s>' : '') + 'Gratis</p>';
    if (w.oferta != null) return '<p class="bk-precio"><s>US$ ' + w.precio + '</s>US$ ' + w.oferta + '</p>';
    return '<p class="bk-precio">US$ ' + w.precio + '</p>';
  }
  function tipoDe(w) { for (var i = 0; i < TIPOS.length; i++) if (w.tags.indexOf(TIPOS[i]) >= 0) return TIPOS[i]; return 'Libros'; }
  function isOwned(id) { return S.owned.indexOf(id) >= 0; }
  function url(w) { return BASE + 'obra/' + w.id + '/'; }
  function autorUrl(a) { return BASE + 'autor/' + slug(a) + '/'; }
  function portada(w, ins) {
    var tipo = tipoDe(w), c = PAL[tipo] || PAL.Libros, b = '';
    if (ins) {
      if (isOwned(w.id)) b = '<span class="bk-ins--mio">En tu biblioteca</span>';
      else if (esGratis(w)) b = '<span>Gratis</span>';
      else if (w.oferta != null) b = '<span class="bk-ins--of">Oferta</span>';
    }
    var cuerpo = w.portada ? '<img src="' + esc(BASE + w.portada) + '" alt="Portada de ' + esc(w.titulo) + '" loading="lazy">'
      : '<div class="bk-gen" style="--g1:' + c[0] + ';--g2:' + c[1] + '"><small>' + esc(LBL[tipo]) + '</small><b>' + esc(w.titulo) + '</b><i></i></div>';
    return '<div class="bk-portada">' + cuerpo + (b ? '<div class="bk-ins">' + b + '</div>' : '') + '</div>';
  }
  function card(w) {
    return '<a class="bk-card" href="' + esc(url(w)) + '" data-id="' + esc(w.id) + '">' + portada(w, true) + '<h3 class="bk-titulo">' + esc(w.titulo) + '</h3>' +
      '<p class="bk-meta">' + esc(w.autor || 'Autoría por confirmar') + '</p><p class="bk-meta">' + esc(IDI[w.idioma]) + '</p>' + precioHtml(w) + '</a>';
  }
  function seeOne(id) { S.seen = [id].concat(S.seen.filter(function (x) { return x !== id; })).slice(0, 12); set('bk_vistos', S.seen); }
  function buy(id) { if (!isOwned(id)) S.owned.push(id); set('bk_owned', S.owned); }
  function unbuy(id) { S.owned = S.owned.filter(function (x) { return x !== id; }); set('bk_owned', S.owned); }

  // ----- recomendados por TAGs, autor e idioma de lo que el lector tiene o miró -----
  function recomendar(max, excluir) {
    var base = S.owned.concat(S.seen).map(function (id) { return byId[id]; }).filter(Boolean), tg = {}, au = {}, id_ = {};
    base.forEach(function (w, i) { var p = i < S.owned.length ? 3 : 1; w.tags.forEach(function (t) { tg[t] = (tg[t] || 0) + p; }); if (w.autor) au[w.autor] = (au[w.autor] || 0) + p; id_[w.idioma] = (id_[w.idioma] || 0) + p; });
    var ex = (excluir || []).concat(S.owned);
    var l = CAT.filter(function (w) { return ex.indexOf(w.id) < 0; }).map(function (w) { var s = 0; w.tags.forEach(function (t) { s += (tg[t] || 0) * 2; }); return { w: w, s: s + (au[w.autor] || 0) + (id_[w.idioma] || 0) * 0.5 }; })
      .filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s || b.w._v - a.w._v || a.w._i - b.w._i; }).slice(0, max || 12).map(function (x) { return x.w; });
    return { personal: base.length > 0 && l.length > 0, list: l };
  }
  function masVendidas(max, excluir) {
    return CAT.filter(function (w) { return w.precio != null && (excluir || []).indexOf(w.id) < 0; }).sort(function (a, b) { return b._v - a._v || a._i - b._i; }).slice(0, max || 12);
  }

  // ----- lector protegido (demostración) -----
  function ensureLector() {
    if ($('bkLector')) return;
    var d = document.createElement('dialog'); d.id = 'bkLector'; d.className = 'bk-lector'; d.setAttribute('aria-label', 'Lector');
    d.innerHTML = '<div class="bk-lector__barra"><b id="bkLectorT"></b><span class="bk-lector__ay">Lectura en línea · sin descarga</span><button type="button" class="bk-cerrar" aria-label="Cerrar lector">×</button></div><div class="bk-lector__hoja" id="bkLectorHoja"></div>';
    document.body.appendChild(d);
    d.querySelector('.bk-cerrar').addEventListener('click', function () { d.close(); });
    ['contextmenu', 'copy', 'cut', 'dragstart'].forEach(function (ev) { d.addEventListener(ev, function (e) { e.preventDefault(); }); });
    document.addEventListener('keydown', function (e) { if (d.open && (e.ctrlKey || e.metaKey) && /^[ps]$/i.test(e.key)) e.preventDefault(); });
  }
  function leer(id) {
    var w = byId[id]; if (!w || !isOwned(id)) return; if (LIVE) return leerReal(w); ensureLector();
    var user = DEMO ? 'lector.demo@rgm.org' : 'lector@rgm.org', m = [];
    for (var i = 0; i < 59; i++) m.push('<span>' + esc(user) + '</span>');
    var pag = function (n) { return '<article class="bk-pag"><div class="bk-marca" aria-hidden="true">' + m.join('') + '</div><h3>' + esc(w.titulo) + '</h3><p><b>Página ' + n + '</b></p><p>Vista de demostración del lector. En la versión real, las páginas se entregan una a una desde el servidor, solo a quien compró la obra, con la marca de agua del lector y sin enlace ni botón de descarga.</p><p>Se desactivan el menú contextual, la selección de texto y la impresión. Ningún navegador puede impedir al 100% una captura de pantalla, pero la marca de agua deja identificado a quien la haga.</p></article>'; };
    $('bkLectorT').textContent = w.titulo; $('bkLectorHoja').innerHTML = pag(1) + pag(2) + pag(3); $('bkLector').showModal();
  }
  document.addEventListener('click', function (e) { var c = e.target.closest && e.target.closest('[data-leer]'); if (c) leer(c.getAttribute('data-leer')); });

  // ----- compra real -----
  var EMAIL = '';
  function cargarMis() {
    if (!LIVE || !token()) return Promise.resolve();
    return api('/api/libros/mis').then(function (r) { if (r.status === 401) { try { localStorage.removeItem('bk_sesion'); } catch (e) {} return null; } return r.json(); })
      .then(function (j) { if (j && j.ok) { S.owned = j.obras; EMAIL = j.email; } misCount(); document.dispatchEvent(new Event('bk-mis')); }).catch(function () {});
  }
  function comprar(id) {
    return api('/api/libros/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id }) }).then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.ok && j.url) location.href = j.url; else alert('No se pudo iniciar el pago. Intenta de nuevo en unos minutos.'); }).catch(function () { alert('No se pudo iniciar el pago. Intenta de nuevo en unos minutos.'); });
  }
  function pdfjs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return new Promise(function (ok, ko) { var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; ok(window.pdfjsLib); }; s.onerror = ko; document.head.appendChild(s); });
  }
  function leerReal(w) {
    ensureLector(); var hoja = $('bkLectorHoja'); $('bkLectorT').textContent = w.titulo; hoja.innerHTML = '<p class="bk-cargando">Cargando…</p>'; $('bkLector').showModal();
    Promise.all([pdfjs(), api('/api/libros/archivo?id=' + encodeURIComponent(w.id)).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })])
      .then(function (x) { return x[0].getDocument({ data: x[1] }).promise; })
      .then(function (doc) {
        hoja.innerHTML = ''; var ancho = Math.min(hoja.clientWidth - 24 || 800, 900), mk = [];
        for (var i = 0; i < 40; i++) mk.push('<span>' + esc(EMAIL) + '</span>');
        function pagina(n) {
          if (n > doc.numPages) return;
          doc.getPage(n).then(function (pg) {
            var v0 = pg.getViewport({ scale: 1 }), sc = ancho / v0.width, v = pg.getViewport({ scale: sc * (window.devicePixelRatio || 1) });
            var d = document.createElement('div'); d.className = 'bk-pdfpag'; d.style.width = ancho + 'px';
            var c = document.createElement('canvas'); c.width = v.width; c.height = v.height; c.style.width = ancho + 'px'; c.style.height = (v.height / (window.devicePixelRatio || 1)) + 'px';
            d.appendChild(c); var m = document.createElement('div'); m.className = 'bk-marca'; m.setAttribute('aria-hidden', 'true'); m.innerHTML = mk.join(''); d.appendChild(m); hoja.appendChild(d);
            return pg.render({ canvasContext: c.getContext('2d'), viewport: v }).promise.then(function () { pagina(n + 1); });
          });
        }
        pagina(1);
      }).catch(function () { hoja.innerHTML = '<p class="bk-cargando">No se pudo abrir el libro. Si recién lo compraste, intenta de nuevo en un momento.</p>'; });
  }

  // ----- grillas generadas por las páginas estáticas: <div class="bk-grilla" data-ids="a,b,c"> -----
  function hidratarGrillas() {
    document.querySelectorAll('[data-ids]').forEach(function (g) {
      g.innerHTML = g.getAttribute('data-ids').split(',').map(function (id) { return byId[id]; }).filter(Boolean).map(card).join('');
    });
  }
  function misCount() { var n = $('bkMisN'); if (n) n.textContent = S.owned.filter(function (id) { return byId[id]; }).length; }

  window.BK = { LIVE: LIVE, API: API, api: api, token: token, cargarMis: cargarMis, comprar: comprar, BASE: BASE, CAT: CAT, byId: byId, DEMO: DEMO, S: S, IDI: IDI, LBL: LBL, $: $, esc: esc, norm: norm, cmp: cmp, slug: slug, precioHtml: precioHtml, esGratis: esGratis, precioFinal: precioFinal,
    tipoDe: tipoDe, isOwned: isOwned, url: url, autorUrl: autorUrl, portada: portada, card: card, seeOne: seeOne, buy: buy, unbuy: unbuy, recomendar: recomendar, masVendidas: masVendidas, leer: leer, hidratarGrillas: hidratarGrillas, misCount: misCount };
  document.addEventListener('DOMContentLoaded', function () { hidratarGrillas(); misCount(); cargarMis(); });
  if (document.readyState !== 'loading') { hidratarGrillas(); misCount(); cargarMis(); }
})();
