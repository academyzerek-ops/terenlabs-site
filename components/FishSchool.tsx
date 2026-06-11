// Стая рыб-силуэтов, дрейфующая через толщу воды (страница «Океан»).
// Чисто декоративный слой: pointer-events нет, у reduced-motion скрывается в CSS.
// tone: "shadow" — тёмный силуэт для светлой воды, "glow" — светлый для глубины.

const TONE = {
  shadow: "rgba(6, 24, 42, 0.85)",
  glow: "rgba(150, 210, 222, 0.8)",
} as const;

// рыбка плывёт вправо: тело-треугольник + раздвоенный хвост
function Fish({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <polygon points="14,5 4,0.8 4,9.2" />
      <polygon points="5.5,5 0,1.6 0,8.4" />
    </g>
  );
}

// раскладка стаи — рваный клин, как у настоящей стаи
const SCHOOL: Array<[number, number, number]> = [
  [0, 28, 1],
  [26, 10, 0.8],
  [30, 48, 0.9],
  [56, 26, 1.15],
  [84, 6, 0.7],
  [88, 42, 0.85],
  [116, 24, 1.3],
  [144, 8, 0.9],
  [148, 38, 0.75],
];

export function FishSchool({
  top,
  dur = 80,
  delay = 0,
  opacity = 0.1,
  scale = 1,
  reverse = false,
  tone = "shadow",
}: {
  top: string;
  dur?: number;
  delay?: number;
  opacity?: number;
  scale?: number;
  reverse?: boolean;
  tone?: keyof typeof TONE;
}) {
  return (
    <div
      className={`school ${reverse ? "school--rev" : ""}`}
      style={
        {
          top,
          color: TONE[tone],
          "--school-dur": `${dur}s`,
          "--school-delay": `${delay}s`,
          "--school-o": opacity,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <svg
        width={170 * scale}
        height={58 * scale}
        viewBox="0 0 170 58"
        fill="currentColor"
      >
        {SCHOOL.map(([x, y, s], i) => (
          <Fish key={i} x={x} y={y} s={s} />
        ))}
      </svg>
    </div>
  );
}
