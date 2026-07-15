"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OCEAN_RANKS } from "@/lib/content";
import { regionName } from "@/lib/kz-regions";
import { OCEAN_API, getOceanToken } from "@/lib/ocean";

// Живой рейтинг «Океана» (12_OCEAN.md, этап 3): пьедестал топ-3, таблица
// топ-10, закреплённая «моя позиция» и срезы Казахстан / область / уровень.
const API = OCEAN_API + "/leaderboard";

type Entry = {
  rank: number;
  name: string;
  composite: number;
  level: string;
  days_in_ocean: number;
  speed_badge: string | null;
};
type Me = { rank: number; composite: number; level: string; gap_to_top10: number | null };
type Data = {
  total_users: number;
  by_level: Record<string, number>;
  entries: Entry[];
  scope_total: number;
  me: Me | null;
};

const LEVEL_RU: Record<string, { name: string; img: string }> = {
  mollusk: { name: "Ракушка", img: "/brand/ranks/rakushka.webp?v=12" },
  crab: { name: "Краб", img: "/brand/ranks/krab.webp?v=12" },
  barracuda: { name: "Барракуда", img: "/brand/ranks/barrakuda.webp?v=12" },
  dolphin: { name: "Дельфин", img: "/brand/ranks/delfin.webp?v=12" },
  shark: { name: "Акула", img: "/brand/ranks/akula.webp?v=12" },
  whale: { name: "Кит", img: "/brand/ranks/kit.webp?v=12" },
};

// «Краб против Крабов» — родительный падеж для подписи среза
const LEVEL_VS: Record<string, string> = {
  mollusk: "Ракушек", crab: "Крабов", barracuda: "Барракуд",
  dolphin: "Дельфинов", shark: "Акул", whale: "Китов",
};

const SPEED_RU: Record<string, string> = {
  lightning: "⚡ молниеносный",
  confident: "уверенный темп",
  edge: "на грани времени",
};

function days(n: number) {
  const word =
    n % 10 === 1 && n % 100 !== 11
      ? "день"
      : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
      ? "дня"
      : "дней";
  return `${n} ${word}`;
}

export function OceanLeaderboard() {
  const [scope, setScope] = useState<"all" | "region" | "level">("all");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);
  const [myRegion, setMyRegion] = useState<string | null>(null);
  const [myLevel, setMyLevel] = useState<string | null>(null);
  const authed = typeof window !== "undefined" && !!getOceanToken();

  // профиль для срезов «моя область / мой уровень»
  useEffect(() => {
    const token = getOceanToken();
    if (!token) return;
    const h = { Authorization: `web ${token}` };
    fetch(OCEAN_API + "/me/settings", { headers: h })
      .then((r) => r.json())
      .then((s) => setMyRegion(s.region_code ?? null))
      .catch(() => {});
    fetch(OCEAN_API + "/me/rank", { headers: h })
      .then((r) => r.json())
      .then((r) => setMyLevel(r.current_level ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setData(null);
    setError(false);
    const params = new URLSearchParams({ period: "all" });
    if (scope === "region" && myRegion) params.set("region", myRegion);
    if (scope === "level" && myLevel) params.set("level", myLevel);
    const token = getOceanToken();
    fetch(`${API}?${params}`, {
      headers: token ? { Authorization: `web ${token}` } : undefined,
    })
      .then((r) => r.json())
      .then((d) => alive && setData(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [scope, myRegion, myLevel]);

  const maxLevelCount = data ? Math.max(1, ...Object.values(data.by_level)) : 1;
  const podium = data?.entries.slice(0, 3) ?? [];
  const rest = data?.entries.slice(3, 10) ?? [];
  const meInTop = data?.me && data.me.rank <= 10;

  return (
    <div>
      {/* срезы — три зачёта, каждый заметен и объяснён */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Scope
          label="Казахстан"
          sub="вся страна в одном зачёте"
          active={scope === "all"}
          onClick={() => setScope("all")}
        />
        <Scope
          label="Моя область"
          sub={
            !authed
              ? "войди — сравним с земляками"
              : !myRegion
              ? "укажи область — появятся земляки"
              : `земляки: ${regionName(myRegion) ?? "твоя область"}`
          }
          active={scope === "region"}
          disabled={!authed || !myRegion}
          onClick={() => setScope("region")}
        />
        <Scope
          label="Мой уровень"
          sub={
            !authed
              ? "войди — сравним с равными"
              : myLevel
              ? `${LEVEL_RU[myLevel]?.name ?? ""} против ${LEVEL_VS[myLevel] ?? "равных"}`
              : "честная гонка среди равных"
          }
          active={scope === "level"}
          disabled={!authed || !myLevel}
          onClick={() => setScope("level")}
        />
      </div>

      {/* подпись среза */}
      {data && (
        <p className="num mt-3 text-sm text-muted">
          {scope === "region" && myRegion
            ? `${regionName(myRegion)} · ${data.scope_total} в срезе`
            : scope === "level" && myLevel
            ? `${LEVEL_RU[myLevel]?.name ?? myLevel} против ${LEVEL_VS[myLevel] ?? ""} · ${data.scope_total} в срезе`
            : `в океане: ${data.total_users}`}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-10 text-center text-muted">Рейтинг сейчас недоступен — попробуй позже.</p>
      )}
      {!data && !error && (
        <p role="status" aria-live="polite" className="mt-10 text-center text-muted">Загружаю рейтинг…</p>
      )}

      {data && (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            {/* пьедестал топ-3: серебро · золото · бронза */}
            {podium.length > 0 && (
              <div className="mb-6 grid grid-cols-3 items-end gap-3 sm:gap-4">
                {[podium[1], podium[0], podium[2]].map((e, slot) =>
                  e ? (
                    <Podium key={e.rank} e={e} first={slot === 1} />
                  ) : (
                    <div key={`empty-${slot}`} />
                  )
                )}
              </div>
            )}

            {/* топ-4…10 */}
            <div className="overflow-hidden rounded-[var(--radius-tl)] border border-line bg-card">
              {data.entries.length === 0 && (
                <p className="p-10 text-center text-muted">
                  В этом срезе попыток ещё не было — место свободно.
                </p>
              )}
              {rest.map((e) => (
                <Row key={`${e.rank}-${e.name}`} e={e} />
              ))}

              {/* моя позиция — закреплённая строка, даже если #847 */}
              {data.me && !meInTop && (
                <div className="border-t-2 border-teal/40 bg-teal/5 px-5 py-3.5">
                  <div className="flex items-center gap-4">
                    <span className="num w-10 text-lg font-bold text-teal">#{data.me.rank}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-heading">Ты</div>
                      <div className="text-xs text-muted">
                        {LEVEL_RU[data.me.level]?.name} · из {data.scope_total}
                        {data.me.gap_to_top10 != null &&
                          ` · до топ-10: ${data.me.gap_to_top10} очк.`}
                      </div>
                    </div>
                    <span className="num text-lg font-semibold text-heading">{data.me.composite}</span>
                  </div>
                </div>
              )}
              {!authed && (
                <div className="border-t border-line px-5 py-4 text-center text-sm text-muted">
                  <Link href="/auth/sign-in" className="font-semibold text-teal-600 hover:text-teal">
                    Войди
                  </Link>{" "}
                  — и увидишь здесь свою позицию.
                </div>
              )}
            </div>
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

function Scope({
  label,
  sub,
  active,
  disabled,
  onClick,
}: {
  label: string;
  sub: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`btn-press rounded-[var(--radius-tl)] border px-5 py-4 text-left transition-all ${
        active
          ? "border-teal bg-teal/10 shadow-[0_0_0_1px_var(--color-teal),0_8px_24px_rgba(0,183,194,0.15)]"
          : disabled
          ? "border-line opacity-60"
          : "border-line bg-card hover:-translate-y-0.5 hover:border-teal/60"
      }`}
    >
      <span className={`block text-base font-semibold ${active ? "text-teal-600" : "text-heading"}`}>
        {label}
      </span>
      <span className="mt-0.5 block text-xs text-muted">{sub}</span>
    </button>
  );
}

function Podium({ e, first }: { e: Entry; first: boolean }) {
  const lvl = LEVEL_RU[e.level] ?? LEVEL_RU.mollusk;
  const medal = e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : "🥉";
  return (
    <div
      className={`relative flex flex-col items-center rounded-[var(--radius-tl)] border bg-card px-3 pb-5 text-center transition-transform hover:-translate-y-1 ${
        first
          ? "border-teal/50 pt-7 shadow-[0_0_40px_rgba(0,183,194,0.25),var(--shadow-tl)]"
          : "border-line pt-5 shadow-[var(--shadow-tl-sm)]"
      }`}
    >
      <span className="absolute -top-3 text-2xl" aria-hidden="true">{medal}</span>
      <img
        src={lvl.img}
        alt={lvl.name}
        width={first ? 72 : 56}
        height={first ? 72 : 56}
        className={`${first ? "h-18 w-18" : "h-14 w-14"} object-contain drop-shadow-[0_8px_18px_rgba(6,24,42,0.35)]`}
        style={first ? { width: 72, height: 72 } : { width: 56, height: 56 }}
      />
      <div className={`mt-2 w-full truncate font-semibold text-heading ${first ? "text-lg" : "text-sm"}`}>
        {e.name}
      </div>
      <div className="text-xs text-muted">{lvl.name}</div>
      <div className={`num mt-1 font-bold ${first ? "text-2xl text-teal-600" : "text-lg text-heading"}`}>
        {e.composite}
      </div>
      {e.speed_badge && SPEED_RU[e.speed_badge] && (
        <div className="mt-1 text-[10px] uppercase tracking-wide text-muted">{SPEED_RU[e.speed_badge]}</div>
      )}
    </div>
  );
}

function Row({ e }: { e: Entry }) {
  const lvl = LEVEL_RU[e.level] ?? LEVEL_RU.mollusk;
  return (
    <div className="flex items-center gap-4 border-b border-line px-5 py-3.5 transition-colors last:border-0 hover:bg-subtle">
      <span className="num w-8 text-lg font-semibold text-muted">{e.rank}</span>
      <img src={lvl.img} alt={lvl.name} width={36} height={36} className="h-9 w-9 object-contain" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold text-heading">{e.name}</div>
        <div className="text-xs text-muted">
          {lvl.name} · в океане {days(e.days_in_ocean)}
          {e.speed_badge && SPEED_RU[e.speed_badge] ? ` · ${SPEED_RU[e.speed_badge]}` : ""}
        </div>
      </div>
      <span className="num text-lg font-semibold text-heading">{e.composite}</span>
    </div>
  );
}
