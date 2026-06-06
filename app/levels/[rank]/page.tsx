import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { ProductMissing } from "@/components/ProductMissing";
import { getLevel, levelItems, Level, RANK_IMG, plural } from "@/lib/content";
import { getTrack } from "@/lib/learn";

export default async function Page({ params }: { params: Promise<{ rank: string }> }) {
  const { rank } = await params;
  const lvl = getLevel(rank);
  if (!lvl) return <ProductMissing />;

  if (lvl.locked) {
    return (
      <>
        <LevelHero lvl={lvl} />
        <Container className="py-16 text-center">
          <div className="mx-auto max-w-md rounded-[var(--radius-tl)] border border-dashed border-line bg-card p-10">
            <p className="eyebrow">Уровень закрыт</p>
            <h2 className="mt-3 text-2xl text-heading">Откроется после предыдущего</h2>
            <p className="mt-3 text-sm text-muted">
              Уровни «Океан» проходятся по порядку — от Ракушки к Киту. Контент готовится.
            </p>
            <div className="mt-6">
              <Button href="/levels/rakushka">Начать с Ракушки</Button>
            </div>
          </div>
        </Container>
      </>
    );
  }

  const items = levelItems(lvl);

  return (
    <>
      <LevelHero lvl={lvl} />
      <Container className="space-y-14 py-16">
        <Block title="Модули уроков" count={lvl.modules.length}>
          <div className="grid gap-4 sm:grid-cols-2">
            {lvl.modules.map((m) => {
              const track = getTrack(m.id);
              return (
                <Card
                  key={m.id}
                  href={track ? `/courses/${m.id}` : undefined}
                  stub={!track}
                  title={m.title}
                  meta={
                    track
                      ? `${track.chapterTotal} ${plural(track.chapterTotal, "глава", "главы", "глав")}`
                      : "готовится"
                  }
                  cta={track ? "Открыть →" : undefined}
                />
              );
            })}
          </div>
        </Block>

        <Block title="Тесты уровня" count={items.tests.length}>
          <div className="grid gap-4 sm:grid-cols-3">
            {items.tests.map((t) => (
              <Card
                key={t.slug}
                href={t.stub ? undefined : t.href}
                stub={t.stub}
                title={t.title}
                meta={t.stub ? "скоро" : `${t.questions?.length ?? 0} вопросов`}
                cta={t.stub ? undefined : "Пройти →"}
              />
            ))}
          </div>
        </Block>

        <Block title="Кейсы" count={items.cases.length}>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.cases.map((c) => (
              <Card key={c.slug} href={c.stub ? undefined : c.href} stub={c.stub} title={c.title} meta="кейс-тренажёр" cta={c.stub ? undefined : "Открыть →"} />
            ))}
          </div>
        </Block>

        <Block title="Обзоры бизнеса" count={items.reviews.length}>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.reviews.map((r) => (
              <Card key={r.slug} href={r.stub ? undefined : r.href} stub={r.stub} title={r.title} meta="лонгрид" cta={r.stub ? undefined : "Читать →"} />
            ))}
          </div>
        </Block>
      </Container>
    </>
  );
}

function LevelHero({ lvl }: { lvl: Level }) {
  return (
    <section className="hero-ocean">
      <Container className="relative z-10 py-16">
        <nav className="mb-5 text-sm text-foam/50">
          <Link href="/levels" className="hover:text-teal">Уровни «Океан»</Link>
          <span className="mx-2">/</span>
          <span>{lvl.name}</span>
        </nav>
        <div className="flex items-center gap-5">
          <img src={RANK_IMG[lvl.key]} alt={lvl.name} className="h-24 w-24 shrink-0 object-contain" />
          <div>
            <p className="eyebrow">{lvl.tag}{lvl.archetype ? ` · ${lvl.archetype}` : ""}</p>
            <h1 className="mt-1 text-4xl !text-foam sm:text-5xl">{lvl.name}</h1>
          </div>
        </div>
        <p className="mt-5 max-w-xl text-lg text-foam/75">{lvl.tagline}</p>
      </Container>
    </section>
  );
}

function Block({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl text-heading">{title}</h2>
        <span className="num text-sm text-muted">{count}</span>
      </div>
      <div className="wave-divider my-5" />
      {children}
    </section>
  );
}

function Card({
  href, title, meta, cta, stub,
}: {
  href?: string;
  title: string;
  meta: string;
  cta?: string;
  stub?: boolean;
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg text-heading">{title}</h3>
        {stub && <span className="shrink-0 rounded-full bg-line px-2.5 py-0.5 text-[0.7rem] text-muted">скоро</span>}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted">{meta}</span>
        {cta && <span className="text-sm font-medium text-teal-600">{cta}</span>}
      </div>
    </>
  );
  const cls = "block rounded-[var(--radius-tl)] border border-line bg-card p-6";
  if (!href) return <div className={`${cls} opacity-60`}>{inner}</div>;
  return (
    <Link href={href} className={`${cls} group transition-all hover:-translate-y-1 hover:border-teal/40 hover:shadow-[var(--shadow-tl-sm)]`}>
      {inner}
    </Link>
  );
}
