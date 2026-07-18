"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogItem } from "@/lib/content";
import { ProductCard } from "@/components/ProductCard";

// Живая плашка «Рекомендуем дальше»: одна колонка = один тип контента,
// карточки внутри сменяются кроссфейдом. Периоды у колонок разные, чтобы
// плашки не мигали синхронно. Наведение/фокус ставит смену на паузу —
// иначе карточка уедет из-под курсора перед кликом.
export function RecRotator({ items, periodMs = 9000 }: { items: CatalogItem[]; periodMs?: number }) {
  const [idx, setIdx] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (!pausedRef.current) setIdx((i) => (i + 1) % items.length);
    }, periodMs);
    return () => clearInterval(t);
  }, [items.length, periodMs]);

  return (
    <div
      className="grid"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onFocus={() => (pausedRef.current = true)}
      onBlur={() => (pausedRef.current = false)}
    >
      {items.map((p, i) => (
        <div
          key={`${p.type}-${p.slug}`}
          inert={i !== idx || undefined}
          className={`col-start-1 row-start-1 transition-opacity duration-700 ease-out ${
            i === idx ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <ProductCard p={p} />
        </div>
      ))}
    </div>
  );
}
