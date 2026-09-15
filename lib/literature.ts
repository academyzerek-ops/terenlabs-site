import literatureJson from "@/content/literature.json";

export type LiteratureItem = {
  slug: string;
  title: string;
  originalTitle: string;
  author: string;
  year: number;
  context: string;
  blurb: string;
  why: string[];
  caution: string;
  topics: string[];
  relatedCase: { title: string; href: string; description: string };
  relatedLesson: { title: string; href: string };
};

export const LITERATURE = literatureJson as LiteratureItem[];

export function getLiterature(slug: string): LiteratureItem | undefined {
  return LITERATURE.find((book) => book.slug === slug);
}

const LESSON_BOOKS: Record<string, string[]> = {
  "course-founder-team:m2-ch03": ["social-network-changed-world"],
};

export function literatureForLesson(track: string, file: string): LiteratureItem[] {
  return (LESSON_BOOKS[`${track}:${file}`] ?? [])
    .map(getLiterature)
    .filter((book): book is LiteratureItem => Boolean(book));
}
