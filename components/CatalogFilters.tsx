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
  // кейсы: фильтры исходов живут внутри PosterArchive (цветные точки, как в Mini App)
  case: [],
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
  ],
  // Разборы брендов: отрасли — Медиа и стриминг, Спорт, Авто, Ритейл, Платформы.
  // Пока разборов два (медиа и спорт), из шести чипов четыре вели бы в пустоту —
  // это шум, поэтому чипы выключены. Фильтр по отрасли уже работает по адресу
  // (?type=bm&filter=media, поле sector в записи) — включить список, когда в
  // каждой отрасли будет хотя бы по паре разборов:
  // { id: "all" }, { id: "media", label: "Медиа и стриминг" }, { id: "sport", label: "Спорт" },
  // { id: "auto", label: "Авто" }, { id: "retail", label: "Ритейл" }, { id: "platform", label: "Платформы" }
  bm: [],
};

// Чипы фильтра: прямоугольник 6px, контур, активный чуть светлее и с белым текстом.
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
    <div className="mt-6 mb-10 flex flex-wrap items-center gap-2">
      {filters.map((f) => {
        const active = currentFilter === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={active}
            className={`inline-flex h-8 items-center rounded-[6px] border px-3 text-[14px] font-medium transition-colors duration-150 ${
              active
                ? "border-line-2 bg-subtle text-ink"
                : "border-line bg-transparent text-text-2 hover:border-line-2 hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
