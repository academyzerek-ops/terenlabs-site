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

  return (
    <Link
      href={p.href}
      className="card-premium group relative flex flex-col overflow-hidden p-0"
    >
      {/* визуальный хедер: арт курса / эмодзи-тайл кейса */}
      {p.img ? (
        <div className="relative h-36 overflow-hidden">
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
      ) : p.ico ? (
        <div
          className="flex h-24 items-center justify-center text-5xl"
          style={{
            background:
              "radial-gradient(80% 120% at 50% 0%, #143352 0%, #0d2b45 60%, #081b2e 100%)",
          }}
        >
          <span className="drop-shadow-[0_4px_14px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-110">
            {p.ico}
          </span>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="eyebrow">{PRODUCT_TYPES[p.type].label}</span>
          {p.badge && (
            <span className="rounded-full bg-teal-200/60 px-2.5 py-0.5 text-[0.7rem] font-medium text-teal-600">
              {p.badge}
            </span>
          )}
          {p.stub && !p.badge && (
            <span className="rounded-full bg-line px-2.5 py-0.5 text-[0.7rem] text-muted">скоро</span>
          )}
        </div>

        <h3 className="text-2xl text-heading">{p.title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.blurb}</p>

        {p.metric && (
          <div className="mt-4 flex items-baseline gap-2">
            <span className="num text-3xl font-semibold text-heading">{p.metric.value}</span>
            <span className="text-sm text-muted">{p.metric.label}</span>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="num text-xs text-muted">{p.level} · {p.stage}</span>
          {p.price && <span className="num text-sm font-medium text-teal-600">{p.price}</span>}
        </div>
      </div>
    </Link>
  );
}
