import Link from "next/link";
import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { CATALOG, OCEAN_RANKS } from "@/lib/content";

export const metadata = { title: "Личный кабинет — TerenLabs" };

const IN_PROGRESS = [
  { slug: "course-finance-base", title: "Финансы для основателя", progress: 40 },
  { slug: "course-analytics", title: "Аналитика для решений", progress: 12 },
];

const CERTIFICATES = [
  { title: "Юнит-экономика", rank: "Барракуда", date: "май 2026" },
];

const SAVED_FINMODELS = [
  { slug: "finmodel-cafe", title: "Финмодель кофейни", note: "−1.4 млн ₸/год при загрузке 45%" },
];

export default function Dashboard() {
  const rank = OCEAN_RANKS[2]; // Барракуда — заглушка текущего ранга
  const recommendations = CATALOG.filter((p) => !p.stub).slice(0, 3);

  return (
    <div className="py-14">
      <Container>
        {/* Шапка кабинета */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="eyebrow">Личный кабинет</p>
            <h1 className="mt-2 text-4xl text-heading">Привет, основатель</h1>
            <p className="mt-2 text-muted">Что делаем сегодня — учимся, проверяем или применяем?</p>
          </div>
          <div className="flex items-center gap-4 rounded-[var(--radius-tl)] border border-line bg-card p-4">
            <img src={rank.img} alt={rank.name} className="h-20 w-20 object-contain" />
            <div>
              <div className="text-xs text-muted">Твой ранг</div>
              <div className="text-lg text-heading">{rank.name}</div>
              <div className="text-xs text-muted">{rank.meaning}</div>
            </div>
          </div>
        </div>

        {/* Метрики */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Metric value="2" label="продукта в процессе" />
          <Metric value="84%" label="средний балл тестов" />
          <Metric value="1" label="сертификат" />
        </div>

        {/* Продолжить обучение */}
        <Section title="Продолжить обучение">
          <div className="grid gap-4 sm:grid-cols-2">
            {IN_PROGRESS.map((c) => (
              <Link
                key={c.slug}
                href={`/learn/${c.slug}`}
                className="group rounded-[var(--radius-tl)] border border-line bg-card p-6 transition-all hover:-translate-y-1 hover:border-teal/40 hover:shadow-[var(--shadow-tl)]"
              >
                <h3 className="text-lg text-heading">{c.title}</h3>
                <div className="mt-4 flex items-center justify-between text-xs text-muted">
                  <span>Прогресс</span>
                  <span className="num">{c.progress}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-teal" style={{ width: `${c.progress}%` }} />
                </div>
                <span className="mt-4 inline-block text-sm font-medium text-teal-600 group-hover:translate-x-1">
                  Продолжить →
                </span>
              </Link>
            ))}
          </div>
        </Section>

        {/* Сертификаты + Финмодели */}
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl text-heading">Сертификаты</h2>
            <div className="wave-divider my-5" />
            {CERTIFICATES.map((c) => (
              <div key={c.title} className="flex items-center justify-between rounded-[var(--radius-tl)] border border-line bg-card p-5">
                <div>
                  <div className="text-heading">{c.title}</div>
                  <div className="text-xs text-muted">Ранг {c.rank} · {c.date}</div>
                </div>
                <button className="rounded-[var(--radius-tl)] border border-line px-3 py-1.5 text-sm text-heading hover:border-teal hover:text-teal">
                  Поделиться
                </button>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-2xl text-heading">Мои финмодели</h2>
            <div className="wave-divider my-5" />
            {SAVED_FINMODELS.map((f) => (
              <Link
                key={f.slug}
                href={`/finmodels/${f.slug}`}
                className="block rounded-[var(--radius-tl)] border border-line bg-card p-5 transition-colors hover:border-teal/40"
              >
                <div className="text-heading">{f.title}</div>
                <div className="num mt-1 text-xs text-danger">{f.note}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Рекомендации */}
        <Section title="Рекомендуем дальше">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((p) => (
              <ProductCard key={`${p.type}-${p.slug}`} p={p} />
            ))}
          </div>
        </Section>
      </Container>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[var(--radius-tl)] border border-line bg-card p-5">
      <div className="num text-3xl font-medium text-heading">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="text-2xl text-heading">{title}</h2>
      <div className="wave-divider my-5" />
      {children}
    </section>
  );
}
