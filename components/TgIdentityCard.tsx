"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOceanToken, getOceanName, oceanSignOut, OCEAN_API } from "@/lib/ocean";

// Карточка личности в кабинете для Telegram-входа. Вход через TG живёт в
// океан-слое (веб-токен в localStorage), а не в NextAuth — раньше карточка
// смотрела только на NextAuth и после успешного входа продолжала звать
// «Войти» (баг Адиля 15.07). Теперь: токен есть → профиль + «Выйти».
export function TgIdentityCard() {
  const router = useRouter();
  // null до маунта — SSR не знает про localStorage
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setAuthed(Boolean(getOceanToken()));
      setName(getOceanName());
    };
    sync();
    window.addEventListener("tl-ocean-auth", sync);
    return () => window.removeEventListener("tl-ocean-auth", sync);
  }, []);

  // Фото профиля Telegram: deep-link вход photo_url не приносит — бэк отдаёт
  // байты через Bot API (/me/avatar). <img> не умеет Authorization → fetch+blob.
  useEffect(() => {
    if (!authed) return;
    let alive = true;
    let url: string | null = null;
    fetch(OCEAN_API + "/me/avatar", {
      headers: { Authorization: "web " + (getOceanToken() ?? "") },
    })
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => {
        if (b && alive) {
          url = URL.createObjectURL(b);
          setAvatar(url);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [authed]);

  if (authed === null) return <div className="min-h-[92px] min-w-[220px]" aria-hidden="true" />;

  if (!authed) {
    // анониму шапка вход не дублирует (Адиль 17.07 «2 раза тг — дико»):
    // единственная TG-кнопка живёт в океан-блоке ниже
    return null;
  }

  return (
    <div className="flex items-center gap-4 rounded-[8px] border border-line bg-subtle p-4">
      {avatar ? (
        <img src={avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line-2 bg-card text-[16px] font-medium text-ink">
          {(name ?? "T").slice(0, 1).toUpperCase()}
        </div>
      )}
      <div>
        <div className="text-[15px] font-medium text-ink">{name ?? "Аккаунт Telegram"}</div>
        <div className="text-[12px] text-faint">вход через Telegram · прогресс общий с Mini App</div>
        <button
          onClick={() => {
            oceanSignOut();
            router.refresh();
          }}
          className="mt-1 text-[12px] text-text-2 hover:text-ink"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
