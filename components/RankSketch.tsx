// Эскизы персонажей «Океана»: один штрих, без заливки. Цвет берут из
// currentColor, поэтому одинаково живут в тексте, в ярлыках и в таблицах.
// Ключи совпадают с LevelKey из lib/content.

import type { LevelKey } from "@/lib/content";

const PATHS: Record<LevelKey, string> = {
  rakushka: `<path d="M12 40 C10 26 20 13 35 12 C48 11 56 22 54 33 C52 44 40 50 28 47 C36 46 43 40 42 32 C41 25 34 21 28 24 C22 27 22 34 27 37 C31 39 35 36 34 32"/><path d="M12 40 C18 44 26 47 34 47 C30 51 22 52 16 49"/><path d="M20 22 L14 17 M28 16 L26 10 M38 14 L40 8 M48 20 L54 16"/>`,
  krab: `<ellipse cx="32" cy="37" rx="13" ry="8.5"/><path d="M26 29 L24 23 M38 29 L40 23"/><circle cx="24" cy="21.5" r="1.6"/><circle cx="40" cy="21.5" r="1.6"/><path d="M20 33 C13 30 8 24 12 18 C15 15 19 18 17 22 M12 18 C10 22 12 26 16 27"/><path d="M44 33 C51 30 56 24 52 18 C49 15 45 18 47 22 M52 18 C54 22 52 26 48 27"/><path d="M22 42 L14 48 M25 44 L20 52 M42 42 L50 48 M39 44 L44 52 M30 45 L28 53 M34 45 L36 53"/>`,
  barrakuda: `<path d="M6 33 C16 25 40 24 52 30 L58 33 C46 39 20 40 6 35 Z"/><path d="M52 30 L61 24 L60 41 L52 36"/><path d="M28 27 L31 21 L36 26 M26 39 L28 44 M40 38 L43 42"/><circle cx="50" cy="31.5" r="1.4"/><path d="M45 34 L47 36 M12 33 L18 33"/>`,
  delfin: `<path d="M6 36 C14 24 32 20 46 27 C52 30 56 27 60 22 C58 33 53 38 47 40 C36 45 20 45 6 36 Z"/><path d="M30 25 C31 17 37 15 41 21"/><path d="M26 41 C25 47 31 48 34 43"/><path d="M6 36 L2 32 L10 34"/><circle cx="17" cy="33" r="1.4"/>`,
  akula: `<path d="M4 35 C12 26 30 22 44 28 L56 19 L54 32 C57 34 59 37 61 41 C46 44 26 45 4 37 Z"/><path d="M25 27 L31 11 L39 25"/><path d="M28 41 C27 47 33 49 37 44"/><path d="M42 30 L42 36 M45 31 L45 37 M48 32 L48 37"/><circle cx="13" cy="32" r="1.4"/><path d="M8 36 C12 38 16 38 20 37"/>`,
  kit: `<path d="M4 33 C6 24 18 18 34 19 C46 20 52 27 51 34 C56 32 60 34 62 38 C57 40 52 40 49 39 C42 47 20 48 8 42 C5 40 4 37 4 33 Z"/><path d="M49 39 C53 34 58 30 62 30"/><path d="M8 42 C18 40 30 40 44 41 M4 33 C10 34 16 34 22 33"/><circle cx="14" cy="29" r="1.4"/><path d="M22 45 C21 50 26 52 30 48"/><path d="M33 14 C31 10 32 6 34 4 M37 14 C37 10 39 7 42 6"/>`,
};

// backend id → site key (для живых компонентов, где уровень приходит с API)
export const API2KEY: Record<string, LevelKey> = {
  mollusk: "rakushka", crab: "krab", barracuda: "barrakuda",
  dolphin: "delfin", shark: "akula", whale: "kit",
};

export function RankSketch({
  rank,
  size = 40,
  className = "",
  title,
}: {
  rank: LevelKey;
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      dangerouslySetInnerHTML={{ __html: (title ? `<title>${title}</title>` : "") + PATHS[rank] }}
    />
  );
}

// Ярлык уровня: цвет фона из палитры Notion, текст тёмный того же тона
const TAG: Record<LevelKey, { bg: string; ink: string }> = {
  rakushka: { bg: "var(--color-tag-yellow)", ink: "var(--color-tag-yellow-ink)" },
  krab: { bg: "var(--color-tag-orange)", ink: "var(--color-tag-orange-ink)" },
  barrakuda: { bg: "var(--color-tag-blue)", ink: "var(--color-tag-blue-ink)" },
  delfin: { bg: "var(--color-tag-green)", ink: "var(--color-tag-green-ink)" },
  akula: { bg: "var(--color-tag-gray)", ink: "var(--color-tag-gray-ink)" },
  kit: { bg: "var(--color-tag-purple)", ink: "var(--color-tag-purple-ink)" },
};

const NAME: Record<LevelKey, string> = {
  rakushka: "Ракушка", krab: "Краб", barrakuda: "Барракуда",
  delfin: "Дельфин", akula: "Акула", kit: "Кит",
};

export function RankTag({ rank, className = "" }: { rank: LevelKey; className?: string }) {
  const t = TAG[rank];
  return (
    <span className={`tag ${className}`} style={{ background: t.bg, color: t.ink }}>
      {NAME[rank]}
    </span>
  );
}
