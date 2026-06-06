import Link from "next/link";
import { Container } from "@/components/Container";
import { LEVELS, RANK_IMG, plural } from "@/lib/content";

export const metadata = { title: "Уровни «Океан» — TerenLabs" };

// Погружение: страница темнеет с глубиной — от мелководья Ракушки к бездне Кита.
// Зоны метафорические (не бизнес-цифры). Одинакова в обеих темах — это путь, не поверхность.
const ZONES = ["мелководье", "риф", "толща", "течение", "глубина", "бездна"];

export default function LevelsPage() {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, #f5f7fa 0%, #d9e8ef 14%, #8fb8cb 32%, #2e5f7d 52%, #0d2b45 74%, #06182a 100%)",
      }}
    >
      <Container className="relative py-16">
        {/* шапка — на светлом мелководье */}
        <div className="max-w-2xl">
          <p className="eyebrow !text-teal-600">Путь</p>
          <h1 className="mt-2 text-4xl !text-navy sm:text-5xl">Уровни «Океан»</h1>
          <p className="mt-4 text-lg leading-relaxed !text-navy/70">
            От мелководья к открытому океану. Каждый уровень — модули, тесты,
            кейсы и обзоры. Проходятся по порядку: чем глубже, тем серьёзнее решения.
          </p>
        </div>

        {/* линия-течение погружения */}
        <div className="relative mt-14">
          <div
            className="pointer-events-none absolute bottom-8 left-9 top-0 w-[2px] sm:left-1/2 sm:-translate-x-1/2"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,155,166,0.55), rgba(0,183,194,0.5) 50%, rgba(0,183,194,0.25))",
            }}
          />

          <div className="space-y-12 sm:space-y-16">
            {LEVELS.map((l, i) => {
              const deepIdx = i >= 4; // глубина и бездна — тёмные карты
              const midIdx = i >= 2 && i < 4; // толща/течение — стеклянные
              const right = i % 2 === 1;
              return (
                <div key={l.key} className="relative sm:grid sm:grid-cols-2 sm:gap-14">
                  {/* орб ранга на линии */}
                  <div className="absolute left-9 top-0 z-10 -translate-x-1/2 sm:left-1/2">
                    <div
                      className={`flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 ${
                        deepIdx ? "border-teal/50 bg-navy-900" : "border-white/70 bg-white/80 backdrop-blur"
                      } shadow-[0_8px_30px_rgba(6,24,42,0.35)]`}
                    >
                      <img
                        src={RANK_IMG[l.key]}
                        alt={l.name}
                        width={52}
                        height={52}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* метка зоны глубины — напротив карточки */}
                  <div
                    className={`hidden items-center sm:flex ${
                      right ? "justify-start pl-14" : "order-2 justify-end pr-14"
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                        i < 2 ? "text-navy/45" : i < 4 ? "text-white/55" : "text-foam/40"
                      }`}
                    >
                      {ZONES[i]}
                    </span>
                  </div>

                  {/* карточка уровня */}
                  <div className={`pl-20 sm:pl-0 ${right ? "order-2 sm:pl-14" : "sm:pr-14"}`}>
                    <Link
                      href={`/levels/${l.key}`}
                      className={`group block rounded-[var(--radius-tl)] border p-6 transition-all hover:-translate-y-1 ${
                        deepIdx
                          ? "border-white/10 bg-navy-900/80 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur hover:border-teal/50"
                          : midIdx
                          ? "border-white/25 bg-white/10 shadow-[0_12px_36px_rgba(6,24,42,0.3)] backdrop-blur-md hover:border-teal/60"
                          : "border-white/60 bg-white/85 shadow-[var(--shadow-tl)] backdrop-blur hover:border-teal/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className={`text-2xl ${deepIdx || midIdx ? "!text-foam" : "!text-navy"}`}>
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
                        ) : (
                          <span className="rounded-full bg-teal/15 px-2.5 py-0.5 text-[0.7rem] font-semibold text-teal">
                            открыт
                          </span>
                        )}
                      </div>
                      <p className={`num mt-1 text-xs ${deepIdx || midIdx ? "text-foam/50" : "text-navy/50"}`}>
                        {l.tag}
                        {l.archetype ? ` · ${l.archetype}` : ""}
                      </p>
                      <p
                        className={`mt-3 text-sm leading-relaxed ${
                          deepIdx || midIdx ? "text-foam/70" : "text-navy/70"
                        }`}
                      >
                        {l.tagline}
                      </p>
                      {!l.locked && (
                        <p className={`num mt-4 text-xs ${deepIdx || midIdx ? "text-foam/50" : "text-navy/55"}`}>
                          {l.modules.length} {plural(l.modules.length, "модуль", "модуля", "модулей")} ·{" "}
                          {l.testSlugs.length} {plural(l.testSlugs.length, "тест", "теста", "тестов")} ·{" "}
                          {l.caseSlugs.length + l.reviewSlugs.length}{" "}
                          {plural(l.caseSlugs.length + l.reviewSlugs.length, "материал", "материала", "материалов")}
                        </p>
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* дно */}
        <p className="mt-16 text-center text-sm text-foam/45">
          Дно — это не конец. Это место, откуда видно весь океан.
        </p>
      </Container>
    </div>
  );
}
