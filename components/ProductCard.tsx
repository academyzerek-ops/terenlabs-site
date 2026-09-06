import Link from "next/link";
import Image from "next/image";
import { CatalogItem, PRODUCT_TYPES } from "@/lib/content";
import { brandLogo } from "@/lib/brand-logos";

// Карточка каталога: подложка, рамка, обложка 16:9 там, где она есть,
// тип мелким капсом, заголовок, две строки описания, ярлык статуса.
export function ProductCard({ p, hideType }: { p: CatalogItem; hideType?: boolean }) {
  // у разбора бренда — логотип компании небольшой плашкой слева от типа
  const logo = p.type === "bm" ? brandLogo(p.slug) : null;
  const outcome =
    p.type === "case"
      ? p.badge === "Провал"
        ? { bg: "var(--color-tag-red)", ink: "var(--color-tag-red-ink)" }
        : p.badge === "Успех"
        ? { bg: "var(--color-tag-green)", ink: "var(--color-tag-green-ink)" }
        : { bg: "var(--color-tag-yellow)", ink: "var(--color-tag-yellow-ink)" }
      : null;

  // Разбор бренда: знак компании слева на треть карточки, за ним косой
  // разделитель, дальше крючок. Общая карточка тут не годится — у брендов нет
  // обложек, зато есть узнаваемый знак, и он должен работать вместо картинки.
  if (p.type === "bm") {
    return (
      <Link href={p.href} className="card-premium group flex min-h-[96px] overflow-hidden">
        <span className="flex w-1/3 shrink-0 items-center justify-center p-3">
          {logo ? (
            <img
              src={logo}
              alt=""
              loading="lazy"
              className="h-full max-h-11 w-full object-contain transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <span className="text-[15px] font-medium text-text-2">{p.title.split(":")[0]}</span>
          )}
        </span>
        {/* разделитель под углом: линия в один пиксель, наклонённая скосом */}
        <span aria-hidden="true" className="my-2 w-px shrink-0 -skew-x-12 bg-line" />
        <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-3 pl-4 pr-4">
          <span className="line-clamp-2 text-[15px] font-medium leading-snug text-ink">{p.title}</span>
          <span className="line-clamp-3 text-[13px] leading-relaxed text-text-2">{p.blurb}</span>
        </span>
      </Link>
    );
  }

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
          <span className="flex items-center gap-2">
            {logo && (
              // высота плашки одна на все логотипы, ширина по знаку: у Amazon и
              // Louis Vuitton это надпись, у Nike и Netflix — квадратный значок
              <span className="flex h-6 min-w-6 max-w-[78px] shrink-0 items-center justify-center overflow-hidden rounded-[5px] bg-[#fff] px-1">
                <img src={logo} alt="" height={15} loading="lazy" className="h-[15px] w-auto max-w-full object-contain" />
              </span>
            )}
            {/* Ярлык типа нужен только в общем каталоге, где вперемешку лежат
                курсы, кейсы и обзоры. Внутри одного раздела он повторяет заголовок
                страницы на каждой карточке. */}
            {!hideType && <span className="eyebrow">{PRODUCT_TYPES[p.type].label}</span>}
          </span>
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
