"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AcademyTrack } from "@/lib/learn";
import { plural } from "@/lib/content";

// Обложки треков в стиле «тушь» (public/academy-assets/tracks). Пока обложки нет,
// превью рисуется как лист документа с названием и первыми уроками.
const TRACK_COVER: Record<string, string> = Object.fromEntries(
  [
    "fundament", "architect", "management", "marketing", "finance", "legal", "models", "startup",
    // темы блока «Фаундер»
    "founder-team", "founder-market", "founder-model", "founder-unit", "founder-pitch", "founder-invest",
  ].map((k) => [
    `course-${k}`,
    `/academy-assets/tracks/track-${k}.webp?v=6`,
  ])
);

// Лента треков Академии по образцу «Learn» в Notion: карточки в горизонтальной
// прокрутке, скругление 12, затемнение по краям там, где лента продолжается,
// стрелки для прокрутки на десктопе. Превью светлое: «лист» документа с названием
// трека и первыми уроками.
export { TRACK_COVER };

export function TrackCards({ tracks }: { tracks: AcademyTrack[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = (card?.offsetWidth ?? 288) + 16;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  return (
    <div className="group/row relative">
      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-proximity gap-4 overflow-x-auto pb-1"
      >
        {tracks.map((t) => {
          // в превью показываем содержание: у трека из одного урока — названия глав,
          // у остальных — названия уроков
          const lessons =
            t.modules.length === 1
              ? t.modules[0].chapters.slice(0, 5).map((c, i) => ({ id: `c${i}`, title: c.title }))
              : t.modules.slice(0, 5);
          return (
            <Link
              key={t.slug}
              href={`/courses/${t.slug}`}
              data-card
              className="group flex w-[270px] shrink-0 snap-start flex-col overflow-hidden rounded-[12px] border border-line bg-card transition-colors hover:border-line-2 hover:bg-card-2 sm:w-[288px]"
            >
              {/* светлое превью: обложка тушью или лист документа на серой подложке */}
              {TRACK_COVER[t.slug] ? (
                <div className="h-[170px] overflow-hidden bg-page">
                  <img
                    src={TRACK_COVER[t.slug]}
                    alt=""
                    width={1200}
                    height={800}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
              <div className="h-[170px] bg-panel-bg px-6 pt-6">
                <div className="h-full rounded-t-[6px] bg-raised px-5 pt-5 shadow-[var(--shadow-tl-sm)]">
                  <div className="truncate text-[10px] uppercase tracking-[0.08em] text-faint">
                    {t.subtitle}
                  </div>
                  <div className="mt-1.5 line-clamp-2 text-[16px] font-semibold leading-snug text-ink">
                    {t.title}
                  </div>
                  <div className="mt-3 flex flex-col gap-[7px]">
                    {lessons.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 text-[11px] leading-none text-text-2">
                        <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-faint" />
                        <span className="truncate">{m.title.replace(/^Урок \d+ · /, "")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              )}
              <div className="flex flex-1 flex-col gap-2.5 p-4">
                <div className="text-[15px] font-semibold leading-snug text-ink">{t.title}</div>
                <div className="num mt-auto flex items-center gap-2 text-[13px] text-text-2">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 3.5h4.5A1.5 1.5 0 0 1 8 5v8.5A1.5 1.5 0 0 0 6.5 12H2zM14 3.5H9.5A1.5 1.5 0 0 0 8 5v8.5a1.5 1.5 0 0 1 1.5-1.5H14z" />
                  </svg>
                  {t.modules.length > 1
                    ? `${t.modules.length} ${plural(t.modules.length, "урок", "урока", "уроков")} · `
                    : ""}
                  {t.chapterTotal} {plural(t.chapterTotal, "глава", "главы", "глав")}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* затемнение краёв: только с той стороны, где лента продолжается */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-page to-transparent transition-opacity ${canLeft ? "opacity-100" : "opacity-0"}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-page to-transparent transition-opacity ${canRight ? "opacity-100" : "opacity-0"}`}
      />

      {/* стрелки: появляются при наведении на ленту, только на десктопе */}
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Назад"
        className={`absolute left-2 top-[85px] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line-2 bg-subtle text-ink shadow-[var(--shadow-tl)] transition-opacity hover:bg-hover md:flex ${
          canLeft ? "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Дальше"
        className={`absolute right-2 top-[85px] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line-2 bg-subtle text-ink shadow-[var(--shadow-tl)] transition-opacity hover:bg-hover md:flex ${
          canRight ? "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
      </button>
    </div>
  );
}
