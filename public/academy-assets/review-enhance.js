// Эффекты для wiki-обзоров (Mini App + сайт): пончик (hover-подсветка),
// живые счётчики (count-up) на цифрах, мягкое появление блоков, тематический фон секции.
// Путь к элементам выводится из src hero → один файл работает в обоих окружениях.
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var narrow = (window.innerWidth || 400) < 560;

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
      // на тач-устройствах hover нет — оставляем эффект для desktop/site
      c.addEventListener("mouseenter", on); c.addEventListener("mouseleave", off);
      if (leg) { leg.addEventListener("mouseenter", on); leg.addEventListener("mouseleave", off); }
    });
  }

  /* ---------- count-up ---------- */
  var NUM = /(\d[\d\s  ]*\d|\d)/g;
  function prep(el) {
    if (el.dataset.cu) return false;
    var orig = el.textContent;
    // дроби (1,5) и диапазоны (4,5–10,5) NUM-регекс рвёт по запятой/тире на
    // отдельные счётчики → полсекунды мелькают искажённые числа. Такие не анимируем.
    if (/\d\s*[.,]\s*\d|\d\s*[–—-]\s*\d/.test(orig)) return false;
    var parts = [], last = 0, m;
    while ((m = NUM.exec(orig))) {
      parts.push({ s: orig.slice(last, m.index) });
      parts.push({ n: parseInt(m[0].replace(/\D/g, ""), 10), grp: /[\s  ]/.test(m[0]) || +m[0].replace(/\D/g, "") >= 1000 });
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

  /* ---------- тематический фон секции ---------- */
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
      if (narrow) op = +(op * 0.7).toFixed(3); // на мобиле фон тише (бары во всю ширину)
      if (getComputedStyle(sec).position === "static") sec.style.position = "relative";
      img.style.cssText = "position:absolute;right:" + (narrow ? 6 : 18) + "px;top:50%;transform:translateY(-50%);max-height:" + (narrow ? 70 : 86) + "%;max-width:" + (narrow ? 34 : 40) + "%;width:auto;height:auto;object-fit:contain;opacity:" + op + ";pointer-events:none;z-index:0;user-select:none";
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
    var src = phero.getAttribute("src") || "";
    var m = src.match(/niche_hero\/([a-z0-9_]+)\.webp/);
    if (!m) return;
    var code = m[1];
    // база элементов = тот же путь, что и hero, но папка elements/ (работает и на сайте, и в Mini App)
    var base = src.replace(/niche_hero\/[a-z0-9_]+\.webp.*$/, "elements/");
    var bars = [].slice.call(document.querySelectorAll(".bars")).filter(function (b) { return /млн|тыс|₸/.test(b.textContent); })[0] || document.querySelector(".bars");
    ghostBg(bars, base + code + "_a.png");
    ghostBg(document.querySelector(".donut-wrap"), base + code + "_b.png");
  }

  /* ---------- появление блоков ---------- */
  function run() {
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
    }, { threshold: 0.2, rootMargin: "0px 0px -6% 0px" });
    counters.forEach(function (c) { io.observe(c); });
    blocks.forEach(function (b) { io.observe(b); });
  }

  if (document.readyState !== "loading") run();
  else document.addEventListener("DOMContentLoaded", run);
})();
