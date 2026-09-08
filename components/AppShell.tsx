"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { NoaChat } from "./NoaChat";

// Каркас сайта: слева панель (на десктопе всегда), сверху на мобиле тонкая полоса с кнопкой панели.
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  // Колонка ИИ-акулёнок живёт в том же ряду, что панель и контент: пока она открыта,
  // контент ужимается, закрыли — экран возвращается к прежней ширине.
  const [chat, setChat] = useState(false);
  return (
    <div className="flex min-h-dvh">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        chatOpen={chat}
        onToggleChat={() => setChat((v) => !v)}
      />
      <div className={chat ? "contents" : "hidden"}>
        <NoaChat open={chat} onClose={() => setChat(false)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-line bg-page/95 px-3 backdrop-blur-sm lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Открыть панель" className="flex h-10 w-10 items-center justify-center rounded-[6px] text-text-2 hover:bg-subtle hover:text-ink">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" aria-hidden="true"><path d="M2.5 3.5h11v9h-11zM6 3.5v9" /></svg>
          </button>
          <Link href="/" className="flex-1 text-[15px] font-semibold text-ink">TerenLabs</Link>
        </div>
        {children}
      </div>
    </div>
  );
}
