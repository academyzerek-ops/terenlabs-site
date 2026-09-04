import Link from "next/link";
import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";
import { RankSketch } from "@/components/RankSketch";
import { OceanTopTable } from "@/components/OceanTopTable";
import { OCEAN_RANKS } from "@/lib/content";
import type { LevelKey } from "@/lib/content";

export const metadata = { alternates: { canonical: "/" } };

// Глубина уровней: метафора, не бизнес-цифры (как на странице «Океан»)
const METERS: Record<LevelKey, string> = {
  rakushka: "0 м", krab: "20 м", barrakuda: "50 м", delfin: "120 м", akula: "300 м", kit: "1 000 м",
};

// Три шага платформы
const PATH = [
  {
    sub: "Академия",
    title: "Учиться",
    desc: "Модули без воды и кейсы, где чужие деньги уже сгорели. Дешевле учиться на чужих ошибках.",
    href: "/catalog?type=course",
    cta: "В Академию",
  },
  {
    sub: "Тесты",
    title: "Проверять",
    desc: "Тест, который нельзя угадать: балл честный, и за него дают ранг «Океан».",
    href: "/catalog?type=test",
    cta: "К тестам",
  },
  {
    sub: "Аналитика и расчёты",
    title: "Применять",
    desc: "Аналитика малого бизнеса и финмодели: подставь свои цифры и увидишь свой риск.",
    href: "/catalog?type=finmodel",
    cta: "К инструментам",
  },
];

// 5 наставлений: то, что есть в каждом отчёте и в финмодели
const PRECEPTS = [
  ["01", "Ramp-up", "Выручка приходит не с первого дня. Нужен запас на 4-5 месяцев, иначе кассовый разрыв убивает до набора клиентской базы."],
  ["02", "Сезонность", "У любой ниши есть месяцы провала. Их считают заранее, а не удивляются в январе."],
  ["03", "Маркетинг", "Канал привлечения и его цена входят в модель заработка. Без этого бизнес-план не считается."],
  ["04", "Кадры", "Модель «ремесло» рушится при болезни владельца. Строят бизнес, где мастера заменяемы."],
  ["05", "Резерв на старте", "Деньги на открытие и деньги на первые месяцы жизни. Это две разные суммы."],
];

// Демо-цифры финмодели кофейни (те же, что были на главной)
const DEMO = [
  ["Средний чек", "2 400 ₸"],
  ["Загрузка зала", "45 %"],
  ["Чеков в день", "102"],
  ["Точка безубыточности", "118 чеков"],
];

export default function Home() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section>
        <Container className="grid gap-12 py-20 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end lg:py-28">
          <div className="flex flex-col gap-7">
            <p className="eyebrow">Обучение бизнесу · Казахстан</p>
            <h1 className="max-w-[18ch] text-[40px] sm:text-[56px] lg:text-[64px]">
              Единственная платформа обучения бизнесу в Казахстане
            </h1>
            <p className="max-w-[56ch] text-[18px] leading-relaxed text-text-2 sm:text-[20px]">
              Говорим о рисках и реальности, а не про «успешный успех». Видишь, где потеряешь
              деньги и время, до того как вложишься.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button href="/tests/crab-t1/take" size="lg">
                Пройти первый тест <Arrow />
              </Button>
              <Link href="/catalog?type=finmodel" className="link text-[15px]">
                Финмодель и бизнес-план под грант, бесплатно
              </Link>
            </div>
          </div>

          <div className="rounded-[8px] border border-line bg-subtle p-6">
            <p className="eyebrow">Манифест</p>
            <p className="mt-3 text-[20px] font-semibold leading-snug text-ink">
              «Лучше отговорить тебя от плохой идеи, чем продать надежду»
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-text-2">
              Если математика говорит «не открывай», мы скажем это прямо.
            </p>
          </div>
        </Container>
      </section>

      {/* ============ ЛЕСТНИЦА «ОКЕАН» ============ */}
      <section className="border-y border-line">
        <Container className="grid gap-y-8 py-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-x-8">
          <div className="flex flex-col justify-center gap-1.5 lg:pr-6">
            <p className="eyebrow">Лестница «Океан»</p>
            <p className="text-[14px] leading-relaxed text-text-2">
              Шесть уровней. Ранг растёт за понимание, его нельзя накликать.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-y-6 sm:grid-cols-6">
            {OCEAN_RANKS.map((r, i) => (
              <Link
                key={r.key}
                href={`/levels/${r.key}`}
                className={`group flex flex-col gap-3 py-1 pl-4 sm:border-l sm:border-line ${i === 0 ? "sm:border-l-0 sm:pl-0" : ""}`}
              >
                <RankSketch rank={r.key as LevelKey} size={40} className="text-body transition-colors group-hover:text-ink" />
                <div>
                  <div className="text-[15px] font-medium text-ink">{r.name}</div>
                  <div className="num mt-0.5 text-[12px] text-faint">{METERS[r.key as LevelKey]}</div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ УЧИМ БИЗНЕСУ ЦЕЛИКОМ ============ */}
      <section>
        <Container className="py-20">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
            <h2 className="text-[30px] sm:text-[36px]">Учим бизнесу целиком</h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              Тебя готовили к контрольным, а не к кассовым разрывам. Здесь три шага: понять,
              проверить себя, посчитать своё.
            </p>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0">
            {PATH.map((s, i) => (
              <div
                key={s.title}
                className={`flex flex-col gap-3 md:pr-8 ${i > 0 ? "md:border-l md:border-line md:pl-8" : ""}`}
              >
                <p className="eyebrow">{s.sub}</p>
                <h3 className="text-[24px]">{s.title}</h3>
                <p className="max-w-[34ch] text-[15px] leading-relaxed text-text-2">{s.desc}</p>
                <Link href={s.href} className="link mt-1 text-[15px]">
                  {s.cta} <Arrow />
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ 5 НАСТАВЛЕНИЙ ============ */}
      <section className="border-y border-line bg-subtle">
        <Container className="py-20">
          <div className="max-w-[60ch]">
            <h2 className="text-[30px] sm:text-[36px]">5 наставлений, без которых бизнес-план опасен</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-text-2">
              То, о чём молчат инфобизнесмены. Каждый пункт есть в любом нашем отчёте и в финмодели.
            </p>
          </div>
          <div className="mt-10">
            {PRECEPTS.map(([n, t, d]) => (
              <div
                key={n}
                className="grid gap-2 border-t border-line py-5 sm:grid-cols-[56px_220px_minmax(0,1fr)] sm:gap-6"
              >
                <span className="num text-[13px] text-faint">{n}</span>
                <h3 className="text-[18px]">{t}</h3>
                <p className="max-w-[64ch] text-[15px] leading-relaxed text-text-2">{d}</p>
              </div>
            ))}
            <div className="border-t border-line" />
          </div>
        </Container>
      </section>

      {/* ============ ФИНМОДЕЛЬ + ОКЕАН ============ */}
      <section>
        <Container className="grid gap-16 py-20 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="eyebrow">Инструмент</p>
            <h2 className="text-[28px] sm:text-[32px]">Финмодель, которая считает за тебя</h2>
            <p className="max-w-[48ch] text-[15px] leading-relaxed text-text-2">
              Меняешь допущения, цифры пересчитываются вживую: P&amp;L, cash flow, точка
              безубыточности. Экспорт в Excel.
            </p>
            <div className="mt-2 max-w-[460px]">
              {DEMO.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-t border-line py-3 text-[15px]">
                  <span className="text-text-2">{k}</span>
                  <span className="num font-medium text-ink">{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-y border-line py-3 text-[15px]">
                <span className="font-medium text-ink">Прогноз прибыли</span>
                <span className="num font-medium text-danger">−1,4 млн ₸ / год</span>
              </div>
            </div>
            <Link href="/finmodels/finmodel-cafe" className="link mt-1 text-[15px]">
              Открыть демо <Arrow />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <p className="eyebrow">Океан · рейтинг</p>
            <h2 className="text-[28px] sm:text-[32px]">В океане уже идёт гонка</h2>
            <p className="max-w-[48ch] text-[15px] leading-relaxed text-text-2">
              Место зарабатывают решениями: точность ответов, помноженная на скорость мысли.
            </p>
            <div className="mt-2">
              <OceanTopTable limit={3} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
