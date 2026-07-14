// Реальные кейсы канала — распарсены из основного репо scripts/import_content.mjs
import casesJson from "@/content/cases.json";

export type CaseDoc = {
  slug: string;
  title: string;
  titleHtml: string;
  sub: string;
  ico: string;
  badge: string;
  mod: string;
  kind: string; // Провал / Успех / …
  body: string; // готовый HTML тела (классы lessons.css → case-content.css)
  image?: string; // hero-картинка кейса (cases_hero/<slug>.webp)
};

// Рантайм-guard: контент генерится в ДРУГОМ репо (import_content.mjs). При дрейфе
// схемы TS остаётся зелёным, но `body`/`titleHtml` идут в dangerouslySetInnerHTML —
// поэтому отбрасываем записи без обязательных строковых полей (а не падаем в рантайме).
function isValidCase(c: unknown): c is CaseDoc {
  if (!c || typeof c !== "object") return false;
  const o = c as Record<string, unknown>;
  return (
    typeof o.slug === "string" &&
    typeof o.title === "string" &&
    typeof o.titleHtml === "string" &&
    typeof o.body === "string"
  );
}

const rawCases = casesJson as unknown[];
export const CASE_DOCS: CaseDoc[] = rawCases.filter(isValidCase);

if (process.env.NODE_ENV !== "production" && CASE_DOCS.length !== rawCases.length) {
  console.warn(
    `[cases-data] отброшено ${rawCases.length - CASE_DOCS.length} кейсов с битой схемой ` +
      "(нет slug/title/titleHtml/body) — проверь import_content.mjs в основном репо.",
  );
}

export function getCaseDoc(slug: string): CaseDoc | undefined {
  return CASE_DOCS.find((c) => c.slug === slug);
}
