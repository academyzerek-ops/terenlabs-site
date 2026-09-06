// Прогресс вне ранга: тесты Ракушки, прочитанные главы, позиция в курсе.
//
// Раньше это лежало только в localStorage, поэтому человек заходил с телефона и
// не видел своего же прогресса. Теперь то же самое пишется в аккаунт через
// /api/ocean/me/state, а localStorage остаётся кешем: страница рисуется сразу и
// работает без входа.
//
// Ранговые тесты Океана сюда не идут: они уходят в /attempt и считаются сервером.
import { OCEAN_API, getOceanToken } from "./ocean";

export type MarkKind = "test" | "chapter" | "course";

export type Mark = {
  kind: MarkKind;
  key: string;
  payload?: Record<string, unknown> | null;
  updated_at?: string;
};

const CACHE_KEY = "tl-marks";

function readCache(): Mark[] {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeCache(marks: Mark[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(marks.slice(0, 500)));
  } catch {}
}

const id = (m: Mark) => `${m.kind}:${m.key}`;

/** Слияние двух списков: при совпадении ключа выигрывает более поздняя отметка. */
function merge(a: Mark[], b: Mark[]): Mark[] {
  const by = new Map<string, Mark>();
  for (const m of [...a, ...b]) {
    const prev = by.get(id(m));
    if (!prev || (m.updated_at ?? "") >= (prev.updated_at ?? "")) by.set(id(m), m);
  }
  return [...by.values()];
}

/** Отметки аккаунта, слитые с локальным кешем. Без входа отдаёт только кеш. */
export async function fetchMarks(): Promise<Mark[]> {
  const cached = readCache();
  const token = getOceanToken();
  if (!token) return cached;
  try {
    const res = await fetch(OCEAN_API + "/me/state", {
      headers: { Authorization: `web ${token}` },
    });
    if (!res.ok) return cached;
    const data = (await res.json()) as { marks: Mark[] };
    const all = merge(cached, data.marks ?? []);
    writeCache(all);
    return all;
  } catch {
    return cached;
  }
}

/** Записать отметки: сразу в кеш, затем в аккаунт. Без входа только кеш. */
export async function pushMarks(marks: Mark[]): Promise<void> {
  if (marks.length === 0) return;
  const stamped = marks.map((m) => ({ ...m, updated_at: new Date().toISOString() }));
  writeCache(merge(readCache(), stamped));

  const token = getOceanToken();
  if (!token) return;
  try {
    await fetch(OCEAN_API + "/me/state", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `web ${token}` },
      body: JSON.stringify({ marks: marks.map(({ kind, key, payload }) => ({ kind, key, payload })) }),
    });
  } catch {
    // сеть отвалилась: отметка осталась в кеше и уедет при следующей записи
  }
}

/** Прочитанная глава и позиция в курсе. Ключ главы — «<курс>/<глава>», чтобы
 *  одна и та же глава не задваивалась при перечитывании: отметка одна на пару. */
export function saveChapterMark(course: string, chapter: string, title: string, courseTitle: string) {
  return pushMarks([
    { kind: "chapter", key: `${course}/${chapter}`, payload: { title, course: courseTitle } },
    { kind: "course", key: course, payload: { chapter, title, courseTitle } },
  ]);
}

/** Результат теста вне ранга. Балл считает клиент: пул вопросов у этих тестов на сайте. */
export function saveTestMark(slug: string, score: number, total: number, passed: boolean) {
  return pushMarks([{ kind: "test", key: slug, payload: { score, total, passed } }]);
}

export const isTestMarkPassed = (marks: Mark[], slug: string): boolean =>
  marks.some((m) => m.kind === "test" && m.key === slug && Boolean(m.payload?.passed));
