"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

// «Вселенная кейсов» (идея Адиля): каждая история — светящаяся точка в толще
// воды. Успехи всплывают к поверхности, провалы тонут ко дну, опыт дрейфует
// посередине. Позиции детерминированы хэшем слага — карта стабильна между
// рендерами и визитами. Клик по точке открывает кейс, легенда фильтрует.

export type UniverseItem = {
  slug: string;
  title: string;
  badge?: string | null;
  href: string;
};

type Kind = "fail" | "win" | "exp";

const KIND_META: Record<Kind, { label: string; color: string; glow: string }> = {
  win: { label: "Успех", color: "#2fd4c0", glow: "rgba(47, 212, 192, 0.55)" },
  exp: { label: "Опыт", color: "#e0b75c", glow: "rgba(224, 183, 92, 0.5)" },
  fail: { label: "Провал", color: "#e06a50", glow: "rgba(224, 106, 80, 0.5)" },
};

function kindOf(badge?: string | null): Kind {
  if (badge === "Провал") return "fail";
  if (badge === "Успех") return "win";
  return "exp";
}

// детерминированный хэш (FNV-1a): позиция точки не зависит от порядка данных
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// глубина по исходу: успехи у поверхности, провалы у дна, опыт в середине
const DEPTH: Record<Kind, [number, number]> = {
  win: [10, 40],
  exp: [38, 68],
  fail: [62, 90],
};

export function CaseUniverse({ items }: { items: UniverseItem[] }) {
  const [active, setActive] = useState<Kind | null>(null);

  const stars = useMemo(
    () =>
      items.map((it) => {
        const kind = kindOf(it.badge);
        const h = hash(it.slug);
        const [top, bottom] = DEPTH[kind];
        return {
          ...it,
          kind,
          x: 3 + ((h % 9400) / 9400) * 94, // 3..97%
          y: top + (((h >> 8) % 8192) / 8192) * (bottom - top),
          size: 5 + ((h >> 16) % 4), // 5..8 px
          dur: 3.5 + ((h >> 20) % 30) / 10, // 3.5..6.5 s
          delay: -(((h >> 24) % 50) / 10), // 0..-5 s
        };
      }),
    [items]
  );

  return (
    <section
      className="grain-fine relative overflow-hidden rounded-[var(--radius-lg)]"
      style={{
        background:
          "radial-gradient(75% 60% at 50% 0%, #13405c 0%, transparent 60%), linear-gradient(180deg, #0d2b45 0%, #050f1c 100%)",
      }}
      aria-label="Карта кейсов: успехи у поверхности, провалы на дне"
    >
      {/* легенда — она же фильтр подсветки */}
      <div className="relative z-20 flex flex-wrap items-center gap-x-5 gap-y-2 px-6 pt-5 sm:px-8">
        {(Object.keys(KIND_META) as Kind[]).map((k) => (
          <button
            key={k}
            onClick={() => setActive(active === k ? null : k)}
            className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] transition-opacity ${
              active && active !== k ? "opacity-35" : "opacity-90"
            }`}
            style={{ color: KIND_META[k].color }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: KIND_META[k].color, boxShadow: `0 0 8px ${KIND_META[k].glow}` }}
            />
            {KIND_META[k].label}
          </button>
        ))}
        <span className="ml-auto hidden text-xs text-foam/40 sm:block">
          успехи всплывают · провалы тонут
        </span>
      </div>

      {/* толща воды с историями */}
      <div className="relative h-[380px] sm:h-[460px]">
        {stars.map((s) => {
          const meta = KIND_META[s.kind];
          const dimmed = active !== null && active !== s.kind;
          return (
            <Link
              key={s.slug}
              href={s.href}
              title={s.title}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 p-2.5"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                opacity: dimmed ? 0.12 : 1,
                transition: "opacity 0.4s var(--ease-out-tl)",
                pointerEvents: dimmed ? "none" : undefined,
              }}
            >
              <span
                className="case-star block rounded-full transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[2]"
                style={{
                  width: s.size,
                  height: s.size,
                  background: meta.color,
                  boxShadow: `0 0 ${s.size * 2.2}px ${meta.glow}`,
                  "--star-dur": `${s.dur}s`,
                  "--star-delay": `${s.delay}s`,
                } as React.CSSProperties}
              />
              {/* имя истории всплывает у точки */}
              <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 w-max max-w-[240px] -translate-x-1/2 rounded-xl border border-white/15 bg-navy-900/95 px-3.5 py-2 text-[13px] font-semibold leading-snug text-foam opacity-0 shadow-[0_12px_32px_rgba(2,10,18,0.6)] backdrop-blur transition-opacity duration-200 group-hover:opacity-100">
                {s.title}
                <span className="mt-0.5 block text-[11px] font-normal" style={{ color: meta.color }}>
                  {meta.label} · читать →
                </span>
              </span>
            </Link>
          );
        })}

        {/* отметки толщи — как на глубиномере */}
        <div className="pointer-events-none absolute inset-y-6 right-4 hidden flex-col justify-between text-right font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-foam/25 sm:flex">
          <span>поверхность</span>
          <span>дно</span>
        </div>
      </div>
    </section>
  );
}
