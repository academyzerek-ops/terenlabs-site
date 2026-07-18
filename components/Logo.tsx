// Реальный логотип Teren|Labs (вордмарк с акулой и волной-разделителем).
// Источник: брендбук logo.png. Тема одна (тёмный океан) — auto оставлен
// для совместимости и просто отдаёт светлую версию (на тёмном фоне).

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
  const src = (light || auto ? "/brand/logo-light.png" : "/brand/logo-dark.png") + "?v=2";
  return (
    <img
      src={src}
      alt="TerenLabs"
      height={height}
      // max-w-none: глобальный reset даёт img max-width:100%, и в тесном
      // flex-ряду (мобильная шапка) лого схлопывалось в 0×0 — тап мимо
      style={{ height, width: "auto" }}
      className={`max-w-none ${className}`}
    />
  );
}
