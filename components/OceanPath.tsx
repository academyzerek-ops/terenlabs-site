"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";
import {
  getOceanToken,
  oceanFetch,
  OceanProgress,
  levelDone,
  isTestPassed,
  LEVEL_TESTS,
} from "@/lib/ocean";
import { SHARK_CASES } from "@/lib/ocean-tests";

// Прогресс-осведомлённость страницы /levels (баг Адиля 15.07: юзер —
// Барракуда, а страница статично звала «Пройти тест на Краба»).
// Для вошедшего: чип «✓ пройден» / «ты здесь» на уровнях и СТА
// «Продолжить — <уровень>», как в Mini App. Аноним видит прежнюю статику.

// site key ↔ backend id
const KEY2ID: Record<string, string> = {
  rakushka: "mollusk", krab: "crab", barrakuda: "barracuda",
  delfin: "dolphin", akula: "shark", kit: "whale",
};
const ID2KEY = Object.fromEntries(Object.entries(KEY2ID).map(([k, v]) => [v, k]));
const LEVEL_RU: Record<string, string> = {
  mollusk: "Ракушка", crab: "Краб", barracuda: "Барракуда",
  dolphin: "Дельфин", shark: "Акула", whale: "Кит",
};

// Акула закрывается категорийным правилом (зеркало composite.shark бэка):
// ≥1 сданный кейс в каждой из 4 категорий + ≥6 кейсов всего.
export function sharkDone(p: OceanProgress | null): boolean {
  if (!p) return false;
  const passed = SHARK_CASES.filter((c) => isTestPassed(p, "shark", c.id));
  const cats = new Set(passed.map((c) => c.cat));
  return cats.size >= 4 && passed.length >= 6;
}

/** Текущий уровень по прогрессу — зеркало _determine_level бэка. */
export function currentLevelId(p: OceanProgress | null): string {
  if (!levelDone(p, "crab")) return "crab";
  if (!levelDone(p, "barracuda")) return "barracuda";
  if (!levelDone(p, "dolphin")) return "dolphin";
  if (!sharkDone(p)) return "shark";
  return "whale";
}

// один запрос прогресса на страницу — компонентов много
let progressOnce: Promise<OceanProgress | null> | null = null;
function fetchProgressOnce(): Promise<OceanProgress | null> {
  if (!getOceanToken()) return Promise.resolve(null);
  if (!progressOnce) {
    progressOnce = oceanFetch<OceanProgress>("/me/progress").catch(() => null);
  }
  return progressOnce;
}

function useOceanPath() {
  const [state, setState] = useState<{ ready: boolean; p: OceanProgress | null }>({
    ready: false,
    p: null,
  });
  useEffect(() => {
    let alive = true;
    fetchProgressOnce().then((p) => alive && setState({ ready: true, p }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

/** Чип статуса уровня на карте погружения: ✓ пройден / ты здесь / начни здесь. */
export function LevelStatusChip({ levelKey }: { levelKey: string }) {
  const { ready, p } = useOceanPath();
  const id = KEY2ID[levelKey];

  // аноним (или пока грузится): прежняя статика — «начни здесь» на Крабе
  if (!ready || !p) {
    if (levelKey === "krab") {
      return (
        <span className="rounded-full bg-teal px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-white shadow-[0_0_18px_rgba(0,183,194,0.5)]">
          начни здесь
        </span>
      );
    }
    return null;
  }

  const current = currentLevelId(p);
  const done =
    id === "shark" ? sharkDone(p) : id === "mollusk" ? true : LEVEL_TESTS[id] ? levelDone(p, id) : false;

  if (id === current) {
    return (
      <span className="rounded-full bg-teal px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-white shadow-[0_0_18px_rgba(0,183,194,0.5)]">
        ты здесь
      </span>
    );
  }
  if (done) {
    return (
      <span className="rounded-full border border-teal/60 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-teal">
        ✓ пройден
      </span>
    );
  }
  return null;
}

/** СТА пути: анониму — «Пройти тест на Краба», вошедшему — продолжить свой уровень. */
export function ContinueCta({ size, className = "" }: { size?: "md" | "lg"; className?: string }) {
  const { ready, p } = useOceanPath();
  if (!ready || !p) {
    return (
      <Button href="/levels/krab" size={size} className={className}>
        Пройти тест на Краба
      </Button>
    );
  }
  const current = currentLevelId(p);
  if (current === "whale") {
    return (
      <Button href="/ocean" size={size} className={className}>
        Ты прошёл океан — смотри рейтинг
      </Button>
    );
  }
  return (
    <Button href={`/levels/${ID2KEY[current]}`} size={size} className={className}>
      Продолжить — {LEVEL_RU[current]}
    </Button>
  );
}
