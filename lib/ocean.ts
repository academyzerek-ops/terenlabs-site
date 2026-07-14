"use client";

// Клиент Океана (12_OCEAN.md, этап 2): веб-токен + запросы к бэкенду.
// Токен — в localStorage: им подписываются только океан-запросы (рейтинг,
// статистика), живёт 30 дней, бэкенд проверяет подпись и срок.

export const OCEAN_API =
  (process.env.NEXT_PUBLIC_AI_API ?? "https://terenlabs-production.up.railway.app/chat").replace(
    /\/chat$/,
    ""
  ) + "/api/ocean";

const TOKEN_KEY = "tl_ocean_token";

export function getOceanToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setOceanToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event("tl-ocean-auth"));
  } catch {
    /* приватный режим — просто без памяти */
  }
}

export async function oceanFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const token = getOceanToken();
  const headers: Record<string, string> = {
    ...(init?.json !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `web ${token}` } : {}),
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  const res = await fetch(OCEAN_API + path, {
    ...init,
    headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  if (res.status === 401) {
    // токен протух — честно разлогиниваем океан-слой
    setOceanToken(null);
  }
  if (!res.ok) throw new Error(`ocean ${path}: ${res.status}`);
  return res.json();
}

export type OceanAuth = {
  token: string;
  user_id: number;
  display_name: string | null;
  needs_onboarding: boolean;
};

/** Вход через Telegram Login Widget: payload виджета → токен. */
export async function loginTelegram(widgetUser: Record<string, unknown>): Promise<OceanAuth> {
  const res = await fetch(OCEAN_API + "/auth/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(widgetUser),
  });
  if (!res.ok) throw new Error(`telegram login: ${res.status}`);
  const out: OceanAuth = await res.json();
  setOceanToken(out.token);
  return out;
}

/** Вход через Google/Apple: серверный мост сайта выписывает токен. */
export async function loginBridge(): Promise<OceanAuth | null> {
  const res = await fetch("/api/ocean-bridge", { method: "POST" });
  if (!res.ok) return null;
  const out: OceanAuth = await res.json();
  setOceanToken(out.token);
  return out;
}

// ── Сдача попыток с сайта (12_OCEAN.md): контракт — зеркало ocean.js v9.2.
// Ответов в клиентском пуле больше нет: балл, passed и разбор ошибок считает
// СЕРВЕР по скрытому ключу (question_id = id вопроса из пула, chosen = исходный
// индекс опции до перемешивания). score/passed в payload — заглушки, сервер
// пересчитывает авторитетно.

export type OceanAttemptPayload = {
  client_attempt_id: string;
  level: string; // 'crab' | 'barracuda'
  test: string; // 't1'..'t3' | 'fin' | 'mkt' | 'mgmt' | 'law' | 'universal'
  score: number; // 0 — сервер пересчитает
  passed: boolean; // false — сервер пересчитает
  started_at: string;
  finished_at: string;
  answers: {
    q_idx: number;
    question_id: string; // id вопроса из пула
    kind: string;
    chapter: string;
    chosen: number | null; // ИСХОДНЫЙ индекс опции (через _orig)
    correct: boolean; // фолбэк, для closed игнорируется сервером
    time_sec: number;
  }[];
};

/** Разбор одного вопроса от сервера. Closed: индексы исходные (до перемешивания).
 *  Open (Дельфин/Акула): баллы по рубрике + фидбек TEREN-AI. */
export type OceanReviewItem = {
  q_idx: number;
  question_id: string;
  // closed
  chosen?: number | null;
  correct?: boolean;
  correct_index?: number;
  explanation?: string;
  // open
  open?: boolean;
  awarded?: number;
  max?: number;
  criteria?: { awarded: number; max: number; note: string }[];
  feedback?: string;
};

export type OceanAttemptResult = {
  attempt_id: number;
  saved: boolean;
  score: number; // авторитетный балл /10
  passed: boolean;
  review: OceanReviewItem[];
  progress: Record<string, Record<string, { passed?: boolean } | number>>;
  cooldowns: Record<string, string>;
  stats: { byTest?: Record<string, unknown> };
  composite: Record<string, unknown>;
};

/** Результат сервера или null (нет токена / сеть). Без сервера балла нет. */
export async function submitOceanAttempt(
  payload: OceanAttemptPayload
): Promise<OceanAttemptResult | null> {
  if (!getOceanToken()) return null;
  try {
    return await oceanFetch<OceanAttemptResult>("/attempt", { method: "POST", json: payload });
  } catch {
    return null;
  }
}

// ── Открытые тесты (Дельфин/Акула) — зеркало submitOpenAttempt из ocean.js:
// ответы своими словами, TEREN-AI оценивает по рубрике на сервере (5 вызовов
// Gemini на попытку у Дельфина, 10 у Акулы — поэтому строго после входа).
// Акула сдаётся в /attempt_shark (тело без level, test = id кейса).

export type OceanOpenPayload = {
  client_attempt_id: string;
  level: string; // 'dolphin' | 'shark'
  test: string; // 'case1'.. | 'SHARK-CASE-01'..
  started_at: string;
  finished_at: string;
  answers: { question_id: string; text: string }[];
};

export async function submitOpenOceanAttempt(
  payload: OceanOpenPayload
): Promise<OceanAttemptResult | null> {
  if (!getOceanToken()) return null;
  const isShark = payload.level === "shark";
  const body = isShark
    ? {
        client_attempt_id: payload.client_attempt_id,
        test: payload.test,
        started_at: payload.started_at,
        finished_at: payload.finished_at,
        answers: payload.answers,
      }
    : payload;
  try {
    return await oceanFetch<OceanAttemptResult>(isShark ? "/attempt_shark" : "/attempt_open", {
      method: "POST",
      json: body,
    });
  } catch {
    return null;
  }
}

// ── Прогресс/гейты/кулдауны — зеркало ocean.js (levelProgress/isLevelUnlocked/
// isTestOnCooldown). Источник — GET /me/progress того же бэка.

export type OceanProgress = {
  progress: Record<string, Record<string, { passed?: boolean } | number>>;
  cooldowns: Record<string, string>; // 'crab.t1' → ISO-время окончания кулдауна
  seen_questions: string[]; // виденные question_id — сэмплинг предпочитает новые
  composite: Record<string, unknown>;
  is_admin?: boolean; // админ заходит в любой уровень (тест/QA)
};

export async function fetchOceanProgress(): Promise<OceanProgress | null> {
  if (!getOceanToken()) return null;
  try {
    return await oceanFetch<OceanProgress>("/me/progress");
  } catch {
    return null;
  }
}

/** Тест сдан: payload бэка {passed} или legacy 0/20. */
export function isTestPassed(p: OceanProgress | null, level: string, test: string): boolean {
  const v = p?.progress?.[level]?.[test];
  if (v && typeof v === "object") return Boolean(v.passed);
  return (Number(v) || 0) >= 20;
}

// Набор тестов уровня — канон TESTS из ocean.js (locked не учитываются)
export const LEVEL_TESTS: Record<string, string[]> = {
  crab: ["t1", "t2", "t3"],
  barracuda: ["fin", "mkt", "mgmt", "law", "universal"],
  dolphin: ["case1", "case2", "case3"],
};

export function levelDone(p: OceanProgress | null, level: string): boolean {
  const tests = LEVEL_TESTS[level];
  if (!tests?.length) return false;
  return tests.every((t) => isTestPassed(p, level, t));
}

/** Уровень открыт: Ракушка/Краб — всем; дальше — когда пройден предыдущий. */
export function isLevelUnlocked(p: OceanProgress | null, level: string): boolean {
  if (p?.is_admin) return true;
  if (level === "mollusk" || level === "crab") return true;
  if (level === "whale") return levelDone(p, "shark");
  const order = ["crab", "barracuda", "dolphin", "shark"];
  const idx = order.indexOf(level);
  if (idx <= 0) return true;
  return levelDone(p, order[idx - 1]);
}

/** Мс до конца кулдауна теста (0 — можно сдавать). */
export function cooldownLeftMs(cooldowns: Record<string, string> | undefined, level: string, test: string): number {
  const iso = cooldowns?.[`${level}.${test}`];
  if (!iso) return 0;
  return Math.max(0, new Date(iso).getTime() - Date.now());
}

/** «2 ч 15 мин» — человекочитаемый остаток кулдауна. */
export function formatCooldown(ms: number): string {
  const min = Math.ceil(ms / 60000);
  if (min < 60) return `${min} мин`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч${min % 60 ? ` ${min % 60} мин` : ""}`;
  const d = Math.floor(h / 24);
  return `${d} д${h % 24 ? ` ${h % 24} ч` : ""}`;
}
