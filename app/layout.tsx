import type { Metadata } from "next";
import { Suspense } from "react";
import { Playfair_Display, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { FooterGate } from "@/components/FooterGate";
import { NoaChat } from "@/components/NoaChat";
import { ScrollFX } from "@/components/ScrollFX";

// Дисплей/заголовки — Playfair Display (глубина, премиум)
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
  display: "swap",
});

// Текст/интерфейс — Source Sans 3
const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

// Цифры/данные — JetBrains Mono (бренд про числа)
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TerenLabs — Глубина анализа. Сила результата.",
  description:
    "EdTech и FinTools для предпринимателей: курсы, тесты, бизнес-кейсы, обзоры и интерактивные финмодели. Реализм и расчёт вместо мотивации.",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('tl-theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
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
