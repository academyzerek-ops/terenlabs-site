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
