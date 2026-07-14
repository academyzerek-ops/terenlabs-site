"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

const CATEGORIES = {
  course: [
    { id: "all", label: "Все" },
    { id: "Финансы", label: "Финансы" },
    { id: "Бизнес", label: "Бизнес" },
    { id: "Маркетинг", label: "Маркетинг" },
  ],
  test: [
    { id: "all", label: "Все" },
    { id: "T1", label: "Уровень T1" },
    { id: "T2", label: "Уровень T2" },
    { id: "T3", label: "Уровень T3" },
  ],
  // кейсы — как в Mini App (#cases-filter): Все · Красный · Жёлтый · Зелёный
  case: [
    { id: "all", label: "Все" },
    { id: "r", label: "Красный" },
    { id: "y", label: "Жёлтый" },
    { id: "g", label: "Зелёный" },
  ],
  review: [
    { id: "all", label: "Все" },
    { id: "food", label: "Еда и напитки" },
    { id: "beauty", label: "Бьюти" },
    { id: "sport", label: "Спорт и здоровье" },
    { id: "auto", label: "Авто" },
    { id: "retail", label: "Торговля" },
    { id: "service", label: "Услуги" },
    { id: "kids", label: "Дети и досуг" },
  ],
  finmodel: [
    { id: "all", label: "Все" },
  ]
};

export function CatalogFilters({ type }: { type: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const currentFilter = searchParams.get("filter") || "all";
  const filters = CATEGORIES[type as keyof typeof CATEGORIES] || [];

  const setFilter = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id === "all") {
      params.delete("filter");
    } else {
      params.set("filter", id);
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (filters.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-10 rise" style={{ animationDelay: "300ms" }}>
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => setFilter(f.id)}
          aria-pressed={currentFilter === f.id}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
            currentFilter === f.id
              ? "bg-teal border-teal text-white shadow-[0_0_15px_rgba(0,183,194,0.3)]"
              : "border-white/10 bg-white/5 text-foam/40 hover:border-white/20 hover:text-foam"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
