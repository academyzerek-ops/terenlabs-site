import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Bubbles } from "@/components/Bubbles";
import { Reveal } from "@/components/Reveal";
import { LevelsRuler } from "@/components/LevelsRuler";
import { OceanLiveToasts } from "@/components/OceanLiveToasts";
import { LevelChar } from "@/components/LevelChar";
import { LevelCrowd, OceanPulseStrip } from "@/components/OceanPulse";
import { OceanAccount } from "@/components/OceanAccount";
import { LEVELS, RANK_IMG, plural } from "@/lib/content";

export const metadata = { title: "Уровни «Океан» — TerenLabs" };

// Погружение: страница темнеет с глубиной — от мелководья Ракушки к бездне Кита.
// Персонажи РАСТУТ с глубиной (ракушка → кит) — это и есть метафора пути.
// Зоны метафорические (не бизнес-цифры). Одинакова в обеих темах.
const ZONES = ["мелководье", "риф", "толща", "течение", "глубина", "бездна"];
const METERS = ["0 м", "20 м", "50 м", "120 м", "300 м", "1 000 м+"];
// размер персонажа: чем глубже — тем крупнее (px, десктоп)
const SIZE = [120, 190, 230, 280, 330, 420];

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
      id="dive-wrap"
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #f5f7fa 0%, #d9e8ef 12%, #8fb8cb 28%, #2e5f7d 48%, #0d2b45 70%, #050f1c 100%)",
      }}
    >
      <LevelsRuler />
      <OceanLiveToasts />

      {/* лучи света уходят с поверхности в толщу */}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] h-[42%]" aria-hidden="true">
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[14%]" aria-hidden="true">
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
        {/* шапка — что такое Океан и зачем эта страница */}
        <div className="max-w-2xl">
          <p className="eyebrow !text-teal-600">Система признания знаний</p>
          <h1 className="mt-2 text-4xl !text-navy sm:text-6xl">Океан</h1>
          <p className="mt-4 text-lg leading-relaxed !text-navy/70">
            Океан — многоуровневая система признания знаний TerenLabs. Почему
            океан? Потому что уровни здесь живые: каждому соответствует морской
            обитатель, и чем глубже ныряешь — тем крупнее зверь и серьёзнее
            решения.
          </p>
          <p className="mt-3 text-lg leading-relaxed !text-navy/70">
            Эта страница — твой штурвал: отслеживай уровень, смотри личную
            статистику и сравнивай себя с другими в честном рейтинге.
          </p>
          {/* живое соревнование: кто уже в океане и кто впереди */}
          <OceanPulseStrip />
        </div>

        {/* личная статистика: достижения отслеживаются здесь */}
        <div className="mt-10 max-w-3xl">
          <OceanAccount title="Твоя статистика" />
        </div>

        {/* погружение: персонаж + свободный текст-метафора, без рамок.
            Уровни связаны нитью течения — свет бежит вниз, к следующей глубине */}
        <div className="mt-10 sm:mt-16">
          {LEVELS.map((l, i) => {
            const deep = i >= 3; // на тёмной воде — светлый текст
            const right = i % 2 === 1; // персонаж справа/слева попеременно
            const size = SIZE[i];
            const heading = deep ? "!text-foam" : "!text-navy";
            const body = deep ? "text-foam/75" : "text-navy/75";
            const dim = deep ? "text-foam/45" : "text-navy/50";
            return (
              <div key={l.key}>
                {/* нить погружения: течение ведёт от уровня к уровню */}
                {i > 0 && (
                  <div
                    className="flow-line-v mx-auto my-8 h-24 w-px opacity-70 sm:my-10 sm:h-36"
                    aria-hidden="true"
                  />
                )}
              <div
                className={`relative flex flex-col items-center gap-8 sm:flex-row sm:gap-16 ${
                  right ? "sm:flex-row-reverse" : ""
                }`}
              >
                {/* ПЕРСОНАЖ — герой уровня, растёт с глубиной; клик → тесты уровня */}
                <Reveal className="shrink-0" delay={60}>
                  <LevelChar locked={!!l.locked} href={`/levels/${l.key}`}>
                  <div className="relative flex items-center justify-center">
                    {/* свечение за персонажем */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: size * 1.35,
                        height: size * 1.35,
                        background: `radial-gradient(circle, ${
                          deep ? "rgba(0,183,194,0.28)" : "rgba(255,255,255,0.5)"
                        } 0%, transparent 70%)`,
                        filter: "blur(6px)",
                      }}
                      aria-hidden="true"
                    />
                    <img
                      src={RANK_IMG[l.key]}
                      alt={l.name}
                      width={size}
                      height={size}
                      className={`floaty relative object-contain drop-shadow-[0_24px_50px_rgba(4,16,28,0.55)] ${
                        l.locked ? "orb-locked" : ""
                      }`}
                      style={{
                        width: size,
                        height: size,
                        maxWidth: "min(60vw, " + size + "px)",
                        "--float-delay": `${i * -0.9}s`,
                        "--float-dur": `${5 + (i % 3)}s`,
                      } as React.CSSProperties}
                    />
                  </div>
                  </LevelChar>
                </Reveal>

                {/* ТЕКСТ — метафора без рамок, свободно на воде */}
                <Reveal delay={i === 0 ? 0 : 160} className="max-w-xl text-center sm:text-left">
                  <p className={`num text-xs font-bold uppercase tracking-[0.3em] ${dim}`}>
                    {ZONES[i]} · {METERS[i]}
                  </p>
                  <p className="mt-2.5">
                    {/* живое население уровня — соревновательный сигнал */}
                    <LevelCrowd levelKey={l.key} deep={deep} />
                  </p>
                  <div className="mt-2 flex flex-wrap items-baseline justify-center gap-3 sm:justify-start">
                    <h2 className={`text-4xl sm:text-5xl ${heading}`}>{l.name}</h2>
                    {l.key === "krab" && (
                      <span className="rounded-full bg-teal px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-white shadow-[0_0_18px_rgba(0,183,194,0.5)]">
                        начни здесь
                      </span>
                    )}
                    {l.key === "rakushka" && (
                      <span className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold ${deep ? "bg-white/10 text-foam/60" : "bg-navy/10 text-navy/60"}`}>
                        даётся автоматически
                      </span>
                    )}
                    {l.locked && (
                      <span className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold ${deep ? "bg-white/10 text-foam/55" : "bg-navy/10 text-navy/55"}`}>
                        закрыт
                      </span>
                    )}
                  </div>

                  {/* метафора: почему именно этот персонаж */}
                  <p className={`mt-4 text-lg leading-relaxed sm:text-xl ${body}`}>{l.metaphor}</p>
                  {/* что означает уровень по навыкам */}
                  {l.meaning && (
                    <p className={`mt-3 border-l-2 border-teal pl-4 text-base leading-relaxed sm:text-lg ${heading}`}>
                      {l.meaning}
                    </p>
                  )}

                  {/* что проверяется на уровне + механика очков */}
                  {l.key === "krab" && (
                    <p className={`num mt-4 text-sm ${dim}`}>
                      очки места = точность × скорость · пороги сдачи 7 / 7 / 6 из 10
                    </p>
                  )}
                  {!l.locked && l.key !== "rakushka" && (
                    <p className={`num mt-2 text-sm ${dim}`}>
                      {[
                        l.modules.length > 0 &&
                          `${l.modules.length} ${plural(l.modules.length, "модуль", "модуля", "модулей")}`,
                        l.testSlugs.length > 0 &&
                          `${l.testSlugs.length} ${plural(l.testSlugs.length, "тест", "теста", "тестов")} с разбором`,
                        l.caseSlugs.length + l.reviewSlugs.length > 0 &&
                          `${l.caseSlugs.length + l.reviewSlugs.length} ${plural(
                            l.caseSlugs.length + l.reviewSlugs.length, "материал", "материала", "материалов")}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}

                  <p className="mt-5">
                    {l.key === "krab" ? (
                      <Button href="/levels/krab">Пройти тест на Краба</Button>
                    ) : (
                      <Link
                        href={`/levels/${l.key}`}
                        className="text-base font-semibold text-teal transition-colors hover:text-teal-200"
                      >
                        {l.locked ? "Что внутри →" : l.key === "rakushka" ? "Осмотреться →" : "Войти на уровень →"}
                      </Link>
                    )}
                  </p>
                </Reveal>
              </div>
              </div>
            );
          })}
        </div>

        {/* дно: биолюминесценция + старт пути */}
        <Reveal>
          <div className="relative mt-28 pb-6 text-center">
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
