"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Соревновательный слой страницы «Океан»: живые данные рейтинга
// (тот же бэкенд, что у Mini App). Один fetch на страницу — кэш на модуле.
const API =
  (process.env.NEXT_PUBLIC_AI_API ?? "https://terenlabs-production.up.railway.app/chat").replace(
    /\/chat$/,
    ""
  ) + "/api/ocean/leaderboard?period=all";

type Entry = {
  rank: number;
  name: string;
  composite: number;
  level: string;
  days_in_ocean: number;
  speed_badge: string | null;
};
export type PulseData = {
  total_users: number;
  by_level: Record<string, number>;
  entries: Entry[];
};

// ключи API → ключи уровней сайта
const API_LEVEL: Record<string, string> = {
  rakushka: "mollusk",
  krab: "crab",
  barrakuda: "barracuda",
  delfin: "dolphin",
  akula: "shark",
  kit: "whale",
};

let cache: Promise<PulseData | null> | null = null;
function getData(): Promise<PulseData | null> {
  cache ??= fetch(API)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  return cache;
}

function usePulse() {
  const [data, setData] = useState<PulseData | null>(null);
  useEffect(() => {
    let alive = true;
    getData().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

/** Чип «население уровня»: сколько людей сейчас держит этот ранг. */
export function LevelCrowd({ levelKey, deep }: { levelKey: string; deep?: boolean }) {
  const data = usePulse();
  if (!data) return null;
  const n = data.by_level[API_LEVEL[levelKey]] ?? 0;
  const tone = deep ? "border-white/15 text-foam/65" : "border-navy/15 text-navy/60";
  return (
    <span className={`num inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.72rem] font-semibold ${tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${n > 0 ? "bg-teal shadow-[0_0_8px_rgba(0,183,194,0.9)]" : deep ? "bg-foam/30" : "bg-navy/25"}`} />
      {n > 0
        ? `в океане: ${n} ${n % 10 === 1 && n % 100 !== 11 ? "человек" : "чел."}`
        : "здесь ещё никого — будь первым"}
    </span>
  );
}

/** Живая строка соревнования: сколько людей в океане и кто впереди. */
export function OceanPulseStrip() {
  const data = usePulse();
  if (!data || data.total_users === 0 || data.entries.length === 0) return null;
  const leader = [...data.entries].sort((a, b) => b.composite - a.composite)[0];
  return (
    <div className="mt-6 inline-flex flex-wrap items-center gap-x-4 gap-y-2 rounded-full border border-navy/15 bg-white/60 px-5 py-2.5 backdrop-blur">
      <span className="flex items-center gap-2 text-sm font-semibold text-navy/75">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
        </span>
        В океане {data.total_users}{" "}
        {data.total_users % 10 === 1 && data.total_users % 100 !== 11 ? "человек" : "человек"}
      </span>
      <span className="num text-sm text-navy/60">
        впереди стаи — {leader.name}: {leader.composite} очков
      </span>
      <Link href="/ocean" className="text-sm font-semibold text-teal-600 hover:text-teal">
        Вся таблица →
      </Link>
    </div>
  );
}
