"use client";

import { useState } from "react";
import { OCEAN_API } from "@/lib/ocean";

// Независимая заявка по индивидуальной финмодели.
// Клиент оставляет контакт на выбор (Telegram/WhatsApp/Email/Телефон) + короткий
// бриф → POST /lead (аноним, бэк помечает source «:anon»). Адиль читает заявки
// в админке (GET /admin/leads). Ответ — по указанному клиентом каналу.
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
      <div role="status" className="rounded-[8px] border border-line bg-subtle p-6">
        <p className="text-[16px] font-medium text-ink">Заявка отправлена</p>
        <p className="mt-2 text-[15px] leading-relaxed text-text-2">
          Финансист свяжется с вами по указанному контакту ({channel}) — уточнит детали, объём и сроки.
          Заявка ни к чему не обязывает.
        </p>
      </div>
    );
  }

  const inputCls =
    "mt-1.5 w-full rounded-[8px] border border-line-2 bg-page px-3 text-[16px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent";
  const labelCls = "block text-[13px] font-medium text-text-2";

  return (
    <div className="rounded-[8px] border border-line bg-subtle p-6">
      <p className="text-[15px] leading-relaxed text-text-2">
        Оставьте заявку — финансист свяжется по удобному вам каналу.
      </p>

      <label className="mt-5 block">
        <span className={labelCls}>Как к вам обращаться</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Имя" className={`${inputCls} h-11`} />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-[170px_minmax(0,1fr)]">
        <label className="block">
          <span className={labelCls}>Канал связи</span>
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className={`${inputCls} h-11`}>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Контакт</span>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={160}
            placeholder={channel === "Email" ? "name@example.com" : channel === "Телефон" ? "+7 …" : "@ник или номер"}
            className={`${inputCls} h-11`}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className={labelCls}>Коротко о проекте</span>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={3}
          maxLength={3000}
          placeholder="Сфера (SaaS, производство, стройка…), город, зачем модель — банк / инвестор / грант / для себя."
          className={`${inputCls} py-2.5 leading-relaxed`}
        />
      </label>

      {state === "error" && (
        <p role="alert" className="mt-3 text-[14px] text-danger">
          Не удалось отправить. Проверьте соединение и попробуйте ещё раз.
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          onClick={send}
          disabled={!valid || state === "sending"}
          className="btn-press inline-flex h-10 items-center justify-center rounded-[8px] bg-accent-600 px-4 text-[15px] font-medium text-[#fff] transition-colors hover:bg-[#1b6fc2] disabled:cursor-default disabled:opacity-50"
        >
          {state === "sending" ? "Отправляю…" : "Отправить заявку"}
        </button>
      </div>
    </div>
  );
}
