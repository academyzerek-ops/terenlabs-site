import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { HookCarousel } from "@/components/HookCarousel";
import { Bubbles } from "@/components/Bubbles";
import { LiveQuiz } from "@/components/LiveQuiz";
import {
  COLLECTIONS,
  STEPS,
  OCEAN_RANKS,
  LEVELS,
  RANK_IMG,
  CATALOG,
  COURSES,
  TESTS,
  CASES,
  REVIEWS,
  plural,
} from "@/lib/content";
import { ACADEMY } from "@/lib/learn";

// Путь обучения: 3 ступени (кейсы — часть Академии/обучения)
const PATH = [
  {
    key: "learn",
    title: "Учиться",
    sub: "Академия",
    desc: "Модули без воды и кейсы, где чужие деньги уже сгорели. Дешевле учиться на чужих ошибках.",
    items: ["Модули уроков", "Бизнес-кейсы"],
    href: "/catalog?type=course",
    cta: "В Академию",
    img: "/lessons/arch_m5-ch01_five-step-staircase.jpg",
  },
  {
    key: "check",
    title: "Проверять",
    sub: "Тесты",
    desc: "Тест, который нельзя угадать: балл честный — и за него дают ранг «Океан».",
    items: ["Тесты с разбором", "Ранг за результат"],
    href: "/catalog?type=test",
    cta: "К тестам",
    img: "/lessons/arch_m7-ch04_readiness-compass.jpg",
  },
  {
    key: "apply",
    title: "Применять",
    sub: "Обзоры и расчёты",
    desc: "Обзоры рынков и финмодели: подставь свои цифры — увидишь свой риск.",
    items: ["Обзоры бизнеса", "Финмодели и расчёты"],
    href: "/catalog?type=finmodel",
    cta: "К инструментам",
    img: "/lessons/arch_m6-ch01_unit-econ-scale_v2.jpg",
  },
];

export default function Home() {
  // счётчики пути — из данных (правило: ничего не зашивать руками)
  const chapterTotal = ACADEMY.reduce((s, t) => s + t.chapterTotal, 0);
  const liveTests = TESTS.filter((t) => !t.stub);
  const questionTotal = liveTests.reduce((s, t) => s + (parseInt(t.metric?.value ?? "0") || 0), 0);
  const pathStats: Record<string, string> = {
    learn: `${COURSES.length} ${plural(COURSES.length, "курс", "курса", "курсов")} · ${chapterTotal} глав`,
    check: `${liveTests.length} ${plural(liveTests.length, "тест", "теста", "тестов")} · ${questionTotal} вопросов`,
    apply: `${CASES.length} кейсов · ${REVIEWS.length} обзоров`,
  };
  return (
    <>
      {/* ============ HERO — океан ============ */}
      <section className="vignette relative min-h-[88vh] overflow-hidden">
        <video
          className="hero-parallax pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/ocean-poster.jpg?v=3"
        >
          <source src="/brand/ocean.mp4?v=3" type="video/mp4" />
        </video>
        {/* кинематографичное затемнение: по краям и в глубину снизу (на мобиле плотнее) */}
        <div className="hero-shade absolute inset-0 z-0" />
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
            <span className="word-rise" style={{ animationDelay: "100ms" }}>Глубина</span>{" "}
            <span className="word-rise" style={{ animationDelay: "240ms" }}>анализа.</span>
            <br />
            <span style={{ color: "var(--color-teal)" }}>
              <span className="word-rise" style={{ animationDelay: "420ms" }}>Сила</span>{" "}
              <span className="word-rise" style={{ animationDelay: "560ms" }}>результата.</span>
            </span>
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

      {/* ============ ПУТЬ ОБУЧЕНИЯ — палуба ============ */}
      <section id="path" className="deck py-24">
        <Container>
          <div className="section-no"><span className="no">01</span><span className="ln" /><span className="no" style={{opacity:0.5}}>ПУТЬ</span></div>
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl">От ракушки до акулы бизнеса</h2>
            <p className="mt-3 text-xl font-semibold text-teal-600 sm:text-2xl">
              Сделай апгрейд скиллов бизнесмена
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Многоуровневая система: проходи модули и кейсы, проверяй себя тестами,
              поднимайся в ранге «Океан» — и становись участником Бизнес-клуба.
            </p>
          </div>

          {/* персонажи рангов живут НИЖЕ, в «Системе уровней» — здесь не дублируем */}
          <div className="relative mt-12">
            {/* соединительная линия-течение между ступенями (десктоп) */}
            <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-[2px] md:block">
              <div className="mx-[16%] h-full bg-gradient-to-r from-teal/0 via-teal/50 to-teal/0" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {PATH.map((step, i) => (
                <Link
                  key={step.key}
                  href={step.href}
                  className="card-premium group relative flex flex-col overflow-hidden p-0"
                >
                  {/* иллюминатор в глубину: кино-кадр Академии */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={step.img}
                      alt=""
                      width={896}
                      height={500}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent" />
                    {/* номер-ступень в стеклянном пузыре поверх кадра */}
                    <div className="absolute bottom-4 left-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/15 text-base font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-md">
                      0{i + 1}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-8 pt-6">
                    <h3 className="text-3xl text-heading">{step.title}</h3>
                    <p className="mt-1 text-[15px] font-semibold uppercase tracking-wide text-teal-600">{step.sub}</p>
                    <p className="mt-4 text-[17px] leading-relaxed text-body/85">{step.desc}</p>

                    {/* что входит в шаг */}
                    <ul className="mt-5 space-y-2">
                      {step.items.map((it) => (
                        <li key={it} className="flex items-center gap-2.5 text-[16px] text-heading">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                          {it}
                        </li>
                      ))}
                    </ul>

                    {/* живой счётчик содержимого — из данных */}
                    <p className="num mt-5 border-t border-line pt-4 text-lg font-semibold text-heading">
                      {pathStats[step.key]}
                    </p>

                    <span className="mt-5 inline-block text-base font-semibold text-teal-600 transition-transform group-hover:translate-x-1">
                      {step.cta} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ============ ЛЕНТА ПРОДУКТОВ — карусель крючков ============ */}
      <section className="atmo py-20">
        <Container>
          <div className="section-no"><span className="no">02</span><span className="ln" /><span className="no" style={{opacity:0.5}}>ЛЕНТА</span></div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl">Лента продуктов</h2>
          <div className="mt-14">
            <HookCarousel />
          </div>
        </Container>
      </section>

      {/* ============ ДИФФЕРЕНЦИАТОР — финмодели ============ */}
      <section className="hero-ocean grain-fine">
        <Bubbles />
        <Container className="relative z-10 grid items-center gap-12 py-24 md:grid-cols-2">
          <div>
            <div className="section-no"><span className="no">03</span><span className="ln" /><span className="no" style={{opacity:0.5}}>ИНСТРУМЕНТ</span></div>
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

      {/* ============ КАК МЫ УЧИМ — палуба ============ */}
      <section className="deck py-20">
        <Container>
          <div className="section-no"><span className="no">04</span><span className="ln" /><span className="no" style={{opacity:0.5}}>ПОДХОД</span></div>
          <SectionHeading
            eyebrow="Подход"
            title="Реализм вместо «успешного успеха»"
          />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* тёмные нави-карты на светлой палубе — контраст к фото-карточкам пути */}
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="group relative overflow-hidden rounded-[var(--radius-tl)] border border-white/10 p-7 shadow-[var(--shadow-tl)]"
                style={{ background: "linear-gradient(180deg, #0d2b45 0%, #081b2e 100%)" }}
              >
                {/* тематический кадр растворяется в толще справа */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-3/5">
                  <img
                    src={s.img}
                    alt=""
                    width={640}
                    height={360}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-50 transition-all duration-700 group-hover:scale-105 group-hover:opacity-70"
                    style={{
                      maskImage: "linear-gradient(90deg, transparent 0%, black 65%)",
                      WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 65%)",
                    }}
                  />
                </div>
                <div className="relative">
                  <span className="num text-4xl font-semibold text-teal">{s.n}</span>
                  <h3 className="mt-4 text-xl !text-foam">{s.title}</h3>
                  <p className="mt-2 max-w-[75%] text-sm leading-relaxed text-foam/65">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ МАНИФЕСТ + ЖИВОЙ ВОПРОС (Brilliant: продукт и есть демо) ============ */}
      <section className="deep grain-fine relative">
        <Container className="relative z-10 py-24 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Манифест</p>
            <h2 className="mt-4 text-3xl !text-foam sm:text-5xl">
              Защита от потерь, а не «успешный успех»
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-foam/70">
              Знания здесь открыты каждому. Платное — только инструменты
              под твой конкретный бизнес.
            </p>
          </div>
          <div className="mt-14">
            <LiveQuiz />
          </div>
        </Container>
      </section>

      {/* ============ УРОВНИ «ОКЕАН» — палуба ============ */}
      <section className="deck py-20">
        <Container>
          <div className="section-no"><span className="no">05</span><span className="ln" /><span className="no" style={{opacity:0.5}}>ОКЕАН</span></div>
          <SectionHeading
            eyebrow="Геймификация"
            title="Система уровней «Океан»"
            desc="Ранг = подтверждённое мастерство решений, а не число кликов. Сертификат ранга можно показать миру."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LEVELS.map((l) => {
              const rank = OCEAN_RANKS.find((r) => r.key === l.key);
              const tests = l.testSlugs?.length ?? 0;
              const modules = l.modules?.length ?? 0;
              return (
                <Link
                  key={l.key}
                  href={`/levels/${l.key}`}
                  className="card-premium group flex flex-col p-7"
                >
                  <div className="flex items-center gap-5">
                    <img
                      src={RANK_IMG[l.key]}
                      alt={l.name}
                      width={96}
                      height={96}
                      loading="lazy"
                      className="h-24 w-24 shrink-0 object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-2xl text-heading">{l.name}</h3>
                        {l.locked ? (
                          <span className="rounded-full bg-line px-2.5 py-0.5 text-[0.7rem] text-muted">закрыт</span>
                        ) : (
                          <span className="rounded-full bg-teal/15 px-2.5 py-0.5 text-[0.7rem] font-semibold text-teal-600">открыт</span>
                        )}
                      </div>
                      <p className="num mt-0.5 text-sm text-muted">{l.tag} · {rank?.meaning}</p>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-[15.5px] leading-relaxed text-body/80">{l.tagline}</p>
                  <p className="num mt-4 border-t border-line pt-3.5 text-[15px] font-semibold text-heading">
                    {!l.locked
                      ? [
                          modules ? `${modules} ${plural(modules, "модуль", "модуля", "модулей")}` : null,
                          tests ? `${tests} ${plural(tests, "тест", "теста", "тестов")}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "контент уровня внутри"
                      : "откроется после предыдущего"}
                  </p>
                  <span className="mt-3 text-[15px] font-semibold text-teal-600 transition-transform group-hover:translate-x-1">
                    {l.locked ? "Что внутри →" : "Войти →"}
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="mt-8 text-center">
            <Link href="/ocean" className="text-base font-semibold text-teal-600 hover:text-teal">
              Живой рейтинг «Океана» — кто на каком месте →
            </Link>
          </p>
        </Container>
      </section>

      {/* ============ ПОДБОРКИ — палуба ============ */}
      <section className="deck py-20">
        <Container>
          <div className="section-no"><span className="no">06</span><span className="ln" /><span className="no" style={{opacity:0.5}}>ПОДБОРКИ</span></div>
          <SectionHeading eyebrow="Discovery" title="Подборки под задачу" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {COLLECTIONS.map((c) => {
              const n = CATALOG.filter(c.filter).length;
              return (
                <Link
                  key={c.title}
                  href={c.href}
                  className="card-premium group flex items-center gap-5 p-4 pr-6"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={c.img}
                      alt=""
                      width={160}
                      height={160}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg text-heading">{c.title}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{c.hook}</p>
                    <span className="num mt-1 block text-xs font-semibold text-teal-600">
                      {n} {plural(n, "продукт", "продукта", "продуктов")}
                    </span>
                  </div>
                  <span className="text-teal-600 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============ БАННЕР БИЗНЕС-КЛУБА — палуба ============ */}
      <section className="deck py-20">
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
              width={192}
              height={192}
              loading="lazy"
              className="mx-auto h-40 w-40 object-contain md:h-48 md:w-48"
            />
          </div>
        </Container>
      </section>

      {/* ============ ФИНАЛЬНЫЙ CTA — на палубе, тёмная карточка ============ */}
      <section className="deck pb-20">
        <Container>
          <div className="hero-ocean overflow-hidden rounded-[24px]">
            <div className="relative z-10 flex flex-col items-center px-8 py-20 text-center">
              <h2 className="max-w-2xl text-3xl !text-foam sm:text-4xl">
                Начни с честного теста — узнай свой ранг
              </h2>
              <p className="mt-4 max-w-lg text-foam/70">
                С разбором каждого ответа. Без мотивашек.
              </p>
              <div className="mt-8">
                <Button href="/tests/t1-a04/take" size="lg">
                  Пройти тест
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
