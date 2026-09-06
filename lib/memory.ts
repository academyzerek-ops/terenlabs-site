// «Память» сайта: попытки тестов и прогресс обучения.
// v1 — localStorage (работает и анониму на этом устройстве);
// этап B — синк на бэкенд под аккаунтом (Google/Apple) и зачёт в рейтинг.

export type SiteAttempt = {
  slug: string;
  title: string;
  score: number;
  total: number;
  passed: boolean;
  at: string; // ISO
};

export type CourseProgress = {
  slug: string;
  title: string;
  stepId: string;
  stepTitle: string;
  idx: number; // позиция шага
  total: number;
  at: string;
};

const ATTEMPTS_KEY = "tl-attempts";
const PROGRESS_KEY = "tl-progress";

export function saveAttempt(a: SiteAttempt): void {
  try {
    const all = getAttempts();
    all.unshift(a);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(all.slice(0, 100)));
  } catch {}
  logJournal({ kind: "test", title: a.title, sub: `${a.score} из ${a.total}`, href: `/tests/${a.slug}/take` });
}

export function getAttempts(): SiteAttempt[] {
  try {
    return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveProgress(p: CourseProgress): void {
  try {
    const all = getProgress();
    all[p.slug] = p;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {}
  logJournal({
    kind: "chapter",
    title: p.stepTitle || p.title,
    sub: p.title,
    href: `/learn/${p.slug}?ch=${p.stepId}`,
  });
}

export function getProgress(): Record<string, CourseProgress> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

// ── Дневник занятий ───────────────────────────────────────────────────────────
// Календарь в панели показывает не оценку, а привычку: в какие дни человек
// открывал главы и проходил тесты. Прогресс курса хранит только последний шаг,
// поэтому истории из него не собрать — ведём отдельный журнал событий.

export type JournalKind = "chapter" | "test" | "case" | "review" | "brand";

export type JournalEntry = {
  kind: JournalKind;
  title: string;
  sub?: string;
  href?: string;
  at: string; // ISO
};

const JOURNAL_KEY = "tl-journal";
const JOURNAL_MAX = 400;

/** Локальный день в формате ГГГГ-ММ-ДД (не UTC: вечер по местному времени
 *  не должен уезжать во вчера). */
export function dayKey(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function logJournal(e: Omit<JournalEntry, "at"> & { at?: string }): void {
  try {
    const all = getJournal();
    const at = e.at ?? new Date().toISOString();
    // одна глава за день попадает в журнал один раз, иначе перечитывание
    // забивает день десятком одинаковых строк
    const same = all.find(
      (x) => x.kind === e.kind && x.title === e.title && dayKey(x.at) === dayKey(at)
    );
    if (same) return;
    all.unshift({ ...e, at });
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(all.slice(0, JOURNAL_MAX)));
  } catch {}
}

export function getJournal(): JournalEntry[] {
  try {
    const raw: JournalEntry[] = JSON.parse(localStorage.getItem(JOURNAL_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

/** Первый запуск: журнала ещё нет, а попытки тестов уже записаны с датами.
 *  Переносим их, чтобы календарь не выглядел пустым у тех, кто уже занимался. */
export function seedJournalFromAttempts(): void {
  try {
    if (localStorage.getItem(JOURNAL_KEY)) return;
    const seeded: JournalEntry[] = getAttempts().map((a) => ({
      kind: "test" as const,
      title: a.title,
      sub: `${a.score} из ${a.total}`,
      href: `/tests/${a.slug}/take`,
      at: a.at,
    }));
    if (seeded.length) localStorage.setItem(JOURNAL_KEY, JSON.stringify(seeded.slice(0, JOURNAL_MAX)));
  } catch {}
}

/** Дни подряд с занятиями, считая от сегодня или от вчера. */
export function streakFromJournal(entries: JournalEntry[]): number {
  const days = new Set(entries.map((e) => dayKey(e.at)));
  if (!days.size) return 0;
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
