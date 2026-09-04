import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { FooterGate } from "@/components/FooterGate";
import { NoaChat } from "@/components/NoaChat";
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
    "EdTech и FinTools для предпринимателей: курсы, тесты, бизнес-кейсы, обзоры и интерактивные финмодели. Реализм и расчёт вместо мотивации.",
  openGraph: {
    siteName: "TerenLabs",
    type: "website",
    locale: "ru_RU",
    title: "TerenLabs — Глубина анализа. Сила результата.",
    description:
      "EdTech и FinTools для предпринимателей: курсы, тесты, кейсы, обзоры и интерактивные финмодели.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "TerenLabs — обучение бизнесу в Казахстане" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TerenLabs — Глубина анализа. Сила результата.",
    description:
      "EdTech и FinTools для предпринимателей: курсы, тесты, кейсы, обзоры и интерактивные финмодели.",
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
    <html lang="ru" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <Suspense fallback={null}>
          <YandexMetrica />
        </Suspense>
        <a href="#main" className="skip-link">Перейти к содержимому</a>
        <Suspense fallback={<div className="h-14" />}>
          <Header />
        </Suspense>
        <main id="main" className="flex-1">{children}</main>
        <Suspense fallback={null}>
          <FooterGate />
        </Suspense>
        <Suspense fallback={null}>
          <NoaChat />
        </Suspense>
      </body>
    </html>
  );
}
