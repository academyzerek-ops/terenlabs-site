import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { ProductPage } from "@/components/ProductPage";
import { CaseTrainer } from "@/components/CaseTrainer";
import { getItem, CASES } from "@/lib/content";
import { getCaseDoc, CASE_DOCS } from "@/lib/cases-data";
import { pageMetadata } from "@/lib/seo";
import { ContentSidebar } from "@/components/ContentSidebar";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import "./case-content.css";

export function generateStaticParams() {
  return CASES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("case", slug);
  const doc = getCaseDoc(slug);
  if (!p && !doc) return {};
  return pageMetadata({
    title: doc?.title ?? p?.title,
    description: doc?.sub || p?.blurb,
  });
}


// 3 соседних кейса по порядку (детерминированно, без random — SSR-стабильно)
function related(slug: string) {
  const i = CASE_DOCS.findIndex((c) => c.slug === slug);
  return [1, 2, 3].map((d) => CASE_DOCS[(i + d) % CASE_DOCS.length]);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("case", slug);
  if (!p) notFound();

  // Демо кейс-тренажёра с ветвлением (наш дифференциатор)
  if (slug === "case-marketplace") {
    return (
      <>
        <section className="hero-ocean">
          <Container className="relative z-10 py-14">
            <nav aria-label="Хлебные крошки" className="mb-5 text-sm text-foam/50">
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

  // Реальный кейс канала: панель остальных кейсов слева (как в плеере), контент правее
  const doc = getCaseDoc(slug);
  if (doc) {
    const dotOf = (kind: string) =>
      kind === "Провал" ? "#d04f33" : kind === "Успех" ? "#1f9e74" : "#d4a82b";
    const groupOf = (kind: string) =>
      kind === "Провал" ? "Неудачные действия" : kind === "Успех" ? "Удачные решения" : "Просто опыт";
    // 90 ссылок без структуры — шум; группируем по исходу, порядок внутри сохраняем
    const groupOrder = ["Провал", "Успех"];
    const sidebarItems = [...CASE_DOCS]
      .sort((a, b) => {
        const ai = groupOrder.indexOf(a.kind);
        const bi = groupOrder.indexOf(b.kind);
        return (ai === -1 ? groupOrder.length : ai) - (bi === -1 ? groupOrder.length : bi);
      })
      .map((c) => ({
        slug: c.slug,
        title: c.title,
        href: `/cases/${c.slug}`,
        dot: dotOf(c.kind),
        group: groupOf(c.kind),
      }));
    return (
      <div className="lg:grid lg:grid-cols-[320px_1fr]">
        <JsonLd
          data={[
            articleJsonLd({
              headline: doc.title,
              description: doc.sub,
              path: `/cases/${doc.slug}`,
              image: doc.image,
            }),
            breadcrumbJsonLd([
              { name: "Кейсы", path: "/catalog?type=case" },
              { name: doc.title, path: `/cases/${doc.slug}` },
            ]),
          ]}
        />
        <div className="lg:sticky lg:top-16 lg:h-[calc(100dvh-65px)]">
          <ContentSidebar
            title="Кейсы"
            backHref="/catalog?type=case"
            backLabel="к каталогу"
            activeSlug={slug}
            items={sidebarItems}
          />
        </div>
        <div className="min-w-0">
        {/* Hero в формате обзоров: кинокадр кейса во всю ширину, заголовок поверх снизу */}
        <section className="relative isolate w-full overflow-hidden">
          {doc.image ? (
            <Image
              src={doc.image}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 75vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-navy-900" />
          )}
          {/* скрим к низу — читаемость заголовка (как ::after у .phero) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050b12]/15 via-[#050b12]/45 to-[#050b12]/92" />
          <Container className="relative z-10 flex min-h-[440px] flex-col justify-end pb-9 pt-24 lg:min-h-[520px]">
            <div className="mx-auto w-full max-w-[800px]">
              {/* крошки */}
              <nav aria-label="Хлебные крошки" className="mb-5 flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-widest text-foam/55">
                <Link href="/catalog?type=case" className="transition-colors hover:text-teal">CASES</Link>
                <span className="opacity-40">/</span>
                <span className="text-foam/45 overflow-hidden text-ellipsis whitespace-nowrap">{doc.title}</span>
              </nav>

              {doc.kind && (() => {
                // чип исхода: Провал → красный, Успех → зелёный, Разбор → жёлтый
                const ck = doc.kind === "Провал" ? "#f0795c" : doc.kind === "Успех" ? "#3dd39b" : "#ecc04a";
                return (
                  <span
                    className="mb-4 inline-block rounded-md px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm"
                    style={{ color: ck, backgroundColor: ck + "2b" }}
                  >
                    {doc.kind}
                  </span>
                );
              })()}

              <h1 className="text-4xl font-black !text-foam sm:text-5xl lg:text-6xl leading-[1.0] tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.5)]">
                <span className="case-title-html inline-block" dangerouslySetInnerHTML={{ __html: doc.titleHtml }} />
              </h1>

              {doc.sub && (
                <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-foam/85 sm:text-xl [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
                  {doc.sub}
                </p>
              )}
            </div>
          </Container>
        </section>
        <section className="py-12">
          <Container>
            <article className="case-content" dangerouslySetInnerHTML={{ __html: doc.body }} />
          </Container>
        </section>
        {/* эффекты как у обзоров: плавное появление блоков при скролле */}
        <Script src="/review-enhance.js?v=2" strategy="afterInteractive" />

        {/* Дальше читать + мягкий мост к финмодели (Академию в воронку не превращаем,
            кейсы — можно: чужая ошибка → посчитай свою) */}
        <section className="deck py-16">
          <Container>
            <div className="mx-auto max-w-[800px]">
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
                  Инструмент расчета риска покажет твою точку безубыточности до того, как ты вложишься.
                </p>
              </div>
              <Button href="/catalog?type=finmodel">Посчитать мой бизнес</Button>
            </div>
            </div>
          </Container>
        </section>
        </div>
      </div>
    );
  }

  return <ProductPage p={p} />;
}
