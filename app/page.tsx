import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { HookCarousel } from "@/components/HookCarousel";
import {
  COLLECTIONS,
  STEPS,
  OCEAN_RANKS,
  CATALOG,
  PROOF_STATS,
} from "@/lib/content";

// Путь обучения: 3 ступени (кейсы — часть Академии/обучения)
const PATH = [
  {
    key: "learn",
    title: "Учиться",
    sub: "Академия",
    desc: "Проходишь модули и разбираешь реальные кейсы — теория сразу на практике.",
    items: ["Модули уроков", "Бизнес-кейсы"],
    href: "/catalog?type=course",
    cta: "В Академию",
  },
  {
    key: "check",
    title: "Проверять",
    sub: "Тесты",
    desc: "Честная проверка без зубрёжки. Получаешь балл и ранг «Океан».",
    items: ["Тесты с разбором", "Ранг за результат"],
    href: "/catalog?type=test",
    cta: "К тестам",
  },
  {
    key: "apply",
    title: "Применять",
    sub: "Обзоры и расчёты",
    desc: "Берёшь рабочие инструменты под свою задачу: разборы рынков и финмодели.",
    items: ["Обзоры бизнеса", "Финмодели и расчёты"],
    href: "/catalog?type=finmodel",
    cta: "К инструментам",
  },
];

export default function Home() {
  return (
    <>
      {/* ============ HERO — океан ============ */}
      <section className="relative min-h-[88vh] overflow-hidden">
        <video
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/ocean-poster.jpg?v=3"
        >
          <source src="/brand/ocean.mp4?v=3" type="video/mp4" />
        </video>
        {/* кинематографичное затемнение: по краям и в глубину снизу */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,24,42,0.55) 0%, rgba(6,24,42,0.35) 35%, rgba(6,24,42,0.75) 75%, #06182a 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(70% 60% at 22% 45%, transparent 0%, rgba(6,24,42,0.35) 100%)",
          }}
        />
        <Container className="relative z-10 flex min-h-[88vh] flex-col justify-center py-28">
          <p
            className="eyebrow rise !text-teal"
            style={{ animationDelay: "0ms", fontSize: "0.95rem", letterSpacing: "0.22em" }}
          >
            EdTech · FinTools · Океан бизнеса
          </p>
          <h1
            className="rise mt-6 max-w-4xl !text-foam"
            style={{
              animationDelay: "80ms",
              fontSize: "clamp(2.75rem, 7vw, 5.5rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              textShadow: "0 4px 40px rgba(0,0,0,0.5)",
            }}
          >
            Глубина анализа.
            <br />
            <span style={{ color: "var(--color-teal)" }}>Сила результата.</span>
          </h1>
          <p
            className="rise mt-7 max-w-xl text-lg leading-relaxed text-foam/80 sm:text-xl"
            style={{ animationDelay: "160ms", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            Не мотивация, а расчёт. Курсы, тесты, кейсы и рабочие финмодели —
            показывают, где ты теряешь деньги и время до того, как вложишься.
          </p>
          <div className="rise mt-9 flex flex-wrap items-center gap-5" style={{ animationDelay: "240ms" }}>
            <Button href="/levels" size="lg">
              Начать путь «Океан»
            </Button>
            <a href="#path" className="text-sm font-semibold text-foam/70 transition-colors hover:text-teal">
              Как это работает ↓
            </a>
          </div>
        </Container>
      </section>

      {/* ============ ПУТЬ ОБУЧЕНИЯ ============ */}
      <section id="path" className="atmo py-24">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl">От ракушки до акулы бизнеса</h2>
            <p className="mt-3 text-xl font-semibold text-teal sm:text-2xl">
              Сделай апгрейд скиллов бизнесмена
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Многоуровневая система: проходи модули и кейсы, проверяй себя тестами,
              поднимайся в ранге «Океан» — и становись участником Бизнес-клуба.
            </p>
          </div>

          {/* Визуальный путь: 6 рангов-орбов от ракушки до кита */}
          <div className="relative mt-12">
            {/* линия-течение под орбами */}
            <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-[2px] sm:block">
              <div className="mx-[8%] h-full bg-gradient-to-r from-teal/0 via-teal/40 to-teal/0" />
            </div>
            <ol className="relative grid grid-cols-3 gap-y-8 sm:grid-cols-6 sm:gap-0">
              {OCEAN_RANKS.map((r, i) => (
                <li key={r.key}>
                  <Link
                    href={`/levels/${r.key}`}
                    className="group flex flex-col items-center text-center"
                  >
                    <span className="num text-xs text-muted">0{i + 1}</span>
                    <img
                      src={r.img}
                      alt={r.name}
                      className="mt-1 h-16 w-16 object-contain transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110 sm:h-[72px] sm:w-[72px]"
                    />
                    <span className="mt-2 text-sm font-semibold text-heading">{r.name}</span>
                    <span className="text-xs text-muted">{r.meaning}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative mt-14">
            {/* соединительная линия-течение между ступенями (десктоп) */}
            <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-[2px] md:block">
              <div className="mx-[16%] h-full bg-gradient-to-r from-teal/0 via-teal/50 to-teal/0" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {PATH.map((step, i) => (
                <Link
                  key={step.key}
                  href={step.href}
                  className="card-premium group relative flex flex-col p-7"
                >
                  {/* номер-ступень в стеклянном пузыре */}
                  <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-teal/30 bg-gradient-to-b from-white to-teal-200/30 text-lg font-bold text-teal-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_16px_rgba(0,183,194,0.18)]">
                    0{i + 1}
                  </div>

                  <h3 className="text-2xl text-heading">{step.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-teal-600">{step.sub}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{step.desc}</p>

                  {/* что входит в шаг */}
                  <ul className="mt-5 space-y-1.5">
                    {step.items.map((it) => (
                      <li key={it} className="flex items-center gap-2 text-sm text-heading">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                        {it}
                      </li>
                    ))}
                  </ul>

                  <span className="mt-6 inline-block text-sm font-semibold text-teal-600 transition-transform group-hover:translate-x-1">
                    {step.cta} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ============ ЛЕНТА ПРОДУКТОВ — карусель крючков ============ */}
      <section className="atmo py-20">
        <Container>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl">Лента продуктов</h2>
          <div className="mt-14">
            <HookCarousel />
          </div>
        </Container>
      </section>

      {/* ============ ДИФФЕРЕНЦИАТОР — финмодели ============ */}
      <section className="hero-ocean">
        <Container className="relative z-10 grid items-center gap-12 py-24 md:grid-cols-2">
          <div>
            <SectionHeading
              light
              eyebrow="Наш инструмент"
              title="Финмодель, которая считает за тебя"
              desc="Меняешь допущения — цифры пересчитываются вживую. P&L, cash flow, точка безубыточности. Экспорт в Excel. Это не лекция, а рабочий инструмент."
            />
            <div className="mt-8">
              <Button href="/finmodels/finmodel-cafe" size="lg">
                Открыть демо финмодели
              </Button>
            </div>
          </div>

          {/* Превью-виджет (заглушка интерактива) */}
          <div className="rounded-[var(--radius-tl)] border border-white/10 bg-navy-900/60 p-6 shadow-[var(--shadow-tl)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-sm text-foam/60">Финмодель кофейни</span>
              <span className="num rounded-full bg-teal/15 px-2.5 py-1 text-xs text-teal">
                live
              </span>
            </div>
            <dl className="mt-5 space-y-4">
              <Row label="Средний чек" value="2 400 ₸" />
              <Row label="Загрузка" value="45 %" warn />
              <Row label="Точка безубыточности" value="118 чек/день" />
              <Row label="Прогноз прибыли" value="−1.4 млн ₸/год" danger />
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-foam/50">
              При загрузке 45% и просадке −30% летом бизнес уходит в минус.
              Модель показывает это до открытия.
            </p>
          </div>
        </Container>
      </section>

      {/* ============ КАК МЫ УЧИМ — с орбами ============ */}
      <section className="atmo py-20">
        <Container>
          <SectionHeading
            eyebrow="Подход"
            title="Реализм вместо «успешного успеха»"
          />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="card-premium p-7"
              >
                <div className="flex items-center gap-4">
                  <img src={s.img} alt="" className="h-16 w-16 shrink-0 object-contain" />
                  <span className="num text-3xl font-medium text-teal/30">{s.n}</span>
                </div>
                <h3 className="mt-5 text-xl text-heading">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ БАННЕР-ЦИФРЫ (глубина) ============ */}
      <section className="deep grain">
        <Container className="relative z-10 py-16">
          <div className="grid gap-10 sm:grid-cols-3">
            {PROOF_STATS.map((s) => (
              <div key={s.value}>
                <div className="num text-4xl font-semibold !text-foam sm:text-5xl">
                  {s.value}
                </div>
                <div className="mt-3 text-sm leading-relaxed text-foam/65">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ УРОВНИ «ОКЕАН» ============ */}
      <section className="atmo py-20">
        <Container>
          <SectionHeading
            eyebrow="Геймификация"
            title="Система уровней «Океан»"
            desc="Ранг = подтверждённое мастерство решений, а не число кликов. Сертификат ранга можно показать миру."
          />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {OCEAN_RANKS.map((r, i) => (
              <Link
                key={r.key}
                href={`/levels/${r.key}`}
                className="card-premium group p-5 text-center"
              >
                <img src={r.img} alt={r.name} className="mx-auto h-20 w-20 object-contain" />
                <h3 className="mt-4 text-base text-heading">{r.name}</h3>
                <p className="mt-1 text-xs text-muted">{r.meaning}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ ПОДБОРКИ ============ */}
      <section className="atmo py-20">
        <Container>
          <SectionHeading eyebrow="Discovery" title="Подборки под задачу" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {COLLECTIONS.map((c) => (
              <Link
                key={c.title}
                href={c.href}
                className="card-premium group flex items-center justify-between p-6"
              >
                <div>
                  <h3 className="text-lg text-heading">{c.title}</h3>
                  <span className="num mt-1 block text-xs text-muted">
                    {CATALOG.filter(c.filter).length} продуктов
                  </span>
                </div>
                <span className="text-teal-600 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ БАННЕР БИЗНЕС-КЛУБА ============ */}
      <section className="atmo py-20">
        <Container>
          <div className="grid items-center gap-8 rounded-[24px] border border-line bg-card p-8 sm:p-12 md:grid-cols-[1fr_200px]">
            <div>
              <p className="eyebrow">Вершина пути</p>
              <h2 className="mt-3 text-3xl text-heading sm:text-4xl">
                Путь заканчивается стаей
              </h2>
              <p className="mt-4 max-w-xl text-muted">
                Дойди до ранга Акула — и попадёшь в Бизнес-клуб: живые разборы
                твоих цифр, доска сделок и провалов, доступ к тем, кто уже в
                открытом океане. Место в стае зарабатывают решениями, а не оплатой.
              </p>
              <div className="mt-7">
                <Button href="/club">Узнать о клубе</Button>
              </div>
            </div>
            <img
              src="/brand/ranks/akula.png?v=11"
              alt="Акула"
              className="mx-auto h-40 w-40 object-contain md:h-48 md:w-48"
            />
          </div>
        </Container>
      </section>

      {/* ============ ФИНАЛЬНЫЙ CTA ============ */}
      <section className="pb-8">
        <Container>
          <div className="hero-ocean overflow-hidden rounded-[24px]">
            <div className="relative z-10 flex flex-col items-center px-8 py-20 text-center">
              <h2 className="max-w-2xl text-3xl !text-foam sm:text-4xl">
                Начни с честного теста — узнай свой ранг
              </h2>
              <p className="mt-4 max-w-lg text-foam/70">
                Бесплатно. С разбором каждого ответа. Без мотивашек.
              </p>
              <div className="mt-8">
                <Button href="/tests/t1-a04/take" size="lg">
                  Пройти бесплатный тест
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="num text-2xl font-medium text-foam">{value}</div>
      <div className="mt-1 text-xs text-foam/55">{label}</div>
    </div>
  );
}

function Row({
  label,
  value,
  warn,
  danger,
}: {
  label: string;
  value: string;
  warn?: boolean;
  danger?: boolean;
}) {
  const color = danger
    ? "var(--color-danger)"
    : warn
    ? "var(--color-warn)"
    : "var(--color-foam)";
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-foam/60">{label}</dt>
      <dd className="num text-sm font-medium" style={{ color }}>
        {value}
      </dd>
    </div>
  );
}
