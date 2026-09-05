import Link from "next/link";
import { Container } from "./Container";

const LEGAL = [
  { label: "Пользовательское соглашение", href: "/legal/offer" },
  { label: "Политика конфиденциальности", href: "/legal/privacy" },
];

const DELO = [
  { label: "Академия", href: "/delo#akademiya" },
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
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ink">
              {s.label}
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
