// TerenLabs landing — минимально нужная JS-логика.
// 1) Hero crossfade эволюции эмодзи (заглушка под mp4 Higgsfield/Veo).
// 2) Smooth scroll для якорей в навигации (бэкап к scroll-behavior:smooth).
(function(){
  'use strict';

  // ── Hero evolution crossfade ─────────────────────────────────
  var STAGES = ['Ракушка','Краб','Барракуда','Дельфин','Акула'];
  var DUR_MS = 3200;        // длительность стадии
  var els = {
    stages: document.querySelectorAll('.evo-stage'),
    label:  document.getElementById('evo-label'),
    dots:   document.getElementById('evo-dots'),
    slot:   document.getElementById('evo-video-slot'),
  };

  if (els.stages.length && els.dots){
    // dots
    STAGES.forEach(function(_, i){
      var d = document.createElement('span');
      d.className = 'evo-dot';
      if (i === 0) d.classList.add('active');
      els.dots.appendChild(d);
    });
    var dots = els.dots.querySelectorAll('.evo-dot');

    var i = 0;
    function show(idx){
      els.stages.forEach(function(s, j){
        s.classList.toggle('active', j === idx);
      });
      dots.forEach(function(d, j){
        d.classList.toggle('active', j === idx);
      });
      if (els.label) els.label.textContent = STAGES[idx];
    }
    show(0);

    var paused = false;
    var timer = null;
    function start(){
      if (timer) return;
      timer = setInterval(function(){
        if (paused) return;
        i = (i + 1) % STAGES.length;
        show(i);
      }, DUR_MS);
    }
    function stop(){
      clearInterval(timer); timer = null;
    }
    // Останавливаем, когда вкладка скрыта — экономим CPU
    document.addEventListener('visibilitychange', function(){
      if (document.hidden) stop(); else start();
    });
    start();

    // Если в /assets/video/hero.mp4 положат файл — показываем его вместо emoji.
    // Просто проставь src на этот файл в evo-video-slot снаружи, либо
    // раскомментируй блок ниже и подложи hero.mp4.
    /*
    var v = document.createElement('video');
    v.src = 'assets/video/hero.mp4';
    v.autoplay = true; v.muted = true; v.loop = true; v.playsInline = true;
    v.addEventListener('loadeddata', function(){
      els.slot.style.display = 'block';
      stop();
      els.stages.forEach(function(s){ s.style.display = 'none'; });
      if (els.label) els.label.style.display = 'none';
      if (els.dots) els.dots.style.display = 'none';
    });
    els.slot.appendChild(v);
    */
  }

  // ── Smooth anchor scroll (на случай если scroll-behavior не сработал) ──
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(ev){
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      ev.preventDefault();
      t.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
})();
