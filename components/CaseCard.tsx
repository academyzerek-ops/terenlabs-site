import Link from "next/link";
import { CatalogItem } from "@/lib/content";
import lessons from "@/content/case-lessons.json";

// Карточка кейса как «досье»: вердикт исхода + крафтовый заголовок-история
// (сумма уже вшита в него), а спрятанный урок выезжает на hover.
// blurb у кейса — мета-строка «авторский · Уральск · 19 млн ₸».

type Lesson = { label: string; text: string };
const LESSONS = lessons as Record<string, Lesson>;

type Tone = { label: string; color: string; edge: string; tint: string; fieldHover: string };

function toneOf(badge?: string): Tone {
  if (badge === "Провал")
    return {
      label: "КРАСНЫЙ",
      color: "#FF4D4D", // Vivid Red
      edge: "#FF4D4D",
      tint: "rgba(255,77,77,0.08)",
      fieldHover: "rgba(255,77,77,0.15)",
    };
  if (badge === "Успех")
    return {
      label: "ЗЕЛЕНЫЙ",
      color: "#00E676", // Vivid Green
      edge: "#00E676",
      tint: "rgba(0,230,118,0.08)",
      fieldHover: "rgba(0,230,118,0.15)",
    };
  return {
    label: "ЖЕЛТЫЙ",
    color: "#FFD600", // Vivid Yellow
    edge: "#FFD600",
    tint: "rgba(255,214,0,0.08)",
    fieldHover: "rgba(255,214,0,0.15)",
  };
}

// денежная часть мета-строки (₸/$/млн/тыс/%); остальное — источник + город
const MONEY_RE = /(₸|\$|млн|тыс|%)/i;
function splitMeta(blurb: string) {
  const parts = blurb.split("·").map((s) => s.trim()).filter(Boolean);
  const moneyIdx = parts.findIndex((p) => MONEY_RE.test(p));
  const money = moneyIdx >= 0 ? parts[moneyIdx] : null;
  const context = parts.filter((_, i) => i !== moneyIdx);
  return { money, context };
}

export function CaseCard({ p }: { p: CatalogItem }) {
  const tone = toneOf(p.badge);
  const { money, context } = splitMeta(p.blurb);
  const place = context.length > 1 ? context[context.length - 1] : context[0] ?? null;
  const lesson = LESSONS[p.slug] ?? null;

  return (
    <Link
      href={p.href}
      className="case-card group relative flex min-h-[260px] flex-col overflow-hidden rounded-[var(--radius-tl)] border border-line bg-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-[0_20px_44px_-24px_rgba(12,30,50,0.5)]"
      style={
        {
          "--field": tone.tint,
          "--field-hover": tone.fieldHover,
        } as React.CSSProperties
      }
    >
      {/* корешок досье — цветной по исходу, толстеет на hover */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px] transition-all duration-500 group-hover:w-[6px]"
        style={{ background: tone.edge }}
      />

      <div className="flex flex-1 flex-col p-6 pl-7">
        {/* шапка: эмодзи-ниша + вердикт (mono) · тема справа */}
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            {p.ico && (
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                style={{ background: tone.tint, boxShadow: `inset 0 0 0 1px ${tone.edge}40` }}
              >
                {p.ico}
              </span>
            )}
            <span
              className="num text-[0.7rem] font-bold uppercase tracking-[0.14em]"
              style={{ color: tone.color }}
            >
              {tone.label}
            </span>
          </span>
          {p.topic && (
            <span className="num text-[0.68rem] font-medium uppercase tracking-[0.1em] text-muted/65">
              {p.topic}
            </span>
          )}
        </div>

        {/* заголовок-история (Playfair, сумма уже вшита) */}
        <h3 className="line-clamp-3 text-[1.35rem] font-semibold leading-[1.16] text-heading">
          {p.title}
        </h3>

        <div className="flex-1" />

        {/* подвал по умолчанию: город + сумма-леджер · стрелка */}
        <div className="case-foot mt-5 flex items-center justify-between border-t border-line/70 pt-3.5 transition-opacity duration-300 group-hover:opacity-0">
          <span className="num text-xs text-muted">
            {[place, money].filter(Boolean).join("  ·  ") || "Кейс"}
          </span>
          <span
            className="flex items-center gap-1.5 text-[13px] font-semibold transition-transform group-hover:translate-x-1"
            style={{ color: tone.color }}
          >
            Разбор<span className="text-base leading-none">→</span>
          </span>
        </div>
      </div>

      {/* урок — непрозрачный оверлей на всю карточку: hover «переворачивает»
          заголовок в смысл, без просвечивания текста под ним */}
      {lesson && (
        <div
          aria-hidden="true"
          className="case-lesson pointer-events-none absolute inset-0 flex flex-col p-6 pl-7 opacity-0 transition-opacity duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-100"
          style={{
            backgroundColor: "var(--color-card)",
            backgroundImage: `linear-gradient(0deg, var(--field-hover), var(--field-hover))`,
          }}
        >
          {/* вердикт сверху — та же опора, что и на лице карточки */}
          <span
            className="num text-[0.7rem] font-bold uppercase tracking-[0.14em]"
            style={{ color: tone.color }}
          >
            {tone.label}
          </span>

          <div className="flex flex-1 flex-col justify-center">
            <span
              className="num block text-[0.66rem] font-bold uppercase tracking-[0.14em]"
              style={{ color: tone.color }}
            >
              {lesson.label}
            </span>
            <p className="mt-2 text-[15.5px] font-medium leading-snug text-heading">
              {lesson.text}
            </p>
          </div>

          <span
            className="num text-[12px] font-semibold"
            style={{ color: tone.color }}
          >
            Читать разбор →
          </span>
        </div>
      )}
    </Link>
  );
}
