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
  { q: "На каком языке материал?", a: "Русский и казахский. Переключатель языка — в шапке." },
  { q: "Есть ли возврат?", a: "Условия возврата указываются в оферте. Раздел дорабатывается." },
];

export function ProductPage({ p }: { p: Product }) {
  const t = PRODUCT_TYPES[p.type];

  // Куда ведёт основная кнопка в зависимости от типа продукта
  const cta =
    p.type === "test"
      ? { href: `/tests/${p.slug}/take`, label: "Пройти тест" }
      : p.type === "course"
      ? { href: `/learn/${p.slug}`, label: p.stub ? "Открыть демо обучения" : "Начать обучение" }
      : p.free
      ? { href: "/checkout", label: "Начать бесплатно" }
      : { href: "/checkout", label: "Получить доступ" };

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
                  Каркас: контент этого продукта готовится
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
              <div className="num mb-4 text-2xl text-teal">{p.price ?? "—"}</div>
              <Button href={cta.href} className="w-full">
                {cta.label}
              </Button>
              {!p.free && (
                <p className="mt-3 text-center text-xs text-foam/45">
                  Оплата: Kaspi · рассрочка · карта
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
                N
              </div>
              <div>
                <div className="text-heading">Ноа · наставник TerenLabs</div>
                <div className="text-sm text-muted">Практик, говорит числами</div>
              </div>
            </div>
          </Block>

          <Block title="Вопросы">
            <div className="divide-y divide-line rounded-[var(--radius-tl)] border border-line bg-card">
              {FAQ_STUB.map((f) => (
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
              <li>Личный кабинет + мобайл</li>
              <li>Прогресс и ранг «Океан»</li>
              <li>Языки: RU · KK</li>
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
