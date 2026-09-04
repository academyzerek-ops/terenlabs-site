"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tgLoginClaim, tgLoginStart } from "@/lib/ocean";
import { Arrow } from "@/components/Button";

// Вход через t.me deep-link (Адиль 18.07: «сразу авто, а не номер вводить»).
// Кнопка открывает залогиненный Telegram юзера (десктоп/веб/телефон), бот
// подтверждает /start login_<code>, сайт поллингом забирает веб-токен.
// Виджет Login Widget с его /setdomain и вводом номера больше не нужен.

// Те же классы, что у Button (primary, md): здесь нужен <button onClick>, не ссылка
const BTN =
  "btn-press inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-accent-600 px-4 text-[15px] font-medium text-[#fff] transition-colors duration-150 hover:bg-[#1b6fc2] disabled:opacity-50";

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
        <p className="text-[15px] leading-relaxed text-body">
          Подтверди вход в Telegram — он уже открылся.
        </p>
        <p role="status" aria-live="polite" className="mt-2 flex items-center justify-center gap-2 text-[13px] text-text-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange" aria-hidden="true" />
          жду подтверждение от бота
        </p>
        {link && (
          <a href={link} target="_blank" rel="noopener" className="link mt-3 text-[14px]">
            Telegram не открылся? Открыть ещё раз <Arrow />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      <button type="button" onClick={start} className={BTN}>
        <svg viewBox="0 0 240 240" className="h-4 w-4 shrink-0" aria-hidden="true">
          <path
            fill="currentColor"
            d="M44.7 121.5 194.9 63.6c7-2.6 13.1 1.6 10.8 12.2l-25.6 120.6c-1.9 8.5-7 10.6-14.1 6.6l-39-28.8-18.8 18.2c-2.1 2.1-3.8 3.8-7.8 3.8l2.8-39.8 72.3-65.3c3.1-2.8-.7-4.3-4.9-1.7l-89.4 56.3-38.5-12c-8.4-2.7-8.6-8.4 2-12.2Z"
          />
        </svg>
        Войти через Telegram
        <Arrow />
      </button>
      <p className="mt-3 text-[13px] text-faint">
        откроется твой Telegram — один тап «Start», без ввода номера
      </p>
      {phase === "error" && (
        <p role="alert" className="mt-2 text-[13px] text-danger">
          Подтверждение не пришло. Нажми кнопку ещё раз.
        </p>
      )}
    </div>
  );
}
