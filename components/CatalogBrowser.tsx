"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { CATALOG, PRODUCT_TYPES, ProductType } from "@/lib/content";

const TYPE_ENTRIES = Object.entries(PRODUCT_TYPES) as [
  ProductType,
  (typeof PRODUCT_TYPES)[ProductType],
][];

export function CatalogBrowser({ initialType }: { initialType?: string }) {
  const [type, setType] = useState<string>(
    initialType && initialType in PRODUCT_TYPES ? initialType : "all"
  );

  const results = useMemo(
    () => CATALOG.filter((p) => type === "all" || p.type === type),
    [type]
  );

  const tabs: [string, string][] = [
    ["all", "Все"],
    ...TYPE_ENTRIES.map(([k, v]) => [k, v.label] as [string, string]),
  ];

  return (
    <div>
      {/* Табы-фильтры по типу — горизонтально сверху */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {tabs.map(([val, label]) => (
          <button
            key={val}
            onClick={() => setType(val)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              type === val
                ? "bg-teal text-white"
                : "border border-line text-heading hover:border-teal hover:text-teal"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="num ml-auto text-sm text-muted">Найдено: {results.length}</span>
      </div>

      {results.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <ProductCard key={`${p.type}-${p.slug}`} p={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-[var(--radius-tl)] border border-dashed border-line bg-card p-12 text-center">
          <p className="text-heading">В этом разделе пока пусто</p>
          <button
            onClick={() => setType("all")}
            className="mt-5 rounded-[var(--radius-tl)] bg-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-600"
          >
            Показать все
          </button>
        </div>
      )}
    </div>
  );
}
