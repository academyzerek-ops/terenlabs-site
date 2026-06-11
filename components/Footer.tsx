import Link from "next/link";
import { Logo } from "./Logo";
import { Container } from "./Container";
import { PRODUCT_TYPES } from "@/lib/content";

const LEGAL = [
  { label: "Оферта (RU · KK)", href: "/legal/offer" },
  { label: "Политика конфиденциальности", href: "/legal/privacy" },
  { label: "Сведения об образовательной организации", href: "/legal/info" },
];

const COMPANY = [
  { label: "О компании", href: "/about" },
  { label: "Эксперты", href: "/experts" },
  { label: "Для бизнеса", href: "/b2b" },
  { label: "Контакты", href: "/contacts" },
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
        </div>

        <FooterCol title="Продукты" links={Object.values(PRODUCT_TYPES).map((t) => ({ label: t.label, href: t.href }))} />
        <FooterCol title="Компания" links={COMPANY} />
        <FooterCol title="Правовая информация" links={LEGAL} />
      </Container>

      {/* тёмное «дно» футера: копирайт и имя уходят в глубину
          (колонки выше остаются на светлой палубе — указание Адиля) */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0d2b45 0%, #06182a 100%)" }}
      >
        <Container className="flex flex-col gap-2 py-6 text-xs text-foam/55 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} TerenLabs. Казахстан.</span>
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
