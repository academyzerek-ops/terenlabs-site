import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { YandexMetrica } from "@/components/YandexMetrica";
import { SITE_URL } from "@/lib/site";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";

// Один шрифт на весь интерфейс (как в Notion): Inter, кириллица, три веса.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TerenLabs — Глубина анализа. Сила результата.",
    template: "%s",
  },
  description:
    "EdTech для предпринимателей: курсы, тесты, бизнес-кейсы и обзоры ниш. Реализм и расчёт вместо мотивации.",
  openGraph: {
    siteName: "TerenLabs",
    type: "website",
    locale: "ru_RU",
    title: "TerenLabs — Глубина анализа. Сила результата.",
    description:
      "EdTech для предпринимателей: курсы, тесты, кейсы и обзоры ниш.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "TerenLabs — обучение бизнесу в Казахстане" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TerenLabs — Глубина анализа. Сила результата.",
    description:
      "EdTech для предпринимателей: курсы, тесты, кейсы и обзоры ниш.",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "twlEgIN_Rnzy34eI4x_4huLA7xXCCDg9fJlBVaErQXo",
    yandex: "b6251af95feeb1bd",
    other: { "facebook-domain-verification": "7lyuwhtff60xq4meuljn2gptg1w05v" },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Тема ставится до первой отрисовки: иначе при светлом выборе экран
            моргнёт тёмным. Скрипт короткий и синхронный намеренно. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('tl-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <Suspense fallback={null}>
          <YandexMetrica />
        </Suspense>
        <a href="#main" className="skip-link">Перейти к содержимому</a>
        <Suspense fallback={null}>
          <AppShell>
            <main id="main" className="flex-1">{children}</main>
            <Suspense fallback={null}>
            </Suspense>
          </AppShell>
        </Suspense>
        <Suspense fallback={null}>
        </Suspense>
      </body>
    </html>
  );
}
