import { Container } from "@/components/Container";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { ProductType } from "@/lib/content";

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

  return (
    <>
      {/* Герой-шапка раздела — глубинный навы-блок */}
      <section className="deep grain">
        <Container className="relative z-10 flex items-center gap-6 py-14 sm:py-16">
          {s.img && (
            <img
              src={s.img}
              alt=""
              width={224}
              height={128}
              className="hidden h-28 w-44 shrink-0 rounded-2xl border border-white/10 object-cover shadow-[var(--shadow-tl)] sm:block"
            />
          )}
          <div>
            <p className="eyebrow">{s.eyebrow}</p>
            <h1 className="mt-2 text-3xl !text-foam sm:text-4xl lg:text-5xl">{s.title}</h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-foam/70">{s.desc}</p>
          </div>
        </Container>
      </section>

      <div className="deck py-14">
        <Container>
          <CatalogBrowser initialType={t === "all" ? undefined : t} />
        </Container>
      </div>
    </>
  );
}
