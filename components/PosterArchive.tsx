"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CatalogItem } from "@/lib/content";
import { caseTag } from "./CaseCard";
import lessons from "@/content/case-lessons.json";

// «Архив дел» — bento-сетка кейсов/обзоров на кинокадрах.
// Ритм: каждая ~девятая карточка — широкая «врезка» (как разворот в журнале),
// остальные — вертикальные постеры. Цвет исхода — корешок и тэг (канон Mini App:
// Красный/Жёлтый/Зелёный + гео), на hover кадр наплывает и снизу поднимается
// урок кейса. Никаких счётчиков контента в витрине (правило Адиля).

type Lesson = { label: string; text: string };
const LESSONS = lessons as Record<string, Lesson>;

const TONES = {
  r: { label: "Красный", color: "#FF6B6B", dot: "#d04f33", tint: "rgba(208,79,51,0.16)" },
  y: { label: "Жёлтый", color: "#FFD600", dot: "#d4a82b", tint: "rgba(212,168,43,0.18)" },
  g: { label: "Зелёный", color: "#00E676", dot: "#1f9e74", tint: "rgba(31,158,116,0.16)" },
} as const;

type Outcome = "all" | "r" | "y" | "g";
const FILTERS: { key: Outcome; label: string; dot?: string }[] = [
  { key: "all", label: "Все" },
  { key: "r", label: "Красный", dot: TONES.r.dot },
  { key: "y", label: "Жёлтый", dot: TONES.y.dot },
  { key: "g", label: "Зелёный", dot: TONES.g.dot },
];

function Tile({ p, featured, delay, kind }: { p: CatalogItem; featured: boolean; delay: number; kind: "case" | "review" }) {
  const isCase = kind === "case";
  const tone = isCase ? TONES[caseTag(p)] : null;
  const lesson = isCase ? LESSONS[p.slug] ?? null : null;
  const hoverText = lesson?.text ?? p.blurb;
  const hoverLabel = lesson?.label ?? (isCase ? "Суть кейса" : "О чём обзор");

  return (
    <Link
      href={p.href}
      className={`rise group relative block overflow-hidden rounded-[var(--radius-tl)] bg-[#0a2236] ring-1 ring-white/[0.06] transition-shadow duration-500 hover:ring-white/[0.14] hover:shadow-[0_28px_60px_-30px_rgba(0,0,0,0.8)] ${
        featured ? "col-span-2 sm:col-span-4 lg:col-span-4" : "col-span-1 sm:col-span-2 lg:col-span-2"
      } row-span-2`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* кинокадр — во весь тайл, наплыв на hover */}
      {p.img ? (
        <Image
          src={p.img}
          alt=""
          fill
          sizes={featured ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 50vw, 33vw"}
          className="object-cover opacity-90 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.06]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-15">
          {p.ico || "🌊"}
        </div>
      )}
      {/* глубина: градиент под текст — читаемость на любом кадре */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#04101d] via-[#04101d]/35 to-transparent"
      />
      {/* корешок исхода */}
      {tone && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[3px] transition-all duration-500 group-hover:w-[5px]"
          style={{ background: tone.dot }}
        />
      )}

      {/* верхняя строка: тэг исхода · гео */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        {tone ? (
          <span
            className="num rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] backdrop-blur-none"
            style={{ color: tone.color, background: "rgba(4,16,29,0.55)" }}
          >
            {tone.label}
          </span>
        ) : (
          <span className="num rounded-full bg-[rgba(4,16,29,0.55)] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-foam/70">
            {p.badge || "Обзор"}
          </span>
        )}
        {p.loc && <span className="num text-[0.7rem] font-medium tracking-[0.06em] text-foam/75">{p.loc}</span>}
      </div>

      {/* низ: заголовок (+ выжимка у врезки); на hover уступает место уроку */}
      <div className="absolute inset-x-0 bottom-0 p-4 transition-opacity duration-300 group-hover:opacity-0 sm:p-5">
        {p.titleHtml ? (
          <h3
            className={`case-title-em font-semibold leading-[1.14] !text-foam ${
              featured ? "text-xl sm:text-3xl" : "text-[1rem] sm:text-[1.15rem] line-clamp-3"
            }`}
            dangerouslySetInnerHTML={{ __html: p.titleHtml }}
          />
        ) : (
          <h3
            className={`font-semibold leading-[1.14] !text-foam ${
              featured ? "text-xl sm:text-3xl" : "text-[1rem] sm:text-[1.15rem] line-clamp-3"
            }`}
          >
            {p.title}
          </h3>
        )}
        {featured && p.blurb && (
          <p className="mt-2.5 hidden max-w-xl text-sm leading-relaxed text-foam/65 sm:line-clamp-2">{p.blurb}</p>
        )}
      </div>

      {/* урок — плашка, выезжает снизу на hover (transform-only) */}
      {hoverText && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0 sm:p-5"
          style={{
            background: "#05131f",
            borderTop: `2px solid ${tone?.dot ?? "var(--color-teal)"}`,
          }}
        >
          <p
            className="num text-[0.62rem] font-bold uppercase tracking-[0.16em]"
            style={{ color: tone?.color ?? "var(--color-teal)" }}
          >
            {hoverLabel}
          </p>
          <p className={`mt-1.5 text-sm leading-snug text-foam ${featured ? "line-clamp-3" : "line-clamp-4"}`}>
            {hoverText}
          </p>
          <span className="num mt-2 inline-block text-[0.72rem] font-semibold" style={{ color: tone?.color ?? "var(--color-teal)" }}>
            Читать разбор →
          </span>
        </div>
      )}
    </Link>
  );
}

export function PosterArchive({ items, kind }: { items: CatalogItem[]; kind: "case" | "review" }) {
  const [outcome, setOutcome] = useState<Outcome>("all");
  const filtered = useMemo(
    () => (kind === "case" && outcome !== "all" ? items.filter((p) => caseTag(p) === outcome) : items),
    [items, outcome, kind]
  );

  return (
    <section className="relative bg-[#06182a] py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        {/* фильтры исходов — как в Mini App: Все · Красный · Жёлтый · Зелёный */}
        {kind === "case" && (
          <div className="mb-8 flex flex-wrap gap-2.5">
            {FILTERS.map((f) => {
              const active = outcome === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setOutcome(f.key)}
                  aria-pressed={active}
                  className={`btn-press flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    active
                      ? "border-transparent text-foam"
                      : "border-white/10 text-foam/50 hover:border-white/25 hover:text-foam"
                  }`}
                  style={active ? { background: f.key === "all" ? "rgba(0,183,194,0.18)" : TONES[f.key as "r" | "y" | "g"].tint } : undefined}
                >
                  {f.dot && <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.dot }} aria-hidden="true" />}
                  {f.label}
                </button>
              );
            })}
          </div>
        )}

        {/* bento: каждая ~9-я карточка — широкая врезка, остальные — постеры */}
        <div
          key={kind === "case" ? outcome : "grid"}
          className="grid auto-rows-[9rem] grid-cols-2 gap-3 sm:grid-cols-4 sm:auto-rows-[10.5rem] md:gap-4 lg:grid-cols-6"
        >
          {filtered.map((p, i) => (
            // врезка — каждая ~девятая, но только с кинокадром (без него широкий тайл пуст)
            <Tile key={p.slug} p={p} kind={kind} featured={i % 9 === 0 && Boolean(p.img)} delay={(i % 12) * 50} />
          ))}
        </div>
      </div>
    </section>
  );
}
