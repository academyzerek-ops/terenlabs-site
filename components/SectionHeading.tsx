export function SectionHeading({
  eyebrow,
  title,
  desc,
  number,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  light?: boolean; // наследие сигнатуры, темы одна
  number?: string;
}) {
  return (
    <div className="max-w-2xl">
      {(number || eyebrow) && (
        <p className="eyebrow">
          {number && <span className="num">{number}</span>}
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-[24px] sm:text-[20px]">{title}</h2>
      {desc && <p className="mt-3 text-[16px] leading-relaxed text-text-2">{desc}</p>}
    </div>
  );
}
