"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { OCEAN_RANKS } from "@/lib/content";
import { getOceanToken, loginBridge, oceanFetch, setOceanToken } from "@/lib/ocean";

// Океан-блок кабинета (12_OCEAN.md, этап 2): живая статистика с бэкенда —
// та же, что в Mini App. Если юзер вошёл через Google/Apple, а океан-токена
// нет — тихо обмениваем сессию через мост.
type Rank = {
  rank: number;
  total: number;
  days_in_ocean: number;
  current_level: string;
  composite: number;
  streak: { current: number; longest: number };
  peers_at_level: number;
  peers_below: number;
  next_goal?: { label: string; hint?: string | null } | null;
};
type Stats = {
  attempts: number;
  avg_score?: number | null;
  avg_time_per_q?: number | null;
  best_score?: number | null;
};

const LEVEL_RU: Record<string, string> = {
  mollusk: "Ракушка", crab: "Краб", barracuda: "Барракуда",
  dolphin: "Дельфин", shark: "Акула", whale: "Кит",
};
const LEVEL_IMG: Record<string, string> = Object.fromEntries(
  OCEAN_RANKS.map((r) => [
    { rakushka: "mollusk", krab: "crab", barrakuda: "barracuda",
      delfin: "dolphin", akula: "shark", kit: "whale" }[r.key] as string,
    r.img,
  ])
);

export function OceanAccount({ nextAuthActive = false, title = "Океан" }: { nextAuthActive?: boolean; title?: string }) {
  const [hasToken, setHasToken] = useState(false);
  const [rank, setRank] = useState<Rank | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [linkCode, setLinkCode] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!getOceanToken()) {
      setHasToken(false);
      setRank(null);
      return;
    }
    setHasToken(true);
    try {
      const [r, s] = await Promise.all([
        oceanFetch<Rank>("/me/rank"),
        oceanFetch<Stats>("/me/stats").catch(() => null),
      ]);
      setRank(r);
      setStats(s);
    } catch {
      setRank(null);
    }
  }, []);

  useEffect(() => {
    // Google/Apple вошёл, океан-токена нет → мост (один раз)
    (async () => {
      if (!getOceanToken() && nextAuthActive) await loginBridge();
      refresh();
    })();
    window.addEventListener("tl-ocean-auth", refresh);
    return () => window.removeEventListener("tl-ocean-auth", refresh);
  }, [nextAuthActive, refresh]);

  if (!hasToken) {
    return (
      <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-[var(--radius-lg)] bg-navy p-7 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl !text-foam">Твоя статистика появится здесь</h2>
          <p className="mt-1.5 text-sm text-foam/65">
            Войди — попытки пойдут в зачёт: уровень, очки, стрик дней и место
            в рейтинге будут собираться автоматически.
          </p>
        </div>
        <Link
          href="/auth/sign-in"
          className="btn-press rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white hover:bg-teal-600"
        >
          Войти
        </Link>
      </div>
    );
  }

  const lvl = rank?.current_level ?? "mollusk";

  return (
    <section className="mt-10">
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl text-heading">{title}</h2>
        <Link href="/ocean" className="text-sm font-semibold text-teal-600 hover:text-teal">
          рейтинг →
        </Link>
      </div>
      <div className="wave-divider my-5" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[var(--radius-tl)] border border-line bg-card p-5">
          <div className="flex items-center gap-3">
            <img src={LEVEL_IMG[lvl]} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
            <div>
              <div className="text-xs text-muted">уровень</div>
              <div className="text-lg font-semibold text-heading">{LEVEL_RU[lvl]}</div>
            </div>
          </div>
          {rank?.next_goal?.label && (
            <p className="mt-3 text-xs leading-relaxed text-muted">{rank.next_goal.label}</p>
          )}
        </div>

        <Cell label="место в океане" value={rank?.rank ? `#${rank.rank}` : "—"} sub={rank ? `из ${rank.total}` : undefined} />
        <Cell label="очки (композит)" value={String(rank?.composite ?? 0)} sub={rank && rank.peers_at_level > 1 ? `впереди ${rank.peers_below} из ${rank.peers_at_level} на уровне` : undefined} />
        <Cell label="стрик дней" value={String(rank?.streak?.current ?? 0)} sub={rank?.streak?.longest ? `рекорд ${rank.streak.longest}` : undefined} />
      </div>

      {stats && stats.attempts > 0 && (
        <p className="num mt-4 text-sm text-muted">
          попыток: {stats.attempts}
          {stats.avg_score != null && ` · средний балл ${Number(stats.avg_score).toFixed(1)}`}
          {stats.avg_time_per_q != null && ` · ${Number(stats.avg_time_per_q).toFixed(0)} сек/вопрос`}
          {stats.best_score != null && ` · лучший ${stats.best_score}/10`}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
        <button
          onClick={async () => {
            try {
              const out = await oceanFetch<{ code: string }>("/auth/link/code", { method: "POST", json: {} });
              setLinkCode(out.code);
            } catch {
              setLinkCode(null);
            }
          }}
          className="font-semibold text-teal-600 hover:text-teal"
        >
          Привязать Telegram
        </button>
        {linkCode && (
          <span className="num rounded-full border border-line px-4 py-1.5 text-heading">
            код <strong>{linkCode}</strong> — введи в Mini App за 10 минут
          </span>
        )}
        <button
          onClick={() => setOceanToken(null)}
          className="text-muted hover:text-heading"
        >
          Выйти из Океана
        </button>
      </div>
    </section>
  );
}

function Cell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[var(--radius-tl)] border border-line bg-card p-5">
      <div className="text-xs text-muted">{label}</div>
      <div className="num mt-1 text-2xl font-semibold text-heading">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}
