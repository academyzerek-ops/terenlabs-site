"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveProgress } from "@/lib/memory";

export type NavModule = { id: string; title: string; chapters: { file: string; title: string }[] };

// Дерево трека слева от главы: прочитанные главы помечаются локально (localStorage),
// текущая оранжевой точкой. Стрелки ← → на клавиатуре листают главы.
export function LessonNav({
  slug,
  title,
  modules,
  currentFile,
  prevFile,
  nextFile,
  index,
  total,
}: {
  slug: string;
  title: string;
  modules: NavModule[];
  currentFile: string;
  prevFile: string | null;
  nextFile: string | null;
  index: number;
  total: number;
}) {
  const router = useRouter();
  const [read, setRead] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const key = `tl-read:${slug}`;

  useEffect(() => {
    let set = new Set<string>();
    try {
      set = new Set(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {}
    set.add(currentFile);
    try {
      localStorage.setItem(key, JSON.stringify([...set]));
    } catch {}
    setRead(set);
    const cur = modules.flatMap((m) => m.chapters).find((c) => c.file === currentFile);
    saveProgress({
      slug,
      title,
      stepId: currentFile,
      stepTitle: cur?.title ?? "",
      idx: index,
      total,
      at: new Date().toISOString(),
    });
    setOpen(false);
  }, [currentFile, key, slug, title, modules, index, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === "ArrowRight" && nextFile) router.push(`/learn/${slug}?ch=${nextFile}`);
      if (e.key === "ArrowLeft" && prevFile) router.push(`/learn/${slug}?ch=${prevFile}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextFile, prevFile, router, slug]);

  const pct = Math.round((read.size / Math.max(1, total)) * 100);

  return (
    <aside className="border-b border-line bg-page lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="px-5 pb-3 pt-5 lg:px-6">
        <Link href={`/courses/${slug}`} className="text-[13px] text-faint transition-colors hover:text-ink">
          ← к треку
        </Link>
        <h2 className="mt-2 text-[15px] font-semibold leading-snug">{title}</h2>
        <div className="mt-3 flex items-center gap-3 text-[12px] text-faint">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Прочитано" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-accent-600 transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
          <span className="num">
            {read.size}/{total}
          </span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="lesson-nav"
          className="btn-press mt-3 h-9 w-full rounded-[8px] border border-line text-[14px] font-medium text-ink transition-colors hover:bg-subtle lg:hidden"
        >
          {open ? "Скрыть содержание" : "Содержание"}
        </button>
      </div>

      <nav id="lesson-nav" aria-label="Содержание трека" className={`${open ? "block" : "hidden"} px-3 pb-6 lg:block`}>
        {modules.map((m) => (
          <div key={m.id} className="mt-3">
            <p className="px-3 pb-1 text-[12px] font-medium text-faint">{m.title}</p>
            {m.chapters.map((c) => {
              const active = c.file === currentFile;
              const done = read.has(c.file);
              return (
                <Link
                  key={c.file}
                  href={`/learn/${slug}?ch=${c.file}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-start gap-2.5 rounded-[6px] px-3 py-[7px] text-[14px] leading-snug transition-colors ${
                    active ? "bg-subtle text-ink" : "text-text-2 hover:bg-subtle hover:text-ink"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-[6px] flex h-[10px] w-[10px] shrink-0 items-center justify-center rounded-full ${
                      active ? "bg-orange" : done ? "text-accent" : "border border-line-2"
                    }`}
                  >
                    {done && !active && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 5.2 4.2 7.4 8 3" />
                      </svg>
                    )}
                  </span>
                  <span className={`min-w-0 flex-1 ${active ? "font-medium" : ""}`}>{c.title}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
