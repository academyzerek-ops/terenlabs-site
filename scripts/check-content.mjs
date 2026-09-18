// Проверка целостности контента. Запуск: node scripts/check-content.mjs
import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));

const products = read("content/products.json");
const levels = read("content/levels.json");

// Дубль списка типов из lib/content.ts (ProductType) — новый тип добавлять в оба места
const TYPES = ["course", "test", "case", "review", "finmodel", "bm"];
const TOPICS = ["Финансы", "Бизнес", "Маркетинг", "Аналитика", "Управление"];
const STAGES = ["Обучение", "Проверка", "Применение"];

const errors = [];
const warns = [];

// --- продукты ---
const slugs = new Set();
for (const p of products) {
  const id = `${p.type}/${p.slug}`;
  if (!p.slug || !p.title || !p.blurb) errors.push(`${id}: нет slug/title/blurb`);
  if (!TYPES.includes(p.type)) errors.push(`${id}: неизвестный type "${p.type}"`);
  if (!STAGES.includes(p.stage)) errors.push(`${id}: stage "${p.stage}" не из ${STAGES.join("/")}`);
  if (!TOPICS.includes(p.topic)) warns.push(`${id}: topic "${p.topic}" не из списка`);
  const key = `${p.type}:${p.slug}`;
  if (slugs.has(key)) errors.push(`${id}: дубликат slug`);
  slugs.add(key);
  // океан-тесты (badge «Океан») работают от пулов /ocean-pools/*.json, банк им не нужен
  if (p.type === "test" && !p.stub && !p.bank && p.badge !== "Океан")
    errors.push(`${id}: непустой тест без поля bank`);
}

// --- разборы брендов: у каждой карточки bm должно быть тело в brands.json ---
let brands = [];
try {
  brands = read("content/brands.json");
} catch {
  if (products.some((p) => p.type === "bm")) errors.push("есть продукты типа bm, но нет content/brands.json");
}
const brandBySlug = new Map(brands.map((b) => [b.slug, b]));
for (const p of products.filter((p) => p.type === "bm")) {
  const doc = brandBySlug.get(p.slug);
  if (!doc) errors.push(`bm/${p.slug}: нет записи в brands.json (тело разбора)`);
  else if (!doc.body || !doc.brand || !doc.titleHtml)
    errors.push(`bm/${p.slug}: в brands.json нет body/brand/titleHtml`);
}

// --- уровни ---
const has = (type, slug) => products.some((p) => p.type === type && p.slug === slug);
for (const l of levels) {
  for (const s of l.testSlugs || []) if (!has("test", s)) errors.push(`level ${l.key}: testSlug "${s}" не найден`);
  for (const s of l.caseSlugs || []) if (!has("case", s)) errors.push(`level ${l.key}: caseSlug "${s}" не найден`);
  for (const s of l.reviewSlugs || []) if (!has("review", s)) errors.push(`level ${l.key}: reviewSlug "${s}" не найден`);
}

console.log(`Продуктов: ${products.length} · Уровней: ${levels.length} · Разборов брендов: ${brands.length}`);
if (warns.length) console.log("\nПредупреждения:\n - " + warns.join("\n - "));
if (errors.length) {
  console.log("\nОШИБКИ:\n - " + errors.join("\n - "));
  process.exit(1);
}
console.log("\n✓ Контент целостный.");
