"use client";

import { useState } from "react";
import { OCEAN_API } from "@/lib/ocean";

// Формы связи (тексты — content/ru/info/contact.html): две темы, POST /lead.
// Заявка анонимная (бэк помечает source «:anon»), поэтому просим оставить
// контакт в тексте; вошедшему бэк привяжет аккаунт сам.
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

// Те же классы, что у Button (primary, md): здесь нужен <button onClick>, не ссылка
const BTN =
  "btn-press inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-accent-600 px-4 text-[15px] font-medium text-[#fff] transition-colors duration-150 hover:bg-[#1b6fc2] disabled:cursor-default disabled:opacity-50";

function ContactCard({ t }: { t: (typeof TOPICS)[number] }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const id = `contact-${t.topic.replace(/\s+/g, "-").toLowerCase()}`;

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
      <div className="rounded-[8px] border border-line bg-subtle p-6">
        <h2 className="text-[20px]">{t.topic}</h2>
        <p role="status" className="mt-3 text-[15px] leading-relaxed text-body">{t.done}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-[8px] border border-line bg-subtle p-6">
      <h2 className="text-[20px]">
        <label htmlFor={id}>{t.topic}</label>
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-text-2">{t.desc}</p>
      <textarea
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={4000}
        rows={5}
        placeholder={t.placeholder}
        className="mt-4 w-full rounded-[8px] border border-line-2 bg-page px-3 py-2.5 text-[16px] leading-relaxed text-ink placeholder:text-faint"
      />
      {state === "error" && (
        <p role="alert" className="mt-2 text-[14px] text-danger">
          Не удалось отправить. Проверьте соединение и попробуйте ещё раз.
        </p>
      )}
      <div className="mt-4 flex justify-end">
        <button type="button" onClick={send} disabled={!text.trim() || state === "sending"} className={BTN}>
          {state === "sending" ? "Отправляю…" : "Отправить"}
        </button>
      </div>
    </div>
  );
}

export function ContactForms() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {TOPICS.map((t) => (
        <ContactCard key={t.topic} t={t} />
      ))}
    </div>
  );
}
