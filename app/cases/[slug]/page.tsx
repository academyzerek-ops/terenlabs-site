import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { ProductPage } from "@/components/ProductPage";
import { ProductMissing } from "@/components/ProductMissing";
import { CaseTrainer } from "@/components/CaseTrainer";
import { getItem } from "@/lib/content";
import { getCaseDoc, CASE_DOCS } from "@/lib/cases-data";
import "./case-content.css";


// 3 соседних кейса по порядку (детерминированно, без random — SSR-стабильно)
function related(slug: string) {
  const i = CASE_DOCS.findIndex((c) => c.slug === slug);
  return [1, 2, 3].map((d) => CASE_DOCS[(i + d) % CASE_DOCS.length]);
}

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

        {/* Дальше читать + мягкий мост к финмодели (Академию в воронку не превращаем,
            кейсы — можно: чужая ошибка → посчитай свою) */}
        <section className="deck py-16">
          <Container>
            <h2 className="text-2xl sm:text-3xl">Дальше читать</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {related(doc.slug).map((r) => (
                <Link
                  key={r.slug}
                  href={`/cases/${r.slug}`}
                  className="card-premium group flex flex-col p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{r.ico}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                      {r.kind}
                    </span>
                  </div>
                  <h3 className="mt-3 flex-1 text-lg leading-snug text-heading">{r.title}</h3>
                  <span className="mt-4 text-sm font-semibold text-teal-600 transition-transform group-hover:translate-x-1">
                    Читать →
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[var(--radius-lg)] bg-navy p-8 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-xl !text-foam sm:text-2xl">Чужая ошибка разобрана. Своя — посчитана?</h3>
                <p className="mt-2 text-sm text-foam/65">
                  Финмодель покажет твою точку безубыточности до того, как ты вложишься.
                </p>
              </div>
              <Button href="/finmodels/finmodel-cafe">Посчитать мой бизнес</Button>
            </div>
          </Container>
        </section>
      </>
    );
  }

  return <ProductPage p={p} />;
}
