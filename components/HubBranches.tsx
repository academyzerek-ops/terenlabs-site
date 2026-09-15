"use client";

import { useState } from "react";
import Link from "next/link";
import { Arrow } from "@/components/Button";
import { HUBS, HUB_BRANCH, type HubKey } from "@/lib/hubs";

// Ветки Океана по хабам на странице тестов. Смысл блока: путь ниже — не
// единственный, он принадлежит «Предпринимателю». Барракуда, Дельфин и Акула
// у каждого хаба свои, и человек должен видеть, какая ветка уже сдаётся,
// какая пишется и из чего будет собрана.
// Панель «Предпринимателя» — это реальная тропа тестов, она приходит children.

export function HubBranches({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<HubKey>("delo");
  const branch = HUB_BRANCH[active];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Ветки Океана">
        {HUBS.map((h) => {
          const st = HUB_BRANCH[h.key]?.state ?? "none";
          const on = h.key === active;
          return (
            <button
              key={h.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(h.key)}
              className={`flex items-center gap-2 rounded-[8px] px-3.5 py-2 text-[14px] transition-colors ${
                on
                  ? "bg-raised-2 text-ink shadow-[0_0_0_1px_var(--color-line-2)]"
                  : "text-text-2 hover:text-ink"
              }`}
            >
              {h.title}
              {st !== "live" && (
                <span className="tag">{st === "planned" ? "готовится" : "без тестов"}</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 max-w-[70ch] text-[14px] leading-relaxed text-text-2">
        {branch?.note}
      </p>

      <div className="mt-7">
        {active === "delo" ? (
          children
        ) : branch?.state === "planned" ? (
          <PlannedBranch
            hubKey={active}
            barrakuda={branch.barrakuda ?? []}
            delfin={branch.delfin ?? []}
            akula={branch.akula ?? ""}
          />
        ) : (
          <NoBranch hubKey={active} />
        )}
      </div>
    </div>
  );
}

function PlannedBranch({
  hubKey,
  barrakuda,
  delfin,
  akula,
}: {
  hubKey: HubKey;
  barrakuda: string[];
  delfin: string[];
  akula: string;
}) {
  const hub = HUBS.find((h) => h.key === hubKey)!;
  const rows: { name: string; rule: string; items: string[] }[] = [
    { name: "Барракуда", rule: "закрытые пулы · 10 вопросов · порог 7", items: barrakuda },
    { name: "Дельфин", rule: "открытые кейсы · проверяет ИИ-акулёнок", items: delfin },
    { name: "Акула", rule: "большой кейс · 10 вопросов по порядку", items: akula ? [akula] : [] },
  ];

  return (
    <div>
      <p className="max-w-[70ch] text-[14px] leading-relaxed text-faint">
        Ракушка и Краб общие для всех хабов: база сдаётся один раз и засчитывается
        везде. Расходятся ветки дальше — вот из чего соберётся эта.
      </p>
      <div className="mt-6">
        {rows.map((r) => (
          <div
            key={r.name}
            className="grid gap-3 border-t border-line py-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6"
          >
            <div className="min-w-0">
              <h3 className="text-[16px]">{r.name}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-faint">{r.rule}</p>
              <span className="tag mt-3 inline-block">Готовится</span>
            </div>
            <ol className="min-w-0 max-w-[64ch] space-y-2">
              {r.items.map((it, i) => (
                <li
                  key={it}
                  className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 text-[14px] leading-relaxed text-text-2"
                >
                  <span className="num text-[13px] text-faint">{i + 1}</span>
                  <span>{it}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
        <div className="border-t border-line" />
      </div>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        <Link href={hub.href} className="link text-[14px]">
          Главы хаба «{hub.title}» <Arrow />
        </Link>
        <Link href="/levels" className="link text-[14px]">
          Что означают уровни <Arrow />
        </Link>
      </div>
    </div>
  );
}

function NoBranch({ hubKey }: { hubKey: HubKey }) {
  const hub = HUBS.find((h) => h.key === hubKey)!;
  return (
    <div className="panel grid gap-4 p-7 sm:p-10">
      <p className="eyebrow">Как это работает</p>
      <p className="max-w-[64ch] text-[15px] leading-relaxed text-text-2">
        Главы «{hub.title}» читаются без тестов и без возраста на входе. Дальше —
        общий Краб: те же три теста, что сдают все, и то же место в рейтинге.
        Отдельной детской лестницы нет и не планируется.
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Link href={hub.href} className="link text-[14px]">
          Читать «{hub.title}» <Arrow />
        </Link>
        <Link href="/ocean" className="link text-[14px]">
          Рейтинг <Arrow />
        </Link>
      </div>
    </div>
  );
}
