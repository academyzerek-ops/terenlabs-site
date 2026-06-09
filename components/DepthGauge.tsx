"use client";

import { useEffect, useRef } from "react";

// Глубиномер: фиксированная шкала справа, метры растут по мере скролла.
// «Глубина анализа» — буквально. Обновляется через rAF, только transform/text.
const MAX_DEPTH = 320;

export function DepthGauge() {
  const numRef = useRef<HTMLSpanElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      if (numRef.current) numRef.current.textContent = String(Math.round(p * MAX_DEPTH));
      if (needleRef.current) needleRef.current.style.transform = `translateY(${(p * 152).toFixed(1)}px)`;
      raf.current = 0;
    };
    const onScroll = () => {
      if (!raf.current) raf.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-7 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 xl:flex"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-teal/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
        глубина
      </span>
      <div className="relative h-40 w-px bg-gradient-to-b from-teal/10 via-teal/50 to-teal/10">
        {/* деления */}
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="absolute left-1/2 h-px w-2 -translate-x-1/2 bg-teal/40"
            style={{ top: `${i * 25}%` }}
          />
        ))}
        {/* игла-поплавок */}
        <div ref={needleRef} className="absolute -left-[3.5px] -top-1 will-change-transform">
          <span className="block h-2 w-2 rounded-full bg-teal shadow-[0_0_10px_rgba(0,183,194,0.9)]" />
        </div>
      </div>
      <span className="num text-sm font-semibold text-teal drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
        <span ref={numRef}>0</span> м
      </span>
    </div>
  );
}
