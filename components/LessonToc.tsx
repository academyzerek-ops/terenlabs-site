"use client";

import { useEffect, useState } from "react";
import type { LessonToc as Toc } from "@/lib/lesson-html";

// Оглавление главы справа (как в Notion): подзаголовки, активный подсвечен по скроллу.
export function LessonToc({ items }: { items: Toc[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (!items.length) return;
    const els = items.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive((vis[0].target as HTMLElement).id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  if (items.length < 2) return null;
  return (
    <nav aria-label="Оглавление главы" className="text-[13px] leading-snug">
      <p className="mb-2 text-[12px] font-medium text-faint">В этой главе</p>
      <ul className="border-l border-line">
        {items.map((t) => (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              className={`-ml-px block border-l py-1 pl-3 transition-colors ${
                active === t.id ? "border-ink text-ink" : "border-transparent text-text-2 hover:text-ink"
              }`}
            >
              {t.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
