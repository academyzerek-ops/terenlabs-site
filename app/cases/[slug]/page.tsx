import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";
import { ProductPage } from "@/components/ProductPage";
import { CaseTrainer } from "@/components/CaseTrainer";
import { getItem, CASES } from "@/lib/content";
import { getCaseDoc, CASE_DOCS } from "@/lib/cases-data";
import { pageMetadata } from "@/lib/seo";
import { ContentSidebar } from "@/components/ContentSidebar";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import "./case-content.css";

// Все слаги известны на сборке: неизвестный отдаёт настоящий 404, а не 200
// с пустой страницей (аудит ссылок 06.09.2026).
export const dynamicParams = false;

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
    path: `/cases/${slug}`,
  });
}


// 3 соседних кейса по порядку (детерминированно, без random — SSR-стабильно)
function related(slug: string) {
  const i = CASE_DOCS.findIndex((c) => c.slug === slug);
  return [1, 2, 3].map((d) => CASE_DOCS[(i + d) % CASE_DOCS.length]);
}

// Исход кейса → ярлык Notion dark (фон / текст)
function kindTone(kind: string) {
  return kind === "Провал"
    ? { bg: "var(--color-tag-red)", ink: "var(--color-tag-red-ink)" }
    : kind === "Успех"
    ? { bg: "var(--color-tag-green)", ink: "var(--color-tag-green-ink)" }
    : { bg: "var(--color-tag-yellow)", ink: "var(--color-tag-yellow-ink)" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("case", slug);
  if (!p) notFound();

  // Демо кейс-тренажёра с ветвлением (наш дифференциатор)
  if (slug === "case-marketplace") {
    return (
      <>
        <section className="border-b border-line">
          <Container className="py-14 sm:py-16">
            <nav aria-label="Хлебные крошки" className="mb-6 text-[13px] text-faint">
              <Link href="/catalog?type=case" className="hover:text-ink">Кейсы</Link>
              <span className="mx-2">/</span>
              <span>{p.title}</span>
            </nav>
            <p className="eyebrow">Кейс-тренажёр · ветвление решений</p>
            <h1 className="mt-4 max-w-[20ch] text-[24px] sm:text-[38px]">{p.title}</h1>
            <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">
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
    const dotOf = (kind: string) => kindTone(kind).ink;
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
    const tone = kindTone(doc.kind);
    return (
      <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
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
        <div className="lg:sticky lg:top-0 lg:h-dvh">
          <ContentSidebar
            title="Кейсы"
            backHref="/catalog?type=case"
            backLabel="к каталогу"
            activeSlug={slug}
            items={sidebarItems}
          />
        </div>
        <div className="min-w-0">
          {/* Шапка кейса: крошки, исход, заголовок, подзаголовок; обложка ниже отдельной карточкой */}
          <section className="border-b border-line">
            <Container className="py-12 sm:py-14">
              <div className="mx-auto w-full max-w-[800px]">
                <nav aria-label="Хлебные крошки" className="mb-6 flex items-center gap-2 text-[13px] text-faint">
                  <Link href="/catalog?type=case" className="shrink-0 hover:text-ink">Кейсы</Link>
                  <span>/</span>
                  <span className="truncate">{doc.title}</span>
                </nav>

                {doc.kind && (
                  <p className="mb-4">
                    <span className="tag" style={{ background: tone.bg, color: tone.ink }}>{doc.kind}</span>
                  </p>
                )}

                <h1 className="text-[20px] sm:text-[44px] lg:text-[40px]">
                  <span className="case-title-html" dangerouslySetInnerHTML={{ __html: doc.titleHtml }} />
                </h1>

                {doc.sub && (
                  <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-text-2 sm:text-[19px]">
                    {doc.sub}
                  </p>
                )}

                {doc.image && (
                  <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[8px] border border-line bg-card">
                    <Image
                      src={doc.image}
                      alt=""
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 800px"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </Container>
          </section>

          <section className="py-12">
            <Container>
              <article className="case-content" dangerouslySetInnerHTML={{ __html: doc.body }} />
            </Container>
          </section>

          {/* Дальше читать + мягкий мост к финмодели (Академию в воронку не превращаем,
              кейсы — можно: чужая ошибка → посчитай свою) */}
          <section className="border-t border-line bg-subtle py-16">
            <Container>
              <div className="mx-auto max-w-[800px]">
                <h2 className="text-[22px] sm:text-[24px]">Дальше читать</h2>
                <div className="mt-6">
                  {related(doc.slug).map((r) => {
                    const rt = kindTone(r.kind);
                    return (
                      <Link
                        key={r.slug}
                        href={`/cases/${r.slug}`}
                        className="flex items-center justify-between gap-6 border-t border-line py-4 transition-colors hover:bg-hover"
                      >
                        <div className="min-w-0">
                          <span className="tag" style={{ background: rt.bg, color: rt.ink }}>{r.kind}</span>
                          <h3 className="mt-2 text-[15px] leading-snug">{r.title}</h3>
                        </div>
                        <span className="link shrink-0 text-[14px]">
                          Читать <Arrow />
                        </span>
                      </Link>
                    );
                  })}
                  <div className="border-t border-line" />
                </div>

                <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[8px] border border-line bg-card p-6 sm:flex-row sm:items-center sm:p-8">
                  <div>
                    <h3 className="text-[20px] sm:text-[20px]">Чужая ошибка разобрана. Своя — посчитана?</h3>
                    <p className="mt-2 max-w-[52ch] text-[14px] leading-relaxed text-text-2">
                      Инструмент расчета риска покажет твою точку безубыточности до того, как ты вложишься.
                    </p>
                  </div>
                  <Button href="/catalog?type=finmodel" className="shrink-0">
                    Посчитать мой бизнес <Arrow />
                  </Button>
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
