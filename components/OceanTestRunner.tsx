"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Button, Arrow } from "./Button";
import { OceanTestMeta, OceanQuestion, prepareAttempt, OCEAN_TESTS } from "@/lib/ocean-tests";
import { saveAttempt } from "@/lib/memory";
import {
  getOceanToken,
  submitOceanAttempt,
  fetchRecommendation,
  submitOpenOceanAttempt,
  OceanAttemptResult,
  OceanProgress,
  fetchOceanProgress,
  isTestPassed,
  isLevelUnlocked,
  cooldownLeftMs,
  formatCooldown,
} from "@/lib/ocean";

// Прохождение океанского теста — зеркало Mini App v9.2 (ocean.js):
// закрытые (Краб/Барракуда) — выбор без подсказок, сервер считает балл по
// скрытому ключу; открытые (Дельфин/Акула) — ответ своими словами, TEREN-AI
// оценивает по рубрике. Гейты, кулдауны и сэмплинг невиденных — те же.
// Прогресс недопройденного теста живёт в localStorage по слоту level.test
// (как tl-ocean-progress в Mini App) — можно вернуться на тот же вопрос.
const LETTERS = ["А", "Б", "В", "Г"];

// кнопки-действия (нативные <button>, поэтому классы Button повторены здесь)
const BTN_PRIMARY =
  "btn-press inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-accent-600 px-4 text-[15px] font-medium text-[#fff] transition-colors hover:bg-[#1b6fc2] disabled:cursor-default disabled:opacity-50";
const BTN_SECONDARY =
  "btn-press inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-line-2 bg-transparent px-4 text-[15px] font-medium text-ink transition-colors hover:bg-subtle";
// панель-пояснение на интро (гейты, кулдаун, resume)
const NOTE = "mt-6 rounded-[8px] border border-line bg-subtle p-5 text-[15px] leading-relaxed text-body";

// тип вопроса — как KIND_LABEL в ocean.js: помогает переключить голову «сейчас считать»
const KIND_LABEL: Record<string, string> = {
  theory: "Теория",
  calc: "Расчёт",
  calculation: "Расчёт",
  mixed: "Универсальный",
  open: "Свой ответ",
};

type Phase = "intro" | "quiz" | "checking" | "result" | "submit-error";
type Answer = number | string | null;

const PREV_LEVEL: Record<string, { key: string; name: string } | undefined> = {
  barracuda: { key: "krab", name: "Краб" },
  dolphin: { key: "barrakuda", name: "Барракуда" },
  shark: { key: "delfin", name: "Дельфин" },
};

// ── Память прогресса теста (localStorage) — зеркало persistTestProgress из
// ocean.js: слоты по каждому тесту, переживает закрытие вкладки. ──
const PROGRESS_KEY = "tl-ocean-progress";
type Slot = {
  v: 1;
  level: string;
  test: string;
  qIndex: number;
  answers: Answer[];
  qTimings: number[];
  attemptId: string;
  startedAt: string;
  questions: OceanQuestion[];
  savedAt: number;
};
function readStore(): { v: 2; slots: Record<string, Slot> } {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "null");
    if (raw?.slots && typeof raw.slots === "object") return raw;
  } catch {
    /* приватный режим — без памяти */
  }
  return { v: 2, slots: {} };
}
function saveSlot(slot: Slot) {
  try {
    const store = readStore();
    store.slots[`${slot.level}.${slot.test}`] = slot;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(store));
  } catch {
    /* переполнение/приватный режим — просто без памяти */
  }
}
function loadSlot(level: string, test: string): Slot | null {
  return readStore().slots[`${level}.${test}`] ?? null;
}
function clearSlot(level: string, test: string) {
  try {
    const store = readStore();
    delete store.slots[`${level}.${test}`];
    if (Object.keys(store.slots).length) localStorage.setItem(PROGRESS_KEY, JSON.stringify(store));
    else localStorage.removeItem(PROGRESS_KEY);
  } catch {
    /* no-op */
  }
}

export function OceanTestRunner({ meta }: { meta: OceanTestMeta }) {
  const level = meta.slug.split("-")[0]; // crab | barracuda | dolphin | shark
  const test = meta.slug.split("-").slice(1).join("-");
  const isOpen = meta.type === "open";

  const [pool, setPool] = useState<OceanQuestion[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null); // null до маунта (SSR)
  const [progress, setProgress] = useState<OceanProgress | null>(null);
  const [progressReady, setProgressReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<OceanQuestion[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<OceanAttemptResult | null>(null);
  const [reco, setReco] = useState<string>(""); // слово наставника после попытки
  // кулдаун этого теста (мс осталось) — с /me/progress или из ответа /attempt
  const [cooldownMs, setCooldownMs] = useState(0);
  const [resumable, setResumable] = useState<Slot | null>(null);
  const meta_ = useRef({ attemptId: "", startedAt: "", shownAt: 0, timings: [] as number[] });

  // вход мог случиться в соседней вкладке — слушаем океан-событие
  useEffect(() => {
    const sync = () => setAuthed(Boolean(getOceanToken()));
    sync();
    window.addEventListener("tl-ocean-auth", sync);
    return () => window.removeEventListener("tl-ocean-auth", sync);
  }, []);

  // недопройденный тест этого слота — предложить продолжить
  useEffect(() => {
    const saved = loadSlot(level, test);
    if (saved && saved.qIndex > 0 && Array.isArray(saved.questions) && saved.questions.length) {
      setResumable(saved);
    }
  }, [level, test]);

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

  const persist = (qs: OceanQuestion[], ans: Answer[], qIndex: number) => {
    saveSlot({
      v: 1, level, test, qIndex,
      answers: ans,
      qTimings: meta_.current.timings,
      attemptId: meta_.current.attemptId,
      startedAt: meta_.current.startedAt,
      questions: qs,
      savedAt: Date.now(),
    });
  };

  const startAttempt = () => {
    if (!pool) return;
    clearSlot(level, test);
    setResumable(null);
    const seen = new Set(progress?.seen_questions ?? []);
    const qs = prepareAttempt(pool, meta, seen);
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

  // продолжить с сохранённого места: вопросы восстанавливаем как есть —
  // иначе ответы не совпадут с новым сэмплом
  const resumeAttempt = () => {
    const saved = resumable;
    if (!saved) return;
    setQuestions(saved.questions);
    setAnswers(saved.answers);
    setIdx(Math.min(saved.qIndex, saved.questions.length - 1));
    meta_.current = {
      attemptId: saved.attemptId,
      startedAt: saved.startedAt,
      shownAt: Date.now(),
      timings: saved.qTimings?.length ? saved.qTimings : new Array(saved.questions.length).fill(0),
    };
    setResumable(null);
    setPhase("quiz");
  };

  const submit = async (qs: OceanQuestion[], ans: Answer[]) => {
    setPhase("checking");
    const common = {
      client_attempt_id: meta_.current.attemptId,
      level,
      test,
      started_at: meta_.current.startedAt,
      finished_at: new Date().toISOString(),
    };
    const remote = isOpen
      ? await submitOpenOceanAttempt({
          ...common,
          answers: qs.map((qq, i) => ({
            question_id: qq.id,
            text: (typeof ans[i] === "string" ? (ans[i] as string) : "").slice(0, 4000),
          })),
        })
      : await submitOceanAttempt({
          ...common,
          score: 0,
          passed: false,
          answers: qs.map((qq, i) => ({
            q_idx: i,
            question_id: qq.id,
            kind: qq.kind || "theory",
            chapter: qq.ch || "unknown",
            // сервер сверяет по ИСХОДНОМУ индексу — переводим отображаемый через карту
            chosen: typeof ans[i] === "number" && qq._orig ? qq._orig[ans[i] as number] : null,
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
      total: 10,
      passed: remote.passed,
      at: new Date().toISOString(),
    });
    // тест сдан и оценён — память слота не нужна; кулдауны/прогресс обновляем
    clearSlot(level, test);
    setCooldownMs(cooldownLeftMs(remote.cooldowns, level, test));
    setProgress((p) =>
      p
        ? { ...p, progress: { ...p.progress, ...remote.progress }, cooldowns: remote.cooldowns }
        : p
    );
    setResult(remote);
    setPhase("result");
    // Слово наставника (общий бэкенд с Mini App): для закрытых тестов передаём
    // заваленные вопросы — критика бьёт точечно; левел-ап/застревание бэк
    // распознаёт сам по истории попыток. Ошибка сети — просто без блока.
    setReco("");
    const misses = isOpen
      ? []
      : remote.review
          .filter((r) => !r.correct)
          .map((r) => {
            const q = qs[r.q_idx];
            return { q: q?.q ?? "", why: r.explanation ?? "" };
          })
          .filter((m) => m.q);
    fetchRecommendation(level, test, remote.attempt_id ?? null, misses).then(setReco);
  };

  const answerValid = (a: Answer) =>
    isOpen ? typeof a === "string" && a.trim().length > 10 : a !== null;

  const next = () => {
    if (!questions) return;
    // время на вопрос: от показа до «Дальше» (для очков «точность × скорость»)
    meta_.current.timings[idx] = (Date.now() - meta_.current.shownAt) / 1000;
    meta_.current.shownAt = Date.now();
    if (idx + 1 >= questions.length) {
      void submit(questions, answers);
    } else {
      setIdx(idx + 1);
      persist(questions, answers, idx + 1);
    }
  };


  if (loadError) {
    return (
      <Container className="py-24">
        <p className="mx-auto max-w-xl text-[15px] text-ink">Не удалось загрузить вопросы. Обнови страницу.</p>
      </Container>
    );
  }

  // ── интро: правила + гейты (вход → уровень → T1/T2 → кулдаун) + resume ──
  if (phase === "intro") {
    // гейт уровня: следующий открыт после предыдущего (зеркало isLevelUnlocked)
    const levelLocked = authed === true && progressReady && !isLevelUnlocked(progress, level);
    // гейт теста: T3 Краба ждёт T1+T2 (зеркало isTestLocked)
    const missing = (meta.requires ?? []).filter((r) => !isTestPassed(progress, level, r));
    const testLocked = authed === true && progressReady && missing.length > 0;
    const onCooldown = authed === true && progressReady && cooldownMs > 0;
    const prev = PREV_LEVEL[level];
    const canStart = authed === true && progressReady && !levelLocked && !testLocked && !onCooldown;

    return (
      <Container className="py-14 sm:py-20">
        <div className="mx-auto max-w-xl">
          <nav className="text-[13px] text-faint">
            <Link href={`/levels/${meta.rankKey}`} className="transition-colors hover:text-ink">
              {meta.rank}
            </Link>
            <span className="mx-2">/</span>
            <span>{meta.title}</span>
          </nav>
          <p className="eyebrow mt-8">{meta.title}</p>
          <h1 className="mt-3 text-[24px] sm:text-[40px]">
            {meta.qCount} {isOpen ? "открытых вопросов" : "вопросов"}. Порог — {meta.floor} из 10.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-text-2 sm:text-[16px]">
            {isOpen
              ? "Отвечаешь развёрнуто, своими словами — TEREN-AI оценивает каждый ответ по рубрике. Итог из 10, попытка идёт в твой рейтинг — тот же зачёт, что в Mini App. Прогресс сохраняется: можно отвлечься и вернуться на тот же вопрос."
              : "По одному вопросу из каждой темы уровня, варианты перемешаны, пересдача даёт другие вопросы. Подсказок по ходу нет — это не игра в угадайку. Балл и разбор ошибок считает сервер «Океана», попытка идёт в твой рейтинг — тот же зачёт, что в Mini App."}
          </p>
          {authed === false ? (
            <>
              <p className={NOTE}>
                {isOpen
                  ? "Открытые ответы оценивает TEREN-AI на сервере — тест доступен после входа. Войди: попытка сразу пойдёт в зачёт и рейтинг."
                  : "Ответы на вопросы хранятся только на сервере — без входа результат не посчитать. Войди: попытка сразу пойдёт в зачёт и рейтинг."}
              </p>
              <div className="mt-6">
                <Button href="/auth/sign-in" size="lg">
                  Войти и начать тест
                </Button>
              </div>
            </>
          ) : levelLocked ? (
            <>
              <p className={NOTE}>
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
              <p className={NOTE}>
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
            <p className={NOTE}>
              Пересдача через <span className="num text-ink">{formatCooldown(cooldownMs)}</span> — выборка вопросов будет другой.
            </p>
          ) : resumable && canStart ? (
            <>
              <p className={NOTE}>
                Ты остановился на вопросе{" "}
                <span className="num text-ink">{Math.min(resumable.qIndex + 1, resumable.questions.length)}</span> из{" "}
                <span className="num text-ink">{resumable.questions.length}</span>. Прогресс сохранён — можно продолжить с того же места
                или начать заново.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={resumeAttempt} className={`${BTN_PRIMARY} h-12 px-5`}>
                  Продолжить — вопрос <span className="num">{Math.min(resumable.qIndex + 1, resumable.questions.length)}</span>
                </button>
                <button onClick={startAttempt} className={`${BTN_SECONDARY} h-12 px-5`}>
                  Начать заново
                </button>
              </div>
            </>
          ) : (
            <div className="mt-8">
              <button
                onClick={startAttempt}
                disabled={!pool || !canStart}
                className={`${BTN_PRIMARY} h-12 px-5`}
              >
                {pool && progressReady ? "Начать тест" : "Собираю вопросы из пула…"}
              </button>
            </div>
          )}
          <p className="mt-8 border-t border-line pt-5 text-[14px]">
            <Link href={`/levels/${meta.rankKey}`} className="text-text-2 transition-colors hover:text-ink">
              ← Вернуться к уровню «{meta.rank}»
            </Link>
          </p>
        </div>
      </Container>
    );
  }

  if (!questions) {
    return (
      <Container className="py-24">
        <p className="mx-auto max-w-xl text-[15px] text-faint">Собираю вопросы из пула…</p>
      </Container>
    );
  }

  // ── сервер считает результат ──
  if (phase === "checking") {
    return (
      <Container className="py-24">
        <div className="mx-auto max-w-xl">
          <p className="eyebrow">{meta.title}</p>
          <p className="mt-4 text-[20px] text-ink" role="status" aria-live="polite">
            {isOpen ? "TEREN-AI читает твои ответы…" : "Проверяем…"}
          </p>
          <p className="mt-2 text-[14px] text-text-2">
            {isOpen
              ? "Оцениваю каждый ответ по рубрике — это займёт несколько секунд."
              : "Считаем результат на сервере — ответы скрыты от браузера."}
          </p>
        </div>
      </Container>
    );
  }

  // ── сеть упала: попытка не потеряна (идемпотентно по client_attempt_id) ──
  if (phase === "submit-error") {
    return (
      <Container className="py-24">
        <div className="mx-auto max-w-xl">
          <p className="eyebrow">{meta.title}</p>
          <p className="mt-4 text-[20px] text-ink" role="alert">Сервер не ответил.</p>
          <p className="mt-3 text-[15px] leading-relaxed text-text-2">
            Твои ответы не потерялись — отправь ещё раз. Если вход протух, войди заново и повтори.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={() => void submit(questions, answers)} className={`${BTN_PRIMARY} h-12 px-5`}>
              Отправить ещё раз
            </button>
            <Button href="/auth/sign-in" variant="secondary" size="lg">
              Войти заново
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  // ── результат: балл сервера + разбор ──
  if (phase === "result" && result) {
    const passed = result.passed;
    const retryBlocked = !passed && cooldownMs > 0;
    const byIdx = new Map(questions.map((q, i) => [i, q]));
    const closedMistakes = isOpen ? [] : result.review.filter((r) => !r.correct);
    return (
      <Container className="py-14 sm:py-20">
        <div className="mx-auto max-w-xl">
          <p className="eyebrow">{meta.title}</p>
          <div className="num mt-5 text-[64px] font-semibold leading-none text-ink sm:text-[80px]">
            {result.score}
            <span className="text-[24px] font-normal text-faint sm:text-[32px]"> / 10</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className={passed ? "tag tag-blue" : "tag"}>{passed ? "Сдан" : "Не сдан"}</span>
            <p className="text-[15px] font-medium text-ink">
              {passed ? "Порог пройден." : `Меньше ${meta.floor} из 10 — попытка не засчитана.`}
            </p>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-text-2">
            {passed
              ? "Записано в рейтинг «Океана» — средние считаются по всем попыткам."
              : retryBlocked
              ? `Пересдача через ${formatCooldown(cooldownMs)} — выборка вопросов будет другой.`
              : isOpen
              ? "Можно сразу пересдать — смотри разбор ниже, чего не хватило."
              : "Можно сразу пересдать — выборка вопросов будет другой."}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/ocean" size="lg">
              Посмотреть рейтинг
            </Button>
            {!retryBlocked && (
              <button onClick={startAttempt} className={`${BTN_SECONDARY} h-12 px-5`}>
                Новая попытка
              </button>
            )}
          </div>
          <p className="mt-6 text-[14px]">
            <Link href="/ocean" className="link">
              Как считаются места в «Океане» <Arrow />
            </Link>
          </p>
        </div>

        {/* слово наставника: разбор попытки / левел-ап / застревание */}
        {reco && (
          <div className="mx-auto mt-12 max-w-2xl rounded-[8px] bg-subtle p-5 sm:p-6">
            <p className="eyebrow">TEREN-AI · разбор попытки</p>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-body">{reco}</p>
          </div>
        )}

        {/* открытый: разбор по рубрике на каждый ответ (как renderOpenReview) */}
        {isOpen && result.review.length > 0 && (
          <div className="mx-auto mt-14 max-w-2xl">
            <h2 className="text-[24px]">Разбор по кейсам</h2>
            <p className="mt-2 text-[14px] text-text-2">
              ИИ оценил каждый ответ по рубрике — смотри, что раскрыл и чего не хватило.
            </p>
            <div className="mt-6 flex flex-col gap-10">
              {result.review.map((r) => {
                const q = byIdx.get(r.q_idx);
                return (
                  <div key={r.q_idx}>
                    <p className="eyebrow">
                      Вопрос {r.q_idx + 1}
                      {r.awarded !== undefined && r.max !== undefined && (
                        <span className="num text-ink">{r.awarded}/{r.max} баллов</span>
                      )}
                    </p>
                    {q && <p className="mt-2 text-[15px] leading-relaxed text-ink">{q.q}</p>}
                    {(r.criteria?.length ?? 0) > 0 && (
                      <ul className="mt-4">
                        {r.criteria!.map((c, ci) => {
                          const tone =
                            c.awarded >= c.max ? "text-accent" : c.awarded > 0 ? "text-ink" : "text-danger";
                          return (
                            <li
                              key={ci}
                              className="flex items-start gap-4 border-t border-line py-3 text-[15px] leading-relaxed text-body"
                            >
                              <span className={`num w-10 shrink-0 font-medium ${tone}`}>
                                {c.awarded}/{c.max}
                              </span>
                              <span className="flex-1">{c.note}</span>
                            </li>
                          );
                        })}
                        <li className="border-t border-line" />
                      </ul>
                    )}
                    {r.feedback && (
                      <div className="mt-4 rounded-[8px] bg-subtle p-4">
                        <p className="eyebrow">Разбор TEREN-AI</p>
                        <p className="mt-2 text-[15px] leading-relaxed text-body">{r.feedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* закрытый: разбор ошибок — только промахи, «верно» / «твой ответ».
            Сервер отдаёт исходные индексы — переводим в отображаемые через _orig */}
        {!isOpen && closedMistakes.length > 0 && (
          <div className="mx-auto mt-14 max-w-2xl">
            <h2 className="text-[24px]">
              Разбор ошибок <span className="num ml-1 text-[14px] font-normal text-faint">{closedMistakes.length}</span>
            </h2>
            <div className="mt-6 flex flex-col gap-10">
              {closedMistakes.map((m) => {
                const q = byIdx.get(m.q_idx);
                if (!q) return null;
                const toShown = (orig: number | null | undefined) =>
                  orig === null || orig === undefined || !q._orig ? null : q._orig.indexOf(orig);
                const rightShown = toShown(m.correct_index);
                const mineShown = toShown(m.chosen);
                return (
                  <div key={m.q_idx}>
                    <p className="eyebrow">Вопрос {m.q_idx + 1}</p>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink">{q.q}</p>
                    <ul className="mt-4">
                      {q.opts.map((opt, oi) => {
                        const right = oi === rightShown;
                        const mine = oi === mineShown;
                        return (
                          <li
                            key={oi}
                            className={`flex items-start gap-4 border-t border-line py-3 text-[15px] leading-relaxed ${
                              right || mine ? "text-ink" : "text-text-2"
                            }`}
                          >
                            <span className="num w-5 shrink-0 text-[13px] text-faint">{LETTERS[oi]}</span>
                            <span className="flex-1">{opt}</span>
                            {right && <span className="tag tag-blue shrink-0">верно</span>}
                            {mine && !right && (
                              <span className="shrink-0 text-[13px] font-medium text-danger">твой ответ</span>
                            )}
                          </li>
                        );
                      })}
                      <li className="border-t border-line" />
                    </ul>
                    {m.explanation && (
                      <p className="mt-4 rounded-[8px] bg-subtle p-4 text-[15px] leading-relaxed text-body">
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
        <div className="flex items-center justify-between gap-4 text-[13px] text-faint">
          <Link href={`/levels/${meta.rankKey}`} className="shrink-0 transition-colors hover:text-ink">
            ← {meta.rank}
          </Link>
          <span className="truncate">{meta.title}</span>
          <span className="num shrink-0">
            {idx + 1} / {questions.length}
          </span>
        </div>
        <div
          className="mt-3 h-1 overflow-hidden bg-line"
          role="progressbar"
          aria-label="Прогресс теста"
          aria-valuenow={idx}
          aria-valuemin={0}
          aria-valuemax={questions.length}
        >
          <div
            className="h-full bg-accent-600 transition-[width] duration-300"
            style={{ width: `${(idx / questions.length) * 100}%` }}
          />
        </div>

        {/* Акула: общий контекст кейса — сворачиваемый, открыт по умолчанию */}
        {q.vignette && (
          <details open className="mt-8 overflow-hidden rounded-[8px] border border-line bg-subtle">
            <summary className="cursor-pointer list-none px-5 py-3.5 text-[14px] font-medium text-ink">
              Контекст кейса{q.business ? ` · ${q.business}` : ""}
            </summary>
            <div className="whitespace-pre-line border-t border-line px-5 py-4 text-[15px] leading-relaxed text-body">
              {q.vignette}
            </div>
          </details>
        )}

        {/* тип вопроса + вопрос */}
        {!isOpen && q.kind && KIND_LABEL[q.kind] && (
          <p className="eyebrow mt-8">{KIND_LABEL[q.kind]}</p>
        )}
        <p className={`${q.vignette || (!isOpen && q.kind) ? "mt-3" : "mt-8"} text-[20px] leading-snug text-ink sm:text-[24px]`}>
          {q.q}
        </p>

        {isOpen ? (
          <>
            {/* Дельфин: наводящие пункты «разбери в ответе» */}
            {(q.guides?.length ?? 0) > 0 && (
              <div className="mt-5 rounded-[8px] border border-line p-5">
                <p className="eyebrow">Разбери в ответе</p>
                <ul className="mt-3 flex flex-col gap-2 text-[15px] leading-relaxed text-body">
                  {q.guides!.map((g, gi) => (
                    <li key={gi} className="flex gap-3">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" aria-hidden="true" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <textarea
              value={typeof picked === "string" ? picked : ""}
              onChange={(e) => {
                const nextAnswers = [...answers];
                nextAnswers[idx] = e.target.value;
                setAnswers(nextAnswers);
                persist(questions, nextAnswers, idx);
              }}
              maxLength={4000}
              rows={8}
              placeholder="Твой ответ своими словами — рассуждение и цифры ценнее «правильных слов»…"
              className="mt-6 w-full rounded-[8px] border border-line-2 bg-card p-4 text-[16px] leading-relaxed text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
            />
            <p className="num mt-2 text-right text-[13px] text-faint">
              {typeof picked === "string" ? picked.length : 0} / 4000
            </p>
          </>
        ) : (
          /* закрытый: выбор можно менять, правильный ответ не подсвечивается */
          <div className="mt-6 flex flex-col gap-2" role="radiogroup" aria-label="Варианты ответа">
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
                    persist(questions, nextAnswers, idx);
                  }}
                  className={`btn-press flex min-h-[44px] w-full items-start gap-3 rounded-[8px] border px-4 py-3 text-left text-[15px] leading-relaxed text-ink transition-colors ${
                    selected ? "border-line-2 bg-subtle" : "border-line bg-transparent hover:bg-subtle"
                  }`}
                >
                  <span className="num mt-0.5 w-5 shrink-0 text-[13px] text-faint">{LETTERS[i]}</span>
                  <span className="flex-1">{o}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-7 flex justify-end">
          <button onClick={next} disabled={!answerValid(picked)} className={BTN_PRIMARY}>
            {idx + 1 >= questions.length
              ? isOpen
                ? "Сдать на проверку"
                : "Завершить тест"
              : "Дальше"}
          </button>
        </div>
      </div>
    </Container>
  );
}
