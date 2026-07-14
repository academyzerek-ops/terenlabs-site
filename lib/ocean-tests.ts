// Океанские тесты Краба и Барракуды — пулы импортированы из Mini App
// (scripts/import_content.mjs ← frontend/products/ocean-assets/*.json).
// Канон v9.2 (июль 2026): тест = 10 вопросов, по 1 случайному из каждого архетипа.
// Краб — по типу вопроса (Теория/Расчёты/Универсальный), Барракуда — по дисциплинам
// (Финансы/Маркетинг/Менеджмент/Право/Универсальный — бэк гейтит уровень всеми пятью).
// В клиентском пуле НЕТ правильных ответов — правильность, балл и разбор ошибок
// считает сервер «Океана» (POST /attempt), как в Mini App.

export type OceanQuestion = {
  id: string;
  q: string;
  opts: string[];
  kind?: string; // theory | calc | mixed
  ch?: string; // глава-источник
  archetype?: number | string;
  difficulty?: string;
  category?: string;
  /** Карта перемешивания опций: _orig[отображаемый индекс] = исходный индекс.
   *  Появляется после prepareAttempt; сервер ждёт ИСХОДНЫЙ индекс ответа. */
  _orig?: number[];
};

export type OceanTestMeta = {
  slug: string;
  title: string;
  rank: "Краб" | "Барракуда";
  rankKey: "krab" | "barrakuda";
  pool: string; // путь к JSON пула
  floor: number; // порог сдачи из 10
  /** Тесты этого уровня, которые должны быть сданы раньше (T3 ждёт T1+T2) */
  requires?: string[];
};

export const OCEAN_TESTS: Record<string, OceanTestMeta> = {
  "crab-t1": { slug: "crab-t1", title: "Краб · Теория", rank: "Краб", rankKey: "krab", pool: "/ocean-pools/crab.t1.json", floor: 7 },
  "crab-t2": { slug: "crab-t2", title: "Краб · Расчёты", rank: "Краб", rankKey: "krab", pool: "/ocean-pools/crab.t2.json", floor: 7 },
  "crab-t3": { slug: "crab-t3", title: "Краб · Универсальный", rank: "Краб", rankKey: "krab", pool: "/ocean-pools/crab.t3.json", floor: 6, requires: ["t1", "t2"] },
  "barracuda-fin": { slug: "barracuda-fin", title: "Барракуда · Финансы", rank: "Барракуда", rankKey: "barrakuda", pool: "/ocean-pools/barracuda.fin.json", floor: 7 },
  "barracuda-mkt": { slug: "barracuda-mkt", title: "Барракуда · Маркетинг", rank: "Барракуда", rankKey: "barrakuda", pool: "/ocean-pools/barracuda.mkt.json", floor: 7 },
  "barracuda-mgmt": { slug: "barracuda-mgmt", title: "Барракуда · Менеджмент", rank: "Барракуда", rankKey: "barrakuda", pool: "/ocean-pools/barracuda.mgmt.json", floor: 7 },
  "barracuda-law": { slug: "barracuda-law", title: "Барракуда · Право", rank: "Барракуда", rankKey: "barrakuda", pool: "/ocean-pools/barracuda.law.json", floor: 7 },
  "barracuda-universal": { slug: "barracuda-universal", title: "Барракуда · Универсальный", rank: "Барракуда", rankKey: "barrakuda", pool: "/ocean-pools/barracuda.universal.json", floor: 7 },
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Перемешать опции, запомнив карту (зеркало shuffleOptions из ocean.js):
// ответа в пуле нет, сервер сверяет по исходному индексу через _orig.
function shuffleOptions(q: OceanQuestion): OceanQuestion {
  const order = shuffle(q.opts.map((_, i) => i));
  return { ...q, opts: order.map((i) => q.opts[i]), _orig: order };
}

// Сборка попытки по канону Mini App (prepareAttempt из ocean.js):
// по 1 случайному вопросу из каждого архетипа, ПРЕДПОЧИТАЯ невиденные
// (seen_questions с сервера); добор рандомом, если архетипов < count.
export function prepareAttempt(
  pool: OceanQuestion[],
  count = 10,
  seen: Set<string> = new Set()
): OceanQuestion[] {
  const byArchetype = new Map<string, OceanQuestion[]>();
  for (const q of pool) {
    if (q.archetype === undefined || q.archetype === null) continue;
    const key = String(q.archetype);
    const arr = byArchetype.get(key) ?? [];
    arr.push(q);
    byArchetype.set(key, arr);
  }

  let picked: OceanQuestion[];
  if (byArchetype.size < 2) {
    picked = shuffle(pool).slice(0, count);
  } else {
    picked = [];
    const ids = new Set<string>();
    for (const arch of shuffle([...byArchetype.keys()])) {
      if (picked.length >= count) break;
      // сначала невиденные этого архетипа; все виденные — берём из всех
      let candidates = byArchetype.get(arch)!.filter((q) => !seen.has(q.id) && !ids.has(q.id));
      if (!candidates.length) candidates = byArchetype.get(arch)!.filter((q) => !ids.has(q.id));
      if (!candidates.length) continue;
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      picked.push(chosen);
      ids.add(chosen.id);
    }
    if (picked.length < count) {
      for (const q of shuffle(pool)) {
        if (picked.length >= count) break;
        if (!ids.has(q.id)) {
          picked.push(q);
          ids.add(q.id);
        }
      }
    }
  }

  return picked.slice(0, count).map(shuffleOptions);
}
