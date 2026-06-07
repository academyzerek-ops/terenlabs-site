import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { auth, signIn, providersConfigured } from "@/auth";

export const metadata = { title: "Вход — TerenLabs" };

// Вход ПО ЖЕЛАНИЮ: аноним не теряет ничего. Аккаунт добавляет статистику,
// память прогресса и зачёт в рейтинг «Океана» (этап B — связка с бэкендом).
export default async function Page() {
  const session = await auth();
  if (session) redirect("/dashboard");
  const anyProvider = providersConfigured.google || providersConfigured.apple;

  return (
    <section className="deep grain-fine relative min-h-[70vh]">
      <Container className="relative z-10 flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-white/10 bg-navy-900/70 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur sm:p-10">
          <p className="eyebrow">Вход · по желанию</p>
          <h1 className="mt-3 text-3xl !text-foam">Свой профиль в океане</h1>
          <p className="mt-3 text-sm leading-relaxed text-foam/65">
            Весь TerenLabs открыт и без входа. Аккаунт добавляет: статистику
            твоих попыток, память прогресса между устройствами и место
            в рейтинге «Океана».
          </p>

          <div className="mt-8 space-y-3">
            {providersConfigured.google && (
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/dashboard" });
                }}
              >
                <button className="btn-press flex w-full items-center justify-center gap-3 rounded-[var(--radius-tl)] bg-white px-5 py-3 text-sm font-semibold text-[#1a1a1a] transition-transform hover:-translate-y-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.93-2.92l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24z" />
                    <path fill="#FBBC05" d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l4-3.1z" />
                    <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77z" />
                  </svg>
                  Войти через Google
                </button>
              </form>
            )}
            {providersConfigured.apple && (
              <form
                action={async () => {
                  "use server";
                  await signIn("apple", { redirectTo: "/dashboard" });
                }}
              >
                <button className="btn-press flex w-full items-center justify-center gap-3 rounded-[var(--radius-tl)] bg-black px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/25 transition-transform hover:-translate-y-0.5">
                  <svg width="16" height="19" viewBox="0 0 16 19" fill="currentColor" aria-hidden="true">
                    <path d="M13.3 10.06c0-2.06 1.69-3.05 1.77-3.1-.96-1.41-2.46-1.6-3-1.62-1.27-.13-2.49.75-3.14.75-.65 0-1.65-.73-2.71-.71-1.4.02-2.68.81-3.4 2.06-1.45 2.51-.37 6.24 1.04 8.28.69 1 1.51 2.12 2.59 2.08 1.04-.04 1.43-.67 2.69-.67 1.26 0 1.61.67 2.71.65 1.12-.02 1.83-1.02 2.51-2.02.79-1.16 1.12-2.28 1.14-2.34-.03-.01-2.18-.84-2.2-3.36zM11.24 3.99c.57-.7.96-1.66.85-2.62-.83.03-1.83.55-2.42 1.24-.53.61-1 1.6-.87 2.54.92.07 1.86-.47 2.44-1.16z" />
                  </svg>
                  Войти через Apple
                </button>
              </form>
            )}
            {!anyProvider && (
              <div className="rounded-[var(--radius-tl)] border border-dashed border-white/20 p-5 text-center text-sm text-foam/60">
                Вход через Google и Apple появится здесь со дня на день —
                подключаем ключи.
              </div>
            )}
          </div>

          <p className="mt-8 border-t border-white/10 pt-5 text-center text-sm text-foam/55">
            Или просто{" "}
            <Link href="/catalog" className="font-semibold text-teal hover:text-teal-200">
              продолжить без входа →
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
