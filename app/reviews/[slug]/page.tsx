import { ProductPage } from "@/components/ProductPage";
import { ProductMissing } from "@/components/ProductMissing";
import { getItem } from "@/lib/content";
import { getReviewDoc } from "@/lib/reviews-data";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("review", slug);
  if (!p) return <ProductMissing />;

  // Канонический wiki-обзор — готовая дизайнерская страница во весь экран под шапкой
  const doc = getReviewDoc(slug);
  if (doc) {
    return (
      <iframe
        src={doc.file}
        title={doc.title}
        className="block h-[calc(100vh-60px)] w-full border-0"
      />
    );
  }

  return <ProductPage p={p} />;
}
