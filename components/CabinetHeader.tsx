"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOceanToken, getOceanName, oceanSignOut, OCEAN_API } from "@/lib/ocean";

// Шапка кабинета: имя из Океана (Telegram, Google или номер), одно фото, выход иконкой-дверью.
export function CabinetHeader({ sessionName, sessionImage, signOutAction }: {
  sessionName?: string | null;
  sessionImage?: string | null;
  signOutAction?: () => Promise<void>;
}) {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => { setAuthed(Boolean(getOceanToken())); setName(getOceanName()); };
    sync();
    window.addEventListener("tl-ocean-auth", sync);
    return () => window.removeEventListener("tl-ocean-auth", sync);
  }, []);

  useEffect(() => {
    if (!authed) return;
    let alive = true; let url: string | null = null;
    fetch(OCEAN_API + "/me/avatar", { headers: { Authorization: "web " + (getOceanToken() ?? "") } })
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => { if (b && alive) { url = URL.createObjectURL(b); setAvatar(url); } })
      .catch(() => {});
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [authed]);

  const shown = name || sessionName || null;
  const first = shown ? shown.trim().split(" ")[0] : null;
  const pic = avatar || sessionImage || null;
  const loggedIn = Boolean(authed) || Boolean(sessionName);

  return (
    <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line pb-8">
      <div className="flex items-center gap-4">
        {loggedIn && (pic ? (
          <img src={pic} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-hover text-[16px] font-medium text-ink">
            {(first ?? "T").slice(0, 1).toUpperCase()}
          </div>
        ))}
        <div>
          <p className="eyebrow">Личный кабинет</p>
          <h1 className="mt-1 text-[28px] leading-tight sm:text-[32px]">{first ? `Привет, ${first}` : "Привет"}</h1>
        </div>
      </div>

      {loggedIn ? (
        <button
          onClick={async () => { oceanSignOut(); if (signOutAction) await signOutAction(); router.refresh(); }}
          title="Выйти"
          aria-label="Выйти"
          className="flex h-9 w-9 items-center justify-center rounded-[6px] text-faint transition-colors hover:bg-subtle hover:text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6.5 13.5H3.5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3M10.5 11l3-3-3-3M13.5 8H6.5" />
          </svg>
        </button>
      ) : authed === false ? (
        <Link href="/auth/sign-in" className="link text-[14px]">Войти</Link>
      ) : null}
    </div>
  );
}
