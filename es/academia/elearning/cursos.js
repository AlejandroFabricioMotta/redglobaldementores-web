/* eLearning: pago del curso (Stripe Checkout) y acceso a su contenido protegido. Sin contraseñas: pago o enlace por email. */
(function () {
  var API = "https://claude-rgm.alejandrofabriciomotta.workers.dev";
  var K = "rgm_curso";
  var LANG = (document.documentElement.lang || "es").slice(0, 2); if (["es", "pt", "en"].indexOf(LANG) < 0) LANG = "es";
  var T = {
    es: { email: "Tu email", pagar: "Ir al pago →", pagando: "Abriendo el pago…", sobre: "Contenido para alumnos", h2: "Este curso es para alumnos inscriptos",
      lead: "Para ver los videos y materiales, inscribite y pagá con Stripe, o ingresá con tu email si ya sos alumno.", ya: "¿Ya sos alumno? Te enviamos un enlace de acceso a tu email.", enviar: "Enviar enlace", enviado: "Si tu email tiene un curso vigente, te enviamos un enlace de acceso (vale 15 minutos). Revisá tu bandeja de entrada y el spam.",
      errmail: "Escribí un email válido.", err: "No pudimos completar la operación. Probá de nuevo en unos minutos.", vence: "Acceso vigente hasta el ", salir: "Salir", cargando: "Cargando tu curso…",
      noconf: "No pudimos confirmar el pago todavía. Si ya pagaste, ingresá con tu email más abajo.", vencido: "El enlace venció. Pedí uno nuevo.", beca: "¿Tenés un código de beca? Lo ingresás en la pantalla de pago." },
    pt: { email: "O seu email", pagar: "Ir para o pagamento →", pagando: "A abrir o pagamento…", sobre: "Conteúdo para alunos", h2: "Este curso é para alunos inscritos",
      lead: "Para ver os vídeos e materiais, inscreva-se e pague com Stripe, ou entre com o seu email se já é aluno.", ya: "Já é aluno? Enviamos um link de acesso para o seu email.", enviar: "Enviar link", enviado: "Se o seu email tiver um curso em vigor, enviámos-lhe um link de acesso (válido por 15 minutos). Verifique a caixa de entrada e o spam.",
      errmail: "Escreva um email válido.", err: "Não foi possível concluir a operação. Tente novamente dentro de alguns minutos.", vence: "Acesso em vigor até ", salir: "Sair", cargando: "A carregar o seu curso…",
      noconf: "Ainda não conseguimos confirmar o pagamento. Se já pagou, entre com o seu email mais abaixo.", vencido: "O link expirou. Peça um novo.", beca: "Tem um código de bolsa? Introduza-o no ecrã de pagamento." },
    en: { email: "Your email", pagar: "Go to payment →", pagando: "Opening payment…", sobre: "Content for students", h2: "This course is for enrolled students",
      lead: "To watch the videos and materials, enrol and pay with Stripe, or sign in with your email if you are already a student.", ya: "Already a student? We will email you an access link.", enviar: "Send link", enviado: "If your email has a current course, we have sent you an access link (valid for 15 minutes). Check your inbox and spam folder.",
      errmail: "Please enter a valid email.", err: "We could not complete the operation. Please try again in a few minutes.", vence: "Access valid until ", salir: "Sign out", cargando: "Loading your course…",
      noconf: "We could not confirm the payment yet. If you have already paid, sign in with your email below.", vencido: "The link has expired. Please request a new one.", beca: "Have a scholarship code? Enter it on the payment screen." }
  }[LANG];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var leer = function () { try { return localStorage.getItem(K) || ""; } catch (e) { return ""; } };
  var guardar = function (t) { try { localStorage.setItem(K, t); } catch (e) {} };
  var borrar = function () { try { localStorage.removeItem(K); } catch (e) {} };
  var emailOk = function (e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e || ""); };
  var fecha = function (s) { return new Date(s * 1000).toLocaleDateString(LANG === "pt" ? "pt-PT" : LANG === "en" ? "en-GB" : "es-AR", { day: "numeric", month: "long", year: "numeric" }); };
  function el(tag, attrs, txt) { var n = document.createElement(tag); for (var k in (attrs || {})) n.setAttribute(k, attrs[k]); if (txt) n.textContent = txt; return n; }
  async function api(ruta, opc) { var r = await fetch(API + ruta, opc); var j = await r.json().catch(function () { return {}; }); return { ok: r.ok, status: r.status, data: j }; }
  var post = function (ruta, cuerpo) { return api(ruta, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) }); };

  // Formulario "email → pago"
  async function irAlPago(curso, email, msg, btn) {
    if (!emailOk(email)) { msg.textContent = T.errmail; return; }
    btn.disabled = true; var antes = btn.textContent; btn.textContent = T.pagando; msg.textContent = "";
    try { var r = await post("/api/cursos/checkout", { id: curso, email: email, lang: LANG }); if (r.ok && r.data.url) { location.href = r.data.url; return; } msg.textContent = T.err; }
    catch (e) { msg.textContent = T.err; }
    btn.disabled = false; btn.textContent = antes;
  }
  function formPago(curso, conBeca) {
    var f = el("form", { "class": "cur-form", novalidate: "" }), i = el("input", { type: "email", placeholder: T.email, "aria-label": T.email, autocomplete: "email", required: "" });
    var b = el("button", { type: "submit", "class": "btn btn--oro" }, T.pagar), m = el("p", { "class": "cur-msg", role: "status" });
    f.appendChild(i); f.appendChild(b); if (conBeca) f.appendChild(el("p", { "class": "cur-beca" }, T.beca)); f.appendChild(m);
    f.addEventListener("submit", function (ev) { ev.preventDefault(); irAlPago(curso, i.value.trim(), m, b); });
    return f;
  }

  // 1) Landing: los botones "Inscripción y pago" abren un pequeño formulario de email debajo del botón.
  document.querySelectorAll("a[data-pago]").forEach(function (a) {
    var curso = (a.getAttribute("data-pago") || "").replace(/-(pt|en)$/, "");
    a.removeAttribute("aria-disabled"); a.setAttribute("href", "#pago-" + curso); a.setAttribute("role", "button");
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      var ya = a.parentNode.querySelector(".cur-form"); if (ya) { ya.querySelector("input").focus(); return; }
      var f = formPago(curso, curso === "formacion-intensiva"); a.parentNode.appendChild(f); f.querySelector("input").focus();
    });
  });

  // 2) Página de curso: puerta o contenido protegido.
  var zona = $("#zona-alumno"); if (!zona) return;
  var curso = zona.getAttribute("data-curso");
  function puerta(aviso) {
    zona.textContent = "";
    var c = el("div", { "class": "cont centrado cur-puerta" });
    c.appendChild(el("span", { "class": "sobre" }, T.sobre)); c.appendChild(el("h2", {}, T.h2)); c.appendChild(el("p", { "class": "lead" }, T.lead));
    if (aviso) c.appendChild(el("p", { "class": "cur-msg", role: "status" }, aviso));
    c.appendChild(formPago(curso, curso === "formacion-intensiva"));
    c.appendChild(el("p", { "class": "cur-ya" }, T.ya));
    var f = el("form", { "class": "cur-form", novalidate: "" }), i = el("input", { type: "email", placeholder: T.email, "aria-label": T.email, autocomplete: "email" }), b = el("button", { type: "submit", "class": "btn btn--borde" }, T.enviar), m = el("p", { "class": "cur-msg", role: "status" });
    f.appendChild(i); f.appendChild(b); f.appendChild(m);
    f.addEventListener("submit", async function (ev) {
      ev.preventDefault(); var e = i.value.trim(); if (!emailOk(e)) { m.textContent = T.errmail; return; }
      b.disabled = true; try { var r = await post("/api/cursos/ingresar", { email: e, curso: curso, lang: LANG }); m.textContent = r.ok ? T.enviado : T.err; } catch (x) { m.textContent = T.err; } b.disabled = false;
    });
    c.appendChild(f); zona.appendChild(c);
  }
  async function mostrar() {
    var tk = leer(); if (!tk) return puerta();
    zona.textContent = T.cargando;
    try {
      var r = await api("/api/cursos/contenido?id=" + encodeURIComponent(curso) + "&lang=" + LANG, { headers: { Authorization: "Bearer " + tk } });
      if (r.ok && r.data.html) {
        zona.innerHTML = r.data.html;
        var barra = el("div", { "class": "cur-barra" }); barra.appendChild(el("span", {}, T.vence + fecha(r.data.vence)));
        var s = el("button", { type: "button", "class": "cur-salir" }, T.salir); s.addEventListener("click", function () { borrar(); location.reload(); }); barra.appendChild(s);
        zona.insertBefore(barra, zona.firstChild);
      } else { if (r.status === 401) borrar(); puerta(); }
    } catch (e) { puerta(T.err); }
  }
  (async function () {
    var q = new URLSearchParams(location.search), m = location.hash.match(/acceso=([^&]+)/), aviso = "";
    if (m) { guardar(decodeURIComponent(m[1])); history.replaceState(null, "", location.pathname); }
    else if (q.get("pago") === "ok" && q.get("sid")) {
      try { var c = await api("/api/cursos/confirmar?sid=" + encodeURIComponent(q.get("sid"))); if (c.ok && c.data.token) guardar(c.data.token); else aviso = T.noconf; } catch (e) { aviso = T.noconf; }
      history.replaceState(null, "", location.pathname);
    } else if (q.get("acceso") === "vencido") { aviso = T.vencido; history.replaceState(null, "", location.pathname); }
    if (aviso) { borrar(); return puerta(aviso); }
    mostrar();
  })();
})();
