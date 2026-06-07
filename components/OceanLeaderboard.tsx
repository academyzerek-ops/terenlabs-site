"use client";

import { useEffect, useState } from "react";
import { OCEAN_RANKS } from "@/lib/content";

// Живой рейтинг «Океана» — тот же бэкенд, что у Mini App (GET /api/ocean/leaderboard).
const API =
  (process.env.NEXT_PUBLIC_AI_API ?? "https://terenlabs-production.up.railway.app/chat").replace(
    /\/chat$/,
    ""
  ) + "/api/ocean/leaderboard";

type Entry = {
  rank: number;
  name: string;
  composite: number;
  level: string;
  days_in_ocean: number;
  speed_badge: string | null;
};
type Data = {
  total_users: number;
  by_level: Record<string, number>;
  entries: Entry[];
};

const LEVEL_RU: Record<string, { name: string; img: string }> = {
  mollusk: { name: "Ракушка", img: "/brand/ranks/rakushka.png?v=11" },
  crab: { name: "Краб", img: "/brand/ranks/krab.png?v=11" },
  barracuda: { name: "Барракуда", img: "/brand/ranks/barrakuda.png?v=11" },
  dolphin: { name: "Дельфин", img: "/brand/ranks/delfin.png?v=11" },
  shark: { name: "Акула", img: "/brand/ranks/akula.png?v=11" },
  whale: { name: "Кит", img: "/brand/ranks/kit.png?v=11" },
};

const PERIODS: [string, string][] = [
  ["all", "За всё время"],
  ["month", "Месяц"],
  ["week", "Неделя"],
];

export function OceanLeaderboard() {
  const [period, setPeriod] = useState("all");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setData(null);
    setError(false);
    fetch(`${API}?period=${period}`)
      .then((r) => r.json())
      .then((d) => alive && setData(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [period]);

  const maxLevelCount = data ? Math.max(1, ...Object.values(data.by_level)) : 1;

  return (
    <div>
      {/* переключатель периода */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {PERIODS.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPeriod(val)}
              className={`btn-press rounded-full px-4 py-2 text-sm transition-colors ${
                period === val
                  ? "bg-teal text-white"
                  : "border border-line text-heading hover:border-teal hover:text-teal"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {data && (
          <span className="num text-sm text-muted">в океане: {data.total_users}</span>
        )}
      </div>

      {error && (
        <p className="mt-10 text-center text-muted">
          Рейтинг сейчас недоступен — попробуй позже.
        </p>
      )}
      {!data && !error && <p className="mt-10 text-center text-muted">Загружаю рейтинг…</p>}

      {data && (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* таблица мест */}
          <div className="overflow-hidden rounded-[var(--radius-tl)] border border-line bg-card">
            {data.entries.length === 0 ? (
              <p className="p-10 text-center text-muted">За этот период попыток ещё не было.</p>
            ) : (
              data.entries.map((e) => {
                const lvl = LEVEL_RU[e.level] ?? LEVEL_RU.mollusk;
                return (
                  <div
                    key={`${e.rank}-${e.name}`}
                    className="flex items-center gap-4 border-b border-line px-5 py-3.5 transition-colors last:border-0 hover:bg-subtle"
                  >
                    <span
                      className={`num w-8 text-lg font-semibold ${
                        e.rank <= 3 ? "text-teal-600" : "text-muted"
                      }`}
                    >
                      {e.rank}
                    </span>
                    <img src={lvl.img} alt={lvl.name} width={36} height={36} className="h-9 w-9 object-contain" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-heading">{e.name}</div>
                      <div className="text-xs text-muted">
                        {lvl.name} · в океане {e.days_in_ocean}{" "}
                        {e.days_in_ocean % 10 === 1 && e.days_in_ocean % 100 !== 11
                          ? "день"
                          : [2, 3, 4].includes(e.days_in_ocean % 10) &&
                            ![12, 13, 14].includes(e.days_in_ocean % 100)
                          ? "дня"
                          : "дней"}
                        {e.speed_badge ? ` · ${e.speed_badge}` : ""}
                      </div>
                    </div>
                    <span className="num text-lg font-semibold text-heading">{e.composite}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* распределение по уровням */}
          <div>
            <h3 className="eyebrow">Распределение по уровням</h3>
            <div className="mt-4 space-y-3">
              {OCEAN_RANKS.map((r) => {
                const apiKey =
                  { rakushka: "mollusk", krab: "crab", barrakuda: "barracuda", delfin: "dolphin", akula: "shark", kit: "whale" }[
                    r.key
                  ] ?? r.key;
                const n = data.by_level[apiKey] ?? 0;
                return (
                  <div key={r.key} className="flex items-center gap-3">
                    <img src={r.img} alt={r.name} width={28} height={28} className="h-7 w-7 object-contain" />
                    <span className="w-24 text-sm text-heading">{r.name}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-teal transition-all duration-700"
                        style={{ width: `${(n / maxLevelCount) * 100}%` }}
                      />
                    </div>
                    <span className="num w-8 text-right text-sm text-muted">{n}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
