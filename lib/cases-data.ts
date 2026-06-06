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
};

export const CASE_DOCS: CaseDoc[] = casesJson as CaseDoc[];

export function getCaseDoc(slug: string): CaseDoc | undefined {
  return CASE_DOCS.find((c) => c.slug === slug);
}
