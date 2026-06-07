import { Container } from "@/components/Container";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { CaseGrid } from "@/components/CaseGrid";
import { CATALOG } from "@/lib/content";
import type { ProductType } from "@/lib/content";

export const metadata = { title: "Каталог — TerenLabs" };

// Осмысленная герой-шапка для каждого раздела (не безликое «Всё в одном месте»)
const SECTION: Record<
  ProductType | "all",
  { eyebrow: string; title: string; desc: string; img?: string }
> = {
  all: {
    eyebrow: "Каталог",
    title: "Всё, что двигает бизнес",
    desc: "Курсы, тесты, кейсы, обзоры и финмодели — фильтруй по своей задаче.",
    img: "/lessons/arch_m1-ch00_chessboard-ocean.jpg",
  },
  course: {
    eyebrow: "Академия",
    title: "Учись на реальных деньгах",
    desc: "Модули и кейсы от основ до масштаба. Теория сразу в практику — без воды и мотивашек.",
    img: "/lessons/arch_m5-ch01_five-step-staircase.jpg",
  },
  test: {
    eyebrow: "Проверка",
    title: "Узнай свой ранг «Океан»",
    desc: "Тесты, которые нельзя угадать — только понять. С разбором каждого ответа.",
    img: "/lessons/arch_m7-ch04_readiness-compass.jpg",
  },
  case: {
    eyebrow: "Кейсы",
    title: "Чужие ошибки дешевле своих",
    desc: "Реальные истории казахстанского бизнеса: где потеряли деньги и почему.",
    img: "/lessons/arch_m7-ch01_breached-hull.jpg",
  },
  review: {
    eyebrow: "Обзоры бизнеса",
    title: "Ниша на цифрах, а не на хайпе",
    desc: "Разборы рынков: спрос, конкуренция, маржа. До того, как ты вложишься.",
    img: "/lessons/fund_m6-ch01_asset-lens_v2.jpg",
  },
  finmodel: {
    eyebrow: "Финпродукты",
    title: "Рабочие инструменты под проект",
    desc: "Интерактивные финмодели и бизнес-планы. Меняешь допущения — видишь результат.",
    img: "/lessons/arch_m6-ch01_unit-econ-scale_v2.jpg",
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
  const items = CATALOG.filter((p) => t === "all" || p.type === t);

  return (
    <>
      {/* Герой раздела: кино-кадр во весь блок, заголовок контрастно поверх */}
      <section className="relative overflow-hidden bg-navy-900">
        {s.img && (
          <img
            src={s.img}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* кинематографичный скрим: плотный слева под текстом, тает вправо */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(6,24,42,0.94) 0%, rgba(6,24,42,0.8) 45%, rgba(6,24,42,0.35) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 55%, rgba(6,24,42,0.85) 100%)" }}
        />
        <Container className="relative z-10 py-20 sm:py-24">
          <p className="eyebrow">{s.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-4xl !text-foam sm:text-5xl lg:text-6xl">{s.title}</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-foam/80 sm:text-xl">{s.desc}</p>
        </Container>
      </section>

      <div className="deck py-14">
        <Container>
          {t === "case" ? (
            /* кейсы: цветные фильтры по исходу (красный/зелёный/жёлтый) */
            <CaseGrid items={items} />
          ) : items.length > 0 ? (
            <>
              {t !== "all" && (
                <div className="mb-8 flex justify-end">
                  <Link href="/catalog" className="text-sm font-semibold text-teal-600 hover:text-teal">
                    Показать весь каталог →
                  </Link>
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <ProductCard key={`${p.type}-${p.slug}`} p={p} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-[var(--radius-tl)] border border-dashed border-line bg-card p-12 text-center">
              <p className="text-heading">В этом разделе пока пусто</p>
              <Link
                href="/catalog"
                className="mt-5 inline-block rounded-[var(--radius-tl)] bg-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-600"
              >
                Показать все
              </Link>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
