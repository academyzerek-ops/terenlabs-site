"use client";

// Переключатель дня и ночи. Тёмная тема — основная, светлая переопределяет те же
// переменные в globals.css. Выбор хранится на устройстве, до первой отрисовки его
// ставит скрипт в <head> (см. app/layout.tsx), поэтому вспышки белым нет.
// Иконку выбирает CSS по атрибуту темы: состояние в React мигало бы луной на
// светлой странице, пока не отработает гидратация.

export const THEME_KEY = "tl-theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const flip = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    if (next === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // приватный режим: тема просто не запомнится
    }
  };

  return (
    <button
      type="button"
      onClick={flip}
      aria-label="Светлая или тёмная тема"
      title="Светлая или тёмная тема"
      className={`flex h-9 w-9 lg:h-7 lg:w-7 items-center justify-center rounded-[6px] text-faint transition-colors hover:bg-subtle hover:text-ink ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* рисуем то, куда ведёт нажатие: днём луна, ночью солнце */}
        <path className="theme-when-light" d="M13 9.6A5.4 5.4 0 0 1 6.4 3 5.5 5.5 0 1 0 13 9.6" />
        <g className="theme-when-dark">
          <circle cx="8" cy="8" r="2.9" />
          <path d="M8 1.6v1.4M8 13v1.4M14.4 8H13M3 8H1.6M12.5 3.5l-1 1M4.5 11.5l-1 1M12.5 12.5l-1-1M4.5 4.5l-1-1" />
        </g>
      </svg>
    </button>
  );
}
