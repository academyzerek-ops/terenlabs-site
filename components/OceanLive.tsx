"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OCEAN_API, getOceanToken } from "@/lib/ocean";
import { regionName } from "@/lib/kz-regions";
import { plural } from "@/lib/content";

// «Океан сейчас» — живой блок страницы уровней (замена всплывающих тостов
// по решению Адиля 2026-06-12): зал славы + лента событий прямо на странице.
// Данные настоящие — /leaderboard и /activity, ничего не выдумываем.

const LEVEL_RU: Record<string, { name: string; img: string }> = {
  mollusk: { name: "Ракушка", img: "/brand/ranks/rakushka.png?v=11" },
  crab: { name: "Краб", img: "/brand/ranks/krab.png?v=11" },
  barracuda: { name: "Барракуда", img: "/brand/ranks/barrakuda.png?v=11" },
  dolphin: { name: "Дельфин", img: "/brand/ranks/delfin.png?v=11" },
  shark: { name: "Акула", img: "/brand/ranks/akula.png?v=11" },
  whale: { name: "Кит", img: "/brand/ranks/kit.png?v=11" },
};

type Entry = { rank: number; name: string; composite: number; level: string };
type LbData = {
  total_users: number;
  entries: Entry[];
  scope_total: number;
  me: { rank: number; composite: number; level: string } | null;
};
type ActEntry = { name: string; level: string; when: string };

function timeAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 3600) return "только что";
  if (d < 86400) return `${Math.floor(d / 3600)} ч назад`;
  const days = Math.floor(d / 86400);
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн назад`;
  return `${Math.floor(days / 7)} нед назад`;
}

export function OceanLiveBoard() {
  return (
    <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-[1.45fr_1fr]">
      <HallOfFame />
      <LiveFeed />
    </div>
  );
}

/* ── Зал славы: пьедестал топ-3 + твоё место по стране и области ── */

function HallOfFame() {
  const [data, setData] = useState<LbData | null>(null);
  const [regionRank, setRegionRank] = useState<{ code: string; rank: number; total: number } | null>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = getOceanToken();
    setAuthed(!!token);
    const headers = token ? { Authorization: `web ${token}` } : undefined;
    fetch(`${OCEAN_API}/leaderboard?period=all`, { headers })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
    if (!token) return;
    // область: настройки → региональный срез, чтобы показать место среди земляков
    fetch(`${OCEAN_API}/me/settings`, { headers })
      .then((r) => r.json())
      .then((s) => {
        const code = s.region_code;
        if (!code) return;
        return fetch(`${OCEAN_API}/leaderboard?period=all&region=${code}`, { headers })
          .then((r) => r.json())
          .then((d: LbData) => {
            if (d.me) setRegionRank({ code, rank: d.me.rank, total: d.scope_total });
          });
      })
      .catch(() => {});
  }, []);

  const podium = data?.entries.slice(0, 3) ?? [];

  return (
    <section className="flex flex-col rounded-[var(--radius-lg)] border border-navy/10 bg-white/70 p-6 shadow-[var(--shadow-tl)] backdrop-blur sm:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="eyebrow !text-teal-600">Зал славы</h2>
        <Link href="/ocean" className="text-sm font-semibold text-teal-600 transition-colors hover:text-teal">
          Вся таблица →
        </Link>
      </div>

      {/* пьедестал: серебро · золото · бронза */}
      {podium.length > 0 ? (
        <div className="mt-6 grid flex-1 grid-cols-3 items-end gap-3">
          {[podium[1], podium[0], podium[2]].map((e, slot) =>
            e ? <PodiumCard key={e.rank} e={e} first={slot === 1} /> : <div key={`empty-${slot}`} />
          )}
        </div>
      ) : (
        <p className="mt-8 flex-1 text-sm text-navy/60">
          {data ? "Пьедестал пока пуст — займи его первым." : "Загружаю зал славы…"}
        </p>
      )}

      {/* твоё место: страна и область — зачем вообще входить в океан */}
      <div className="mt-6 border-t border-navy/10 pt-4">
        {data?.me ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <span className="num text-[15px] font-semibold text-navy">
              Ты — #{data.me.rank} <span className="font-normal text-navy/55">из {data.scope_total} по Казахстану</span>
            </span>
            {regionRank && (
              <span className="num text-[15px] font-semibold text-navy">
                #{regionRank.rank}{" "}
                <span className="font-normal text-navy/55">
                  из {regionRank.total} · {regionName(regionRank.code)}
                </span>
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-navy/60">
            <Link href="/auth/sign-in" className="font-semibold text-teal-600 hover:text-teal">
              Войди
            </Link>{" "}
            — узнаешь своё место по стране и среди земляков по области.
          </p>
        )}
      </div>
    </section>
  );
}

function PodiumCard({ e, first }: { e: Entry; first: boolean }) {
  const lvl = LEVEL_RU[e.level] ?? LEVEL_RU.mollusk;
  const medal = e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : "🥉";
  return (
    <div
      className={`relative flex flex-col items-center rounded-[var(--radius-tl)] border bg-white px-2 pb-4 text-center ${
        first
          ? "border-teal/40 pt-6 shadow-[0_0_34px_rgba(0,183,194,0.22),var(--shadow-tl)]"
          : "border-navy/10 pt-4 shadow-[var(--shadow-tl-sm)]"
      }`}
    >
      <span className="absolute -top-3 text-xl" aria-hidden="true">{medal}</span>
      <img
        src={lvl.img}
        alt={lvl.name}
        width={first ? 64 : 48}
        height={first ? 64 : 48}
        className="object-contain drop-shadow-[0_8px_18px_rgba(6,24,42,0.3)]"
        style={{ width: first ? 64 : 48, height: first ? 64 : 48 }}
      />
      <div className={`mt-1.5 w-full truncate font-semibold text-navy ${first ? "text-base" : "text-sm"}`}>
        {e.name}
      </div>
      <div className="text-[11px] text-navy/55">{lvl.name}</div>
      <div className={`num mt-0.5 font-bold ${first ? "text-xl text-teal-600" : "text-base text-navy"}`}>
        {e.composite}
      </div>
    </div>
  );
}

/* ── Лента: кто и когда поднялся на уровень — океан живёт ── */

const FEED_SHOWN = 3;

function LiveFeed() {
  const [entries, setEntries] = useState<ActEntry[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${OCEAN_API}/activity?limit=10`)
      .then((r) => r.json())
      .then((d) => setEntries((d.entries || []).filter((e: ActEntry) => LEVEL_RU[e.level])))
      .catch(() => {});
    fetch(`${OCEAN_API}/leaderboard?period=all`)
      .then((r) => r.json())
      .then((d: LbData) => setTotal(d.total_users))
      .catch(() => {});
  }, []);

  // ротация ленты: каждые 7 секунд сверху «всплывает» следующее событие
  useEffect(() => {
    if (entries.length <= FEED_SHOWN) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setOffset((o) => (o + 1) % entries.length), 7000);
    return () => clearInterval(t);
  }, [entries.length]);

  const shown = Array.from(
    { length: Math.min(FEED_SHOWN, entries.length) },
    (_, i) => entries[(offset + i) % entries.length]
  );

  return (
    <section className="flex flex-col rounded-[var(--radius-lg)] border border-navy/10 bg-white/70 p-6 shadow-[var(--shadow-tl)] backdrop-blur sm:p-7">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
        </span>
        {/* живая точка уже есть — штрих метки тут лишний */}
        <h2 className="eyebrow !text-teal-600 [&::before]:hidden">Сейчас в океане</h2>
      </div>

      <div className="mt-5 flex-1 space-y-3">
        {shown.length === 0 && (
          <p className="text-sm text-navy/60">Лента событий загружается…</p>
        )}
        {shown.map((e, i) => {
          const lvl = LEVEL_RU[e.level];
          return (
            <div
              key={`${e.name}-${e.when}`}
              className="tl-toast--in flex items-center gap-3 rounded-2xl border border-navy/10 bg-white px-3.5 py-2.5 shadow-[var(--shadow-tl-sm)]"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className={i === 0 ? "tl-toast-glow shrink-0" : "shrink-0"}>
                <img src={lvl.img} alt="" width={38} height={38} className="h-[38px] w-[38px] object-contain" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-navy">
                  {e.name} — теперь {lvl.name}
                </span>
                <span className="block text-xs text-navy/50">{timeAgo(e.when)}</span>
              </span>
            </div>
          );
        })}
      </div>

      {total != null && total > 0 && (
        <p className="num mt-4 border-t border-navy/10 pt-3.5 text-xs font-semibold text-navy/55">
          в океане {total} {plural(total, "человек", "человека", "человек")} — каждый тест двигает таблицу
        </p>
      )}
    </section>
  );
}
