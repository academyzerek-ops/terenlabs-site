"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Button } from "./Button";
import { RankTag } from "./RankSketch";
import { TestQuestion, rankByScore } from "@/lib/learn";
import { saveTestMark } from "@/lib/state";
import { saveAttempt } from "@/lib/memory";
import type { LevelKey } from "@/lib/content";

// Механика как в Mini App: выбор без мгновенной подсказки → «Дальше» →
// результат → разбор только ошибок. Это не игра в угадайку.

// имя ранга из rankByScore → ключ эскиза RankSketch
const RANK_KEY: Record<string, LevelKey> = {
  Ракушка: "rakushka", Краб: "krab", Барракуда: "barrakuda",
  Дельфин: "delfin", Акула: "akula", Кит: "kit",
};

const BTN_PRIMARY =
  "btn-press inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-accent-600 px-4 text-[15px] font-medium text-[#fff] transition-colors hover:bg-[#1b6fc2] disabled:cursor-default disabled:opacity-50";
const BTN_SECONDARY =
  "btn-press inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-line-2 bg-transparent px-4 text-[15px] font-medium text-ink transition-colors hover:bg-subtle";

export function TestRunner({
  title,
  questions,
  backHref = "/tests",
  slug,
}: {
  title: string;
  questions: TestQuestion[];
  backHref?: string;
  /** слаг теста: под ним результат ложится в аккаунт */
  slug?: string;
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

  // Результат уходит в аккаунт: до этого он жил только на экране и умирал при
  // обновлении страницы, поэтому в кабинете и на тропе тестов было пусто.
  useEffect(() => {
    if (!finished || !slug) return;
    const passed = correct >= Math.ceil(questions.length * 0.7);
    saveTestMark(slug, correct, questions.length, passed);
    saveAttempt({ slug, title, score: correct, total: questions.length, passed, at: new Date().toISOString() });
  }, [finished, slug, correct, questions.length, title]);

  if (finished) {
    const rank = rankByScore(correct, questions.length);
    const rankKey = RANK_KEY[rank.name] ?? "rakushka";
    const mistakes = questions
      .map((qq, k) => ({ q: qq, i: k, chosen: answers[k] }))
      .filter((m) => m.chosen !== m.q.correct);
    const shareText = encodeURIComponent(
      `Прошёл тест «${title}» на TerenLabs — ранг ${rank.name}. Глубина анализа. Сила результата.`
    );
    return (
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-xl">
          <p className="eyebrow">Результат · {title}</p>
          <div className="num mt-5 text-[64px] font-semibold leading-none text-ink sm:text-[80px]">
            {correct}
            <span className="text-[24px] font-normal text-faint sm:text-[32px]"> / {questions.length}</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h1 className="text-[24px] sm:text-[32px]">Ранг: {rank.name}</h1>
            <RankTag rank={rankKey} />
          </div>
          <p className="mt-2 text-[14px] text-text-2">{rank.meaning}</p>
          <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-body">
            {correct === questions.length
              ? "Чисто. Ты держишь цифры в голове — переходи к применению."
              : correct >= questions.length * 0.6
              ? "Крепкая база. Добей слабые места — и в применение."
              : "Есть пробелы. Это нормально: начни с курса по основам, потом вернись."}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/academy">В Академию</Button>
            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className={BTN_SECONDARY}
            >
              Поделиться рангом
            </a>
            <button
              onClick={() => {
                setI(0);
                setAnswers(new Array(questions.length).fill(null));
                setFinished(false);
              }}
              className="link h-10 text-[15px]"
            >
              Пройти заново
            </button>
          </div>
        </div>

        {/* разбор ошибок — как в Mini App: только промахи */}
        {mistakes.length > 0 && (
          <div className="mx-auto mt-14 max-w-2xl">
            <h2 className="text-[24px]">
              Разбор ошибок <span className="num ml-1 text-[14px] font-normal text-faint">{mistakes.length}</span>
            </h2>
            <div className="mt-6 flex flex-col gap-10">
              {mistakes.map((m) => (
                <div key={m.i}>
                  <p className="eyebrow">Вопрос {m.i + 1}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink">{m.q.q}</p>
                  <ul className="mt-4">
                    {m.q.options.map((opt, oi) => {
                      const right = oi === m.q.correct;
                      const mine = oi === m.chosen;
                      return (
                        <li
                          key={oi}
                          className={`flex items-start justify-between gap-4 border-t border-line py-3 text-[15px] leading-relaxed ${
                            right || mine ? "text-ink" : "text-text-2"
                          }`}
                        >
                          <span className="flex-1">{opt}</span>
                          {right && <span className="tag-blue tag shrink-0">верно</span>}
                          {mine && !right && (
                            <span className="shrink-0 text-[13px] font-medium text-danger">твой ответ</span>
                          )}
                        </li>
                      );
                    })}
                    <li className="border-t border-line" />
                  </ul>
                  {m.q.explain && (
                    <p className="mt-4 rounded-[8px] bg-subtle p-4 text-[15px] leading-relaxed text-body">
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
    <Container className="max-w-2xl py-12 sm:py-14">
      <Link href={backHref} className="text-[13px] text-faint transition-colors hover:text-ink">
        ← назад
      </Link>

      {/* Прогресс */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-[13px] text-faint">
          <span>{title}</span>
          <span className="num">{i + 1} / {questions.length}</span>
        </div>
        <div
          className="mt-2 h-1 overflow-hidden bg-line"
          role="progressbar"
          aria-label="Прогресс теста"
          aria-valuenow={i}
          aria-valuemin={0}
          aria-valuemax={questions.length}
        >
          <div
            className="h-full bg-accent-600 transition-[width] duration-300"
            style={{ width: `${(i / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="mt-8 text-[20px] leading-snug sm:text-[20px]">{q.q}</h1>

      {/* выбор можно менять до «Дальше»; правильный ответ не подсвечивается */}
      <div className="mt-6 flex flex-col gap-2" role="radiogroup" aria-label="Варианты ответа">
        {q.options.map((o, idx) => {
          const selected = picked === idx;
          return (
            <button
              key={idx}
              role="radio"
              aria-checked={selected}
              onClick={() => {
                const nextAnswers = [...answers];
                nextAnswers[i] = idx;
                setAnswers(nextAnswers);
              }}
              className={`btn-press min-h-[44px] w-full rounded-[8px] border px-4 py-3 text-left text-[15px] leading-relaxed text-ink transition-colors ${
                selected ? "border-line-2 bg-subtle" : "border-line bg-transparent hover:bg-subtle"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex justify-end">
        <button onClick={next} disabled={picked === null} className={BTN_PRIMARY}>
          {isLast ? "Завершить тест" : "Дальше"}
        </button>
      </div>
    </Container>
  );
}
