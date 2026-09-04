import { Container } from "./Container";
import { Button } from "./Button";

export function ProductMissing() {
  return (
    <Container className="flex min-h-[60vh] flex-col justify-center py-20 sm:py-28">
      <p className="eyebrow">Готовим к выпуску</p>
      <h1 className="mt-3 max-w-[20ch] text-[24px] sm:text-[38px]">Этот материал ещё в работе</h1>
      <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-text-2">
        Вопросы на финальной вычитке — выпустим, как только пройдут проверку.
        А пока в каталоге полно готового.
      </p>
      <div className="mt-8">
        <Button href="/catalog">В каталог</Button>
      </div>
    </Container>
  );
}
