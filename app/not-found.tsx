import { Container } from "@/components/Container";
import { Button, Arrow } from "@/components/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 max-w-[24ch] text-[32px] sm:text-[40px]">Здесь пусто — даже для океана</h1>
      <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-text-2">
        Такой страницы нет: ссылка устарела или в адресе опечатка. Всё живое —
        в каталоге.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/catalog">
          В каталог <Arrow />
        </Button>
        <Button href="/" variant="secondary">
          На главную
        </Button>
      </div>
    </Container>
  );
}
