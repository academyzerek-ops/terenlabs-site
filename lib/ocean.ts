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

/** Разбор одного вопроса от сервера (индексы — исходные, до перемешивания). */
export type OceanReviewItem = {
  q_idx: number;
  question_id: string;
  chosen: number | null;
  correct: boolean;
  correct_index: number;
  explanation?: string;
};

export type OceanAttemptResult = {
  attempt_id: number;
  saved: boolean;
  score: number; // авторитетный балл /10
  passed: boolean;
  review: OceanReviewItem[];
  progress: Record<string, Record<string, unknown>>;
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
