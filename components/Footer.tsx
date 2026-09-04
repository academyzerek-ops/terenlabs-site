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

// Плоский футер: четыре колонки текста, тонкая линия сверху, мелкий копирайт.
export function Footer() {
  return (
    <footer className="border-t border-line bg-page text-body">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="text-[15px] font-semibold tracking-[-0.02em] text-ink">TerenLabs</div>
          <p className="mt-3 max-w-[26ch] text-[14px] leading-relaxed text-text-2">
            Глубина анализа. Сила результата. Обучение и расчёты для предпринимателей.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
            {SOCIAL.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener" className="text-text-2 hover:text-ink">
                {s.label}
              </a>
            ))}
          </div>
          <a href="mailto:info@terenlabs.kz" className="mt-3 inline-block text-[14px] text-text-2 hover:text-ink">
            info@terenlabs.kz
          </a>
        </div>

        <FooterCol title="Своё дело" links={DELO} />
        <FooterCol title="Стартап" links={STARTUP} />
        <div className="flex flex-col gap-8">
          <FooterCol title="Океан" links={OCEAN} />
          <FooterCol title="Документы" links={LEGAL} />
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-1 py-5 text-[12px] text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} TerenLabs
            {process.env.NEXT_PUBLIC_BUILD && <span className="ml-2 opacity-70">сборка {process.env.NEXT_PUBLIC_BUILD}</span>}
          </span>
          <span className="num">Интерфейс: RU</span>
        </Container>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="eyebrow">{title}</h3>
      <ul className="mt-3 space-y-2 text-[14px]">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-body transition-colors hover:text-accent">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
