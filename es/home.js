/* Carrusel de la Home: avanza solo cada 7 s, se pausa con el mouse/foco y respeta "reducir movimiento". Sin JS se ve el primer slide. */
(function(){
  var hero=document.querySelector('.hm-hero'); if(!hero) return;
  document.documentElement.classList.add('hm-js');
  var slides=[].slice.call(hero.querySelectorAll('.hm-slide')), dots=hero.querySelector('.hm-dots'), i=0, timer, pausado=false;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  slides.forEach(function(s,k){var b=document.createElement('button');b.type='button';b.className='hm-dot';b.setAttribute('aria-label','Ir al slide '+(k+1)+': '+s.getAttribute('data-titulo'));b.addEventListener('click',function(){ir(k);});dots.appendChild(b);});
  function ir(k){i=(k+slides.length)%slides.length;slides.forEach(function(s,n){s.classList.toggle('activo',n===i);});[].slice.call(dots.children).forEach(function(d,n){d.setAttribute('aria-current',n===i?'true':'false');});}
  [].slice.call(hero.querySelectorAll('.hm-flecha')).forEach(function(b){b.addEventListener('click',function(){ir(i+Number(b.getAttribute('data-dir')));});});
  function arrancar(){clearInterval(timer);if(!reduce&&!pausado&&!document.hidden){timer=setInterval(function(){ir(i+1);},7000);}}
  hero.addEventListener('mouseenter',function(){pausado=true;arrancar();});hero.addEventListener('mouseleave',function(){pausado=false;arrancar();});
  hero.addEventListener('focusin',function(){pausado=true;arrancar();});hero.addEventListener('focusout',function(){pausado=false;arrancar();});
  document.addEventListener('visibilitychange',arrancar);
  ir(0);arrancar();
})();
