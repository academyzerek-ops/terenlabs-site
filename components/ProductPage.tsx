import Link from "next/link";
import { Container } from "./Container";
import { Button } from "./Button";
import { Product, PRODUCT_TYPES } from "@/lib/content";

const OUTCOMES_STUB = [
  "Поймёшь, где именно бизнес теряет деньги",
  "Посчитаешь риск до того, как вложишься",
  "Получишь рабочий инструмент, а не конспект",
];

const FAQ_STUB = [
  { q: "Чем это отличается от обычного курса?", a: "Мы ведём расчётом и реальными данными, а не мотивацией. На выходе — применимый инструмент." },
  { q: "На каком языке материал?", a: "Русский. Переключатель языка — в шапке." },
];

// FAQ по теме финмоделей (бесплатные шаблонные)
const FAQ_FINMODEL = [
  { q: "Что нужно, чтобы собрать модель?", a: "Выбираете нишу и город, отвечаете на короткую анкету. Нет точных цифр — подставим отраслевые ориентиры." },
  { q: "Что на выходе?", a: "Excel-модель и разбор: выручка с сезонностью, затраты, налоги под ваш режим, точка безубыточности и кассовые разрывы." },
  { q: "Это правда бесплатно?", a: "Да. Сборка и скачивание бесплатны — нужен только вход через Telegram-бота." },
  { q: "А если бизнес нестандартный?", a: "Для уникальных проектов есть индивидуальная модель — её вручную собирают финансовые эксперты с опытом Big 4 по стандарту FAST." },
];

// FAQ по индивидуальной финмодели (платная, от $100)
const FAQ_INDFM = [
  { q: "Кто делает модель?", a: "Финансовые эксперты с опытом Big 4, вручную по международному стандарту FAST." },
  { q: "Под какие проекты?", a: "Любой сложности и отрасли: SaaS, производство, строительство и др." },
  { q: "Сколько стоит и какие сроки?", a: "От $100 — зависит от сложности и объёма. Сроки обсуждаем после брифа." },
  { q: "Как заказать?", a: "Оставляете заявку в Mini App — эксперт связывается в Telegram и уточняет детали." },
];

// «Формат» — по типу продукта: у финпродуктов нет ни рангов, ни кабинета,
// показывать им океанские строки — ляп (Адиль 18.07)
const FORMAT_BY_TYPE: Record<string, string[]> = {
  finmodel: [
    "Бесплатно — сборка в Mini App @terenlabs_bot",
    "Результат остаётся у тебя (документ/таблица)",
    "Считаем по твоим цифрам, не по шаблонным",
  ],
  default: ["Личный кабинет + мобайл", "Прогресс и ранг «Океан»", "Языки: RU · KK"],
};

export function ProductPage({ p }: { p: Product }) {
  const t = PRODUCT_TYPES[p.type];

  // Куда ведёт основная кнопка в зависимости от типа продукта
  const cta =
    p.type === "test"
      ? { href: `/tests/${p.slug}/take`, label: "Пройти тест" }
      : p.type === "course"
      ? { href: `/learn/${p.slug}`, label: p.stub ? "Открыть демо обучения" : "Начать обучение" }
      : p.free
      ? { href: "/catalog", label: "Открыть" }
      : p.stub
      ? // ещё не открыто — «смотреть другие» вместо обещания
        { href: "/catalog?type=finmodel", label: "Скоро — смотреть другие" }
      : // линейка бесплатна (2026-07): сборка в Mini App, оплата не требуется.
        // Индивидуальная («от 100 $») — заявка там же, диалог с финансистом.
        { href: "https://t.me/terenlabs_bot", label: "Открыть в Mini App" };

  // Индивидуальная финмодель ($100) — платная ручная работа экспертов Big 4 по
  // заявке (не ИИ, не бесплатно). Отличается форматом/экспертом/FAQ от бесплатных.
  const isPaidFinmodel = p.type === "finmodel" && !!p.price && p.price.includes("$");
  const formatLines = isPaidFinmodel
    ? [
        "Финансовые эксперты с опытом Big 4",
        "Модели по международному стандарту FAST",
        "Любая сложность и отрасль: SaaS, производство, строительство и др.",
        "По заявке: бриф → эксперт связывается, обсуждаем объём",
        "Цена от $100 — зависит от сложности и объёма",
      ]
    : FORMAT_BY_TYPE[p.type] ?? FORMAT_BY_TYPE.default;

  // FAQ по теме продукта: у финмоделей — про ФМ (бесплатную/индивидуальную),
  // не курсовая заглушка (язык/возврат к финпродуктам не относятся).
  const faq =
    p.type === "finmodel" ? (isPaidFinmodel ? FAQ_INDFM : FAQ_FINMODEL) : FAQ_STUB;

  return (
    <article>
      {/* HERO */}
      <section className="hero-ocean">
        <Container className="relative z-10 py-16">
          <nav className="mb-6 text-sm text-foam/50">
            <Link href="/catalog" className="hover:text-teal">Каталог</Link>
            <span className="mx-2">/</span>
            <Link href={t.href} className="hover:text-teal">{t.label}</Link>
          </nav>

          <div className="grid gap-10 md:grid-cols-[1fr_320px]">
            <div>
              <p className="eyebrow">{t.label} · {p.topic} · {p.stage}</p>
              <h1 className="mt-4 max-w-2xl text-4xl !text-foam sm:text-5xl">{p.title}</h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-foam/75">{p.blurb}</p>
              {p.stub && (
                <p className="mt-5 inline-block rounded-full bg-warn/15 px-3 py-1 text-sm text-warn">
                  Готовим к выпуску — продажи ещё не открыты
                </p>
              )}
            </div>

            {/* Sticky-карточка покупки */}
            <aside className="h-fit rounded-[var(--radius-tl)] border border-white/10 bg-navy-900/70 p-6 backdrop-blur md:sticky md:top-24">
              {p.metric && (
                <div className="mb-4">
                  <div className="num text-3xl font-medium text-foam">{p.metric.value}</div>
                  <div className="text-xs text-foam/55">{p.metric.label}</div>
                </div>
              )}
              {p.price && <div className="num mb-4 text-2xl text-teal">{p.price}</div>}
              <Button href={cta.href} className="w-full">
                {cta.label}
              </Button>
              {!p.stub && (
                <p className="mt-3 text-center text-xs text-foam/45">
                  Открывается в @terenlabs_bot — вход через Telegram
                </p>
              )}
            </aside>
          </div>
        </Container>
      </section>

      {/* ТЕЛО */}
      <Container className="grid gap-12 py-16 md:grid-cols-[1fr_320px]">
        <div className="space-y-14">
          <Block title="Что ты получишь">
            <ul className="space-y-3">
              {OUTCOMES_STUB.map((o) => (
                <li key={o} className="flex gap-3 text-heading">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  {o}
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Эксперт">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-teal to-teal-600 font-bold text-white">
                {isPaidFinmodel ? "B4" : "AI"}
              </div>
              <div>
                {isPaidFinmodel ? (
                  <>
                    <div className="text-heading">Финансовые эксперты с опытом Big 4</div>
                    <div className="text-sm text-muted">Собирают модель вручную по стандарту FAST — под ваш проект и цифры</div>
                  </>
                ) : (
                  <>
                    <div className="text-heading">TEREN-AI · наставник TerenLabs</div>
                    <div className="text-sm text-muted">Считает, а не мотивирует — отвечает по базе знаний</div>
                  </>
                )}
              </div>
            </div>
          </Block>

          <Block title="Вопросы">
            <div className="divide-y divide-line rounded-[var(--radius-tl)] border border-line bg-card">
              {faq.map((f) => (
                <details key={f.q} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-heading">
                    {f.q}
                    <span className="text-teal transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </Block>
        </div>

        {/* Боковая колонка */}
        <aside className="space-y-4">
          <div className="rounded-[var(--radius-tl)] border border-line bg-card p-5">
            <h3 className="eyebrow">Формат</h3>
            <ul className="mt-3 space-y-2 text-sm text-heading">
              {formatLines.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </aside>
      </Container>
    </article>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl text-heading">{title}</h2>
      <div className="wave-divider my-5" />
      {children}
    </section>
  );
}
