import Link from "next/link";
import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";
import { ACADEMY } from "@/lib/learn";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Предприниматель · Россия",
  description:
    "Та же программа своего дела, пересобранная под российский рынок: рубли, свои налоги и правовые формы, узнаваемые бренды в примерах. Готовится.",
  path: "/delo/ru",
});

// Рынок РФ хаба «Предприниматель». Отдельный корпус, а не переключатель валюты:
// методология и структура те же, но налоги, правовые формы, цены и узнаваемые
// бренды в примерах — другие (канон 16_HUBS.md, раздел 3.4).
// Пока заглушка: показываем программу, чтобы архитектура была видна.
// Казахстанская версия живёт на /delo и остаётся неизменной.

// Что меняется в каждом треке при переносе — по треку одной строкой.
const CHANGES: Record<string, string> = {
  "course-fundament": "Примеры покупок и цен — российские, валюта рубли.",
  "course-architect": "Методология без изменений, кейсы на знакомых рынку компаниях.",
  "course-management": "Трудовые отношения и оформление людей по российскому праву.",
  "course-marketing": "Каналы и площадки, которые реально работают на рынке РФ.",
  "course-finance": "Учёт, режимы налогообложения и отчётность — российские.",
  "course-legal": "Полностью переписывается: ИП и ООО, режимы, проверки, договоры.",
  "course-models": "Модели те же, экономика пересчитана в рублях.",
};

export default function DeloRuPage() {
  const tracks = ACADEMY.filter((t) => (t.hub ?? "delo") === "delo");
  const chapters = tracks.reduce((n, t) => n + t.chapterTotal, 0);

  return (
    <>
      <section className="border-b border-line">
        <Container className="py-14 sm:py-20">
          <p className="eyebrow">Предприниматель · Россия</p>
          <h1 className="mt-3 max-w-[20ch] text-[24px] sm:text-[40px]">
            То же дело, другой рынок
          </h1>
          <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">
            Математика своего дела не зависит от страны, а вот всё вокруг неё зависит: налоговые
            режимы, формы регистрации, трудовое право, цены на аренду и людей, площадки для
            продвижения. Поэтому российская версия — это не перевод казахстанской и не смена
            валюты в интерфейсе, а отдельный корпус глав.
          </p>
          <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-text-2">
            Программа ниже зафиксирована, главы готовятся. Пока читать нечего, но видно, из чего
            раздел будет собран и что в нём поменяется.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href="/startup">
              Пока читать «Фаундера» <Arrow />
            </Button>
            <Link href="/delo" className="link text-[15px]">
              Версия для Казахстана
            </Link>
          </div>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-9 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
            <h2 className="text-[20px] sm:text-[24px]">Программа</h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              {tracks.length} треков, {chapters} глав — столько же, сколько в казахстанской версии.
              Справа от каждого трека сказано, что именно в нём меняется при переносе.
            </p>
          </div>

          <div className="mt-8 sm:mt-10">
            {tracks.map((t, i) => (
              <div
                key={t.slug}
                className="grid gap-3 border-t border-line py-6 sm:grid-cols-[56px_260px_minmax(0,1fr)] sm:gap-6"
              >
                <span className="num text-[13px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <h3 className="text-[16px]">{t.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-text-2">
                    {t.chapterTotal} глав
                  </p>
                  <span className="tag mt-3 inline-block">Готовится</span>
                </div>
                <p className="min-w-0 max-w-[64ch] text-[14px] leading-relaxed text-text-2">
                  {CHANGES[t.slug] ?? "Пересобирается под российский рынок."}
                </p>
              </div>
            ))}
            <div className="border-t border-line" />
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-10 sm:py-16">
          <div className="panel grid gap-4 p-7 sm:p-10">
            <p className="eyebrow">Что уже доступно</p>
            <h2 className="text-[20px] sm:text-[24px]">Три хаба работают независимо от страны</h2>
            <p className="max-w-[64ch] text-[15px] leading-relaxed text-text-2">
              «Фундамент», «Фаундер» и «Инвестор» не привязаны к рынку: механика денег, раунды,
              доли и оценка устроены одинаково везде. Их можно читать прямо сейчас, не дожидаясь
              российского корпуса.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
              <Link href="/money" className="link text-[15px]">
                Фундамент <Arrow />
              </Link>
              <Link href="/startup" className="link text-[15px]">
                Фаундер <Arrow />
              </Link>
              <Link href="/invest" className="link text-[15px]">
                Инвестор <Arrow />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
