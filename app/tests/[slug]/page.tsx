import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";
import { RankSketch, RankTag } from "@/components/RankSketch";
import { getItem, TESTS, LEVELS, PRODUCT_TYPES, plural } from "@/lib/content";
import { OCEAN_TESTS } from "@/lib/ocean-tests";
import { itemMetadata } from "@/lib/seo";

// Все слаги известны на сборке: неизвестный отдаёт настоящий 404, а не 200
// с пустой страницей (аудит ссылок 06.09.2026).
export const dynamicParams = false;

export function generateStaticParams() {
  return TESTS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return itemMetadata(getItem("test", slug), `/tests/${slug}`);
}

// Тексты те же, что на общей карточке продукта (ProductPage): у тестов нет
// своих, поэтому повторяем блоки «Что ты получишь», «Формат» и «Вопросы».
const OUTCOMES = [
  "Поймёшь, где именно бизнес теряет деньги",
  "Посчитаешь риск до того, как вложишься",
  "Получишь рабочий инструмент, а не конспект",
];

const FORMAT = ["Личный кабинет + мобайл", "Прогресс и ранг «Океан»", "Языки: RU · KK"];

const FAQ = [
  { q: "Чем это отличается от обычного курса?", a: "Мы ведём расчётом и реальными данными, а не мотивацией. На выходе — применимый инструмент." },
  { q: "На каком языке материал?", a: "Русский. Переключатель языка — в шапке." },
];

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getItem("test", slug);
  if (!p) notFound();

  const t = PRODUCT_TYPES[p.type];
  const level = LEVELS.find((l) => l.testSlugs.includes(p.slug));
  const ocean = OCEAN_TESTS[p.slug];
  const questionCount = p.questions?.length ?? 0;

  // параметры попытки: у океанских из канона, у банковых из числа вопросов
  const facts: [string, string][] = ocean
    ? [
        ["Вопросов в попытке", String(ocean.qCount)],
        ["Порог сдачи", `${ocean.floor} из 10`],
        ["Формат", ocean.type === "open" ? "ответ своими словами, оценивает TEREN-AI" : "выбор варианта, балл считает сервер"],
        ["Пересдача", "через кулдаун, другая выборка вопросов"],
      ]
    : questionCount > 0
    ? [
        ["Вопросов", `${questionCount} ${plural(questionCount, "вопрос", "вопроса", "вопросов")}`],
        ["Формат", "выбор варианта, разбор только ошибок"],
        ["Итог", "ранг по доле верных ответов"],
      ]
    : p.metric
    ? [[p.metric.label, p.metric.value]]
    : [];

  return (
    <article>
      {/* шапка */}
      <section className="border-b border-line">
        <Container className="py-14 sm:py-16">
          <nav className="mb-6 text-[13px] text-faint">
            <Link href="/catalog" className="transition-colors hover:text-ink">Каталог</Link>
            <span className="mx-2">/</span>
            <Link href={t.href} className="transition-colors hover:text-ink">{t.label}</Link>
            {level && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/levels/${level.key}`} className="transition-colors hover:text-ink">{level.name}</Link>
              </>
            )}
          </nav>

          <div className="grid gap-6 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="min-w-0">
              <p className="eyebrow">{t.label} · {p.topic} · {p.stage}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <h1 className="max-w-[22ch] text-[24px] sm:text-[38px]">{p.title}</h1>
                {p.stub ? <span className="tag">скоро</span> : level ? <RankTag rank={level.key} /> : null}
              </div>
              <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">{p.blurb}</p>
              {p.stub && (
                <p className="mt-4 text-[14px] text-faint">Готовим к выпуску — материал ещё в работе</p>
              )}
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                {p.stub ? (
                  <Button href={level ? `/levels/${level.key}` : "/tests"} variant="secondary" size="lg">
                    {level ? `К уровню «${level.name}»` : "Смотреть другие тесты"}
                  </Button>
                ) : (
                  <Button href={`/tests/${p.slug}/take`} size="lg">
                    Пройти тест <Arrow />
                  </Button>
                )}
                {level && !p.stub && (
                  <Link href={`/levels/${level.key}`} className="link text-[15px]">
                    Уровень «{level.name}» <Arrow />
                  </Link>
                )}
              </div>
            </div>

            {/* параметры попытки */}
            <aside className="rounded-[8px] border border-line bg-subtle p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">Параметры</p>
                {level && <RankSketch rank={level.key} size={28} className="text-ink" title={level.name} />}
              </div>
              <div className="mt-3">
                {facts.map(([k, v]) => (
                  <div key={k} className="grid gap-0.5 border-t border-line py-3 text-[14px] sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
                    <span className="text-text-2">{k}</span>
                    <span className="num font-medium text-ink sm:text-right">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-y border-line py-3 text-[14px]">
                  <span className="text-text-2">Стоимость</span>
                  <span className="tag">Бесплатно</span>
                </div>
              </div>
              {!p.stub && (
                <p className="mt-4 text-[13px] leading-relaxed text-faint">
                  Попытка идёт в зачёт «Океана» после входа через Telegram.
                </p>
              )}
            </aside>
          </div>
        </Container>
      </section>

      {/* тело */}
      <Container className="grid gap-8 sm:gap-14 py-9 sm:py-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex flex-col gap-8 sm:gap-14">
          <section>
            <h2 className="text-[24px]">Что ты получишь</h2>
            <div className="mt-4">
              {OUTCOMES.map((o, i) => (
                <div key={o} className="grid gap-2 border-t border-line py-4 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-4">
                  <span className="num text-[13px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[16px] text-ink">{o}</p>
                </div>
              ))}
              <div className="border-t border-line" />
            </div>
          </section>

          <section>
            <h2 className="text-[24px]">Эксперт</h2>
            <div className="mt-4 grid gap-1 border-y border-line py-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6">
              <span className="text-[16px] font-medium text-ink">TEREN-AI</span>
              <div>
                <p className="text-[16px] text-ink">Наставник TerenLabs</p>
                <p className="mt-1 text-[14px] leading-relaxed text-text-2">Считает, а не мотивирует — отвечает по базе знаний</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[24px]">Вопросы</h2>
            <div className="mt-4">
              {FAQ.map((f) => (
                <details key={f.q} className="group border-t border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] text-ink">
                    {f.q}
                    <span className="num shrink-0 text-faint transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="pb-5 text-[15px] leading-relaxed text-text-2">{f.a}</p>
                </details>
              ))}
              <div className="border-t border-line" />
            </div>
          </section>
        </div>

        {/* боковая колонка */}
        <aside className="lg:sticky lg:top-20">
          <p className="eyebrow">Формат</p>
          <div className="mt-3">
            {FORMAT.map((f) => (
              <div key={f} className="border-t border-line py-3 text-[14px] text-body">{f}</div>
            ))}
            <div className="border-t border-line" />
          </div>
          {level && (
            <div className="mt-8">
              <p className="eyebrow">Тесты уровня</p>
              <div className="mt-3">
                {level.testSlugs.map((s) => {
                  const other = TESTS.find((x) => x.slug === s);
                  if (!other) return null;
                  const current = other.slug === p.slug;
                  return (
                    <Link
                      key={s}
                      href={`/tests/${other.slug}`}
                      className={`flex items-center gap-3 border-t border-line py-2.5 text-[14px] transition-colors hover:text-ink ${
                        current ? "text-ink" : "text-text-2"
                      } ${other.stub ? "opacity-60" : ""}`}
                    >
                      <span className={`min-w-0 flex-1 truncate ${current ? "font-medium" : ""}`}>{other.title}</span>
                      {current ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" aria-hidden="true" />
                      ) : other.stub ? (
                        <span className="tag">скоро</span>
                      ) : null}
                    </Link>
                  );
                })}
                <div className="border-t border-line" />
              </div>
            </div>
          )}
        </aside>
      </Container>
    </article>
  );
}
