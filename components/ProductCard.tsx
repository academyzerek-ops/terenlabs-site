import Link from "next/link";
import { CatalogItem, PRODUCT_TYPES } from "@/lib/content";

export function ProductCard({ p }: { p: CatalogItem }) {
  // Постер (референс-стиль): кадр на всю карточку, чип-счётчик и заголовок поверх
  if (p.img) {
    const chip = p.metric
      ? `${p.metric.value} ${p.metric.label}`
      : p.type === "review"
      ? "Бизнес-обзор · 2026"
      : p.badge ?? null;
    return (
      <Link
        href={p.href}
        className="card-premium group relative flex min-h-[420px] flex-col overflow-hidden p-0"
      >
        <img
          src={p.img}
          alt=""
          width={640}
          height={840}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* приглушение пёстрого кадра нейтрально-тёмным (не синим) + скрим */}
        <div className="absolute inset-0 bg-[#101214]/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0e10]/85 via-[#101214]/20 to-[#0c0e10]/80" />
        <div className="relative flex flex-1 flex-col p-6">
          {chip && (
            <span className="num self-start rounded-full bg-white/15 px-3.5 py-1.5 text-[0.9rem] font-semibold text-foam backdrop-blur">
              {chip}
            </span>
          )}
          <h3 className="mt-3 text-3xl leading-snug !text-foam">{p.title}</h3>
          <p className="mt-2.5 line-clamp-3 text-[16.5px] leading-relaxed text-foam/85">{p.blurb}</p>
          <div className="flex-1" />
          <div className="flex items-center justify-between border-t border-white/15 pt-3.5">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foam/55">
              {PRODUCT_TYPES[p.type].label}
            </span>
            <span className="text-[15px] font-semibold text-teal transition-transform group-hover:translate-x-1">
              Открыть →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // исход кейса — деликатный тонированный ФОН карточки (не рамка, не раскраска):
  // карточки перестают сливаться на светлом, но остаются спокойными
  const tint =
    p.type === "case"
      ? p.badge === "Провал"
        ? "rgba(208, 79, 51, 0.15)"
        : p.badge === "Успех"
        ? "rgba(31, 158, 116, 0.15)"
        : "rgba(212, 168, 43, 0.14)" // нейтральное: не убыток и не успех — просто опыт
      : null;
  return (
    <Link
      href={p.href}
      className="card-premium group relative flex flex-col overflow-hidden p-0"
      style={
        tint
          ? {
              backgroundColor: "var(--color-card)",
              backgroundImage: `linear-gradient(0deg, ${tint}, ${tint})`,
            }
          : undefined
      }
    >
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="eyebrow flex items-center gap-2">
            {p.ico && <span className="text-base">{p.ico}</span>}
            {PRODUCT_TYPES[p.type].label}
          </span>
          {p.badge && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${
                p.badge === "Провал"
                  ? "bg-[rgba(208,79,51,0.22)] text-[#b13a20]"
                  : p.badge === "Успех"
                  ? "bg-[rgba(31,158,116,0.22)] text-[#157a58]"
                  : p.type === "case"
                  ? "bg-[rgba(212,168,43,0.25)] text-[#9a7a14]"
                  : "bg-teal-200/60 text-teal-600"
              }`}
            >
              {p.badge}
            </span>
          )}
          {p.stub && !p.badge && (
            <span className="rounded-full bg-line px-2.5 py-0.5 text-[0.7rem] text-muted">скоро</span>
          )}
        </div>

        {/* двухстрочные зоны: у всех карточек ряда заголовки/тексты на одних линиях */}
        <h3 className="line-clamp-2 min-h-[2.3em] text-2xl leading-[1.15] text-heading">{p.title}</h3>
        <p className="mt-2 line-clamp-2 min-h-[3em] text-[15px] leading-relaxed text-muted">{p.blurb}</p>

        {p.metric && (
          <div className="mt-4 flex items-baseline gap-2">
            <span className="num text-3xl font-semibold text-heading">{p.metric.value}</span>
            <span className="text-sm text-muted">{p.metric.label}</span>
          </div>
        )}

        <div className="flex-1" />
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="num text-xs text-muted">{p.level} · {p.stage}</span>
          {p.price && <span className="num text-sm font-medium text-teal-600">{p.price}</span>}
        </div>
      </div>
    </Link>
  );
}
