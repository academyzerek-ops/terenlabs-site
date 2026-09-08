"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginTelegram } from "@/lib/ocean";

// Коллбэк Telegram Login Widget в redirect-режиме (data-auth-url) — для
// нативного приложения: попапы в WKWebView зажаты, весь вход идёт в одном
// окне. Виджет редиректит сюда с подписанными параметрами (id, hash,
// auth_date…), мы обмениваем их на веб-токен Океана.
//
// Токен и имя loginTelegram кладёт сам, поэтому просто уходим обратно на сайт:
// в кабинет или туда, откуда человек начал вход.

function Inner() {
  const params = useSearchParams();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const user: Record<string, unknown> = {};
    for (const [k, v] of params.entries()) {
      user[k] = k === "id" || k === "auth_date" ? Number(v) : v;
    }
    if (!user.id || !user.hash) {
      setErr("Не хватает данных от Telegram — попробуй войти ещё раз.");
      return;
    }
    loginTelegram(user)
      .then(() => {
        // куда вернуться: параметр next, если он свой, иначе кабинет
        const next = params.get("next");
        window.location.replace(next && next.startsWith("/") ? next : "/dashboard");
      })
      .catch(() => setErr("Не получилось войти — попробуй ещё раз."));
  }, [params]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 text-center">
      <p role="status" aria-live="polite" className="text-[14px] text-text-2">
        {err ?? "Входим через Telegram…"}
      </p>
    </div>
  );
}

export default function TgCallbackPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
