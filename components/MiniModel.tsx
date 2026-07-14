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
  const color = danger ? "#B4452F" : tight ? "#C77D2A" : "#00B7C2";

  return (
    <div className="group relative">
      {/* Outer Shell (Double-Bezel Architecture) */}
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl transition-all duration-500 group-hover:border-white/15">
        
        {/* Inner Core */}
        <div className="relative overflow-hidden rounded-[calc(2rem-0.5rem)] bg-navy-900/80 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-foam/40">
                Live Модель
              </span>
            </div>
            <span className="num text-[10px] rounded-full border border-teal/30 bg-teal/5 px-2 py-0.5 text-teal">
              Coffee Shop v4.2
            </span>
          </div>

          <dl className="mt-6 space-y-5">
            <Row label="Средний чек" value={`${AVG_CHECK.toLocaleString("ru-RU")} ₸`} />
            
            <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/5">
              <div className="flex items-center justify-between">
                <dt className="text-xs font-medium text-foam/50 uppercase tracking-wider">Загрузка зала</dt>
                <dd className="num text-sm font-bold text-foam">{load} %</dd>
              </div>
              <input
                type="range"
                min={30}
                max={75}
                value={load}
                onChange={(e) => setLoad(Number(e.target.value))}
                aria-label="Загрузка кофейни, процентов"
                className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-teal transition-all hover:bg-white/20"
              />
              <div className="mt-2 flex justify-between text-[10px] text-foam/20 font-mono">
                <span>MIN 30%</span>
                <span>MAX 75%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
                <dt className="text-[10px] text-foam/40 uppercase mb-1">Чеков / день</dt>
                <dd className="num text-sm font-semibold text-foam">{checks}</dd>
              </div>
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
                <dt className="text-[10px] text-foam/40 uppercase mb-1">B-Even Point</dt>
                <dd className="num text-sm font-semibold text-foam">{BREAK_EVEN_CHECKS}</dd>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <dt className="text-sm font-bold text-foam/80">Прогноз прибыли</dt>
              <dd
                className="num text-lg font-black tracking-tight transition-colors duration-500"
                style={{ color, textShadow: `0 0 20px ${color}33` }}
              >
                {profitStr}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-lg bg-teal/5 p-3">
            <p className="text-[11px] leading-relaxed text-foam/50">
              {danger
                ? `⚠️ При загрузке ${load}% кофейня теряет деньги. Модель показывает это до открытия.`
                : tight
                ? `⚡️ Загрузка ${load}% — на грани: один слабый сезон уводит в минус. Нужен запас.`
                : `💎 При загрузке ${load}% модель в плюсе — запас ${checks - BREAK_EVEN_CHECKS} чеков до точки нуля.`}
            </p>
          </div>
        </div>
      </div>
      
      {/* Ambient Glow */}
      <div 
        className="absolute -inset-4 -z-10 opacity-20 blur-3xl transition-colors duration-1000"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-1">
      <dt className="text-xs text-foam/40 uppercase tracking-wide">{label}</dt>
      <dd className="num text-sm font-medium text-foam">{value}</dd>
    </div>
  );
}
