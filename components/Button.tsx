import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "orange";

// Кнопки в духе Notion: прямоугольник 6px, чёрная основная, контурная
// вторичная, текстовая третья. Без теней, свечений и роллов текста.
const base =
  "btn-press inline-flex items-center justify-center gap-2 rounded-[8px] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 whitespace-nowrap";

const sizes = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-4 text-[14px]",
  lg: "h-11 px-5 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary: "bg-accent-600 text-[#fff] hover:bg-[#1f74c9]",
  secondary: "bg-subtle text-ink border border-line hover:bg-hover",
  ghost: "bg-transparent text-text-2 hover:bg-subtle hover:text-ink",
  orange: "bg-orange-600 text-[#fff] hover:bg-orange",
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

// Стрелка для ссылок и кнопок: штрих, не символ
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

/** Круглая кнопка со стрелкой: «перейти», когда подпись не нужна.
 *
 * Цвет несёт состояние, поэтому подписи рядом не нужно:
 *   done  — уровень закрыт, кнопка ведёт перечитать. Чёрная на светлой теме и
 *           белая на тёмной: это один токен ink, он сам переворачивается.
 *   next  — есть что сдавать, кнопка ведёт на тест. Синяя, как все действия.
 */
export function ArrowButton({
  href,
  label,
  tone = "next",
  className = "",
}: {
  /** без адреса кнопка неактивна: серый круг, не ссылка */
  href?: string;
  /** для читалки с экрана: куда ведёт или почему недоступна */
  label: string;
  tone?: "done" | "next";
  className?: string;
}) {
  const tones = {
    done: "bg-ink text-page hover:opacity-85",
    next: "bg-accent-600 text-[#fff] hover:bg-[#1f74c9]",
  };
  const base =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const arrow = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );

  // Неактивная: серый круг и прочерк внутри вместо стрелки. Стрелка обещает
  // переход, которого не будет, поэтому её здесь и не должно быть.
  if (!href) {
    return (
      <span className={`${base} bg-hover text-faint ${className}`} title={label} aria-label={label} role="img">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
          strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
          <path d="M4 8h8" />
        </svg>
      </span>
    );
  }

  return (
    <Link href={href} aria-label={label} title={label} className={`btn-press ${base} ${tones[tone]} ${className}`}>
      {arrow}
    </Link>
  );
}
