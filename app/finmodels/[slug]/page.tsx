import { notFound } from "next/navigation";
import { ProductPage } from "@/components/ProductPage";
import { getItem, FINMODELS } from "@/lib/content";
import { itemMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return FINMODELS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return itemMetadata(getItem("finmodel", slug));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("finmodel", slug);
  if (!p) notFound();

  return <ProductPage p={p} />;
}
