// Канонический URL сайта — ЕДИНЫЙ источник правды (раньше дублировался в
// layout.tsx, sitemap.ts, robots.ts с одинаковым localhost-фолбэком).
//
// ⚠️ В ПРОДЕ NEXT_PUBLIC_SITE_URL обязан быть задан реальным доменом (Railway
// build env). Иначе sitemap/robots/OG отдадут localhost. На prod-сборке без
// корректного значения — громкое предупреждение в лог сборки.
const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;

if (
  process.env.NODE_ENV === "production" &&
  (!fromEnv || fromEnv.includes("localhost"))
) {
  console.warn(
    "[site] ⚠️ NEXT_PUBLIC_SITE_URL не задан (или localhost) в проде — " +
      "sitemap.xml / robots.txt / OG-картинки будут указывать на localhost. " +
      "Задай реальный домен в окружении хостинга.",
  );
}

export const SITE_URL = (fromEnv ?? "http://localhost:3001").replace(/\/$/, "");
