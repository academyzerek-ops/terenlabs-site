import Link from "next/link";
import { Container } from "@/components/Container";
import { Arrow } from "@/components/Button";
import { TrackCards } from "@/components/TrackCards";
import { ACADEMY } from "@/lib/learn";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Академия",
  description:
    "Академия TerenLabs: треки для своего дела и трек для проекта на рост. Короткие главы, реальные цифры, тесты на ранг в Океане.",
  path: "/academy",
});

// Академия одна на всю платформу, треки лежат двумя группами. Делятся они не по
// темам, а по типу знания: «Предприниматель» это набор навыков, который берут в
// любом порядке, «Фаундер» это последовательность шагов, где следующий без
// предыдущего не работает. Регистры разные: своё дело в тенге, проект на рост
// в долларах. Ранг один на обе группы.
const GROUPS = [
  {
    hub: "delo" as const,
    title: "Предприниматель",
    href: "/delo",
    desc: "Навыки, чтобы вести своё дело: деньги, люди, маркетинг, право, модель заработка. Бери тему, которая горит, порядок не важен.",
  },
  {
    hub: "startup" as const,
    title: "Фаундер",
    href: "/startup",
    desc: "Дорожная карта проекта на рост: команда, рынок, модель, юнит-экономика, питч, инвестиции. Шаги идут по порядку, до сделки с инвестором.",
  },
];

export default function AcademyPage() {
  return (
    <>
      <section className="border-b border-line">
        <Container className="py-14 sm:py-16">
          <p className="eyebrow">Академия</p>
          <h1 className="mt-3 max-w-[20ch] text-[30px] sm:text-[38px]">Учиться на цифрах, а не на лозунгах</h1>
          <p className="mt-5 max-w-[60ch] text-[16px] leading-relaxed text-text-2">
            Короткие главы по 5 минут, каждая с расчётом или документированным примером. Проходить можно
            в любом порядке, ранг в Океане дают тесты.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/tests" className="link text-[15px]">
              Тесты на ранг <Arrow />
            </Link>
            <Link href="/levels" className="link text-[15px]">
              Как устроен Океан <Arrow />
            </Link>
          </div>
        </Container>
      </section>

      {GROUPS.map((g, i) => {
        const tracks = ACADEMY.filter((t) => (t.hub ?? "delo") === g.hub);
        if (tracks.length === 0) return null;
        return (
          <section key={g.hub} className={i > 0 ? "border-t border-line" : ""}>
            <Container className="py-14">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
                <div>
                  <p className="eyebrow">{g.hub === "delo" ? "Своё дело" : "Проект на рост"}</p>
                  <h2 className="mt-2 text-[22px] sm:text-[24px]">{g.title}</h2>
                </div>
                <p className="text-[14px] leading-relaxed text-text-2">
                  {g.desc}{" "}
                  <Link href={g.href} className="link">
                    Хаб «{g.title}» <Arrow />
                  </Link>
                </p>
              </div>
              <div className="mt-8">
                <TrackCards tracks={tracks} />
              </div>
            </Container>
          </section>
        );
      })}
    </>
  );
}
