import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { LEVELS, RANK_IMG } from "@/lib/content";

export const metadata = { title: "Уровни «Океан» — TerenLabs" };

export default function LevelsPage() {
  return (
    <div className="py-14">
      <Container>
        <SectionHeading
          eyebrow="Путь"
          title="Уровни «Океан»"
          desc="От мелководья к открытому океану. Каждый уровень — модули, тесты, кейсы и обзоры. Проходятся по порядку."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LEVELS.map((l) => (
            <Link
              key={l.key}
              href={`/levels/${l.key}`}
              className="group rounded-[var(--radius-tl)] border border-line bg-card p-6 transition-all hover:-translate-y-1 hover:border-teal/40 hover:shadow-[var(--shadow-tl)]"
            >
              <div className="flex items-center justify-between">
                <img src={RANK_IMG[l.key]} alt={l.name} className="h-20 w-20 object-contain" />
                {l.locked && <span className="rounded-full bg-line px-2.5 py-0.5 text-[0.7rem] text-muted">закрыт</span>}
              </div>
              <h3 className="mt-4 text-xl text-heading">{l.name}</h3>
              <p className="mt-1 num text-xs text-muted">{l.tag}{l.archetype ? ` · ${l.archetype}` : ""}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{l.tagline}</p>
              {!l.locked && (
                <p className="num mt-4 text-xs text-muted">
                  {l.modules.length} модулей · {l.testSlugs.length} теста · {l.caseSlugs.length + l.reviewSlugs.length} материалов
                </p>
              )}
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
