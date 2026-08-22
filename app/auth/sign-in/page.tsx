import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { TelegramLogin } from "@/components/TelegramLogin";
import { TgDeepLinkLogin } from "@/components/TgDeepLinkLogin";
import { auth } from "@/auth";
import { SITE_URL } from "@/lib/site";

export const metadata = { title: "Вход — TerenLabs", robots: { index: false, follow: false } };

// Вход ПО ЖЕЛАНИЮ: аноним не теряет ничего. Аккаунт добавляет статистику,
// память прогресса и зачёт в рейтинг «Океана».
// Пока вход только через Telegram (решение Адиля 15.07): аудитория телеграмная,
// tg_id совпадает с Mini App — прогресс сходится в один аккаунт автоматически.
// Google/Apple-мост (auth.ts, /api/ocean-bridge) сохранён в коде, но с витрины убран.
export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ return?: string }>;
}) {
  const sp = await searchParams;
  // нативное приложение: redirect-флоу виджета → /auth/tg-callback → Mini App
  const forMiniapp = sp?.return === "miniapp";
  const session = await auth();
  if (session && !forMiniapp) redirect("/dashboard");

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

          <div className="mt-8">
            {/* нативное приложение: WKWebView не откроет t.me — там остаётся
                redirect-виджет; браузеру — deep-link без ввода номера */}
            {forMiniapp ? (
              <TelegramLogin authUrl={`${SITE_URL}/auth/tg-callback`} />
            ) : (
              <TgDeepLinkLogin />
            )}
            <p className="mt-2 text-center text-xs text-foam/45">
              тот же аккаунт, что в Mini App — прогресс общий
            </p>
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
