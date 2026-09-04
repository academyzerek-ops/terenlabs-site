import Link from "next/link";
import { CatalogItem } from "@/lib/content";
import lessons from "@/content/case-lessons.json";
import { Arrow } from "./Button";

// Карточка кейса — данные как в витрине Mini App (#cases-list):
// цвет-тэг Красный/Жёлтый/Зелёный, гео-флаг, короткий заголовок с em-акцентом
// и выжимка. Урок кейса показан сразу, под линией, без hover-переворота.

type Lesson = { label: string; text: string };
const LESSONS = lessons as Record<string, Lesson>;

// Исход → ярлык Notion dark (фон / текст), как у ProductCard
type Tone = { label: string; bg: string; ink: string };

const TONES: Record<"r" | "y" | "g", Tone> = {
  r: { label: "Красный", bg: "var(--color-tag-red)", ink: "var(--color-tag-red-ink)" },
  g: { label: "Зелёный", bg: "var(--color-tag-green)", ink: "var(--color-tag-green-ink)" },
  y: { label: "Жёлтый", bg: "var(--color-tag-yellow)", ink: "var(--color-tag-yellow-ink)" },
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
    <Link href={p.href} className="card-premium group flex min-h-[240px] flex-col overflow-hidden">
      <div className="flex flex-1 flex-col p-5">
        {/* шапка — как в Mini App: ярлык исхода слева · гео справа */}
        <div className="flex items-center justify-between gap-3">
          <span className="tag" style={{ background: tone.bg, color: tone.ink }}>
            {tone.label}
          </span>
          {p.loc && <span className="num text-[12px] text-faint">{p.loc}</span>}
        </div>

        {/* заголовок витрины Mini App — с em-акцентом (оранжевый) */}
        {p.titleHtml ? (
          <h3
            className="case-title-em mt-4 line-clamp-3 text-[18px] leading-snug [&_.em]:text-orange [&_.o]:text-orange"
            dangerouslySetInnerHTML={{ __html: p.titleHtml }}
          />
        ) : (
          <h3 className="mt-4 line-clamp-3 text-[18px] leading-snug">{p.title}</h3>
        )}

        {/* выжимка кейса — из витрины Mini App */}
        {p.blurb && (
          <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-text-2">{p.blurb}</p>
        )}

        <div className="flex-1" />

        {/* урок кейса: метка и вывод */}
        {lesson && (
          <div className="mt-5 border-t border-line pt-3">
            <span className="eyebrow">{lesson.label}</span>
            <p className="mt-1.5 line-clamp-3 text-[14px] leading-relaxed text-body">{lesson.text}</p>
          </div>
        )}

        {/* подвал: ссылка на разбор */}
        <div className="mt-4 flex items-center justify-end border-t border-line pt-3">
          <span className="link text-[14px]">
            Разбор <Arrow />
          </span>
        </div>
      </div>
    </Link>
  );
}
