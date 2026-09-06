"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tgLoginClaim, tgLoginStart } from "@/lib/ocean";
import { CodeLogin } from "@/components/CodeLogin";
import type { CodeChannel } from "@/lib/ocean";

// Компактный вход: три круглые цветные кнопки в ряд (Telegram, Google, телефон).
// Telegram: deep-link в бота и поллинг тикета. Google: серверное действие next-auth
// (без ключей кнопка выключена). Телефон: раскрывает форму номера и кода.
const ROUND = "flex h-14 w-14 items-center justify-center rounded-full text-[#fff] transition-transform hover:scale-[1.04] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100";

export function SignInMethods({ googleReady, googleAction, size = "md" }: { googleReady: boolean; googleAction?: () => Promise<void>; size?: "md" | "sm" }) {
  // на узком телефоне четыре круга по 56 px с подписями не помещаются в ряд
  const round = size === "sm"
    ? ROUND.replace("h-14 w-14", "h-11 w-11")
    : ROUND.replace("h-14 w-14", "h-12 w-12 sm:h-14 sm:w-14");
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "waiting" | "error">("idle");
  const [link, setLink] = useState<string | null>(null);
  const [channel, setChannel] = useState<CodeChannel | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const startTg = async () => {
    try {
      const t = await tgLoginStart();
      setLink(t.deep_link);
      setPhase("waiting");
      window.open(t.deep_link, "_blank", "noopener");
      const startedAt = Date.now();
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(async () => {
        if (Date.now() - startedAt > t.expires_in_sec * 1000) { if (timer.current) clearInterval(timer.current); setPhase("error"); return; }
        try {
          const auth = await tgLoginClaim(t.code);
          if (auth) { if (timer.current) clearInterval(timer.current); router.push(auth.needs_onboarding ? "/auth/onboarding" : "/dashboard"); }
        } catch { if (timer.current) clearInterval(timer.current); setPhase("error"); }
      }, 2000);
    } catch { setPhase("error"); }
  };

  return (
    <div>
      {/* на узком телефоне четыре способа входа с промежутком 20 px не влезают */}
      <div className={`flex items-start justify-center ${size === "sm" ? "gap-3 sm:gap-5" : "gap-2 sm:gap-6"}`}>
        {/* Telegram */}
        <div className="flex flex-col items-center gap-2">
          <button type="button" onClick={startTg} aria-label="Войти через Telegram" className={`${round} bg-[#2AABEE]`}>
            <svg viewBox="0 0 240 240" className="h-7 w-7 -ml-0.5" aria-hidden="true">
              <path fill="currentColor" d="M44.7 121.5 194.9 63.6c7-2.6 13.1 1.6 10.8 12.2l-25.6 120.6c-1.9 8.5-7 10.6-14.1 6.6l-39-28.8-18.8 18.2c-2.1 2.1-3.8 3.8-7.8 3.8l2.8-39.8 72.3-65.3c3.1-2.8-.7-4.3-4.9-1.7l-89.4 56.3-38.5-12c-8.4-2.7-8.6-8.4 2-12.2Z" />
            </svg>
          </button>
          <span className="text-[12px] text-text-2">Telegram</span>
        </div>

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

        {/* Телефон */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setChannel((c) => (c === "phone" ? null : "phone"))}
            aria-expanded={channel === "phone"}
            aria-controls="code-login"
            aria-label="Войти по номеру телефона"
            className={`${round} bg-[#34A853] ${channel === "phone" ? "ring-2 ring-[#34A853]/40 ring-offset-2 ring-offset-page" : ""}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
            </svg>
          </button>
          <span className="text-[12px] text-text-2">Телефон</span>
        </div>

        {/* Почта */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setChannel((c) => (c === "email" ? null : "email"))}
            aria-expanded={channel === "email"}
            aria-controls="code-login"
            aria-label="Войти по почте"
            className={`${round} bg-[#F0873A] ${channel === "email" ? "ring-2 ring-[#F0873A]/40 ring-offset-2 ring-offset-page" : ""}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
            </svg>
          </button>
          <span className="text-[12px] text-text-2">Почта</span>
        </div>
      </div>

      {phase === "waiting" && (
        <div className="mt-5 text-center">
          <p className="text-[14px] text-body">Подтверди вход в Telegram, он уже открылся.</p>
          <p role="status" aria-live="polite" className="mt-1 flex items-center justify-center gap-2 text-[13px] text-text-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange" aria-hidden="true" />
            жду подтверждение от бота
          </p>
          {link && (
            <a href={link} target="_blank" rel="noopener" className="link mt-2 text-[13px]">
              Telegram не открылся? Открыть ещё раз
            </a>
          )}
        </div>
      )}
      {phase === "error" && (
        <p role="alert" className="mt-4 text-center text-[13px] text-danger">
          Подтверждение не пришло. Нажми Telegram ещё раз.
        </p>
      )}

      {channel && (
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
