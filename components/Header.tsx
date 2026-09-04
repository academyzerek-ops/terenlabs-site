"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Container } from "./Container";

// Разделы платформы. Шапка плоская: белая полоса, тонкая линия снизу,
// текстовый логотип, одна кнопка входа. Ничего не прячется при скролле.
const NAV = [
  { label: "Океан", href: "/levels" },
  { label: "Академия", href: "/catalog?type=course" },
  { label: "Кейсы", href: "/catalog?type=case" },
  { label: "Аналитика", href: "/catalog?type=review" },
  { label: "Финпродукты", href: "/catalog?type=finmodel" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const sp = useSearchParams();
  const isActive = (href: string) => {
    const [base, query] = href.split("?");
    if (base === "/levels") return pathname.startsWith("/levels") || pathname.startsWith("/ocean");
    if (base === "/catalog") {
      if (pathname !== "/catalog") return false;
      return sp.get("type") === query?.split("=")[1];
    }
    return pathname === base;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-page/95 backdrop-blur-sm">
      <Container className="flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="На главную" className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
            TerenLabs
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
            {NAV.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-[6px] px-3 py-1.5 text-[15px] transition-colors hover:bg-subtle ${
                    active ? "font-medium text-ink" : "text-text-2 hover:text-ink"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden h-8 items-center rounded-[6px] border border-line-2 px-3 text-[14px] font-medium text-ink transition-colors hover:bg-subtle sm:inline-flex"
          >
            Войти
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-[6px] text-ink hover:bg-subtle lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Закрыть меню" : "Меню"}
            aria-expanded={open}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-line bg-page lg:hidden">
          <Container className="flex flex-col py-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-[6px] px-2 py-2.5 text-[16px] text-body hover:bg-subtle"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            <Link href="/dashboard" className="rounded-[6px] px-2 py-2.5 text-[16px] font-medium text-ink hover:bg-subtle" onClick={() => setOpen(false)}>
              Войти
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
