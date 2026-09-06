"use client";

import { usePathname } from "next/navigation";
import { SharkMark } from "./SharkMark";

// Круглая кнопка TEREN-AI, как кнопка ИИ в Notion: светлый круг на тёмной теме,
// тёмный на светлой, внутри акула. Живёт внизу боковой панели, над аккаунтом.
export function AskButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname() ?? "";
  // В плеере курса и на прохождении теста чата нет: ИИ рядом с вопросами — это
  // подсказки в экзамене.
  if (pathname.startsWith("/learn/") || /^\/tests\/[^/]+\/take/.test(pathname)) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Спросить TEREN-AI"
      aria-pressed={open}
      title="Спросить TEREN-AI"
      // Кнопка выглядит одинаково открытой и закрытой: на светлой теме чёрный круг
      // с белой акулой, на тёмной наоборот. Что чат открыт, видно по самой колонке.
      className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-page shadow-[var(--shadow-fab)] transition-transform duration-200 hover:scale-[1.06] active:scale-95"
    >
      <SharkMark size={32} />
    </button>
  );
}
