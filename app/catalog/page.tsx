import { Container } from "@/components/Container";
import Link from "next/link";
import Image from "next/image";
import { SpatialCatalog } from "@/components/SpatialCatalog";
import { PosterArchive } from "@/components/PosterArchive";
import { CatalogFilters } from "@/components/CatalogFilters";
import { Suspense } from "react";
import { CATALOG } from "@/lib/content";
import type { ProductType } from "@/lib/content";

export const metadata = {
  alternates: { canonical: "/catalog" }, title: "Каталог — TerenLabs" };

// Осмысленная герой-шапка для каждого раздела (не безликое «Всё в одном месте»)
const SECTION: Record<
  ProductType | "all",
  { eyebrow: string; title: string; desc: string; img?: string; glow?: string }
> = {
  all: {
    eyebrow: "Каталог",
    title: "Всё, что двигает бизнес",
    desc: "Курсы, тесты, кейсы, обзоры и финмодели — фильтруй по своей задаче.",
    img: "/lessons/arch_m1-ch00_chessboard-ocean.jpg",
  },
  course: {
    eyebrow: "Академия",
    title: "Модули, которые экономят время",
    desc: "Короткие главы без «воды» и книжной теории. Только то, что нужно на практике. Комплексный материал простым языком, который не напрягает.",
    img: "/lessons/arch_m5-ch01_five-step-staircase.jpg",
    glow: "rgba(0, 183, 194, 0.18)", // зона Академии — родная бирюза
  },
  test: {
    eyebrow: "Проверка",
    title: "Узнай свой ранг «Океан»",
    desc: "Тесты, которые нельзя угадать — только понять. С разбором каждого ответа.",
    img: "/lessons/arch_m7-ch04_readiness-compass.jpg",
    glow: "rgba(84, 104, 232, 0.22)", // зона Океана — ультрамарин
  },
  case: {
    eyebrow: "Кейсы",
    title: "Чужой опыт — лучший учитель",
    desc: "Умный учится на чужих ошибках. Разбираем реальные ситуации: где теряют деньги и как этого не допустить.",
    img: "/lessons/arch_m7-ch01_breached-hull.jpg",
    glow: "rgba(212, 168, 43, 0.16)", // зона кейсов — янтарь опыта
  },
  review: {
    eyebrow: "Аналитика",
    title: "Аналитика малого бизнеса",
    desc: "Вникаем в реальный сектор и смотрим риски: спрос, конкуренция, маржа.",
    img: "/lessons/fund_m6-ch01_asset-lens_v2.jpg",
    glow: "rgba(143, 184, 203, 0.22)", // зона обзоров — ледяная вода
  },
  finmodel: {
    eyebrow: "Финпродукты",
    title: "Рабочие инструменты под проект",
    desc: "Интерактивные финмодели и бизнес-планы. Меняешь допущения — видишь результат.",
    img: "/lessons/fund_m5-ch05_coin-mountain.jpg",
    glow: "rgba(43, 168, 136, 0.2)", // зона: денежный изумруд
  },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const t = typeof sp.type === "string" ? sp.type : "all";
  const s = SECTION[(t as ProductType) in SECTION ? (t as ProductType) : "all"] ?? SECTION.all;
  const f = typeof sp.filter === "string" ? sp.filter : "all";
  
  // Категории обзоров — отраслевые вертикали; каждая ниша ровно в одной (хардкод, пока нет в JSON)
  const REVIEW_CATS: Record<string, string[]> = {
    food: ["review-bubbletea", "review-canteen", "review-catering", "review-coffee", "review-confection", "review-doner", "review-fastfood", "review-fruitsvegs", "review-grocery", "review-meatshop", "review-pizza", "review-semifood", "review-sushi", "review-waterplant"],
    beauty: ["review-barber", "review-beauty", "review-brow-lash", "review-cosmetology", "review-epilation", "review-manicure", "review-massage"],
    sport: ["review-cross-fit", "review-fitness", "review-group-fitness", "review-martial-arts", "review-football-school", "review-dental"],
    auto: ["review-auto-parts", "review-autoservice", "review-carwash", "review-detailing", "review-tire-service", "review-driving"],
    retail: ["review-flowers", "review-furniture", "review-loft-furniture", "review-optics", "review-pharmacy", "review-pet-shop", "review-build-mat"],
    service: ["review-accounting", "review-notary", "review-evaluation", "review-realtor", "review-clean", "review-carpet-clean", "review-dry-clean", "review-tailor", "review-repair-phone", "review-hotel", "review-cargo", "review-pvz"],
    kids: ["review-kids-center", "review-kindergarten", "review-cinema", "review-comp-club"],
  };

  const items = CATALOG.filter((p) => {
    const typeMatch = t === "all" || p.type === t;
    if (!typeMatch) return false;
    if (f === "all") return true;
    
    // Кейсы — цвет исхода как в Mini App: тэг витрины r/y/g (бейдж — фолбэк)
    if (t === "case") {
      const tag = p.tag ?? (p.badge === "Провал" ? "r" : p.badge === "Успех" ? "g" : "y");
      return tag === f;
    }
    
    // Для обзоров
    if (t === "review" && f in REVIEW_CATS) {
      return REVIEW_CATS[f].includes(p.slug);
    }
    
    return p.level.includes(f) || p.topic.includes(f) || p.stage.includes(f);
  });

  
  // Кейсы — кураторский порядок витрины Mini App (не перемешивать).
  // Аналитику перемешиваем, чтобы не было застоя; Академия — в порядке обучения.
  const shuffledItems = t === "review" ? [...items].sort(() => Math.random() - 0.5) : items;


  return (
    <>
      {/* Герой раздела: Editorial High-End Style */}
      <section className="grain-fine vignette relative overflow-hidden bg-navy-900">
        {s.img && (
          <div className="absolute inset-0 scale-105 blur-[2px] opacity-40">
            <Image src={s.img} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>
        )}
        
        {/* Градиенты глубины */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/40 via-navy-900/80 to-navy-900" />
        {s.glow && (
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(80% 100% at 20% 20%, ${s.glow}, transparent 70%)` }}
          />
        )}

        {/* компактный ритм: первый ряд карточек должен заглядывать в первый экран */}
        <Container className="relative z-10 pt-20 pb-2 sm:pt-24 sm:pb-4">
          <div className="flex items-center gap-4 mb-5 rise">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-teal">
              {s.eyebrow}
            </span>
            <div className="h-px w-20 bg-teal/30" />
          </div>

          <h1
            className="rise max-w-4xl text-4xl font-black !text-foam sm:text-6xl leading-[0.98]"
            style={{ animationDelay: "100ms", letterSpacing: "-0.03em" }}
          >
            {s.title}
          </h1>

          <p
            className="rise mt-5 max-w-2xl text-lg leading-relaxed text-foam/60 sm:text-xl font-light"
            style={{ animationDelay: "200ms" }}
          >
            {s.desc}
          </p>

          {/* Декоративный штрих снизу */}
          <div className="mt-8 h-px w-full bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />
          <Suspense fallback={null}><CatalogFilters type={t} /></Suspense>
        </Container>
      </section>

      {/* Кейсы и обзоры — bento-архив на кинокадрах (сетка масштабируется на сотни
          позиций); остальные типы — пространственная лента (Sonar Scan) */}
      {t === "case" ? (
        // только кейсы витрины Mini App (с цвет-тэгом); тренажёр case-marketplace —
        // сайтовый интерактив, живёт на уровне Ракушки, в архиве кейсов ему не место
        <PosterArchive items={items.filter((p) => p.tag)} kind="case" />
      ) : t === "review" && items.length > 0 ? (
        <PosterArchive items={items} kind="review" />
      ) : items.length > 0 ? (
        <SpatialCatalog items={shuffledItems} />
      ) : (
        <div className="deck py-24">
          <Container>
            <div className="rounded-[var(--radius-tl)] border border-dashed border-line bg-card p-12 text-center">
              <p className="text-heading">В этом разделе пока пусто</p>
              <Link
                href="/catalog"
                className="mt-5 inline-block rounded-[var(--radius-tl)] bg-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-600"
              >
                Показать все
              </Link>
            </div>
            <Suspense fallback={null}><CatalogFilters type={t} /></Suspense>
        </Container>
        </div>
      )}
    </>
  );
}
