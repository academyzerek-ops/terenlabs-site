// Лёгкий индекс контента для поиска ⌘K.
// Из каждой страницы берём заголовок, описание, все подзаголовки и первый абзац
// каждого раздела. Тела целиком не тащим: файл должен оставаться маленьким и
// грузиться лениво при первом открытии поиска.
//
// Ключ записи совпадает с ключом в CommandSearch:
//   глава Академии — "<slug трека>:<file>", остальное — slug карточки каталога.
//
// Запуск: node scripts/build_search_index.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(p, "utf8");
const CAP = 1200; // символов текста на документ

const ENTITIES = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', laquo: "«", raquo: "»", mdash: "—", ndash: "–", hellip: "…", deg: "°", times: "×", middot: "·", rsquo: "’", shy: "" };

function decode(s) {
  return s
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n] ?? m)
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

const strip = (html) => decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

/** Заголовки целиком + лид-абзацы разделов, равномерно по документу, до CAP. */
function summarize(html) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ");

  const heads = [];
  const leads = [];
  const desc = body.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

  // в главах Академии и обзорах заголовки разделов размечены не тегами h, а
  // классами вёрстки: .lb (подзаголовок), .vs-t (строка таблицы), .tk-t (шаг), .pq (цитата)
  const re = /<(h[1-4])[^>]*>([\s\S]*?)<\/\1>|<(?:div|span|p)[^>]*class=["'][^"']*\b(?:lb|vs-t|tk-t|pq|kx-t|q-t)\b[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span|p)>|<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  let wantP = true;
  while ((m = re.exec(body))) {
    if (m[1] || m[3] !== undefined) {
      const t = strip(m[2] ?? m[3]);
      if (t) heads.push(t.slice(0, 120));
      wantP = true;
    } else if (wantP) {
      const t = strip(m[4]);
      if (t.length > 40) {
        leads.push(t.slice(0, 130));
        wantP = false;
      }
    }
  }

  // заголовки дают больше ключевых слов на символ, поэтому идут первыми
  const parts = [];
  if (desc) parts.push(decode(desc[1]).slice(0, 160));
  parts.push(...heads);
  let used = parts.join(" · ").length;

  // лиды берём равномерно по документу, а не только с начала
  const budget = CAP - used;
  if (budget > 120 && leads.length) {
    const room = Math.max(1, Math.floor(budget / 135));
    const step = Math.max(1, Math.ceil(leads.length / room));
    for (let i = 0; i < leads.length && used < CAP; i += step) {
      parts.push(leads[i]);
      used += leads[i].length + 3;
    }
  }

  // убираем повторы: описание часто дублирует первый абзац
  const seen = new Set();
  const uniq = parts.filter((t) => {
    const k = t.slice(0, 60).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return uniq.join(" · ").slice(0, CAP);
}

const docs = {};
const put = (key, text) => {
  const t = (text || "").trim();
  if (t) docs[key] = t;
};

// 1. Главы Академии
const academy = JSON.parse(read(path.join(ROOT, "content/academy.json")));
let chapters = 0;
for (const track of academy) {
  const dir = path.join(ROOT, "public/academy", track.folder || "");
  if (!track.folder || !fs.existsSync(dir)) continue;
  for (const mod of track.modules) {
    for (const ch of mod.chapters) {
      const file = path.join(dir, `${ch.file}.html`);
      if (!fs.existsSync(file)) continue;
      put(`${track.slug}:${ch.file}`, summarize(read(file)));
      chapters++;
    }
  }
}

// 2. Обзоры ниш
const reviewsDir = path.join(ROOT, "public/reviews-html");
let reviews = 0;
if (fs.existsSync(reviewsDir)) {
  for (const f of fs.readdirSync(reviewsDir)) {
    if (!f.endsWith(".html")) continue;
    put(f.replace(/\.html$/, ""), summarize(read(path.join(reviewsDir, f))));
    reviews++;
  }
}

// 3. Кейсы и разборы брендов: тело лежит в JSON
const flat = (v) => (Array.isArray(v) ? v : [].concat(...Object.values(v).filter(Array.isArray)));
let bodies = 0;
for (const file of ["content/cases.json", "content/brands.json"]) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) continue;
  for (const item of flat(JSON.parse(read(p)))) {
    if (!item.slug) continue;
    const text = [item.sub, item.excerpt, item.body && summarize(item.body)].filter(Boolean).join(" · ");
    put(item.slug, text.slice(0, CAP));
    bodies++;
  }
}

// 4. Аннотации карточек каталога — дешёвое дополнение к заголовку
const products = flat(JSON.parse(read(path.join(ROOT, "content/products.json"))));
for (const p of products) {
  if (!p.slug || !p.blurb) continue;
  docs[p.slug] = docs[p.slug] ? `${p.blurb} · ${docs[p.slug]}`.slice(0, CAP) : p.blurb;
}

const out = path.join(ROOT, "public/search-index.json");
fs.writeFileSync(out, JSON.stringify({ v: 1, k: docs }));
const kb = Math.round(fs.statSync(out).size / 1024);
console.log(`search-index: ${Object.keys(docs).length} документов, ${kb} КБ (глав ${chapters}, обзоров ${reviews}, кейсов и разборов ${bodies})`);
