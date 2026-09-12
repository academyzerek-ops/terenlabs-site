import Link from "next/link";
import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";
import { getTrack } from "@/lib/learn";
import { HubSwitch } from "@/components/HubSwitch";
import { HubTests } from "@/components/HubTests";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Фундамент",
  description:
    "Как на тебе зарабатывают — и как это видеть. Цена с девятками, FOMO, кешбэк, рассрочка, блогер, который тебя выбрал. Не про «откладывай десять процентов», а про механику, которой пользуется любой бизнес.",
  path: "/money",
});

// Хаб «Фундамент»: четвёртая дверь рядом с «Предпринимателем», «Фаундером»
// и «Инвестором». В отличие от них — не роль, а основа под все три.
// Главы уже написаны (трек course-fundament, 46 глав), эта страница даёт им
// собственную витрину: в хабе «Предприниматель» они терялись среди семи треков.
// Ветка подготовительная, но ничего не закрывает: возраст нигде не ограничивает
// доступ к Океану (решение Адиля 11.09.2026, канон 16_HUBS.md).
const TRACK_SLUG = "course-fundament";
const FIRST_CHAPTER = "m1-ch00";

// Чему учит каждый урок — своими словами, не пересказ оглавления.
const LESSON_LEAD: Record<string, string> = {
  m1: "Почему бумажка чего-то стоит, кто это решил и что происходит, когда договор рушится.",
  m2: "Ценники, витрины, запахи и маршруты по залу. Всё это спроектировано, и не тобой.",
  m3: "Кешбэк, рассрочка, пробный месяц, блогер с промокодом. Где здесь подарок, а где счёт.",
  m4: "Потребитель, наёмник, созидатель. Одна и та же скидка выглядит по-разному из каждой роли.",
  m5: "Единственный ресурс, который нельзя вернуть, и почему в шестнадцать его больше, чем денег.",
  m6: "Зарплата, фриланс, своё дело, капитал. Откуда деньги берутся на самом деле.",
  m7: "Активы и пассивы, риск против неопределённости, горизонт в десять лет.",
  m8: "Университет, ремесло, свободный график, сразу в дело. Четыре дороги и цена каждой.",
};

export default function MoneyPage() {
  const track = getTrack(TRACK_SLUG);
  const lessons = track?.modules ?? [];
  const chapters = lessons.reduce((n, m) => n + m.chapters.length, 0);

  return (
    <>
      <section className="border-b border-line">
        <Container className="py-14 sm:py-20">
          <p className="eyebrow">Фундамент</p>
          <h1 className="mt-3 max-w-[20ch] text-[24px] sm:text-[40px]">
            Как на тебе зарабатывают — и как это видеть
          </h1>
          <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">
            Это не «откладывай десять процентов и веди бюджет». Это разбор механики, которой
            пользуется любой бизнес: цена с девятками, ловушка среднего выбора, FOMO, кешбэк
            пять процентов, рассрочка по 9 990, блогер, который тебя выбрал.
          </p>
          <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-text-2">
            Приёмы здесь не осуждаются. Тот, кто однажды откроет своё дело, будет применять
            их сам — но обязан их различать. Поэтому это одновременно защита и первый урок
            предпринимательского зрения.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href={`/learn/${TRACK_SLUG}?ch=${FIRST_CHAPTER}`}>
              Начать с первой главы <Arrow />
            </Button>
            <Link href="#program" className="link text-[15px]">
              Вся программа
            </Link>
          </div>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-9 sm:py-14">
          <div className="panel grid gap-4 p-7 sm:p-10">
            <p className="eyebrow">Кому</p>
            <h2 className="text-[20px] sm:text-[24px]">Возраст здесь ничего не закрывает</h2>
            <p className="max-w-[64ch] text-[15px] leading-relaxed text-text-2">
              Главы написаны так, что их поймёт школьник, и так, что их не стыдно читать
              взрослому: примеры одни и те же, потому что на девятках в ценнике ловятся все.
              Это основа под остальные три хаба — её проходят до того, как выбирают дорогу.
            </p>
            <p className="max-w-[64ch] text-[15px] leading-relaxed text-text-2">
              При этом ничего не заперто. Захотел в тринадцать сдавать тесты Океана наравне
              со всеми — иди: доступ открыт в любом возрасте, а в рейтинге ты виден и среди
              ровесников, и в общей таблице.
            </p>
            <Link href="/levels" className="link self-start text-[15px]">
              Лестница Океана <Arrow />
            </Link>
          </div>
        </Container>
      </section>

      <section id="program" className="border-b border-line">
        <Container className="py-9 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
            <h2 className="text-[20px] sm:text-[24px]">Программа</h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              {lessons.length} уроков, {chapters} глав. Читать можно с любого места, но порядок
              не случаен: сначала откуда у денег берётся ценность, потом как её у тебя забирают,
              и только в конце — что с этим делать.
            </p>
          </div>

          <div className="mt-8 sm:mt-10">
            {lessons.map((l, idx) => (
              <div
                key={l.id}
                className="grid gap-3 border-t border-line py-6 sm:grid-cols-[56px_240px_minmax(0,1fr)] sm:gap-6"
              >
                <span className="num text-[13px] text-faint">{String(idx + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <h3 className="text-[16px]">{l.title.replace(/^Урок\s*\d+\s*·\s*/, "")}</h3>
                  {LESSON_LEAD[l.id] && (
                    <p className="mt-1 text-[14px] leading-relaxed text-text-2">{LESSON_LEAD[l.id]}</p>
                  )}
                </div>
                <ol className="min-w-0 max-w-[64ch] space-y-2">
                  {l.chapters.map((c, i) => (
                    <li
                      key={c.file}
                      className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 text-[14px] leading-relaxed"
                    >
                      <span className="num text-[13px] text-faint">{i + 1}</span>
                      <Link href={`/learn/${TRACK_SLUG}?ch=${c.file}`} className="link">
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
            <div className="border-t border-line" />
          </div>
        </Container>
      </section>

      <HubTests hub="money" />
      <HubSwitch current="money" title="Три дороги после этого хаба" />
    </>
  );
}
