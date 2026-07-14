import Link from "next/link";
import { CatalogItem } from "@/lib/content";
import lessons from "@/content/case-lessons.json";

// Карточка кейса — данные как в витрине Mini App (#cases-list):
// цвет-тэг Красный/Жёлтый/Зелёный, гео-флаг, короткий заголовок с em-акцентом
// и выжимка. Дизайн «досье» (корешок, тон) — сайтовый; спрятанный урок на hover.

type Lesson = { label: string; text: string };
const LESSONS = lessons as Record<string, Lesson>;

type Tone = { label: string; color: string; edge: string; tint: string; fieldHover: string };

const TONES: Record<"r" | "y" | "g", Tone> = {
  r: { label: "Красный", color: "#FF4D4D", edge: "#FF4D4D", tint: "rgba(255,77,77,0.08)", fieldHover: "rgba(255,77,77,0.15)" },
  g: { label: "Зелёный", color: "#00E676", edge: "#00E676", tint: "rgba(0,230,118,0.08)", fieldHover: "rgba(0,230,118,0.15)" },
  y: { label: "Жёлтый", color: "#FFD600", edge: "#FFD600", tint: "rgba(255,214,0,0.08)", fieldHover: "rgba(255,214,0,0.15)" },
};

// цвет исхода: тэг витрины Mini App — канон; бейдж кейса — фолбэк
export function caseTag(p: { tag?: "r" | "y" | "g" | null; badge?: string }): "r" | "y" | "g" {
  if (p.tag) return p.tag;
  if (p.badge === "Провал") return "r";
  if (p.badge === "Успех") return "g";
  return "y";
}

export function CaseCard({ p }: { p: CatalogItem }) {
  const tone = TONES[caseTag(p)];
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
        {/* шапка — как в Mini App: цвет-тэг слева · гео-флаг справа */}
        <div className="mb-4 flex items-center justify-between">
          <span
            className="num text-[0.7rem] font-bold uppercase tracking-[0.14em]"
            style={{ color: tone.color }}
          >
            {tone.label}
          </span>
          {p.loc && (
            <span className="num text-[0.72rem] font-medium tracking-[0.06em] text-muted/75">
              {p.loc}
            </span>
          )}
        </div>

        {/* заголовок витрины Mini App — с em-акцентом */}
        {p.titleHtml ? (
          <h3
            className="case-title-em line-clamp-3 text-[1.35rem] font-semibold leading-[1.16] text-heading"
            dangerouslySetInnerHTML={{ __html: p.titleHtml }}
          />
        ) : (
          <h3 className="line-clamp-3 text-[1.35rem] font-semibold leading-[1.16] text-heading">
            {p.title}
          </h3>
        )}

        {/* выжимка кейса — из витрины Mini App */}
        {p.blurb && (
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted">{p.blurb}</p>
        )}

        <div className="flex-1" />

        {/* подвал: стрелка разбора */}
        <div className="case-foot mt-5 flex items-center justify-end border-t border-line/70 pt-3.5 transition-opacity duration-300 group-hover:opacity-0">
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
