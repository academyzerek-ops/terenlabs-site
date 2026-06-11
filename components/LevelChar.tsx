"use client";

import { useState } from "react";
import Link from "next/link";

// Кликабельный персонаж уровня (12_OCEAN, правка Адиля):
// открытый уровень → тесты уровня; закрытый → подсказка «начни с Краба».
export function LevelChar({
  locked,
  href,
  children,
}: {
  locked: boolean;
  href: string;
  children: React.ReactNode;
}) {
  const [hint, setHint] = useState(false);

  if (!locked) {
    return (
      <Link
        href={href}
        className="group block cursor-pointer transition-transform duration-300 hover:scale-[1.04]"
        aria-label="Открыть тесты уровня"
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setHint((v) => !v)}
      className="relative block cursor-pointer"
      aria-label="Уровень закрыт"
    >
      {children}
      {hint && (
        <span className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-xl border border-white/15 bg-navy-900/95 px-4 py-3 text-sm leading-snug text-foam shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
          Закрыто. Путь начинается с Краба — уровни открываются по порядку.
        </span>
      )}
    </button>
  );
}
