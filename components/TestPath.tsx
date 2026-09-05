"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { RankSketch } from "@/components/RankSketch";
import type { LevelKey } from "@/lib/content";
import { getAttempts } from "@/lib/memory";
import { fetchOceanProgress, isTestPassed, isLevelUnlocked, cooldownLeftMs, formatCooldown, type OceanProgress } from "@/lib/ocean";
import { DOLPHIN_CASES, SHARK_CASES } from "@/lib/ocean-tests";

// Тропа тестов как погружение: узлы лежат на плавной кривой (синус), между уровнями
// ворота с обитателем, слева линейка глубины, фон темнеет ко дну. Подписи под узлами,
// кривая проходит через центры узлов и не пересекает текст. Пройденный отрезок кривой
// синий, впереди пунктир. Прогресс: Океан после входа, иначе память устройства.

type Node = { slug: string; title: string; sub: string; level: string; test: string };
type Stage = { level: string; key: LevelKey; name: string; depth: string; meaning: string; nodes: Node[] };

const STAGES: Stage[] = [
  { level: "mollusk", key: "rakushka", name: "Ракушка", depth: "0 м", meaning: "Разминка на берегу", nodes: [
    { slug: "t1-a04", title: "Альтернативная стоимость времени", sub: "10 вопросов", level: "mollusk", test: "a04" },
    { slug: "t1-risks", title: "Риски ниши", sub: "10 вопросов", level: "mollusk", test: "risks" },
    { slug: "t1-synthesis", title: "Итоговый разбор", sub: "10 вопросов", level: "mollusk", test: "synthesis" },
  ] },
  { level: "crab", key: "krab", name: "Краб", depth: "10 м", meaning: "База: теория и счёт", nodes: [
    { slug: "crab-t1", title: "Теория", sub: "10 вопросов · порог 7", level: "crab", test: "t1" },
    { slug: "crab-t2", title: "Расчёты", sub: "10 вопросов · порог 7", level: "crab", test: "t2" },
    { slug: "crab-t3", title: "Универсальный", sub: "10 вопросов · порог 6", level: "crab", test: "t3" },
  ] },
  { level: "barracuda", key: "barrakuda", name: "Барракуда", depth: "50 м", meaning: "Пять дисциплин", nodes: [
    { slug: "barracuda-fin", title: "Финансы", sub: "10 вопросов · порог 7", level: "barracuda", test: "fin" },
    { slug: "barracuda-mkt", title: "Маркетинг", sub: "10 вопросов · порог 7", level: "barracuda", test: "mkt" },
    { slug: "barracuda-mgmt", title: "Менеджмент", sub: "10 вопросов · порог 7", level: "barracuda", test: "mgmt" },
    { slug: "barracuda-law", title: "Право", sub: "10 вопросов · порог 7", level: "barracuda", test: "law" },
    { slug: "barracuda-universal", title: "Универсальный", sub: "10 вопросов · порог 7", level: "barracuda", test: "universal" },
  ] },
  { level: "dolphin", key: "delfin", name: "Дельфин", depth: "120 м", meaning: "Открытые кейсы, проверяет TEREN-AI", nodes: DOLPHIN_CASES.map((c) => ({
    slug: `dolphin-${c.id}`, title: c.name, sub: "открытый кейс · 5 вопросов", level: "dolphin", test: c.id,
  })) },
  { level: "shark", key: "akula", name: "Акула", depth: "300 м", meaning: "12 бизнесов, разбор по шагам", nodes: SHARK_CASES.map((c) => ({
    slug: `shark-${c.id}`, title: c.name, sub: "кейс · 10 вопросов", level: "shark", test: c.id,
  })) },
];

// раскладка: змейка на всю ширину. Ячейки (ворота уровня, тесты, финал) идут слева направо,
// следующий ряд справа налево, кривая делает разворот у края. Число колонок от ширины.
const ROW_H = 200;
const NODE_Y = 84; // центр узла от верха ряда: сверху место под ярлык «Начать»

type Cell =
  | { kind: "gate"; stage: Stage; index: number }
  | { kind: "node"; node: Node; stage: Stage; i: number }
  | { kind: "final" };

const CELLS: Cell[] = (() => {
  const out: Cell[] = [];
  STAGES.forEach((s, si) => {
    out.push({ kind: "gate", stage: s, index: si });
    s.nodes.forEach((n, i) => out.push({ kind: "node", node: n, stage: s, i }));
  });
  out.push({ kind: "final" });
  return out;
})();

const WAVE = 18; // лёгкая волна внутри ряда: соседние узлы чуть выше и ниже друг друга

function place(i: number, cols: number, cellW: number) {
  const row = Math.floor(i / cols);
  let col = i % cols;
  if (row % 2 === 1) col = cols - 1 - col;
  const wave = Math.sin((col / Math.max(1, cols - 1)) * Math.PI * 2) * WAVE;
  return { x: (col + 0.5) * cellW, y: row * ROW_H + NODE_Y + wave, row };
}

function snake(pts: { x: number; y: number; row: number }[], cellW: number): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if (a.row === b.row) {
      const mx = (a.x + b.x) / 2;
      d += ` C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
      continue;
    }
    // разворот у края: дуга наружу
    const dir = a.row % 2 === 0 ? 1 : -1;
    const bulge = Math.min(cellW * 0.55, cellW / 2 - 12) * dir; // дуга не выходит за край сцены
    d += ` C ${a.x + bulge} ${a.y}, ${b.x + bulge} ${b.y}, ${b.x} ${b.y}`;
  }
  return d;
}

export function TestPath() {
  const [progress, setProgress] = useState<OceanProgress | null>(null);
  const [local, setLocal] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(960);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setLocal(new Set(getAttempts().filter((a) => a.passed).map((a) => a.slug)));
    fetchOceanProgress().then((p) => { setProgress(p); setReady(true); });
  }, []);

  const cols = Math.max(2, Math.min(6, Math.floor(width / 190)));
  const cellW = width / cols;
  const rows = Math.ceil(CELLS.length / cols);
  const height = rows * ROW_H + 8;
  const pts = useMemo(() => CELLS.map((_, i) => place(i, cols, cellW)), [cols, cellW]);

  const passed = (n: Node) => (n.level === "mollusk" ? local.has(n.slug) : isTestPassed(progress, n.level, n.test) || local.has(n.slug));
  const unlocked = (s: Stage) => (s.level === "mollusk" ? true : isLevelUnlocked(progress, s.level));

  const hereSlug = (() => {
    for (const s of STAGES) {
      if (!unlocked(s)) break;
      for (const n of s.nodes) if (!passed(n)) return n.slug;
    }
    return null;
  })();
  const total = CELLS.filter((c) => c.kind === "node").length;
  const doneCount = CELLS.filter((c) => c.kind === "node" && passed(c.node)).length;

  // пройденная часть змейки: до текущего узла, а если всё сдано, до последнего сданного
  const lastDone = Math.max(-1, ...CELLS.map((c, idx) => (c.kind === "node" && passed(c.node) ? idx : -1)));
  const hereIdx = CELLS.findIndex((c) => c.kind === "node" && c.node.slug === hereSlug);
  const doneUntil = hereIdx > 0 ? hereIdx : lastDone + 1;

  return (
    <div>
      {/* сводка */}
      <div className="panel mb-6 flex items-center gap-6 px-6 py-4">
        <div className="shrink-0">
          <div className="text-[12px] text-faint">пройдено</div>
          <div className="num text-[20px] font-semibold leading-tight text-ink">
            {doneCount}<span className="text-[13px] font-normal text-text-2"> из {total}</span>
          </div>
        </div>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent-600 transition-[width] duration-700" style={{ width: `${(doneCount / total) * 100}%` }} />
        </div>
        {!ready ? null : progress ? (
          <span className="shrink-0 text-[12px] text-faint">из Океана</span>
        ) : (
          <Link href="/auth/sign-in" className="link shrink-0 text-[13px]">Войти, чтобы засчитать</Link>
        )}
      </div>

      {/* сцена: змейка на всю ширину, фон темнеет ко дну */}
      <div
        ref={stageRef}
        className="relative overflow-hidden rounded-[16px]"
        style={{ height, background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 15%, rgba(0,0,0,0.22) 60%, rgba(0,0,0,0.45) 100%)" }}
      >
        <svg className="pointer-events-none absolute inset-0" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          <path d={snake(pts, cellW)} fill="none" stroke="var(--color-line-2)" strokeWidth={2} strokeDasharray="4 8" strokeLinecap="round" />
          {doneUntil > 0 && (
            <path d={snake(pts.slice(0, doneUntil + 1), cellW)} fill="none" stroke="var(--color-accent-600)" strokeWidth={3} strokeLinecap="round" />
          )}
        </svg>

        {CELLS.map((c, idx) => {
          const { x, y } = pts[idx];
          const box = { left: x - cellW / 2, top: y - NODE_Y, width: cellW, height: ROW_H - WAVE };
          const lockIcon = (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3.5" y="7" width="9" height="6.5" rx="1.2" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
          );

          if (c.kind === "gate" || c.kind === "final") {
            const stage = c.kind === "gate" ? c.stage : null;
            const open = stage ? unlocked(stage) : isLevelUnlocked(progress, "whale");
            const done = stage ? stage.nodes.filter(passed).length : 0;
            const key = stage ? stage.key : "kit";
            const name = stage ? stage.name : "Кит";
            const meaning = stage ? stage.meaning : "финал трека «От идеи до инвестиций»";
            const depth = stage ? stage.depth : "1 000 м";
            return (
              <div key={`g-${key}`} className="absolute flex flex-col items-center px-2 text-center" style={{ ...box, paddingTop: NODE_Y - 44 }}>
                <div className={`relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-page ${open ? "shadow-[0_0_0_1px_var(--color-line-2),0_0_60px_rgba(39,131,222,0.18)]" : "shadow-[0_0_0_1px_var(--color-line)]"}`}>
                  <RankSketch rank={key} size={56} className={open ? "text-ink" : "text-faint"} />
                  <span className={`num absolute -top-1 -right-2 rounded-full bg-page px-1.5 py-0.5 text-[10px] shadow-[0_0_0_1px_var(--color-line)] ${open ? "text-text-2" : "text-faint"}`}>{depth}</span>
                  {!open && (
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-page text-faint shadow-[0_0_0_1px_var(--color-line)]">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="7" width="9" height="6.5" rx="1.2" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
                    </span>
                  )}
                </div>
                <div className={`mt-2 text-[15px] font-semibold leading-tight ${open ? "text-ink" : "text-faint"}`}>{name}</div>
                <div className="mt-0.5 text-[11.5px] leading-snug text-text-2">{meaning}</div>
                {stage && (
                  <div className="num mt-0.5 text-[11px] leading-snug text-faint">
                    {open ? `${done} из ${stage.nodes.length}` : `после уровня «${STAGES[(c.kind === "gate" ? c.index : 0) - 1]?.name}»`}
                  </div>
                )}
              </div>
            );
          }

          const { node: n, stage: s } = c;
          const open = unlocked(s);
          const done = passed(n);
          const here = n.slug === hereSlug;
          const avail = open && !done;
          const cd = progress ? cooldownLeftMs(progress.cooldowns, n.level, n.test) : 0;
          const body = (
            <>
              {here && (
                <span className="path-bounce absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-orange px-2.5 py-1 text-[11px] font-semibold text-[#1a1a1a]" style={{ top: NODE_Y - 32 - 36 }}>
                  {cd > 0 ? `через ${formatCooldown(cd)}` : "Начать"}
                  <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-orange" />
                </span>
              )}
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-[1.05] ${
                  done ? "bg-accent-600 text-[#fff] shadow-[0_6px_0_#1a5ea6]"
                  : here ? "bg-page text-orange shadow-[0_0_0_2px_var(--color-orange),0_0_36px_rgba(240,135,58,0.35)]"
                  : avail ? "bg-[#262626] text-ink shadow-[0_0_0_1px_var(--color-line-2),0_5px_0_#141414]"
                  : "bg-page text-faint shadow-[0_0_0_1px_var(--color-line)]"
                }`}
              >
                {done ? (
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                ) : here ? (
                  <span className="h-3.5 w-3.5 rounded-full bg-orange" />
                ) : avail ? (
                  <span className="num text-[15px] font-semibold">{c.i + 1}</span>
                ) : lockIcon}
              </span>
              <span className={`mt-2 block w-full text-center text-[13px] font-medium leading-snug ${done || avail ? "text-ink" : "text-faint"}`}>{n.title}</span>
              <span className="block w-full text-center text-[11px] leading-snug text-faint">{n.sub}</span>
            </>
          );
          const cls = "group absolute flex flex-col items-center px-2";
          const style = { ...box, paddingTop: NODE_Y - 32 };
          return open ? (
            <Link key={n.slug} href={`/tests/${n.slug}/take`} className={cls} style={style} aria-current={here ? "step" : undefined}>{body}</Link>
          ) : (
            <div key={n.slug} className={`${cls} cursor-default`} style={style} aria-disabled="true">{body}</div>
          );
        })}
      </div>
    </div>
  );
}
