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
import { OceanFinaleLive } from "@/components/OceanLive";
import { LandingTest } from "@/components/LandingTest";
import { PreceptsSection } from "@/components/PreceptsSection";
import { WordDrum } from "@/components/WordDrum";
import { STEPS, OCEAN_RANKS } from "@/lib/content";

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
    sub: "Аналитика и расчёты",
    desc: "Аналитика малого бизнеса и финмодели: подставь свои цифры — увидишь свой риск.",
    items: ["Аналитика малого бизнеса", "Финмодели и расчёты"],
    href: "/catalog?type=finmodel",
    cta: "К инструментам",
    img: "/lessons/arch_m6-ch01_unit-econ-scale_v2.jpg",
  },
];

export default function Home() {
  // счётчики контента на главной не показываем — числа меняются (правило Адиля)
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
          aria-hidden="true"
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
              letterSpacing: "-0.01em",
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
          {/* Барабан: что внутри платформы — крутится по очереди */}
          <p className="rise mt-9 flex items-center gap-4" style={{ animationDelay: "300ms" }}>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-foam/45">
              Внутри
            </span>
            <WordDrum
              words={["Академия", "Финмодель", "Аналитика бизнеса", "Бизнес-план"]}
              height={68}
              className="text-[clamp(1.7rem,3.2vw,2.5rem)] font-[family-name:var(--font-display)] font-bold leading-none !text-teal"
            />
          </p>
        </Container>
      </section>

      {/* ============ БОЛЬ — светлая бирюза: контраст к тёмному hero ============ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #EAF7F8 0%, #D6EFF1 100%)" }}
      >
        <Container className="relative z-10 py-24">
          <Reveal>
            <h2 className="max-w-3xl text-3xl !text-navy sm:text-5xl">
              Тебя готовили к контрольным — не к кассовым разрывам
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal>
              <TiltSpotlight className="h-full rounded-[var(--radius-lg)]">
                <div className="h-full rounded-[var(--radius-lg)] border border-teal/25 bg-white/75 p-8 shadow-[0_12px_36px_rgba(0,127,135,0.10)] backdrop-blur">
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
                <div className="h-full rounded-[var(--radius-lg)] border border-teal/25 bg-white/75 p-8 shadow-[0_12px_36px_rgba(0,127,135,0.10)] backdrop-blur">
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
          <SectionHeading
            number="01"
            title="Учим бизнесу — целиком"
            desc="Миссия TerenLabs — защитить тебя от потери денег на нежизнеспособный бизнес."
          />
          {/* асимметричное бенто: первый принцип — главный, занимает высоту двух */}
          <div className="mt-12 grid gap-5 md:grid-cols-12">
            {STEPS.map((s, i) => {
              const big = i === 0;
              return (
                <Reveal
                  key={s.n}
                  delay={i * 120}
                  className={big ? "md:col-span-7 md:row-span-2" : "md:col-span-5"}
                >
                  <TiltSpotlight className="h-full rounded-[var(--radius-lg)]">
                    <div
                      className={`group relative flex h-full flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-white/10 shadow-[var(--shadow-tl)] ${
                        big ? "min-h-[420px] p-9" : "min-h-[200px] p-7"
                      }`}
                      style={{ background: "linear-gradient(180deg, #0d2b45 0%, #081b2e 100%)" }}
                    >
                      {/* кадр растворяется в толще: у главной — сверху, у малых — справа */}
                      <div
                        className={`pointer-events-none absolute ${
                          big ? "inset-x-0 top-0 h-3/4" : "inset-y-0 right-0 w-1/2"
                        }`}
                      >
                        <Image
                          src={s.img}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover opacity-45 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04] group-hover:opacity-65"
                          style={{
                            maskImage: big
                              ? "linear-gradient(180deg, black 30%, transparent 100%)"
                              : "linear-gradient(90deg, transparent 0%, black 70%)",
                            WebkitMaskImage: big
                              ? "linear-gradient(180deg, black 30%, transparent 100%)"
                              : "linear-gradient(90deg, transparent 0%, black 70%)",
                          }}
                        />
                      </div>
                      <div className="relative">
                        <h3 className={`!text-foam ${big ? "text-3xl" : "text-xl"}`}>{s.title}</h3>
                        <p className={`mt-2.5 leading-relaxed text-foam/70 ${big ? "max-w-md text-base" : "max-w-[80%] text-sm"}`}>
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  </TiltSpotlight>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============ МАНИФЕСТ + ЖИВОЙ ВОПРОС (Brilliant: продукт и есть демо) ============ */}
      <section className="deep grain-fine relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,183,194,0.05),transparent_70%)]" />
        <Container className="relative z-10 py-24 sm:py-32">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow !text-teal/60 mb-6">Манифест TerenLabs</p>
              <h2 className="mt-4 text-3xl !text-foam sm:text-5xl leading-[1.1]" style={{ fontStyle: "italic" }}>
                «Лучше отговорить тебя от плохой идеи, чем продать надежду»
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foam/70">
                Здесь больно и сложно — но это единственный способ не потерять
                деньги в реальном бизнесе. Если математика говорит «не открывай» —
                мы скажем это прямо.
              </p>
            </div>
          </Reveal>

          {/* Живой вопрос теста (Brilliant-move: продукт и есть демо) */}
          <Reveal delay={200}>
            <LandingTest />
          </Reveal>
        </Container>
      </section>

      {/* ============ ФОРМАТ — затягивает, а навыки настоящие ============ */}
      <section className="deck py-20">
        <Container>
          <SectionHeading
            number="02"
            title="Формат, который затягивает"
            desc="Уровни, ранги и тренажёры — проходишь шаг за шагом, а каждый навык бережёт реальные деньги."
          />
          {/* редакционный список вместо третьей подряд сетки карточек:
              строки с воздухом, ховер сдвигает строку и зажигает стрелку */}
          <div className="mt-10 border-t border-line">
            {[
              {
                href: "/levels",
                title: "Ранг, не сертификат",
                desc: "От Ракушки до Кита. Ранг растёт за понимание — его нельзя накликать, можно только заслужить решениями.",
                cta: "Путь «Океан»",
                visual: "ranks" as const,
              },
              {
                href: "/catalog?type=case",
                title: "Истории, не определения",
                desc: "Разборы того, как теряют деньги. Чужие ошибки дешевле своих — учись на них.",
                cta: "К кейсам",
                visual: null,
              },
              {
                href: "/catalog?type=finmodel",
                title: "Тренажёр, не лекция",
                desc: "Тесты нельзя угадать, финмодель считает твои цифры. Знание проверяется делом, а не конспектом.",
                cta: "Открыть демо",
                visual: null,
              },
            ].map((row, i) => (
              <Reveal key={row.href} delay={i * 100}>
                <Link
                  href={row.href}
                  className="group grid items-center gap-x-10 gap-y-3 border-b border-line py-9 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/60 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto] md:px-4 md:hover:px-6"
                >
                  <h3 className="text-2xl text-heading transition-colors group-hover:text-teal-600 sm:text-3xl">
                    {row.title}
                  </h3>
                  <div>
                    <p className="text-[15.5px] leading-relaxed text-muted">{row.desc}</p>
                    {row.visual === "ranks" && (
                      <div className="mt-3 flex items-center gap-2">
                        {OCEAN_RANKS.map((r, j) => (
                          <img
                            key={r.key}
                            src={r.img}
                            alt={r.name}
                            width={34}
                            height={34}
                            loading="lazy"
                            className="floaty h-[34px] w-[34px] object-contain"
                            style={{ "--float-delay": `${j * -0.7}s`, "--float-dur": `${4 + (j % 3) * 0.6}s` } as React.CSSProperties}
                          />
                        ))}
                        <span className="ml-2"><OceanNowChip /></span>
                      </div>
                    )}
                  </div>
                  {/* стрелка в собственном круге — кнопка-в-кнопке */}
                  <span className="hidden h-12 w-12 items-center justify-center rounded-full border border-line text-lg text-muted transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:border-teal group-hover:bg-teal group-hover:text-white md:flex">
                    →
                  </span>
                  <span className="text-[15px] font-semibold text-teal-600 md:hidden">{row.cta} →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ ПУТЬ ОБУЧЕНИЯ — палуба ============ */}
      <section id="path" className="deck py-24">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl">От ракушки до акулы бизнеса</h2>
            <p className="mt-3 text-xl font-semibold text-teal-600 sm:text-2xl">
              Сделай апгрейд скиллов бизнесмена
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Многоуровневая система: проходи модули и кейсы, проверяй себя тестами,
              поднимайся в ранге «Океан».
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

                    <span className="mt-6 inline-block border-t border-line pt-4 text-base font-semibold text-teal-600 transition-transform group-hover:translate-x-1">
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

      {/* ============ 5 НАСТАВЛЕНИЙ — липкие карточки ============ */}
      <PreceptsSection />

      {/* ============ ДИФФЕРЕНЦИАТОР — финмодели ============ */}
      <section className="hero-ocean grain-fine">
        <Bubbles />
        <Container className="relative z-10 grid items-center gap-12 py-24 md:grid-cols-2">
          <div>
          <SectionHeading
              light
              eyebrow="Наш инструмент"
              number="03"
            title="Финмодель, которая считает за тебя"
              desc="Меняешь допущения — цифры пересчитываются вживую. P&L, cash flow, точка безубыточности. Экспорт в Excel. Это не лекция, а рабочий инструмент."
            />
            <div className="mt-8">
              <Button href="/catalog?type=finmodel" size="lg">
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

      {/* ============ ФИНАЛ: гонка уже идёт — океан во всю ширину ============ */}
      <section
        className="grain-fine relative overflow-hidden"
        style={{
          background:
            "radial-gradient(70% 90% at 50% 0%, #11314e 0%, transparent 55%), linear-gradient(180deg, #0d2b45 0%, #050f1c 100%)",
        }}
      >
        <Bubbles />
        <Container className="relative z-10 py-24 text-center sm:py-32">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-3xl !text-foam sm:text-5xl">
              В океане уже идёт гонка
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-foam/70">
              Каждый тест двигает таблицу. Займи своё место.
            </p>
          </Reveal>

          {/* живой пьедестал + последние события — настоящие данные рейтинга */}
          <Reveal delay={140}>
            <div className="mt-14">
              <OceanFinaleLive />
            </div>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-12">
              <Button href="/levels/krab" size="lg" className="shadow-[0_8px_36px_rgba(0,183,194,0.4)]">
                Пройти тест на Краба
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

