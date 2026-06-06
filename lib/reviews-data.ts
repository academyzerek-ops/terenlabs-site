// Канонические wiki-обзоры ниш — импортированы scripts/import_content.mjs
import reviewsJson from "@/content/reviews.json";

export type ReviewDoc = { slug: string; title: string; file: string };

export const REVIEW_DOCS: ReviewDoc[] = reviewsJson as ReviewDoc[];

export function getReviewDoc(slug: string): ReviewDoc | undefined {
  return REVIEW_DOCS.find((r) => r.slug === slug);
}
