import { Container } from "@/components/Container";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogFilters } from "@/components/CatalogFilters";
import { ProductCard } from "@/components/ProductCard";
import { CATALOG } from "@/lib/content";
import type { ProductType } from "@/lib/content";
import { rotateByDay } from "@/lib/rotation";

export const metadata = {
  alternates: { canonical: "/catalog" },
  title: "Каталог — TerenLabs",
};

// Шапка раздела: текст, без кадров и свечений
const SECTION: Record<ProductType | "all", { eyebrow: string; title: string; desc: string }> = {
  all: {
    eyebrow: "Каталог",
    title: "Всё, что двигает бизнес",
    desc: "Курсы, тесты, кейсы, обзоры и финмодели. Фильтруй по своей задаче.",
  },
  course: {
    eyebrow: "Академия",
    title: "Модули, которые экономят время",
    desc: "Короткие главы без воды и книжной теории. Только то, что нужно на практике.",
  },
  test: {
    eyebrow: "Проверка",
    title: "Узнай свой ранг «Океан»",
    desc: "Тесты, которые нельзя угадать, только понять. С разбором каждого ответа.",
  },
  case: {
    eyebrow: "Кейсы · Своё дело",
    title: "Чужой опыт как учитель",
    desc: "Разбираем реальные ситуации малого бизнеса: где теряют деньги и как этого не допустить.",
  },
  review: {
    eyebrow: "Своё дело · Ниши",
    title: "Обзоры ниш",
    desc: "Как устроен рынок в конкретной нише: спрос, конкуренция, маржа и где обычно теряют деньги.",
  },
  bm: {
    eyebrow: "Кейсы · Стартап",
    title: "Откуда бабки у больших",
    desc: "Из чего собран денежный поток мировых компаний, чем за это платят и какая развилка достаётся вам. Всё в долларах, каждая цифра с источником.",
  },
  finmodel: {
    eyebrow: "Финпродукты",
    title: "Рабочие инструменты под проект",
    desc: "Интерактивные финмодели и бизнес-планы. Меняешь допущения, видишь результат.",
  },
};

// Категории обзоров: каждая ниша ровно в одной
const REVIEW_CATS: Record<string, string[]> = {
  food: ["review-bubbletea", "review-canteen", "review-catering", "review-coffee", "review-confection", "review-doner", "review-fastfood", "review-fruitsvegs", "review-grocery", "review-meatshop", "review-pizza", "review-semifood", "review-sushi", "review-waterplant"],
  beauty: ["review-barber", "review-beauty", "review-brow-lash", "review-cosmetology", "review-epilation", "review-manicure", "review-massage"],
  sport: ["review-cross-fit", "review-fitness", "review-group-fitness", "review-martial-arts", "review-football-school", "review-dental"],
  auto: ["review-auto-parts", "review-autoservice", "review-carwash", "review-detailing", "review-tire-service", "review-driving"],
  retail: ["review-flowers", "review-furniture", "review-loft-furniture", "review-optics", "review-pharmacy", "review-pet-shop", "review-build-mat"],
  service: ["review-accounting", "review-notary", "review-evaluation", "review-realtor", "review-clean", "review-carpet-clean", "review-dry-clean", "review-tailor", "review-repair-phone", "review-hotel", "review-cargo", "review-pvz"],
  kids: ["review-kids-center", "review-kindergarten", "review-cinema", "review-comp-club"],
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

  const items = CATALOG.filter((p) => {
    if (t !== "all" && p.type !== t) return false;
    // общий вид: обучение и кейсы; ниши и финпродукты живут по своим адресам
    if (t === "all" && (p.type === "review" || p.type === "finmodel")) return false;
    // кейсы витрины: только с цвет-тэгом (тренажёр живёт на уровне Ракушки)
    if (t === "case" && !p.tag) return false;
    if (f === "all") return true;
    if (t === "case") {
      const tag = p.tag ?? (p.badge === "Провал" ? "r" : p.badge === "Успех" ? "g" : "y");
      return tag === f;
    }
    if (t === "review" && f in REVIEW_CATS) return REVIEW_CATS[f].includes(p.slug);
    if (t === "bm") return p.sector === f;
    return p.level.includes(f) || p.topic.includes(f) || p.stage.includes(f);
  });
  const list = t === "review" ? rotateByDay(items) : items;

  return (
    <>
      <section className="border-b border-line">
        <Container className="pb-8 pt-14 sm:pt-20">
          <p className="eyebrow">{s.eyebrow}</p>
          <h1 className="mt-3 text-[36px] sm:text-[48px]">{s.title}</h1>
          <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-text-2">{s.desc}</p>
          {/* кейсы двух потоков: своё дело и стартап */}
          {(t === "case" || t === "bm") && (
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { id: "case", label: "Своё дело" },
                { id: "bm", label: "Стартап · бренды" },
              ].map((o) => (
                <Link
                  key={o.id}
                  href={`/catalog?type=${o.id}`}
                  className={`flex h-8 items-center rounded-[6px] border px-3 text-[14px] transition-colors ${
                    t === o.id ? "border-line-2 bg-subtle text-ink" : "border-line text-text-2 hover:bg-subtle hover:text-ink"
                  }`}
                >
                  {o.label}
                </Link>
              ))}
            </div>
          )}
          <Suspense fallback={null}>
            <CatalogFilters type={t} />
          </Suspense>
        </Container>
      </section>

      <Container className="py-10">
        {list.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard key={`${p.type}-${p.slug}`} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-dashed border-line-2 p-12 text-center">
            <p className="text-ink">В этом разделе пока пусто</p>
            <Link href="/catalog" className="link mt-4 text-[15px]">Показать все</Link>
          </div>
        )}
      </Container>
    </>
  );
}
