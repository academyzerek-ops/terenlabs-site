"use client";

import { useState } from "react";

// Живая мини-финмодель на главной: двигаешь загрузку — прибыль пересчитывается.
// Демонстрирует суть продукта прямо в блоке, без перехода на /finmodels.
// Математика согласована: чек 2 400 ₸, маржа ~10%, год = 365 дней.
const AVG_CHECK = 2400;
const MARGIN = 0.1;
const BREAK_EVEN_CHECKS = 118; // чеков/день для нуля
const CHECKS_PER_LOAD_PP = 2.27; // чеков в день на 1 п.п. загрузки

export function MiniModel() {
  const [load, setLoad] = useState(45);

  const checks = Math.round(load * CHECKS_PER_LOAD_PP);
  const profitYear = (checks - BREAK_EVEN_CHECKS) * AVG_CHECK * 365 * MARGIN;
  const profitM = profitYear / 1_000_000;
  const danger = profitM < 0;
  const tight = !danger && profitM < 0.5;

  const profitStr = `${profitM > 0 ? "+" : profitM < 0 ? "−" : ""}${Math.abs(profitM).toFixed(1)} млн ₸/год`;
  const color = danger ? "var(--color-danger)" : tight ? "var(--color-warn)" : "var(--color-teal)";

  return (
    <div className="rounded-[var(--radius-tl)] border border-white/10 bg-navy-900/60 p-6 shadow-[var(--shadow-tl)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <span className="text-sm text-foam/60">Финмодель кофейни</span>
        <span className="num rounded-full bg-teal/15 px-2.5 py-1 text-xs text-teal">live</span>
      </div>

      <dl className="mt-5 space-y-4">
        <Row label="Средний чек" value={`${AVG_CHECK.toLocaleString("ru-RU")} ₸`} />
        <div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-foam/60">Загрузка</dt>
            <dd className="num text-sm font-medium text-foam">{load} %</dd>
          </div>
          {/* сама фича: ползунок пересчитывает модель вживую */}
          <input
            type="range"
            min={30}
            max={75}
            value={load}
            onChange={(e) => setLoad(Number(e.target.value))}
            aria-label="Загрузка кофейни, процентов"
            className="mt-2 w-full accent-[var(--color-teal)]"
          />
        </div>
        <Row label="Чеков в день" value={String(checks)} />
        <Row label="Точка безубыточности" value={`${BREAK_EVEN_CHECKS} чек/день`} />
        <div className="flex items-center justify-between">
          <dt className="text-sm text-foam/60">Прогноз прибыли</dt>
          <dd
            className="num text-base font-semibold transition-colors duration-300"
            style={{ color }}
          >
            {profitStr}
          </dd>
        </div>
      </dl>

      <p className="mt-5 min-h-[3em] text-xs leading-relaxed text-foam/50">
        {danger
          ? `При загрузке ${load}% кофейня теряет деньги каждый месяц. Модель показывает это до открытия.`
          : tight
          ? `Загрузка ${load}% — на грани: один слабый сезон уводит в минус. Нужен запас прочности.`
          : `При загрузке ${load}% модель в плюсе — запас ${checks - BREAK_EVEN_CHECKS} чеков в день до точки безубыточности.`}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-foam/60">{label}</dt>
      <dd className="num text-sm font-medium text-foam">{value}</dd>
    </div>
  );
}
