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
  const totalFree = CATALOG.filter((p) => p.free && !p.stub).length;

  return (
    <>
      <section className="relative overflow-hidden bg-navy-900">
        <img src="/lessons/fund_m4-ch05_youth-light-pack.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(6,24,42,0.94) 0%, rgba(6,24,42,0.8) 45%, rgba(6,24,42,0.35) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(6,24,42,0.85) 100%)" }} />
        <Container className="relative z-10 py-20 sm:py-24">
          <p className="eyebrow">Знания открыты</p>
          <h1 className="mt-3 max-w-3xl text-4xl !text-foam sm:text-5xl lg:text-6xl">
            Открытая библиотека
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-foam/80 sm:text-xl">
            {totalFree} {plural(totalFree, "материал", "материала", "материалов")} в открытом
            доступе. Это не пробник — это продукт.
          </p>
        </Container>
      </section>

      <section className="deck py-16">
        <Container>
          {/* бенто-сетка: разнокалиберные ячейки, счётчики огромным кеглем (реестр §9, §18) */}
          <div className="grid gap-5 md:grid-cols-3 md:grid-rows-[260px_260px]">
            {/* Академия — главная ячейка 2×2 с кадром */}
            <Link
              href="/catalog?type=course"
              className="card-premium group relative flex flex-col justify-end overflow-hidden p-0 md:col-span-2 md:row-span-2"
            >
              <img src="/lessons/arch_m5-ch01_five-step-staircase.jpg" alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081b2e] via-[#0d2b45]/45 to-transparent" />
              <div className="relative p-8">
                <div className="num font-semibold !text-foam" style={{ fontSize: "clamp(56px, 5vw, 88px)", lineHeight: 1 }}>
                  {COURSES.length}<span className="text-2xl text-foam/60"> {plural(COURSES.length, "курс", "курса", "курсов")}</span>
                </div>
                <h2 className="mt-2 text-3xl !text-foam">Академия</h2>
                <p className="mt-2 max-w-md text-base text-foam/75">{groups[0].desc}</p>
                <span className="mt-4 inline-block text-base font-semibold text-teal transition-transform group-hover:translate-x-1">Смотреть →</span>
              </div>
            </Link>
            {/* Тесты */}
            <Link href="/catalog?type=test" className="card-premium group flex flex-col p-7">
              <div className="num text-5xl font-semibold text-teal-600">{freeTests.length}</div>
              <h2 className="mt-2 text-2xl text-heading">Тесты с разбором</h2>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{groups[1].desc}</p>
              <span className="text-sm font-semibold text-teal-600 transition-transform group-hover:translate-x-1">Смотреть →</span>
            </Link>
            {/* Кейсы — с кадром */}
            <Link href="/catalog?type=case" className="card-premium group relative flex flex-col justify-end overflow-hidden p-0">
              <img src="/lessons/arch_m7-ch01_breached-hull.jpg" alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081b2e] via-[#0d2b45]/40 to-transparent" />
              <div className="relative p-7">
                <div className="num text-5xl font-semibold !text-foam">{CASES.length}</div>
                <h2 className="mt-1 text-2xl !text-foam">Кейсы</h2>
                <span className="mt-2 inline-block text-sm font-semibold text-teal transition-transform group-hover:translate-x-1">Смотреть →</span>
              </div>
            </Link>
          </div>
          {/* Обзоры — широкая нижняя лента */}
          <Link
            href="/catalog?type=review"
            className="card-premium group relative mt-5 flex items-center overflow-hidden p-0"
          >
            <img src="/academy-assets/niche_hero/coffee.webp" alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(8,27,46,0.95) 25%, rgba(8,27,46,0.55) 70%, rgba(8,27,46,0.25) 100%)" }} />
            <div className="relative flex w-full items-center justify-between gap-6 p-8">
              <div>
                <div className="num text-5xl font-semibold !text-foam">{REVIEWS.length}</div>
                <h2 className="mt-1 text-2xl !text-foam">Обзоры ниш</h2>
                <p className="mt-1 max-w-lg text-[15px] text-foam/75">{groups[3].desc}</p>
              </div>
              <span className="shrink-0 text-base font-semibold text-teal transition-transform group-hover:translate-x-1">Смотреть →</span>
            </div>
          </Link>
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
