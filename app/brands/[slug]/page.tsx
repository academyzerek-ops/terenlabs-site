import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { getItem, BRANDS } from "@/lib/content";
import { getBrandDoc, BRAND_DOCS } from "@/lib/brands-data";
import { pageMetadata } from "@/lib/seo";
import { brandSeo } from "@/lib/seo-keywords";
import { ContentSidebar } from "@/components/ContentSidebar";
import { JsonLd } from "@/components/JsonLd";
import { brandArticleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import "./brand-content.css";

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
    <div className="lg:grid lg:grid-cols-[320px_1fr]">
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
      <div className="lg:sticky lg:top-16 lg:h-[calc(100dvh-65px)]">
        <ContentSidebar
          title="Разборы брендов"
          backHref="/catalog?type=bm"
          backLabel="к каталогу"
          activeSlug={slug}
          items={sidebarItems}
        />
      </div>
      <div className="min-w-0">
        {/* Hero: арта у разборов пока нет — тогда тёмная глубина вместо серой дыры */}
        <section className="relative isolate w-full overflow-hidden bg-navy-900">
          {doc.img && (
            <Image
              src={doc.img}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 75vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050b12]/15 via-[#050b12]/45 to-[#050b12]/92" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(80% 100% at 20% 20%, rgba(154, 106, 232, 0.2), transparent 70%)" }}
          />
          <Container className="relative z-10 flex min-h-[380px] flex-col justify-end pb-9 pt-24 lg:min-h-[440px]">
            <div className="mx-auto w-full max-w-[800px]">
              <nav
                aria-label="Хлебные крошки"
                className="mb-5 flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-widest text-foam/55"
              >
                <Link href="/catalog?type=bm" className="transition-colors hover:text-teal">
                  РАЗБОРЫ
                </Link>
                <span className="opacity-40">/</span>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-foam/45">
                  {doc.brand}
                </span>
              </nav>

              {doc.mod && (
                <span className="mb-4 inline-block rounded-md bg-[rgba(154,106,232,0.22)] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#c3a6ff] backdrop-blur-sm">
                  {doc.mod}
                </span>
              )}

              <h1 className="text-4xl font-black leading-[1.0] tracking-tight !text-foam [text-shadow:0_2px_24px_rgba(0,0,0,0.5)] sm:text-5xl lg:text-6xl">
                <span
                  className="brand-title-html inline-block"
                  dangerouslySetInnerHTML={{ __html: doc.titleHtml }}
                />
              </h1>

              {doc.sub && (
                <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-foam/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.5)] sm:text-xl">
                  {doc.sub}
                </p>
              )}
            </div>
          </Container>
        </section>

        <section className="py-12">
          <Container>
            <article className="brand-content" dangerouslySetInnerHTML={{ __html: doc.body }} />
          </Container>
        </section>
        {/* плавное появление блоков при скролле — как у кейсов и обзоров */}
        <Script src="/review-enhance.js?v=2" strategy="afterInteractive" />

        {more.length > 0 && (
          <section className="deck py-16">
            <Container>
              <div className="mx-auto max-w-[800px]">
                <h2 className="text-2xl sm:text-3xl">Дальше читать</h2>
                <div className="mt-8 grid gap-5 md:grid-cols-3">
                  {more.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/brands/${r.slug}`}
                      className="card-premium group flex flex-col p-6"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                        {r.brand}
                      </span>
                      <h3 className="mt-3 flex-1 text-lg leading-snug text-heading">{r.title}</h3>
                      <span className="mt-4 text-sm font-semibold text-teal-600 transition-transform group-hover:translate-x-1">
                        Читать →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </Container>
          </section>
        )}
      </div>
    </div>
  );
}
