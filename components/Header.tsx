"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Logo } from "./Logo";
import { Container } from "./Container";
import { ThemeToggle } from "./ThemeToggle";

// разделы платформы
const NAV = [
  { label: "Океан", href: "/levels" },
  { label: "Академия", href: "/catalog?type=course" },
  { label: "Кейсы", href: "/catalog?type=case" },
  { label: "Обзоры", href: "/catalog?type=review" },
  { label: "Финпродукты", href: "/catalog?type=finmodel" },
  { label: "Бизнес-клуб", href: "/club" },
];

export function Header() {
  const [open, setOpen] = useState(false); // мобильное меню
  const [hidden, setHidden] = useState(false); // прячем при скролле вниз (награды-2025)

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // вниз и не у верха — спрятать; вверх — показать
      setHidden(y > lastY && y > 140);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const pathname = usePathname();
  const sp = useSearchParams();
  const isActive = (href: string) => {
    const [base, query] = href.split("?");
    if (base === "/levels") return pathname.startsWith("/levels");
    if (base === "/catalog") {
      if (pathname !== "/catalog") return false;
      const type = query?.split("=")[1];
      return sp.get("type") === type;
    }
    return pathname === base;
  };

  return (
    <header
      className={`sticky top-0 z-50 px-3 pt-3 transition-transform duration-300 motion-reduce:transition-none motion-reduce:translate-y-0 ${
        hidden && !open ? "-translate-y-[120%]" : "translate-y-0"
      }`}
    >
      <div className="glass-bar relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="На главную">
            <Logo auto />
          </Link>

          <nav className="hidden items-center gap-1.5 lg:flex">
            {NAV.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`nav-bubble ${active ? "nav-bubble--active" : ""}`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link
            href="/dashboard"
            className="hidden rounded-md px-3 py-2 text-[0.95rem] text-heading hover:text-teal sm:block"
          >
            Кабинет
          </Link>
          <Link
            href="/levels"
            className="rounded-[var(--radius-tl)] bg-teal px-4 py-2 text-[0.95rem] font-medium text-white transition-colors hover:bg-teal-600"
          >
            Начать
          </Link>

          <button
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
          >
            <div className="space-y-1.5">
              <span className="block h-0.5 w-6 bg-heading" />
              <span className="block h-0.5 w-6 bg-heading" />
              <span className="block h-0.5 w-6 bg-heading" />
            </div>
          </button>
        </div>
      </div>

      {/* Мобильное меню — стеклянная панель под шапкой */}
      {open && (
        <div className="glass-bar mx-3 mt-2 lg:hidden">
          <div className="flex flex-col px-5 py-3">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="py-2.5 text-heading" onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            <Link href="/dashboard" className="py-2.5 text-heading" onClick={() => setOpen(false)}>
              Кабинет
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
