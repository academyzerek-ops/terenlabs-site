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
    <footer className="bg-navy-900 text-foam/70">
      <Container className="grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Глубина анализа. Сила результата. EdTech и FinTools для предпринимателей.
          </p>
        </div>

        <FooterCol title="Продукты" links={Object.values(PRODUCT_TYPES).map((t) => ({ label: t.label, href: t.href }))} />
        <FooterCol title="Компания" links={COMPANY} />
        <FooterCol title="Правовая информация" links={LEGAL} />
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-foam/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} TerenLabs. Казахстан.</span>
          <span className="num">Интерфейс: RU · KK</span>
        </Container>
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
      <h3 className="eyebrow !text-foam/40">{title}</h3>
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
