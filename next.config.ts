import type { NextConfig } from "next";

// Бэкенд Океана/чата (Railway) — для connect-src CSP. Совпадает с NEXT_PUBLIC_AI_API.
const API_ORIGIN = (process.env.NEXT_PUBLIC_AI_API ?? "https://terenlabs-production.up.railway.app")
  .replace(/\/chat$/, "")
  .replace(/\/$/, "");

// Консервативный CSP: не ломает Next-гидрацию, Telegram-вход и встроенные главы
// (им нужен inline-скрипт темы), но закрывает clickjacking, base-tag и object/embed.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org https://oauth.telegram.org https://mc.yandex.ru",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self'",
  "font-src 'self' data:",
  // Метрика: вебвизор ходит по wss://mc.yandex.ru/solid.ws и ставит iframe mc.yandex.ru —
  // без этих двух источников визиты считаются, а вебвизор молча блокируется (аудит 23.08)
  `connect-src 'self' ${API_ORIGIN} https://mc.yandex.ru https://mc.yandex.com wss://mc.yandex.ru`,
  "frame-src 'self' https://oauth.telegram.org https://telegram.org https://mc.yandex.ru",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Тег сборки для футера: момент `next build` (UTC) — сверять версию на
  // устройстве с продом; не зависит от env хостинга (build-args Railway не дошли)
  env: {
    NEXT_PUBLIC_BUILD: new Date().toISOString().slice(5, 16).replace("T", " ") + " UTC",
  },
  // Минимальный рантайм для Docker: .next/standalone + server.js
  output: "standalone",
  poweredByHeader: false,

  // next/image: современные форматы → меньший вес на отдаче
  images: {
    formats: ["image/avif", "image/webp"],
    // разрешаем версионные локальные картинки (?v=N) — кэш-бастинг hero обзоров/кейсов
    localPatterns: [
      { pathname: "/**", search: "" },
      { pathname: "/academy-assets/**" },
    ],
  },

  // Индексных страниц /cases,/reviews,/tests нет (контент живёт в /catalog),
  // но SEO-крошки (jsonld) на них ссылаются — не отдавать поисковику 404
  async redirects() {
    return [
      { source: "/cases", destination: "/catalog?type=case", permanent: true },
      { source: "/reviews", destination: "/catalog?type=review", permanent: true },
      { source: "/tests", destination: "/catalog?type=test", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        // HTML-страницы (пути без точки, вне /_next): браузер обязан ревалидировать.
        // Дефолт Next отдаёт только s-maxage (для CDN) — Safari на телефонах
        // эвристически кешировал страницы и неделю показывал старую сборку
        // (три круга «барабан срезан» у Адиля 15.07). Ассеты с хешами не трогаем.
        source: "/((?!_next/)[^.]*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HSTS: защита OAuth-сессии (next-auth) от downgrade/SSL-stripping.
          // Безопасно: по HTTP браузеры заголовок игнорируют.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
