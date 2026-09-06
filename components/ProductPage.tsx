import Link from "next/link";
import { Container } from "./Container";
import { Button, Arrow } from "./Button";
import { FinmodelLeadForm } from "./FinmodelLeadForm";
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
  { q: "Как заказать?", a: "Оставляете заявку на сайте — эксперт связывается в Telegram и уточняет детали." },
];

// «Формат» — по типу продукта: у финпродуктов нет ни рангов, ни кабинета,
// показывать им океанские строки — ляп (Адиль 18.07)
const FORMAT_BY_TYPE: Record<string, string[]> = {
  finmodel: [
    "Бесплатно — сборка в боте @terenlabs_bot",
    "Результат остаётся у тебя (документ/таблица)",
    "Считаем по твоим цифрам, не по шаблонным",
  ],
  default: ["Личный кабинет + мобайл", "Прогресс и ранг «Океан»", "Языки: RU · KK"],
};

// Страница продукта: шапка с крошками и панелью действия, тело строками
// с тонкими линиями, FAQ раскрывашками. Декораций нет.
export function ProductPage({ p }: { p: Product }) {
  const t = PRODUCT_TYPES[p.type];

  // Индивидуальная финмодель ($100) — платная ручная работа экспертов Big 4 по
  // заявке (не ИИ, не бесплатно). Отличается CTA/форматом/экспертом/FAQ от бесплатных.
  const isPaidFinmodel = p.type === "finmodel" && !!p.price && p.price.includes("$");

  // Куда ведёт основная кнопка в зависимости от типа продукта
  const cta =
    p.type === "test"
      ? { href: `/tests/${p.slug}/take`, label: "Пройти тест" }
      : p.type === "course"
      ? { href: `/learn/${p.slug}`, label: p.stub ? "Открыть демо обучения" : "Начать обучение" }
      : isPaidFinmodel
      ? // независимая заявка на сайте — без захода в Telegram (форма ниже, #zayavka)
        { href: "#zayavka", label: "Оставить заявку" }
      : p.free
      ? { href: "/catalog", label: "Открыть" }
      : p.stub
      ? // ещё не открыто — «смотреть другие» вместо обещания
        { href: "/catalog?type=finmodel", label: "Скоро — смотреть другие" }
      : // бесплатные финпродукты собираются в боте: своей сборки на сайте пока нет
        { href: "https://t.me/terenlabs_bot", label: "Открыть в Telegram" };

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
      {/* Шапка */}
      <section className="border-b border-line">
        <Container className="py-14 sm:py-16">
          <nav aria-label="Хлебные крошки" className="mb-6 text-[13px] text-faint">
            <Link href="/catalog" className="hover:text-ink">Каталог</Link>
            <span className="mx-2">/</span>
            <Link href={t.href} className="hover:text-ink">{t.label}</Link>
          </nav>

          <div className="grid gap-6 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="min-w-0">
              <p className="eyebrow">{t.label} · {p.topic} · {p.stage}</p>
              <h1 className="mt-4 max-w-[20ch] text-[24px] sm:text-[38px]">{p.title}</h1>
              <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">{p.blurb}</p>
              {p.stub && (
                <p className="mt-5">
                  <span className="tag tag-orange">Готовим к выпуску — материал ещё в работе</span>
                </p>
              )}
            </div>

            {/* Панель действия */}
            <aside className="rounded-[8px] border border-line bg-subtle p-5 lg:sticky lg:top-20">
              {p.metric && (
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="num text-[24px] font-semibold text-ink">{p.metric.value}</span>
                  <span className="text-[13px] text-text-2">{p.metric.label}</span>
                </div>
              )}
              {p.price && <div className="num mb-4 text-[20px] font-medium text-ink">{p.price}</div>}
              <Button href={cta.href} className="w-full">
                {cta.label} <Arrow />
              </Button>
              {!p.stub && (
                <p className="mt-3 text-[12px] leading-relaxed text-faint">
                  {isPaidFinmodel
                    ? "Заявка прямо на сайте — ответим по вашему контакту, Telegram не нужен"
                    : "Открывается в @terenlabs_bot — вход через Telegram"}
                </p>
              )}
            </aside>
          </div>
        </Container>
      </section>

      {/* Тело */}
      <Container className="grid gap-7 sm:gap-12 py-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex flex-col gap-8 sm:gap-14">
          {isPaidFinmodel && (
            <section id="zayavka" className="scroll-mt-24">
              <h2 className="text-[20px]">Оставить заявку</h2>
              <div className="mt-5">
                <FinmodelLeadForm />
              </div>
            </section>
          )}

          <Block title="Что ты получишь">
            <ul>
              {OUTCOMES_STUB.map((o, i) => (
                <li
                  key={o}
                  className="grid gap-2 border-t border-line py-4 text-[15px] leading-relaxed text-body sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-6"
                >
                  <span className="num text-[13px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line" />
          </Block>

          <Block title="Эксперт">
            <div className="flex items-center gap-4 border-y border-line py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-2 bg-card text-[14px] font-medium text-ink">
                {isPaidFinmodel ? "B4" : "AI"}
              </div>
              <div className="min-w-0">
                {isPaidFinmodel ? (
                  <>
                    <div className="text-[15px] font-medium text-ink">Финансовые эксперты с опытом Big 4</div>
                    <div className="mt-0.5 text-[14px] text-text-2">Собирают модель вручную по стандарту FAST — под ваш проект и цифры</div>
                  </>
                ) : (
                  <>
                    <div className="text-[15px] font-medium text-ink">TEREN-AI · наставник TerenLabs</div>
                    <div className="mt-0.5 text-[14px] text-text-2">Считает, а не мотивирует — отвечает по базе знаний</div>
                  </>
                )}
              </div>
            </div>
          </Block>

          <Block title="Вопросы">
            <div>
              {faq.map((f) => (
                <details key={f.q} className="group border-t border-line">
                  <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-4 py-3 text-[15px] font-medium text-ink">
                    {f.q}
                    <span className="num shrink-0 text-text-2 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="max-w-[64ch] pb-4 text-[15px] leading-relaxed text-text-2">{f.a}</p>
                </details>
              ))}
              <div className="border-t border-line" />
            </div>
          </Block>
        </div>

        {/* Боковая колонка */}
        <aside className="rounded-[8px] border border-line bg-subtle p-5">
          <h3 className="eyebrow">Формат</h3>
          <ul className="mt-3">
            {formatLines.map((f) => (
              <li key={f} className="border-t border-line py-2.5 text-[14px] leading-relaxed text-body">
                {f}
              </li>
            ))}
            <li className="border-t border-line" aria-hidden="true" />
          </ul>
        </aside>
      </Container>
    </article>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[20px]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
