import { Container } from "./Container";
import { Button } from "./Button";

export function Placeholder({
  eyebrow = "Каркас",
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 max-w-2xl text-4xl text-heading">{title}</h1>
      <p className="mt-4 max-w-md text-muted">
        {desc ?? "Раздел в работе. Каркас построен, наполнение — следующий шаг."}
      </p>
      <div className="mt-8 flex gap-3">
        <Button href="/catalog">В каталог</Button>
        <Button href="/" variant="secondary">На главную</Button>
      </div>
    </Container>
  );
}
