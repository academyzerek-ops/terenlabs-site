"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Button } from "./Button";
import { TestQuestion, rankByScore } from "@/lib/learn";

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
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[i];
  const answered = picked !== null;
  const isLast = i === questions.length - 1;

  const next = () => {
    if (isLast) {
      setFinished(true);
    } else {
      setI(i + 1);
      setPicked(null);
    }
  };

  if (finished) {
    const rank = rankByScore(correct, questions.length);
    const shareText = encodeURIComponent(
      `Прошёл тест «${title}» на TerenLabs — ранг ${rank.name}. Глубина анализа. Сила результата.`
    );
    return (
      <Container className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
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
            setI(0); setPicked(null); setCorrect(0); setFinished(false);
          }}
          className="mt-6 text-sm text-teal-600 hover:underline"
        >
          Пройти заново
        </button>
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
            style={{ width: `${((i + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="mt-8 text-2xl text-heading">{q.q}</h1>

      <div className="mt-6 space-y-3">
        {q.options.map((o, idx) => {
          const state = !answered ? "idle" : idx === q.correct ? "right" : idx === picked ? "wrong" : "idle";
          return (
            <button
              key={idx}
              disabled={answered}
              onClick={() => {
                setPicked(idx);
                if (idx === q.correct) setCorrect((c) => c + 1);
              }}
              className="w-full rounded-[var(--radius-tl)] border px-4 py-3.5 text-left text-heading transition-colors disabled:cursor-default"
              style={{
                borderColor: state === "right" ? "var(--color-teal)" : state === "wrong" ? "var(--color-danger)" : "var(--color-line)",
                background: state === "right" ? "rgba(0,183,194,.08)" : state === "wrong" ? "rgba(180,69,47,.06)" : "var(--color-card)",
              }}
            >
              {o}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className="mt-5 rounded-[var(--radius-tl)] border-l-2 p-4 text-sm leading-relaxed"
          style={{
            borderColor: picked === q.correct ? "var(--color-teal)" : "var(--color-danger)",
            background: "var(--color-subtle)",
          }}
        >
          <span
            className="font-medium"
            style={{ color: picked === q.correct ? "var(--color-teal-600)" : "var(--color-danger)" }}
          >
            {picked === q.correct ? "Верно. " : "Неверно. "}
          </span>
          {q.explain}
        </div>
      )}

      {answered && (
        <div className="mt-7 flex justify-end">
          <button
            onClick={next}
            className="rounded-[var(--radius-tl)] bg-teal px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-600"
          >
            {isLast ? "Узнать ранг" : "Дальше →"}
          </button>
        </div>
      )}
    </Container>
  );
}
