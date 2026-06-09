"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { CatalogItem, plural } from "@/lib/content";

// Порция выдачи: 90 кейсов одной лентой не показываем
const CHUNK = 24;

// Кейсы: цветовая система исходов + фильтры с подписями.
// 🔴 Провал — неудачные действия · 🟢 Успех — удачные решения ·
// 🟡 Опыт — нейтральное: не убыток и не успех, просто опыт (Разбор/Тренажёр)
type Outcome = "all" | "fail" | "win" | "exp";

export function outcomeOf(p: CatalogItem): Exclude<Outcome, "all"> {
  if (p.badge === "Провал") return "fail";
  if (p.badge === "Успех") return "win";
  return "exp";
}

const FILTERS: { key: Outcome; label: string; dot?: string; activeBg?: string }[] = [
  { key: "all", label: "Все кейсы" },
  { key: "fail", label: "Неудачные действия", dot: "#d04f33", activeBg: "rgba(208,79,51,0.14)" },
  { key: "win", label: "Удачные решения", dot: "#1f9e74", activeBg: "rgba(31,158,116,0.14)" },
  { key: "exp", label: "Просто опыт", dot: "#d4a82b", activeBg: "rgba(212,168,43,0.16)" },
];

export function CaseGrid({ items }: { items: CatalogItem[] }) {
  const [outcome, setOutcomeRaw] = useState<Outcome>("all");
  const [limit, setLimit] = useState(CHUNK);
  const setOutcome = (o: Outcome) => {
    setOutcomeRaw(o);
    setLimit(CHUNK); // смена фильтра сбрасывает выдачу к первой порции
  };
  const filtered = items.filter((p) => outcome === "all" || outcomeOf(p) === outcome);
  const visible = filtered.slice(0, limit);
  const rest = filtered.length - visible.length;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2.5">
          {FILTERS.map((f) => {
            const active = outcome === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setOutcome(f.key)}
                className={`btn-press flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-transparent text-heading"
                    : "border-line text-muted hover:border-teal hover:text-teal"
                }`}
                style={active ? { background: f.activeBg ?? "rgba(0,183,194,0.14)" } : undefined}
              >
                {f.dot && (
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: f.dot }}
                    aria-hidden="true"
                  />
                )}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <ProductCard key={`${p.type}-${p.slug}`} p={p} />
        ))}
      </div>
      {rest > 0 && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setLimit((v) => v + CHUNK)}
            className="btn-press rounded-full border border-line px-7 py-3 text-sm font-semibold text-heading transition-colors hover:border-teal hover:text-teal"
          >
            Показать ещё ({rest} {plural(rest, "кейс", "кейса", "кейсов")})
          </button>
        </div>
      )}
    </div>
  );
}
