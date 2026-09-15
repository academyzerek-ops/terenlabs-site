import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Button";
import { BookCover } from "@/components/BookCover";
import { Container } from "@/components/Container";
import { getLiterature, LITERATURE } from "@/lib/literature";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return LITERATURE.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = getLiterature(slug);
  if (!book) return {};
  return pageMetadata({
    title: `${book.title} — Литература TerenLabs`,
    description: book.blurb,
    path: `/literature/${book.slug}`,
  });
}

export default async function LiteratureDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = getLiterature(slug);
  if (!book) notFound();

  return (
    <>
      <section className="border-b border-line">
        <Container className="py-10 sm:py-16">
          <nav aria-label="Хлебные крошки" className="mb-8 flex items-center gap-2 text-[13px] text-faint">
            <Link href="/literature" className="hover:text-ink">Литература</Link>
            <span>/</span>
            <span className="truncate">{book.title}</span>
          </nav>

          <div className="grid gap-9 sm:grid-cols-[240px_minmax(0,1fr)] sm:items-center lg:gap-16">
            <BookCover title={book.title} author={book.author} subtitle={book.context} />
            <div>
              <p className="eyebrow">{book.context}</p>
              <h1 className="mt-4 max-w-[16ch] text-[34px] leading-[1.02] sm:text-[48px]">{book.title}</h1>
              <p className="mt-4 text-[14px] text-faint">{book.originalTitle} · {book.author} · {book.year}</p>
              <p className="mt-7 max-w-[58ch] text-[16px] leading-relaxed text-text-2">{book.blurb}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {book.topics.map((topic) => <span key={topic} className="tag">{topic}</span>)}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="grid gap-10 py-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <div>
          <p className="eyebrow">Зачем читать</p>
          <h2 className="mt-3 text-[24px]">Что забрать для своего проекта</h2>
          <div className="mt-7 border-t border-line">
            {book.why.map((point, index) => (
              <div key={point} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 border-b border-line py-5">
                <span className="num text-[12px] text-faint">0{index + 1}</span>
                <p className="text-[15px] leading-relaxed text-body">{point}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[10px] border border-line bg-subtle p-6">
            <p className="eyebrow">Важно</p>
            <p className="mt-3 text-[15px] leading-relaxed text-text-2">{book.caution}</p>
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-8 lg:self-start">
          <Link href={book.relatedLesson.href} className="card-premium group flex flex-col p-5">
            <span className="eyebrow">Сначала понять</span>
            <span className="mt-3 text-[18px] font-semibold leading-snug text-ink">{book.relatedLesson.title}</span>
            <span className="link mt-6 text-[14px]">Открыть главу <Arrow /></span>
          </Link>
          <Link href={book.relatedCase.href} className="card-premium group flex flex-col p-5">
            <span className="eyebrow">Затем проверить</span>
            <span className="mt-3 text-[18px] font-semibold leading-snug text-ink">{book.relatedCase.title}</span>
            <span className="mt-3 text-[14px] leading-relaxed text-text-2">{book.relatedCase.description}</span>
            <span className="link mt-6 text-[14px]">Открыть разбор <Arrow /></span>
          </Link>
          <p className="px-1 pt-2 text-[12px] leading-relaxed text-faint">
            TerenLabs не продаёт книгу и не публикует её текст. Это редакционная рекомендация по теме.
          </p>
        </aside>
      </Container>
    </>
  );
}
