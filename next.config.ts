import type { NextConfig } from "next";

// Бэкенд Океана/чата (Railway) — для connect-src CSP. Совпадает с NEXT_PUBLIC_AI_API.
const API_ORIGIN = (process.env.NEXT_PUBLIC_AI_API ?? "https://terenlabs-production.up.railway.app")
  .replace(/\/chat$/, "")
  .replace(/\/$/, "");

// Консервативный CSP: не ломает Next-гидрацию, Telegram-вход и встроенные главы
// (им нужен inline-скрипт темы), но закрывает clickjacking, base-tag и object/embed.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org https://oauth.telegram.org",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self'",
  "font-src 'self' data:",
  `connect-src 'self' ${API_ORIGIN}`,
  "frame-src 'self' https://oauth.telegram.org https://telegram.org",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Минимальный рантайм для Docker: .next/standalone + server.js
  output: "standalone",
  poweredByHeader: false,

  // next/image: современные форматы → меньший вес на отдаче
  images: {
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
