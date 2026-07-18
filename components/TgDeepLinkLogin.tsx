"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tgLoginClaim, tgLoginStart } from "@/lib/ocean";

// Вход через t.me deep-link (Адиль 18.07: «сразу авто, а не номер вводить»).
// Кнопка открывает залогиненный Telegram юзера (десктоп/веб/телефон), бот
// подтверждает /start login_<code>, сайт поллингом забирает веб-токен.
// Виджет Login Widget с его /setdomain и вводом номера больше не нужен.
export function TgDeepLinkLogin() {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "waiting" | "error">("idle");
  const [link, setLink] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const start = async () => {
    try {
      const t = await tgLoginStart();
      setLink(t.deep_link);
      setPhase("waiting");
      // deep-link из клика — попапы не режутся; десктоп сам поднимет приложение
      window.open(t.deep_link, "_blank", "noopener");
      const startedAt = Date.now();
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(async () => {
        if (Date.now() - startedAt > t.expires_in_sec * 1000) {
          if (timer.current) clearInterval(timer.current);
          setPhase("error");
          return;
        }
        try {
          const auth = await tgLoginClaim(t.code);
          if (auth) {
            if (timer.current) clearInterval(timer.current);
            router.push(auth.needs_onboarding ? "/auth/onboarding" : "/dashboard");
          }
        } catch {
          if (timer.current) clearInterval(timer.current);
          setPhase("error");
        }
      }, 2000);
    } catch {
      setPhase("error");
    }
  };

  if (phase === "waiting") {
    return (
      <div className="text-center">
        <p className="text-sm leading-relaxed text-foam/80">
          Подтверди вход в Telegram — он уже открылся.
        </p>
        <p className="mt-2 flex items-center justify-center gap-2 text-xs text-foam/50">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-teal" />
          жду подтверждение от бота
        </p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener"
            className="mt-3 inline-block text-xs font-semibold text-teal hover:text-teal-200"
          >
            Telegram не открылся? Открыть ещё раз →
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        onClick={start}
        className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-[#2AABEE] to-[#229ED9] py-2.5 pl-3 pr-6 font-semibold text-white shadow-[0_6px_18px_rgba(42,171,238,0.35)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <svg viewBox="0 0 240 240" className="h-6 w-6" aria-hidden="true">
            <path
              fill="currentColor"
              d="M44.7 121.5 194.9 63.6c7-2.6 13.1 1.6 10.8 12.2l-25.6 120.6c-1.9 8.5-7 10.6-14.1 6.6l-39-28.8-18.8 18.2c-2.1 2.1-3.8 3.8-7.8 3.8l2.8-39.8 72.3-65.3c3.1-2.8-.7-4.3-4.9-1.7l-89.4 56.3-38.5-12c-8.4-2.7-8.6-8.4 2-12.2Z"
            />
          </svg>
        </span>
        Войти через Telegram
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
      </button>
      <p className="mt-2.5 text-xs text-foam/45">
        откроется твой Telegram — один тап «Start», без ввода номера
      </p>
      {phase === "error" && (
        <p className="mt-2 text-xs text-[var(--color-danger)]">
          Подтверждение не пришло. Нажми кнопку ещё раз.
        </p>
      )}
    </div>
  );
}
