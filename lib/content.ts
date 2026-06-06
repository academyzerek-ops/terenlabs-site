// ============================================================
// TerenLabs — ЕДИНЫЙ КОНТЕНТ-СЛОЙ (типизированный загрузчик)
// Контент редактируется в content/*.json (без кода). Здесь — типы, склейка,
// вычисление ссылок и проверка целостности. Вопросы тестов — в lib/content-*.ts (банки).
// Правило бренда: НЕ выдумывать вопросы/числа — брать из банков.
// ============================================================

import { TestQuestion } from "./learn";
import { T1_A04_QUESTIONS } from "./content-t1a04";
import productsJson from "@/content/products.json";
import levelsJson from "@/content/levels.json";

export type ProductType = "course" | "test" | "case" | "review" | "finmodel";
export type LevelKey = "rakushka" | "krab" | "barrakuda" | "delfin" | "akula" | "kit";

// ---- Конфиг/копирайт (живёт в коде) ----
export const PRODUCT_TYPES: Record<
  ProductType,
  { label: string; one: string; path: string; href: string; blurb: string }
> = {
  course: { label: "Курсы", one: "Курс", path: "/courses", href: "/catalog?type=course", blurb: "Системное обучение от мелководья к открытому океану" },
  test: { label: "Тесты", one: "Тест", path: "/tests", href: "/catalog?type=test", blurb: "Проверь себя — честно и с разбором каждого ответа" },
  case: { label: "Кейсы", one: "Кейс", path: "/cases", href: "/catalog?type=case", blurb: "Реальные бизнес-ситуации с расчётом риска" },
  review: { label: "Обзоры бизнеса", one: "Обзор", path: "/reviews", href: "/catalog?type=review", blurb: "Разбор ниш на цифрах, а не на историях" },
  finmodel: { label: "Финмодели", one: "Финмодель", path: "/finmodels", href: "/catalog?type=finmodel", blurb: "Рабочие модели и бизнес-планы под твой проект" },
};

export const TOPICS = ["Финансы", "Бизнес", "Маркетинг", "Аналитика", "Управление"];
export const STAGES = ["Обучение", "Проверка", "Применение"];

export const INTENTS = [
  { key: "learn", title: "Учиться", desc: "Курсы и навыки от основ до масштаба", href: "/catalog?type=course" },
  { key: "check", title: "Проверить себя", desc: "Тесты с честным разбором и рангом", href: "/catalog?type=test" },
  { key: "apply", title: "Применить в деле", desc: "Кейсы, обзоры, финмодели под задачу", href: "/catalog?type=finmodel" },
];

// ?v=2 — cache-bust после перенарезки иконок (браузер кэширует по имени файла)
export const OCEAN_RANKS = [
  { key: "rakushka", name: "Ракушка", meaning: "Старт", color: "var(--color-rank-rakushka)", img: "/brand/ranks/rakushka.png?v=11" },
  { key: "krab", name: "Краб", meaning: "Продвижение", color: "var(--color-rank-krab)", img: "/brand/ranks/krab.png?v=11" },
  { key: "barrakuda", name: "Барракуда", meaning: "Ускорение", color: "var(--color-rank-barrakuda)", img: "/brand/ranks/barrakuda.png?v=11" },
  { key: "delfin", name: "Дельфин", meaning: "Мастерство", color: "var(--color-rank-delfin)", img: "/brand/ranks/delfin.png?v=11" },
  { key: "akula", name: "Акула", meaning: "Этапный партнёр", color: "var(--color-rank-akula)", img: "/brand/ranks/akula.png?v=11" },
  { key: "kit", name: "Кит", meaning: "Вершина", color: "var(--color-rank-kit)", img: "/brand/ranks/kit.png?v=11" },
];

// карта key → картинка ранга (для уровней)
export const RANK_IMG: Record<string, string> = Object.fromEntries(
  OCEAN_RANKS.map((r) => [r.key, r.img])
);

// Карты подхода: тематический арт Академии, не персонажи рангов
export const STEPS = [
  { n: "01", title: "Разбираем на реальных данных", desc: "Цифры из БНС, НБРК и 2GIS. Мотивационных историй не будет.", img: "/lessons/fund_m3-ch05_prism-three-views.jpg" },
  { n: "02", title: "Считаем риск, а не мотивируем", desc: "Где утекут деньги и время — видно до того, как ты вложился.", img: "/lessons/fund_m6-ch02_risk-vs-fog.jpg" },
  { n: "03", title: "Даём рабочий инструмент", desc: "Финмодель и бизнес-план, которые открываются в Excel, а не висят в слайдах.", img: "/lessons/arch_m4-ch00_drill-hole.jpg" },
];

// Склонение после числа: plural(42, "вопрос", "вопроса", "вопросов") → "вопроса"
export const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

// Баннер-цифры (доказательства в тоне Ноа) — счётчики ИЗ ДАННЫХ, не зашитые
export const PROOF_STATS = [
  {
    value: "−1.4 млн ₸",
    label: "цена ошибки, которую демо-финмодель кофейни ловит до открытия",
  },
  {
    value: String(T1_A04_QUESTIONS.length),
    label: `${plural(T1_A04_QUESTIONS.length, "вопрос", "вопроса", "вопросов")} в тесте, которые нельзя угадать — только понять`,
  },
  {
    value: String(OCEAN_RANKS.length),
    label: "уровней «Океан» — от Ракушки до Кита",
  },
];

// ЛЕНТА ПРОДУКТОВ — реальные главы-крючки из Академии (карты модулей) + кейсы/тесты.
// hook = название главы из проекта, payoff = её тема, tag = модуль. Ничего выдуманного.
export const HOOKS = [
  { tag: "Академия · Найм", accent: "teal", hook: "При чём тут Брэд Питт?", payoff: "Moneyball: Окленд решал по работе, а не по красоте удара. Так же нанимай ты.", cta: "Открыть главу", href: "/catalog?type=course", img: "/lessons/mgmt_m5-ch03_data-vs-scouts.jpg" },
  { tag: "Академия · Деньги", accent: "teal", hook: "Почему доллар стоит 500 тенге", payoff: "Курс валют — не магия. Что на самом деле двигает цифру на табло.", cta: "Открыть главу", href: "/catalog?type=course", img: "/lessons/fund_m1-ch03_money-evolution.jpg" },
  { tag: "Академия · Поведение", accent: "teal", hook: "Молоко в дальнем углу", payoff: "Путь по магазину построен против тебя. Разбираем, как именно.", cta: "Открыть главу", href: "/catalog?type=course", img: "/lessons/fund_m2-ch04_store-maze.jpg" },
  { tag: "Академия · Время", accent: "teal", hook: "Восьмое чудо света", payoff: "Сложный процент работает на тебя — или против тебя. Третьего нет.", cta: "Открыть главу", href: "/catalog?type=course", img: "/lessons/fund_m4-ch02_compound-curves.jpg" },
  { tag: "Академия · Цены", accent: "teal", hook: "Цена с девятками", payoff: "9 990 вместо 10 000. Почему мозг ведётся и сколько ты переплачиваешь.", cta: "Открыть главу", href: "/catalog?type=course", img: "/lessons/fund_m2-ch01_nine-shadow.jpg" },
  { tag: "Академия · Доли", accent: "danger", hook: "Как не потерять контроль", payoff: "«Социальная сеть»: доля 34% растворилась до 0,03%. Без защит — потеряешь и ты.", cta: "Открыть главу", href: "/catalog?type=course", img: "/lessons/mgmt_m3-ch03_dilution-dissolve.jpg" },
  { tag: "Академия · KPI", accent: "danger", hook: "Эффект кобры", payoff: "Награда за убитых кобр → их стали разводить. Так ломается любой KPI.", cta: "Открыть главу", href: "/catalog?type=course", img: "/lessons/mgmt_m4-ch02_cobra-effect.jpg" },
  { tag: "Кейс · Алматы", accent: "danger", hook: "Раскрутил точку — её забрал арендодатель", payoff: "Весь трафик был чужой. На чьей земле строишь бизнес ты?", cta: "Читать кейс", href: "/cases/case-017", img: "/lessons/arch_m7-ch01_breached-hull.jpg" },
  { tag: "Кейс · Уральск", accent: "danger", hook: "Окупаемость с 10 до 25 лет", payoff: "Две девальвации растянули срок в 2,5 раза. Риск был в расчётах с самого начала.", cta: "Читать кейс", href: "/cases/case-016", img: "/lessons/fund_m6-ch02_risk-vs-fog.jpg" },
  { tag: "Тест · Время", accent: "teal", hook: "Сам уберусь — сэкономлю 2 000 ₸", payoff: "А потеряешь 6 000. Узнай, видишь ли ты цену своего часа.", cta: "Пройти тест", href: "/tests/t1-a04/take", img: "/lessons/fund_m3-ch03_hours-ceiling_v2.jpg" },
  { tag: "Финмодель · Кофейня", accent: "danger", hook: "−1.4 млн ₸ до открытия", payoff: "Точка ещё не работает, а модель уже показывает минус. Почему?", cta: "Открыть модель", href: "/finmodels/finmodel-cafe", img: "/lessons/arch_m6-ch01_unit-econ-scale_v2.jpg" },
];

// ---- Банки вопросов (slug → вопросы). Новые банки регистрировать здесь. ----
const BANKS: Record<string, TestQuestion[]> = {
  "t1-a04": T1_A04_QUESTIONS,
};

// ================= ТИПЫ =================
export type CatalogItem = {
  type: ProductType;
  slug: string;
  title: string;
  blurb: string;
  level: string;
  topic: string;
  stage: string;
  free?: boolean;
  price?: string;
  badge?: string;
  stub?: boolean;
  img?: string | null; // визуал карточки каталога (обзоры/курсы)
  ico?: string | null; // эмодзи-тайл (кейсы)
  interactive?: boolean;
  metric?: { value: string; label: string };
  bank?: string;
  href: string; // вычисляется
  questions?: TestQuestion[]; // только тесты
};

export type Product = CatalogItem; // обратная совместимость
type RawProduct = Omit<CatalogItem, "href" | "questions">;

function hrefFor(p: RawProduct): string {
  switch (p.type) {
    case "test":
      return p.stub ? `/tests/${p.slug}` : `/tests/${p.slug}/take`;
    case "course":
      return `/courses/${p.slug}`; // лендинг с программой; в плеер — кнопкой «Начать»
    case "case":
      return `/cases/${p.slug}`;
    case "review":
      return `/reviews/${p.slug}`;
    case "finmodel":
      return `/finmodels/${p.slug}`;
  }
}

// ---- Сборка каталога из JSON ----
export const CATALOG: CatalogItem[] = (productsJson as RawProduct[]).map((p) => ({
  ...p,
  href: hrefFor(p),
  questions: p.bank ? BANKS[p.bank] ?? [] : p.type === "test" ? [] : undefined,
}));

export const TESTS = CATALOG.filter((x) => x.type === "test");
export const FINMODELS = CATALOG.filter((x) => x.type === "finmodel");
export const CASES = CATALOG.filter((x) => x.type === "case");
export const REVIEWS = CATALOG.filter((x) => x.type === "review");
export const COURSES = CATALOG.filter((x) => x.type === "course");

export const FEATURED: CatalogItem[] = ["finmodel-cafe", "t1-a04", "case-marketplace", "review-coffee"]
  .map((s) => CATALOG.find((x) => x.slug === s))
  .filter(Boolean) as CatalogItem[];

export const COLLECTIONS = [
  {
    title: "Готово к прохождению",
    hook: "Собранный путь: от первого модуля до сертификата ранга",
    img: "/lessons/fund_m4-ch02_compound-curves.jpg",
    filter: (x: CatalogItem) => !x.stub,
    href: "/catalog",
  },
  {
    title: "Бесплатный вход",
    hook: "Начни сегодня, не доставая карту — тест с разбором каждого ответа",
    img: "/lessons/fund_m5-ch01_two-doors.jpg",
    filter: (x: CatalogItem) => !!x.free,
    href: "/catalog?type=test",
  },
  {
    title: "Применить в деле",
    hook: "Кейсы, обзоры и финмодели — инструменты под твою задачу",
    img: "/lessons/mgmt_m1-ch03_captain-bridge.jpg",
    filter: (x: CatalogItem) => ["case", "finmodel", "review"].includes(x.type),
    href: "/catalog?type=finmodel",
  },
];

export function getItem(type: ProductType, slug: string): CatalogItem | undefined {
  return CATALOG.find((x) => x.type === type && x.slug === slug);
}
export function getTestBySlug(slug: string): CatalogItem | undefined {
  return TESTS.find((x) => x.slug === slug);
}

// ================= УРОВНИ =================
export type LContentModule = { id: string; title: string; lessons: number; stub?: boolean };
export type Level = {
  key: LevelKey;
  rankIndex: number;
  name: string;
  tag: string;
  color: string;
  tagline: string;
  archetype?: string;
  locked?: boolean;
  modules: LContentModule[];
  testSlugs: string[];
  caseSlugs: string[];
  reviewSlugs: string[];
};

export const LEVELS = levelsJson as Level[];

export function getLevel(key: string): Level | undefined {
  return LEVELS.find((l) => l.key === key);
}
export function levelItems(level: Level) {
  return {
    tests: level.testSlugs.map((s) => TESTS.find((t) => t.slug === s)).filter(Boolean) as CatalogItem[],
    cases: level.caseSlugs.map((s) => CASES.find((c) => c.slug === s)).filter(Boolean) as CatalogItem[],
    reviews: level.reviewSlugs.map((s) => REVIEWS.find((r) => r.slug === s)).filter(Boolean) as CatalogItem[],
  };
}
