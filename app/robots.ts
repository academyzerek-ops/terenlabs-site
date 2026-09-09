import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // служебные и приватные разделы ботам не нужны (префикс без слэша
      // покрывает и сам путь, и вложенные)
      disallow: ["/api/", "/dashboard", "/auth/", "/design-system"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
