// Билдеры структурированных данных schema.org (JSON-LD) для rich-результатов Google.
// Все URL абсолютные через SITE_URL.
import { SITE_URL } from "./site";

const ORG = {
  "@type": "Organization",
  name: "TerenLabs",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.jpg`,
  sameAs: ["https://instagram.com/terenlabs", "https://www.threads.com/@terenlabs"],
} as const;

/** Организация — один раз в корневом layout. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    ...ORG,
    description:
      "EdTech для предпринимателей Казахстана: курсы, тесты, бизнес-кейсы и обзоры ниш.",
  };
}

/** Учебный курс (страница /courses/[slug]). */
export function courseJsonLd(opts: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    inLanguage: "ru",
    provider: { "@type": "Organization", name: ORG.name, url: ORG.url },
  };
}

/** Статья — кейсы и обзоры (/cases/[slug], /reviews/[slug]). */
export function articleJsonLd(opts: {
  headline: string;
  description?: string;
  path: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    ...(opts.description ? { description: opts.description } : {}),
    url: `${SITE_URL}${opts.path}`,
    ...(opts.image
      ? { image: opts.image.startsWith("http") ? opts.image : `${SITE_URL}${opts.image}` }
      : {}),
    inLanguage: "ru",
    publisher: ORG,
  };
}

/**
 * Разбор бизнес-модели бренда (/brands/[slug]). Тот же Article, но с about →
 * Organization: страница про чужую компанию, и в разметке это должно быть видно.
 * Язык — ru без региона: раздел универсальный (доллар, аудитория шире Казахстана).
 */
export function brandArticleJsonLd(opts: {
  headline: string;
  description?: string;
  path: string;
  brand: string;
  image?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    ...(opts.description ? { description: opts.description } : {}),
    url: `${SITE_URL}${opts.path}`,
    ...(opts.image
      ? { image: opts.image.startsWith("http") ? opts.image : `${SITE_URL}${opts.image}` }
      : {}),
    about: { "@type": "Organization", name: opts.brand },
    inLanguage: "ru",
    publisher: ORG,
  };
}

/** Хлебные крошки. items — по порядку, путь относительный («/catalog»). */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}


// Товар (платные продукты) — под rich snippet цены в выдаче. Цена парсится из
// строки прайса ("20 $" / "40 $") в число + валюту USD (прайс TerenLabs в $).

// WebSite + SearchAction: даёт шанс на sitelinks-searchbox в выдаче Google
// (поиск по каталогу прямо из сниппета). Точка входа — /catalog?type=... ,
// поэтому query-цель ведёт на общий каталог.
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORG.name,
    url: SITE_URL,
    inLanguage: "ru-KZ",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/catalog?q={query}` },
      "query-input": "required name=query",
    },
  };
}
