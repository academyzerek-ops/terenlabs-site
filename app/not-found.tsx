import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl text-heading">Здесь пусто — даже для океана</h1>
      <p className="mt-4 max-w-md text-muted">
        Такой страницы нет: ссылка устарела или в адресе опечатка. Всё живое —
        в каталоге.
      </p>
      <div className="mt-8 flex gap-3">
        <Button href="/catalog">В каталог</Button>
        <Button href="/" variant="ghost">
          На главную
        </Button>
      </div>
    </Container>
  );
}
