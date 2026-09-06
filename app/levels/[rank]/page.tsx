import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";
import { RankSketch } from "@/components/RankSketch";
import { LevelStatusChip } from "@/components/OceanPath";
import { TestDone } from "@/components/TestDone";
import { LevelCrowd } from "@/components/OceanPulse";
import { getLevel, levelItems, Level, plural, LEVELS } from "@/lib/content";
import { getTrack } from "@/lib/learn";
import { pageMetadata } from "@/lib/seo";

// Все слаги известны на сборке: неизвестный отдаёт настоящий 404, а не 200
// с пустой страницей (аудит ссылок 06.09.2026).
export const dynamicParams = false;

export function generateStaticParams() {
  return LEVELS.map((l) => ({ rank: l.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ rank: string }> }) {
  const { rank } = await params;
  const lvl = getLevel(rank);
  if (!lvl) return {};
  return pageMetadata({ title: `Уровень «${lvl.name}»`, description: lvl.tagline, path: `/levels/${rank}` });
}

export default async function Page({ params }: { params: Promise<{ rank: string }> }) {
  const { rank } = await params;
  const lvl = getLevel(rank);
  if (!lvl) notFound();

  const idx = LEVELS.findIndex((l) => l.key === lvl.key);
  const prev = idx > 0 ? LEVELS[idx - 1] : null;
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;

  if (lvl.locked) {
    return (
      <>
        <LevelHero lvl={lvl} />
        <Container className="pb-10 sm:pb-20">
          <div className="max-w-[560px] rounded-[8px] border border-dashed border-line-2 p-8">
            <p className="eyebrow">Уровень закрыт</p>
            <h2 className="mt-3 text-[20px]">Откроется после предыдущего</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-text-2">
              Уровни «Океан» проходятся по порядку, от Ракушки к Киту. Контент этого уровня готовится.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button href="/levels/krab">Начать с Краба</Button>
              {prev && (
                <Link href={`/levels/${prev.key}`} className="link text-[15px]">
                  К уровню «{prev.name}» <Arrow />
                </Link>
              )}
            </div>
          </div>
        </Container>
      </>
    );
  }

  const items = levelItems(lvl);
  const firstTest = items.tests.find((t) => !t.stub);

  return (
    <>
      <LevelHero lvl={lvl} cta={firstTest ? { href: firstTest.href, label: `Пройти тест: ${firstTest.title}` } : undefined} />

      <Container className="pb-10 sm:pb-20">
        <div className="grid gap-8 sm:gap-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="flex flex-col gap-8 sm:gap-14">
            <Block
              title="Тесты уровня"
              count={items.tests.length}
              // у Ракушки тесты свои, с собственным банком вопросов, и в ранг не идут.
              // Результат при этом сохраняется под аккаунтом, как и везде
              hint={
                lvl.key === "rakushka"
                  ? "Разминка на берегу: в ранг не идёт, но результат сохраняется."
                  : "Порог сдачи 7 из 10. Пересдача через кулдаун."
              }
            >
              {items.tests.map((t) => (
                <Row
                  key={t.slug}
                  href={t.stub ? undefined : t.href}
                  stub={t.stub}
                  title={t.title}
                  meta={
                    t.stub
                      ? "скоро"
                      : t.questions?.length
                      ? `${t.questions.length} ${plural(t.questions.length, "вопрос", "вопроса", "вопросов")}`
                      : t.metric
                      ? `${t.metric.value} ${t.metric.label}`
                      : "10 вопросов из пула"
                  }
                  cta="Пройти"
                  done={t.stub ? undefined : <TestDone levelKey={lvl.key} slug={t.slug} />}
                />
              ))}
            </Block>

            <Block title="Модули уроков" count={lvl.modules.length}>
              {lvl.modules.map((m) => {
                const track = getTrack(m.id);
                return (
                  <Row
                    key={m.id}
                    href={track ? `/courses/${m.id}` : undefined}
                    stub={!track}
                    title={m.title}
                    meta={track ? `${track.chapterTotal} ${plural(track.chapterTotal, "глава", "главы", "глав")}` : "готовится"}
                    cta="Открыть"
                  />
                );
              })}
            </Block>

            <Block title="Кейсы" count={items.cases.length}>
              {items.cases.map((c) => (
                <Row key={c.slug} href={c.stub ? undefined : c.href} stub={c.stub} title={c.title} meta="кейс-тренажёр" cta="Открыть" />
              ))}
            </Block>

            <Block title="Обзоры бизнеса" count={items.reviews.length}>
              {items.reviews.map((r) => (
                <Row key={r.slug} href={r.stub ? undefined : r.href} stub={r.stub} title={r.title} meta="лонгрид" cta="Читать" />
              ))}
            </Block>
          </div>

          {/* соседние уровни */}
          <aside className="rounded-[8px] border border-line bg-subtle p-5 lg:sticky lg:top-20">
            <p className="eyebrow">Уровни</p>
            <div className="mt-3">
              {LEVELS.map((l) => {
                const current = l.key === lvl.key;
                return (
                  <Link
                    key={l.key}
                    href={`/levels/${l.key}`}
                    className={`flex items-center gap-3 border-t border-line py-2.5 text-[14px] transition-colors hover:text-ink ${
                      current ? "text-ink" : "text-text-2"
                    } ${l.locked ? "opacity-60" : ""}`}
                  >
                    <RankSketch rank={l.key} size={22} className={current ? "text-ink" : "text-text-2"} />
                    <span className={current ? "font-medium" : ""}>{l.name}</span>
                    {current && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-orange" aria-hidden="true" />}
                  </Link>
                );
              })}
              <div className="border-t border-line" />
            </div>
            {next && (
              <p className="mt-4 text-[13px] text-text-2">
                Дальше: <Link href={`/levels/${next.key}`} className="link">{next.name}</Link>
              </p>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}

// Шапка уровня: крупный эскиз как единственный жест страницы
function LevelHero({ lvl, cta }: { lvl: Level; cta?: { href: string; label: string } }) {
  return (
    <section className="border-b border-line">
      <Container className="py-14 sm:py-16">
        <nav className="mb-6 text-[13px] text-faint">
          <Link href="/levels" className="hover:text-ink">Уровни «Океан»</Link>
          <span className="mx-2">/</span>
          <span>{lvl.name}</span>
        </nav>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">
          <RankSketch rank={lvl.key} size={160} className="text-ink sm:shrink-0" title={lvl.name} />
          <div className="min-w-0">
            {lvl.archetype && <p className="eyebrow">{lvl.archetype}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="text-[32px] sm:text-[40px]">{lvl.name}</h1>
              <LevelStatusChip levelKey={lvl.key} />
            </div>
            <p className="mt-4 max-w-[60ch] text-[16px] leading-relaxed text-body">{lvl.metaphor ?? lvl.tagline}</p>
            {lvl.meaning && (
              <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-text-2">{lvl.meaning}</p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              {cta && (
                <Button href={cta.href}>
                  {cta.label} <Arrow />
                </Button>
              )}
              <LevelCrowd levelKey={lvl.key} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Block({
  title,
  count,
  hint,
  children,
}: {
  title: string;
  count: number;
  hint?: string;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="text-[20px]">
          {title} <span className="num ml-1 text-[14px] font-normal text-faint">{count}</span>
        </h2>
        {hint && <p className="text-[13px] text-faint">{hint}</p>}
      </div>
      <div className="mt-4">
        {children}
        <div className="border-t border-line" />
      </div>
    </section>
  );
}

function Row({
  href,
  title,
  meta,
  cta,
  stub,
  done,
}: {
  href?: string;
  title: string;
  meta: string;
  cta: string;
  stub?: boolean;
  /** отметка «сдан», если тест уже пройден */
  done?: React.ReactNode;
}) {
  const inner = (
    <>
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="truncate text-[16px] font-medium text-ink">{title}</div>
          {done}
        </div>
        <div className="num mt-0.5 text-[13px] text-faint">{meta}</div>
      </div>
      {href ? (
        <span className="link text-[14px]">
          {cta} <Arrow />
        </span>
      ) : (
        <span className="tag">скоро</span>
      )}
    </>
  );
  const cls = "flex items-center justify-between gap-6 border-t border-line py-4";
  if (!href) return <div className={`${cls} opacity-60`}>{inner}</div>;
  return (
    <Link href={href} className={`${cls} transition-colors hover:bg-subtle`}>
      {inner}
    </Link>
  );
}
