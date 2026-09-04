"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RankTag, API2KEY } from "./RankSketch";
import { OCEAN_API } from "@/lib/ocean";

// Компактная таблица рейтинга: место, имя, ярлык уровня, очки.
// Тот же бэкенд, что у Mini App; один запрос на страницу.
type Entry = { rank: number; name: string; composite: number; level: string };
type Data = { total_users: number; entries: Entry[] };

let cache: Promise<Data | null> | null = null;
function load(): Promise<Data | null> {
  cache ??= fetch(OCEAN_API + "/leaderboard?period=all")
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
    .then((d) => {
      if (d == null) cache = null;
      return d;
    });
  return cache;
}

export function OceanTopTable({ limit = 3, showAll = true }: { limit?: number; showAll?: boolean }) {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);

  const rows = data?.entries.slice(0, limit) ?? [];

  return (
    <div>
      <div className="grid grid-cols-[32px_minmax(0,1fr)_auto_56px] gap-3 pb-2 text-[12px] uppercase tracking-[0.08em] text-faint">
        <span>#</span><span>Имя</span><span>Уровень</span><span className="text-right">Очки</span>
      </div>
      {rows.length === 0 && (
        <div className="border-t border-line py-4 text-[14px] text-faint">
          {data ? "В океане пока пусто" : "Загружаем рейтинг"}
        </div>
      )}
      {rows.map((e) => (
        <div
          key={e.rank}
          className="grid grid-cols-[32px_minmax(0,1fr)_auto_56px] items-center gap-3 border-t border-line py-3 text-[15px]"
        >
          <span className="num text-faint">{e.rank}</span>
          <span className="truncate font-medium text-ink">{e.name}</span>
          <RankTag rank={API2KEY[e.level] ?? "rakushka"} />
          <span className="num text-right font-medium text-ink">{e.composite}</span>
        </div>
      ))}
      {showAll && (
        <div className="border-t border-line pt-3">
          <Link href="/ocean" className="link text-[14px]">
            Весь рейтинг
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </Link>
        </div>
      )}
    </div>
  );
}
