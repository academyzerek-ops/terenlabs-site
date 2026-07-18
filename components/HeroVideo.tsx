"use client";

import { useEffect, useState } from "react";
import { preload } from "react-dom";

// Hero-видео (4 МБ) — пожиратель мобильного LCP. Телефоны и слабое железо
// получают ТОЛЬКО постер (webp 29 КБ, preload с высоким приоритетом);
// десктоп — живой океан. LCP-дожим 18.07: preload + fetchPriority, чтобы
// браузер тянул постер первым, а не после гидрации.
const POSTER_M = "/brand/ocean-evolution-poster-m.webp";
const POSTER = "/brand/ocean-evolution-poster.webp";

export function HeroVideo() {
  const [wantVideo, setWantVideo] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const weak = (nav.deviceMemory ?? 8) <= 4;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setWantVideo(window.innerWidth >= 768 && !weak && !reduced);
  }, []);

  // hoisted в <head> при SSR — постер начинает качаться до JS
  preload(POSTER_M, { as: "image", fetchPriority: "high", media: "(max-width: 767px)" } as Parameters<typeof preload>[1]);
  preload(POSTER, { as: "image", fetchPriority: "high", media: "(min-width: 768px)" } as Parameters<typeof preload>[1]);

  if (!wantVideo) {
    return (
      <picture>
        <source media="(max-width: 767px)" srcSet={POSTER_M} />
        <img
          src={POSTER}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="hero-parallax pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        />
      </picture>
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
      poster={POSTER}
    >
      <source src="/brand/ocean-evolution.mp4?v=6" type="video/mp4" />
    </video>
  );
}
