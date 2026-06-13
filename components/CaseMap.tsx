"use client";

import { useMemo, useState } from "react";
import geo from "@/content/case-geo.json";

// Кейсы на карте мира: реальные бизнесы отмечены пинами по своим городам.
// Плоская карта (equirectangular) — все точки видны разом, без WebGL.

type GeoCase = { slug: string; title: string; badge: string; place: string; lat: number; lng: number };
const CASES = geo as GeoCase[];

function outcome(badge: string): { color: string; label: string } {
  if (badge?.includes("Провал")) return { color: "#e8604f", label: "Провал" };
  if (badge?.includes("Успех")) return { color: "#2fc394", label: "Успех" };
  return { color: "#e3b65c", label: "Опыт" };
}

// проекция откалибрована под сгенерированную текстуру earth-map.png
// (континенты в ней не строго по equirectangular — экватор ниже центра)
function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 100;
  const y = 52 - lat * 0.345; // экватор ~50%, шир. 55° ~33% — подгонка под карту
  return { x, y };
}

export function CaseMap() {
  const [active, setActive] = useState<number | null>(null);

  // лёгкий разброс совпадающих координат, чтобы пины в одном городе не слипались
  const pins = useMemo(() => {
    const seen: Record<string, number> = {};
    return CASES.map((c) => {
      const key = `${c.lat.toFixed(1)},${c.lng.toFixed(1)}`;
      const n = (seen[key] = (seen[key] ?? 0) + 1);
      const ang = n * 2.4;
      const rad = n === 1 ? 0 : 0.7 + n * 0.25;
      const p = project(c.lat, c.lng);
      return { c, x: p.x + Math.cos(ang) * rad, y: p.y + Math.sin(ang) * rad, o: outcome(c.badge) };
    });
  }, []);

  return (
    <div className="relative w-full">
      <div
        className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-white/10"
        style={{
          aspectRatio: "2 / 1",
          backgroundImage: "url('/brand/earth-map.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "inset 0 0 80px rgba(2,10,18,0.6)",
        }}
      >
        {pins.map((p, i) => (
          <button
            key={p.c.slug}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: active === i ? 30 : 10 }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive((v) => (v === i ? null : v))}
            onClick={() => (window.location.href = `/cases/${p.c.slug}`)}
            aria-label={`${p.c.title} — ${p.c.place}`}
          >
            {/* пульс */}
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ width: 14, height: 14, background: p.o.color, opacity: 0.25, animation: "case-pin-pulse 2.4s ease-out infinite", animationDelay: `${(i % 7) * 0.3}s` }}
            />
            {/* точка */}
            <span
              className="relative block rounded-full ring-2 ring-white/30 transition-transform duration-200 group-hover:scale-150"
              style={{ width: 8, height: 8, background: p.o.color, boxShadow: `0 0 8px ${p.o.color}` }}
            />
            {/* тултип */}
            {active === i && (
              <span className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-white/15 bg-navy-900/95 px-3.5 py-2 text-center shadow-[0_12px_32px_rgba(2,10,18,0.7)] backdrop-blur">
                <span className="block text-[11px] font-bold uppercase tracking-wide" style={{ color: p.o.color }}>
                  {p.o.label} · {p.c.place}
                </span>
                <span className="mt-0.5 block text-[13px] font-semibold leading-snug text-foam">{p.c.title}</span>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* легенда */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-foam/70">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#e8604f]" /> провал</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#2fc394]" /> успех</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#e3b65c]" /> опыт</span>
        <span className="ml-auto text-foam/45">реальные бизнесы по всему миру · наведись или нажми</span>
      </div>
    </div>
  );
}
