"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

gsap.registerPlugin(ScrollTrigger);

const PRECEPTS = [
  {
    no: "01",
    title: "RAMP-UP",
    sub: "Финансовый резерв на разгон",
    desc: "Не все выходят живыми из периода разгона. Бизнес начинает приносить выручку не с первого дня. Нужен запас на 4–5 месяцев, иначе кассовый разрыв убивает ещё до того, как вы наберёте клиентскую базу.",
    color: "#00B7C2",
  },
  {
    no: "02",
    title: "СЕЗОННОСТЬ",
    sub: "Кассовый разрыв убивает",
    desc: "Сезонность — это не сюрприз, это математика. Бизнес зарабатывает в год, но умирает в августе. Резерв с «жирных» месяцев под «тощие» — обязательная практика, без которой вы обречены на долги.",
    color: "#C77D2A",
  },
  {
    no: "03",
    title: "МАРКЕТИНГ",
    sub: "Без него расчёты — ерунда",
    desc: "Цифры выручки — это потенциал при наличии клиентов. Иллюзия «у меня хороший продукт, сами придут» — главная ошибка новичка. Бюджет на маркетинг должен быть отдельной строкой в P&L с первого месяца.",
    color: "#1e9ba2",
  },
  {
    no: "04",
    title: "КАДРЫ",
    sub: "Зависимость от мастера",
    desc: "Многие фейлы случаются от ухода ключевого сотрудника. Модель «ремесло» легче на старте, но рушится при болезни владельца. Нужно строить «бренд-бизнес», где мастера заменяемы, а система устойчива.",
    color: "#2e4a5e",
  },
  {
    no: "05",
    title: "РЕЗЕРВ НА СТАРТЕ",
    sub: "Считать с подушкой",
    desc: "Стартовый бюджет — это не только стоимость аренды и кофемашины. Это CAPEX + OPEX на период разгона. Без этой связки человек закрывается через 4 месяца, просто не дотянув до операционного плюса.",
    color: "#0d2b45",
  },
];

export function PreceptsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gsap.utils.toArray<HTMLElement>(".precept-card");
    
    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;

        // Фиксация карточки
        ScrollTrigger.create({
          trigger: card,
          start: "top 80px",
          endTrigger: cards[cards.length - 1],
          end: "top 80px",
          pin: true,
          pinSpacing: false,
          // Оптимизация: scrub 1 дает плавное "догоняние", убирая рывки
          scrub: 1,
        });

        // Плавная трансформация предыдущей при появлении следующей
        gsap.to(card, {
          scale: 0.9,
          opacity: 0.5,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top 90%",
            end: "top 80px",
            scrub: 1,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative bg-[#06182a] py-24 sm:py-32 overflow-hidden">
      {/* Убираем тяжелые градиенты с фона секции для производительности */}
      <Container className="relative z-10 mb-20">
        <SectionHeading
          light
          number="03"
          title="5 наставлений"
          desc="То, о чём молчат инфобизнесмены. Без этих блоков любой бизнес-план — опасная иллюзия."
        />
      </Container>

      <div className="relative">
        {PRECEPTS.map((p, i) => (
          <div
            key={p.title}
            className="precept-card sticky top-0 flex min-h-[50vh] items-start justify-center px-4 py-8 sm:px-6"
          >
            {/* ОПТИМИЗАЦИЯ: убран backdrop-blur-2xl (тяжело для GPU при скролле) 
                Заменен на чистый сплошной цвет с легкой прозрачностью */}
            <div className="group relative w-full max-w-4xl will-change-transform rounded-[2rem] border border-white/10 bg-[#0d2b45] shadow-2xl transition-border duration-500 hover:border-teal/30">
              <div className="relative flex flex-col overflow-hidden rounded-[2rem] bg-navy-900 md:flex-row">
                
                <div className="relative z-10 flex flex-1 flex-col justify-center p-8 sm:p-12 lg:p-14">
                  <div className="mb-6 flex items-center gap-4">
                    {/* «N из 5», не «Advice 01»: голая нумерация путалась со
                        сквозными номерами секций (отзыв Оксаны 08.08) */}
                    <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-teal/80 uppercase">
                      Наставление {i + 1} из {PRECEPTS.length}
                    </span>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>
                  
                  <h3 className="text-3xl font-black tracking-tight text-foam sm:text-5xl">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm font-bold uppercase tracking-widest text-teal">
                    {p.sub}
                  </p>
                  
                  <p className="mt-6 text-base leading-relaxed text-foam/60 sm:text-lg">
                    {p.desc}
                  </p>

                  <div className="mt-8">
                    <div 
                      className="h-1 w-16 rounded-full transition-all duration-700 group-hover:w-24" 
                      style={{ background: p.color }}
                    />
                  </div>
                </div>

                {/* Декоративный номер — упрощен */}
                <div className="relative hidden w-1/4 items-center justify-center bg-black/10 md:flex">
                  <span 
                    className="select-none font-mono text-[10vw] font-black leading-none opacity-[0.03] transition-transform duration-1000 group-hover:scale-105"
                    style={{ color: p.color }}
                  >
                    {p.no}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="h-[15vh]" />
    </section>
  );
}
