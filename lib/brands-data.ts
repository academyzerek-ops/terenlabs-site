// Разборы бизнес-моделей брендов — генерятся из основного репо
// (scripts/import_content.mjs, content/ru/brands/*.html → content/brands.json).
import brandsJson from "@/content/brands.json";

export type BrandDoc = {
  slug: string;
  title: string; // «Netflix: в чём механика»
  titleHtml: string; // тот же заголовок с <span class="o">-акцентом
  brand: string; // имя компании для JSON-LD about — «Netflix»
  sub: string; // «Разбор бизнес-модели · доллар · отчётность 2025–2026»
  blurb: string; // первая фраза описания — в карточку и в description
  badge: string;
  mod: string; // «Netflix · подписка»
  sector: string | null; // media | sport | auto | retail | platform
  img: string | null;
  body: string; // готовый HTML тела (классы lessons.css → brand-content.css)
};

// Рантайм-guard: контент генерится в ДРУГОМ репо. При дрейфе схемы TS остаётся
// зелёным, но `body`/`titleHtml` идут в dangerouslySetInnerHTML — поэтому
// отбрасываем записи без обязательных строковых полей (а не падаем в рантайме).
function isValidBrand(b: unknown): b is BrandDoc {
  if (!b || typeof b !== "object") return false;
  const o = b as Record<string, unknown>;
  return (
    typeof o.slug === "string" &&
    typeof o.title === "string" &&
    typeof o.titleHtml === "string" &&
    typeof o.brand === "string" &&
    typeof o.body === "string" &&
    o.body.trim().length > 0
  );
}

const rawBrands = brandsJson as unknown[];
export const BRAND_DOCS: BrandDoc[] = rawBrands.filter(isValidBrand);

if (process.env.NODE_ENV !== "production" && BRAND_DOCS.length !== rawBrands.length) {
  console.warn(
    `[brands-data] отброшено ${rawBrands.length - BRAND_DOCS.length} разборов с битой схемой ` +
      "(нет slug/title/titleHtml/brand/body) — проверь import_content.mjs в основном репо.",
  );
}

export function getBrandDoc(slug: string): BrandDoc | undefined {
  return BRAND_DOCS.find((b) => b.slug === slug);
}
