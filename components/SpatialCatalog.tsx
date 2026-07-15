"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { CatalogItem } from "@/lib/content";
import { caseTag } from "./CaseCard";

// цвет-тэги исходов кейса — палитра витрины Mini App (.case-tag r/y/g)
const CASE_TONES = {
  r: { label: "Красный", color: "#FF6B6B" },
  y: { label: "Жёлтый", color: "#FFD600" },
  g: { label: "Зелёный", color: "#00E676" },
} as const;

/**
 * SpatialCatalog v3 — Native Precision & Performance.
 * Убрали Scroll Hijack (пиннинг), перешли на нативный горизонтальный скролл.
 * Добавлены физические стрелки управления.
 */
export function SpatialCatalog({ items }: { items: CatalogItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const displayItems = useMemo(() => items, [items]);

  const updateArrows = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    // Из-за погрешностей скролла берем запас в пару пикселей
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 10);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [displayItems]);

  const scrollBy = (dir: number) => {
    if (!scrollRef.current) return;
    // Скроллим на 2-3 карточки за раз
    const amount = window.innerWidth > 768 ? 800 * dir : window.innerWidth * 0.8 * dir;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };


  // Поддержка вертикального колесика мыши для горизонтального скролла
  const handleWheel = useCallback((e: WheelEvent) => {
    // Если скролл идет по оси X (тачпад), не вмешиваемся
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    
    if (scrollRef.current) {
      e.preventDefault();
      scrollRef.current.scrollBy({
        left: e.deltaY * 1.5, // умножаем для комфортной скорости на мышке
        behavior: "auto" // auto вместо smooth, чтобы не было лагов при непрерывном кручении колесика
      });
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      // Использовать passive: false необходимо для e.preventDefault()
      el.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (el) el.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // Sonar Spotlight (луч фонаря)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (spotlightRef.current) {
      const x = e.clientX;
      const y = e.clientY;
      spotlightRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="group/catalog relative w-full overflow-hidden bg-[#06182a]"
    >
      {/* Sonar Spotlight */}
      <div 
        ref={spotlightRef}
        className="pointer-events-none fixed left-0 top-0 z-20 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,183,194,0.1)_0%,transparent_70%)] opacity-0 transition-opacity duration-1000 group-hover/catalog:opacity-100"
      />

      {/* Фоновый текст (Static but Deep) */}
      <div className="absolute left-[10vw] top-1/2 -translate-y-1/2 select-none opacity-[0.02]">
        <span className="font-black text-[35vw] leading-none text-teal uppercase tracking-tighter">
          SCAN
        </span>
      </div>

      {/* Кнопки управления (Desktop) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-30 flex w-24 md:w-32 items-center justify-start pl-4 md:pl-8">
        <button
          onClick={() => scrollBy(-1)}
          disabled={!canScrollLeft}
          className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-navy-900/60 text-foam backdrop-blur-xl transition-all duration-300 ${
            canScrollLeft ? "opacity-100 hover:scale-110 hover:border-teal/50" : "pointer-events-none opacity-0"
          }`}
          aria-label="Назад"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 z-30 flex w-24 md:w-32 items-center justify-end pr-4 md:pr-8">
        <button
          onClick={() => scrollBy(1)}
          disabled={!canScrollRight}
          className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-navy-900/60 text-foam backdrop-blur-xl transition-all duration-300 ${
            canScrollRight ? "opacity-100 hover:scale-110 hover:border-teal/50" : "pointer-events-none opacity-0"
          }`}
          aria-label="Вперед"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* Нативный горизонтальный контейнер */}
      <div 
        ref={scrollRef}
        onScroll={updateArrows}
        className="no-scrollbar relative z-10 flex items-center gap-8 overflow-x-auto overscroll-x-contain px-8 py-10 scroll-smooth md:gap-16"
        style={{ scrollSnapType: "x proximity", minHeight: "540px", paddingLeft: "max(2rem, 10vw)", paddingRight: "max(2rem, 10vw)" }}
        >
        {displayItems.map((item, i) => (
          <div 
            key={item.slug} 
            className="relative shrink-0 will-change-transform transition-all duration-500 hover:z-20"
            style={{ 
              marginTop: i % 2 === 0 ? "-4vh" : "4vh",
              scrollSnapAlign: "center"
            }}
          >
            <Link href={item.href} className="block no-underline outline-none">
              <div className="group relative rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-1.5 shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:border-teal/30 focus-visible:border-teal"
              style={{ width: "min(85vw, 340px)", height: "min(70vh, 480px)" }}>
                <div className="relative h-full w-full overflow-hidden rounded-[calc(2.5rem-0.375rem)] bg-navy-900">
                  
                  {item.img ? (
                    <Image 
                      src={item.img} 
                      alt={item.title} 
                      fill 
                      sizes="(max-width: 768px) 300px, 340px"
                      className="object-cover opacity-70 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-navy-950 text-7xl opacity-10">
                      {item.ico || "📦"}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#06182a] via-[#06182a]/20 to-transparent pointer-events-none" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-teal shadow-[0_0_8px_rgba(0,183,194,1)]" />
                      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-teal/70">
                        {item.type}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-black leading-[1.1] tracking-tight text-white transition-colors group-hover:text-teal-50">
                      {item.title}
                    </h3>

                    {item.price && (
                       <div className="mt-5 inline-flex items-center rounded-full border border-white/5 bg-white/5 px-3 py-1">
                         <span className="num text-[10px] font-bold text-foam/60">{item.price}</span>
                       </div>
                    )}
                  </div>

                  {item.type === "case" ? (
                    // кейс — как в Mini App: цвет-тэг исхода + гео-флаг
                    <div className="absolute inset-x-6 top-6 flex items-center justify-between">
                      <div
                        className="rounded-xl border border-white/10 bg-black/40 px-2 py-1 text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm"
                        style={{ color: CASE_TONES[caseTag(item)].color }}
                      >
                        {CASE_TONES[caseTag(item)].label}
                      </div>
                      {item.loc && (
                        <span className="num text-[10px] font-medium tracking-[0.06em] text-foam/60">
                          {item.loc}
                        </span>
                      )}
                    </div>
                  ) : (
                    item.badge && (
                      <div className="absolute right-6 top-6">
                        <div className="rounded-xl border border-white/10 bg-black/40 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-foam/40 backdrop-blur-sm">
                          {item.badge}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </Link>

            <div className="mt-6 max-w-[340px] px-4 opacity-70 transition-all duration-500 group-hover:opacity-100">
               <p className="text-[0.95rem] leading-relaxed text-white font-medium italic">
                 {item.blurb}
               </p>
            </div>
          </div>
        ))}

        <div className="flex w-[20vw] shrink-0 flex-col items-center justify-center text-center opacity-10">
            <div className="h-px w-12 bg-teal/30 mb-4" />
            <span className="text-xs tracking-[0.3em] uppercase">Sector End</span>
        </div>
      </div>
    </section>
  );
}
