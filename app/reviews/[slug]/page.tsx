import { notFound } from "next/navigation";
import { ProductPage } from "@/components/ProductPage";
import { ContentSidebar } from "@/components/ContentSidebar";
import { getItem, REVIEWS } from "@/lib/content";
import { getReviewDoc, REVIEW_DOCS } from "@/lib/reviews-data";
import { pageMetadata } from "@/lib/seo";
import { nicheSeo } from "@/lib/seo-keywords";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

// Все слаги известны на сборке: неизвестный отдаёт настоящий 404, а не 200
// с пустой страницей (аудит ссылок 06.09.2026).
export const dynamicParams = false;

export function generateStaticParams() {
  return REVIEWS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("review", slug);
  if (!p) return {};
  const { seoTitle, description, keywords } = nicheSeo(p.title, p.blurb);
  return { ...pageMetadata({ title: seoTitle, description, image: p.img,
                             path: `/reviews/${slug}` }), keywords };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("review", slug);
  if (!p) notFound();

  // Канонический wiki-обзор + панель остальных обзоров слева (как в плеере)
  const doc = getReviewDoc(slug);
  if (doc) {
    return (
      <div className="grid h-dvh grid-rows-[auto_1fr] overflow-hidden lg:grid-cols-[320px_1fr] lg:grid-rows-1">
        <JsonLd
          data={[
            articleJsonLd({
              headline: doc.title,
              description: p.blurb,
              path: `/reviews/${slug}`,
            }),
            breadcrumbJsonLd([
              { name: "Обзоры ниш", path: "/catalog?type=review" },
              { name: doc.title, path: `/reviews/${slug}` },
            ]),
            // FAQ под rich snippet: типовые вопросы предпринимателя по нише
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: `Сколько стоит открыть «${doc.title}» в Казахстане?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `Стартовые вложения, точка безубыточности и срок окупаемости ниши «${doc.title}» разобраны в обзоре по данным БНС, НБРК и 2ГИС.`,
                  },
                },
                {
                  "@type": "Question",
                  name: `Какие риски у ниши «${doc.title}»?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `${p.blurb} Полный разбор рисков, сезонности и целевой аудитории — в обзоре TerenLabs.`,
                  },
                },
              ],
            },
          ]}
        />
        <ContentSidebar
          title="Обзоры ниш"
          backHref="/catalog?type=review"
          backLabel="к каталогу"
          activeSlug={slug}
          items={REVIEW_DOCS.map((r) => ({
            slug: r.slug,
            title: r.title,
            href: `/reviews/${r.slug}`,
          }))}
        />
        <iframe
          src={doc.file}
          title={doc.title}
          className="h-full min-h-0 w-full border-0"
        />
      </div>
    );
  }

  return <ProductPage p={p} />;
}
