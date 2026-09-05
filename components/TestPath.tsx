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

// раскладка: ширина сцены и амплитуда кривой; узел = слот высоты NODE_H, ворота = GATE_H
const W = 640;
const NODE_H = 132;
const GATE_H = 200;
const AMPL = [0, 140, 200, 140, 0, -140, -200, -140]; // синус по 8 шагам

type Item =
  | { kind: "gate"; y: number; x: number; stage: Stage; index: number }
  | { kind: "node"; y: number; x: number; node: Node; stage: Stage; i: number }
  | { kind: "final"; y: number; x: number };

function layout(): { items: Item[]; height: number } {
  const items: Item[] = [];
  let y = 0;
  let k = 0; // шаг синуса сквозной, чтобы кривая была непрерывной
  STAGES.forEach((s, si) => {
    items.push({ kind: "gate", y: y + GATE_H / 2, x: 0, stage: s, index: si });
    y += GATE_H;
    s.nodes.forEach((n, i) => {
      k += 1;
      items.push({ kind: "node", y: y + NODE_H / 2, x: AMPL[k % AMPL.length], node: n, stage: s, i });
      y += NODE_H;
    });
    // перед воротами возвращаемся к центру плавно: пропускаем шаг, чтобы не было резкого угла
    while (AMPL[(k + 1) % AMPL.length] !== 0 && k % AMPL.length !== 0) k += 1;
  });
  items.push({ kind: "final", y: y + GATE_H / 2, x: 0 });
  y += GATE_H + 40;
  return { items, height: y };
}

function curve(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1], p1 = points[i];
    const cy = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${cy}, ${p1.x} ${cy}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export function TestPath() {
  const [progress, setProgress] = useState<OceanProgress | null>(null);
  const [local, setLocal] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1); // сжатие амплитуды на узких экранах

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setLocal(new Set(getAttempts().filter((a) => a.passed).map((a) => a.slug)));
    fetchOceanProgress().then((p) => { setProgress(p); setReady(true); });
  }, []);

  const { items, height } = useMemo(layout, []);
  const passed = (n: Node) => (n.level === "mollusk" ? local.has(n.slug) : isTestPassed(progress, n.level, n.test) || local.has(n.slug));
  const unlocked = (s: Stage) => (s.level === "mollusk" ? true : isLevelUnlocked(progress, s.level));

  const nodesFlat = items.filter((it): it is Extract<Item, { kind: "node" }> => it.kind === "node");
  const hereSlug = (() => {
    for (const s of STAGES) {
      if (!unlocked(s)) break;
      for (const n of s.nodes) if (!passed(n)) return n.slug;
    }
    return null;
  })();
  const doneCount = nodesFlat.filter((it) => passed(it.node)).length;
  const total = nodesFlat.length;

  // кривая: точки через все ворота и узлы; пройденная часть до последнего сданного узла
  const sw = Math.round(W * scale);
  const px = (x: number) => sw / 2 + x * (scale < 1 ? scale * 0.8 : 1); // на узком экране амплитуда ещё уже, чтобы подписи не резались
  const pts = items.map((it) => ({ x: px(it.x), y: it.y }));
  const lastDone = Math.max(-1, ...items.map((it, idx) => (it.kind === "node" && passed(it.node) ? idx : -1)));
  const hereIdx = items.findIndex((it) => it.kind === "node" && it.node.slug === hereSlug);
  const doneUntil = hereIdx > 0 ? hereIdx : lastDone + 1;

  return (
    <div className="mx-auto max-w-[760px]">
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

      {/* сцена: линейка глубины слева, кривая, узлы; фон темнеет ко дну */}
      <div ref={stageRef} className="relative overflow-hidden rounded-[16px]" style={{ height, background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 12%, rgba(0,0,0,0.22) 60%, rgba(0,0,0,0.45) 100%)" }}>
        {/* линейка глубины */}
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[72px] border-r border-line/60 sm:block" aria-hidden="true">
          {items.filter((it) => it.kind === "gate").map((it) => it.kind === "gate" && (
            <div key={it.stage.level} className="absolute right-3 num text-[11px] text-faint" style={{ top: it.y - 7 }}>{it.stage.depth}</div>
          ))}
          <div className="absolute right-3 num text-[11px] text-faint" style={{ top: height - GATE_H / 2 - 47 }}>1 000 м</div>
        </div>

        <div className="relative mx-auto" style={{ width: sw, height }}>
          {/* кривая */}
          <svg className="pointer-events-none absolute inset-0" width={sw} height={height} viewBox={`0 0 ${sw} ${height}`} aria-hidden="true">
            <path d={curve(pts)} fill="none" stroke="var(--color-line-2)" strokeWidth={2} strokeDasharray="4 8" strokeLinecap="round" />
            {doneUntil > 0 && (
              <path d={curve(pts.slice(0, doneUntil + 1))} fill="none" stroke="var(--color-accent-600)" strokeWidth={3} strokeLinecap="round" />
            )}
          </svg>

          {items.map((it) => {
            const cx = px(it.x);
            if (it.kind === "gate") {
              const open = unlocked(it.stage);
              const done = it.stage.nodes.filter(passed).length;
              return (
                <div key={`g-${it.stage.level}`} className="absolute flex w-[240px] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center sm:w-[260px]" style={{ left: cx, top: it.y }}>
                  <div className={`relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-page ${open ? "shadow-[0_0_0_1px_var(--color-line-2),0_0_60px_rgba(39,131,222,0.18)]" : "shadow-[0_0_0_1px_var(--color-line)]"}`}>
                    <RankSketch rank={it.stage.key} size={56} className={open ? "text-ink" : "text-faint"} />
                    {!open && (
                      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-page text-faint shadow-[0_0_0_1px_var(--color-line)]">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="7" width="9" height="6.5" rx="1.2" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
                      </span>
                    )}
                  </div>
                  <div className={`mt-2 text-[16px] font-semibold ${open ? "text-ink" : "text-faint"}`}>{it.stage.name}</div>
                  <div className="text-[12px] text-text-2">{it.stage.meaning}</div>
                  <div className="num mt-0.5 text-[11px] text-faint">{open ? `${done} из ${it.stage.nodes.length}` : `откроется после уровня «${STAGES[it.index - 1]?.name}»`}</div>
                </div>
              );
            }
            if (it.kind === "final") {
              const open = isLevelUnlocked(progress, "whale");
              return (
                <div key="final" className="absolute flex w-[260px] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: cx, top: it.y }}>
                  <div className={`flex h-[96px] w-[96px] items-center justify-center rounded-full bg-page ${open ? "shadow-[0_0_0_1px_var(--color-accent),0_0_80px_rgba(39,131,222,0.25)]" : "shadow-[0_0_0_1px_var(--color-line)]"}`}>
                    <RankSketch rank="kit" size={64} className={open ? "text-ink" : "text-faint"} />
                  </div>
                  <div className={`mt-2 text-[16px] font-semibold ${open ? "text-ink" : "text-faint"}`}>Кит</div>
                  <div className="text-[12px] text-text-2">финал трека «От идеи до инвестиций»</div>
                </div>
              );
            }
            const { node: n, stage: s } = it;
            const open = unlocked(s);
            const done = passed(n);
            const here = n.slug === hereSlug;
            const avail = open && !done;
            const cd = progress ? cooldownLeftMs(progress.cooldowns, n.level, n.test) : 0;
            const size = s.level === "shark" ? 56 : 64;
            const body = (
              <>
                {here && (
                  <span className="path-bounce absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-orange px-2.5 py-1 text-[11px] font-semibold text-[#1a1a1a]">
                    {cd > 0 ? `через ${formatCooldown(cd)}` : "Начать"}
                    <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-orange" />
                  </span>
                )}
                <span
                  className={`flex items-center justify-center rounded-full transition-transform group-hover:scale-[1.05] ${
                    done ? "bg-accent-600 text-[#fff] shadow-[0_6px_0_#1a5ea6]"
                    : here ? "bg-page text-orange shadow-[0_0_0_2px_var(--color-orange),0_0_36px_rgba(240,135,58,0.35)]"
                    : avail ? "bg-[#262626] text-ink shadow-[0_0_0_1px_var(--color-line-2),0_5px_0_#141414]"
                    : "bg-page text-faint shadow-[0_0_0_1px_var(--color-line)]"
                  }`}
                  style={{ width: size, height: size }}
                >
                  {done ? (
                    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                  ) : here ? (
                    <span className="h-3.5 w-3.5 rounded-full bg-orange" />
                  ) : avail ? (
                    <span className="num text-[15px] font-semibold">{it.i + 1}</span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3.5" y="7" width="9" height="6.5" rx="1.2" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
                  )}
                </span>
                <span className={`mt-2 block w-[130px] text-center text-[13px] font-medium leading-snug sm:w-[170px] ${done || avail ? "text-ink" : "text-faint"}`}>{n.title}</span>
                <span className="block w-[130px] text-center text-[11px] leading-snug text-faint sm:w-[170px]">{n.sub}</span>
              </>
            );
            const cls = "group absolute flex -translate-x-1/2 -translate-y-[38px] flex-col items-center";
            return open ? (
              <Link key={n.slug} href={`/tests/${n.slug}/take`} className={cls} style={{ left: cx, top: it.y }} aria-current={here ? "step" : undefined}>{body}</Link>
            ) : (
              <div key={n.slug} className={`${cls} cursor-default`} style={{ left: cx, top: it.y }} aria-disabled="true">{body}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
