import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { CATALOG, COURSES, CASES, REVIEWS, TESTS, plural } from "@/lib/content";
import Link from "next/link";

export const metadata = { title: "Открытая библиотека — TerenLabs" };

export default function Page() {
  const freeTests = TESTS.filter((t) => t.free && !t.stub);
  const groups = [
    {
      title: "Академия",
      desc: "Полные курсы — от финансовой грамотности до маркетинга. Открыты целиком, без звёздочек.",
      count: COURSES.length,
      noun: ["курс", "курса", "курсов"] as const,
      href: "/catalog?type=course",
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
      desc: "Реальные истории казахстанского бизнеса: где потеряли деньги и почему.",
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
  const totalFree = CATALOG.filter((p) => p.free && !p.stub).length;

  return (
    <>
      <section className="hero-ocean">
        <Container className="relative z-10 py-20 text-center">
          <p className="eyebrow">Знания открыты</p>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl !text-foam sm:text-5xl">
            Открытая библиотека
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-foam/75">
            {totalFree} {plural(totalFree, "материал", "материала", "материалов")} в открытом
            доступе: курсы Академии, тесты, кейсы и обзоры ниш. Это не пробник — это продукт.
          </p>
        </Container>
      </section>

      <section className="deck py-16">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {groups.map((g) => (
              <Link key={g.title} href={g.href} className="card-premium group flex flex-col p-7">
                <div className="num text-4xl font-semibold text-teal-600">{g.count}</div>
                <h2 className="mt-2 text-2xl text-heading">{g.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{g.desc}</p>
                <span className="mt-5 text-sm font-semibold text-teal-600 transition-transform group-hover:translate-x-1">
                  Смотреть {g.count} {plural(g.count, g.noun[0], g.noun[1], g.noun[2])} →
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button href="/tests/t1-a04/take" size="lg">
              Начать с теста
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
