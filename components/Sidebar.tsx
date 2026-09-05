"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getOceanName, getOceanToken } from "@/lib/ocean";
import { getProgress, type CourseProgress } from "@/lib/memory";
import { CommandSearch } from "./CommandSearch";

// Боковая панель как в Notion: поиск, быстрые разделы, группы ссылок серыми
// заголовками, внизу аккаунт. На десктопе заменяет верхнюю шапку; на мобиле
// открывается кнопкой из верхней полосы (см. MobileBar).

type Item = { label: string; href: string; icon?: React.ReactNode; match?: (path: string, type: string | null) => boolean };

const I = {
  home: <path d="M3 8.5 8 4l5 4.5V13a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 3 13z" />,
  wave: <path d="M2 9c1.5 0 1.5-2 3-2s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2M2 12.5c1.5 0 1.5-2 3-2s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2" />,
  shop: <path d="M3 6.5 4 3h8l1 3.5M3 6.5h10v6a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5zM6.5 13V9.5h3V13" />,
  rocket: <path d="M9.5 2.5c2 .5 3.5 2 4 4L9 11 5 7zM5 7l-2 .5L4.5 9M9 11l.5 2L11 11.5M6.5 9.5 3 13" />,
  case: <path d="M2.5 5.5h11v7h-11zM6 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M2.5 8.5h11" />,
  book: <path d="M2 3.5h4.5A1.5 1.5 0 0 1 8 5v8.5A1.5 1.5 0 0 0 6.5 12H2zM14 3.5H9.5A1.5 1.5 0 0 0 8 5v8.5a1.5 1.5 0 0 1 1.5-1.5H14z" />,
  grid: <path d="M2.5 2.5h4.5v4.5H2.5zM9 2.5h4.5V7H9zM2.5 9H7v4.5H2.5zM9 9h4.5v4.5H9z" />,
  test: <path d="M3 8.5l3 3 7-7" />,
  brand: <path d="M8 2.5l1.7 3.6 3.9.5-2.9 2.7.8 3.9L8 11.3l-3.5 1.9.8-3.9L2.4 6.6l3.9-.5z" />,
  chart: <path d="M2.5 13.5h11M4 11V7M7 11V4M10 11V8.5M13 11V6" />,
  user: <path d="M8 8a2.75 2.75 0 1 0 0-5.5A2.75 2.75 0 0 0 8 8zM2.5 14c.6-2.6 2.8-4 5.5-4s4.9 1.4 5.5 4" />,
  doc: <path d="M4 2.5h5l3 3v8H4zM9 2.5v3h3M6 9h4M6 11.5h4" />,
  search: <path d="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10zM10.5 10.5 14 14" />,
  panel: <path d="M2.5 3.5h11v9h-11zM6 3.5v9" />,
};

function Icon({ d }: { d: React.ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {d}
    </svg>
  );
}

const QUICK: Item[] = [
  { label: "Главная", href: "/", icon: I.home, match: (p) => p === "/" },
  { label: "Океан", href: "/levels", icon: I.wave, match: (p) => p.startsWith("/levels") || p.startsWith("/ocean") },
  { label: "Кабинет", href: "/dashboard", icon: I.user, match: (p) => p.startsWith("/dashboard") },
];

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Своё дело",
    items: [
      { label: "Хаб «Своё дело»", href: "/delo", icon: I.shop, match: (p) => p === "/delo" },
      { label: "Академия", href: "/catalog?type=course", icon: I.book, match: (p, t) => (p === "/catalog" && t === "course") || p.startsWith("/courses/") || p.startsWith("/learn/") },
      { label: "Тесты", href: "/catalog?type=test", icon: I.test, match: (p, t) => (p === "/catalog" && t === "test") || p.startsWith("/tests/") },
      { label: "Кейсы", href: "/catalog?type=case", icon: I.case, match: (p, t) => (p === "/catalog" && t === "case") || p.startsWith("/cases/") },
      { label: "Ниши", href: "/catalog?type=review", icon: I.chart, match: (p, t) => (p === "/catalog" && t === "review") || p.startsWith("/reviews/") },
    ],
  },
  {
    title: "Стартап",
    items: [
      { label: "Хаб «Стартап»", href: "/startup", icon: I.rocket, match: (p) => p === "/startup" },
      { label: "От идеи до инвестиций", href: "/courses/course-startup", icon: I.book, match: (p) => p.includes("course-startup") },
      { label: "Разборы брендов", href: "/catalog?type=bm", icon: I.brand, match: (p, t) => (p === "/catalog" && t === "bm") || p.startsWith("/brands/") },
    ],
  },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const type = sp.get("type");
  const [name, setName] = useState<string | null>(null);
  const [resume, setResume] = useState<CourseProgress | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setName(getOceanToken() ? getOceanName() : null);
    const all = Object.values(getProgress()).sort((a, b) => (a.at < b.at ? 1 : -1));
    setResume(all[0] ?? null);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const row = (it: Item, dense = false) => {
    const active = it.match ? it.match(pathname, type) : pathname === it.href;
    return (
      <Link
        key={it.href + it.label}
        href={it.href}
        onClick={onClose}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-2.5 rounded-[6px] px-2 text-[14px] transition-colors ${dense ? "h-[30px]" : "h-[32px]"} ${
          active ? "bg-hover font-medium text-ink" : "text-text-2 hover:bg-subtle hover:text-ink"
        }`}
      >
        {it.icon && <span className={active ? "text-ink" : "text-faint"}><Icon d={it.icon} /></span>}
        <span className="truncate">{it.label}</span>
      </Link>
    );
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[272px] shrink-0 flex-col bg-[#202020] transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Навигация по сайту"
      >
        {/* верх: логотип и действия */}
        <div className="flex h-12 items-center justify-between px-3 pt-1">
          <Link href="/" onClick={onClose} className="flex items-center gap-2 rounded-[6px] px-1.5 py-1 text-[14px] font-semibold text-ink hover:bg-subtle">
            <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-ink text-[11px] font-bold text-page">T</span>
            TerenLabs
          </Link>
          <button onClick={onClose} aria-label="Скрыть панель" className="flex h-7 w-7 items-center justify-center rounded-[6px] text-faint hover:bg-subtle hover:text-ink lg:hidden">
            <Icon d={I.panel} />
          </button>
        </div>

        {/* поиск */}
        <div className="px-3 pt-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-8 w-full items-center gap-2 rounded-[8px] border border-line px-2 text-[14px] text-faint transition-colors hover:bg-subtle hover:text-text-2"
          >
            <Icon d={I.search} />
            <span className="flex-1 text-left">Найти</span>
            <kbd className="rounded-[4px] bg-hover px-1.5 py-0.5 text-[11px] text-faint">⌘K</kbd>
          </button>
        </div>

        {/* быстрые разделы */}
        <div className="flex flex-col gap-px px-3 pt-3">{QUICK.map((it) => row(it))}</div>

        {/* группы */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-4">
          {resume && (
            <div className="mb-4">
              <p className="px-2 pb-1 text-[12px] font-medium text-faint">Продолжить</p>
              <Link href={`/learn/${resume.slug}?ch=${resume.stepId}`} onClick={onClose} className="flex items-start gap-2.5 rounded-[6px] px-2 py-1.5 text-[14px] text-text-2 transition-colors hover:bg-subtle hover:text-ink">
                <span className="mt-[3px] text-orange"><Icon d={I.book} /></span>
                <span className="min-w-0">
                  <span className="block truncate text-ink">{resume.stepTitle || resume.title}</span>
                  <span className="block truncate text-[12px] text-faint">{resume.title}</span>
                </span>
              </Link>
            </div>
          )}
          {GROUPS.map((g) => (
            <div key={g.title} className="mb-4">
              <p className="px-2 pb-1 text-[12px] font-medium text-faint">{g.title}</p>
              <div className="flex flex-col gap-px">{g.items.map((it) => row(it, true))}</div>
            </div>
          ))}
          <div className="mb-4">
            <p className="px-2 pb-1 text-[12px] font-medium text-faint">Документы</p>
            <div className="flex flex-col gap-px">
              {row({ label: "Пользовательское соглашение", href: "/legal/offer", icon: I.doc }, true)}
              {row({ label: "Политика конфиденциальности", href: "/legal/privacy", icon: I.doc }, true)}
            </div>
          </div>
        </nav>

        {/* низ: аккаунт */}
        <div className="border-t border-line p-2">
          <Link href={name ? "/dashboard" : "/auth/sign-in"} onClick={onClose} className="flex h-10 items-center gap-2.5 rounded-[6px] px-2 text-[14px] transition-colors hover:bg-subtle">
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-hover text-[12px] font-semibold text-ink">
              {name ? name.trim()[0]?.toUpperCase() : <Icon d={I.user} />}
            </span>
            <span className="min-w-0 flex-1 truncate text-ink">{name ?? "Войти"}</span>
            <span className="text-[12px] text-faint">{name ? "кабинет" : "Telegram · Google · СМС"}</span>
          </Link>
        </div>
      </aside>

      {open && <button aria-label="Закрыть панель" onClick={onClose} className="fixed inset-0 z-30 bg-black/50 lg:hidden" />}
      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export const SIDEBAR_ICON = I;
