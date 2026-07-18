"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAttempts, getProgress, SiteAttempt, CourseProgress } from "@/lib/memory";
import { plural } from "@/lib/content";
import { ACADEMY } from "@/lib/learn";

// Реальная память кабинета: прогресс курсов и попытки тестов с ЭТОГО устройства.
// Аноним видит свою локальную память; после входа (этап B) — синк между устройствами.

// hero-картинка главы, на которой остановился читатель (по stepId плеера)
function stepImg(slug: string, stepId: string): string | null {
  const track = ACADEMY.find((t) => t.slug === slug);
  if (!track) return null;
  for (const m of track.modules)
    for (const c of m.chapters)
      if (`${m.id}-${c.file}-s` === stepId) return c.img ?? null;
  return null;
}

export function MyMemory() {
  const [attempts, setAttempts] = useState<SiteAttempt[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAttempts(getAttempts());
    setProgress(
      Object.values(getProgress()).sort((a, b) => (a.at < b.at ? 1 : -1))
    );
    setReady(true);
  }, []);

  if (!ready) return null;

  const passedCount = attempts.filter((a) => a.passed).length;
  const avg =
    attempts.length > 0
      ? Math.round(
          (attempts.reduce((s, a) => s + a.score / a.total, 0) / attempts.length) * 100
        )
      : null;
  const stepsBehind = progress.reduce((s, c) => s + c.idx, 0);

  // Пустышки гостю не показываем (Адиль 17.07 «это зачем, если как гость?»):
  // секция появляется, когда за ней есть жизнь. Роль приглашений несут
  // океан-блок сверху и «Рекомендуем дальше» снизу.
  const hasCourses = progress.length > 0;
  const hasAttempts = attempts.length > 0;
  if (!hasCourses && !hasAttempts) return null;

  return (
    <>
      {/* продолжить обучение — реальное место в плеере; метрики памяти живут
          чипами в шапке секции, а не отдельными плитками на полэкрана */}
      {hasCourses && (
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2 className="text-2xl text-heading">Продолжить обучение</h2>
          <div className="flex flex-wrap gap-2">
            <Chip
              value={String(progress.length)}
              label={plural(progress.length, "курс в процессе", "курса в процессе", "курсов в процессе")}
            />
            {stepsBehind > 0 && (
              <Chip
                value={String(stepsBehind)}
                label={plural(stepsBehind, "глава позади", "главы позади", "глав позади")}
              />
            )}
            {hasAttempts && avg !== null && <Chip value={`${avg}%`} label="средний балл" />}
            {hasAttempts && (
              <Chip
                value={String(passedCount)}
                label={plural(passedCount, "тест сдан", "теста сдано", "тестов сдано")}
              />
            )}
          </div>
        </div>
        <div className="wave-divider my-5" />
        <div className="grid gap-4 sm:grid-cols-2">
            {progress.slice(0, 4).map((c) => {
              const pct = Math.round(((c.idx + 1) / c.total) * 100);
              const img = stepImg(c.slug, c.stepId);
              return (
                <Link
                  key={c.slug}
                  href={`/learn/${c.slug}`}
                  className="group relative overflow-hidden rounded-[var(--radius-tl)] border border-line bg-card transition-all hover:-translate-y-1 hover:border-teal/40 hover:shadow-[var(--shadow-tl)]"
                >
                  {/* кадр главы уходит под текст маской — карточка живая, текст читаемый */}
                  {img && (
                    <img
                      src={img}
                      alt=""
                      className="absolute inset-y-0 right-0 h-full w-3/5 object-cover opacity-40 transition-all duration-500 group-hover:scale-[1.04] group-hover:opacity-55"
                      style={{
                        maskImage: "linear-gradient(90deg, transparent 0%, black 70%)",
                        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 70%)",
                      }}
                    />
                  )}
                  <div className="relative flex items-center gap-5 p-6">
                    <ProgressRing pct={pct} />
                    <div className="min-w-0 flex-1">
                      <p className="eyebrow">
                        глава {c.idx + 1} из {c.total}
                      </p>
                      <h3 className="mt-1 truncate text-xl text-heading">{c.title}</h3>
                      <p className="mt-1 truncate text-sm text-muted">Сейчас: {c.stepTitle}</p>
                      <span className="mt-3 inline-block text-sm font-medium text-teal-600 transition-transform group-hover:translate-x-1">
                        Продолжить →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>
      )}

      {/* попытки тестов — только когда они есть */}
      {hasAttempts && (
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2 className="text-2xl text-heading">Мои попытки</h2>
          {!hasCourses && (
            <div className="flex flex-wrap gap-2">
              {avg !== null && <Chip value={`${avg}%`} label="средний балл" />}
              <Chip
                value={String(passedCount)}
                label={plural(passedCount, "тест сдан", "теста сдано", "тестов сдано")}
              />
            </div>
          )}
        </div>
        <div className="wave-divider my-5" />
        <div className="overflow-hidden rounded-[var(--radius-tl)] border border-line bg-card">
            {attempts.slice(0, 8).map((a, i) => (
              <Link
                key={i}
                href={`/tests/${a.slug}/take`}
                className="flex items-center gap-4 border-b border-line px-5 py-3.5 transition-colors last:border-0 hover:bg-subtle"
              >
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${
                    a.passed ? "bg-teal/15 text-teal-600" : "bg-line text-muted"
                  }`}
                >
                  {a.passed ? "сдан" : "не сдан"}
                </span>
                <span className="min-w-0 flex-1 truncate text-heading">{a.title}</span>
                <span className="num text-xs text-muted">
                  {new Date(a.at).toLocaleDateString("ru-RU")}
                </span>
                <span className="num text-lg font-semibold text-heading">
                  {a.score}/{a.total}
                </span>
              </Link>
            ))}
        </div>
      </section>
      )}
    </>
  );
}

// компактная метрика в шапке секции: «2 · курса в процессе»
function Chip({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex items-baseline gap-1.5 rounded-full border border-line bg-card px-3.5 py-1.5 text-xs text-muted">
      <span className="num text-sm font-semibold text-heading">{value}</span>
      {label}
    </span>
  );
}

// кольцо прогресса: процент виден с одного взгляда, без полосы на всю карточку
function ProgressRing({ pct }: { pct: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0.02, pct / 100) * c; // даже 0% рисует искру старта
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-line)" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="var(--color-teal)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c}`}
        />
      </svg>
      <span className="num absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-heading">
        {pct}%
      </span>
    </div>
  );
}
