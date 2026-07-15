"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

/**
 * WordDrum — слова крутятся как на барабане/рулетке (3D-цилиндр по вертикали).
 * Каждое слово по очереди выходит вперёд, соседние уходят за «барабан».
 * Все структурные стили — инлайн (не зависим от globals.css/Tailwind).
 * Ширина = по самому длинному слову (скрытый сайзер), строка не прыгает.
 */
export function WordDrum({
  words,
  interval = 1900,
  height = 56,
  className = "",
}: {
  words: string[];
  interval?: number;
  height?: number;
  className?: string;
}) {
  const n = words.length;
  const [idx, setIdx] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) return;
    const t = setInterval(() => setIdx((i) => i + 1), interval);
    return () => clearInterval(t);
  }, [interval]);

  const step = 360 / n;
  const radius = Math.round(height / 2 / Math.tan(Math.PI / n));
  const rot = reduced ? 0 : -idx * step;
  const active = ((idx % n) + n) % n;
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");
  // видимая полоса шире (18–82%), иначе выносные элементы («р», «у») срезаются
  const fade = "linear-gradient(transparent 0%, #000 18%, #000 82%, transparent 100%)";

  const wrap: CSSProperties = {
    position: "relative",
    display: "inline-block",
    height,
    perspective: 900,
    overflow: "hidden",
    verticalAlign: "bottom",
    WebkitMaskImage: fade,
    maskImage: fade,
  };
  const cyl: CSSProperties = {
    position: "absolute",
    inset: 0,
    transformStyle: "preserve-3d",
    transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
    transform: `rotateX(${rot}deg)`,
  };
  const face = (i: number): CSSProperties => ({
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    whiteSpace: "nowrap",
    backfaceVisibility: "hidden",
    transform: `rotateX(${i * step}deg) translateZ(${radius}px)`,
  });

  return (
    <span className={className} style={wrap} aria-label={words.join(", ")}>
      <span aria-hidden style={{ visibility: "hidden", whiteSpace: "nowrap" }}>
        {longest}
      </span>
      <span style={cyl}>
        {words.map((w, i) => (
          <span key={w} aria-hidden={i !== active} style={face(i)}>
            {w}
          </span>
        ))}
      </span>
    </span>
  );
}
