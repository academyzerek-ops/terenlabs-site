import Link from "next/link";
import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";
import { RankSketch } from "@/components/RankSketch";
import { BRANDS, plural } from "@/lib/content";
import { ACADEMY } from "@/lib/learn";
import { TrackCards } from "@/components/TrackCards";
import { getModel, MODEL_SHOWCASE } from "@/lib/models-data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Фаундер",
  description:
    "Дорожная карта проекта на рост: команда, рынок, бизнес-модель, юнит-экономика, питч, инвестиции. Каждый шаг на примерах мировых компаний. Всё в долларах, без привязки к стране.",
  path: "/startup",
});

// Хаб «Фаундер»: универсальный блок, доллар, весь русскоязычный рынок.
// Описания уроков берём из манифеста трека, отдельного списка здесь нет:
// он отставал от программы после каждой перестройки (09.09.2026).


export default function StartupPage() {
  const brands = BRANDS.filter((b) => !b.stub);
  // программа идёт темами: каждый трек — отдельная тема, как воркшоп в акселераторе
  const tracks = ACADEMY.filter((t) => t.hub === "startup");

  return (
    <>
      <section className="border-b border-line">
        <Container className="py-14 sm:py-20">
          <p className="eyebrow">Фаундер</p>
          <h1 className="mt-3 max-w-[18ch] text-[24px] sm:text-[40px]">Проект на рост: модель, деньги, инвестиции</h1>
          <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">
            Шаги идут по цепочке настоящего проекта: от команды до условий сделки с инвестором.
            Каждый шаг доказан на мировых компаниях: как устроен их заработок и чем за него
            заплачено. Без географии и местных налогов.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href="/catalog?type=bm">
              Разборы брендов <Arrow />
            </Button>
            <Link href="#trek" className="link text-[15px]">
              Программа
            </Link>
          </div>
        </Container>
      </section>

      {/* программа: темы отдельными треками */}
      <section id="trek" className="border-b border-line">
        <Container className="py-9 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
            <h2 className="text-[20px] sm:text-[24px]">Программа</h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              Уроки идут по порядку решений основателя: от развилки «своя выручка или
              чужие деньги» до выхода. Каждый урок это отдельный трек, проходить можно
              в любом порядке. Разборы брендов открыты как практика к бизнес-модели.
            </p>
          </div>
          {tracks.length > 0 && (
            <div className="mt-8">
              <TrackCards tracks={tracks} />
            </div>
          )}
          <div className="mt-6 sm:mt-10">
            {tracks.map((t, i) => {
              const desc = t.subtitle;
              return (
                <Link
                  key={t.slug}
                  href={`/courses/${t.slug}`}
                  className="grid gap-2 border-t border-line py-5 transition-colors hover:bg-subtle sm:grid-cols-[56px_260px_minmax(0,1fr)_100px] sm:items-baseline sm:gap-6"
                >
                  <span className="num text-[13px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-[16px]">{t.title}</h3>
                  <p className="max-w-[60ch] text-[14px] leading-relaxed text-text-2">{desc}</p>
                  <span className="num text-[13px] text-text-2 sm:justify-self-end">
                    {t.chapterTotal} {plural(t.chapterTotal, "глава", "главы", "глав")}
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* модели + разборы */}
      <section className="border-b border-line">
        <Container className="py-9 sm:py-16"><div className="panel grid gap-7 sm:gap-12 p-6 lg:grid-cols-2 lg:grid-rows-[auto_auto_auto_auto] lg:gap-x-0 lg:gap-y-0 lg:p-0">
          <div className="grid min-w-0 gap-4 lg:row-span-4 lg:grid-rows-subgrid lg:p-10">
            <p className="eyebrow">Бизнес-модели</p>
            <h2 className="text-[20px] sm:text-[24px]">Справочник моделей заработка</h2>
            <p className="max-w-[48ch] text-[15px] leading-relaxed text-text-2">
              Не «какие они молодцы», а из чего собран денежный поток, чем за это заплатили и что
              модель убивает.
            </p>
            <div className="min-w-0 self-start">
              {MODEL_SHOWCASE.map((slug) => {
                const m = getModel(slug);
                if (!m) return null;
                return (
                  <Link
                    key={slug}
                    href={`/models/${slug}`}
                    className="grid gap-1 border-t border-line py-3 text-[15px] transition-colors hover:bg-subtle sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4"
                  >
                    <span className="font-medium text-ink">{m.title}</span>
                    <span className="text-text-2">{m.formula}</span>
                  </Link>
                );
              })}
              <div className="border-t border-line pt-3">
                <Link href="/models" className="link text-[14px]">
                  Весь справочник моделей <Arrow />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-4 border-t border-line pt-7 lg:border-t-0 lg:pt-0 lg:row-span-4 lg:grid-rows-subgrid lg:border-l lg:border-line lg:p-10">
            <p className="eyebrow">Разборы брендов</p>
            <h2 className="text-[20px] sm:text-[24px]">Откуда бабки у больших</h2>
            <p className="max-w-[48ch] text-[15px] leading-relaxed text-text-2">
              Механика заработка, структура выручки, развилка и её цена. Каждая цифра с источником.
            </p>
            <div className="min-w-0 self-start">
              {brands.map((b) => (
                <Link key={b.slug} href={b.href} className="row-hover flex items-center justify-between gap-4 border-t border-line py-3 text-[15px]">
                  {/* на телефоне заголовок переносится, а слово «Читать» уходит:
                      строка целиком и так ссылка, стрелки достаточно */}
                  <span className="min-w-0 text-body">{b.title}</span>
                  <span className="link shrink-0 text-[14px]">
                    <span className="hidden sm:inline">Читать </span>
                    <Arrow />
                  </span>
                </Link>
              ))}
              <div className="border-t border-line py-3 text-[13px] text-faint">Новые разборы выходят в канале «Акула бизнеса» и появляются здесь.</div>
              <div className="border-t border-line pt-3">
                <Link href="/catalog?type=bm" className="link text-[14px]">
                  Все разборы <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </div></Container>
      </section>

      {/* связь с Океаном */}
      <section>
        <Container className="grid gap-8 py-9 sm:py-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div>
            <p className="eyebrow">Океан</p>
            <h2 className="mt-3 text-[20px] sm:text-[24px]">Этот трек ведёт к Киту</h2>
            <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-text-2">
              Ранг один на всю платформу. Тесты по бизнес-моделям и рынку входят в Барракуду,
              открытые кейсы по брендам в Дельфина и Акулу, а первые деньги и счёт, раунды и
              выход открывают последний уровень, Кита.
            </p>
            <Link href="/levels" className="link mt-5 text-[15px]">
              Уровни «Океан» <Arrow />
            </Link>
          </div>
          <div className="flex items-center justify-center rounded-[8px] border border-line bg-subtle p-8">
            <RankSketch rank="kit" size={140} className="text-ink" title="Кит" />
          </div>
        </Container>
      </section>
    </>
  );
}
