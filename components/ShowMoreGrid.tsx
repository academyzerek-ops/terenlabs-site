"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { CatalogItem, plural } from "@/lib/content";

// Каталог не вываливает 160+ карточек одной лентой: первая порция + «Показать ещё».
const CHUNK = 24;

export function ShowMoreGrid({ items }: { items: CatalogItem[] }) {
  const [limit, setLimit] = useState(CHUNK);
  const visible = items.slice(0, limit);
  const rest = items.length - visible.length;

  return (
    <div>
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
            Показать ещё ({rest} {plural(rest, "материал", "материала", "материалов")})
          </button>
        </div>
      )}
    </div>
  );
}
