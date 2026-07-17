import type { Metadata } from "next";
import BotRedirect from "./redirect";

// Страница-прокладка для постов в соцсетях (Threads/Instagram/и т.д.).
// Голая ссылка t.me/terenlabs_bot даёт кривую карточку: Telegram отдаёт
// квадратную аватарку бота, и соцсети режут её под широкий формат.
// Здесь карточку рисуем мы (og-image 1200×630), а человека тут же
// переправляем в бота. В пост идёт ссылка на /bot, не на t.me.
const BOT_URL = "https://t.me/terenlabs_bot";

export const metadata: Metadata = {
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
      <p className="text-sm text-muted">Открываем Telegram…</p>
      <a
        href={BOT_URL}
        className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal/80"
      >
        Открыть @terenlabs_bot
      </a>
    </div>
  );
}
