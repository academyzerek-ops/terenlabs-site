"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loginTelegram } from "@/lib/ocean";

// Официальный Telegram Login Widget. Тот же tg_id, что в Mini App —
// аккаунт сходится в один автоматически (12_OCEAN.md).
// ⚠️ Виджет рисуется ТОЛЬКО на домене, прописанном в @BotFather → /setdomain.
// На localhost и на «чужом» домене Telegram кнопку не отрендерит (это by design).
const BOT = process.env.NEXT_PUBLIC_TG_BOT ?? "terenlabs_bot";

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, unknown>) => void;
  }
}

export function TelegramLogin({ authUrl }: { authUrl?: string } = {}) {
  const holder = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  // loading → ready (виджет отрисовался) | failed (за таймаут не появился iframe)
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

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
    // радиус кнопки виджета как у наших контролов
    s.setAttribute("data-radius", "6");
    if (authUrl) {
      // redirect-режим для нативного приложения: попапы в WKWebView зажаты,
      // виджет уводит текущее окно на oauth.telegram.org и обратно на authUrl
      s.setAttribute("data-auth-url", authUrl);
    } else {
      s.setAttribute("data-onauth", "onTelegramAuth(user)");
    }
    s.setAttribute("data-request-access", "write");
    el.appendChild(s);

    // Telegram при успехе вставляет <iframe> в holder. Если за 3.5с его нет —
    // домен не прописан в BotFather или нет сети → показываем подсказку,
    // а не пустоту (раньше область просто оставалась пустой).
    const t = setTimeout(() => {
      setStatus(el.querySelector("iframe") ? "ready" : "failed");
    }, 3500);

    return () => {
      clearTimeout(t);
      el.querySelectorAll("script, iframe").forEach((n) => n.remove()); // чистим вставленное
      delete window.onTelegramAuth;
    };
  }, [router]);

  return (
    <div>
      <div ref={holder} className="flex min-h-[48px] justify-center" />
      {status === "failed" && (
        <p className="mt-2 text-center text-[13px] leading-relaxed text-faint">
          Кнопка Telegram не загрузилась. Обнови страницу. Если не помогает — домен
          сайта нужно добавить в&nbsp;@BotFather&nbsp;→&nbsp;/setdomain.
        </p>
      )}
      {err && <p role="alert" className="mt-2 text-center text-[13px] text-danger">{err}</p>}
    </div>
  );
}
