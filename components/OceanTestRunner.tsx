"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Button } from "./Button";
import { OceanTestMeta, OceanQuestion, prepareAttempt } from "@/lib/ocean-tests";
import { saveAttempt } from "@/lib/memory";

// Прохождение океанского теста (Краб/Барракуда) по канону Mini App:
// 10 вопросов по архетипам, разбор каждой опции после ответа, порог сдачи.
// На сайте — анонимно; зачёт в рейтинг и ранг — в Mini App (там Telegram-аккаунт).
export function OceanTestRunner({ meta }: { meta: OceanTestMeta }) {
  const [questions, setQuestions] = useState<OceanQuestion[] | null>(null);
  const [error, setError] = useState(false);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // пул грузим на клиенте: рандом сборки не должен попадать в SSR
  useEffect(() => {
    let alive = true;
    fetch(meta.pool)
      .then((r) => r.json())
      .then((pool: OceanQuestion[]) => {
        if (alive) setQuestions(prepareAttempt(pool, 10));
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
  const answered = picked !== null;
  const passed = score >= meta.floor;

  const next = () => {
    if (idx + 1 >= questions.length) {
      // память: попытка сохраняется локально (аноним тоже); этап B — синк в аккаунт
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
      setPicked(null);
    }
  };

  if (finished) {
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
                setPicked(null);
                setScore(0);
                setQuestions(null);
                fetch(meta.pool)
                  .then((r) => r.json())
                  .then((pool: OceanQuestion[]) => setQuestions(prepareAttempt(pool, 10)));
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

        {/* вопрос */}
        <p className="mt-8 text-lg leading-relaxed text-heading sm:text-xl">{q.q}</p>
        <div className="mt-6 space-y-3">
          {q.opts.map((o, i) => {
            const state = !answered
              ? "idle"
              : i === q.a
              ? "right"
              : i === picked
              ? "wrong"
              : "dim";
            return (
              <div key={i}>
                <button
                  disabled={answered}
                  onClick={() => {
                    setPicked(i);
                    if (i === q.a) setScore((s) => s + 1);
                  }}
                  className={`btn-press flex w-full items-start gap-3 rounded-[var(--radius-tl)] border px-4 py-3 text-left text-[0.95rem] leading-relaxed transition-colors disabled:cursor-default ${
                    state === "right"
                      ? "border-teal bg-teal/10 text-heading"
                      : state === "wrong"
                      ? "border-[var(--color-danger)] bg-[rgba(180,69,47,0.08)] text-heading"
                      : state === "dim"
                      ? "border-line text-muted"
                      : "border-line bg-card text-heading hover:border-teal/60"
                  }`}
                >
                  <span className="num mt-0.5 shrink-0 text-xs text-muted">
                    {String.fromCharCode(1040 + i)}
                  </span>
                  {o}
                </button>
                {/* разбор ИМЕННО этой опции — канон Ноа */}
                {answered && q.explanations?.[i] && (i === q.a || i === picked) && (
                  <p
                    className={`mt-1.5 rounded-lg px-4 py-2 text-sm leading-relaxed ${
                      i === q.a ? "bg-teal/8 text-teal-600" : "bg-subtle text-muted"
                    }`}
                  >
                    {q.explanations[i]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {answered && (
          <>
            {q.why && (
              <div className="mt-5 rounded-[var(--radius-tl)] border-l-2 border-teal bg-subtle p-4 text-sm leading-relaxed text-body">
                <span className="font-semibold text-heading">Суть: </span>
                {q.why}
              </div>
            )}
            <div className="mt-6 text-right">
              <button
                onClick={next}
                className="btn-press rounded-[var(--radius-tl)] bg-teal px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-600"
              >
                {idx + 1 >= questions.length ? "Результат →" : "Дальше →"}
              </button>
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
