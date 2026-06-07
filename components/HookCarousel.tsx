"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HOOKS } from "@/lib/content";

export function HookCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const scrollByCard = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    // зацикливание: если дошли до конца — вернуться в начало
    const max = el.scrollWidth - el.clientWidth - 4;
    if (dir === 1 && el.scrollLeft >= max) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (dir === -1 && el.scrollLeft <= 4) {
      el.scrollTo({ left: max, behavior: "smooth" });
    } else {
      el.scrollBy({ left: dir * step, behavior: "smooth" });
    }
  };

  // автоматическая смена
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => scrollByCard(1), 3500);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute -top-14 right-0 hidden gap-2 sm:flex">
        <button
          onClick={() => scrollByCard(-1)}
          aria-label="Назад"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-heading transition-colors hover:border-teal hover:text-teal"
        >
          ←
        </button>
        <button
          onClick={() => scrollByCard(1)}
          aria-label="Вперёд"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-heading transition-colors hover:border-teal hover:text-teal"
        >
          →
        </button>
      </div>

      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {HOOKS.map((h) => {
          const dot = h.accent === "danger" ? "var(--color-danger)" : "var(--color-teal)";
          return (
            <Link
              key={h.hook}
              href={h.href}
              data-card
              className="group relative flex min-h-[440px] w-[320px] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius-tl)] border border-white/10 bg-navy-900 text-foam shadow-[var(--shadow-tl)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-tl-lg)] sm:w-[400px]"
            >
              {/* картинка-шапка как у поста — приглушённая, в тему */}
              <div className="relative h-[210px] w-full shrink-0 overflow-hidden">
                {h.img && (
                  <img
                    src={h.img}
                    alt=""
                    className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {/* затемнение снизу для слияния с карточкой */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(8,27,46,0.15) 0%, rgba(8,27,46,0.55) 60%, #0d2b45 100%)",
                  }}
                />
                {/* метка-тег поверх картинки */}
                <div className="absolute left-5 top-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-foam/80">
                    {h.tag}
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex flex-1 flex-col p-6 pt-4">
                <h3
                  className="text-2xl leading-tight"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-foam)" }}
                >
                  {h.hook}
                </h3>

                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-foam/75">
                  {h.payoff}
                </p>

                <span className="mt-5 inline-block text-sm font-semibold text-teal transition-transform group-hover:translate-x-1">
                  {h.cta} →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
