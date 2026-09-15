import Link from "next/link";
import { Arrow } from "@/components/Button";
import { BookCover } from "@/components/BookCover";
import { Container } from "@/components/Container";
import { LITERATURE } from "@/lib/literature";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Литература — TerenLabs",
  description: "Книги по темам Академии: зачем читать, к какой главе вернуться и какой разбор посмотреть рядом.",
  path: "/literature",
});

export default function LiteraturePage() {
  return (
    <>
      <section className="border-b border-line">
        <Container className="py-14 sm:py-20">
          <p className="eyebrow">Разбирать · Литература</p>
          <h1 className="mt-3 max-w-[18ch] text-[30px] leading-[1.08] sm:text-[42px]">Книги как продолжение главы</h1>
          <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">
            Не библиотека текстов и не магазин. Здесь только рекомендации по теме: что именно искать в книге и с какой главой или кейсом читать её вместе.
          </p>
        </Container>
      </section>

      <Container className="py-10 sm:py-16">
        <div className="grid gap-5">
          {LITERATURE.map((book) => (
            <Link
              key={book.slug}
              href={`/literature/${book.slug}`}
              className="card-premium group grid gap-7 p-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:p-8 lg:grid-cols-[210px_minmax(0,1fr)_180px] lg:gap-10"
            >
              <BookCover title={book.title} author={book.author} subtitle={book.context} />
              <span className="min-w-0">
                <span className="eyebrow">{book.topics.join(" · ")}</span>
                <span className="mt-3 block text-[26px] font-semibold leading-tight text-ink sm:text-[30px]">{book.title}</span>
                <span className="mt-2 block text-[13px] text-faint">{book.originalTitle} · {book.author} · {book.year}</span>
                <span className="mt-5 block max-w-[58ch] text-[15px] leading-relaxed text-text-2">{book.blurb}</span>
                <span className="mt-5 block text-[13px] leading-relaxed text-faint">{book.context}</span>
              </span>
              <span className="link self-end text-[14px] lg:self-center lg:justify-self-end">Зачем читать <Arrow /></span>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
