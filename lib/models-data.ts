// Каталог моделей заработка для блока «Фаундер». Данные собирает
// scripts/build_models.py из атласа бизнес-моделей; редактировать content/models.json
// руками не нужно, правка идёт в атлас и пересборкой.
//
// Поле pending: тезис содержит число, которое ещё не сверено по первичке. Такие
// узлы на страницу не выводятся — канон раздела требует источник у каждой цифры.
import modelsJson from "@/content/models.json";

export type ModelText = { text: string; pending?: boolean };

export type ModelItem = {
  kind: string;
  pending?: boolean;
  text?: string;
  lead?: string;
  h?: string;
  warn?: boolean;
  paragraphs?: string[];
  items?: (ModelItem | string)[];
  panels?: ModelItem[];
  pairs?: [string, string][];
  headers?: string[];
  rows?: ModelText[][];
  name?: string;
  formula?: string;
  example?: string;
  kapkan?: string;
};

export type ModelBlock = { label: string; items: ModelItem[] };

export type ModelFlowNode = { who: string; what: string; hero?: boolean; pending?: boolean };

export type ModelCard = {
  id: string;
  num: string;
  slug: string;
  layer: boolean;
  groupKey: string;
  groupTitle: string;
  title: string;
  formula: string;
  flow?: {
    label?: string;
    nodes: ModelFlowNode[];
    arrows: ModelText[];
    note?: ModelText;
    pending?: boolean;
  } | null;
  blocks: ModelBlock[];
  kapkan?: { stamp?: string; paragraphs: string[]; pending?: boolean } | null;
  brands: { brand: string; note: string; badges?: string[]; review?: string | null; pending?: boolean }[];
  reviews: string[];
  course: string;
};

export type ModelGroup = { key: string; title: string; models: string[] };

const data = modelsJson as unknown as {
  meta: { showcase: string[] } & Record<string, unknown>;
  groups: ModelGroup[];
  models: ModelCard[];
};

/** 32 модели заработка, в порядке атласа. Слои m33-m36 идут отдельно. */
export const MODELS: ModelCard[] = data.models.filter((m) => !m.layer);

/** Сквозные слои: маркетинг внутри модели, фишки привлечения, крах и выживание. */
export const MODEL_LAYERS: ModelCard[] = data.models.filter((m) => m.layer);

/** Все карточки одним списком — для боковой панели и статических путей. */
export const MODEL_CARDS: ModelCard[] = data.models;

export const MODEL_GROUPS: ModelGroup[] = data.groups;

/** Витрина хаба «Фаундер»: по одной модели на главу темы «Бизнес-модель». */
export const MODEL_SHOWCASE: string[] = data.meta.showcase;

export function getModel(slug: string): ModelCard | undefined {
  return MODEL_CARDS.find((m) => m.slug === slug);
}

/** Модели, у которых есть написанный разбор бренда — на них ведут перекрёстные ссылки. */
export function modelsForReview(reviewSlug: string): ModelCard[] {
  return MODELS.filter((m) => m.reviews.includes(reviewSlug));
}

/** Показывается ли узел: несверенные цифры на страницу не идут. */
export const shown = <T extends { pending?: boolean }>(n: T | null | undefined): boolean =>
  Boolean(n) && !n!.pending;
