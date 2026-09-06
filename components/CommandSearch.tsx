"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATALOG } from "@/lib/content";
import { ACADEMY } from "@/lib/learn";

// Поиск по сайту (⌘K): разделы, треки и главы Академии, кейсы, ниши, разборы.
// Заголовки лежат в бандле, текст страниц — в /search-index.json: он грузится лениво
// при первом открытии поиска (собирается scripts/build_search_index.mjs).
type Hit = { label: string; sub: string; href: string; key?: string };

const SECTIONS: Hit[] = [
  { label: "Главная", sub: "раздел", href: "/" },
  { label: "Академия", sub: "раздел", href: "/academy" },
  { label: "Тесты: тропа", sub: "раздел", href: "/tests" },
  { label: "Океан: уровни", sub: "раздел", href: "/levels" },
  { label: "Рейтинг Океана", sub: "раздел", href: "/ocean" },
  { label: "Предприниматель", sub: "раздел", href: "/delo" },
  { label: "Фаундер", sub: "раздел", href: "/startup" },
  { label: "Кабинет", sub: "раздел", href: "/dashboard" },
];

function buildIndex(): Hit[] {
  const hits: Hit[] = [...SECTIONS];
  for (const t of ACADEMY) {
    hits.push({ label: t.title, sub: "трек Академии", href: `/courses/${t.slug}` });
    for (const m of t.modules) for (const c of m.chapters) if (!c.missing) hits.push({ label: c.title, sub: `${t.title} · ${m.title}`, href: `/learn/${t.slug}?ch=${c.file}`, key: `${t.slug}:${c.file}` });
  }
  const kind: Record<string, string> = { case: "кейс", review: "ниша", bm: "разбор бренда", test: "тест", course: "курс", finmodel: "финмодель" };
  for (const p of CATALOG) {
    if (p.type === "course") continue;
    hits.push({ label: p.title, sub: kind[p.type] ?? p.type, href: p.href, key: p.slug });
  }
  return hits;
}

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е");

/** Кусок текста вокруг найденного слова — чтобы было видно, за что зацепилось. */
function snippet(text: string, needle: string): string {
  const i = norm(text).indexOf(needle);
  if (i < 0) return "";
  const from = Math.max(0, i - 45);
  const cut = text.slice(from, from + 130).trim();
  return (from > 0 ? "…" : "") + cut + "…";
}

export function CommandSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const index = useMemo(buildIndex, []);
  // тексты страниц: грузим один раз, при первом открытии
  const [texts, setTexts] = useState<Record<string, string> | null>(null);
  const [loadingTexts, setLoadingTexts] = useState(false);

  const results = useMemo(() => {
    const s = norm(q.trim());
    if (!s) return index.slice(0, 8).map((h) => ({ h, snip: "" }));
    const words = s.split(/\s+/);
    return index
      .map((h) => {
        const l = norm(h.label), sub = norm(h.sub);
        const text = (h.key && texts?.[h.key]) || "";
        const body = text ? norm(text) : "";
        let score = 0;
        let inBody = "";
        for (const w of words) {
          if (l.startsWith(w)) score += 4;
          else if (l.includes(w)) score += 3;
          else if (sub.includes(w)) score += 2;
          else if (body.includes(w)) { score += 1; if (!inBody) inBody = w; }
          else return null;
        }
        return { h, score, snip: inBody ? snippet(text, inBody) : "" };
      })
      .filter((x): x is { h: Hit; score: number; snip: string } => !!x)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [q, index, texts]);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setSel(0);
    setTimeout(() => inputRef.current?.focus(), 10);
    if (texts || loadingTexts) return;
    setLoadingTexts(true);
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setTexts(d?.k ?? {}))
      .catch(() => setTexts({}));
  }, [open, texts, loadingTexts]);

  useEffect(() => setSel(0), [q]);

  if (!open) return null;

  const go = (h: Hit) => {
    onClose();
    router.push(h.href);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-4 pt-[12vh]" onClick={onClose} role="dialog" aria-modal="true" aria-label="Поиск по сайту">
      <div className="w-full max-w-[600px] overflow-hidden rounded-[12px] border border-line-2 bg-raised shadow-[var(--shadow-tl-lg)]" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowDown") { e.preventDefault(); setSel((i) => Math.min(results.length - 1, i + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel((i) => Math.max(0, i - 1)); }
            if (e.key === "Enter" && results[sel]) go(results[sel].h);
          }}
          placeholder="Найти по названию или по тексту страниц…"
          className="h-12 w-full border-b border-line bg-transparent px-4 text-[16px] text-ink outline-none placeholder:text-faint"
        />
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-[14px] text-faint">Ничего не нашлось</li>}
          {results.map(({ h, snip }, i) => (
            <li key={h.href + h.label}>
              <button
                onMouseEnter={() => setSel(i)}
                onClick={() => go(h)}
                className={`w-full rounded-[6px] px-3 py-2 text-left text-[14px] ${i === sel ? "bg-hover text-ink" : "text-text-2"}`}
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="truncate">{h.label}</span>
                  <span className="shrink-0 text-[12px] text-faint">{h.sub}</span>
                </span>
                {snip && <span className="mt-0.5 block truncate text-[12px] text-faint">{snip}</span>}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-[12px] text-faint">
          <span>↑↓ выбрать</span>
          <span>↵ открыть</span>
          <span>esc закрыть</span>
          {q.trim() && !texts && <span className="ml-auto">ищу в тексте страниц…</span>}
        </div>
      </div>
    </div>
  );
}
