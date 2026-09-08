// Админский слой: список учеников и путь одного ученика.
//
// Данные отдаёт Океан, доступ там же и проверяется: /admin/* пускает только
// админов (ADMIN_EMAILS / ADMIN_USER_IDS), чужому вернётся 403. Скрывать раздел в интерфейсе
// полезно, но защита не в этом, а на сервере.
import { OCEAN_API, getOceanToken } from "./ocean";

export type AdminUser = {
  user_id: number;
  tg_id: number | null;
  first_name: string | null;
  username: string | null;
  region: string | null;
  providers: string[];
  level: string;
  first_seen_at: string;
  last_seen_at: string;
  attempts_total: number;
  attempts_passed: number;
  avg_score: number;
  last_attempt_at: string | null;
  sessions: number;
  total_time_sec: number;
};

export type TimelineEvent = Record<string, unknown> & { at?: string; type?: string };

export type AdminTimeline = {
  profile: Record<string, unknown>;
  stats: Record<string, unknown>;
  timeline: TimelineEvent[];
};

async function adminFetch<T>(path: string): Promise<T> {
  const token = getOceanToken();
  if (!token) throw new Error("нужен вход");
  const res = await fetch(OCEAN_API + path, { headers: { Authorization: `web ${token}` } });
  if (res.status === 403) throw new Error("нет прав администратора");
  if (!res.ok) throw new Error(`ошибка ${res.status}`);
  return res.json();
}

export const fetchAdminUsers = () =>
  adminFetch<{ users: AdminUser[] }>("/admin/users").then((d) => d.users);

export const fetchAdminTimeline = (userId: number) =>
  adminFetch<AdminTimeline>(`/admin/user_timeline?user_id=${userId}`);

/** Русское имя уровня Океана по ключу с бэка. */
export const LEVEL_RU: Record<string, string> = {
  mollusk: "Ракушка",
  crab: "Краб",
  barracuda: "Барракуда",
  dolphin: "Дельфин",
  shark: "Акула",
  whale: "Кит",
};

/** «2 ч 14 мин» вместо 8040 секунд: в таблице читают глазами, а не считают. */
export function humanTime(sec: number): string {
  if (!sec) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h && m) return `${h} ч ${m} мин`;
  if (h) return `${h} ч`;
  return `${m} мин`;
}

/** «сегодня», «вчера», «12 дней назад» — для колонки последней активности. */
export function daysAgo(iso: string | null): string {
  if (!iso) return "—";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "сегодня";
  if (days === 1) return "вчера";
  if (days < 30) return `${days} дн. назад`;
  const months = Math.floor(days / 30);
  return `${months} мес. назад`;
}
