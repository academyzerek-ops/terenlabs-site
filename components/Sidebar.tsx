"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getOceanName, getOceanToken } from "@/lib/ocean";
import { getProgress, type CourseProgress } from "@/lib/memory";
import { CommandSearch } from "./CommandSearch";
import { SidebarDiary } from "./SidebarDiary";
import { SidebarAsk } from "./SidebarAsk";

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
  calendar: <path d="M2.5 4h11v9.5h-11zM2.5 7h11M5.5 2.5v3M10.5 2.5v3" />,
  info: <path d="M8 2.4a5.6 5.6 0 1 0 0 11.2 5.6 5.6 0 0 0 0-11.2M8 7.2v3.6M8 5.2v.1" />,
};

function Icon({ d }: { d: React.ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {d}
    </svg>
  );
}

// «Главная» из списка убрана: на неё ведут логотип сверху и вкладка с тем же
// именем, три одинаковых слова в одной панели читались как ошибка.
const QUICK: Item[] = [
  { label: "Океан", href: "/levels", icon: I.wave, match: (p) => p.startsWith("/levels") || p.startsWith("/ocean") },
  { label: "Кабинет", href: "/dashboard", icon: I.user, match: (p) => p.startsWith("/dashboard") },
];

// Панель по типу занятия, не по аудитории (решение Адиля 06.09): Академия и Тесты одни на всех,
// разборы трёх видов. Хабы «Своё дело» и «Стартап» живут дверями на главной и в Академии.
const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Учиться",
    items: [
      { label: "Академия", href: "/academy", icon: I.book, match: (p) => p === "/academy" || p.startsWith("/courses/") || p.startsWith("/learn/") },
      { label: "Тесты", href: "/tests", icon: I.test, match: (p) => p === "/tests" || p.startsWith("/tests/") },
    ],
  },
  {
    title: "Разбирать",
    items: [
      { label: "Кейсы", href: "/catalog?type=case", icon: I.case, match: (p, t) => (p === "/catalog" && t === "case") || p.startsWith("/cases/") },
      { label: "Бренды", href: "/catalog?type=bm", icon: I.brand, match: (p, t) => (p === "/catalog" && t === "bm") || p.startsWith("/brands/") },
      { label: "Ниши", href: "/catalog?type=review", icon: I.chart, match: (p, t) => (p === "/catalog" && t === "review") || p.startsWith("/reviews/") },
    ],
  },
];

// Вторая вкладка: то, что нужно редко, но должно быть под рукой.
const ABOUT: { title: string; items: Item[] }[] = [
  {
    title: "О проекте",
    items: [
      { label: "О компании", href: "/about", icon: I.info },
      { label: "Открытая библиотека", href: "/free", icon: I.book },
      { label: "Связь с нами", href: "/contacts", icon: I.doc },
    ],
  },
  {
    title: "Правила",
    items: [
      { label: "Соглашение", href: "/legal/offer", icon: I.doc },
      { label: "Конфиденциальность", href: "/legal/privacy", icon: I.doc },
    ],
  },
];

type Tab = "home" | "diary" | "about";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Главная", icon: I.home },
  { id: "diary", label: "Дневник", icon: I.calendar },
  { id: "about", label: "О проекте", icon: I.info },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("home");
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

        {/* вкладки: активная с подписью, остальные значком, как в Notion */}
        <div className="flex items-center gap-1 px-3 pt-3">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={active}
                title={t.label}
                className={`flex h-8 items-center gap-2 rounded-[7px] text-[14px] transition-colors ${
                  active ? "bg-hover px-2.5 font-medium text-ink" : "w-8 justify-center text-faint hover:bg-subtle hover:text-ink"
                }`}
              >
                <Icon d={t.icon} />
                {active && <span>{t.label}</span>}
              </button>
            );
          })}
        </div>

        {tab === "diary" ? (
          <nav className="min-h-0 flex-1 overflow-y-auto pt-3">
            <SidebarDiary onNavigate={onClose} />
          </nav>
        ) : tab === "about" ? (
          <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-4">
            {ABOUT.map((g) => (
              <div key={g.title} className="mb-4">
                <p className="px-2 pb-1 text-[12px] font-medium text-faint">{g.title}</p>
                <div className="flex flex-col gap-px">{g.items.map((it) => row(it, true))}</div>
              </div>
            ))}
            <p className="px-2 pt-1 text-[12px] leading-relaxed text-faint">
              Вся линейка бесплатна. Пишите, если чего-то не хватает: мы читаем каждое сообщение.
            </p>
          </nav>
        ) : (
        <>
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
        </nav>
        </>
        )}

        {/* низ: строка к TEREN-AI и аккаунт */}
        <SidebarAsk />
        <div className="border-t border-line p-2">
          <Link href={name ? "/dashboard" : "/auth/sign-in"} onClick={onClose} className="flex h-10 items-center gap-2.5 rounded-[6px] px-2 text-[14px] transition-colors hover:bg-subtle">
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-hover text-[12px] font-semibold text-ink">
              {name ? name.trim()[0]?.toUpperCase() : <Icon d={I.user} />}
            </span>
            <span className="min-w-0 flex-1 truncate text-ink">{name ?? "Войти"}</span>
            {name ? (
              <span className="text-[12px] text-faint">кабинет</span>
            ) : (
              <span className="flex items-center gap-1.5" aria-hidden="true">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2AABEE] text-[#fff]">
                  <svg viewBox="0 0 240 240" width="11" height="11" className="-ml-px"><path fill="currentColor" d="M44.7 121.5 194.9 63.6c7-2.6 13.1 1.6 10.8 12.2l-25.6 120.6c-1.9 8.5-7 10.6-14.1 6.6l-39-28.8-18.8 18.2c-2.1 2.1-3.8 3.8-7.8 3.8l2.8-39.8 72.3-65.3c3.1-2.8-.7-4.3-4.9-1.7l-89.4 56.3-38.5-12c-8.4-2.7-8.6-8.4 2-12.2Z" /></svg>
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ffffff]">
                  <svg width="11" height="11" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.5 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z" /><path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.3 0 11.7-2.1 15.6-5.7l-7.7-6c-2.1 1.4-4.8 2.3-7.9 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#34A853] text-[#fff]">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F0873A] text-[#fff]">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                </span>
              </span>
            )}
          </Link>
        </div>
      </aside>

      {open && <button aria-label="Закрыть панель" onClick={onClose} className="fixed inset-0 z-30 bg-black/50 lg:hidden" />}
      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export const SIDEBAR_ICON = I;
