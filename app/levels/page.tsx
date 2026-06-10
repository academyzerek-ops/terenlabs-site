import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Bubbles } from "@/components/Bubbles";
import { Reveal } from "@/components/Reveal";
import { LEVELS, RANK_IMG, plural } from "@/lib/content";

export const metadata = { title: "Уровни «Океан» — TerenLabs" };

// Погружение: страница темнеет с глубиной — от мелководья Ракушки к бездне Кита.
// Зоны метафорические (не бизнес-цифры). Одинакова в обеих темах — это путь, не поверхность.
const ZONES = ["мелководье", "риф", "толща", "течение", "глубина", "бездна"];
const METERS = ["0–10 м", "20 м", "50 м", "120 м", "300 м", "1 000 м+"];

// биолюминесценция дна: позиции зашиты (Math.random ломает SSR-гидрацию)
const BIO_DOTS = [
  { left: "12%", bottom: "8%", size: 5, dur: "3.8s", delay: "0s" },
  { left: "28%", bottom: "16%", size: 3, dur: "5.2s", delay: "-1.4s" },
  { left: "43%", bottom: "6%", size: 4, dur: "4.4s", delay: "-2.8s" },
  { left: "58%", bottom: "14%", size: 3, dur: "6.1s", delay: "-0.7s" },
  { left: "71%", bottom: "9%", size: 5, dur: "4.8s", delay: "-3.5s" },
  { left: "85%", bottom: "18%", size: 3, dur: "5.6s", delay: "-2.1s" },
  { left: "93%", bottom: "7%", size: 4, dur: "4.1s", delay: "-1.0s" },
];

export default function LevelsPage() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #f5f7fa 0%, #d9e8ef 14%, #8fb8cb 32%, #2e5f7d 52%, #0d2b45 74%, #06182a 100%)",
      }}
    >
      {/* лучи света уходят с поверхности в толщу */}
      <div className="pointer-events-none absolute inset-x-0 top-[6%] h-[48%]" aria-hidden="true">
        <span className="ocean-ray left-[12%]" style={{ "--ray-dur": "11s", "--ray-o": 0.4 } as React.CSSProperties} />
        <span className="ocean-ray left-[34%]" style={{ "--ray-dur": "9s", "--ray-o": 0.28, width: "60px" } as React.CSSProperties} />
        <span className="ocean-ray left-[58%]" style={{ "--ray-dur": "13s", "--ray-o": 0.35, width: "120px" } as React.CSSProperties} />
        <span className="ocean-ray left-[81%]" style={{ "--ray-dur": "10s", "--ray-o": 0.25, width: "70px" } as React.CSSProperties} />
      </div>

      {/* морской снег в нижней половине погружения */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]" aria-hidden="true">
        <Bubbles />
      </div>

      {/* биолюминесценция у дна */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%]" aria-hidden="true">
        {BIO_DOTS.map((d, i) => (
          <span
            key={i}
            className="bio-dot"
            style={{
              left: d.left,
              bottom: d.bottom,
              width: d.size,
              height: d.size,
              "--bio-dur": d.dur,
              "--bio-delay": d.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <Container className="relative py-16">
        {/* шапка — на светлом мелководье */}
        <div className="max-w-2xl">
          <p className="eyebrow !text-teal-600">Путь · {LEVELS.length} уровней до открытого океана</p>
          <h1 className="mt-2 text-4xl !text-navy sm:text-6xl">Уровни «Океан»</h1>
          <p className="mt-4 text-lg leading-relaxed !text-navy/70">
            От мелководья к открытому океану. Каждый уровень — модули, тесты,
            кейсы и обзоры. Проходятся по порядку: чем глубже, тем серьёзнее решения.
          </p>
          <p className="mt-5">
            <Link
              href="/ocean"
              className="inline-flex items-center gap-2 rounded-full border border-teal-600/40 px-4 py-2 text-sm font-semibold text-teal-600 transition-colors hover:bg-teal/10"
            >
              Живой рейтинг «Океана» →
            </Link>
          </p>
        </div>

        {/* линия-течение погружения: свет бежит вниз */}
        <div className="relative mt-14">
          <div className="flow-line-v pointer-events-none absolute bottom-8 left-9 top-0 w-[2px] sm:left-1/2 sm:-translate-x-1/2" />

          <div className="space-y-12 sm:space-y-14">
            {LEVELS.map((l, i) => {
              const deepIdx = i >= 4; // глубина и бездна — тёмные карты
              const midIdx = i >= 2 && i < 4; // толща/течение — стеклянные
              const right = i % 2 === 1;
              const isStart = l.key === "rakushka"; // старт даётся автоматом — не акцентируем
              const isFirstLevel = l.key === "krab"; // первый настоящий уровень — сюда акцент

              if (isStart) {
                // Ракушка — скромная стартовая отметка на линии, не «уровень для взятия»
                return (
                  <div key={l.key} className="relative">
                    <div className="absolute left-9 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 sm:left-1/2">
                      <div
                        className="floaty flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/70 bg-white/85 shadow-[0_8px_24px_rgba(6,24,42,0.25)] backdrop-blur sm:h-20 sm:w-20"
                        style={{ "--float-dur": "5s" } as React.CSSProperties}
                      >
                        <img src={RANK_IMG[l.key]} alt={l.name} width={56} height={56} className="h-9 w-9 object-contain sm:h-14 sm:w-14" />
                      </div>
                    </div>
                    <div className="pl-24 sm:pl-[calc(50%+4rem)]">
                      <Reveal>
                        <Link
                          href={`/levels/${l.key}`}
                          className="group inline-flex max-w-xl flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-white/60 bg-white/75 px-5 py-3 shadow-[var(--shadow-tl-sm)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-teal/60"
                        >
                          <span className="font-[family-name:var(--font-display)] text-lg font-bold !text-navy">{l.name}</span>
                          <span className="rounded-full bg-navy/8 px-2.5 py-0.5 text-[0.7rem] font-semibold text-navy/60">
                            ты уже здесь — даётся автоматически
                          </span>
                          <span className="text-sm font-semibold text-teal-600 transition-transform group-hover:translate-x-1">
                            Осмотреться →
                          </span>
                        </Link>
                      </Reveal>
                    </div>
                  </div>
                );
              }

              return (
                <div key={l.key} className="relative sm:grid sm:grid-cols-2 sm:gap-14">
                  {/* орб ранга на линии: открытый — дышит светом, закрытый — спит */}
                  <div className="absolute left-9 top-0 z-10 -translate-x-1/2 sm:left-1/2">
                    <div
                      className={`floaty flex h-20 w-20 items-center justify-center rounded-full border-2 sm:h-32 sm:w-32 ${
                        deepIdx ? "border-teal/50 bg-navy-900" : "border-white/70 bg-white/80 backdrop-blur"
                      } ${l.locked ? "orb-locked" : "orb-open"} shadow-[0_0_50px_rgba(0,183,194,0.35),0_10px_36px_rgba(6,24,42,0.4)]`}
                      style={{ "--float-delay": `${i * -0.9}s`, "--float-dur": `${5 + (i % 3)}s` } as React.CSSProperties}
                    >
                      <img
                        src={RANK_IMG[l.key]}
                        alt={l.name}
                        width={104}
                        height={104}
                        className="h-14 w-14 object-contain sm:h-[104px] sm:w-[104px]"
                      />
                    </div>
                  </div>

                  {/* метка зоны и глубина — напротив карточки */}
                  <div
                    className={`hidden items-center sm:flex ${
                      right ? "justify-start pl-20" : "order-2 justify-end pr-20"
                    }`}
                  >
                    <div className={right ? "text-left" : "text-right"}>
                      <span
                        className={`block text-sm font-bold uppercase tracking-[0.3em] ${
                          i < 2 ? "text-navy/45" : i < 4 ? "text-white/55" : "text-foam/40"
                        }`}
                      >
                        {ZONES[i]}
                      </span>
                      <span
                        className={`num mt-1 block text-xs font-semibold tracking-[0.18em] ${
                          i < 2 ? "text-teal-600/70" : "text-teal/60"
                        }`}
                      >
                        {METERS[i]}
                      </span>
                    </div>
                  </div>

                  {/* карточка уровня */}
                  <div className={`pl-24 sm:pl-0 ${right ? "order-2 sm:pl-20" : "sm:pr-20"}`}>
                    <Reveal delay={i % 2 === 0 ? 0 : 120}>
                    <Link
                      href={`/levels/${l.key}`}
                      className={`group block rounded-[var(--radius-tl)] border p-7 transition-all hover:-translate-y-1 sm:p-9 ${
                        deepIdx
                          ? "border-white/10 bg-navy-900/80 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur hover:border-teal/50"
                          : midIdx
                          ? "border-white/25 bg-white/10 shadow-[0_12px_36px_rgba(6,24,42,0.3)] backdrop-blur-md hover:border-teal/60"
                          : "border-white/60 bg-white/85 shadow-[var(--shadow-tl)] backdrop-blur hover:border-teal/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className={`text-3xl sm:text-4xl ${deepIdx || midIdx ? "!text-foam" : "!text-navy"}`}>
                          {l.name}
                        </h3>
                        {l.locked ? (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[0.7rem] ${
                              deepIdx || midIdx ? "bg-white/10 text-foam/60" : "bg-navy/10 text-navy/60"
                            }`}
                          >
                            закрыт
                          </span>
                        ) : isFirstLevel ? (
                          <span className="rounded-full bg-teal px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-white shadow-[0_0_18px_rgba(0,183,194,0.5)]">
                            начни здесь
                          </span>
                        ) : (
                          <span className="rounded-full bg-teal/15 px-2.5 py-0.5 text-[0.7rem] font-semibold text-teal">
                            открыт
                          </span>
                        )}
                      </div>
                      <p className={`num mt-1 text-xs ${deepIdx || midIdx ? "text-foam/50" : "text-navy/50"}`}>
                        {l.tag}
                        {l.archetype ? ` · ${l.archetype}` : ""}
                        <span className="sm:hidden"> · {ZONES[i]}, {METERS[i]}</span>
                      </p>
                      <p
                        className={`mt-3 text-base leading-relaxed sm:text-lg ${
                          deepIdx || midIdx ? "text-foam/70" : "text-navy/70"
                        }`}
                      >
                        {l.tagline}
                      </p>
                      <p className="mt-5 text-sm font-semibold text-teal transition-transform group-hover:translate-x-1">
                        {l.locked ? "Что внутри →" : isFirstLevel ? "Пройти тест на Краба →" : "Войти на уровень →"}
                      </p>
                      {!l.locked && (
                        <p className={`num mt-4 text-xs ${deepIdx || midIdx ? "text-foam/50" : "text-navy/55"}`}>
                          {[
                            l.modules.length > 0 &&
                              `${l.modules.length} ${plural(l.modules.length, "модуль", "модуля", "модулей")}`,
                            l.testSlugs.length > 0 &&
                              `${l.testSlugs.length} ${plural(l.testSlugs.length, "тест", "теста", "тестов")}`,
                            l.caseSlugs.length + l.reviewSlugs.length > 0 &&
                              `${l.caseSlugs.length + l.reviewSlugs.length} ${plural(
                                l.caseSlugs.length + l.reviewSlugs.length, "материал", "материала", "материалов")}`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </Link>
                    </Reveal>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* дно: биолюминесценция + старт пути */}
        <Reveal>
          <div className="relative mt-20 pb-6 text-center">
            <p className="mx-auto max-w-md font-[family-name:var(--font-display)] text-xl italic leading-relaxed text-foam/60">
              Дно — это не конец. Это место, откуда видно весь океан.
            </p>
            <div className="mt-8">
              <Button href="/levels/krab" size="lg">
                Пройти тест на Краба
              </Button>
            </div>
            <p className="num mt-4 text-xs text-foam/40">
              Ракушка даётся автоматически · ранг растёт с первого теста · бесплатно
            </p>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
