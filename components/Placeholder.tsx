import { Container } from "./Container";
import { Button } from "./Button";

// Заглушка раздела: кино-кадр во весь блок (не пустота), честный статус
export function Placeholder({
  eyebrow = "Скоро",
  title,
  desc,
  img = "/lessons/fund_m6-ch03_horizon-distance.jpg",
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  img?: string;
}) {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-navy-900">
      <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 80% at 50% 60%, rgba(6,24,42,0.55) 0%, rgba(6,24,42,0.93) 100%)",
        }}
      />
      <Container className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-2xl text-4xl !text-foam sm:text-6xl">{title}</h1>
        <p className="mt-4 max-w-md text-lg text-foam/70">
          {desc ?? "Раздел в работе. Каркас построен, наполнение — следующий шаг."}
        </p>
        <div className="mt-8 flex gap-3">
          <Button href="/catalog">В каталог</Button>
          <Button href="/" variant="ghost">На главную</Button>
        </div>
      </Container>
    </section>
  );
}
