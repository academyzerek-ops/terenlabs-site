import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { ProductPage } from "@/components/ProductPage";
import { ProductMissing } from "@/components/ProductMissing";
import { getItem, plural } from "@/lib/content";
import { getTrack } from "@/lib/learn";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("course", slug);
  if (!p) return <ProductMissing />;
  const track = getTrack(slug);
  if (!track) return <ProductPage p={p} />;

  return (
    <>
      {/* Хедер курса — глубина */}
      <section className="hero-ocean">
        <Container className="relative z-10 py-16">
          <nav className="mb-5 text-sm text-foam/50">
            <Link href="/catalog?type=course" className="hover:text-teal">Курсы</Link>
            <span className="mx-2">/</span>
            <span>{track.title}</span>
          </nav>
          <p className="eyebrow">Академия · бесплатно навсегда</p>
          <h1 className="mt-4 max-w-2xl text-4xl !text-foam sm:text-5xl">{track.title}</h1>
          <p className="mt-4 max-w-xl text-lg text-foam/75">{track.subtitle}</p>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <Button href={`/learn/${track.slug}`} size="lg">Начать курс</Button>
            <span className="num text-sm text-foam/60">
              {track.modules.length} {plural(track.modules.length, "урок", "урока", "уроков")} ·{" "}
              {track.chapterTotal} {plural(track.chapterTotal, "глава", "главы", "глав")}
            </span>
          </div>
        </Container>
      </section>

      {/* Программа */}
      <section className="deck py-16">
        <Container>
          <h2 className="text-3xl">Программа</h2>
          <div className="mt-8 space-y-6">
            {track.modules.map((m, mi) => {
              const cover = m.chapters.find((c) => c.img)?.img;
              return (
                <div key={m.id} className="card-premium overflow-hidden md:flex">
                  {cover && (
                    <div className="h-36 shrink-0 overflow-hidden md:h-auto md:w-56">
                      <img src={cover} alt="" width={448} height={288} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 p-6">
                    <p className="eyebrow">Урок {mi + 1}</p>
                    <h3 className="mt-1 text-xl text-heading">{m.title}</h3>
                    <ol className="mt-4 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
                      {m.chapters.map((c, ci) => (
                        <li key={c.file} className="flex items-baseline gap-2.5 text-sm text-body/80">
                          <span className="num shrink-0 text-xs text-teal-600">{ci + 1}</span>
                          {c.title}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Button href={`/learn/${track.slug}`} size="lg">Начать с первой главы</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
