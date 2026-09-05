import { notFound } from "next/navigation";
import { ProductPage } from "@/components/ProductPage";
import { getItem, FINMODELS } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PRODUCT_KEYWORDS } from "@/lib/seo-keywords";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd } from "@/lib/jsonld";

// Все слаги известны на сборке: неизвестный отдаёт настоящий 404, а не 200
// с пустой страницей (аудит ссылок 06.09.2026).
export const dynamicParams = false;

export function generateStaticParams() {
  return FINMODELS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("finmodel", slug);
  if (!p) return {};
  return {
    ...pageMetadata({ title: p.title, description: p.blurb, image: p.img,
                      path: `/finmodels/${slug}` }),
    keywords: PRODUCT_KEYWORDS[slug] ?? undefined,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("finmodel", slug);
  if (!p) notFound();

  return (
    <>
      {!p.stub && (
        <JsonLd data={articleJsonLd({
          headline: p.title, description: p.blurb, image: p.img ?? undefined,
          path: `/finmodels/${slug}`,
        })} />
      )}
      <ProductPage p={p} />
    </>
  );
}
