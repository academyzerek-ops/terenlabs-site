"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { dayKey, getJournal, seedJournalFromAttempts, streakFromJournal, type JournalEntry } from "@/lib/memory";
import { plural } from "@/lib/content";

// Дневник занятий в боковой панели: месяц точками и список дня.
// Показывает не оценку, а привычку — единственное, чем ученик управляет сам.
// Данные локальные (память устройства), поэтому работают и без входа.

const WD = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
const MONTHS = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
];

const KIND_LABEL: Record<string, string> = {
  chapter: "глава",
  test: "тест",
  case: "кейс",
  review: "ниша",
  brand: "разбор",
};

/** Понедельник первым: у Date воскресенье это 0. */
const mondayIndex = (d: Date) => (d.getDay() + 6) % 7;

export function SidebarDiary({ onNavigate }: { onNavigate?: () => void }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [cursor, setCursor] = useState(() => new Date());
  const [picked, setPicked] = useState<string>(() => dayKey(new Date()));

  useEffect(() => {
    seedJournalFromAttempts();
    setEntries(getJournal());
  }, []);

  const byDay = useMemo(() => {
    const m = new Map<string, JournalEntry[]>();
    for (const e of entries) {
      const k = dayKey(e.at);
      const list = m.get(k);
      if (list) list.push(e);
      else m.set(k, [e]);
    }
    return m;
  }, [entries]);

  const streak = useMemo(() => streakFromJournal(entries), [entries]);
  const today = dayKey(new Date());

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const lead = mondayIndex(first);
    const cells: (Date | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [cursor]);

  const monthDone = grid.filter((d) => d && byDay.has(dayKey(d))).length;
  const dayList = byDay.get(picked) ?? [];
  const shift = (n: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));

  return (
    <div className="px-3 pb-4 pt-1">
      {/* шапка: серия и месяц */}
      <div className="mb-3 rounded-[8px] bg-subtle px-3 py-2.5">
        <div className="num text-[19px] font-semibold leading-tight text-ink">
          {streak}
          <span className="ml-1 text-[12px] font-normal text-text-2">
            {plural(streak, "день", "дня", "дней")} подряд
          </span>
        </div>
        <div className="mt-0.5 text-[12px] text-faint">
          {monthDone > 0
            ? `${monthDone} ${plural(monthDone, "активный", "активных", "активных")} ${plural(monthDone, "день", "дня", "дней")} в этом месяце`
            : "начни сегодня, и счёт пойдёт"}
        </div>
      </div>

      <div className="mb-1.5 flex items-center justify-between px-0.5">
        <button onClick={() => shift(-1)} aria-label="Предыдущий месяц" className="flex h-6 w-6 items-center justify-center rounded-[5px] text-faint hover:bg-subtle hover:text-ink">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M10 3 5 8l5 5" /></svg>
        </button>
        <span className="text-[13px] text-text-2">
          {MONTHS[cursor.getMonth()]} <span className="num text-faint">{cursor.getFullYear()}</span>
        </span>
        <button onClick={() => shift(1)} aria-label="Следующий месяц" className="flex h-6 w-6 items-center justify-center rounded-[5px] text-faint hover:bg-subtle hover:text-ink">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {WD.map((w) => (
          <span key={w} className="pb-1 text-[10px] text-faint">{w}</span>
        ))}
        {grid.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const k = dayKey(d);
          const has = byDay.has(k);
          const isToday = k === today;
          const isPicked = k === picked;
          return (
            <button
              key={k}
              onClick={() => setPicked(k)}
              aria-current={isToday ? "date" : undefined}
              className={`num mx-auto flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] transition-colors ${
                isPicked ? "bg-accent-600 text-[#fff]"
                : has ? "bg-accent/25 text-ink hover:bg-accent/40"
                : isToday ? "text-ink shadow-[inset_0_0_0_1px_var(--color-line-2)] hover:bg-subtle"
                : "text-faint hover:bg-subtle hover:text-text-2"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {/* что было в выбранный день */}
      <div className="mt-4">
        <p className="px-0.5 pb-1.5 text-[12px] font-medium text-faint">
          {picked === today ? "Сегодня" : new Date(picked).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
        </p>
        {dayList.length === 0 ? (
          <p className="px-0.5 text-[12.5px] leading-snug text-faint">
            {picked === today ? "Пока пусто. Открой главу или пройди тест, и день отметится." : "В этот день занятий не было."}
          </p>
        ) : (
          <div className="flex flex-col gap-px">
            {dayList.map((e, i) => {
              const inner = (
                <>
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] text-ink">{e.title}</span>
                    <span className="block truncate text-[11.5px] text-faint">
                      {KIND_LABEL[e.kind] ?? e.kind}
                      {e.sub ? ` · ${e.sub}` : ""}
                    </span>
                  </span>
                </>
              );
              const cls = "flex items-start gap-2 rounded-[6px] px-2 py-1.5 transition-colors hover:bg-subtle";
              return e.href ? (
                <Link key={`${e.at}${i}`} href={e.href} onClick={onNavigate} className={cls}>{inner}</Link>
              ) : (
                <span key={`${e.at}${i}`} className={cls}>{inner}</span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
