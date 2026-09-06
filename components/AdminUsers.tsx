"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Arrow } from "./Button";
import {
  fetchAdminUsers,
  daysAgo,
  humanTime,
  LEVEL_RU,
  type AdminUser,
} from "@/lib/admin";

// Таблица учеников. Показывает не «сколько всего юзеров», а кто где застрял:
// уровень, сколько тестов сдано из пройденных, средний балл и когда заходил
// последний раз. По этим четырём колонкам видно, кому нужна помощь.

type SortKey = "last" | "level" | "score" | "attempts";

const LEVEL_ORDER = ["mollusk", "crab", "barracuda", "dolphin", "shark", "whale"];

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("last");

  useEffect(() => {
    fetchAdminUsers().then(setUsers).catch((e) => setErr(String(e.message ?? e)));
  }, []);

  const rows = useMemo(() => {
    if (!users) return [];
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? users.filter((u) =>
          [u.first_name, u.username, u.region, String(u.tg_id ?? "")]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(needle))
        )
      : users;
    const by: Record<SortKey, (a: AdminUser, b: AdminUser) => number> = {
      last: (a, b) => (a.last_seen_at < b.last_seen_at ? 1 : -1),
      level: (a, b) => LEVEL_ORDER.indexOf(b.level) - LEVEL_ORDER.indexOf(a.level),
      score: (a, b) => b.avg_score - a.avg_score,
      attempts: (a, b) => b.attempts_total - a.attempts_total,
    };
    return [...filtered].sort(by[sort]);
  }, [users, q, sort]);

  if (err) {
    return (
      <p className="text-[15px] text-text-2">
        {err === "нужен вход" ? "Нужно войти в аккаунт." : err}
      </p>
    );
  }
  if (!users) return <p className="text-[15px] text-faint">Загружаем…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Имя, ник, область"
          className="h-9 w-full max-w-[280px] rounded-[8px] border border-line bg-subtle px-3 text-[14px] text-ink outline-none focus:border-line-2"
        />
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["last", "по активности"],
              ["level", "по уровню"],
              ["score", "по баллу"],
              ["attempts", "по попыткам"],
            ] as [SortKey, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setSort(k)}
              className={`h-8 rounded-[8px] border px-3 text-[13px] transition-colors ${
                sort === k
                  ? "border-line-2 bg-subtle text-ink"
                  : "border-line text-text-2 hover:bg-subtle hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="num text-[13px] text-faint sm:ml-auto">{rows.length}</span>
      </div>

      <div className="mt-6">
        <div className="hidden grid-cols-[minmax(0,1fr)_120px_110px_90px_120px_40px] gap-4 pb-2 text-[12px] font-medium text-text-2 sm:grid">
          <span>Ученик</span>
          <span>Уровень</span>
          <span>Тесты</span>
          <span>Балл</span>
          <span>Заходил</span>
          <span />
        </div>
        {rows.map((u) => (
          <Link
            key={u.user_id}
            href={`/admin/${u.user_id}`}
            className="grid gap-1 border-t border-line py-3 transition-colors hover:bg-subtle sm:grid-cols-[minmax(0,1fr)_120px_110px_90px_120px_40px] sm:items-center sm:gap-4"
          >
            <span className="min-w-0">
              <span className="block truncate text-[15px] text-ink">
                {u.first_name || u.username || `id ${u.user_id}`}
              </span>
              <span className="block truncate text-[12px] text-faint">
                {[u.username && `@${u.username}`, u.region, u.providers.join(", ")]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>

            {/* На узком экране колонки складываются в столбик из голых значений:
                «Барракуда», «34 из 71», «6.4» без подписей не читаются. Поэтому
                на телефоне показываем одну сводную строку, а таблицу — от sm. */}
            <span className="text-[13px] text-text-2 sm:hidden">
              {[
                LEVEL_RU[u.level] ?? u.level,
                `${u.attempts_passed} из ${u.attempts_total}`,
                u.avg_score ? `балл ${u.avg_score.toFixed(1)}` : null,
                daysAgo(u.last_seen_at),
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>

            <span className="hidden text-[14px] text-body sm:block">{LEVEL_RU[u.level] ?? u.level}</span>
            <span className="num hidden text-[14px] text-body sm:block">
              {u.attempts_passed} из {u.attempts_total}
            </span>
            <span className="num hidden text-[14px] text-body sm:block">
              {u.avg_score ? u.avg_score.toFixed(1) : "—"}
            </span>
            <span className="hidden text-[13px] text-text-2 sm:block">
              {daysAgo(u.last_seen_at)}
              <span className="block text-[12px] text-faint">{humanTime(u.total_time_sec)}</span>
            </span>
            <span className="hidden justify-end text-text-2 sm:flex">
              <Arrow />
            </span>
          </Link>
        ))}
        <div className="border-t border-line" />
      </div>
    </div>
  );
}
