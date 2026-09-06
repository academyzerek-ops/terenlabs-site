import Link from "next/link";
import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";
import { MODEL_LAYERS, MODEL_GROUPS, getModel } from "@/lib/models-data";
import { BRANDS } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Справочник моделей заработка",
  description:
    "Из чего собран денежный поток: производитель, подписка, маркетплейс, реклама, франшиза и ещё два десятка моделей. У каждой — поток денег, метрики, разгон и капкан. Доллар, без привязки к стране.",
  path: "/models",
});

// Каталог — скелет темы «Бизнес-модель» курса «Фаундер»: сперва механика,
// потом та же механика на живых компаниях в разборах брендов.
const COURSE = "course-founder-model";

export default function ModelsPage() {
  const brandsWithModel = BRANDS.filter((b) => !b.stub);

  return (
    <>
      <section className="border-b border-line">
        <Container className="py-14 sm:py-20">
          <nav aria-label="Хлебные крошки" className="mb-6 flex items-center gap-2 text-[13px] text-faint">
            <Link href="/startup" className="shrink-0 py-1.5 hover:text-ink lg:py-0">Фаундер</Link>
            <span>/</span>
            <span>Справочник моделей</span>
          </nav>
          <h1 className="max-w-[20ch] text-[24px] sm:text-[40px]">Справочник моделей заработка</h1>
          <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">
            Модель отвечает на один вопрос: кто именно платит и за что. Дальше видно, чем за этот
            поток заплачено и что он убивает. Не «какие они молодцы», а конструкция, которая
            переносится на ваш проект.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href={`/courses/${COURSE}`}>
              Тема курса «Бизнес-модель» <Arrow />
            </Button>
            <Link href="/catalog?type=bm" className="link text-[15px]">
              Разборы брендов
            </Link>
          </div>
        </Container>
      </section>

      {MODEL_GROUPS.map((g) => (
        <section key={g.key} className="border-b border-line">
          <Container className="py-7 sm:py-12">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-baseline">
              <h2 className="text-[20px] sm:text-[24px]">
                <span className="num mr-3 text-[15px] text-faint">{g.key}</span>
                {g.title}
              </h2>
            </div>
            <div className="mt-6">
              {g.models.map((slug) => {
                const m = getModel(slug);
                if (!m) return null;
                return (
                  <Link
                    key={slug}
                    href={`/models/${slug}`}
                    className="grid gap-2 border-t border-line py-5 transition-colors hover:bg-subtle sm:grid-cols-[56px_240px_minmax(0,1fr)] sm:items-baseline sm:gap-6"
                  >
                    <span className="num text-[13px] text-faint">{m.num}</span>
                    <h3 className="text-[16px]">{m.title}</h3>
                    <p className="max-w-[70ch] text-[14px] leading-relaxed text-text-2">{m.formula}</p>
                  </Link>
                );
              })}
              <div className="border-t border-line" />
            </div>
          </Container>
        </section>
      ))}

      {/* сквозные слои: они не про отдельную модель, а про то, что происходит со всеми */}
      <section className="border-b border-line">
        <Container className="py-7 sm:py-12">
          <h2 className="text-[20px] sm:text-[24px]">Поверх всех моделей</h2>
          <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-text-2">
            Четыре среза, которые работают в любой модели: чем она привлекает клиента, какими
            приёмами, почему в итоге ломается и кто это переживает.
          </p>
          <div className="mt-6">
            {MODEL_LAYERS.map((m) => (
              <Link
                key={m.slug}
                href={`/models/${m.slug}`}
                className="grid gap-2 border-t border-line py-5 transition-colors hover:bg-subtle sm:grid-cols-[56px_240px_minmax(0,1fr)] sm:items-baseline sm:gap-6"
              >
                <span className="num text-[13px] text-faint">{m.num}</span>
                <h3 className="text-[16px]">{m.title}</h3>
                <p className="max-w-[70ch] text-[14px] leading-relaxed text-text-2">{m.formula}</p>
              </Link>
            ))}
            <div className="border-t border-line" />
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-9 sm:py-16">
          <p className="eyebrow">Дальше</p>
          <h2 className="mt-3 text-[20px] sm:text-[24px]">Та же механика на живых компаниях</h2>
          <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-text-2">
            Модель показывает конструкцию, разбор показывает, во что она обходится на практике:
            структура выручки по годам, развилка и её цена. Каждая цифра в разборе с источником.
          </p>
          <div className="mt-6 max-w-[720px]">
            {brandsWithModel.slice(0, 6).map((b) => (
              <Link
                key={b.slug}
                href={b.href}
                className="row-hover flex items-center justify-between gap-4 border-t border-line py-3 text-[15px]"
              >
                {/* на телефоне заголовок переносится, а слово «Читать» уходит:
                    строка целиком и так ссылка, стрелки достаточно */}
                <span className="min-w-0 text-body">{b.title}</span>
                <span className="link shrink-0 text-[14px]">
                  <span className="hidden sm:inline">Читать </span>
                  <Arrow />
                </span>
              </Link>
            ))}
            <div className="border-t border-line pt-3">
              <Link href="/catalog?type=bm" className="link text-[14px]">
                Все разборы <Arrow />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
