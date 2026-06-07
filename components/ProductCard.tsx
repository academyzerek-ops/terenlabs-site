import Link from "next/link";
import { CatalogItem, PRODUCT_TYPES } from "@/lib/content";

export function ProductCard({ p }: { p: CatalogItem }) {
  // Обзор ниши — журнальная карточка: фото из самого обзора во всю карту,
  // заголовок и живой подзаголовок лежат на кадре.
  if (p.type === "review" && p.img) {
    return (
      <Link
        href={p.href}
        className="card-premium group relative flex min-h-[340px] flex-col justify-end overflow-hidden p-0"
      >
        <img
          src={p.img}
          alt=""
          width={640}
          height={680}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081b2e] via-[#0d2b45]/55 to-transparent" />
        <div className="relative p-6">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foam backdrop-blur">
            Бизнес-обзор · 2026
          </span>
          <h3 className="mt-3 text-2xl !text-foam">{p.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foam/75">{p.blurb}</p>
          <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
            <span className="num text-xs text-foam/55">{p.level} · на цифрах</span>
            <span className="text-sm font-semibold text-teal transition-transform group-hover:translate-x-1">
              Читать →
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
        ? "rgba(194, 91, 66, 0.07)"
        : p.badge === "Успех"
        ? "rgba(31, 138, 109, 0.07)"
        : "rgba(0, 183, 194, 0.06)"
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
      {/* визуальный хедер: арт курса / эмодзи-тайл кейса */}
      {p.img ? (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={p.img}
            alt=""
            width={640}
            height={288}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/55 to-transparent" />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="eyebrow flex items-center gap-2">
            {p.ico && <span className="text-base">{p.ico}</span>}
            {PRODUCT_TYPES[p.type].label}
          </span>
          {p.badge && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${
                p.badge === "Провал"
                  ? "bg-[rgba(180,69,47,0.12)] text-[#c25b42]"
                  : p.badge === "Успех"
                  ? "bg-[rgba(43,168,136,0.14)] text-[#1f8a6d]"
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
