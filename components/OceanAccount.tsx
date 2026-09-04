"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { OCEAN_RANKS } from "@/lib/content";
import { TelegramLoginButton } from "@/components/TelegramLoginButton";
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

export function OceanAccount({ nextAuthActive = false, title = "Океан" }: { nextAuthActive?: boolean; title?: string }) {
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
    const sizes = [40, 48, 56, 66, 78];
    return (
      <section className="rounded-[8px] border border-line bg-card p-6 sm:p-8">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div>
            <p className="eyebrow">Океан</p>
            <h2 className="mt-2 text-[24px]">Твой путь: от Ракушки до Акулы</h2>
            <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-text-2">
              Попытки идут в зачёт после входа: уровень, очки и место в рейтинге соберутся сами.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <TelegramLoginButton label="Войти и занять место" />
              <Link href="/ocean" className="link text-[14px]">Посмотреть рейтинг</Link>
            </div>
          </div>

          {/* маршрут уровней: эскизы растут к Акуле */}
          <div className="flex items-end justify-between gap-2 border-t border-line pt-5 lg:border-t-0 lg:pt-0">
            {route.map((r, i) => (
              <div key={r.key} className="flex flex-col items-center gap-1.5">
                <RankSketch rank={r.key as LevelKey} size={sizes[i]} className="text-ink" />
                <span className="text-[11px] text-faint">{r.name}</span>
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
    <section className="mt-10">
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl text-heading">{title}</h2>
        <Link href="/ocean" className="text-sm font-semibold text-teal-600 hover:text-teal">
          рейтинг →
        </Link>
      </div>
      <div className="wave-divider my-5" />

      {/* герой уровня: медальон на глубине + цель + ключевые цифры */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
        <div className="rounded-[var(--radius-tl)] border border-line bg-card p-5">
          <div className="flex items-center gap-4">
            <RankSketch rank={API2KEY[lvl] ?? "rakushka"} size={64} className="text-ink" />
            <div className="min-w-0">
              <div className="eyebrow">твой уровень</div>
              <div className="mt-1 text-2xl font-semibold text-ink">{LEVEL_RU[lvl]}</div>
              {rank?.next_goal?.label && (
                <p className="mt-1.5 text-xs leading-relaxed text-text-2">{rank.next_goal.label}</p>
              )}
            </div>
          </div>
        </div>

        {/* место — дверь в рейтинг: целая плитка кликабельна, не микроссылка */}
        <Link
          href="/ocean"
          className="group rounded-[var(--radius-tl)] border border-teal/40 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-teal hover:shadow-[var(--shadow-tl-sm)]"
        >
          <div className="text-xs text-muted">место в океане</div>
          <div className="num mt-1 text-2xl font-semibold text-heading">
            {rank?.rank ? `#${rank.rank}` : "—"}
            {rank && <span className="ml-1.5 text-sm font-normal text-muted">из {rank.total}</span>}
          </div>
          <div className="mt-1 text-xs font-semibold text-teal-600 transition-transform group-hover:translate-x-0.5">
            смотреть рейтинг →
          </div>
        </Link>
        <Cell label="очки (композит)" value={String(rank?.composite ?? 0)} sub={rank && rank.peers_at_level > 1 ? `впереди ${rank.peers_below} из ${rank.peers_at_level} на уровне` : undefined} />
        <Cell label="стрик дней" value={String(rank?.streak?.current ?? 0)} sub={rank?.streak?.longest ? `рекорд ${rank.streak.longest}` : undefined} />
      </div>

      {/* путь по медальонам — как «Путь» в дашборде Mini App */}
      {progress && (
        <div className="mt-5 overflow-x-auto rounded-[var(--radius-tl)] border border-line bg-card p-4">
          <div className="flex min-w-max items-start gap-2 sm:gap-4">
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
                  className="group flex w-[72px] flex-col items-center text-center sm:w-[84px]"
                >
                  <span
                    className={`relative flex h-14 w-14 items-center justify-center rounded-full transition-transform group-hover:-translate-y-0.5 sm:h-16 sm:w-16 ${
                      cur ? "border border-orange/60 bg-subtle" : ""
                    }`}
                  >
                    <RankSketch rank={LEVEL_KEY[id] as LevelKey} size={44} className={done || cur ? "text-ink" : "text-faint"} />
                    {done && !cur && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal text-[0.65rem] font-bold text-white">
                        ✓
                      </span>
                    )}
                  </span>
                  <span className={`mt-1.5 text-[0.72rem] font-semibold ${cur ? "text-teal-600" : done ? "text-heading" : "text-muted"}`}>
                    {LEVEL_RU[id]}
                  </span>
                  {total > 0 && (
                    <span className="num text-[0.66rem] text-muted">
                      {passed}/{total}
                    </span>
                  )}
                  {cur && <span className="num text-[0.62rem] font-bold uppercase tracking-wide text-teal-600">ты здесь</span>}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* тесты текущего уровня — статус, балл, кулдаун; всё сдаётся на сайте */}
      {progress && tests.length > 0 && (
        <div className="mt-5">
          <p className="num text-xs font-bold uppercase tracking-wider text-muted">
            Тесты уровня «{LEVEL_RU[lvl]}»
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((t) => {
              const passed = isTestPassed(progress, lvl, t.test);
              const best = bestScore(progress, lvl, t.test);
              const cdMs = cooldownLeftMs(progress.cooldowns, lvl, t.test);
              return (
                <Link
                  key={t.slug}
                  href={`/tests/${t.slug}/take`}
                  className={`flex items-center justify-between gap-3 rounded-[var(--radius-tl)] border p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-tl-sm)] ${
                    passed ? "border-teal/50 bg-teal/5" : "border-line bg-card"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[0.95rem] font-semibold text-heading">{t.name}</span>
                    <span className="num text-xs text-muted">
                      {passed
                        ? `сдан${best != null ? ` · лучший ${best}/10` : ""}`
                        : cdMs > 0
                        ? `⏱ пересдача через ${formatCooldown(cdMs)}`
                        : best != null
                        ? `лучший ${best}/10 — ещё заход?`
                        : "не начат"}
                    </span>
                  </span>
                  <span className={`num shrink-0 text-sm font-bold ${passed ? "text-teal-600" : "text-muted"}`}>
                    {passed ? "✓" : "→"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* бейджи — ачивки, как в Mini App */}
      {badges && badges.length > 0 && (
        <div className="mt-5">
          <p className="num text-xs font-bold uppercase tracking-wider text-muted">Знаки</p>
          {/* крупнее: пилюли читались как мелочь (Адиль 18.07) */}
          <div className="mt-3 flex flex-wrap gap-3">
            {badges.map((b) => (
              <span
                key={b.id}
                title={b.description}
                className={`flex items-center gap-3 rounded-full border px-5 py-2.5 ${
                  b.earned ? "border-teal/50 bg-teal/8 text-heading" : "border-line text-muted opacity-60"
                }`}
              >
                <span aria-hidden="true" className="text-2xl leading-none">{b.emoji}</span>
                <span className="text-base font-semibold">{b.name}</span>
                {b.value && <span className="num text-sm text-muted">{b.value}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* общий вывод TEREN-AI по накопленной статистике (тот же бэк, что Mini App) */}
      {aiSummary && (
        <div className="mt-5 rounded-[var(--radius-tl)] border-l-2 border-teal bg-subtle p-5">
          <p className="num text-[0.68rem] font-bold uppercase tracking-wider text-teal-600">
            TEREN-AI · твой портрет по статистике
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-body">{aiSummary}</p>
        </div>
      )}

      {/* последний разбор TEREN-AI — как в кабинете Mini App */}
      {reco?.text && (
        <div className="mt-5 rounded-[var(--radius-tl)] border-l-2 border-teal bg-subtle p-5">
          <p className="num text-[0.68rem] font-bold uppercase tracking-wider text-teal-600">
            Разбор TEREN-AI · {LEVEL_RU[reco.level] ?? reco.level}
            {reco.created_at ? ` · ${new Date(reco.created_at).toLocaleDateString("ru-RU")}` : ""}
          </p>
          <p className={`mt-2 whitespace-pre-line text-sm leading-relaxed text-body ${recoOpen ? "" : "line-clamp-4"}`}>
            {reco.text}
          </p>
          {reco.text.length > 220 && (
            <button
              onClick={() => setRecoOpen((v) => !v)}
              className="mt-2 text-xs font-semibold text-teal-600 hover:text-teal"
            >
              {recoOpen ? "Свернуть" : "Читать целиком →"}
            </button>
          )}
        </div>
      )}

      {/* личная статистика — полноценный блок, не серая строчка (Адиль 18.07) */}
      {stats && stats.attempts > 0 && (
        <div className="mt-5">
          <p className="num text-xs font-bold uppercase tracking-wider text-muted">Моя статистика</p>
          {/* плашки по содержимому, цифры крупные (Адиль 18.07: «шрифт больше или уже») */}
          <div className="mt-3 flex flex-wrap gap-3">
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
        <button onClick={() => oceanSignOut()} className="text-muted hover:text-heading">
          Выйти из Океана
        </button>
      </div>
    </section>
  );
}

// компактная плашка статистики: ширина по цифре, цифра — главная
function StatCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-[9.5rem] rounded-[var(--radius-tl)] border border-line bg-card px-5 py-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="num mt-1 text-4xl font-semibold text-heading">
        {value}
        {sub && <span className="ml-1.5 text-sm font-normal text-muted">{sub}</span>}
      </div>
    </div>
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
