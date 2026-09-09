"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Button, Arrow } from "./Button";
import { CASE_MARKETPLACE } from "@/lib/case";

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ");

type Log = { situation: string; choice: string; feedback: string; impact: number };

const BTN_PRIMARY =
  "btn-press inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-accent-600 px-4 text-[15px] font-medium text-[#fff] transition-colors hover:bg-[#1b6fc2] disabled:cursor-default disabled:opacity-50";

export function CaseTrainer() {
  const C = CASE_MARKETPLACE;
  const [nodeId, setNodeId] = useState(C.start);
  const [capital, setCapital] = useState(C.startCapital);
  const [log, setLog] = useState<Log[]>([]);
  const [lastFeedback, setLastFeedback] = useState<Log | null>(null);

  const node = C.nodes[nodeId];

  const choose = (optIndex: number) => {
    const opt = node.options![optIndex];
    const entry: Log = {
      situation: node.situation,
      choice: opt.label,
      feedback: opt.feedback,
      impact: opt.impact,
    };
    setCapital((c) => c + opt.impact);
    setLog((l) => [...l, entry]);
    setLastFeedback(entry);
    setNodeId(opt.next);
  };

  const restart = () => {
    setNodeId(C.start);
    setCapital(C.startCapital);
    setLog([]);
    setLastFeedback(null);
  };

  // ---- Финал ----
  if (node.ending) {
    const delta = capital - C.startCapital;
    const win = capital >= C.startCapital;
    return (
      <Container className="max-w-3xl py-14 sm:py-16">
        <p className="eyebrow">Итог кейса</p>
        <h1 className="mt-3 text-[32px] sm:text-[40px]">
          Капитал: <span className={`num ${win ? "text-ink" : "text-danger"}`}>{fmt(capital)} ₸</span>
        </h1>
        <p className={`num mt-2 text-[16px] font-medium ${win ? "text-accent" : "text-danger"}`}>
          {delta >= 0 ? "+" : "−"}{fmt(Math.abs(delta))} ₸ к старту
        </p>
        <div className="mt-6 rounded-[8px] bg-subtle p-5 text-[15px] leading-relaxed text-body">
          {win
            ? "Ты прошёл путь как взрослый: считал юнит-экономику до рекламы, заложил комиссии в цену, масштабировал измеримое. Так и должно быть — деньги любят расчёт."
            : "Ты потерял часть капитала. Типичная ошибка — реклама и масштаб до того, как сошлась юнит-экономика. Вернись и пройди по расчётному пути."}
        </div>

        {/* Разбор пути */}
        <h2 className="mt-7 sm:mt-12 text-[24px]">
          Разбор решений <span className="num ml-1 text-[14px] font-normal text-faint">{log.length}</span>
        </h2>
        <ol className="mt-5">
          {log.map((l, i) => (
            <li key={i} className="grid gap-2 border-t border-line py-5 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-4">
              <span className="num text-[13px] text-faint">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <div className="text-[14px] text-text-2">{l.situation}</div>
                <div className="mt-1.5 text-[16px] font-medium text-ink">{l.choice}</div>
                <div className="mt-2 flex items-start justify-between gap-4">
                  <span className="text-[14px] leading-relaxed text-text-2">{l.feedback}</span>
                  <span className={`num shrink-0 text-[14px] font-medium ${l.impact >= 0 ? "text-accent" : "text-danger"}`}>
                    {l.impact >= 0 ? "+" : "−"}{fmt(Math.abs(l.impact))} ₸
                  </span>
                </div>
              </div>
            </li>
          ))}
          <li className="border-t border-line" />
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button onClick={restart} className={BTN_PRIMARY}>
            Пройти заново
          </button>
          <Button href="/tests" variant="secondary">
            К тестам
          </Button>
        </div>
      </Container>
    );
  }

  // ---- Узел решения ----
  const step = log.length + 1;
  return (
    <Container className="max-w-3xl py-12 sm:py-14">
      <Link href="/catalog?type=case" className="text-[13px] text-faint transition-colors hover:text-ink">
        ← к кейсам
      </Link>

      <div className="mt-6 flex items-center justify-between gap-4 border-b border-line pb-4">
        <span className="num text-[13px] text-faint">Решение {step}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] text-faint">Капитал</span>
          <span className={`num text-[15px] font-medium ${capital >= C.startCapital ? "text-ink" : "text-danger"}`}>
            {fmt(capital)} ₸
          </span>
        </div>
      </div>

      {/* Фидбек предыдущего шага */}
      {lastFeedback && (
        <div className="mt-5 rounded-[8px] bg-subtle p-4 text-[15px] leading-relaxed text-body">
          <span className={`num font-medium ${lastFeedback.impact >= 0 ? "text-accent" : "text-danger"}`}>
            {lastFeedback.impact >= 0 ? "+" : "−"}{fmt(Math.abs(lastFeedback.impact))} ₸.{" "}
          </span>
          {lastFeedback.feedback}
        </div>
      )}

      <h1 className="mt-8 text-[20px] leading-snug sm:text-[20px]">{node.situation}</h1>

      <div className="mt-7 flex flex-col gap-2">
        {node.options!.map((o, i) => (
          <button
            key={i}
            onClick={() => choose(i)}
            className="btn-press group flex min-h-[44px] w-full items-start gap-3 rounded-[8px] border border-line px-4 py-3 text-left text-[15px] leading-relaxed text-ink transition-colors hover:border-line-2 hover:bg-subtle"
          >
            <span className="num mt-0.5 w-5 shrink-0 text-[13px] text-faint">{String.fromCharCode(65 + i)}</span>
            <span className="flex-1">{o.label}</span>
            <Arrow className="mt-1 text-faint transition-colors group-hover:text-accent" />
          </button>
        ))}
      </div>
    </Container>
  );
}
