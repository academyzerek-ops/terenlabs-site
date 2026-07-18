import Link from "next/link";
import { Logo } from "./Logo";
import { Container } from "./Container";
import { PRODUCT_TYPES } from "@/lib/content";

const LEGAL = [
  { label: "Пользовательское соглашение", href: "/legal/offer" },
  { label: "Политика конфиденциальности", href: "/legal/privacy" },
];

// Колонка «Компания» убрана (Адиль 18.07) — вместо неё витрина финпродуктов
const FIN_PRODUCTS = [
  { label: "Финансовая модель", href: "/finmodels/finmodel-cafe" },
  { label: "Управленческий учёт", href: "/finmodels/gsheets-accounting" },
  { label: "Бизнес-план · Грант 400 МРП", href: "/finmodels/finmodel-business-plan" },
  { label: "Бизнес-план · Грант ССП", href: "/finmodels/bizplan-ssp-grant" },
];

export function Footer() {
  return (
    // Светлая «палуба»: тёмный текст на пене — по указанию Адиля (2026-06-10)
    <footer className="relative overflow-hidden border-t border-[#dde4ea] bg-[#f5f7fa] text-[#3d4f5e]">
      <Container className="grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Глубина анализа. Сила результата. EdTech и FinTools для предпринимателей.
          </p>
          {/* соцсети — те же адреса и глифы, что в Mini App (shell/app.html) */}
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://instagram.com/terenlabs"
              target="_blank"
              rel="noopener"
              aria-label="Instagram TerenLabs"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0d2b45]/15 text-[#3d4f5e] transition-colors hover:border-teal hover:text-teal"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://www.threads.com/@terenlabs"
              target="_blank"
              rel="noopener"
              aria-label="Threads TerenLabs"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0d2b45]/15 text-[#3d4f5e] transition-colors hover:border-teal hover:text-teal"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M19 7.5c-1.333-3-3.667-4.5-7-4.5-5 0-8 2.5-8 9s3.5 9 8 9 7-3 7-5-1-5-7-5c-2.5 0-3 1.25-3 2.5 0 1.5 1 2.5 2.5 2.5 2.5 0 3.5-1.5 3.5-5s-2-4-3-4-1.833.333-2.5 1" />
              </svg>
            </a>
            <a
              href="https://t.me/terenlabs_bot"
              target="_blank"
              rel="noopener"
              aria-label="Mini App в Telegram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0d2b45]/15 text-[#3d4f5e] transition-colors hover:border-teal hover:text-teal"
            >
              <svg viewBox="0 0 240 240" className="h-5 w-5" fill="currentColor">
                <path d="M44.7 121.5 194.9 63.6c7-2.6 13.1 1.6 10.8 12.2l-25.6 120.6c-1.9 8.5-7 10.6-14.1 6.6l-39-28.8-18.8 18.2c-2.1 2.1-3.8 3.8-7.8 3.8l2.8-39.8 72.3-65.3c3.1-2.8-.7-4.3-4.9-1.7l-89.4 56.3-38.5-12c-8.4-2.7-8.6-8.4 2-12.2Z" />
              </svg>
            </a>
          </div>
        </div>

        {/* финмодели здесь не дублируем — им посвящена соседняя колонка «Финпродукты» */}
        <FooterCol
          title="Обучение"
          links={Object.entries(PRODUCT_TYPES)
            .filter(([k]) => k !== "finmodel")
            .map(([, t]) => ({ label: t.label, href: t.href }))}
        />
        <FooterCol title="Финпродукты" links={FIN_PRODUCTS} />
        <FooterCol title="Правовая информация" links={LEGAL} />
      </Container>

      {/* тёмное «дно» футера: копирайт и имя уходят в глубину
          (колонки выше остаются на светлой палубе — указание Адиля) */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0d2b45 0%, #06182a 100%)" }}
      >
        <Container className="flex flex-col gap-2 py-6 text-xs text-foam/55 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} TerenLabs. Казахстан.
            {/* номер сборки: сверять «что вижу я» и «что на проде» (кеш-инциденты 15.07) */}
            {process.env.NEXT_PUBLIC_BUILD && (
              <span className="ml-2 opacity-40">
                сборка {process.env.NEXT_PUBLIC_BUILD}
              </span>
            )}
          </span>
          <span className="num">Интерфейс: RU · KK</span>
        </Container>

        {/* имя уходит под воду — обрезается нижним краем футера */}
        <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
          <p
            className="text-center font-bold leading-none text-white/[0.06]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(90px, 17vw, 280px)",
              marginBottom: "-0.34em",
              letterSpacing: "-0.02em",
            }}
          >
            TerenLabs
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="eyebrow !text-[#0d2b45]/45">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-colors hover:text-teal">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
