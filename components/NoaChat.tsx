"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// TEREN-AI — тот же мозг, что в Mini App: Railway POST /chat[/stream]
// (системный промпт из source-of-truth + RAG по базе знаний + история диалога).
const AI_API =
  process.env.NEXT_PUBLIC_AI_API ?? "https://terenlabs-production.up.railway.app/chat";
import { getOceanToken } from "@/lib/ocean";

const AI_API_STREAM = AI_API + "/stream";

// Чат на бэке строго за входом (гейт d9d64276): без Authorization сервер
// вежливо отказывает даже вошедшему. Подписываем веб-токеном Океана.
function chatHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const t = getOceanToken();
    if (t) h.Authorization = `web ${t}`;
  } catch {
    /* SSR/приватный режим — уйдёт без токена, сервер попросит вход */
  }
  return h;
}
const MAINTENANCE =
  "TEREN-AI сейчас на техобслуживании. Загляни чуть позже — отвечу по базе знаний.";

type Msg = { role: "user" | "ai"; text: string };

const GREETING: Msg = {
  role: "ai",
  text: "Я TEREN-AI. Спроси про свой бизнес, нишу или цифры — отвечу по базе знаний TerenLabs, без мотивашек.",
};

export function NoaChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const setOpen = (v: boolean) => { if (!v) onClose(); };
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const pathname = usePathname();
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  // Во время прохождения теста чата нет: (1) плавающая кнопка перекрывала
  // «Дальше» на мобиле, (2) ИИ рядом с вопросами — это подсказки в экзамене.
  const inTest = /^\/tests\/[^/]+\/take/.test(pathname ?? "");

  // автоскролл к последнему сообщению
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs, open]);

  // мобильный шит: пока чат открыт — фон не скроллится (иначе страница
  // гуляет под панелью и выглядит криво)
  useEffect(() => {
    if (!open || window.innerWidth >= 640) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // a11y-модалка: при открытии — фокус в поле ввода; Esc закрывает; Tab заперт
  // внутри диалога; при закрытии фокус возвращается на вызвавший элемент.
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const prevFocused = document.activeElement as HTMLElement | null;
    const focusables = () =>
      dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'button, textarea, input, a[href], [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => !el.hasAttribute("disabled"))
        : [];
    (dialog?.querySelector<HTMLElement>("textarea") ?? focusables()[0])?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (f.length === 0) return;
      const firstEl = f[0];
      const lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prevFocused?.focus?.();
    };
  }, [open]);

  // последнее AI-сообщение печатается посимвольно: target набегает из стрима,
  // интервал раскрывает текст порциями — живая «печать» вместо вываливания разом
  const typewriter = (getTarget: () => string, isDone: () => boolean) =>
    new Promise<void>((resolve) => {
      const tick = setInterval(() => {
        setMsgs((m) => {
          const last = m[m.length - 1];
          if (!last || last.role !== "ai") return m;
          const target = getTarget();
          if (last.text.length >= target.length) {
            if (isDone()) {
              clearInterval(tick);
              resolve();
            }
            return m;
          }
          const next = target.slice(0, last.text.length + 3);
          return [...m.slice(0, -1), { ...last, text: next }];
        });
      }, 24);
    });

  const send = async (preset?: string) => {
    const question = (preset ?? input).trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);
    const history = msgs
      .filter((m) => m !== GREETING)
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
    // пользовательский пузырь + пустой AI-пузырь под печать
    setMsgs((m) => [...m, { role: "user", text: question }, { role: "ai", text: "" }]);

    const body = JSON.stringify({
      message: question,
      context: { screen: "site", title: pathname },
      history,
    });

    let target = "";
    let done = false;
    const reveal = typewriter(
      () => target,
      () => done
    );

    try {
      // 1) пробуем стрим — токены набегают по мере генерации
      const r = await fetch(AI_API_STREAM, {
        method: "POST",
        headers: chatHeaders(),
        body,
      });
      if (r.ok && r.body) {
        const reader = r.body.getReader();
        const dec = new TextDecoder();
        for (;;) {
          const { value, done: d } = await reader.read();
          if (d) break;
          target += dec.decode(value, { stream: true });
        }
      }
      // 2) стрим пуст (ошибка/недоступен) — фолбэк на обычный /chat
      if (!target.trim()) {
        const r2 = await fetch(AI_API, {
          method: "POST",
          headers: chatHeaders(),
          body,
        });
        const data = await r2.json();
        target =
          typeof data?.reply === "string" && data.reply.trim()
            ? data.reply
            : "Не получила ответ. Попробуй ещё раз.";
        if (data?.status === "error") target = MAINTENANCE;
      }
      // техошибки не показываем сырым JSON
      if (/временно недоступ|PERMISSION_DENIED|"code":/i.test(target)) target = MAINTENANCE;
    } catch {
      target = target.trim() || "Связь с глубиной прервалась. Проверь интернет и попробуй ещё раз.";
    } finally {
      done = true;
      await reveal;
      setBusy(false);
    }
  };

  // Вопрос можно прислать снаружи событием: колонка откроется и сразу отправит.
  useEffect(() => {
    const onAsk = (e: Event) => {
      const q = (e as CustomEvent<string>).detail?.trim();
      if (q) void send(q);
    };
    window.addEventListener("teren:ai-ask", onAsk as EventListener);
    return () => window.removeEventListener("teren:ai-ask", onAsk as EventListener);
    // send пересоздаётся на каждый рендер, замыкание нужно свежее
  });

  // в плеере курса не показываем — там и так полный экран контента
  if (pathname.startsWith("/learn/") || inTest) return null;

  if (!open) return null;

  // Колонка TEREN-AI: на десктопе встаёт второй колонкой слева и ужимает
  // контент, на телефоне разворачивается на весь экран.
  return (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 flex h-[100dvh] flex-col overflow-hidden bg-[#1c1c1c] lg:static lg:z-auto lg:h-dvh lg:w-[380px] lg:shrink-0 lg:border-r lg:border-line lg:bg-[#1c1c1c]"
          role="dialog"
          aria-label="TEREN-AI"
          style={{ overscrollBehavior: "contain" }}
        >
          {/* шапка */}
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-ink">TEREN-AI</div>
              <div className="text-[12px] text-faint">отвечает по базе знаний TerenLabs</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Закрыть чат"
              className="-mr-1 flex h-8 w-8 items-center justify-center rounded-[7px] text-faint transition-colors hover:bg-subtle hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>

          {/* сообщения */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {msgs
              .filter((m) => m.text !== "")
              .map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto rounded-br-md bg-accent-600 text-[#fff]"
                      : "rounded-bl-md bg-subtle text-body"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            {busy && msgs[msgs.length - 1]?.text === "" && (
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-subtle px-3.5 py-2.5 text-sm text-faint">
                TEREN-AI думает…
              </div>
            )}
          </div>

          {/* ввод: одна большая рамка, кнопка внутри справа снизу */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="p-3"
          >
            <div className="rounded-[12px] border border-line bg-page p-2 transition-colors focus-within:border-accent/60">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={2}
                placeholder="Спроси про свой бизнес, нишу или цифры"
                aria-label="Вопрос для TEREN-AI"
                className="max-h-40 w-full resize-none bg-transparent px-1.5 pb-1 pt-0.5 text-[16px] leading-relaxed text-ink outline-none focus:outline-none focus-visible:outline-none placeholder:text-faint sm:text-[14px]"
              />
              <div className="flex items-center justify-between pl-1.5">
                <span className="text-[11.5px] text-faint">Enter отправит, Shift и Enter перенесут строку</span>
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Отправить"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-600 text-[#fff] transition-opacity disabled:bg-hover disabled:text-faint"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M8 13V3.5M4.2 7 8 3.2 11.8 7" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
  );
}
