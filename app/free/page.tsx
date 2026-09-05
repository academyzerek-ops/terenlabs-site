import Link from "next/link";
import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";
import { CATALOG, COURSES, CASES, REVIEWS, TESTS, plural } from "@/lib/content";

export const metadata = {
  alternates: { canonical: "/free" }, title: "Открытая библиотека — TerenLabs" };

// Открытая библиотека как реестр: четыре строки, в каждой раздел, описание,
// живой объём из контент-слоя и ссылка в каталог. Без обложек и витринных цифр.
export default function Page() {
  const freeTests = TESTS.filter((t) => t.free && !t.stub);
  const groups = [
    {
      title: "Академия",
      desc: "Полные курсы — от финансовой грамотности до маркетинга. Открыты целиком, без звёздочек.",
      count: COURSES.length,
      noun: ["курс", "курса", "курсов"] as const,
      href: "/academy",
    },
    {
      title: "Тесты с разбором",
      desc: "Честная проверка понимания: балл, разбор каждого ответа и ранг «Океан».",
      count: freeTests.length,
      noun: ["тест", "теста", "тестов"] as const,
      href: "/catalog?type=test",
    },
    {
      title: "Кейсы",
      desc: "Мировой опыт на реальных примерах: где теряют деньги и почему.",
      count: CASES.length,
      noun: ["кейс", "кейса", "кейсов"] as const,
      href: "/catalog?type=case",
    },
    {
      title: "Обзоры ниш",
      desc: "Разборы рынков на цифрах: экономика, риски, сезонность — до того, как вложишься.",
      count: REVIEWS.length,
      noun: ["обзор", "обзора", "обзоров"] as const,
      href: "/catalog?type=review",
    },
  ];

  return (
    <>
      <Container className="py-14 sm:py-20">
        <p className="eyebrow">Знания открыты</p>
        <h1 className="mt-3 max-w-[20ch] text-[30px] sm:text-[38px]">Открытая библиотека</h1>
        <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">
          Модули, тесты, кейсы и аналитика открыты целиком. Это не пробник, это продукт.
        </p>
      </Container>

      <Container className="pb-20">
        <div className="hidden grid-cols-[220px_minmax(0,1fr)_120px] gap-6 pb-2 text-[12px] font-medium text-text-2 sm:grid">
          <span>Раздел</span>
          <span>Что внутри</span>
          <span />
        </div>
        {groups.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="group grid gap-2 border-t border-line py-5 transition-colors hover:bg-subtle sm:grid-cols-[220px_minmax(0,1fr)_120px] sm:items-center sm:gap-6"
          >
            <h2 className="text-[20px]">{g.title}</h2>
            <p className="max-w-[60ch] text-[15px] leading-relaxed text-text-2">{g.desc}</p>
            <span className="link text-[15px] sm:justify-self-end">
              Смотреть <Arrow />
            </span>
          </Link>
        ))}
        <div className="border-t border-line" />

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button href="/tests/t1-a04/take" size="lg">
            Начать с теста <Arrow />
          </Button>
          <Link href="/catalog" className="link text-[15px]">
            Весь каталог <Arrow />
          </Link>
        </div>
      </Container>
    </>
  );
}
