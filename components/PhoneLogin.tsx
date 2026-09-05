"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { smsStart, smsVerify } from "@/lib/ocean";

// Вход по номеру: код приходит СМС (провайдер на бэкенде). Два шага в одной карточке.
const INPUT =
  "h-11 w-full rounded-[8px] border border-line-2 bg-transparent px-3 text-[16px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent";
const BTN =
  "btn-press inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-accent-600 px-4 text-[15px] font-medium text-[#fff] transition-colors hover:bg-[#1f74c9] disabled:cursor-default disabled:opacity-50";

export function PhoneLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState("+7");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const start = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await smsStart(phone);
      setSentTo(r.phone);
      setDebugCode(r.debug_code ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "не получилось отправить код");
    } finally { setBusy(false); }
  };

  const verify = async () => {
    if (!sentTo) return;
    setBusy(true); setErr(null);
    try {
      const auth = await smsVerify(sentTo, code);
      router.push(auth.needs_onboarding ? "/auth/onboarding" : "/dashboard");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "код не подошёл");
    } finally { setBusy(false); }
  };

  if (sentTo) {
    return (
      <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void verify(); }}>
        <p className="text-[14px] text-text-2">
          Код отправлен на <span className="num text-ink">{sentTo}</span>.{" "}
          <button type="button" className="link text-[14px]" onClick={() => { setSentTo(null); setCode(""); setErr(null); }}>
            Другой номер
          </button>
        </p>
        <input
          className={`${INPUT} num tracking-[0.2em]`}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="••••••"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          autoFocus
        />
        {debugCode && <p className="text-[12px] text-faint">Режим разработки: код {debugCode}</p>}
        {err && <p className="text-[13px] text-danger">{err}</p>}
        <button type="submit" className={BTN} disabled={busy || code.length < 6}>Войти</button>
        <button type="button" className="text-[13px] text-faint hover:text-ink" disabled={busy} onClick={() => void start()}>
          Отправить код ещё раз
        </button>
      </form>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void start(); }}>
      <input
        className={`${INPUT} num`}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+7 700 000 00 00"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      {err && <p className="text-[13px] text-danger">{err}</p>}
      <button type="submit" className={BTN} disabled={busy || phone.replace(/\D/g, "").length < 10}>
        Получить код в СМС
      </button>
    </form>
  );
}
