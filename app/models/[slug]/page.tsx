import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Arrow } from "@/components/Button";
import { ContentSidebar } from "@/components/ContentSidebar";
import { ModelBody } from "@/components/ModelBody";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { MODEL_CARDS, getModel } from "@/lib/models-data";
import { pageMetadata } from "@/lib/seo";

// Все слаги известны на сборке: неизвестный отдаёт настоящий 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return MODEL_CARDS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getModel(slug);
  if (!m) return {};
  return pageMetadata({ title: m.title, description: m.formula, path: `/models/${slug}` });
}

// Блоки редакционной кухни на страницу не идут: «Крючки для выпусков» — заготовки
// тем для роликов, а «Бренды в разбор» показываем сами, отдельным блоком со
// ссылками на написанные разборы.
const INTERNAL_BLOCKS = new Set(["Крючки для выпусков", "Бренды в разбор"]);

const COURSE = "course-founder-model";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = getModel(slug);
  if (!model) notFound();

  const body = { ...model, blocks: model.blocks.filter((b) => !INTERNAL_BLOCKS.has(b.label)) };
  const brands = model.brands.filter((b) => !b.pending);

  // боковая панель: модели по группам, слои в конце
  const sidebarItems = MODEL_CARDS.map((m) => ({
    slug: m.slug,
    title: m.title,
    href: `/models/${m.slug}`,
    group: m.layer ? "Поверх всех моделей" : `${m.groupKey} · ${m.groupTitle}`,
  }));

  const i = MODEL_CARDS.findIndex((m) => m.slug === slug);
  const next = MODEL_CARDS[(i + 1) % MODEL_CARDS.length];

  return (
    <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Фаундер", path: "/startup" },
            { name: "Справочник моделей", path: "/models" },
            { name: model.title, path: `/models/${model.slug}` },
          ]),
        ]}
      />
      <div className="lg:sticky lg:top-0 lg:h-dvh">
        <ContentSidebar
          title="Справочник моделей"
          backHref="/models"
          backLabel="к справочнику"
          activeSlug={slug}
          items={sidebarItems}
        />
      </div>

      <div className="min-w-0">
        <section className="border-b border-line">
          <Container className="py-12 sm:py-14">
            <div className="mx-auto w-full max-w-[800px]">
              <nav aria-label="Хлебные крошки" className="mb-6 flex items-center gap-2 text-[13px] text-faint">
                <Link href="/models" className="shrink-0 py-1.5 hover:text-ink lg:py-0">Модели</Link>
                <span>/</span>
                <span className="truncate">{model.title}</span>
              </nav>

              {!model.layer && model.groupTitle && (
                <span className="tag tag-blue">{model.groupKey} · {model.groupTitle}</span>
              )}

              <h1 className="mt-4 text-[20px] sm:text-[44px] lg:text-[40px]">{model.title}</h1>
              <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-text-2 sm:text-[19px]">
                {model.formula}
              </p>
            </div>
          </Container>
        </section>

        <section className="py-7 sm:py-12">
          <Container>
            <div className="mx-auto w-full max-w-[800px]">
              <ModelBody model={body} />
            </div>
          </Container>
        </section>

        {brands.length > 0 && (
          <section className="border-t border-line py-7 sm:py-12">
            <Container>
              <div className="mx-auto w-full max-w-[800px]">
                <h2 className="text-[20px] sm:text-[24px]">У кого это видно</h2>
                <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-text-2">
                  Компании, на которых модель читается лучше всего. Там, где разбор уже написан,
                  из строки ведёт ссылка: в нём структура выручки и цена развилки, с источниками.
                </p>
                <div className="mt-6">
                  {brands.map((b, k) => {
                    const row = (
                      <>
                        <span className="min-w-[140px] shrink-0 text-[15px] font-medium text-ink">
                          {b.brand}
                        </span>
                        <span className="text-[14px] leading-relaxed text-text-2">{b.note}</span>
                      </>
                    );
                    return b.review ? (
                      <Link
                        key={k}
                        href={`/brands/${b.review}`}
                        className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-line py-3 transition-colors hover:bg-subtle"
                      >
                        {row}
                        <span className="link shrink-0 text-[14px]">Разбор <Arrow /></span>
                      </Link>
                    ) : (
                      <div key={k} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-line py-3">
                        {row}
                      </div>
                    );
                  })}
                  <div className="border-t border-line" />
                </div>
              </div>
            </Container>
          </section>
        )}

        <section className="border-t border-line bg-subtle py-9 sm:py-16">
          <Container>
            <div className="mx-auto grid max-w-[800px] gap-8 lg:grid-cols-2">
              <div>
                <p className="eyebrow">Где это в курсе</p>
                <h2 className="mt-3 text-[20px] sm:text-[24px]">Тема «Бизнес-модель»</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-text-2">
                  Каталог даёт конструкцию, курс — как выбрать свою и на чём она посыплется.
                </p>
                <Link href={`/courses/${COURSE}`} className="link mt-5 inline-flex text-[15px]">
                  К теме курса <Arrow />
                </Link>
              </div>
              <div>
                <p className="eyebrow">Следующая модель</p>
                <h2 className="mt-3 text-[20px] sm:text-[24px]">{next.title}</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-text-2">{next.formula}</p>
                <Link href={`/models/${next.slug}`} className="link mt-5 inline-flex text-[15px]">
                  Читать <Arrow />
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
