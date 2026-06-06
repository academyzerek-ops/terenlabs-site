// Реальный логотип Teren|Labs (вордмарк с акулой и волной-разделителем).
// Источник: брендбук logo.png. Две версии: тёмная (на светлом фоне) / светлая (на тёмном).
// auto — показывает нужную версию по теме (тёмная глубина по умолчанию → light-версия).

export function Logo({
  className = "",
  light = false,
  auto = false,
  height = 30,
}: {
  className?: string;
  light?: boolean;
  auto?: boolean;
  height?: number;
}) {
  if (auto) {
    return (
      <span className={className} style={{ display: "inline-flex", height }}>
        {/* по умолчанию (тёмная тема) — светлый логотип */}
        <img
          src="/brand/logo-light.png?v=2"
          alt="TerenLabs"
          style={{ height, width: "auto" }}
          className="logo-on-dark"
        />
        {/* в светлой теме — тёмный */}
        <img
          src="/brand/logo-dark.png?v=2"
          alt="TerenLabs"
          style={{ height, width: "auto" }}
          className="logo-on-light"
        />
      </span>
    );
  }
  const src = (light ? "/brand/logo-light.png" : "/brand/logo-dark.png") + "?v=2";
  return (
    <img
      src={src}
      alt="TerenLabs"
      height={height}
      style={{ height, width: "auto" }}
      className={className}
    />
  );
}
