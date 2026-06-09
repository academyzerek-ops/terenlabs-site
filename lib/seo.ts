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
}): Metadata {
  const title = opts.title ? `${opts.title} — ${SITE_NAME}` : undefined;
  const description = opts.description ?? undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: "article",
      ...(opts.image ? { images: [opts.image] } : {}),
    },
    twitter: {
      card: opts.image ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export function itemMetadata(p: CatalogItem | undefined): Metadata {
  if (!p) return {};
  return pageMetadata({ title: p.title, description: p.blurb, image: p.img });
}
