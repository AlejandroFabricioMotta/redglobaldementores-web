/* RGM+ · Reproductor con subtítulos en 3 idiomas y audio traducido.
   - Subtítulos: pistas WebVTT (<track>) en es / pt / en.
   - Audio traducido: un archivo de audio por idioma que se sincroniza con el video
     (el video se silencia y suena el audio elegido). Más adelante se puede
     reemplazar por HLS con varias pistas de audio sin cambiar el resto del portal. */
var RGM_PLAYER_SRC = (document.currentScript && document.currentScript.src) || '';
window.RGMPlayer = (function () {
  var I = {
    play: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    vol: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M3 9v6h4l5 4V5L7 9zM16 8a5 5 0 010 8M18.5 5.5a9 9 0 010 13" stroke="#fff" stroke-width="2" fill="none"/></svg>',
    mute: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M3 9v6h4l5 4V5L7 9z"/><path d="M16 9l5 6M21 9l-5 6" stroke="#fff" stroke-width="2"/></svg>',
    cog: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
    full: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>'
  };
  var fmt = function (s) { s = Math.max(0, Math.floor(s || 0)); var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; };

  function mount(box, item, o) {
    var t = o.t, prefs = o.prefs, savePrefs = o.savePrefs;
    var langs = ['es', 'pt', 'en'], names = t.langName;
    var st = { audio: item.orig, sub: 'off' };
    if (prefs.audio && (prefs.audio === item.orig || item.dub[prefs.audio])) st.audio = prefs.audio;
    if (prefs.sub && (prefs.sub === 'off' || item.subs[prefs.sub])) st.sub = prefs.sub;

    box.innerHTML =
      '<div class="player" tabindex="-1">' +
        '<video playsinline preload="metadata" ' + (o.poster ? 'poster="' + o.poster + '"' : '') + (item.hls ? '' : ' src="' + item.video + '"') + '></video>' +
        '<audio preload="auto" hidden></audio>' +
        '<button class="big" aria-label="' + t.play + '"><span>' + I.play.replace('20', '34').replace('20', '34') + '</span></button>' +
        '<div class="menu" role="menu"></div>' +
        '<div class="ctrl"><div class="bar" role="slider" aria-label="' + t.play + '" tabindex="0"><i><b></b><u></u></i></div>' +
          '<div class="btns"><button class="pp" aria-label="' + t.play + '">' + I.play + '</button>' +
          '<button class="mu" aria-label="' + t.mute + '">' + I.vol + '</button><input type="range" min="0" max="1" step="0.05" value="1" aria-label="Volumen">' +
          '<span class="time">0:00 / 0:00</span><span class="sp"></span>' +
          '<button class="cog" aria-label="' + t.settings + '" aria-haspopup="true">' + I.cog + '</button>' +
          '<button class="fs" aria-label="' + t.fullscreen + '">' + I.full + '</button></div></div>' +
      '</div>';

    var P = box.querySelector('.player'), V = box.querySelector('video'), A = box.querySelector('audio');
    var bar = box.querySelector('.bar'), fill = bar.querySelector('b'), knob = bar.querySelector('u');
    var pp = box.querySelector('.pp'), mu = box.querySelector('.mu'), vol = box.querySelector('input'), tm = box.querySelector('.time');
    var menu = box.querySelector('.menu'), muted = false, idleT;

    // video HLS (Bunny Stream): calidades adaptativas; si falla, usa el mp4 local
    if (item.hls) {
      var useMp4 = function () { if (!V.getAttribute('src')) V.src = item.video; };
      var startHls = function () {
        if (window.Hls && Hls.isSupported()) {
          var h = new Hls(); h.loadSource(item.hls); h.attachMedia(V);
          h.on(Hls.Events.ERROR, function (e, d) { if (d.fatal) { h.destroy(); useMp4(); } });
        } else if (V.canPlayType('application/vnd.apple.mpegurl')) { V.src = item.hls; }
        else useMp4();
      };
      if (window.Hls) startHls();
      else {
        var sc = document.createElement('script');
        sc.src = RGM_PLAYER_SRC.replace(/player\.js.*$/, 'vendor/hls.min.js');
        sc.onload = startHls; sc.onerror = useMp4; document.head.appendChild(sc);
      }
    }

    // subtítulos: una pista por idioma
    langs.forEach(function (l) {
      var tr = document.createElement('track');
      tr.kind = 'subtitles'; tr.srclang = l; tr.label = names[l]; tr.src = item.subs[l];
      V.appendChild(tr);
    });

    function applySub() {
      for (var i = 0; i < V.textTracks.length; i++) {
        var tt = V.textTracks[i]; tt.mode = (tt.language === st.sub) ? 'showing' : 'disabled';
      }
    }
    function applyAudio() {
      var dub = st.audio !== item.orig;
      if (dub) {
        if (A.getAttribute('src') !== item.dub[st.audio]) A.src = item.dub[st.audio];
        A.currentTime = V.currentTime; if (!V.paused) A.play().catch(function () {});
      } else { A.pause(); }
      V.muted = dub || muted; A.muted = muted; A.volume = V.volume;
    }
    function renderMenu() {
      var h = '<h4>' + t.audio + '</h4>';
      langs.forEach(function (l) {
        if (l !== item.orig && !item.dub[l]) return;
        h += '<button role="menuitemradio" data-a="' + l + '" aria-checked="' + (st.audio === l) + '">' + names[l] +
             ' <small>' + (l === item.orig ? '(' + t.original + ')' : '(' + t.dubbed + ')') + '</small></button>';
      });
      h += '<h4>' + t.subtitles + '</h4><button role="menuitemradio" data-s="off" aria-checked="' + (st.sub === 'off') + '">' + t.off + '</button>';
      langs.forEach(function (l) { h += '<button role="menuitemradio" data-s="' + l + '" aria-checked="' + (st.sub === l) + '">' + names[l] + '</button>'; });
      menu.innerHTML = h;
    }
    menu.addEventListener('click', function (e) {
      e.stopPropagation(); var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.a) { st.audio = b.dataset.a; prefs.audio = st.audio; applyAudio(); }
      if (b.dataset.s) { st.sub = b.dataset.s; prefs.sub = st.sub; applySub(); }
      savePrefs(); renderMenu();
    });
    box.querySelector('.cog').onclick = function () { menu.classList.toggle('open'); renderMenu(); };

    function toggle() { V.paused ? V.play() : V.pause(); }
    pp.onclick = toggle; box.querySelector('.big').onclick = toggle; V.onclick = toggle;
    V.addEventListener('play', function () {
      P.classList.add('playing'); pp.innerHTML = I.pause; pp.setAttribute('aria-label', t.pause);
      if (st.audio !== item.orig) { A.currentTime = V.currentTime; A.play().catch(function () {}); }
    });
    V.addEventListener('pause', function () { P.classList.remove('playing'); pp.innerHTML = I.play; pp.setAttribute('aria-label', t.play); A.pause(); });
    V.addEventListener('seeked', function () { if (st.audio !== item.orig) A.currentTime = V.currentTime; });
    V.addEventListener('ratechange', function () { A.playbackRate = V.playbackRate; });
    V.addEventListener('waiting', function () { A.pause(); });
    V.addEventListener('playing', function () { if (st.audio !== item.orig) { A.currentTime = V.currentTime; A.play().catch(function () {}); } });
    V.addEventListener('timeupdate', function () {
      var d = V.duration || 0, p = d ? V.currentTime / d * 100 : 0;
      fill.style.width = p + '%'; knob.style.left = p + '%';
      tm.textContent = fmt(V.currentTime) + ' / ' + fmt(d);
      if (st.audio !== item.orig && !V.paused && Math.abs(A.currentTime - V.currentTime) > 0.35) A.currentTime = V.currentTime;
    });
    V.addEventListener('loadedmetadata', function () { tm.textContent = '0:00 / ' + fmt(V.duration); applySub(); });
    V.addEventListener('ended', function () { A.pause(); });

    bar.addEventListener('click', function (e) { var r = bar.getBoundingClientRect(); if (V.duration) V.currentTime = (e.clientX - r.left) / r.width * V.duration; });
    bar.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') V.currentTime += 5; if (e.key === 'ArrowLeft') V.currentTime -= 5;
    });
    vol.oninput = function () { V.volume = A.volume = +vol.value; muted = V.volume === 0; mu.innerHTML = muted ? I.mute : I.vol; applyAudio(); };
    mu.onclick = function () { muted = !muted; mu.innerHTML = muted ? I.mute : I.vol; applyAudio(); };
    box.querySelector('.fs').onclick = function () {
      if (document.fullscreenElement) document.exitFullscreen(); else if (P.requestFullscreen) P.requestFullscreen();
    };
    P.addEventListener('mousemove', function () { P.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(function () { P.classList.add('idle'); }, 2500); });
    document.addEventListener('click', onDoc); function onDoc(e) { if (!menu.contains(e.target) && !e.target.closest('.cog')) menu.classList.remove('open'); }

    applySub(); applyAudio();
    return function destroy() { document.removeEventListener('click', onDoc); V.pause(); A.pause(); V.removeAttribute('src'); A.removeAttribute('src'); };
  }
  return { mount: mount };
})();
