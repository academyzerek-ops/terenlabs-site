"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OCEAN_API } from "@/lib/ocean";

// Живые события Океана: всплывающие карточки «Оксана — теперь Барракуда».
// Только РЕАЛЬНЫЕ переходы из /activity (ничего не выдумываем — канон бренда);
// ротация по кругу, интригует механикой уровней без слова «игра».
type ActEntry = { name: string; level: string; when: string };

const LEVEL_NOM: Record<string, { name: string; img: string }> = {
  crab: { name: "Краб", img: "/brand/ranks/krab.png?v=11" },
  barracuda: { name: "Барракуда", img: "/brand/ranks/barrakuda.png?v=11" },
  dolphin: { name: "Дельфин", img: "/brand/ranks/delfin.png?v=11" },
  shark: { name: "Акула", img: "/brand/ranks/akula.png?v=11" },
  whale: { name: "Кит", img: "/brand/ranks/kit.png?v=11" },
};

function timeAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 3600) return "только что";
  if (d < 86400) return `${Math.floor(d / 3600)} ч назад`;
  const days = Math.floor(d / 86400);
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн назад`;
  return `${Math.floor(days / 7)} нед назад`;
}

export function OceanLiveToasts() {
  const [entries, setEntries] = useState<ActEntry[]>([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    fetch(OCEAN_API + "/activity?limit=10")
      .then((r) => r.json())
      .then((d) => setEntries((d.entries || []).filter((e: ActEntry) => LEVEL_NOM[e.level])))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!entries.length || dismissed) return;
    let i = 0;
    let alive = true;
    const cycle = () => {
      if (!alive) return;
      setIdx(i % entries.length);
      setVisible(true);
      timers.current.push(setTimeout(() => setVisible(false), 6000));
      i += 1;
      // пауза между событиями длиннее, чем показ — не назойливо
      timers.current.push(setTimeout(cycle, 14000));
    };
    timers.current.push(setTimeout(cycle, 3500));
    return () => {
      alive = false;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [entries, dismissed]);

  const e = entries[idx];
  if (!e || dismissed) return null;
  const lvl = LEVEL_NOM[e.level];

  return (
    <div
      className={`tl-toast fixed bottom-5 left-5 z-40 ${visible ? "tl-toast--in" : "tl-toast--out"}`}
      role="status"
    >
      <Link
        href="/ocean"
        className="flex items-center gap-3 rounded-2xl border border-white/15 bg-navy-900/85 py-3 pl-3 pr-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform hover:-translate-y-0.5"
      >
        <span className="tl-toast-glow relative shrink-0">
          <img src={lvl.img} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foam">
            {e.name} — теперь {lvl.name}
          </span>
          <span className="block text-xs text-foam/55">
            {timeAgo(e.when)} · уровни «Океан» →
          </span>
        </span>
        <button
          type="button"
          aria-label="Скрыть"
          onClick={(ev) => {
            ev.preventDefault();
            setDismissed(true);
          }}
          className="ml-1 shrink-0 rounded-full p-1 text-foam/40 hover:text-foam"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </Link>
    </div>
  );
}
