/* Ingreso único RGM: botón "Ingresar / Mi cuenta" junto a la llave. Solo RGM+ y Miembro Activo piden sesión; el resto del sitio es público. */
(function () {
  var ll = document.querySelector(".llave"); if (!ll) return;
  var API = "https://miembro-activo.alejandrofabriciomotta.workers.dev", KP = "rgm_plus", KA = "rgm_acceso";
  var lang = (document.documentElement.lang || "es").slice(0, 2); if (!/^(es|pt|en)$/.test(lang)) lang = "es";
  var T = {
    es: { ing: "Ingresar", cuenta: "Mi cuenta", tit: "Ingresá con tu email", sub: "Solo hace falta para RGM+ y Miembro Activo. El resto del sitio es público.", em: "Tu email", env: "Enviarme el enlace de acceso", enviando: "Enviando…", ok: "Si ese email tiene RGM+ o Miembro Activo, te enviamos un enlace de acceso (revisá también el spam). Vale 15 minutos.", inv: "Ingresá un email válido.", err: "No pudimos enviar el enlace. Probá de nuevo.", sin: "¿Todavía no sos parte?", conocer: "Conocer RGM+", ser: "Ser Miembro Activo", hola: "Sesión iniciada", plan: "Plan", vence: "vence el", mensual: "RGM+ mensual", anual: "RGM+ anual", miembro: "Miembro Activo", irplus: "Ir a RGM+", irma: "Beneficios de Miembro Activo", salir: "Cerrar sesión", cerrar: "Cerrar" },
    pt: { ing: "Entrar", cuenta: "Minha conta", tit: "Entre com o seu email", sub: "Só é necessário para RGM+ e Membro Ativo. O resto do site é público.", em: "O seu email", env: "Enviar-me o link de acesso", enviando: "A enviar…", ok: "Se esse email tiver RGM+ ou Membro Ativo, enviámos um link de acesso (veja também o spam). Vale 15 minutos.", inv: "Introduza um email válido.", err: "Não foi possível enviar o link. Tente de novo.", sin: "Ainda não faz parte?", conocer: "Conhecer RGM+", ser: "Ser Membro Ativo", hola: "Sessão iniciada", plan: "Plano", vence: "termina em", mensual: "RGM+ mensal", anual: "RGM+ anual", miembro: "Membro Ativo", irplus: "Ir para RGM+", irma: "Benefícios de Membro Ativo", salir: "Terminar sessão", cerrar: "Fechar" },
    en: { ing: "Log in", cuenta: "My account", tit: "Log in with your email", sub: "Only needed for RGM+ and Active Member. The rest of the site is public.", em: "Your email", env: "Send me the access link", enviando: "Sending…", ok: "If that email has RGM+ or Active Member, we sent you an access link (check spam too). It is valid for 15 minutes.", inv: "Enter a valid email.", err: "We could not send the link. Please try again.", sin: "Not a member yet?", conocer: "Discover RGM+", ser: "Become an Active Member", hola: "Signed in", plan: "Plan", vence: "expires on", mensual: "RGM+ monthly", anual: "RGM+ yearly", miembro: "Active Member", irplus: "Go to RGM+", irma: "Active Member benefits", salir: "Log out", cerrar: "Close" }
  }[lang];
  var URL_PLUS = "/es/rgmplus/", URL_PORTAL = "/es/rgmplus/portal/", URL_MA = "/es/miembro-activo/", URL_BEN = "/es/miembro-activo/beneficios/";
  function g(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x) e.textContent = x; return e; }

  var css = document.createElement("style");
  css.textContent = ".rgm-ing{flex-shrink:0;display:inline-flex;align-items:center;height:34px;margin-left:10px;padding:0 14px;border-radius:8px;border:1px solid rgba(167,151,56,.45);background:transparent;color:#d9c7a5;font:600 13px/1 Poppins,Arial,sans-serif;cursor:pointer;transition:background .2s,color .2s}.rgm-ing:hover,.rgm-ing:focus-visible{background:#a79738;color:#1f2555}.rgm-ing[data-on]{border-color:#a79738;color:#fff}" +
    ".rgm-pan{position:fixed;z-index:9999;top:64px;right:max(12px,env(safe-area-inset-right,0px));width:min(340px,calc(100vw - 24px));background:#1f2555;color:#fff;border:1px solid rgba(167,151,56,.6);border-radius:12px;padding:18px;box-shadow:0 14px 40px rgba(0,0,0,.45);font:400 14px/1.5 Poppins,Arial,sans-serif}.rgm-pan[hidden]{display:none}" +
    ".rgm-pan h3{margin:0 0 6px;font-size:16px;font-weight:600}.rgm-pan p{margin:0 0 10px;color:#eaecf7;font-size:13px}.rgm-pan input{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.08);color:#fff;font:inherit;margin-bottom:10px}" +
    ".rgm-pan .b,.rgm-pan a.b{display:block;width:100%;box-sizing:border-box;text-align:center;padding:10px 12px;border-radius:8px;border:1px solid #a79738;background:#a79738;color:#1f2555;font-weight:600;text-decoration:none;cursor:pointer;margin-bottom:8px;font-size:13px}.rgm-pan a.b.o,.rgm-pan .b.o{background:transparent;color:#fff}.rgm-pan .x{position:absolute;top:8px;right:12px;background:none;border:0;color:#d9c7a5;font-size:20px;cursor:pointer}.rgm-pan .m{color:#d9c7a5;font-size:12.5px}.rgm-pan hr{border:0;border-top:1px solid rgba(255,255,255,.18);margin:12px 0}.rgm-pan a.l{color:#d9c7a5;margin-right:12px;font-size:13px}";
  document.head.appendChild(css);

  var btn = el("button", "rgm-ing", T.ing); btn.type = "button"; btn.setAttribute("aria-haspopup", "dialog"); btn.setAttribute("aria-expanded", "false");
  ll.parentNode.insertBefore(btn, ll);
  var pan = el("div", "rgm-pan"); pan.hidden = true; pan.setAttribute("role", "dialog"); pan.setAttribute("aria-label", T.ing); document.body.appendChild(pan);
  var estado = null;   // null = sin sesión; objeto = sesión vigente
  function cerrar() { pan.hidden = true; btn.setAttribute("aria-expanded", "false"); }
  btn.addEventListener("click", function () { if (!pan.hidden) { cerrar(); return; } pintar(); pan.hidden = false; btn.setAttribute("aria-expanded", "true"); var i = pan.querySelector("input"); if (i) i.focus(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(); });
  document.addEventListener("click", function (e) { if (!pan.hidden && !pan.contains(e.target) && e.target !== btn) cerrar(); });

  function pintar() {
    pan.textContent = "";
    var x = el("button", "x", "×"); x.type = "button"; x.setAttribute("aria-label", T.cerrar); x.addEventListener("click", cerrar); pan.appendChild(x);
    if (estado) {
      pan.appendChild(el("h3", "", T.hola));
      var f = estado.vence ? new Date(estado.vence * 1000).toLocaleDateString(lang === "pt" ? "pt-PT" : lang === "en" ? "en-GB" : "es-AR") : "";
      var pl = estado.plus ? (T[estado.plus.plan] || estado.plus.plan) : T.miembro;
      pan.appendChild(el("p", "m", T.plan + ": " + pl + (f ? " · " + T.vence + " " + f : "")));
      var a = el("a", "b", T.irplus); a.href = URL_PORTAL; pan.appendChild(a);
      if (estado.ma) { var b = el("a", "b o", T.irma); b.href = URL_BEN; pan.appendChild(b); }
      var s = el("button", "b o", T.salir); s.type = "button"; s.addEventListener("click", function () { del(KP); del(KA); del("rgm.user"); location.reload(); }); pan.appendChild(s);
    } else {
      pan.appendChild(el("h3", "", T.tit)); pan.appendChild(el("p", "", T.sub));
      var fm = el("form"), i = el("input"); i.type = "email"; i.required = true; i.placeholder = T.em; i.autocomplete = "email"; i.setAttribute("aria-label", T.em);
      var s2 = el("button", "b", T.env); s2.type = "submit"; var msg = el("p", "m"); msg.hidden = true; msg.setAttribute("role", "status");
      fm.appendChild(i); fm.appendChild(s2); fm.appendChild(msg); pan.appendChild(fm);
      fm.addEventListener("submit", function (e) {
        e.preventDefault(); var v = i.value.trim(); msg.hidden = false;
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { msg.textContent = T.inv; return; }
        msg.textContent = T.enviando; s2.disabled = true;
        fetch(API + "/api/plus/ingresar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: v }) })
          .then(function (r) { msg.textContent = r.ok ? T.ok : T.err; if (!r.ok) s2.disabled = false; })
          .catch(function () { msg.textContent = T.err; s2.disabled = false; });
      });
      pan.appendChild(el("hr")); pan.appendChild(el("p", "m", T.sin));
      var l1 = el("a", "l", T.conocer); l1.href = URL_PLUS; var l2 = el("a", "l", T.ser); l2.href = URL_MA; pan.appendChild(l1); pan.appendChild(l2);
    }
  }

  // ¿Hay sesión vigente? Se consulta con el token guardado (el de RGM+ o el de Miembro Activo).
  var tk = g(KP) || g(KA);
  if (!tk) return;
  var H = { headers: { Authorization: "Bearer " + tk } };
  Promise.all([
    fetch(API + "/api/plus/yo", H).then(function (r) { return r.status === 401 ? { inv: true } : r.ok ? r.json() : null; }).catch(function () { return null; }),
    fetch(API + "/api/yo", H).then(function (r) { return r.ok ? r.json() : r.status === 401 ? { inv: true } : null; }).catch(function () { return null; })
  ]).then(function (r) {
    var p = r[0], m = r[1];
    if (p && p.inv && m && m.inv) { del(KP); del(KA); return; }    // token vencido: se limpia y queda "Ingresar"
    var okP = p && p.ok, okM = m && m.ok;
    if (!okP && !okM) return;
    estado = { vence: (okP ? p.vence : m.vence), plus: okP ? p : null, ma: okM || (okP && p.plan === "miembro") };
    btn.textContent = T.cuenta; btn.setAttribute("data-on", "1");
  });
})();
