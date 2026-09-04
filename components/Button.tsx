import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

// Кнопки в духе Notion: прямоугольник 6px, чёрная основная, контурная
// вторичная, текстовая третья. Без теней, свечений и роллов текста.
const base =
  "btn-press inline-flex items-center justify-center gap-2 rounded-[6px] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 whitespace-nowrap";

const sizes = {
  sm: "h-8 px-3 text-[14px]",
  md: "h-10 px-4 text-[15px]",
  lg: "h-12 px-5 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary: "bg-accent-600 text-[#fff] hover:bg-[#1b6fc2]",
  secondary: "bg-transparent text-ink border border-line-2 hover:bg-subtle",
  ghost: "bg-transparent text-text-2 hover:bg-subtle hover:text-ink",
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
