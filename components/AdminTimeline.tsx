"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Arrow } from "./Button";
import { fetchAdminTimeline, daysAgo, humanTime, LEVEL_RU, type AdminTimeline } from "@/lib/admin";

// Путь одного ученика: профиль, сводка и хронология событий с попытками одной
// лентой. Отвечает на вопрос «что человек реально делал», а не «сколько у него
// очков»: по ленте видно, где он застрял и после чего перестал заходить.

const str = (v: unknown) => (v == null ? "" : String(v));

// Человеческие имена типов событий — на случай, когда бэкенд прислал только тип.
// Если он прислал и текст, показываем текст: он уже человеческий, и дублировать
// его переводом типа значит писать «открыл страницу · Открыл страницу».
const TYPE_RU: Record<string, string> = {
  session_start: "начал сессию",
  session_end: "закрыл сессию",
  page_view: "открыл страницу",
  tab: "переключил вкладку",
  tab_close: "закрыл вкладку",
  test_start: "начал тест",
  attempt: "прошёл тест",
  order_click: "нажал заявку",
  other: "",
};
const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

function Field({ label, value }: { label: string; value: string }) {
  if (!value || value === "—") return null;
  return (
    <div className="grid gap-0.5 border-t border-line py-3">
      <span className="text-[12px] text-faint">{label}</span>
      <span className="text-[15px] text-ink">{value}</span>
    </div>
  );
}

export function AdminTimelineView({ userId }: { userId: number }) {
  const [data, setData] = useState<AdminTimeline | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminTimeline(userId)
      .then(setData)
      .catch((e) => setErr(String(e.message ?? e)));
  }, [userId]);

  if (err) return <p className="text-[15px] text-text-2">{err}</p>;
  if (!data) return <p className="text-[15px] text-faint">Загружаем…</p>;

  const p = data.profile;
  const s = data.stats;
  const name = str(p.name) || str(p.username) || `id ${userId}`;

  return (
    <>
      <Link href="/admin" className="link text-[13px]">
        <Arrow className="rotate-180" /> ко всем ученикам
      </Link>
      <h1 className="mt-3 text-[24px] sm:text-[38px]">{name}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        <div>
          <p className="eyebrow">Профиль</p>
          <div className="mt-3">
            <Field label="Ник" value={str(p.username) && `@${str(p.username)}`} />
            <Field label="Уровень" value={LEVEL_RU[str(p.level)] ?? str(p.level)} />
            <Field label="Область" value={str(p.region)} />
            <Field label="Способы входа" value={(p.providers as string[] | undefined)?.join(", ") ?? ""} />
            <Field label="Первый раз" value={daysAgo(str(p.first_seen) || null)} />
            <Field label="Последний раз" value={daysAgo(str(p.last_seen) || null)} />
            <Field label="Сессий" value={p.sessions ? String(p.sessions) : ""} />
            <Field label="Всего времени" value={humanTime(num(p.total_time_sec))} />
            <Field
              label="Попытки"
              value={s.attempts ? `${num(s.passed)} сдано из ${num(s.attempts)}` : ""}
            />
            <Field label="Средний балл" value={s.avg_score ? num(s.avg_score).toFixed(1) : ""} />
            <div className="border-t border-line" />
          </div>
        </div>

        <div>
          <p className="eyebrow">Что делал</p>
          {data.timeline.length === 0 ? (
            <p className="mt-3 text-[15px] text-text-2">Событий пока нет.</p>
          ) : (
            <div className="mt-3">
              {data.timeline.map((e, i) => {
                // у события с бэка разный набор полей: показываем то, что есть,
                // и не притворяемся, будто знаем схему каждого типа
                const when = str(e.at) || str(e.ts);
                const type = str(e.type) || str(e.kind);
                const detail = [str(e.title), str(e.test), str(e.level), str(e.page)]
                  .filter(Boolean)
                  .join(" · ");
                const lead = detail || TYPE_RU[type] || type || "событие";
                const score = e.score != null ? `${num(e.score)}/10` : "";
                return (
                  <div
                    key={i}
                    className="grid gap-1 border-t border-line py-3 sm:grid-cols-[150px_minmax(0,1fr)_70px] sm:items-baseline sm:gap-4"
                  >
                    <span className="num text-[13px] text-faint">
                      {when ? new Date(when).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" }) : "—"}
                    </span>
                    <span className="min-w-0 text-[14px] text-body">
                      <span className="text-ink">{lead}</span>
                    </span>
                    <span className="num text-[13px] text-text-2 sm:text-right">{score}</span>
                  </div>
                );
              })}
              <div className="border-t border-line" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
