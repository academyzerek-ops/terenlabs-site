import { Container } from "./Container";
import { Button } from "./Button";

export function ProductMissing() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">Каркас</p>
      <h1 className="mt-3 text-4xl text-heading">Продукт ещё не наполнен</h1>
      <p className="mt-4 max-w-md text-muted">
        Эта страница — заглушка. Контент придёт из материалов проекта. Пока
        посмотри каталог.
      </p>
      <div className="mt-8">
        <Button href="/catalog">В каталог</Button>
      </div>
    </Container>
  );
}
