"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Course, Step } from "@/lib/learn";

export function CoursePlayer({ course, initialStepId }: { course: Course; initialStepId?: string }) {
  // Плоский список шагов для навигации + индекс
  const flat = useMemo(() => {
    const arr: { step: Step; lessonTitle: string }[] = [];
    course.modules.forEach((m) =>
      m.lessons.forEach((l) => l.steps.forEach((s) => arr.push({ step: s, lessonTitle: l.title })))
    );
    return arr;
  }, [course]);

  const initialIdx = initialStepId
    ? Math.max(0, flat.findIndex((f) => f.step.id === initialStepId))
    : 0;
  const [current, setCurrent] = useState(initialIdx);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [navOpen, setNavOpen] = useState(false); // дерево курса на мобиле

  const cur = flat[current];
  const progress = Math.round((done.size / flat.length) * 100);

  const markDone = (id: string) => setDone((p) => new Set(p).add(id));
  const go = (i: number) => setCurrent(Math.max(0, Math.min(flat.length - 1, i)));

  return (
    <div className="grid min-h-[80vh] lg:grid-cols-[320px_1fr]">
      {/* Дерево курса */}
      <aside className="border-r border-line bg-subtle">
        <div className="border-b border-line p-5">
          <Link href="/catalog?type=course" className="text-xs text-muted hover:text-teal">
            ← к курсам
          </Link>
          <h2 className="mt-2 text-lg text-heading">{course.title}</h2>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Прогресс</span>
              <span className="num">{progress}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-teal transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button
            onClick={() => setNavOpen((v) => !v)}
            className="mt-4 w-full rounded-lg border border-line py-2 text-sm text-heading lg:hidden"
          >
            {navOpen ? "Скрыть содержание" : "Содержание курса"}
          </button>
        </div>

        <nav className={`${navOpen ? "block" : "hidden"} max-h-[60vh] overflow-y-auto p-3 lg:block`}>
          {course.modules.map((m) => (
            <div key={m.id} className="mb-4">
              <p className="eyebrow px-2">{m.title}</p>
              <div className="mt-2 space-y-0.5">
                {m.lessons.map((l) =>
                  l.steps.map((s) => {
                    const idx = flat.findIndex((f) => f.step.id === s.id);
                    const active = idx === current;
                    const complete = done.has(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => { go(idx); setNavOpen(false); }}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                          active ? "bg-teal text-white" : "text-heading hover:bg-card"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[0.6rem] ${
                            complete
                              ? "border-teal bg-teal text-white"
                              : active
                              ? "border-foam/40"
                              : "border-line"
                          }`}
                        >
                          {complete ? "✓" : ""}
                        </span>
                        <span className="truncate">{s.title}</span>
                        <KindTag kind={s.kind} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Контент шага */}
      <section className="flex flex-col">
        {cur.step.kind === "html" ? (
          /* глава Академии — готовая дизайнерская страница, во всю площадь */
          <iframe
            key={cur.step.id}
            src={cur.step.src}
            title={cur.step.title}
            className="min-h-[78vh] w-full flex-1 border-0"
          />
        ) : (
          <div className="flex-1 px-6 py-10 sm:px-12">
            <div className="mx-auto max-w-2xl">
              <p className="eyebrow">{cur.lessonTitle}</p>
              <StepView key={cur.step.id} step={cur.step} onComplete={() => markDone(cur.step.id)} />
            </div>
          </div>
        )}

        {/* Навигация */}
        <div className="sticky bottom-0 flex items-center justify-between border-t border-line bg-subtle/90 px-6 py-4 backdrop-blur sm:px-12">
          <button
            onClick={() => go(current - 1)}
            disabled={current === 0}
            className="rounded-[var(--radius-tl)] px-4 py-2 text-sm text-heading disabled:opacity-40 hover:text-teal"
          >
            ← Назад
          </button>
          <span className="num text-xs text-muted">
            {current + 1} / {flat.length}
          </span>
          <button
            onClick={() => {
              markDone(cur.step.id);
              go(current + 1);
            }}
            disabled={current === flat.length - 1}
            className="rounded-[var(--radius-tl)] bg-teal px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-600 disabled:opacity-40"
          >
            Дальше →
          </button>
        </div>
      </section>
    </div>
  );
}

function KindTag({ kind }: { kind: Step["kind"] }) {
  const map = { text: "текст", video: "видео", quiz: "тест", html: "глава" };
  return <span className="ml-auto shrink-0 text-[0.6rem] text-muted">{map[kind]}</span>;
}

function StepView({ step, onComplete }: { step: Step; onComplete: () => void }) {
  if (step.kind === "text") {
    return (
      <>
        <h1 className="mt-3 text-3xl text-heading">{step.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-body/80">{step.body}</p>
      </>
    );
  }
  if (step.kind === "video") {
    return (
      <>
        <h1 className="mt-3 text-3xl text-heading">{step.title}</h1>
        <div className="mt-6 flex aspect-video items-center justify-center rounded-[var(--radius-tl)] border border-line bg-navy-900 text-foam/50">
          ▶ Видео (заглушка)
        </div>
        <p className="mt-4 text-muted">{step.body}</p>
      </>
    );
  }
  if (step.kind !== "quiz") return null; // html рендерится выше, мимо StepView
  return <QuizStep step={step} onComplete={onComplete} />;
}

function QuizStep({
  step,
  onComplete,
}: {
  step: Extract<Step, { kind: "quiz" }>;
  onComplete: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === step.correct;

  return (
    <>
      <h1 className="mt-3 text-2xl text-heading">{step.title}</h1>
      <p className="mt-5 text-lg text-body/80">{step.question}</p>
      <div className="mt-6 space-y-3">
        {step.options.map((o, i) => {
          const state =
            !answered ? "idle" : i === step.correct ? "right" : i === picked ? "wrong" : "idle";
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => {
                setPicked(i);
                onComplete();
              }}
              className="flex w-full items-center gap-3 rounded-[var(--radius-tl)] border px-4 py-3 text-left text-heading transition-colors disabled:cursor-default"
              style={{
                borderColor:
                  state === "right" ? "var(--color-teal)" : state === "wrong" ? "var(--color-danger)" : "var(--color-line)",
                background:
                  state === "right" ? "rgba(0,183,194,.08)" : state === "wrong" ? "rgba(180,69,47,.06)" : "var(--color-card)",
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
          style={{ borderColor: correct ? "var(--color-teal)" : "var(--color-danger)", background: "var(--color-subtle)" }}
        >
          <span className="font-medium" style={{ color: correct ? "var(--color-teal-600)" : "var(--color-danger)" }}>
            {correct ? "Верно. " : "Неверно. "}
          </span>
          {step.explain}
        </div>
      )}
    </>
  );
}
