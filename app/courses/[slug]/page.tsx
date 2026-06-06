import { ProductPage } from "@/components/ProductPage";
import { ProductMissing } from "@/components/ProductMissing";
import { getItem } from "@/lib/content";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("course", slug);
  return p ? <ProductPage p={p} /> : <ProductMissing />;
}
