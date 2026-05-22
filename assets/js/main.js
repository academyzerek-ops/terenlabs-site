// TerenLabs landing — минимально нужная JS-логика.
// 1) Hero «модель зрелости» — циклическая смена активной ступени I→V.
// 2) Smooth-scroll бэкап.
(function(){
  'use strict';

  // ── Stages cycling ───────────────────────────────────────────
  var STAGE_CONTENT = [
    {title:'Ракушка',   desc:'Стартовый уровень. Понимание базы: проценты, инфляция, маржа.'},
    {title:'Краб',      desc:'Считаешь ФОТ и юнит-экономику. Видишь, куда уходят деньги.'},
    {title:'Барракуда', desc:'Принимаешь решения на цифрах. Маркетинг, кадры, ramp-up.'},
    {title:'Дельфин',   desc:'Управляешь системой, а не людьми. Делегирование без потерь.'},
    {title:'Акула',     desc:'Архитектор бизнеса. Считаешь стратегию, а не операционку.'},
  ];
  var DUR_MS = 3600;

  var stagesEl  = document.getElementById('stages-row');
  var titleEl   = document.getElementById('stage-title');
  var descEl    = document.getElementById('stage-desc');

  if (stagesEl && titleEl && descEl){
    var stages = stagesEl.querySelectorAll('.stage');
    var idx = 0;
    function setActive(i){
      stages.forEach(function(s, j){ s.classList.toggle('active', j === i); });
      var c = STAGE_CONTENT[i];
      if (c){ titleEl.textContent = c.title; descEl.textContent = c.desc; }
    }
    setActive(0);

    var timer = null;
    function start(){
      if (timer) return;
      timer = setInterval(function(){
        idx = (idx + 1) % stages.length;
        setActive(idx);
      }, DUR_MS);
    }
    function stop(){ clearInterval(timer); timer = null; }
    document.addEventListener('visibilitychange', function(){
      if (document.hidden) stop(); else start();
    });
    start();

    // Клик по ступени — мгновенный переход + reset таймера
    stages.forEach(function(s, i){
      s.addEventListener('click', function(){
        idx = i; setActive(i);
        stop(); start();
      });
      s.style.cursor = 'pointer';
    });
  }

  // ── Smooth anchor scroll ────────────────────────────────────
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
