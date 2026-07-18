import { Container } from "./Container";
import { Button } from "./Button";

export function ProductMissing() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">Готовим к выпуску</p>
      <h1 className="mt-3 text-4xl text-heading">Этот материал ещё в работе</h1>
      <p className="mt-4 max-w-md text-muted">
        Вопросы на финальной вычитке — выпустим, как только пройдут проверку.
        А пока в каталоге полно готового.
      </p>
      <div className="mt-8">
        <Button href="/catalog">В каталог</Button>
      </div>
    </Container>
  );
}
