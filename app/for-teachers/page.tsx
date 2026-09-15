import Link from "next/link";
import { Container } from "@/components/Container";
import { Arrow } from "@/components/Button";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Преподавателям",
  description:
    "Класс внутри Академии: видно, кто где остановился, кто на чём проседает и кто угадывает вместо того, чтобы понимать. Раздел готовится.",
  path: "/for-teachers",
  // заглушка: программа описана, инструмента ещё нет — в индекс не пускаем
  noindex: true,
});

// Раздел для преподавателей, наставников и школ. Отдельный тариф
// (канон 16_HUBS.md): учитель платит не за обучение, а за инструмент,
// которым ведёт других. Ложится в грантовую линию — школам и фондам
// нужен именно он, а не подписка одиночки.
// Пока заглушка: описываем, что будет, ничего не обещая по срокам.

const PARTS: { n: string; title: string; text: string }[] = [
  {
    n: "01",
    title: "Класс",
    text: "Группа учеников, привязанная к преподавателю. Ученик учится как обычно и ничего не теряет, если выйдет из класса: прогресс принадлежит ему, а не школе.",
  },
  {
    n: "02",
    title: "Кто где остановился",
    text: "Список группы: прочитанные главы, сданные уровни, дата последнего захода. Видно, кто идёт, а кто пропал две недели назад.",
  },
  {
    n: "03",
    title: "На чём проседает группа",
    text: "Не средний балл, а карта тем: какие главы чаще всего дают неверные ответы у всего класса. Это прямая подсказка, что разобрать на занятии.",
  },
  {
    n: "04",
    title: "Кто понимает, а кто угадывает",
    text: "Система различает долгий неверный ответ и мгновенный тычок наугад. Первое — не понял, второе — не читал. Разные диагнозы и разные разговоры.",
  },
  {
    n: "05",
    title: "Задания группе",
    text: "Назначить главы или тест к сроку и увидеть, кто сделал. Без оценок в журнал: инструмент показывает картину, выводы делает преподаватель.",
  },
];

export default function ForTeachersPage() {
  return (
    <>
      <section className="border-b border-line">
        <Container className="py-14 sm:py-20">
          <p className="eyebrow">Преподавателям</p>
          <h1 className="mt-3 max-w-[22ch] text-[24px] sm:text-[40px]">
            Видеть класс, а не только оценки
          </h1>
          <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">
            Учителю, наставнику или ментору нужна не подписка на обучение — он и так всё это
            знает. Нужен инструмент: кто из группы остановился, на какой теме класс валится
            целиком и кто отвечает наугад, изображая прилежность.
          </p>
          <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-text-2">
            Академия уже пишет эти данные по каждому ответу. Раздел собирает их в картину
            по группе.
          </p>
          <p className="mt-6">
            <span className="tag">Раздел готовится</span>
          </p>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-9 sm:py-16">
          <h2 className="text-[20px] sm:text-[24px]">Что будет внутри</h2>
          <div className="mt-8">
            {PARTS.map((p) => (
              <div
                key={p.n}
                className="grid gap-3 border-t border-line py-6 sm:grid-cols-[56px_200px_minmax(0,1fr)] sm:gap-6"
              >
                <span className="num text-[13px] text-faint">{p.n}</span>
                <h3 className="text-[16px]">{p.title}</h3>
                <p className="min-w-0 max-w-[64ch] text-[14px] leading-relaxed text-text-2">{p.text}</p>
              </div>
            ))}
            <div className="border-t border-line" />
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-10 sm:py-16">
          <div className="panel grid gap-4 p-7 sm:p-10">
            <p className="eyebrow">Школам и программам</p>
            <h2 className="text-[20px] sm:text-[24px]">Если нужен целый поток, а не один класс</h2>
            <p className="max-w-[64ch] text-[15px] leading-relaxed text-text-2">
              Академия бесплатна для учеников и останется такой. Для школ, кружков и
              образовательных программ предусмотрена отдельная лицензия — напишите, и обсудим
              под вашу задачу.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
              <Link href="/contacts" className="link text-[15px]">
                Связаться <Arrow />
              </Link>
              <Link href="/pricing" className="link text-[15px]">
                Тарифы <Arrow />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
