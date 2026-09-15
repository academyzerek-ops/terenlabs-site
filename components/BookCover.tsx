export function BookCover({
  title,
  author,
  subtitle,
  compact = false,
}: {
  title: string;
  author: string;
  subtitle: string;
  compact?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={`Авторская обложка рекомендации «${title}»`}
      className={`relative aspect-[2/3] overflow-hidden rounded-[8px] bg-[#e9e5da] text-[#171717] shadow-[0_18px_45px_rgba(0,0,0,.18)] ${
        compact ? "w-[92px]" : "w-full"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-[5px] bg-[#e45f2b]" />
      <div className="absolute inset-0 flex flex-col p-[9%]">
        <p className={`${compact ? "text-[5px]" : "text-[7px] sm:text-[9px]"} font-semibold uppercase tracking-[0.18em]`}>{author}</p>
        <div className="my-auto">
          <svg viewBox="0 0 180 120" className="w-full" aria-hidden="true">
            <g fill="none" stroke="#171717" strokeWidth="1.25" opacity=".7">
              <path d="M22 28 66 17 101 42 153 22M22 28l29 48 50-34 35 51M51 76l-18 25m68-59 52 37m-17 14 17-14" />
            </g>
            <g fill="#e9e5da" stroke="#171717" strokeWidth="2">
              <circle cx="22" cy="28" r="7" /><circle cx="66" cy="17" r="7" />
              <circle cx="101" cy="42" r="8" /><circle cx="153" cy="22" r="6" />
              <circle cx="51" cy="76" r="8" /><circle cx="33" cy="101" r="6" />
              <circle cx="136" cy="93" r="8" /><circle cx="153" cy="79" r="6" />
            </g>
            <path d="m91 49 20 28" stroke="#e45f2b" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className={`${compact ? "text-[9px]" : "text-[clamp(14px,2.2vw,24px)]"} font-semibold uppercase leading-[.9] tracking-[-0.055em]`}>
            {title}
          </p>
          <p className={`${compact ? "text-[5px]" : "text-[7px] sm:text-[9px]"} mt-[8%] border-t border-black/25 pt-[6%] leading-tight`}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
