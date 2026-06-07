// Морской снег: медленные частицы в глубинных секциях. Чисто CSS, очень subtle.
// Раскладка через nth-child в globals.css; при reduced-motion скрываются.
export function Bubbles({ count = 10 }: { count?: number }) {
  return (
    <div className="bubbles pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="bubble" />
      ))}
    </div>
  );
}
