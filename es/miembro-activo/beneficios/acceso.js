/* Acceso a Beneficios de Miembro Activo: pago (Stripe Checkout) o ingreso por enlace al email. */
(function () {
  var API = "https://miembro-activo.alejandrofabriciomotta.workers.dev";
  var K = "rgm_acceso";
  var $ = function (i) { return document.getElementById(i); };
  var leer = function () { try { return localStorage.getItem(K) || localStorage.getItem("rgm_plus") || ""; } catch (e) { return ""; } };
  var guardar = function (t) { try { localStorage.setItem(K, t); } catch (e) {} };
  var borrar = function () { try { localStorage.removeItem(K); } catch (e) {} };
  var salir = function () { try { localStorage.removeItem(K); localStorage.removeItem("rgm_plus"); localStorage.removeItem("rgm.user"); } catch (e) {} };
  var fecha = function (seg) { return new Date(seg * 1000).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }); };

  function aviso(txt) { var a = $("ben-aviso"); a.textContent = txt; a.hidden = !txt; }
  function limpiarUrl() { history.replaceState(null, "", location.pathname); }
  function vista(socio, info) {
    $("cargando").hidden = true;
    $("puerta").hidden = socio;
    $("contenido-miembro").hidden = !socio;
    if (socio && info) $("ben-vence").textContent = "Membresía activa · vence el " + fecha(info.vence);
  }

  // Precio según fecha: u$s 50 hasta el 31/12/2026, u$s 100 desde el 01/01/2027
  var lanzamiento = Date.now() < Date.parse("2027-01-01T03:00:00Z");
  $("ben-precio").textContent = lanzamiento ? "u$s 50" : "u$s 100";
  $("ben-precio-nota").textContent = lanzamiento ? "Precio de lanzamiento, válido hasta el 31/12/2026 (después: u$s 100)." : "Precio regular.";

  async function api(ruta, opc) {
    var r = await fetch(API + ruta, opc);
    var j = await r.json().catch(function () { return {}; });
    return { ok: r.ok, status: r.status, data: j };
  }

  async function iniciar() {
    var q = new URLSearchParams(location.search);
    var m = location.hash.match(/acceso=([^&]+)/);
    if (m) { guardar(decodeURIComponent(m[1])); limpiarUrl(); }
    else if (q.get("pago") === "ok" && q.get("sid")) {
      try {
        var c = await api("/api/confirmar?sid=" + encodeURIComponent(q.get("sid")));
        if (c.ok && c.data.token) guardar(c.data.token); else aviso("No pudimos confirmar el pago todavía. Si ya pagaste, ingresá con tu email más abajo.");
      } catch (e) { aviso("No pudimos confirmar el pago. Probá ingresar con tu email."); }
      limpiarUrl();
    } else if (q.get("pago") === "cancelado") { aviso("El pago fue cancelado. Cuando quieras, podés intentarlo de nuevo."); limpiarUrl(); }
    else if (q.get("acceso") === "vencido") { aviso("El enlace de acceso venció. Pedí uno nuevo con tu email."); limpiarUrl(); }

    var t = leer();
    if (t) {
      try {
        var y = await api("/api/yo", { headers: { Authorization: "Bearer " + t } });
        if (y.ok && y.data.ok) { vista(true, y.data); return; }
        borrar();
        if (y.status === 401) aviso("Tu sesión venció o tu membresía terminó. Podés renovarla acá abajo.");
      } catch (e) { /* sin conexión: mostramos la puerta */ }
    }
    vista(false);
  }

  $("ben-pagar").addEventListener("click", async function () {
    var err = $("ben-error"); err.hidden = true;
    if (!$("ben-acepto").checked) { err.textContent = "Para continuar, tildá la casilla: los contenidos están solo en español."; err.hidden = false; return; }
    var b = this; b.disabled = true; b.textContent = "Redirigiendo al pago…";
    try {
      var r = await api("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consentimiento: true }) });
      if (r.ok && r.data.url) { location.href = r.data.url; return; }
      err.textContent = r.data.error || "No pudimos iniciar el pago. Probá de nuevo en unos minutos."; err.hidden = false;
    } catch (e) { err.textContent = "No pudimos conectar con el servicio de pago. Probá de nuevo."; err.hidden = false; }
    b.disabled = false; b.textContent = "Pagar y acceder";
  });

  $("ben-form-ingreso").addEventListener("submit", async function (ev) {
    ev.preventDefault();
    var email = $("ben-email").value.trim(), ok = $("ben-ok");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { ok.textContent = "Ingresá un email válido."; ok.hidden = false; return; }
    ok.textContent = "Enviando…"; ok.hidden = false;
    try {
      await api("/api/ingresar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }) });
      ok.textContent = "Si ese email corresponde a una membresía vigente, te enviamos un enlace de acceso (revisá también el spam). El enlace vale 15 minutos.";
    } catch (e) { ok.textContent = "No pudimos enviar el enlace. Probá de nuevo."; }
  });

  $("ben-salir").addEventListener("click", function () { salir(); location.reload(); });
  iniciar();
})();
