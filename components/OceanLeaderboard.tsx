"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OCEAN_RANKS } from "@/lib/content";
import { regionName } from "@/lib/kz-regions";
import { OCEAN_API, getOceanToken } from "@/lib/ocean";
import { RankSketch, RankMark, API2KEY } from "./RankSketch";
import type { LevelKey } from "@/lib/content";

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

const LEVEL_RU: Record<string, { name: string }> = {
  mollusk: { name: "Ракушка" },
  crab: { name: "Краб" },
  barracuda: { name: "Барракуда" },
  dolphin: { name: "Дельфин" },
  shark: { name: "Акула" },
  whale: { name: "Кит" },
};

// «Краб против Крабов» — родительный падеж для подписи среза
const LEVEL_VS: Record<string, string> = {
  mollusk: "Ракушек", crab: "Крабов", barracuda: "Барракуд",
  dolphin: "Дельфинов", shark: "Акул", whale: "Китов",
};

const SPEED_RU: Record<string, string> = {
  lightning: "молниеносный",
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
  const scopeTouched = useRef(false); // юзер сам выбрал вкладку — дефолт не навязываем
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
      .then((r) => {
        setMyLevel(r.current_level ?? null);
        // вошедшему по умолчанию — «Мой уровень» (Адиль 18.07): настоящая гонка
        // там; общий вид — лестница-витрина. Ручной выбор вкладки не перебиваем.
        if (r.current_level && !scopeTouched.current) setScope("level");
      })
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
      {/* срезы: три зачёта */}
      <div className="flex flex-wrap gap-2">
        <Scope
          label="Казахстан"
          sub="вся страна"
          active={scope === "all"}
          onClick={() => { scopeTouched.current = true; setScope("all"); }}
        />
        <Scope
          label="Моя область"
          sub={!authed ? "после входа" : !myRegion ? "укажи область" : regionName(myRegion) ?? "твоя область"}
          active={scope === "region"}
          disabled={!authed || !myRegion}
          onClick={() => { scopeTouched.current = true; setScope("region"); }}
        />
        <Scope
          label="Мой уровень"
          sub={!authed ? "после входа" : myLevel ? `против ${LEVEL_VS[myLevel] ?? "равных"}` : "среди равных"}
          active={scope === "level"}
          disabled={!authed || !myLevel}
          onClick={() => { scopeTouched.current = true; setScope("level"); }}
        />
      </div>

      {data && (
        <p className="num mt-4 text-[13px] text-faint">
          {scope === "region" && myRegion
            ? `${regionName(myRegion)} · ${data.scope_total} в срезе`
            : scope === "level" && myLevel
            ? `${LEVEL_RU[myLevel]?.name ?? myLevel} против ${LEVEL_VS[myLevel] ?? ""} · ${data.scope_total} в срезе`
            : `в океане: ${data.total_users}`}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-6 sm:mt-10 text-[14px] text-text-2">Рейтинг сейчас недоступен, попробуй позже.</p>
      )}
      {!data && !error && (
        <p role="status" aria-live="polite" className="mt-6 sm:mt-10 text-[15px] text-faint">Загружаем рейтинг</p>
      )}

      {data && (
        <div className="mt-6 grid gap-7 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="grid grid-cols-[40px_minmax(0,1fr)_48px_64px] gap-4 pb-2 text-[12px] font-medium text-text-2">
              <span>#</span><span>Имя</span><span className="text-center">Ур.</span><span className="text-right">Композит</span>
            </div>
            {data.entries.length === 0 && (
              <p className="border-t border-line py-6 sm:py-10 text-[14px] text-text-2">
                В этом срезе попыток ещё не было, место свободно.
              </p>
            )}
            {data.entries.slice(0, 10).map((e, i, arr) => {
              const prev = arr[i - 1];
              const newTier = scope === "all" && prev && prev.level !== e.level;
              return (
                <Fragment key={`${e.rank}-${e.name}`}>
                  {newTier && (
                    <div className="border-t border-line py-2 text-[12px] font-medium text-text-2">
                      {LEVEL_RU[e.level]?.name ?? e.level}: свой зачёт
                    </div>
                  )}
                  <Row e={e} />
                </Fragment>
              );
            })}

            {/* моя позиция закреплена, даже если #847 */}
            {data.me && !meInTop && (
              <div className="grid grid-cols-[40px_minmax(0,1fr)_48px_64px] items-center gap-4 border-t border-line-2 bg-subtle px-0 py-3.5">
                <span className="num text-[15px] font-medium text-ink">{data.me.rank}</span>
                <div className="min-w-0">
                  <div className="font-medium text-ink">Ты</div>
                  <div className="text-[12px] text-faint">
                    из {data.scope_total}
                    {data.me.gap_to_top10 != null && ` · до топ-10: ${data.me.gap_to_top10} очк.`}
                  </div>
                </div>
                <RankMark rank={API2KEY[data.me.level] ?? "rakushka"} className="justify-self-center" />
                <span className="num text-right text-[15px] font-medium text-ink">{data.me.composite}</span>
              </div>
            )}
            <div className="border-t border-line" />
            {!authed && (
              <p className="pt-4 text-[14px] text-text-2">
                <Link href="/auth/sign-in" className="link">Войди</Link>, и увидишь здесь свою позицию.
              </p>
            )}
          </div>

          {/* распределение по уровням */}
          <div>
            <h3 className="eyebrow">Распределение по уровням</h3>
            <div className="mt-4">
              {OCEAN_RANKS.map((r) => {
                const apiKey =
                  { rakushka: "mollusk", krab: "crab", barrakuda: "barracuda", delfin: "dolphin", akula: "shark", kit: "whale" }[
                    r.key
                  ] ?? r.key;
                const n = data.by_level[apiKey] ?? 0;
                return (
                  <div key={r.key} className="flex items-center gap-3 border-t border-line py-2.5">
                    <RankSketch rank={r.key as LevelKey} size={24} className="text-ink" />
                    <span className="w-24 text-[14px] text-body">{r.name}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-accent-600 transition-all duration-500"
                        style={{ width: `${(n / maxLevelCount) * 100}%` }}
                      />
                    </div>
                    <span className="num w-8 text-right text-[14px] text-text-2">{n}</span>
                  </div>
                );
              })}
              <div className="border-t border-line" />
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
      className={`btn-press flex h-9 items-center gap-2 rounded-[8px] border px-3 text-[14px] transition-colors ${
        active
          ? "border-line-2 bg-subtle text-ink"
          : disabled
          ? "border-line text-faint"
          : "border-line text-text-2 hover:bg-subtle hover:text-ink"
      }`}
    >
      <span className="font-medium">{label}</span>
      <span className="text-[12px] text-faint">{sub}</span>
    </button>
  );
}

function Row({ e }: { e: Entry }) {
  return (
    <div className="grid grid-cols-[40px_minmax(0,1fr)_48px_64px] items-center gap-4 border-t border-line py-3.5 transition-colors hover:bg-subtle">
      <span className="num text-[15px] text-faint">{e.rank}</span>
      <div className="min-w-0">
        <div className="truncate text-[15px] font-medium text-ink">{e.name}</div>
        <div className="text-[12px] text-faint">
          в океане {days(e.days_in_ocean)}
          {e.speed_badge && SPEED_RU[e.speed_badge] ? ` · ${SPEED_RU[e.speed_badge]}` : ""}
        </div>
      </div>
      <RankMark rank={API2KEY[e.level] ?? "rakushka"} className="justify-self-center" />
      <span className="num text-right text-[15px] font-medium text-ink">{e.composite}</span>
    </div>
  );
}
