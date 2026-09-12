import Link from "next/link";
import { Container } from "./Container";
import { Arrow } from "./Button";
import { HUBS, type HubKey } from "@/lib/hubs";

// Переход между хабами — один и тот же блок в конце каждой страницы хаба.
// Смысл: хаб не тупик. Человек, дочитавший «Фундамент», должен видеть три
// дороги дальше, а пришедший в «Инвестора» — что рядом есть «Фаундер»,
// где та же сделка описана с другой стороны.
// Текущий хаб из списка исключается сам. Сам список живёт в lib/hubs.ts —
// оттуда же его берут страницы тестов и уровней.

export type { HubKey };

export function HubSwitch({ current, title }: { current: HubKey; title?: string }) {
  const others = HUBS.filter((h) => h.key !== current);

  return (
    <section className="border-t border-line">
      <Container className="py-9 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
          <h2 className="text-[20px] sm:text-[24px]">{title ?? "Другие дороги"}</h2>
          <p className="text-[15px] leading-relaxed text-text-2">
            Ранг в Океане один на всю платформу: пройденное здесь засчитывается везде.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {others.map((h) => (
            <Link key={h.key} href={h.href} className="card-premium group flex flex-col gap-2 p-6">
              <p className="eyebrow">{h.title}</p>
              <p className="text-[14.5px] leading-relaxed text-text-2">{h.blurb}</p>
              <span className="link mt-auto pt-3 text-[14px]">
                {h.status === "soon" ? "Посмотреть программу" : "Открыть"} <Arrow />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
