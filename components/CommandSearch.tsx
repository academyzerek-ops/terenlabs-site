"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATALOG } from "@/lib/content";
import { ACADEMY } from "@/lib/learn";

// Поиск по сайту (⌘K): разделы, треки и главы Академии, кейсы, ниши, разборы. Локально по данным сборки.
type Hit = { label: string; sub: string; href: string };

const SECTIONS: Hit[] = [
  { label: "Главная", sub: "раздел", href: "/" },
  { label: "Океан: уровни", sub: "раздел", href: "/levels" },
  { label: "Рейтинг Океана", sub: "раздел", href: "/ocean" },
  { label: "Своё дело", sub: "раздел", href: "/delo" },
  { label: "Стартап", sub: "раздел", href: "/startup" },
  { label: "Кабинет", sub: "раздел", href: "/dashboard" },
];

function buildIndex(): Hit[] {
  const hits: Hit[] = [...SECTIONS];
  for (const t of ACADEMY) {
    hits.push({ label: t.title, sub: "трек Академии", href: `/courses/${t.slug}` });
    for (const m of t.modules) for (const c of m.chapters) if (!c.missing) hits.push({ label: c.title, sub: `${t.title} · ${m.title}`, href: `/learn/${t.slug}?ch=${c.file}` });
  }
  const kind: Record<string, string> = { case: "кейс", review: "ниша", bm: "разбор бренда", test: "тест", course: "курс", finmodel: "финмодель" };
  for (const p of CATALOG) {
    if (p.type === "course") continue;
    hits.push({ label: p.title, sub: kind[p.type] ?? p.type, href: p.href });
  }
  return hits;
}

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е");

export function CommandSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    const s = norm(q.trim());
    if (!s) return index.slice(0, 8);
    const words = s.split(/\s+/);
    return index
      .map((h) => {
        const l = norm(h.label), sub = norm(h.sub);
        let score = 0;
        for (const w of words) {
          if (l.startsWith(w)) score += 3;
          else if (l.includes(w)) score += 2;
          else if (sub.includes(w)) score += 1;
          else return null;
        }
        return { h, score };
      })
      .filter((x): x is { h: Hit; score: number } => !!x)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.h);
  }, [q, index]);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => setSel(0), [q]);

  if (!open) return null;

  const go = (h: Hit) => {
    onClose();
    router.push(h.href);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-4 pt-[12vh]" onClick={onClose} role="dialog" aria-modal="true" aria-label="Поиск по сайту">
      <div className="w-full max-w-[600px] overflow-hidden rounded-[12px] border border-line-2 bg-[#252525] shadow-[var(--shadow-tl-lg)]" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowDown") { e.preventDefault(); setSel((i) => Math.min(results.length - 1, i + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel((i) => Math.max(0, i - 1)); }
            if (e.key === "Enter" && results[sel]) go(results[sel]);
          }}
          placeholder="Найти главу, кейс, нишу, разбор…"
          className="h-12 w-full border-b border-line bg-transparent px-4 text-[16px] text-ink outline-none placeholder:text-faint"
        />
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-[14px] text-faint">Ничего не нашлось</li>}
          {results.map((h, i) => (
            <li key={h.href + h.label}>
              <button
                onMouseEnter={() => setSel(i)}
                onClick={() => go(h)}
                className={`flex w-full items-center justify-between gap-4 rounded-[6px] px-3 py-2 text-left text-[14px] ${i === sel ? "bg-hover text-ink" : "text-text-2"}`}
              >
                <span className="truncate">{h.label}</span>
                <span className="shrink-0 text-[12px] text-faint">{h.sub}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-[12px] text-faint">
          <span>↑↓ выбрать</span>
          <span>↵ открыть</span>
          <span>esc закрыть</span>
        </div>
      </div>
    </div>
  );
}
