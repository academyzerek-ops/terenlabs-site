import Link from "next/link";
import { Container } from "@/components/Container";
import { RankSketch } from "@/components/RankSketch";
import { LevelCrowd } from "@/components/OceanPulse";
import { LevelStatusChip } from "@/components/OceanPath";
import { LevelAction } from "@/components/LevelAction";
import { OceanTopTable } from "@/components/OceanTopTable";
import { LEVELS, plural } from "@/lib/content";

export const metadata = {
  alternates: { canonical: "/levels" },
  title: "Уровни «Океан» — TerenLabs",
};

// Страница уровней как реестр: эскиз, уровень, статус, действие.
// Глубина в метрах убрана: числа были условные и в разных местах сайта
// расходились (у Краба стояло 20 м здесь и 10 м на тропе тестов).
// Механика та же (тесты, пороги, очки), декораций нет.
export default function LevelsPage() {
  return (
    <>
      <Container className="py-14 sm:py-20">
        <p className="eyebrow">Океан · система уровней</p>
        <h1 className="mt-3 text-[24px] sm:text-[38px]">Уровни</h1>
        <p className="mt-5 hyphens-auto text-justify text-[15px] leading-relaxed text-text-2 sm:text-[16px] lg:max-w-[calc(100%-368px)]">
          Каждому уровню соответствует морской обитатель, и выбран он по характеру:
          краб собирает, барракуда охотится, дельфин думает, акула решает, кит двигает
          рынок деньгами. Чем глубже, тем крупнее зверь и серьёзнее решения. Ранг растёт
          за понимание: его нельзя накликать, можно только заслужить.
        </p>

      </Container>

      <Container className="grid gap-7 sm:gap-12 pb-10 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* реестр уровней */}
        <div>
          <div className="hidden grid-cols-[56px_minmax(0,1fr)_96px] gap-5 pb-2 text-[12px] font-medium text-text-2 sm:grid">
            <span />
            <span>Уровень</span>
            <span className="text-right">Статус</span>
          </div>
          {LEVELS.map((l) => (
            <div
              key={l.key}
              className={`grid gap-4 border-t border-line py-6 sm:grid-cols-[56px_minmax(0,1fr)_96px] sm:gap-5 sm:items-center ${
                l.locked ? "opacity-60" : ""
              }`}
            >
              <RankSketch rank={l.key} size={56} className="text-ink" title={l.name} />
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h2 className="text-[24px]">{l.name}</h2>
                  <LevelStatusChip levelKey={l.key} hideDone />
                </div>
                {/* сперва кто ты на этой глубине, потом что это значит по навыкам:
                    имена уровней держатся на характере зверя, а не на порядковом номере */}
                {l.metaphor && l.archetype && (
                  <p className="max-w-[60ch] text-[14px] leading-relaxed text-faint">{l.metaphor}</p>
                )}
                <p className="max-w-[60ch] text-[15px] leading-relaxed text-text-2">
                  {l.meaning ?? l.tagline}
                </p>
                <p className="num text-[13px] text-faint">
                  {[
                    l.testSlugs.length > 0 &&
                      `${l.testSlugs.length} ${plural(l.testSlugs.length, "тест", "теста", "тестов")} с разбором`,
                    l.modules.length > 0 &&
                      `${l.modules.length} ${plural(l.modules.length, "модуль", "модуля", "модулей")}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <LevelCrowd levelKey={l.key} />
              </div>
              <div className="flex items-center gap-4 sm:justify-end">
                <LevelAction levelKey={l.key} levelName={l.name} testSlugs={l.testSlugs} locked={l.locked} />
              </div>
            </div>
          ))}
          <div className="border-t border-line" />
        </div>

        {/* правая колонка: рейтинг */}
        <aside className="panel p-6 lg:sticky lg:top-8">
          <div className="flex items-baseline justify-between">
            <p className="eyebrow">Рейтинг</p>
          </div>
          <div className="mt-3">
            <OceanTopTable limit={5} />
          </div>
        </aside>
      </Container>

      <section className="border-t border-line">
        <Container className="py-9 sm:py-16">
          <p className="eyebrow">Механика</p>
          <h2 className="mt-3 text-[20px] sm:text-[24px]">Как считается место</h2>

          {/* три ячейки панели через вертикальные линии, как в остальных разборах
              на сайте. Строки внутри выровнены по subgrid: заголовки на одной
              линии, тексты на другой, независимо от их длины */}
          <div className="panel mt-8 grid lg:grid-cols-3 lg:grid-rows-[auto_auto]">
            {[
              ["Баллы", "Средний балл попыток, умноженный на коэффициент темпа. Ответы быстрее 5 секунд не считаются."],
              ["Композит уровня", "Сумма средних баллов по тестам уровня. Пересдачи наугад витрину не красят. Порог сдачи 7 из 10."],
              ["Равные очки", "Выше стоит тот, кто раньше вошёл в океан."],
            ].map(([t, d], i) => (
              <div
                key={t}
                className={`grid min-w-0 content-start gap-2 p-6 sm:p-7 lg:row-span-2 lg:grid-rows-subgrid ${
                  i > 0 ? "border-t border-line lg:border-l lg:border-t-0" : ""
                }`}
              >
                <h3 className="text-[15px] font-medium text-ink">{t}</h3>
                <p className="max-w-[46ch] text-[15px] leading-relaxed text-text-2">{d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
