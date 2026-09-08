import Link from "next/link";
import { Arrow } from "@/components/Button";
import { TestPath } from "@/components/TestPath";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Тесты",
  description: "Погружение по уровням Океана: от первых тестов Краба до кейсов Акулы. Пройденное засчитывается в ранг после входа.",
  path: "/tests",
});

// Тесты как одно погружение сверху вниз: уровни, между ними ворота с обитателем. Раньше были плитки.
export default function TestsPage() {
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <p className="eyebrow">Тесты</p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:gap-12">
            <h1 className="text-[30px] leading-[1.1] text-balance sm:text-[42px]">Погружение: от Краба до Кита</h1>
            <p className="text-[15px] leading-relaxed text-text-2">
              Один путь для всех. Каждый уровень открывается, когда сдан предыдущий, а угадать нельзя:
              балл считает сервер, открытые кейсы проверяет ИИ-акулёнок. Пройденное даёт ранг и место в рейтинге.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/levels" className="link text-[14px]">Что означают уровни <Arrow /></Link>
            <Link href="/ocean" className="link text-[14px]">Рейтинг <Arrow /></Link>
          </div>
        </div>
      </section>
      <div className="mx-auto w-full max-w-[1180px] px-5 py-7 sm:py-12 sm:px-8 lg:px-12">
        <TestPath />
      </div>
    </>
  );
}
