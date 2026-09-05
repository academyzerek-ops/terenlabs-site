"use client";

import { useState } from "react";
import Link from "next/link";
import { Arrow } from "./Button";

// Боковая панель контента (как дерево курса в плеере):
// список соседних материалов, активный отмечен, поиск по названию.
export type SidebarItem = {
  slug: string;
  title: string;
  href: string;
  dot?: string; // цвет исхода (кейсы)
  group?: string; // заголовок-разделитель: подряд идущие item'ы одной группы
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
    <aside className="flex min-h-0 flex-col border-b border-line bg-subtle lg:h-full lg:border-b-0 lg:border-r">
      <div className="border-b border-line p-5">
        <Link href={backHref} className="link text-[13px]">
          <Arrow className="rotate-180" /> {backLabel}
        </Link>
        <h2 className="mt-2 text-[16px]">{title}</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Найти…"
          aria-label={`Поиск: ${title}`}
          className="mt-3 h-10 w-full rounded-[8px] border border-line-2 bg-page px-3 text-[16px] text-body outline-none transition-colors placeholder:text-faint focus-visible:border-accent"
        />
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="btn-press mt-3 h-10 w-full rounded-[8px] border border-line-2 text-[14px] font-medium text-ink transition-colors hover:bg-hover lg:hidden"
        >
          {open ? "Скрыть список" : `Показать список (${items.length})`}
        </button>
      </div>
      <nav className={`${open ? "block" : "hidden"} min-h-0 flex-1 overflow-y-auto p-3 lg:block`}>
        {visible.length === 0 && (
          <p className="px-2 py-4 text-[14px] text-text-2">Ничего не нашлось.</p>
        )}
        <div>
          {visible.map((i, idx) => {
            const active = i.slug === activeSlug;
            // при поиске группы не показываем — выдача плоская
            const showGroup = !q && i.group && i.group !== visible[idx - 1]?.group;
            return (
              <div key={i.slug}>
                {showGroup && (
                  <p className="eyebrow px-2.5 pb-1.5 pt-5 text-[11px] first:pt-1">
                    {i.group}
                  </p>
                )}
                <Link
                  href={i.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-start gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[14px] leading-snug transition-colors ${
                    active ? "bg-hover font-medium text-ink" : "text-text-2 hover:bg-hover hover:text-ink"
                  }`}
                >
                  {active ? (
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-orange" aria-hidden="true" />
                  ) : i.dot ? (
                    <span
                      className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: i.dot }}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="line-clamp-2">{i.title}</span>
                </Link>
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
