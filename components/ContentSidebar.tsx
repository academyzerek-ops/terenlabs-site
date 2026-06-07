"use client";

import { useState } from "react";
import Link from "next/link";

// Боковая панель контента (как дерево курса в плеере):
// список соседних материалов, активный подсвечен, поиск по названию.
export type SidebarItem = {
  slug: string;
  title: string;
  href: string;
  dot?: string; // цвет исхода (кейсы)
};

export function ContentSidebar({
  title,
  items,
  activeSlug,
  backHref,
  backLabel,
}: {
  title: string;
  items: SidebarItem[];
  activeSlug: string;
  backHref: string;
  backLabel: string;
}) {
  const [open, setOpen] = useState(false); // мобильный свёрнутый режим
  const [q, setQ] = useState("");
  const visible = q
    ? items.filter((i) => i.title.toLowerCase().includes(q.toLowerCase()))
    : items;

  return (
    <aside className="flex min-h-0 flex-col border-r border-line bg-subtle">
      <div className="border-b border-line p-5">
        <Link href={backHref} className="text-xs text-muted hover:text-teal">
          ← {backLabel}
        </Link>
        <h2 className="mt-2 text-lg text-heading">{title}</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Найти…"
          aria-label={`Поиск: ${title}`}
          className="mt-3 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-body outline-none transition-colors placeholder:text-muted focus-visible:border-teal"
        />
        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-3 w-full rounded-lg border border-line py-2 text-sm text-heading lg:hidden"
        >
          {open ? "Скрыть список" : `Показать список (${items.length})`}
        </button>
      </div>
      <nav className={`${open ? "block" : "hidden"} min-h-0 flex-1 overflow-y-auto p-3 lg:block`}>
        {visible.length === 0 && (
          <p className="px-2 py-4 text-sm text-muted">Ничего не нашлось.</p>
        )}
        <div className="space-y-0.5">
          {visible.map((i) => {
            const active = i.slug === activeSlug;
            return (
              <Link
                key={i.slug}
                href={i.href}
                onClick={() => setOpen(false)}
                className={`flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm leading-snug transition-colors ${
                  active ? "bg-teal text-white" : "text-heading hover:bg-card"
                }`}
              >
                {i.dot && (
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: i.dot }}
                    aria-hidden="true"
                  />
                )}
                <span className="line-clamp-2">{i.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
