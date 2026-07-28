import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { LevelsRuler } from "@/components/LevelsRuler";
import { LevelChar } from "@/components/LevelChar";
import { OceanBubbles, LevelArrival } from "@/components/OceanLive";
import { LevelCrowd } from "@/components/OceanPulse";
import { OceanAccount } from "@/components/OceanAccount";
import { OceanBackground } from "@/components/OceanBackground";
import { LevelStatusChip, ContinueCta } from "@/components/OceanPath";
import { LEVELS, RANK_IMG, plural } from "@/lib/content";

export const metadata = {
  alternates: { canonical: "/levels" }, title: "Уровни «Океан» — TerenLabs" };

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

// Маршрут между уровнями: S-кривая точечным пунктиром, как путь на карте
// погружения — ведёт от персонажа одного уровня к следующему (зигзагом).
function DivePath({ fromX, toX, stroke }: { fromX: number; toX: number; stroke: string }) {
  // концы кривой — под персонажем предыдущего уровня и над следующим
  const d = `M ${fromX} 2 C ${fromX} 96, ${toX} 64, ${toX} 158`;
  return (
    <svg
      viewBox="0 0 1200 160"
      className="h-32 w-full sm:h-40"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d={d}
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="0.1 16"
        className="dive-dots"
      />
    </svg>
  );
}

// x-координаты центров персонажей в viewBox 1200 (персонажи чередуются):
// левый ~135, правый ~1065; медальон Ракушки в капсуле — у самого левого края
const CHAR_X = (i: number) => (i % 2 === 1 ? 1065 : 135);

// цвет пунктира по глубине: на светлом мелководье — бирюза, на средней
// сине-серой воде бирюза тонет — белый, в тёмной толще — светлый циан
const PATH_STROKE = [
  "rgba(0, 155, 166, 0.55)", // → Краб (светлая вода)
  "rgba(255, 255, 255, 0.7)", // → Барракуда (средняя)
  "rgba(255, 255, 255, 0.6)", // → Дельфин
  "rgba(159, 226, 232, 0.6)", // → Акула (тёмная)
  "rgba(159, 226, 232, 0.6)", // → Кит
];

export default function LevelsPage() {
  return (
    <>
      {/* живой WebGL-океан за всей страницей — камера летит вглубь по скроллу */}
      <OceanBackground />
      <div id="dive-wrap" className="relative z-10 overflow-hidden">
      <LevelsRuler />

      {/* биолюминесценция у дна (поверх WebGL — мерцающие точки на самом дне) */}
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

      <Container className="dive-readable relative py-16">
        {/* шапка: интро слева, зал славы плавает на воде справа — без рамок */}
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
          <div className="max-w-2xl">
            <p className="eyebrow !text-[#8fe8ef] [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]">Система признания знаний</p>
            <h1 className="mt-2 text-4xl !text-foam sm:text-6xl">Океан</h1>

            {/* текст Адиля дословно; «интересная подача» — только типографикой:
                первая фраза — serif-лид, дальше обычный текст */}
            <p
              className="mt-6 font-[family-name:var(--font-display)] text-[1.4rem] italic leading-snug !text-foam sm:text-[1.65rem]"
              style={{ textWrap: "balance" }}
            >
              Океан — многоуровневая{" "}
              <span className="text-teal">система признания знаний</span>{" "}
              TerenLabs.
            </p>

            <p className="mt-4 text-lg leading-relaxed !text-foam/75">
              Почему океан? Потому что уровни здесь живые: каждому соответствует
              морской обитатель, и чем глубже ныряешь — тем крупнее зверь и
              серьёзнее решения.
            </p>
            <p className="mt-3 text-lg leading-relaxed !text-foam/75">
              Эта страница — твой штурвал: отслеживай уровень, смотри личную
              статистику и сравнивай себя с другими в честном рейтинге.
            </p>

            {/* вход в рейтинг: раздел «Океан» был единственным местом БЕЗ ссылки
                на /ocean — рейтинг находили только из кабинета (Адиль 18.07) */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/ocean"
                className="group inline-flex items-center gap-2.5 rounded-full border border-teal/50 bg-teal/10 px-5 py-2.5 text-[15px] font-semibold text-teal transition-all hover:-translate-y-0.5 hover:bg-teal/20"
              >
                🏆 Рейтинг «Океана»
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-foam/60 transition-colors hover:text-teal"
              >
                Моя статистика — в кабинете →
              </Link>
            </div>
          </div>

          {/* активные в океане — всплывают пузырьками, как газ со дна */}
          <OceanBubbles />
        </div>

        {/* погружение: персонаж + свободный текст-метафора, без рамок.
            Уровни связаны нитью течения — свет бежит вниз, к следующей глубине */}
        <div className="mt-10 sm:mt-16">
          {LEVELS.map((l, i) => {
            const deep = true; // вся страница на тёмном WebGL-океане — текст светлый
            const right = i % 2 === 1; // персонаж справа/слева попеременно
            const size = SIZE[i];
            const heading = deep ? "!text-foam" : "!text-navy";
            const body = deep ? "text-foam/75" : "text-navy/75";
            const dim = deep ? "text-foam/45" : "text-navy/50";
            // Ракушка — старт, не уровень: компактная капсула, без сцены
            if (l.key === "rakushka") {
              return (
                <div
                  key={l.key}
                  className="flex max-w-2xl flex-col items-start gap-4 rounded-[var(--radius-lg)] border border-white/12 bg-white/[0.06] p-5 backdrop-blur sm:flex-row sm:items-center sm:gap-6 sm:p-6"
                >
                  <img
                    src={RANK_IMG[l.key]}
                    alt={l.name}
                    width={72}
                    height={72}
                    className="floaty h-16 w-16 shrink-0 object-contain sm:h-[72px] sm:w-[72px]"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2 className="text-2xl !text-foam">{l.name}</h2>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[0.7rem] font-semibold text-foam/60">
                        старт · даётся автоматически
                      </span>
                    </div>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-foam/70">
                      Появился в океане — уже Ракушка. Настоящий путь начинается
                      с первого теста.
                    </p>
                  </div>
                  <Link
                    href="/levels/rakushka"
                    className="shrink-0 text-sm font-semibold text-teal-600 transition-colors hover:text-teal sm:ml-auto"
                  >
                    Осмотреться →
                  </Link>
                </div>
              );
            }
            return (
              <div key={l.key}>
                {/* маршрут погружения: пунктирная кривая от уровня к уровню */}
                {i > 0 && (
                  <DivePath
                    fromX={i === 1 ? 75 : CHAR_X(i - 1)}
                    toX={CHAR_X(i)}
                    stroke={PATH_STROKE[i - 1]}
                  />
                )}
              <div
                className={`relative flex flex-col items-center gap-8 sm:flex-row sm:gap-16 ${
                  right ? "sm:flex-row-reverse" : ""
                }`}
              >
                {/* ПЕРСОНАЖ — герой уровня, растёт с глубиной; клик → тесты уровня.
                    Без Reveal: уровни видны всегда, никакой пустоты при быстром скролле */}
                <div className="shrink-0">
                  <LevelChar locked={!!l.locked} href={`/levels/${l.key}`}>
                  <div className="relative flex items-center justify-center">
                    {/* пузырь прибытия: кто последним доплыл до этой глубины */}
                    <LevelArrival levelKey={l.key} deep={deep} />
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
                      className="floaty relative object-contain drop-shadow-[0_24px_50px_rgba(4,16,28,0.55)]"
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
                </div>

                {/* ТЕКСТ — метафора без рамок, свободно на воде */}
                <div className="max-w-xl text-center sm:text-left">
                  <p className={`num text-xs font-bold uppercase tracking-[0.3em] ${dim}`}>
                    {ZONES[i]} · {METERS[i]}
                  </p>
                  <p className="mt-2.5">
                    {/* живое население уровня — соревновательный сигнал */}
                    <LevelCrowd levelKey={l.key} deep={deep} />
                  </p>
                  <div className="mt-2 flex flex-wrap items-baseline justify-center gap-3 sm:justify-start">
                    <h2 className={`text-4xl sm:text-5xl ${heading} ${i <= 2 ? "refract-low" : i <= 4 ? "refract-mid" : "refract-deep"}`}>{l.name}</h2>
                    {/* вошедшему — «✓ пройден»/«ты здесь» по его прогрессу, анониму —
                        «начни здесь» на Крабе (как раньше) */}
                    <LevelStatusChip levelKey={l.key} />
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
                  {!l.locked && (
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
                      <ContinueCta />
                    ) : (
                      <Link
                        href={`/levels/${l.key}`}
                        className="text-base font-semibold text-teal transition-colors hover:text-teal-200"
                      >
                        {l.locked ? "Что внутри →" : "Войти на уровень →"}
                      </Link>
                    )}
                  </p>
                </div>
              </div>
              </div>
            );
          })}
        </div>

        {/* твоя статистика — у дна: после погружения видно, где ты;
            аноним видит тихую строку, не баннер (Адиль: «раздражает, поменьше») */}
        <div className="mt-24 max-w-3xl">
          <OceanAccount title="Твоя статистика" />
        </div>

        {/* дно: биолюминесценция + старт пути */}
        <Reveal>
          <div className="relative mt-28 pb-6 text-center">
            <p className="mx-auto max-w-md font-[family-name:var(--font-display)] text-xl italic leading-relaxed text-foam/60">
              Дно — это не конец. Это место, откуда видно весь океан.
            </p>
            <div className="mt-8">
              <ContinueCta size="lg" />
            </div>
          </div>
        </Reveal>
      </Container>
      </div>
    </>
  );
}
