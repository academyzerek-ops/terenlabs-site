"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Премиум scroll-reveal: блок всплывает при появлении в зоне видимости.
 * delay — задержка в мс для каскада (stagger).
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      // срабатывает ЗАРАНЕЕ (за 15% вьюпорта до входа в кадр): при быстром
      // скролле контент уже виден, а не «зияющая пустота» (Адиль, 2026-06-12)
      { threshold: 0.01, rootMargin: "0px 0px 15% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${seen ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
