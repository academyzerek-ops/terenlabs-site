import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Button";
import { LessonNav } from "@/components/LessonNav";
import { LessonToc } from "@/components/LessonToc";
import { getTrack } from "@/lib/learn";
import { loadLesson } from "@/lib/lesson-html";
import "./lesson-content.css";

// Читалка главы: дерево трека слева, текст одной колонкой по центру, оглавление справа.
// HTML главы из сборщика вставляется прямо в страницу (без iframe), стили в lesson-content.css.

type Flat = { file: string; title: string; moduleId: string; moduleTitle: string; moduleIndex: number; chapterIndex: number; chapterCount: number };

function flatten(slug: string) {
  const track = getTrack(slug);
  if (!track) return null;
  const flat: Flat[] = [];
  track.modules.forEach((m, mi) => {
    const chs = m.chapters.filter((c) => !c.missing);
    chs.forEach((c, ci) =>
      flat.push({ file: c.file, title: c.title, moduleId: m.id, moduleTitle: m.title, moduleIndex: mi + 1, chapterIndex: ci + 1, chapterCount: chs.length })
    );
  });
  return { track, flat };
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ch?: string }> }) {
  const { slug } = await params;
  const { ch } = await searchParams;
  const data = flatten(slug);
  if (!data) return { title: "Обучение — TerenLabs" };
  const cur = data.flat.find((f) => f.file === ch) ?? data.flat[0];
  return {
    title: `${cur?.title ?? data.track.title} · ${data.track.title} — TerenLabs`,
    alternates: { canonical: `/learn/${slug}` },
  };
}

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ch?: string }> }) {
  const { slug } = await params;
  const { ch } = await searchParams;
  const data = flatten(slug);
  if (!data || data.flat.length === 0) notFound();
  const { track, flat } = data;
  const idx = Math.max(0, flat.findIndex((f) => f.file === ch));
  const cur = flat[idx];
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;
  const doc = loadLesson(track.folder, cur.file);
  if (!doc) notFound();

  const navModules = track.modules.map((m) => ({
    id: m.id,
    title: m.title,
    chapters: m.chapters.filter((c) => !c.missing).map((c) => ({ file: c.file, title: c.title })),
  }));

  return (
    <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <LessonNav
        slug={slug}
        title={track.title}
        modules={navModules}
        currentFile={cur.file}
        prevFile={prev?.file ?? null}
        nextFile={next?.file ?? null}
        index={idx}
        total={flat.length}
      />

      <div className="min-w-0">
        {/* оглавление показываем только когда рядом с колонкой текста реально есть место:
            при двух боковых панелях 720 + 40 + 220 помещаются лишь от 2xl */}
        <div className="mx-auto grid w-full max-w-[1040px] gap-10 px-5 py-10 sm:px-8 lg:py-14 2xl:grid-cols-[minmax(0,720px)_220px] 2xl:gap-10">
          <article className="min-w-0 max-w-[720px] 2xl:w-[720px]">
            <p className="eyebrow">{/^Урок\s*\d/i.test(cur.moduleTitle) ? cur.moduleTitle : `Урок ${cur.moduleIndex} · ${cur.moduleTitle}`}</p>
            <h1 className="mt-3 text-[28px] leading-[1.15] sm:text-[36px]">{doc.title || cur.title}</h1>
            <p className="num mt-3 text-[13px] text-faint">
              Глава {cur.chapterIndex} из {cur.chapterCount} · {doc.minutes} мин чтения
            </p>
            {doc.cover && (
              <img
                src={doc.cover}
                alt=""
                width={1400}
                height={584}
                className="mt-8 aspect-[2.4/1] w-full rounded-[12px] object-cover"
                loading="eager"
              />
            )}
            <div className="lesson-content mt-10" dangerouslySetInnerHTML={{ __html: doc.html }} />

            {/* дальше по треку */}
            <div className="mt-14 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
              {prev ? (
                <Link href={`/learn/${slug}?ch=${prev.file}`} className="card-premium flex flex-col gap-1 p-4">
                  <span className="text-[12px] text-faint">Назад</span>
                  <span className="text-[15px] font-medium text-ink">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={`/learn/${slug}?ch=${next.file}`} className="card-premium flex flex-col gap-1 p-4 text-right">
                  <span className="text-[12px] text-faint">Дальше</span>
                  <span className="inline-flex items-center justify-end gap-2 text-[15px] font-medium text-ink">
                    {next.title} <Arrow />
                  </span>
                </Link>
              ) : (
                <Link href={`/courses/${slug}`} className="card-premium flex flex-col gap-1 p-4 text-right">
                  <span className="text-[12px] text-faint">Трек пройден</span>
                  <span className="inline-flex items-center justify-end gap-2 text-[15px] font-medium text-ink">
                    К программе трека <Arrow />
                  </span>
                </Link>
              )}
            </div>
          </article>

          <div className="hidden 2xl:block">
            <div className="sticky top-10">
              <LessonToc items={doc.toc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
