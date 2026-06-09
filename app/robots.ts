import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://terenlabs.cc";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // служебные и приватные разделы ботам не нужны
      disallow: ["/api/", "/dashboard", "/checkout", "/auth/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
