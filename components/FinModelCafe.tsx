"use client";

import { useMemo, useState } from "react";
import { Container } from "./Container";

// Форматтер чисел в стиле РК: пробел-разделитель тысяч
const fmt = (n: number) =>
  Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ");

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const SUMMER = new Set([5, 6, 7]); // Июн, Июл, Авг

type Assumptions = {
  avgCheck: number;
  dailyCustomers: number;
  workingDays: number;
  rent: number;
  payroll: number;
  otherFixed: number;
  cogsPct: number;
  summerDipPct: number;
};

const DEFAULTS: Assumptions = {
  avgCheck: 2400,
  dailyCustomers: 90,
  workingDays: 30,
  rent: 600000,
  payroll: 900000,
  otherFixed: 300000,
  cogsPct: 35,
  summerDipPct: 30,
};

export function FinModelCafe() {
  const [a, setA] = useState<Assumptions>(DEFAULTS);
  const set = (k: keyof Assumptions, v: number) => setA((p) => ({ ...p, [k]: v }));

  const model = useMemo(() => {
    const fixed = a.rent + a.payroll + a.otherFixed;
    const cm = a.avgCheck * (1 - a.cogsPct / 100); // вклад на чек
    const months = MONTHS.map((m, i) => {
      const season = SUMMER.has(i) ? 1 - a.summerDipPct / 100 : 1;
      const customers = a.dailyCustomers * season;
      const revenue = a.avgCheck * customers * a.workingDays;
      const variable = revenue * (a.cogsPct / 100);
      const profit = revenue - variable - fixed;
      return { m, revenue, profit };
    });
    const annualProfit = months.reduce((s, x) => s + x.profit, 0);
    const annualRevenue = months.reduce((s, x) => s + x.revenue, 0);
    const breakEvenPerDay = cm > 0 ? fixed / (cm * a.workingDays) : Infinity;
    return { fixed, cm, months, annualProfit, annualRevenue, breakEvenPerDay };
  }, [a]);

  const maxAbs = Math.max(...model.months.map((x) => Math.abs(x.profit)), 1);

  const exportCsv = () => {
    const rows = [
      ["Месяц", "Выручка", "Прибыль"],
      ...model.months.map((x) => [x.m, Math.round(x.revenue), Math.round(x.profit)]),
      ["Итого/год", Math.round(model.annualRevenue), Math.round(model.annualProfit)],
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "terenlabs-finmodel-cafe.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container className="py-12">
      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        {/* Допущения */}
        <div className="rounded-[var(--radius-tl)] border border-line bg-card p-6">
          <h2 className="text-xl text-heading">Допущения</h2>
          <p className="mt-1 text-xs text-muted">Меняй — модель пересчитается мгновенно.</p>
          <div className="mt-5 space-y-5">
            <Slider label="Средний чек, ₸" min={800} max={6000} step={100} value={a.avgCheck} onChange={(v) => set("avgCheck", v)} />
            <Slider label="Гостей в день" min={20} max={300} step={5} value={a.dailyCustomers} onChange={(v) => set("dailyCustomers", v)} />
            <Slider label="Рабочих дней/мес" min={20} max={31} step={1} value={a.workingDays} onChange={(v) => set("workingDays", v)} />
            <Slider label="Себестоимость (COGS), %" min={20} max={60} step={1} value={a.cogsPct} onChange={(v) => set("cogsPct", v)} suffix="%" />
            <Slider label="Аренда/мес, ₸" min={200000} max={2000000} step={50000} value={a.rent} onChange={(v) => set("rent", v)} />
            <Slider label="ФОТ/мес, ₸" min={300000} max={3000000} step={50000} value={a.payroll} onChange={(v) => set("payroll", v)} />
            <Slider label="Прочие расходы/мес, ₸" min={0} max={1500000} step={50000} value={a.otherFixed} onChange={(v) => set("otherFixed", v)} />
            <Slider label="Летняя просадка, %" min={0} max={60} step={5} value={a.summerDipPct} onChange={(v) => set("summerDipPct", v)} suffix="%" />
          </div>
          <button
            onClick={() => setA(DEFAULTS)}
            className="mt-6 text-sm text-teal-600 hover:underline"
          >
            Сбросить к базовым
          </button>
        </div>

        {/* Результаты */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KPI
              label="Прибыль за год"
              value={`${model.annualProfit < 0 ? "−" : ""}${fmt(Math.abs(model.annualProfit))} ₸`}
              tone={model.annualProfit < 0 ? "danger" : "ok"}
            />
            <KPI label="Выручка за год" value={`${fmt(model.annualRevenue)} ₸`} />
            <KPI
              label="Точка безубыточности"
              value={`${fmt(model.breakEvenPerDay)} гост/день`}
              tone={model.breakEvenPerDay > a.dailyCustomers ? "warn" : "ok"}
            />
          </div>

          {/* График прибыли по месяцам */}
          <div className="rounded-[var(--radius-tl)] border border-line bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg text-heading">Прибыль по месяцам</h3>
              <button
                onClick={exportCsv}
                className="rounded-[var(--radius-tl)] border border-line px-3 py-1.5 text-sm text-heading transition-colors hover:border-teal hover:text-teal"
              >
                Экспорт в Excel (CSV)
              </button>
            </div>
            <div className="mt-6 flex h-56 items-end gap-1.5">
              {model.months.map((x) => {
                const h = (Math.abs(x.profit) / maxAbs) * 100;
                const neg = x.profit < 0;
                return (
                  <div key={x.m} className="flex h-full flex-1 flex-col items-center gap-1">
                    {/* зона бара — flex-1 даёт определённую высоту, чтобы height:% работал */}
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t"
                        style={{
                          height: `${Math.max(h, 2)}%`,
                          background: neg ? "var(--color-danger)" : "var(--color-teal)",
                          opacity: neg ? 0.85 : 1,
                        }}
                        title={`${x.m}: ${fmt(x.profit)} ₸`}
                      />
                    </div>
                    <span className="text-[0.6rem] text-muted">{x.m}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Вывод «Ноа» */}
          <div className="rounded-[var(--radius-tl)] border-l-2 border-teal bg-subtle p-5">
            <p className="text-sm leading-relaxed text-heading">
              {model.annualProfit < 0 ? (
                <>
                  При этих допущениях бизнес теряет{" "}
                  <span className="num font-medium text-danger">{fmt(Math.abs(model.annualProfit))} ₸</span> в год.
                  Нужно либо{" "}
                  <span className="num">{fmt(model.breakEvenPerDay)}</span> гостей в день для нуля, либо резать
                  постоянные расходы. Цифры, а не надежда.
                </>
              ) : (
                <>
                  Модель в плюсе:{" "}
                  <span className="num font-medium text-heading">{fmt(model.annualProfit)} ₸</span> в год.
                  Запас прочности есть, но проверь летнюю просадку — там тонко.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}

function Slider({
  label, min, max, step, value, onChange, suffix,
}: {
  label: string; min: number; max: number; step: number; value: number;
  onChange: (v: number) => void; suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm text-heading">{label}</label>
        <span className="num text-sm font-medium text-teal-600">
          {value.toLocaleString("ru-RU").replace(/,/g, " ")}{suffix ?? ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--color-teal)]"
      />
    </div>
  );
}

function KPI({
  label, value, tone = "neutral",
}: {
  label: string; value: string; tone?: "ok" | "warn" | "danger" | "neutral";
}) {
  const color =
    tone === "danger" ? "var(--color-danger)" : tone === "warn" ? "var(--color-warn)" : "var(--color-heading)";
  return (
    <div className="rounded-[var(--radius-tl)] border border-line bg-card p-5">
      <div className="num text-2xl font-medium" style={{ color }}>{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}
