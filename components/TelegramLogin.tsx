"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loginTelegram } from "@/lib/ocean";

// Официальный Telegram Login Widget. Тот же tg_id, что в Mini App —
// аккаунт сходится в один автоматически (12_OCEAN.md).
// ⚠️ Виджет работает только на домене из BotFather /setdomain —
// на localhost кнопка не отрисуется (это нормально для dev).
const BOT = process.env.NEXT_PUBLIC_TG_BOT ?? "terenlabs_bot";

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, unknown>) => void;
  }
}

export function TelegramLogin() {
  const holder = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const el = holder.current;
    if (!el || el.childElementCount > 0) return;

    window.onTelegramAuth = async (user) => {
      try {
        const out = await loginTelegram(user);
        router.push(out.needs_onboarding ? "/auth/onboarding" : "/dashboard");
      } catch {
        setErr("Не получилось войти — попробуй ещё раз.");
      }
    };

    const s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.async = true;
    s.setAttribute("data-telegram-login", BOT);
    s.setAttribute("data-size", "large");
    s.setAttribute("data-radius", "12");
    s.setAttribute("data-onauth", "onTelegramAuth(user)");
    s.setAttribute("data-request-access", "write");
    el.appendChild(s);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [router]);

  return (
    <div>
      <div ref={holder} className="flex justify-center" />
      {err && <p className="mt-2 text-center text-xs text-[var(--color-danger)]">{err}</p>}
    </div>
  );
}
