"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// TEREN-AI — тот же мозг, что в Mini App: Railway POST /chat
// (системный промпт из source-of-truth + RAG по базе знаний + история диалога).
const AI_API =
  process.env.NEXT_PUBLIC_AI_API ?? "https://terenlabs-production.up.railway.app/chat";

type Msg = { role: "user" | "ai"; text: string };

const GREETING: Msg = {
  role: "ai",
  text: "Я TEREN-AI. Спроси про свой бизнес, нишу или цифры — отвечу по базе знаний TerenLabs, без мотивашек.",
};

export function NoaChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const pathname = usePathname();
  const listRef = useRef<HTMLDivElement>(null);

  // автоскролл к последнему сообщению
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs, open]);

  const send = async () => {
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setBusy(true);
    try {
      const r = await fetch(AI_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          context: { screen: "site", title: pathname },
          // история без приветствия — как в Mini App, роли user/assistant
          history: msgs
            .filter((m) => m !== GREETING)
            .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
        }),
      });
      const data = await r.json();
      let text: string =
        typeof data?.reply === "string" && data.reply.trim()
          ? data.reply
          : "Не получила ответ. Попробуй ещё раз.";
      // техошибки бэкенда не показываем сырым JSON
      if (data?.status === "error" || /временно недоступ|PERMISSION_DENIED|"code":/i.test(text)) {
        text = "TEREN-AI сейчас на техобслуживании. Загляни чуть позже — отвечу по базе знаний.";
      }
      setMsgs((m) => [...m, { role: "ai", text }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "ai", text: "Связь с глубиной прервалась. Проверь интернет и попробуй ещё раз." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  // в плеере курса не показываем — там и так полный экран контента
  if (pathname.startsWith("/learn/")) return null;

  return (
    <>
      {/* плавающая кнопка */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Закрыть TEREN-AI" : "Открыть TEREN-AI"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-teal to-teal-600 shadow-[0_8px_30px_rgba(0,183,194,0.45)] transition-transform hover:scale-105 active:scale-95"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <img src="/brand/logo_shark_white.png" alt="" width={34} height={34} className="object-contain" aria-hidden="true" />
        )}
      </button>

      {/* панель чата */}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 flex h-[78vh] flex-col overflow-hidden rounded-t-[20px] border border-line bg-card shadow-[var(--shadow-tl-lg)] sm:inset-x-auto sm:bottom-24 sm:right-5 sm:h-[560px] sm:w-[400px] sm:rounded-[20px]"
          role="dialog"
          aria-label="Чат TEREN-AI"
          style={{ overscrollBehavior: "contain" }}
        >
          {/* шапка */}
          <div className="flex items-center gap-3 border-b border-line bg-navy-900 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-teal to-teal-600">
              <img src="/brand/logo_shark_white.png" alt="" width={22} height={22} aria-hidden="true" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-bold text-foam">TEREN-AI</div>
              <div className="text-xs text-foam/55">отвечает по базе знаний TerenLabs</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              className="text-foam/60 transition-colors hover:text-teal sm:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* сообщения */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto rounded-br-md bg-teal text-white"
                    : "rounded-bl-md bg-subtle text-body"
                }`}
              >
                {m.text}
              </div>
            ))}
            {busy && (
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-subtle px-3.5 py-2.5 text-sm text-muted">
                TEREN-AI думает…
              </div>
            )}
          </div>

          {/* ввод */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-2 border-t border-line p-3"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Спроси про бизнес…"
              aria-label="Вопрос для TEREN-AI"
              className="max-h-28 flex-1 resize-none rounded-xl border border-line bg-subtle px-3.5 py-2.5 text-sm text-body outline-none transition-colors placeholder:text-muted focus-visible:border-teal"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Отправить"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal text-white transition-colors hover:bg-teal-600 disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
