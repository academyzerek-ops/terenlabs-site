"use client";

import { useState } from "react";
import { OCEAN_API } from "@/lib/ocean";

// Формы связи — зеркало Mini App (content/ru/info/contact.html): две темы,
// POST /lead того же бэка. В Mini App контакт берётся из подписи Telegram;
// на сайте заявка анонимная (бэк помечает source «:anon»), поэтому просим
// оставить контакт в тексте.
const API_BASE = OCEAN_API.replace(/\/api\/ocean$/, "");

const TOPICS = [
  {
    topic: "Сотрудничество",
    desc: "Партнёрство, интеграция, доступ к источникам данных, совместный проект.",
    placeholder: "Кто вы, ваша компания и что предлагаете… Оставьте контакт (Telegram или почту), чтобы мы могли ответить.",
    done: "Спасибо! Получили — команда рассмотрит и свяжется, если потребуется продолжение.",
  },
  {
    topic: "Предложения и пожелания",
    desc: "Что добавить, что не работает, какой ниши не хватает, что улучшить.",
    placeholder: "Что улучшить, чего не хватает, что работает не так… Хотите ответ — оставьте контакт в тексте.",
    done: "Спасибо! Получили — учтём в работе над продуктом.",
  },
];

function ContactCard({ t }: { t: (typeof TOPICS)[number] }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const send = async () => {
    if (!text.trim()) return;
    setState("sending");
    try {
      const r = await fetch(`${API_BASE}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: `Обратная связь · ${t.topic}`,
          message: text.trim().slice(0, 4000),
          source: "contact-site",
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
        <h2 className="text-xl text-heading">{t.topic}</h2>
        <p className="mt-3 leading-relaxed text-teal-600">{t.done}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-tl)] border border-line bg-card p-6">
      <h2 className="text-xl text-heading">{t.topic}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.desc}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={4000}
        rows={5}
        placeholder={t.placeholder}
        className="mt-4 w-full rounded-[var(--radius-tl)] border border-line bg-subtle p-4 text-[16px] sm:text-[0.95rem] leading-relaxed text-heading outline-none transition-colors placeholder:text-muted/60 focus:border-teal"
      />
      {state === "error" && (
        <p className="mt-2 text-sm text-[var(--color-danger)]">
          Не удалось отправить. Проверьте соединение и попробуйте ещё раз.
        </p>
      )}
      <div className="mt-4 text-right">
        <button
          onClick={send}
          disabled={!text.trim() || state === "sending"}
          className="btn-press rounded-full bg-teal px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-600 disabled:cursor-default disabled:opacity-40"
        >
          {state === "sending" ? "Отправляю…" : "Отправить"}
        </button>
      </div>
    </div>
  );
}

export function ContactForms() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {TOPICS.map((t) => (
        <ContactCard key={t.topic} t={t} />
      ))}
    </div>
  );
}
