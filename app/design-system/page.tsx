import Link from "next/link";
import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";
import { RankSketch, RankMark, RankTag } from "@/components/RankSketch";
import { OCEAN_RANKS } from "@/lib/content";
import type { LevelKey } from "@/lib/content";

// Служебная страница: живой справочник системы для нас, поисковикам не нужна.
// Всё, что здесь показано, берётся из globals.css и components/, а не рисуется отдельно:
// если справочник расходится с сайтом, значит, сломан сайт.
export const metadata = { title: "Дизайн-система — TerenLabs", robots: { index: false, follow: false } };

const NEUTRALS = [
  { name: "page", v: "#191919", use: "фон страницы", cls: "bg-page" },
  { name: "subtle", v: "#202020", use: "подложка секций, панели", cls: "bg-subtle" },
  { name: "card", v: "#212121", use: "карточки", cls: "bg-card" },
  { name: "card-2 / hover", v: "#2a2a2a", use: "наведение", cls: "bg-card-2" },
  { name: "line", v: "#303030", use: "разделители", cls: "bg-line" },
  { name: "line-2", v: "#454545", use: "рамки контролов", cls: "bg-line-2" },
];

const TEXT = [
  { name: "ink", v: "#ffffff", use: "заголовки, сильный текст, эскизы", cls: "text-ink" },
  { name: "body", v: "#e0e0e0", use: "основной текст", cls: "text-body" },
  { name: "text-2", v: "#a6a6a6", use: "вторичный текст", cls: "text-text-2" },
  { name: "faint", v: "#808080", use: "подписи, плейсхолдеры, .eyebrow", cls: "text-faint" },
];

const ACCENTS = [
  { name: "accent", v: "#529cca", use: "ссылки .link, text-accent", cls: "bg-accent" },
  { name: "accent-600", v: "#2383e2", use: "кнопка Button primary", cls: "bg-accent-600" },
  { name: "accent-100", v: "#28456c", use: "подложка .tag-blue", cls: "bg-accent-100" },
  { name: "orange", v: "#f0873a", use: "«ты здесь», точка текущего, выделение", cls: "bg-orange" },
  { name: "orange-100", v: "#4a2a10", use: "подложка .tag-orange", cls: "bg-orange-100" },
  { name: "danger", v: "#ff7369", use: "только минусы и ошибки", cls: "bg-danger" },
];

const TYPE_SCALE: [string, string, string][] = [
  ["h1 главной", "text-[40px] sm:text-[56px] lg:text-[64px]", "Единственная платформа обучения бизнесу"],
  ["h1 раздела", "text-[24px] sm:text-[38px]", "Уровни"],
  ["h2 секции", "text-[22px] sm:text-[24px]", "Учим бизнесу целиком"],
  ["h2 блока", "text-[24px]", "Как считается место"],
  ["h3 строки", "text-[16px]", "Ramp-up"],
  ["Лид", "text-[15px] sm:text-[16px] text-text-2", "Говорим о рисках и реальности, а не про успешный успех."],
  ["Текст", "text-[14px] text-text-2", "Выручка приходит не с первого дня. Нужен запас на 4-5 месяцев."],
  ["Подпись", "text-[13px] text-faint", "10 вопросов из пула · порог 7 из 10"],
];

const FIELD =
  "h-10 w-full rounded-[8px] border border-line-2 bg-page px-3 text-[16px] text-ink placeholder:text-faint";

const DONTS = [
  "Тени, свечения, градиенты, blur и стекло.",
  "Пилюли: rounded-full только у аватаров и точек 6px.",
  "Анимации плавания, покачивания, появления с движением.",
  "Эмодзи в интерфейсе и картинки персонажей /brand/ranks/*.webp. Персонажи только через RankSketch.",
  "Третий цвет. Акцентов два: синий для действий, оранжевый для «ты здесь». Красный только для минусов и ошибок.",
  "Сетка карточек для однородных списков. Однородное идёт строками с border-t border-line.",
  "Старые токены teal, navy, foam, heading, muted, deck, deep, hero-ocean в новых файлах.",
];

export default function DesignSystem() {
  return (
    <>
      <Container className="py-14 sm:py-20">
        <p className="eyebrow">Дизайн-система · служебная</p>
        <h1 className="mt-3 text-[24px] sm:text-[38px]">Справочник системы</h1>
        <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">
          Ориентир: интерфейс Notion в тёмной теме. Один шрифт, две акцентных краски, радиусы 6 и 8 px,
          линии вместо теней. Всё на этой странице собрано из живых классов и компонентов.
        </p>
        <p className="num mt-4 text-[13px] text-faint">
          Источники: app/globals.css · components/Button.tsx · components/RankSketch.tsx
        </p>
      </Container>

      {/* ---------- Палитра ---------- */}
      <Section title="Палитра" hint="Токены из @theme в globals.css. Классы: bg-*, text-*, border-*.">
        <Swatches title="Нейтрали" items={NEUTRALS} />
        <div className="mt-8">
          <p className="eyebrow">Текст</p>
          <div className="mt-3">
            {TEXT.map((t) => (
              <div key={t.name} className="grid gap-1 border-t border-line py-3 sm:grid-cols-[160px_100px_minmax(0,1fr)] sm:gap-6 sm:items-baseline">
                <span className={`num text-[14px] font-medium ${t.cls}`}>{t.name}</span>
                <span className="num text-[13px] text-faint">{t.v}</span>
                <span className={`text-[15px] ${t.cls}`}>{t.use}</span>
              </div>
            ))}
            <div className="border-t border-line" />
          </div>
        </div>
        <Swatches title="Акценты" items={ACCENTS} className="mt-8" />
      </Section>

      {/* ---------- Шрифт ---------- */}
      <Section title="Шрифт" hint="Inter через --font-inter, веса 400 / 500 / 600. Цифры в .num (табличные). Капс только в .eyebrow.">
        <div>
          {TYPE_SCALE.map(([label, cls, sample]) => (
            <div key={label} className="grid gap-2 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-baseline">
              <span className="num text-[13px] text-faint">{label}</span>
              <div className="min-w-0">
                <p className={`${cls} ${cls.includes("text-text-2") || cls.includes("text-faint") ? "" : "font-semibold text-ink"} leading-tight`}>
                  {sample}
                </p>
                <p className="num mt-1 text-[12px] text-faint">{cls}</p>
              </div>
            </div>
          ))}
          <div className="grid gap-2 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-baseline">
            <span className="num text-[13px] text-faint">Цифры .num</span>
            <div>
              <p className="num text-[24px] font-semibold text-ink">2 400 ₸ · 45 % · <span className="text-orange">−1,4 млн ₸</span></p>
              <p className="num mt-1 text-[12px] text-faint">font-variant-numeric: tabular-nums · минус оранжевым в модели, красным в ошибке</p>
            </div>
          </div>
          <div className="grid gap-2 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-baseline">
            <span className="num text-[13px] text-faint">.eyebrow</span>
            <div>
              <p className="eyebrow">Океан · система уровней</p>
              <p className="num mt-1 text-[12px] text-faint">12px · 500 · letter-spacing 0.08em · text-faint</p>
            </div>
          </div>
          <div className="grid gap-2 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-baseline">
            <span className="num text-[13px] text-faint">Казахские буквы</span>
            <p className="text-[16px] text-ink">әғқңөұүһі · ӘҒҚҢӨҰҮҺІ</p>
          </div>
          <div className="border-t border-line" />
        </div>
      </Section>

      {/* ---------- Кнопки ---------- */}
      <Section title="Кнопки" hint="components/Button.tsx. Радиус 6px, без теней. Высоты 32 / 40 / 48. На мобильном не ниже 40.">
        <div>
          {(["primary", "secondary", "ghost"] as const).map((v) => (
            <div key={v} className="grid gap-3 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-center">
              <span className="num text-[13px] text-faint">{v}</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button href="#" variant={v} size="sm">Кнопка sm</Button>
                <Button href="#" variant={v} size="md">Кнопка md</Button>
                <Button href="#" variant={v} size="lg">Кнопка lg <Arrow /></Button>
              </div>
            </div>
          ))}
          <div className="grid gap-3 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-center">
            <span className="num text-[13px] text-faint">disabled</span>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" disabled className="btn-press inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-accent-600 px-4 text-[15px] font-medium text-[#fff] disabled:opacity-50">
                Отправляю…
              </button>
              <span className="text-[13px] text-faint">&lt;button&gt; с классами Button, если нужен onClick</span>
            </div>
          </div>
          <div className="grid gap-3 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-center">
            <span className="num text-[13px] text-faint">.link</span>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="#" className="link text-[15px]">Открыть демо <Arrow /></Link>
              <Link href="#" className="link text-[14px]">Весь рейтинг <Arrow /></Link>
              <span className="text-[14px] text-text-2">
                в тексте: <a href="#" className="text-accent hover:underline">terenlabs.kz</a>
              </span>
            </div>
          </div>
          <div className="border-t border-line" />
        </div>
      </Section>

      {/* ---------- Ярлыки ---------- */}
      <Section title="Ярлыки" hint="Высота 20px, радиус 3px, 12px текст. Серый по умолчанию, синий и оранжевый как исключение.">
        <div>
          <div className="grid gap-3 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-center">
            <span className="num text-[13px] text-faint">.tag</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="tag">Бесплатно</span>
              <span className="tag">скоро</span>
              <span className="tag">лонгрид</span>
            </div>
          </div>
          <div className="grid gap-3 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-center">
            <span className="num text-[13px] text-faint">.tag-blue</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="tag tag-blue">Сдано</span>
              <span className="tag tag-blue">Открыт</span>
            </div>
          </div>
          <div className="grid gap-3 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-center">
            <span className="num text-[13px] text-faint">.tag-orange</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="tag tag-orange">Ты здесь</span>
              <span className="tag tag-orange">Текущий</span>
              <span className="inline-flex items-center gap-2 text-[14px] text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden="true" />
                точка текущего 6px
              </span>
            </div>
          </div>
          <div className="grid gap-3 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-center">
            <span className="num text-[13px] text-faint">Исход кейса</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="tag" style={{ background: "var(--color-tag-red)", color: "var(--color-tag-red-ink)" }}>Провал</span>
              <span className="tag" style={{ background: "var(--color-tag-green)", color: "var(--color-tag-green-ink)" }}>Успех</span>
              <span className="tag" style={{ background: "var(--color-tag-yellow)", color: "var(--color-tag-yellow-ink)" }}>Спорно</span>
            </div>
          </div>
          <div className="grid gap-3 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-center">
            <span className="num text-[13px] text-faint">RankTag</span>
            <div className="flex flex-wrap items-center gap-2">
              {OCEAN_RANKS.map((r) => (
                <RankTag key={r.key} rank={r.key as LevelKey} />
              ))}
            </div>
          </div>
          <div className="border-t border-line" />
        </div>
      </Section>

      {/* ---------- Эскизы ---------- */}
      <Section title="Эскизы уровней" hint="components/RankSketch.tsx: один штрих 1.6, без заливки, цвет из currentColor. Картинки персонажей не используем.">
        <div className="grid grid-cols-3 gap-y-8 sm:grid-cols-6">
          {OCEAN_RANKS.map((r, i) => (
            <div
              key={r.key}
              className={`flex flex-col gap-3 py-1 pl-4 sm:border-l sm:border-line ${i === 0 ? "sm:border-l-0 sm:pl-0" : ""}`}
            >
              <RankSketch rank={r.key as LevelKey} size={56} className="text-ink" title={r.name} />
              <div>
                <div className="text-[15px] font-medium text-ink">{r.name}</div>
                <div className="text-[13px] text-text-2">{r.meaning}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <div className="grid gap-3 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-center">
            <span className="num text-[13px] text-faint">size 40</span>
            <div className="flex flex-wrap items-center gap-5 text-ink">
              {OCEAN_RANKS.map((r) => <RankSketch key={r.key} rank={r.key as LevelKey} size={40} />)}
            </div>
          </div>
          <div className="grid gap-3 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-center">
            <span className="num text-[13px] text-faint">RankMark 26</span>
            <div className="flex flex-wrap items-center gap-4">
              {OCEAN_RANKS.map((r) => <RankMark key={r.key} rank={r.key as LevelKey} />)}
            </div>
          </div>
          <div className="grid gap-3 border-t border-line py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:items-center">
            <span className="num text-[13px] text-faint">В тексте 22</span>
            <div className="flex flex-wrap items-center gap-4 text-text-2">
              {OCEAN_RANKS.map((r) => <RankSketch key={r.key} rank={r.key as LevelKey} size={22} />)}
              <span className="text-[13px]">наследует text-text-2</span>
            </div>
          </div>
          <div className="border-t border-line" />
        </div>
      </Section>

      {/* ---------- Строки и карточки ---------- */}
      <Section title="Строки" hint="Однородные вещи идут строками: border-t border-line, сетка колонок на sm, одна колонка на телефоне.">
        <div className="hidden grid-cols-[72px_56px_minmax(0,1fr)_140px] gap-6 pb-2 text-[12px] uppercase tracking-[0.08em] text-faint sm:grid">
          <span />
          <span>Уровень</span>
          <span>Статус</span>
        </div>
        {OCEAN_RANKS.slice(0, 3).map((r, i) => (
          <div key={r.key} className="grid gap-4 border-t border-line py-5 sm:grid-cols-[72px_56px_minmax(0,1fr)_140px] sm:items-center sm:gap-6">
            <RankSketch rank={r.key as LevelKey} size={56} className="text-ink" title={r.name} />
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h3 className="text-[20px]">{r.name}</h3>
                {i === 1 ? <span className="tag tag-orange">Ты здесь</span> : i === 0 ? <span className="tag tag-blue">Сдано</span> : <span className="tag">Закрыт</span>}
              </div>
              <p className="max-w-[60ch] text-[15px] leading-relaxed text-text-2">{r.meaning}. Ранг растёт за понимание, его нельзя накликать.</p>
            </div>
            <div className="flex sm:justify-end">
              <Link href="#" className="link text-[15px]">Открыть <Arrow /></Link>
            </div>
          </div>
        ))}
        <div className="border-t border-line" />

        <div className="mt-6 sm:mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div>
            <p className="eyebrow">Пара «ключ · значение»</p>
            <div className="mt-3 max-w-[460px]">
              {[["Средний чек", "2 400 ₸"], ["Загрузка зала", "45 %"], ["Точка безубыточности", "118 чеков"]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-t border-line py-3 text-[15px]">
                  <span className="text-text-2">{k}</span>
                  <span className="num font-medium text-ink">{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-y border-line py-3 text-[15px]">
                <span className="font-medium text-ink">Прогноз прибыли</span>
                <span className="num font-medium text-orange">−1,4 млн ₸ / год</span>
              </div>
            </div>
          </div>
          <div>
            <p className="eyebrow">Панель и карточка</p>
            <div className="mt-3 rounded-[8px] border border-line bg-subtle p-5">
              <p className="eyebrow">Манифест</p>
              <p className="mt-3 text-[16px] font-semibold leading-snug text-ink">Панель: rounded-[8px] border-line bg-subtle</p>
              <p className="mt-2 text-[14px] leading-relaxed text-text-2">Для боковых колонок, форм, цитат. Без наведения.</p>
            </div>
            <Link href="#" className="card-premium mt-4 flex flex-col p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="eyebrow">Кейсы</span>
                <span className="tag">Бесплатно</span>
              </div>
              <h3 className="mt-3 text-[16px] leading-snug">Карточка .card-premium</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-text-2">Только там, где есть обложка или отдельный объект. Наведение: рамка line-2, фон card-2.</p>
            </Link>
          </div>
        </div>
      </Section>

      {/* ---------- Формы ---------- */}
      <Section title="Формы" hint="Контролы 40px, текст 16px (мобильный Safari не зумит), bg-page, border-line-2, радиус 6. Фокус из :focus-visible в globals, ring не добавлять.">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-[14px] font-medium text-body">Имя в рейтинге</span>
            <input className={`mt-2 ${FIELD}`} placeholder="Как тебя показывать в таблице" />
          </label>
          <label className="block">
            <span className="text-[14px] font-medium text-body">Область</span>
            <select className={`mt-2 ${FIELD}`} defaultValue="">
              <option value="">— укажу позже —</option>
              <option>Западно-Казахстанская</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[14px] font-medium text-body">Сообщение</span>
            <textarea rows={3} className="mt-2 w-full rounded-[8px] border border-line-2 bg-page px-3 py-2.5 text-[16px] leading-relaxed text-ink placeholder:text-faint" placeholder="Что улучшить, чего не хватает…" />
          </label>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button type="button" className="btn-press inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-accent-600 px-4 text-[15px] font-medium text-[#fff] transition-colors duration-150 hover:bg-[#1b6fc2]">
              Отправить
            </button>
            <p className="text-[14px] text-danger">Не удалось отправить. Проверьте соединение.</p>
          </div>
        </div>
      </Section>

      {/* ---------- Чего нет ---------- */}
      <Section title="Чего в системе нет" hint="Список запретов, чтобы не спорить в код-ревью.">
        <div className="max-w-[72ch]">
          {DONTS.map((d, i) => (
            <div key={d} className="grid gap-1 border-t border-line py-3 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-6">
              <span className="num text-[13px] text-faint">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-[15px] leading-relaxed text-body">{d}</p>
            </div>
          ))}
          <div className="border-t border-line" />
        </div>
      </Section>
    </>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line">
      <Container className="py-8 sm:py-14">
        <h2 className="text-[24px]">{title}</h2>
        {hint && <p className="mt-2 max-w-[72ch] text-[15px] leading-relaxed text-text-2">{hint}</p>}
        <div className="mt-8">{children}</div>
      </Container>
    </section>
  );
}

function Swatches({
  title,
  items,
  className = "",
}: {
  title: string;
  items: { name: string; v: string; use: string; cls: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="eyebrow">{title}</p>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((c) => (
          <div key={c.name} className="overflow-hidden rounded-[8px] border border-line">
            <div className={`h-16 ${c.cls}`} />
            <div className="border-t border-line p-3">
              <div className="num text-[14px] font-medium text-ink">{c.name}</div>
              <div className="num text-[12px] text-faint">{c.v}</div>
              <div className="mt-1 text-[12px] leading-snug text-text-2">{c.use}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
