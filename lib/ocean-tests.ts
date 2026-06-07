// Океанские тесты Краба и Барракуды — пулы импортированы из Mini App
// (scripts/import_content.mjs ← frontend/products/ocean-assets/*.json).
// Канон: тест = 10 вопросов, по 1 случайному из каждого архетипа; пороги T1/T2 ≥7, T3 ≥6.

export type OceanQuestion = {
  id: string;
  q: string;
  opts: string[];
  a: number; // индекс правильного
  archetype?: number;
  why?: string;
  explanations?: string[]; // разбор каждой опции
  calc?: string;
  difficulty?: string;
  category?: string;
};

export type OceanTestMeta = {
  slug: string;
  title: string;
  rank: "Краб" | "Барракуда";
  rankKey: "krab" | "barrakuda";
  pool: string; // путь к JSON пула
  floor: number; // порог сдачи из 10
};

export const OCEAN_TESTS: Record<string, OceanTestMeta> = {
  "crab-t1": { slug: "crab-t1", title: "Краб · Теория", rank: "Краб", rankKey: "krab", pool: "/ocean-pools/crab.t1.json", floor: 7 },
  "crab-t2": { slug: "crab-t2", title: "Краб · Применение", rank: "Краб", rankKey: "krab", pool: "/ocean-pools/crab.t2.json", floor: 7 },
  "crab-t3": { slug: "crab-t3", title: "Краб · Анализ", rank: "Краб", rankKey: "krab", pool: "/ocean-pools/crab.t3.json", floor: 6 },
  "barracuda-t1": { slug: "barracuda-t1", title: "Барракуда · Теория", rank: "Барракуда", rankKey: "barrakuda", pool: "/ocean-pools/barracuda.t1.json", floor: 7 },
  "barracuda-t2": { slug: "barracuda-t2", title: "Барракуда · Применение", rank: "Барракуда", rankKey: "barrakuda", pool: "/ocean-pools/barracuda.t2.json", floor: 7 },
  "barracuda-t3": { slug: "barracuda-t3", title: "Барракуда · Анализ", rank: "Барракуда", rankKey: "barrakuda", pool: "/ocean-pools/barracuda.t3.json", floor: 6 },
};

// Сборка попытки по канону Mini App (prepareAttempt из ocean.html):
// по 1 случайному вопросу из каждого архетипа; перемешать опции, пересчитав индекс ответа.
export function prepareAttempt(pool: OceanQuestion[], count = 10): OceanQuestion[] {
  const byArchetype = new Map<number, OceanQuestion[]>();
  for (const q of pool) {
    if (q.archetype === undefined || q.archetype === null) continue;
    const arr = byArchetype.get(q.archetype) ?? [];
    arr.push(q);
    byArchetype.set(q.archetype, arr);
  }

  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let picked: OceanQuestion[];
  if (byArchetype.size < 2) {
    picked = shuffle(pool).slice(0, count);
  } else {
    picked = [];
    const ids = new Set<string>();
    for (const arch of shuffle([...byArchetype.keys()])) {
      if (picked.length >= count) break;
      const candidates = byArchetype.get(arch)!.filter((q) => !ids.has(q.id));
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

  // перемешать опции, сохранив привязку правильного ответа и разборов
  return picked.slice(0, count).map((q) => {
    const order = shuffle(q.opts.map((_, i) => i));
    return {
      ...q,
      opts: order.map((i) => q.opts[i]),
      a: order.indexOf(q.a),
      explanations: q.explanations ? order.map((i) => q.explanations![i]) : undefined,
    };
  });
}
