(function(){
  var C=window.RGM_MA||{}, API="https://miembro-activo.alejandrofabriciomotta.workers.dev", K="rgm_acceso";
  function leer(){try{return localStorage.getItem(K)}catch(e){return null}}
  function borrar(){try{localStorage.removeItem(K)}catch(e){}}
  function q(s){return Array.prototype.slice.call(document.querySelectorAll(s))}

  var regular=Date.now()>=Date.parse("2027-01-01T03:00:00Z");
  if(regular)q(".compra-pagar").forEach(function(b){b.textContent=b.textContent.replace("u$s 50","u$s 100")});

  // Compra: abre la galería de pagos de Stripe (misma lógica que la página de beneficios)
  q(".compra").forEach(function(box){
    var ok=box.querySelector(".compra-ok"), bt=box.querySelector(".compra-pagar"), ms=box.querySelector(".compra-msg");
    function msg(t){ms.textContent=t;ms.hidden=!t}
    bt.addEventListener("click",function(){
      if(!ok.checked){msg(C.aviso);ok.focus();return}
      msg("");bt.disabled=true;
      var h={"Content-Type":"application/json"},t=leer(); if(t)h.Authorization="Bearer "+t;
      fetch(API+"/api/checkout",{method:"POST",headers:h,body:JSON.stringify({consentimiento:true})})
        .then(function(r){return r.json().then(function(d){return{s:r.status,d:d}})})
        .then(function(r){
          if(r.s===409||(r.d&&r.d.yaMiembro)){location.href=C.ben;return}
          if(r.d&&r.d.url){location.href=r.d.url;return}
          throw 0;
        }).catch(function(){bt.disabled=false;msg(C.err)});
    });
  });

  // Si ya es miembro con acceso vigente: no se le ofrece pagar, entra directo
  var t=leer(); if(!t)return;
  fetch(API+"/api/yo",{headers:{Authorization:"Bearer "+t}}).then(function(r){
    if(r.status===401){borrar();return null}
    return r.ok?r.json():null;
  }).then(function(d){
    if(!d||!d.ok)return;
    var f=d.vence?new Date(d.vence*1000).toLocaleDateString(C.lang||"es-AR"):"";
    q(".js-comprar").forEach(function(a){a.href=C.ben;a.textContent=C.acc});
    q(".compra").forEach(function(b){
      var p=document.createElement("div");p.className="compra compra--miembro";
      p.innerHTML='<p><strong></strong></p><p class="precio-nota"></p><p><a class="boton"></a></p>';
      p.querySelector("strong").textContent=C.act;
      p.querySelector(".precio-nota").textContent=f?C.vence+" "+f+".":"";
      var a=p.querySelector("a");a.href=C.ben;a.textContent=C.acc;
      b.parentNode.replaceChild(p,b);
    });
    q(".venta-cierre .secundario").forEach(function(a){if(a.getAttribute("href")===C.ben)a.hidden=true});
  }).catch(function(){});
})();
