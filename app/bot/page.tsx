import type { Metadata } from "next";
import BotRedirect from "./redirect";
import { Button, Arrow } from "@/components/Button";

// Страница-прокладка для постов в соцсетях (Threads/Instagram/и т.д.).
// Голая ссылка t.me/terenlabs_bot даёт кривую карточку: Telegram отдаёт
// квадратную аватарку бота, и соцсети режут её под широкий формат.
// Здесь карточку рисуем мы (og-image 1200×630), а человека тут же
// переправляем в бота. В пост идёт ссылка на /bot, не на t.me.
const BOT_URL = "https://t.me/terenlabs_bot";

export const metadata: Metadata = {
  alternates: { canonical: "/bot" },
  title: "TerenLabs в Telegram",
  description:
    "Академия, Океан, кейсы и финмодели — открой TerenLabs в Telegram.",
  openGraph: {
    title: "TerenLabs в Telegram",
    description:
      "Академия, Океан, кейсы и финмодели — открой TerenLabs в Telegram.",
    images: [
      {
        url: "/og-bot.jpg",
        width: 1200,
        height: 630,
        alt: "TerenLabs в Telegram",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TerenLabs в Telegram",
    description:
      "Академия, Океан, кейсы и финмодели — открой TerenLabs в Telegram.",
    images: ["/og-bot.jpg"],
  },
  robots: { index: false },
};

export default function BotPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <BotRedirect url={BOT_URL} />
      <p role="status" aria-live="polite" className="text-[14px] text-text-2">Открываем Telegram…</p>
      <Button href={BOT_URL}>
        Открыть @terenlabs_bot <Arrow />
      </Button>
    </div>
  );
}
