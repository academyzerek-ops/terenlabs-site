import { Container } from "./Container";
import { Button } from "./Button";

// Заглушка раздела: честный статус текстом, без картинки и декораций.
// Параметр img оставлен в сигнатуре для совместимости вызовов, не рендерится.
export function Placeholder({
  eyebrow = "Скоро",
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  img?: string;
}) {
  return (
    <section className="border-b border-line">
      <Container className="flex min-h-[60vh] flex-col justify-center py-20 sm:py-28">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-[20ch] text-[36px] sm:text-[48px]">{title}</h1>
        <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-text-2">
          {desc ?? "Раздел в работе. Каркас построен, наполнение — следующий шаг."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/catalog">В каталог</Button>
          <Button href="/" variant="secondary">На главную</Button>
        </div>
      </Container>
    </section>
  );
}
