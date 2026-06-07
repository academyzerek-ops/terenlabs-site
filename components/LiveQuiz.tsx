"use client";

import { useState } from "react";
import { Button } from "./Button";
import { T1_A04_QUESTIONS } from "@/lib/content-t1a04";
import { plural } from "@/lib/content";

// Паттерн Brilliant: продукт и есть демо. Один РЕАЛЬНЫЙ вопрос из банка t1-a04
// прямо на лендинге — проверка без регистрации, после ответа мост в полный тест.
const q = T1_A04_QUESTIONS[0];
const total = T1_A04_QUESTIONS.length;

export function LiveQuiz() {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === q.correct;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-[var(--radius-lg)] border border-white/10 bg-navy-900/70 p-7 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur sm:p-9">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Проверь себя за 10 секунд</span>
          <span className="num text-xs text-foam/45">
            вопрос 1 из {total} · без регистрации
          </span>
        </div>
        <p className="mt-4 text-lg leading-relaxed !text-foam sm:text-xl">{q.q}</p>
        <div className="mt-6 space-y-2.5">
          {q.options.map((o, i) => {
            const state = !answered ? "idle" : i === q.correct ? "right" : i === picked ? "wrong" : "dim";
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => setPicked(i)}
                className={`btn-press flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[0.95rem] transition-all duration-200 disabled:cursor-default ${
                  state === "right"
                    ? "border-teal bg-teal/15 text-foam"
                    : state === "wrong"
                    ? "border-[var(--color-danger)] bg-[rgba(180,69,47,0.12)] text-foam"
                    : state === "dim"
                    ? "border-white/10 text-foam/40"
                    : "border-white/15 text-foam/85 hover:border-teal/60 hover:bg-white/5"
                }`}
              >
                <span className="num text-xs text-foam/40">{String.fromCharCode(1040 + i)}</span>
                {o}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="mt-5 rounded-xl border-l-2 border-teal bg-white/5 p-4 text-sm leading-relaxed text-foam/85">
            <span className="font-semibold" style={{ color: correct ? "var(--color-teal)" : "#ff8a73" }}>
              {correct ? "Верно. " : "Мимо. "}
            </span>
            {q.explain}
          </div>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm text-foam/55">
            {answered
              ? `Остальные ${total - 1} ${plural(total - 1, "вопрос", "вопроса", "вопросов")} — с разбором и рангом «Океан»`
              : "Каждый ответ разбирается. Угадать не выйдет."}
          </span>
          <Button href="/tests/t1-a04/take" size="md">
            {answered ? "Пройти весь тест" : "Сразу к тесту"}
          </Button>
        </div>
      </div>
    </div>
  );
}
