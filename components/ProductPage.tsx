import Link from "next/link";
import { Container } from "./Container";
import { Button, Arrow } from "./Button";
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

// «Формат» — по типу продукта (финпродукты сняты с прода 09.09.2026, остался общий набор)
const FORMAT_BY_TYPE: Record<string, string[]> = {
  default: ["Личный кабинет + мобайл", "Прогресс и ранг «Океан»", "Языки: RU · KK"],
};

// Страница продукта: шапка с крошками и панелью действия, тело строками
// с тонкими линиями, FAQ раскрывашками. Декораций нет.
export function ProductPage({ p }: { p: Product }) {
  const t = PRODUCT_TYPES[p.type];

  // Куда ведёт основная кнопка в зависимости от типа продукта
  const cta =
    p.type === "test"
      ? { href: `/tests/${p.slug}/take`, label: "Пройти тест" }
      : p.type === "course"
      ? { href: `/learn/${p.slug}`, label: p.stub ? "Открыть демо обучения" : "Начать обучение" }
      : p.stub
      ? // ещё не открыто — «смотреть другие» вместо обещания
        { href: "/catalog", label: "Скоро — смотреть другие" }
      : { href: "/catalog", label: "Открыть" };

  const formatLines = FORMAT_BY_TYPE[p.type] ?? FORMAT_BY_TYPE.default;
  const faq = FAQ_STUB;

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
            </aside>
          </div>
        </Container>
      </section>

      {/* Тело */}
      <Container className="grid gap-7 sm:gap-12 py-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex flex-col gap-8 sm:gap-14">
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
                AI
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-medium text-ink">ИИ-акулёнок · наставник TerenLabs</div>
                <div className="mt-0.5 text-[14px] text-text-2">Считает, а не мотивирует — отвечает по базе знаний</div>
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
