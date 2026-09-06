"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { OCEAN_RANKS } from "@/lib/content";
import { SignInMethods } from "@/components/SignInMethods";
import { RankSketch, API2KEY } from "@/components/RankSketch";
import type { LevelKey } from "@/lib/content";
import {
  fetchMeSummary,
  getOceanToken,
  loginBridge,
  oceanFetch,
  oceanSignOut,
  OceanProgress,
  isTestPassed,
  LEVEL_TESTS,
  cooldownLeftMs,
  formatCooldown,
} from "@/lib/ocean";
import { OCEAN_TESTS, SHARK_CASES } from "@/lib/ocean-tests";
import { currentLevelId } from "./OceanPath";

// Кабинет Океана — полный дашборд, как в Mini App: уровень с целью, путь по
// медальонам, тесты текущего уровня со статусами и баллами, бейджи, последний
// разбор TEREN-AI, статистика. Все данные — живые, с того же бэка.
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
type Badge = { id: string; name: string; emoji: string; description: string; earned: boolean; value?: string | null };
type Reco = { text: string; level: string; test: string; passed: boolean; created_at: string };

const LEVEL_RU: Record<string, string> = {
  mollusk: "Ракушка", crab: "Краб", barracuda: "Барракуда",
  dolphin: "Дельфин", shark: "Акула", whale: "Кит",
};
const LEVEL_KEY: Record<string, string> = {
  mollusk: "rakushka", crab: "krab", barracuda: "barrakuda",
  dolphin: "delfin", shark: "akula", whale: "kit",
};
const PATH_ORDER = ["mollusk", "crab", "barracuda", "dolphin", "shark", "whale"];

// тесты уровня для кабинета: id → slug сайта (сдаются на сайте все)
function levelTestList(level: string): { test: string; slug: string; name: string }[] {
  if (level === "shark")
    return SHARK_CASES.map((c) => ({ test: c.id, slug: `shark-${c.id}`, name: c.name }));
  const ids = LEVEL_TESTS[level] ?? [];
  return ids.map((t) => {
    const slug = `${level}-${t}`;
    const meta = OCEAN_TESTS[slug];
    return { test: t, slug, name: meta ? meta.title.split("·")[1]?.trim() ?? t : t };
  });
}

function testsPassed(p: OceanProgress | null, level: string): number {
  return levelTestList(level).filter((t) => isTestPassed(p, level, t.test)).length;
}

function bestScore(p: OceanProgress | null, level: string, test: string): number | null {
  const v = p?.progress?.[level]?.[test];
  if (v && typeof v === "object" && "best_score" in v) {
    const b = (v as { best_score?: number }).best_score;
    return typeof b === "number" ? b : null;
  }
  return null;
}

export function OceanAccount({ nextAuthActive = false, title = "Океан", googleReady = false, googleAction }: { nextAuthActive?: boolean; title?: string; googleReady?: boolean; googleAction?: () => Promise<void> }) {
  const [hasToken, setHasToken] = useState(false);
  const [rank, setRank] = useState<Rank | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [progress, setProgress] = useState<OceanProgress | null>(null);
  const [badges, setBadges] = useState<Badge[] | null>(null);
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string>(""); // общий вывод TEREN-AI
  const [recoOpen, setRecoOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!getOceanToken()) {
      setHasToken(false);
      setRank(null);
      return;
    }
    setHasToken(true);
    try {
      const [r, s, p, b, sum] = await Promise.all([
        oceanFetch<Rank>("/me/rank"),
        oceanFetch<Stats>("/me/stats").catch(() => null),
        oceanFetch<OceanProgress & { last_recommendation?: Reco | null }>("/me/progress").catch(() => null),
        oceanFetch<{ badges: Badge[] }>("/me/badges").catch(() => null),
        fetchMeSummary(),
      ]);
      setRank(r);
      setStats(s);
      setProgress(p);
      setBadges(b?.badges ?? null);
      setAiSummary(sum);
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
    // аноним: приглашение в Океан языком бренда (Адиль 17.07 «поярче и креативно») —
    // маршрут медальонов с пунктиром + биолюминесценция + фирменная TG-кнопка.
    // Кит не показываем: отдельная ветка, в путь уровней не входит.
    const route = OCEAN_RANKS.filter((r) => r.key !== "kit");
    // Эскизы растут к Акуле. На телефоне тот же ряд из пяти не влезает в ширину
    // панели, поэтому у svg задана ещё и ширина классом: viewBox масштабирует.
    const sizes = [40, 48, 56, 66, 78];
    const sizeCls = [
      "w-[30px] sm:w-[40px]",
      "w-[36px] sm:w-[48px]",
      "w-[42px] sm:w-[56px]",
      "w-[50px] sm:w-[66px]",
      "w-[58px] sm:w-[78px]",
    ];
    return (
      <section className="panel p-6 sm:p-8">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div>
            <p className="eyebrow">Океан</p>
            <h2 className="mt-2 text-[24px]">Твой путь: от Ракушки до Акулы</h2>
            <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-text-2">
              Попытки идут в зачёт после входа: уровень, очки и место в рейтинге соберутся сами.
            </p>
            <div className="mt-6 max-w-[360px]">
              <SignInMethods googleReady={googleReady} googleAction={googleAction} size="sm" />
            </div>
            <Link href="/ocean" className="link mt-5 inline-flex text-[14px]">Посмотреть рейтинг</Link>
          </div>

          {/* маршрут уровней: эскизы растут к Акуле */}
          <div className="flex items-end justify-between gap-1 border-t border-line pt-5 sm:gap-2 lg:border-t-0 lg:pt-0">
            {route.map((r, i) => (
              <div key={r.key} className="flex flex-col items-center gap-1.5">
                <RankSketch rank={r.key as LevelKey} size={sizes[i]} className={`h-auto text-ink ${sizeCls[i]}`} />
                <span className="text-[10px] text-faint sm:text-[11px]">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const lvl = rank?.current_level ?? (progress ? currentLevelId(progress) : "mollusk");
  const reco = (progress as (OceanProgress & { last_recommendation?: Reco | null }) | null)?.last_recommendation ?? null;
  const tests = lvl === "mollusk" || lvl === "whale" ? [] : levelTestList(lvl);

  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[20px]">{title}</h2>
        <Link href="/ocean" className="link text-[14px]">Рейтинг <span aria-hidden="true">→</span></Link>
      </div>

      {/* уровень и цифры одной тонкой строкой: панель, 4 ячейки через линии */}
      <div className="panel mt-4 grid sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
        <div className="flex items-start gap-4 px-5 py-4">
          <RankSketch rank={API2KEY[lvl] ?? "rakushka"} size={44} className="shrink-0 text-ink" />
          <div className="min-w-0">
            <div className="text-[12px] text-faint">твой уровень</div>
            <div className="text-[20px] font-semibold leading-tight text-ink">{LEVEL_RU[lvl]}</div>
            {rank?.next_goal?.label && (
              <p className="mt-0.5 truncate text-[12px] text-text-2">{rank.next_goal.label}</p>
            )}
          </div>
        </div>
        <Link href="/ocean" className="flex flex-col justify-start px-5 py-4 transition-colors hover:bg-subtle lg:border-l lg:border-line">
          <div className="text-[12px] text-faint">место в океане</div>
          <div className="num text-[20px] font-semibold leading-tight text-ink">
            {rank?.rank ? `#${rank.rank}` : "—"}
            {rank && <span className="ml-1.5 text-[13px] font-normal text-text-2">из {rank.total}</span>}
          </div>
        </Link>
        <Cell label="очки" value={String(rank?.composite ?? 0)} sub={rank && rank.peers_at_level > 1 ? `впереди ${rank.peers_below} из ${rank.peers_at_level} на уровне` : undefined} />
        <Cell label="стрик дней" value={String(rank?.streak?.current ?? 0)} sub={rank?.streak?.longest ? `рекорд ${rank.streak.longest}` : undefined} />
      </div>

      {/* путь по уровням: строка эскизов, пройденные с галочкой-штрихом, текущий оранжевой точкой */}
      {progress && (
        <div className="mt-3 sm:overflow-x-auto">
          {/* шесть равных колонок во всю ширину; на телефоне те же шесть уровней
              ложатся в две строки по три, чтобы ничего не листать вбок */}
          <div className="grid grid-cols-3 items-start gap-y-3 sm:min-w-[560px] sm:grid-cols-6 sm:gap-y-0">
            {PATH_ORDER.map((id, i) => {
              const cur = lvl === id;
              const idx = PATH_ORDER.indexOf(lvl);
              const done = i < idx || id === "mollusk";
              const total = id === "shark" ? SHARK_CASES.length : LEVEL_TESTS[id]?.length ?? 0;
              const passed = total ? testsPassed(progress, id) : 0;
              return (
                <Link
                  key={id}
                  href={`/levels/${LEVEL_KEY[id]}`}
                  // пунктир между уровнями рисуем псевдоэлементом на высоте центра
                  // эскиза: он тянется от края соседней иконки до края этой
                  className={`group relative flex flex-col items-center rounded-[8px] px-2 py-3 text-center transition-colors hover:bg-subtle ${
                    i > 0
                      ? "sm:before:absolute sm:before:top-[31px] sm:before:left-[calc(-50%+22px)] sm:before:right-[calc(50%+22px)] sm:before:border-t sm:before:border-dashed sm:before:border-line-2 sm:before:content-['']"
                      : ""
                  } ${cur ? "bg-subtle" : ""}`}
                >
                  <span className="relative flex h-10 w-10 items-center justify-center">
                    <RankSketch rank={LEVEL_KEY[id] as LevelKey} size={36} className={done || cur ? "text-ink" : "text-faint"} />
                    {done && !cur && (
                      <svg className="absolute -right-1 -top-1 text-accent" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6.2 4.6 8.8 10 3.4" /></svg>
                    )}
                  </span>
                  <span className={`mt-2 text-[12px] font-medium ${cur ? "text-ink" : done ? "text-body" : "text-faint"}`}>
                    {LEVEL_RU[id]}
                  </span>
                  <span className="num h-4 text-[11px] text-faint">{total > 0 ? `${passed}/${total}` : ""}</span>
                  {cur && (
                    <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-orange">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange" />ты здесь
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* тесты текущего уровня: строки с галочкой, без рамок */}
      {progress && tests.length > 0 && (
        <div className="mt-8">
          <p className="text-[12px] font-medium text-text-2">Тесты уровня «{LEVEL_RU[lvl]}»</p>
          <div className="mt-2 grid sm:grid-cols-2 sm:gap-x-10">
            {tests.map((t) => {
              const passed = isTestPassed(progress, lvl, t.test);
              const best = bestScore(progress, lvl, t.test);
              const cdMs = cooldownLeftMs(progress.cooldowns, lvl, t.test);
              return (
                <Link key={t.slug} href={`/tests/${t.slug}/take`} className="row-hover flex items-center gap-3 border-t border-line py-3">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${passed ? "bg-accent-100 text-accent" : "border border-line-2 text-faint"}`}>
                    {passed ? (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6.2 4.6 8.8 10 3.4" /></svg>
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{t.name}</span>
                  <span className="num shrink-0 text-[12px] text-faint">
                    {passed
                      ? best != null ? `лучший ${best}/10` : "сдан"
                      : cdMs > 0
                      ? `пересдача через ${formatCooldown(cdMs)}`
                      : best != null
                      ? `лучший ${best}/10`
                      : "не начат"}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="border-t border-line" />
        </div>
      )}

      {/* знаки: штриховые иконки в стиле сайта, заработанные белым, остальные серым */}
      {badges && badges.length > 0 && (
        <div className="mt-8">
          <p className="text-[12px] font-medium text-text-2">Знаки</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.id}
                title={b.description}
                className={`inline-flex h-8 items-center gap-2 rounded-[6px] px-3 text-[13px] ${
                  b.earned ? "bg-subtle text-ink" : "text-faint"
                }`}
              >
                <BadgeIcon id={b.id} emoji={b.emoji} />
                <span className="font-medium">{b.name}</span>
                {b.value && <span className="num text-[12px] text-faint">{b.value}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* общий вывод TEREN-AI по накопленной статистике (тот же бэк, что Mini App) */}
      {aiSummary && (
        <div className="mt-8 rounded-[8px] border-l-2 border-accent bg-subtle p-5">
          <p className="num text-[11px] font-medium text-accent">
            TEREN-AI · твой портрет по статистике
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-body">{aiSummary}</p>
        </div>
      )}

      {/* последний разбор TEREN-AI — как в кабинете Mini App */}
      {reco?.text && (
        <div className="mt-8 rounded-[8px] border-l-2 border-accent bg-subtle p-5">
          <p className="num text-[11px] font-medium text-accent">
            Разбор TEREN-AI · {LEVEL_RU[reco.level] ?? reco.level}
            {reco.created_at ? ` · ${new Date(reco.created_at).toLocaleDateString("ru-RU")}` : ""}
          </p>
          <p className={`mt-2 whitespace-pre-line text-sm leading-relaxed text-body ${recoOpen ? "" : "line-clamp-4"}`}>
            {reco.text}
          </p>
          {reco.text.length > 220 && (
            <button
              onClick={() => setRecoOpen((v) => !v)}
              className="link mt-2 text-[13px]"
            >
              {recoOpen ? "Свернуть" : "Читать целиком →"}
            </button>
          )}
        </div>
      )}

      {/* личная статистика — полноценный блок, не серая строчка (Адиль 18.07) */}
      {stats && stats.attempts > 0 && (
        <div className="mt-8">
          <p className="text-[12px] font-medium text-text-2">Моя статистика</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatCell label="попыток всего" value={String(stats.attempts)} />
            {stats.avg_score != null && (
              <StatCell label="средний балл" value={Number(stats.avg_score).toFixed(1)} sub="из 10" />
            )}
            {stats.best_score != null && (
              <StatCell label="лучший результат" value={`${stats.best_score}/10`} />
            )}
            {stats.avg_time_per_q != null && (
              <StatCell label="темп ответа" value={`${Number(stats.avg_time_per_q).toFixed(0)} сек`} sub="на вопрос" />
            )}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4 text-[13px]">
        <button
          onClick={async () => {
            try {
              const out = await oceanFetch<{ code: string }>("/auth/link/code", { method: "POST", json: {} });
              setLinkCode(out.code);
            } catch {
              setLinkCode(null);
            }
          }}
          className="link"
        >
          Привязать Telegram
        </button>
        {linkCode && (
          <span className="num rounded-[6px] bg-subtle px-3 py-1.5 text-ink">
            код <strong>{linkCode}</strong>, введи в Mini App за 10 минут
          </span>
        )}

      </div>
    </section>
  );
}

// знаки: штрих вместо эмодзи (молния, галочка, кубок, огонь); неизвестный id → точка
function BadgeIcon({ id, emoji }: { id: string; emoji: string }) {
  const key = /light|fast|молн|⚡/i.test(id + emoji) ? "bolt"
    : /perfect|clean|error|✅/i.test(id + emoji) ? "check"
    : /streak|series|serie|🏆/i.test(id + emoji) ? "trophy"
    : /return|come|back|🔥/i.test(id + emoji) ? "flame" : "dot";
  const d = {
    bolt: <path d="M9 1.5 3.5 9h4l-.5 5.5L12.5 7h-4z" />,
    check: <path d="M3 8.5l3 3 7-7" />,
    trophy: <path d="M5 2.5h6v3a3 3 0 0 1-6 0zM5 3.5H3v1a2 2 0 0 0 2 2M11 3.5h2v1a2 2 0 0 1-2 2M8 8.5v3M5.5 13.5h5" />,
    flame: <path d="M8 14c2.8 0 4.5-1.8 4.5-4.2 0-2.6-2.3-3.9-2.3-6.3-1.3.7-2.2 2-2.2 3.5-1-.5-1.5-1.6-1.5-2.5C4.8 5.6 3.5 7.6 3.5 9.8 3.5 12.2 5.2 14 8 14z" />,
    dot: <circle cx="8" cy="8" r="2.5" />,
  }[key];
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  );
}

// компактная плашка статистики: ширина по цифре, цифра — главная
function StatCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-[8.5rem] rounded-[8px] bg-subtle px-4 py-3">
      <div className="text-[12px] text-faint">{label}</div>
      <div className="num mt-0.5 text-[20px] font-semibold leading-tight text-ink">
        {value}
        {sub && <span className="ml-1.5 text-[12px] font-normal text-text-2">{sub}</span>}
      </div>
    </div>
  );
}


function Cell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col justify-start px-5 py-4 lg:border-l lg:border-line">
      <div className="text-[12px] text-faint">{label}</div>
      <div className="num text-[20px] font-semibold leading-tight text-ink">{value}</div>
      {sub && <div className="mt-0.5 truncate text-[12px] text-text-2">{sub}</div>}
    </div>
  );
}
