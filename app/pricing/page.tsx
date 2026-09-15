import Link from "next/link";
import { Container } from "@/components/Container";
import { Arrow } from "@/components/Button";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Тарифы",
  description:
    "Академия, тесты, значки и рейтинг бесплатны навсегда. Подписка — это удобство: чат с наставником без оглядки на счётчик, аудиоверсия глав и разговор голосом.",
  path: "/pricing",
});

// Страница тарифов. Модель — freemium по образцу Notion: открыто всё,
// платишь за удобство и объём работы с наставником
// (канон 16_HUBS.md, раздел «Линия раздела», уточнён Адилем 12.09.2026).
// Память наставника, разбор каждой ошибки, динамика пробелов и подбор
// литературы в платный слой не включены: решения по ним нет, по умолчанию
// они бесплатные. Поэтому на странице их нет вовсе — сужать бесплатное
// потом больнее, чем не пообещать сейчас.
// Оплата пока не подключена, поэтому кнопки покупки нет и быть не должно:
// обещать работающий платёж, которого нет, — худшее, что можно сделать
// на этой странице.

const LINE: { what: string; free: string; paid: string }[] = [
  { what: "Академия целиком, все хабы", free: "все главы, навсегда", paid: "—" },
  { what: "Тесты всех уровней, значки, место в рейтинге", free: "всё", paid: "—" },
  { what: "Разговор с ИИ-акулёнком текстом", free: "ограниченное число обращений", paid: "около 50 обращений в сутки" },
  { what: "Аудиоверсия глав", free: "—", paid: "слушать вместо читать" },
  { what: "Голосовой диалог с наставником", free: "—", paid: "есть" },
];

const PLANS: { name: string; who: string; price: string; note: string }[] = [
  {
    name: "Ученик",
    who: "тот, кто реально проходит программу",
    price: "3–9 $ в месяц",
    note: "цена зависит от страны: там, где доходы ниже, тариф ниже",
  },
  {
    name: "Ментор",
    who: "ведёт учеников и видит их прогресс",
    price: "15–25 $ в месяц",
    note: "класс, дашборд по каждому, общая картина группы. После MVP",
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="border-b border-line">
        <Container className="py-14 sm:py-20">
          <p className="eyebrow">Тарифы</p>
          <h1 className="mt-3 max-w-[22ch] text-[24px] sm:text-[40px]">
            Учиться — бесплатно. Платишь за то, что тебя ведут
          </h1>
          <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">
            Все главы, все тесты, все уровни и место в рейтинге бесплатны и такими останутся.
            Это не акция и не пробный период: Академия существует, чтобы люди умели считать
            свой бизнес, а платная стена посреди этого противоречит самой затее.
          </p>
          <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-text-2">
            Деньги берутся за удобство. Спрашивать наставника, не глядя на счётчик. Слушать
            главу за рулём или в спортзале вместо того, чтобы читать. Разговаривать с ним
            голосом, а не набирать текст. Знания при этом бесплатны все и всегда.
          </p>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-9 sm:py-16">
          <h2 className="text-[20px] sm:text-[24px]">Что во что входит</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-[14px]">
              <thead>
                <tr>
                  <th className="border-b border-line py-3 pr-4 text-left font-normal text-faint">Что</th>
                  <th className="border-b border-line py-3 pr-4 text-left font-normal text-faint">Бесплатно</th>
                  <th className="border-b border-line py-3 text-left font-normal text-faint">Платно</th>
                </tr>
              </thead>
              <tbody>
                {LINE.map((r) => (
                  <tr key={r.what}>
                    <td className="border-b border-line py-3 pr-4 align-top text-body">{r.what}</td>
                    <td className="border-b border-line py-3 pr-4 align-top text-text-2">{r.free}</td>
                    <td className="border-b border-line py-3 align-top text-text-2">{r.paid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-9 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
            <h2 className="text-[20px] sm:text-[24px]">Два тарифа</h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              Оплата ещё не подключена. Когда заработает — здесь появится кнопка, а не раньше.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {PLANS.map((p) => (
              <div key={p.name} className="panel grid gap-2 p-7">
                <p className="eyebrow">{p.name}</p>
                <p className="text-[22px]">{p.price}</p>
                <p className="text-[15px] leading-relaxed text-text-2">{p.who}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-faint">{p.note}</p>
                <span className="tag mt-3 self-start">Готовится</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-10 sm:py-16">
          <div className="panel grid gap-4 p-7 sm:p-10">
            <p className="eyebrow">Пока бесплатно всё</p>
            <h2 className="text-[20px] sm:text-[24px]">Начать можно прямо сейчас</h2>
            <p className="max-w-[64ch] text-[15px] leading-relaxed text-text-2">
              Ни один раздел сайта сегодня не закрыт: читай главы, проходи тесты, занимай место
              в рейтинге. Появится платный тариф — бесплатная часть от этого не уменьшится.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
              <Link href="/academy" className="link text-[15px]">
                Академия <Arrow />
              </Link>
              <Link href="/levels" className="link text-[15px]">
                Лестница Океана <Arrow />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
