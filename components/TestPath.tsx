"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RankSketch } from "@/components/RankSketch";
import type { LevelKey } from "@/lib/content";
import { getAttempts } from "@/lib/memory";
import { fetchOceanProgress, isTestPassed, isLevelUnlocked, cooldownLeftMs, formatCooldown, type OceanProgress } from "@/lib/ocean";
import { DOLPHIN_CASES, SHARK_CASES } from "@/lib/ocean-tests";

// Путь тестов: вертикальный ствол погружения, на нём уровни. У каждого уровня своя
// полоса: слева обитатель и глубина, справа его тесты плитками. Уровни отделены друг
// от друга и подписаны, поэтому длинная змейка больше не нужна.

type Node = { slug: string; title: string; sub: string; level: string; test: string; soon?: boolean };
type Stage = {
  level: string; key: LevelKey; name: string; depth: string;
  meaning: string; rule: string; unlock?: string; nodes: Node[];
};

const STAGES: Stage[] = [
  {
    level: "mollusk", key: "rakushka", name: "Ракушка", depth: "0 м",
    meaning: "Разминка на берегу: проверить себя до того, как считать деньги.",
    rule: "Не входит в ранг. Результат хранится на этом устройстве.",
    nodes: [
      { slug: "t1-a04", title: "Альтернативная стоимость времени", sub: "42 вопроса", level: "mollusk", test: "a04" },
      { slug: "t1-risks", title: "Риски ниши", sub: "12 вопросов", level: "mollusk", test: "risks" },
      { slug: "t1-synthesis", title: "Итоговый разбор", sub: "12 вопросов", level: "mollusk", test: "synthesis" },
    ],
  },
  {
    level: "crab", key: "krab", name: "Краб", depth: "10 м",
    meaning: "База: понимаешь термины и умеешь считать.",
    rule: "3 теста по 10 вопросов. Порог 7 из 10, у последнего 6.",
    unlock: "Открыт всем сразу. С него начинается ранг.",
    nodes: [
      { slug: "crab-t1", title: "Теория", sub: "10 вопросов · порог 7", level: "crab", test: "t1" },
      { slug: "crab-t2", title: "Расчёты", sub: "10 вопросов · порог 7", level: "crab", test: "t2" },
      { slug: "crab-t3", title: "Универсальный", sub: "10 вопросов · порог 6", level: "crab", test: "t3" },
    ],
  },
  {
    level: "barracuda", key: "barrakuda", name: "Барракуда", depth: "50 м",
    meaning: "Пять дисциплин: деньги, спрос, люди, закон и всё вместе.",
    rule: "5 тестов по 10 вопросов. Порог 7 из 10 в каждом.",
    unlock: "Откроется, когда сданы все три теста Краба",
    nodes: [
      { slug: "barracuda-fin", title: "Финансы", sub: "10 вопросов · порог 7", level: "barracuda", test: "fin" },
      { slug: "barracuda-mkt", title: "Маркетинг", sub: "10 вопросов · порог 7", level: "barracuda", test: "mkt" },
      { slug: "barracuda-mgmt", title: "Менеджмент", sub: "10 вопросов · порог 7", level: "barracuda", test: "mgmt" },
      { slug: "barracuda-law", title: "Право", sub: "10 вопросов · порог 7", level: "barracuda", test: "law" },
      { slug: "barracuda-universal", title: "Универсальный", sub: "10 вопросов · порог 7", level: "barracuda", test: "universal" },
    ],
  },
  {
    level: "dolphin", key: "delfin", name: "Дельфин", depth: "120 м",
    meaning: "Тут заканчиваются варианты ответов. Решение объясняешь словами.",
    rule: "3 открытых кейса по 5 вопросов. Ответ разбирает TEREN-AI.",
    unlock: "Откроется, когда сданы все пять тестов Барракуды",
    nodes: DOLPHIN_CASES.map((c) => ({
      slug: `dolphin-${c.id}`, title: c.name, sub: "открытый кейс · 5 вопросов", level: "dolphin", test: c.id,
    })),
  },
  {
    level: "shark", key: "akula", name: "Акула", depth: "300 м",
    meaning: "12 живых бизнесов. Каждый разбираешь по шагам, от идеи до вывода.",
    rule: "Кейс из 10 вопросов по порядку, вернуться назад нельзя.",
    unlock: "Откроется, когда сданы все три кейса Дельфина",
    nodes: SHARK_CASES.map((c) => ({
      slug: `shark-${c.id}`, title: c.name, sub: "кейс · 10 вопросов", level: "shark", test: c.id,
    })),
  },
];

const HOW = [
  "Пять уровней подряд. Следующий открывается, когда предыдущий сдан целиком.",
  "Закрытые тесты: 10 вопросов, вопросы каждый раз новые. Балл считает сервер, правильных ответов в браузере нет.",
  "Открытые кейсы Дельфина и Акулы: отвечаешь своими словами, проверяет TEREN-AI по рубрике.",
  "Не сдал — пересдача через несколько часов. Сданное сразу идёт в ранг и в рейтинг.",
];

const LockIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
  </svg>
);

export function TestPath() {
  const [progress, setProgress] = useState<OceanProgress | null>(null);
  const [local, setLocal] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocal(new Set(getAttempts().filter((a) => a.passed).map((a) => a.slug)));
    fetchOceanProgress().then((p) => { setProgress(p); setReady(true); });
  }, []);

  const passed = (n: Node) =>
    n.level === "mollusk" ? local.has(n.slug) : isTestPassed(progress, n.level, n.test) || local.has(n.slug);
  const unlocked = (s: Stage) => (s.level === "mollusk" ? true : isLevelUnlocked(progress, s.level));

  const hereSlug = (() => {
    for (const s of STAGES) {
      if (!unlocked(s)) break;
      for (const n of s.nodes) if (!passed(n) && !n.soon) return n.slug;
    }
    return null;
  })();

  const real = STAGES.flatMap((s) => s.nodes).filter((n) => !n.soon);
  const doneCount = real.filter(passed).length;
  const whaleOpen = isLevelUnlocked(progress, "whale");

  return (
    <div>
      {/* как устроен путь + общий прогресс */}
      <div className="panel panel-split mb-10 grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="p-6 sm:p-8">
          <p className="section-label">Как устроен путь</p>
          <ul className="mt-4 grid gap-2.5">
            {HOW.map((t, i) => (
              <li key={t} className="flex gap-3 text-[14px] leading-relaxed text-text-2">
                <span className="num mt-[2px] w-4 shrink-0 text-[12px] text-faint">{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel-half flex flex-col justify-center gap-4 p-6 sm:p-8">
          <div>
            <div className="text-[12px] text-faint">пройдено тестов</div>
            <div className="num text-[28px] font-semibold leading-tight text-ink">
              {doneCount}<span className="text-[15px] font-normal text-text-2"> из {real.length}</span>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-accent-600 transition-[width] duration-700" style={{ width: `${(doneCount / real.length) * 100}%` }} />
          </div>
          {!ready ? (
            <div className="h-[18px]" />
          ) : progress ? (
            <div className="text-[13px] text-text-2">Считается в Океане, ранг обновляется сразу.</div>
          ) : (
            <Link href="/auth/sign-in" className="link text-[13px]">Войти, чтобы результат шёл в ранг</Link>
          )}
        </div>
      </div>

      {/* ствол погружения: уровни полосами */}
      <div className="grid gap-0">
        {STAGES.map((s, si) => {
          const open = unlocked(s);
          const done = s.nodes.filter((n) => !n.soon).filter(passed).length;
          const totalReal = s.nodes.filter((n) => !n.soon).length;
          const levelDone = done === totalReal;

          return (
            <section key={s.level} className="relative pl-[76px] sm:pl-[104px]">
              {/* сегмент ствола */}
              <span
                aria-hidden="true"
                className={`absolute left-[31px] top-0 h-full w-px sm:left-[45px] ${levelDone ? "bg-accent-600" : "bg-line-2/60"}`}
                style={{ backgroundImage: levelDone ? undefined : "repeating-linear-gradient(to bottom, currentColor 0 4px, transparent 4px 12px)", color: "var(--color-line-2)" }}
              />
              {/* обитатель на стволе */}
              <span
                className={`absolute left-0 top-6 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-page sm:h-[90px] sm:w-[90px] ${
                  open ? "shadow-[0_0_0_1px_var(--color-line-2),0_0_60px_rgba(39,131,222,0.16)]" : "shadow-[0_0_0_1px_var(--color-line)]"
                }`}
              >
                <RankSketch rank={s.key} size={44} className={`sm:hidden ${open ? "text-ink" : "text-faint"}`} />
                <RankSketch rank={s.key} size={62} className={`hidden sm:block ${open ? "text-ink" : "text-faint"}`} />
                {!open && (
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-page text-faint shadow-[0_0_0_1px_var(--color-line)]">
                    <LockIcon size={12} />
                  </span>
                )}
              </span>

              <div className="pb-12 pt-6">
                {/* шапка уровня */}
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className={`text-[20px] sm:text-[22px] ${open ? "text-ink" : "text-faint"}`}>{s.name}</h2>
                  <span className="num text-[12px] text-faint">{s.depth}</span>
                  <span className="ml-auto num text-[13px] text-text-2">{done} из {totalReal}</span>
                </div>
                <p className="mt-1.5 max-w-[62ch] text-[14.5px] leading-relaxed text-text-2">{s.meaning}</p>
                <p className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-faint">
                  {open ? s.rule : s.unlock}
                </p>

                {/* тесты уровня */}
                <div className="mt-6 flex flex-wrap gap-x-4 gap-y-7">
                  {s.nodes.map((n, i) => {
                    const isDone = passed(n);
                    const here = n.slug === hereSlug;
                    const avail = open && !isDone && !n.soon;
                    const cd = progress ? cooldownLeftMs(progress.cooldowns, n.level, n.test) : 0;
                    const body = (
                      <>
                        {here && (
                          <span className="path-bounce absolute top-0 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-orange px-2.5 py-1 text-[11px] font-semibold text-[#1a1a1a]">
                            {cd > 0 ? `через ${formatCooldown(cd)}` : "Начать"}
                            <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-orange" />
                          </span>
                        )}
                        <span
                          className={`flex h-[52px] w-[52px] items-center justify-center rounded-full transition-transform group-hover:scale-[1.06] ${
                            isDone ? "bg-accent-600 text-[#fff] shadow-[0_5px_0_#1a5ea6]"
                            : here ? "bg-page text-orange shadow-[0_0_0_2px_var(--color-orange),0_0_32px_rgba(240,135,58,0.32)]"
                            : n.soon ? "bg-page text-faint shadow-[0_0_0_1px_var(--color-line)] [mask-image:none]"
                            : avail ? "bg-[#262626] text-ink shadow-[0_0_0_1px_var(--color-line-2),0_4px_0_#141414]"
                            : "bg-page text-faint shadow-[0_0_0_1px_var(--color-line)]"
                          }`}
                        >
                          {isDone ? (
                            <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                          ) : here ? (
                            <span className="h-3 w-3 rounded-full bg-orange" />
                          ) : n.soon ? (
                            <span className="h-[3px] w-[14px] rounded-full bg-current opacity-60" />
                          ) : avail ? (
                            <span className="num text-[15px] font-semibold">{i + 1}</span>
                          ) : <LockIcon />}
                        </span>
                        <span className={`mt-2.5 block w-full text-[12.5px] font-medium leading-snug ${isDone || avail ? "text-ink" : "text-faint"}`}>{n.title}</span>
                        <span className="mt-0.5 block w-full text-[11px] leading-snug text-faint">{n.sub}</span>
                      </>
                    );
                    const cls = "group relative flex w-[124px] flex-col items-center pt-10 text-center";
                    return avail || isDone ? (
                      <Link key={n.slug} href={`/tests/${n.slug}/take`} className={cls} aria-current={here ? "step" : undefined}>{body}</Link>
                    ) : (
                      <div key={n.slug} className={`${cls} cursor-default`} aria-disabled="true">{body}</div>
                    );
                  })}
                </div>
              </div>

            </section>
          );
        })}

        {/* финал */}
        <section className="relative pl-[76px] sm:pl-[104px]">
          <span
            aria-hidden="true"
            className="absolute left-[31px] top-0 h-[31px] w-px sm:left-[45px] sm:h-[45px]"
            style={{ backgroundImage: "repeating-linear-gradient(to bottom, var(--color-line-2) 0 4px, transparent 4px 12px)" }}
          />
          <span
            className={`absolute left-0 top-0 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-page sm:h-[90px] sm:w-[90px] ${
              whaleOpen ? "shadow-[0_0_0_1px_var(--color-accent),0_0_80px_rgba(39,131,222,0.25)]" : "shadow-[0_0_0_1px_var(--color-line)]"
            }`}
          >
            <RankSketch rank="kit" size={44} className={`sm:hidden ${whaleOpen ? "text-ink" : "text-faint"}`} />
            <RankSketch rank="kit" size={64} className={`hidden sm:block ${whaleOpen ? "text-ink" : "text-faint"}`} />
          </span>
          <div className="pt-1 sm:pt-4">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h2 className={`text-[20px] sm:text-[22px] ${whaleOpen ? "text-ink" : "text-faint"}`}>Кит</h2>
              <span className="num text-[12px] text-faint">1 000 м</span>
            </div>
            <p className="mt-1.5 max-w-[62ch] text-[14.5px] leading-relaxed text-text-2">
              Последний уровень: проект на рост, финмодель, питч и разговор с инвестором.
            </p>
            <p className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-faint">
              Открывается после Акулы. Готовится вместе с треком «От идеи до инвестиций».
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
