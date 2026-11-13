/* RGM+ · Configuración del portal.
   Todo lo que Ale pueda querer cambiar sin tocar el código está aquí. */
window.RGM_CONFIG = {
  // ACCESO REAL (Stripe). false = portal abierto como hoy. Pasar a true solo cuando el Worker esté desplegado.
  gateActivo: false,
  // Firma de videos con Bunny Token Authentication. Activar solo después de configurar la clave en el Worker y en Bunny.
  videoFirma: false,
  api: 'https://miembro-activo.alejandrofabriciomotta.workers.dev',
  landingUrl: 'https://www.redglobaldementores.org/es/rgmplus/',

  // Mientras sea true se muestra la etiqueta "Vista previa" y el inicio de sesión es SIMULADO.
  previewMode: true,

  // Idiomas del portal (interfaz, subtítulos y audio doblado)
  languages: ['es', 'pt', 'en'],
  defaultLang: 'es',

  // Precios (los mismos de las landings actuales)
  price: { month: 5, year: 50, currency: 'USD' },

  // Los botones de suscripción llevan a los planes de la landing (pago en Stripe)
  subscribeUrl: 'https://www.redglobaldementores.org/es/rgmplus/#planes',

  // Usuario de demostración (hasta conectar el acceso real)
  demoUser: { name: 'Ale Motta', tokens: 1 },

  // Sitios recomendados del zócalo. {lang} se reemplaza por es / pt / en.
  // Las URLs marcadas "provisional" hay que confirmarlas.
  sites: [
    { key: 'academia',  url: 'https://www.academiaglobalrgm.com/' },                    // provisional
    { key: 'editorial', url: 'https://www.editorialrgm.com/' },                         // provisional
    { key: 'directorio', url: 'https://www.redglobaldementores.org/{lang}/' },          // provisional (ajustar a la sección Directorio)
    { key: 'encuentros', url: 'https://www.holdingmentors.com/proximosencuentros' }
  ],
  backUrl: 'https://www.redglobaldementores.org/{lang}/',

  // Imágenes opcionales para el collage de la portada (si está vacío se usan mosaicos de color)
  collage: []
};


/* Puerta de acceso: sin suscripción vigente (o Miembro Activo) se vuelve a la landing de RGM+. */
(function () {
  var C = window.RGM_CONFIG; if (!C || !C.gateActivo) return;
  var KP = 'rgm_plus', KA = 'rgm_acceso', H = document.documentElement;
  function g(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  var h = location.hash;
  if (/^#acceso=/.test(h)) { try { localStorage.setItem(KP, h.slice(8)); history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
  var tk = g(KP) || g(KA);
  function fuera() { del('rgm.user'); location.replace(C.landingUrl + '?acceso=requerido'); }
  if (!tk) { H.style.visibility = 'hidden'; fuera(); return; }
  H.style.visibility = 'hidden';
  try { if (!localStorage.getItem('rgm.user')) localStorage.setItem('rgm.user', JSON.stringify({ name: 'RGM+', tokens: (C.demoUser && C.demoUser.tokens) || 0 })); } catch (e) {}
  var t = setTimeout(function () { H.style.visibility = ''; }, 8000);
  fetch(C.api + '/api/plus/yo', { headers: { Authorization: 'Bearer ' + tk } }).then(function (r) {
    if (r.status === 401) { del(KP); if (g(KA) === tk) del(KA); fuera(); return; }
    clearTimeout(t); H.style.visibility = '';
    return r.json().then(function (d) { window.RGM_ESTADO = d; try { window.dispatchEvent(new Event('rgm-estado')); } catch (e) {} }).catch(function () {});
  }).catch(function () { clearTimeout(t); H.style.visibility = ''; });   // si el servicio no responde, no se expulsa a un suscriptor
})();
