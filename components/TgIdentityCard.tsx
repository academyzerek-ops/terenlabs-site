"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOceanToken, getOceanName, oceanSignOut } from "@/lib/ocean";

// Карточка личности в кабинете для Telegram-входа. Вход через TG живёт в
// океан-слое (веб-токен в localStorage), а не в NextAuth — раньше карточка
// смотрела только на NextAuth и после успешного входа продолжала звать
// «Войти» (баг Адиля 15.07). Теперь: токен есть → профиль + «Выйти».
export function TgIdentityCard() {
  const router = useRouter();
  // null до маунта — SSR не знает про localStorage
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setAuthed(Boolean(getOceanToken()));
      setName(getOceanName());
    };
    sync();
    window.addEventListener("tl-ocean-auth", sync);
    return () => window.removeEventListener("tl-ocean-auth", sync);
  }, []);

  if (authed === null) return <div className="min-h-[92px] min-w-[220px]" aria-hidden="true" />;

  if (!authed) {
    // анониму шапка вход не дублирует (Адиль 17.07 «2 раза тг — дико»):
    // единственная TG-кнопка живёт в океан-блоке ниже
    return null;
  }

  return (
    <div className="flex items-center gap-4 rounded-[var(--radius-tl)] border border-line bg-card p-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-[#2AABEE] to-[#229ED9] text-lg font-bold text-white">
        {(name ?? "T").slice(0, 1).toUpperCase()}
      </div>
      <div>
        <div className="text-heading">{name ?? "Аккаунт Telegram"}</div>
        <div className="text-xs text-muted">вход через Telegram · прогресс общий с Mini App</div>
        <button
          onClick={() => {
            oceanSignOut();
            router.refresh();
          }}
          className="mt-1 text-xs text-teal-600 hover:text-teal"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
