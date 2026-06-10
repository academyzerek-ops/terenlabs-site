"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { KZ_REGIONS } from "@/lib/kz-regions";
import { getOceanToken, oceanFetch, type OceanAuth, setOceanToken } from "@/lib/ocean";

// Онбординг Океана (12_OCEAN.md): страна + язык + область + имя в рейтинге.
// Появляется один раз после первого входа. Область можно пропустить —
// но тогда не будет рейтинга земляков, говорим прямо.
export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!getOceanToken()) router.replace("/auth/sign-in");
  }, [router]);

  const submit = async () => {
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
    <section className="deep grain-fine relative min-h-[70vh]">
      <Container className="relative z-10 flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-white/10 bg-navy-900/70 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur sm:p-10">
          <p className="eyebrow">Океан · полминуты</p>
          <h1 className="mt-3 text-3xl !text-foam">Откуда ныряешь?</h1>

          <div className="mt-7 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-foam/80">Имя в рейтинге</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={64}
                placeholder="Как тебя показывать в таблице"
                className="mt-2 w-full rounded-[var(--radius-tl)] border border-white/15 bg-white/5 px-4 py-3 text-foam outline-none transition-colors placeholder:text-foam/35 focus:border-teal"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-semibold text-foam/80">Страна</span>
                <select
                  disabled
                  className="mt-2 w-full rounded-[var(--radius-tl)] border border-white/15 bg-white/5 px-3 py-3 text-foam"
                >
                  <option>Казахстан</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-foam/80">Язык</span>
                <select
                  disabled
                  className="mt-2 w-full rounded-[var(--radius-tl)] border border-white/15 bg-white/5 px-3 py-3 text-foam"
                >
                  <option>Русский</option>
                </select>
              </label>
            </div>
            <p className="-mt-3 text-xs text-foam/45">Қазақша — скоро. Серьёзно, уже в плане.</p>

            <label className="block">
              <span className="text-sm font-semibold text-foam/80">Область</span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="mt-2 w-full rounded-[var(--radius-tl)] border border-white/15 bg-navy-900 px-3 py-3 text-foam outline-none focus:border-teal"
              >
                <option value="">— укажу позже —</option>
                {KZ_REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
              {!region && (
                <span className="mt-1.5 block text-xs text-foam/45">
                  Без области не будет рейтинга земляков — твоё право.
                </span>
              )}
            </label>
          </div>

          {err && <p className="mt-4 text-sm text-[var(--color-danger)]">{err}</p>}

          <button
            onClick={submit}
            disabled={busy}
            className="btn-press mt-7 w-full rounded-full bg-teal px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-50"
          >
            {busy ? "Сохраняю…" : "В океан →"}
          </button>
        </div>
      </Container>
    </section>
  );
}
