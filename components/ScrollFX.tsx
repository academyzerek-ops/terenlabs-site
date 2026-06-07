"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Сценические эффекты сайта (один лёгкий движок, без библиотек):
// 1) .reveal → .in при входе в вьюпорт (всплытие из глубины)
// 2) [data-countup] — числа набегают при появлении
// 3) биолюминесцентное свечение за курсором (desktop, без reduced-motion)
// 4) тонкая линия прогресса скролла под шапкой
export function ScrollFX() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- 1. всплытие ----
    const revealEls = document.querySelectorAll<HTMLElement>(".reveal:not(.in)");
    let io: IntersectionObserver | undefined;
    if (reduced) {
      revealEls.forEach((el) => el.classList.add("in"));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            // раскрываем и то, что уже пролистали выше вьюпорта (быстрый скролл/прыжок)
            if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
              (e.target as HTMLElement).classList.add("in");
              io!.unobserve(e.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealEls.forEach((el) => io!.observe(el));
    }

    // ---- 2. count-up ----
    const numEls = document.querySelectorAll<HTMLElement>("[data-countup]:not([data-counted])");
    let ioNum: IntersectionObserver | undefined;
    if (!reduced && numEls.length) {
      ioNum = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const el = e.target as HTMLElement;
            ioNum!.unobserve(el);
            el.setAttribute("data-counted", "1");
            const final = el.dataset.countup || el.textContent || "";
            // считаем только числовую часть, префикс/суффикс сохраняем («−1.4 млн ₸», «42»)
            const m = final.match(/-?−?\d+(?:[.,]\d+)?/);
            if (!m) continue;
            const numStr = m[0].replace("−", "-").replace(",", ".");
            const target = parseFloat(numStr);
            const decimals = (numStr.split(".")[1] || "").length;
            const t0 = performance.now();
            const dur = 1100;
            const frame = (t: number) => {
              const p = Math.min(1, (t - t0) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              const val = (target * eased).toFixed(decimals).replace("-", "−").replace(".", final.includes(",") ? "," : ".");
              el.textContent = final.replace(m[0], val);
              if (p < 1) requestAnimationFrame(frame);
              else el.textContent = final;
            };
            requestAnimationFrame(frame);
          }
        },
        { threshold: 0.5 }
      );
      numEls.forEach((el) => {
        if (!el.dataset.countup) el.dataset.countup = el.textContent || "";
        ioNum!.observe(el);
      });
    }

    return () => {
      io?.disconnect();
      ioNum?.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    // ---- 3. свечение за курсором ----
    let glow: HTMLDivElement | undefined;
    let raf = 0;
    if (!reduced && finePointer) {
      glow = document.createElement("div");
      glow.className = "cursor-glow";
      glow.setAttribute("aria-hidden", "true");
      document.body.appendChild(glow);
      let x = -600, y = -600, tx = x, ty = y;
      const onMove = (e: PointerEvent) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!raf) loop();
      };
      const loop = () => {
        x += (tx - x) * 0.12;
        y += (ty - y) * 0.12;
        glow!.style.transform = `translate(${x - 300}px, ${y - 300}px)`;
        raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      glow.dataset.cleanup = "1";
      (glow as HTMLDivElement & { _off?: () => void })._off = () =>
        window.removeEventListener("pointermove", onMove);
    }

    // ---- 4. прогресс скролла ----
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      bar.remove();
      if (glow) {
        (glow as HTMLDivElement & { _off?: () => void })._off?.();
        cancelAnimationFrame(raf);
        glow.remove();
      }
    };
  }, []);

  return null;
}
