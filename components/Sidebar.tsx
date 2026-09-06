"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getOceanName, getOceanToken } from "@/lib/ocean";
import { getProgress, type CourseProgress } from "@/lib/memory";
import { CommandSearch } from "./CommandSearch";
import { SidebarDiary } from "./SidebarDiary";
import { ThemeToggle } from "./ThemeToggle";
import { AskButton } from "./AskButton";

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
// разборы трёх видов. Хабы «Предприниматель» и «Фаундер» живут дверями на главной и в Академии.
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

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com/terenlabs",
    icon: <><rect x="2.5" y="2.5" width="11" height="11" rx="3" /><circle cx="8" cy="8" r="2.6" /><circle cx="11.2" cy="4.8" r=".6" fill="currentColor" /></> },
  { label: "Threads", href: "https://www.threads.com/@terenlabs",
    icon: <path d="M11.2 7.6c-.2-1.9-1.3-3-3.2-3.1-1.4 0-2.5.6-3.1 1.7M11.2 7.6c1.4.6 2 1.7 1.9 2.9-.2 2-1.9 3-3.9 3-2.9 0-4.9-2-4.9-5.5S6.3 2.5 9.1 2.5c1.6 0 2.9.6 3.7 1.7M11.2 7.6c-.7-.3-1.6-.4-2.5-.3-1.6.1-2.7.9-2.6 2 .1 1 1 1.6 2.3 1.5 1.7-.1 2.6-1.2 2.8-3.2" /> },
  { label: "Telegram", href: "https://t.me/terenlabs_bot",
    icon: <path d="M13.5 2.8 2.6 7.1c-.7.3-.7.8 0 1l2.7.9 1 3.3c.1.4.5.5.8.2l1.5-1.4 2.9 2.1c.5.4 1 .1 1.1-.5L14.3 3.6c.1-.7-.3-1.1-.8-.8zM5.3 9l6.6-4.2-5.2 4.9-.3 2.6" /> },
];

type Tab = "home" | "diary" | "about";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Главная", icon: I.home },
  { id: "diary", label: "Дневник", icon: I.calendar },
  { id: "about", label: "О проекте", icon: I.info },
];

export function Sidebar({
  open,
  onClose,
  chatOpen,
  onToggleChat,
}: {
  open: boolean;
  onClose: () => void;
  chatOpen: boolean;
  onToggleChat: () => void;
}) {
  const [tab, setTab] = useState<Tab>("home");
  const build = process.env.NEXT_PUBLIC_BUILD;
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
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[272px] shrink-0 flex-col bg-panel transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${
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
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <button onClick={onClose} aria-label="Скрыть панель" className="flex h-7 w-7 items-center justify-center rounded-[6px] text-faint hover:bg-subtle hover:text-ink lg:hidden">
              <Icon d={I.panel} />
            </button>
          </div>
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

            {/* соцсети переехали из подвала: подвал убран, панель несёт всё */}
            <div className="mt-4 px-2">
              <p className="pb-2 text-[12px] font-medium text-faint">Мы здесь</p>
              <div className="flex items-center gap-1">
                {SOCIAL.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="flex h-8 w-8 items-center justify-center rounded-[6px] text-faint transition-colors hover:bg-subtle hover:text-ink"
                  >
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {s.icon}
                    </svg>
                  </a>
                ))}
                <a
                  href="mailto:info@terenlabs.kz"
                  aria-label="Почта"
                  title="info@terenlabs.kz"
                  className="flex h-8 w-8 items-center justify-center rounded-[6px] text-faint transition-colors hover:bg-subtle hover:text-ink"
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="1.9" y="3.9" width="12.2" height="8.2" rx="1.4" />
                    <path d="m2.4 5 5.6 3.8L13.6 5" />
                  </svg>
                </a>
              </div>
              <p className="num pt-3 text-[11.5px] text-faint">
                © 2026 TerenLabs{build ? ` · сборка ${build}` : ""}
              </p>
            </div>
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

        {/* низ: круглая кнопка TEREN-AI и аккаунт */}
        <div className="flex justify-end px-3 pb-3">
          <AskButton open={chatOpen} onToggle={onToggleChat} />
        </div>
        <div className="border-t border-line p-2">
          <Link href={name ? "/dashboard" : "/auth/sign-in"} onClick={onClose} className="flex h-10 items-center gap-2.5 rounded-[6px] px-2 text-[14px] transition-colors hover:bg-subtle">
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-hover text-[12px] font-semibold text-ink">
              {name ? name.trim()[0]?.toUpperCase() : <Icon d={I.user} />}
            </span>
            <span className="min-w-0 flex-1 truncate text-ink">{name ?? "Войти"}</span>
            {name ? (
              <span className="text-[12px] text-faint">кабинет</span>
            ) : (
              // Четыре брендовых кружка красили монохромную панель и обещали выбор,
              // которого тут нет: способы входа объясняет страница входа. Подписи
              // справа тоже нет: слово «Войти» уже сказано слева.
              null
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
