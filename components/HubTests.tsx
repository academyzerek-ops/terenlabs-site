import Link from "next/link";
import { Container } from "./Container";
import { Arrow } from "./Button";
import { HUB_BRANCH, getHub, type HubKey } from "@/lib/hubs";

// Блок «Тесты хаба» — один и тот же на всех четырёх страницах хабов.
// Человек, дочитавший главы, должен тут же видеть, что он может сдать
// и что у этого хаба пока только готовится. Данные — из lib/hubs.ts,
// чтобы страница хаба и страница тестов не расходились между собой.

const STATE_LABEL = {
  live: "Сдаётся сейчас",
  planned: "Готовится",
  none: "Без своей ветки",
} as const;

export function HubTests({ hub }: { hub: HubKey }) {
  const branch = HUB_BRANCH[hub];
  const h = getHub(hub);
  if (!branch) return null;

  const rows = [
    { name: "Барракуда", items: branch.barrakuda ?? [] },
    { name: "Дельфин", items: branch.delfin ?? [] },
    { name: "Акула", items: branch.akula ? [branch.akula] : [] },
  ].filter((r) => r.items.length > 0);

  return (
    <section className="border-t border-line">
      <Container className="py-9 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="text-[20px] sm:text-[24px]">Тесты хаба</h2>
            <span className="tag">{STATE_LABEL[branch.state]}</span>
          </div>
          <p className="text-[15px] leading-relaxed text-text-2">{branch.note}</p>
        </div>

        {rows.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {rows.map((r) => (
              <div key={r.name} className="panel flex flex-col gap-3 p-6">
                <p className="eyebrow">{r.name}</p>
                <ul className="grid gap-1.5 text-[14px] leading-relaxed text-text-2">
                  {r.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 max-w-[64ch] text-[15px] leading-relaxed text-text-2">
            Ракушка и Краб общие для всех: база сдаётся один раз и засчитывается везде.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/tests" className="link text-[14px]">
            {branch.state === "live" ? `Сдавать тесты «${h.title}»` : "Посмотреть все ветки"} <Arrow />
          </Link>
          <Link href="/levels" className="link text-[14px]">
            Что означают уровни <Arrow />
          </Link>
        </div>
      </Container>
    </section>
  );
}
