// Связи «глава курса → разбор бренда». Курс «Фаундер» устроен как теория плюс
// доказательство: главу читают, а потом смотрят, как та же механика работает у
// живой компании. Данные собирает scripts/build_chapter_links.py из матрицы
// `Модули/Startup/_СВЯЗИ.md`, где для каждой главы указано, какой блок разбора
// отвечает на её вопрос.
import linksJson from "@/content/chapter-links.json";

export type ChapterLink = { brand: string; review: string; note: string };

export type ChapterEntry = {
  track: string;
  title: string;
  /** «есть разбор» · «разбор частично» · «есть только сырьё» — состояние покрытия */
  status: string;
  source: string;
  links: ChapterLink[];
};

const links = linksJson as unknown as Record<string, ChapterEntry>;

/** Разборы, иллюстрирующие главу. Ключ — файл главы, например «m3-ch01». */
export function chapterLinks(file: string): ChapterLink[] {
  return links[file]?.links ?? [];
}

export type ChapterRef = { file: string; track: string; title: string; note: string };

/** Главы курса, которые этот разбор иллюстрирует — обратная сторона матрицы. */
export function chaptersForReview(review: string): ChapterRef[] {
  const out: ChapterRef[] = [];
  for (const [file, entry] of Object.entries(links)) {
    const hit = entry.links.find((l) => l.review === review);
    if (hit) out.push({ file, track: entry.track, title: entry.title, note: hit.note });
  }
  return out;
}
