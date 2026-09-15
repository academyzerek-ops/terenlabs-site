import Link from "next/link";
import { Arrow } from "@/components/Button";
import { BookCover } from "@/components/BookCover";
import { literatureForLesson } from "@/lib/literature";

export function LessonRecommendations({ track, file }: { track: string; file: string }) {
  const books = literatureForLesson(track, file);
  if (books.length === 0) return null;

  const book = books[0];
  return (
    <section className="mt-10 border-t border-line pt-8 sm:mt-14 sm:pt-10" aria-labelledby="continue-topic">
      <p className="eyebrow">Связи</p>
      <h2 id="continue-topic" className="mt-3 text-[22px] sm:text-[24px]">Продолжить по теме</h2>
      <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-text-2">
        Теория закрепляется двумя взглядами: проверяемым разбором и книгой, которая показывает цену решения через людей.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href={book.relatedCase.href} className="card-premium group flex min-h-[220px] flex-col p-5 sm:p-6">
          <span className="eyebrow">Разбор</span>
          <h3 className="mt-4 text-[20px] leading-snug">{book.relatedCase.title}</h3>
          <p className="mt-3 text-[14px] leading-relaxed text-text-2">{book.relatedCase.description}</p>
          <span className="link mt-auto pt-6 text-[14px]">Открыть разбор <Arrow /></span>
        </Link>

        <Link href={`/literature/${book.slug}`} className="card-premium group grid min-h-[220px] grid-cols-[92px_minmax(0,1fr)] gap-5 p-5 sm:p-6">
          <BookCover title={book.title} author={book.author} subtitle={book.context} compact />
          <span className="flex min-w-0 flex-col">
            <span className="eyebrow">Литература</span>
            <span className="mt-4 text-[19px] font-semibold leading-snug text-ink">{book.title}</span>
            <span className="mt-2 text-[13px] text-faint">{book.author} · {book.year}</span>
            <span className="link mt-auto pt-5 text-[14px]">Зачем читать <Arrow /></span>
          </span>
        </Link>
      </div>
    </section>
  );
}
