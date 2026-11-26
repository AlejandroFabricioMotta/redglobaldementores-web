/* BookStore RGM · ficha de una obra (página propia). El contenido estático lo genera build_site.py; acá se activan
   los botones según lo que el lector tiene, los idiomas, las obras relacionadas y la compra/lectura de demostración. */
(function () {
  'use strict';
  var K = window.BK, $ = K.$, esc = K.esc, id = document.body.getAttribute('data-obra'), w = K.byId[id];
  if (!w) return;
  K.seeOne(id);
  var DEFAULT = 'https://www.holdingmentors.com/category/all-products';
  function pintar() {
    var mio = K.isOwned(id), acc = '';
    if (mio) acc = '<button type="button" class="boton" data-leer="' + esc(id) + '">Leer ahora</button>';
    else {
      if (K.LIVE && w.precio > 0 && !K.esGratis(w)) acc = '<button type="button" class="boton" data-comprar="' + esc(id) + '">Comprar · US$ ' + K.precioFinal(w) + '</button>';
      else acc = '<a class="boton" href="' + esc(w.url || DEFAULT) + '" target="_blank" rel="noopener">' + (K.esGratis(w) ? 'Obtener gratis' : 'Comprar') + '</a>';
      if (K.DEMO) acc += '<button type="button" class="boton secundario" data-simular>Simular compra (demo)</button>';
    }
    if (mio && K.DEMO) acc += '<button type="button" class="boton secundario" data-quitar>Quitar de mi biblioteca (demo)</button>';
    $('bkAcc').innerHTML = acc;
    // un botón por idioma; el que no existe queda gris "próximamente" (criterio de las webs RGM)
    $('bkIdiomas').innerHTML = ['es', 'pt', 'en'].map(function (k) {
      var ok = w.idioma === k || w.idioma === 'multi', n = K.IDI[k];
      if (!ok) return '<button type="button" class="bk-idi" disabled title="Este idioma todavía no está disponible">' + n + ' · próximamente</button>';
      return mio ? '<button type="button" class="bk-idi" data-leer="' + esc(id) + '">' + n + '</button>' : '<button type="button" class="bk-idi" disabled title="Disponible después de la compra">' + n + '</button>';
    }).join('');
    $('bkAviso').textContent = 'Se lee en línea dentro de la web, sin descarga.' + (mio ? '' : ' Los idiomas se habilitan al comprar.');
    K.misCount();
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-comprar]')) { e.target.closest('[data-comprar]').disabled = true; K.comprar(id); }
    else if (e.target.closest('[data-simular]')) { K.buy(id); pintar(); }
    else if (e.target.closest('[data-quitar]')) { K.unbuy(id); pintar(); }
  });
  pintar();
  document.addEventListener('bk-mis', pintar);
  // relacionadas: mismo autor, mismas etiquetas o mismo idioma (sin repetir la obra)
  var rel = K.CAT.filter(function (x) { return x.id !== id; }).map(function (x) {
    var s = 0; x.tags.forEach(function (t) { if (w.tags.indexOf(t) >= 0) s += 2; }); if (w.autor && x.autor === w.autor) s += 3; if (x.idioma === w.idioma) s += 0.5; return { x: x, s: s };
  }).filter(function (o) { return o.s > 1; }).sort(function (a, b) { return b.s - a.s || a.x._i - b.x._i; }).slice(0, 8).map(function (o) { return o.x; });
  var box = $('bkRel'); if (box) { if (rel.length) box.innerHTML = rel.map(K.card).join(''); else box.parentNode.hidden = true; }
})();
