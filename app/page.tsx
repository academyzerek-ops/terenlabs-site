import React from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";
import { RankSketch } from "@/components/RankSketch";
import { OCEAN_RANKS, CASES } from "@/lib/content";
import type { LevelKey } from "@/lib/content";

export const metadata = { alternates: { canonical: "/" } };

// Кейсы на главной идут двумя сторонами: кто вышел в плюс и кто прогорел.
// Исход берём из badge витрины, чтобы не заводить второй признак.
const WINS = CASES.filter((c) => c.badge === "Успех" && !c.stub).slice(0, 5);
const FAILS = CASES.filter((c) => c.badge === "Провал" && !c.stub).slice(0, 5);

// Три шага платформы
const PATH = [
  {
    sub: "Академия",
    title: "Учиться",
    desc: "Модули без воды и кейсы: кто прогорел и кто вышел в плюс. Чужой опыт стоит дешевле своего.",
    href: "/academy",
    cta: "В Академию",
  },
  {
    sub: "Тесты",
    title: "Проверять",
    desc: "Тест, который нельзя угадать: балл честный, и за него дают ранг «Океан».",
    href: "/tests",
    cta: "К тестам",
  },
  {
    sub: "Кейсы и бизнес-модели",
    title: "Разбирать",
    desc: "Кейсы про тех, кто прогорел, и про тех, кто вышел в плюс. Плюс разборы того, как зарабатывают компании, которые знают всё.",
    href: "/catalog?type=case",
    cta: "К разборам",
  },
];


export default function Home() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section>
        <Container className="grid gap-7 sm:gap-12 py-9 sm:py-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:py-20">
          <div className="flex flex-col gap-7">
            <p className="eyebrow">Обучение бизнесу · на русском языке</p>
            <h1 className="max-w-[18ch] text-[32px] sm:text-[40px] lg:text-[44px]">
              Платформа обучения бизнесу
            </h1>
            <p className="max-w-[56ch] text-[16px] leading-relaxed text-text-2 sm:text-[17px]">
              Говорим о рисках и реальности, а не про «успешный успех». Видишь, где потеряешь
              деньги и время, до того как вложишься.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button href="/tests/crab-t1/take" size="lg">
                Пройти первый тест <Arrow />
              </Button>
              <Link href="/levels" className="link text-[15px]">
                Как устроен Океан
              </Link>
            </div>
          </div>

          {/* манифест: компактная панель, верх вровень с меткой hero */}
          <div className="flex flex-col gap-5 rounded-[12px] bg-subtle p-6">
            <p className="eyebrow">Манифест</p>
            <div>
              <p className="text-[20px] font-semibold leading-snug text-ink">
                «Мы не мотивируем. Мы показываем, как это устроено»
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-text-2">
                Учим на кейсах: кто прогорел и почему, кто вышел в плюс и за счёт чего.
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-text-2">
                Знания проверяем по ступеням, балл показывает, что ты знаешь на самом деле.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ============ ТРИ ДВЕРИ: ПРЕДПРИНИМАТЕЛЬ / ФАУНДЕР / ИНВЕСТОР ============
          Инвестор пока заглушка: программа зафиксирована, главы пишутся. */}
      <section className="border-t border-line">
        <Container className="grid gap-4 py-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              href: "/delo",
              eyebrow: "Предприниматель",
              title: "Бизнес здесь и сейчас",
              desc: "Навыки, чтобы вести своё дело: деньги, люди, маркетинг, право. Плюс кейсы и обзоры ниш, где видно, на чём теряют.",
            },
            {
              href: "/startup",
              eyebrow: "Фаундер",
              title: "Проект на рост",
              desc: "Дорожная карта проекта на рост: развилка, основание, рынок, модель, первые деньги, раунды и выход. По шагам, до сделки с инвестором.",
            },
            {
              href: "/invest",
              eyebrow: "Инвестор · готовится",
              title: "С другой стороны стола",
              desc: "Та же сделка глазами того, кто даёт деньги: поток, проверка компании, цена входа, бумаги, портфель и выход. Программа зафиксирована, главы пишутся.",
            },
          ].map((d) => (
            <Link key={d.href} href={d.href} className="card-premium group flex flex-col gap-3 p-7">
              <span className="mb-2 text-faint">
                {d.href === "/delo" ? (
                  <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6.5 4 3h8l1 3.5M3 6.5h10v6a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5zM6.5 13V9.5h3V13" /></svg>
                ) : d.href === "/invest" ? (
                  <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2v12M10.5 4.5H6.75a1.75 1.75 0 0 0 0 3.5h2.5a1.75 1.75 0 0 1 0 3.5H5" /></svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9.5 2.5c2 .5 3.5 2 4 4L9 11 5 7zM5 7l-2 .5L4.5 9M9 11l.5 2L11 11.5M6.5 9.5 3 13" /></svg>
                )}
              </span>
              <p className="eyebrow">{d.eyebrow}</p>
              <h2 className="text-[24px]">{d.title}</h2>
              <p className="max-w-[48ch] text-[15px] leading-relaxed text-text-2">{d.desc}</p>
              <span className="link mt-auto pt-2 text-[15px]">
                {d.href === "/invest" ? "Посмотреть программу" : "Открыть раздел"} <Arrow />
              </span>
            </Link>
          ))}
        </Container>
      </section>

      {/* ============ ЛЕСТНИЦА «ОКЕАН»: панель как в Notion ============ */}
      <section>
        <Container className="py-6">
          <p className="section-label mb-3">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 9c1.5 0 1.5-2 3-2s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2M2 12.5c1.5 0 1.5-2 3-2s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2" /></svg>
            Океан
          </p>
          <div className="panel panel-split">
            <div className="panel-half flex flex-col justify-center">
              <RankSketch rank="rakushka" size={48} className="panel-ico" />
              <h2 className="mt-7 max-w-[22ch] text-[22px] leading-snug sm:text-[24px]">Ранг растёт за понимание, его нельзя накликать</h2>
              <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-text-2">
                Ракушку выдают за вход, дальше от Краба до Кита каждый уровень открывается тестами, которые нельзя угадать, только понять.
              </p>
              <Link href="/levels" className="link mt-6 text-[15px]">
                Как устроен Океан <Arrow />
              </Link>
            </div>
            <div className="panel-half">
              <div className="rail">
                {OCEAN_RANKS.map((r, i) => (
                  <React.Fragment key={r.key}>
                    <div className="rail-when flex flex-col justify-center sm:min-h-[40px]">
                      <span className="block text-ink sm:whitespace-nowrap">{r.meaning}</span>
                    </div>
                    <Link href={`/levels/${r.key}`} className={`rail-item block ${i === 0 ? "is-here" : ""}`}>
                      <span className="flex items-center gap-3">
                        <RankSketch rank={r.key as LevelKey} size={22} className="text-ink" />
                        <span className="rail-t">{r.name}</span>
                      </span>
                      {i === 0 && (
                        <span className="rail-btn">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange" />
                          ты здесь, начни с теста
                        </span>
                      )}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============ УЧИМ БИЗНЕСУ ЦЕЛИКОМ ============ */}
      <section>
        <Container className="py-10 sm:py-20">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
            <h2 className="text-[22px] sm:text-[24px]">Учим бизнесу целиком</h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              <em className="italic text-body">Тебя готовили к контрольным, а не к кассовым разрывам.</em>{" "}
              Здесь три шага: понять, проверить себя, посчитать своё.
            </p>
          </div>
          {/* три шага одной сеткой строк: метка, заголовок, текст, ссылка стоят вровень */}
          <div className="mt-7 sm:mt-12 grid gap-6 sm:gap-10 md:grid-cols-3 md:grid-rows-[auto_auto_1fr_auto] md:gap-x-0 md:gap-y-0">
            {PATH.map((s, i) => (
              <div
                key={s.title}
                className={`grid gap-3 md:row-span-4 md:grid-rows-subgrid md:pr-8 ${
                  i > 0 ? "border-t border-line pt-6 md:border-t-0 md:border-l md:border-line md:pl-8 md:pt-0" : ""
                }`}
              >
                <p className="eyebrow">{s.sub}</p>
                <h3 className="text-[24px]">{s.title}</h3>
                <p className="max-w-[34ch] text-[15px] leading-relaxed text-text-2">{s.desc}</p>
                <Link href={s.href} className="link mt-1 self-end text-[15px]">
                  {s.cta} <Arrow />
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>


      {/* ============ КЕЙСЫ: УСПЕХИ + ПРОВАЛЫ ============
          две колонки одной сеткой строк (subgrid): метка, заголовок, лид,
          список на 5 строк, ссылка. Слева вышли в плюс, справа прогорели. */}
      <section>
        <Container className="py-10 sm:py-20">
          <p className="section-label mb-3">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 13.5h11M4 11V7M7 11V4M10 11V8.5M13 11V6" /></svg>
            Учимся на чужом опыте
          </p>
          <div className="panel grid gap-7 sm:gap-12 p-6 lg:grid-cols-2 lg:grid-rows-[auto_auto_auto_auto_auto] lg:gap-x-0 lg:gap-y-0 lg:p-0">
          <div className="grid min-w-0 gap-4 lg:row-span-5 lg:grid-rows-subgrid lg:p-10">
            <p className="eyebrow">Кейсы · успех</p>
            <h2 className="text-[22px] sm:text-[24px]">Кто вышел в плюс</h2>
            <p className="max-w-[48ch] text-[15px] leading-relaxed text-text-2">
              Что сработало и за счёт чего именно. Не история успеха, а решение, которое
              изменило деньги.
            </p>
            <div className="mt-2 min-w-0 self-start">
              {WINS.map((c) => (
                <Link key={c.slug} href={c.href} className="row-hover flex min-h-[52px] items-center justify-between gap-3 border-t border-line py-3 text-[15px]">
                  {/* на телефоне заголовок переносится, а не обрывается многоточием */}
                  <span className="min-w-0 text-body">{c.title}</span>
                  <span className="tag shrink-0">{c.badge}</span>
                </Link>
              ))}
              <div className="border-t border-line" />
            </div>
            <Link href="/catalog?type=case" className="link self-start text-[15px]">
              Все кейсы <Arrow />
            </Link>
          </div>

          <div className="grid min-w-0 gap-4 border-t border-line pt-7 lg:border-t-0 lg:pt-0 lg:row-span-5 lg:grid-rows-subgrid lg:border-l lg:border-line lg:p-10">
            <p className="eyebrow">Кейсы · провал</p>
            <h2 className="text-[22px] sm:text-[24px]">Кто прогорел</h2>
            <p className="max-w-[48ch] text-[15px] leading-relaxed text-text-2">
              Где именно кончились деньги и какой шаг это решил. Ошибка названа, а не
              спрятана за словом «не повезло».
            </p>
            <div className="mt-2 min-w-0 self-start">
              {FAILS.map((c) => (
                <Link key={c.slug} href={c.href} className="row-hover flex min-h-[52px] items-center justify-between gap-3 border-t border-line py-3 text-[15px]">
                  <span className="min-w-0 text-body">{c.title}</span>
                  <span className="tag shrink-0">{c.badge}</span>
                </Link>
              ))}
              <div className="border-t border-line" />
            </div>
            <Link href="/catalog?type=case" className="link self-start text-[15px]">
              Все кейсы <Arrow />
            </Link>
          </div>
          </div>
        </Container>
      </section>
    </>
  );
}
