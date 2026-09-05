import Link from "next/link";
import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";
import { ACADEMY } from "@/lib/learn";
import { TrackCards } from "@/components/TrackCards";
import { CASES } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Своё дело",
  description:
    "Малый бизнес в Казахстане: Академия, модели малого бизнеса, кейсы и обзоры ниш. Считаем в тенге, говорим о рисках до того, как вложишься.",
  path: "/delo",
});

// Хаб «Своё дело»: локальный малый бизнес, тенге, ниши. Второй хаб — /startup.
const NICHES = [
  { id: "food", label: "Еда и напитки" },
  { id: "beauty", label: "Бьюти" },
  { id: "sport", label: "Спорт и здоровье" },
  { id: "auto", label: "Авто" },
  { id: "retail", label: "Торговля" },
  { id: "service", label: "Услуги" },
  { id: "kids", label: "Дети и досуг" },
];

export default function DeloPage() {
  // в хабе «Своё дело» только треки малого бизнеса; трек стартапа живёт на /startup
  const tracks = ACADEMY.filter((t) => (t.hub ?? "delo") === "delo");
  const models = tracks.find((t) => t.slug === "course-models");
  const cases = CASES.filter((c) => c.tag && !c.stub).slice(0, 5);

  return (
    <>
      <section className="border-b border-line">
        <Container className="py-14 sm:py-20">
          <p className="eyebrow">Своё дело · Казахстан · тенге</p>
          <h1 className="mt-3 max-w-[18ch] text-[24px] sm:text-[40px]">Бизнес здесь и сейчас: точка, мастер, магазин</h1>
          <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">
            Академия про то, как не потерять деньги в малом бизнесе, модели, по которым он живёт,
            кейсы, где чужие деньги уже сгорели, и обзоры ниш с реальной экономикой рынка.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href="/courses/course-fundament">
              Начать с Фундамента <Arrow />
            </Button>
            <Link href="/tests/crab-t1/take" className="link text-[15px]">
              Или сразу тест Краба
            </Link>
          </div>
        </Container>
      </section>

      {/* Академия: треки списком */}
      <section id="akademiya" className="border-b border-line">
        <Container className="py-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
            <h2 className="text-[24px] sm:text-[20px]">Академия</h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              Треки идут от денег к рынку и людям. Проходить можно в любом порядке, ранг в Океане
              дают тесты.
            </p>
          </div>
          <div className="mt-8">
            <TrackCards tracks={tracks} />
          </div>
        </Container>
      </section>

      {/* Модели малого бизнеса + кейсы */}
      <section className="border-b border-line">
        <Container className="py-16"><div className="panel grid gap-12 p-6 lg:grid-cols-2 lg:grid-rows-[auto_auto_auto_auto] lg:gap-x-0 lg:gap-y-0 lg:p-0">
          <div className="grid gap-4 lg:row-span-4 lg:grid-rows-subgrid lg:p-10">
            <p className="eyebrow">Модели малого бизнеса</p>
            <h2 className="text-[20px] sm:text-[24px]">Решётка: какую модель выбрать для своей точки</h2>
            <p className="max-w-[48ch] text-[15px] leading-relaxed text-text-2">
              Услуги, торговля, производство, аренда, посредники и гибриды. У каждой модели свой
              потолок и свой капкан, решётка показывает их до того, как ты в них попадёшь.
            </p>
            <div className="self-start">
              {(models?.modules ?? []).slice(0, 6).map((m) => (
                <div key={m.id} className="border-t border-line py-3 text-[15px] text-body">{m.title}</div>
              ))}
              <div className="border-t border-line pt-3">
                <Link href="/courses/course-models" className="link text-[14px]">
                  Весь трек <Arrow />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:row-span-4 lg:grid-rows-subgrid lg:border-l lg:border-line lg:p-10">
            <p className="eyebrow">Кейсы</p>
            <h2 className="text-[20px] sm:text-[24px]">Где чужие деньги уже сгорели</h2>
            <p className="max-w-[48ch] text-[15px] leading-relaxed text-text-2">
              Реальные истории малого бизнеса с главной ошибкой и уроком. Дешевле учиться на них.
            </p>
            <div className="self-start">
              {cases.map((c) => (
                <Link key={c.slug} href={c.href} className="flex items-center justify-between gap-4 border-t border-line py-3 text-[15px] transition-colors hover:bg-subtle">
                  <span className="truncate text-body">{c.title}</span>
                  {c.badge && <span className="tag shrink-0">{c.badge}</span>}
                </Link>
              ))}
              <div className="border-t border-line pt-3">
                <Link href="/catalog?type=case" className="link text-[14px]">
                  Все кейсы <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </div></Container>
      </section>

      {/* Ниши */}
      <section>
        <Container className="py-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
            <h2 className="text-[24px] sm:text-[20px]">Ниши: обзоры рынка</h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              Спрос, конкуренция, маржа и типовые потери по каждой нише. Читать до того, как искать
              помещение.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {NICHES.map((n) => (
              <Link
                key={n.id}
                href={`/catalog?type=review&filter=${n.id}`}
                className="flex h-9 items-center rounded-[8px] border border-line px-3 text-[14px] text-text-2 transition-colors hover:bg-subtle hover:text-ink"
              >
                {n.label}
              </Link>
            ))}
            <Link href="/catalog?type=review" className="flex h-9 items-center rounded-[8px] border border-line-2 bg-subtle px-3 text-[14px] text-ink">
              Все ниши
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
