import Link from "next/link";
import { Container } from "@/components/Container";
import { Arrow } from "@/components/Button";
import { RankSketch, RankTag } from "@/components/RankSketch";
import { LevelCrowd } from "@/components/OceanPulse";
import { OceanAccount } from "@/components/OceanAccount";
import { LevelStatusChip, ContinueCta } from "@/components/OceanPath";
import { OceanTopTable } from "@/components/OceanTopTable";
import { LEVELS, plural } from "@/lib/content";

export const metadata = {
  alternates: { canonical: "/levels" },
  title: "Уровни «Океан» — TerenLabs",
};

// Глубина: метафора пути, не бизнес-цифры
const METERS = ["0 м", "20 м", "50 м", "120 м", "300 м", "1 000 м"];

// Страница уровней как реестр: глубина, эскиз, уровень, статус, действие.
// Механика та же (тесты, пороги, очки), декораций нет.
export default function LevelsPage() {
  return (
    <>
      <Container className="py-14 sm:py-20">
        <p className="eyebrow">Океан · система уровней</p>
        <h1 className="mt-3 text-[36px] sm:text-[48px]">Уровни</h1>
        <p className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-text-2 sm:text-[18px]">
          Каждому уровню соответствует морской обитатель. Чем глубже, тем крупнее зверь
          и серьёзнее решения. Ранг растёт за понимание: его нельзя накликать, можно
          только заслужить.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ContinueCta />
          <Link href="/ocean" className="link text-[15px]">
            Рейтинг «Океана» <Arrow />
          </Link>
        </div>
      </Container>

      <Container className="grid gap-12 pb-20 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* реестр уровней */}
        <div>
          <div className="hidden grid-cols-[72px_56px_minmax(0,1fr)_140px] gap-6 pb-2 text-[12px] uppercase tracking-[0.08em] text-faint sm:grid">
            <span>Глубина</span>
            <span />
            <span>Уровень</span>
            <span>Статус</span>
          </div>
          {LEVELS.map((l, i) => (
            <div
              key={l.key}
              className={`grid gap-4 border-t border-line py-6 sm:grid-cols-[72px_56px_minmax(0,1fr)_140px] sm:gap-6 sm:items-center ${
                l.locked ? "opacity-60" : ""
              }`}
            >
              <span className="num text-[13px] text-faint">{METERS[i]}</span>
              <RankSketch rank={l.key} size={56} className="text-body" title={l.name} />
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h2 className="text-[24px]">{l.name}</h2>
                  <RankTag rank={l.key} />
                  <LevelStatusChip levelKey={l.key} />
                </div>
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
              <div className="flex sm:justify-end">
                <Link href={`/levels/${l.key}`} className="link text-[15px]">
                  {l.locked ? "Что внутри" : "Открыть"} <Arrow />
                </Link>
              </div>
            </div>
          ))}
          <div className="border-t border-line" />
        </div>

        {/* правая колонка: рейтинг */}
        <aside className="rounded-[8px] border border-line bg-subtle p-5 lg:sticky lg:top-20">
          <div className="flex items-baseline justify-between">
            <p className="eyebrow">Рейтинг · Казахстан</p>
          </div>
          <div className="mt-3">
            <OceanTopTable limit={5} />
          </div>
        </aside>
      </Container>

      {/* личный кабинет Океана: живые данные с бэка */}
      <section className="border-t border-line bg-subtle">
        <Container className="py-14">
          <OceanAccount title="Твоя статистика" />
        </Container>
      </section>

      <section className="border-t border-line">
        <Container className="py-16">
          <p className="eyebrow">Механика</p>
          <h2 className="mt-3 text-[28px]">Как считается место</h2>
          <div className="mt-6 max-w-[860px]">
            {[
              ["Очки места", "Средний балл попыток, умноженный на коэффициент темпа. Ответы быстрее 5 секунд не считаются."],
              ["Композит уровня", "Сумма средних баллов по тестам уровня. Пересдачи наугад витрину не красят. Порог сдачи 7 из 10."],
              ["Равные очки", "Выше стоит тот, кто раньше вошёл в океан."],
            ].map(([t, d]) => (
              <div key={t} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6">
                <span className="text-[15px] font-medium text-ink">{t}</span>
                <p className="text-[15px] leading-relaxed text-text-2">{d}</p>
              </div>
            ))}
            <div className="border-t border-line" />
          </div>
        </Container>
      </section>
    </>
  );
}
