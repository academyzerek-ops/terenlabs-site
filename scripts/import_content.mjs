// ============================================================
// Импорт реального контента из основного репо TerenLabs в сайт.
// Источник по умолчанию: /Users/adil/TerenLabs-zerek/frontend — worktree ветки main.
// Читается только содержание (content/, design-system/, _assets/, products/):
// код Mini App (shell/) сайту больше не нужен и может быть удалён.
// (прод). Рабочее дерево /Users/adil/TerenLabs стоит на другой ветке и отстаёт
// по обзорам (нет пекарни) — импорт из него снёс бы контент на сайте.
//   - content/ru/academy/_manifest.json → content/academy.json + public/academy/*.html
//   - content/ru/cases/*.html      → content/cases.json (нативный рендер)
//   - content/ru/niches/*.html     → public/reviews-html/*.html + content/reviews.json
//   - products.json: курсы/кейсы/обзоры регенерируются ИЗ ДАННЫХ
// Запуск: node scripts/import_content.mjs
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

// Источник переопределяется: TL_SRC=/path/to/worktree/frontend node scripts/import_content.mjs
// Дефолт — worktree main (TerenLabs-zerek), НЕ рабочее дерево /Users/adil/TerenLabs:
// оно стоит на ветке калибровки и отстаёт по обзорам (аудит 23.08, SITE-04).
const SRC = process.env.TL_SRC || "/Users/adil/TerenLabs-zerek/frontend";
const SITE = path.resolve(import.meta.dirname, "..");

// Версия картинок: обложки перекрашены 09.2026, кэш браузера надо сбить
const IMG_V = "v=8";
const report = { missingChapters: [], unknownAssets: new Set(), counts: {} };

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
  out = out.replace(/src="(\.\.\/)+_assets\/niche_hero\//g, 'src="/academy-assets/niche_hero/');
  out = out.replace(/(\/academy-assets\/(?:niche_hero|cases_hero)\/[^"?]+\.webp)"/g, `$1?${IMG_V}"`);
  // карточки «Реальный кейс» в главах: относительная ссылка Mini App → страница кейса
  // на сайте; window.top — глава живёт в iframe плеера курса
  out = out.replace(/location\.href='(\.\.\/)+cases\/(case-\d+)\.html'/g, "window.top.location.href='/cases/$2'");
  // десктопная надстройка сайта — после родных стилей
  out = out.replace("</head>", '<link rel="stylesheet" href="/embed-web.css?v=10">\n</head>');
  // прочие неизвестные /frontend/ ссылки — в отчёт
  for (const m of out.matchAll(/(?:src|href)="(\/frontend\/[^"]+)"/g)) report.unknownAssets.add(m[1]);
  return out;
}

// Последний абзац-крючок «В следующей главе…/Что будет дальше» → класс nextup
// (forward-карточка в embed-web.css). Меняем только тег <p>, текст не трогаем.
function markNextup(html) {
  const re = /<p>(?:\s*<(?:strong|span|em|b)[^>]*>\s*)?(?:В\s+следующ|Что будет дальше)/g;
  let last = null, m;
  while ((m = re.exec(html)) !== null) last = m;
  if (!last) return html;
  return html.slice(0, last.index) + '<p class="nextup">' + html.slice(last.index + 3);
}

// ---------- 1. АКАДЕМИЯ ----------
// Структура Академии лежит отдельным файлом рядом с содержанием. Раньше её
// вынимали из кода Mini App (переменная ACADEMY_DATA в shell/app.js), и сайт
// не собирался без него. Mini App удаляется, содержание остаётся.
const manifestPath = path.join(SRC, "content/ru/academy/_manifest.json");
if (!fs.existsSync(manifestPath)) throw new Error("нет манифеста Академии: " + manifestPath);
const ACADEMY_DATA = JSON.parse(read(manifestPath));

// Названия треков в Mini App несут хвост «малого бизнеса». На сайте блок уже
// называется «Предприниматель», хвост сужал и повторял его: переименовываем
// здесь, чтобы не трогать прод Mini App. Ключ — исходное название.
const RENAME = {
  "Менеджмент малого бизнеса": "Менеджмент",
  "Маркетинг малого бизнеса": "Маркетинг",
  "Финансы малого бизнеса": "Финансы",
  "Пять антипаттернов KPI в малом бизнесе": "Пять антипаттернов KPI",
};
const rename = (s) => RENAME[s] ?? s;

// Обложка главы: 3D-рендеры с синим неоном не легли в стиль сайта, а рисовать 284
// новых картинки дороже, чем они стоят. Страница главы идёт текстом, рисунок несут
// карточки трека и урока.
const stripHero = (html) => html.replace(/<img class="les-hero-img"[^>]*>\s*/g, "");

const TRACKS = {
  fund: { slug: "course-fundament", topic: "Финансы" },
  arch: { slug: "course-architect", topic: "Бизнес" },
  mgmt: { slug: "course-management", topic: "Управление" },
  mkt: { slug: "course-marketing", topic: "Маркетинг" },
  fin: { slug: "course-finance", topic: "Финансы" },
  legal: { slug: "course-legal", topic: "Бизнес" },
  models: { slug: "course-models", topic: "Бизнес" }, // «Бизнес-модели» — 7-й трек (июль 2026)
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
        return { title: rename(title), file, missing: true };
      }
      // копия главы с трансформацией; hero-картинку срезаем — страница главы идёт текстом
      write(path.join(SITE, "public/academy", folder, file + ".html"),
        stripHero(markNextup(transformEmbedded(read(srcFile)))).replace("</body>", '<script src="/review-enhance.js?v=3" defer></script>\n</body>'));
      chapterTotal++;
      return { title: rename(title), file, img: null };
    });
    return { id: `m${mi + 1}`, title: m.name, chapters };
  });
  academy.push({ key, slug: conf.slug, topic: conf.topic, folder, title: rename(t.title), subtitle: t.subtitle, chapterTotal, modules });
}
// Дополнительные треки из vault-репо: папка с _track.json (сборщик build_academy.py, cfg.manifest).
// Сейчас это «От идеи до инвестиций» (startup) для хаба «Стартап».
const EXTRA_SRC = process.env.TL_EXTRA_SRC || "/Users/adil/TerenLabs/frontend";
const EXTRA_TRACKS = {
  startup: {
    slug: "course-startup", topic: "Стартап", hub: "startup",
    split: [
      { mod: 1, slug: "course-founder-fork",   title: "Развилка",              subtitle: "Своя выручка или чужие деньги и что на самом деле покупает инвестор" },
      { mod: 2, slug: "course-founder-team",   title: "Основание компании",    subtitle: "Форма компании, кофаундер, доли и вестинг, первые наёмные, опционы" },
      { mod: 3, slug: "course-founder-market", title: "Есть ли здесь бизнес",  subtitle: "Размер рынка, конкуренты, спрос и признаки мёртвой идеи" },
      { mod: 4, slug: "course-founder-model",  title: "Как он зарабатывает",   subtitle: "Три вопроса модели, шесть моделей заработка и цена" },
      { mod: 5, slug: "course-founder-unit",   title: "Первые деньги и счёт",  subtitle: "Первая версия, первые продажи, юнит-экономика, отток, runway" },
      { mod: 6, slug: "course-founder-pivot",  title: "Когда не сходится",     subtitle: "Разворот и сокращение расходов, когда денег осталось на 4 месяца" },
      { mod: 7, slug: "course-founder-invest", title: "Деньги",                subtitle: "Кто даёт, лестница раундов, питч и дек, размытие, SAFE, term sheet" },
      { mod: 8, slug: "course-founder-exit",   title: "Выход",                 subtitle: "Продажа компании, вторичные сделки, размещение на бирже" },
    ],
  },
};
for (const [key, conf] of Object.entries(EXTRA_TRACKS)) {
  const dir = path.join(EXTRA_SRC, "content/ru/academy", key);
  const manifestPath = path.join(dir, "_track.json");
  if (!fs.existsSync(manifestPath)) { console.warn("нет манифеста трека:", manifestPath); continue; }
  const t = JSON.parse(read(manifestPath));
  const folder = t.folder || key;
  let chapterTotal = 0;
  const modules = t.modules.map((m) => {
    const chapters = m.chapters.map((title, ci) => {
      const file = `m${m.n}-ch${String(ci + 1).padStart(2, "0")}`;
      const srcFile = path.join(dir, file + ".html");
      if (!fs.existsSync(srcFile)) { report.missingChapters.push(`${folder}/${file}`); return { title, file, missing: true }; }
      const html = stripHero(markNextup(transformEmbedded(read(srcFile))));
      write(path.join(SITE, "public/academy", folder, file + ".html"),
        html.replace("</body>", '<script src="/review-enhance.js?v=3" defer></script>\n</body>'));
      chapterTotal++;
      return { title: rename(title), file, img: null };
    });
    return { id: `m${m.n}`, title: m.name, chapters };
  });
  if (conf.split) {
    // Блок «Фаундер» идёт темами, как программа акселератора: один толстый трек
    // «От идеи до инвестиций» разбирается на самостоятельные треки по темам.
    // Папка сборки и файлы глав общие — делится только витрина сайта.
    for (const sp of conf.split) {
      const mod = modules.find((m) => m.id === `m${sp.mod}`);
      if (!mod) { console.warn("нет модуля для трека:", sp.slug, sp.mod); continue; }
      academy.push({
        key: `${key}-${sp.mod}`, slug: sp.slug, topic: conf.topic, hub: conf.hub, folder,
        title: sp.title, subtitle: sp.subtitle,
        chapterTotal: mod.chapters.filter((c) => !c.missing).length,
        modules: [mod],
      });
    }
  } else {
    academy.push({ key, slug: conf.slug, topic: conf.topic, hub: conf.hub, folder, title: rename(t.title), subtitle: t.subtitle, chapterTotal, modules });
  }
}
write(path.join(SITE, "content/academy.json"), JSON.stringify(academy, null, 1));
report.counts.tracks = academy.length;
report.counts.chapters = academy.reduce((s, a) => s + a.chapterTotal, 0);

// дизайн-система и hero-картинки
// design-system: только недостающие файлы, lessons.css несёт локальную тёмную тему (не затирать)
fs.cpSync(path.join(SRC, "design-system"), path.join(SITE, "public/academy-assets"), { recursive: true, force: false, errorOnExist: false });
// Обложки: копируем только отсутствующие файлы. В ветке minimal обложки перекрашены под тёмную тему
// (Nano Banana, 09.2026), и оригиналы из основного дерева не должны их затирать.
const keepExisting = { recursive: true, force: false, errorOnExist: false };
fs.cpSync(path.join(SRC, "_assets/niche_hero"), path.join(SITE, "public/academy-assets/niche_hero"), keepExisting);
fs.cpSync(path.join(SRC, "_assets/cases_hero"), path.join(SITE, "public/academy-assets/cases_hero"), keepExisting);

// ---------- 2. КЕЙСЫ ----------
const casesDir = path.join(SRC, "content/ru/cases");
// эмодзи кейсов теперь нет в main HTML (заменены hero-картинкой) — сохраняем из прошлого cases.json
const prevIco = {};
try {
  for (const c of JSON.parse(read(path.join(SITE, "content/cases.json")))) if (c.ico) prevIco[c.slug] = c.ico;
} catch {}

// Канон карточек кейсов: цвет-тэг r/y/g, гео-флаг, короткий заголовок с
// <span class="em">-акцентом, выжимка и КУРАТОРСКИЙ ПОРЯДОК. Site рендерит
// карточки из этих полей, а не из hero кейса. Раньше всё это выковыривалось
// регуляркой из вёрстки Mini App; теперь лежит отдельным файлом содержания.
const cardsPath = path.join(SRC, "content/ru/cases/_cards.json");
if (!fs.existsSync(cardsPath)) throw new Error("нет карточек кейсов: " + cardsPath);
const miniCards = new Map(Object.entries(JSON.parse(read(cardsPath))));

const cases = [];
for (const f of fs.readdirSync(casesDir).filter((x) => x.endsWith(".html")).sort()) {
  const slug = f.replace(".html", "");
  const html = read(path.join(casesDir, f));
  const pick = (re) => (html.match(re) || [, ""])[1].trim();
  const badge = pick(/<span class="hdr-badge">([^<]*)<\/span>/); // «Кейс · Провал»
  const mod = pick(/<span class="hdr-mod">([^<]*)<\/span>/); // «Кофейня · Уральск»
  const ico = pick(/<span class="hero-ico">([^<]*)<\/span>/) || prevIco[slug] || "";
  const image = `/academy-assets/cases_hero/${slug}.webp?${IMG_V}`;
  const titleHtml = pick(/<h1>([\s\S]*?)<\/h1>/);
  const title = titleHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const sub = pick(/<p class="hero-sub">([\s\S]*?)<\/p>/)
    .replace(/<[^>]+>/g, "")
    .replace(/^[\p{Extended_Pictographic}️‍\s]+/u, "") // эмодзи рендерятся тофу-квадратом
    .trim();
  // тело: содержимое <main> без hero-блока и скриптов
  let body = (html.match(/<main class="page">([\s\S]*?)<\/main>/) || [, ""])[1];
  body = body.replace(/<img class="les-hero-img"[\s\S]*?>\s*/, ""); // hero-картинка идёт отдельным полем image
  body = body.replace(/<div class="hero">[\s\S]*?<\/div>\s*/, "");
  body = body.replace(/<script[\s\S]*?<\/script>/g, "");
  for (const m of body.matchAll(/(?:src|href)="(\/frontend\/[^"]+|\.\.[^"]+)"/g)) report.unknownAssets.add(m[1]);
  const card = miniCards.get(slug);
  if (!card) report.missingChapters.push(`витрина Mini App без карточки: ${slug}`);
  cases.push({
    slug, title, titleHtml, sub, ico, image, badge, mod,
    kind: badge.split("·").pop().trim(),
    // поля карточки — из витрины Mini App
    tag: card?.tag ?? null,
    loc: card?.loc ?? null,
    cardTitleHtml: card?.cardTitleHtml ?? null,
    excerpt: card?.excerpt ?? null,
    order: card?.order ?? 9999,
    body: body.trim(),
  });
}
// порядок ленты = кураторский порядок витрины Mini App
cases.sort((a, b) => a.order - b.order);
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
  // эффекты обзоров: пончик-hover, count-up, появление блоков
  const embedded = transformEmbedded(html, { keepLocalScripts: true })
    .replace("</body>", '<script src="/review-enhance.js?v=3" defer></script>\n</body>');
  write(path.join(SITE, "public/reviews-html", slug + ".html"), embedded);
  reviews.push({ slug, title, sub, file: `/reviews-html/${slug}.html` });
}
write(path.join(SITE, "content/reviews.json"), JSON.stringify(reviews, null, 1));
report.counts.reviews = reviews.length;

// ---------- 4. ОКЕАН: пулы закрытых тестов Краб/Барракуда ----------
// Канон Mini App (v9.2, июль 2026): тест = 10 вопросов, по 1 из каждого архетипа.
// Краб — по типу (Теория/Расчёты/Универсальный), Барракуда — по ДИСЦИПЛИНАМ
// (Финансы/Маркетинг/Менеджмент/Право/Универсальный — бэк гейтит уровень всеми 5).
// Пулы в клиенте БЕЗ ответов — правильность и разбор считает сервер (/attempt).
// Пороги: TEST_FLOORS в frontend/products/ocean.js (t3=6, остальные 7).
const OCEAN_TESTS = [
  { slug: "crab-t1", rank: "Краб", tag: "T2", pool: "crab.t1", title: "Краб · Теория", topic: "Бизнес", floor: 7 },
  { slug: "crab-t2", rank: "Краб", tag: "T2", pool: "crab.t2", title: "Краб · Расчёты", topic: "Финансы", floor: 7 },
  { slug: "crab-t3", rank: "Краб", tag: "T2", pool: "crab.t3", title: "Краб · Универсальный", topic: "Бизнес", floor: 6 },
  { slug: "barracuda-fin", rank: "Барракуда", tag: "T3", pool: "barracuda.fin", title: "Барракуда · Финансы", topic: "Финансы", floor: 7 },
  { slug: "barracuda-mkt", rank: "Барракуда", tag: "T3", pool: "barracuda.mkt", title: "Барракуда · Маркетинг", topic: "Маркетинг", floor: 7 },
  { slug: "barracuda-mgmt", rank: "Барракуда", tag: "T3", pool: "barracuda.mgmt", title: "Барракуда · Менеджмент", topic: "Управление", floor: 7 },
  { slug: "barracuda-law", rank: "Барракуда", tag: "T3", pool: "barracuda.law", title: "Барракуда · Право", topic: "Бизнес", floor: 7 },
  { slug: "barracuda-universal", rank: "Барракуда", tag: "T3", pool: "barracuda.universal", title: "Барракуда · Универсальный", topic: "Бизнес", floor: 7 },
];
// Открытые тесты (Дельфин/Акула): ответ своими словами, TEREN-AI оценивает по
// рубрике на сервере (/attempt_open и /attempt_shark). Дельфин — 5 из пула,
// Акула — 10 вопросов кейса по порядку, с общей виньеткой.
const OCEAN_OPEN_TESTS = [
  { slug: "dolphin-case1", rank: "Дельфин", tag: "T4", pool: "dolphin.case1", title: "Дельфин · Деньги под контролем", topic: "Финансы", qCount: 5 },
  { slug: "dolphin-case2", rank: "Дельфин", tag: "T4", pool: "dolphin.case2", title: "Дельфин · Право и партнёрство", topic: "Бизнес", qCount: 5 },
  { slug: "dolphin-case3", rank: "Дельфин", tag: "T4", pool: "dolphin.case3", title: "Дельфин · Рост и метрики", topic: "Маркетинг", qCount: 5 },
  ...[
    ["SHARK-CASE-01", "Пекарня"], ["SHARK-CASE-02", "Корпусная мебель"], ["SHARK-CASE-03", "Розлив воды"],
    ["SHARK-CASE-05", "Мини-маркет"], ["SHARK-CASE-06", "Аптека"], ["SHARK-CASE-07", "Селлер на маркетплейсе"],
    ["SHARK-CASE-08", "Салон красоты"], ["SHARK-CASE-09", "Фитнес-зал"], ["SHARK-CASE-10", "Кинотеатр"],
    ["SHARK-CASE-04", "Столовая"], ["SHARK-CASE-11", "Фастфуд-кафе"], ["SHARK-CASE-12", "Кофейня с посадкой"],
  ].map(([id, name]) => ({
    slug: `shark-${id}`, rank: "Акула", tag: "T5", pool: `shark.${id}`,
    title: `Акула · ${name}`, topic: "Бизнес", qCount: 10,
  })),
];

// старые пулы (barracuda.t1-t3 и полные с ответами) — снести, чтобы не текли ответы
fs.rmSync(path.join(SITE, "public/ocean-pools"), { recursive: true, force: true });
const oceanTestProducts = [];
for (const t of OCEAN_TESTS) {
  const src = path.join(SRC, "products/ocean-assets", t.pool + ".json");
  const pool = JSON.parse(read(src));
  if (pool.some((q) => q.a !== undefined || q.explanations))
    throw new Error(`пул ${t.pool} содержит ответы — на сайт кладём только stripped-версии`);
  write(path.join(SITE, "public/ocean-pools", t.pool + ".json"), JSON.stringify(pool));
  oceanTestProducts.push({
    type: "test", slug: t.slug, level: t.tag, topic: t.topic, stage: "Проверка", free: true,
    title: t.title,
    blurb: `10 вопросов — по одному из каждой темы уровня. Порог сдачи: ${t.floor} из 10. Результат считает сервер «Океана».`,
    metric: { value: String(pool.length), label: "вопросов в пуле" },
    badge: "Океан",
  });
}
for (const t of OCEAN_OPEN_TESTS) {
  const src = path.join(SRC, "products/ocean-assets", t.pool + ".json");
  const pool = JSON.parse(read(src));
  write(path.join(SITE, "public/ocean-pools", t.pool + ".json"), JSON.stringify(pool));
  const isShark = t.rank === "Акула";
  oceanTestProducts.push({
    type: "test", slug: t.slug, level: t.tag, topic: t.topic, stage: "Проверка", free: true,
    title: t.title,
    blurb: isShark
      ? `Финальный кейс «Океана»: ${t.qCount} открытых вопросов по порядку, отвечаешь своими словами — TEREN-AI оценивает по рубрике. Порог 7 из 10.`
      : `Открытый кейс: ${t.qCount} вопросов, отвечаешь своими словами — TEREN-AI оценивает по рубрике. Порог 7 из 10.`,
    metric: { value: String(pool.length), label: isShark ? "вопросов в кейсе" : "вопросов в пуле" },
    badge: "Океан",
  });
}
report.counts.oceanPools = OCEAN_TESTS.length + OCEAN_OPEN_TESTS.length;

// ---------- 5. PRODUCTS.JSON ----------
const products = JSON.parse(read(path.join(SITE, "content/products.json")));
// океан-тесты регенерируются выше — старые копии не оставляем (в т.ч. снятые с прода
// barracuda-t1..t3: набор тестов уровня меняется, «чужих» crab-*/barracuda-* не держим)
// ВСЕ океан-префиксы: dolphin/shark отсутствовали в фильтре, и их тесты
// задваивались при каждом импорте (найдено по React-warning 09.08)
const isOceanSlug = (s) => /^(crab|barracuda|dolphin|shark)-/.test(s);
const keep = products.filter(
  (p) =>
    (p.type === "finmodel" ||
      (p.type === "test" && !isOceanSlug(p.slug)) ||
      (p.type === "case" && p.slug === "case-marketplace"))
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
  badge: "Готов",
  // визуал карточки каталога — обложка трека
  img: `/academy-assets/tracks/track-${a.slug.replace(/^course-/, "")}.webp?${IMG_V}`,
}));
const caseProducts = cases.map((c) => ({
  type: "case", slug: c.slug, level: "T1", topic: "Бизнес", stage: "Применение", free: true,
  // карточка — как в Mini App: короткий заголовок с em-акцентом, выжимка, цвет-тэг, гео
  title: (c.cardTitleHtml || c.title).replace(/<[^>]+>/g, ""),
  titleHtml: c.cardTitleHtml || null,
  blurb: c.excerpt || c.sub.replace(/^[\p{Extended_Pictographic}️‍\s]+/u, ""),
  badge: c.kind || "Кейс",
  tag: c.tag || null, // r | y | g — цвет исхода из витрины Mini App
  loc: c.loc || null, // «🇰🇿 KZ»
  ico: c.ico || null, // эмодзи кейса (фолбэк, если нет кадра)
  img: c.image || null, // кинокадр кейса → постер-тайл каталога (как у обзоров)
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
    badge: "Обзор",
    // фото ниши из самого обзора; без него — тематический фолбэк, а не серая дыра
    img: hasHero ? `${heroPath}?${IMG_V}` : "/lessons/fund_m6-ch01_asset-lens_v2.jpg",
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
// sync bm: разборы брендов живут в content/brands.json (scripts/build_brands.py из vault); карточки каталога подмешиваем сюда
{
  const brandsPath = path.join(SITE, "content/brands.json");
  if (fs.existsSync(brandsPath)) {
    const pj = path.join(SITE, "content/products.json");
    const products = JSON.parse(read(pj)).filter((x) => x.type !== "bm");
    for (const b of JSON.parse(read(brandsPath))) { const { body, ...rest } = b; products.push(rest); }
    write(pj, JSON.stringify(products, null, 1));
  }
}

report.counts.products = keep.length + courseProducts.length + caseProducts.length + reviewProducts.length;

// ---------- 6. ТЕМАТИЧЕСКИЕ ЭЛЕМЕНТЫ ОБЗОРОВ (фоны A) ----------
// Для каждой ниши догенерить недостающие /elements/<code>_a.png|_b.png
// (оборудование + расходники). Идемпотентно: готовые пропускаются, новая ниша
// получает промпты от Gemini. Не валит импорт, если генерация недоступна.
try {
  const elemScript = "/Users/adil/Documents/TerenLabs/scripts/gen_review_elements.py";
  if (fs.existsSync(elemScript)) {
    console.log("→ обзорные элементы: проверяю/догенериваю…");
    execFileSync("python3", [elemScript], { stdio: "inherit", timeout: 50 * 60 * 1000 });
  }
} catch (e) {
  console.warn("⚠ генерация обзорных элементов пропущена:", e.message);
}

// ---------- ОТЧЁТ ----------
console.log("counts:", report.counts);
console.log("missingChapters:", report.missingChapters.length, report.missingChapters.slice(0, 10));
console.log("unknownAssets:", [...report.unknownAssets].slice(0, 15));

// ---------- ИНДЕКС ПОИСКА ----------
// Контент обновился — пересобираем /search-index.json, иначе ⌘K ищет по старому.
try {
  execFileSync("node", [path.join(import.meta.dirname, "build_search_index.mjs")], { stdio: "inherit" });
} catch (e) {
  console.warn("⚠ индекс поиска не пересобран:", e.message);
}

// ---------- ИКОНКИ ТУШЬЮ ----------
// Свежие главы приходят с эмодзи — сразу меняем их на рисованные иконки.
try {
  execFileSync("node", [path.join(import.meta.dirname, "ink_icons.mjs")], { stdio: "inherit" });
} catch (e) {
  console.warn("⚠ иконки не проставлены:", e.message);
}
