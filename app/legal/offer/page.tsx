import Link from "next/link";
import { Container } from "@/components/Container";

export const metadata = {
  alternates: { canonical: "/legal/offer" }, title: "Пользовательское соглашение — TerenLabs" };

// Текст — из Mini App (frontend/content/ru/info/terms.html), здесь только вёрстка
// под дизайн сайта. Редакция августа 2026: §2 и §6 переписаны под пивот 20.07
// (вся линейка бесплатна, Tribute убран, платная только индивидуальная финмодель
// по заявке) — terms.html в Mini App нужно подтянуть к этой версии.
export default function Page() {
  return (
    <>
      <section className="hero-ocean">
        <Container className="relative z-10 py-16">
          <p className="eyebrow">Правовая информация</p>
          <h1 className="mt-3 max-w-2xl text-4xl !text-foam sm:text-5xl">
            Пользовательское соглашение
          </h1>
          <p className="mt-4 max-w-xl text-lg text-foam/70">Условия использования TerenLabs</p>
        </Container>
      </section>

      <Container className="max-w-3xl py-16">
        <div className="rounded-[var(--radius-tl)] border-l-2 border-teal bg-subtle p-6">
          <p className="num text-[0.7rem] font-bold uppercase tracking-wider text-teal-600">Коротко</p>
          <p className="mt-2 leading-relaxed text-heading">
            TerenLabs — это обучение и аналитика для предпринимателей. Мы помогаем считать и
            учиться, но не принимаем решения за вас и не гарантируем результат бизнеса. Итоговые
            решения и их последствия — на вашей стороне.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          <Sec n="1" t="Общие положения">
            <p>
              Настоящее соглашение регулирует использование сервиса <strong>TerenLabs</strong>{" "}
              (Республика Казахстан), работающего как Telegram Mini App через бота{" "}
              <a href="https://t.me/terenlabs_bot" className="text-teal-600 hover:text-teal">@terenlabs_bot</a>{" "}
              и как веб-сайт TerenLabs. Начиная пользоваться приложением или сайтом, вы
              подтверждаете, что прочитали и принимаете эти условия и{" "}
              <Link href="/legal/privacy" className="text-teal-600 hover:text-teal">
                Политику конфиденциальности
              </Link>
              . Если вы не согласны — не используйте сервис.
            </p>
          </Sec>

          <Sec n="2" t="Что мы предоставляем">
            <p>
              Сервис предоставляет: обучающие материалы, тесты, обзоры ниш, разбор кейсов, ответы
              ИИ-консультанта и инструменты финансовых расчётов. Все материалы и расчёты носят <strong>информационно-аналитический и образовательный характер</strong>.
            </p>
          </Sec>

          <div className="rounded-[var(--radius-tl)] border-l-2 border-[var(--color-danger)] bg-[rgba(180,69,47,0.05)] p-6">
            <p className="num text-[0.7rem] font-bold uppercase tracking-wider text-[var(--color-danger)]">
              Важно: это не консультация
            </p>
            <div className="mt-2 space-y-3 leading-relaxed text-heading">
              <p>
                Материалы и расчёты TerenLabs <strong>не являются</strong> индивидуальной
                инвестиционной, юридической, налоговой или бухгалтерской консультацией и не заменяют
                её. Расчёты и прогнозы — это ориентир на основе введённых данных и рыночной
                статистики, а <strong>не гарантия</strong> будущих результатов вашего бизнеса.
              </p>
              <p>
                Любое бизнес-решение вы принимаете самостоятельно и на свой риск. По важным вопросам
                рекомендуем консультироваться с профильным специалистом.
              </p>
            </div>
          </div>

          <Sec n="3" t="ИИ-консультант">
            <p>
              Ответы ИИ формируются автоматически и могут содержать неточности или устаревшие
              сведения. Они не являются профессиональной консультацией. Важные для вас факты
              (налоги, суммы, юридические нюансы) проверяйте в официальных источниках.
            </p>
          </Sec>

          <Sec n="4" t="Правила использования">
            <p>
              Используя сервис, вы обязуетесь не нарушать закон, не пытаться получить
              несанкционированный доступ, не мешать работе сервиса, не накручивать результаты и не
              использовать материалы во вред другим. Мы вправе ограничить доступ при нарушении этих
              правил.
            </p>
          </Sec>

          <Sec n="5" t="Интеллектуальная собственность">
            <p>
              Контент, методология, тексты, расчётные модели и оформление принадлежат TerenLabs. Их
              можно использовать для личных целей внутри сервиса, но нельзя копировать,
              перепродавать или выдавать за свои без нашего согласия.
            </p>
          </Sec>

          <Sec n="6" t="Платный продукт">
            <p>
              Вся линейка TerenLabs — Академия, тесты, кейсы, обзоры ниш, ИИ-консультант, финмодели
              и бизнес-планы под грант — предоставляется бесплатно. Единственный платный продукт —{" "}
              <Link href="/finmodels/finmodel-custom" className="text-teal-600 hover:text-teal">
                индивидуальная финансовая модель
              </Link>
              , которую финансист собирает под ваш бизнес по заявке. Стоимость, сроки, порядок
              оплаты и возврата согласовываются с финансистом до начала работы и фиксируются в
              переписке. По вопросам напишите через раздел «Связь» или боту{" "}
              <a href="https://t.me/terenlabs_bot" className="text-teal-600 hover:text-teal">@terenlabs_bot</a>.
            </p>
          </Sec>

          <Sec n="7" t="Ограничение ответственности">
            <p>
              Сервис предоставляется «как есть». Мы стремимся к точности и доступности, но не
              гарантируем бесперебойную работу и отсутствие ошибок. TerenLabs не несёт
              ответственности за решения, принятые пользователем на основе материалов сервиса, а
              также за прямые или косвенные убытки и упущенную выгоду, связанные с использованием
              сервиса, в пределах, допустимых законодательством.
            </p>
          </Sec>

          <Sec n="8" t="Изменения и право">
            <p>
              Мы можем обновлять это соглашение — актуальная версия всегда доступна на этой
              странице. К отношениям применяется законодательство Республики Казахстан. По вопросам:{" "}
              <a href="https://t.me/terenlabs_bot" className="text-teal-600 hover:text-teal">
                <strong>@terenlabs_bot</strong>
              </a>{" "}
              или раздел «Связь» в приложении.
            </p>
          </Sec>
        </div>

        <div className="wave-divider my-10" />
        <p className="text-sm leading-relaxed text-muted">
          Редакция от августа 2026 года; соглашение действует с июля 2026 года. Документ носит информационный характер; при
          необходимости условия могут уточняться юридическим сопровождением.
        </p>
      </Container>
    </>
  );
}

function Sec({ n, t, children }: { n: string; t: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/10 text-sm font-semibold text-teal-600">
          {n}
        </span>
        <h2 className="text-xl text-heading">{t}</h2>
      </div>
      <div className="mt-3 space-y-3 pl-11 leading-relaxed text-body">{children}</div>
    </section>
  );
}
