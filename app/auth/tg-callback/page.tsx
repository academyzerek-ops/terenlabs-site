"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginTelegram } from "@/lib/ocean";

// Коллбэк Telegram Login Widget в redirect-режиме (data-auth-url) — для
// нативного приложения: попапы в WKWebView зажаты, весь вход идёт в одном
// окне. Виджет редиректит сюда с подписанными параметрами (id, hash,
// auth_date…); обмениваем их на веб-токен Океана и возвращаемся в Mini App
// с токеном во фрагменте (#tl_login=…) — фрагмент на сервер не уходит.
const MINIAPP =
  "https://terenlabs-production.up.railway.app/frontend/shell/app.html";

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
      .then((out) => {
        const name = encodeURIComponent(out.display_name ?? "");
        window.location.replace(
          `${MINIAPP}#tl_login=${encodeURIComponent(out.token)}&name=${name}`
        );
      })
      .catch(() => setErr("Не получилось войти — попробуй ещё раз."));
  }, [params]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 text-center">
      <p className="text-sm text-muted">
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
