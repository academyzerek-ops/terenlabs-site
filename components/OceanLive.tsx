"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OCEAN_API, getOceanToken } from "@/lib/ocean";
import { regionName } from "@/lib/kz-regions";
import { plural } from "@/lib/content";

// Океан живёт в самом погружении, а не в дашборд-виджетах (Адиль, 2026-06-12):
// зал славы — пловцы на воде без рамок, события — пузыри у своих уровней.
// Данные настоящие — /leaderboard и /activity, ничего не выдумываем.

const LEVEL_RU: Record<string, { name: string; img: string }> = {
  mollusk: { name: "Ракушка", img: "/brand/ranks/rakushka.png?v=11" },
  crab: { name: "Краб", img: "/brand/ranks/krab.png?v=11" },
  barracuda: { name: "Барракуда", img: "/brand/ranks/barrakuda.png?v=11" },
  dolphin: { name: "Дельфин", img: "/brand/ranks/delfin.png?v=11" },
  shark: { name: "Акула", img: "/brand/ranks/akula.png?v=11" },
  whale: { name: "Кит", img: "/brand/ranks/kit.png?v=11" },
};

// ключи уровней сайта → ключи API
const SITE2API: Record<string, string> = {
  rakushka: "mollusk",
  krab: "crab",
  barrakuda: "barracuda",
  delfin: "dolphin",
  akula: "shark",
  kit: "whale",
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

// активность тянем один раз на страницу — пузыри у уровней делят кэш
let actCache: Promise<ActEntry[]> | null = null;
function getActivity(): Promise<ActEntry[]> {
  actCache ??= fetch(`${OCEAN_API}/activity?limit=20`)
    .then((r) => r.json())
    .then((d) => (d.entries || []) as ActEntry[])
    .catch(() => []);
  return actCache;
}

/* ── Зал славы: три пловца на воде, без карточек — справа от интро ── */

export function OceanHall() {
  const [data, setData] = useState<LbData | null>(null);
  const [regionRank, setRegionRank] = useState<{ code: string; rank: number; total: number } | null>(null);

  useEffect(() => {
    const token = getOceanToken();
    const headers = token ? { Authorization: `web ${token}` } : undefined;
    fetch(`${OCEAN_API}/leaderboard?period=all`, { headers })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
    if (!token) return;
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
  if (podium.length === 0) return null;

  return (
    <div className="hidden lg:block">
      <div className="flex items-baseline justify-center gap-5">
        <h2 className="eyebrow !text-teal-600">Зал славы</h2>
        <Link href="/ocean" className="text-sm font-semibold text-teal-600 transition-colors hover:text-teal">
          вся таблица →
        </Link>
      </div>

      {/* пьедестал без пьедестала: золото в центре выше и крупнее, всё на воде */}
      <div className="mt-7 flex items-end justify-center gap-8">
        {[podium[1], podium[0], podium[2]].map((e, slot) =>
          e ? <Swimmer key={e.rank} e={e} first={slot === 1} idx={slot} /> : null
        )}
      </div>

      <p className="num mt-7 text-center text-sm text-navy/60">
        {data?.me ? (
          <>
            Ты — <strong className="text-navy">#{data.me.rank}</strong> из {data.scope_total} по Казахстану
            {regionRank && (
              <>
                {" · "}
                <strong className="text-navy">#{regionRank.rank}</strong> · {regionName(regionRank.code)}
              </>
            )}
          </>
        ) : (
          <>
            в океане {data?.total_users} {plural(data?.total_users ?? 0, "человек", "человека", "человек")} ·{" "}
            <Link href="/auth/sign-in" className="font-semibold text-teal-600 hover:text-teal">
              войди
            </Link>{" "}
            — узнаешь своё место
          </>
        )}
      </p>
    </div>
  );
}

function Swimmer({ e, first, idx }: { e: Entry; first: boolean; idx: number }) {
  const lvl = LEVEL_RU[e.level] ?? LEVEL_RU.mollusk;
  const size = first ? 104 : 72;
  return (
    <div className={`flex flex-col items-center ${first ? "" : "mb-1"}`}>
      <div className="relative flex items-center justify-center">
        {/* свечение за золотом — как за персонажами уровней */}
        <div
          className="absolute rounded-full"
          style={{
            width: size * 1.5,
            height: size * 1.5,
            background: `radial-gradient(circle, ${
              first ? "rgba(0,183,194,0.35)" : "rgba(255,255,255,0.45)"
            } 0%, transparent 70%)`,
            filter: "blur(6px)",
          }}
          aria-hidden="true"
        />
        <img
          src={lvl.img}
          alt={lvl.name}
          width={size}
          height={size}
          className="floaty relative object-contain drop-shadow-[0_16px_32px_rgba(6,24,42,0.35)]"
          style={{
            width: size,
            height: size,
            "--float-delay": `${idx * -1.3}s`,
            "--float-dur": `${4.5 + idx * 0.8}s`,
          } as React.CSSProperties}
        />
      </div>
      <span className={`num mt-2 font-bold ${first ? "text-base text-teal-600" : "text-xs text-navy/45"}`}>
        #{e.rank}
      </span>
      <span className={`max-w-[120px] truncate font-semibold text-navy ${first ? "text-lg" : "text-sm"}`}>
        {e.name}
      </span>
      <span className="num text-xs text-navy/55">
        {e.composite} очк · {lvl.name}
      </span>
    </div>
  );
}

/* ── Пузырь у уровня: кто последним доплыл до этой глубины ── */

export function LevelArrival({ levelKey, deep }: { levelKey: string; deep?: boolean }) {
  const [e, setE] = useState<ActEntry | null>(null);

  useEffect(() => {
    const apiKey = SITE2API[levelKey];
    getActivity().then((all) => setE(all.find((a) => a.level === apiKey) ?? null));
  }, [levelKey]);

  if (!e) return null;
  const tone = deep
    ? "border-white/20 bg-white/10 text-foam/85"
    : "border-white/50 bg-white/40 text-navy/80";
  return (
    <div
      className={`floaty absolute -top-1 right-0 z-10 hidden items-center gap-2 rounded-full border px-3.5 py-1.5 shadow-[0_8px_24px_rgba(6,24,42,0.18)] backdrop-blur-md sm:flex ${tone}`}
      style={{ "--float-dur": "5.5s", "--float-delay": "-2s" } as React.CSSProperties}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
      </span>
      <span className="whitespace-nowrap text-xs font-semibold">
        {e.name} — {timeAgo(e.when)}
      </span>
    </div>
  );
}
