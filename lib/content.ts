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

export type ProductType = "course" | "test" | "case" | "review" | "finmodel" | "bm";
export type LevelKey = "rakushka" | "krab" | "barrakuda" | "delfin" | "akula" | "kit";

// ---- Конфиг/копирайт (живёт в коде) ----
export const PRODUCT_TYPES: Record<
  ProductType,
  { label: string; one: string; path: string; href: string; blurb: string }
> = {
  course: { label: "Академия", one: "Глава", path: "/courses", href: "/catalog?type=course", blurb: "Коротко, просто и по делу — без лишней теории" },
  test: { label: "Тесты", one: "Тест", path: "/tests", href: "/catalog?type=test", blurb: "Проверь себя — честно и с разбором каждого ответа" },
  case: { label: "Кейсы", one: "Кейс", path: "/cases", href: "/catalog?type=case", blurb: "Чужой опыт как способ учиться на не своих деньгах" },
  review: { label: "Ниши", one: "Обзор ниши", path: "/reviews", href: "/catalog?type=review", blurb: "Обзоры рынка по нишам: спрос, конкуренция, маржа" },
  finmodel: { label: "Финмодели", one: "Финмодель", path: "/finmodels", href: "/catalog?type=finmodel", blurb: "Рабочие модели и бизнес-планы под твой проект" },
  // Второй регистр контента: мировые бизнес-модели, доллар, без гео и налогов.
  // Учебный модуль Академии «Бизнес-модели» (course-models) — это другое, имена разведены.
  bm: { label: "Разборы брендов", one: "Разбор", path: "/brands", href: "/catalog?type=bm", blurb: "Механика заработка мировых компаний: из чего собран денежный поток" },
};

export const TOPICS = ["Финансы", "Бизнес", "Маркетинг", "Аналитика", "Управление"];
export const STAGES = ["Обучение", "Проверка", "Применение"];

export const INTENTS = [
  { key: "learn", title: "Учиться", desc: "Курсы и навыки от основ до масштаба", href: "/catalog?type=course" },
  { key: "check", title: "Проверить себя", desc: "Тесты с честным разбором и рангом", href: "/catalog?type=test" },
  { key: "apply", title: "Применить в деле", desc: "Кейсы, аналитика, финмодели под задачу", href: "/catalog?type=finmodel" },
];

// ?v=2 — cache-bust после перенарезки иконок (браузер кэширует по имени файла)
export const OCEAN_RANKS = [
  { key: "rakushka", name: "Ракушка", meaning: "Старт", color: "var(--color-rank-rakushka)", img: "/brand/ranks/rakushka.webp?v=13" },
  { key: "krab", name: "Краб", meaning: "Продвижение", color: "var(--color-rank-krab)", img: "/brand/ranks/krab.webp?v=13" },
  { key: "barrakuda", name: "Барракуда", meaning: "Ускорение", color: "var(--color-rank-barrakuda)", img: "/brand/ranks/barrakuda.webp?v=13" },
  { key: "delfin", name: "Дельфин", meaning: "Мастерство", color: "var(--color-rank-delfin)", img: "/brand/ranks/delfin.webp?v=13" },
  { key: "akula", name: "Акула", meaning: "Этапный партнёр", color: "var(--color-rank-akula)", img: "/brand/ranks/akula.webp?v=13" },
  { key: "kit", name: "Кит", meaning: "Вершина", color: "var(--color-rank-kit)", img: "/brand/ranks/kit.webp?v=13" },
];

// карта key → картинка ранга (для уровней)
export const RANK_IMG: Record<string, string> = Object.fromEntries(
  OCEAN_RANKS.map((r) => [r.key, r.img])
);

// Наш ответ: чему учим — универсалы, МСБ, реальность Казахстана (решение Адиля 2026-06-11)
export const STEPS = [
  {
    n: "01",
    title: "Универсалы, а не узкие специалисты",
    desc: "Мы не готовим экономистов и маркетологов. В своём деле ты один отвечаешь за всё — деньги, рынок, людей. Учим видеть бизнес целиком.",
    img: "/lessons/mgmt_m1-ch03_captain-bridge.jpg",
  },
  {
    n: "02",
    title: "Упор на малый бизнес",
    desc: "Все начинают с малого. МСБ — та каша, в которой универсал и закаляется: тут нет отделов, есть ты и твои решения.",
    img: "/lessons/fund_m5-ch05_coin-mountain.jpg",
  },
  {
    n: "03",
    title: "Наша реальность, не западные учебники",
    desc: "Местный менталитет, работа с коллективом, тонкости и нюансы живого бизнеса — то, чего не найдёшь в академических учебниках про чужие рынки.",
    img: "/lessons/fund_m3-ch05_prism-three-views.jpg",
  },
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
    value: "−1.2 млн ₸",
    label: "средняя цена ошибки новичка на старте, которую ловит расчет", 
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
  titleHtml?: string | null; // заголовок карточки с <span class="em"> — витрина Mini App (кейсы)
  tag?: "r" | "y" | "g" | null; // цвет исхода кейса из витрины Mini App
  loc?: string | null; // гео кейса «🇰🇿 KZ» из витрины Mini App
  sector?: string | null; // отрасль разбора бренда (media/sport/auto/retail/platform)
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
    case "bm":
      return `/brands/${p.slug}`;
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
export const BRANDS = CATALOG.filter((x) => x.type === "bm");

export const FEATURED: CatalogItem[] = ["t1-a04", "case-marketplace", "review-coffee"]
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
    title: "Быстрый старт",
    hook: "Начни сегодня: тест с разбором каждого ответа",
    img: "/lessons/fund_m5-ch01_two-doors.jpg",
    filter: (x: CatalogItem) => !!x.free,
    href: "/catalog?type=test",
  },
  {
    title: "Применить в деле",
    hook: "Кейсы, аналитика и финмодели — инструменты под твою задачу",
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
  metaphor?: string; // почему именно этот персонаж — объяснение-метафора
  meaning?: string;  // что уровень означает по навыкам (кратко)
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
