// Билдеры структурированных данных schema.org (JSON-LD) для rich-результатов Google.
// Все URL абсолютные через SITE_URL.
import { SITE_URL } from "./site";

const ORG = {
  "@type": "Organization",
  name: "TerenLabs",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.jpg`,
  sameAs: ["https://t.me/terenlabs_bot"],
} as const;

/** Организация — один раз в корневом layout. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    ...ORG,
    description:
      "EdTech и FinTools для предпринимателей Казахстана: курсы, тесты, бизнес-кейсы, обзоры и финмодели.",
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
export function productJsonLd(opts: {
  name: string; description: string; image?: string | null; path: string; price: string;
}) {
  const num = (opts.price.match(/[\d.]+/) || ["0"])[0];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    ...(opts.image ? { image: `${ORG.url}${opts.image}` } : {}),
    brand: { "@type": "Brand", name: ORG.name },
    offers: {
      "@type": "Offer",
      url: `${ORG.url}${opts.path}`,
      price: num,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}


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
