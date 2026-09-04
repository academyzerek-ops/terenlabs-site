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
      <h1 className="mt-3 max-w-[24ch] text-[32px] sm:text-[40px]">Что-то пошло не по расчёту</h1>
      <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-text-2">
        Страница упала. Попробуй ещё раз — если повторится, мы уже в курсе
        {error.digest ? <> (код <span className="num">{error.digest}</span>)</> : ""}.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-press inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[6px] bg-accent-600 px-4 text-[15px] font-medium text-[#fff] transition-colors duration-150 hover:bg-[#1b6fc2]"
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
