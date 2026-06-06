import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { OCEAN_RANKS } from "@/lib/content";

export const metadata = { title: "Дизайн-система — TerenLabs" };

const CORE = [
  { name: "Ink", v: "#0A0A0A", var: "ink" },
  { name: "Navy (якорь)", v: "#0D2B45", var: "navy" },
  { name: "Navy 900", v: "#081B2E", var: "navy-900" },
  { name: "Navy 500", v: "#1A4763", var: "navy-500" },
  { name: "Teal (акцент)", v: "#00B7C2", var: "teal" },
  { name: "Teal 600", v: "#009BA6", var: "teal-600" },
  { name: "Teal 200", v: "#B3EEF1", var: "teal-200" },
  { name: "Light", v: "#F5F7FA", var: "light" },
  { name: "Muted", v: "#5B6B78", var: "muted" },
  { name: "Warn", v: "#C77D2A", var: "warn" },
  { name: "Danger", v: "#B4452F", var: "danger" },
];

export default function DesignSystem() {
  return (
    <div className="py-16">
      <Container>
        <p className="eyebrow">Design System v1.0</p>
        <h1 className="mt-3 text-4xl">TerenLabs — дизайн-система</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Источник правды: брендбук. Навы — якорь, бирюза — акцент. Заголовки
          Playfair Display, текст Source Sans 3, цифры JetBrains Mono.
        </p>

        {/* Цвета */}
        <Block title="Цвет — ядро бренда">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {CORE.map((c) => (
              <div key={c.var} className="rounded-[var(--radius-tl)] border border-line overflow-hidden">
                <div className="h-20" style={{ background: c.v }} />
                <div className="p-3">
                  <div className="text-sm font-medium text-heading">{c.name}</div>
                  <div className="num text-xs text-muted">{c.v}</div>
                </div>
              </div>
            ))}
          </div>
        </Block>

        {/* Ранги */}
        <Block title="Палитра уровней «Океан»">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {OCEAN_RANKS.map((r) => (
              <div key={r.key} className="text-center">
                <img src={r.img} alt={r.name} className="mx-auto h-20 w-20 object-contain" />
                <div className="mt-2 text-sm text-heading">{r.name}</div>
                <div className="text-xs text-muted">{r.meaning}</div>
              </div>
            ))}
          </div>
        </Block>

        {/* Типографика */}
        <Block title="Типографика">
          <div className="space-y-6">
            <div>
              <span className="eyebrow">Display · Playfair Display</span>
              <p className="text-5xl text-heading" style={{ fontFamily: "var(--font-display)" }}>
                Глубина анализа
              </p>
            </div>
            <div>
              <span className="eyebrow">Text · Source Sans 3</span>
              <p className="max-w-2xl text-lg text-body">
                Практичный консультант-наставник. Прямо, с числами, без воды и
                восклицательных знаков. Поддержка казахских букв: әғқңөұүһі.
              </p>
            </div>
            <div>
              <span className="eyebrow">Mono · JetBrains Mono</span>
              <p className="num text-2xl text-heading">2 400 ₸ · 45% · −1.4 млн ₸</p>
            </div>
          </div>
        </Block>

        {/* Кнопки */}
        <Block title="Кнопки">
          <div className="flex flex-wrap items-center gap-4">
            <Button href="#">Primary</Button>
            <Button href="#" variant="secondary">Secondary</Button>
            <div className="rounded-[var(--radius-tl)] bg-navy p-3">
              <Button href="#" variant="ghost">Ghost (на тёмном)</Button>
            </div>
          </div>
        </Block>

        {/* Радиусы / тени */}
        <Block title="Радиусы и тени">
          <div className="flex flex-wrap gap-6">
            <div className="rounded-[var(--radius-tl)] border border-line bg-card p-6 shadow-[var(--shadow-tl-sm)]">
              shadow-sm
            </div>
            <div className="rounded-[var(--radius-tl)] border border-line bg-card p-6 shadow-[var(--shadow-tl)]">
              shadow
            </div>
          </div>
        </Block>
      </Container>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="text-2xl text-heading">{title}</h2>
      <div className="wave-divider my-5" />
      {children}
    </section>
  );
}
