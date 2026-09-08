// Значок ИИ-акулёнок: акула тем же штрихом, что обитатели Океана.
// Пятый уровень «Акула» — самый глубокий разбор, поэтому знак чата именно он.
export function SharkMark({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 52"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 35C12 26 30 22 44 28l12-9-2 13c3 2 5 5 7 9-15 3-35 4-57-4z" />
      <path d="M25 27 31 11l8 14M28 41c-1 6 5 8 9 3M42 30v6M45 31v6M48 32v5" />
      <circle cx="13" cy="32" r="1.4" />
      <path d="M8 36c4 2 8 2 12 1" />
    </svg>
  );
}
