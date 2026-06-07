import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { OceanLeaderboard } from "@/components/OceanLeaderboard";

export const metadata = { title: "Рейтинг «Океан» — TerenLabs" };

// Механика мест — зеркало backend/app/routers/ocean.py (источник правды):
// rank_score = средняя точность × (60 / среднее время на вопрос), антифрод-пол 5 сек;
// композит = сумма лучших средних по T1/T2/T3 Краба; пороги сдачи 7/7/6.
export default function OceanPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy-900">
        <img src="/lessons/fund_m6-ch03_horizon-distance.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(6,24,42,0.94) 0%, rgba(6,24,42,0.8) 45%, rgba(6,24,42,0.35) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(6,24,42,0.85) 100%)" }} />
        <Container className="relative z-10 py-20 sm:py-24">
          <nav className="mb-5 text-sm text-foam/50">
            <Link href="/levels" className="hover:text-teal">Океан</Link>
            <span className="mx-2">/</span>
            <span>Рейтинг</span>
          </nav>
          <p className="eyebrow">Живая таблица мест</p>
          <h1 className="mt-4 max-w-2xl text-4xl !text-foam sm:text-5xl lg:text-6xl">
            Рейтинг «Океан»
          </h1>
          <p className="mt-4 max-w-xl text-lg text-foam/75">
            Место в стае зарабатывают решениями: точность ответов, помноженная
            на скорость мысли. Это те же данные, что в Mini App — вживую.
          </p>
        </Container>
      </section>

      <section className="deck py-14">
        <Container>
          <OceanLeaderboard />
        </Container>
      </section>

      {/* механика распределения мест — честно и прозрачно */}
      <section className="deck pb-20">
        <Container>
          <div className="section-no">
            <span className="no">МЕХАНИКА</span>
            <span className="ln" />
            <span className="no" style={{ opacity: 0.5 }}>КАК СЧИТАЕТСЯ МЕСТО</span>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="card-premium p-7">
              <div className="num text-3xl font-semibold text-teal-600">точность × скорость</div>
              <h3 className="mt-3 text-lg text-heading">Очки места</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Средний балл попыток умножается на коэффициент темпа: чем быстрее
                верные ответы, тем выше очки. Отвечать наугад быстрее 5 секунд
                бессмысленно — антифрод-пол выравнивает спринтеров.
              </p>
            </div>
            <div className="card-premium p-7">
              <div className="num text-3xl font-semibold text-teal-600">T1 + T2 + T3</div>
              <h3 className="mt-3 text-lg text-heading">Композит уровня</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Сумма лучших результатов по трём тестам уровня: Теория,
                Применение, Анализ. Пороги сдачи — 7, 7 и 6 из 10. Прошёл все
                три — поднялся на следующий уровень.
              </p>
            </div>
            <div className="card-premium p-7">
              <div className="num text-3xl font-semibold text-teal-600">кто раньше</div>
              <h3 className="mt-3 text-lg text-heading">Равные очки</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                При равных очках выше стоит тот, кто раньше вошёл в океан.
                Стрик активных дней и бейджи скорости — видны в таблице.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[var(--radius-lg)] bg-navy p-8 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl !text-foam sm:text-2xl">Хочешь в таблицу?</h3>
              <p className="mt-2 text-sm text-foam/65">
                На сайте тесты проходятся анонимно — для зачёта в рейтинг открой
                «Океан» в Mini App.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="https://t.me/terenlabs_bot">Открыть Mini App</Button>
              <Button href="/levels/krab" variant="ghost">Потренироваться →</Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
