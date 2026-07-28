// SEO-хелперы для [slug]-роутов: единый формат title/description/OG.
// metadataBase задаётся в app/layout.tsx — относительные пути картинок
// резолвятся в абсолютные сами.
import type { Metadata } from "next";
import type { CatalogItem } from "./content";

export const SITE_NAME = "TerenLabs";

export function pageMetadata(opts: {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  /** Путь страницы от корня, например `/reviews/coffee`. Идёт в canonical. */
  path?: string;
}): Metadata {
  const title = opts.title ? `${opts.title} — ${SITE_NAME}` : undefined;
  const description = opts.description ?? undefined;
  return {
    title,
    description,
    // Канонический адрес. Без него Google сам решает, какой из нескольких
    // адресов страницы главный, и иногда выбрасывает обе версии из индекса
    // («страница является копией, канонический вариант не выбран»).
    ...(opts.path ? { alternates: { canonical: opts.path } } : {}),
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: "article",
      ...(opts.path ? { url: opts.path } : {}),
      ...(opts.image ? { images: [opts.image] } : {}),
    },
    twitter: {
      card: opts.image ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export function itemMetadata(p: CatalogItem | undefined, path?: string): Metadata {
  if (!p) return {};
  return pageMetadata({ title: p.title, description: p.blurb, image: p.img, path });
}

/** Канонический адрес для страниц со статичными метаданными. */
export const canonical = (path: string): Metadata => ({ alternates: { canonical: path } });
