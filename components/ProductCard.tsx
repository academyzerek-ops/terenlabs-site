import Link from "next/link";
import { CatalogItem, PRODUCT_TYPES } from "@/lib/content";

export function ProductCard({ p }: { p: CatalogItem }) {
  return (
    <Link
      href={p.href}
      className="card-premium group relative flex flex-col overflow-hidden p-0"
    >
      {/* визуальный хедер: фото ниши / арт курса / эмодзи-тайл кейса */}
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

      <h3 className="text-xl text-heading">{p.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.blurb}</p>

      {p.metric && (
        <div className="mt-5 flex items-baseline gap-2">
          <span className="num text-2xl font-medium text-heading">{p.metric.value}</span>
          <span className="text-xs text-muted">{p.metric.label}</span>
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
