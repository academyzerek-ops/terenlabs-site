import Link from "next/link";
import { Container } from "@/components/Container";
import { Arrow } from "@/components/Button";
import { TestPath } from "@/components/TestPath";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Тесты",
  description: "Тропа тестов Океана: от разминки Ракушки до кейсов Акулы. Пройденное засчитывается в ранг после входа.",
  path: "/tests",
});

// Тесты как одна тропа сверху вниз: уровни, между ними ворота с обитателем. Раньше были плитки.
export default function TestsPage() {
  return (
    <>
      <section className="border-b border-line">
        <Container className="py-12 sm:py-14">
          <p className="eyebrow">Тесты</p>
          <h1 className="mt-3 max-w-[22ch] text-[30px] sm:text-[36px]">Тропа вниз: от Ракушки до Кита</h1>
          <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-text-2">
            Один путь для всех. Каждый уровень открывается, когда сдан предыдущий, а угадать нельзя:
            балл считает сервер, открытые кейсы проверяет TEREN-AI. Пройденное даёт ранг и место в рейтинге.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/levels" className="link text-[14px]">Что означают уровни <Arrow /></Link>
            <Link href="/ocean" className="link text-[14px]">Рейтинг <Arrow /></Link>
          </div>
        </Container>
      </section>
      <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8 lg:px-12">
        <TestPath />
      </div>
    </>
  );
}
