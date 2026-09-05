import fs from "node:fs";
import path from "node:path";

// Глава Академии из готового HTML сборщика (public/academy/<folder>/<file>.html):
// вынимаем содержимое <main>, убираем обёртки старой читалки и приводим блоки
// к разметке, которую стилизует app/learn/[slug]/lesson-content.css.
// Читается на сервере при запросе; результат кешируется в памяти процесса.

export type LessonToc = { id: string; text: string };
export type LessonDoc = {
  title: string;
  cover: string | null;
  html: string;
  toc: LessonToc[];
  minutes: number;
  words: number;
};

const cache = new Map<string, LessonDoc | null>();

const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

// 1234567 → «1 234 567» узкими неразрывными пробелами
const fmtNum = (raw: string) => {
  const n = raw.replace(/[^\d]/g, "");
  if (!n) return raw;
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function loadLesson(folder: string, file: string): LessonDoc | null {
  const key = `${folder}/${file}`;
  if (cache.has(key) && process.env.NODE_ENV === "production") return cache.get(key) ?? null;
  const p = path.join(process.cwd(), "public/academy", folder, `${file}.html`);
  if (!fs.existsSync(p)) {
    cache.set(key, null);
    return null;
  }
  const src = fs.readFileSync(p, "utf8");
  const mainStart = src.indexOf('<main class="page">');
  const mainEnd = src.lastIndexOf("</main>");
  let html = mainStart >= 0 && mainEnd > mainStart ? src.slice(mainStart + '<main class="page">'.length, mainEnd) : src;

  // обложка и заголовок из шапки старой читалки
  const cover = html.match(/<img class="les-hero-img" src="([^"]+)"/)?.[1] ?? null;
  const title = strip(html.match(/<div class="hero">\s*<h1>([\s\S]*?)<\/h1>/)?.[1] ?? "");
  html = html.replace(/<img class="les-hero-img"[^>]*>\s*/g, "");
  html = html.replace(/<div class="hero">[\s\S]*?<\/div>\s*/, "");
  html = html.replace(/<!-- content-like widget -->\s*<div data-content-like[^>]*><\/div>\s*/g, "");

  // счётчики count-up: без скрипта показывали бы 0
  html = html.replace(/<span class="cu" data-to="([^"]*)">[^<]*<\/span>/g, (_m, v) => fmtNum(v));

  // подзаголовки-ярлыки внутри карточек → настоящие h3 с якорями (для оглавления)
  const toc: LessonToc[] = [];
  html = html.replace(/<div class="lb (?:purple|green|orange|red|blue)">([\s\S]*?)<\/div>/g, (_m, t) => {
    const id = `s${toc.length + 1}`;
    toc.push({ id, text: strip(t) });
    return `<h3 id="${id}">${t}</h3>`;
  });
  // заголовки блока «Что вынести» тоже в оглавление не идут, но якорь не нужен
  html = html.replace(/<p class="dropcap">/g, "<p>");
  // «Что вынести» уже стоит бейджем блока: одноимённый заголовок внутри не дублируем
  html = html.replace(/(<span class="tk-badge">Что вынести<\/span>)\s*<h3>\s*Что вынести\.?\s*<\/h3>/g, "$1");

  // ссылки старой читалки на кейсы → адреса сайта
  html = html.replace(/href="(?:\.\.\/)+cases\/(case-[a-z0-9-]+)\.html[^"]*"/g, 'href="/cases/$1"');

  const words = strip(html).split(" ").filter(Boolean).length;
  const doc: LessonDoc = { title, cover, html: html.trim(), toc, minutes: Math.max(1, Math.round(words / 170)), words };
  cache.set(key, doc);
  return doc;
}
