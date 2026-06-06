/* ============================================================
   TerenLabs · Lessons runtime
   - Инжектит aibar (drawer + chat pill снизу)
   - Инжектит swipe-стрелки (визуальные подсказки)
   - Свайп влево/вправо переключает главы (читает .nav-prev/.nb-next)
   - Hint-стрелки фейдят через 4 сек после загрузки
   ============================================================ */
(function(){
  if (window.__lessonsRuntimeLoaded) return;
  window.__lessonsRuntimeLoaded = true;

  // Telegram Mini App SDK подключён в <head> каждой главы (см. .html).
  // Здесь только инициализация: ready() + expand() — критично для HapticFeedback,
  // нативный bridge активен только после ready().
  function initTg(){
    try {
      var tg = window.Telegram && window.Telegram.WebApp;
      if (tg) {
        if (!window.__tgReady) {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
          window.__tgReady = true;
        }
      }
    } catch(e){}
  }
  // SDK может подгрузиться чуть позже defer-скрипта — пробуем сразу и через окно onload
  initTg();
  window.addEventListener('load', initTg);

  // Авто-определение модуля по имени файла (m1-ch00.html, m5-ch03.html и т.д.).
  // Ставится сразу на <html>, чтобы CSS-переменные подменились до отрисовки.
  try {
    var modMatch = (location.pathname || '').match(/\/m(\d+)-ch\d+/i);
    if (modMatch && modMatch[1]) document.documentElement.setAttribute('data-mod', modMatch[1]);
  } catch(e){}

  function ready(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function hrefFromOnclick(el){
    if (!el) return null;
    var m = (el.getAttribute('onclick') || '').match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
    return m ? m[1] : null;
  }

  // Haptic feedback: Telegram Mini App native API → fallback на navigator.vibrate
  // style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
  function haptic(style){
    try {
      var tg = window.Telegram && window.Telegram.WebApp;
      if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
        tg.HapticFeedback.impactOccurred(style || 'medium');
        return;
      }
    } catch(e){}
    try { if (navigator.vibrate) navigator.vibrate(15); } catch(e){}
  }
  function hapticSuccess(){
    try {
      var tg = window.Telegram && window.Telegram.WebApp;
      if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.notificationOccurred === 'function') {
        tg.HapticFeedback.notificationOccurred('success');
        return;
      }
    } catch(e){}
    try { if (navigator.vibrate) navigator.vibrate([12,40,18]); } catch(e){}
  }

  // Видимая вспышка-индикатор для отладки: точка в правом верхнем углу
  // мигает на момент вызова haptic. Если мигает — JS работает.
  // Если мигает, но вибрации нет → проблема в Telegram WebApp bridge.
  function hapticDebugFlash(){
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;top:6px;right:6px;width:10px;height:10px;border-radius:50%;background:#E85454;z-index:9999;pointer-events:none;box-shadow:0 0 12px #E85454;transition:opacity 0.4s ease;';
    document.body.appendChild(d);
    setTimeout(function(){ d.style.opacity = '0'; }, 200);
    setTimeout(function(){ d.remove(); }, 700);
  }

  // Хаптик + навигация с задержкой 150 мс: WKWebView postMessage должен долететь
  // до натива и сработать UIImpactFeedbackGenerator до выгрузки страницы.
  function goWithHaptic(href, success){
    hapticDebugFlash();
    if (success) hapticSuccess(); else haptic('medium');
    setTimeout(function(){ window.location.href = href; }, 150);
  }

  ready(function(){
    // 1) Read existing .nav prev/next
    var nav = document.querySelector('.nav');
    var prevBtn = nav && nav.querySelector('.nb-prev');
    var nextBtn = nav && nav.querySelector('.nb-next');
    var prevHref = hrefFromOnclick(prevBtn);
    var nextHref = hrefFromOnclick(nextBtn);
    var nextLabel = nextBtn ? (nextBtn.textContent || '').trim() : '';
    var isFinishLink = nextHref && nextHref.indexOf('shell/app.html') !== -1;

    // 2) Inject aibar (drawer-кнопка + pill «Спросить TerenLabs»)
    var aibar = document.createElement('aside');
    aibar.className = 'les-aibar';
    aibar.innerHTML =
      '<button class="les-aibar-icon" type="button" aria-label="Меню кабинета">'+
        '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">'+
          '<circle cx="6" cy="6" r="1.8"/><circle cx="12" cy="6" r="1.8"/><circle cx="18" cy="6" r="1.8"/>'+
          '<circle cx="6" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18" cy="12" r="1.8"/>'+
          '<circle cx="6" cy="18" r="1.8"/><circle cx="12" cy="18" r="1.8"/><circle cx="18" cy="18" r="1.8"/>'+
        '</svg>'+
      '</button>'+
      '<button class="les-aibar-pill" type="button">'+
        '<span class="les-aibar-text">Спросить TerenLabs…</span>'+
      '</button>';
    document.body.appendChild(aibar);

    // Aibar handlers — открывают Mini App с deep-link
    aibar.querySelector('.les-aibar-icon').addEventListener('click', function(){
      window.location.href = '../../../../shell/app.html?drawer=1';
    });
    aibar.querySelector('.les-aibar-pill').addEventListener('click', function(){
      window.location.href = '../../../../shell/app.html?chat=1';
    });

    // 3) Inject swipe-стрелки (только если есть куда идти)
    if (prevHref && !isPrevFinish(prevHref)) {
      var arrL = document.createElement('button');
      arrL.className = 'les-swipe-arr left';
      arrL.type = 'button';
      arrL.setAttribute('aria-label', 'Предыдущая глава');
      arrL.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
      arrL.addEventListener('click', function(){ goWithHaptic(prevHref, false); });
      document.body.appendChild(arrL);
    }
    if (nextHref) {
      var arrR = document.createElement('button');
      arrR.className = 'les-swipe-arr right' + (isFinishLink ? ' finish' : '');
      arrR.type = 'button';
      arrR.setAttribute('aria-label', isFinishLink ? 'Завершить' : 'Следующая глава');
      arrR.innerHTML = isFinishLink
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
      arrR.addEventListener('click', function(){ goWithHaptic(nextHref, isFinishLink); });
      document.body.appendChild(arrR);
    }

    // 3b) Блок «Дальше — …» в конце главы делаем кликабельным (.c.ao с .lb.orange "Дальше")
    if (nextHref) {
      document.querySelectorAll('.c.ao').forEach(function(card){
        var lb = card.querySelector('.lb.orange');
        if (!lb) return;
        if (!/^Дальше\b/i.test((lb.textContent || '').trim())) return;
        card.classList.add('next-card');
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        var arrow = document.createElement('span');
        arrow.className = 'next-card-arr';
        arrow.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
        card.appendChild(arrow);
        card.addEventListener('click', function(){ goWithHaptic(nextHref, isFinishLink); });
        card.addEventListener('keydown', function(e){
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goWithHaptic(nextHref, isFinishLink); }
        });
      });
    }

    // 4) Swipe-навигация (только горизонтальный жест на основном контенте)
    var sX = 0, sY = 0, sw = false;
    document.body.addEventListener('touchstart', function(e){
      // Игнорируем горизонтальные scroll-зоны (.flow step-flow, .fs fact-scroll, .ex expandable, aibar/стрелки)
      if (e.target.closest('.flow, .fs, .ex, .les-aibar, .les-swipe-arr')) { sw = false; return; }
      sX = e.touches[0].clientX; sY = e.touches[0].clientY; sw = true;
    }, {passive:true});
    document.body.addEventListener('touchend', function(e){
      if (!sw) return; sw = false;
      var dx = e.changedTouches[0].clientX - sX;
      var dy = e.changedTouches[0].clientY - sY;
      if (Math.abs(dx) < 80 || Math.abs(dy) > Math.abs(dx) * 0.7) return;
      if (dx < 0 && nextHref) goWithHaptic(nextHref, isFinishLink);
      else if (dx > 0 && prevHref) goWithHaptic(prevHref, false);
    }, {passive:true});

    // 5) Hint-фейдинг — стрелки сначала pulsируют, потом затухают
    setTimeout(function(){
      document.querySelectorAll('.les-swipe-arr').forEach(function(a){ a.classList.add('idle'); });
    }, 3500);

    // 6) Горизонтальные скроллеры (.flow, .fs):
    //    a) при загрузке — bounce-hint (короткий рывок вправо и обратно)
    //    b) трекаем доскролл до конца — снимаем fade-mask (класс .at-end)
    //    c) для .fs добавляем точечную пагинацию (как Stories)
    var scrollers = document.querySelectorAll('.flow, .fs');
    scrollers.forEach(function(el){
      var overflow = el.scrollWidth - el.clientWidth;
      var children = el.children.length;
      var dots = null;
      // dots — только для .fs и только если карточек >=2 и есть переполнение
      if (el.classList.contains('fs') && children >= 2 && overflow > 4) {
        dots = document.createElement('div');
        dots.className = 'fs-dots';
        for (var i = 0; i < children; i++) {
          var d = document.createElement('span');
          d.className = 'fs-dot' + (i === 0 ? ' on' : '');
          dots.appendChild(d);
        }
        el.parentNode.insertBefore(dots, el.nextSibling);
      }
      if (overflow <= 4) { el.classList.add('at-end'); return; }
      function update(){
        var atEnd = (el.scrollLeft + el.clientWidth) >= (el.scrollWidth - 4);
        el.classList.toggle('at-end', atEnd);
        if (dots) {
          var first = el.children[0];
          var step = first ? (first.offsetWidth + 10) : 1; // gap≈10
          var idx = Math.min(children - 1, Math.round(el.scrollLeft / step));
          var nodes = dots.querySelectorAll('.fs-dot');
          for (var k = 0; k < nodes.length; k++) nodes[k].classList.toggle('on', k === idx);
        }
      }
      el.addEventListener('scroll', update, {passive:true});
      // bounce-hint через 600ms: scrollLeft → 28 → 0 с smooth
      setTimeout(function(){
        el.scrollTo({left:28, behavior:'smooth'});
        setTimeout(function(){ el.scrollTo({left:0, behavior:'smooth'}); }, 450);
      }, 600);
    });
  });

  function isPrevFinish(href){ return href && href.indexOf('shell/app.html') !== -1; }
})();
