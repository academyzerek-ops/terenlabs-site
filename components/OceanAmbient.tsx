"use client";

import { useEffect, useRef } from "react";

// Локальный зацикленный гул океана. ВАЖНО: положи файл в public/audio/ —
// раньше src вёл на soundjay.com, который (1) блокируется CSP `media-src 'self'`,
// (2) запрещает хотлинк лицензией. Пока файла нет — play() тихо отклоняется, без звука.
const AMBIENT_SRC = "/audio/ocean-ambient.mp3";

/**
 * OceanAmbient — звуковой ландшафт океана.
 * Гул глубины. Начинает играть после первого взаимодействия (автоплей запрещён).
 */
export function OceanAmbient() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const audio = new Audio(AMBIENT_SRC);
    audio.loop = true;
    audio.volume = 0; // нарастание с нуля (fade-in)
    audioRef.current = audio;

    const startAudio = () => {
      audio
        .play()
        .then(() => {
          let v = 0;
          fadeRef.current = setInterval(() => {
            v += 0.01;
            audio.volume = Math.min(v, 0.12);
            if (v >= 0.12 && fadeRef.current) clearInterval(fadeRef.current);
          }, 100);
        })
        .catch(() => {});
    };

    const opts = { once: true } as const;
    window.addEventListener("mousedown", startAudio, opts);
    window.addEventListener("touchstart", startAudio, opts);
    window.addEventListener("keydown", startAudio, opts);
    window.addEventListener("scroll", startAudio, opts);

    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current); // чистим фейд (была утечка)
      audio.pause();
      window.removeEventListener("mousedown", startAudio);
      window.removeEventListener("touchstart", startAudio);
      window.removeEventListener("keydown", startAudio);
      window.removeEventListener("scroll", startAudio);
    };
  }, []);

  return null;
}
