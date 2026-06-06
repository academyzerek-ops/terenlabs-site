import Link from "next/link";
import { Container } from "@/components/Container";
import { ProductPage } from "@/components/ProductPage";
import { ProductMissing } from "@/components/ProductMissing";
import { CaseTrainer } from "@/components/CaseTrainer";
import { getItem } from "@/lib/content";

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

  return <ProductPage p={p} />;
}
