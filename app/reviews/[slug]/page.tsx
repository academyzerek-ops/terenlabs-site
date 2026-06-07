import { ProductPage } from "@/components/ProductPage";
import { ProductMissing } from "@/components/ProductMissing";
import { ContentSidebar } from "@/components/ContentSidebar";
import { getItem } from "@/lib/content";
import { getReviewDoc, REVIEW_DOCS } from "@/lib/reviews-data";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("review", slug);
  if (!p) return <ProductMissing />;

  // Канонический wiki-обзор + панель остальных обзоров слева (как в плеере)
  const doc = getReviewDoc(slug);
  if (doc) {
    return (
      <div className="grid h-[calc(100dvh-65px)] grid-rows-[auto_1fr] overflow-hidden lg:grid-cols-[320px_1fr] lg:grid-rows-1">
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
          className="min-h-0 w-full flex-1 border-0"
        />
      </div>
    );
  }

  return <ProductPage p={p} />;
}
