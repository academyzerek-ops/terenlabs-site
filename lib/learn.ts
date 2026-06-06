// Структура обучения. Реальные курсы собираются из content/academy.json
// (генерится scripts/import_content.mjs из основного репо TerenLabs).
import academyJson from "@/content/academy.json";

export type Step =
  | { id: string; kind: "text"; title: string; body: string }
  | { id: string; kind: "video"; title: string; body: string }
  | { id: string; kind: "html"; title: string; src: string; img?: string | null }
  | { id: string; kind: "quiz"; title: string; question: string; options: string[]; correct: number; explain: string };

export type Lesson = { id: string; title: string; steps: Step[] };
export type Module = { id: string; title: string; lessons: Lesson[] };
export type Course = { slug: string; title: string; modules: Module[] };

// ---- Академия: 5 треков → курсы. Урок трека = Module, глава = Lesson c html-шагом ----
export type AcademyChapter = { title: string; file: string; img?: string | null; missing?: boolean };
export type AcademyModule = { id: string; title: string; chapters: AcademyChapter[] };
export type AcademyTrack = {
  key: string;
  slug: string;
  topic: string;
  folder: string;
  title: string;
  subtitle: string;
  chapterTotal: number;
  modules: AcademyModule[];
};

export const ACADEMY: AcademyTrack[] = academyJson as AcademyTrack[];

export const ACADEMY_COURSES: Course[] = ACADEMY.map((t) => ({
  slug: t.slug,
  title: t.title,
  modules: t.modules.map((m) => ({
    id: m.id,
    title: m.title,
    lessons: m.chapters
      .filter((c) => !c.missing)
      .map((c) => ({
        id: `${m.id}-${c.file}`,
        title: c.title,
        steps: [
          {
            id: `${m.id}-${c.file}-s`,
            kind: "html" as const,
            title: c.title,
            src: `/academy/${t.folder}/${c.file}.html`,
            img: c.img,
          },
        ],
      })),
  })),
}));

export function getCourse(slug: string): Course | undefined {
  return ACADEMY_COURSES.find((c) => c.slug === slug);
}

export function getTrack(slug: string): AcademyTrack | undefined {
  return ACADEMY.find((t) => t.slug === slug);
}

export const DEMO_COURSE: Course = {
  slug: "course-finance-base",
  title: "Финансы для основателя",
  modules: [
    {
      id: "m1",
      title: "Модуль 1. Деньги бизнеса",
      lessons: [
        {
          id: "l1",
          title: "Урок 1. Выручка ≠ прибыль",
          steps: [
            { id: "s1", kind: "text", title: "Зачем это", body: "Большинство закрывается не потому, что мало выручки, а потому что путают её с прибылью. Разберём разницу на цифрах — без воды." },
            { id: "s2", kind: "video", title: "Разбор на примере кофейни", body: "Видео 6 минут: как выручка 6 млн ₸ превращается в убыток." },
            { id: "s3", kind: "quiz", title: "Проверка", question: "Выручка 6 000 000 ₸, COGS 35%, постоянные 4 500 000 ₸. Прибыль?", options: ["1 500 000 ₸", "−600 000 ₸", "2 100 000 ₸"], correct: 1, explain: "6 000 000 − 35% (2 100 000) − 4 500 000 = −600 000 ₸. Бизнес в минусе." },
          ],
        },
        {
          id: "l2",
          title: "Урок 2. Постоянные и переменные",
          steps: [
            { id: "s4", kind: "text", title: "Два типа затрат", body: "Переменные растут с продажами (сырьё), постоянные — нет (аренда, ФОТ). Это основа точки безубыточности." },
            { id: "s5", kind: "quiz", title: "Проверка", question: "Аренда кофейни — это какие затраты?", options: ["Переменные", "Постоянные"], correct: 1, explain: "Аренда не зависит от числа проданных чашек — постоянные." },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Модуль 2. Точка безубыточности",
      lessons: [
        {
          id: "l3",
          title: "Урок 3. Считаем порог",
          steps: [
            { id: "s6", kind: "text", title: "Формула", body: "Точка безубыточности = постоянные / вклад на единицу. Ниже неё — убыток, выше — прибыль." },
            { id: "s7", kind: "quiz", title: "Проверка", question: "Вклад на чек 1 560 ₸, постоянные 1 800 000 ₸/мес, 30 раб. дней. Гостей в день для нуля?", options: ["≈38", "≈12", "≈120"], correct: 0, explain: "1 800 000 / (1 560 × 30) ≈ 38 гостей в день." },
          ],
        },
      ],
    },
  ],
};

// ---- Тест ----
export type TestQuestion = { id: string; q: string; options: string[]; correct: number; explain: string };
export const DEMO_TEST: { slug: string; title: string; questions: TestQuestion[] } = {
  slug: "test-unit-economics",
  title: "Тест: юнит-экономика",
  questions: [
    { id: "q1", q: "Что такое CAC?", options: ["Стоимость привлечения клиента", "Средний чек", "Себестоимость"], correct: 0, explain: "CAC = маркетинг и продажи / число привлечённых клиентов." },
    { id: "q2", q: "LTV считается как…", options: ["Выручка × срок жизни", "Маржа × выручку", "ARPU × валовая маржа × срок жизни"], correct: 2, explain: "LTV учитывает маржу, а не голую выручку." },
    { id: "q3", q: "Здоровое отношение LTV/CAC начинается от:", options: ["1", "3", "0.5"], correct: 1, explain: "Ориентир рынка — LTV/CAC ≥ 3." },
    { id: "q4", q: "CAC payback — это:", options: ["Срок окупаемости привлечения", "Возврат товара", "Налоговый вычет"], correct: 0, explain: "Сколько месяцев клиент окупает затраты на своё привлечение." },
    { id: "q5", q: "Churn — это:", options: ["Рост выручки", "Отток клиентов", "Маржа"], correct: 1, explain: "Churn — доля клиентов, уходящих за период." },
  ],
};

// Ранг «Океан» по доле правильных
export function rankByScore(correct: number, total: number) {
  const r = correct / total;
  if (r >= 0.9) return { name: "Кит", meaning: "Вершина", color: "var(--color-rank-kit)" };
  if (r >= 0.75) return { name: "Акула", meaning: "Этапный партнёр", color: "var(--color-rank-akula)" };
  if (r >= 0.6) return { name: "Дельфин", meaning: "Мастерство", color: "var(--color-rank-delfin)" };
  if (r >= 0.4) return { name: "Барракуда", meaning: "Ускорение", color: "var(--color-rank-barrakuda)" };
  if (r >= 0.2) return { name: "Краб", meaning: "Продвижение", color: "var(--color-rank-krab)" };
  return { name: "Ракушка", meaning: "Старт", color: "var(--color-rank-rakushka)" };
}
