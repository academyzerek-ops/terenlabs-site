import Link from "next/link";
import { Container } from "./Container";

const LEGAL = [
  { label: "Пользовательское соглашение", href: "/legal/offer" },
  { label: "Политика конфиденциальности", href: "/legal/privacy" },
];

const DELO = [
  { label: "Академия", href: "/academy" },
  { label: "Модели малого бизнеса", href: "/courses/course-models" },
  { label: "Кейсы", href: "/catalog?type=case" },
  { label: "Ниши", href: "/catalog?type=review" },
];

const STARTUP = [
  { label: "От идеи до инвестиций", href: "/startup#trek" },
  { label: "Бизнес-модели брендов", href: "/catalog?type=bm" },
];

const OCEAN = [
  { label: "Уровни", href: "/levels" },
  { label: "Рейтинг", href: "/ocean" },
  { label: "Кабинет", href: "/dashboard" },
];

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com/terenlabs" },
  { label: "Threads", href: "https://www.threads.com/@terenlabs" },
  { label: "Telegram", href: "https://t.me/terenlabs_bot" },
];

// Футер одной строкой: навигация живёт в боковой панели, здесь только подпись, соцсети и копирайт.
export function Footer() {
  const build = process.env.NEXT_PUBLIC_BUILD;
  return (
    <footer className="border-t border-line bg-page text-body">
      <Container className="flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[15px] font-semibold tracking-[-0.02em] text-ink">TerenLabs</div>
          <p className="mt-2 max-w-[38ch] text-[14px] leading-relaxed text-text-2">
            Глубина анализа. Сила результата. Обучение и расчёты для предпринимателей.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-text-2">
          {SOCIAL.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label} className="flex h-8 w-8 items-center justify-center rounded-[6px] text-text-2 transition-colors hover:bg-subtle hover:text-ink">
              <SocialIcon name={s.label} />
            </a>
          ))}
          <a href="mailto:info@terenlabs.kz" className="transition-colors hover:text-ink">info@terenlabs.kz</a>
        </div>
      </Container>
      <Container className="flex items-center justify-between border-t border-line py-4 text-[12px] text-faint">
        <span>© 2026 TerenLabs{build ? <span className="num ml-2 hidden sm:inline">сборка {build}</span> : null}</span>
        <span className="flex flex-wrap gap-x-4">
          {LEGAL.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </span>
      </Container>
    </footer>
  );
}

// соцсети штрихом в стиле панели: без брендовых цветов
function SocialIcon({ name }: { name: string }) {
  const d = name === "Instagram"
    ? <><rect x="2.5" y="2.5" width="11" height="11" rx="3" /><circle cx="8" cy="8" r="2.6" /><circle cx="11.2" cy="4.8" r=".6" fill="currentColor" /></>
    : name === "Threads"
    ? <path d="M11.2 7.6c-.2-1.9-1.3-3-3.2-3.1-1.4 0-2.5.6-3.1 1.7M11.2 7.6c1.4.6 2 1.7 1.9 2.9-.2 2-1.9 3-3.9 3-2.9 0-4.9-2-4.9-5.5S6.3 2.5 9.1 2.5c1.6 0 2.9.6 3.7 1.7M11.2 7.6c-.7-.3-1.6-.4-2.5-.3-1.6.1-2.7.9-2.6 2 .1 1 1 1.6 2.3 1.5 1.7-.1 2.6-1.2 2.8-3.2" />
    : <path d="M13.5 2.8 2.6 7.1c-.7.3-.7.8 0 1l2.7.9 1 3.3c.1.4.5.5.8.2l1.5-1.4 2.9 2.1c.5.4 1 .1 1.1-.5L14.3 3.6c.1-.7-.3-1.1-.8-.8zM5.3 9l6.6-4.2-5.2 4.9-.3 2.6" />;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  );
}
