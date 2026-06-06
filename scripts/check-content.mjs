// Проверка целостности контента. Запуск: node scripts/check-content.mjs
import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));

const products = read("content/products.json");
const levels = read("content/levels.json");

const TYPES = ["course", "test", "case", "review", "finmodel"];
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
  if (p.type === "test" && !p.stub && !p.bank) errors.push(`${id}: непустой тест без поля bank`);
}

// --- уровни ---
const has = (type, slug) => products.some((p) => p.type === type && p.slug === slug);
for (const l of levels) {
  for (const s of l.testSlugs || []) if (!has("test", s)) errors.push(`level ${l.key}: testSlug "${s}" не найден`);
  for (const s of l.caseSlugs || []) if (!has("case", s)) errors.push(`level ${l.key}: caseSlug "${s}" не найден`);
  for (const s of l.reviewSlugs || []) if (!has("review", s)) errors.push(`level ${l.key}: reviewSlug "${s}" не найден`);
}

console.log(`Продуктов: ${products.length} · Уровней: ${levels.length}`);
if (warns.length) console.log("\nПредупреждения:\n - " + warns.join("\n - "));
if (errors.length) {
  console.log("\nОШИБКИ:\n - " + errors.join("\n - "));
  process.exit(1);
}
console.log("\n✓ Контент целостный.");
