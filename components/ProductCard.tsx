import Link from "next/link";
import Image from "next/image";
import { CatalogItem, PRODUCT_TYPES } from "@/lib/content";

// Карточка каталога: подложка, рамка, обложка 16:9 там, где она есть,
// тип мелким капсом, заголовок, две строки описания, ярлык статуса.
export function ProductCard({ p }: { p: CatalogItem }) {
  const outcome =
    p.type === "case"
      ? p.badge === "Провал"
        ? { bg: "var(--color-tag-red)", ink: "var(--color-tag-red-ink)" }
        : p.badge === "Успех"
        ? { bg: "var(--color-tag-green)", ink: "var(--color-tag-green-ink)" }
        : { bg: "var(--color-tag-yellow)", ink: "var(--color-tag-yellow-ink)" }
      : null;

  return (
    <Link
      href={p.href}
      className={`card-premium group flex flex-col overflow-hidden ${p.stub ? "border-dashed" : ""}`}
    >
      {p.img && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-card-2">
          <Image
            src={p.img}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow">{PRODUCT_TYPES[p.type].label}</span>
          {p.badge && outcome ? (
            <span className="tag" style={{ background: outcome.bg, color: outcome.ink }}>{p.badge}</span>
          ) : p.badge ? (
            <span className="tag">{p.badge}</span>
          ) : p.stub ? (
            <span className="tag">скоро</span>
          ) : null}
        </div>
        <h3 className="mt-3 line-clamp-2 text-[15px] font-medium leading-snug">{p.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-text-2">{p.blurb}</p>
        {p.metric && (
          <p className="mt-3 flex items-baseline gap-2">
            <span className="num text-[20px] font-semibold text-ink">{p.metric.value}</span>
            <span className="text-[13px] text-text-2">{p.metric.label}</span>
          </p>
        )}
        <div className="flex-1" />
        {p.price && !p.free && (
          <div className="mt-4 flex items-center justify-end border-t border-line pt-3 text-[12px] text-faint">
            <span className="num">{p.price}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
