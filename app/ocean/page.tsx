import Link from "next/link";
import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";
import { OceanLeaderboard } from "@/components/OceanLeaderboard";

export const metadata = {
  alternates: { canonical: "/ocean" },
  title: "Рейтинг «Океан» — TerenLabs",
};

// Механика мест зеркалит backend/app/routers/ocean.py:
// rank_score = средняя точность × (60 / среднее время на вопрос), антифрод-пол 5 сек;
// композит = сумма средних по тестам уровня; пороги 7/10 (crab-t3 — 6).
export default function OceanPage() {
  return (
    <>
      <section className="border-b border-line">
        <Container className="py-14 sm:py-20">
          <nav className="mb-4 text-[13px] text-faint">
            <Link href="/levels" className="hover:text-ink">Океан</Link>
            <span className="mx-2">/</span>
            <span>Рейтинг</span>
          </nav>
          <p className="eyebrow">Живая таблица мест</p>
          <h1 className="mt-3 text-[36px] sm:text-[48px]">Рейтинг «Океан»</h1>
          <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-text-2">
            Место в стае зарабатывают решениями: точность ответов, помноженная на скорость
            мысли. Сравнивай себя по всему Казахстану, со своими земляками по области и
            внутри своего уровня.
          </p>
        </Container>
      </section>

      <section className="deck">
        <Container className="py-12">
          <OceanLeaderboard />
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="py-16">
          <p className="eyebrow">Механика</p>
          <h2 className="mt-3 text-[28px]">Как считается место</h2>
          <div className="mt-6 max-w-[860px]">
            {[
              ["Очки места", "Средний балл попыток умножается на коэффициент темпа: чем быстрее верные ответы, тем выше очки. Отвечать наугад быстрее 5 секунд бессмысленно, антифрод-пол выравнивает спринтеров."],
              ["Композит уровня", "Сумма средних баллов по тестам уровня. У Краба три теста, у Барракуды пять, дальше открытые кейсы, которые оценивает TEREN-AI. Порог сдачи 7 из 10 (Краб · Универсальный: 6)."],
              ["Равные очки", "Выше стоит тот, кто раньше вошёл в океан. Стрик активных дней и бейджи скорости видны в таблице."],
            ].map(([t, d]) => (
              <div key={t} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6">
                <span className="text-[15px] font-medium text-ink">{t}</span>
                <p className="text-[15px] leading-relaxed text-text-2">{d}</p>
              </div>
            ))}
            <div className="border-t border-line" />
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-[8px] border border-line bg-subtle p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-[20px]">Хочешь в таблицу?</h3>
              <p className="mt-1 text-[14px] text-text-2">
                Войди, и попытки на сайте идут в зачёт. Тот же аккаунт работает в Mini App.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/auth/sign-in">Войти</Button>
              <Button href="/levels/krab" variant="secondary">
                Пройти тест Краба <Arrow />
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
