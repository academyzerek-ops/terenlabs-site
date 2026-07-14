"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { Button } from "./Button";
import { motion, AnimatePresence } from "motion/react";

const Q = {
  q: "Нурлан три года держал крупную сумму наличными в шкафу — «на чёрный день». Он гордится: «Сколько было, столько и лежит, ни тенге не потерял». За три года цены выросли на 40%. В чём изъян его гордости?",
  opts: [
    "Купюр столько же, но купить на них теперь можно меньше — потеря есть, просто незаметная",
    "Изъяна нет: наличные дома силу не теряют, слабеют лишь деньги в банке",
    "Он потеряет, только если деньги украдут или он их потратит — а так всё цело",
    "Изъян есть: держа их в шкафу, он упустил проценты по вкладу",
  ],
  a: 0,
  explain: "Верно. Потеря не в числе купюр, а в том, сколько товара за них дают. Рост цен съедает «силу» денег незаметно.",
};

export function LandingTest() {
  const [picked, setPicked] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handlePick = (i: number) => {
    if (showResult) return;
    setPicked(i);
  };

  const isCorrect = picked === Q.a;

  return (
    <div className="mx-auto mt-12 max-w-2xl text-left">
      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/20 text-xs font-bold text-teal">
                ?
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-teal/60">
                Живой вопрос теста
              </span>
            </div>
            <h3 className="text-xl font-bold leading-tight text-foam sm:text-2xl">
              {Q.q}
            </h3>
            <div className="mt-8 space-y-3">
              {Q.opts.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handlePick(i)}
                  className={`btn-press w-full rounded-2xl border px-6 py-4 text-left text-base transition-all duration-300 ${
                    picked === i
                      ? "border-teal bg-teal/20 text-foam shadow-[0_0_20px_rgba(0,183,194,0.2)]"
                      : "border-white/10 bg-white/5 text-foam/70 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="mt-8">
              <button
                disabled={picked === null}
                onClick={() => setShowResult(true)}
                className="btn-press group relative inline-flex items-center gap-3 rounded-full bg-teal px-8 py-4 text-sm font-bold text-white shadow-[0_10px_40px_rgba(0,183,194,0.3)] transition-all hover:bg-teal-600 disabled:opacity-40"
              >
                Проверить ответ
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-[2rem] border p-8 md:p-10 ${
              isCorrect
                ? "border-teal/30 bg-teal/10"
                : "border-warn/30 bg-warn/10"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                isCorrect ? "bg-teal text-white" : "bg-warn text-white"
              }`}>
                {isCorrect ? "✓" : "!"}
              </div>
              <div>
                <h4 className="text-xl font-bold text-foam">
                  {isCorrect ? "В точку!" : "Почти угадал"}
                </h4>
                <p className="text-foam/60">
                  {isCorrect ? "Ты видишь тихие потери." : "Это одна из самых частых ошибок."}
                </p>
              </div>
            </div>
            
            <p className="mt-6 text-lg leading-relaxed text-foam/90 italic">
              {isCorrect ? Q.explain : "На самом деле: " + Q.explain}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button href="/catalog?type=test" size="lg">
                Пройти полный тест (42 вопроса)
              </Button>
              <button
                onClick={() => { setShowResult(false); setPicked(null); }}
                className="text-sm font-medium text-foam/40 hover:text-foam transition-colors"
              >
                Попробовать другой вариант
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
