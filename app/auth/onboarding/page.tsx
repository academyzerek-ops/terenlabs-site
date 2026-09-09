"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { Arrow } from "@/components/Button";
import { getOceanToken, getOceanName, oceanFetch, type OceanAuth, setOceanToken } from "@/lib/ocean";

// Анкета Океана (12_OCEAN.md): имя, год рождения, пол, страна.
// Область убрана 09.09.2026 (решение Адиля: «только страну оставим»). Показывается
// один раз после первого входа и повторяется, пока не заполнена целиком — флаг
// needs_onboarding считает бэкенд по всем четырём полям.
// Имя вводится руками, остальное выпадающими списками: так ответы приходят
// в одном виде и их можно считать.

// Контролы формы: 40px, 16px текст (мобильный Safari не зумит), фокус из globals
const FIELD =
  "mt-2 h-10 w-full rounded-[8px] border border-line-2 bg-page px-3 text-[16px] text-ink placeholder:text-faint disabled:text-text-2 disabled:opacity-70";
const LABEL = "text-[14px] font-medium text-body";

// Минимальный возраст: курсы про своё дело, детям тут делать нечего.
const MIN_AGE = 14;
const OLDEST_BIRTH_YEAR = 1930;

// Страны анкеты: весь русскоязычный рынок, Казахстан первым и по умолчанию.
const COUNTRIES = [
  { code: "KZ", name: "Казахстан" },
  { code: "RU", name: "Россия" },
  { code: "KG", name: "Кыргызстан" },
  { code: "UZ", name: "Узбекистан" },
  { code: "BY", name: "Беларусь" },
];

const GENDERS = [
  { code: "m", name: "Мужской" },
  { code: "f", name: "Женский" },
  { code: "na", name: "Не указываю" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("KZ");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Считаем от текущего года, чтобы список не протух через год
  const years = useMemo(() => {
    const newest = new Date().getFullYear() - MIN_AGE;
    return Array.from({ length: newest - OLDEST_BIRTH_YEAR + 1 }, (_, i) => newest - i);
  }, []);

  useEffect(() => {
    if (!getOceanToken()) router.replace("/auth/sign-in");
    // Google отдал имя при входе: подставляем как дефолт; почта имени не знает
    const known = getOceanName();
    if (known) setName(known);
  }, [router]);

  const submit = async () => {
    if (!name.trim()) { setErr("Напиши, как к тебе обращаться."); return; }
    if (!birthYear) { setErr("Выбери год рождения."); return; }
    if (!gender) { setErr("Выбери пол или «Не указываю»."); return; }
    if (!country) { setErr("Выбери страну."); return; }
    setBusy(true);
    setErr(null);
    try {
      const out = await oceanFetch<OceanAuth>("/auth/onboarding", {
        method: "POST",
        json: {
          display_name: name.trim(),
          country,
          lang: "ru",
          birth_year: Number(birthYear),
          gender,
        },
      });
      setOceanToken(out.token);
      router.push("/dashboard");
    } catch {
      setErr("Не сохранилось — попробуй ещё раз.");
      setBusy(false);
    }
  };

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-9 sm:py-16">
      <div className="panel w-full max-w-sm p-6 sm:p-7">
        <p className="eyebrow">Океан · полминуты</p>
        <h1 className="mt-2 text-[22px] sm:text-[24px]">Коротко о тебе</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-text-2">
          Имя увидят в рейтинге, страна нужна для рейтинга среди своих. Год рождения и пол
          в рейтинге не показываются: по ним видно, кто учится.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className={LABEL}>Имя</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={64}
              placeholder="Имя или ник для рейтинга"
              autoFocus
              className={FIELD}
            />
          </label>

          {/* На узких экранах два поля в ряд режут подпись в списке:
              до 380px ставим их друг под друга. */}
          <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 min-[380px]:gap-3">
            <label className="block">
              <span className={LABEL}>Год рождения</span>
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className={FIELD}
              >
                <option value="">— выбери —</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={LABEL}>Пол</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={FIELD}
              >
                <option value="">— выбери —</option>
                {GENDERS.map((g) => (
                  <option key={g.code} value={g.code}>{g.name}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className={LABEL}>Страна</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={FIELD}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <p className="text-[13px] text-faint">
            Язык — русский. Другие языки — в плане.
          </p>
        </div>

        {err && <p role="alert" className="mt-4 text-[14px] text-danger">{err}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="btn-press mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-accent-600 px-5 text-[15px] font-medium text-[#fff] transition-colors duration-150 hover:bg-[#1b6fc2] disabled:opacity-50"
        >
          {busy ? "Сохраняю…" : "В океан"}
          {!busy && <Arrow />}
        </button>
      </div>
    </Container>
  );
}
