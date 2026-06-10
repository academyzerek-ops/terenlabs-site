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
