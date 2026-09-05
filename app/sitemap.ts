import type { MetadataRoute } from "next";
import { CATALOG, LEVELS } from "@/lib/content";
import { SITE_URL as BASE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Только страницы с реальным контентом. Заглушки <Placeholder> «раздел готовится»
  // (about/experts/contacts/b2b/blog/legal/*) в sitemap НЕ выдаём, чтобы Google
  // не индексировал пустышки. Вернуть сюда, когда наполнятся (legal/* — после оферты/политики).
  const staticPages = [
    "", "/catalog", "/free", "/ocean", "/levels", "/delo", "/startup",
    // Академия и тропа тестов появились позже разделов выше и в карту не попадали
    "/academy", "/tests", "/contacts",
  ].map((p) => ({
    url: `${BASE}${p || "/"}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.6,
  }));

  // Продукты: заглушки (stub) в sitemap не выдаём — у них есть price «Скоро»,
  // поэтому фильтр строго по stub (t1-risks/t1-synthesis раньше просачивались)
  const products = CATALOG.filter((x) => !x.stub).map((x) => ({
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
