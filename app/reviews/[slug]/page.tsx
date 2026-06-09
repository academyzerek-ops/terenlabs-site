import { notFound } from "next/navigation";
import { ProductPage } from "@/components/ProductPage";
import { ContentSidebar } from "@/components/ContentSidebar";
import { getItem, REVIEWS } from "@/lib/content";
import { getReviewDoc, REVIEW_DOCS } from "@/lib/reviews-data";
import { itemMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return REVIEWS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return itemMetadata(getItem("review", slug));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("review", slug);
  if (!p) notFound();

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
          className="h-full min-h-0 w-full border-0"
        />
      </div>
    );
  }

  return <ProductPage p={p} />;
}
