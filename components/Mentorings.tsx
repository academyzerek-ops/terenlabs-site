import { Container } from "./Container";

// «5 наставлений» — канон каждого расчёта TerenLabs (Ramp-up · Сезонность ·
// Маркетинг · Кадры · Резерв). Наградный приём stacked cards: position:sticky
// со смещением — карточки наезжают стопкой при скролле. Чистый CSS, Safari-надёжно.
const MENTORINGS = [
  {
    n: "01",
    title: "Ramp-up",
    text: "Бизнес не выходит на плановую выручку с первого дня. Модель закладывает разгон — месяцы, пока клиенты узнают о тебе, а процессы встают на место.",
  },
  {
    n: "02",
    title: "Сезонность",
    text: "У каждой ниши есть месяцы провала. Кофейня проседает летом, обучение — в каникулы. Считать средний месяц — обманывать себя.",
  },
  {
    n: "03",
    title: "Маркетинг",
    text: "«Сарафан заработает сам» — самая дорогая иллюзия. Бюджет на привлечение клиента стоит в модели с первого дня, отдельной строкой.",
  },
  {
    n: "04",
    title: "Кадры",
    text: "ФОТ — это не только оклады: налоги, замены, текучка, обучение. Команда стоит дороже, чем сумма зарплат в объявлениях.",
  },
  {
    n: "05",
    title: "Резерв на старте",
    text: "Подушка на первые месяцы — не опция, а строка инвестиций. Бизнесы умирают не от убытка, а от кассового разрыва в разгоне.",
  },
];

export function Mentorings() {
  return (
    <section className="deck py-16 sm:py-24">
      <Container>
        <div className="section-no">
          <span className="no">КАНОН</span>
          <span className="ln" />
          <span className="no" style={{ opacity: 0.5 }}>
            В КАЖДОМ РАСЧЁТЕ
          </span>
        </div>
        <h2 className="max-w-2xl text-3xl sm:text-4xl">Пять наставлений</h2>
        <p className="mt-3 max-w-xl text-muted">
          То, из-за чего бизнес-планы из интернета врут. В каждом расчёте
          TerenLabs эти пять строк стоят обязательно.
        </p>

        {/* стопка: каждая следующая карточка наезжает на предыдущую */}
        <div className="mt-12 space-y-5">
          {MENTORINGS.map((m, i) => (
            <div
              key={m.n}
              className="sticky"
              style={{ top: `${88 + i * 16}px` }}
            >
              <div
                className="rounded-[var(--radius-lg)] border border-white/10 p-7 shadow-[0_18px_48px_rgba(6,24,42,0.35)] sm:p-9"
                style={{
                  background: `linear-gradient(180deg, ${
                    ["#14395C", "#10314f", "#0d2b45", "#0a2438", "#081d30"][i]
                  } 0%, #081b2e 130%)`,
                }}
              >
                <div className="flex items-baseline gap-5">
                  <span className="num text-3xl font-semibold text-teal sm:text-4xl">{m.n}</span>
                  <div>
                    <h3 className="text-2xl !text-foam sm:text-3xl">{m.title}</h3>
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-foam/70 sm:text-lg">
                      {m.text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
