"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Logo } from "./Logo";
import { Container } from "./Container";

// разделы платформы
const NAV = [
  { label: "Океан", href: "/levels" },
  { label: "Академия", href: "/catalog?type=course" },
  { label: "Кейсы", href: "/catalog?type=case" },
  { label: "Аналитика", href: "/catalog?type=review" },
  { label: "Финпродукты", href: "/catalog?type=finmodel" },
];

export function Header() {
  const [open, setOpen] = useState(false); // мобильное меню
  const [hidden, setHidden] = useState(false); // прячем при скролле вниз (награды-2025)

  useEffect(() => {
    let lastY = Math.max(0, window.scrollY);
    const onScroll = () => {
      // clamp: резиновый отскок Safari даёт отрицательный scrollY и
      // микроколебания — без гистерезиса шапка дёргалась непредсказуемо
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      if (Math.abs(dy) < 8) return; // игнорируем дрожание и баунс
      setHidden(dy > 0 && y > 160);
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
      <div className="glass-bar relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-6 lg:w-fit lg:justify-start lg:gap-8">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="На главную">
            <Logo />
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
          <Link
            href="/dashboard"
            className="rounded-[var(--radius-tl)] bg-teal px-4 py-2 text-[0.95rem] font-medium text-white transition-colors hover:bg-teal-600"
          >
            Кабинет
          </Link>

          <button
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
          >
            <div className="space-y-1.5">
              <span className="block h-0.5 w-6 bg-navy" />
              <span className="block h-0.5 w-6 bg-navy" />
              <span className="block h-0.5 w-6 bg-navy" />
            </div>
          </button>
        </div>
      </div>

      {/* Мобильное меню — стеклянная панель под шапкой */}
      {open && (
        <div className="glass-bar glass-bar--panel relative mx-3 mt-2 lg:hidden">
          <div className="flex flex-col px-5 py-3">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="py-2.5 text-navy" onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            <Link href="/dashboard" className="py-2.5 text-navy" onClick={() => setOpen(false)}>
              Кабинет
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
