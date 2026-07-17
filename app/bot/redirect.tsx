"use client";

import { useEffect } from "react";

// Клиентский редирект: краулеры соцсетей JS не выполняют и видят OG-теги,
// живой человек сразу уходит в Telegram.
export default function BotRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);
  return null;
}
