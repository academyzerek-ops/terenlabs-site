import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { Bubbles } from "@/components/Bubbles";
import { Reveal } from "@/components/Reveal";
import { TiltSpotlight } from "@/components/TiltSpotlight";
import { MiniModel } from "@/components/MiniModel";
import { DepthGauge } from "@/components/DepthGauge";
import { OceanNowChip } from "@/components/OceanPulse";
import {
  STEPS,
  OCEAN_RANKS,
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
      {/* Глубиномер: метры растут по мере скролла — «глубина анализа» буквально */}
      <DepthGauge />
      {/* ============ HERO — океан ============ */}
      <section className="vignette relative min-h-[88vh] overflow-hidden">
        <video
          className="hero-parallax pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/ocean-evolution-poster.jpg?v=6"
        >
          <source src="/brand/ocean-evolution.mp4?v=6" type="video/mp4" />
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
            EdTech · FinTools · Gamification
          </p>
          <h1
            className="rise mt-6 max-w-6xl !text-foam"
            style={{
              animationDelay: "80ms",
              fontSize: "clamp(2.2rem, 4.7vw, 4.0rem)",
              lineHeight: 1.06,
              letterSpacing: "-0.02em",
              textShadow: "0 4px 40px rgba(0,0,0,0.5)",
            }}
          >
            <span className="word-rise" style={{ animationDelay: "100ms" }}>Единственная</span>{" "}
            <span className="word-rise" style={{ animationDelay: "220ms" }}>платформа</span>
            <br />
            <span style={{ color: "var(--color-teal)" }}>
              <span className="word-rise" style={{ animationDelay: "380ms" }}>обучения</span>{" "}
              {/* «бизнесу» — главное слово: учим комплексно, не спец-курсам */}
              <span
                className="word-rise"
                style={{
                  animationDelay: "500ms",
                  color: "#E8B65C",
                  fontSize: "1.16em",
                  textShadow: "0 4px 32px rgba(232,182,92,0.35)",
                }}
              >бизнесу</span>{" "}
              <span className="word-rise" style={{ animationDelay: "620ms" }}>в</span>{" "}
              <span className="word-rise" style={{ animationDelay: "700ms" }}>Казахстане</span>
            </span>
          </h1>
          {/* подзаголовок — курсивный serif в две строки (просьба Адиля) */}
          <p
            className="rise mt-8 max-w-4xl font-[family-name:var(--font-display)] italic text-foam/85"
            style={{
              animationDelay: "160ms",
              fontSize: "clamp(1.15rem, 2vw, 1.6rem)",
              lineHeight: 1.45,
              letterSpacing: "0.005em",
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            Говорим о рисках и реальности, а не про «успешный успех» —
            <br className="hidden md:block" />
            видишь, где потеряешь деньги и время, до того как вложишься.
          </p>
        </Container>
      </section>

      {/* ============ БОЛЬ — светлая бирюза: контраст к тёмному hero ============ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #EAF7F8 0%, #D6EFF1 100%)" }}
      >
        {/* трещина через всю секцию — кассовый разрыв буквально */}
        <svg
          className="pointer-events-none absolute inset-x-0 top-[44%] h-[70px] w-full"
          viewBox="0 0 1440 70"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 38 L170 32 L310 46 L455 22 L620 52 L790 28 L905 44 L1060 18 L1230 42 L1340 30 L1440 36"
            stroke="rgba(13, 43, 69, 0.12)"
            strokeWidth="2"
          />
          <path
            d="M0 44 L160 40 L300 52 L450 30 L615 58 L785 36 L900 50 L1055 26 L1225 48 L1335 38 L1440 42"
            stroke="rgba(180, 69, 47, 0.10)"
            strokeWidth="1.5"
          />
        </svg>
        <Container className="relative z-10 py-24">
          <div className="section-no"><span className="no">01</span><span className="ln" style={{background:"rgba(13,43,69,0.12)"}} /><span className="no" style={{opacity:0.5}}>БОЛЬ</span></div>
          <Reveal>
            <h2 className="max-w-3xl text-3xl !text-navy sm:text-5xl">
              Тебя готовили{" "}
              <span className="whitespace-nowrap line-through decoration-navy/30 decoration-[0.055em]">
                к контрольным
              </span>
              {" "}— не к{" "}
              <span className="whitespace-nowrap underline decoration-[#b4452f]/45 decoration-wavy decoration-[0.045em] underline-offset-[10px]">
                кассовым разрывам
              </span>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal>
              <TiltSpotlight className="h-full rounded-[var(--radius-lg)]">
                <div
                  className="relative h-full overflow-hidden rounded-[var(--radius-lg)] border border-teal/25 bg-white/75 p-8 shadow-[0_12px_36px_rgba(0,127,135,0.10)] backdrop-blur md:-rotate-[0.5deg]"
                  style={{ borderTop: "3px solid rgba(13, 43, 69, 0.3)" }}
                >
                  {/* призрак учебника: параграф, по которому готовили */}
                  <span
                    className="pointer-events-none absolute -bottom-10 -right-2 font-[family-name:var(--font-display)] text-[170px] font-bold leading-none text-navy/[0.05]"
                    aria-hidden="true"
                  >
                    §
                  </span>
                  <p className="eyebrow !text-teal-600">Школа и вуз</p>
                  <p className="mt-4 text-xl leading-relaxed !text-navy sm:text-2xl">
                    Точку безубыточности тебя считать научили. Выживать
                    на рынке — нет.
                  </p>
                  <p className="mt-4 text-[17px] leading-relaxed text-navy/70">
                    Формулы дают преподы, никогда не строившие бизнес. Рыночные
                    нюансы в книгах не печатают — за них платят своими деньгами.
                  </p>
                </div>
              </TiltSpotlight>
            </Reveal>
            <Reveal delay={120}>
              <TiltSpotlight className="h-full rounded-[var(--radius-lg)]">
                <div
                  className="relative h-full overflow-hidden rounded-[var(--radius-lg)] border border-teal/25 bg-white/75 p-8 shadow-[0_12px_36px_rgba(0,127,135,0.10)] backdrop-blur md:rotate-[0.6deg]"
                  style={{ borderTop: "3px solid rgba(199, 125, 42, 0.55)" }}
                >
                  {/* призрак обещанных звёзд успеха */}
                  <span
                    className="pointer-events-none absolute -bottom-12 -right-3 font-[family-name:var(--font-display)] text-[170px] font-bold leading-none text-[#c77d2a]/[0.07]"
                    aria-hidden="true"
                  >
                    ★
                  </span>
                  <p className="eyebrow !text-teal-600">Инфоцыгане</p>
                  <p className="mt-4 text-xl leading-relaxed !text-navy sm:text-2xl">
                    Инфоцыгане продают иллюзию: бизнес — это озарение
                    и «успешный успех».
                  </p>
                  <p className="mt-4 text-[17px] leading-relaxed text-navy/70">
                    Про сезонность, ramp-up и кассовый разрыв у них ни слова —
                    на иллюзии зарабатывают, на правде нет.
                  </p>
                </div>
              </TiltSpotlight>
            </Reveal>
          </div>
        </Container>

      </section>

      {/* ============ КАК МЫ УЧИМ — палуба ============ */}
      <section className="deck py-20">
        <Container>
          <div className="section-no"><span className="no">02</span><span className="ln" /><span className="no" style={{opacity:0.5}}>НАШ ОТВЕТ</span></div>
          <SectionHeading
            eyebrow="Наш ответ"
            title="Учим бизнесу — целиком"
            desc="Миссия TerenLabs — защитить тебя от потери денег на нежизнеспособный бизнес."
          />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* тёмные нави-карты на светлой палубе — контраст к фото-карточкам пути */}
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 130} className="h-full">
              <TiltSpotlight className="h-full rounded-[var(--radius-tl)]">
              <div
                className="group relative h-full overflow-hidden rounded-[var(--radius-tl)] border border-white/10 p-7 shadow-[var(--shadow-tl)]"
                style={{ background: "linear-gradient(180deg, #0d2b45 0%, #081b2e 100%)" }}
              >
                {/* тематический кадр растворяется в толще справа */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-3/5">
                  <Image
                    src={s.img}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 60vw, 30vw"
                    className="object-cover opacity-50 transition-all duration-700 group-hover:scale-105 group-hover:opacity-70"
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
              </TiltSpotlight>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ МАНИФЕСТ + ЖИВОЙ ВОПРОС (Brilliant: продукт и есть демо) ============ */}
      <section className="deep grain-fine relative">
        <Container className="relative z-10 py-24 sm:py-28">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">Наша ценность</p>
              <h2 className="mt-4 text-3xl !text-foam sm:text-5xl" style={{ fontStyle: "italic" }}>
                «Лучше отговорить тебя от плохой идеи, чем продать надежду»
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-foam/70">
                Здесь больно и сложно — но это единственный способ не потерять
                деньги в реальном бизнесе. Если математика говорит «не открывай» —
                мы скажем это прямо.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ============ ФОРМАТ — затягивает, а навыки настоящие ============ */}
      <section className="deck py-20">
        <Container>
          <div className="section-no"><span className="no">03</span><span className="ln" /><span className="no" style={{opacity:0.5}}>ФОРМАТ</span></div>
          <SectionHeading
            eyebrow="Как устроено"
            title="Формат, который затягивает"
            desc="Уровни, ранги и тренажёры — проходишь шаг за шагом, а каждый навык бережёт реальные деньги."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Reveal>
            <Link href="/levels" className="card-premium group flex h-full flex-col p-7">
              <div className="flex items-center gap-1.5">
                {/* медальоны дрейфуют в толще воды — фазы сдвинуты, как живая стая */}
                {OCEAN_RANKS.map((r, i) => (
                  <img
                    key={r.key}
                    src={r.img}
                    alt={r.name}
                    width={44}
                    height={44}
                    loading="lazy"
                    className="floaty h-11 w-11 object-contain"
                    style={{ "--float-delay": `${i * -0.7}s`, "--float-dur": `${4 + (i % 3) * 0.6}s` } as React.CSSProperties}
                  />
                ))}
              </div>
              <h3 className="mt-5 text-2xl text-heading">Ранг, не сертификат</h3>
              <p className="mt-2 flex-1 text-[15.5px] leading-relaxed text-muted">
                От Ракушки до Кита. Ранг растёт за понимание — его нельзя
                накликать, можно только заслужить решениями.
              </p>
              {/* живой сигнал соревнования: океан населён прямо сейчас */}
              <p className="mt-3"><OceanNowChip /></p>
              <span className="mt-4 text-[15px] font-semibold text-teal-600 transition-transform group-hover:translate-x-1">Путь «Океан» →</span>
            </Link>
            </Reveal>
            <Reveal delay={130}>
            <Link href="/catalog?type=case" className="card-premium group flex h-full flex-col overflow-hidden p-0">
              <div className="relative aspect-[16/8] overflow-hidden">
                <Image src="/lessons/arch_m7-ch01_breached-hull.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/55 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-7 pt-5">
                <h3 className="text-2xl text-heading">Истории, не определения</h3>
                <p className="mt-2 flex-1 text-[15.5px] leading-relaxed text-muted">
                  {CASES.length} разборов того, как теряют деньги. Чужие ошибки
                  дешевле своих — учись на них.
                </p>
                <span className="mt-4 text-[15px] font-semibold text-teal-600 transition-transform group-hover:translate-x-1">К кейсам →</span>
              </div>
            </Link>
            </Reveal>
            <Reveal delay={260}>
            <Link href="/finmodels/finmodel-cafe" className="card-premium group flex h-full flex-col overflow-hidden p-0">
              <div className="relative aspect-[16/8] overflow-hidden">
                <Image src="/lessons/fund_m2-ch08_algorithm-tunnel.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/55 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-7 pt-5">
                <h3 className="text-2xl text-heading">Тренажёр, не лекция</h3>
                <p className="mt-2 flex-1 text-[15.5px] leading-relaxed text-muted">
                  Тесты нельзя угадать, финмодель считает твои цифры.
                  Знание проверяется делом, а не конспектом.
                </p>
                <span className="mt-4 text-[15px] font-semibold text-teal-600 transition-transform group-hover:translate-x-1">Открыть демо →</span>
              </div>
            </Link>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ============ ПУТЬ ОБУЧЕНИЯ — палуба ============ */}
      <section id="path" className="deck py-24">
        <Container>
          <div className="section-no"><span className="no">04</span><span className="ln" /><span className="no" style={{opacity:0.5}}>РАЗДЕЛЫ</span></div>
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
            {/* соединительная линия-течение между ступенями (десктоп): свет бежит по течению */}
            <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-[2px] md:block">
              <div className="flow-line mx-[16%] h-full" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {PATH.map((step, i) => (
                <Reveal key={step.key} delay={i * 130}>
                <Link
                  href={step.href}
                  className="card-premium group relative flex h-full flex-col overflow-hidden p-0"
                >
                  {/* иллюминатор в глубину: кино-кадр Академии */}
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={step.img}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
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
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ============ ДИФФЕРЕНЦИАТОР — финмодели ============ */}
      <section className="hero-ocean grain-fine">
        <Bubbles />
        <Container className="relative z-10 grid items-center gap-12 py-24 md:grid-cols-2">
          <div>
            <div className="section-no"><span className="no">05</span><span className="ln" /><span className="no" style={{opacity:0.5}}>ИНСТРУМЕНТ</span></div>
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

          {/* Живая мини-модель: двигаешь загрузку — прибыль пересчитывается тут же */}
          <Reveal delay={120}>
            <MiniModel />
          </Reveal>
        </Container>
      </section>

      {/* ============ БАННЕР БИЗНЕС-КЛУБА — открытый океан ============ */}
      <section className="deck py-20">
        <Container>
          <div
            className="grain-fine relative overflow-hidden rounded-[24px]"
            style={{
              background:
                "radial-gradient(85% 110% at 78% 0%, #143352 0%, transparent 55%), linear-gradient(180deg, #0d2b45 0%, #06182a 100%)",
            }}
          >
            {/* биолюминесценция открытого океана */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2" aria-hidden="true">
              <span className="bio-dot" style={{ left: "8%", bottom: "18%", width: 5, height: 5, "--bio-dur": "4.2s" } as React.CSSProperties} />
              <span className="bio-dot" style={{ left: "26%", bottom: "8%", width: 3, height: 3, "--bio-dur": "5.4s", "--bio-delay": "-2s" } as React.CSSProperties} />
              <span className="bio-dot" style={{ left: "55%", bottom: "14%", width: 4, height: 4, "--bio-dur": "4.8s", "--bio-delay": "-1.2s" } as React.CSSProperties} />
              <span className="bio-dot" style={{ left: "82%", bottom: "10%", width: 3, height: 3, "--bio-dur": "5.8s", "--bio-delay": "-3.1s" } as React.CSSProperties} />
            </div>

            <div className="relative z-10 grid items-center gap-10 p-8 sm:p-12 md:grid-cols-[1fr_minmax(0,400px)]">
              <div>
                <p className="eyebrow">Вершина пути</p>
                <h2 className="mt-3 text-3xl !text-foam sm:text-4xl">
                  Путь заканчивается стаей
                </h2>
                <p className="mt-4 max-w-xl leading-relaxed text-foam/70">
                  Дойди до ранга Акула — и попадёшь в Бизнес-клуб: живые разборы
                  твоих цифр, доска сделок и провалов, доступ к тем, кто уже в
                  открытом океане. Место в стае зарабатывают решениями, а не оплатой.
                </p>
                <div className="mt-7">
                  <Button href="/club">Узнать о клубе</Button>
                </div>
              </div>

              {/* маршрут рангов: пунктир поднимается от Ракушки к Акуле */}
              <div className="relative hidden md:block" aria-hidden="true">
                <svg
                  viewBox="0 0 400 170"
                  className="absolute inset-x-0 bottom-6 h-auto w-full"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 16 150 C 110 150, 200 130, 330 38"
                    stroke="rgba(159, 226, 232, 0.45)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="0.1 13"
                    className="dive-dots"
                  />
                </svg>
                <div className="relative flex items-end justify-between px-1">
                  {OCEAN_RANKS.slice(0, 5).map((r, i) => {
                    const size = [34, 44, 54, 66, 124][i];
                    const last = i === 4;
                    return (
                      <img
                        key={r.key}
                        src={r.img}
                        alt=""
                        width={size}
                        height={size}
                        loading="lazy"
                        className={`floaty object-contain ${last ? "orb-open rounded-full" : "opacity-80"}`}
                        style={{
                          width: size,
                          height: size,
                          "--float-delay": `${i * -0.9}s`,
                          "--float-dur": `${4.5 + i * 0.5}s`,
                        } as React.CSSProperties}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============ ФИНАЛЬНЫЙ CTA — на палубе, тёмная карточка ============ */}
      <section className="deck pb-20">
        <Container>
          <Reveal>
          <div className="hero-ocean overflow-hidden rounded-[24px]">
            <Bubbles />
            <div className="relative z-10 flex flex-col items-center px-8 py-20 text-center">
              {/* шесть рангов дрейфуют над вопросом — какой из них твой? */}
              <div className="mb-7 flex items-center justify-center gap-3" aria-hidden="true">
                {OCEAN_RANKS.map((r, i) => (
                  <img
                    key={r.key}
                    src={r.img}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    className="floaty h-10 w-10 object-contain"
                    style={{
                      "--float-delay": `${i * -0.7}s`,
                      "--float-dur": `${4 + (i % 3) * 0.7}s`,
                    } as React.CSSProperties}
                  />
                ))}
              </div>
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
          </Reveal>
        </Container>
      </section>
    </>
  );
}

