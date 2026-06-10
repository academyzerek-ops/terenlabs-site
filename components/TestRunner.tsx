"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Button } from "./Button";
import { TestQuestion, rankByScore } from "@/lib/learn";

// Механика как в Mini App: выбор без мгновенной подсказки → «Дальше» →
// результат → разбор только ошибок. Это не игра в угадайку.
export function TestRunner({
  title,
  questions,
  backHref = "/catalog?type=test",
}: {
  title: string;
  questions: TestQuestion[];
  backHref?: string;
}) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(questions.length).fill(null)
  );
  const [finished, setFinished] = useState(false);

  const q = questions[i];
  const picked = answers[i];
  const isLast = i === questions.length - 1;
  const correct = questions.reduce((s, qq, k) => s + (answers[k] === qq.correct ? 1 : 0), 0);

  const next = () => {
    if (isLast) setFinished(true);
    else setI(i + 1);
  };

  if (finished) {
    const rank = rankByScore(correct, questions.length);
    const mistakes = questions
      .map((qq, k) => ({ q: qq, i: k, chosen: answers[k] }))
      .filter((m) => m.chosen !== m.q.correct);
    const shareText = encodeURIComponent(
      `Прошёл тест «${title}» на TerenLabs — ранг ${rank.name}. Глубина анализа. Сила результата.`
    );
    return (
      <Container className="py-20">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow">Результат</p>
          <div
            className="mt-6 flex h-28 w-28 items-center justify-center rounded-full text-foam"
            style={{ background: rank.color }}
          >
            <span className="num text-3xl">{correct}/{questions.length}</span>
          </div>
          <h1 className="mt-6 text-4xl text-heading">Ранг: {rank.name}</h1>
          <p className="mt-2 text-muted">{rank.meaning}</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-body/70">
            {correct === questions.length
              ? "Чисто. Ты держишь цифры в голове — переходи к применению."
              : correct >= questions.length * 0.6
              ? "Крепкая база. Добей слабые места — и в применение."
              : "Есть пробелы. Это нормально: начни с курса по основам, потом вернись."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/catalog?type=course">Подобрать курс</Button>
            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-[var(--radius-tl)] px-5 py-2.5 text-sm text-heading ring-1 ring-line transition-colors hover:text-teal hover:ring-teal"
            >
              Поделиться рангом
            </a>
          </div>
          <button
            onClick={() => {
              setI(0);
              setAnswers(new Array(questions.length).fill(null));
              setFinished(false);
            }}
            className="mt-6 text-sm text-teal-600 hover:underline"
          >
            Пройти заново
          </button>
        </div>

        {/* разбор ошибок — как в Mini App: только промахи */}
        {mistakes.length > 0 && (
          <div className="mx-auto mt-14 max-w-2xl">
            <h2 className="text-2xl text-heading">Разбор ошибок</h2>
            <div className="wave-divider my-5" />
            <div className="space-y-6">
              {mistakes.map((m) => (
                <div key={m.i} className="rounded-[var(--radius-tl)] border border-line bg-card p-6">
                  <p className="num text-xs font-semibold uppercase tracking-wider text-muted">
                    Вопрос {m.i + 1}
                  </p>
                  <p className="mt-2 leading-relaxed text-heading">{m.q.q}</p>
                  <ul className="mt-4 space-y-2">
                    {m.q.options.map((opt, oi) => {
                      const right = oi === m.q.correct;
                      const mine = oi === m.chosen;
                      return (
                        <li
                          key={oi}
                          className={`flex items-start gap-3 rounded-lg border px-4 py-2.5 text-sm leading-relaxed ${
                            right
                              ? "border-teal bg-teal/8 text-heading"
                              : mine
                              ? "border-[var(--color-danger)] bg-[rgba(180,69,47,0.07)] text-heading"
                              : "border-line text-muted"
                          }`}
                        >
                          <span className="flex-1">{opt}</span>
                          {right && <span className="shrink-0 text-xs font-semibold text-teal-600">✓ верно</span>}
                          {mine && !right && (
                            <span className="shrink-0 text-xs font-semibold text-[var(--color-danger)]">✗ твой</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {m.q.explain && (
                    <p className="mt-4 rounded-lg bg-subtle p-4 text-sm leading-relaxed text-body">
                      {m.q.explain}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl py-14">
      <Link href={backHref} className="text-sm text-muted hover:text-teal">
        ← назад
      </Link>

      {/* Прогресс */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{title}</span>
          <span className="num">{i + 1} / {questions.length}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-teal transition-all duration-300"
            style={{ width: `${(i / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="mt-8 text-2xl text-heading">{q.q}</h1>

      {/* выбор можно менять до «Дальше»; правильный ответ не подсвечивается */}
      <div className="mt-6 space-y-3">
        {q.options.map((o, idx) => {
          const selected = picked === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                const nextAnswers = [...answers];
                nextAnswers[i] = idx;
                setAnswers(nextAnswers);
              }}
              className={`btn-press w-full rounded-[var(--radius-tl)] border px-4 py-3.5 text-left text-heading transition-colors ${
                selected
                  ? "border-teal bg-teal/10 shadow-[0_0_0_1px_var(--color-teal)]"
                  : "border-line bg-card hover:border-teal/60"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex justify-end">
        <button
          onClick={next}
          disabled={picked === null}
          className="btn-press rounded-[var(--radius-tl)] bg-teal px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-600 disabled:cursor-default disabled:opacity-40"
        >
          {isLast ? "Завершить тест" : "Дальше"}
        </button>
      </div>
    </Container>
  );
}
