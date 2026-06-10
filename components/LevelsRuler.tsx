"use client";

import { useEffect, useRef } from "react";

// Крупная линейка глубины для страницы «Океан»: метры и зона растут
// по мере погружения. Прогресс считается внутри блока #dive-wrap.
const STOPS = [0, 20, 50, 120, 300, 1000]; // глубины уровней
const ZONES = ["мелководье", "риф", "толща", "течение", "глубина", "бездна"];

export function LevelsRuler() {
  const numRef = useRef<HTMLSpanElement>(null);
  const zoneRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const wrap = document.getElementById("dive-wrap");
    if (!wrap) return;

    const update = () => {
      const r = wrap.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      // кусочная интерполяция по глубинам уровней
      const seg = Math.min(STOPS.length - 2, Math.floor(p * (STOPS.length - 1)));
      const t = p * (STOPS.length - 1) - seg;
      const depth = Math.round(STOPS[seg] + (STOPS[seg + 1] - STOPS[seg]) * t);
      if (numRef.current) numRef.current.textContent = String(depth);
      if (zoneRef.current) zoneRef.current.textContent = ZONES[Math.min(ZONES.length - 1, Math.round(p * (ZONES.length - 1)))];
      if (dotRef.current) dotRef.current.style.transform = `translateY(${(p * 248).toFixed(1)}px)`;
      raf.current = 0;
    };
    const onScroll = () => {
      if (!raf.current) raf.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-8 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-4 xl:flex"
    >
      <span
        ref={zoneRef}
        className="text-[11px] font-bold uppercase tracking-[0.3em] text-teal drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]"
      >
        мелководье
      </span>

      <div className="relative h-64 w-[3px] rounded-full bg-gradient-to-b from-teal/15 via-teal/55 to-teal/15">
        {/* деления с глубинами уровней */}
        {STOPS.map((m, i) => (
          <div
            key={m}
            className="absolute left-1/2 flex -translate-x-1/2 items-center"
            style={{ top: `${(i / (STOPS.length - 1)) * 100}%` }}
          >
            <span className="h-[2px] w-3 bg-teal/50" />
            <span className="num absolute left-5 -translate-y-1/2 whitespace-nowrap text-[10px] font-semibold text-teal/55">
              {m}
            </span>
          </div>
        ))}
        {/* поплавок */}
        <div ref={dotRef} className="absolute -left-[4.5px] -top-1.5 will-change-transform">
          <span className="block h-3 w-3 rounded-full bg-teal shadow-[0_0_16px_rgba(0,183,194,1)]" />
        </div>
      </div>

      <div className="text-center drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
        <span ref={numRef} className="num font-[family-name:var(--font-display)] text-4xl font-bold text-teal">
          0
        </span>
        <span className="ml-1 text-sm font-semibold text-teal/70">м</span>
      </div>
    </div>
  );
}
