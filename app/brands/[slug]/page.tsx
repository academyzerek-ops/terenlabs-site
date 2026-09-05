import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Arrow } from "@/components/Button";
import { getItem, BRANDS } from "@/lib/content";
import { getBrandDoc, BRAND_DOCS } from "@/lib/brands-data";
import { pageMetadata } from "@/lib/seo";
import { brandSeo } from "@/lib/seo-keywords";
import { ContentSidebar } from "@/components/ContentSidebar";
import { JsonLd } from "@/components/JsonLd";
import { brandArticleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import "./brand-content.css";

// Все слаги известны на сборке: неизвестный отдаёт настоящий 404, а не 200
// с пустой страницей (аудит ссылок 06.09.2026).
export const dynamicParams = false;

export function generateStaticParams() {
  return BRANDS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getBrandDoc(slug);
  if (!doc) return {};
  const { seoTitle, description, keywords } = brandSeo(doc.brand, doc.blurb);
  return {
    ...pageMetadata({ title: seoTitle, description, image: doc.img, path: `/brands/${slug}` }),
    keywords,
  };
}

// До трёх соседних разборов по порядку, без самого себя (детерминированно — SSR-стабильно)
function related(slug: string) {
  const i = BRAND_DOCS.findIndex((b) => b.slug === slug);
  return [1, 2, 3]
    .map((d) => BRAND_DOCS[(i + d) % BRAND_DOCS.length])
    .filter((b, idx, arr) => b && b.slug !== slug && arr.findIndex((x) => x.slug === b.slug) === idx);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("bm", slug);
  const doc = getBrandDoc(slug);
  if (!p || !doc) notFound();

  // Панель соседних разборов слева (как у кейсов), тело — нативно в DOM:
  // текст разбора должен индексироваться, поэтому никакого iframe.
  const more = related(slug);
  const sidebarItems = BRAND_DOCS.map((b) => ({
    slug: b.slug,
    title: b.title,
    href: `/brands/${b.slug}`,
  }));

  return (
    <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
      <JsonLd
        data={[
          brandArticleJsonLd({
            headline: doc.title,
            description: doc.blurb,
            path: `/brands/${doc.slug}`,
            brand: doc.brand,
            image: doc.img,
          }),
          breadcrumbJsonLd([
            { name: "Разборы брендов", path: "/catalog?type=bm" },
            { name: doc.title, path: `/brands/${doc.slug}` },
          ]),
        ]}
      />
      <div className="lg:sticky lg:top-0 lg:h-dvh">
        <ContentSidebar
          title="Разборы брендов"
          backHref="/catalog?type=bm"
          backLabel="к каталогу"
          activeSlug={slug}
          items={sidebarItems}
        />
      </div>
      <div className="min-w-0">
        {/* Шапка разбора: крошки, ярлык модели, заголовок, подзаголовок; обложка (если есть) ниже в рамке */}
        <section className="border-b border-line">
          <Container className="py-12 sm:py-14">
            <div className="mx-auto w-full max-w-[800px]">
              <nav aria-label="Хлебные крошки" className="mb-6 flex items-center gap-2 text-[13px] text-faint">
                <Link href="/catalog?type=bm" className="shrink-0 hover:text-ink">Разборы</Link>
                <span>/</span>
                <span className="truncate">{doc.brand}</span>
              </nav>

              {doc.mod && (
                <p className="mb-4">
                  <span className="tag tag-blue">{doc.mod}</span>
                </p>
              )}

              <h1 className="text-[20px] sm:text-[44px] lg:text-[40px]">
                <span className="brand-title-html" dangerouslySetInnerHTML={{ __html: doc.titleHtml }} />
              </h1>

              {doc.sub && (
                <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-text-2 sm:text-[19px]">
                  {doc.sub}
                </p>
              )}

              {doc.img && (
                <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[8px] border border-line bg-card">
                  <Image
                    src={doc.img}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </Container>
        </section>

        <section className="py-12">
          <Container>
            <article className="brand-content" dangerouslySetInnerHTML={{ __html: doc.body }} />
          </Container>
        </section>

        {more.length > 0 && (
          <section className="border-t border-line bg-subtle py-16">
            <Container>
              <div className="mx-auto max-w-[800px]">
                <h2 className="text-[22px] sm:text-[24px]">Дальше читать</h2>
                <div className="mt-6">
                  {more.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/brands/${r.slug}`}
                      className="flex items-center justify-between gap-6 border-t border-line py-4 transition-colors hover:bg-hover"
                    >
                      <div className="min-w-0">
                        <span className="eyebrow">{r.brand}</span>
                        <h3 className="mt-1.5 text-[15px] leading-snug">{r.title}</h3>
                      </div>
                      <span className="link shrink-0 text-[14px]">
                        Читать <Arrow />
                      </span>
                    </Link>
                  ))}
                  <div className="border-t border-line" />
                </div>
              </div>
            </Container>
          </section>
        )}
      </div>
    </div>
  );
}
