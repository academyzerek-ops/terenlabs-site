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
  // минус красным, «на грани» оранжевым, плюс белым
  const profitCls = danger ? "text-danger" : tight ? "text-orange" : "text-ink";

  return (
    <div className="rounded-[8px] border border-line bg-subtle p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow">Мини-модель · кофейня</span>
        <span className="tag">демо</span>
      </div>

      <dl className="mt-4">
        <Row label="Средний чек" value={`${AVG_CHECK.toLocaleString("ru-RU")} ₸`} />

        <div className="border-t border-line py-3">
          <div className="flex items-center justify-between text-[15px]">
            <dt className="text-text-2">Загрузка зала</dt>
            <dd className="num font-medium text-ink">{load} %</dd>
          </div>
          <input
            type="range"
            min={30}
            max={75}
            value={load}
            onChange={(e) => setLoad(Number(e.target.value))}
            aria-label="Загрузка кофейни, процентов"
            className="mt-3 h-10 w-full cursor-pointer accent-accent-600"
          />
          <div className="num mt-1 flex justify-between text-[12px] text-faint">
            <span>30 %</span>
            <span>75 %</span>
          </div>
        </div>

        <Row label="Чеков в день" value={String(checks)} />
        <Row label="Точка безубыточности" value={`${BREAK_EVEN_CHECKS} чеков`} />

        <div className="flex items-center justify-between border-y border-line py-3 text-[15px]">
          <dt className="font-medium text-ink">Прогноз прибыли</dt>
          <dd className={`num font-medium transition-colors ${profitCls}`}>{profitStr}</dd>
        </div>
      </dl>

      <p className="mt-4 text-[13px] leading-relaxed text-text-2">
        {danger
          ? `При загрузке ${load} % кофейня теряет деньги. Модель показывает это до открытия.`
          : tight
          ? `Загрузка ${load} % на грани: один слабый сезон уводит в минус. Нужен запас.`
          : `При загрузке ${load} % модель в плюсе: запас ${checks - BREAK_EVEN_CHECKS} чеков до точки нуля.`}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-line py-3 text-[15px]">
      <dt className="text-text-2">{label}</dt>
      <dd className="num font-medium text-ink">{value}</dd>
    </div>
  );
}
