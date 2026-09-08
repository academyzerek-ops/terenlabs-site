"use client";

import { useEffect, useState } from "react";
import { authMethods } from "@/lib/ocean";
import { CodeLogin } from "@/components/CodeLogin";
import type { CodeChannel } from "@/lib/ocean";

// Компактный вход круглыми кнопками в ряд. Google: серверное действие next-auth,
// без ключей кнопка выключена. Почта: раскрывает форму адреса и кода, включается,
// когда бэкенд умеет его слать. Вход по СМС убран 07.09.2026 (платно, договор с
// оператором), Telegram — 09.09.2026 вместе с ботом и Mini App.
const ROUND = "flex h-14 w-14 items-center justify-center rounded-full text-[#fff] transition-transform hover:scale-[1.04] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100";

export function SignInMethods({ googleReady, googleAction, size = "md" }: { googleReady: boolean; googleAction?: () => Promise<void>; size?: "md" | "sm" }) {
  // на узком телефоне круги по 56 px с подписями не помещаются в ряд
  const round = size === "sm"
    ? ROUND.replace("h-14 w-14", "h-11 w-11")
    : ROUND.replace("h-14 w-14", "h-12 w-12 sm:h-14 sm:w-14");
  const [channel, setChannel] = useState<CodeChannel | null>(null);
  // Включена ли отправка кода на почту — знает только бэкенд (там настройки SMTP).
  const [emailOn, setEmailOn] = useState(false);
  useEffect(() => {
    authMethods().then((m) => setEmailOn(m.email));
  }, []);
  return (
    <div>
      {/* на узком телефоне способы входа с промежутком 20 px не влезают */}
      <div className={`flex items-start justify-center ${size === "sm" ? "gap-3 sm:gap-5" : "gap-2 sm:gap-6"}`}>
        {/* Google */}
        <div className="flex flex-col items-center gap-2">
          {googleReady && googleAction ? (
            <form action={googleAction}>
              <button type="submit" aria-label="Войти через Google" className={`${round} bg-[#ffffff]`}>
                <GoogleG />
              </button>
            </form>
          ) : (
            <button type="button" disabled aria-label="Google скоро" title="Подключается после ключей Google OAuth" className={`${round} bg-[#ffffff]`}>
              <GoogleG />
            </button>
          )}
          <span className="text-[12px] text-text-2">Google</span>
        </div>

        {/* Почта. Кнопка на месте всегда, но пока бэкенду нечем слать код, она
            выключена с подсказкой — как у Google. Пропадать она не должна:
            исчезнувший способ входа выглядит поломкой, а не настройкой. */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            disabled={!emailOn}
            onClick={() => setChannel((c) => (c === "email" ? null : "email"))}
            aria-expanded={channel === "email"}
            aria-controls="code-login"
            aria-label={emailOn ? "Войти по почте" : "Почта скоро"}
            title={emailOn ? undefined : "Подключается после настройки почты"}
            className={`${round} bg-[#F0873A] ${channel === "email" ? "ring-2 ring-[#F0873A]/40 ring-offset-2 ring-offset-page" : ""}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
            </svg>
          </button>
          <span className="text-[12px] text-text-2">Почта</span>
        </div>
      </div>

      {channel && emailOn && (
        <div id="code-login" className="mt-6">
          <CodeLogin key={channel} channel={channel} />
        </div>
      )}
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.5 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z" />
      <path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.3 0 11.7-2.1 15.6-5.7l-7.7-6c-2.1 1.4-4.8 2.3-7.9 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
