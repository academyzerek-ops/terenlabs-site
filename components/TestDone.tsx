"use client";

import { useEffect, useState } from "react";
import { fetchOceanProgress, isTestPassed, type OceanProgress } from "@/lib/ocean";
import { fetchMarks, isTestMarkPassed, type Mark } from "@/lib/state";

// Отметка «сдан» у теста на странице уровня. До этого страница уровня не читала
// прогресс вообще: тесты Краба и Барракуды могли быть сданы в Океане, а строка
// всё равно предлагала «Пройти».
//
// Два источника, потому что тесты разной природы:
//   Ракушка — тесты сайта со своим банком вопросов, в ранг не идут, результат
//   лежит в отметках аккаунта (/me/state), с локальным кешем;
//   Краб и глубже — тесты Океана, результат на сервере под аккаунтом.

const KEY2LEVEL: Record<string, string> = {
  rakushka: "mollusk",
  krab: "crab",
  barrakuda: "barracuda",
  delfin: "dolphin",
  akula: "shark",
  kit: "whale",
};

export function TestDone({ levelKey, slug }: { levelKey: string; slug: string }) {
  const [ocean, setOcean] = useState<OceanProgress | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);

  useEffect(() => {
    fetchMarks().then(setMarks);
    fetchOceanProgress().then(setOcean);
  }, []);

  const level = KEY2LEVEL[levelKey];
  // слаг устроен как «<уровень>-<тест>»: crab-t1, barracuda-fin, shark-SHARK-CASE-01
  const test = level && slug.startsWith(`${level}-`) ? slug.slice(level.length + 1) : "";
  const done = isTestMarkPassed(marks, slug) || (level && test ? isTestPassed(ocean, level, test) : false);

  if (!done) return null;
  return (
    <span className="tag tag-green shrink-0" title="Тест сдан">
      сдан
    </span>
  );
}
