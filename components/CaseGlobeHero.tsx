import { CaseMap } from "./CaseMap";

// Герой раздела «Кейсы»: карта мира с пинами реальных бизнесов по их городам.
export function CaseGlobeHero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* глубинный фон */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(85% 80% at 50% 20%, #0e3149 0%, #081b2e 55%, #050f1c 100%)" }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 lg:py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="eyebrow justify-center">Кейсы на карте</p>
          <h2 className="mt-3 text-3xl !text-foam sm:text-4xl">Реальные деньги, реальные города</h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-foam/70">
            Каждая точка — настоящий бизнес и его история: где потеряли, где
            выстрелили. Наведись на точку — открой разбор.
          </p>
        </div>
        <CaseMap />
      </div>
    </section>
  );
}
