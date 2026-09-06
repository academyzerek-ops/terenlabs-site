"use client";

import { useEffect, useState } from "react";
import { ArrowButton } from "./Button";
import {
  fetchOceanProgress,
  isTestPassed,
  LEVEL_TESTS,
  levelDone,
  type OceanProgress,
} from "@/lib/ocean";
import { fetchMarks, isTestMarkPassed, type Mark } from "@/lib/state";

// Столбец «Статус» в реестре уровней. Раньше здесь стояло «Открыть» у всех строк
// подряд: слово ничего не сообщало о состоянии и повторяло ссылку на заголовке.
// Теперь столбец отвечает на единственный вопрос, ради которого он есть: сдано
// или нет. Сдано — галочка. Не сдано — прямая ссылка на первый несданный тест.

const KEY2LEVEL: Record<string, string> = {
  rakushka: "mollusk",
  krab: "crab",
  barrakuda: "barracuda",
  delfin: "dolphin",
  akula: "shark",
  kit: "whale",
};

const Check = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8.5l3.2 3.2L13 5" />
  </svg>
);

const Dash = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
    <path d="M3.5 8h9" />
  </svg>
);

// порядок уровней: нужен, чтобы сказать, после чего откроется закрытый
const ORDER = ["rakushka", "krab", "barrakuda", "delfin", "akula", "kit"];

// Какой уровень надо закрыть, чтобы открылся этот.
const PREREQ: Record<string, string> = {
  barracuda: "crab",
  dolphin: "barracuda",
  shark: "dolphin",
};

/** Открыт ли уровень по пройденному пути.
 *
 * Намеренно не берём isLevelUnlocked: та функция отвечает на вопрос «пустят ли»,
 * и у админа возвращает true для всего. Столбец же показывает, где человек идёт
 * на самом деле, поэтому админские права здесь ничего не открывают. Взять тест
 * по прямой ссылке админ по-прежнему может.
 */
const openByProgress = (p: OceanProgress | null, level: string): boolean => {
  const need = PREREQ[level];
  return need ? levelDone(p, need) : true;
};
const NAMES: Record<string, string> = {
  rakushka: "Ракушки", krab: "Краба", barrakuda: "Барракуды",
  delfin: "Дельфина", akula: "Акулы", kit: "Кита",
};

// В строке ровно две вещи и всегда обе: отметка и кнопка. Отметка одна из двух,
// зелёная галочка при закрытом уровне и оранжевый прочерк при незакрытом. Кнопка
// либо ведёт куда-то, либо серая и неактивная. Никаких подписей рядом: слова
// «сдано», «скоро» и «откроется после» ломали ровный ряд и повторяли то же самое.
function Slots({ done, button }: { done: boolean; button: React.ReactNode }) {
  return (
    <span className="flex items-center justify-end gap-3">
      <span
        className={`flex w-5 shrink-0 justify-center ${done ? "text-success" : "text-orange"}`}
        title={done ? "Уровень закрыт" : "Уровень не закрыт"}
      >
        {done ? <Check /> : <Dash />}
      </span>
      <span className="flex w-10 shrink-0 justify-center">{button}</span>
    </span>
  );
}

export function LevelAction({
  levelKey,
  levelName,
  testSlugs,
  locked,
}: {
  levelKey: string;
  levelName: string;
  testSlugs: string[];
  locked?: boolean;
}) {
  const [ocean, setOcean] = useState<OceanProgress | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([fetchMarks(), fetchOceanProgress()]).then(([m, p]) => {
      setMarks(m);
      setOcean(p);
      setReady(true);
    });
  }, []);

  const level = KEY2LEVEL[levelKey];

  // тест сдан: у Ракушки по отметкам аккаунта, глубже — по прогрессу Океана
  const passed = (slug: string) => {
    if (isTestMarkPassed(marks, slug)) return true;
    if (!level || !slug.startsWith(`${level}-`)) return false;
    return isTestPassed(ocean, level, slug.slice(level.length + 1));
  };

  // до ответа сервера не мигаем состоянием: пустой слот той же высоты
  if (!ready) return <span className="block h-10" aria-hidden="true" />;

  // Уровень получен: у Ракушки он выдаётся за вход, у остальных считается по
  // тестам (для ранговых — Океаном). Отсюда зелёная галочка, а не прочерк.
  const achieved = locked
    ? false
    : testSlugs.length === 0
    ? true
    : LEVEL_TESTS[level]
    ? levelDone(ocean, level)
    : testSlugs.every(passed);

  // Уровень получен и на него есть что открыть: тёмная кнопка на страницу уровня
  if (achieved && testSlugs.length > 0) {
    return (
      <Slots
        done
        button={<ArrowButton href={`/levels/${levelKey}`} tone="done" label={`Открыть уровень «${levelName}»`} />}
      />
    );
  }

  // Идти некуда: у Ракушки тестов нет вовсе, а закрытые уровни откроются только
  // после предыдущего. И там, и там серая неактивная кнопка — ряд остаётся ровным,
  // а обещания пройти тест нет. Отметка при этом честная: у Ракушки галочка.
  const prev = NAMES[ORDER[ORDER.indexOf(levelKey) - 1]];
  if (achieved || locked || !openByProgress(ocean, level)) {
    const why = achieved
      ? `Уровень «${levelName}» выдаётся за вход, тестов на нём нет`
      : prev
      ? `Уровень «${levelName}» откроется после ${prev}`
      : `Уровень «${levelName}» пока закрыт`;
    return <Slots done={achieved} button={<ArrowButton label={why} />} />;
  }

  // Есть что сдавать: синяя кнопка ведёт прямо на первый несданный тест
  const next = testSlugs.find((t) => !passed(t));
  const href = next ? `/tests/${next}/take` : `/levels/${levelKey}`;
  const label = next ? `Пройти тест уровня «${levelName}»` : `Открыть уровень «${levelName}»`;
  return <Slots done={false} button={<ArrowButton href={href} tone="next" label={label} />} />;
}
