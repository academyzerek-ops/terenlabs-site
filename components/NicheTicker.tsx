import Link from "next/link";
import { REVIEWS } from "@/lib/content";

// Бегущая строка реальных ниш (56 обзоров) — тренд-тикер, ведёт в обзоры.
// Дублируем ленту дважды для бесшовного цикла; пауза по hover.
export function NicheTicker() {
  const names = REVIEWS.map((r) => r.title);
  const row = [...names, ...names];
  return (
    <Link
      href="/catalog?type=review"
      aria-label="Все обзоры ниш"
      className="ticker group block overflow-hidden border-y border-white/10 bg-navy-900 py-3.5"
    >
      <div className="ticker-track flex w-max items-center gap-7 whitespace-nowrap">
        {row.map((n, i) => (
          <span key={i} className="flex items-center gap-7 text-sm font-semibold uppercase tracking-[0.14em] text-foam/55 transition-colors group-hover:text-foam/80">
            {n}
            <span className="h-1 w-1 rounded-full bg-teal/60" aria-hidden="true" />
          </span>
        ))}
      </div>
    </Link>
  );
}
