import Link from "next/link";
import { Container } from "./Container";
import { Button } from "./Button";
import { REVIEW_COFFEE } from "@/lib/review";

export function ReviewArticle() {
  const r = REVIEW_COFFEE;
  return (
    <article>
      {/* HERO */}
      <section className="hero-ocean">
        <Container className="relative z-10 py-16">
          <nav className="mb-5 text-sm text-foam/50">
            <Link href="/catalog?type=review" className="hover:text-teal">Обзоры бизнеса</Link>
            <span className="mx-2">/</span>
            <span>{r.title}</span>
          </nav>
          <p className="eyebrow">Обзор бизнеса · на данных</p>
          <h1 className="mt-4 max-w-3xl text-4xl !text-foam sm:text-5xl">{r.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foam/75">{r.lead}</p>
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-6">
            {r.meta.map((m) => (
              <div key={m.label}>
                <div className="num text-xl font-medium text-foam">{m.value}</div>
                <div className="text-xs text-foam/55">{m.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="grid gap-12 py-16 lg:grid-cols-[220px_1fr]">
        {/* Оглавление */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="eyebrow">Содержание</p>
            <nav className="mt-4 space-y-2 border-l border-line pl-4 text-sm">
              {r.toc.map((t) => (
                <a key={t.id} href={`#${t.id}`} className="block text-muted transition-colors hover:text-teal">
                  {t.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Тело лонгрида */}
        <div className="max-w-2xl">
          {r.sections.map((s, idx) => {
            const locked = r.locked && idx >= 2; // первые 2 секции открыты, дальше — пейвол
            if (locked && idx === 2) {
              return <Paywall key="paywall" />;
            }
            if (locked) return null;
            return (
              <section key={s.id} id={s.id} className="mb-14 scroll-mt-24">
                <h2 className="text-2xl text-heading">{s.heading}</h2>
                <div className="wave-divider my-5" />
                {s.paras.map((p, i) => (
                  <p key={i} className="mb-4 text-lg leading-relaxed text-body/80">{p}</p>
                ))}

                {s.bars && (
                  <div className="mt-6 rounded-[var(--radius-tl)] border border-line bg-card p-6">
                    <div className="space-y-3">
                      {s.bars.map((b) => (
                        <div key={b.label} className="flex items-center gap-3">
                          <span className="w-20 shrink-0 text-sm text-muted">{b.label}</span>
                          <div className="h-6 flex-1 overflow-hidden rounded bg-subtle">
                            <div className="h-full rounded bg-teal" style={{ width: `${b.value}%` }} />
                          </div>
                          <span className="num w-10 shrink-0 text-right text-sm text-heading">{b.value}{b.suffix ?? ""}</span>
                        </div>
                      ))}
                    </div>
                    {s.note && <p className="mt-4 text-xs text-muted">{s.note}</p>}
                  </div>
                )}

                {s.table && (
                  <div className="mt-6 overflow-hidden rounded-[var(--radius-tl)] border border-line">
                    <table className="w-full text-sm">
                      <thead className="bg-subtle">
                        <tr>
                          {s.table.cols.map((c) => (
                            <th key={c} className="px-4 py-3 text-left font-medium text-heading">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line bg-card">
                        {s.table.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j} className={`px-4 py-3 ${j === 1 ? "num text-heading" : "text-muted"}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {s.note && <p className="bg-card px-4 pb-3 text-xs text-muted">{s.note}</p>}
                  </div>
                )}
              </section>
            );
          })}

          {/* Источники */}
          <section className="mt-4 rounded-[var(--radius-tl)] border border-line bg-subtle p-6">
            <p className="eyebrow">Источники</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {r.sources.map((src) => (
                <li key={src}>· {src}</li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </article>
  );
}

function Paywall() {
  return (
    <div className="relative mb-14 overflow-hidden rounded-[var(--radius-tl)] border border-line">
      {/* Размытый тизер */}
      <div className="pointer-events-none select-none p-8 opacity-40 blur-[3px]">
        <h2 className="text-2xl text-heading">Главные риски</h2>
        <p className="mt-4 text-lg text-body/80">Локация, сезонность и перенасыщение — три фактора, которые…</p>
        <p className="mt-3 text-lg text-body/80">Летняя просадка −30% способна увести год в минус…</p>
      </div>
      {/* Замок */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/70 backdrop-blur-sm">
        <p className="eyebrow">Полная версия</p>
        <h3 className="mt-2 text-xl text-heading">Риски и вердикт — в платной части</h3>
        <p className="mt-2 max-w-sm text-center text-sm text-muted">
          Открой обзор целиком: разбор рисков, вердикт и связанная финмодель.
        </p>
        <div className="mt-5">
          <Button href="/checkout">Открыть обзор</Button>
        </div>
      </div>
    </div>
  );
}
