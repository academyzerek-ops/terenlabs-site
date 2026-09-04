"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Course, Step } from "@/lib/learn";
import { saveProgress } from "@/lib/memory";

const BTN_PRIMARY =
  "btn-press inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-accent-600 px-4 text-[15px] font-medium text-[#fff] transition-colors hover:bg-[#1b6fc2] disabled:cursor-default disabled:opacity-50";
const BTN_GHOST =
  "btn-press inline-flex h-10 items-center justify-center gap-2 rounded-[8px] px-4 text-[15px] font-medium text-text-2 transition-colors hover:bg-subtle hover:text-ink disabled:cursor-default disabled:opacity-50";

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

  // память: «продолжить с этого места» (локально; этап B — синк в аккаунт)
  useEffect(() => {
    if (!cur) return;
    saveProgress({
      slug: course.slug,
      title: course.title,
      stepId: cur.step.id,
      stepTitle: cur.step.title,
      idx: current,
      total: flat.length,
      at: new Date().toISOString(),
    });
  }, [cur, current, course.slug, course.title, flat.length]);
  const progress = Math.round((done.size / flat.length) * 100);

  const markDone = (id: string) => setDone((p) => new Set(p).add(id));
  const go = (i: number) => setCurrent(Math.max(0, Math.min(flat.length - 1, i)));

  return (
    // панель шире: названия глав не влезали в 320px (Адиль), тексту главы места хватает
    <div className="grid h-[calc(100dvh-65px)] grid-rows-[auto_1fr] overflow-hidden bg-page lg:grid-cols-[400px_1fr] lg:grid-rows-1 xl:grid-cols-[440px_1fr]">
      {/* Дерево курса */}
      <aside className="flex min-h-0 flex-col border-b border-line bg-subtle lg:border-b-0 lg:border-r">
        <div className="border-b border-line p-5">
          <Link href="/catalog?type=course" className="text-[13px] text-faint transition-colors hover:text-ink">
            ← к курсам
          </Link>
          <h2 className="mt-2 text-[16px] leading-snug">{course.title}</h2>
          <div className="mt-4">
            <div className="flex items-center justify-between text-[13px] text-faint">
              <span>Прогресс</span>
              <span className="num">{progress}%</span>
            </div>
            <div
              className="mt-2 h-1 overflow-hidden bg-line"
              role="progressbar"
              aria-label="Прогресс курса"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full bg-accent-600 transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button
            onClick={() => setNavOpen((v) => !v)}
            aria-expanded={navOpen}
            aria-controls="course-nav"
            className="btn-press mt-4 h-10 w-full rounded-[8px] border border-line-2 text-[15px] font-medium text-ink transition-colors hover:bg-hover lg:hidden"
          >
            {navOpen ? "Скрыть содержание" : "Содержание курса"}
          </button>
        </div>

        <nav
          id="course-nav"
          aria-label="Содержание курса"
          className={`${navOpen ? "block" : "hidden"} min-h-0 flex-1 overflow-y-auto px-5 py-4 lg:block`}
        >
          {course.modules.map((m) => (
            <div key={m.id} className="mb-6">
              <p className="eyebrow">{m.title}</p>
              <div className="mt-2">
                {m.lessons.map((l) =>
                  l.steps.map((s) => {
                    const idx = flat.findIndex((f) => f.step.id === s.id);
                    const active = idx === current;
                    const complete = done.has(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => { go(idx); setNavOpen(false); }}
                        aria-current={active ? "step" : undefined}
                        className={`flex w-full items-start gap-3 border-t border-line py-2.5 text-left text-[14px] leading-snug transition-colors ${
                          active ? "text-ink" : complete ? "text-text-2 hover:text-ink" : "text-text-2 hover:text-ink"
                        }`}
                      >
                        {/* маркер строки: оранжевая точка = ты здесь, синяя = пройдено, контур = впереди */}
                        <span
                          aria-hidden="true"
                          className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${
                            active ? "bg-orange" : complete ? "bg-accent" : "border border-line-2"
                          }`}
                        />
                        {complete && <span className="sr-only">пройдено: </span>}
                        {/* длинные названия переносятся, а не обрезаются многоточием */}
                        <span className={`min-w-0 flex-1 ${active ? "font-medium" : ""}`}>{s.title}</span>
                        <KindTag kind={s.kind} />
                      </button>
                    );
                  })
                )}
                <div className="border-t border-line" />
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Контент шага */}
      <section className="flex min-h-0 flex-col bg-page">
        {cur.step.kind === "html" ? (
          /* глава Академии — готовая страница со своими стилями, во всю площадь */
          <iframe
            key={cur.step.id}
            src={cur.step.src}
            title={cur.step.title}
            className="min-h-0 w-full flex-1 border-0 bg-page"
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-10 sm:px-12">
            <div className="mx-auto max-w-2xl">
              <p className="eyebrow">{cur.lessonTitle}</p>
              <StepView key={cur.step.id} step={cur.step} onComplete={() => markDone(cur.step.id)} />
            </div>
          </div>
        )}

        {/* Навигация */}
        <div className="flex items-center justify-between gap-4 border-t border-line bg-subtle px-5 py-3 sm:px-12">
          <button onClick={() => go(current - 1)} disabled={current === 0} className={BTN_GHOST}>
            ← Назад
          </button>
          <span className="num text-[13px] text-faint">
            {current + 1} / {flat.length}
          </span>
          <button
            onClick={() => {
              markDone(cur.step.id);
              go(current + 1);
            }}
            disabled={current === flat.length - 1}
            className={BTN_PRIMARY}
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
  return <span className="ml-auto shrink-0 pt-px text-[12px] text-faint">{map[kind]}</span>;
}

function StepView({ step, onComplete }: { step: Step; onComplete: () => void }) {
  if (step.kind === "text") {
    return (
      <>
        <h1 className="mt-3 text-[24px] sm:text-[32px]">{step.title}</h1>
        <p className="mt-5 text-[15px] leading-relaxed text-body">{step.body}</p>
      </>
    );
  }
  if (step.kind === "video") {
    return (
      <>
        <h1 className="mt-3 text-[24px] sm:text-[32px]">{step.title}</h1>
        <div className="mt-6 flex aspect-video items-center justify-center rounded-[8px] border border-line bg-subtle text-[14px] text-faint">
          Видео (заглушка)
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-text-2">{step.body}</p>
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
      <h1 className="mt-3 text-[22px] sm:text-[24px]">{step.title}</h1>
      <p className="mt-5 text-[15px] leading-relaxed text-body">{step.question}</p>
      <div className="mt-6 flex flex-col gap-2">
        {step.options.map((o, i) => {
          const state =
            !answered ? "idle" : i === step.correct ? "right" : i === picked ? "wrong" : "idle";
          const mine = answered && i === picked;
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => {
                setPicked(i);
                onComplete();
              }}
              className={`btn-press flex min-h-[44px] w-full items-start justify-between gap-4 rounded-[8px] border px-4 py-3 text-left text-[15px] leading-relaxed transition-colors disabled:cursor-default ${
                mine ? "border-line-2 bg-subtle" : "border-line bg-transparent"
              } ${!answered ? "text-ink hover:bg-subtle" : state === "idle" ? "text-text-2" : "text-ink"}`}
            >
              <span className="flex-1">{o}</span>
              {state === "right" && <span className="tag tag-blue shrink-0">верно</span>}
              {state === "wrong" && <span className="shrink-0 text-[13px] font-medium text-danger">твой ответ</span>}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-5 rounded-[8px] bg-subtle p-4 text-[15px] leading-relaxed text-body">
          <span className={`font-medium ${correct ? "text-accent" : "text-danger"}`}>
            {correct ? "Верно. " : "Неверно. "}
          </span>
          {step.explain}
        </div>
      )}
    </>
  );
}
