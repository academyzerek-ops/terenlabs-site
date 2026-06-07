// ============================================================
// Импорт реального контента из основного репо TerenLabs в сайт.
// Источник: /Users/adil/Documents/TerenLabs/frontend
//   - ACADEMY_DATA (shell/app.html) → content/academy.json + public/academy/*.html
//   - content/ru/cases/*.html      → content/cases.json (нативный рендер)
//   - content/ru/niches/*.html     → public/reviews-html/*.html + content/reviews.json
//   - products.json: курсы/кейсы/обзоры регенерируются ИЗ ДАННЫХ
// Запуск: node scripts/import_content.mjs
// ============================================================
import fs from "node:fs";
import path from "node:path";

const SRC = "/Users/adil/Documents/TerenLabs/frontend";
const SITE = path.resolve(import.meta.dirname, "..");

const report = { missingChapters: [], missingHero: [], unknownAssets: new Set(), counts: {} };

// ---------- утилиты ----------
const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, s) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
};
const stripTag = (html, re) => html.replace(re, "");

// Вырезать внешние/трекинговые скрипты, шапку .hdr, заменить пути ассетов
function transformEmbedded(html, { keepLocalScripts = false } = {}) {
  let out = html;
  // телеграм, трекер, лайки — не работают вне Mini App
  out = stripTag(out, /<script[^>]*src="https:\/\/telegram\.org[^"]*"[^>]*><\/script>\s*/g);
  out = stripTag(out, /<script[^>]*src="[^"]*tracker\.js[^"]*"[^>]*><\/script>\s*/g);
  out = stripTag(out, /<script[^>]*src="[^"]*content-like\.js[^"]*"[^>]*><\/script>\s*/g);
  if (!keepLocalScripts) {
    out = stripTag(out, /<script[^>]*src="[^"]*lessons\.js[^"]*"[^>]*><\/script>\s*/g);
  }
  // скрипт темы НЕ трогаем: и сайт, и контент хранят тему в localStorage 'tl-theme' —
  // вложенные страницы синхронизируются с сайтом сами
  // шапка Mini App с кнопкой «назад» — у сайта своя
  out = stripTag(out, /<header class="hdr">[\s\S]*?<\/header>\s*/);
  // пути на дизайн-систему и hero-картинки
  out = out.replace(/href="(\.\.\/)+design-system\//g, 'href="/academy-assets/');
  out = out.replace(/src="(\.\.\/)+design-system\//g, 'src="/academy-assets/');
  out = out.replace(/src="\/frontend\/_assets\/academy_hero\//g, 'src="/academy-assets/hero/');
  out = out.replace(/src="(\.\.\/)+_assets\/niche_hero\//g, 'src="/academy-assets/niche_hero/');
  // десктопная надстройка сайта — после родных стилей
  out = out.replace("</head>", '<link rel="stylesheet" href="/embed-web.css">\n</head>');
  // прочие неизвестные /frontend/ ссылки — в отчёт
  for (const m of out.matchAll(/(?:src|href)="(\/frontend\/[^"]+)"/g)) report.unknownAssets.add(m[1]);
  return out;
}

// ---------- 1. АКАДЕМИЯ ----------
const appHtml = read(path.join(SRC, "shell/app.html"));
const adStart = appHtml.indexOf("var ACADEMY_DATA = {");
const adSlice = appHtml.slice(adStart + "var ACADEMY_DATA = ".length);
// найти закрывающую скобку объекта по балансу
let depth = 0, end = 0;
for (let i = 0; i < adSlice.length; i++) {
  if (adSlice[i] === "{") depth++;
  else if (adSlice[i] === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
}
const ACADEMY_DATA = new Function("return " + adSlice.slice(0, end))();

const TRACKS = {
  fund: { slug: "course-fundament", topic: "Финансы" },
  arch: { slug: "course-architect", topic: "Бизнес" },
  mgmt: { slug: "course-management", topic: "Управление" },
  // у маркетинга/финансов нет hero-артов глав — карточке каталога даём тематический арт
  mkt: { slug: "course-marketing", topic: "Маркетинг", fallbackImg: "/lessons/fund_m2-ch04_store-maze.jpg" },
  fin: { slug: "course-finance", topic: "Финансы", fallbackImg: "/lessons/fund_m5-ch05_coin-mountain.jpg" },
};

const academy = [];
for (const [key, t] of Object.entries(ACADEMY_DATA)) {
  const conf = TRACKS[key];
  if (!conf) { console.warn("неизвестный трек:", key); continue; }
  const folder = path.basename(t.folder.replace(/\/$/, "")); // fundament и т.п.
  const srcDir = path.join(SRC, "content/ru/academy", folder);
  let chapterTotal = 0;
  const modules = t.modules.map((m, mi) => {
    const chapters = m.chapters.map((title, ci) => {
      const file = `m${mi + 1}-ch${String((m.chStart ?? 1) + ci).padStart(2, "0")}`;
      const srcFile = path.join(srcDir, file + ".html");
      if (!fs.existsSync(srcFile)) {
        report.missingChapters.push(`${folder}/${file}`);
        return { title, file, missing: true };
      }
      // копия главы с трансформацией
      write(path.join(SITE, "public/academy", folder, file + ".html"), transformEmbedded(read(srcFile)));
      chapterTotal++;
      const hero = path.join(SRC, "_assets/academy_hero", folder, file + ".webp");
      const hasHero = fs.existsSync(hero);
      if (!hasHero) report.missingHero.push(`${folder}/${file}`);
      return { title, file, img: hasHero ? `/academy-assets/hero/${folder}/${file}.webp` : null };
    });
    return { id: `m${mi + 1}`, title: m.name, chapters };
  });
  academy.push({ key, slug: conf.slug, topic: conf.topic, folder, title: t.title, subtitle: t.subtitle, chapterTotal, modules });
}
write(path.join(SITE, "content/academy.json"), JSON.stringify(academy, null, 1));
report.counts.tracks = academy.length;
report.counts.chapters = academy.reduce((s, a) => s + a.chapterTotal, 0);

// дизайн-система и hero-картинки
fs.cpSync(path.join(SRC, "design-system"), path.join(SITE, "public/academy-assets"), { recursive: true });
fs.cpSync(path.join(SRC, "_assets/academy_hero"), path.join(SITE, "public/academy-assets/hero"), { recursive: true });
fs.cpSync(path.join(SRC, "_assets/niche_hero"), path.join(SITE, "public/academy-assets/niche_hero"), { recursive: true });

// ---------- 2. КЕЙСЫ ----------
const casesDir = path.join(SRC, "content/ru/cases");
const cases = [];
for (const f of fs.readdirSync(casesDir).filter((x) => x.endsWith(".html")).sort()) {
  const slug = f.replace(".html", "");
  const html = read(path.join(casesDir, f));
  const pick = (re) => (html.match(re) || [, ""])[1].trim();
  const badge = pick(/<span class="hdr-badge">([^<]*)<\/span>/); // «Кейс · Провал»
  const mod = pick(/<span class="hdr-mod">([^<]*)<\/span>/); // «Кофейня · Уральск»
  const ico = pick(/<span class="hero-ico">([^<]*)<\/span>/);
  const titleHtml = pick(/<h1>([\s\S]*?)<\/h1>/);
  const title = titleHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const sub = pick(/<p class="hero-sub">([\s\S]*?)<\/p>/).replace(/<[^>]+>/g, "").trim();
  // тело: содержимое <main> без hero-блока и скриптов
  let body = (html.match(/<main class="page">([\s\S]*?)<\/main>/) || [, ""])[1];
  body = body.replace(/<div class="hero">[\s\S]*?<\/div>\s*/, "");
  body = body.replace(/<script[\s\S]*?<\/script>/g, "");
  for (const m of body.matchAll(/(?:src|href)="(\/frontend\/[^"]+|\.\.[^"]+)"/g)) report.unknownAssets.add(m[1]);
  cases.push({ slug, title, titleHtml, sub, ico, badge, mod, kind: badge.split("·").pop().trim(), body: body.trim() });
}
write(path.join(SITE, "content/cases.json"), JSON.stringify(cases, null, 1));
report.counts.cases = cases.length;

// ---------- 3. ОБЗОРЫ ----------
const nichesDir = path.join(SRC, "content/ru/niches");
const reviews = [];
for (const f of fs.readdirSync(nichesDir).filter((x) => x.endsWith(".html")).sort()) {
  const base = f.replace("TerenLabs_", "").replace(".html", "");
  const slug = "review-" + base.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  const html = read(path.join(nichesDir, f));
  const titleRaw = (html.match(/<title>([^<]*)<\/title>/) || [, base])[1];
  const title = titleRaw.split("—")[0].split("·")[0].trim();
  // живой подзаголовок обзора — в карточку каталога вместо одинакового текста
  const sub = (html.match(/class="(?:p?hero-sub)">([\s\S]*?)<\/p>/) || [, ""])[1]
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  write(path.join(SITE, "public/reviews-html", slug + ".html"), transformEmbedded(html, { keepLocalScripts: true }));
  reviews.push({ slug, title, sub, file: `/reviews-html/${slug}.html` });
}
write(path.join(SITE, "content/reviews.json"), JSON.stringify(reviews, null, 1));
report.counts.reviews = reviews.length;

// ---------- 4. ОКЕАН: пулы тестов Краб/Барракуда ----------
// Канон Mini App: тест = 10 вопросов, по 1 случайному из каждого архетипа.
// Пороги сдачи: T1≥7, T2≥7, T3≥6 (см. backend/app/routers/ocean.py).
const OCEAN_TESTS = [
  { slug: "crab-t1", rank: "Краб", tag: "T2", pool: "crab.t1", title: "Краб · Теория", floor: 7 },
  { slug: "crab-t2", rank: "Краб", tag: "T2", pool: "crab.t2", title: "Краб · Применение", floor: 7 },
  { slug: "crab-t3", rank: "Краб", tag: "T2", pool: "crab.t3", title: "Краб · Анализ", floor: 6 },
  { slug: "barracuda-t1", rank: "Барракуда", tag: "T3", pool: "barracuda.t1", title: "Барракуда · Теория", floor: 7 },
  { slug: "barracuda-t2", rank: "Барракуда", tag: "T3", pool: "barracuda.t2", title: "Барракуда · Применение", floor: 7 },
  { slug: "barracuda-t3", rank: "Барракуда", tag: "T3", pool: "barracuda.t3", title: "Барракуда · Анализ", floor: 6 },
];
const oceanTestProducts = [];
for (const t of OCEAN_TESTS) {
  const src = path.join(SRC, "products/ocean-assets", t.pool + ".json");
  const pool = JSON.parse(read(src));
  write(path.join(SITE, "public/ocean-pools", t.pool + ".json"), JSON.stringify(pool));
  oceanTestProducts.push({
    type: "test", slug: t.slug, level: t.tag, topic: "Бизнес", stage: "Проверка", free: true,
    title: t.title,
    blurb: `10 вопросов — по одному из каждой темы уровня. Порог сдачи: ${t.floor} из 10.`,
    metric: { value: String(pool.length), label: "вопросов в пуле" },
    price: "Бесплатно", badge: "Океан",
  });
}
report.counts.oceanPools = OCEAN_TESTS.length;

// ---------- 5. PRODUCTS.JSON ----------
const products = JSON.parse(read(path.join(SITE, "content/products.json")));
const keep = products.filter(
  (p) => p.type === "finmodel" || p.type === "test" || (p.type === "case" && p.slug === "case-marketplace")
);
const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};
const courseProducts = academy.map((a) => ({
  type: "course", slug: a.slug, level: "T1", topic: a.topic, stage: "Обучение", free: true,
  title: a.title, blurb: a.subtitle,
  metric: { value: String(a.chapterTotal), label: plural(a.chapterTotal, "глава", "главы", "глав") },
  price: "Бесплатно", badge: "Готов",
  // визуал карточки каталога — первый арт главы трека (или тематический фолбэк)
  img:
    a.modules.flatMap((m) => m.chapters).find((c) => c.img)?.img ??
    TRACKS[a.key]?.fallbackImg ??
    null,
}));
const caseProducts = cases.map((c) => ({
  type: "case", slug: c.slug, level: "T1", topic: "Бизнес", stage: "Применение", free: true,
  title: c.title, blurb: c.sub.replace(/^✍️\s*/, ""), price: "Бесплатно", badge: c.kind || "Кейс",
  ico: c.ico || null, // эмодзи кейса для тайла каталога
}));
const reviewProducts = reviews.map((r) => {
  const base = r.slug.replace("review-", "");
  // имена файлов niche_hero: чаще слитно (autoparts), иногда с подчёркиванием (repair_phone)
  const candidates = [base.replace(/-/g, ""), base.replace(/-/g, "_")].map(
    (b) => `/academy-assets/niche_hero/${b}.webp`
  );
  const heroPath = candidates.find((c) => fs.existsSync(path.join(SITE, "public", c.slice(1))));
  const hasHero = Boolean(heroPath);
  return {
    type: "review", slug: r.slug, level: "T1", topic: "Бизнес", stage: "Применение", free: true,
    title: r.title,
    blurb: r.sub || "Разбор ниши на цифрах: рынок, экономика, риски",
    price: "Бесплатно", badge: "Обзор",
    img: hasHero ? heroPath : null, // фото ниши (из самого обзора) для карточки
  };
});
write(
  path.join(SITE, "content/products.json"),
  JSON.stringify(
    [...keep, ...oceanTestProducts, ...courseProducts, ...caseProducts, ...reviewProducts],
    null,
    1
  )
);
report.counts.products = keep.length + courseProducts.length + caseProducts.length + reviewProducts.length;

// ---------- ОТЧЁТ ----------
console.log("counts:", report.counts);
console.log("missingChapters:", report.missingChapters.length, report.missingChapters.slice(0, 10));
console.log("missingHero:", report.missingHero.length, report.missingHero.slice(0, 5), "…");
console.log("unknownAssets:", [...report.unknownAssets].slice(0, 15));
