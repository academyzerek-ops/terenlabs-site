"use client";

import { useEffect, useState } from "react";

// Hero-видео (4 МБ) — главный пожиратель мобильного LCP (Lighthouse 18.07:
// perf 63, LCP 6.8с). На телефонах и слабом железе рендерим ТОЛЬКО постер:
// картинка та же, трафика в ~50 раз меньше. Десктоп получает живой океан.
export function HeroVideo() {
  const [wantVideo, setWantVideo] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const weak = (nav.deviceMemory ?? 8) <= 4;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setWantVideo(window.innerWidth >= 768 && !weak && !reduced);
  }, []);

  if (!wantVideo) {
    return (
      <img
        src="/brand/ocean-evolution-poster.jpg?v=6"
        alt=""
        aria-hidden="true"
        className="hero-parallax pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
      />
    );
  }
  return (
    <video
      className="hero-parallax pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
      poster="/brand/ocean-evolution-poster.jpg?v=6"
    >
      <source src="/brand/ocean-evolution.mp4?v=6" type="video/mp4" />
    </video>
  );
}
