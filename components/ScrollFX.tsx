"use client";

import { useEffect } from "react";

// Сценические эффекты сайта (лёгкий движок, без библиотек):
// 1) биолюминесцентное свечение за курсором (desktop, без reduced-motion)
// 2) тонкая линия прогресса скролла под шапкой
// Принцип после Safari-инцидента: контент НИКОГДА не скрывается эффектом.
export function ScrollFX() {
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
