(function(){
  var C=window.RGM_PLUS||{}, API="https://miembro-activo.alejandrofabriciomotta.workers.dev", KP="rgm_plus", KA="rgm_acceso";
  var $=function(s){return document.querySelector(s)}, $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
  function g(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function sv(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function del(k){try{localStorage.removeItem(k)}catch(e){}}
  var msgEl=$(".plus-msg");
  function msg(t,err){if(!msgEl)return;msgEl.textContent=t||"";msgEl.hidden=!t;msgEl.style.color=err?"#ffb4b4":""}
  function token(){return g(KP)||g(KA)}
  function post(ruta,body,tk){
    var h={"Content-Type":"application/json"}; if(tk)h.Authorization="Bearer "+tk;
    return fetch(API+ruta,{method:"POST",headers:h,body:JSON.stringify(body||{})}).then(function(r){return r.json().then(function(d){return{s:r.status,d:d}})});
  }
  function irPortal(){location.href=C.portal}

  // 1) Elegir plan -> galería de pagos de Stripe
  $$(".js-plan").forEach(function(b){b.addEventListener("click",function(){
    msg("");$$(".js-plan").forEach(function(x){x.disabled=true});
    post("/api/plus/checkout",{plan:b.getAttribute("data-plan"),consentimiento:true},token()).then(function(r){
      if(r.s===409||(r.d&&r.d.yaMiembro)){irPortal();return}
      if(r.d&&r.d.url){location.href=r.d.url;return}
      throw 0;
    }).catch(function(){$$(".js-plan").forEach(function(x){x.disabled=false});msg(C.err,true)});
  })});

  // 2) Ya tengo cuenta: enlace por email
  var lnk=$(".js-ingreso"), fm=$(".ingreso-form");
  if(lnk&&fm){
    lnk.addEventListener("click",function(e){e.preventDefault();fm.hidden=!fm.hidden;if(!fm.hidden)fm.querySelector("input").focus()});
    fm.addEventListener("submit",function(e){e.preventDefault();var em=fm.querySelector("input").value.trim();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))return;
      post("/api/plus/ingresar",{email:em}).then(function(){msg(C.envio)}).catch(function(){msg(C.err,true)})});
  }

  // 3) Parámetros de retorno
  var q=new URLSearchParams(location.search), h=location.hash;
  if(/^#acceso=/.test(h)){sv(KP,h.slice(8));history.replaceState(null,"",location.pathname);irPortal();return}
  if(q.get("pago")==="ok"&&q.get("sid")){
    msg(C.verif);history.replaceState(null,"",location.pathname);
    fetch(API+"/api/plus/confirmar?sid="+encodeURIComponent(q.get("sid"))).then(function(r){return r.json()}).then(function(d){
      if(d&&d.ok&&d.token){sv(KP,d.token);msg(C.ok);setTimeout(irPortal,1500)}else throw 0;
    }).catch(function(){msg(C.err,true)});
    return;
  }
  if(q.get("pago")==="cancelado")msg(C.canc);
  if(q.get("acceso")==="vencido")msg(C.venc,true);
  if(q.get("acceso")==="requerido")msg(C.requ);

  // 4) Si ya tiene acceso vigente: no se le ofrece pagar
  var tk=token(); if(!tk)return;
  fetch(API+"/api/plus/yo",{headers:{Authorization:"Bearer "+tk}}).then(function(r){
    if(r.status===401){del(KP);return null} return r.ok?r.json():null;
  }).then(function(d){
    if(!d||!d.ok)return;
    var f=d.vence?new Date(d.vence*1000).toLocaleDateString(C.lang):"";
    var caja=$(".planes"); if(!caja)return;
    var p=document.createElement("div");p.className="planes planes--ya";
    p.innerHTML='<p class="planes__t"></p><p class="planes__d"></p><p><a class="boton boton--dorado"></a></p>';
    p.querySelector(".planes__t").textContent=C.ya;
    p.querySelector(".planes__d").textContent=C.plan+": "+(C[d.plan]||d.plan)+(f?" · "+C.vence+" "+f:"");
    var a=p.querySelector("a");a.href=C.portal;a.textContent=C.entrar;
    if(d.plan!=="miembro"){var b=document.createElement("a");b.href="#";b.textContent=C.gest;b.addEventListener("click",function(e){e.preventDefault();
      post("/api/plus/gestionar",{},tk).then(function(r){if(r.d&&r.d.url)location.href=r.d.url;else msg(C.err,true)}).catch(function(){msg(C.err,true)})});var z=$(".zocalo__c");if(z){var g=document.createElement("p");g.className="zocalo__g";g.appendChild(b);z.parentNode.insertBefore(g,z.nextSibling)}}
    caja.parentNode.replaceChild(p,caja);
    $$(".portada__cuenta,.ingreso-form").forEach(function(x){x.hidden=true});
    $$("a[href='#planes']").forEach(function(x){x.href=C.portal;x.textContent=C.entrar});
  }).catch(function(){});
})();
