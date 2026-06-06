import Link from "next/link";
import { Container } from "@/components/Container";
import { ProductPage } from "@/components/ProductPage";
import { ProductMissing } from "@/components/ProductMissing";
import { CaseTrainer } from "@/components/CaseTrainer";
import { getItem } from "@/lib/content";
import { getCaseDoc } from "@/lib/cases-data";
import "./case-content.css";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("case", slug);
  if (!p) return <ProductMissing />;

  // Демо кейс-тренажёра с ветвлением (наш дифференциатор)
  if (slug === "case-marketplace") {
    return (
      <>
        <section className="hero-ocean">
          <Container className="relative z-10 py-14">
            <nav className="mb-5 text-sm text-foam/50">
              <Link href="/catalog?type=case" className="hover:text-teal">Кейсы</Link>
              <span className="mx-2">/</span>
              <span>{p.title}</span>
            </nav>
            <p className="eyebrow">Кейс-тренажёр · ветвление решений</p>
            <h1 className="mt-4 text-4xl !text-foam sm:text-5xl">{p.title}</h1>
            <p className="mt-4 max-w-xl text-lg text-foam/75">
              Каждое решение меняет твой капитал. Ошибки видны в деньгах — как в реальности.
            </p>
          </Container>
        </section>
        <CaseTrainer />
      </>
    );
  }

  // Реальный кейс канала — нативный рендер распарсенного HTML
  const doc = getCaseDoc(slug);
  if (doc) {
    return (
      <>
        <section className="hero-ocean">
          <Container className="relative z-10 py-14">
            <nav className="mb-5 text-sm text-foam/50">
              <Link href="/catalog?type=case" className="hover:text-teal">Кейсы</Link>
              <span className="mx-2">/</span>
              <span>{doc.title}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              {doc.kind && (
                <span className="rounded-full bg-teal/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal">
                  {doc.kind}
                </span>
              )}
              {doc.mod && <span className="text-sm text-foam/60">{doc.mod}</span>}
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl !text-foam sm:text-5xl">
              {doc.ico && <span className="mr-3">{doc.ico}</span>}
              <span className="case-title-html" dangerouslySetInnerHTML={{ __html: doc.titleHtml }} />
            </h1>
            {doc.sub && <p className="mt-4 max-w-xl text-lg text-foam/75">{doc.sub}</p>}
          </Container>
        </section>
        <section className="py-12">
          <Container>
            <article className="case-content" dangerouslySetInnerHTML={{ __html: doc.body }} />
          </Container>
        </section>
      </>
    );
  }

  return <ProductPage p={p} />;
}
