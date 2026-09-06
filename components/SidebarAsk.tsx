"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getOceanToken } from "@/lib/ocean";

// Строка к TEREN-AI прямо в панели: чат нужен на любой странице, и держать ради
// него отдельную кнопку поверх контента незачем. Отправка поднимает окно чата
// событием, сам диалог живёт в NoaChat.

export const ASK_EVENT = "teren:ai-ask";

export function SidebarAsk() {
  const [text, setText] = useState("");
  const [signedIn, setSignedIn] = useState(true); // до проверки не пугаем подписью
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setSignedIn(!!getOceanToken());
  }, [pathname]);

  // в плеере главы и во время теста чата нет: там он либо мешает, либо подсказывает
  if (pathname.startsWith("/learn/") || /^\/tests\/[^/]+\/take/.test(pathname)) return null;

  const send = () => {
    const q = text.trim();
    // бэкенд отвечает только вошедшим: без токена вопрос ушёл бы в отказ
    if (!signedIn) {
      router.push("/auth/sign-in");
      return;
    }
    window.dispatchEvent(new CustomEvent(ASK_EVENT, { detail: q }));
    setText("");
  };

  return (
    <div className="px-2 pb-1 pt-2">
      <div className="flex items-center gap-1.5 rounded-[8px] border border-line bg-page px-2 transition-colors focus-within:border-line-2">
        <span className="text-faint" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.35} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.6 4.2A1.7 1.7 0 0 1 4.3 2.5h7.4a1.7 1.7 0 0 1 1.7 1.7v5.4a1.7 1.7 0 0 1-1.7 1.7H6.6L3.5 13.7v-2.4h-.9V4.2z" />
            <path d="M5.6 6h4.8M5.6 8.4h3" />
          </svg>
        </span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); send(); }
          }}
          placeholder={signedIn ? "Спросить TEREN-AI" : "Войти и спросить TEREN-AI"}
          aria-label="Спросить TEREN-AI"
          className="h-9 min-w-0 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-faint"
        />
        <button
          type="button"
          onClick={send}
          aria-label="Отправить вопрос"
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] transition-colors ${
            text.trim() ? "bg-accent-600 text-[#fff]" : "text-faint hover:bg-subtle hover:text-text-2"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 13V3M4 6.5 8 2.8l4 3.7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
