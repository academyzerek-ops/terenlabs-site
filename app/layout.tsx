import type { Metadata } from "next";
import { Suspense } from "react";
import { Playfair_Display, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { FooterGate } from "@/components/FooterGate";
import { NoaChat } from "@/components/NoaChat";
import { ScrollFX } from "@/components/ScrollFX";
import { JsonLd } from "@/components/JsonLd";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { SITE_URL } from "@/lib/site";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";

// Дисплей/заголовки — Playfair Display (глубина, премиум)
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
  display: "swap",
});

// Текст/интерфейс — Source Sans 3 (явные веса — иначе тянутся ВСЕ, лишний вес шрифта)
const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// Цифры/данные — JetBrains Mono (бренд про числа)
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TerenLabs — Глубина анализа. Сила результата.",
    template: "%s", // дочерние страницы сами добавляют «— TerenLabs»
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
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TerenLabs — обучение бизнесу в Казахстане",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TerenLabs — Глубина анализа. Сила результата.",
    description:
      "EdTech и FinTools для предпринимателей: курсы, тесты, кейсы, обзоры и интерактивные финмодели.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${playfair.variable} ${sourceSans.variable} ${jetbrains.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        {/* аналитика: те же события, что Mini App (/api/ocean/event), platform=site */}
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        {/* a11y: первый фокусируемый — пропуск навигации к содержимому (WCAG 2.4.1) */}
        <a href="#main" className="skip-link">Перейти к содержимому</a>
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <main id="main" className="flex-1">{children}</main>
        <Suspense fallback={null}>
          <FooterGate />
        </Suspense>
        <Suspense fallback={null}>
          <NoaChat />
        </Suspense>
        <Suspense fallback={null}>
          <ScrollFX />
        </Suspense>
      </body>
    </html>
  );
}
