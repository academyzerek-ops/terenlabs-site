"use client";

import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">Ошибка</p>
      <h1 className="mt-3 text-4xl text-heading">Что-то пошло не по расчёту</h1>
      <p className="mt-4 max-w-md text-muted">
        Страница упала. Попробуй ещё раз — если повторится, мы уже в курсе
        {error.digest ? ` (код ${error.digest})` : ""}.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-press rounded-full bg-teal px-7 py-3.5 text-base font-semibold text-white hover:bg-teal-600"
        >
          Попробовать снова
        </button>
        <Button href="/" variant="secondary">
          На главную
        </Button>
      </div>
    </Container>
  );
}
