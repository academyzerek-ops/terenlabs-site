"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Button } from "./Button";
import { OceanTestMeta, OceanQuestion, prepareAttempt } from "@/lib/ocean-tests";
import { saveAttempt } from "@/lib/memory";

// Прохождение океанского теста (Краб/Барракуда) по канону Mini App:
// выбор БЕЗ мгновенной подсказки (это не игра в угадайку) → «Дальше» →
// результат → разбор ТОЛЬКО ошибок (✓ верно / ✗ твой + объяснение).
// На сайте — анонимно; зачёт в рейтинг и ранг — в Mini App.
const LETTERS = ["А", "Б", "В", "Г"];

export function OceanTestRunner({ meta }: { meta: OceanTestMeta }) {
  const [questions, setQuestions] = useState<OceanQuestion[] | null>(null);
  const [error, setError] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);

  // пул грузим на клиенте: рандом сборки не должен попадать в SSR
  useEffect(() => {
    let alive = true;
    fetch(meta.pool)
      .then((r) => r.json())
      .then((pool: OceanQuestion[]) => {
        if (alive) {
          const qs = prepareAttempt(pool, 10);
          setQuestions(qs);
          setAnswers(new Array(qs.length).fill(null));
        }
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [meta.pool]);

  if (error) {
    return (
      <Container className="py-24 text-center">
        <p className="text-heading">Не удалось загрузить вопросы. Обнови страницу.</p>
      </Container>
    );
  }
  if (!questions) {
    return (
      <Container className="py-24 text-center">
        <p className="text-muted">Собираю вопросы из пула…</p>
      </Container>
    );
  }

  const q = questions[idx];
  const picked = answers[idx];
  const score = questions.reduce((s, qq, i) => s + (answers[i] === qq.a ? 1 : 0), 0);
  const passed = score >= meta.floor;

  const next = () => {
    if (idx + 1 >= questions.length) {
      // память: попытка сохраняется локально (аноним тоже); синк — через аккаунт
      saveAttempt({
        slug: meta.slug,
        title: meta.title,
        score,
        total: questions.length,
        passed: score >= meta.floor,
        at: new Date().toISOString(),
      });
      setFinished(true);
    } else {
      setIdx(idx + 1);
    }
  };

  if (finished) {
    const mistakes = questions
      .map((qq, i) => ({ q: qq, i, chosen: answers[i] }))
      .filter((m) => m.chosen !== m.q.a);
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow">{meta.title}</p>
          <div className="num mt-6 text-7xl font-semibold text-heading">
            {score}<span className="text-3xl text-muted"> / {questions.length}</span>
          </div>
          <p className={`mt-4 text-xl font-semibold ${passed ? "text-teal-600" : "text-heading"}`}>
            {passed ? "Порог пройден." : `Порог — ${meta.floor} из ${questions.length}. Ещё заход?`}
          </p>
          <p className="mt-3 text-muted">
            {passed
              ? "На сайте результат не записывается. Чтобы балл пошёл в композит и рейтинг «Океана» — пройди тест в Mini App."
              : "Каждая попытка собирает новые вопросы из пула — зубрёжка не поможет, только понимание."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href="https://t.me/terenlabs_bot" size="lg">
              Зачесть в рейтинге — Mini App
            </Button>
            <button
              onClick={() => {
                setFinished(false);
                setIdx(0);
                setAnswers([]);
                setQuestions(null);
                fetch(meta.pool)
                  .then((r) => r.json())
                  .then((pool: OceanQuestion[]) => {
                    const qs = prepareAttempt(pool, 10);
                    setQuestions(qs);
                    setAnswers(new Array(qs.length).fill(null));
                  });
              }}
              className="btn-press rounded-[var(--radius-tl)] px-5 py-3 text-sm font-medium text-heading ring-1 ring-line transition-colors hover:ring-teal hover:text-teal"
            >
              Новая попытка
            </button>
          </div>
          <p className="mt-6 text-sm">
            <Link href="/ocean" className="text-teal-600 hover:text-teal">
              Как считаются места в «Океане» →
            </Link>
          </p>
        </div>

        {/* разбор ошибок — как в Mini App: только промахи, ✓ верно / ✗ твой */}
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
                    {m.q.opts.map((opt, oi) => {
                      const right = oi === m.q.a;
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
                          <span className="num mt-0.5 shrink-0 text-xs text-muted">{LETTERS[oi]}</span>
                          <span className="flex-1">{opt}</span>
                          {right && <span className="shrink-0 text-xs font-semibold text-teal-600">✓ верно</span>}
                          {mine && !right && (
                            <span className="shrink-0 text-xs font-semibold text-[var(--color-danger)]">✗ твой</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {(m.q.explanations?.[m.q.a] || m.q.why) && (
                    <p className="mt-4 rounded-lg bg-subtle p-4 text-sm leading-relaxed text-body">
                      {m.q.explanations?.[m.q.a] || m.q.why}
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
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        {/* шапка попытки */}
        <div className="flex items-center justify-between">
          <Link href={`/levels/${meta.rankKey}`} className="text-xs text-muted hover:text-teal">
            ← {meta.rank}
          </Link>
          <span className="eyebrow">{meta.title}</span>
          <span className="num text-xs text-muted">
            {idx + 1} / {questions.length}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-teal transition-all duration-500"
            style={{ width: `${(idx / questions.length) * 100}%` }}
          />
        </div>

        {/* вопрос: выбор можно менять, правильный ответ не подсвечивается */}
        <p className="mt-8 text-lg leading-relaxed text-heading sm:text-xl">{q.q}</p>
        <div className="mt-6 space-y-3">
          {q.opts.map((o, i) => {
            const selected = picked === i;
            return (
              <button
                key={i}
                onClick={() => {
                  const nextAnswers = [...answers];
                  nextAnswers[idx] = i;
                  setAnswers(nextAnswers);
                }}
                className={`btn-press flex w-full items-start gap-3 rounded-[var(--radius-tl)] border px-4 py-3 text-left text-[0.95rem] leading-relaxed transition-colors ${
                  selected
                    ? "border-teal bg-teal/10 text-heading shadow-[0_0_0_1px_var(--color-teal)]"
                    : "border-line bg-card text-heading hover:border-teal/60"
                }`}
              >
                <span className="num mt-0.5 shrink-0 text-xs text-muted">{LETTERS[i]}</span>
                {o}
              </button>
            );
          })}
        </div>

        <div className="mt-7 text-right">
          <button
            onClick={next}
            disabled={picked === null}
            className="btn-press rounded-[var(--radius-tl)] bg-teal px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-600 disabled:cursor-default disabled:opacity-40"
          >
            {idx + 1 >= questions.length ? "Завершить тест" : "Дальше"}
          </button>
        </div>
      </div>
    </Container>
  );
}
