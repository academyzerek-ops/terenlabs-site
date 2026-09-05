"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RankSketch } from "@/components/RankSketch";
import type { LevelKey } from "@/lib/content";
import { getAttempts } from "@/lib/memory";
import { fetchOceanProgress, isTestPassed, isLevelUnlocked, cooldownLeftMs, formatCooldown, type OceanProgress } from "@/lib/ocean";
import { OCEAN_TESTS, DOLPHIN_CASES, SHARK_CASES } from "@/lib/ocean-tests";

// Тропа тестов: одна дорога от Ракушки до Кита. Узлы идут змейкой вдоль вертикальной
// линии, уровни разделены «воротами» с эскизом обитателя. Пройденный узел синий с
// галочкой, следующий доступный оранжевый «ты здесь», закрытые серые пунктиром.
// Прогресс: с бэкенда Океана после входа, до входа из памяти устройства.

type Node = { slug: string; title: string; sub: string; level: string; test: string };
type Stage = { level: string; key: LevelKey; name: string; depth: string; meaning: string; nodes: Node[] };

const T1: Node[] = [
  { slug: "t1-a04", title: "Альтернативная стоимость времени", sub: "разминка · 10 вопросов", level: "mollusk", test: "a04" },
  { slug: "t1-risks", title: "Риски ниши", sub: "разминка · 10 вопросов", level: "mollusk", test: "risks" },
  { slug: "t1-synthesis", title: "Итоговый разбор", sub: "разминка · 10 вопросов", level: "mollusk", test: "synthesis" },
];

const STAGES: Stage[] = [
  { level: "mollusk", key: "rakushka", name: "Ракушка", depth: "0 м", meaning: "Старт", nodes: T1 },
  { level: "crab", key: "krab", name: "Краб", depth: "10 м", meaning: "Продвижение", nodes: [
    { slug: "crab-t1", title: "Теория", sub: "10 вопросов · порог 7", level: "crab", test: "t1" },
    { slug: "crab-t2", title: "Расчёты", sub: "10 вопросов · порог 7", level: "crab", test: "t2" },
    { slug: "crab-t3", title: "Универсальный", sub: "10 вопросов · порог 6", level: "crab", test: "t3" },
  ] },
  { level: "barracuda", key: "barrakuda", name: "Барракуда", depth: "50 м", meaning: "Ускорение", nodes: [
    { slug: "barracuda-fin", title: "Финансы", sub: "10 вопросов · порог 7", level: "barracuda", test: "fin" },
    { slug: "barracuda-mkt", title: "Маркетинг", sub: "10 вопросов · порог 7", level: "barracuda", test: "mkt" },
    { slug: "barracuda-mgmt", title: "Менеджмент", sub: "10 вопросов · порог 7", level: "barracuda", test: "mgmt" },
    { slug: "barracuda-law", title: "Право", sub: "10 вопросов · порог 7", level: "barracuda", test: "law" },
    { slug: "barracuda-universal", title: "Универсальный", sub: "10 вопросов · порог 7", level: "barracuda", test: "universal" },
  ] },
  { level: "dolphin", key: "delfin", name: "Дельфин", depth: "120 м", meaning: "Мастерство", nodes: DOLPHIN_CASES.map((c) => ({
    slug: `dolphin-${c.id}`, title: c.name, sub: "открытый кейс · 5 вопросов · проверяет TEREN-AI", level: "dolphin", test: c.id,
  })) },
  { level: "shark", key: "akula", name: "Акула", depth: "300 м", meaning: "Этапный партнёр", nodes: SHARK_CASES.map((c) => ({
    slug: `shark-${c.id}`, title: c.name, sub: "кейс · 10 вопросов по порядку", level: "shark", test: c.id,
  })) },
];

export function TestPath() {
  const [progress, setProgress] = useState<OceanProgress | null>(null);
  const [local, setLocal] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocal(new Set(getAttempts().filter((a) => a.passed).map((a) => a.slug)));
    fetchOceanProgress().then((p) => { setProgress(p); setReady(true); });
  }, []);

  const passed = (n: Node) => (n.level === "mollusk" ? local.has(n.slug) : isTestPassed(progress, n.level, n.test) || local.has(n.slug));
  const unlocked = (s: Stage) => (s.level === "mollusk" ? true : isLevelUnlocked(progress, s.level));

  // первый доступный непройденный узел = «ты здесь»
  const hereSlug = useMemo(() => {
    for (const s of STAGES) {
      if (!unlocked(s)) break;
      for (const n of s.nodes) if (!passed(n)) return n.slug;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, local]);

  const doneCount = STAGES.flatMap((s) => s.nodes).filter(passed).length;
  const total = STAGES.flatMap((s) => s.nodes).length;

  return (
    <div className="relative mx-auto max-w-[720px]">
      {/* итог сверху: сколько пройдено, где стоим */}
      <div className="panel mb-10 flex items-center justify-between gap-6 px-6 py-4">
        <div>
          <div className="text-[12px] text-faint">пройдено</div>
          <div className="num text-[20px] font-semibold leading-tight text-ink">
            {doneCount}<span className="text-[13px] font-normal text-text-2"> из {total}</span>
          </div>
        </div>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent-600 transition-[width] duration-500" style={{ width: `${(doneCount / total) * 100}%` }} />
        </div>
        {!ready ? null : progress ? (
          <span className="text-[12px] text-faint">прогресс из Океана</span>
        ) : (
          <Link href="/auth/sign-in" className="link text-[13px]">Войти, чтобы засчитать в ранг</Link>
        )}
      </div>

      {/* центральная нить */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 top-[88px] w-px -translate-x-1/2 bg-line" aria-hidden="true" />

      {STAGES.map((s, si) => {
        const open = unlocked(s);
        const stageDone = s.nodes.every(passed);
        return (
          <section key={s.level} className={`relative ${si > 0 ? "mt-6" : ""}`}>
            {/* ворота уровня */}
            <div className="relative z-10 mx-auto flex w-fit flex-col items-center py-4">
              <div className={`flex h-[72px] w-[72px] items-center justify-center rounded-full bg-page ring-1 ${stageDone ? "ring-accent" : open ? "ring-line-2" : "ring-line"}`}>
                <RankSketch rank={s.key} size={44} className={open ? "text-ink" : "text-faint"} />
              </div>
              <div className={`mt-2 text-[15px] font-semibold ${open ? "text-ink" : "text-faint"}`}>{s.name}</div>
              <div className="num text-[12px] text-faint">{s.meaning} · {s.depth}</div>
              {!open && (
                <div className="mt-1 flex items-center gap-1.5 text-[12px] text-faint">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3.5" y="7" width="9" height="6.5" rx="1.2" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
                  откроется после {STAGES[si - 1]?.name === "Ракушка" ? "разминки" : STAGES[si - 1]?.name.replace(/а$/, "ы").replace(/Краб$/, "Краба")}
                </div>
              )}
            </div>

            {/* узлы змейкой */}
            <ol className="relative flex flex-col gap-2">
              {s.nodes.map((n, i) => {
                const done = passed(n);
                const here = n.slug === hereSlug;
                const avail = open && !done;
                const left = i % 2 === 0;
                const cd = progress ? cooldownLeftMs(progress.cooldowns, n.level, n.test) : 0;
                const small = s.level === "shark";
                const circle = small ? "h-11 w-11" : "h-14 w-14";
                const inner = (
                  <>
                    <span
                      className={`relative flex shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-[1.04] ${circle} ${
                        done ? "bg-accent-600 text-[#fff]" : here ? "bg-page text-orange ring-2 ring-orange" : avail ? "bg-page text-ink ring-1 ring-line-2" : "bg-page text-faint ring-1 ring-line [ring-style:dashed]"
                      }`}
                      style={!done && !here && !avail ? { boxShadow: "none", outline: "1px dashed var(--color-line-2)", outlineOffset: -1 } : undefined}
                    >
                      {done ? (
                        <svg width={small ? 16 : 20} height={small ? 16 : 20} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                      ) : here ? (
                        <span className="h-3 w-3 rounded-full bg-orange" />
                      ) : (
                        <span className={`num ${small ? "text-[12px]" : "text-[13px]"} font-medium`}>{i + 1}</span>
                      )}
                    </span>
                    <span className={`min-w-0 ${left ? "text-left" : "text-right"}`}>
                      <span className={`block truncate text-[15px] font-medium ${done || avail ? "text-ink" : "text-faint"}`}>{n.title}</span>
                      <span className="block truncate text-[12px] text-faint">
                        {here ? "ты здесь · начать" : cd > 0 ? `пересдача через ${formatCooldown(cd)}` : n.sub}
                      </span>
                    </span>
                  </>
                );
                const cls = `group relative z-10 flex w-[calc(50%+40px)] items-center gap-4 rounded-[10px] px-3 py-2 transition-colors ${
                  left ? "mr-auto flex-row" : "ml-auto flex-row-reverse"
                } ${avail || done ? "hover:bg-subtle" : "cursor-default"}`;
                return (
                  <li key={n.slug} className="flex">
                    {open ? (
                      <Link href={`/tests/${n.slug}/take`} className={cls} aria-current={here ? "step" : undefined}>{inner}</Link>
                    ) : (
                      <div className={cls} aria-disabled="true">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      {/* финал */}
      <div className="relative z-10 mx-auto mt-6 flex w-fit flex-col items-center py-4 pb-10">
        <div className={`flex h-[72px] w-[72px] items-center justify-center rounded-full bg-page ring-1 ${isLevelUnlocked(progress, "whale") ? "ring-accent" : "ring-line"}`}>
          <RankSketch rank="kit" size={48} className={isLevelUnlocked(progress, "whale") ? "text-ink" : "text-faint"} />
        </div>
        <div className={`mt-2 text-[15px] font-semibold ${isLevelUnlocked(progress, "whale") ? "text-ink" : "text-faint"}`}>Кит</div>
        <div className="num text-[12px] text-faint">Вершина · 1 000 м</div>
        <div className="mt-1 text-[12px] text-faint">финал трека «От идеи до инвестиций»</div>
      </div>
    </div>
  );
}
