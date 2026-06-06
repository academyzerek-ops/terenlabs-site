import { ProductPage } from "@/components/ProductPage";
import { ProductMissing } from "@/components/ProductMissing";
import { ReviewArticle } from "@/components/ReviewArticle";
import { getItem } from "@/lib/content";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("review", slug);
  if (!p) return <ProductMissing />;

  // Демо лонгрида-обзора
  if (slug === "review-coffee-market-kz") {
    return <ReviewArticle />;
  }
  return <ProductPage p={p} />;
}
