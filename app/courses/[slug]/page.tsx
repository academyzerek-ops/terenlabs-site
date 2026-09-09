import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { chapterLinks } from "@/lib/chapter-links";
import { getItem as getCatalogItem } from "@/lib/content";
import { LESSON_COVERS } from "@/lib/lesson-covers";
import { Button, Arrow } from "@/components/Button";
import { ProductPage } from "@/components/ProductPage";
import { getItem, plural, COURSES } from "@/lib/content";
import { getTrack } from "@/lib/learn";
import { itemMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { courseJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

// Все слаги известны на сборке: неизвестный отдаёт настоящий 404, а не 200
// с пустой страницей (аудит ссылок 06.09.2026).
export const dynamicParams = false;

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return itemMetadata(getItem("course", slug), `/courses/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("course", slug);
  if (!p) notFound();
  const track = getTrack(slug);
  if (!track) return <ProductPage p={p} />;

  return (
    <>
      <JsonLd
        data={[
          courseJsonLd({
            name: track.title,
            description: track.subtitle,
            path: `/courses/${track.slug}`,
          }),
          breadcrumbJsonLd([
            { name: "Академия", path: "/academy" },
            { name: track.title, path: `/courses/${track.slug}` },
          ]),
        ]}
      />
      {/* Шапка курса */}
      <section className="border-b border-line">
        <Container className="py-14 sm:py-16">
          <nav className="mb-6 text-[13px] text-faint" aria-label="Хлебные крошки">
            <Link href="/academy" className="hover:text-ink">Академия</Link>
            <span className="mx-2">/</span>
            <span>{track.title}</span>
          </nav>
          <p className="eyebrow">Академия</p>
          <h1 className="mt-4 max-w-[20ch] text-[24px] sm:text-[38px]">{track.title}</h1>
          <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">{track.subtitle}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href={`/learn/${track.slug}`} size="lg">
              Начать курс <Arrow />
            </Button>
            <span className="num text-[14px] text-text-2">
              {track.modules.length} {plural(track.modules.length, "урок", "урока", "уроков")} ·{" "}
              {track.chapterTotal} {plural(track.chapterTotal, "глава", "главы", "глав")}
            </span>
          </div>
        </Container>
      </section>

      {/* Программа: уроки строками, главы списком с тонкими линиями */}
      <section>
        <Container className="py-14 sm:py-16">
          <h2 className="text-[24px] sm:text-[32px]">Программа</h2>
          <div className="mt-8">
            {track.modules.map((m, mi) => {
              // своя обложка урока, если нарисована; иначе первая картинка главы
              const own = `/academy-assets/lessons_cover/${track.folder ?? ""}/${m.id}.webp?v=2`;
              const cover = (track.folder && LESSON_COVERS.has(`${track.folder}/${m.id}`)) ? own : m.chapters.find((c) => c.img)?.img;
              return (
                <div
                  key={m.id}
                  className="grid gap-6 border-t border-line py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10"
                >
                  <div>
                    {cover && (
                      <div className="mb-4 aspect-[16/10] w-full overflow-hidden rounded-[8px] border border-line bg-card">
                        <img src={cover} alt="" width={448} height={288} loading="lazy" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <p className="eyebrow">Урок {mi + 1}</p>
                    {/* дубль «Урок N» из названия модуля убираем — он уже в eyebrow */}
                    <h3 className="mt-2 text-[20px]">
                      {m.title.replace(/^Урок\s*\d+\s*[·.\-—:]\s*/i, "")}
                    </h3>
                    <p className="num mt-1 text-[13px] text-faint">
                      {m.chapters.length} {plural(m.chapters.length, "глава", "главы", "глав")}
                    </p>
                  </div>
                  <ol>
                    {m.chapters.map((c, ci) => {
                      // разборы, на которых эта глава показывается вживую;
                      // ссылки стоят отдельной строкой: вложенная ссылка в ссылке невалидна
                      const examples = chapterLinks(c.file).filter((x) => getCatalogItem("bm", x.review));
                      return (
                        <li key={c.file} className="border-t border-line">
                          <Link
                            href={`/learn/${track.slug}?ch=${c.file}`}
                            className="group flex min-h-[48px] items-center gap-4 py-3 transition-colors hover:bg-hover"
                          >
                            <span className="num w-7 shrink-0 text-[13px] text-faint">
                              {String(ci + 1).padStart(2, "0")}
                            </span>
                            <span className="flex-1 text-[15px] leading-snug text-body group-hover:text-ink">{c.title}</span>
                            <Arrow className="shrink-0 text-text-2 group-hover:text-ink" />
                          </Link>
                          {examples.length > 0 && (
                            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-3 pl-11 text-[13px] text-faint">
                              <span>На примерах:</span>
                              {examples.map((x) => (
                                <Link key={x.review} href={`/brands/${x.review}`} className="link" title={x.note}>
                                  {x.brand}
                                </Link>
                              ))}
                            </p>
                          )}
                        </li>
                      );
                    })}
                    <li className="border-t border-line" aria-hidden="true" />
                  </ol>
                </div>
              );
            })}
            <div className="border-t border-line" />
          </div>
          <div className="mt-6 sm:mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href={`/learn/${track.slug}`} size="lg">
              Начать с первой главы <Arrow />
            </Button>
            {/* справочник моделей открывается только отсюда и из хаба «Фаундер»:
                он подпорка к теории, а не отдельный тип контента */}
            {track.slug === "course-founder-model" && (
              <Link href="/models" className="link text-[15px]">
                Справочник моделей заработка
              </Link>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
