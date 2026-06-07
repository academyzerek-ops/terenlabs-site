import Link from "next/link";
import { Container } from "@/components/Container";
import { ProductPage } from "@/components/ProductPage";
import { ProductMissing } from "@/components/ProductMissing";
import { FinModelCafe } from "@/components/FinModelCafe";
import { Mentorings } from "@/components/Mentorings";
import { getItem } from "@/lib/content";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("finmodel", slug);
  if (!p) return <ProductMissing />;

  // Демо интерактивной финмодели (наш дифференциатор)
  if (slug === "finmodel-cafe") {
    return (
      <>
        <section className="hero-ocean">
          <Container className="relative z-10 py-14">
            <nav className="mb-5 text-sm text-foam/50">
              <Link href="/catalog?type=finmodel" className="hover:text-teal">Финмодели</Link>
              <span className="mx-2">/</span>
              <span>{p.title}</span>
            </nav>
            <p className="eyebrow">Интерактивная финмодель · демо</p>
            <h1 className="mt-4 text-4xl !text-foam sm:text-5xl">{p.title}</h1>
            <p className="mt-4 max-w-xl text-lg text-foam/75">
              Двигай ползунки — модель пересчитывается вживую. Это рабочий инструмент, а не лекция.
            </p>
          </Container>
        </section>
        <FinModelCafe />
        <Mentorings />
      </>
    );
  }

  return <ProductPage p={p} />;
}
