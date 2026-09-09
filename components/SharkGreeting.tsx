"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// ИИ-акулёнок здоровается при заходе на сайт (Адиль, 09.09.2026): один раз за
// визит, через пару секунд после загрузки. Нажатие открывает чат, крестик убирает.
// Не показываем в плеере курса и во время теста — там чата тоже нет.
//
// Два места (Адиль 09.09: «надо где иконка в сайдбаре»):
//   anchored — на десктопе облачко растёт из круглой кнопки акулёнка внизу боковой
//              панели (рендерится внутри Sidebar рядом с AskButton);
//   floating — на мобиле панели на экране нет, поэтому плашка внизу экрана.
const KEY = "tl_shark_greeted";
export const SHARK_HELLO = "Привет! Если что — спрашивай, сориентирую, что к чему тут.";

export function SharkGreeting({ chatOpen, onOpen, variant = "floating" }: { chatOpen: boolean; onOpen: () => void; variant?: "anchored" | "floating" }) {
  const pathname = usePathname() ?? "";
  const [show, setShow] = useState(false);
  const hidden = pathname.startsWith("/learn/") || /^\/tests\/[^/]+\/take/.test(pathname);

  useEffect(() => {
    if (hidden) return;
    try {
      if (sessionStorage.getItem(KEY)) return;
    } catch {
      /* приватный режим: покажем, но не запомним */
    }
    const t = setTimeout(() => setShow(true), 1800);
    return () => clearTimeout(t);
  }, [hidden]);

  const dismiss = () => {
    setShow(false);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* no-op */
    }
  };

  if (!show || chatOpen || hidden) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        variant === "anchored"
          ? // облачко над кнопкой акулёнка, прижато к правому краю панели; хвостик ниже
            "absolute bottom-full right-3 mb-3 hidden w-[248px] lg:block"
          : "fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-[380px] -translate-x-1/2 lg:hidden"
      }
    >
      <div className="relative flex items-start gap-3 rounded-[12px] border border-line bg-panel-2 p-3 pr-2 shadow-[0_12px_32px_rgba(0,0,0,0.14)]">
        {variant === "anchored" && (
          <span
            aria-hidden="true"
            className="absolute -bottom-[7px] right-[18px] h-3 w-3 rotate-45 border-b border-r border-line bg-panel-2"
          />
        )}
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-600 text-[#fff]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 13c3-4 7-6 12-6l3-4 1 5c2 1 3 2 3 3s-4 3-8 3H8l-3 3-1-4z" />
            <path d="M9 10c0 1 .5 2 1.5 2.5" />
          </svg>
        </span>
        <button
          type="button"
          onClick={() => {
            dismiss();
            onOpen();
          }}
          className="min-w-0 flex-1 text-left"
        >
          <span className="block text-[13px] font-semibold text-ink">ИИ-акулёнок</span>
          <span className="block text-[13.5px] leading-snug text-body">{SHARK_HELLO}</span>
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Закрыть"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-faint transition-colors hover:bg-subtle hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
