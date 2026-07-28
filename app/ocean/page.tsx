import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { OceanLeaderboard } from "@/components/OceanLeaderboard";

export const metadata = {
  alternates: { canonical: "/ocean" }, title: "Рейтинг «Океан» — TerenLabs" };

// Механика мест — зеркало backend/app/routers/ocean.py (источник правды):
// rank_score = средняя точность × (60 / среднее время на вопрос), антифрод-пол 5 сек;
// композит = сумма СРЕДНИХ по тестам уровня (Краб t1-t3, Барракуда 5 тестов —
// все гейтят уровень, Дельфин/Акула — открытые кейсы); пороги 7/10 (crab-t3 — 6).
export default function OceanPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy-900">
        <img src="/lessons/fund_m6-ch03_horizon-distance.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(6,24,42,0.94) 0%, rgba(6,24,42,0.8) 45%, rgba(6,24,42,0.35) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(6,24,42,0.85) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(70% 90% at 20% 30%, rgba(84,104,232,0.24), transparent 65%)" }} />
        <Container className="relative z-10 py-20 sm:py-24">
          <nav className="mb-5 text-sm text-foam/50">
            <Link href="/levels" className="hover:text-teal">Океан</Link>
            <span className="mx-2">/</span>
            <span>Рейтинг</span>
          </nav>
          <p className="eyebrow rise">Живая таблица мест</p>
          <h1 className="rise mt-4 max-w-2xl text-4xl !text-foam sm:text-5xl lg:text-6xl" style={{ animationDelay: "80ms" }}>
            Рейтинг «Океан»
          </h1>
          <p className="rise mt-4 max-w-xl text-lg text-foam/75" style={{ animationDelay: "160ms" }}>
            Место в стае зарабатывают решениями: точность ответов, помноженная
            на скорость мысли. Сравнивай себя по всему Казахстану, со своими
            земляками по области — и внутри своего уровня.
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
            <Reveal>
            <div className="card-premium h-full p-7">
              <div className="num text-3xl font-semibold text-[#5468e8]">точность × скорость</div>
              <h3 className="mt-3 text-lg text-heading">Очки места</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Средний балл попыток умножается на коэффициент темпа: чем быстрее
                верные ответы, тем выше очки. Отвечать наугад быстрее 5 секунд
                бессмысленно — антифрод-пол выравнивает спринтеров.
              </p>
            </div>
            </Reveal>
            <Reveal delay={130}>
            <div className="card-premium h-full p-7">
              <div className="num text-3xl font-semibold text-[#5468e8]">сумма средних</div>
              <h3 className="mt-3 text-lg text-heading">Композит уровня</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Сумма средних баллов по тестам уровня — пересдачи наугад витрину
                не красят. У Краба три теста, у Барракуды пять (четыре дисциплины
                и универсальный), дальше — открытые кейсы, которые оценивает
                TEREN-AI. Порог сдачи — 7 из 10 (Краб·Универсальный — 6).
              </p>
            </div>
            </Reveal>
            <Reveal delay={260}>
            <div className="card-premium h-full p-7">
              <div className="num text-3xl font-semibold text-[#5468e8]">кто раньше</div>
              <h3 className="mt-3 text-lg text-heading">Равные очки</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                При равных очках выше стоит тот, кто раньше вошёл в океан.
                Стрик активных дней и бейджи скорости — видны в таблице.
              </p>
            </div>
            </Reveal>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[var(--radius-lg)] bg-navy p-8 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl !text-foam sm:text-2xl">Хочешь в таблицу?</h3>
              <p className="mt-2 text-sm text-foam/65">
                Войди — и попытки на сайте идут в зачёт. Тот же аккаунт работает
                в Mini App: прогресс общий, где бы ты ни проходил.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/auth/sign-in">Войти</Button>
              <Button href="/levels/krab" variant="ghost">Пройти тест Краба →</Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
