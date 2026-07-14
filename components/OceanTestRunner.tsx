"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Button } from "./Button";
import { OceanTestMeta, OceanQuestion, prepareAttempt, OCEAN_TESTS } from "@/lib/ocean-tests";
import { saveAttempt } from "@/lib/memory";
import {
  getOceanToken,
  submitOceanAttempt,
  OceanAttemptResult,
  OceanProgress,
  fetchOceanProgress,
  isTestPassed,
  isLevelUnlocked,
  cooldownLeftMs,
  formatCooldown,
} from "@/lib/ocean";

// Прохождение океанского теста (Краб/Барракуда) — зеркало Mini App v9.2:
// выбор БЕЗ мгновенной подсказки (это не игра в угадайку) → «Дальше» → сервер
// считает балл по скрытому ключу → результат + разбор ТОЛЬКО ошибок.
// Гейты и кулдауны — те же, что в ocean.js: уровень открыт после предыдущего,
// T3 Краба ждёт T1+T2, после провала — кулдаун с сервера, сэмплинг предпочитает
// невиденные вопросы (seen_questions). Ответов в клиентском пуле нет, поэтому
// попытка возможна только со входом — как в Mini App, где вход есть всегда.
const LETTERS = ["А", "Б", "В", "Г"];

type Phase = "intro" | "quiz" | "checking" | "result" | "submit-error";

const PREV_LEVEL: Record<string, { key: string; name: string } | undefined> = {
  barracuda: { key: "krab", name: "Краб" },
};

export function OceanTestRunner({ meta }: { meta: OceanTestMeta }) {
  const level = meta.slug.split("-")[0]; // 'crab' | 'barracuda'
  const test = meta.slug.split("-").slice(1).join("-");

  const [pool, setPool] = useState<OceanQuestion[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null); // null до маунта (SSR)
  const [progress, setProgress] = useState<OceanProgress | null>(null);
  const [progressReady, setProgressReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<OceanQuestion[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<OceanAttemptResult | null>(null);
  // кулдаун этого теста (мс осталось) — с /me/progress или из ответа /attempt
  const [cooldownMs, setCooldownMs] = useState(0);
  const meta_ = useRef({ attemptId: "", startedAt: "", shownAt: 0, timings: [] as number[] });

  // вход мог случиться в соседней вкладке — слушаем океан-событие
  useEffect(() => {
    const sync = () => setAuthed(Boolean(getOceanToken()));
    sync();
    window.addEventListener("tl-ocean-auth", sync);
    return () => window.removeEventListener("tl-ocean-auth", sync);
  }, []);

  // прогресс/кулдауны/seen — с сервера (только для вошедших)
  useEffect(() => {
    if (authed === null) return;
    if (!authed) {
      setProgressReady(true);
      return;
    }
    let alive = true;
    fetchOceanProgress().then((p) => {
      if (!alive) return;
      setProgress(p);
      setCooldownMs(cooldownLeftMs(p?.cooldowns, level, test));
      setProgressReady(true);
    });
    return () => {
      alive = false;
    };
  }, [authed, level, test]);

  // пул грузим на клиенте: рандом сборки не должен попадать в SSR
  useEffect(() => {
    let alive = true;
    fetch(meta.pool)
      .then((r) => r.json())
      .then((p: OceanQuestion[]) => alive && setPool(p))
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
    };
  }, [meta.pool]);

  const startAttempt = () => {
    if (!pool) return;
    const seen = new Set(progress?.seen_questions ?? []);
    const qs = prepareAttempt(pool, 10, seen);
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(null));
    setIdx(0);
    setResult(null);
    meta_.current = {
      attemptId: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      shownAt: Date.now(),
      timings: new Array(qs.length).fill(0),
    };
    setPhase("quiz");
  };

  const submitAttempt = async (qs: OceanQuestion[], ans: (number | null)[]) => {
    setPhase("checking");
    const remote = await submitOceanAttempt({
      client_attempt_id: meta_.current.attemptId,
      level,
      test,
      score: 0,
      passed: false,
      started_at: meta_.current.startedAt,
      finished_at: new Date().toISOString(),
      answers: qs.map((qq, i) => ({
        q_idx: i,
        question_id: qq.id,
        kind: qq.kind || "theory",
        chapter: qq.ch || "unknown",
        // сервер сверяет по ИСХОДНОМУ индексу — переводим отображаемый через карту
        chosen: ans[i] !== null && qq._orig ? qq._orig[ans[i]!] : ans[i],
        correct: false,
        time_sec: Number(meta_.current.timings[i]) || 0,
      })),
    });
    if (!remote) {
      setPhase("submit-error");
      return;
    }
    // память устройства — с авторитетным баллом сервера
    saveAttempt({
      slug: meta.slug,
      title: meta.title,
      score: remote.score,
      total: qs.length,
      passed: remote.passed,
      at: new Date().toISOString(),
    });
    // сервер вернул свежие кулдауны/прогресс — обновляем гейты без перезагрузки
    setCooldownMs(cooldownLeftMs(remote.cooldowns, level, test));
    setProgress((p) =>
      p
        ? { ...p, progress: { ...p.progress, ...remote.progress }, cooldowns: remote.cooldowns }
        : p
    );
    setResult(remote);
    setPhase("result");
  };

  const next = () => {
    if (!questions) return;
    // время на вопрос: от показа до «Дальше» (для очков «точность × скорость»)
    meta_.current.timings[idx] = (Date.now() - meta_.current.shownAt) / 1000;
    meta_.current.shownAt = Date.now();
    if (idx + 1 >= questions.length) {
      void submitAttempt(questions, answers);
    } else {
      setIdx(idx + 1);
    }
  };

  if (loadError) {
    return (
      <Container className="py-24 text-center">
        <p className="text-heading">Не удалось загрузить вопросы. Обнови страницу.</p>
      </Container>
    );
  }

  // ── интро: правила + гейты (вход → уровень → T1/T2 → кулдаун) ──
  if (phase === "intro") {
    // гейт уровня: Барракуда открыта после Краба (зеркало isLevelUnlocked)
    const levelLocked = authed === true && progressReady && !isLevelUnlocked(progress, level);
    // гейт теста: T3 Краба ждёт T1+T2 (зеркало isTestLocked)
    const missing = (meta.requires ?? []).filter((r) => !isTestPassed(progress, level, r));
    const testLocked = authed === true && progressReady && missing.length > 0;
    const onCooldown = authed === true && progressReady && cooldownMs > 0;
    const prev = PREV_LEVEL[level];

    return (
      <Container className="py-16">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow">{meta.title}</p>
          <h1 className="mt-3 text-3xl text-heading sm:text-4xl">10 вопросов. Порог — {meta.floor} из 10.</h1>
          <p className="mt-4 leading-relaxed text-muted">
            По одному вопросу из каждой темы уровня, варианты перемешаны, пересдача даёт другие
            вопросы. Подсказок по ходу нет — это не игра в угадайку. Балл и разбор ошибок считает
            сервер «Океана», попытка идёт в твой рейтинг — тот же зачёт, что в Mini App.
          </p>
          {authed === false ? (
            <>
              <p className="mt-6 rounded-[var(--radius-tl)] border border-line bg-card p-5 text-sm leading-relaxed text-body">
                Ответы на вопросы хранятся только на сервере — без входа результат не посчитать.
                Войди через Telegram, Google или Apple: попытка сразу пойдёт в зачёт и рейтинг.
              </p>
              <div className="mt-6">
                <Button href="/auth/sign-in" size="lg">
                  Войти и начать тест
                </Button>
              </div>
            </>
          ) : levelLocked ? (
            <>
              <p className="mt-6 rounded-[var(--radius-tl)] border border-line bg-card p-5 text-sm leading-relaxed text-body">
                Уровни «Океан» проходятся по порядку: «{meta.rank}» открывается после того, как
                сданы все тесты уровня «{prev?.name ?? "предыдущего"}».
              </p>
              <div className="mt-6">
                <Button href={`/levels/${prev?.key ?? "krab"}`} size="lg">
                  К тестам уровня «{prev?.name ?? "Краб"}»
                </Button>
              </div>
            </>
          ) : testLocked ? (
            <>
              <p className="mt-6 rounded-[var(--radius-tl)] border border-line bg-card p-5 text-sm leading-relaxed text-body">
                «Универсальный» открывается после «Теории» и «Расчётов» — сначала сдай{" "}
                {missing.map((r) => OCEAN_TESTS[`${level}-${r}`]?.title.split("·")[1]?.trim() || r).join(" и ")}.
              </p>
              <div className="mt-6">
                <Button href={`/levels/${meta.rankKey}`} size="lg">
                  К тестам уровня «{meta.rank}»
                </Button>
              </div>
            </>
          ) : onCooldown ? (
            <p className="mt-6 rounded-[var(--radius-tl)] border border-line bg-card p-5 text-sm leading-relaxed text-body">
              ⏱ Пересдача через {formatCooldown(cooldownMs)} — выборка вопросов будет другой.
            </p>
          ) : (
            <div className="mt-8">
              <button
                onClick={startAttempt}
                disabled={!pool || authed === null || !progressReady}
                className="btn-press rounded-full bg-teal px-7 py-3.5 text-base font-medium text-white shadow-[var(--shadow-tl-sm)] transition-all hover:bg-teal-600 disabled:cursor-default disabled:opacity-50"
              >
                {pool && progressReady ? "Начать тест" : "Собираю вопросы из пула…"}
              </button>
            </div>
          )}
          <p className="mt-6 text-sm">
            <Link href={`/levels/${meta.rankKey}`} className="text-teal-600 hover:text-teal">
              ← Вернуться к уровню «{meta.rank}»
            </Link>
          </p>
        </div>
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

  // ── сервер считает результат ──
  if (phase === "checking") {
    return (
      <Container className="py-24 text-center">
        <p className="eyebrow">{meta.title}</p>
        <p className="mt-4 text-xl text-heading">Проверяем…</p>
        <p className="mt-2 text-muted">Считаем результат на сервере — ответы скрыты от браузера.</p>
      </Container>
    );
  }

  // ── сеть упала: попытка не потеряна (идемпотентно по client_attempt_id) ──
  if (phase === "submit-error") {
    return (
      <Container className="py-24 text-center">
        <p className="eyebrow">{meta.title}</p>
        <p className="mt-4 text-xl text-heading">Сервер не ответил.</p>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Твои ответы не потерялись — отправь ещё раз. Если вход протух, войди заново и повтори.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => void submitAttempt(questions, answers)}
            className="btn-press rounded-full bg-teal px-7 py-3.5 text-base font-medium text-white shadow-[var(--shadow-tl-sm)] transition-all hover:bg-teal-600"
          >
            Отправить ещё раз
          </button>
          <Button href="/auth/sign-in" variant="secondary">
            Войти заново
          </Button>
        </div>
      </Container>
    );
  }

  // ── результат: балл сервера + разбор только ошибок ──
  if (phase === "result" && result) {
    const passed = result.passed;
    const mistakes = result.review.filter((r) => !r.correct);
    const byIdx = new Map(questions.map((q, i) => [i, q]));
    const retryBlocked = !passed && cooldownMs > 0;
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow">{meta.title}</p>
          <div className="num mt-6 text-7xl font-semibold text-heading">
            {result.score}
            <span className="text-3xl text-muted"> / {questions.length}</span>
          </div>
          <p className={`mt-4 text-xl font-semibold ${passed ? "text-teal-600" : "text-heading"}`}>
            {passed ? "Порог пройден." : `Меньше ${meta.floor} из ${questions.length} — попытка не засчитана.`}
          </p>
          <p className="mt-3 text-muted">
            {passed
              ? "Записано в рейтинг «Океана» — средние считаются по всем попыткам."
              : retryBlocked
              ? `⏱ Пересдача через ${formatCooldown(cooldownMs)} — выборка вопросов будет другой.`
              : "Можно сразу пересдать — выборка вопросов будет другой."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href="/ocean" size="lg">
              Посмотреть рейтинг
            </Button>
            {!retryBlocked && (
              <button
                onClick={startAttempt}
                className="btn-press rounded-[var(--radius-tl)] px-5 py-3 text-sm font-medium text-heading ring-1 ring-line transition-colors hover:ring-teal hover:text-teal"
              >
                Новая попытка
              </button>
            )}
          </div>
          <p className="mt-6 text-sm">
            <Link href="/ocean" className="text-teal-600 hover:text-teal">
              Как считаются места в «Океане» →
            </Link>
          </p>
        </div>

        {/* разбор ошибок — как в Mini App: только промахи, ✓ верно / ✗ твой.
            Сервер отдаёт исходные индексы — переводим в отображаемые через _orig */}
        {mistakes.length > 0 && (
          <div className="mx-auto mt-14 max-w-2xl">
            <h2 className="text-2xl text-heading">Разбор ошибок</h2>
            <div className="wave-divider my-5" />
            <div className="space-y-6">
              {mistakes.map((m) => {
                const q = byIdx.get(m.q_idx);
                if (!q) return null;
                const toShown = (orig: number | null) =>
                  orig === null || !q._orig ? orig : q._orig.indexOf(orig);
                const rightShown = toShown(m.correct_index);
                const mineShown = toShown(m.chosen);
                return (
                  <div key={m.q_idx} className="rounded-[var(--radius-tl)] border border-line bg-card p-6">
                    <p className="num text-xs font-semibold uppercase tracking-wider text-muted">
                      Вопрос {m.q_idx + 1}
                    </p>
                    <p className="mt-2 leading-relaxed text-heading">{q.q}</p>
                    <ul className="mt-4 space-y-2">
                      {q.opts.map((opt, oi) => {
                        const right = oi === rightShown;
                        const mine = oi === mineShown;
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
                    {m.explanation && (
                      <p className="mt-4 rounded-lg bg-subtle p-4 text-sm leading-relaxed text-body">
                        {m.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Container>
    );
  }

  const q = questions[idx];
  const picked = answers[idx];

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
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-label="Прогресс теста"
          aria-valuenow={idx}
          aria-valuemin={0}
          aria-valuemax={questions.length}
        >
          <div
            className="h-full rounded-full bg-teal transition-all duration-500"
            style={{ width: `${(idx / questions.length) * 100}%` }}
          />
        </div>

        {/* вопрос: выбор можно менять, правильный ответ не подсвечивается */}
        <p className="mt-8 text-lg leading-relaxed text-heading sm:text-xl">{q.q}</p>
        <div className="mt-6 space-y-3" role="radiogroup" aria-label="Варианты ответа">
          {q.opts.map((o, i) => {
            const selected = picked === i;
            return (
              <button
                key={i}
                role="radio"
                aria-checked={selected}
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
