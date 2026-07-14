import type { MetadataRoute } from "next";
import { CATALOG, LEVELS } from "@/lib/content";
import { SITE_URL as BASE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Только страницы с реальным контентом. Заглушки <Placeholder> «раздел готовится»
  // (about/experts/contacts/b2b/club/blog/legal/*) в sitemap НЕ выдаём, чтобы Google
  // не индексировал пустышки. Вернуть сюда, когда наполнятся (legal/* — после оферты/политики).
  const staticPages = [
    "", "/catalog", "/free", "/ocean", "/levels",
  ].map((p) => ({
    url: `${BASE}${p || "/"}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.6,
  }));

  // Продукты: заглушки (stub без контента) в sitemap не выдаём
  const products = CATALOG.filter((x) => !x.stub || x.price).map((x) => ({
    url: `${BASE}${x.type === "test" ? `/tests/${x.slug}` : x.href}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const levels = LEVELS.map((l) => ({
    url: `${BASE}/levels/${l.key}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...products, ...levels];
}
