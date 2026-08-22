// Детерминированная «ротация» списка по дню года (UTC): порядок одинаков для всех
// запросов в течение суток и сдвигается назавтра. Используется в каталоге обзоров
// вместо Math.random при рендере — краулер и пользователь видят один и тот же порядок.
// Страница каталога динамическая (searchParams), поэтому дата читается на каждый запрос.
export function dayOfYearUTC(now = new Date()): number {
  return Math.floor(
    (now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 0)) / 86_400_000,
  );
}

export function rotateByDay<T>(arr: readonly T[], step = 7): T[] {
  if (arr.length === 0) return [];
  const k = (dayOfYearUTC() * step) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}
