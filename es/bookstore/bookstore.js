/* BookStore RGM · página principal (tienda): recomendados, filtros por etiqueta/autor/idioma, buscador y orden. Usa bk-core.js */
(function () {
  'use strict';
  var K = window.BK, $ = K.$, CAT = K.CAT, esc = K.esc, norm = K.norm, cmp = K.cmp, Q = new URLSearchParams(location.search), PAGE = 24;
  var S = { q: Q.get('q') || '', tag: Q.get('tag') || '', autor: Q.get('autor') || '', idioma: Q.get('idioma') || '', orden: Q.get('orden') || 'recomendados', n: PAGE };
  function pushUrl() {
    var p = new URLSearchParams(); ['q', 'tag', 'autor', 'idioma'].forEach(function (k) { if (S[k]) p.set(k, S[k]); });
    if (S.orden !== 'recomendados') p.set('orden', S.orden); if (K.DEMO) p.set('demo', '1');
    var s = p.toString(); try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '')); } catch (e) {}
  }
  function filtrar() {
    var q = norm(S.q).split(/\s+/).filter(Boolean);
    return CAT.filter(function (w) {
      if (S.tag && w.tags.indexOf(S.tag) < 0) return false;
      if (S.autor === '_sin' ? !!w.autor : (S.autor && w.autor !== S.autor)) return false;
      if (S.idioma && w.idioma !== S.idioma) return false;
      for (var i = 0; i < q.length; i++) if (w._q.indexOf(q[i]) < 0) return false;
      return true;
    });
  }
  function ordenar(a) {
    var r = a.slice();
    if (S.orden === 'az') r.sort(function (x, y) { return cmp(x.titulo, y.titulo); });
    else if (S.orden === 'za') r.sort(function (x, y) { return cmp(y.titulo, x.titulo); });
    else if (S.orden === 'ranking') r.sort(function (x, y) { return y._v - x._v || x._i - y._i; });
    return r;
  }
  function llenarSelects() {
    var ac = {}, ic = {}, sin = 0;
    CAT.forEach(function (w) { if (w.autor) ac[w.autor] = (ac[w.autor] || 0) + 1; else sin++; ic[w.idioma] = (ic[w.idioma] || 0) + 1; });
    var h = '<option value="">Todos los autores</option>' + Object.keys(ac).sort(cmp).map(function (a) { return '<option value="' + esc(a) + '">' + esc(a) + ' (' + ac[a] + ')</option>'; }).join('');
    if (sin) h += '<option value="_sin">Autoría por confirmar (' + sin + ')</option>';
    $('bkAutor').innerHTML = h;
    $('bkIdioma').innerHTML = '<option value="">Todos los idiomas</option>' + ['es', 'pt', 'en', 'multi'].filter(function (k) { return ic[k]; }).map(function (k) { return '<option value="' + k + '">' + K.IDI[k] + ' (' + ic[k] + ')</option>'; }).join('');
    $('bkQ').value = S.q; $('bkAutor').value = S.autor; $('bkIdioma').value = S.idioma; $('bkOrden').value = S.orden;
  }
  var abierta = false;
  function nube() {
    var cnt = {}; CAT.forEach(function (w) { w.tags.forEach(function (t) { cnt[t] = (cnt[t] || 0) + 1; }); });
    var list = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a] || cmp(a, b); }), h = '';
    list.slice(0, abierta ? list.length : 18).forEach(function (t) { h += '<a href="#" data-tag="' + esc(t) + '"' + (S.tag === t ? ' aria-current="true"' : '') + '>#' + esc(t) + ' <small>' + cnt[t] + '</small></a>'; });
    if (list.length > 18) h += '<button type="button" id="bkMasTags">' + (abierta ? 'Ver menos' : 'Ver más temas') + '</button>';
    $('bkNube').innerHTML = h;
  }
  function render() {
    var res = ordenar(filtrar());
    $('bkGrilla').innerHTML = res.slice(0, S.n).map(K.card).join('');
    var old = $('bkMas'); if (old) old.remove();
    if (res.length > S.n) { var b = document.createElement('button'); b.type = 'button'; b.id = 'bkMas'; b.className = 'boton secundario bk-mas'; b.textContent = 'Mostrar más (' + (res.length - S.n) + ')'; $('bkGrilla').after(b); }
    $('bkVacio').hidden = res.length > 0;
    $('bkCuenta').textContent = res.length + (res.length === 1 ? ' obra' : ' obras') + ' de ' + CAT.length;
    $('bkLimpiar').hidden = !(S.q || S.tag || S.autor || S.idioma);
    nube(); pushUrl();
  }
  function recomendados() {
    var r = K.recomendar(12), l = r.list, vol = 'Para ti', tit = 'Recomendados según tus lecturas';
    if (!r.personal) { l = K.masVendidas(12); vol = 'Recomendados'; tit = K.DEMO ? 'Los más vendidos' : 'Para empezar'; }
    $('bkRecVol').textContent = vol; $('bkRecT').textContent = tit; $('bkCarrusel').innerHTML = l.map(K.card).join('');
  }
  document.addEventListener('click', function (e) {
    var t = e.target, c;
    if ((c = t.closest('[data-tag]'))) { e.preventDefault(); S.tag = S.tag === c.getAttribute('data-tag') ? '' : c.getAttribute('data-tag'); S.n = PAGE; render(); return; }
    if (t.closest('#bkMasTags')) { abierta = !abierta; nube(); return; }
    if (t.closest('#bkMas')) { S.n += PAGE; render(); return; }
    if (t.closest('#bkLimpiar')) { S.q = S.tag = S.autor = S.idioma = ''; S.n = PAGE; llenarSelects(); render(); }
  });
  $('bkQ').addEventListener('input', function () { S.q = this.value; S.n = PAGE; render(); });
  $('bkAutor').addEventListener('change', function () { S.autor = this.value; S.n = PAGE; render(); });
  $('bkIdioma').addEventListener('change', function () { S.idioma = this.value; S.n = PAGE; render(); });
  $('bkOrden').addEventListener('change', function () { S.orden = this.value; S.n = PAGE; render(); });
  $('bkPrev').addEventListener('click', function () { $('bkCarrusel').scrollBy({ left: -360, behavior: 'smooth' }); });
  $('bkNext').addEventListener('click', function () { $('bkCarrusel').scrollBy({ left: 360, behavior: 'smooth' }); });
  llenarSelects(); render(); recomendados();
})();
