"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/**
 * WordDrum — слова крутятся как на барабане/рулетке (3D-цилиндр по вертикали).
 * Каждое слово по очереди выходит вперёд, соседние уходят за «барабан».
 * Все структурные стили — инлайн (не зависим от globals.css/Tailwind).
 *
 * Fit-to-width: шрифт подгоняется под доступную ширину РОДИТЕЛЯ измерением
 * (ResizeObserver + скрытый измеритель на 100px), а не через vw — vw-клампы
 * трижды резали «Аналитика бизнеса» у Адиля (зум/узкое окно/кроп вьюпорта).
 * Слово физически не может быть шире контейнера.
 */
export function WordDrum({
  words,
  interval = 1900,
  maxFontPx = 34,
  minFontPx = 15,
  className = "",
}: {
  words: string[];
  interval?: number;
  maxFontPx?: number;
  minFontPx?: number;
  className?: string;
}) {
  const n = words.length;
  const [idx, setIdx] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [fontPx, setFontPx] = useState(maxFontPx);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) return;
    const t = setInterval(() => setIdx((i) => i + 1), interval);
    return () => clearInterval(t);
  }, [interval]);

  // подгонка шрифта: ширина длиннейшего слова при 100px → скейлим под родителя
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const meas = measureRef.current;
    const parent = wrap?.parentElement;
    if (!wrap || !meas || !parent) return;
    const fit = () => {
      const w100 = meas.getBoundingClientRect().width; // ширина при 100px
      if (!w100) return;
      const cs = getComputedStyle(parent);
      const avail =
        parent.clientWidth - parseFloat(cs.paddingLeft || "0") - parseFloat(cs.paddingRight || "0");
      if (avail <= 0) return;
      const next = Math.max(minFontPx, Math.min(maxFontPx, ((avail - 12) / w100) * 100));
      setFontPx(Math.floor(next * 10) / 10);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(parent);
    // веб-шрифт (Playfair) мог доехать позже — перемер
    if (document.fonts?.ready) document.fonts.ready.then(fit).catch(() => {});
    return () => ro.disconnect();
  }, [words, maxFontPx, minFontPx]);

  const height = Math.round(fontPx * 1.7); // запас под выносные («р», «у»)
  const step = 360 / n;
  const radius = Math.round(height / 2 / Math.tan(Math.PI / n));
  const rot = reduced ? 0 : -idx * step;
  const active = ((idx % n) + n) % n;
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");
  // полоса 16–84%: держит выносные, гасит края соседних граней барабана
  const fade = "linear-gradient(transparent 0%, #000 16%, #000 84%, transparent 100%)";
  // КОРЕНЬ «барабан срезан»: translateZ приближает активную грань к зрителю,
  // и перспектива рендерит её на P/(P−z) КРУПНЕЕ ширины, измеренной сайзером —
  // overflow:hidden срезал этот излишек справа. Компенсируем обратным scale.
  const PERSPECTIVE = 900;
  const zComp = (PERSPECTIVE - radius) / PERSPECTIVE;

  const wrap: CSSProperties = {
    position: "relative",
    display: "inline-block",
    height,
    maxWidth: "100%",
    // CSS-потолок (10cqw от контейнера) страхует ДО гидрации и без JS:
    // «Аналитика бизнеса» ≈ 9.3em — при 10cqw слово физически уже контейнера.
    // JS-фит ниже уточняет размер точным замером.
    fontSize: `min(${fontPx}px, 8.4cqw)`,
    perspective: PERSPECTIVE,
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
    transformOrigin: "left center",
    transform: `rotateX(${i * step}deg) translateZ(${radius}px) scale(${zComp.toFixed(4)})`,
  });

  return (
    <span className={className} style={wrap} ref={wrapRef} aria-label={words.join(", ")}>
      {/* сайзер ширины строки (текущий шрифт) */}
      <span aria-hidden style={{ visibility: "hidden", whiteSpace: "nowrap" }}>
        {longest}
      </span>
      {/* измеритель для fit-to-width: всегда 100px, вне потока */}
      <span
        ref={measureRef}
        aria-hidden
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
          visibility: "hidden",
          whiteSpace: "nowrap",
          fontSize: 100,
        }}
      >
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
