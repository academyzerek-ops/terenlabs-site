// Эффекты для wiki-обзоров: пончик (разная толщина долей + hover-подсветка),
// живые счётчики (count-up) на цифрах, мягкое появление блоков при скролле.
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- подписи колонок в таблицах ----------
     На телефоне таблица из четырёх колонок листалась вбок. Чтобы она могла
     разложиться карточками, каждой ячейке проставляем заголовок её колонки,
     а CSS уже выводит его через ::before. */
  function labelCells(table) {
    if (table.dataset.lab) return;
    table.dataset.lab = "1";
    var heads = [].slice.call(table.querySelectorAll("thead th")).map(function (th) {
      return (th.textContent || "").trim();
    });
    if (!heads.length) return;
    [].slice.call(table.querySelectorAll("tbody tr")).forEach(function (tr) {
      [].slice.call(tr.children).forEach(function (td, i) {
        if (heads[i]) td.setAttribute("data-l", heads[i]);
      });
    });
  }

  /* ---------- пончик ---------- */
  function enhanceDonut(wrap) {
    var svg = wrap.querySelector(".donut");
    if (!svg || svg.dataset.enh) return;
    svg.dataset.enh = "1";
    var legItems = [].slice.call(wrap.querySelectorAll(".leg-i"));
    var segs = [].slice.call(svg.querySelectorAll("circle")).filter(function (c) {
      return c.getAttribute("stroke-dasharray");
    });
    if (!segs.length) return;
    var base = segs.map(function (c) { return parseFloat(getComputedStyle(c).strokeWidth) || 5.5; });
    segs.forEach(function (c, i) {
      c.style.transition = "stroke-width .2s ease, opacity .2s ease, filter .2s ease";
      var leg = legItems[i];
      function on() {
        c.style.strokeWidth = (base[i] + 2.2).toFixed(2);
        c.style.filter = "brightness(1.18) drop-shadow(0 0 5px currentColor)";
        segs.forEach(function (o, j) { if (j !== i) o.style.opacity = "0.35"; });
        legItems.forEach(function (l, j) { if (l) { l.classList.toggle("leg-hot", j === i); l.classList.toggle("leg-dim", j !== i); } });
      }
      function off() {
        c.style.strokeWidth = "";
        c.style.filter = "";
        segs.forEach(function (o) { o.style.opacity = "1"; });
        legItems.forEach(function (l) { if (l) l.classList.remove("leg-hot", "leg-dim"); });
      }
      c.style.cursor = "default";
      c.addEventListener("mouseenter", on); c.addEventListener("mouseleave", off);
      if (leg) { leg.style.cursor = "default"; leg.addEventListener("mouseenter", on); leg.addEventListener("mouseleave", off); }
    });
  }

  /* ---------- count-up ---------- */
  var NUM = /(\d[\d\s  ]*\d|\d)/g;
  function prep(el) {
    if (el.dataset.cu) return false;
    var orig = el.textContent, parts = [], last = 0, m;
    while ((m = NUM.exec(orig))) {
      parts.push({ s: orig.slice(last, m.index) });
      parts.push({ n: parseInt(m[0].replace(/\D/g, ""), 10), grp: /[\s  ]/.test(m[0]) || +m[0].replace(/\D/g, "") >= 1000 });
      last = m.index + m[0].length;
    }
    parts.push({ s: orig.slice(last) });
    if (!parts.some(function (p) { return "n" in p; })) return false;
    el.dataset.cu = "1"; el._orig = orig; el._parts = parts; return true;
  }
  function animate(el) {
    if (reduce) return;
    var parts = el._parts, orig = el._orig, dur = 950, t0 = performance.now();
    (function frame(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = parts.map(function (pt) {
        if ("s" in pt) return pt.s;
        var c = Math.round(pt.n * e);
        return pt.grp ? c.toLocaleString("ru-RU") : String(c);
      }).join("");
      if (p < 1) requestAnimationFrame(frame); else el.textContent = orig;
    })(t0);
  }

  /* ---------- тематический фон секции (атмосфера, не отдельный блок) ---------- */
  // элемент уходит за правый край секции, прозрачность подстраивается под яркость
  function ghostBg(block, src) {
    if (!block) return;
    var sec = block.closest(".c, section, .ins") || block.parentElement;
    if (!sec || sec.dataset.ghost) return;
    var img = new Image();
    img.onload = function () {
      if (sec.dataset.ghost) return;
      sec.dataset.ghost = "1";
      var op = 0.15;
      try {
        var cv = document.createElement("canvas"); cv.width = 36; cv.height = 36;
        var cx = cv.getContext("2d"); cx.drawImage(img, 0, 0, 36, 36);
        var dt = cx.getImageData(0, 0, 36, 36).data, s = 0, n = 0;
        for (var i = 0; i < dt.length; i += 4) if (dt[i + 3] > 24) { s += 0.299 * dt[i] + 0.587 * dt[i + 1] + 0.114 * dt[i + 2]; n++; }
        var lum = n ? s / n : 128;
        op = lum > 155 ? 0.085 : lum > 95 ? 0.12 : 0.17; // ярче картинка → тише фон
      } catch (e) {}
      if (getComputedStyle(sec).position === "static") sec.style.position = "relative";
      // элемент виден целиком (не срезан краями секции): вписан, тихий фон справа
      img.style.cssText = "position:absolute;right:18px;top:50%;transform:translateY(-50%);max-height:86%;max-width:40%;width:auto;height:auto;object-fit:contain;opacity:" + op + ";pointer-events:none;z-index:0;user-select:none";
      sec.appendChild(img);
      [].slice.call(sec.children).forEach(function (c) {
        if (c !== img && getComputedStyle(c).position === "static") { c.style.position = "relative"; c.style.zIndex = "1"; }
      });
    };
    img.src = src;
  }
  function placeElement() {
    var phero = document.querySelector(".phero img");
    if (!phero) return;
    var m = (phero.getAttribute("src") || "").match(/niche_hero\/([a-z0-9_]+)\.webp/);
    if (!m) return;
    var code = m[1];
    var bars = [].slice.call(document.querySelectorAll(".bars")).filter(function (b) { return /млн|тыс|₸/.test(b.textContent); })[0] || document.querySelector(".bars");
    ghostBg(bars, "/academy-assets/elements/" + code + "_a.png");
    ghostBg(document.querySelector(".donut-wrap"), "/academy-assets/elements/" + code + "_b.png");
  }

  /* ---------- появление блоков ---------- */
  function run() {
    document.querySelectorAll("table.dt").forEach(labelCells);
    document.querySelectorAll(".donut-wrap").forEach(enhanceDonut);
    try { placeElement(); } catch (e) {}

    var counters = [].slice.call(document.querySelectorAll(".nb-n, .tldr-k, .bar-v, .leg-v")).filter(prep);
    var blocks = [].slice.call(document.querySelectorAll(".c, .tldr, .ins, .nb, .bars, .donut-wrap, .risk, .pq, .vs, .tk, .ex, .dtw, .stat4"));

    if (!reduce) blocks.forEach(function (b) { if (!b.closest(".phero")) { b.style.opacity = "0"; b.style.transform = "translateY(14px)"; b.style.transition = "opacity .55s ease, transform .55s cubic-bezier(.22,.72,0,1)"; } });

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate); blocks.forEach(function (b) { b.style.opacity = ""; b.style.transform = ""; });
      return;
    }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        if (t._parts) animate(t);
        else { t.style.opacity = "1"; t.style.transform = "none"; }
        io.unobserve(t);
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -8% 0px" });
    counters.forEach(function (c) { io.observe(c); });
    blocks.forEach(function (b) { io.observe(b); });

    // Failsafe: в некоторых iframe-контекстах (плеер курса) IntersectionObserver
    // не срабатывает — раскрываем блоки в зоне видимости по скроллу/таймеру,
    // чтобы контент никогда не оставался скрытым (opacity:0).
    function revealInView() {
      var vh = window.innerHeight || document.documentElement.clientHeight || 800;
      blocks.forEach(function (b) {
        if (b.style.opacity !== "0") return;
        if (b.getBoundingClientRect().top < vh * 0.94) { b.style.opacity = "1"; b.style.transform = "none"; }
      });
    }
    window.addEventListener("scroll", revealInView, { passive: true, capture: true });
    window.addEventListener("wheel", revealInView, { passive: true });
    window.addEventListener("touchmove", revealInView, { passive: true });
    window.addEventListener("keydown", revealInView, { passive: true });
    window.addEventListener("resize", revealInView, { passive: true });
    revealInView();
    // бэкап-поллинг: если scroll-событие в iframe не доходит, всё равно раскрываем
    // блоки в зоне видимости (~15с, дальше хватает listener'ов)
    var ticks = 0;
    var poll = setInterval(function () {
      revealInView();
      if (++ticks > 60 || blocks.every(function (b) { return b.style.opacity !== "0"; })) clearInterval(poll);
    }, 250);
  }

  /* ---------- высота наверх ----------
     На телефоне обзор показывается не в своей прокрутке, а обычной страницей:
     рамке снаружи нужна высота содержимого. Отправляем её при загрузке, после
     картинок и при изменении размеров. */
  function postHeight() {
    if (window.parent === window) return;
    try {
      window.parent.postMessage(
        { type: "tl-review-h", h: document.documentElement.scrollHeight },
        location.origin
      );
    } catch (e) {}
  }

  function watchHeight() {
    postHeight();
    window.addEventListener("load", postHeight);
    window.addEventListener("resize", postHeight);
    if (window.ResizeObserver) new ResizeObserver(postHeight).observe(document.documentElement);
    var n = 0;
    var t = setInterval(function () { postHeight(); if (++n > 20) clearInterval(t); }, 400);
  }

  if (document.readyState !== "loading") { run(); watchHeight(); }
  else document.addEventListener("DOMContentLoaded", function () { run(); watchHeight(); });
})();
