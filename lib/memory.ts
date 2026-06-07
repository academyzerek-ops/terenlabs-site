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
}

export function getProgress(): Record<string, CourseProgress> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}
