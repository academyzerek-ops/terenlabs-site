// Канонический URL сайта — ЕДИНЫЙ источник правды (раньше дублировался в
// layout.tsx, sitemap.ts, robots.ts с одинаковым localhost-фолбэком).
//
// ⚠️ В ПРОДЕ NEXT_PUBLIC_SITE_URL обязан быть задан реальным доменом (Railway
// build env). Иначе sitemap/robots/OG отдадут localhost. На prod-сборке без
// корректного значения — громкое предупреждение в лог сборки.
const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;

const isProd = process.env.NODE_ENV === "production";

if (isProd && (!fromEnv || fromEnv.includes("localhost"))) {
  console.warn(
    "[site] ⚠️ NEXT_PUBLIC_SITE_URL не задан (или localhost) в проде — " +
      "используется Railway-домен по умолчанию. Появится свой домен — " +
      "задай его в окружении хостинга.",
  );
}

// В проде дефолт — КАНОНИЧЕСКИЙ домен terenlabs.kz (домен подключён и живой,
// 20.07). Раньше падало на railway-домен, из-за чего canonical/sitemap/robots/OG
// указывали не на наш домен и мешали индексации. NEXT_PUBLIC_SITE_URL по-прежнему
// имеет приоритет, но в Docker-сборке Railway build-env до next build не доходит,
// поэтому дефолт держим правильным доменом.
const fallback = isProd
  ? "https://terenlabs.kz"
  : "http://localhost:3001";

export const SITE_URL = (fromEnv && !(isProd && fromEnv.includes("localhost"))
  ? fromEnv
  : fallback
).replace(/\/$/, "");
