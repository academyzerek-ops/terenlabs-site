import { notFound } from "next/navigation";
import { ProductPage } from "@/components/ProductPage";
import { getItem, TESTS } from "@/lib/content";
import { itemMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return TESTS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return itemMetadata(getItem("test", slug), `/tests/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("test", slug);
  if (!p) notFound();
  return <ProductPage p={p} />;
}
