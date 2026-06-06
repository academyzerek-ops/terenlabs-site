"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Button } from "./Button";
import { CASE_MARKETPLACE } from "@/lib/case";

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ");

type Log = { situation: string; choice: string; feedback: string; impact: number };

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
      <Container className="max-w-3xl py-16">
        <p className="eyebrow">Итог кейса</p>
        <h1 className="mt-3 text-4xl text-heading">
          Капитал: <span className="num" style={{ color: win ? "var(--color-teal-600)" : "var(--color-danger)" }}>{fmt(capital)} ₸</span>
        </h1>
        <p className="mt-2 num text-lg" style={{ color: win ? "var(--color-teal-600)" : "var(--color-danger)" }}>
          {delta >= 0 ? "+" : "−"}{fmt(Math.abs(delta))} ₸ к старту
        </p>
        <div
          className="mt-6 rounded-[var(--radius-tl)] border-l-2 bg-subtle p-5 text-heading"
          style={{ borderColor: win ? "var(--color-teal)" : "var(--color-danger)" }}
        >
          {win
            ? "Ты прошёл путь как взрослый: считал юнит-экономику до рекламы, заложил комиссии в цену, масштабировал измеримое. Так и должно быть — деньги любят расчёт."
            : "Ты потерял часть капитала. Типичная ошибка — реклама и масштаб до того, как сошлась юнит-экономика. Вернись и пройди по расчётному пути."}
        </div>

        {/* Разбор пути */}
        <h2 className="mt-12 text-2xl text-heading">Разбор решений</h2>
        <div className="wave-divider my-5" />
        <ol className="space-y-4">
          {log.map((l, i) => (
            <li key={i} className="rounded-[var(--radius-tl)] border border-line bg-card p-5">
              <div className="text-sm text-muted">{l.situation}</div>
              <div className="mt-2 text-heading">→ {l.choice}</div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span className="text-sm text-muted">{l.feedback}</span>
                <span
                  className="num shrink-0 text-sm font-medium"
                  style={{ color: l.impact >= 0 ? "var(--color-teal-600)" : "var(--color-danger)" }}
                >
                  {l.impact >= 0 ? "+" : "−"}{fmt(Math.abs(l.impact))} ₸
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={restart}
            className="rounded-[var(--radius-tl)] bg-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-600"
          >
            Пройти заново
          </button>
          <Button href="/catalog?type=finmodel" variant="secondary">
            К финмоделям
          </Button>
        </div>
      </Container>
    );
  }

  // ---- Узел решения ----
  const step = log.length + 1;
  return (
    <Container className="max-w-3xl py-14">
      <Link href="/catalog?type=case" className="text-sm text-muted hover:text-teal">
        ← к кейсам
      </Link>

      <div className="mt-5 flex items-center justify-between">
        <span className="num text-sm text-muted">Решение {step}</span>
        <div className="rounded-full bg-subtle px-4 py-1.5">
          <span className="text-xs text-muted">Капитал: </span>
          <span
            className="num text-sm font-medium"
            style={{ color: capital >= C.startCapital ? "var(--color-heading)" : "var(--color-danger)" }}
          >
            {fmt(capital)} ₸
          </span>
        </div>
      </div>

      {/* Фидбек предыдущего шага */}
      {lastFeedback && (
        <div
          className="mt-5 rounded-[var(--radius-tl)] border-l-2 bg-subtle p-4 text-sm text-heading"
          style={{ borderColor: lastFeedback.impact >= 0 ? "var(--color-teal)" : "var(--color-danger)" }}
        >
          <span
            className="num font-medium"
            style={{ color: lastFeedback.impact >= 0 ? "var(--color-teal-600)" : "var(--color-danger)" }}
          >
            {lastFeedback.impact >= 0 ? "+" : "−"}{fmt(Math.abs(lastFeedback.impact))} ₸.{" "}
          </span>
          {lastFeedback.feedback}
        </div>
      )}

      <h1 className="mt-8 text-2xl leading-snug text-heading">{node.situation}</h1>

      <div className="mt-7 space-y-3">
        {node.options!.map((o, i) => (
          <button
            key={i}
            onClick={() => choose(i)}
            className="group flex w-full items-center gap-3 rounded-[var(--radius-tl)] border border-line bg-card px-5 py-4 text-left text-heading transition-all hover:-translate-y-0.5 hover:border-teal/50 hover:shadow-[var(--shadow-tl-sm)]"
          >
            <span className="num text-sm text-teal-600">{String.fromCharCode(65 + i)}</span>
            <span>{o.label}</span>
            <span className="ml-auto text-teal opacity-0 transition-opacity group-hover:opacity-100">→</span>
          </button>
        ))}
      </div>
    </Container>
  );
}
