/* RGM+ · Portal. Un solo portal para los 3 idiomas (interfaz, subtítulos y audio).
   Cada URL es una página real (carpeta con index.html) generada por tools/build_pages.py;
   este script dibuja el contenido según <body data-page data-key data-base>. */
(function () {
  var C = window.RGM_CONFIG, I18N = window.RGM_I18N, CAT = window.RGM_CATALOG;
  var $app = document.getElementById('app');
  var BODY = document.body.dataset, PAGE = BODY.page, KEY = BODY.key || '', BASE = BODY.base || '';
  var LS = { get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
             set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  var params = new URLSearchParams(location.search);

  // ---------- estado ----------
  var lang = (function () {
    var q = params.get('lang'); if (C.languages.indexOf(q) >= 0) return q;
    var s = LS.get('rgm.lang'); if (s) return s;
    var b = (navigator.language || '').slice(0, 2); return C.languages.indexOf(b) >= 0 ? b : C.defaultLang;
  })();
  var user = LS.get('rgm.user', null);
  var saved = LS.get('rgm.saved', []), liked = LS.get('rgm.liked', []);
  var prefs = LS.get('rgm.prefs', {});
  var destroyPlayer = null, slideTimer = null, cur = 0;

  var t = function () { return I18N[lang]; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var f = function (s, o) { return String(s).replace(/\{(\w+)\}/g, function (_, k) { return o[k] == null ? '' : o[k]; }); };
  var byId = function (arr, id) { return arr.filter(function (x) { return x.id === id; })[0]; };
  var res = function (p) { return p && !/^(https?:|\/|data:)/.test(p) ? BASE + p : p; };
  var secName = function (id) { return I18N._sec[id][lang]; };
  var catName = function (id) { return id && I18N._cat[id] ? I18N._cat[id][lang] : ''; };
  var catCrumb = function (id) { return id && I18N._cat[id] ? ' › <a href="' + U.category(id) + '">' + esc(catName(id)) + '</a>' : ''; };
  var author = function (id) { return byId(CAT.authors, id); };
  var title = function (v) { return v.title[lang] || v.title[v.orig]; };
  var url = function (u) { return u.replace('{lang}', lang); };
  var initials = function (n) { return n.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join(''); };
  // direcciones de cada página
  var U = {
    home: function () { return BASE || './'; },
    section: function (id) { return BASE + byId(CAT.sections, id).path + '/'; },
    category: function (id) { return BASE + byId(CAT.categories, id).path + '/'; },
    watch: function (id) { return BASE + 'Watch/?v=' + id; },
    author: function (id) { return BASE + 'Author/?a=' + id; },
    collection: function (id) { return BASE + 'Collection/?c=' + id; },
    faq: function () { return BASE + 'FAQ/'; }
  };
  var ICON = {
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 4v16M4 12h16"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M4 12l5 5L20 6"/></svg>',
    like: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 10h4v11H2zM8 21V10l4-8c1.5 0 2.5 1 2.5 2.5L14 9h6a2 2 0 012 2.3l-1.5 8A2 2 0 0118.5 21z"/></svg>',
    share: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-4M8.2 13l7.6 4"/></svg>',
    l: function (n) { return '<svg width="' + n + '" height="' + n + '" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M15 5l-7 7 7 7"/></svg>'; },
    r: function (n) { return '<svg width="' + n + '" height="' + n + '" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M9 5l7 7-7 7"/></svg>'; }
  };

  // ---------- imágenes ----------
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function art(v) {
    if (v.thumb) return "background-image:url('" + res(v.thumb) + "')";
    var n = hash(v.id), hue = [275, 285, 265, 295][n % 4], l2 = 18 + (n % 12);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + hue + ',85%,' + (l2 + 16) + '%)"/><stop offset="1" stop-color="hsl(' + (hue - 20) + ',90%,' + l2 + '%)"/></linearGradient></defs><rect width="160" height="100" fill="url(#g)"/></svg>';
    return "background-image:url('data:image/svg+xml;utf8," + encodeURIComponent(svg) + "')";
  }
  function avatar(a, size) {
    var st = 'width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size / 2.6) + 'px';
    if (a.photo) return '<img class="av" style="' + st + ';object-fit:cover" src="' + res(a.photo) + '" alt="' + esc(a.name) + '">';
    return '<span class="av av-logo" style="' + st + '" aria-hidden="true"><img src="' + res('assets/rgm-rings.svg') + '" alt=""></span>';
  }
  function dur(sec) {
    var T = t(), h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60, o = [];
    if (h) o.push(h + ' ' + T.hour); if (m) o.push(m + ' ' + T.min); if (!h && s) o.push(s + ' s');
    return o.join(' ');
  }
  function dateFmt(d) { return new Date(d + 'T12:00:00').toLocaleDateString(t().locale, { day: 'numeric', month: 'long', year: 'numeric' }); }
  function resolved(v) { // copia con rutas ajustadas a la profundidad de esta página
    var c = Object.assign({}, v); c.video = res(v.video); c.thumb = res(v.thumb);
    c.dub = {}; Object.keys(v.dub).forEach(function (l) { c.dub[l] = res(v.dub[l]); });
    c.subs = {}; Object.keys(v.subs).forEach(function (l) { c.subs[l] = res(v.subs[l]); });
    return c;
  }

  // ---------- piezas ----------
  function langButtons() {
    return C.languages.map(function (l) { return '<button data-lang="' + l + '" aria-pressed="' + (l === lang) + '" aria-label="' + I18N[l].langName[l] + '">' + l.toUpperCase() + '</button>'; }).join('');
  }
  function statusBar() {
    var T = t();
    return '<div class="status"><div class="wrap"><div class="grp"><div class="langs" role="group" aria-label="Idioma / Language">' + langButtons() + '</div>' +
      (C.previewMode && !C.gateActivo ? '<span class="chip">' + T.preview + '</span>' : '') + '</div><div class="grp estado" id="estado-cuenta"></div></div></div>';
  }
  // Estado de la cuenta (plan y fecha), solo con el acceso real activo. Lo completa el bloque de config.js.
  function pintarEstado() {
    var el = document.getElementById('estado-cuenta'), E = window.RGM_ESTADO;
    if (!el || !C.gateActivo || !E || !E.vence) return;
    var T = t(), d = new Date(E.vence * 1000).toLocaleDateString(T.locale, { day: 'numeric', month: 'long', year: 'numeric' }), txt;
    if (E.plan === 'miembro') txt = T.estMiembro;
    else if (E.renueva === false) txt = T.estCancelada.replace('{p}', E.plan === 'anual' ? T.planAnual : T.planMensual);
    else txt = E.plan === 'anual' ? T.estAnual : T.estMensual;
    el.innerHTML = '<span>' + esc(txt.replace('{d}', d)) + '</span><button type="button" class="link" data-act="logout">' + esc(T.cerrarSesion) + '</button>';
  }
  window.addEventListener('rgm-estado', pintarEstado);
  function header() {
    return '<header class="head"><div class="wrap"><a class="logo" href="' + U.home() + '" aria-label="RGM+"><img src="' + BASE + 'assets/logo-white.svg" alt="RGM+"></a>' +
      '<div class="tag"><b>RGM Plus</b> · ' + esc(t().tagline) + '</div></div></header>';
  }
  function nav() {
    var T = t();
    var items = '<a href="' + U.home() + '"' + (PAGE === 'home' ? ' aria-current="page"' : '') + '>' + T.home + '</a>' +
      CAT.sections.map(function (s) { return '<a href="' + U.section(s.id) + '"' + (PAGE === 'section' && KEY === s.id ? ' aria-current="page"' : '') + '>' + esc(secName(s.id)) + '</a>'; }).join('');
    return '<nav class="nav" aria-label="' + T.sectionsNav + '"><div class="wrap">' + items + '</div></nav>';
  }
  function chips(active) {
    var T = t();
    return '<div class="wrap"><div class="chips" aria-label="' + T.categories + '"><span class="lbl">' + T.categories + '</span>' +
      CAT.categories.map(function (c) { return '<a href="' + U.category(c.id) + '"' + (active === c.id ? ' aria-current="page"' : '') + '>' + esc(catName(c.id)) + '</a>'; }).join('') + '</div></div>';
  }
  function footer() {
    var T = t();
    var sites = C.sites.map(function (s) { var x = T.sites[s.key]; return '<a class="site" href="' + esc(url(s.url)) + '" target="_blank" rel="noopener"><b>' + esc(x[0]) + '</b><small>' + esc(x[1]) + '</small></a>'; }).join('');
    return '<footer class="foot"><div class="wrap"><h2>' + esc(T.rgmName) + ' · <b>' + T.sitesTitle + '</b></h2><div class="sites">' + sites + '</div>' +
      '<a class="back" href="' + esc(url(C.backUrl)) + '">← ' + esc(T.back) + '</a>' +
      '<div class="contact"><div><b>' + esc(T.rgmName) + '</b><br>info@RGMentores.ORG · WApp +54 9 341 5421624<br>Av. Fuerza Aérea 3104, Rosario, Santa Fe, Argentina</div>' +
      '<div><b>Holding Mentors LLC</b> ' + esc(T.hmRole) + '<br>info@HoldingMentors.com · WApp +1 954 658 4206<br>40 SW 13th ST, Suite 102, Miami, Florida (33031), USA</div></div>' +
      '<p class="copy">' + esc(T.copyright) + '</p></div></footer>';
  }
  function langFull(l) { return (I18N[l] && I18N[l].langName && I18N[l].langName[l] ? I18N[l].langName[l] : l).toUpperCase(); }
  // tarjeta limpia (solo imagen + idioma); la información va al pie
  function card(v) {
    return '<a class="card wide" href="' + U.watch(v.id) + '" aria-label="' + esc(title(v)) + '"><span class="art" style="' + art(v) + '"></span>' +
      '<span class="lang">' + langFull(v.orig) + '</span></a>';
  }
  function vitem(v) {
    var a = author(v.author);
    return '<div class="item vi">' + card(v) + '<div class="t">' + esc(title(v)) + '<span class="d">' + esc(a.name) + ' · ' + esc(secName(v.section)) + ' · ' + esc(dateFmt(v.date)) + '</span></div></div>';
  }
  // tarjeta vertical de una colección (portada en formato 9:16)
  function collCard(c) {
    var n = CAT.videos.filter(function (v) { return v.collection === c.id; }).length, a = author(c.author);
    return '<div class="ci"><a class="card coll" href="' + U.collection(c.id) + '" aria-label="' + esc(c.title[lang]) + '"><span class="art" style="background-image:url(\'' + res(c.cover) + '\')"></span></a>' +
      '<a class="t" href="' + U.collection(c.id) + '">' + esc(c.title[lang]) + '<span class="d">' + f(t().episodesN, { n: n }) + ' · ' + esc(a.name) + '</span></a></div>';
  }
  function collsWhere(fn) {
    var n = (params.get('q') || '').toLowerCase().trim();
    return CAT.collections.filter(fn).filter(function (c) { return !n || [c.title[lang], author(c.author).name, catName(c.category), secName(c.section)].join(' ').toLowerCase().indexOf(n) >= 0; });
  }
  function row(name, vids, allHref, fn) {
    return '<section class="row"><div class="wrap"><div class="top"><h3>' + esc(name) + '</h3><div class="nv"><button data-scroll="-1" aria-label="' + t().prev + '">' + ICON.l(14) + '</button><button data-scroll="1" aria-label="' + t().next + '">' + ICON.r(14) + '</button></div></div>' +
      '<div class="rowbody' + (allHref ? '' : ' solo') + '"><div class="track">' + vids.map(fn || vitem).join('') + '</div>' + (allHref ? '<a class="card all" href="' + allHref + '">' + t().viewAll + '</a>' : '') + '</div></div></section>';
  }
  function page(inner) { return statusBar() + header() + nav() + '<main>' + inner + '</main>' + footer(); }
  function grid(vids) {
    if (!vids.length) return '<p class="empty">' + t().noResults + '</p>';
    return '<div class="grid">' + vids.map(vitem).join('') + '</div>';
  }
  function searchBox() {
    var T = t(), q = params.get('q') || '';
    return '<form class="search" method="get" role="search"><input name="q" value="' + esc(q) + '" placeholder="' + esc(T.search) + '" aria-label="' + esc(T.search) + '"><button type="submit">' + T.searchBtn + '</button></form>';
  }
  function filterQ(vids) {
    var n = (params.get('q') || '').toLowerCase().trim(); if (!n) return vids;
    return vids.filter(function (v) {
      var hay = [title(v), author(v.author).name, v.others.join(' '), catName(v.category), secName(v.section), v.tags.map(function (g) { return I18N._tag[g][lang]; }).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(n) >= 0;
    });
  }

  // ---------- vistas ----------
  function viewLanding() {
    var T = t(), tiles = '';
    for (var i = 0; i < 32; i++) {
      var n = hash('c' + i), img = C.collage[i % (C.collage.length || 1)];
      var bg = img ? 'background-image:url(' + res(img) + ')' : 'background:linear-gradient(135deg,hsl(' + (270 + n % 30) + ',80%,' + (30 + n % 22) + '%),hsl(' + (285 + n % 20) + ',85%,' + (22 + n % 20) + '%))';
      tiles += '<div style="' + bg + ';' + (n % 5 === 0 ? 'grid-column:span 2' : '') + '"></div>';
    }
    return statusBar() + '<section class="landing"><div class="mosaic" aria-hidden="true">' + tiles + '</div>' +
      '<div class="panelbox"><a class="logo" href="' + U.home() + '"><img src="' + BASE + 'assets/logo-white.svg" alt="RGM+"></a>' +
      '<h1>' + f(T.heroTitle, { m: C.price.month }) + '</h1>' +
      '<div class="row2"><p>' + T.heroText + '</p><a class="btn" href="' + esc(C.subscribeUrl) + '" target="_blank" rel="noopener">' + T.start + '</a></div>' +
      '<p class="plans">' + f(T.plans, { m: C.price.month, y: C.price.year }) + '</p><p>' + T.langNote + '</p>' +
      '<div class="acc">' + T.haveAccount + ' <a href="#" data-act="signin">' + T.signIn + '</a></div>' +
      '<div class="g">' + T.orGoogle + ' <button data-act="signin">' + T.google + '</button></div></div></section>';
  }

  function viewHome() {
    var T = t(), feat = CAT.sections;
    // un slide por sección: promociona la sección y el botón lleva a ella (no a un video en particular)
    var slides = feat.map(function (s, i) {
      return '<div class="slide' + (i ? '' : ' on') + '"><div class="art bg" style="background-image:url(\'' + res('assets/img/slide-' + s.id + '.jpg') + '?v=2' + '\')"></div><div class="scrim"></div>' +
        '<div class="wrap txt"><span class="kick">RGM+</span><h2>' + esc(secName(s.id)) + '</h2><span class="meta">' + esc(I18N._secDesc[s.id][lang]) + '</span>' +
        '<a class="btn" href="' + U.section(s.id) + '">' + T.explore + '</a></div></div>';
    }).join('');
    var dots = feat.map(function (s, i) { return '<button data-slide="' + i + '" aria-label="' + f(T.slide, { n: i + 1 }) + '" aria-current="' + (i === 0) + '"></button>'; }).join('');
    var rows = '';
    // primer carrusel: Eventos o Colecciones (portadas verticales)
    if (CAT.collections.length) rows += row(T.collections, CAT.collections, '', collCard);
    if (saved.length) rows += row(T.myList, saved.map(function (id) { return byId(CAT.videos, id); }).filter(Boolean), '');
    CAT.sections.forEach(function (s) {
      var vids = CAT.videos.filter(function (v) { return v.section === s.id; });
      var rowTitle = s.id === 'masterclass' ? { es: 'MasterClass y más...', pt: 'MasterClass e mais...', en: 'MasterClass and more...' }[lang] : secName(s.id); // solo el título del carrusel, no el menú
      if (vids.length) rows += row(rowTitle, vids, U.section(s.id));
    });
    return page('<section class="hero" aria-label="' + T.featured + '">' + slides +
      '<button class="arr l" data-slide-step="-1" aria-label="' + T.prev + '">' + ICON.l(18) + '</button><button class="arr r" data-slide-step="1" aria-label="' + T.next + '">' + ICON.r(18) + '</button>' +
      '<div class="dots">' + dots + '</div></section><div style="padding-top:22px">' + chips('') + '</div>' + rows);
  }

  function collRow(fn) { var cs = collsWhere(fn); return cs.length ? '<div style="margin-bottom:36px">' + row(t().collections, cs, '', collCard) + '</div>' : ''; }
  function viewSection(id) {
    var vids = filterQ(CAT.videos.filter(function (v) { return v.section === id; }));
    return page('<div class="banner"><div class="pattern"></div><h1>' + esc(secName(id)) + '</h1></div><div style="padding-top:22px">' + chips('') + '</div><div class="wrap">' + searchBox() + '</div>' + collRow(function (c) { return c.section === id; }) + '<div class="wrap">' + grid(vids) + '</div>');
  }
  function viewCategory(id) {
    var vids = filterQ(CAT.videos.filter(function (v) { return v.category === id; }));
    return page('<div class="banner"><div class="pattern"></div><h1>' + esc(catName(id)) + '</h1></div><div style="padding-top:22px">' + chips(id) + '</div><div class="wrap">' + searchBox() + '</div>' + collRow(function (c) { return c.category === id; }) + '<div class="wrap">' + grid(vids) + '</div>');
  }
  function viewCollection(id) {
    var c = byId(CAT.collections, id); if (!c) return viewHome();
    var T = t(), a = author(c.author), eps = CAT.videos.filter(function (v) { return v.collection === id; }).sort(function (x, y) { return x.episode - y.episode; });
    return page('<div class="banner"><div class="pattern"></div><h1>' + esc(c.title[lang]) + '</h1></div>' +
      '<div class="wrap" style="padding-top:26px"><p class="where"><a href="' + U.section(c.section) + '">' + esc(secName(c.section)) + '</a>' + catCrumb(c.category) + '</p>' +
      '<p>' + esc(c.description[lang]) + '</p><p class="oth"><b>' + T.role + ':</b> <a href="' + U.author(a.id) + '">' + esc(a.name) + '</a> · ' + f(T.episodesN, { n: eps.length }) + '</p></div>' +
      '<div class="wrap" style="padding-top:20px">' + grid(eps) + '</div>');
  }
  function viewAuthor(id) {
    var a = author(id); if (!a) return viewHome();
    var T = t(), vids = CAT.videos.filter(function (v) { return v.author === id || v.others.indexOf(a.name) >= 0; });
    return page('<div class="banner author"><div class="pattern"></div><div class="who">' + avatar(a, 84) + '<div><h1>' + f(T.videosOf, { n: esc(a.name) }) + '</h1><p>' + esc(a.bio[lang]) + '</p></div></div></div>' +
      '<div class="wrap" style="padding-top:34px">' + grid(vids) + '</div>');
  }
  function viewWatch(id) {
    var v = byId(CAT.videos, id); if (!v) return viewHome();
    var T = t(), a = author(v.author), ln = T.langName, isSaved = saved.indexOf(id) >= 0, isLiked = liked.indexOf(id) >= 0;
    var tags = v.tags.map(function (g) { return '<a href="' + U.category(v.category) + '?q=' + encodeURIComponent(I18N._tag[g][lang]) + '">#' + esc(I18N._tag[g][lang]) + '</a>'; }).join('');
    var dubs = Object.keys(v.dub).map(function (l) { return ln[l]; }).join(', ');
    var coll = v.collection ? byId(CAT.collections, v.collection) : null;
    var more = CAT.videos.filter(function (x) { return coll ? x.collection === v.collection && x.id !== v.id : x.section === v.section && x.id !== v.id; });
    if (coll) more.sort(function (x, y) { return x.episode - y.episode; });
    var others = v.others.length ? '<p class="oth"><b>' + T.others + ':</b> ' + v.others.map(function (n) {
      var au = CAT.authors.filter(function (x) { return x.name === n; })[0]; return au ? '<a href="' + U.author(au.id) + '">' + esc(n) + '</a>' : esc(n); }).join(', ') + '</p>' : '';
    var inner = '<div class="wrap"><div class="watch"><div id="playerbox"></div>' +
      '<div class="info"><div><h1>' + esc(title(v)) + '</h1>' +
      '<div class="m"><span>' + dur(v.duration) + ' · ' + v.year + '</span><span class="ic">' +
        '<button data-act="save" data-id="' + id + '" aria-pressed="' + isSaved + '" title="' + (isSaved ? T.saved : T.save) + '" aria-label="' + T.save + '">' + (isSaved ? ICON.check : ICON.plus) + '</button>' +
        '<button data-act="like" data-id="' + id + '" aria-pressed="' + isLiked + '" title="' + T.like + '" aria-label="' + T.like + '">' + ICON.like + '</button>' +
        '<button data-act="share" data-id="' + id + '" title="' + T.share + '" aria-label="' + T.share + '">' + ICON.share + '</button></span></div>' +
      '<p class="where"><a href="' + U.section(v.section) + '">' + esc(secName(v.section)) + '</a>' + catCrumb(v.category) + '</p>' +
      '<p><b>' + T.description + ':</b> ' + esc(v.description[lang]) + '</p>' + others + '<div class="tags">' + tags + '</div>' +
      '<p class="avail">' + f(T.availLangs, { o: ln[v.orig], s: 'ES, PT, EN', d: dubs }) + '</p></div>' +
      '<aside class="author-box"><small>' + T.role + '</small>' + avatar(a, 56) + '<b>' + esc(a.name) + '</b><p>' + esc(a.bio[lang]) + '</p><a href="' + U.author(a.id) + '">' + T.allByAuthor + ' &gt;</a></aside></div></div></div>' +
      (more.length ? row(f(T.moreIn, { c: coll ? coll.title[lang] : secName(v.section) }), more, coll ? U.collection(coll.id) : U.section(v.section)) : '');
    return page(inner);
  }
  function viewFaq() {
    var T = t();
    return page('<div class="wrap"><div class="faq"><h1>' + T.faqTitle + '</h1>' + T.faqItems.map(function (q) {
      return '<details><summary>' + esc(q[0]) + '</summary><p>' + esc(f(q[1], { m: C.price.month, y: C.price.year })) + '</p></details>';
    }).join('') + '</div></div>');
  }

  // ---------- dibujo de la página ----------
  function render() {
    if (destroyPlayer) { destroyPlayer(); destroyPlayer = null; } clearInterval(slideTimer);
    document.documentElement.lang = t().htmlLang;
    var html;
    if (PAGE === 'faq') html = viewFaq();
    else if (!user) html = viewLanding();
    else if (PAGE === 'section' && byId(CAT.sections, KEY)) html = viewSection(KEY);
    else if (PAGE === 'category' && byId(CAT.categories, KEY)) html = viewCategory(KEY);
    else if (PAGE === 'watch') html = viewWatch(params.get('v'));
    else if (PAGE === 'author') html = viewAuthor(params.get('a'));
    else if (PAGE === 'collection') html = viewCollection(params.get('c'));
    else html = viewHome();
    $app.innerHTML = html; pintarEstado();
    var h1 = $app.querySelector('h1'); document.title = 'RGM+ · ' + (h1 && PAGE !== 'home' ? h1.textContent + ' · ' : '') + t().tagline;
    if (user && PAGE === 'watch') {
      var v = byId(CAT.videos, params.get('v'));
      if (v) destroyPlayer = RGMPlayer.mount(document.getElementById('playerbox'), resolved(v), { t: t(), prefs: prefs, savePrefs: function () { LS.set('rgm.prefs', prefs); }, poster: res(v.thumb) });
    }
    if (user && PAGE === 'home') startSlides();
    ajustarVerTodos();
  }
  // "Ver todos" con la misma altura que la imagen de los videos de su fila (no la de toda la tarjeta con texto)
  function ajustarVerTodos() {
    Array.prototype.forEach.call(document.querySelectorAll('.rowbody'), function (rb) {
      var all = rb.querySelector('.card.all'), im = rb.querySelector('.track .card'); if (!all || !im) return;
      all.style.height = im.getBoundingClientRect().height + 'px';
    });
  }
  window.addEventListener('resize', ajustarVerTodos);
  window.addEventListener('load', ajustarVerTodos);
  function rerender() { var y = window.scrollY; var q = document.activeElement && document.activeElement.name === 'q' ? document.activeElement.value : null; render(); window.scrollTo(0, y); }

  // ---------- slide principal ----------
  function showSlide(i) {
    var s = $app.querySelectorAll('.slide'), d = $app.querySelectorAll('.dots button'); if (!s.length) return;
    cur = (i + s.length) % s.length;
    s.forEach(function (el, k) { el.classList.toggle('on', k === cur); });
    d.forEach(function (el, k) { el.setAttribute('aria-current', k === cur); });
  }
  function startSlides() { cur = 0; clearInterval(slideTimer); if (!matchMedia('(prefers-reduced-motion:reduce)').matches) slideTimer = setInterval(function () { showSlide(cur + 1); }, 6500); }

  // ---------- eventos ----------
  function toast(msg) { var e = document.createElement('div'); e.className = 'toast'; e.setAttribute('role', 'status'); e.textContent = msg; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 1800); }
  function toggle(arr, id) { var i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr.push(id); }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-lang],[data-act],[data-scroll],[data-slide],[data-slide-step]'); if (!el) return;
    if (el.dataset.lang) { lang = el.dataset.lang; LS.set('rgm.lang', lang); rerender(); return; }
    if (el.dataset.scroll) { var tr = el.closest('.row').querySelector('.track'); tr.scrollBy({ left: tr.clientWidth * .8 * +el.dataset.scroll, behavior: 'smooth' }); return; }
    if (el.dataset.slide) { showSlide(+el.dataset.slide); startSlides(); return; }
    if (el.dataset.slideStep) { showSlide(cur + +el.dataset.slideStep); startSlides(); return; }
    var act = el.dataset.act;
    if (act === 'signin') { e.preventDefault(); openModal(); }
    if (act === 'logout') { user = null; LS.set('rgm.user', null); if (C.gateActivo) { try { localStorage.removeItem('rgm_plus'); localStorage.removeItem('rgm_acceso'); } catch (x) {} location.href = C.landingUrl; return; } rerender(); }
    if (act === 'save') { toggle(saved, el.dataset.id); LS.set('rgm.saved', saved); rerender(); }
    if (act === 'like') { toggle(liked, el.dataset.id); LS.set('rgm.liked', liked); el.setAttribute('aria-pressed', liked.indexOf(el.dataset.id) >= 0); }
    if (act === 'share') {
      var link = location.href;
      if (navigator.share) navigator.share({ title: title(byId(CAT.videos, el.dataset.id)), url: link }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(link).then(function () { toast(t().copied); });
    }
  });
  function openModal() {
    var T = t(), m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div class="box"><h2>' + T.demoTitle + '</h2><p>' + T.demoText + '</p><div class="a"><button class="btn" data-go>' + f(T.demoBtn, { n: esc(C.demoUser.name) }) + '</button><button class="btn ghost" data-no>' + T.cancel + '</button></div></div>';
    document.body.appendChild(m); m.querySelector('[data-go]').focus();
    m.addEventListener('click', function (e) {
      if (e.target.matches('[data-go]')) { user = { name: C.demoUser.name, tokens: C.demoUser.tokens }; LS.set('rgm.user', user); m.remove(); rerender(); }
      else if (e.target.matches('[data-no]') || e.target === m) m.remove();
    });
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { m.remove(); document.removeEventListener('keydown', k); } });
  }
  function splash() {
    try { if (sessionStorage.getItem('rgm.splash')) return; sessionStorage.setItem('rgm.splash', '1'); } catch (e) { return; }
    var s = document.createElement('div'); s.className = 'splash';
    s.innerHTML = '<div><img src="' + BASE + 'assets/logo-white.svg" alt="RGM+"><p>' + esc(t().welcome) + '</p></div>';
    document.body.appendChild(s);
    setTimeout(function () { s.classList.add('out'); setTimeout(function () { s.remove(); }, 700); }, 1300);
  }
  render(); splash();
})();
