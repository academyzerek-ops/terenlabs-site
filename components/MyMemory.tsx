"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAttempts, getProgress, SiteAttempt, CourseProgress } from "@/lib/memory";
import { plural } from "@/lib/content";

// Реальная память кабинета: прогресс курсов и попытки тестов с ЭТОГО устройства.
// Аноним видит свою локальную память; после входа (этап B) — синк между устройствами.
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

  return (
    <>
      {/* метрики — из памяти, не из головы */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric
          value={String(progress.length)}
          label={`${plural(progress.length, "курс", "курса", "курсов")} в процессе`}
        />
        <Metric value={avg !== null ? `${avg}%` : "—"} label="средний балл попыток" />
        <Metric
          value={String(passedCount)}
          label={`${plural(passedCount, "тест пройден", "теста пройдено", "тестов пройдено")}`}
        />
      </div>

      {/* продолжить обучение — реальное место в плеере */}
      <section className="mt-14">
        <h2 className="text-2xl text-heading">Продолжить обучение</h2>
        <div className="wave-divider my-5" />
        {progress.length === 0 ? (
          <EmptyHint
            text="Открой любой курс Академии — кабинет запомнит, где ты остановился."
            href="/catalog?type=course"
            cta="К курсам →"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {progress.slice(0, 4).map((c) => {
              const pct = Math.round(((c.idx + 1) / c.total) * 100);
              return (
                <Link
                  key={c.slug}
                  href={`/learn/${c.slug}`}
                  className="group rounded-[var(--radius-tl)] border border-line bg-card p-6 transition-all hover:-translate-y-1 hover:border-teal/40 hover:shadow-[var(--shadow-tl)]"
                >
                  <h3 className="text-lg text-heading">{c.title}</h3>
                  <p className="mt-1 truncate text-sm text-muted">
                    Глава: {c.stepTitle}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted">
                    <span className="num">
                      {c.idx + 1} / {c.total}
                    </span>
                    <span className="num">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-teal"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="mt-4 inline-block text-sm font-medium text-teal-600 transition-transform group-hover:translate-x-1">
                    Продолжить →
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* попытки тестов */}
      <section className="mt-14">
        <h2 className="text-2xl text-heading">Мои попытки</h2>
        <div className="wave-divider my-5" />
        {attempts.length === 0 ? (
          <EmptyHint
            text="Пройди тест Краба или Барракуды — результат останется здесь."
            href="/levels/krab"
            cta="К тестам →"
          />
        ) : (
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
        )}
      </section>
    </>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[var(--radius-tl)] border border-line bg-card p-5">
      <div className="num text-3xl font-medium text-heading">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

function EmptyHint({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-tl)] border border-dashed border-line bg-card p-6">
      <p className="text-sm text-muted">{text}</p>
      <Link href={href} className="text-sm font-semibold text-teal-600 hover:text-teal">
        {cta}
      </Link>
    </div>
  );
}
