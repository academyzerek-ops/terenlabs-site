export function SectionHeading({
  eyebrow,
  title,
  desc,
  light = false,
  number,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  light?: boolean;
  number?: string;
}) {
  return (
    <div className="max-w-2xl">
      {number && (
        <div className="section-no">
          <span className="no">{number}</span>
          <span className="ln" />
        </div>
      )}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2
        className={`mt-3 text-3xl sm:text-4xl ${light ? "!text-foam" : ""}`}
      >
        {title}
      </h2>
      {desc && (
        <p className={`mt-4 text-base leading-relaxed ${light ? "text-foam/70" : "text-muted"}`}>
          {desc}
        </p>
      )}
    </div>
  );
}
