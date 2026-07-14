// Океанские тесты — пулы импортированы из Mini App
// (scripts/import_content.mjs ← frontend/products/ocean-assets/*.json).
// Канон v9.2 (июль 2026): закрытый тест = 10 вопросов, по 1 случайному из
// каждого архетипа. Краб — по типу вопроса (Теория/Расчёты/Универсальный),
// Барракуда — по дисциплинам (Финансы/Маркетинг/Менеджмент/Право/Универсальный —
// бэк гейтит уровень всеми пятью). Дельфин — открытые кейсы (5 из пула, ответ
// своими словами), Акула — 12 кейсов по 10 вопросов ПО ПОРЯДКУ (без сэмпла),
// оба оценивает TEREN-AI по рубрике на сервере.
// В клиентском пуле НЕТ правильных ответов — балл и разбор считает сервер.

export type OceanQuestion = {
  id: string;
  q: string;
  opts: string[]; // у открытых пустой
  kind?: string; // theory | calc | mixed | open
  ch?: string; // глава-источник
  archetype?: number | string;
  difficulty?: string;
  category?: string;
  guides?: string[]; // открытые (Дельфин): «разбери в ответе»
  vignette?: string; // Акула: общий контекст кейса
  n?: number; // Акула: порядковый номер вопроса в кейсе
  discipline?: string;
  business?: string;
  /** Карта перемешивания опций: _orig[отображаемый индекс] = исходный индекс.
   *  Появляется после prepareAttempt; сервер ждёт ИСХОДНЫЙ индекс ответа. */
  _orig?: number[];
};

export type OceanTestMeta = {
  slug: string;
  title: string;
  rank: "Краб" | "Барракуда" | "Дельфин" | "Акула";
  rankKey: "krab" | "barrakuda" | "delfin" | "akula";
  pool: string; // путь к JSON пула
  floor: number; // порог сдачи из 10
  type: "closed" | "open";
  qCount: number; // вопросов в попытке
  ordered?: boolean; // Акула: вопросы по порядку n, без сэмплирования
  /** Тесты этого уровня, которые должны быть сданы раньше (T3 ждёт T1+T2) */
  requires?: string[];
};

const closed = (slug: string, title: string, floor = 7, requires?: string[]): OceanTestMeta => {
  const [lvl] = slug.split("-");
  return {
    slug, title, floor, requires,
    rank: lvl === "crab" ? "Краб" : "Барракуда",
    rankKey: lvl === "crab" ? "krab" : "barrakuda",
    pool: `/ocean-pools/${lvl}.${slug.split("-").slice(1).join("-")}.json`,
    type: "closed", qCount: 10,
  };
};

// Акула: id кейса → короткое имя (канон TESTS из ocean.js)
export const SHARK_CASES: { id: string; name: string; cat: string }[] = [
  { id: "SHARK-CASE-01", name: "Пекарня", cat: "prod" },
  { id: "SHARK-CASE-02", name: "Корпусная мебель", cat: "prod" },
  { id: "SHARK-CASE-03", name: "Розлив воды", cat: "prod" },
  { id: "SHARK-CASE-05", name: "Мини-маркет", cat: "retail" },
  { id: "SHARK-CASE-06", name: "Аптека", cat: "retail" },
  { id: "SHARK-CASE-07", name: "Селлер на маркетплейсе", cat: "retail" },
  { id: "SHARK-CASE-08", name: "Салон красоты", cat: "service" },
  { id: "SHARK-CASE-09", name: "Фитнес-зал", cat: "service" },
  { id: "SHARK-CASE-10", name: "Кинотеатр", cat: "service" },
  { id: "SHARK-CASE-04", name: "Столовая", cat: "food" },
  { id: "SHARK-CASE-11", name: "Фастфуд-кафе", cat: "food" },
  { id: "SHARK-CASE-12", name: "Кофейня с посадкой", cat: "food" },
];

export const DOLPHIN_CASES: { id: string; name: string }[] = [
  { id: "case1", name: "Деньги под контролем" },
  { id: "case2", name: "Право и партнёрство" },
  { id: "case3", name: "Рост и метрики" },
];

export const OCEAN_TESTS: Record<string, OceanTestMeta> = {
  "crab-t1": closed("crab-t1", "Краб · Теория"),
  "crab-t2": closed("crab-t2", "Краб · Расчёты"),
  "crab-t3": closed("crab-t3", "Краб · Универсальный", 6, ["t1", "t2"]),
  "barracuda-fin": closed("barracuda-fin", "Барракуда · Финансы"),
  "barracuda-mkt": closed("barracuda-mkt", "Барракуда · Маркетинг"),
  "barracuda-mgmt": closed("barracuda-mgmt", "Барракуда · Менеджмент"),
  "barracuda-law": closed("barracuda-law", "Барракуда · Право"),
  "barracuda-universal": closed("barracuda-universal", "Барракуда · Универсальный"),
  ...Object.fromEntries(
    DOLPHIN_CASES.map((c) => [
      `dolphin-${c.id}`,
      {
        slug: `dolphin-${c.id}`, title: `Дельфин · ${c.name}`,
        rank: "Дельфин", rankKey: "delfin",
        pool: `/ocean-pools/dolphin.${c.id}.json`,
        floor: 7, type: "open", qCount: 5,
      } satisfies OceanTestMeta,
    ])
  ),
  ...Object.fromEntries(
    SHARK_CASES.map((c) => [
      `shark-${c.id}`,
      {
        slug: `shark-${c.id}`, title: `Акула · ${c.name}`,
        rank: "Акула", rankKey: "akula",
        pool: `/ocean-pools/shark.${c.id}.json`,
        floor: 7, type: "open", qCount: 10, ordered: true,
      } satisfies OceanTestMeta,
    ])
  ),
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
  if (!q.opts?.length) return q; // открытые — без опций
  const order = shuffle(q.opts.map((_, i) => i));
  return { ...q, opts: order.map((i) => q.opts[i]), _orig: order };
}

// Сборка попытки по канону Mini App (ocean.js): Акула — все вопросы кейса
// ПО ПОРЯДКУ (n=1..10, без сэмплирования); остальные — по 1 случайному из
// каждого архетипа, ПРЕДПОЧИТАЯ невиденные (seen_questions с сервера).
export function prepareAttempt(
  pool: OceanQuestion[],
  meta: Pick<OceanTestMeta, "qCount" | "ordered">,
  seen: Set<string> = new Set()
): OceanQuestion[] {
  if (meta.ordered) {
    return pool.slice().sort((a, b) => (a.n || 0) - (b.n || 0)).slice(0, meta.qCount);
  }
  const count = meta.qCount;

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
