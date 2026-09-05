"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { Arrow } from "@/components/Button";
import { KZ_REGIONS } from "@/lib/kz-regions";
import { getOceanToken, getOceanName, oceanFetch, type OceanAuth, setOceanToken } from "@/lib/ocean";

// Онбординг Океана (12_OCEAN.md): страна + язык + область + имя в рейтинге.
// Появляется один раз после первого входа. Область можно пропустить —
// но тогда не будет рейтинга земляков, говорим прямо.

// Контролы формы: 40px, 16px текст (мобильный Safari не зумит), фокус из globals
const FIELD =
  "mt-2 h-10 w-full rounded-[8px] border border-line-2 bg-page px-3 text-[16px] text-ink placeholder:text-faint disabled:text-text-2 disabled:opacity-70";
const LABEL = "text-[14px] font-medium text-body";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!getOceanToken()) router.replace("/auth/sign-in");
    // Google отдал имя при входе: подставляем как дефолт; телефон имени не знает, поле пустое
    const known = getOceanName();
    if (known) setName(known);
  }, [router]);

  const submit = async () => {
    if (!name.trim()) { setErr("Напиши, как к тебе обращаться."); return; }
    setBusy(true);
    setErr(null);
    try {
      const out = await oceanFetch<OceanAuth>("/auth/onboarding", {
        method: "POST",
        json: {
          display_name: name.trim() || null,
          country: "KZ",
          region_code: region || null,
          lang: "ru",
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
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="panel w-full max-w-sm p-6 sm:p-7">
        <p className="eyebrow">Океан · полминуты</p>
        <h1 className="mt-2 text-[22px] sm:text-[24px]">Как к тебе обращаться?</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-text-2">
          Это имя увидят в рейтинге. Область нужна для рейтинга земляков, её можно указать позже.
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

          <div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={LABEL}>Страна</span>
                <select disabled className={FIELD}>
                  <option>Казахстан</option>
                </select>
              </label>
              <label className="block">
                <span className={LABEL}>Язык</span>
                <select disabled className={FIELD}>
                  <option>Русский</option>
                </select>
              </label>
            </div>
            <p className="mt-2 text-[13px] text-faint">Қазақша — скоро. Серьёзно, уже в плане.</p>
          </div>

          <label className="block">
            <span className={LABEL}>Область</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className={FIELD}>
              <option value="">— укажу позже —</option>
              {KZ_REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
            {!region && (
              <span className="mt-2 block text-[13px] text-faint">
                Без области не будет рейтинга земляков — твоё право.
              </span>
            )}
          </label>
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
