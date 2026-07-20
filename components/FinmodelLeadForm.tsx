"use client";

import { useState } from "react";
import { OCEAN_API } from "@/lib/ocean";

// Независимая заявка по индивидуальной финмодели: НЕ тянет пользователя в Telegram.
// Клиент оставляет контакт на выбор (Telegram/WhatsApp/Email/Телефон) + короткий
// бриф → POST /lead (аноним, бэк помечает source «:anon»). Продукт содержит
// «индивидуал» → уведомление падает Адилю в тему «indfm» админ-группы. Ответ —
// по указанному клиентом каналу, вход в ТГ не требуется.
const API_BASE = OCEAN_API.replace(/\/api\/ocean$/, "");
const CHANNELS = ["Telegram", "WhatsApp", "Email", "Телефон"];

export function FinmodelLeadForm() {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [contact, setContact] = useState("");
  const [brief, setBrief] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const valid = name.trim() && contact.trim() && brief.trim();

  const send = async () => {
    if (!valid) return;
    setState("sending");
    const message =
      `Имя: ${name.trim()}\n` +
      `Канал связи: ${channel} — ${contact.trim()}\n` +
      `Проект/задача: ${brief.trim().slice(0, 3000)}`;
    try {
      const r = await fetch(`${API_BASE}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: "Индивидуальная финмодель — заявка (сайт)",
          message,
          source: "finmodel-web",
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-[var(--radius-tl)] border border-teal/40 bg-card p-6">
        <p className="text-lg text-heading">Заявка отправлена ✅</p>
        <p className="mt-2 leading-relaxed text-muted">
          Финансист свяжется с вами по указанному контакту ({channel}) — уточнит детали, объём и сроки.
          Заявка ни к чему не обязывает.
        </p>
      </div>
    );
  }

  const inputCls =
    "mt-1 w-full rounded-[var(--radius-tl)] border border-line bg-subtle p-3 text-[16px] text-heading outline-none transition-colors placeholder:text-muted/60 focus:border-teal";

  return (
    <div className="rounded-[var(--radius-tl)] border border-line bg-card p-6">
      <p className="text-sm leading-relaxed text-muted">
        Оставьте заявку — финансист свяжется по удобному вам каналу. Telegram не обязателен.
      </p>

      <label className="mt-4 block text-sm text-muted">Как к вам обращаться</label>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Имя" className={inputCls} />

      <div className="mt-4 grid gap-3 sm:grid-cols-[170px_1fr]">
        <div>
          <label className="block text-sm text-muted">Канал связи</label>
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className={inputCls}>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-muted">Контакт</label>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={160}
            placeholder={channel === "Email" ? "name@example.com" : channel === "Телефон" ? "+7 …" : "@ник или номер"}
            className={inputCls}
          />
        </div>
      </div>

      <label className="mt-4 block text-sm text-muted">Коротко о проекте</label>
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        rows={3}
        maxLength={3000}
        placeholder="Сфера (SaaS, производство, стройка…), город, зачем модель — банк / инвестор / грант / для себя."
        className={inputCls + " leading-relaxed"}
      />

      {state === "error" && (
        <p className="mt-2 text-sm text-[var(--color-danger)]">
          Не удалось отправить. Проверьте соединение и попробуйте ещё раз.
        </p>
      )}

      <div className="mt-4 text-right">
        <button
          onClick={send}
          disabled={!valid || state === "sending"}
          className="btn-press rounded-full bg-teal px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-600 disabled:cursor-default disabled:opacity-40"
        >
          {state === "sending" ? "Отправляю…" : "Отправить заявку"}
        </button>
      </div>
    </div>
  );
}
